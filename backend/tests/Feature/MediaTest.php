<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

/**
 * P6 acceptance (spec 13.2): presigned direct upload against the local
 * S3-compatible service, validation gates, reference-guarded delete.
 *
 * Requires MongoDB + S3 mock: run inside Docker, not on bare host.
 */
class MediaTest extends TestCase
{
    private const BUCKET = 'cms-test-media';

    protected function setUp(): void
    {
        parent::setUp();

        config(['filesystems.disks.s3.bucket' => self::BUCKET]);

        try {
            Storage::disk('s3')->getClient()->createBucket(['Bucket' => self::BUCKET]);
        } catch (\Throwable) {
            // Bucket already exists.
        }
    }

    protected function tearDown(): void
    {
        foreach (['cms_entries', 'cms_publications', 'cms_media', 'cms_audit_logs'] as $collection) {
            DB::connection('mongodb')->table($collection)->delete();
        }

        User::query()->where('email', 'like', '%@cms-test.local')->delete();

        parent::tearDown();
    }

    private function owner()
    {
        static $n = 0;
        $n++;

        return User::query()->create([
            'name' => "Media Owner {$n}",
            'email' => "media{$n}@cms-test.local",
            'password' => 'password123',
            'role' => User::ROLE_OWNER,
            'can_publish' => true,
            'can_preview' => true,
        ]);
    }

    private function png(int $size): string
    {
        $header = base64_decode(
            'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='
        );

        return str_pad($header, $size, "\0");
    }

    /**
     * @return array{uploadId: string, uploadUrl: string}
     */
    private function issuePng(string $visibility = 'public', int $size = 4096): array
    {
        $data = $this->actingAs($this->owner())->postJson('/api/v1/admin/media/uploads', [
            'filename' => 'cover.png',
            'mimeType' => 'image/png',
            'size' => $size,
            'usage' => 'projects',
            'visibility' => $visibility,
        ])->assertCreated()->json('data');

        $this->assertNotEmpty($data['uploadUrl']);

        return ['uploadId' => $data['uploadId'], 'uploadUrl' => $data['uploadUrl']];
    }

    private function putBytes(string $url, string $bytes): void
    {
        $response = Http::withHeaders(['Content-Type' => 'image/png'])
            ->withBody($bytes, 'image/png')
            ->put($url);

        $this->assertTrue(
            $response->successful(),
            'Presigned PUT failed: '.$response->status().' '.$response->body()
        );
    }

    public function test_presigned_upload_flow(): void
    {
        $api = $this->actingAs($this->owner());
        ['uploadId' => $uploadId, 'uploadUrl' => $uploadUrl] = $this->issuePng();

        $this->putBytes($uploadUrl, $this->png(4096));

        $completed = $api->postJson("/api/v1/admin/media/uploads/{$uploadId}/complete")
            ->assertOk()->json('data');

        $this->assertSame('ready', $completed['asset']['status']);
        $this->assertNotEmpty($completed['url']);
        $this->assertStringStartsWith('published/projects/', $this->storageKeyOf($uploadId));

        $api->getJson("/api/v1/admin/media/{$uploadId}")->assertOk();
    }

    public function test_complete_without_bytes_fails(): void
    {
        $api = $this->actingAs($this->owner());
        ['uploadId' => $uploadId] = $this->issuePng();

        $api->postJson("/api/v1/admin/media/uploads/{$uploadId}/complete")->assertUnprocessable();
    }

    public function test_invalid_mime_or_size_rejected(): void
    {
        $api = $this->actingAs($this->owner());

        $api->postJson('/api/v1/admin/media/uploads', [
            'filename' => 'evil.html',
            'mimeType' => 'text/html',
            'size' => 100,
            'usage' => 'projects',
            'visibility' => 'public',
        ])->assertUnprocessable();

        $api->postJson('/api/v1/admin/media/uploads', [
            'filename' => 'huge.png',
            'mimeType' => 'image/png',
            'size' => 16 * 1024 * 1024,
            'usage' => 'projects',
            'visibility' => 'public',
        ])->assertUnprocessable();
    }

    public function test_referenced_asset_cannot_be_deleted(): void
    {
        $api = $this->actingAs($this->owner());
        ['uploadId' => $uploadId, 'uploadUrl' => $uploadUrl] = $this->issuePng();
        $this->putBytes($uploadUrl, $this->png(2048));
        $api->postJson("/api/v1/admin/media/uploads/{$uploadId}/complete")->assertOk();

        $api->postJson('/api/v1/admin/entries', [
            'type' => 'project',
            'slug' => 'uses-media',
            'title' => 'Uses media',
            'references' => [$uploadId],
        ])->assertCreated();

        $api->deleteJson("/api/v1/admin/media/{$uploadId}")->assertConflict();
    }

    public function test_delete_and_restore_unreferenced_asset(): void
    {
        $api = $this->actingAs($this->owner());
        ['uploadId' => $uploadId, 'uploadUrl' => $uploadUrl] = $this->issuePng();
        $this->putBytes($uploadUrl, $this->png(2048));
        $api->postJson("/api/v1/admin/media/uploads/{$uploadId}/complete")->assertOk();

        $api->patchJson("/api/v1/admin/media/{$uploadId}", ['alt' => 'Cover image'])
            ->assertOk()->assertJsonPath('data.alt', 'Cover image');

        $api->deleteJson("/api/v1/admin/media/{$uploadId}")->assertNoContent();

        $api->postJson("/api/v1/admin/media/{$uploadId}/restore")
            ->assertOk()->assertJsonPath('data.status', 'ready');
    }

    private function storageKeyOf(string $id): string
    {
        return (string) \App\Models\Cms\CmsMedia::query()->findOrFail($id)->storageKey;
    }
}
