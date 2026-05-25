# Security Report: Card Animation System

**Review Mode:** Incremental (T-12: Add resilience for cancellation and completion gaps)
**Source:** docs/specs/ui/card-animations/
**Reviewed against:** spec.md (TR-8, NFR-2, NFR-3), design.md (AD-2), Angular Security Guide, OWASP Top 10:2021

## 1. Risk Summary

This incremental T-12 GREEN security review covered the requested implementation and test scope: card-animation-orchestrator.ts, game-table-page.ts, card-animation-orchestrator.spec.ts, and game-table-page.deal-opponent.spec.ts. No Critical or High security findings were identified in the scoped change set. The main residual risk remains Moderate dependency advisories in dev and test tooling.

- Total findings: 2 (0 Critical, 0 High, 1 Medium, 0 Low, 1 Info)
- Dependency vulnerabilities: 0 Critical, 0 High, 4 Moderate, 0 Low
- Most critical risk areas: vulnerable and outdated test-tooling components, diagnostic logging hygiene
- Overall risk level: Medium

## 2. Dependency Vulnerabilities

Results of npm audit --json (executed May 25, 2026):

| Package              | Version | Severity | CVE | Fix Available |
| -------------------- | ------- | -------- | --- | ------------- |
| None (Critical/High) | N/A     | N/A      | N/A | N/A           |

Additional Moderate advisories observed:

| Package          | Version                         | Severity | CVE                                                    | Fix Available                              |
| ---------------- | ------------------------------- | -------- | ------------------------------------------------------ | ------------------------------------------ |
| brace-expansion  | 5.0.2 to 5.0.5 (transitive)     | Moderate | GHSA-jxxr-4gwj-5jf2                                    | Yes                                        |
| qs               | 6.11.1 to 6.15.1 (transitive)   | Moderate | GHSA-q8mj-m7cp-5q26                                    | Via Cypress dependency update path         |
| @cypress/request | >=3.0.3 (transitive)            | Moderate | Listed by npm audit via qs advisory path               | Via Cypress dependency update path         |
| cypress          | 15.14.1 (direct dev dependency) | Moderate | Listed by npm audit via @cypress/request advisory path | npm audit reports a major-version fix path |

Total: 0 Critical, 0 High, 4 Moderate, 0 Low

## 3. Security Findings

### SEC-01: Moderate vulnerable components in test dependency chain [Medium]

- **OWASP Category:** A06:2021 - Vulnerable and Outdated Components
- **Severity:** Medium
- **Affected:** package.json dependency graph (Cypress and transitive packages)
- **Description:** npm audit reports Moderate vulnerabilities in transitive dependencies used by Cypress-based test tooling.
- **Risk:** This does not create an identified Critical or High production exploit path in the scoped T-12 runtime files, but unresolved vulnerable tooling increases software supply-chain exposure and can affect build and test infrastructure trust.
- **Expected Practice:** Known dependency advisories should be remediated or explicitly risk-accepted with review traceability.
- **Recommendation:** Schedule dependency maintenance for Cypress and affected transitives, then re-run npm audit and track remaining advisories as accepted residual risk if unavoidable.
- **References:** https://owasp.org/Top10/A06_2021-Vulnerable_and_Outdated_Components/, https://github.com/advisories/GHSA-jxxr-4gwj-5jf2, https://github.com/advisories/GHSA-q8mj-m7cp-5q26, https://angular.dev/best-practices/security
- **Spec Traceability:** NFR-6, US-14

### SEC-02: Runtime diagnostic warning includes operational metadata [Info]

- **OWASP Category:** A09:2021 - Security Logging and Monitoring Failures
- **Severity:** Info
- **Affected:** src/app/features/game-board/game-table-page/game-table-page.ts (AI orchestration error path)
- **Description:** The AI failure handler logs operational metadata (AI player id, difficulty, turn phase, and error name) through a console warning.
- **Risk:** No credentials, tokens, or personal data were observed in this log payload, so immediate exploitability is low; however, operational metadata in browser logs can increase diagnostic signal for an attacker when combined with another client-side weakness.
- **Expected Practice:** Client logging should avoid exposing unnecessary runtime internals and should be minimized in production-facing contexts.
- **Recommendation:** Keep browser diagnostics minimal in production builds and route detailed failure telemetry through controlled monitoring channels with data minimization.
- **References:** https://owasp.org/Top10/A09_2021-Security_Logging_and_Monitoring_Failures/, https://angular.dev/best-practices/security
- **Spec Traceability:** TR-8, US-12

## 4. Authentication & Authorisation Summary

| Protected Route / Resource                   | Guard                        | Token Storage                 | Session Management                                 | Status             |
| -------------------------------------------- | ---------------------------- | ----------------------------- | -------------------------------------------------- | ------------------ |
| partida route used by game-table feature     | ✅ Yes (partidaSessionGuard) | None observed in scoped files | Session presence validated before route activation | ✅ Secure in scope |
| T-12 animation orchestration files and tests | Not applicable               | None observed in scoped files | No auth token or session mutation logic introduced | ✅ Secure in scope |

## 5. Transport Security Summary

| Control                 | Status     | Notes                                                                   |
| ----------------------- | ---------- | ----------------------------------------------------------------------- |
| HTTPS enforcement       | ⚠️ Partial | No transport configuration changes were introduced in scoped T-12 files |
| Content Security Policy | ⚠️ Partial | CSP controls are not modified in scoped files                           |
| CORS policy             | ⚠️ Partial | Backend CORS policy is out of frontend scope                            |
| SameSite cookies        | ⚠️ Partial | Cookie policy is not handled in scoped files                            |
| HSTS                    | ⚠️ Partial | Server-side header controls are out of scoped file coverage             |

## 6. Spec Security Compliance

| NFR   | Requirement                                                           | Status                                    | Findings |
| ----- | --------------------------------------------------------------------- | ----------------------------------------- | -------- |
| NFR-2 | Keyboard navigation and focus remain unaffected by animation behavior | ✅ Met in scoped implementation and tests | None     |
| NFR-3 | Reduced-motion preference is respected                                | ✅ Met in scoped implementation and tests | None     |
| NFR-6 | Maintainable and reliable implementation and validation approach      | ⚠️ Partial                                | SEC-01   |

## 7. Traceability Matrix

| Finding | Severity | OWASP    | Affected Component                     | Status |
| ------- | -------- | -------- | -------------------------------------- | ------ |
| SEC-01  | Medium   | A06:2021 | Dependency graph (Cypress transitives) | Open   |
| SEC-02  | Info     | A09:2021 | GameTablePage AI error logging path    | Open   |

## 8. Prioritised Recommendations

### Critical (fix before any deployment)

1. No Critical findings.

### High (fix before release)

1. No High findings.

### Medium (fix in next sprint)

1. Remediate or formally risk-accept Moderate npm audit advisories in Cypress and related transitive dependencies, then re-verify with npm audit.

### Low / Info (monitor and address)

1. Keep client-side diagnostic logging minimal and avoid exposing unnecessary operational metadata in production contexts.
