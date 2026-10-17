<?php

namespace App\Jobs;

use App\Models\Cms\CmsEntry;
use App\Models\Cms\CmsMedia;
use App\Models\Cms\CmsPublication;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Storage;

/**
 * Temp/orphan sweep (spec 10.2): expired pending uploads and their bytes,
 * plus soft-deleted assets past retention that nothing references.
 * Never touches bytes referenced by publications, revisions, or live drafts.
 */
class CleanupOrphanUploads implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function handle(): void
    {
        $disk = Storage::disk('s3');
        $tmpPrefix = (string) config('cms.media.temp_prefix', 'tmp');

        $expired = CmsMedia::query()
            ->where('status', CmsMedia::STATUS_PENDING)
            ->where('created_at', '<', now()->subDay())
            ->get();

        foreach ($expired as $media) {
            if (str_starts_with((string) $media->storageKey, $tmpPrefix.'/')) {
                try {
                    $disk->delete($media->storageKey);
                } catch (\Throwable) {
                    continue;
                }
            }

            $media->delete();
        }

        $purgable = CmsMedia::query()
            ->where('status', CmsMedia::STATUS_DELETED)
            ->where('deletedAt', '<', now()->subDays(30))
            ->get();

        foreach ($purgable as $media) {
            $id = (string) $media->getKey();

            $referenced = CmsPublication::query()->where('referencedIds', $id)->exists()
                || CmsEntry::query()
                    ->where('status', '!=', CmsEntry::STATUS_ARCHIVED)
                    ->where(function ($query) use ($id) {
                        $query->where('references', $id)
                            ->orWhere('data.blocks.references', $id);
                    })
                    ->exists();

            if ($referenced) {
                continue;
            }

            try {
                $disk->delete($media->storageKey);
            } catch (\Throwable) {
                continue;
            }

            $media->delete();
        }
    }
}
