<?php

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin \App\Models\Cms\CmsPublication
 */
class PublicationResource extends JsonResource
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
            'slug' => $this->slug,
            'locale' => $this->locale,
            'data' => $this->publicData ?? [],
            'seo' => $this->publicSeo ?? [],
            'schemaVersion' => $this->schemaVersion ?? 1,
            'sourceRevision' => $this->sourceRevision,
            'publishedAt' => $this->publishedAt?->toISOString(),
        ];
    }
}
