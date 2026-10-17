<?php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Auth\ChangePasswordRequest;
use App\Http\Requests\Api\V1\Auth\LoginRequest;
use App\Http\Requests\Api\V1\Auth\UpdateProfileRequest;
use App\Http\Resources\Api\V1\UserResource;
use App\Models\Cms\CmsPersonalAccessToken;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * Session auth for the first-party SPA (spec 7.2, 9.1).
 * No public registration: owners are created via `cms:create-owner`.
 */
class AuthController extends Controller
{
    public function login(LoginRequest $request): JsonResponse
    {
        $credentials = $request->only('email', 'password');

        if (! Auth::guard('web')->attempt($credentials)) {
            return response()->json([
                'message' => 'Invalid credentials.',
                'errorCode' => 'INVALID_CREDENTIALS',
                'requestId' => $this->requestId($request),
            ], 401);
        }

        $request->session()->regenerate();

        return response()->json([
            'data' => new UserResource($request->user()),
        ]);
    }

    public function logout(Request $request): Response
    {
        Auth::guard('web')->logout();

        if ($request->hasSession()) {
            $request->session()->invalidate();
            $request->session()->regenerateToken();
        }

        return response()->noContent();
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json([
            'data' => new UserResource($request->user()),
        ]);
    }

    public function updateProfile(UpdateProfileRequest $request): JsonResponse
    {
        $user = $request->user();
        $user->fill($request->validated());
        $user->save();

        return response()->json([
            'data' => new UserResource($user),
        ]);
    }

    public function changePassword(ChangePasswordRequest $request): JsonResponse
    {
        $user = $request->user();
        $user->password = $request->validated('password');
        $user->save();

        return response()->json(['message' => 'Password changed.']);
    }

    /**
     * Per-user API token for cross-origin admin clients (e.g. Next.js Admin
     * on another port) that cannot use cookie sessions. Bound to the user who
     * logged in — never a shared service token. Stateless: no session created.
     */
    public function issueToken(LoginRequest $request): JsonResponse
    {
        $credentials = $request->only('email', 'password');

        $user = User::query()->where('email', $credentials['email'])->first();

        if (! $user || ! Hash::check($credentials['password'], (string) $user->password)) {
            return response()->json([
                'message' => 'Invalid credentials.',
                'errorCode' => 'INVALID_CREDENTIALS',
                'requestId' => $this->requestId($request),
            ], 401);
        }

        $plainTextToken = $user->generateTokenString();

        $token = $user->tokens()->create([
            'name' => 'admin-console',
            'token' => hash('sha256', $plainTextToken),
            'abilities' => ['cms'],
            'expires_at' => null,
        ]);

        return response()->json([
            'data' => [
                'token' => $token->getKey().'|'.$plainTextToken,
                'user' => new UserResource($user),
            ],
        ], 201);
    }

    public function revokeToken(Request $request): Response
    {
        $token = $request->user()->currentAccessToken();

        if (! $token instanceof CmsPersonalAccessToken) {
            abort(404, 'No API token for this session.');
        }

        $token->delete();

        return response()->noContent();
    }

    private function requestId(Request $request): string
    {
        $id = $request->header('X-Request-ID');

        return is_string($id) && $id !== '' ? $id : (string) Str::uuid();
    }
}
