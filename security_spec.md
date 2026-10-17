# Security Specification & Threat Model for CloudNotes

## 1. Data Invariants
- **Identity & Ownership**: A user can only create, read, update, and delete folders and notes where `userId == request.auth.uid`.
- **Integrity**:
  - `id` must match the path document ID (`folderId` or `noteId`) and satisfy regex `^[a-zA-Z0-9_-]+$` with length <= 128.
  - `userId` is strictly immutable after creation.
  - `createdAt` is immutable after creation.
  - `title` is a string with length <= 200.
  - `content` is a string with length <= 50000.
  - `name` (folder) is a string with length <= 100.
  - Default-deny catch-all rule `match /{document=**} { allow read, write: if false; }` prevents any unauthorized access.
  - Secure List Queries: List queries must evaluate `resource.data.userId == request.auth.uid`.

## 2. The Dirty Dozen Payloads (Designed to Break Identity & Integrity)
1. **Payload 1 (Ghost Field Injection)**:
   Creating a note with unwhitelisted attribute `__admin: true`.
2. **Payload 2 (User ID Spoofing on Create)**:
   User `alice` attempts to create a note with `userId: "bob"`.
3. **Payload 3 (Unauthenticated Read)**:
   Unauthenticated request attempting to get `/notes/note_123`.
4. **Payload 4 (Cross-User Read)**:
   User `alice` attempts to read `/notes/bob_note`.
5. **Payload 5 (Cross-User List Query)**:
   User `alice` attempts to query `/notes` where `userId == "bob"`.
6. **Payload 6 (Oversized Content Attack / Denial of Wallet)**:
   User sends note content exceeding 50,000 characters.
7. **Payload 7 (Oversized Title Attack)**:
   User sends note title exceeding 200 characters.
8. **Payload 8 (Oversized Folder Name)**:
   User sends folder name exceeding 100 characters.
9. **Payload 9 (Ownership Hijack on Update)**:
   User `alice` tries to update `userId` of an existing note to `carol`.
10. **Payload 10 (Creation Date Tampering)**:
    User `alice` updates existing note and alters original `createdAt`.
11. **Payload 11 (Path ID Mismatch)**:
    Creating `/notes/note_abc` where payload `id` is `"note_xyz"`.
12. **Payload 12 (Foreign Folder ID Tampering)**:
    Attacker tries to set folder `userId` to another user's UID on update.

## 3. Test Runner
Included in `firestore.rules.test.ts`.
