<?php

namespace App\Http\Requests\Api\V1\Admin;

use App\Domain\Content\SchemaRegistry;
use Illuminate\Foundation\Http\FormRequest;

class UpdateEntryRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Model-level check happens in the controller (route holds a raw id).
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $type = (string) ($this->input('type') ?? $this->entryType() ?? '');

        return array_merge([
            'expectedRevision' => ['required', 'integer', 'min:1'],
            'title' => ['sometimes', 'string', 'max:255'],
            'slug' => ['sometimes', 'nullable', 'string', 'max:180', 'regex:/^[a-z0-9\-\/]+$/'],
            'key' => ['sometimes', 'nullable', 'string', 'max:120', 'regex:/^[a-z0-9_\-]+$/'],
            'seo' => ['sometimes', 'nullable', 'array'],
            'references' => ['sometimes', 'nullable', 'array', 'max:100'],
            'references.*' => ['string', 'max:64'],
            'featured' => ['sometimes', 'boolean'],
            'sortOrder' => ['sometimes', 'integer', 'min:0', 'max:1000000'],
            'changeSummary' => ['nullable', 'string', 'max:500'],
        ], $this->prefixedDataRules($type));
    }

    /**
     * Entry type for per-type data rules. The route holds a raw id, so the
     * model is resolved here; unknown ids fall back to generic rules and the
     * controller then returns 404.
     */
    private function entryType(): ?string
    {
        $id = (string) $this->route('entry');

        $key = preg_match('/^[0-9a-f]{24}$/i', $id) ? new \MongoDB\BSON\ObjectId($id) : $id;

        return \App\Models\Cms\CmsEntry::query()->where('_id', $key)->first()?->type;
    }

    /**
     * @return array<string, mixed>
     */
    private function prefixedDataRules(string $type): array
    {
        $rules = [];

        foreach (SchemaRegistry::dataRules($type) as $field => $rule) {
            if ($field === 'data') {
                $rules['data'] = ['sometimes', 'nullable', 'array'];
                continue;
            }

            if (is_array($rule)) {
                $rules[$field] = array_merge(['sometimes'], $rule);
            } else {
                $rules[$field] = $rule;
            }
        }

        return $rules;
    }
}
