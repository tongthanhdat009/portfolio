<?php

namespace App\Application\Services;

use App\Domain\Content\SchemaRegistry;
use App\Models\Cms\CmsEntry;
use App\Models\Cms\CmsRedirect;
use App\Models\Cms\CmsRevision;
use Illuminate\Http\Request;use Symfony\Component\HttpKernel\Exception\ConflictHttpException;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;

/**
 * Draft lifecycle: create, compare-and-set save, archive/restore,
 * revision history, restore-as-new-draft (spec 8.1, 8.4).
 */
class ContentService
{
    public function __construct(private readonly AuditService $audit) {}

    public function create(array $validated, string $actorId): CmsEntry
    {
        $this->assertSlugAvailable(
            $validated['type'], $validated['locale'] ?? config('cms.default_locale'),
            $validated['slug'] ?? null, $validated['key'] ?? null,
        );

        $entry = CmsEntry::query()->create([
            ...$validated,
            'locale' => $validated['locale'] ?? config('cms.default_locale'),
            'status' => CmsEntry::STATUS_DRAFT,
            'revision' => 1,
            'schemaVersion' => $validated['schemaVersion'] ?? 1,
            'createdBy' => $actorId,
            'updatedBy' => $actorId,
        ]);

        $this->snapshot($entry, $actorId, 'created');

        return $entry->fresh();
    }

    /**
     * Optimistic-concurrency save: 409 when expectedRevision is stale.
     */
    public function saveDraft(CmsEntry $entry, array $validated, int $expectedRevision, string $actorId, ?Request $request = null): CmsEntry
    {
        $entry->refresh();

        if ($entry->revision !== $expectedRevision) {
            throw new ConflictHttpException('Stale revision. Reload and retry.');
        }

        if (array_key_exists('slug', $validated) || array_key_exists('key', $validated)) {
            $this->assertSlugAvailable(
                $validated['type'] ?? $entry->type,
                $validated['locale'] ?? $entry->locale,
                $validated['slug'] ?? $entry->slug,
                $validated['key'] ?? $entry->key,
                (string) $entry->getKey(),
            );
        }

        $oldPath = $entry->routePath();

        $entry->fill($validated);
        $entry->revision = $entry->revision + 1;
        $entry->updatedBy = $actorId;
        $entry->save();

        $this->maybeRecordRedirect($entry, $oldPath);
        $this->snapshot($entry->fresh(), $actorId, $request?->input('changeSummary'));

        $this->audit->record('entry.saved_draft', 'entry', (string) $entry->getKey(), [
            'revision' => $entry->revision,
        ], $request);

        return $entry->fresh();
    }

    public function archive(CmsEntry $entry, string $actorId, ?Request $request = null): CmsEntry
    {
        $entry->status = CmsEntry::STATUS_ARCHIVED;
        $entry->archivedAt = now();
        $entry->updatedBy = $actorId;
        $entry->save();

        $this->audit->record('entry.archived', 'entry', (string) $entry->getKey(), [], $request);

        return $entry->fresh();
    }

    public function restore(CmsEntry $entry, string $actorId, ?Request $request = null): CmsEntry
    {
        $entry->status = CmsEntry::STATUS_DRAFT;
        $entry->archivedAt = null;
        $entry->updatedBy = $actorId;
        $entry->save();

        $this->audit->record('entry.restored', 'entry', (string) $entry->getKey(), [], $request);

        return $entry->fresh();
    }

    /**
     * Restore an old revision as a NEW draft (history is never rewritten).
     */
    public function restoreRevision(CmsEntry $entry, int $revision, string $actorId, ?Request $request = null): CmsEntry
    {
        $snapshot = CmsRevision::query()
            ->where('entryId', (string) $entry->getKey())
            ->where('revision', $revision)
            ->firstOrFail();

        $data = $snapshot->snapshot ?? [];

        $entry->fill([
            'title' => $data['title'] ?? $entry->title,
            'data' => $data['data'] ?? $entry->data,
            'seo' => $data['seo'] ?? $entry->seo,
        ]);
        $entry->revision = $entry->revision + 1;
        $entry->updatedBy = $actorId;
        $entry->save();

        $this->snapshot($entry->fresh(), $actorId, "restored from revision {$revision}");

        $this->audit->record('entry.restored_revision', 'entry', (string) $entry->getKey(), [
            'fromRevision' => $revision,
            'toRevision' => $entry->revision,
        ], $request);

        return $entry->fresh();
    }

    private function snapshot(CmsEntry $entry, string $actorId, ?string $changeSummary): void
    {
        CmsRevision::query()->create([
            'entryId' => (string) $entry->getKey(),
            'revision' => $entry->revision,
            'snapshot' => [
                'title' => $entry->title,
                'data' => $entry->data,
                'seo' => $entry->seo,
                'slug' => $entry->slug,
            ],
            'actorId' => $actorId,
            'changeSummary' => $changeSummary,
            'createdAt' => now(),
        ]);
    }

    private function maybeRecordRedirect(CmsEntry $entry, ?string $oldPath): void
    {
        $newPath = $entry->routePath();

        if ($oldPath === null || $newPath === null || $oldPath === $newPath) {
            return;
        }

        if ($entry->lastPublishedRevision === null) {
            return;
        }

        $exists = CmsRedirect::query()
            ->where('locale', $entry->locale)
            ->where('fromPath', $oldPath)
            ->exists();

        if ($exists) {
            return;
        }

        $loop = CmsRedirect::query()
            ->where('locale', $entry->locale)
            ->where('fromPath', $newPath)
            ->where('toPath', $oldPath)
            ->exists();

        if ($loop) {
            return;
        }

        CmsRedirect::query()->create([
            'locale' => $entry->locale,
            'fromPath' => $oldPath,
            'toPath' => $newPath,
            'entryId' => (string) $entry->getKey(),
            'createdAt' => now(),
        ]);
    }

    private function assertSlugAvailable(string $type, string $locale, ?string $slug, ?string $key, ?string $ignoreId = null): void
    {
        foreach (['slug' => $slug, 'key' => $key] as $field => $value) {
            if ($value === null || $value === '') {
                continue;
            }

            $query = CmsEntry::query()
                ->where('type', $type)
                ->where('locale', $locale)
                ->where($field, $value);

            if ($ignoreId !== null) {
                $query->where('_id', '!=', $ignoreId);
            }

            if ($query->exists()) {
                throw new UnprocessableEntityHttpException(
                    "Duplicate {$field} '{$value}' for type '{$type}' ({$locale})."
                );
            }
        }

        if (SchemaRegistry::requiresSlug($type) && ($slug === null || $slug === '')) {
            throw new UnprocessableEntityHttpException("Field 'slug' is required for type '{$type}'.");
        }

        if (SchemaRegistry::requiresKey($type) && ($key === null || $key === '')) {
            throw new UnprocessableEntityHttpException("Field 'key' is required for type '{$type}'.");
        }

        if ($slug !== null && $slug !== '' && preg_match('#[^a-z0-9\-/]#', $slug)) {
            throw new UnprocessableEntityHttpException("Field 'slug' must be lowercase URL-safe (a-z, 0-9, -, /).");
        }
    }
}
