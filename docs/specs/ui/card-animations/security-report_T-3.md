# Security Report: Card Animation System

**Review Mode:** Incremental (T-3: Implement pause policy with runtime test override, GREEN implementation phase)
**Source:** docs/specs/ui/card-animations/
**Reviewed against:** spec.md (FR-7, TR-4, TR-6, NFR-2, NFR-3), design.md (AD-3, AD-5), Angular Security Guide, OWASP Top 10:2021

## 1. Risk Summary

This incremental GREEN-phase review covered the implemented pause-policy service, GameTablePage runtime integration, and related T-3 tests. The implementation does not introduce direct access-control, authentication, credential, or injection surfaces. One informational logging concern was identified in AI-turn error handling. No Critical or High findings were identified.

- Total findings: 1 (0 Critical, 0 High, 0 Medium, 0 Low, 1 Info)
- Dependency vulnerabilities: 0 Critical, 0 High (from npm audit --json)
- Most critical risk areas: Runtime error logging hygiene, transitive dependency hygiene
- Overall risk level: Low

## 2. Dependency Vulnerabilities

Results of npm audit --json:

| Package              | Version | Severity | CVE | Fix Available |
| -------------------- | ------- | -------- | --- | ------------- |
| None (Critical/High) | N/A     | N/A      | N/A | N/A           |

Total: 0 Critical, 0 High, 1 Medium, 0 Low

Additional advisory tracked in this review:

| Package         | Version     | Severity | CVE                 | Fix Available |
| --------------- | ----------- | -------- | ------------------- | ------------- |
| brace-expansion | 5.0.2-5.0.5 | Medium   | GHSA-jxxr-4gwj-5jf2 | Yes           |

## 3. Security Findings

### SEC-01: AI Turn Failure Metadata Logged to Browser Console [Info]

- **OWASP Category:** A09:2021 - Security Logging and Monitoring Failures
- **Severity:** Info
- **Affected:** src/app/features/game-board/game-table-page/game-table-page.ts (runAiTurn catch path)
- **Description:** AI turn orchestration failures are written to the browser console with runtime metadata (player identifier, difficulty, turn phase, and error name).
- **Risk:** In shared-device or support-session contexts, console output can expose internal runtime state to parties who should not have diagnostic visibility. This is not a direct exploit path in current scope but is a logging hygiene concern.
- **Expected Practice:** Production-facing logs should minimize gameplay/session metadata and use controlled telemetry channels with explicit data classification.
- **Recommendation:** Treat browser-console diagnostics as development-only signals, and route operational failure reporting through approved monitoring with redaction and retention controls.
- **References:** https://owasp.org/Top10/A09_2021-Security_Logging_and_Monitoring_Failures/, https://angular.dev/best-practices/security
- **Spec Traceability:** TR-4, TR-6, NFR-2, NFR-3, AD-3, AD-5

## 4. Authentication & Authorisation Summary

| Protected Route / Resource       | Guard                                  | Token Storage                      | Session Management                                     | Status                    |
| -------------------------------- | -------------------------------------- | ---------------------------------- | ------------------------------------------------------ | ------------------------- |
| /partida route                   | Yes (partidaSessionGuard via canMatch) | No auth token storage in T-3 scope | Game session presence gate enforced before route match | Secure for reviewed scope |
| T-3 pause-policy service surface | Not applicable                         | Not applicable                     | Not applicable                                         | No auth concern in scope  |

## 5. Transport Security Summary

| Control                 | Status       | Notes                                                                                   |
| ----------------------- | ------------ | --------------------------------------------------------------------------------------- |
| HTTPS enforcement       | Partial      | Not explicitly enforced in frontend code; typically server/deployment responsibility    |
| Content Security Policy | Configured   | CSP meta policy present in index document with restrictive script and object directives |
| CORS policy             | Not in scope | Backend policy not defined in reviewed frontend files                                   |
| SameSite cookies        | Not in scope | No cookie-based authentication surface in T-3 scope                                     |
| HSTS                    | Not in scope | Server header control outside reviewed frontend implementation                          |

## 6. Spec Security Compliance

| NFR   | Requirement                                                   | Status  | Findings                                                     |
| ----- | ------------------------------------------------------------- | ------- | ------------------------------------------------------------ |
| NFR-2 | Accessibility and keyboard navigation remain unaffected       | Partial | SEC-01 (Info only; no direct keyboard/access-control defect) |
| NFR-3 | Reduced-motion preference is respected with functional parity | Met     | None                                                         |

## 7. Traceability Matrix

| Finding | Severity | OWASP    | Affected Component                       | Status |
| ------- | -------- | -------- | ---------------------------------------- | ------ |
| SEC-01  | Info     | A09:2021 | GameTablePage AI turn error logging path | Open   |

## 8. Prioritised Recommendations

### Critical (fix before any deployment)

1. None.

### High (fix before release)

1. None.

### Medium (fix in next sprint)

1. Address the Medium advisory GHSA-jxxr-4gwj-5jf2 by upgrading affected dependency chain and validating regression impact.

### Low / Info (monitor and address)

1. Reduce production browser-console diagnostic detail for gameplay/session metadata in AI-turn error handling.
