# Security Specification — Firestore Rules

## 1. Data Invariants
- All collections (`site_settings`, `memories`, `letters`) contain strictly non-PII romantic album content (no user emails, phone numbers, addresses, or credentials).
- Public/shared read access (`get`, `list`) is intentionally enabled on `site_settings`, `memories`, and `letters` so any visitor with the romantic passcode (`14/2`) on the shared link (`ais-pre-...`) can immediately load all saved edits, photos, dates, and letters in real time without requiring Google Sign-In.
- All write operations (`create`, `update`, `delete`) are strictly restricted to the verified owner/admin (`eng.faressnasser@gmail.com` with `request.auth.token.email_verified == true`), enforcing strict key allowlists, type checks, string `.size()` bounds, regex ID guards, immutable `ownerId` and `createdAt`, and server timestamps (`request.time`).
- Global default-deny rule `match /{document=**} { allow read, write: if false; }` protects all other paths.

## 2. "Dirty Dozen" Payloads (Expected: PERMISSION_DENIED)
1. Unauthenticated `create` on `/memories/mem-1` (missing `request.auth`).
2. Unverified email admin attempt (`email_verified: false`, `email: 'eng.faressnasser@gmail.com'`) on `/site_settings/main`.
3. Non-admin authenticated user (`email: 'attacker@example.com'`) attempting `update` on `/site_settings/main`.
4. Shadow update adding ghost field `isVerified: true` on `/memories/mem-1`.
5. Oversized ID poisoning (`150+` characters or invalid chars `../hack`) on `/memories/{memoryId}`.
6. Spoofed `ownerId` (`ownerId !== request.auth.uid`) on `create` in `/letters/let-1`.
7. Mutating immutable `createdAt` or `ownerId` during `update` on `/memories/mem-1`.
8. Client-forged timestamp (`updatedAt !== request.time`) on `create` or `update`.
9. Oversized string payload (`title.size() > 200` or `story.size() > 3000`) on `/memories/mem-1`.
10. Invalid `startDate` format (`"invalid-date"`) on `/site_settings/main`.
11. Invalid `category` enum (`"hacked"`) on `/memories/mem-1`.
12. Unauthorized `delete` on `/letters/let-1` by a non-admin user, or write to an undeclared path `/admins/uid1`.
