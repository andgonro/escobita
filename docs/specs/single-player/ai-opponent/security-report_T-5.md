# Security Report: Single Player Mode - AI Opponent (Laia)

**Review Mode:** Incremental (T-5: Implement Facil strategy)
**Source:** `docs/specs/single-player/ai-opponent/`
**Reviewed against:** spec.md (FR-3.1 through FR-3.5, NFR-2.1, NFR-2.2, TR-1.6), design.md (AD-3, AD-10), Angular Security Guide, OWASP Top 10:2021

## 1. Risk Summary

This GREEN-phase incremental review is scoped to the implemented Fácil strategy in the AI decision service and related tests. Evidence was gathered from the strategy implementation, service tests, model and delay utility tests, environment and build configuration, and dependency audit output. No Critical, High, or Medium vulnerabilities were identified. One Low availability-hardening concern and one Info-level randomness-quality observation were identified.

- Total findings: 2 (0 Critical, 0 High, 0 Medium, 1 Low, 1 Info)
- Dependency vulnerabilities: 0 Critical, 0 High (from npm audit --json)
- Most critical risk areas: defensive handling for unexpected empty AI hand state; non-cryptographic fallback randomness quality in non-crypto runtime
- Overall risk level: Low

## 2. Dependency Vulnerabilities

Results of npm audit --json:

| Package | Version | Severity | CVE | Fix Available |
| ------- | ------- | -------- | --- | ------------- |
| None    | N/A     | N/A      | N/A | N/A           |

Total: 0 Critical, 0 High, 0 Medium, 0 Low

npm audit reports no vulnerabilities.

## 3. Security Findings

### SEC-01: Unexpected Empty-Hand State Can Abort AI Decision [Low]

- **OWASP Category:** A04:2021 - Insecure Design
- **Severity:** Low
- **Affected:** src/app/core/services/ai-strategy.service.ts (AiStrategyService decidePlacement)
- **Description:** The placement branch throws an error when no card is available in the AI hand. In normal engine flow this condition should not occur, but there is no defensive fallback decision path for malformed or tampered in-memory state.
- **Risk:** If runtime state becomes inconsistent, the AI turn can fail hard and interrupt match flow (availability and resilience impact).
- **Expected Practice:** Decision services should fail safely under unexpected inputs and preserve turn-loop stability even when preconditions are violated.
- **Recommendation:** Add a documented fail-safe behavior for impossible-state handling at the orchestration boundary and strategy contract level, and pair it with explicit negative tests for empty-hand input handling.
- **References:** https://owasp.org/Top10/A04_2021-Insecure_Design/, https://angular.dev/best-practices/security
- **Spec Traceability:** NFR-2.2, TR-1.2

### SEC-02: Randomness Fallback Uses Non-Cryptographic Source in No-Crypto Runtime [Info]

- **OWASP Category:** A02:2021 - Cryptographic Failures
- **Severity:** Info
- **Affected:** src/app/core/services/ai-strategy.service.ts (AiStrategyService secureRandomIndex)
- **Description:** The strategy uses a secure source when available, but falls back to Math.random where crypto APIs are unavailable. This does not create a direct exploit in this game context, but it reduces randomness quality and predictability resistance in degraded runtimes.
- **Risk:** Potentially more predictable tie-breaking and card-choice distribution in constrained environments.
- **Expected Practice:** Security-sensitive randomness should use cryptographically secure sources consistently, and non-crypto fallback should be accepted only where predictability has no material security effect.
- **Recommendation:** Keep the current approach for gameplay use, but document that non-crypto fallback is accepted for compatibility only, and periodically review whether minimum runtime requirements can require crypto support.
- **References:** https://owasp.org/Top10/A02_2021-Cryptographic_Failures/, https://angular.dev/best-practices/security
- **Spec Traceability:** TR-1.6, FR-3.3, FR-3.4

## 4. Authentication & Authorisation Summary

| Protected Route / Resource                | Guard                                          | Token Storage                          | Session Management                      | Status                      |
| ----------------------------------------- | ---------------------------------------------- | -------------------------------------- | --------------------------------------- | --------------------------- |
| T-5 AI strategy service scope             | Not applicable in this task                    | Not applicable                         | In-memory strategy evaluation only      | ✅ Secure in reviewed scope |
| Single-player route entry (context check) | partidaSessionGuard exists outside T-5 changes | No new token storage introduced by T-5 | Existing session precondition unchanged | ✅ Secure in reviewed scope |

## 5. Transport Security Summary

| Control                 | Status     | Notes                                                                                       |
| ----------------------- | ---------- | ------------------------------------------------------------------------------------------- |
| HTTPS enforcement       | ⚠️ Partial | Frontend strategy code does not control deployment transport policy.                        |
| Content Security Policy | ⚠️ Partial | Not modified by T-5; no new script or HTML injection surfaces introduced in reviewed files. |
| CORS policy             | ⚠️ Partial | Backend concern; no network request logic added in T-5 strategy scope.                      |
| SameSite cookies        | ⚠️ Partial | No cookie authentication changes in scope.                                                  |
| HSTS                    | ⚠️ Partial | Server header concern outside this task scope.                                              |

## 6. Spec Security Compliance

| NFR     | Requirement                                                    | Status                   | Findings                                                                                                                |
| ------- | -------------------------------------------------------------- | ------------------------ | ----------------------------------------------------------------------------------------------------------------------- |
| NFR-2.1 | AI strategy service must never produce an illegal play         | ✅ Met in reviewed scope | Capture enumeration enforces exact-sum-to-15 subsets; tests assert subset legality and membership (no contrary finding) |
| NFR-2.2 | Service must always produce exactly one play decision per turn | ⚠️ Partial               | SEC-01                                                                                                                  |
| NFR-3.1 | Strategy service must be unit-testable with deterministic seam | ✅ Met in reviewed scope | Random seam injection is present and exercised in service tests                                                         |

## 7. Traceability Matrix

| Finding | Severity | OWASP    | Affected Component                    | Status |
| ------- | -------- | -------- | ------------------------------------- | ------ |
| SEC-01  | Low      | A04:2021 | AiStrategyService placement path      | Open   |
| SEC-02  | Info     | A02:2021 | AiStrategyService randomness fallback | Open   |

## 8. Prioritised Recommendations

### Critical (fix before any deployment)

1. None.

### High (fix before release)

1. None.

### Medium (fix in next sprint)

1. None.

### Low / Info (monitor and address)

1. Add defensive decision-path hardening for impossible empty-hand conditions so the AI turn path degrades safely instead of aborting.
2. Retain deterministic random seam usage in tests and keep documenting randomness behavior in non-crypto runtimes.
3. Continue dependency monitoring each task increment with npm audit output review.

## 9. Final Recommendation

**Recommendation:** APPROVE

Rationale: No Critical/High/Medium findings, no dependency vulnerabilities, legal-play guarantees are strongly covered by the implemented subset validation logic and related tests, and identified concerns are low-impact hardening items that do not block T-5 release.
