# Security Report: Laia Hand Capture Animation Bleed

**Review Mode:** Incremental (T-8: Finalize documentation traceability and release handoff)
**Source:** `docs/specs/ui/laia-hand-capture-animation-bleed/`
**Reviewed against:** spec.md (NFR-1.1, NFR-1.2, NFR-1.3, NFR-1.4, TR-1.4), design.md (AD-4), Angular Security Guide, OWASP Top 10:2021

## 1. Risk Summary

This incremental review is scoped to T-8 documentation and handoff traceability artifacts. No new runtime source code, route surface, authentication mechanism, or transport integration was introduced in this task scope. The only evidence-based risk remains dependency advisories in the development toolchain from the latest `npm audit --json` run.

- Total findings: 1 (0 Critical, 0 High, 1 Medium, 0 Low, 0 Info)
- Dependency vulnerabilities: 0 Critical, 0 High (from npm audit)
- Most critical risk areas: vulnerable and outdated development tooling components
- Overall risk level: Medium

## 2. Dependency Vulnerabilities

Results of `npm audit --json`:

| Package                 | Version | Severity | CVE  | Fix Available |
| ----------------------- | ------- | -------- | ---- | ------------- |
| None (Critical or High) | None    | None     | None | None          |

Total: 0 Critical, 0 High, 4 Medium, 0 Low

Medium advisories relevant to this repository include:

| Package                                                | Version         | Severity | CVE                 | Fix Available                                              |
| ------------------------------------------------------ | --------------- | -------- | ------------------- | ---------------------------------------------------------- |
| qs (transitive via @cypress/request and cypress chain) | 6.11.1 - 6.15.1 | Medium   | GHSA-q8mj-m7cp-5q26 | Yes (through cypress downgrade path reported by npm audit) |
| brace-expansion                                        | 5.0.2 - 5.0.5   | Medium   | GHSA-jxxr-4gwj-5jf2 | Yes                                                        |

## 3. Security Findings

### SEC-01: Moderate Vulnerabilities in Cypress Dependency Chain [Medium]

- **OWASP Category:** A06:2021 - Vulnerable and Outdated Components
- **Severity:** Medium
- **Affected:** `package.json` dependency graph (direct dependency `cypress` with transitive findings in `@cypress/request`, `qs`, and `brace-expansion`)
- **Description:** The current dependency audit reports four medium-severity vulnerabilities and no critical or high-severity vulnerabilities. The advisory chain includes `GHSA-q8mj-m7cp-5q26` and `GHSA-jxxr-4gwj-5jf2`.
- **Risk:** Even when concentrated in development/test tooling, unresolved vulnerable packages can increase supply-chain and CI environment exposure.
- **Expected Practice:** Keep direct and transitive development dependencies patched and re-audited on a regular cadence.
- **Recommendation:** Follow the package-maintainer-supported upgrade path that clears advisory ranges without introducing unsupported dependency states, then rerun dependency audit and update release handoff evidence.
- **References:** https://owasp.org/Top10/A06_2021-Vulnerable_and_Outdated_Components/ , https://angular.dev/best-practices/security , https://github.com/advisories/GHSA-q8mj-m7cp-5q26 , https://github.com/advisories/GHSA-jxxr-4gwj-5jf2
- **Spec Traceability:** TR-1.4, NFR-1.2, NFR-1.4

## 4. Authentication & Authorisation Summary

| Protected Route / Resource | Guard                                      | Token Storage                                       | Session Management                                                                  | Status                   |
| -------------------------- | ------------------------------------------ | --------------------------------------------------- | ----------------------------------------------------------------------------------- | ------------------------ |
| partida route              | Yes (`partidaSessionGuard` via `canMatch`) | No token storage pattern observed in reviewed scope | Route access is blocked when session configuration is absent and redirected to root | Secure in reviewed scope |
| root route                 | No guard required                          | Not applicable                                      | Public entry route for lobby and session setup                                      | Expected                 |

## 5. Transport Security Summary

| Control                 | Status                                      | Notes                                                                                                                             |
| ----------------------- | ------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| HTTPS enforcement       | Partial                                     | No HTTP API/resource endpoint usage was introduced in T-8 scope; deployment enforcement is outside this frontend-only task scope. |
| Content Security Policy | Configured                                  | CSP is present in `src/index.html` and restricts default, script, object, base-uri, and frame-ancestors sources.                  |
| CORS policy             | Not verifiable in frontend repository scope | Backend header policy is not defined in this codebase.                                                                            |
| SameSite cookies        | Not applicable in reviewed scope            | No cookie-based authentication mechanism is implemented by this task.                                                             |
| HSTS                    | Missing evidence in reviewed scope          | No server configuration artifact is available in this frontend repository to prove HSTS.                                          |

## 6. Spec Security Compliance

| NFR     | Requirement                  | Status                | Findings |
| ------- | ---------------------------- | --------------------- | -------- |
| NFR-1.1 | Visual correctness and trust | Met in reviewed scope | None     |
| NFR-1.2 | Consistency                  | Partial               | SEC-01   |
| NFR-1.3 | Accessibility stability      | Met in reviewed scope | None     |
| NFR-1.4 | Performance neutrality       | Partial               | SEC-01   |

## 7. Traceability Matrix

| Finding | Severity | OWASP    | Affected Component                                | Status |
| ------- | -------- | -------- | ------------------------------------------------- | ------ |
| SEC-01  | Medium   | A06:2021 | `package.json` dependency graph (`cypress` chain) | Open   |

## 8. Prioritised Recommendations

### Critical (fix before any deployment)

1. No critical findings were evidenced in this incremental review.

### High (fix before release)

1. No high findings were evidenced in this incremental review.

### Medium (fix in next sprint)

1. Resolve the medium cypress dependency advisory chain and verify closure with a fresh dependency audit.

### Low / Info (monitor and address)

1. Continue aligning release handoff security notes with current audit evidence to avoid stale risk statements.
