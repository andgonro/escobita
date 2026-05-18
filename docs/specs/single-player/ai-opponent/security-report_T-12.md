# Security Report: Single Player Mode - AI Opponent (Laia)

**Review Mode:** Incremental (T-12 follow-up: OpponentZones test additions)
**Source:** `docs/specs/single-player/ai-opponent/`
**Reviewed against:** spec.md (NFR-3.2, FR-8.1-FR-8.4), design.md (AD-7, AD-8, TR-1.6), Angular Security Guide, OWASP Top 10:2021

## 1. Risk Summary

This follow-up incremental re-review focused on the updated test coverage in `src/app/features/game-board/game-table-page/zones/opponent-zones/opponent-zones.spec.ts`, with prior T-12 fixture seam context retained. The reviewed changes are unit-test assertions and static test fixtures only; no new runtime security surface, credential handling, authentication flow, route exposure, or transport configuration changes were introduced in scope. Total findings: 0 open findings (0 Critical, 0 High, 0 Medium, 0 Low) and 2 reviewed concerns closed as false positives (Info-level review notes). Dependency vulnerabilities from a fresh audit remain zero Critical and zero High. Overall risk level: Low.

## 2. Dependency Vulnerabilities

Results of `npm audit --json`:

`npm audit` reports no vulnerabilities.

Total: 0 Critical, 0 High, 0 Medium, 0 Low

## 3. Security Findings

No exploitable security findings were identified in this follow-up scope.

## 4. False-Positive Review Status

### FP-01: Potential DOM-based XSS via image source checks in OpponentZones tests [Info]

- **OWASP Category:** A03:2021 - Injection
- **Severity:** Info
- **Affected:** `src/app/features/game-board/game-table-page/zones/opponent-zones/opponent-zones.spec.ts`
- **Observed Pattern:** The tests assert expected static image path fragments (for example card back and revealed card assets) using DOM queries and attribute checks.
- **Disposition:** False Positive (Closed)
- **Why False Positive:** The reviewed code is a unit test file that does not process untrusted runtime input and does not introduce sanitisation bypass usage. Assertions validate expected rendering outputs and do not create a new injection path.
- **Spec Traceability:** FR-8.1, FR-8.3, FR-8.4, NFR-3.2

### FP-02: Potential sensitive information exposure through test data identifiers [Info]

- **OWASP Category:** A09:2021 - Security Logging and Monitoring Failures
- **Severity:** Info
- **Affected:** `src/app/features/game-board/game-table-page/zones/opponent-zones/opponent-zones.spec.ts`
- **Observed Pattern:** The tests use deterministic player IDs and static labels (for example `p-laia`, `Opponent-1`, and `Carta oculta`) for assertions.
- **Disposition:** False Positive (Closed)
- **Why False Positive:** Values are synthetic test fixtures, not secrets, credentials, or production telemetry. No sensitive data is logged, persisted, or exposed through runtime channels by the reviewed additions.
- **Spec Traceability:** NFR-3.1, NFR-3.2

## 5. Authentication & Authorisation Summary

| Protected Route / Resource                               | Guard                             | Token Storage  | Session Management | Status             |
| -------------------------------------------------------- | --------------------------------- | -------------- | ------------------ | ------------------ |
| OpponentZones unit-test scope (`opponent-zones.spec.ts`) | Not applicable in test-only scope | Not applicable | Not applicable     | ✅ Secure in scope |

## 6. Transport Security Summary

| Control                 | Status                        | Notes                                                                          |
| ----------------------- | ----------------------------- | ------------------------------------------------------------------------------ |
| HTTPS enforcement       | Not changed in this follow-up | No network or transport behavior is introduced by the reviewed test additions. |
| Content Security Policy | Not changed in this follow-up | No CSP-related configuration changes in scope.                                 |
| CORS policy             | Not changed in this follow-up | No cross-origin request logic in scope.                                        |
| SameSite cookies        | Not changed in this follow-up | No cookie handling changes in scope.                                           |
| HSTS                    | Not changed in this follow-up | No server header configuration changes in scope.                               |

## 7. Spec Security Compliance

| NFR     | Requirement                                                                              | Status | Findings         |
| ------- | ---------------------------------------------------------------------------------------- | ------ | ---------------- |
| NFR-3.2 | The AI turn orchestration must remain testable via deterministic fixture and test seams. | ✅ Met | No open findings |
| NFR-3.1 | AI-related logic and behavior should be unit-testable in isolation.                      | ✅ Met | No open findings |

## 8. Traceability Matrix

| Finding | Severity | OWASP    | Affected Component                          | Status                  |
| ------- | -------- | -------- | ------------------------------------------- | ----------------------- |
| FP-01   | Info     | A03:2021 | OpponentZones unit-test assertions          | False Positive (Closed) |
| FP-02   | Info     | A09:2021 | OpponentZones unit-test fixture identifiers | False Positive (Closed) |

## 9. Prioritised Recommendations

### Low / Info (monitor and address)

1. Continue keeping OpponentZones rendering assertions based on controlled test fixtures only, and maintain existing sanitisation-safe rendering patterns in production templates as the related runtime components evolve.
2. Continue running dependency audits as part of CI to preserve the current zero-vulnerability posture.
