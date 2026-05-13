# Security Report: Single Player Mode - AI Opponent (Laia)

**Review Mode:** Incremental (T-4: Create AiPlayDecision type, AiTurnAnimationState type, and AiStrategyService skeleton)
**Source:** `docs/specs/single-player/ai-opponent/`
**Reviewed against:** spec.md (TR-1.1, TR-1.2, TR-1.3, TR-1.6, NFR-2.1, NFR-2.2), design.md (AD-3, AD-9, AD-10), Angular Security Guide, OWASP Top 10:2021

## 1. Risk Summary

This tests-only RED phase for T-4 currently contains test artifacts that target new AI model/service/utility files, but the runtime implementation files are not present yet. No exploitable security weakness was observed in executable application code within the T-4 scope because the scoped runtime surfaces are not yet introduced. The main risk is deferred assurance: security-relevant behaviors cannot be verified until T-4 implementation exists.

- Total findings: 1 (0 Critical, 0 High, 0 Medium, 0 Low, 1 Info)
- Dependency vulnerabilities: 0 Critical, 0 High (from npm audit)
- Most critical risk areas: deferred verification of decision integrity rules, deferred verification of randomness seam usage
- Overall risk level: Low

## 2. Dependency Vulnerabilities

Results of `npm audit --json`:

npm audit reports no vulnerabilities.

Total: 0 Critical, 0 High, 0 Medium, 0 Low

## 3. Security Findings

### SEC-01: Deferred security assurance due to missing T-4 runtime artifacts [Info]

- **OWASP Category:** A04:2021 - Insecure Design
- **Severity:** Info
- **Affected:** `src/app/core/services/ai-strategy.service.ts`, `src/app/core/utils/delay.utils.ts`, `src/app/models/ai-turn.ts` (expected by T-4 spec and tests)
- **Description:** The T-4 RED phase includes tests that reference new AI strategy and AI turn model artifacts, but those runtime source files are currently absent. Because the implementation is not yet present, security-relevant requirements in this task scope cannot be verified in code (for example, strict decision-shape handling and controlled randomness seam behavior).
- **Risk:** If implementation is added later without explicit security review gates, insecure patterns could be introduced unnoticed, including unsafe input trust assumptions or non-deterministic seams that reduce test reliability for security-sensitive behavior.
- **Expected Practice:** Security-relevant acceptance criteria should be validated immediately when implementation files are introduced, including strict type/shape guarantees and avoidance of unsafe dynamic execution or sanitization bypass patterns.
- **Recommendation:** Re-run incremental security review immediately after T-4 transitions to GREEN, with focused checks for OWASP A03 and A04 controls in the new AI service and model files. Reference Angular security best practices for trusted data handling and safe DOM interaction.
- **References:** https://owasp.org/Top10/A04_2021-Insecure_Design/, https://owasp.org/Top10/A03_2021-Injection/, https://angular.dev/best-practices/security
- **Spec Traceability:** TR-1.1, TR-1.2, TR-1.3, TR-1.6, NFR-2.1, NFR-2.2, AD-10

## 4. Authentication & Authorisation Summary

| Protected Route / Resource  | Guard                       | Token Storage         | Session Management                          | Status                    |
| --------------------------- | --------------------------- | --------------------- | ------------------------------------------- | ------------------------- |
| /partida route              | Yes (`partidaSessionGuard`) | Not used in T-4 scope | Session presence checked before route match | Secure for reviewed scope |
| T-4 AI strategy/model files | Not applicable yet          | Not applicable yet    | Not applicable yet                          | Pending implementation    |

## 5. Transport Security Summary

| Control                 | Status           | Notes                                                                                |
| ----------------------- | ---------------- | ------------------------------------------------------------------------------------ |
| HTTPS enforcement       | Partial          | Frontend repository does not provide deployment-edge transport enforcement evidence. |
| Content Security Policy | Configured       | CSP meta policy is present in `src/index.html` with restrictive directives.          |
| CORS policy             | Partial          | Not verifiable from frontend-only artifacts in T-4 scope.                            |
| SameSite cookies        | Partial          | No cookie-based auth/session behavior introduced in T-4 RED scope.                   |
| HSTS                    | Missing evidence | Not verifiable from repository artifacts reviewed in this task scope.                |

## 6. Spec Security Compliance

| NFR     | Requirement                                                                        | Status  | Findings |
| ------- | ---------------------------------------------------------------------------------- | ------- | -------- |
| NFR-2.1 | AI strategy must never produce an illegal play accepted by engine validation rules | Partial | SEC-01   |
| NFR-2.2 | Service must always produce exactly one play decision per AI turn                  | Partial | SEC-01   |

## 7. Traceability Matrix

| Finding | Severity | OWASP    | Affected Component                                                                           | Status |
| ------- | -------- | -------- | -------------------------------------------------------------------------------------------- | ------ |
| SEC-01  | Info     | A04:2021 | AiStrategyService, delay utility, ai-turn model artifacts (expected but absent in RED phase) | Open   |

## 8. Prioritised Recommendations

### Critical (fix before any deployment)

1. None.

### High (fix before release)

1. None.

### Medium (fix in next sprint)

1. None in current RED scope.

### Low / Info (monitor and address)

1. Execute a follow-up incremental security review at T-4 GREEN completion to validate implementation-time OWASP controls in the new AI service/model artifacts.
2. Keep dependency audit checks in CI and continue periodic reviews for component risk drift under OWASP A06 guidance: https://owasp.org/Top10/A06_2021-Vulnerable_and_Outdated_Components/
