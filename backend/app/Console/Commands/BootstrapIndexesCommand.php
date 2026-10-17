<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use MongoDB\Client;
use MongoDB\Model\IndexInfo;

/**
 * Idempotent MongoDB index/validator bootstrap (spec 4.6).
 * Safe to re-run: existing indexes are detected by name and skipped.
 * Run after deploy and whenever route-scope rules change.
 */
class BootstrapIndexesCommand extends Command
{
    protected $signature = 'cms:bootstrap-indexes';

    protected $description = 'Create CMS MongoDB indexes idempotently';

    public function handle(): int
    {
        $dsn = (string) config('database.connections.mongodb.dsn');
        $database = (string) config('database.connections.mongodb.database');
        $client = new Client($dsn);
        $db = $client->selectDatabase($database);

        $specs = [
            'cms_entries' => [
                ['keys' => ['type' => 1, 'locale' => 1, 'slug' => 1], 'options' => ['unique' => true, 'name' => 'uniq_entries_route', 'partialFilterExpression' => ['slug' => ['$type' => 'string']]]],
                ['keys' => ['type' => 1, 'locale' => 1, 'key' => 1], 'options' => ['unique' => true, 'name' => 'uniq_entries_singleton', 'partialFilterExpression' => ['key' => ['$type' => 'string']]]],
                ['keys' => ['type' => 1, 'updated_at' => -1], 'options' => ['name' => 'idx_entries_type_updated']],
                ['keys' => ['type' => 1, 'status' => 1, 'sortOrder' => 1], 'options' => ['name' => 'idx_entries_listing']],
            ],
            'cms_publications' => [
                ['keys' => ['type' => 1, 'locale' => 1, 'slug' => 1], 'options' => ['unique' => true, 'name' => 'uniq_publications_route', 'partialFilterExpression' => ['slug' => ['$type' => 'string']]]],
                ['keys' => ['type' => 1, 'locale' => 1, 'key' => 1], 'options' => ['unique' => true, 'name' => 'uniq_publications_singleton', 'partialFilterExpression' => ['key' => ['$type' => 'string']]]],
                ['keys' => ['type' => 1, 'locale' => 1, 'publishedAt' => -1], 'options' => ['name' => 'idx_publications_listing']],
            ],
            'cms_revisions' => [
                ['keys' => ['entryId' => 1, 'revision' => 1], 'options' => ['unique' => true, 'name' => 'uniq_revisions_entry_revision']],
                ['keys' => ['entryId' => 1, 'createdAt' => -1], 'options' => ['name' => 'idx_revisions_entry_created']],
            ],
            'cms_media' => [
                ['keys' => ['disk' => 1, 'bucket' => 1, 'storageKey' => 1], 'options' => ['unique' => true, 'name' => 'uniq_media_object']],
                ['keys' => ['status' => 1, 'created_at' => -1], 'options' => ['name' => 'idx_media_status_created']],
            ],
            'cms_redirects' => [
                ['keys' => ['locale' => 1, 'fromPath' => 1], 'options' => ['unique' => true, 'name' => 'uniq_redirects_from']],
            ],
            'cms_outbox' => [
                ['keys' => ['status' => 1, 'nextAttemptAt' => 1], 'options' => ['name' => 'idx_outbox_claim']],
                ['keys' => ['idempotencyKey' => 1], 'options' => ['unique' => true, 'name' => 'uniq_outbox_idempotency']],
            ],
            'cms_audit_logs' => [
                ['keys' => ['resourceType' => 1, 'resourceId' => 1, 'createdAt' => -1], 'options' => ['name' => 'idx_audit_resource']],
                ['keys' => ['actorId' => 1, 'createdAt' => -1], 'options' => ['name' => 'idx_audit_actor']],
            ],
        ];

        foreach ($specs as $collection => $indexes) {
            $existing = collect(iterator_to_array($db->selectCollection($collection)->listIndexes()))
                ->map(fn (IndexInfo $i) => $i->getName())
                ->all();

            foreach ($indexes as $spec) {
                if (in_array($spec['options']['name'], $existing, true)) {
                    $this->line("  skip {$collection}.{$spec['options']['name']} (exists)");
                    continue;
                }

                $db->selectCollection($collection)->createIndex($spec['keys'], $spec['options']);
                $this->info("  created {$collection}.{$spec['options']['name']}");
            }
        }

        $this->info('Indexes bootstrapped.');

        return self::SUCCESS;
    }
}
