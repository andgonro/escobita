# Security Report: Card Animation System (T-6 GREEN Re-review)

**Review Mode:** Incremental (T-6: Integrate completion-driven turn sequencing)
**Source:** `docs/specs/ui/card-animations/`
**Reviewed against:** spec.md (FR-7, TR-4, TR-6, TR-8, NFR-2, NFR-3), design.md (AD-2, AD-3), Angular Security Guide, OWASP Top 10:2021

## 1. Risk Summary

This incremental GREEN re-review validates the latest sequencing fix in T-6 by re-checking game-table sequencing logic, pause policy resolution, route guard context, development test seam exposure, environment/config files, and dependency audit output. No Critical or High findings were identified in code or dependencies. Remaining risk is limited to one Medium dependency advisory and one Info-level governance observation for the development-only test seam.

- Total findings: 2 (0 Critical, 0 High, 1 Medium, 0 Low, 1 Info)
- Dependency vulnerabilities: 0 Critical, 0 High (from npm audit JSON output)
- Most critical risk areas: vulnerable and outdated component hygiene; development test seam governance
- Overall risk level: Low

## 2. Dependency Vulnerabilities

Results of npm audit JSON output:

| Package         | Version       | Severity | CVE                 | Fix Available |
| --------------- | ------------- | -------- | ------------------- | ------------- |
| brace-expansion | 5.0.2 - 5.0.5 | Moderate | GHSA-jxxr-4gwj-5jf2 | Yes           |

Total: 0 Critical, 0 High, 1 Moderate, 0 Low

No Critical or High dependency vulnerabilities were reported.

## 3. Security Findings

### SEC-01: Moderate dependency advisory present in transitive package [Medium]

- **OWASP Category:** A06:2021 - Vulnerable and Outdated Components
- **Severity:** Medium
- **Affected:** package dependency graph (transitive dependency: brace-expansion)
- **Description:** Dependency audit reports a Moderate denial-of-service advisory in `brace-expansion` for versions from 5.0.0 up to 5.0.6 exclusive. The installed vulnerable range is 5.0.2 through 5.0.5.
- **Risk:** A vulnerable transitive component can become exploitable if a reachable execution path accepts attacker-influenced brace patterns at scale.
- **Expected Practice:** Keep dependency trees patched and remove known vulnerable ranges where fixes are available.
- **Recommendation:** Apply the available dependency update path to move off the affected range and re-run dependency audit as part of release readiness.
- **References:**
  - https://owasp.org/Top10/A06_2021-Vulnerable_and_Outdated_Components/
  - https://github.com/advisories/GHSA-jxxr-4gwj-5jf2
- **Spec Traceability:** NFR-6 (Maintainability)

### SEC-02: Development test seam exposed on global window under dual gate [Info]

- **OWASP Category:** A05:2021 - Security Misconfiguration
- **Severity:** Info
- **Affected:** src/main.ts, cypress/e2e/turn-sequencing-completion.ts
- **Description:** Turn-sequencing test seam methods are attached to a global window API only when both development mode and Cypress presence are true. Fixture names are allow-listed and unsupported values fail fast.
- **Risk:** If future changes weaken either gate, internal test seam controls could become reachable outside test context.
- **Expected Practice:** Keep test-only seams non-production, tightly gated, and validated as unavailable in release artifacts.
- **Recommendation:** Preserve the dual gate and add release validation that confirms the global seam is absent in production runtime.
- **References:**
  - https://owasp.org/Top10/A05_2021-Security_Misconfiguration/
  - https://angular.dev/best-practices/security
- **Spec Traceability:** TR-4, TR-6, TR-8, AD-2, AD-3

## 4. Authentication and Authorization Summary

| Protected Route / Resource | Guard                          | Token Storage              | Session Management                                 | Status                         |
| -------------------------- | ------------------------------ | -------------------------- | -------------------------------------------------- | ------------------------------ |
| /partida route             | partidaSessionGuard canMatch   | None in reviewed T-6 scope | Session configuration required before route match  | Secure in reviewed scope       |
| window test seam API       | Not an authentication boundary | None                       | Dual gate (development mode plus Cypress presence) | Informational monitor (SEC-02) |

## 5. Transport Security Summary

| Control                 | Status                                | Notes                                         |
| ----------------------- | ------------------------------------- | --------------------------------------------- |
| HTTPS enforcement       | Not assessed in T-6 incremental scope | No transport URL change in reviewed files     |
| Content Security Policy | Not assessed in T-6 incremental scope | Header policy not changed in reviewed files   |
| CORS policy             | Not assessed in T-6 incremental scope | Frontend-only incremental review scope        |
| SameSite cookies        | Not assessed in T-6 incremental scope | No cookie-handling change in reviewed files   |
| HSTS                    | Not assessed in T-6 incremental scope | Server-side control outside task scope        |
| Referrer-Policy         | Not assessed in T-6 incremental scope | Server-side header control outside task scope |

## 6. Spec Security Compliance

| NFR   | Requirement                                                                   | Status                                   | Findings |
| ----- | ----------------------------------------------------------------------------- | ---------------------------------------- | -------- |
| NFR-2 | Keyboard navigation and focus management remain unaffected by animations      | Met in reviewed implementation and tests | None     |
| NFR-3 | Reduced-motion behavior preserves functional flow with instant visual updates | Met in reviewed implementation and tests | None     |
| NFR-6 | Maintainable implementation posture                                           | Partial (dependency advisory pending)    | SEC-01   |

## 7. Traceability Matrix

| Finding | Severity | OWASP    | Affected Component                                    | Status |
| ------- | -------- | -------- | ----------------------------------------------------- | ------ |
| SEC-01  | Medium   | A06:2021 | Dependency graph (brace-expansion transitive package) | Open   |
| SEC-02  | Info     | A05:2021 | Development bootstrap test seam exposure              | Open   |

## 8. Prioritized Recommendations

### Critical (fix before any deployment)

1. None.

### High (fix before release)

1. None.

### Medium (fix in next sprint)

1. Remediate GHSA-jxxr-4gwj-5jf2 by updating off the affected transitive dependency range and confirming clean audit results.

### Low / Info (monitor and address)

1. Keep T-6 test seam exposure restricted to development and Cypress contexts, and verify exclusion in production release validation.
