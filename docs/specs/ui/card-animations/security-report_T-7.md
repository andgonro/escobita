# Security Report: Card Animation System

**Review Mode:** Incremental (T-7: Implement player play and capture animation flows)
**Source:** docs/specs/ui/card-animations/
**Reviewed against:** spec.md (NFR-2, NFR-3), design.md (AD-1, AD-2, AD-4, AD-5), Angular Security Guide, OWASP Top 10:2021

## 1. Risk Summary

This incremental T-7 review found no new exploitable code-level issues in the scoped implementation for play and capture animation flows. Access to the game table route remains guarded, no dangerous DOM-sanitization bypass patterns were observed, and no credential exposure was identified in scoped files. The only open security issue is one Moderate transitive dependency vulnerability reported by npm audit.

- Total findings: 1 (0 Critical, 0 High, 1 Medium, 0 Low, 0 Info)
- Dependency vulnerabilities: 0 Critical, 0 High, 1 Medium (from npm audit)
- Most critical risk areas: vulnerable and outdated components
- Overall risk level: Medium

## 2. Dependency Vulnerabilities

Results of npm audit:

<<<<<<< Updated upstream
| Package | Version | Severity | CVE | Fix Available |
| --------------- | -------------- | -------- | ------------------- | ------------------------------------------------------ |
=======
| Package | Version | Severity | CVE | Fix Available |
|---------|---------|----------|-----|--------------|

> > > > > > > Stashed changes
> > > > > > > | brace-expansion | 5.0.2 to 5.0.5 | Moderate | GHSA-jxxr-4gwj-5jf2 | Yes (audit indicates a standard fix path is available) |

Total: 0 Critical, 0 High, 1 Medium, 0 Low

## 3. Security Findings

### SEC-01: Transitive dependency vulnerable to resource-exhaustion pattern [Medium]

<<<<<<< Updated upstream

=======

> > > > > > > Stashed changes

- **OWASP Category:** A06:2021 - Vulnerable and Outdated Components
- **Severity:** Medium
- **Affected:** Dependency graph (transitive package brace-expansion)
- **Description:** npm audit reports advisory GHSA-jxxr-4gwj-5jf2 for installed brace-expansion versions in the vulnerable range.
- **Risk:** Vulnerable range expansion logic can enable excessive processing in affected parsing paths, increasing denial-of-service risk.
- **Expected Practice:** Dependency trees should avoid known vulnerable ranges and be validated continuously.
- **Recommendation:** Update dependency resolution so the vulnerable brace-expansion range is removed, then keep dependency audit checks in CI/CD to prevent reintroduction.
- **References:** https://owasp.org/Top10/A06_2021-Vulnerable_and_Outdated_Components/, https://github.com/advisories/GHSA-jxxr-4gwj-5jf2
- **Spec Traceability:** NFR-6 (maintainability), US-14 (test and release readiness)

## 4. Authentication & Authorisation Summary

<<<<<<< Updated upstream
| Protected Route / Resource | Guard | Token Storage | Session Management | Status |
| ----------------------------------- | -------------------------------------- | ---------------------------------------------- | ------------------------------------ | ---------------------------------------------- |
| /partida route | Yes (partidaSessionGuard via canMatch) | No auth token storage observed in scoped files | In-memory session configuration gate | Secure for current frontend route-gating scope |
| T-7 play and capture animation flow | Not applicable | Not applicable | Not applicable | No auth regression observed |

## 5. Transport Security Summary

| Control                 | Status                         | Notes                                                                                                              |
| ----------------------- | ------------------------------ | ------------------------------------------------------------------------------------------------------------------ |
| HTTPS enforcement       | Partial evidence               | No non-TLS API endpoints were observed in scoped frontend code; final enforcement is server/deployment-controlled. |
| Content Security Policy | Configured                     | CSP meta policy is present in src/index.html with restrictive directives for script, style, image, and framing.    |
| CORS policy             | Out of frontend scope          | CORS policy is backend-controlled and cannot be fully verified from this incremental frontend task.                |
| SameSite cookies        | Not applicable in scoped files | No cookie-based session/token handling observed in reviewed T-7 implementation files.                              |
| HSTS                    | Out of frontend scope          | HSTS is a server response header and is not evidenced in frontend source files.                                    |

## 6. Spec Security Compliance

| NFR   | Requirement                                                                    | Status | Findings |
| ----- | ------------------------------------------------------------------------------ | ------ | -------- |
| NFR-2 | Keyboard navigation and focus behavior remain unaffected by animation behavior | Met    | None     |
| NFR-3 | Reduced-motion handling remains deterministic and safe                         | Met    | None     |

## 7. Traceability Matrix

| Finding | Severity | OWASP    | Affected Component                 | Status |
| ------- | -------- | -------- | ---------------------------------- | ------ |
| SEC-01  | Medium   | A06:2021 | Dependency graph (brace-expansion) | Open   |

=======
| Protected Route / Resource | Guard | Token Storage | Session Management | Status |
|---------------------------|-------|--------------|-------------------|--------|
| /partida route | Yes (partidaSessionGuard via canMatch) | No auth token storage observed in scoped files | In-memory session configuration gate | Secure for current frontend route-gating scope |
| T-7 play and capture animation flow | Not applicable | Not applicable | Not applicable | No auth regression observed |

## 5. Transport Security Summary

| Control                 | Status                         | Notes                                                                                                              |
| ----------------------- | ------------------------------ | ------------------------------------------------------------------------------------------------------------------ |
| HTTPS enforcement       | Partial evidence               | No non-TLS API endpoints were observed in scoped frontend code; final enforcement is server/deployment-controlled. |
| Content Security Policy | Configured                     | CSP meta policy is present in src/index.html with restrictive directives for script, style, image, and framing.    |
| CORS policy             | Out of frontend scope          | CORS policy is backend-controlled and cannot be fully verified from this incremental frontend task.                |
| SameSite cookies        | Not applicable in scoped files | No cookie-based session/token handling observed in reviewed T-7 implementation files.                              |
| HSTS                    | Out of frontend scope          | HSTS is a server response header and is not evidenced in frontend source files.                                    |

## 6. Spec Security Compliance

| NFR   | Requirement                                                                    | Status | Findings |
| ----- | ------------------------------------------------------------------------------ | ------ | -------- |
| NFR-2 | Keyboard navigation and focus behavior remain unaffected by animation behavior | Met    | None     |
| NFR-3 | Reduced-motion handling remains deterministic and safe                         | Met    | None     |

## 7. Traceability Matrix

| Finding | Severity | OWASP    | Affected Component                 | Status |
| ------- | -------- | -------- | ---------------------------------- | ------ |
| SEC-01  | Medium   | A06:2021 | Dependency graph (brace-expansion) | Open   |

> > > > > > > Stashed changes

## 8. Prioritised Recommendations

### Critical (fix before any deployment)

<<<<<<< Updated upstream

1. No Critical findings in this incremental review.

### High (fix before release)

1. No High findings in this incremental review.

### Medium (fix in next sprint)

1. Remove the vulnerable brace-expansion transitive range and verify the remediation with a fresh dependency audit.

### Low / Info (monitor and address)

=======

1. No Critical findings in this incremental review.

### High (fix before release)

1. No High findings in this incremental review.

### Medium (fix in next sprint)

1. Remove the vulnerable brace-expansion transitive range and verify the remediation with a fresh dependency audit.

### Low / Info (monitor and address)

> > > > > > > Stashed changes

1. Continue periodic verification of server-side transport headers (HSTS, Referrer-Policy, cookie flags) during deployment validation.
