# Security Report: Card Frame Clipping Fix

**Review Mode:** Incremental (T-1: Remove Overflow Restriction from Hand Card Button; T-2: Remove Overflow Restriction from Table Card Button)
**Source:** `docs/specs/ui/2-card-frame-clipping/`
**Reviewed against:** spec.md (NFR-1 through NFR-4), design.md (AD-1, AD-4), Angular Security Guide (https://angular.dev/best-practices/security), OWASP Top 10:2021

---

## 1. Risk Summary

T-1 and T-2 together constitute a purely presentational CSS change. Two SCSS selectors — `.hand-card-button` in `active-hand-zone.scss` and `.table-card` in `center-table-zone.scss` — each had a single `overflow: hidden` declaration removed. No TypeScript was written or modified. No new components, services, routes, guards, HTTP calls, dependencies, environment files, or configuration files were touched or created. The implementation matches the design document exactly and is consistent with the feature scope declared in spec.md, which explicitly places compliance, legal, and privacy changes outside scope on the grounds that this is a UI-only fix with no data handling impact.

`npm audit` reports zero vulnerabilities across all severity levels against 1,157 installed packages.

- **Total findings:** 0
- **Dependency vulnerabilities:** 0 Critical, 0 High, 0 Moderate, 0 Low
- **Most critical risk areas:** None identified
- **Overall risk level:** None

---

## 2. Dependency Vulnerabilities

npm audit (sourced from `audit-report.json`, confirmed exit code 0 for zero advisory findings) reports no vulnerabilities.

| Package | Version | Severity | CVE | Fix Available |
| ------- | ------- | -------- | --- | ------------- |
| —       | —       | —        | —   | —             |

Total: 0 Critical, 0 High, 0 Moderate, 0 Low.

No new packages were introduced by T-1 or T-2. The dependency surface is unchanged.

---

## 3. Security Findings

No security findings were identified. The analysis of each OWASP Top 10:2021 category follows for completeness and traceability.

### A01:2021 — Broken Access Control

Not applicable. T-1 and T-2 involve no route configuration, route guards, role checks, or authorisation logic of any kind. The two changed files are SCSS stylesheets that have no bearing on access control.

### A02:2021 — Cryptographic Failures

Not applicable. No sensitive data, tokens, credentials, or personally identifiable information is processed, stored, or transmitted by a CSS property change.

### A03:2021 — Injection

Not applicable. Removing an `overflow` declaration from a CSS selector introduces no injection surface. No HTML templates were modified; there are no `[innerHTML]` bindings, no `bypassSecurityTrust*` calls, no `eval()` or equivalent dynamic code execution patterns in the affected files or their parent components.

### A04:2021 — Insecure Design

Not applicable. The design document (design.md) confirms this is a scoped, intentional presentational correction. The spec explicitly names compliance, legal, and privacy changes as out of scope. No trust boundary or data validation concern is created by adjusting CSS overflow rendering.

### A05:2021 — Security Misconfiguration

Not applicable. No build configuration, deployment pipeline, environment file, CORS policy, CSP header, or debug flag was altered. The Angular build configuration (`angular.json`) and all environment files are unchanged by T-1 and T-2.

### A06:2021 — Vulnerable and Outdated Components

Not applicable to T-1 or T-2 specifically. npm audit confirms zero vulnerabilities in the current dependency set. No new packages were introduced.

### A07:2021 — Identification and Authentication Failures

Not applicable. No authentication mechanism, token storage, session lifecycle, or login/logout flow is touched by a stylesheet change.

### A08:2021 — Software and Data Integrity Failures

Not applicable. No third-party scripts, npm packages, or external resources were added. No JSON input is parsed. Subresource integrity considerations are unchanged.

### A09:2021 — Security Logging and Monitoring Failures

Not applicable. No logging code, audit trail, or monitoring configuration was modified. The changed files contain no executable logic.

### A10:2021 — Server-Side Request Forgery (SSRF)

Not applicable. No HTTP requests, URL construction, or user-supplied URL parameters are involved in a CSS stylesheet change.

---

## 4. Authentication & Authorisation Summary

T-1 and T-2 introduce no routes, guards, or authentication state management. The existing route guard coverage of the application is unaffected.

| Protected Route / Resource         | Guard | Token Storage | Session Management | Status         |
| ---------------------------------- | ----- | ------------- | ------------------ | -------------- |
| (No routes affected by T-1 or T-2) | —     | —             | —                  | Not applicable |

---

## 5. Transport Security Summary

No transport-level controls are affected by T-1 or T-2. All entries reflect the pre-existing application posture, which is unchanged.

| Control                 | Status                     | Notes                                                                               |
| ----------------------- | -------------------------- | ----------------------------------------------------------------------------------- |
| HTTPS enforcement       | Not evaluated by this task | No HTTP calls introduced or modified by T-1 or T-2                                  |
| Content Security Policy | Not evaluated by this task | No scripts, styles, or resources loaded dynamically; existing CSP posture unchanged |
| CORS policy             | Not evaluated by this task | No cross-origin requests introduced or modified                                     |
| SameSite cookies        | Not evaluated by this task | No cookie handling introduced or modified                                           |
| HSTS                    | Not evaluated by this task | No server configuration introduced or modified                                      |
| Referrer Policy         | Not evaluated by this task | No navigation or link targets introduced or modified                                |

---

## 6. Spec Security Compliance

The security-adjacent NFRs in spec.md are evaluated below. NFR-1, NFR-2, NFR-3, and NFR-4 are quality and accessibility NFRs, not security NFRs. They are included for completeness because accessibility correctness (NFR-3) has a security-adjacent dimension in that a clipped focus indicator can constitute a usability barrier for keyboard users under WCAG criteria.

| NFR   | Requirement                                          | Status                                                                                                                   | Findings |
| ----- | ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ | -------- |
| NFR-1 | Visual acceptance — no card edge clipping on mobile  | ✅ Met (pending QA sign-off per T-3)                                                                                     | None     |
| NFR-2 | Visual acceptance — no card edge clipping on desktop | ✅ Met (pending QA sign-off per T-4)                                                                                     | None     |
| NFR-3 | Keyboard focus indicator fully visible after fix     | ✅ Met (natural consequence of overflow change; pending T-5 accessibility sign-off)                                      | None     |
| NFR-4 | No regression in adjacent zones                      | ✅ Met — changes are scoped to the two affected selectors only; no adjacent zone stylesheets or components were modified | None     |

No security-specific NFRs are defined in spec.md. The spec explicitly states that compliance, legal, and privacy changes are out of scope for this feature.

---

## 7. Traceability Matrix

| Finding       | Severity | OWASP | Affected Component | Status |
| ------------- | -------- | ----- | ------------------ | ------ |
| (No findings) | —        | —     | —                  | —      |

---

## 8. Prioritised Recommendations

### Critical (fix before any deployment)

None.

### High (fix before release)

None.

### Medium (fix in next sprint)

None.

### Low / Info (monitor and address)

None.

---

_Security review performed against OWASP Top 10:2021 (https://owasp.org/Top10/) and Angular Security Guide (https://angular.dev/best-practices/security). npm audit data sourced from `audit-report.json` in the workspace root._
