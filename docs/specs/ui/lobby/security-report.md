# Security Report: Lobby Screen

**Review Mode:** Incremental (task lobby-feature)
**Source:** docs/specs/ui/lobby/
**Reviewed against:** spec.md, proposal.md, user-stories.md, Angular Security Guide, OWASP Top 10:2021
**Artifact gaps noted during discovery:** design.md and tasks.md are not present in this feature folder, so task scope was inferred from lobby delta files and related implementation.

## 1. Risk Summary

This incremental review was re-run after the latest BDD expansion and explicit keyboard mode-handler updates. No Critical or High findings were identified in code-level analysis or dependency audit results. The security posture remains non-blocking for task completion, with residual risk limited to Medium and below findings that were already present before this delta and remain open.

- Total findings: 5 (0 Critical, 0 High, 2 Medium, 2 Low, 1 Info)
- Dependency vulnerabilities: 0 Critical, 0 High, 4 Moderate, 2 Low
- Most critical risk areas: dependency hygiene in the Cypress chain, missing CSP evidence
- Overall risk level: Medium

Delta-specific outcome:

- No new Critical or High findings introduced by changes in cypress/e2e/lobby.feature, cypress/e2e/lobby.ts, or src/app/features/lobby/lobby/lobby.html.
- No Medium, Low, or Info findings changed in severity due to this delta.

## 2. Dependency Vulnerabilities

Results of npm audit --json:

npm audit reports no Critical or High vulnerabilities.

| Package                                 | Version    | Severity | CVE or Advisory                                           | Fix Available                                        |
| --------------------------------------- | ---------- | -------- | --------------------------------------------------------- | ---------------------------------------------------- |
| @badeball/cypress-cucumber-preprocessor | 24.0.1     | Moderate | GHSA-w5hq-g745-h8pq (via uuid chain)                      | Yes (manual SemVer-major path reported by npm audit) |
| cypress                                 | 15.14.1    | Moderate | GHSA-w5hq-g745-h8pq (via @cypress/request and uuid chain) | Yes (manual SemVer-major path reported by npm audit) |
| @cypress/request                        | transitive | Moderate | GHSA-w5hq-g745-h8pq (via uuid)                            | Yes (through Cypress dependency path)                |
| uuid                                    | transitive | Moderate | GHSA-w5hq-g745-h8pq                                       | Yes (through dependency graph update)                |
| mocha                                   | 11.7.5     | Low      | GHSA-73rr-hh4g-fpgx (via diff)                            | Yes                                                  |
| diff                                    | transitive | Low      | GHSA-73rr-hh4g-fpgx                                       | Yes                                                  |

Total: 0 Critical, 0 High, 4 Moderate, 2 Low

## 3. Security Findings

### SEC-01: Moderate advisory exposure in direct and transitive Cypress dependency chain [Medium]

- **OWASP Category:** A06:2021 — Vulnerable and Outdated Components
- **Severity:** Medium
- **Affected:** package.json and package-lock.json dependency chain for @badeball/cypress-cucumber-preprocessor, cypress, @cypress/request, and uuid
- **Description:** npm audit reports Moderate advisories affecting the test stack used by the lobby feature's expanded BDD coverage.
- **Risk:** Vulnerable developer and CI dependencies can weaken pipeline integrity and increase exploitation opportunities in non-production execution contexts.
- **Expected Practice:** Keep direct and transitive dependencies patched, with recurring vulnerability review in release readiness checks.
- **Recommendation:** Plan and validate a safe upgrade path for the Cypress and cucumber-preprocessor chain; document temporary risk acceptance if immediate major-version migration is not feasible.
- **References:** https://owasp.org/Top10/A06_2021-Vulnerable_and_Outdated_Components/, https://github.com/advisories/GHSA-w5hq-g745-h8pq, https://angular.dev/best-practices/security
- **Spec Traceability:** No explicit dependency-vulnerability NFR exists in spec.md; this impacts security posture for the delivery pipeline.

### SEC-02: No evidence of Content Security Policy enforcement [Medium]

- **OWASP Category:** A05:2021 — Security Misconfiguration
- **Severity:** Medium
- **Affected:** src/index.html and deployment header configuration (not represented in this repository)
- **Description:** No CSP definition is present in the reviewed frontend scope.
- **Risk:** If XSS or injection is introduced later, missing CSP increases exploitability and blast radius.
- **Expected Practice:** Enforce a restrictive CSP at hosting or gateway level and verify it against Angular runtime needs.
- **Recommendation:** Define CSP in deployment configuration and make CSP validation part of release checks.
- **References:** https://owasp.org/Top10/A05_2021-Security_Misconfiguration/, https://cheatsheetseries.owasp.org/cheatsheets/Content_Security_Policy_Cheat_Sheet.html, https://angular.dev/best-practices/security
- **Spec Traceability:** Security hardening control not explicitly captured in current feature NFRs.

### SEC-03: Low-severity transitive advisory remains in mocha and diff chain [Low]

- **OWASP Category:** A06:2021 — Vulnerable and Outdated Components
- **Severity:** Low
- **Affected:** package-lock.json transitive chain for mocha and diff
- **Description:** npm audit reports a Low advisory in diff, affecting mocha transitively.
- **Risk:** Low direct exploitability in this application context, but unresolved advisories reduce dependency hygiene.
- **Expected Practice:** Keep transitive trees patched as part of routine maintenance.
- **Recommendation:** Include mocha and diff remediation in the next dependency maintenance window.
- **References:** https://owasp.org/Top10/A06_2021-Vulnerable_and_Outdated_Components/, https://github.com/advisories/GHSA-73rr-hh4g-fpgx
- **Spec Traceability:** Security hardening expectation is implicit.

### SEC-04: External runtime font import adds third-party supply chain dependency [Low]

- **OWASP Category:** A08:2021 — Software and Data Integrity Failures
- **Severity:** Low
- **Affected:** src/styles.scss
- **Description:** Global styles load fonts from a third-party domain at runtime.
- **Risk:** Third-party availability and integrity events can affect rendering reliability and broaden supply-chain exposure.
- **Expected Practice:** Security-sensitive deployments favor self-hosted assets with strict source controls.
- **Recommendation:** Evaluate self-hosting fonts and constraining style and font origins with CSP.
- **References:** https://owasp.org/Top10/A08_2021-Software_and_Data_Integrity_Failures/, https://angular.dev/best-practices/security
- **Spec Traceability:** Related to TR-5 styling implementation.

### SEC-05: Public route model remains acceptable for anonymous MVP but requires future guard strategy [Info]

- **OWASP Category:** A01:2021 — Broken Access Control
- **Severity:** Info
- **Affected:** src/app/app.routes.ts, src/app/features/lobby/lobby/lobby.ts, src/app/core/services/game-session.ts
- **Description:** Lobby and game-board placeholder routes are public and do not implement guards.
- **Risk:** Current risk is low for anonymous local setup. Risk becomes material if account-based or privileged features are later introduced without access-control design.
- **Expected Practice:** Introduce route and service authorization controls before any sensitive or user-bound capability is added.
- **Recommendation:** Define a guard and authorization strategy in future design artifacts prior to auth-enabled feature expansion.
- **References:** https://owasp.org/Top10/A01_2021-Broken_Access_Control/, https://angular.dev/best-practices/security
- **Spec Traceability:** Related to FR-1 and TR-1 route architecture.

## 4. Authentication & Authorisation Summary

| Protected Route or Resource       | Guard | Token Storage | Session Management                | Status                                                             |
| --------------------------------- | ----- | ------------- | --------------------------------- | ------------------------------------------------------------------ |
| / (Lobby)                         | No    | None observed | In-memory game configuration only | Secure for current anonymous MVP flow                              |
| /partida (Game board placeholder) | No    | None observed | In-memory game configuration only | Acceptable now, requires guard strategy before sensitive expansion |

## 5. Transport Security Summary

| Control                 | Status           | Notes                                                                                                                  |
| ----------------------- | ---------------- | ---------------------------------------------------------------------------------------------------------------------- |
| HTTPS enforcement       | Partial          | No HTTP API calls were observed in reviewed source; transport enforcement must be guaranteed by hosting configuration. |
| Content Security Policy | Missing          | No CSP evidence found in reviewed frontend scope.                                                                      |
| CORS policy             | Partial          | Not assessable from frontend repository alone; requires backend or gateway evidence.                                   |
| SameSite cookies        | Not applicable   | No cookie-based auth/session pattern is present in reviewed scope.                                                     |
| HSTS                    | Missing evidence | Server-header control not represented in reviewed frontend files.                                                      |
| Referrer Policy         | Missing evidence | No explicit policy evidence in reviewed frontend files.                                                                |

## 6. Spec Security Compliance

| NFR                                   | Requirement                                                   | Status  | Findings |
| ------------------------------------- | ------------------------------------------------------------- | ------- | -------- |
| NFR-2.1                               | Controls have labels usable with assistive technology         | Met     | None     |
| NFR-2.2                               | Foreground and background contrast meets WCAG AA              | Met     | None     |
| NFR-2.3                               | Keyboard-only navigation support                              | Met     | None     |
| NFR-2.4                               | Validation errors are programmatically associated with inputs | Met     | None     |
| TR-4.4 (security-adjacent)            | Game configuration remains in memory only                     | Met     | None     |
| TR-1.1 and TR-1.2 (security-adjacent) | Public route architecture without guards in MVP               | Partial | SEC-05   |

## 7. Traceability Matrix

| Finding | Severity | OWASP    | Affected Component                                  | Status |
| ------- | -------- | -------- | --------------------------------------------------- | ------ |
| SEC-01  | Medium   | A06:2021 | package.json and package-lock.json dependency chain | Open   |
| SEC-02  | Medium   | A05:2021 | src/index.html and deployment header configuration  | Open   |
| SEC-03  | Low      | A06:2021 | package-lock.json transitive mocha and diff chain   | Open   |
| SEC-04  | Low      | A08:2021 | src/styles.scss                                     | Open   |
| SEC-05  | Info     | A01:2021 | src/app/app.routes.ts and related lobby flow        | Open   |

## 8. Prioritised Recommendations

### Critical (fix before any deployment)

1. None identified in this incremental review.

### High (fix before release)

1. None identified in this incremental review.

### Medium (fix in next sprint)

1. Remediate Moderate advisories in the Cypress and cucumber-preprocessor dependency chain, with CI compatibility validation.
2. Define and enforce a production CSP and add CSP validation to release checks.

### Low / Info (monitor and address)

1. Resolve remaining Low advisories in mocha and diff during routine dependency maintenance.
2. Evaluate self-hosted font delivery and stricter source controls for third-party assets.
3. Define route-guard and authorization strategy before introducing account-bound or privileged routes.
