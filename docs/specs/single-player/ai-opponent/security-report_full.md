# Security Report: Single Player Mode — AI Opponent (Laia)

**Review Mode:** Full (focused on AI card visibility bug fix)
**Source:** `docs/specs/single-player/ai-opponent/`
**Reviewed against:** spec.md (NFR-1–NFR-4, FR-8.1–FR-8.4), design.md (AD-2, AD-5, AD-8), Angular Security Guide, OWASP Top 10:2021

## 1. Risk Summary

The AI card visibility bug fix correctly remediates an information disclosure vulnerability where the human player could observe AI hand cards during Laia's turn. The fix applies defence-in-depth across two layers: the orchestrator no longer exposes AI hand data through the active hand zone, and the opponent zone component enforces face-down rendering unconditionally. No new security vulnerabilities are introduced by these changes.

- Total findings: 4 (0 Critical, 0 High, 1 Medium, 1 Low, 2 Info)
- Dependency vulnerabilities: 0 Critical, 0 High (from npm audit)
- Most critical risk areas: console logging of internal identifiers, GameState full-access architecture
- Overall risk level: **Low**

## 2. Dependency Vulnerabilities

npm audit reports no vulnerabilities.

| Package | Version | Severity | CVE | Fix Available |
| ------- | ------- | -------- | --- | ------------- |
| (none)  | —       | —        | —   | —             |

Total: 0 Critical, 0 High, 0 Medium, 0 Low

## 3. Security Findings

### SEC-01: Console warning in AI turn error handler exposes internal player identifiers [Low]

- **OWASP Category:** A09:2021 — Security Logging and Monitoring Failures
- **Severity:** Low
- **Affected:** GameTablePage component, `runAiTurn()` method catch block
- **Description:** When AI turn orchestration fails, the catch block logs `aiPlayerId` (a UUID) and `difficulty` to the browser console via `console.warn`. While this does not expose card data or game state, it leaks internal player identifiers to anyone with DevTools open.
- **Risk:** An observer with browser DevTools open could see internal player UUIDs and difficulty settings. In a client-side single-player game this has minimal exploitability, but it represents non-essential information being output to a user-accessible surface.
- **Expected Practice:** Error logging in production should not expose internal identifiers. The Angular `isDevMode()` guard pattern (already used in the GameEngine service) should gate diagnostic logging.
- **Recommendation:** Wrap the `console.warn` in an `isDevMode()` check, consistent with the existing pattern in the GameEngine service. Refer to OWASP guidance on logging: https://owasp.org/Top10/A09_2021-Security_Logging_and_Monitoring_Failures/
- **References:** [OWASP A09:2021](https://owasp.org/Top10/A09_2021-Security_Logging_and_Monitoring_Failures/)
- **Spec Traceability:** NFR-1 (performance/observability), TR-2.3

---

### SEC-02: Full GameState (including deck and human hand) passed to AI strategy service [Info]

- **OWASP Category:** A04:2021 — Insecure Design
- **Severity:** Info
- **Affected:** AiStrategyService, `decide()` method signature
- **Description:** The `decide()` method receives the complete `GameState` object, which includes `state.deck` (all undealt cards) and `state.players[0].hand` (the human player's current hand). While the Difícil strategy implementation correctly does NOT access the human's hand directly (it infers the unseen card set through elimination), the architectural surface area allows future code to accidentally or intentionally read this data.
- **Risk:** In a client-side single-player game, both players exist on the same machine. True information separation is architecturally impossible without a server. The current design relies on developer discipline (enforced by code review and spec compliance with FR-5.2) rather than architectural isolation.
- **Expected Practice:** For a client-side card game, the current approach is the practical standard. A more restrictive design would pass only `aiPlayer.hand`, `state.table`, and all captured piles to the strategy service — omitting the deck and human hand from the function signature entirely.
- **Recommendation:** This is an informational observation, not an actionable vulnerability. If a future refactor introduces a separate AI decision interface, consider narrowing the input type to exclude `deck` and non-AI player hands, consistent with the principle of least privilege. Refer to OWASP guidance: https://owasp.org/Top10/A04_2021-Insecure_Design/
- **References:** [OWASP A04:2021](https://owasp.org/Top10/A04_2021-Insecure_Design/), [Angular Security Guide](https://angular.dev/best-practices/security)
- **Spec Traceability:** FR-5.2, TR-1.1, AD-10

---

### SEC-03: AI card visibility fix correctly remediates information disclosure [Info]

- **OWASP Category:** A01:2021 — Broken Access Control
- **Severity:** Info (resolved — documenting for traceability)
- **Affected:** GameTablePage (`activeHandCards` computed), OpponentZones (`aiCardAt()`, `isAiCardFaceDown()`)
- **Description:** The bug fix addresses a previously exploitable information disclosure where, during Laia's turn, `activePlayer().hand` returned the AI player's hand cards to the `activeHandCards` computed signal, which fed the active hand zone template — rendering AI cards face-up and visible to the human player. The fix applies defence-in-depth at two layers: (1) `activeHandCards` now returns `players[0].hand` (always the human) in Single Player mode regardless of whose turn it is; (2) `aiCardAt()` unconditionally returns `null` and `isAiCardFaceDown()` unconditionally returns `true`, ensuring no AI card data flows to the opponent zone template under any condition.
- **Risk:** The original vulnerability allowed the human to see AI hand cards during Laia's turn, compromising game integrity. The fix eliminates this disclosure path.
- **Expected Practice:** Defence-in-depth — data should be withheld at the data source (orchestrator) AND at the rendering layer (presentational component). The fix implements both layers correctly.
- **Recommendation:** No action required. The fix is sound. Consider adding a regression test comment or test annotation noting this was a security-relevant fix to prevent future regressions.
- **References:** [OWASP A01:2021](https://owasp.org/Top10/A01_2021-Broken_Access_Control/), FR-8.1–FR-8.4
- **Spec Traceability:** FR-8.1, FR-8.2, FR-8.3, TR-4.1

---

### SEC-04: Test API properly gated behind Cypress detection and devMode [Medium]

- **OWASP Category:** A05:2021 — Security Misconfiguration
- **Severity:** Medium
- **Affected:** `src/main.ts`, `__escobitaTestApi` global window property
- **Description:** The `__escobitaTestApi` object — which exposes `applyEngineFixture`, `readEngineStateSummary`, and `readSessionConfigurationSummary` methods — is correctly gated behind the condition `window.Cypress !== undefined && isDevMode()`. This means the test API is only attached in development builds when Cypress is present. However, the `window.Cypress` check relies on a globally settable property. Any script running on the page in development mode could set `window.Cypress = true` before the application bootstraps, causing the test API to be exposed.
- **Risk:** In a production build, `isDevMode()` returns `false`, so the test API is never attached regardless of `window.Cypress`. The risk is limited to development builds where an injected script could force the test API to appear. Since this is a client-side game with no server-side state or user accounts, the practical impact is negligible — an attacker with script injection capability already has full access to the application state.
- **Expected Practice:** The dual-gate (`Cypress` + `isDevMode()`) is the standard pattern for Angular E2E test APIs. The `isDevMode()` check is the authoritative production guard.
- **Recommendation:** No immediate action required. The `isDevMode()` guard ensures production builds never expose the test API. If additional hardening is desired, consider using a build-time environment flag instead of runtime detection, which would enable tree-shaking to remove the test API code entirely from production bundles. Refer to: https://owasp.org/Top10/A05_2021-Security_Misconfiguration/
- **References:** [OWASP A05:2021](https://owasp.org/Top10/A05_2021-Security_Misconfiguration/), [Angular Security Guide — devMode](https://angular.dev/best-practices/security)
- **Spec Traceability:** NFR-3.2, TR-1.6

## 4. Authentication & Authorisation Summary

| Protected Route / Resource | Guard                          | Token Storage        | Session Management                          | Status    |
| -------------------------- | ------------------------------ | -------------------- | ------------------------------------------- | --------- |
| `/partida` (game table)    | ✅ Yes (`partidaSessionGuard`) | N/A (no auth tokens) | In-memory session via `GameSession` service | ✅ Secure |
| `/` (lobby)                | ✅ Public (no guard needed)    | N/A                  | N/A                                         | ✅ Secure |

This application has no user authentication, no remote API, and no persistent credentials. The route guard protects the game table from direct navigation without a valid in-memory session configuration. Session state is lost on page refresh by design (documented in spec "Out of Scope").

## 5. Transport Security Summary

| Control                 | Status                   | Notes                                                                                                                                                                                                                   |
| ----------------------- | ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| HTTPS enforcement       | ⚠️ Depends on deployment | No server-side HSTS configured in app code; relies on hosting platform                                                                                                                                                  |
| Content Security Policy | ✅ Configured            | Meta tag CSP in `index.html`: `default-src 'self'; script-src 'self'; style-src 'self' 'nonce-escobita-style-nonce'; img-src 'self' data:; font-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'` |
| CORS policy             | ✅ N/A                   | No cross-origin HTTP requests — fully client-side application                                                                                                                                                           |
| SameSite cookies        | ✅ N/A                   | Application uses no cookies                                                                                                                                                                                             |
| HSTS                    | ⚠️ Deployment-dependent  | No HSTS meta tag or server config in application code                                                                                                                                                                   |

## 6. Spec Security Compliance

| NFR     | Requirement                                                   | Status                 | Findings                                 |
| ------- | ------------------------------------------------------------- | ---------------------- | ---------------------------------------- |
| FR-8.1  | All AI hand cards rendered face-down at all times             | ✅ Met                 | SEC-03 (resolved)                        |
| FR-8.2  | Face-down applies to all difficulty levels                    | ✅ Met                 | SEC-03 (resolved)                        |
| FR-8.3  | Selected card visually distinguished but face-down            | ✅ Met                 | SEC-03 (resolved)                        |
| FR-5.2  | AI does not access human hand directly                        | ✅ Met (by convention) | SEC-02 (info)                            |
| TR-1.6  | Random seam replaceable in tests (no security bypass in prod) | ✅ Met                 | Uses `crypto.getRandomValues` as default |
| NFR-3.2 | E2E fixture mechanism testable without production exposure    | ✅ Met                 | SEC-04 (medium — dual-gated)             |

## 7. Traceability Matrix

| Finding | Severity | OWASP    | Affected Component           | Status                 |
| ------- | -------- | -------- | ---------------------------- | ---------------------- |
| SEC-01  | Low      | A09:2021 | GameTablePage                | Open                   |
| SEC-02  | Info     | A04:2021 | AiStrategyService            | Open (by design)       |
| SEC-03  | Info     | A01:2021 | GameTablePage, OpponentZones | Resolved               |
| SEC-04  | Medium   | A05:2021 | main.ts (test API)           | Open (acceptable risk) |

## 8. Prioritised Recommendations

### Critical (fix before any deployment)

(none)

### High (fix before release)

(none)

### Medium (fix in next sprint)

1. Consider replacing the runtime `window.Cypress` detection with a build-time environment flag to enable tree-shaking of the test API from production bundles, eliminating any residual attack surface from the E2E fixture mechanism. Reference: https://owasp.org/Top10/A05_2021-Security_Misconfiguration/

### Low / Info (monitor and address)

1. Gate the `console.warn` in `runAiTurn()` catch block behind `isDevMode()` to prevent internal identifiers from appearing in production browser consoles, consistent with the existing pattern in the GameEngine service. Reference: https://owasp.org/Top10/A09_2021-Security_Logging_and_Monitoring_Failures/
2. Monitor the `AiStrategyService.decide()` method in future code reviews to ensure no new code accesses `state.players[humanIndex].hand` directly, maintaining compliance with FR-5.2.
