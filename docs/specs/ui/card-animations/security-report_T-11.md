# Security Report: Card Animation System

**Review Mode:** Incremental (T-11: Implement reduced-motion compatibility path)
**Source:** docs/specs/ui/card-animations/
**Reviewed against:** spec.md (TR-6, NFR-2, NFR-3, FR-7), design.md (AD-5), Angular Security Guide, OWASP Top 10:2021

## 1. Risk Summary

This incremental T-11 review covered reduced-motion implementation scope in game-table orchestration, card visual styling, and the two associated unit test files. No Critical or High security issues were identified in the reviewed implementation. Residual risk is driven by one unresolved Medium dependency advisory and one Low client-side logging exposure concern that is not intended for production.

- Total findings: 2 (0 Critical, 0 High, 1 Medium, 1 Low, 0 Info)
- Dependency vulnerabilities: 0 Critical, 0 High, 1 Medium, 0 Low
- Most critical risk areas: dependency hygiene, client-side operational error logging
- Overall risk level: Medium

## 2. Dependency Vulnerabilities

Results of npm audit --json (executed May 22, 2026):

| Package         | Version                     | Severity | CVE                 | Fix Available                                         |
| --------------- | --------------------------- | -------- | ------------------- | ----------------------------------------------------- |
| brace-expansion | 5.0.2 to 5.0.5 (transitive) | Medium   | GHSA-jxxr-4gwj-5jf2 | Yes (upgrade transitive resolution to 5.0.6 or newer) |

Total: 0 Critical, 0 High, 1 Medium, 0 Low

## 3. Security Findings

### SEC-01: Vulnerable transitive dependency in current tree [Medium]

- **OWASP Category:** A06:2021 - Vulnerable and Outdated Components
- **Severity:** Medium
- **Affected:** Dependency graph surfaced through package metadata and npm audit
- **Description:** npm audit reports brace-expansion in a vulnerable transitive range tied to advisory GHSA-jxxr-4gwj-5jf2.
- **Risk:** Retaining known vulnerable package versions weakens supply-chain posture and can expose the application ecosystem to denial-of-service risk if vulnerable behavior is reachable in tooling or runtime paths.
- **Expected Practice:** Dependency governance should continuously enforce fixed versions for known advisories and block unresolved Medium-or-higher vulnerabilities before release.
- **Recommendation:** Update dependency resolution so vulnerable brace-expansion versions are no longer installed, then re-run dependency audit checks and keep CI policy gates for Medium-or-higher advisories.
- **References:** https://owasp.org/Top10/A06_2021-Vulnerable_and_Outdated_Components/, https://github.com/advisories/GHSA-jxxr-4gwj-5jf2, https://angular.dev/best-practices/security
- **Spec Traceability:** NFR-6, US-14

### SEC-02: Client-side AI orchestration warning logs operational detail [Low]

- **OWASP Category:** A09:2021 - Security Logging and Monitoring Failures
- **Severity:** Low
- **Affected:** src/app/features/game-board/game-table-page/game-table-page.ts
- **Description:** The AI turn error catch path emits a browser console warning with operational context such as AI player identifier context, turn phase, difficulty, and error classification metadata.
- **Risk:** In shared endpoints, captured browser logs, or support telemetry pipelines, this detail can provide unnecessary internal behavior visibility useful for misuse analysis.
- **Expected Practice:** Production client logging should be minimal, non-sensitive, and aligned to a redaction policy that avoids exposing operational internals.
- **Recommendation:** Remove or minimize production client-side diagnostic detail in this warning path, and move deeper troubleshooting context to controlled observability channels with access controls.
- **References:** https://owasp.org/Top10/A09_2021-Security_Logging_and_Monitoring_Failures/, https://angular.dev/best-practices/security
- **Spec Traceability:** NFR-2, NFR-3, US-14

## 4. Authentication & Authorisation Summary

| Protected Route / Resource         | Guard                                 | Token Storage                           | Session Management                                      | Status                   |
| ---------------------------------- | ------------------------------------- | --------------------------------------- | ------------------------------------------------------- | ------------------------ |
| partida route                      | Yes, canMatch via partidaSessionGuard | No token storage in reviewed T-11 scope | Route entry remains session-gated                       | Secure in reviewed scope |
| T-11 reduced-motion animation path | Not an authentication boundary        | No auth token handling observed         | Flow constrained by turn-phase and active-player checks | Secure in reviewed scope |

## 5. Transport Security Summary

| Control                 | Status                           | Notes                                                                                            |
| ----------------------- | -------------------------------- | ------------------------------------------------------------------------------------------------ |
| HTTPS enforcement       | Partial                          | No non-TLS endpoint usage introduced in reviewed T-11 files; enforcement remains server-side     |
| Content Security Policy | Configured                       | Entry document defines restrictive self-origin CSP with object-src none and frame-ancestors none |
| CORS policy             | Not verifiable in frontend scope | Backend CORS configuration is outside this repository                                            |
| SameSite cookies        | Not applicable in reviewed scope | No cookie-based auth/session handling observed in reviewed files                                 |
| HSTS                    | Not verifiable in frontend scope | HSTS is server response-header configuration                                                     |
| Referrer Policy         | Missing evidence                 | No explicit referrer-policy directive identified in frontend entry document                      |

## 6. Spec Security Compliance

| NFR   | Requirement                                                               | Status  | Findings       |
| ----- | ------------------------------------------------------------------------- | ------- | -------------- |
| NFR-2 | Keyboard navigation and focus behavior remain stable under animation load | Met     | None           |
| NFR-3 | Reduced-motion preference is respected while preserving logical outcomes  | Met     | None           |
| NFR-6 | Implementation quality and maintainability remain governed                | Partial | SEC-01, SEC-02 |

## 7. Traceability Matrix

| Finding | Severity | OWASP    | Affected Component                                   | Status |
| ------- | -------- | -------- | ---------------------------------------------------- | ------ |
| SEC-01  | Medium   | A06:2021 | Dependency tree (brace-expansion transitive package) | Open   |
| SEC-02  | Low      | A09:2021 | Game table AI orchestration runtime warning logging  | Open   |

## 8. Prioritised Recommendations

### Critical (fix before any deployment)

1. No Critical findings.

### High (fix before release)

1. No High findings.

### Medium (fix in next sprint)

1. Remove vulnerable brace-expansion versions from the installed dependency tree and enforce dependency audit policy gates in CI.

### Low / Info (monitor and address)

1. Restrict client-side diagnostic logging in production AI orchestration error handling and enforce a frontend log-redaction standard.
