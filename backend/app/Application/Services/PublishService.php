<?php

namespace App\Application\Services;

use App\Models\Cms\CmsEntry;
use App\Models\Cms\CmsOutbox;
use App\Models\Cms\CmsPublication;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Symfony\Component\HttpKernel\Exception\ConflictHttpException;

/**
 * Idempotent publish pipeline (spec 8.2): validate → snapshot revision →
 * upsert publication → outbox revalidate event → entry bookkeeping → audit.
 *
 * Standalone MongoDB has no multi-document transactions, so each step is
 * keyed idempotently and safe to retry — never claim joint atomicity.
 */
class PublishService
{
    public function __construct(private readonly AuditService $audit) {}

    /**
     * @return array{operationId: string, publishedRevision: int, status: string}
     */
    public function publish(CmsEntry $entry, int $expectedRevision, string $actorId, ?string $idempotencyKey = null, ?Request $request = null): array
    {
        $entry->refresh();

        if ($entry->revision !== $expectedRevision) {
            throw new ConflictHttpException('Stale revision. Reload and retry.');
        }

        if ($entry->status === CmsEntry::STATUS_ARCHIVED) {
            throw new ConflictHttpException('Archived entries cannot be published. Restore first.');
        }

        $operationId = $idempotencyKey ?: 'op_'.Str::uuid()->toString();

        $existing = CmsOutbox::query()->where('idempotencyKey', $operationId)->first();

        if ($existing) {
            return [
                'operationId' => $operationId,
                'publishedRevision' => $entry->lastPublishedRevision ?? $entry->revision,
                'status' => $existing->status,
            ];
        }

        $publication = $this->upsertPublication($entry);

        CmsOutbox::query()->create([
            'kind' => 'next.revalidate',
            'payload' => [
                'operationId' => $operationId,
                'entryId' => (string) $entry->getKey(),
                'type' => $entry->type,
                'locale' => $entry->locale,
                'slug' => $entry->slug,
                'key' => $entry->key,
                'revision' => $entry->revision,
                'event' => 'published',
            ],
            'status' => CmsOutbox::STATUS_PENDING,
            'attempts' => 0,
            'nextAttemptAt' => now(),
            'lastErrorCode' => null,
            'idempotencyKey' => $operationId,
            'createdAt' => now(),
        ]);

        $entry->status = CmsEntry::STATUS_PUBLISHED;
        $entry->publishedAt = now();
        $entry->lastPublishedRevision = $entry->revision;
        $entry->updatedBy = $actorId;
        $entry->save();

        $this->audit->record('entry.published', 'entry', (string) $entry->getKey(), [
            'revision' => $entry->revision,
            'operationId' => $operationId,
        ], $request);

        return [
            'operationId' => $operationId,
            'publishedRevision' => $publication->sourceRevision,
            'status' => CmsOutbox::STATUS_PENDING,
        ];
    }

    public function unpublish(CmsEntry $entry, string $actorId, ?string $idempotencyKey = null, ?Request $request = null): array
    {
        $operationId = $idempotencyKey ?: 'op_'.Str::uuid()->toString();

        $existing = CmsOutbox::query()->where('idempotencyKey', $operationId)->first();

        if (! $existing) {
            CmsPublication::query()
                ->where('entryId', (string) $entry->getKey())
                ->delete();

            CmsOutbox::query()->create([
                'kind' => 'next.revalidate',
                'payload' => [
                    'operationId' => $operationId,
                    'entryId' => (string) $entry->getKey(),
                    'type' => $entry->type,
                    'locale' => $entry->locale,
                    'slug' => $entry->slug,
                    'key' => $entry->key,
                    'revision' => $entry->revision,
                    'event' => 'unpublished',
                ],
                'status' => CmsOutbox::STATUS_PENDING,
                'attempts' => 0,
                'nextAttemptAt' => now(),
                'lastErrorCode' => null,
                'idempotencyKey' => $operationId,
                'createdAt' => now(),
            ]);
        }

        $entry->status = CmsEntry::STATUS_DRAFT;
        $entry->updatedBy = $actorId;
        $entry->save();

        $this->audit->record('entry.unpublished', 'entry', (string) $entry->getKey(), [
            'operationId' => $operationId,
        ], $request);

        return ['operationId' => $operationId, 'status' => CmsOutbox::STATUS_PENDING];
    }

    private function upsertPublication(CmsEntry $entry): CmsPublication
    {
        // One current document per public route identity; per-revision history
        // lives in `cms_revisions`, so re-publishing replaces in place.
        $attributes = $entry->slug !== null
            ? ['type' => $entry->type, 'locale' => $entry->locale, 'slug' => $entry->slug]
            : ['type' => $entry->type, 'locale' => $entry->locale, 'key' => $entry->key];

        $values = [
            'entryId' => (string) $entry->getKey(),
            'type' => $entry->type,
            'key' => $entry->key,
            'slug' => $entry->slug,
            'locale' => $entry->locale,
            'publicData' => array_merge($entry->data ?? [], ['title' => $entry->title]),
            'publicSeo' => $entry->seo ?? [],
            'sourceRevision' => $entry->revision,
            'schemaVersion' => $entry->schemaVersion ?? 1,
            'publishedAt' => now(),
            'referencedIds' => array_values($entry->references ?? []),
            'active' => true,
        ];

        return CmsPublication::query()->updateOrCreate($attributes, $values);
    }
}
