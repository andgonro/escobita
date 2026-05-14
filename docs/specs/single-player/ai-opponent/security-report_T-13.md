# Security Report: Single Player Mode - AI Opponent (Laia)

**Review Mode:** Incremental (T-13: Unit tests for AiStrategyService and GameTablePage AI orchestration)
**Source:** `docs/specs/single-player/ai-opponent/`
**Reviewed against:** spec.md (NFR-1.1, NFR-2.1, NFR-2.2, NFR-3.1), design.md (AD-2, AD-4, AD-5, AD-6, AD-10), Angular Security Guide, OWASP Top 10:2021

## 1. Risk Summary

This incremental security review of task T-13 found no Critical or High vulnerabilities. No dependency CVEs were reported by npm audit, and no injection primitives, credential exposure, or unsafe storage patterns were identified in scope. The primary open concerns are low-severity hardening gaps related to CSP nonce predictability and production console diagnostic exposure.

- Total findings: 3 (0 Critical, 0 High, 0 Medium, 3 Low, 0 Info)
- Dependency vulnerabilities: 0 Critical, 0 High (from npm audit)
- Most critical risk areas: CSP hardening model, production log minimization
- Overall risk level: Low

## 2. Dependency Vulnerabilities

Results of `npm audit --json`:

npm audit reports no vulnerabilities.

Total: 0 Critical, 0 High, 0 Medium, 0 Low

## 3. Security Findings

### SEC-01: Predictable static CSP nonce reduces nonce strength [Low]

- **OWASP Category:** A05:2021 - Security Misconfiguration
- **Severity:** Low
- **Affected:** src/index.html
- **Description:** The CSP meta policy and Angular CSP nonce wiring use a fixed nonce string instead of an unpredictable per-response value.
- **Risk:** If a separate injection condition exists, a predictable nonce can weaken nonce-based CSP protection and reduce defense-in-depth.
- **Expected Practice:** CSP nonces should be high-entropy and rotated per response, or the policy should avoid depending on fixed nonce literals.
- **Recommendation:** Because static hosting constraints were confirmed as intentional, keep this item tracked as an accepted hardening gap and evaluate alternatives that fit the deployment model, such as tightening policy directives and avoiding nonce reliance where possible.
- **References:** [OWASP A05:2021](https://owasp.org/Top10/A05_2021-Security_Misconfiguration/), [Angular Security Best Practices](https://angular.dev/best-practices/security), [MDN CSP nonce guidance](https://developer.mozilla.org/docs/Web/HTTP/Headers/Content-Security-Policy/script-src#unsafe_inline_script)
- **Spec Traceability:** AD-5

### SEC-02: Bootstrap error object exposed to browser console [Low]

- **OWASP Category:** A09:2021 - Security Logging and Monitoring Failures
- **Severity:** Low
- **Affected:** src/main.ts
- **Description:** Bootstrap failure handling writes the raw error object to the browser console.
- **Risk:** Raw runtime errors can expose internal details useful for reconnaissance on shared or instrumented clients.
- **Expected Practice:** Production client logging should be minimized, sanitized, and routed through controlled observability channels.
- **Recommendation:** Reduce error payload detail in production and adopt a redaction policy for client-side diagnostics.
- **References:** [OWASP Logging Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html), [OWASP A09:2021](https://owasp.org/Top10/A09_2021-Security_Logging_and_Monitoring_Failures/), [Angular Security Best Practices](https://angular.dev/best-practices/security)
- **Spec Traceability:** AD-4

### SEC-03: AI orchestration warning logs runtime context details [Low]

- **OWASP Category:** A09:2021 - Security Logging and Monitoring Failures
- **Severity:** Low
- **Affected:** src/app/features/game-board/game-table-page/game-table-page.ts
- **Description:** AI orchestration error handling logs runtime context values (player identifier, difficulty, and turn phase) in a production-reachable path.
- **Risk:** Repeated client-side context logging can reveal internal state patterns and create unnecessary diagnostic exposure.
- **Expected Practice:** Client warnings in production should avoid detailed runtime context unless strictly necessary and safely handled.
- **Recommendation:** As confirmed by review clarification, treat this as a remediation target and reduce or sanitize warning payloads for production builds.
- **References:** [OWASP Logging Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html), [OWASP A09:2021](https://owasp.org/Top10/A09_2021-Security_Logging_and_Monitoring_Failures/), [Angular Security Best Practices](https://angular.dev/best-practices/security)
- **Spec Traceability:** AD-4, AD-6

## 4. Authentication & Authorisation Summary

| Protected Route / Resource | Guard                          | Token Storage | Session Management                   | Status                           |
| -------------------------- | ------------------------------ | ------------- | ------------------------------------ | -------------------------------- |
| `/partida` route           | ✅ Yes (`partidaSessionGuard`) | Not used      | In-memory session configuration gate | ✅ Secure for current app model  |
| AI orchestration path      | Not a route surface            | Not used      | Local signal state only              | ✅ No auth gap observed in scope |

## 5. Transport Security Summary

| Control                 | Status                                      | Notes                                                                                                                   |
| ----------------------- | ------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| HTTPS enforcement       | ⚠️ Partial visibility                       | No HTTP API endpoints were found in scope; deployment-level TLS enforcement is not verifiable from frontend code alone. |
| Content Security Policy | ⚠️ Present with hardening gap               | CSP exists in `src/index.html`; static nonce predictability tracked in SEC-01.                                          |
| CORS policy             | ⚠️ Not verifiable in frontend-only scope    | No frontend HTTP client usage observed for this task; backend CORS controls are out of repository evidence.             |
| SameSite cookies        | ⚠️ Not applicable in current implementation | No cookie-based auth/session pattern observed in T-13 scope.                                                            |
| HSTS                    | ❌ Missing evidence in repository           | Requires server/hosting header configuration evidence outside this codebase.                                            |

## 6. Spec Security Compliance

| NFR     | Requirement                                                      | Status                        | Findings |
| ------- | ---------------------------------------------------------------- | ----------------------------- | -------- |
| NFR-2.1 | AI must never produce illegal play accepted by engine validation | ✅ Met in reviewed task scope | None     |
| NFR-2.2 | AI must always return exactly one decision per turn              | ✅ Met in reviewed task scope | None     |
| NFR-3.1 | AI strategy service must be unit-testable in isolation           | ✅ Met                        | None     |
| NFR-1.1 | Hard-mode decision should complete under 100ms                   | ✅ Met in unit-test evidence  | None     |

## 7. Traceability Matrix

| Finding | Severity | OWASP    | Affected Component                                             | Status |
| ------- | -------- | -------- | -------------------------------------------------------------- | ------ |
| SEC-01  | Low      | A05:2021 | src/index.html                                                 | Open   |
| SEC-02  | Low      | A09:2021 | src/main.ts                                                    | Open   |
| SEC-03  | Low      | A09:2021 | src/app/features/game-board/game-table-page/game-table-page.ts | Open   |

## 8. Prioritised Recommendations

### Critical (fix before any deployment)

1. None.

### High (fix before release)

1. None.

### Medium (fix in next sprint)

1. None.

### Low / Info (monitor and address)

1. Track static-nonce CSP as an explicit deployment constraint and plan a nonce-independent CSP hardening path compatible with static hosting.
2. Reduce bootstrap failure console exposure by sanitizing production client error output.
3. Reduce AI orchestration warning payload details in production to minimize runtime context leakage.
