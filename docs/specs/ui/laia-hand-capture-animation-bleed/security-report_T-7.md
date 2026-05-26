# Security Report: Laia Hand Capture Animation Bleed

**Review Mode:** Incremental (T-7: Run accessibility and performance regression validation)
**Source:** docs/specs/ui/laia-hand-capture-animation-bleed/
**Reviewed against:** spec.md (NFR-1.1, NFR-1.2, NFR-1.3, NFR-1.4), design.md (AD-4), Angular Security Guide, OWASP Top 10:2021

## 1. Risk Summary

This incremental T-7 security review was regenerated from the current workspace after reduced-motion and SC-11 assertion updates. Current evidence shows that reduced-motion preference handling is now exercised through the shared step definition and SC-11 assertions accept both animation-enabled and reduced-motion branches while still checking opponent-hand isolation. No code-level OWASP violations were observed in the reviewed T-7 scope. Residual risk is primarily dependency-related in the Cypress chain, with low-severity evidence-depth gaps in accessibility continuity and responsiveness verification.

- Total findings: 3 (0 Critical, 0 High, 1 Medium, 2 Low, 0 Info)
- Dependency vulnerabilities: 0 Critical, 0 High, 4 Moderate, 0 Low
- Most critical risk areas: vulnerable and outdated components in development tooling, limited depth in non-functional regression evidence
- Overall risk level: Medium

## 2. Dependency Vulnerabilities

Results of npm audit --json:

| Package          | Version                | Severity | CVE                              | Fix Available                                                 |
| ---------------- | ---------------------- | -------- | -------------------------------- | ------------------------------------------------------------- |
| cypress          | 15.14.1                | Moderate | Not provided by npm audit output | Yes (manual major-line change to cypress 13.14.2 is reported) |
| @cypress/request | Transitive via cypress | Moderate | Not provided by npm audit output | Yes (through the cypress update path)                         |
| qs               | 6.11.1 through 6.15.1  | Moderate | GHSA-q8mj-m7cp-5q26              | Yes                                                           |
| brace-expansion  | 5.0.2 through 5.0.5    | Moderate | GHSA-jxxr-4gwj-5jf2              | Yes                                                           |

Total: 0 Critical, 0 High, 4 Moderate, 0 Low

## 3. Security Findings

### SEC-01: Moderate Vulnerabilities in the Cypress Dependency Chain [Medium]

- **OWASP Category:** A06:2021 - Vulnerable and Outdated Components
- **Severity:** Medium
- **Affected:** package.json dependency graph and transitive Cypress modules
- **Description:** npm audit --json reports four Moderate advisories in the Cypress dependency path. No Critical or High advisories were reported.
- **Risk:** These packages are part of development and CI tooling. Unresolved advisories still increase supply-chain and build-pipeline attack surface.
- **Expected Practice:** Tooling dependencies should remain within advisory-fixed ranges and be continuously revalidated with dependency scanning.
- **Recommendation:** Apply the reported Cypress upgrade path, then re-run dependency audit to verify advisory closure.
- **References:** https://owasp.org/Top10/A06_2021-Vulnerable_and_Outdated_Components/ , https://angular.dev/best-practices/security , https://github.com/advisories/GHSA-q8mj-m7cp-5q26 , https://github.com/advisories/GHSA-jxxr-4gwj-5jf2
- **Spec Traceability:** NFR-1.2, NFR-1.4, AD-4

### SEC-02: Keyboard and Focus Continuity Evidence Remains Endpoint-Oriented [Low]

- **OWASP Category:** A04:2021 - Insecure Design
- **Severity:** Low
- **Affected:** cypress/e2e/laia-hand-capture-animation-bleed.ts (SC-12 step assertions)
- **Description:** SC-12 confirms that keyboard control remains available after capture and that a post-capture control can be focused. It does not fully verify continuity of focus behavior through transition lifecycle states.
- **Risk:** Focus continuity regressions during transition boundaries could pass existing checks and reduce confidence in accessibility stability claims.
- **Expected Practice:** Accessibility continuity checks should validate deterministic focus behavior before, during, and after transition boundaries.
- **Recommendation:** Treat SC-12 as partial security evidence until continuity-oriented focus assertions are added to the same flow.
- **References:** https://owasp.org/Top10/A04_2021-Insecure_Design/ , https://angular.dev/best-practices/security
- **Spec Traceability:** NFR-1.3, US-4, AD-4

### SEC-03: Responsiveness Validation Uses Indirect Proxy Evidence [Low]

- **OWASP Category:** A04:2021 - Insecure Design
- **Severity:** Low
- **Affected:** cypress/e2e/laia-hand-capture-animation-bleed.ts (SC-13 step assertions)
- **Description:** SC-13 uses animation class presence and a duration threshold as responsiveness proxies. This does not directly measure runtime stutter or pacing across transition cycles.
- **Risk:** Timing regressions under specific conditions may remain undetected while current assertions pass.
- **Expected Practice:** Performance-neutrality validation should include evidence that reflects runtime pacing behavior for the tested interaction.
- **Recommendation:** Treat SC-13 as partial security evidence until responsiveness checks include more representative runtime observations.
- **References:** https://owasp.org/Top10/A04_2021-Insecure_Design/ , https://angular.dev/best-practices/security
- **Spec Traceability:** NFR-1.4, US-4, AD-4

## 4. Authentication & Authorisation Summary

| Protected Route / Resource              | Guard                                  | Token Storage                            | Session Management                                                           | Status                                             |
| --------------------------------------- | -------------------------------------- | ---------------------------------------- | ---------------------------------------------------------------------------- | -------------------------------------------------- |
| partida route                           | Yes (partidaSessionGuard via canMatch) | No token storage introduced in T-7 scope | Access requires session configuration; unauthorised access redirects to root | Secure in reviewed scope                           |
| Cypress test API seam in main bootstrap | Not an authentication boundary         | Not applicable                           | Exposed only when Cypress is present and Angular dev mode is active          | No production exposure evidenced in reviewed scope |

## 5. Transport Security Summary

| Control                 | Status                                 | Notes                                                                                           |
| ----------------------- | -------------------------------------- | ----------------------------------------------------------------------------------------------- |
| HTTPS enforcement       | Partial                                | No non-TLS endpoint usage introduced in T-7 files; deployment-level enforcement is out of scope |
| Content Security Policy | Not verifiable in scoped frontend task | No CSP-related changes in T-7 scope                                                             |
| CORS policy             | Not verifiable in scoped frontend task | Backend header policy is out of scope for this task-level review                                |
| SameSite cookies        | Not applicable in reviewed scope       | No cookie-based auth changes in T-7 scope                                                       |
| HSTS                    | Not verifiable in scoped frontend task | Server-level policy not represented in reviewed files                                           |

## 6. Spec Security Compliance

| NFR     | Requirement                  | Status                | Findings       |
| ------- | ---------------------------- | --------------------- | -------------- |
| NFR-1.1 | Visual correctness and trust | Met in reviewed scope | None           |
| NFR-1.2 | Consistency                  | Partial               | SEC-01         |
| NFR-1.3 | Accessibility stability      | Partial               | SEC-02         |
| NFR-1.4 | Performance neutrality       | Partial               | SEC-01, SEC-03 |

## 7. Traceability Matrix

| Finding | Severity | OWASP    | Affected Component                           | Status |
| ------- | -------- | -------- | -------------------------------------------- | ------ |
| SEC-01  | Medium   | A06:2021 | Cypress dependency chain                     | Open   |
| SEC-02  | Low      | A04:2021 | SC-12 keyboard and focus continuity evidence | Open   |
| SEC-03  | Low      | A04:2021 | SC-13 responsiveness evidence depth          | Open   |

## 8. Prioritised Recommendations

### Critical (fix before any deployment)

1. No Critical findings were evidenced in this incremental review.

### High (fix before release)

1. No High findings were evidenced in this incremental review.

### Medium (fix in next sprint)

1. Upgrade Cypress dependency path to the advisory-fixed line and re-run dependency audit to confirm closure of all four Moderate advisories.

### Low / Info (monitor and address)

1. Strengthen SC-12 evidence to validate focus continuity through transition lifecycle boundaries.
2. Strengthen SC-13 evidence to include runtime pacing observations beyond style-duration proxies.
