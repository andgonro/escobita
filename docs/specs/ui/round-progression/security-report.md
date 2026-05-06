# Security Report: Round Progression and Match Over

**Review Mode:** Incremental (T-4: Wire Start Next Round in GameTablePage, GREEN phase)
**Source:** docs/specs/ui/round-progression/
**Reviewed against:** spec.md (NFR-1.1, NFR-1.2, NFR-1.3, NFR-1.4, NFR-2.1, NFR-2.2), design.md (AD-5, TR-2.1), Angular Security Guide, OWASP Top 10:2021

## 1. Risk Summary

This incremental GREEN review was scoped to the implemented T-4 files: src/app/features/game-board/game-table-page/game-table-page.ts, src/app/features/game-board/game-table-page/game-table-page.html, and new T-4 tests in src/app/features/game-board/game-table-page/game-table-page.spec.ts, with supporting checks on routing/guard, environment files, and build configuration. No Critical or High security defects were found in the scoped implementation. The only actionable vulnerability remains a Medium dependency advisory in the repository baseline.

- Total findings: 2 (0 Critical, 0 High, 1 Medium, 0 Low, 1 Info)
- Dependency vulnerabilities: 0 Critical, 0 High, 2 Medium, 0 Low
- Most critical risk areas: transitive dependency advisory in tooling chain
- Overall risk level: Medium (repository baseline), Low for scoped T-4 implementation changes
- Blocker status: No security blocker for proceeding to the next task

## 2. Dependency Vulnerabilities

Results of npm audit --json:

| Package            | Version                    | Severity | CVE                                    | Fix Available |
| ------------------ | -------------------------- | -------- | -------------------------------------- | ------------- |
| ip-address         | <=10.1.0 (transitive)      | Medium   | GHSA-v2v4-37r5-5v8g (CVE not assigned) | Yes           |
| express-rate-limit | 8.0.1 - 8.5.0 (transitive) | Medium   | GHSA-v2v4-37r5-5v8g (via ip-address)   | Yes           |

Total: 0 Critical, 0 High, 2 Medium, 0 Low

## 3. Security Findings

### Medium Findings

### SEC-01: Transitive dependency advisory in project dependency graph [Medium]

- **OWASP Category:** A06:2021 — Vulnerable and Outdated Components
- **Severity:** Medium
- **Affected:** Repository dependency graph (ip-address, express-rate-limit)
- **Description:** npm audit reports advisory GHSA-v2v4-37r5-5v8g on ip-address, and express-rate-limit is flagged because it depends on vulnerable versions in the affected range.
- **Risk:** Vulnerable components increase supply-chain risk in development and CI environments where dependency code executes.
- **Expected Practice:** Dependency advisories should be triaged and remediated promptly, with temporary risk acceptance documented only when remediation is blocked.
- **Recommendation:** Apply the available dependency update path, then rerun audit and regression tests to confirm closure.
- **References:** https://owasp.org/Top10/A06_2021-Vulnerable_and_Outdated_Components/, https://angular.dev/best-practices/security, https://github.com/advisories/GHSA-v2v4-37r5-5v8g
- **Spec Traceability:** NFR-3.1 (maintainable component boundaries), NFR-3.2 (typed contracts and robustness)

### Info Findings

### SEC-02: Direct DOM query used for focus targeting is currently constrained but should remain non-user-controlled [Info]

- **OWASP Category:** A03:2021 — Injection
- **Severity:** Info
- **Affected:** src/app/features/game-board/game-table-page/game-table-page.ts (focusByTestIdAfterRender)
- **Description:** The implementation performs direct DOM querying through document.querySelector to locate elements by data-testid for post-render focus management. In current T-4 implementation this selector input is only passed from internal constant strings.
- **Risk:** If future changes allow user-controlled values into the selector path, this pattern can become an injection-adjacent sink and could enable unsafe DOM selection behavior.
- **Expected Practice:** Keep selector tokens internal and trusted, and avoid wiring user input into DOM query selector strings.
- **Recommendation:** Preserve the current trusted-input contract for focus selectors and include review checks to ensure no external input reaches this method.
- **References:** https://owasp.org/Top10/A03_2021-Injection/, https://angular.dev/best-practices/security
- **Spec Traceability:** TR-2.1, NFR-2.2

No additional exploitable OWASP Top 10 violations were observed in the scoped T-4 implementation files.

## 4. Authentication & Authorisation Summary

| Protected Route / Resource       | Guard                                                                                              | Token Storage | Session Management                         | Status                      |
| -------------------------------- | -------------------------------------------------------------------------------------------------- | ------------- | ------------------------------------------ | --------------------------- |
| /partida route                   | partidaSessionGuard (canMatch)                                                                     | None observed | Session configuration gate via GameSession | ✅ Secure for current scope |
| T-4 Start Next Round action path | UI gating via roundResult and matchWinner conditions; engine enforces state transition constraints | None observed | In-memory engine state transition only     | ✅ Secure for current scope |

## 5. Transport Security Summary

| Control                 | Status              | Notes                                                                                                           |
| ----------------------- | ------------------- | --------------------------------------------------------------------------------------------------------------- |
| HTTPS enforcement       | ⚠️ Partial          | No insecure HTTP endpoints in reviewed T-4 files; server-side HTTPS enforcement not evidenced in frontend scope |
| Content Security Policy | ✅ Configured       | CSP meta policy is present in src/index.html with restrictive defaults                                          |
| CORS policy             | ⚠️ Partial          | Backend header policy is outside this frontend task scope                                                       |
| SameSite cookies        | ⚠️ Partial          | No cookie-based auth/session handling observed in reviewed files                                                |
| HSTS                    | ❌ Missing evidence | No server-header evidence available in repository frontend scope                                                |

## 6. Spec Security Compliance

| NFR     | Requirement                                                                        | Status     | Findings                                                                          |
| ------- | ---------------------------------------------------------------------------------- | ---------- | --------------------------------------------------------------------------------- |
| NFR-1.1 | Start Next Round and View Winner controls are mutually exclusive                   | ✅ Met     | Verified through game-table-page computed logic and tests (no violation observed) |
| NFR-1.2 | Match-over overlay must require explicit acknowledgement and never auto-open       | ⚠️ Partial | T-4 binds viewWinner event but full overlay orchestration is deferred to T-6      |
| NFR-1.3 | Play Again must produce a fresh secure state                                       | ⚠️ Partial | Out of T-4 scope (implemented in later task)                                      |
| NFR-1.4 | After Start Next Round, round breakdown and controls must clear                    | ✅ Met     | Verified in scoped T-4 tests                                                      |
| NFR-2.1 | New controls must be keyboard reachable                                            | ✅ Met     | T-4 wiring preserves native button interaction path from HUD outputs              |
| NFR-2.2 | Round completion and winner announcements should use existing live region patterns | ✅ Met     | Round completion announcement effect implemented and covered by tests             |

## 7. Traceability Matrix

| Finding | Severity | OWASP    | Affected Component                    | Status  |
| ------- | -------- | -------- | ------------------------------------- | ------- |
| SEC-01  | Medium   | A06:2021 | Repository dependency graph           | Open    |
| SEC-02  | Info     | A03:2021 | GameTablePage focus management helper | Monitor |

## 8. Prioritised Recommendations

### Critical (fix before any deployment)

1. None.

### High (fix before release)

1. None.

### Medium (fix in next sprint)

1. Remediate GHSA-v2v4-37r5-5v8g in the transitive dependency chain and verify with a fresh audit run.

### Low / Info (monitor and address)

1. Keep focus selector values internal-only in GameTablePage focus handling so direct DOM querying cannot become user-influenced.

## 9. Task Status Update

- Task reviewed: T-4 GREEN implementation scope
- Security review status: Completed
- Proceed/block decision for next task: Proceed (no Critical or High blockers)
