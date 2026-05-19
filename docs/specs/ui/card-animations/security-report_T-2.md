# Security Report: Card Animation System

**Review Mode:** Incremental (T-2: Implement feature-scoped animation orchestrator)
**Source:** docs/specs/ui/card-animations/
**Reviewed against:** spec.md (TR-1, TR-8, NFR-2, NFR-3), design.md (AD-1, AD-2), Angular Security Guide, OWASP Top 10:2021

## 1. Risk Summary

This incremental review assessed the T-2 implementation scope in the orchestrator and its GameTablePage integration points, with supporting review of route guard coverage, environment/config files, template safety, and dependency advisories. No Critical, High, or Medium security findings were identified in scope. One Low-severity logging exposure was confirmed after clarification that the current structured console warning is not intended for production.

- Total findings: 1 (0 Critical, 0 High, 0 Medium, 1 Low, 0 Info)
- Dependency vulnerabilities: 0 Critical, 0 High (from npm audit --json)
- Most critical risk areas: production logging hygiene in AI orchestration error handling
- Overall risk level: Low

## 2. Dependency Vulnerabilities

Results of npm audit:

| Package              | Version | Severity | CVE | Fix Available |
| -------------------- | ------- | -------- | --- | ------------- |
| None (Critical/High) | N/A     | N/A      | N/A | N/A           |

Total: 0 Critical, 0 High, 1 Medium, 0 Low

Additional note: `brace-expansion` (installed range 5.0.2 to 5.0.5, advisory GHSA-jxxr-4gwj-5jf2) is reported as Medium severity and fixable. It was not identified as a direct dependency introduced by T-2 scope.

## 3. Security Findings

### SEC-01: Structured Runtime Metadata Exposed via Console Warning [Low]

- **OWASP Category:** A09:2021 - Security Logging and Monitoring Failures
- **Severity:** Low
- **Affected:** src/app/features/game-board/game-table-page/game-table-page.ts (AI orchestration exception path)
- **Description:** The AI turn exception path emits structured runtime metadata to browser console, including orchestration context fields such as player identifier and turn phase.
- **Risk:** Console-exposed operational data can leak internal behavior to unintended parties on shared or monitored client environments, and can aid reconnaissance for abuse of game-flow timing and state handling.
- **Expected Practice:** Production logging should minimize contextual internals and route diagnostics through controlled monitoring channels with strict data minimization.
- **Recommendation:** Apply environment-aware logging policy so detailed orchestration metadata is excluded from production client console output, while preserving required observability through centralized telemetry controls.
- **References:** https://owasp.org/Top10/A09_2021-Security_Logging_and_Monitoring_Failures/ ; https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html ; https://angular.dev/best-practices/security
- **Spec Traceability:** TR-8, AD-2, US-12

## 4. Authentication & Authorisation Summary

| Protected Route / Resource                        | Guard                       | Token Storage                   | Session Management                                             | Status                   |
| ------------------------------------------------- | --------------------------- | ------------------------------- | -------------------------------------------------------------- | ------------------------ |
| partida route                                     | Yes (`partidaSessionGuard`) | None observed in reviewed scope | In-memory session configuration check via `GameSession` signal | Secure in reviewed scope |
| Game table orchestration interactions (T-2 scope) | Not route-based             | None observed                   | Local signal lifecycle with reset in finally path              | Secure in reviewed scope |

## 5. Transport Security Summary

| Control                 | Status                         | Notes                                                                                    |
| ----------------------- | ------------------------------ | ---------------------------------------------------------------------------------------- |
| HTTPS enforcement       | Partial                        | No frontend-enforced redirect policy found; typically enforced at hosting edge/server    |
| Content Security Policy | Configured                     | CSP is present in src/index.html using restrictive source directives                     |
| CORS policy             | Partial                        | No network request layer in T-2 scope; backend CORS controls are out of repository scope |
| SameSite cookies        | Missing in scope               | No cookie session mechanism observed in reviewed feature paths                           |
| HSTS                    | Missing in repository evidence | HSTS must be configured at deployment/server layer                                       |
| Referrer Policy         | Missing in repository evidence | No explicit Referrer-Policy header evidence in reviewed frontend artifacts               |

## 6. Spec Security Compliance

| NFR   | Requirement                                                                                         | Status                                           | Findings          |
| ----- | --------------------------------------------------------------------------------------------------- | ------------------------------------------------ | ----------------- |
| NFR-2 | Animations must not interfere with keyboard navigation, focus management, or accessibility behavior | Met for reviewed T-2 scope                       | None              |
| NFR-3 | Reduced-motion preference must be respected while preserving functionality                          | Partial (full behavior delivered in later tasks) | None in T-2 scope |

## 7. Traceability Matrix

| Finding | Severity | OWASP    | Affected Component                            | Status |
| ------- | -------- | -------- | --------------------------------------------- | ------ |
| SEC-01  | Low      | A09:2021 | GameTablePage AI orchestration error handling | Open   |

## 8. Prioritised Recommendations

### Critical (fix before any deployment)

1. None.

### High (fix before release)

1. None.

### Medium (fix in next sprint)

1. None.

### Low / Info (monitor and address)

1. Implement production-safe client logging controls for AI orchestration failures and remove non-essential runtime context fields from browser console output.
