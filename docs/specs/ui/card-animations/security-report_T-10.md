# Security Report: Card Animation System

**Review Mode:** Incremental (T-10: Align AI flow with completion-driven timing)
**Source:** docs/specs/ui/card-animations/
**Reviewed against:** spec.md (FR-7, FR-8, TR-8, NFR-2, NFR-3), design.md (AD-2, AD-7), Angular Security Guide, OWASP Top 10:2021

## 1. Risk Summary

This incremental review covered the latest T-10 changes in game-table-page orchestration and its companion deal-opponent test file. No Critical or High issues were identified in the reviewed TypeScript flow. The primary residual risk is one unresolved Moderate dependency advisory from npm audit, plus a Low-severity client-side logging exposure concern.

- Total findings: 2 (0 Critical, 0 High, 1 Medium, 1 Low, 0 Info)
- Dependency vulnerabilities: 0 Critical, 0 High, 1 Medium, 0 Low
- Most critical risk areas: dependency hygiene, client-side operational detail exposure in logs
- Overall risk level: Medium

## 2. Dependency Vulnerabilities

Results of npm audit --json (executed May 22, 2026):

| Package         | Version                     | Severity | CVE                 | Fix Available                                                       |
| --------------- | --------------------------- | -------- | ------------------- | ------------------------------------------------------------------- |
| brace-expansion | 5.0.2 to 5.0.5 (transitive) | Medium   | GHSA-jxxr-4gwj-5jf2 | Yes (manual dependency update to 5.0.6 or newer in transitive tree) |

Total: 0 Critical, 0 High, 1 Medium, 0 Low

## 3. Security Findings

### SEC-01: Vulnerable transitive package remains in dependency graph [Medium]

- **OWASP Category:** A06:2021 - Vulnerable and Outdated Components
- **Severity:** Medium
- **Affected:** package dependency graph surfaced through package metadata and npm audit (package.json)
- **Description:** npm audit identifies brace-expansion in a vulnerable transitive range associated with advisory GHSA-jxxr-4gwj-5jf2.
- **Risk:** Known vulnerable component versions degrade supply-chain security posture and may allow denial-of-service behavior where vulnerable input processing is reachable.
- **Expected Practice:** CI and release checks should enforce non-vulnerable dependency trees and block unresolved Medium-or-higher advisories.
- **Recommendation:** Upgrade transitive resolution to a fixed brace-expansion version, re-run npm audit, and keep policy gates that fail builds when Medium-or-higher vulnerabilities are present.
- **References:** https://owasp.org/Top10/A06_2021-Vulnerable_and_Outdated_Components/, https://github.com/advisories/GHSA-jxxr-4gwj-5jf2, https://angular.dev/best-practices/security
- **Spec Traceability:** NFR-6, US-14

### SEC-02: Client-side warning log includes operational AI-turn context [Low]

- **OWASP Category:** A09:2021 - Security Logging and Monitoring Failures
- **Severity:** Low
- **Affected:** src/app/features/game-board/game-table-page/game-table-page.ts
- **Description:** The AI-turn catch path logs orchestration context in the browser console (player identifier context, difficulty, turn phase, and error classification).
- **Risk:** In shared or instrumented environments, operational context in client logs can assist misuse analysis and expose internal behavior details beyond what end users need.
- **Expected Practice:** Client logs should avoid unnecessary operational detail in production and route security-relevant telemetry through controlled monitoring channels.
- **Recommendation:** Minimize client-side operational detail in production logging, retain only non-sensitive generic failure indicators, and document a log-redaction policy for frontend runtime diagnostics.
- **References:** https://owasp.org/Top10/A09_2021-Security_Logging_and_Monitoring_Failures/, https://angular.dev/best-practices/security
- **Spec Traceability:** NFR-2, NFR-6, US-14

## 4. Authentication & Authorisation Summary

| Protected Route / Resource | Guard                                 | Token Storage                                               | Session Management                                             | Status                   |
| -------------------------- | ------------------------------------- | ----------------------------------------------------------- | -------------------------------------------------------------- | ------------------------ |
| /partida route             | Yes, canMatch via partidaSessionGuard | No token-based auth storage observed in T-10 reviewed files | Route entry requires active session configuration              | Secure in reviewed scope |
| AI turn orchestration flow | Not an authentication boundary        | No auth tokens handled in reviewed T-10 files               | Turn progression constrained by active-player and phase checks | Secure in reviewed scope |

## 5. Transport Security Summary

| Control                 | Status                           | Notes                                                                                                                                  |
| ----------------------- | -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| HTTPS enforcement       | Partial                          | No non-TLS API endpoints were introduced in reviewed T-10 files; server-side TLS enforcement remains outside frontend repository scope |
| Content Security Policy | Configured                       | src/index.html defines restrictive self-origin CSP with object-src none and frame-ancestors none                                       |
| CORS policy             | Not verifiable in frontend scope | Backend CORS configuration is not represented in this repository                                                                       |
| SameSite cookies        | Not applicable in reviewed scope | No cookie-based authentication/session handling observed in reviewed files                                                             |
| HSTS                    | Not verifiable in frontend scope | HSTS is a server response-header control not configured in this frontend project                                                       |
| Referrer Policy         | Missing evidence                 | No explicit referrer-policy configuration identified in reviewed frontend entry files                                                  |

## 6. Spec Security Compliance

| NFR   | Requirement                                                               | Status  | Findings       |
| ----- | ------------------------------------------------------------------------- | ------- | -------------- |
| NFR-2 | Keyboard navigation and focus behavior remain stable under animation load | Met     | None           |
| NFR-3 | Reduced-motion preference is respected without changing logic outcomes    | Met     | None           |
| NFR-6 | Maintainable and well-governed implementation quality                     | Partial | SEC-01, SEC-02 |

## 7. Traceability Matrix

| Finding | Severity | OWASP    | Affected Component                                   | Status |
| ------- | -------- | -------- | ---------------------------------------------------- | ------ |
| SEC-01  | Medium   | A06:2021 | Dependency tree (brace-expansion transitive package) | Open   |
| SEC-02  | Low      | A09:2021 | Game table AI orchestration error logging            | Open   |

## 8. Prioritised Recommendations

### Critical (fix before any deployment)

1. No Critical findings.

### High (fix before release)

1. No High findings.

### Medium (fix in next sprint)

1. Resolve GHSA-jxxr-4gwj-5jf2 by upgrading transitive brace-expansion to a fixed version and enforce audit gates in CI.

### Low / Info (monitor and address)

1. Reduce client-side operational detail in production logging paths and maintain a frontend logging redaction guideline.
