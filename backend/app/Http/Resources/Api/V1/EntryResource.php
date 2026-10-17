<?php

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin \App\Models\Cms\CmsEntry
 */
class EntryResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => (string) $this->getKey(),
            'type' => $this->type,
            'key' => $this->key,
            'locale' => $this->locale,
            'slug' => $this->slug,
            'title' => $this->title,
            'status' => $this->status,
            'data' => $this->data ?? [],
            'seo' => $this->seo ?? [],
            'references' => $this->references ?? [],
            'featured' => (bool) $this->featured,
            'sortOrder' => $this->sortOrder ?? 0,
            'schemaVersion' => $this->schemaVersion ?? 1,
            'revision' => $this->revision,
            'hasUnpublishedChanges' => $this->hasUnpublishedChanges(),
            'lastPublishedRevision' => $this->lastPublishedRevision,
            'publishedAt' => $this->publishedAt?->toISOString(),
            'createdAt' => $this->created_at?->toISOString(),
            'updatedAt' => $this->updated_at?->toISOString(),
        ];
    }
}
