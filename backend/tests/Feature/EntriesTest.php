<?php

namespace Tests\Feature;

use App\Models\Cms\CmsOutbox;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

/**
 * P2–P4 acceptance (spec 13.1): draft CRUD with optimistic revisions,
 * publish pipeline, public delivery isolation, redirects, idempotency.
 *
 * Requires MongoDB: run inside Docker
 * (`docker compose exec backend php artisan test`), not on bare host.
 */
class EntriesTest extends TestCase
{
    protected function tearDown(): void
    {
        foreach (['cms_entries', 'cms_publications', 'cms_revisions', 'cms_globals', 'cms_media', 'cms_audit_logs', 'cms_redirects', 'cms_outbox'] as $collection) {
            DB::connection('mongodb')->table($collection)->delete();
        }

        User::query()->where('email', 'like', '%@cms-test.local')->delete();

        parent::tearDown();
    }

    private function makeUser(string $role, array $overrides = []): User
    {
        static $n = 0;
        $n++;

        return User::query()->create(array_merge([
            'name' => "Entries {$role} {$n}",
            'email' => "entries{$role}{$n}@cms-test.local",
            'password' => 'password123',
            'role' => $role,
            'can_publish' => false,
            'can_preview' => false,
        ], $overrides));
    }

    /**
     * @return array<string, mixed>
     */
    private function projectPayload(string $slug): array
    {
        return [
            'type' => 'project',
            'slug' => $slug,
            'title' => "Project {$slug}",
            'data' => ['summary' => 'A test project'],
        ];
    }

    public function test_project_vertical_slice(): void
    {
        $owner = $this->makeUser(User::ROLE_OWNER);
        $api = $this->actingAs($owner);

        $created = $api->postJson('/api/v1/admin/entries', $this->projectPayload('slice'))
            ->assertCreated()
            ->json('data');
        $this->assertSame(1, $created['revision']);
        $this->assertTrue($created['hasUnpublishedChanges']);

        $id = $created['id'];

        $draft2 = $api->patchJson("/api/v1/admin/entries/{$id}", [
            'expectedRevision' => 1,
            'title' => 'Project slice v2',
        ])->assertOk()->json('data');
        $this->assertSame(2, $draft2['revision']);

        $preview = $api->postJson("/api/v1/admin/entries/{$id}/preview-session")
            ->assertCreated()->json('data');
        $this->assertNotEmpty($preview['token']);

        $api->getJson("/api/v1/admin/entries/{$id}/preview-data?token={$preview['token']}")
            ->assertOk()->assertJsonPath('data.title', 'Project slice v2');

        $this->getJson('/api/v1/public/projects/slice')->assertNotFound();

        $pub1 = $api->postJson("/api/v1/admin/entries/{$id}/publish", ['expectedRevision' => 2])
            ->assertAccepted()->json('data');
        $this->assertSame(2, $pub1['publishedRevision']);

        $this->getJson('/api/v1/public/projects/slice')
            ->assertOk()->assertJsonPath('data.sourceRevision', 2);

        $api->patchJson("/api/v1/admin/entries/{$id}", [
            'expectedRevision' => 2,
            'title' => 'Project slice v3 draft',
        ])->assertOk();

        $this->getJson('/api/v1/public/projects/slice')
            ->assertOk()->assertJsonPath('data.sourceRevision', 2);

        $api->postJson("/api/v1/admin/entries/{$id}/publish", ['expectedRevision' => 3])
            ->assertAccepted();

        $this->getJson('/api/v1/public/projects/slice')
            ->assertOk()
            ->assertJsonPath('data.sourceRevision', 3)
            ->assertJsonPath('data.data.title', 'Project slice v3 draft');
    }

    public function test_concurrent_save_returns_409(): void
    {
        $owner = $this->makeUser(User::ROLE_OWNER);
        $api = $this->actingAs($owner);

        $id = $api->postJson('/api/v1/admin/entries', $this->projectPayload('conflict'))
            ->assertCreated()->json('data.id');

        $api->patchJson("/api/v1/admin/entries/{$id}", [
            'expectedRevision' => 1,
            'title' => 'First writer wins',
        ])->assertOk();

        $api->patchJson("/api/v1/admin/entries/{$id}", [
            'expectedRevision' => 1,
            'title' => 'Stale writer loses',
        ])->assertConflict();
    }

    public function test_duplicate_slug_rejected(): void
    {
        $owner = $this->makeUser(User::ROLE_OWNER);
        $api = $this->actingAs($owner);

        $api->postJson('/api/v1/admin/entries', $this->projectPayload('dup'))
            ->assertCreated();

        $api->postJson('/api/v1/admin/entries', $this->projectPayload('dup'))
            ->assertUnprocessable();
    }

    public function test_invalid_schema_rejected(): void
    {
        $owner = $this->makeUser(User::ROLE_OWNER);
        $api = $this->actingAs($owner);

        $payload = $this->projectPayload('bad-schema');
        $payload['data'] = ['links' => [['label' => 'demo']]];

        $api->postJson('/api/v1/admin/entries', $payload)->assertUnprocessable();

        $api->postJson('/api/v1/admin/entries', [
            'type' => 'page',
            'key' => 'home',
            'title' => 'Home',
            'data' => ['blocks' => [['id' => 'b1', 'type' => 'nope_block']]],
        ])->assertUnprocessable();
    }

    public function test_restore_revision_creates_new_draft(): void
    {
        $owner = $this->makeUser(User::ROLE_OWNER);
        $api = $this->actingAs($owner);

        $id = $api->postJson('/api/v1/admin/entries', $this->projectPayload('rollback'))
            ->assertCreated()->json('data.id');

        $api->patchJson("/api/v1/admin/entries/{$id}", [
            'expectedRevision' => 1,
            'title' => 'Changed title',
        ])->assertOk();

        $restored = $api->postJson("/api/v1/admin/entries/{$id}/restore-revision", ['revision' => 1])
            ->assertOk()->json('data');

        $this->assertSame(3, $restored['revision']);
        $this->assertSame('Project rollback', $restored['title']);
    }

    public function test_unpublish_removes_publication(): void
    {
        $owner = $this->makeUser(User::ROLE_OWNER);
        $api = $this->actingAs($owner);

        $id = $api->postJson('/api/v1/admin/entries', $this->projectPayload('gone'))
            ->assertCreated()->json('data.id');

        $api->postJson("/api/v1/admin/entries/{$id}/publish", ['expectedRevision' => 1])
            ->assertAccepted();

        $this->getJson('/api/v1/public/projects/gone')->assertOk();

        $api->postJson("/api/v1/admin/entries/{$id}/unpublish")->assertAccepted();

        $this->getJson('/api/v1/public/projects/gone')->assertNotFound();
        $this->assertSame(2, CmsOutbox::query()->count());
    }

    public function test_publish_idempotent_with_key(): void
    {
        $owner = $this->makeUser(User::ROLE_OWNER);
        $api = $this->actingAs($owner);

        $id = $api->postJson('/api/v1/admin/entries', $this->projectPayload('idem'))
            ->assertCreated()->json('data.id');

        $first = $api->postJson("/api/v1/admin/entries/{$id}/publish", ['expectedRevision' => 1], [
            'Idempotency-Key' => 'key-123',
        ])->assertAccepted()->json('data');

        $second = $api->postJson("/api/v1/admin/entries/{$id}/publish", ['expectedRevision' => 1], [
            'Idempotency-Key' => 'key-123',
        ])->assertAccepted()->json('data');

        $this->assertSame($first['operationId'], $second['operationId']);
        $this->assertSame(1, CmsOutbox::query()->where('idempotencyKey', 'key-123')->count());
    }

    public function test_slug_change_after_publish_creates_redirect(): void
    {
        $owner = $this->makeUser(User::ROLE_OWNER);
        $api = $this->actingAs($owner);

        $id = $api->postJson('/api/v1/admin/entries', $this->projectPayload('old-slug'))
            ->assertCreated()->json('data.id');

        $api->postJson("/api/v1/admin/entries/{$id}/publish", ['expectedRevision' => 1])
            ->assertAccepted();

        $api->patchJson("/api/v1/admin/entries/{$id}", [
            'expectedRevision' => 1,
            'slug' => 'new-slug',
        ])->assertOk();

        $this->assertDatabaseHas('cms_redirects', [
            'fromPath' => '/work/old-slug',
            'toPath' => '/work/new-slug',
        ], 'mongodb');

        $this->getJson('/api/v1/public/redirects/resolve?path=/work/old-slug')
            ->assertOk()->assertJsonPath('data.toPath', '/work/new-slug');
    }

    public function test_publish_authorization_matrix(): void
    {
        $editor = $this->makeUser(User::ROLE_EDITOR);
        $viewer = $this->makeUser(User::ROLE_VIEWER);

        $ownerApi = $this->actingAs($this->makeUser(User::ROLE_OWNER));
        $id = $ownerApi->postJson('/api/v1/admin/entries', $this->projectPayload('acl'))
            ->assertCreated()->json('data.id');

        $this->actingAs($editor)
            ->postJson("/api/v1/admin/entries/{$id}/publish", ['expectedRevision' => 1])
            ->assertForbidden();

        $this->actingAs($viewer)
            ->postJson('/api/v1/admin/entries', $this->projectPayload('viewer-nope'))
            ->assertForbidden();

        $editor->can_publish = true;
        $editor->save();

        $this->actingAs($editor->fresh())
            ->postJson("/api/v1/admin/entries/{$id}/publish", ['expectedRevision' => 1])
            ->assertAccepted();
    }
}
