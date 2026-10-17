<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

/**
 * Readiness probe: MongoDB, object storage, queue (spec 7.7, 10.3).
 * Owner-only; reports degraded instead of 500 so partial outages stay visible.
 */
class SystemHealthController extends Controller
{
    public function __invoke(): JsonResponse
    {
        $checks = [
            'mongodb' => $this->checkMongo(),
            'storage' => $this->checkStorage(),
            'queue' => $this->checkQueue(),
        ];

        $degraded = collect($checks)->contains(fn (array $c) => $c['status'] !== 'ok');

        return response()->json([
            'status' => $degraded ? 'degraded' : 'ok',
            'version' => config('app.version', '1.0.0'),
            'checks' => $checks,
        ]);
    }

    /**
     * @return array<string, string>
     */
    private function checkMongo(): array
    {
        try {
            DB::connection('mongodb')->table('cms_entries')->count();

            return ['status' => 'ok', 'detail' => 'reachable'];
        } catch (\Throwable $e) {
            return ['status' => 'down', 'detail' => class_basename($e)];
        }
    }

    /**
     * @return array<string, string>
     */
    private function checkStorage(): array
    {
        try {
            Storage::disk('s3')->exists('.health-probe');

            return ['status' => 'ok', 'detail' => 'reachable'];
        } catch (\Throwable $e) {
            return ['status' => 'degraded', 'detail' => 'unconfigured-or-unreachable'];
        }
    }

    /**
     * @return array<string, string>
     */
    private function checkQueue(): array
    {
        $connection = (string) config('queue.default', 'sync');

        return ['status' => 'ok', 'detail' => "driver:{$connection}"];
    }
}
