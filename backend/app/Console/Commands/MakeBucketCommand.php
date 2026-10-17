<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;

/**
 * Create the configured S3 bucket when the provider allows it.
 * LocalStack/MinIO accept this; AWS/IAM setups usually provision
 * buckets out-of-band — the command then reports and exits cleanly.
 */
class MakeBucketCommand extends Command
{
    protected $signature = 'cms:make-bucket';

    protected $description = 'Create the configured S3 media bucket if missing';

    public function handle(): int
    {
        $bucket = (string) config('filesystems.disks.s3.bucket');

        if ($bucket === '' || str_starts_with($bucket, 'CHANGE_ME')) {
            $this->error('AWS_BUCKET is not configured.');

            return self::FAILURE;
        }

        try {
            /** @var \Aws\S3\S3Client $client */
            $client = Storage::disk('s3')->getClient();

            if ($client->doesBucketExist($bucket)) {
                $this->info("Bucket '{$bucket}' already exists.");
            } else {
                $client->createBucket(['Bucket' => $bucket]);
                $this->info("Bucket '{$bucket}' created.");
            }

            return self::SUCCESS;
        } catch (\Throwable $e) {
            $this->error('Bucket check failed: '.class_basename($e));

            return self::FAILURE;
        }
    }
}
