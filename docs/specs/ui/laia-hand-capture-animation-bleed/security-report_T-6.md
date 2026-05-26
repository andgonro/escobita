# Security Report: Laia Hand Capture Animation Bleed

**Review Mode:** Incremental (T-6: Extend end-to-end scenarios from BDD)
**Source:** docs/specs/ui/laia-hand-capture-animation-bleed/
**Reviewed against:** spec.md (NFR-1.1, NFR-1.2, NFR-1.3, NFR-1.4), design.md (AD-1, AD-3, AD-4), Angular Security Guide, OWASP Top 10:2021

## 1. Risk Summary

This RED-phase final security review found no evidence that the scoped Cypress work introduced a new production-runtime exposure. The browser test API is still attached only when both dev mode and Cypress are present, and the GameEngine fixture seam still rejects unsupported fixture names instead of falling back to broader behavior. The security concern in this task is evidence integrity. The suite now has fifteen scenarios total, with two passing and thirteen failing. The duplicate reduced-motion step conflict has been resolved, and no undefined step definitions remain in the scoped feature file. The blocker is that the approved GameEngine seam still does not implement the deterministic human-turn fixtures required by the remaining thirteen scenarios. The reduced-motion scenario also still relies on a summary fixture path rather than the same runtime motion-preference source used by the page under test. npm audit --json reports no Critical or High advisories and four Moderate advisories in the Cypress dependency chain.

- Total findings: 4 (0 Critical, 0 High, 3 Medium, 1 Low, 0 Info)
- Dependency vulnerabilities: 0 Critical, 0 High, 4 Moderate, 0 Low
- Most critical risk areas: fail-closed human-turn fixture gap, reduced-motion evidence quality, Cypress tooling advisories
- Overall risk level: Medium
- Blocker status: Blocked for T-6 RED security sign-off. The blocker is evidence coverage integrity rather than a confirmed production exploit. Current evidence supports 2 of 15 scenarios, while 13 of 15 remain blocked by missing deterministic human-turn fixtures in the controlled seam.

## 2. Dependency Vulnerabilities

Results of npm audit --json:

| Package          | Version                                            | Severity | CVE                                         | Fix Available                                          |
| ---------------- | -------------------------------------------------- | -------- | ------------------------------------------- | ------------------------------------------------------ |
| cypress          | 15.14.1 direct development dependency              | Moderate | Not separately assigned in the audit output | Yes, npm audit reports a Cypress-directed upgrade path |
| @cypress/request | Transitive dependency in the Cypress advisory path | Moderate | Not separately assigned in the audit output | Yes, through the Cypress-directed upgrade path         |
| qs               | 6.11.1 to 6.15.1 in the advisory graph             | Moderate | GHSA-q8mj-m7cp-5q26                         | Yes                                                    |
| brace-expansion  | 5.0.2 to 5.0.5 in the advisory graph               | Moderate | GHSA-jxxr-4gwj-5jf2                         | Yes                                                    |

Total: 0 Critical, 0 High, 4 Moderate, 0 Low

## 3. Security Findings

### SEC-01: Missing Human-Turn Fixtures Block Most T-6 Security Evidence [Medium]

- **OWASP Category:** A04:2021 - Insecure Design
- **Severity:** Medium
- **Affected:** cypress/e2e/laia-hand-capture-animation-bleed.ts, src/main.ts, src/app/core/services/game-engine.ts
- **Description:** The scoped Cypress steps request deterministic human-turn fixtures for single capture, multi-card capture, Escoba capture, post-deal capture, and consecutive captures. The window test API delegates fixture setup to the GameEngine public seam, but the reviewed EngineE2eFixture contract only exposes visibility and opponent-turn fixture names. Unsupported human-turn names are therefore rejected by design. That fail-closed behavior is the correct security posture for the seam, but it leaves thirteen of the fifteen T-6 scenarios unable to exercise the intended human-turn isolation paths.
- **Risk:** FR-1.1 through FR-1.3 and the related non-functional claims cannot be treated as security-reviewed evidence while most scenarios fail before reaching the target behavior. Cross-zone animation regressions could therefore evade detection even though the feature appears to have broad BDD coverage on paper.
- **Expected Practice:** End-to-end steps should consume an authoritative fixture contract, and scenario additions should not depend on fixture names that the approved seam does not expose.
- **Recommendation:** Keep the seam fail-closed and treat the thirteen human-turn scenarios as blocked until the approved contract intentionally supports those fixtures or the scenarios are rewritten against supported seam behavior.
- **References:** https://owasp.org/Top10/A04_2021-Insecure_Design/ , https://angular.dev/best-practices/security
- **Spec Traceability:** FR-1.1, FR-1.2, FR-1.3, TR-1.2, TR-1.3, TR-1.4, NFR-1.1, NFR-1.2, AD-1, AD-3, AD-4

### SEC-02: Reduced-Motion Scenario Does Not Exercise the Runtime Preference Path [Medium]

- **OWASP Category:** A04:2021 - Insecure Design
- **Severity:** Medium
- **Affected:** cypress/e2e/laia-hand-capture-animation-bleed.feature, cypress/e2e/turn-sequencing-completion.ts, src/main.ts, src/app/features/game-board/game-table-page/game-table-page.ts
- **Description:** The duplicate reduced-motion step conflict has been resolved, but the shared reduced-motion step still drives a turn-sequencing summary fixture through the browser test API. The game table page itself reads reduced-motion state from the browser motion-preference path. In the scoped T-6 review, the reduced-motion scenario never proves that the page under test consumed that real runtime input, and it remains independently blocked by the missing human-turn fixture setup.
- **Risk:** NFR-1.3 could be signed off with incomplete evidence because the current scenario does not demonstrate that the actual reduced-motion branch used by the page preserves the same isolation behavior.
- **Expected Practice:** Accessibility scenarios should exercise the same motion-preference source that production code uses, or a demonstrably equivalent seam consumed by the page under test.
- **Recommendation:** Keep SC-11 in blocked status until it is re-run with a supported human-turn fixture and a motion-preference setup that maps to the real runtime reduced-motion path.
- **References:** https://owasp.org/Top10/A04_2021-Insecure_Design/ , https://angular.dev/best-practices/security
- **Spec Traceability:** NFR-1.3, TR-1.4, AD-4

### SEC-03: Moderate Vulnerabilities Remain in the Cypress Dependency Chain [Medium]

- **OWASP Category:** A06:2021 - Vulnerable and Outdated Components
- **Severity:** Medium
- **Affected:** package.json development dependency graph and transitive Cypress tooling modules
- **Description:** npm audit --json reports four Moderate advisories in development tooling used by the Cypress stack. The current audit contains no Critical or High findings.
- **Risk:** The affected packages sit in development and CI tooling rather than the shipped Angular runtime bundle, but unresolved advisories still expand supply-chain and pipeline exposure.
- **Expected Practice:** Test tooling should stay on supported dependency versions, and dependency audits should be refreshed after each update cycle.
- **Recommendation:** Track the Cypress dependency path to a patched state and re-run npm audit to confirm the Moderate advisories are closed with current evidence.
- **References:** https://owasp.org/Top10/A06_2021-Vulnerable_and_Outdated_Components/ , https://angular.dev/best-practices/security , https://github.com/advisories/GHSA-q8mj-m7cp-5q26 , https://github.com/advisories/GHSA-jxxr-4gwj-5jf2
- **Spec Traceability:** NFR-1.2, NFR-1.4, AD-4

### SEC-04: Responsiveness Scenario Still Provides Only Partial Assurance [Low]

- **OWASP Category:** A04:2021 - Insecure Design
- **Severity:** Low
- **Affected:** cypress/e2e/laia-hand-capture-animation-bleed.ts
- **Description:** The scoped responsiveness checks still infer acceptable behavior from a single animation-duration threshold and the absence of opponent animation classes. Those checks do not directly observe frame pacing or repeated runtime behavior, so they only partially evidence the absence of stutter.
- **Risk:** SC-13 could eventually pass while a real responsiveness regression still exists, leaving NFR-1.4 only partially supported.
- **Expected Practice:** Performance-oriented acceptance evidence should map directly to the claimed runtime behavior instead of relying only on indirect style proxies.
- **Recommendation:** Treat SC-13 as partial evidence only until responsiveness is supported by more representative runtime observations.
- **References:** https://owasp.org/Top10/A04_2021-Insecure_Design/ , https://angular.dev/best-practices/security
- **Spec Traceability:** NFR-1.4, TR-1.4, AD-4

## 4. Authentication & Authorisation Summary

| Protected Route / Resource | Guard                                   | Token Storage                                  | Session Management                                             | Status                                             |
| -------------------------- | --------------------------------------- | ---------------------------------------------- | -------------------------------------------------------------- | -------------------------------------------------- |
| partida route              | Existing session guard remains in place | No token storage introduced in this task scope | Existing session behavior remains outside the reviewed changes | Secure in reviewed scope                           |
| Cypress browser test API   | Not an authentication boundary          | Not applicable                                 | Exposed only when both dev mode and Cypress are present        | No production exposure evidenced in reviewed scope |

## 5. Transport Security Summary

| Control                 | Status                                | Notes                                                                                                                  |
| ----------------------- | ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| HTTPS enforcement       | Partial                               | No insecure transport usage was introduced in the reviewed T-6 files; deployment enforcement remains outside this task |
| Content Security Policy | Configured                            | No scoped regression was evidenced in the reviewed Cypress files                                                       |
| CORS policy             | Not verifiable in frontend task scope | Backend header policy is outside the reviewed files                                                                    |
| SameSite cookies        | Not applicable in reviewed scope      | No cookie-based authentication change was introduced by T-6                                                            |
| HSTS                    | Not verifiable in frontend task scope | Server transport header policy is outside the reviewed files                                                           |

## 6. Spec Security Compliance

| NFR     | Requirement                  | Status  | Findings       |
| ------- | ---------------------------- | ------- | -------------- |
| NFR-1.1 | Visual correctness and trust | Partial | SEC-01         |
| NFR-1.2 | Consistency                  | Partial | SEC-01, SEC-03 |
| NFR-1.3 | Accessibility stability      | Not Met | SEC-02         |
| NFR-1.4 | Performance neutrality       | Partial | SEC-03, SEC-04 |

## 7. Traceability Matrix

| Finding | Severity | OWASP    | Affected Component               | Status |
| ------- | -------- | -------- | -------------------------------- | ------ |
| SEC-01  | Medium   | A04:2021 | Human-turn fixture seam contract | Open   |
| SEC-02  | Medium   | A04:2021 | Reduced-motion evidence path     | Open   |
| SEC-03  | Medium   | A06:2021 | Cypress dependency chain         | Open   |
| SEC-04  | Low      | A04:2021 | SC-13 responsiveness evidence    | Open   |

## 8. Prioritised Recommendations

### Critical (fix before any deployment)

1. No Critical findings were evidenced in this incremental review.

### High (fix before release)

1. No High findings were evidenced in this incremental review.

### Medium (fix before accepting T-6 RED security evidence)

1. Keep the thirteen failing human-turn scenarios blocked until the approved GameEngine seam intentionally supports the required deterministic fixtures or the scenarios are aligned to the supported fixture contract.
2. Keep SC-11 out of sign-off scope until it exercises the same runtime reduced-motion path used by the game table page and passes with supported human-turn fixture setup.
3. Update the Cypress dependency path and re-run npm audit so the Moderate advisories can be re-assessed with fresh evidence.

### Low / Info (monitor and address)

1. Treat SC-13 as partial evidence until the responsiveness claim is supported by more direct runtime observations.
