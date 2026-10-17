<?php

namespace Tests\Feature;

use App\Models\Cms\CmsPersonalAccessToken;
use App\Models\User;
use MongoDB\BSON\ObjectId;
use Tests\TestCase;

/**
 * P1 acceptance (spec 13.3): 401 guest, 403 forbidden, login/logout,
 * profile, password change, owner-only health.
 *
 * Requires MongoDB (ext-mongodb): run inside Docker
 * (`docker compose run --rm backend php artisan test`), not on bare host.
 */
class AuthTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        // Sanctum only starts the session for first-party frontend requests.
        $this->withHeaders([
            'Referer' => 'http://localhost:3000/admin',
            'Origin' => 'http://localhost:3000',
        ]);
    }

    protected function tearDown(): void
    {
        User::query()->where('email', 'like', '%@cms-test.local')->delete();

        parent::tearDown();
    }

    /**
     * Mirror the browser SPA flow (spec 7.2): fetch the CSRF cookie, then
     * replay its token as X-XSRF-TOKEN on mutations.
     */
    private function withSpaCsrf(): void
    {
        $res = $this->get('/sanctum/csrf-cookie');
        $res->assertNoContent();

        $this->refreshSpaCsrf($res);
    }

    /**
     * Browsers re-read the fresh XSRF-TOKEN cookie after every mutation
     * (login/logout regenerate the session). Mirror that here.
     */
    private function refreshSpaCsrf(\Illuminate\Testing\TestResponse $res): void
    {
        foreach ($res->headers->getCookies() as $cookie) {
            if ($cookie->getName() === 'XSRF-TOKEN') {
                // Browsers replay the encrypted cookie verbatim; the server decrypts it.
                $this->withHeader('X-XSRF-TOKEN', $cookie->getValue());
            }
        }
    }

    private function makeUser(string $role, array $overrides = []): User
    {
        static $n = 0;
        $n++;

        return User::query()->create(array_merge([
            'name' => "Test {$role} {$n}",
            'email' => "{$role}{$n}@cms-test.local",
            // Plaintext: the model's `hashed` cast hashes on write.
            'password' => 'password123',
            'role' => $role,
            'can_publish' => false,
            'can_preview' => false,
        ], $overrides));
    }

    public function test_guest_me_returns_401(): void
    {
        $this->getJson('/api/v1/auth/me')->assertUnauthorized();
    }

    public function test_token_issue_use_and_revoke(): void
    {
        $owner = $this->makeUser(User::ROLE_OWNER);
        $this->withSpaCsrf();

        $issued = $this->postJson('/api/v1/auth/token', [
            'email' => $owner->email,
            'password' => 'password123',
        ])->assertCreated();
        $this->refreshSpaCsrf($issued);
        $issued = $issued->json('data');

        $this->assertNotEmpty($issued['token']);

        [$issuedId] = explode('|', $issued['token'], 2);
        $issuedKey = preg_match('/^[0-9a-f]{24}$/i', $issuedId)
            ? new ObjectId($issuedId)
            : $issuedId;
        $this->assertNotNull(CmsPersonalAccessToken::query()->where('_id', $issuedKey)->first());

        $this->getJson('/api/v1/auth/me', ['Authorization' => 'Bearer '.$issued['token']])
            ->assertOk()->assertJsonPath('data.role', User::ROLE_OWNER);

        $this->deleteJson('/api/v1/auth/token', [], ['Authorization' => 'Bearer '.$issued['token']])
            ->assertNoContent();

        [$tokenId] = explode('|', $issued['token'], 2);
        $key = preg_match('/^[0-9a-f]{24}$/i', $tokenId)
            ? new ObjectId($tokenId)
            : $tokenId;
        $this->assertNull(CmsPersonalAccessToken::query()->where('_id', $key)->first());
    }

    public function test_token_with_bad_credentials_returns_401(): void
    {
        $this->withSpaCsrf();
        $this->postJson('/api/v1/auth/token', [
            'email' => 'nobody@cms-test.local',
            'password' => 'wrong-password',
        ])->assertUnauthorized()->assertJsonPath('errorCode', 'INVALID_CREDENTIALS');
    }

    public function test_login_without_csrf_returns_419(): void
    {
        $this->postJson('/api/v1/auth/login', [
            'email' => 'nobody@cms-test.local',
            'password' => 'wrong-password',
        ])->assertStatus(419);
    }

    public function test_login_with_bad_credentials_returns_401(): void
    {
        $owner = $this->makeUser(User::ROLE_OWNER);
        $this->withSpaCsrf();

        $this->postJson('/api/v1/auth/login', [
            'email' => $owner->email,
            'password' => 'wrong-password',
        ])->assertUnauthorized()->assertJsonPath('errorCode', 'INVALID_CREDENTIALS');
    }

    public function test_owner_login_me_and_logout_flow(): void
    {
        $owner = $this->makeUser(User::ROLE_OWNER);
        $this->withSpaCsrf();

        $login = $this->postJson('/api/v1/auth/login', [
            'email' => $owner->email,
            'password' => 'password123',
        ])->assertOk();
        $this->refreshSpaCsrf($login);

        $this->assertNotEmpty($login->json('data.id'));
        $this->assertContains('manage-users', $login->json('data.capabilities'));

        $this->getJson('/api/v1/auth/me')
            ->assertOk()
            ->assertJsonPath('data.role', User::ROLE_OWNER);

        $this->postJson('/api/v1/auth/logout')->assertNoContent();
        $this->assertGuest('web');
    }

    public function test_editor_cannot_access_owner_health(): void
    {
        $editor = $this->makeUser(User::ROLE_EDITOR);

        $this->actingAs($editor)->getJson('/api/v1/admin/system/health')->assertForbidden();
    }

    public function test_owner_health_reports_status(): void
    {
        $owner = $this->makeUser(User::ROLE_OWNER);

        $this->actingAs($owner)->getJson('/api/v1/admin/system/health')
            ->assertOk()
            ->assertJsonPath('checks.mongodb.status', 'ok');
    }

    public function test_change_password_flow(): void
    {
        $owner = $this->makeUser(User::ROLE_OWNER);
        $this->withSpaCsrf();

        $this->actingAs($owner)->postJson('/api/v1/auth/change-password', [
            'current_password' => 'password123',
            'password' => 'new-password-456',
            'password_confirmation' => 'new-password-456',
        ])->assertOk();

        // Old session flow: logout then login with the new password.
        $logout = $this->postJson('/api/v1/auth/logout');
        $logout->assertNoContent();
        $this->refreshSpaCsrf($logout);

        $this->postJson('/api/v1/auth/login', [
            'email' => $owner->email,
            'password' => 'new-password-456',
        ])->assertOk();
    }

    public function test_role_capabilities_matrix(): void
    {
        $this->assertTrue($this->makeUser(User::ROLE_OWNER)->canPublish());
        $this->assertFalse($this->makeUser(User::ROLE_EDITOR)->canPublish());
        $this->assertTrue($this->makeUser(User::ROLE_EDITOR, ['can_publish' => true])->canPublish());
        $this->assertFalse($this->makeUser(User::ROLE_VIEWER)->canPreview());
        $this->assertTrue($this->makeUser(User::ROLE_VIEWER, ['can_preview' => true])->canPreview());
    }
}
