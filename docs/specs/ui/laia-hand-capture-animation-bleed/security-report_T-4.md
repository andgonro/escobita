# Security Report: Laia Hand Capture Animation Bleed

**Review Mode:** Incremental (T-4: Add unit coverage for capture isolation rules)
**Source:** docs/specs/ui/laia-hand-capture-animation-bleed/
**Reviewed against:** spec.md (FR-1.2, FR-1.3, TR-1.1, NFR-1.1, NFR-1.2, NFR-1.3, NFR-1.4), design.md (AD-1, AD-2, AD-3), Angular Security Guide, OWASP Top 10:2021

## 1. Risk Summary

Incremental review of T-4 scoped changes and related runtime behavior found no new exploitable application-level vulnerabilities introduced by the GREEN implementation. Opponent metadata isolation for human capture visual states is consistent with intended trust-boundary behavior in single-player mode, and no credential storage, sanitizer bypass, dynamic code execution, or token-handling anti-patterns were observed in the reviewed scope. One medium-severity finding remains in dependency hygiene due moderate advisories in the development testing toolchain.

- Total findings: 1 (0 Critical, 0 High, 1 Medium, 0 Low, 0 Info)
- Dependency vulnerabilities: 0 Critical, 0 High, 4 Moderate
- Most critical risk areas: vulnerable and outdated development components
- Overall risk level: Medium
- Blocker status: No blocker for T-4 release from scoped application code; dependency remediation is required through normal security maintenance

## 2. Dependency Vulnerabilities

Results of npm audit --json:

| Package          | Version (Observed Range)                           | Severity | CVE                                                 | Fix Available                                         |
| ---------------- | -------------------------------------------------- | -------- | --------------------------------------------------- | ----------------------------------------------------- |
| brace-expansion  | 5.0.2 - 5.0.5                                      | Moderate | Not assigned (GHSA-jxxr-4gwj-5jf2)                  | Yes                                                   |
| qs               | 6.11.1 - 6.15.1                                    | Moderate | Not assigned (GHSA-q8mj-m7cp-5q26)                  | Yes (via Cypress dependency update path)              |
| @cypress/request | >=3.0.3                                            | Moderate | Not assigned (inherited from qs advisory chain)     | Yes (via Cypress dependency update path)              |
| cypress          | Advisory feed marks versions >=13.15.0 as affected | Moderate | Not assigned (inherited via @cypress/request chain) | Advisory indicates a version change path is available |

Total: 0 Critical, 0 High, 4 Moderate, 0 Low

## 3. Security Findings

### SEC-01: Moderate Vulnerabilities in Development Test Dependency Chain [Medium]

- **OWASP Category:** A06:2021 — Vulnerable and Outdated Components
- **Severity:** Medium
- **Affected:** package.json development dependency chain (Cypress and transitive modules)
- **Description:** Dependency audit reported four moderate vulnerabilities in end-to-end testing toolchain packages and transitive dependencies. No high or critical advisory is currently present.
- **Risk:** Although impact is primarily in development and CI environments, vulnerable build and test tooling expands supply-chain and pipeline attack surface.
- **Expected Practice:** Keep direct and transitive dependencies patched to supported non-vulnerable versions and periodically revalidate advisories.
- **Recommendation:** Perform a controlled dependency update review for Cypress and its transitive dependency chain, validate CI compatibility, and document temporary risk acceptance if immediate upgrade is not feasible.
- **References:** https://owasp.org/Top10/A06_2021-Vulnerable_and_Outdated_Components/ , https://angular.dev/best-practices/security , https://github.com/advisories/GHSA-jxxr-4gwj-5jf2 , https://github.com/advisories/GHSA-q8mj-m7cp-5q26
- **Spec Traceability:** NFR-1.2, AD-4

## 4. Authentication and Authorisation Summary

| Protected Route / Resource             | Guard                                | Token Storage                   | Session Management                 | Status                           |
| -------------------------------------- | ------------------------------------ | ------------------------------- | ---------------------------------- | -------------------------------- |
| /partida route                         | Yes (partida session canMatch guard) | None observed in reviewed scope | Missing session redirects to lobby | Secure for current feature scope |
| GameTablePage metadata derivation flow | Not an authentication boundary       | None observed in reviewed scope | Not applicable                     | Secure for current feature scope |

## 5. Transport Security Summary

| Control                 | Status                           | Notes                                                                                                                                                         |
| ----------------------- | -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| HTTPS enforcement       | Partial                          | No hardcoded HTTP API endpoints observed in reviewed files; full enforcement is deployment-controlled and not fully verifiable from this frontend task scope. |
| Content Security Policy | Configured                       | CSP is present in src/index.html and restricts script and style origins with nonce-based style control.                                                       |
| CORS policy             | Not verifiable in this scope     | Backend header configuration is outside reviewed frontend files.                                                                                              |
| SameSite cookies        | Not applicable in reviewed scope | No cookie-based authentication/session implementation observed in scoped files.                                                                               |
| HSTS                    | Not verifiable in this scope     | Server header configuration is outside reviewed frontend files.                                                                                               |

## 6. Spec Security Compliance

| NFR     | Requirement                          | Status | Findings |
| ------- | ------------------------------------ | ------ | -------- |
| NFR-1.1 | Visual correctness and trust         | Met    | None     |
| NFR-1.2 | Consistency across capture scenarios | Met    | None     |
| NFR-1.3 | Accessibility stability              | Met    | None     |
| NFR-1.4 | Performance neutrality               | Met    | None     |

## 7. Traceability Matrix

| Finding | Severity | OWASP    | Affected Component           | Status |
| ------- | -------- | -------- | ---------------------------- | ------ |
| SEC-01  | Medium   | A06:2021 | Development dependency chain | Open   |

## 8. Prioritised Recommendations

### Critical (fix before any deployment)

1. No critical findings in this incremental review.

### High (fix before release)

1. No high findings in this incremental review.

### Medium (fix in next sprint)

1. Triage and remediate the moderate npm audit findings in the Cypress dependency chain, then re-run security review to confirm closure.

### Low / Info (monitor and address)

1. Continue incremental reviews for remaining tasks to ensure no new injection, credential, authentication, or transport regressions are introduced.
