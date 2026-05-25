# Security Report: Card Animation System

**Review Mode:** Incremental (T-15: Add unit and integration validation suite)
**Source:** `docs/specs/ui/card-animations/`
**Reviewed against:** `spec.md` (NFR-2, NFR-3), `design.md` (AD-2, AD-3, AD-5), Angular Security Guide, OWASP Top 10:2021

## 1. Risk Summary

This incremental review of T-15 focused on the orchestration and pause-policy validation surface, with targeted checks of related runtime files and security-relevant configuration. No Critical or High code-level vulnerabilities were identified in the reviewed feature scope. The main actionable risk is dependency hygiene in the test toolchain (Moderate advisories in the Cypress chain), plus low-severity logging exposure patterns that can leak internal runtime context in shared browser or developer-device scenarios.

- Total findings: 2 (0 Critical, 0 High, 1 Medium, 1 Low, 0 Info)
- Dependency vulnerabilities: 0 Critical, 0 High (from npm audit)
- Most critical risk areas: dependency lifecycle management for test toolchain, verbose runtime diagnostics in browser console
- Overall risk level: Low

## 2. Dependency Vulnerabilities

Results of `npm audit --json`:

| Package              | Version | Severity | CVE | Fix Available |
| -------------------- | ------- | -------- | --- | ------------- |
| None (Critical/High) | N/A     | N/A      | N/A | N/A           |

Additional Moderate advisories observed:

| Package          | Version    | Severity | CVE                                                  | Fix Available                                    |
| ---------------- | ---------- | -------- | ---------------------------------------------------- | ------------------------------------------------ |
| cypress          | 15.14.1    | Moderate | GHSA-q8mj-m7cp-5q26 (via `@cypress/request` -> `qs`) | Yes (manual upgrade path indicated by npm audit) |
| @cypress/request | transitive | Moderate | GHSA-q8mj-m7cp-5q26 (through `qs`)                   | Yes (through Cypress upgrade)                    |
| brace-expansion  | transitive | Moderate | GHSA-jxxr-4gwj-5jf2                                  | Yes                                              |

Total: 0 Critical, 0 High, 4 Medium, 0 Low

## 3. Security Findings

### SEC-01: Moderate vulnerabilities in Cypress dependency chain [Medium]

- **OWASP Category:** A06:2021 — Vulnerable and Outdated Components
- **Severity:** Medium
- **Affected:** `package.json`, dependency tree reported by `npm audit --json`
- **Description:** The audit output reports Moderate vulnerabilities in the Cypress-related dependency chain, including advisory GHSA-q8mj-m7cp-5q26 in `qs` and GHSA-jxxr-4gwj-5jf2 in `brace-expansion`.
- **Risk:** Vulnerable tooling dependencies can be exploited in development or CI contexts, including denial-of-service style disruption and reduced supply-chain assurance.
- **Expected Practice:** Dependency inventories should remain on patched versions, with recurring security triage and documented risk acceptance where upgrades are temporarily blocked.
- **Recommendation:** Prioritize upgrading the Cypress toolchain to a version that resolves reported advisories, then re-run dependency audit in CI as a release-quality gate.
- **References:** https://owasp.org/Top10/A06_2021-Vulnerable_and_Outdated_Components/, https://github.com/advisories/GHSA-q8mj-m7cp-5q26, https://github.com/advisories/GHSA-jxxr-4gwj-5jf2
- **Spec Traceability:** NFR-6, US-14, AD-3

### SEC-02: Runtime error logging exposes internal diagnostic context [Low]

- **OWASP Category:** A09:2021 — Security Logging and Monitoring Failures
- **Severity:** Low
- **Affected:** `src/main.ts`, `src/app/features/game-board/game-table-page/game-table-page.ts`
- **Description:** Runtime error and warning logs are emitted directly to the browser console, including structured AI orchestration context fields during failure handling.
- **Risk:** In shared-device, kiosk, or captured-log scenarios, internal diagnostics can aid reconnaissance by exposing implementation details.
- **Expected Practice:** Production-facing clients should minimize internal diagnostic detail in browser logs and use controlled telemetry channels for operational events.
- **Recommendation:** Apply environment-aware log redaction and verbosity controls for production builds, with centralized monitoring for security-relevant events.
- **References:** https://owasp.org/Top10/A09_2021-Security_Logging_and_Monitoring_Failures/, https://angular.dev/best-practices/security
- **Spec Traceability:** AD-2, NFR-2

## 4. Authentication & Authorisation Summary

| Protected Route / Resource | Guard                          | Token Storage                    | Session Management                               | Status    |
| -------------------------- | ------------------------------ | -------------------------------- | ------------------------------------------------ | --------- |
| `/partida` route           | ✅ Yes (`partidaSessionGuard`) | In-memory signal (`GameSession`) | Session configuration gate before gameplay route | ✅ Secure |
| Root route `/`             | Not required                   | Not applicable                   | Public entry (lobby)                             | ✅ Secure |

## 5. Transport Security Summary

| Control                 | Status        | Notes                                                                                                        |
| ----------------------- | ------------- | ------------------------------------------------------------------------------------------------------------ |
| HTTPS enforcement       | ⚠️ Partial    | Not enforceable from Angular client code alone; deployment-tier validation required.                         |
| Content Security Policy | ✅ Configured | Restrictive CSP meta policy is present in `src/index.html`.                                                  |
| CORS policy             | ⚠️ Partial    | Backend CORS policy is not defined in this frontend repository; server enforcement not verifiable here.      |
| SameSite cookies        | ⚠️ Partial    | No cookie-auth handling in reviewed scope; cookie flags are server-managed and not visible in this codebase. |
| HSTS                    | ❌ Missing    | No HSTS evidence in frontend assets; must be configured and verified at server/CDN layer.                    |

## 6. Spec Security Compliance

| NFR   | Requirement                                                      | Status | Findings |
| ----- | ---------------------------------------------------------------- | ------ | -------- |
| NFR-2 | Accessibility: keyboard navigation and focus behavior unaffected | ✅ Met | None     |
| NFR-3 | Reduced-motion preference respected with functional parity       | ✅ Met | None     |

## 7. Traceability Matrix

| Finding | Severity | OWASP    | Affected Component                                    | Status |
| ------- | -------- | -------- | ----------------------------------------------------- | ------ |
| SEC-01  | Medium   | A06:2021 | Dependency chain (`cypress`, `qs`, `brace-expansion`) | Open   |
| SEC-02  | Low      | A09:2021 | App bootstrap and AI orchestration logging path       | Open   |

## 8. Prioritised Recommendations

### Critical (fix before any deployment)

1. None.

### High (fix before release)

1. None.

### Medium (fix in next sprint)

1. Upgrade and re-validate the Cypress dependency chain to close the reported Moderate advisories.

### Low / Info (monitor and address)

1. Reduce client-side production logging verbosity and route operational details to controlled observability pipelines.
