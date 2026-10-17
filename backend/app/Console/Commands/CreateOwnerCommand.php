<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;

/**
 * Create (or promote) the Owner account. Private CLI/seed only (spec 7.2):
 * there is intentionally no public registration endpoint.
 */
class CreateOwnerCommand extends Command
{
    protected $signature = 'cms:create-owner
        {email : Owner email address}
        {--name=Administrator : Display name}
        {--password= : Password (will prompt securely when omitted)}
        {--force : Overwrite role/password when the user already exists}';

    protected $description = 'Create or promote the CMS Owner account';

    public function handle(): int
    {
        /** @var string $email */
        $email = $this->argument('email');

        $password = $this->option('password') ?: $this->secret('Password (min 8 chars)');

        if (! is_string($password) || strlen($password) < 8) {
            $this->error('Password must be at least 8 characters.');

            return self::FAILURE;
        }

        /** @var User|null $existing */
        $existing = User::query()->where('email', $email)->first();

        if ($existing && ! $this->option('force')) {
            $this->error("User {$email} already exists. Re-run with --force to promote/reset.");

            return self::FAILURE;
        }

        $user = $existing ?? new User;
        $user->name = (string) $this->option('name');
        $user->email = $email;
        // Plaintext: the model's `hashed` cast hashes on write — never pre-hash.
        $user->password = $password;
        $user->role = User::ROLE_OWNER;
        $user->can_publish = true;
        $user->can_preview = true;
        $user->save();

        $this->info("Owner account ready: {$email} (id: {$user->getKey()})");

        return self::SUCCESS;
    }
}
