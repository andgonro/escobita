# Security Report: Round Progression and Match Over

**Review Mode:** Incremental (T-11: Cypress E2E — match-over overlay scenarios, GREEN implementation review)
**Source:** `docs/specs/ui/round-progression/`
**Reviewed against:** spec.md (NFR-1.1, NFR-1.2, NFR-1.3, NFR-1.4, NFR-2.1, NFR-2.2), design.md (AD-3, AD-4, AD-5, AD-6, TR-3.1, TR-3.2), Angular Security Guide, OWASP Top 10:2021

## 1. Risk Summary

This incremental GREEN-phase review covers the fully implemented T-11 scope: `cypress/e2e/match-over-overlay.feature`, `cypress/e2e/match-over-overlay.ts`, and the runtime seam usage in `src/main.ts` and `src/app/core/services/game-engine.ts` that T-11 exercises. The review also re-examined the component under test (`match-over-overlay` component files) and the `GameTablePage` orchestration code for any security-relevant patterns exercised by the E2E tests.

No exploitable Critical, High, Medium, or Low security defects were identified in the reviewed scope. One informational governance finding from the RED-phase review remains valid and unchanged: the Cypress-only browser test seam continues to be properly dual-gated by development mode and Cypress runtime presence, with fail-closed fixture handling and an allow-listed fixture name set. No credential exposure, no unsafe DOM manipulation, no injection vectors, and no open redirect patterns were observed in the T-11 files or the components they exercise.

- Total findings: 1 (0 Critical, 0 High, 0 Medium, 0 Low, 1 Info)
- Dependency vulnerabilities: 0 Critical, 0 High, 0 Medium, 0 Low
- Most critical risk area: Cypress seam exposure control in non-production execution contexts
- Overall risk level: Low
- GREEN blocker status: No security finding blocks GREEN

## 2. Dependency Vulnerabilities

Results of `npm audit --json` (run 2026-05-12):

npm audit reports no vulnerabilities across 1,157 total dependencies (10 prod, 1,148 dev, 135 optional, 3 peer).

| Package         | Version | Severity | CVE | Fix Available |
| --------------- | ------- | -------- | --- | ------------- |
| None identified | N/A     | N/A      | N/A | N/A           |

Total: 0 Critical, 0 High, 0 Medium, 0 Low.

## 3. Security Findings

### SEC-01: Cypress Runtime Test Seam Requires Ongoing Environment Hardening [Info]

- **OWASP Category:** A05:2021 — Security Misconfiguration
- **Severity:** Info
- **Affected:** `src/main.ts` (seam registration), `src/app/core/services/game-engine.ts` (`applyE2eFixture` method), `cypress/e2e/match-over-overlay.ts` (seam consumer), `cypress/e2e/match-over-overlay.feature` (scenario definitions)
- **Description:** T-11 GREEN tests exercise the `window.__escobitaTestApi` seam to apply deterministic fixture states (`round-winner-visibility`, `round-co-winner-visibility`) and to read engine state summaries and session configuration summaries. The seam registration in `src/main.ts` is gated by two conditions: `isDevMode()` must return true and `window.Cypress` must be defined. The engine's `applyE2eFixture` method independently enforces a development-mode-only guard and rejects unknown fixture names via a `switch` statement with no default fall-through (fail-closed). The seam summary methods (`readEngineStateSummary`, `readSessionConfigurationSummary`) return only non-sensitive operational state (round number, card counts, turn phase, player names, game mode) and do not expose credentials, tokens, or internal implementation details beyond what is already visible in the rendered DOM.
- **Risk:** If a production build were misconfigured to include the seam (both guards bypassed), an attacker with browser console access could mutate in-memory game state during a session. The practical exploitability remains very low: Angular's production mode disables `isDevMode()`, the Cypress runtime object is not present in normal browser sessions, and the fixture handler rejects unrecognized inputs. No new seam surface was added by T-11 beyond what was established in earlier tasks.
- **Expected Practice:** Test-only seams should be inaccessible in production contexts, use strict allow-lists for accepted inputs, fail closed on unrecognized inputs, and avoid exposing sensitive data through summary payloads.
- **Recommendation:** Continue maintaining the dual-gate pattern. Include a release verification step (manual or automated) confirming that production builds do not expose `window.__escobitaTestApi`. Avoid expanding the seam's summary payloads with authentication tokens, session secrets, or internal service references. If additional fixture names are added in future tasks, ensure each maps to a well-defined, bounded state mutation with no side effects beyond the game engine's own signal graph.
- **References:** [OWASP A05:2021 — Security Misconfiguration](https://owasp.org/Top10/A05_2021-Security_Misconfiguration/); [Angular Security Guide](https://angular.dev/best-practices/security)
- **Spec Traceability:** NFR-1.2, NFR-2.1, NFR-2.2, TR-3.1, TR-3.2

## 4. Authentication & Authorisation Summary

| Protected Route / Resource                      | Guard                                | Token Storage          | Session Management                                               | Status                            |
| ----------------------------------------------- | ------------------------------------ | ---------------------- | ---------------------------------------------------------------- | --------------------------------- |
| `/partida` route                                | `partidaSessionGuard` via `canMatch` | None in reviewed scope | Route access requires non-null `GameSession` configuration       | ✅ Secure in reviewed scope       |
| Window-level Cypress seam (`__escobitaTestApi`) | Not an application auth boundary     | None                   | Runtime-only seam gated by development mode and Cypress presence | ⚠️ Informational monitor (SEC-01) |

## 5. Transport Security Summary

| Control                 | Status        | Notes                                                                                                                                   |
| ----------------------- | ------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| HTTPS enforcement       | ⚠️ Partial    | No insecure transport calls observed in reviewed files; enforcement remains deployment-side responsibility                              |
| Content Security Policy | ✅ Configured | CSP meta policy present in `src/index.html` with restrictive `self`-origin directives and `object-src 'none'`, `frame-ancestors 'none'` |
| CORS policy             | ⚠️ Partial    | Backend CORS policy is outside frontend test-authoring scope; no cross-origin requests in T-11 files                                    |
| SameSite cookies        | ⚠️ Partial    | Cookie-based auth/session not observed in reviewed scope                                                                                |
| HSTS                    | ❌ Missing    | Must be enforced by server response headers; outside frontend scope                                                                     |
| Referrer Policy         | ⚠️ Partial    | Not configured in `src/index.html`; recommended to add `Referrer-Policy: strict-origin-when-cross-origin`                               |

## 6. Spec Security Compliance

| NFR     | Requirement                                                         | Status | Findings                                                                                                                                                          |
| ------- | ------------------------------------------------------------------- | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| NFR-1.1 | Start Next Round and View Winner controls remain mutually exclusive | ✅ Met | GREEN E2E coverage in SC-10 (round-progression) and SC-16 (match-over-overlay) confirms mutual exclusivity at runtime                                             |
| NFR-1.2 | Match-over overlay appears only after explicit acknowledgement      | ✅ Met | SC-16 confirms overlay does not appear automatically; SC-15 confirms it requires explicit View Winner activation; SEC-01 remains informational governance monitor |
| NFR-1.3 | Play Again reinitializes a fresh match safely                       | ✅ Met | SC-35, SC-37, SC-39 confirm fresh state (round 1, scores reset, new deal) and bootstrap guard bypass                                                              |
| NFR-1.4 | Round-result controls clear after Start Next Round                  | ✅ Met | Covered in T-10 E2E scenarios (SC-07, SC-11); not directly in T-11 scope                                                                                          |
| NFR-2.1 | New controls are keyboard reachable and operable                    | ✅ Met | SC-24 (View Winner keyboard), SC-32 (Return to Lobby keyboard), SC-40 (Play Again keyboard) pass at runtime                                                       |
| NFR-2.2 | Live-region announcement patterns are preserved                     | ✅ Met | SC-27 confirms live-region announces winner name(s) when overlay appears                                                                                          |

## 7. Traceability Matrix

| Finding | Severity | OWASP    | Affected Component                                        | Status  |
| ------- | -------- | -------- | --------------------------------------------------------- | ------- |
| SEC-01  | Info     | A05:2021 | Cypress browser test seam bootstrap and fixture interface | Monitor |

## 8. Prioritised Recommendations

### Critical (fix before any deployment)

None.

### High (fix before release)

None.

### Medium (fix in next sprint)

None.

### Low / Info (monitor and address)

1. Continue restricting the Cypress seam (`window.__escobitaTestApi`) to local and CI contexts through the existing dual-gate (`isDevMode()` and `window.Cypress` presence). Keep fixture inputs allow-listed and fail-closed. Include a release gate confirming the seam is absent in production builds. Avoid expanding seam summary payloads with sensitive data. Reference: [OWASP A05:2021](https://owasp.org/Top10/A05_2021-Security_Misconfiguration/).
2. Consider adding a `Referrer-Policy: strict-origin-when-cross-origin` header or meta tag to `src/index.html` to prevent leaking URL parameters to third-party resources in future feature expansions. Reference: [OWASP Security Headers](https://owasp.org/www-project-secure-headers/).
