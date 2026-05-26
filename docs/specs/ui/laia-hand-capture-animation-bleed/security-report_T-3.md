# Security Report: Laia Hand Capture Animation Bleed

**Review Mode:** Incremental (T-3: Preserve opponent-turn explicit animation eligibility)
**Source:** docs/specs/ui/laia-hand-capture-animation-bleed/
**Reviewed against:** spec.md (NFR-1.1, NFR-1.2, NFR-1.3, NFR-1.4), design.md (AD-1, AD-2, AD-3, AD-4), Angular Security Guide, OWASP Top 10:2021

## 1. Risk Summary

This incremental re-review covered the changed implementation and test files for T-3 after adding the phase-exit unit test and found no exploitable security defects in scope. Opponent-turn eligibility controls remain constrained to explicit AI phase context, and the reviewed logic plus the new phase-exit assertion does not introduce unsafe injection sinks, credential exposure, or access-control regressions.

- Total findings: 2 (0 Critical, 0 High, 0 Medium, 0 Low, 2 Info)
- Dependency vulnerabilities: 0 Critical, 0 High (from npm audit)
- Most critical risk areas: development dependency hygiene, long-term safety around direct DOM access patterns
- Overall risk level: Low
- Blocker status: No security blocker for T-3 implementation (Green).

## 2. Dependency Vulnerabilities

Results of npm audit:

| Package          | Version                                          | Severity | CVE                                 | Fix Available                              |
| ---------------- | ------------------------------------------------ | -------- | ----------------------------------- | ------------------------------------------ |
| brace-expansion  | 5.0.2 - 5.0.5                                    | Moderate | GHSA-jxxr-4gwj-5jf2                 | Yes                                        |
| qs               | 6.11.1 - 6.15.1                                  | Moderate | GHSA-q8mj-m7cp-5q26                 | Yes (via Cypress dependency path)          |
| @cypress/request | >=3.0.3                                          | Moderate | Inherited via qs advisory chain     | Yes (via Cypress upgrade path)             |
| cypress          | >=13.15.0 affected range reported by audit graph | Moderate | Inherited via @cypress/request path | Yes (audit reports versioned upgrade path) |

Total: 0 Critical, 0 High, 4 Moderate, 0 Low

## 3. Security Findings

### SEC-01: Development dependency advisories in Cypress-related chain [Info]

- **OWASP Category:** A06:2021 - Vulnerable and Outdated Components
- **Severity:** Info
- **Affected:** package dependency graph (Cypress-related advisory path)
- **Description:** npm audit reports moderate vulnerabilities in transient packages used by the end-to-end testing toolchain, including advisories affecting brace-expansion and qs.
- **Risk:** Current findings are in development tooling and are not high-impact production vulnerabilities in this feature scope, but they increase supply-chain and maintenance risk if left unresolved.
- **Expected Practice:** Track and remediate known dependency advisories for both production and development package trees.
- **Recommendation:** Plan controlled upgrades for Cypress and transient dependencies in the next maintenance cycle, then re-run audit to verify advisory closure.
- **References:** https://owasp.org/Top10/A06_2021-Vulnerable_and_Outdated_Components/ ; https://github.com/advisories/GHSA-jxxr-4gwj-5jf2 ; https://github.com/advisories/GHSA-q8mj-m7cp-5q26
- **Spec Traceability:** NFR-1.2, NFR-1.4

### SEC-02: Direct DOM query and mutation usage requires continued hardening discipline [Info]

- **OWASP Category:** A03:2021 - Injection
- **Severity:** Info
- **Affected:** src/app/features/game-board/game-table-page/game-table-page.ts
- **Description:** The component performs direct document querying for focus and live-region updates. In the reviewed implementation, writes are limited to textContent and fixed selector patterns, with no unsafe HTML sink usage observed.
- **Risk:** No immediate exploit path was identified in T-3 scope. The pattern remains noteworthy because future changes could become unsafe if untrusted data is ever routed into HTML or URL sinks.
- **Expected Practice:** Keep direct DOM writes constrained to safe text-only operations and avoid introducing untrusted content into DOM sink APIs.
- **Recommendation:** Retain current safe text-only behavior and include this area in future security regression checks whenever accessibility announcement logic is modified.
- **References:** https://owasp.org/Top10/A03_2021-Injection/ ; https://angular.dev/best-practices/security
- **Spec Traceability:** NFR-1.1, NFR-1.3

## 4. Authentication & Authorisation Summary

| Protected Route / Resource              | Guard                    | Token Storage                 | Session Management            | Status                                                    |
| --------------------------------------- | ------------------------ | ----------------------------- | ----------------------------- | --------------------------------------------------------- |
| Game table rendering logic in T-3 scope | Not changed in this task | Not handled in reviewed files | Not handled in reviewed files | No new authentication or authorisation concern introduced |

## 5. Transport Security Summary

| Control                 | Status                                 | Notes                                                       |
| ----------------------- | -------------------------------------- | ----------------------------------------------------------- |
| HTTPS enforcement       | Not assessed in this incremental scope | No transport configuration changes in reviewed files        |
| Content Security Policy | Not assessed in this incremental scope | No header policy changes in reviewed files                  |
| CORS policy             | Not assessed in this incremental scope | No HTTP origin policy changes in reviewed files             |
| SameSite cookies        | Not assessed in this incremental scope | No cookie handling changes in reviewed files                |
| HSTS                    | Not assessed in this incremental scope | No server transport configuration changes in reviewed files |

## 6. Spec Security Compliance

| NFR     | Requirement                                       | Status | Findings                         |
| ------- | ------------------------------------------------- | ------ | -------------------------------- |
| NFR-1.1 | Visual correctness and trust                      | Met    | SEC-02 (monitoring-only note)    |
| NFR-1.2 | Consistency across reproducible capture scenarios | Met    | SEC-01 (dependency hygiene note) |
| NFR-1.3 | Accessibility stability                           | Met    | SEC-02 (monitoring-only note)    |
| NFR-1.4 | Performance neutrality                            | Met    | SEC-01 (dependency hygiene note) |

## 7. Traceability Matrix

| Finding | Severity | OWASP    | Affected Component              | Status |
| ------- | -------- | -------- | ------------------------------- | ------ |
| SEC-01  | Info     | A06:2021 | Dependency graph (Cypress path) | Open   |
| SEC-02  | Info     | A03:2021 | GameTablePage                   | Open   |

## 8. Prioritised Recommendations

### Critical (fix before any deployment)

1. No critical findings in this T-3 incremental review.

### High (fix before release)

1. No high-severity findings in this T-3 incremental review.

### Medium (fix in next sprint)

1. No medium-severity findings in this T-3 incremental review.

### Low / Info (monitor and address)

1. Schedule dependency maintenance for the Cypress advisory chain and re-run npm audit for closure evidence.
2. Preserve text-only DOM update patterns in live-region and focus helpers and re-validate if that logic changes.
