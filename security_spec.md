# Security Specification: KineNime Streaming Platform

## 1. Data Invariants
1. **PII Isolation**: User profile documents (`/users/{userId}`) contain PII (`email`, `displayName`, `photoURL`) and are strictly readable and writable only by the verified owner (`request.auth.uid == userId`). Blanket reads and collection-wide `list` queries on `/users` are strictly denied.
2. **Self-Assigned Privilege Prevention**: On initial user profile creation, `isPremium` must be `false` and `premiumPlan` must be `'free'`.
3. **Master Gate Relational Integrity**: Subcollections `/users/{userId}/favorites/{mediaId}` and `/users/{userId}/watchHistory/{mediaId}` require the parent `/users/{userId}` document to exist (`exists(...)`) and belong to `request.auth.uid`.
4. **Temporal & Identity Immutability**: `uid`, `email`, and `createdAt` on `/users/{userId}` are immutable after creation; `createdAt`, `updatedAt`, `addedAt`, and `watchedAt` must equal `request.time`.
5. **Bounded Arrays & Strings**: `genres` array in `watchHistory` is strictly bounded (`size() >= 1 && size() <= 5`) with string type validation; all IDs match `^[a-zA-Z0-9_\-]+$` and are $\le 128$ chars.

## 2. The "Dirty Dozen" Attack Payloads
1. **Unauthenticated Write**: `create /users/u1` with `auth: null` -> `PERMISSION_DENIED`.
2. **Identity Spoofing on User Create**: `create /users/victim` by `auth.uid = attacker` with `uid: "victim"` -> `PERMISSION_DENIED`.
3. **Self-Assigned Premium on Registration**: `create /users/attacker` with `isPremium: true, premiumPlan: "yearly"` -> `PERMISSION_DENIED`.
4. **Shadow Ghost Field Injection**: `update /users/u1` with `{ displayName: "A", updatedAt: serverTime, role: "admin" }` -> `PERMISSION_DENIED`.
5. **Email Spoofing / Unverified Token**: `create /users/u1` with `email_verified: false` -> `PERMISSION_DENIED`.
6. **PII Blanket Read / List Leak**: `get /users/otherUser` or `list /users` by `auth.uid = attacker` -> `PERMISSION_DENIED`.
7. **Immutable Field Tampering**: `update /users/u1` changing `email` or `createdAt` -> `PERMISSION_DENIED`.
8. **Fake Client Timestamp**: `create /users/u1/watchHistory/m1` with `watchedAt: "2020-01-01"` instead of `request.time` -> `PERMISSION_DENIED`.
9. **ID Poisoning**: `create /users/u1/favorites/bad$id..1500chars` -> `PERMISSION_DENIED`.
10. **Unbounded Array / Type Poisoning**: `create /users/u1/watchHistory/m1` with `genres: [1, 2, 3, 4, 5, 6]` -> `PERMISSION_DENIED`.
11. **Orphaned Subcollection Write**: `create /users/u1/favorites/m1` when `/users/u1` does not exist -> `PERMISSION_DENIED`.
12. **Cross-User Subcollection Scraping**: `list /users/victim/watchHistory` by `auth.uid = attacker` -> `PERMISSION_DENIED`.
