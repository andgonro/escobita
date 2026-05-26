# Security Report: Laia Hand Capture Animation Bleed

**Review Mode:** Incremental (T-1: Confirm stable opponent metadata no-op contract)
**Source:** docs/specs/ui/laia-hand-capture-animation-bleed/
**Reviewed against:** spec.md (NFR-1.1, NFR-1.2, NFR-1.3, NFR-1.4, TR-1.2), design.md (AD-2), Angular Security Guide, OWASP Top 10:2021

## 1. Risk Summary

This incremental post-implementation review is scoped to GameTablePage runtime logic and its unit coverage in T-1. No Critical, High, or Medium exploitable issue was evidenced in the reviewed implementation. The primary risk remains a Low assurance gap in test coupling between metadata no-op assertions and rendered opponent-zone inertness checks in the same scenario. One informational logging observation is also present.

- Total findings: 2 (0 Critical, 0 High, 0 Medium, 1 Low, 1 Info)
- Dependency vulnerabilities: 0 Critical, 0 High (from npm audit --json)
- Most critical risk areas: regression assurance depth for zone isolation; production logging hygiene for orchestration failures
- Overall risk level: Low

## 2. Dependency Vulnerabilities

Results of npm audit --json:

npm audit reports no Critical or High vulnerabilities.

| Package                    | Version        | Severity       | CVE            | Fix Available  |
| -------------------------- | -------------- | -------------- | -------------- | -------------- |
| None (Critical/High scope) | Not applicable | Not applicable | Not applicable | Not applicable |

Total: 0 Critical, 0 High, 4 Moderate, 0 Low.

Moderate advisories observed in the dependency graph during this review:

- GHSA-jxxr-4gwj-5jf2 in brace-expansion
- GHSA-q8mj-m7cp-5q26 in qs
- Advisory chain impact through @cypress/request and cypress (dev tooling path)

## 3. Security Findings

### SEC-01: Metadata-contract tests are not consistently paired with zone-render inertness checks in the same T-1 scenarios [Low]

- **OWASP Category:** A04:2021 - Insecure Design
- **Severity:** Low
- **Affected:** src/app/features/game-board/game-table-page/game-table-page.spec.ts
- **Description:** T-1 tests assert that opponent metadata resolves to an empty collection during human single-card, multi-card, and escoba capture groups. Those tests validate the metadata boundary but do not consistently assert opponent-zone rendered inertness in the same scenario path.
- **Risk:** A downstream rendering regression could potentially pass metadata-only checks while still showing unintended opponent-hand effects, reducing defense-in-depth confidence around visual trust boundaries.
- **Expected Practice:** Security-relevant isolation should be validated at both metadata derivation and rendered consumption points for the same user flow.
- **Recommendation:** Extend the T-1 scenario assertions to pair empty opponent metadata checks with explicit rendered inertness validation in the same single-card, multi-card, and escoba paths.
- **References:** https://owasp.org/Top10/A04_2021-Insecure_Design/ ; https://angular.dev/best-practices/security
- **Spec Traceability:** TR-1.2, NFR-1.1, NFR-1.2, AD-2

### SEC-02: Runtime warning logging contains internal turn-orchestration context in failure path [Info]

- **OWASP Category:** A09:2021 - Security Logging and Monitoring Failures
- **Severity:** Info
- **Affected:** src/app/features/game-board/game-table-page/game-table-page.ts
- **Description:** The AI turn failure path logs orchestration context including player identifier, configured difficulty, and turn phase. No credential or token exposure was observed in the logged fields.
- **Risk:** Current impact is informational, but broad client-side logging patterns can increase telemetry exposure if future fields include sensitive values.
- **Expected Practice:** Keep client-side logs minimal, avoid sensitive fields, and align production logging policy with least disclosure.
- **Recommendation:** Maintain strict redaction and field allow-listing policy for client warning logs, and confirm production observability pipelines do not retain unnecessary user-identifying context.
- **References:** https://owasp.org/Top10/A09_2021-Security_Logging_and_Monitoring_Failures/ ; https://angular.dev/best-practices/security
- **Spec Traceability:** NFR-1.1, NFR-1.2

## 4. Authentication & Authorisation Summary

| Protected Route / Resource               | Guard                          | Token Storage              | Session Management                         | Status                                              |
| ---------------------------------------- | ------------------------------ | -------------------------- | ------------------------------------------ | --------------------------------------------------- |
| GameTablePage metadata flow in T-1 scope | No route/auth changes in scope | No token handling in scope | No session-auth lifecycle changes in scope | No new A01 or A07 concern evidenced in scoped files |

## 5. Transport Security Summary

| Control                 | Status                           | Notes                                                 |
| ----------------------- | -------------------------------- | ----------------------------------------------------- |
| HTTPS enforcement       | Not evaluated in this task scope | No API transport changes in the scoped files          |
| Content Security Policy | Not evaluated in this task scope | No header or deployment policy changes in scope       |
| CORS policy             | Not evaluated in this task scope | Frontend metadata/testing change only                 |
| SameSite cookies        | Not evaluated in this task scope | No cookie handling changes in scoped files            |
| HSTS                    | Not evaluated in this task scope | Server transport settings are outside this task scope |

## 6. Spec Security Compliance

| NFR     | Requirement                  | Status                 | Findings |
| ------- | ---------------------------- | ---------------------- | -------- |
| NFR-1.1 | Visual correctness and trust | Partial                | SEC-01   |
| NFR-1.2 | Consistency                  | Partial                | SEC-01   |
| NFR-1.3 | Accessibility stability      | Met in scoped evidence | None     |
| NFR-1.4 | Performance neutrality       | Met in scoped evidence | None     |

## 7. Traceability Matrix

| Finding | Severity | OWASP    | Affected Component                     | Status |
| ------- | -------- | -------- | -------------------------------------- | ------ |
| SEC-01  | Low      | A04:2021 | GameTablePage unit-test isolation seam | Open   |
| SEC-02  | Info     | A09:2021 | GameTablePage AI failure logging path  | Open   |

## 8. Prioritised Recommendations

### Critical (fix before any deployment)

1. None.

### High (fix before release)

1. None.

### Medium (fix in next sprint)

1. Track remediation planning for the four Moderate npm audit advisories in the Cypress advisory chain.

### Low / Info (monitor and address)

1. Add paired rendered inertness assertions to T-1 metadata no-op tests for all capture variants.
2. Review client-side warning log field policy to keep runtime diagnostics least-disclosure.
