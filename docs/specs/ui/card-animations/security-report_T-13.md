# Security Report: Card Animation System

**Review Mode:** Incremental (T-13: Verify accessibility behavior under animation load)
**Source:** docs/specs/ui/card-animations/
**Reviewed against:** spec.md (NFR-2, NFR-3), design.md (AD-5), Angular Security Guide, OWASP Top 10:2021

## 1. Risk Summary

This incremental T-13 GREEN-phase security review covered the scoped implementation files for active hand, center table, and game table orchestration. The review focused on OWASP Top 10 violations, Angular-specific client-side risks, and Critical/High blocker conditions. No Critical or High blockers were identified in the scoped files. One Medium supply-chain finding remains from dependency audit output, and one Informational logging hygiene observation was identified.

- Total findings: 2 (0 Critical, 0 High, 1 Medium, 0 Low, 1 Info)
- Dependency vulnerabilities: 0 Critical, 0 High, 4 Moderate, 0 Low
- Most critical risk areas: vulnerable and outdated components in dev tooling; security logging hygiene
- Overall risk level: Medium

## 2. Dependency Vulnerabilities

Results of npm audit --json (executed May 25, 2026):

| Package              | Version | Severity | CVE | Fix Available |
| -------------------- | ------- | -------- | --- | ------------- |
| None (Critical/High) | N/A     | N/A      | N/A | N/A           |

Additional Moderate advisories observed:

| Package          | Version                         | Severity | CVE                                           | Fix Available                              |
| ---------------- | ------------------------------- | -------- | --------------------------------------------- | ------------------------------------------ |
| brace-expansion  | 5.0.2 to 5.0.5 (transitive)     | Moderate | GHSA-jxxr-4gwj-5jf2                           | Yes                                        |
| qs               | 6.11.1 to 6.15.1 (transitive)   | Moderate | GHSA-q8mj-m7cp-5q26                           | Via Cypress dependency update path         |
| @cypress/request | >=3.0.3 (transitive)            | Moderate | npm audit advisory chain via qs               | Via Cypress dependency update path         |
| cypress          | 15.14.1 (direct dev dependency) | Moderate | npm audit advisory chain via @cypress/request | npm audit reports a major-version fix path |

Total: 0 Critical, 0 High, 4 Moderate, 0 Low

## 3. Security Findings

### SEC-01: Moderate vulnerable components in dependency chain [Medium]

- **OWASP Category:** A06:2021 - Vulnerable and Outdated Components
- **Severity:** Medium
- **Affected:** package.json dependency graph (Cypress and transitive packages)
- **Description:** npm audit reports Moderate vulnerabilities in Cypress-related packages present in the repository dependency graph.
- **Risk:** While no Critical or High CVEs were reported, unresolved Moderate advisories in tooling increase software supply-chain risk and may affect CI or developer workstation trust boundaries.
- **Expected Practice:** Security advisories should be remediated within defined maintenance windows or formally risk-accepted with documented review cadence.
- **Recommendation:** Plan dependency maintenance for Cypress and related transitives, then re-run npm audit and document residual risk acceptance if major-version constraints block immediate remediation.
- **References:** https://owasp.org/Top10/A06_2021-Vulnerable_and_Outdated_Components/, https://github.com/advisories/GHSA-jxxr-4gwj-5jf2, https://github.com/advisories/GHSA-q8mj-m7cp-5q26
- **Spec Traceability:** NFR-6, US-14

### SEC-02: Runtime warning metadata should avoid future sensitive data drift [Info]

- **OWASP Category:** A09:2021 - Security Logging and Monitoring Failures
- **Severity:** Info
- **Affected:** GameTablePage runtime orchestration logging path
- **Description:** The scoped game table orchestration includes runtime warning logging for AI turn failures with contextual metadata. Current observed fields are low sensitivity, but the pattern can drift over time and accidentally include sensitive payloads if logging grows.
- **Risk:** If future changes add state snapshots, player identifiers beyond current minimal context, or transport payload details, client-side logs can expose internal information in shared devices, browser diagnostics, or captured telemetry.
- **Expected Practice:** Client-side logs should follow a strict allow-list policy for fields and avoid recording secrets, tokens, personal data, or full state objects.
- **Recommendation:** Keep warning telemetry minimal, document approved log fields, and periodically review client logging against OWASP logging guidance.
- **References:** https://owasp.org/Top10/A09_2021-Security_Logging_and_Monitoring_Failures/, https://angular.dev/best-practices/security
- **Spec Traceability:** NFR-2, NFR-3, US-14

## 4. Authentication & Authorisation Summary

| Protected Route / Resource                     | Guard                        | Token Storage                 | Session Management                                          | Status             |
| ---------------------------------------------- | ---------------------------- | ----------------------------- | ----------------------------------------------------------- | ------------------ |
| partida route                                  | ✅ Yes (partidaSessionGuard) | None observed in scoped files | Session existence gate is applied before route match        | ✅ Secure in scope |
| Active hand and center table interaction paths | Not an auth boundary         | None observed in scoped files | Interaction gating present for animation and handoff states | ✅ Secure in scope |

## 5. Transport Security Summary

| Control                 | Status     | Notes                                                             |
| ----------------------- | ---------- | ----------------------------------------------------------------- |
| HTTPS enforcement       | ⚠️ Partial | No transport policy controls changed in scoped T-13 files         |
| Content Security Policy | ⚠️ Partial | No CSP controls are defined in scoped implementation files        |
| CORS policy             | ⚠️ Partial | Backend CORS policy is outside scoped frontend file ownership     |
| SameSite cookies        | ⚠️ Partial | No cookie-based session controls in scoped files                  |
| HSTS                    | ⚠️ Partial | Server header controls are outside scoped frontend implementation |

## 6. Spec Security Compliance

| NFR   | Requirement                                                           | Status                          | Findings |
| ----- | --------------------------------------------------------------------- | ------------------------------- | -------- |
| NFR-2 | Keyboard navigation and focus remain unaffected by animation behavior | ✅ Met in scoped implementation | None     |
| NFR-3 | Reduced-motion preference is respected                                | ✅ Met in scoped implementation | None     |
| NFR-6 | Maintainability and documented reliability posture                    | ⚠️ Partial                      | SEC-01   |

## 7. Traceability Matrix

| Finding | Severity | OWASP    | Affected Component                          | Status |
| ------- | -------- | -------- | ------------------------------------------- | ------ |
| SEC-01  | Medium   | A06:2021 | Dependency graph (Cypress transitives)      | Open   |
| SEC-02  | Info     | A09:2021 | GameTablePage orchestration logging pattern | Open   |

## 8. Prioritised Recommendations

### Critical (fix before any deployment)

1. No Critical findings.

### High (fix before release)

1. No High findings.

### Medium (fix in next sprint)

1. Remediate or formally risk-accept Moderate npm audit advisories in Cypress and related transitive dependencies, then re-verify with npm audit.

### Low / Info (monitor and address)

1. Enforce a client logging allow-list and periodic review to prevent sensitive data exposure through future log expansion.
