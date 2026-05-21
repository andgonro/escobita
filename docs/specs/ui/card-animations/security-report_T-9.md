# Security Report: Card Animation System

**Review Mode:** Incremental (T-9: Implement Escoba mandatory burst emphasis)
**Source:** docs/specs/ui/card-animations/
**Reviewed against:** spec.md (NFR-2, NFR-3, NFR-7), design.md (AD-6), Angular Security Guide, OWASP Top 10:2021

## 1. Risk Summary

This incremental review found no confirmed code-level security defects in the T-9 implementation scope across GameTablePage orchestration, CenterTableZone rendering, and CardVisual rendering. The remaining open risk is one moderate-severity vulnerable transitive dependency identified by dependency audit.

- Total findings: 1 (0 Critical, 0 High, 1 Medium, 0 Low, 0 Info)
- Dependency vulnerabilities: 0 Critical, 0 High, 1 Medium
- Most critical risk areas: vulnerable and outdated transitive components (A06:2021)
- Overall risk level: Medium

## 2. Dependency Vulnerabilities

Results from npm audit JSON execution on May 21, 2026:

<<<<<<< Updated upstream
| Package | Version | Severity | CVE | Fix Available |
| --------------- | ------------------ | -------- | ------------------- | --------------------------- |
| brace-expansion | 5.0.5 (transitive) | Medium | GHSA-jxxr-4gwj-5jf2 | Yes (update to fixed range) |
=======
| Package | Version | Severity | CVE | Fix Available |
|---------|---------|----------|-----|--------------|
| brace-expansion | 5.0.5 (transitive) | Medium | GHSA-jxxr-4gwj-5jf2 | Yes (update to fixed range) |

> > > > > > > Stashed changes

Total: 0 Critical, 0 High, 1 Medium, 0 Low

No Critical or High dependency vulnerabilities were reported.

## 3. Security Findings

### SEC-01: Vulnerable transitive dependency in package graph [Medium]

<<<<<<< Updated upstream

=======

> > > > > > > Stashed changes

- **OWASP Category:** A06:2021 - Vulnerable and Outdated Components
- **Severity:** Medium
- **Affected:** package dependency graph resolved from package.json and lockfile during npm audit
- **Description:** Dependency audit reported brace-expansion version 5.0.5 in a vulnerable range tied to GHSA-jxxr-4gwj-5jf2.
- **Risk:** Exploitation can lead to excessive resource consumption and denial-of-service conditions in affected expansion flows.
- **Expected Practice:** Keep transitive dependency trees on non-vulnerable versions and continuously enforce audit baselines in CI.
- **Recommendation:** Upgrade dependency resolution to a fixed brace-expansion version, verify with a clean audit rerun, and enforce CI policy that blocks unresolved Medium and above advisories for release branches.
- **References:** https://owasp.org/Top10/A06_2021-Vulnerable_and_Outdated_Components/, https://angular.dev/best-practices/security, https://github.com/advisories/GHSA-jxxr-4gwj-5jf2
- **Spec Traceability:** NFR-7, AD-6

## 4. Authentication & Authorisation Summary

<<<<<<< Updated upstream
| Protected Route / Resource | Guard | Token Storage | Session Management | Status |
| ------------------------------ | ------------------------------------------- | --------------------------------------------------------------- | ---------------------------------------------------------------- | ------------------------ |
| /partida game-table route | Yes, canMatch guard via partidaSessionGuard | No token storage pattern observed in reviewed T-9 scope | Session configuration gate is enforced before route use | Secure in reviewed scope |
| Lobby to game-table transition | Guarded | No hardcoded credentials in reviewed scope or environment files | Session bootstrap checks are present before table initialization | Secure in reviewed scope |

## 5. Transport Security Summary

| Control                 | Status                         | Notes                                                                                     |
| ----------------------- | ------------------------------ | ----------------------------------------------------------------------------------------- |
| HTTPS enforcement       | Enforced                       | Team confirmed enforcement by centralized deployment controls outside this repository     |
| Content Security Policy | Configured                     | CSP meta policy is present in src/index.html and restricts scripts, objects, and framing  |
| CORS policy             | Enforced                       | Team confirmed CORS restrictions are centrally enforced outside this repository           |
| SameSite cookies        | Partial                        | No cookie-based session controls are implemented in the reviewed frontend task scope      |
| HSTS                    | Enforced                       | Team confirmed HSTS is handled by centralized deployment controls outside this repository |
| Referrer Policy         | Missing evidence in repository | No explicit frontend referrer policy meta setting was observed in the reviewed files      |

## 6. Spec Security Compliance

| NFR   | Requirement                                                              | Status | Findings |
| ----- | ------------------------------------------------------------------------ | ------ | -------- |
| NFR-2 | Keyboard navigation and focus management remain unaffected by animations | Met    | None     |
| NFR-3 | Reduced-motion preference is respected while gameplay remains functional | Met    | None     |
| NFR-7 | Escoba visual emphasis remains consistent with product visual language   | Met    | None     |

## 7. Traceability Matrix

| Finding | Severity | OWASP    | Affected Component                                    | Status |
| ------- | -------- | -------- | ----------------------------------------------------- | ------ |
| SEC-01  | Medium   | A06:2021 | Dependency graph (brace-expansion transitive package) | Open   |

=======
| Protected Route / Resource | Guard | Token Storage | Session Management | Status |
|---------------------------|-------|--------------|-------------------|--------|
| /partida game-table route | Yes, canMatch guard via partidaSessionGuard | No token storage pattern observed in reviewed T-9 scope | Session configuration gate is enforced before route use | Secure in reviewed scope |
| Lobby to game-table transition | Guarded | No hardcoded credentials in reviewed scope or environment files | Session bootstrap checks are present before table initialization | Secure in reviewed scope |

## 5. Transport Security Summary

| Control                 | Status                         | Notes                                                                                     |
| ----------------------- | ------------------------------ | ----------------------------------------------------------------------------------------- |
| HTTPS enforcement       | Enforced                       | Team confirmed enforcement by centralized deployment controls outside this repository     |
| Content Security Policy | Configured                     | CSP meta policy is present in src/index.html and restricts scripts, objects, and framing  |
| CORS policy             | Enforced                       | Team confirmed CORS restrictions are centrally enforced outside this repository           |
| SameSite cookies        | Partial                        | No cookie-based session controls are implemented in the reviewed frontend task scope      |
| HSTS                    | Enforced                       | Team confirmed HSTS is handled by centralized deployment controls outside this repository |
| Referrer Policy         | Missing evidence in repository | No explicit frontend referrer policy meta setting was observed in the reviewed files      |

## 6. Spec Security Compliance

| NFR   | Requirement                                                              | Status | Findings |
| ----- | ------------------------------------------------------------------------ | ------ | -------- |
| NFR-2 | Keyboard navigation and focus management remain unaffected by animations | Met    | None     |
| NFR-3 | Reduced-motion preference is respected while gameplay remains functional | Met    | None     |
| NFR-7 | Escoba visual emphasis remains consistent with product visual language   | Met    | None     |

## 7. Traceability Matrix

| Finding | Severity | OWASP    | Affected Component                                    | Status |
| ------- | -------- | -------- | ----------------------------------------------------- | ------ |
| SEC-01  | Medium   | A06:2021 | Dependency graph (brace-expansion transitive package) | Open   |

> > > > > > > Stashed changes

## 8. Prioritised Recommendations

### Critical (fix before any deployment)

<<<<<<< Updated upstream

1. No Critical findings in this incremental review.

### High (fix before release)

1. No High findings in this incremental review.

### Medium (fix in next sprint)

1. Remediate GHSA-jxxr-4gwj-5jf2 by updating dependency resolution for brace-expansion and enforce dependency audit policy gates in CI.

### Low / Info (monitor and address)

=======

1. No Critical findings in this incremental review.

### High (fix before release)

1. No High findings in this incremental review.

### Medium (fix in next sprint)

1. Remediate GHSA-jxxr-4gwj-5jf2 by updating dependency resolution for brace-expansion and enforce dependency audit policy gates in CI.

### Low / Info (monitor and address)

> > > > > > > Stashed changes

1. Add explicit release evidence for centralized transport headers and policies, including Referrer-Policy, in deployment security documentation.
