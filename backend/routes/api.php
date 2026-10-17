<?php

use App\Http\Controllers\Api\V1\Admin\AuditLogController;
use App\Http\Controllers\Api\V1\Admin\ContentTypeController;
use App\Http\Controllers\Api\V1\Admin\EntryController;
use App\Http\Controllers\Api\V1\Admin\GlobalController;
use App\Http\Controllers\Api\V1\Admin\MediaController;
use App\Http\Controllers\Api\V1\Admin\PageController;
use App\Http\Controllers\Api\V1\Admin\PublishOperationController;
use App\Http\Controllers\Api\V1\Admin\RedirectController;
use App\Http\Controllers\Api\V1\Admin\SystemHealthController;
use App\Http\Controllers\Api\V1\Auth\AuthController;
use App\Http\Controllers\Api\V1\Public\DeliveryController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Portfolio CMS API v1 (spec section 7) — JSON-only.
|--------------------------------------------------------------------------
*/

Route::prefix('v1')->name('api.v1.')->group(function (): void {
    Route::prefix('auth')->name('auth.')->group(function (): void {
        Route::post('/login', [AuthController::class, 'login'])
            ->middleware('throttle:login')->name('login');
        Route::post('/token', [AuthController::class, 'issueToken'])
            ->middleware('throttle:login')->name('token.issue');
        Route::delete('/token', [AuthController::class, 'revokeToken'])
            ->middleware('auth:sanctum')->name('token.revoke');
        Route::post('/logout', [AuthController::class, 'logout'])
            ->middleware('auth:sanctum')->name('logout');
        Route::get('/me', [AuthController::class, 'me'])
            ->middleware('auth:sanctum')->name('me');
        Route::patch('/profile', [AuthController::class, 'updateProfile'])
            ->middleware('auth:sanctum')->name('profile.update');
        Route::post('/change-password', [AuthController::class, 'changePassword'])
            ->middleware('auth:sanctum')->name('password.change');
    });

    Route::prefix('admin')->name('admin.')->middleware('auth:sanctum')->group(function (): void {
        Route::get('/system/health', SystemHealthController::class)
            ->can('view-audit')->name('system.health');

        Route::get('/content-types', [ContentTypeController::class, 'index'])
            ->name('content-types.index');

        Route::get('/entries', [EntryController::class, 'index'])->name('entries.index');
        Route::post('/entries', [EntryController::class, 'store'])->name('entries.store');
        Route::get('/entries/{id}', [EntryController::class, 'show'])->name('entries.show');
        Route::patch('/entries/{id}', [EntryController::class, 'update'])->name('entries.update');
        Route::post('/entries/{id}/archive', [EntryController::class, 'archive'])->name('entries.archive');
        Route::post('/entries/{id}/restore', [EntryController::class, 'restore'])->name('entries.restore');
        Route::get('/entries/{id}/revisions', [EntryController::class, 'revisions'])->name('entries.revisions');
        Route::get('/entries/{id}/revisions/{revision}', [EntryController::class, 'showRevision'])->name('entries.revisions.show');
        Route::post('/entries/{id}/restore-revision', [EntryController::class, 'restoreRevision'])->name('entries.restore-revision');
        Route::post('/entries/{id}/publish', [EntryController::class, 'publish'])->name('entries.publish');
        Route::post('/entries/{id}/unpublish', [EntryController::class, 'unpublish'])->name('entries.unpublish');
        Route::post('/entries/{id}/preview-session', [EntryController::class, 'previewSession'])->name('entries.preview-session');
        Route::get('/entries/{id}/preview-data', [EntryController::class, 'previewData'])->name('entries.preview-data');

        Route::get('/globals/{key}', [GlobalController::class, 'show'])->name('globals.show');
        Route::patch('/globals/{key}', [GlobalController::class, 'update'])->name('globals.update');
        Route::post('/globals/{key}/publish', [GlobalController::class, 'publish'])->name('globals.publish');

        Route::get('/pages/{key}', [PageController::class, 'show'])->name('pages.show');
        Route::patch('/pages/{key}', [PageController::class, 'update'])->name('pages.update');

        Route::get('/audit-logs', [AuditLogController::class, 'index'])->name('audit-logs.index');

        Route::get('/media', [MediaController::class, 'index'])->name('media.index');
        Route::post('/media/uploads', [MediaController::class, 'issueUpload'])->name('media.uploads.store');
        Route::post('/media/uploads/{id}/complete', [MediaController::class, 'complete'])->name('media.uploads.complete');
        Route::get('/media/{id}', [MediaController::class, 'show'])->name('media.show');
        Route::patch('/media/{id}', [MediaController::class, 'update'])->name('media.update');
        Route::delete('/media/{id}', [MediaController::class, 'destroy'])->name('media.destroy');
        Route::post('/media/{id}/restore', [MediaController::class, 'restore'])->name('media.restore');

        Route::get('/redirects', [RedirectController::class, 'index'])->name('redirects.index');
        Route::post('/redirects', [RedirectController::class, 'store'])->name('redirects.store');
        Route::delete('/redirects/{id}', [RedirectController::class, 'destroy'])->name('redirects.destroy');

        Route::get('/publish-operations', [PublishOperationController::class, 'index'])->name('publish-operations.index');
        Route::post('/publish-operations/{id}/retry', [PublishOperationController::class, 'retry'])->name('publish-operations.retry');
    });

    Route::prefix('public')->name('public.')->group(function (): void {
        Route::get('/pages/{key}', [DeliveryController::class, 'page'])->name('pages.show');
        Route::get('/projects', [DeliveryController::class, 'projects'])->name('projects.index');
        Route::get('/projects/{slug}', [DeliveryController::class, 'project'])->name('projects.show');
        Route::get('/notes', [DeliveryController::class, 'notes'])->name('notes.index');
        Route::get('/notes/{slug}', [DeliveryController::class, 'note'])->name('notes.show');
        Route::get('/experiments', [DeliveryController::class, 'experiments'])->name('experiments.index');
        Route::get('/capabilities', [DeliveryController::class, 'capabilities'])->name('capabilities.index');
        Route::get('/skills', [DeliveryController::class, 'skills'])->name('skills.index');
        Route::get('/experiences', [DeliveryController::class, 'experiences'])->name('experiences.index');
        Route::get('/globals', [DeliveryController::class, 'globals'])->name('globals.index');
        Route::get('/redirects/resolve', [DeliveryController::class, 'resolveRedirect'])->name('redirects.resolve');
    });
});
