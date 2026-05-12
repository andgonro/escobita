# Security Report: Round Progression and Match Over

**Review Mode:** Incremental (T-11: Cypress E2E - match-over overlay scenarios, RED test authoring)
**Source:** docs/specs/ui/round-progression/
**Reviewed against:** spec.md (NFR-1.1, NFR-1.2, NFR-1.3, NFR-1.4, NFR-2.1, NFR-2.2), design.md (AD-3, AD-4, AD-5, AD-6, TR-3.1, TR-3.2), Angular Security Guide, OWASP Top 10:2021
**Clarification:** Deployment context for Cypress seam confirmed as local/CI test-only.

## 1. Risk Summary

This incremental RED-phase review focused on T-11 scope: cypress/e2e/match-over-overlay.feature, cypress/e2e/match-over-overlay.ts, and related Cypress seam usage assumptions in src/main.ts and src/app/core/services/game-engine.ts. No exploitable Critical, High, Medium, or Low security defects were evidenced in the reviewed scope. One informational governance finding remains for the Cypress-only browser seam, which is protected by development-mode and Cypress-runtime gates plus fail-closed fixture handling. No credential exposure and no unsafe execution patterns were observed in the scoped T-11 files.

- Total findings: 1 (0 Critical, 0 High, 0 Medium, 0 Low, 1 Info)
- Dependency vulnerabilities: 0 Critical, 0 High, 0 Medium, 0 Low
- Most critical risk area: Cypress seam exposure control in non-production execution contexts
- Overall risk level: Low
- GREEN blocker status: No security finding blocks GREEN

## 2. Dependency Vulnerabilities

Results of npm audit --json:

npm audit reports no vulnerabilities.

| Package         | Version | Severity | CVE | Fix Available |
| --------------- | ------- | -------- | --- | ------------- |
| None identified | N/A     | N/A      | N/A | N/A           |

Total: 0 Critical, 0 High, 0 Medium, 0 Low.

## 3. Security Findings

### SEC-01: Cypress Runtime Test Seam Requires Ongoing Environment Hardening [Info]

- **OWASP Category:** A05:2021 - Security Misconfiguration
- **Severity:** Info
- **Affected:** src/main.ts, src/app/core/services/game-engine.ts, cypress/e2e/match-over-overlay.ts, cypress/e2e/match-over-overlay.feature
- **Description:** T-11 RED tests use a window-level seam (\_\_escobitaTestApi) to apply deterministic fixture states and read runtime summaries. The seam is registered only when development mode and Cypress runtime are both present. The engine seam method independently enforces development-mode only execution and rejects unknown fixture names (fail closed).
- **Risk:** If a build with test seam availability were ever exposed outside trusted local or CI environments, an attacker with browser execution context could mutate in-memory game state during a session. Based on confirmed local/CI-only usage, current exploitability remains constrained.
- **Expected Practice:** Test-only seams should be inaccessible in production contexts, use strict allow-lists, and fail closed on unrecognized inputs.
- **Recommendation:** Keep dual gating in place, keep fixture handling fail-closed, include release checks that the seam is absent in production builds, and avoid expanding seam payloads with sensitive data.
- **References:** https://owasp.org/Top10/A05_2021-Security_Misconfiguration/; https://angular.dev/best-practices/security
- **Spec Traceability:** NFR-1.2, NFR-2.1, NFR-2.2, TR-3.1, TR-3.2

## 4. Authentication and Authorisation Summary

| Protected Route / Resource                      | Guard                            | Token Storage          | Session Management                                               | Status                         |
| ----------------------------------------------- | -------------------------------- | ---------------------- | ---------------------------------------------------------------- | ------------------------------ |
| /partida route                                  | partidaSessionGuard via canMatch | None in reviewed scope | Route access requires non-null GameSession configuration         | Secure in reviewed scope       |
| Window-level Cypress seam (\_\_escobitaTestApi) | Not an application auth boundary | None                   | Runtime-only seam gated by development mode and Cypress presence | Informational monitor (SEC-01) |

## 5. Transport Security Summary

| Control                 | Status     | Notes                                                                                            |
| ----------------------- | ---------- | ------------------------------------------------------------------------------------------------ |
| HTTPS enforcement       | Partial    | No insecure transport calls were observed in reviewed files; enforcement remains deployment-side |
| Content Security Policy | Configured | CSP meta policy present in src/index.html with restrictive self-origin directives                |
| CORS policy             | Partial    | Backend CORS policy is outside frontend test-authoring scope                                     |
| SameSite cookies        | Partial    | Cookie-based auth/session was not observed in reviewed scope                                     |
| HSTS                    | Missing    | Must be enforced by server response headers                                                      |

## 6. Spec Security Compliance

| NFR     | Requirement                                                         | Status  | Findings                                                                            |
| ------- | ------------------------------------------------------------------- | ------- | ----------------------------------------------------------------------------------- |
| NFR-1.1 | Start Next Round and View Winner controls remain mutually exclusive | Partial | RED test coverage exists in scope; runtime GREEN verification pending               |
| NFR-1.2 | Match-over overlay appears only after explicit acknowledgement      | Partial | RED test coverage exists in scope; SEC-01 remains informational governance monitor  |
| NFR-1.3 | Play Again reinitializes a fresh match safely                       | Partial | RED test coverage exists in scope; runtime GREEN verification pending               |
| NFR-1.4 | Round-result controls clear after Start Next Round                  | Partial | Covered in related RED test artifacts; runtime GREEN verification pending           |
| NFR-2.1 | New controls are keyboard reachable and operable                    | Partial | Keyboard-path RED scenarios authored; runtime GREEN verification pending            |
| NFR-2.2 | Live-region announcement patterns are preserved                     | Partial | Live-region RED scenarios authored; SEC-01 remains informational governance monitor |

## 7. Traceability Matrix

| Finding | Severity | OWASP    | Affected Component                                        | Status  |
| ------- | -------- | -------- | --------------------------------------------------------- | ------- |
| SEC-01  | Info     | A05:2021 | Cypress browser test seam bootstrap and fixture interface | Monitor |

## 8. Prioritised Recommendations

### Critical (fix before any deployment)

1. None.

### High (fix before release)

1. None.

### Medium (fix in next sprint)

1. None.

### Low / Info (monitor and address)

1. Keep Cypress seam exposure restricted to local and CI contexts, keep fixture inputs allow-listed and fail-closed, preserve minimal non-sensitive seam summary payloads, and include a release gate confirming no test seam on production artifacts.
