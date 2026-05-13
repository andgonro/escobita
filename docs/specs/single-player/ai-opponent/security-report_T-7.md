# Security Report: Single Player Mode - AI Opponent (Laia)

**Review Mode:** Incremental (T-7: Implement Difícil strategy) - GREEN security review after implementation  
**Source:** docs/specs/single-player/ai-opponent/  
**Reviewed against:** spec.md (FR-5.1 to FR-5.6, TR-5.1 to TR-5.3, NFR-1.1, NFR-2.1, NFR-2.2, NFR-3.1), design.md (AD-3, AD-10), Angular Security Guide, OWASP Top 10:2021

## 1. Risk Summary

This incremental review focused on the implemented Difícil strategy path and its tests in task T-7. No Critical, High, or Medium vulnerabilities were found. Hidden-hand constraints are enforced in the reviewed strategy logic, the randomness seam is testable, and dependency audit reports zero known vulnerabilities.

- Total findings: 1 (0 Critical, 0 High, 0 Medium, 1 Low, 0 Info)
- Dependency vulnerabilities: 0 Critical, 0 High
- Most critical risk areas: randomness seam contract hardening
- Overall risk level: Low
- Release recommendation: APPROVE

## 2. Dependency Vulnerabilities

Results of npm audit --json:

| Package | Version | Severity | CVE | Fix Available |
| ------- | ------- | -------- | --- | ------------- |
| None    | N/A     | N/A      | N/A | N/A           |

Total: 0 Critical, 0 High, 0 Medium, 0 Low  
npm audit reports no vulnerabilities.

## 3. Security Findings

### SEC-01: Random selector seam silently normalizes invalid selector outputs [Low]

- **OWASP Category:** A08:2021 - Software and Data Integrity Failures
- **Severity:** Low
- **Affected:** src/app/core/services/ai-strategy.service.ts
- **Description:** The random-selection seam currently clamps any out-of-range selector output to a valid index instead of failing fast.
- **Risk:** If an invalid deterministic selector is injected in tests or future integrations, strategy behavior can be silently altered and defects may be harder to detect.
- **Expected Practice:** Decision seams should enforce strict contracts so invalid selector values are surfaced immediately.
- **Recommendation:** Add explicit contract validation for selector outputs and treat invalid values as a test or runtime integrity error. Keep deterministic seam tests to preserve reproducibility.
- **References:** https://owasp.org/Top10/A08_2021-Software_and_Data_Integrity_Failures/, https://angular.dev/best-practices/security
- **Spec Traceability:** TR-1.6, NFR-3.1

## 4. Authentication and Authorisation Summary

| Protected Route / Resource | Guard               | Token Storage | Session Management                     | Status                      |
| -------------------------- | ------------------- | ------------- | -------------------------------------- | --------------------------- |
| partida route              | partidaSessionGuard | None observed | In-memory session gate via GameSession | ✅ Secure in reviewed scope |
| AI decision flow (T-7)     | Not applicable      | None observed | In-memory only                         | ✅ Secure in reviewed scope |

## 5. Transport Security Summary

| Control                 | Status        | Notes                                                                                                               |
| ----------------------- | ------------- | ------------------------------------------------------------------------------------------------------------------- |
| HTTPS enforcement       | ⚠️ Partial    | No network calls are introduced in T-7 scope; transport enforcement remains a deployment concern outside this task. |
| Content Security Policy | ✅ Configured | Restrictive CSP is present in src/index.html.                                                                       |
| CORS policy             | ⚠️ Partial    | No cross-origin requests are introduced by T-7 scope.                                                               |
| SameSite cookies        | ⚠️ Partial    | No cookie-based authentication/session flow is introduced by T-7 scope.                                             |
| HSTS                    | ⚠️ Partial    | Header-level control is outside client-side task scope.                                                             |

## 6. Spec Security Compliance

| NFR     | Requirement                                                                  | Status | Findings                       |
| ------- | ---------------------------------------------------------------------------- | ------ | ------------------------------ |
| FR-5.1  | Hard mode maintains full round card knowledge context                        | ✅ Met | None                           |
| FR-5.2  | Hard mode does not access human hand directly                                | ✅ Met | None                           |
| FR-5.3  | Hard mode applies probability-informed scoring from inferred information     | ✅ Met | None                           |
| FR-5.4  | Hard mode selects highest expected-value option with tie handling            | ✅ Met | None                           |
| FR-5.5  | Escoba takes priority in Hard mode                                           | ✅ Met | None                           |
| FR-5.6  | Hard-mode memory scope remains round-bounded through state-derived reasoning | ✅ Met | None                           |
| TR-5.1  | Unseen set derived from full deck minus known cards                          | ✅ Met | None                           |
| TR-5.2  | Probability model uses inferred unseen distribution                          | ✅ Met | None                           |
| TR-5.3  | No exhaustive lookahead beyond model scope                                   | ✅ Met | None                           |
| NFR-1.1 | Hard decision completes under 100 ms                                         | ✅ Met | None                           |
| NFR-2.1 | AI returns legal decisions                                                   | ✅ Met | None                           |
| NFR-2.2 | AI returns one decision per turn                                             | ✅ Met | None                           |
| NFR-3.1 | AI strategy is unit-testable with deterministic seam                         | ✅ Met | SEC-01 (hardening opportunity) |

## 7. Traceability Matrix

| Finding | Severity | OWASP    | Affected Component              | Status |
| ------- | -------- | -------- | ------------------------------- | ------ |
| SEC-01  | Low      | A08:2021 | AiStrategyService selector seam | Open   |

## 8. Prioritised Recommendations

### Critical (fix before any deployment)

1. None.

### High (fix before release)

1. None.

### Medium (fix in next sprint)

1. None.

### Low / Info (monitor and address)

1. Harden the selector seam contract to reject invalid indices explicitly.
2. Keep the human-hand non-access test and unseen-set derivation test in CI to preserve hidden-hand guarantees.
