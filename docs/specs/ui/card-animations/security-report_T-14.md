# Security Report: Card Animation System

**Review Mode:** Incremental (T-14: Tune performance and responsive path behavior)
**Source:** docs/specs/ui/card-animations/
**Reviewed against:** spec.md (TR-5, TR-7, NFR-1, NFR-2, NFR-3, NFR-4), design.md (AD-4, AD-5), Angular Security Guide, OWASP Top 10:2021

## 1. Risk Summary

This incremental GREEN review assessed the scoped files src/app/features/game-board/game-table-page/components/card-visual/card-visual.scss and cypress/e2e/game-table.ts for OWASP relevance, Angular-specific risk, fixture-isolation safety, and blocker severity. No Critical or High findings were identified. The previously observed fixture-isolation concern is now mitigated by unconditional teardown in the Cypress afterEach path. Remaining risk is limited to Moderate dependency advisories in test tooling and is tracked as Low priority for this task scope. Total findings: 1 (0 Critical, 0 High, 0 Medium, 1 Low, 0 Info). Dependency vulnerabilities: 0 Critical, 0 High, 4 Moderate. Most critical risk area: outdated test dependency chain. Overall risk level: Low.

## 2. Dependency Vulnerabilities

Results of npm audit --json:

| Package | Version        | Severity                   | CVE            | Fix Available  |
| ------- | -------------- | -------------------------- | -------------- | -------------- |
| None    | Not applicable | Critical/High not detected | Not applicable | Not applicable |

Total: 0 Critical, 0 High, 4 Moderate, 0 Low

Additional Moderate advisories observed:

- brace-expansion (GHSA-jxxr-4gwj-5jf2)
- qs (GHSA-q8mj-m7cp-5q26)
- Transitive impact through @cypress/request and cypress

## 3. Security Findings

### SEC-01: Moderate vulnerabilities in Cypress dependency chain [Low]

- **OWASP Category:** A06:2021 — Vulnerable and Outdated Components
- **Severity:** Low
- **Affected:** package.json dependency chain (cypress and transitive packages)
- **Description:** npm audit --json reports four Moderate vulnerabilities in the test-tooling dependency graph, including brace-expansion and qs advisories that flow through Cypress-related packages.
- **Risk:** No direct Critical/High blocker exists for this incremental scope, but unresolved vulnerable components increase long-term supply-chain and maintenance risk.
- **Expected Practice:** Keep test and build dependencies current and close known advisories through managed upgrades.
- **Recommendation:** Schedule a controlled Cypress upgrade path, then re-run npm audit validation and document residual risk acceptance only where an upgrade is temporarily constrained.
- **References:** https://owasp.org/Top10/A06_2021-Vulnerable_and_Outdated_Components/ ; https://github.com/advisories/GHSA-jxxr-4gwj-5jf2 ; https://github.com/advisories/GHSA-q8mj-m7cp-5q26
- **Spec Traceability:** NFR-6, US-14

Scoped evidence notes for fixture isolation safety:

- cypress/e2e/game-table.ts uses afterEach restoration for HTMLElement prototype overrides, which provides unconditional cleanup and mitigates cross-test contamination risk.
- src/main.ts gates test API exposure behind dev mode and Cypress presence checks, and unsupported fixture names fail closed.

## 4. Authentication & Authorisation Summary

| Protected Route / Resource | Guard                        | Token Storage                | Session Management                 | Status                                   |
| -------------------------- | ---------------------------- | ---------------------------- | ---------------------------------- | ---------------------------------------- |
| /partida route             | ✅ Yes (partidaSessionGuard) | Not introduced in T-14 scope | Session configuration gate present | ✅ Secure for scoped changes             |
| Scoped files in T-14       | Not applicable               | Not applicable               | Not applicable                     | ✅ No access-control regression observed |

## 5. Transport Security Summary

| Control                 | Status        | Notes                                                  |
| ----------------------- | ------------- | ------------------------------------------------------ |
| HTTPS enforcement       | ⚠️ Partial    | Not fully verifiable from scoped frontend files alone  |
| Content Security Policy | ✅ Configured | Restrictive CSP meta policy present in src/index.html  |
| CORS policy             | ⚠️ Partial    | Backend CORS policy is outside reviewed frontend scope |
| SameSite cookies        | ⚠️ Partial    | Cookie policy not established in scoped files          |
| HSTS                    | ⚠️ Partial    | Server header configuration outside frontend scope     |

## 6. Spec Security Compliance

| NFR   | Requirement                                                | Status                                 | Findings |
| ----- | ---------------------------------------------------------- | -------------------------------------- | -------- |
| NFR-1 | Performance target envelope with stable rendering behavior | ✅ Met in scoped implementation review | None     |
| NFR-2 | Keyboard navigation unaffected by animation                | ✅ Met in scoped implementation review | None     |
| NFR-3 | Reduced-motion behavior preserved                          | ✅ Met in scoped implementation review | None     |
| NFR-4 | Responsive compatibility without critical regressions      | ✅ Met in scoped implementation review | None     |

## 7. Traceability Matrix

| Finding | Severity | OWASP    | Affected Component            | Status |
| ------- | -------- | -------- | ----------------------------- | ------ |
| SEC-01  | Low      | A06:2021 | package.json dependency chain | Open   |

## 8. Prioritised Recommendations

### Critical (fix before any deployment)

1. None identified.

### High (fix before release)

1. None identified.

### Medium (fix in next sprint)

1. None identified.

### Low / Info (monitor and address)

1. Close Moderate Cypress-chain advisories through planned dependency updates and verify with a follow-up npm audit report. Reference: https://owasp.org/Top10/A06_2021-Vulnerable_and_Outdated_Components/
