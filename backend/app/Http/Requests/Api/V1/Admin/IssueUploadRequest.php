<?php

namespace App\Http\Requests\Api\V1\Admin;

use App\Application\Services\MediaService;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class IssueUploadRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('upload-media');
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $mimes = array_merge(
            array_keys(MediaService::IMAGE_MIMES),
            array_keys(MediaService::DOCUMENT_MIMES),
        );

        return [
            'filename' => ['required', 'string', 'max:255'],
            'mimeType' => ['required', 'string', Rule::in($mimes)],
            'size' => ['required', 'integer', 'min:1', 'max:104857600'],
            'usage' => ['required', 'string', Rule::in(MediaService::USAGES)],
            'visibility' => ['required', 'string', Rule::in(['public', 'private'])],
            'alt' => ['nullable', 'string', 'max:500'],
            'checksum' => ['nullable', 'string', 'max:128'],
        ];
    }
}
