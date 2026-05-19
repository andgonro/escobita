# Security Report: Card Animation System

**Review Mode:** Incremental (T-4: Wire atomic card visual animation states)
**Source:** `docs/specs/ui/card-animations/`
**Reviewed against:** spec.md (NFR-2, NFR-3), design.md (AD-4, AD-6), Angular Security Guide, OWASP Top 10:2021

## 1. Risk Summary

This incremental review is scoped to Task T-4 implementation surfaces for CardVisual, including component TypeScript, template, styles, and unit tests. No code-level vulnerabilities were evidenced in the reviewed files across OWASP Top 10 categories. No secrets were found in environment files for this scope. Dependency audit identified one Medium transitive advisory, with no Critical or High vulnerabilities.

- Total findings: 0 (0 Critical, 0 High, 0 Medium, 0 Low, 0 Info)
- Dependency vulnerabilities: 0 Critical, 0 High (from npm audit --json)
- Most critical risk areas: Transitive dependency hygiene (moderate advisory)
- Overall risk level: Low

## 2. Dependency Vulnerabilities

Results of npm audit --json:

| Package              | Version | Severity | CVE | Fix Available |
| -------------------- | ------- | -------- | --- | ------------- |
| None (Critical/High) | N/A     | N/A      | N/A | N/A           |

Total: 0 Critical, 0 High, 1 Medium, 0 Low

Medium advisory observed during the same audit run:

| Package         | Version       | Severity | CVE                 | Fix Available |
| --------------- | ------------- | -------- | ------------------- | ------------- |
| brace-expansion | 5.0.2 - 5.0.5 | Medium   | GHSA-jxxr-4gwj-5jf2 | Yes           |

## 3. Security Findings

No security findings were identified in the reviewed T-4 implementation scope.

## 4. Authentication & Authorisation Summary

| Protected Route / Resource | Guard                       | Token Storage         | Session Management                                         | Status                    |
| -------------------------- | --------------------------- | --------------------- | ---------------------------------------------------------- | ------------------------- |
| /partida route             | Yes (`partidaSessionGuard`) | Not used in T-4 scope | Route access requires an active game session configuration | Secure for reviewed scope |
| CardVisual component scope | Not applicable              | Not applicable        | Not applicable                                             | No auth impact            |

## 5. Transport Security Summary

| Control                 | Status                  | Notes                                                                                 |
| ----------------------- | ----------------------- | ------------------------------------------------------------------------------------- |
| HTTPS enforcement       | Partial                 | Not enforceable from T-4 frontend component scope; server deployment control required |
| Content Security Policy | Configured              | CSP is present in index document and unchanged by T-4                                 |
| CORS policy             | Not verifiable in scope | Backend header policy not defined in reviewed frontend task files                     |
| SameSite cookies        | Not verifiable in scope | No cookie/session implementation changes in T-4 files                                 |
| HSTS                    | Not verifiable in scope | Server header policy outside reviewed task scope                                      |

## 6. Spec Security Compliance

| NFR   | Requirement                                                                         | Status  | Findings                                                                                           |
| ----- | ----------------------------------------------------------------------------------- | ------- | -------------------------------------------------------------------------------------------------- |
| NFR-2 | Keyboard navigation and focus management must remain unaffected by animation states | Met     | None                                                                                               |
| NFR-3 | Reduced-motion accessibility preference must be respected                           | Partial | No violation in CardVisual itself, but full reduced-motion enforcement is completed in later tasks |

## 7. Traceability Matrix

| Finding | Severity | OWASP | Affected Component   | Status |
| ------- | -------- | ----- | -------------------- | ------ |
| None    | N/A      | N/A   | CardVisual T-4 scope | Closed |

## 8. Prioritised Recommendations

### Critical (fix before any deployment)

1. None.

### High (fix before release)

1. None.

### Medium (fix in next sprint)

1. Upgrade dependency chains to remove GHSA-jxxr-4gwj-5jf2 in brace-expansion and validate compatibility after upgrade. Reference: https://github.com/advisories/GHSA-jxxr-4gwj-5jf2

### Low / Info (monitor and address)

1. Continue validating that future animation tasks avoid unsafe DOM APIs and sanitization bypass patterns, aligned with Angular guidance: https://angular.dev/best-practices/security
2. Re-check CSP, HSTS, and CORS headers during deployment verification using OWASP secure headers guidance: https://owasp.org/www-project-secure-headers/
