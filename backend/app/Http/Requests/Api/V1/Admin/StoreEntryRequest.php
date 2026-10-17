<?php

namespace App\Http\Requests\Api\V1\Admin;

use App\Domain\Content\SchemaRegistry;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreEntryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('create', \App\Models\Cms\CmsEntry::class);
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return array_merge([
            'type' => ['required', 'string', Rule::in(SchemaRegistry::ENTRY_TYPES)],
            'key' => ['nullable', 'string', 'max:120', 'regex:/^[a-z0-9_\-]+$/'],
            'locale' => ['nullable', 'string', 'max:12'],
            'slug' => ['nullable', 'string', 'max:180', 'regex:/^[a-z0-9\-\/]+$/'],
            'title' => ['required', 'string', 'max:255'],
            'seo' => ['nullable', 'array'],
            'seo.title' => ['nullable', 'string', 'max:255'],
            'seo.description' => ['nullable', 'string', 'max:500'],
            'seo.ogMediaId' => ['nullable', 'string', 'max:64'],
            'references' => ['nullable', 'array', 'max:100'],
            'references.*' => ['string', 'max:64'],
            'featured' => ['nullable', 'boolean'],
            'sortOrder' => ['nullable', 'integer', 'min:0', 'max:1000000'],
            'schemaVersion' => ['nullable', 'integer', 'min:1'],
        ], SchemaRegistry::dataRules((string) $this->input('type', '')));
    }
}
