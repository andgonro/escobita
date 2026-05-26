# Security Report: Laia Hand Capture Animation Bleed

**Review Mode:** Incremental (T-2: Enforce suppression and phase guard at metadata generation boundary)  
**Source:** docs/specs/ui/laia-hand-capture-animation-bleed/  
**Reviewed against:** spec.md (FR-1.2, FR-1.4, TR-1.1, TR-1.2, TR-1.3, NFR-1.1, NFR-1.2), design.md (AD-1, AD-2, AD-3), Angular Security Guide, OWASP Top 10:2021

## 1. Risk Summary

This incremental post-implementation security review was scoped to the T-2 files in GameTablePage logic and unit tests. No Critical, High, or Medium exploitable vulnerability was evidenced in the scoped implementation. The remaining concerns are low-impact hygiene and assurance observations. Dependency review shows no Critical or High package vulnerabilities, with Moderate findings limited to development dependency chains.

- Total findings: 2 (0 Critical, 0 High, 0 Medium, 1 Low, 1 Info)
- Dependency vulnerabilities: 0 Critical, 0 High (4 Moderate from npm audit)
- Most critical risk areas: runtime diagnostic logging hygiene; boundary-assurance strength in security-relevant unit tests
- Overall risk level: Low
- Blocker status: No blocker for T-2 based on current evidence

## 2. Dependency Vulnerabilities

Results of npm audit:

| Package                    | Version        | Severity       | CVE            | Fix Available  |
| -------------------------- | -------------- | -------------- | -------------- | -------------- |
| None (Critical/High scope) | Not applicable | Not applicable | Not applicable | Not applicable |

Total: 0 Critical, 0 High, 4 Medium, 0 Low.

Additional Medium advisories observed in development dependency paths:

- cypress (direct dev dependency), via @cypress/request and qs advisories
- brace-expansion advisory GHSA-jxxr-4gwj-5jf2
- qs advisory GHSA-q8mj-m7cp-5q26

## 3. Security Findings

### SEC-01: Runtime warning logs include operational turn context [Low]

- **OWASP Category:** A09:2021 - Security Logging and Monitoring Failures
- **Severity:** Low
- **Affected:** src/app/features/game-board/game-table-page/game-table-page.ts (AI orchestration error path)
- **Description:** The AI-turn failure path emits operational details into console warnings, including player identifier and turn context metadata.
- **Risk:** In shared devices, captured browser logs, or telemetry collectors, operational identifiers and state details can increase information exposure and aid behavioral profiling.
- **Expected Practice:** Production-facing logs should minimize contextual identifiers and avoid exposing unnecessary gameplay state details, while still retaining enough data for incident triage.
- **Recommendation:** Apply log-minimization policy for client runtime warnings and classify this path as controlled diagnostic output with environment-aware verbosity governance.
- **References:** https://owasp.org/Top10/A09_2021-Security_Logging_and_Monitoring_Failures/ ; https://angular.dev/best-practices/security
- **Spec Traceability:** NFR-1.1, NFR-1.2

### SEC-02: T-2 assertions rely heavily on internal component seams [Info]

- **OWASP Category:** A04:2021 - Insecure Design
- **Severity:** Info
- **Affected:** src/app/features/game-board/game-table-page/game-table-page.spec.ts
- **Description:** Several T-2-adjacent assertions validate behavior through internal signal reads and non-public method execution paths instead of only public interaction boundaries.
- **Risk:** This is not an exploit path. The risk is reduced confidence that security-relevant behavior remains correct at user-observable boundaries when internals evolve.
- **Expected Practice:** Security regression checks should prioritize boundary-level behavior, with internal seam checks used as supplemental evidence.
- **Recommendation:** Preserve internal seam tests where valuable, but reinforce T-2 security assertions with boundary-oriented scenarios that validate no-op opponent metadata outcomes through public surface behavior.
- **References:** https://owasp.org/Top10/A04_2021-Insecure_Design/ ; https://angular.dev/best-practices/security
- **Spec Traceability:** FR-1.2, FR-1.4, TR-1.2, NFR-1.2, AD-1, AD-3

## 4. Authentication & Authorisation Summary

| Protected Route / Resource                                                                                                                                               | Guard                          | Token Storage              | Session Management                 | Status                              |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------ | -------------------------- | ---------------------------------- | ----------------------------------- |
| GameTablePage scoped T-2 paths in src/app/features/game-board/game-table-page/game-table-page.ts and src/app/features/game-board/game-table-page/game-table-page.spec.ts | No auth route changes in scope | No token handling in scope | No auth lifecycle changes in scope | No new A01 or A07 concern evidenced |

## 5. Transport Security Summary

| Control                 | Status                           | Notes                                                                |
| ----------------------- | -------------------------------- | -------------------------------------------------------------------- |
| HTTPS enforcement       | Not evaluated in this task scope | Scoped files contain no API transport endpoint configuration changes |
| Content Security Policy | Not evaluated in this task scope | No header policy controls in scoped files                            |
| CORS policy             | Not evaluated in this task scope | No cross-origin policy changes in scoped files                       |
| SameSite cookies        | Not evaluated in this task scope | No cookie management logic in scoped files                           |
| HSTS                    | Not evaluated in this task scope | Server header configuration outside this incremental scope           |

## 6. Spec Security Compliance

| NFR     | Requirement                  | Status                        | Findings                         |
| ------- | ---------------------------- | ----------------------------- | -------------------------------- |
| NFR-1.1 | Visual correctness and trust | Met in scoped behavior review | SEC-01 (monitoring hygiene only) |
| NFR-1.2 | Consistency                  | Partial                       | SEC-01, SEC-02                   |
| NFR-1.3 | Accessibility stability      | Met in scoped security review | None                             |
| NFR-1.4 | Performance neutrality       | Met in scoped security review | None                             |

## 7. Traceability Matrix

| Finding | Severity | OWASP    | Affected Component                          | Status |
| ------- | -------- | -------- | ------------------------------------------- | ------ |
| SEC-01  | Low      | A09:2021 | GameTablePage AI orchestration warning path | Open   |
| SEC-02  | Info     | A04:2021 | GameTablePage test assurance seam strategy  | Open   |

## 8. Prioritised Recommendations

### Critical (fix before any deployment)

1. None.

### High (fix before release)

1. None.

### Medium (fix in next sprint)

1. Review Medium dependency advisories affecting development tooling and decide upgrade timing with CI stability considerations.

### Low / Info (monitor and address)

1. Reduce operational detail in client warning logs for AI orchestration failures.
2. Strengthen boundary-level regression checks for suppression and phase guard behavior alongside existing internal seam tests.
