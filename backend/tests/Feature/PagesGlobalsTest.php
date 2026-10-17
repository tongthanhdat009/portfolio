<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

/**
 * P5 + P7 acceptance (spec 7.4, 7.7): page builder aliases, globals publish,
 * owner-only audit reads.
 *
 * Requires MongoDB: run inside Docker, not on bare host.
 */
class PagesGlobalsTest extends TestCase
{
    protected function tearDown(): void
    {
        foreach (['cms_entries', 'cms_publications', 'cms_revisions', 'cms_globals', 'cms_audit_logs', 'cms_outbox'] as $collection) {
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
            'name' => "PG {$role} {$n}",
            'email' => "pg{$role}{$n}@cms-test.local",
            'password' => 'password123',
            'role' => $role,
            'can_publish' => false,
            'can_preview' => false,
        ], $overrides));
    }

    public function test_page_builder_alias_flow(): void
    {
        $owner = $this->makeUser(User::ROLE_OWNER);
        $api = $this->actingAs($owner);

        $id = $api->postJson('/api/v1/admin/entries', [
            'type' => 'page',
            'key' => 'home',
            'title' => 'Home',
            'data' => ['blocks' => []],
        ])->assertCreated()->json('data.id');

        $api->getJson('/api/v1/admin/pages/home')->assertOk()->assertJsonPath('data.key', 'home');

        $api->patchJson('/api/v1/admin/pages/home', [
            'expectedRevision' => 1,
            'blocks' => [['id' => 'b1', 'type' => 'nope_block']],
        ])->assertUnprocessable();

        $updated = $api->patchJson('/api/v1/admin/pages/home', [
            'expectedRevision' => 1,
            'blocks' => [
                ['id' => 'b1', 'type' => 'hero_poster', 'order' => 0, 'enabled' => true],
                ['id' => 'b2', 'type' => 'featured_work', 'order' => 1, 'enabled' => false],
            ],
        ])->assertOk()->json('data');

        $this->assertSame(2, $updated['revision']);
        $this->assertSame('hero_poster', $updated['data']['blocks'][0]['type']);

        $api->getJson('/api/v1/admin/pages/nope')->assertNotFound();

        $this->assertSame($id, $updated['id']);
    }

    public function test_globals_draft_publish_and_public_read(): void
    {
        $owner = $this->makeUser(User::ROLE_OWNER, ['can_publish' => true]);
        $api = $this->actingAs($owner);

        $api->getJson('/api/v1/admin/globals/site')->assertNotFound();

        $draft = $api->patchJson('/api/v1/admin/globals/site', [
            'expectedRevision' => 0,
            'data' => ['identity' => ['name' => 'Dev']],
        ])->assertOk()->json('data');
        $this->assertSame(1, $draft['revision']);

        $this->getJson('/api/v1/public/globals')->assertOk()->assertJsonMissingPath('data.site');

        $api->postJson('/api/v1/admin/globals/site/publish', ['expectedRevision' => 1])
            ->assertAccepted();

        $this->getJson('/api/v1/public/globals')
            ->assertOk()
            ->assertJsonPath('data.site.data.identity.name', 'Dev');
    }

    public function test_audit_logs_owner_only(): void
    {
        $owner = $this->makeUser(User::ROLE_OWNER);
        $editor = $this->makeUser(User::ROLE_EDITOR);

        $id = $this->actingAs($owner)->postJson('/api/v1/admin/entries', [
            'type' => 'project',
            'slug' => 'audit-me',
            'title' => 'Audit me',
        ])->assertCreated()->json('data.id');

        $this->actingAs($owner)
            ->postJson("/api/v1/admin/entries/{$id}/publish", ['expectedRevision' => 1])
            ->assertAccepted();

        $this->actingAs($owner)->getJson('/api/v1/admin/audit-logs')
            ->assertOk()
            ->assertJsonFragment(['event' => 'entry.published']);

        $this->actingAs($editor)->getJson('/api/v1/admin/audit-logs')->assertForbidden();
    }
}
