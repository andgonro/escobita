# Security Report: Round Progression and Match Over

**Review Mode:** Incremental (T-2: Add round-progression computed properties to GameTablePage)  
**Source:** docs/specs/ui/round-progression/  
**Reviewed against:** spec.md (NFR-1.1, NFR-1.2, NFR-1.3, NFR-1.4, NFR-2.1, NFR-2.2), design.md (AD-4, AD-7, AD-8), Angular Security Guide, OWASP Top 10:2021

## 1. Risk Summary

This incremental review is scoped to T-2 implementation surfaces, centered on GameTablePage state derivation and visibility gates. No code-level Critical or High security weaknesses were observed in the task scope. One Medium supply-chain finding remains from dependency audit results.

- Total findings: 1 (0 Critical, 0 High, 1 Medium, 0 Low, 0 Info)
- Dependency vulnerabilities: 0 Critical, 0 High, 4 Medium
- Most critical risk areas: vulnerable and outdated components in the development dependency graph
- Overall risk level: Medium

## 2. Dependency Vulnerabilities

Results of npm audit --json:

| Package                   | Version                                  | Severity | CVE                                                                                                | Fix Available                                                                   |
| ------------------------- | ---------------------------------------- | -------- | -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| @angular/cli              | 21.2.8 (direct dev dependency)           | Medium   | GHSA-v2v4-37r5-5v8g (transitive via @modelcontextprotocol/sdk -> express-rate-limit -> ip-address) | Yes (tool-reported remediation path via @angular/cli 21.1.2, semver-major flag) |
| @modelcontextprotocol/sdk | Transitive via @angular/cli              | Medium   | GHSA-v2v4-37r5-5v8g                                                                                | Yes (through dependency-chain upgrade)                                          |
| express-rate-limit        | Transitive via @modelcontextprotocol/sdk | Medium   | GHSA-v2v4-37r5-5v8g                                                                                | Yes (through dependency-chain upgrade)                                          |
| ip-address                | Transitive dependency                    | Medium   | GHSA-v2v4-37r5-5v8g                                                                                | Yes (through dependency-chain upgrade)                                          |

Total: 0 Critical, 0 High, 4 Medium, 0 Low

## 3. Security Findings

### SEC-01: Development Dependency Vulnerability Chain in CLI Tooling [Medium]

- **OWASP Category:** A06:2021 — Vulnerable and Outdated Components
- **Severity:** Medium
- **Affected:** package.json dependency graph anchored at @angular/cli, with advisory path through @modelcontextprotocol/sdk, express-rate-limit, and ip-address
- **Description:** Dependency audit reports advisory GHSA-v2v4-37r5-5v8g in the current development toolchain dependency graph.
- **Risk:** Unresolved supply-chain vulnerabilities in development and CI tooling can increase exposure to compromised build or test environments and weaken overall release assurance.
- **Expected Practice:** Dependency advisories at Medium severity and above should be triaged promptly with documented remediation or explicit, time-bounded risk acceptance.
- **Recommendation:** Validate the safest upgrade route for the Angular CLI dependency chain, apply remediation in a controlled update, and keep recurring audit checks with tracked exceptions in release governance.
- **References:** https://owasp.org/Top10/A06_2021-Vulnerable_and_Outdated_Components/, https://angular.dev/best-practices/security, https://github.com/advisories/GHSA-v2v4-37r5-5v8g
- **Spec Traceability:** NFR-3.1 (maintainability), AD-7 (typed view-model boundary discipline)

## 4. Authentication & Authorisation Summary

| Protected Route / Resource | Guard                         | Token Storage                                  | Session Management                            | Status                           |
| -------------------------- | ----------------------------- | ---------------------------------------------- | --------------------------------------------- | -------------------------------- |
| /partida                   | Yes (partidaSessionGuard)     | No token storage pattern observed in T-2 scope | Session configuration check gates route entry | Secure for current feature scope |
| /                          | No guard (public lobby route) | Not applicable                                 | Lobby remains public by design                | Acceptable by design             |

## 5. Transport Security Summary

| Control                 | Status                                     | Notes                                                                                    |
| ----------------------- | ------------------------------------------ | ---------------------------------------------------------------------------------------- |
| HTTPS enforcement       | Partial                                    | Frontend code cannot enforce HTTPS alone; deployment configuration remains authoritative |
| Content Security Policy | Configured                                 | CSP directive is present in src/index.html                                               |
| CORS policy             | Not assessable in frontend-only task scope | Backend policy not represented in T-2 implementation files                               |
| SameSite cookies        | Not assessable in scope                    | No cookie-based session mechanism is implemented in T-2 scope                            |
| HSTS                    | Not evidenced in frontend files            | HSTS is a server header concern outside frontend source control                          |
| Referrer-Policy         | Missing evidence                           | No explicit Referrer-Policy metadata observed in index-level document                    |

## 6. Spec Security Compliance

| NFR     | Requirement                                                      | Status                             | Findings |
| ------- | ---------------------------------------------------------------- | ---------------------------------- | -------- |
| NFR-1.1 | Start-next-round and view-winner controls are mutually exclusive | ✅ Met in T-2 logic layer          | None     |
| NFR-1.2 | Match-over overlay must require explicit acknowledgement path    | ⚠️ Partial in T-2 scope            | None     |
| NFR-1.3 | Play-again starts a fresh match state                            | ⚠️ Not in T-2 implementation scope | None     |
| NFR-1.4 | roundResult reset after continuation                             | ⚠️ Not in T-2 implementation scope | None     |
| NFR-2.1 | Keyboard reachability of new controls                            | ⚠️ Not in T-2 implementation scope | None     |
| NFR-2.2 | Live-region announcement consistency                             | ⚠️ Not in T-2 implementation scope | None     |

## 7. Traceability Matrix

| Finding | Severity | OWASP    | Affected Component                                  | Status |
| ------- | -------- | -------- | --------------------------------------------------- | ------ |
| SEC-01  | Medium   | A06:2021 | Development dependency chain rooted at @angular/cli | Open   |

## 8. Prioritised Recommendations

### Critical (fix before any deployment)

1. None identified in this incremental T-2 review.

### High (fix before release)

1. None identified in this incremental T-2 review.

### Medium (fix in next sprint)

1. Remediate GHSA-v2v4-37r5-5v8g exposure in the CLI dependency chain or document a time-bounded risk acceptance with monitoring.

### Low / Info (monitor and address)

1. Keep transport-header verification in release checks, including Referrer-Policy and HSTS at deployment level.
