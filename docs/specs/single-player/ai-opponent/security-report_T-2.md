# Security Report: Single Player Mode - AI Opponent (Laia)

**Review Mode:** Incremental (T-2: Add faceDown boolean input to CardVisual component)
**Source:** docs/specs/single-player/ai-opponent/
**Reviewed against:** spec.md (FR-8.1, FR-8.2, TR-4.1, TR-4.2), design.md (AD-7), Angular Security Guide, OWASP Top 10:2021

## 1. Risk Summary

This incremental review was scoped to task T-2 and validated against current implementation files. The task introduces a face-down rendering path in CardVisual and does not add any dynamic HTML rendering, sanitizer bypass, storage of credentials, route changes, or transport changes. No evidence-based security vulnerabilities were identified in the reviewed scope.

- Total findings: 0 (0 Critical, 0 High, 0 Medium, 0 Low, 0 Info)
- Dependency vulnerabilities: 0 Critical, 0 High
- Most critical risk areas: none identified in scope
- Overall risk level: Low

## 2. Dependency Vulnerabilities

Results of npm audit --json:

| Package | Version | Severity | CVE | Fix Available |
| ------- | ------- | -------- | --- | ------------- |
| None    | N/A     | N/A      | N/A | N/A           |

Total: 0 Critical, 0 High, 0 Medium, 0 Low

npm audit reports no vulnerabilities.

## 3. Security Findings

No evidence-based security findings were identified for T-2.

Reviewed evidence includes CardVisual implementation and template, CardVisual callsites, route guard configuration, environment configuration, build configuration, index-level CSP declaration, and package dependency metadata.

OWASP mapping result for this task scope:

- A01:2021 Broken Access Control: no new issue observed
- A02:2021 Cryptographic Failures: no sensitive data handling introduced
- A03:2021 Injection: no sanitizer bypass, dynamic HTML binding, or dangerous evaluation pattern observed in reviewed scope
- A04:2021 Insecure Design: no new trust-boundary weakness introduced by this task
- A05:2021 Security Misconfiguration: no task-level misconfiguration introduced
- A06:2021 Vulnerable and Outdated Components: no findings from npm audit
- A07:2021 Identification and Authentication Failures: no auth flow changes in task scope
- A08:2021 Software and Data Integrity Failures: no integrity control regression in task scope
- A09:2021 Security Logging and Monitoring Failures: no sensitive logging introduced by this task
- A10:2021 SSRF: no URL construction or request flow introduced by this task

## 4. Authentication & Authorisation Summary

| Protected Route / Resource | Guard               | Token Storage                                   | Session Management                      | Status                      |
| -------------------------- | ------------------- | ----------------------------------------------- | --------------------------------------- | --------------------------- |
| /partida                   | partidaSessionGuard | No token storage pattern observed in task scope | In-memory session signal in GameSession | ✅ Secure in reviewed scope |

## 5. Transport Security Summary

| Control                 | Status        | Notes                                                                            |
| ----------------------- | ------------- | -------------------------------------------------------------------------------- |
| HTTPS enforcement       | ⚠️ Partial    | Not enforceable from this frontend task scope; deployment control required.      |
| Content Security Policy | ✅ Configured | CSP meta policy present in src/index.html; task T-2 does not alter CSP behavior. |
| CORS policy             | ⚠️ Partial    | Backend-controlled and out of scope for this task.                               |
| SameSite cookies        | ⚠️ Partial    | No cookie-based auth in task scope; server policy not observable here.           |
| HSTS                    | ⚠️ Partial    | Server response header control not observable in this repository scope.          |

## 6. Spec Security Compliance

No explicit security-specific NFR entries are defined for this feature in spec.md. Security-relevant checks for this task were validated against FR-8 and TR-4 expectations for face-down rendering behavior.

| NFR | Requirement                                    | Status | Findings |
| --- | ---------------------------------------------- | ------ | -------- |
| N/A | No explicit security NFR defined for T-2 scope | ✅ Met | None     |

## 7. Traceability Matrix

| Finding | Severity | OWASP | Affected Component    | Status |
| ------- | -------- | ----- | --------------------- | ------ |
| None    | N/A      | N/A   | CardVisual task scope | Closed |

## 8. Prioritised Recommendations

### Critical (fix before any deployment)

1. No critical actions required for T-2 scope.

### High (fix before release)

1. No high-priority actions required for T-2 scope.

### Medium (fix in next sprint)

1. Continue to avoid sanitizer bypass and raw HTML rendering patterns as later AI tasks integrate animation and reveal logic.

### Low / Info (monitor and address)

1. Re-run incremental security review when T-3 and T-10 are implemented, because those tasks introduce new CardVisual callsites using the faceDown input and animation state.
