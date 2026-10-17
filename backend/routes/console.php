<?php

use App\Jobs\CleanupOrphanUploads;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Schedule::job(new CleanupOrphanUploads)->weekly();
Schedule::command('cms:process-outbox --limit=50')->everyMinute();
