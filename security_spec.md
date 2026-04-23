# Security Specification for ColorTrack Pro

## Data Invariants
1. A Batch must always belong to a valid Material.
2. `currentQuantity` in a Batch cannot exceed `initialQuantity` unless it's a correction.
3. Expiry notifications are user-specific and require authentication.
4. Inventory logs are append-only (no deletion/modification).

## The Dirty Dozen Payloads (Red Team Test Cases)

1. **Anonymous Modification**: Attempting to update a material name without being signed in.
2. **Identity Spoofing**: User A trying to update User B's notification settings.
3. **Ghost Field Injection**: Adding an `isAdmin: true` field to a Material document.
4. **Invalid Date Injection**: Setting an expiry date to a 1MB string.
5. **Orphaned Batch**: Creating a Batch with a non-existent `materialId`.
6. **Negative Quantity**: Setting `currentQuantity` to `-500`.
7. **Bypassing Thresholds**: Setting `minThreshold` to a huge number to crash UI.
8. **Log Deletion**: Attempting to delete an `InventoryLog` entry to hide theft.
9. **Log Modification**: Changing the `quantity` of a previously recorded `IN` log.
10. **ID Poisoning**: Using a 2KB string as a `materialId`.
11. **Batch Over-Withdrawal**: Setting `currentQuantity` to a value without creating a log entry (relational sync check).
12. **Status Spoofing**: Force setting a batch status to `depleted` while `currentQuantity` is still 100.

## Test Runner (Conceptual)
Tests will verify that these malicious payloads return `PERMISSION_DENIED`.
