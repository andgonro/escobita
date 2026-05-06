# Security Report: Round Progression and Match Over

**Review Mode:** Incremental (T-3: MatchContextHud implementation and interaction-handler refinements)
**Source:** docs/specs/ui/round-progression/
**Reviewed against:** spec.md (NFR-1.1, NFR-1.2, NFR-1.4, NFR-2.1, NFR-2.2), design.md (AD-2), Angular Security Guide, OWASP Top 10:2021

## 1. Risk Summary

This incremental security review covered the T-3 implementation surface in MatchContextHud component class, template, and stylesheet, plus task status evidence in tasks.md. No code-level vulnerabilities were found in the scoped files for broken access control, cryptographic failures, injection, authentication failures, logging leaks, or transport misuse. One Medium severity dependency finding remains at repository level from npm audit.

- Total findings: 1 (0 Critical, 0 High, 1 Medium, 0 Low, 0 Info)
- Dependency vulnerabilities: 0 Critical, 0 High, 2 Medium, 0 Low
- Most critical risk areas: transitive vulnerable dependency chain in development tooling
- Overall risk level: Low for scoped T-3 implementation, Medium for repository dependency baseline
- Blocker status for proceeding to T-4: No security blockers

## 2. Dependency Vulnerabilities

Results of npm audit --json:

| Package            | Version             | Severity | CVE                 | Fix Available |
| ------------------ | ------------------- | -------- | ------------------- | ------------- |
| express-rate-limit | 8.2.1 (transitive)  | Medium   | GHSA-v2v4-37r5-5v8g | Yes           |
| ip-address         | 10.1.0 (transitive) | Medium   | GHSA-v2v4-37r5-5v8g | Yes           |

Total: 0 Critical, 0 High, 2 Medium, 0 Low

## 3. Security Findings

### SEC-01: Transitive Dependency Advisory in Tooling Chain [Medium]

- **OWASP Category:** A06:2021 — Vulnerable and Outdated Components
- **Severity:** Medium
- **Affected:** Repository dependency graph represented in package-lock.json (express-rate-limit and ip-address)
- **Description:** npm audit reports GHSA-v2v4-37r5-5v8g affecting ip-address, with express-rate-limit flagged through that dependency relationship.
- **Risk:** Known vulnerable components in the build and test dependency chain can increase supply-chain risk in developer and CI environments.
- **Expected Practice:** Dependency advisories should be triaged promptly, with upgrades or documented temporary risk acceptance.
- **Recommendation:** Upgrade the affected chain to a non-vulnerable version set, validate compatibility in CI, and close the advisory in release tracking.
- **References:** https://owasp.org/Top10/A06_2021-Vulnerable_and_Outdated_Components/, https://angular.dev/best-practices/security, https://github.com/advisories/GHSA-v2v4-37r5-5v8g
- **Spec Traceability:** NFR-3.1 (maintainability and testability hygiene), AD-2

No additional security findings were observed in the scoped T-3 component files.

## 4. Authentication & Authorisation Summary

| Protected Route / Resource            | Guard                             | Token Storage              | Session Management           | Status                      |
| ------------------------------------- | --------------------------------- | -------------------------- | ---------------------------- | --------------------------- |
| MatchContextHud continuation controls | Not applicable in component scope | No token handling in scope | No session mutation in scope | ✅ Secure in reviewed scope |
| T-3 task status update entry          | Not applicable                    | Not applicable             | Not applicable               | ✅ No auth surface          |

## 5. Transport Security Summary

| Control                 | Status     | Notes                                                 |
| ----------------------- | ---------- | ----------------------------------------------------- |
| HTTPS enforcement       | ⚠️ Partial | Not configurable from reviewed T-3 component files    |
| Content Security Policy | ⚠️ Partial | No CSP changes in scope; no unsafe HTML sink observed |
| CORS policy             | ⚠️ Partial | Backend concern outside this incremental scope        |
| SameSite cookies        | ⚠️ Partial | No cookie handling in reviewed files                  |
| HSTS                    | ⚠️ Partial | Server-header concern outside this incremental scope  |

## 6. Spec Security Compliance

| NFR     | Requirement                                                      | Status     | Findings          |
| ------- | ---------------------------------------------------------------- | ---------- | ----------------- |
| NFR-1.1 | Start-next-round and view-winner controls are mutually exclusive | ✅ Met     | None              |
| NFR-1.2 | Match-over overlay requires explicit acknowledgement path        | ⚠️ Partial | None in T-3 scope |
| NFR-1.4 | Continuation controls must clear correctly after transition      | ⚠️ Partial | None in T-3 scope |
| NFR-2.1 | New controls are keyboard reachable                              | ✅ Met     | None              |
| NFR-2.2 | Live-region announcement consistency                             | ⚠️ Partial | None in T-3 scope |

## 7. Traceability Matrix

| Finding | Severity | OWASP    | Affected Component                                             | Status |
| ------- | -------- | -------- | -------------------------------------------------------------- | ------ |
| SEC-01  | Medium   | A06:2021 | Dependency graph entries for express-rate-limit and ip-address | Open   |

## 8. Prioritised Recommendations

### Critical (fix before any deployment)

1. None.

### High (fix before release)

1. None.

### Medium (fix in next sprint)

1. Remediate GHSA-v2v4-37r5-5v8g in the transitive dependency chain and retest CI workflows.

### Low / Info (monitor and address)

1. Keep a regression check that keyboard activation and pointer activation each trigger exactly one continuation action in MatchContextHud, to prevent future interaction-state integrity regressions.
