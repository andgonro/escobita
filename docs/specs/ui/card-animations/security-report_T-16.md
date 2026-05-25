# Security Report: Card Animation System

**Review Mode:** Incremental (T-16: Align and execute E2E scenarios from BDD)
**Source:** docs/specs/ui/card-animations/
**Reviewed against:** spec.md (NFR-2, NFR-3), design.md (AD-5, AD-7), tasks.md (T-16), Angular Security Guide, OWASP Top 10:2021

## 1. Risk Summary

This re-run incremental security review focused on the newly added dedicated E2E suites for reduced-motion behavior and animation state isolation. The reviewed files were cypress/e2e/reduced-motion-dedicated.feature, cypress/e2e/reduced-motion-dedicated.ts, cypress/e2e/animation-state-isolation.feature, and cypress/e2e/animation-state-isolation.ts, with validation of the test seam bootstrap in src/main.ts and dependency posture via npm audit JSON output. No Critical or High findings were identified.

- Total findings: 2 (0 Critical, 0 High, 1 Medium, 0 Low, 1 Info)
- Dependency vulnerabilities: 0 Critical, 0 High (from npm audit --json)
- Most critical risk areas: vulnerable and outdated test tooling components, reliance on development-only global test seam exposure controls
- Overall risk level: Medium

## 2. Dependency Vulnerabilities

Results of npm audit --json:

| Package              | Version | Severity | CVE | Fix Available |
| -------------------- | ------- | -------- | --- | ------------- |
| None (Critical/High) | -       | -        | -   | -             |

Additional observed Moderate issues relevant to this task scope:

| Package                         | Version                            | Severity | CVE / Advisory                      | Fix Available                                                      |
| ------------------------------- | ---------------------------------- | -------- | ----------------------------------- | ------------------------------------------------------------------ |
| cypress (direct dev dependency) | Installed in current lockfile tree | Moderate | Via qs advisory GHSA-q8mj-m7cp-5q26 | Yes (reported through Cypress upgrade path requiring major change) |
| brace-expansion (transitive)    | 5.0.2 to 5.0.5 in dependency tree  | Moderate | GHSA-jxxr-4gwj-5jf2                 | Yes                                                                |

Total: 0 Critical, 0 High, 4 Moderate, 0 Low, 0 Info (npm audit metadata)

## 3. Security Findings

### SEC-01: Moderate Vulnerabilities in Cypress Dependency Chain [Medium]

- **OWASP Category:** A06:2021 — Vulnerable and Outdated Components
- **Severity:** Medium
- **Affected:** Cypress E2E dependency chain used by T-16 dedicated suites
- **Description:** npm audit reports Moderate vulnerabilities in the active dependency tree. There are no Critical or High dependency findings at the time of this review.
- **Risk:** Risk is concentrated in local development and CI runners executing vulnerable tooling. Impact is primarily denial-of-service potential and test workflow disruption.
- **Expected Practice:** Maintain direct and transitive test dependencies at patched versions and enforce dependency health gates in CI.
- **Recommendation:** Schedule a controlled Cypress upgrade and re-run dependency scanning after lockfile refresh. Keep CI policy gates for High and Critical severities and track residual Moderate advisories to closure.
- **References:** https://owasp.org/Top10/A06_2021-Vulnerable_and_Outdated_Components/, https://angular.dev/best-practices/security, https://github.com/advisories/GHSA-q8mj-m7cp-5q26, https://github.com/advisories/GHSA-jxxr-4gwj-5jf2
- **Spec Traceability:** T-16, AD-7

### SEC-02: Development-Only Window Test API Requires Ongoing Guard Integrity [Info]

- **OWASP Category:** A05:2021 — Security Misconfiguration
- **Severity:** Info
- **Affected:** cypress/e2e/reduced-motion-dedicated.ts, cypress/e2e/animation-state-isolation.ts, src/main.ts
- **Description:** The dedicated suites invoke a global window test API to apply fixtures and read summaries. Bootstrap logic in src/main.ts limits that API to development mode with Cypress presence checks.
- **Risk:** If release controls fail and a development build is exposed, this seam could permit state manipulation in that environment.
- **Expected Practice:** Test seams must remain inaccessible in production artifacts and be continuously guarded by build and release policy.
- **Recommendation:** Keep production promotion restricted to production builds, include periodic release-control verification for test seam gating, and keep fixture handling fail-closed for unsupported fixture names.
- **References:** https://owasp.org/Top10/A05_2021-Security_Misconfiguration/, https://angular.dev/best-practices/security
- **Spec Traceability:** T-16, NFR-3, AD-5

## 4. Authentication & Authorisation Summary

| Protected Route / Resource   | Guard                                                     | Token Storage                        | Session Management                                         | Status                                          |
| ---------------------------- | --------------------------------------------------------- | ------------------------------------ | ---------------------------------------------------------- | ----------------------------------------------- |
| /partida route               | partidaSessionGuard (canMatch)                            | None observed in reviewed task scope | In-memory session configuration controls route eligibility | ✅ Secure for current local-session model       |
| Cypress fixture seam surface | Development-only and Cypress-presence checks in bootstrap | Not applicable                       | Test-only state seam, not a user authentication surface    | ⚠️ Controlled but monitor deployment discipline |

## 5. Transport Security Summary

| Control                 | Status                                         | Notes                                                                                                |
| ----------------------- | ---------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| HTTPS enforcement       | ⚠️ Partial                                     | Local Cypress runs use localhost transport; production enforcement is outside the reviewed E2E scope |
| Content Security Policy | ⚠️ Not assessed in this incremental task scope | Dedicated E2E suite additions do not define CSP policy                                               |
| CORS policy             | ⚠️ Not assessed in this incremental task scope | Backend policy is outside reviewed files                                                             |
| SameSite cookies        | ⚠️ Not assessed in this incremental task scope | No cookie session handling observed in scoped suite files                                            |
| HSTS                    | ⚠️ Not assessed in this incremental task scope | Server header controls are outside reviewed files                                                    |

## 6. Spec Security Compliance

| NFR   | Requirement                                    | Status | Findings                                  |
| ----- | ---------------------------------------------- | ------ | ----------------------------------------- |
| NFR-2 | Accessibility - Keyboard navigation unaffected | ✅ Met | None                                      |
| NFR-3 | Accessibility - Motion preferences respected   | ✅ Met | SEC-02 (Info, environment control caveat) |

## 7. Traceability Matrix

| Finding | Severity | OWASP    | Affected Component                           | Status  |
| ------- | -------- | -------- | -------------------------------------------- | ------- |
| SEC-01  | Medium   | A06:2021 | Cypress dependency chain used by E2E suites  | Open    |
| SEC-02  | Info     | A05:2021 | Window test API usage and bootstrap guarding | Monitor |

## 8. Prioritised Recommendations

### Critical (fix before any deployment)

1. None.

### High (fix before release)

1. None.

### Medium (fix in next sprint)

1. Upgrade and re-audit Cypress-related dependencies to address currently reported Moderate advisories.

### Low / Info (monitor and address)

1. Maintain strict release controls so development-only test seams cannot be present in production environments.
