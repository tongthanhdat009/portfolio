<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-10-18 -->
# Http

## Purpose
JSON-only API v1 surface: `Admin/*` (Sanctum-guarded draft management), `Auth/*` (login/token/profile), `Public/DeliveryController` (published reads only, never drafts).

## Key Files
| File | Role |
|------|------|
| `Controllers/Api/V1/Admin/EntryController.php` | Draft CRUD, revisions, publish/unpublish, auth-only preview; delegates to `ContentService`/`PublishService` |
| `Controllers/Api/V1/Public/DeliveryController.php` | Public reads: pages, projects, notes, experiments, capabilities, skills, experiences, globals, redirect resolve |
| `Controllers/Api/V1/Auth/AuthController.php` | Login, token issue/revoke, logout, me, profile, change-password |
| `Controllers/Api/V1/Admin/MediaController.php` | Presigned upload issue/complete, show/update/destroy/restore |
| `Controllers/Api/V1/Admin/GlobalController.php` / `PageController.php` | Globals and page-block documents by key |
| `Requests/Api/V1/Admin/StoreEntryRequest.php` / `UpdateEntryRequest.php` | Entry validation incl. `expectedRevision`, `SchemaRegistry::dataRules()` |
| `Requests/Api/V1/Admin/PublishRequest.php` / `IssueUploadRequest.php` / `UpdateMediaRequest.php` | Publish, upload-issue, media-update validation |
| `Requests/Api/V1/Auth/LoginRequest.php` / `ChangePasswordRequest.php` / `UpdateProfileRequest.php` | Auth validation |
| `Resources/Api/V1/EntryResource.php` / `MediaResource.php` / `PublicationResource.php` / `UserResource.php` | JSON shape; string-cast BSON ids via `(string) $this->getKey()` |

## Subdirectories
Batched: `Controllers/Api/V1/{Admin,Auth,Public}/`, `Requests/Api/V1/{Admin,Auth}/`, `Resources/Api/V1/` — no separate AGENTS.md files.

## For AI Agents
- Authorize in controllers (`$this->authorize(...)`, `->can(...)` in routes); enforcement is server-side per `EntryPolicy`, UI hiding is not enough.
- Public controllers read `CmsPublication`/globals only, never `CmsEntry` drafts.
- Validation in FormRequests, business rules in services. New endpoints: request + resource + route in `routes/api.php` + gate in `AppServiceProvider`.
- `throttle:login` on login/token-issue routes.

## Dependencies
- Internal: `App\Application\Services\*`, `App\Models\Cms\*`, `App\Policies\EntryPolicy`, gates in `AppServiceProvider`.
- External: Sanctum (`auth:sanctum`), Laravel validation/resources.

<!-- MANUAL: -->
