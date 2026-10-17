<?php

namespace App\Application\Services;

use App\Models\Cms\CmsEntry;
use App\Models\Cms\CmsMedia;
use App\Models\Cms\CmsPublication;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Symfony\Component\HttpKernel\Exception\ConflictHttpException;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;

/**
 * Controlled direct-upload lifecycle (spec 6.2): issue short-lived presigned
 * PUT → browser uploads bytes → complete validates the object → metadata in
 * `cms_media`. Backend never proxies bytes in this flow.
 */
class MediaService
{
    public const IMAGE_MIMES = [
        'image/jpeg' => 'jpg',
        'image/png' => 'png',
        'image/webp' => 'webp',
        'image/avif' => 'avif',
    ];

    public const DOCUMENT_MIMES = [
        'application/pdf' => 'pdf',
    ];

    public const USAGES = ['avatars', 'resumes', 'projects', 'site'];

    public function __construct(private readonly AuditService $audit) {}

    /**
     * @return array{media: CmsMedia, uploadUrl: string, uploadHeaders: array<string,string>, expiresAt: string}
     */
    public function issueUpload(array $validated, string $actorId): array
    {
        $mime = $validated['mimeType'];
        $ext = self::IMAGE_MIMES[$mime] ?? self::DOCUMENT_MIMES[$mime] ?? null;

        if ($ext === null) {
            throw new UnprocessableEntityHttpException("MIME type '{$mime}' is not allowed.");
        }

        $maxBytes = $this->maxBytes($mime);
        $size = (int) $validated['size'];

        if ($size <= 0 || $size > $maxBytes) {
            throw new UnprocessableEntityHttpException(
                "File size must be between 1 byte and {$maxBytes} bytes for {$mime}."
            );
        }

        $uploadId = (string) Str::uuid();
        $tmpPrefix = (string) config('cms.media.temp_prefix', 'tmp');
        $usage = $validated['usage'];
        $tmpKey = "{$tmpPrefix}/uploads/{$usage}/{$uploadId}/".Str::uuid()->toString().".{$ext}";

        $media = CmsMedia::query()->create([
            'filename' => $validated['filename'],
            'storageKey' => $tmpKey,
            'disk' => 's3',
            'bucket' => (string) config('filesystems.disks.s3.bucket'),
            'mimeType' => $mime,
            'size' => $size,
            'width' => null,
            'height' => null,
            'alt' => $validated['alt'] ?? null,
            'caption' => null,
            'tags' => [],
            'visibility' => $validated['visibility'],
            'status' => CmsMedia::STATUS_PENDING,
            'checksum' => $validated['checksum'] ?? null,
            'uploadedBy' => $actorId,
            'usedByCount' => 0,
        ]);

        $expiresAt = now()->addMinutes(5);

        $uploadUrl = Storage::disk('s3')->temporaryUploadUrl($tmpKey, $expiresAt, [
            'ContentType' => $mime,
            'ContentLength' => $size,
        ]);

        if (is_array($uploadUrl)) {
            $url = (string) ($uploadUrl['url'] ?? '');
            $headers = $uploadUrl['headers'] ?? [];
        } else {
            $url = (string) $uploadUrl;
            $headers = ['Content-Type' => $mime];
        }

        return [
            'media' => $media->fresh(),
            'uploadUrl' => $url,
            'uploadHeaders' => is_array($headers) ? $headers : [],
            'expiresAt' => $expiresAt->toISOString(),
        ];
    }

    public function completeUpload(CmsMedia $media, string $actorId, ?Request $request = null): CmsMedia
    {
        if ($media->status === CmsMedia::STATUS_READY) {
            return $media;
        }

        $disk = Storage::disk('s3');

        if (! $disk->exists($media->storageKey)) {
            throw new UnprocessableEntityHttpException('Uploaded object not found. Re-upload.');
        }

        $actualSize = (int) $disk->size($media->storageKey);

        if ($actualSize <= 0 || $actualSize > $this->maxBytes($media->mimeType)) {
            $disk->delete($media->storageKey);
            throw new UnprocessableEntityHttpException('Uploaded object failed size validation.');
        }

        $actualMime = (string) $disk->mimeType($media->storageKey);

        if ($actualMime !== $media->mimeType) {
            $disk->delete($media->storageKey);
            throw new UnprocessableEntityHttpException(
                "MIME mismatch: declared {$media->mimeType}, actual {$actualMime}."
            );
        }

        $finalKey = $this->finalKey($media);
        $disk->copy($media->storageKey, $finalKey);
        $disk->delete($media->storageKey);

        $media->storageKey = $finalKey;
        $media->size = $actualSize;
        $media->status = CmsMedia::STATUS_READY;
        $media->save();

        $this->audit->record('media.upload_completed', 'media', (string) $media->getKey(), [
            'storageKey' => $finalKey,
            'size' => $actualSize,
        ], $request);

        return $media->fresh();
    }

    public function softDelete(CmsMedia $media, string $actorId, ?Request $request = null): void
    {
        $id = (string) $media->getKey();

        if ($this->isReferenced($id)) {
            throw new ConflictHttpException('Asset is still referenced by content and cannot be deleted.');
        }

        $media->status = CmsMedia::STATUS_DELETED;
        $media->deletedAt = now();
        $media->save();

        $this->audit->record('media.deleted', 'media', $id, [], $request);
    }

    public function restore(CmsMedia $media): CmsMedia
    {
        if (! Storage::disk('s3')->exists($media->storageKey)) {
            throw new UnprocessableEntityHttpException('Object bytes are gone; cannot restore.');
        }

        $media->status = CmsMedia::STATUS_READY;
        $media->deletedAt = null;
        $media->save();

        return $media->fresh();
    }

    public function publicUrl(CmsMedia $media): string
    {
        if ($media->visibility === 'public') {
            return Storage::disk('s3')->url($media->storageKey);
        }

        return Storage::disk('s3')->temporaryUrl($media->storageKey, now()->addMinutes(15));
    }

    private function maxBytes(string $mime): int
    {
        if (isset(self::DOCUMENT_MIMES[$mime])) {
            return (int) config('cms.max_pdf_upload_mb', 20) * 1024 * 1024;
        }

        return (int) config('cms.max_upload_mb', 15) * 1024 * 1024;
    }

    private function finalKey(CmsMedia $media): string
    {
        $prefix = $media->visibility === 'public'
            ? (string) config('cms.media.public_prefix', 'published')
            : (string) config('cms.media.private_prefix', 'private');

        $usage = $this->usageFromTmpKey($media->storageKey);
        $ext = pathinfo($media->storageKey, PATHINFO_EXTENSION);

        return "{$prefix}/{$usage}/".Str::uuid()->toString().".{$ext}";
    }

    private function usageFromTmpKey(string $tmpKey): string
    {
        $segments = explode('/', $tmpKey);

        foreach ($segments as $segment) {
            if (in_array($segment, self::USAGES, true)) {
                return $segment;
            }
        }

        return 'site';
    }

    private function isReferenced(string $mediaId): bool
    {
        $inPublications = CmsPublication::query()
            ->where('referencedIds', $mediaId)
            ->exists();

        if ($inPublications) {
            return true;
        }

        return CmsEntry::query()
            ->where('status', '!=', CmsEntry::STATUS_ARCHIVED)
            ->where(function ($query) use ($mediaId) {
                $query->where('references', $mediaId)
                    ->orWhere('data.blocks.references', $mediaId);
            })
            ->exists();
    }
}
