# Security Report: Laia Hand Capture Animation Bleed

**Review Mode:** Incremental (T-5: Add integration coverage for zone-level rendering contract)
**Source:** docs/specs/ui/laia-hand-capture-animation-bleed/
**Reviewed against:** spec.md (NFR-1.1, NFR-1.2, NFR-1.3, NFR-1.4), design.md (AD-2, AD-4), Angular Security Guide, OWASP Top 10:2021

## 1. Risk Summary

Incremental review of the GREEN implementation for T-5 found no new exploitable application-level vulnerabilities in the updated OpponentZones component or its associated integration tests. The change that treats capture-previewing with no-op metadata as static reduces visual trust risk and enforces intended isolation behavior. The only open security concern remains moderate dependency advisories in the test toolchain.

- Total findings: 1 (0 Critical, 0 High, 1 Medium, 0 Low, 0 Info)
- Dependency vulnerabilities: 0 Critical, 0 High, 4 Moderate (from npm audit --json)
- Most critical risk areas: vulnerable and outdated development test components
- Overall risk level: Medium
- Blocker status: No blocker for T-5 implementation release in scoped application code

## 2. Dependency Vulnerabilities

Results of npm audit --json:

| Package          | Version                             | Severity | CVE                                  | Fix Available                           |
| ---------------- | ----------------------------------- | -------- | ------------------------------------ | --------------------------------------- |
| brace-expansion  | 5.0.2 to 5.0.5                      | Moderate | Not assigned (GHSA-jxxr-4gwj-5jf2)   | Yes                                     |
| qs               | 6.11.1 to 6.15.1                    | Moderate | Not assigned (GHSA-q8mj-m7cp-5q26)   | Yes                                     |
| @cypress/request | 3.0.3 and above                     | Moderate | Inherited from qs advisory chain     | Yes (via Cypress update path)           |
| cypress          | 13.15.0 and above in advisory graph | Moderate | Inherited via @cypress/request chain | Yes (manual version alignment required) |

Total: 0 Critical, 0 High, 4 Moderate, 0 Low

## 3. Security Findings

### SEC-01: Moderate Vulnerabilities in Cypress Dependency Chain [Medium]

- **OWASP Category:** A06:2021 - Vulnerable and Outdated Components
- **Severity:** Medium
- **Affected:** package.json development dependency graph and transitive test tooling modules
- **Description:** npm audit reports four moderate advisories in Cypress-related dependencies. No high or critical advisories were reported.
- **Risk:** Exposure is mainly in development and CI environments, but unresolved vulnerable tooling increases supply-chain and pipeline risk.
- **Expected Practice:** Maintain patched direct and transitive dependencies in development tooling and re-validate advisories after each upgrade cycle.
- **Recommendation:** Plan and execute a controlled update of Cypress and related transitive modules, then re-run dependency audit validation and document closure.
- **References:** https://owasp.org/Top10/A06_2021-Vulnerable_and_Outdated_Components/ , https://angular.dev/best-practices/security , https://github.com/advisories/GHSA-jxxr-4gwj-5jf2 , https://github.com/advisories/GHSA-q8mj-m7cp-5q26
- **Spec Traceability:** NFR-1.2, NFR-1.4, AD-4

## 4. Authentication & Authorisation Summary

| Protected Route / Resource    | Guard                          | Token Storage                                | Session Management                       | Status                   |
| ----------------------------- | ------------------------------ | -------------------------------------------- | ---------------------------------------- | ------------------------ |
| partida route                 | Yes (partida session guard)    | No token storage observed in this task scope | Session gate present through route guard | Secure in reviewed scope |
| OpponentZones component scope | Not an authentication boundary | Not applicable                               | Not applicable                           | No finding               |

## 5. Transport Security Summary

| Control                 | Status                           | Notes                                                                                                       |
| ----------------------- | -------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| HTTPS enforcement       | Partial                          | No hardcoded insecure endpoint was observed in reviewed T-5 files; full enforcement remains deployment-side |
| Content Security Policy | Configured                       | CSP meta policy is present in index document and restricts scripts, styles, objects, and framing            |
| CORS policy             | Not verifiable in frontend scope | Backend response header policy is outside reviewed files                                                    |
| SameSite cookies        | Not applicable in reviewed scope | No cookie-based authentication/session pattern observed in T-5 changed files                                |
| HSTS                    | Not verifiable in frontend scope | Server transport header policy is outside reviewed files                                                    |

## 6. Spec Security Compliance

| NFR     | Requirement                  | Status  | Findings |
| ------- | ---------------------------- | ------- | -------- |
| NFR-1.1 | Visual correctness and trust | Met     | None     |
| NFR-1.2 | Consistency                  | Partial | SEC-01   |
| NFR-1.3 | Accessibility stability      | Met     | None     |
| NFR-1.4 | Performance neutrality       | Partial | SEC-01   |

## 7. Traceability Matrix

| Finding | Severity | OWASP    | Affected Component           | Status |
| ------- | -------- | -------- | ---------------------------- | ------ |
| SEC-01  | Medium   | A06:2021 | Development dependency chain | Open   |

## 8. Prioritised Recommendations

### Critical (fix before any deployment)

1. No critical findings in this incremental review.

### High (fix before release)

1. No high findings in this incremental review.

### Medium (fix in next sprint)

1. Triage and remediate moderate npm audit advisories in Cypress dependency paths, then re-run audit validation.

### Low / Info (monitor and address)

1. Continue incremental security review for remaining tasks to detect newly introduced injection, credential, authentication, or transport regressions.
