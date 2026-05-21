# Security Report: Card Animation System

**Review Mode:** Incremental (T-8: Implement deal and opponent animation flows)
**Source:** docs/specs/ui/card-animations/
**Reviewed against:** spec.md (NFR-2, NFR-3), design.md (AD-4, AD-7), Angular Security Guide, OWASP Top 10:2021

## 1. Risk Summary

The scoped T-8 implementation does not introduce a new application-level security issue in the reviewed Angular components or templates. The only confirmed security issue is a Moderate transitive dependency vulnerability reported by npm audit in the lockfile. Total findings: 1 (0 Critical, 0 High, 1 Medium, 0 Low, 0 Info). Dependency vulnerabilities: 0 Critical, 0 High. Most critical risk area: vulnerable and outdated components in the development toolchain. Overall risk level: Medium.

## 2. Dependency Vulnerabilities

Results of npm audit:

| Package         | Version | Severity | CVE                                                             | Fix Available                                                     |
| --------------- | ------- | -------- | --------------------------------------------------------------- | ----------------------------------------------------------------- |
| brace-expansion | 5.0.5   | Moderate | No CVE listed in npm audit output; advisory GHSA-jxxr-4gwj-5jf2 | Yes, a patched release is available through dependency resolution |

Total: 0 Critical, 0 High, 1 Medium, 0 Low

The lockfile records brace-expansion 5.0.5 at [package-lock.json](../../../../package-lock.json#L6560), and npm audit flags the package as vulnerable in the transitive dependency tree.

## 3. Security Findings

### SEC-01: Transitive brace-expansion dependency is in a vulnerable range [Medium]

- **OWASP Category:** A06:2021 - Vulnerable and Outdated Components
- **Severity:** Medium
- **Affected:** [package-lock.json](../../../../package-lock.json#L6560) and the transitive brace-expansion dependency chain
- **Description:** npm audit reports that brace-expansion 5.0.5 is affected by a denial-of-service weakness involving large numeric ranges. The vulnerable package is present in the lockfile and is used through the development toolchain rather than in the browser runtime.
- **Risk:** If tooling or CI processing accepts attacker-influenced range input through the affected dependency chain, it can consume excessive resources and slow or disrupt build and automation workflows.
- **Expected Practice:** The dependency graph should resolve to a fixed, non-vulnerable release, and the lockfile should remain aligned with the audited version set.
- **Recommendation:** Update the dependency chain so brace-expansion resolves to a patched release, then rerun npm audit to confirm the finding is gone. Refer to [OWASP A06:2021](https://owasp.org/Top10/A06_2021-Vulnerable_and_Outdated_Components/) and the advisory [GHSA-jxxr-4gwj-5jf2](https://github.com/advisories/GHSA-jxxr-4gwj-5jf2).
- **References:** [OWASP A06:2021](https://owasp.org/Top10/A06_2021-Vulnerable_and_Outdated_Components/), [GHSA-jxxr-4gwj-5jf2](https://github.com/advisories/GHSA-jxxr-4gwj-5jf2)
- **Spec Traceability:** N/A; this is a repository dependency issue surfaced by npm audit, not a feature requirement from the card-animation spec.

## 4. Authentication & Authorisation Summary

| Protected Route / Resource | Guard                                                                                                                                                                             | Token Storage                                        | Session Management                                                 | Status                                             |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- | ------------------------------------------------------------------ | -------------------------------------------------- |
| /partida route             | Yes, via partidaSessionGuard in [app.routes.ts](../../../../src/app/app.routes.ts#L1) and [partida-session.guard.ts](../../../../src/app/core/guards/partida-session.guard.ts#L1) | No auth token storage observed in the reviewed files | In-memory session configuration gate; no auth changes in T-8 scope | Secure for the current frontend route-gating scope |

The T-8 deal and opponent animation flow does not add a new authentication or authorisation surface.

## 5. Transport Security Summary

| Control                 | Status                         | Notes                                                                               |
| ----------------------- | ------------------------------ | ----------------------------------------------------------------------------------- |
| HTTPS enforcement       | Not evidenced in scoped files  | No non-TLS resource URLs or HTTP endpoints were observed in the reviewed T-8 files. |
| Content Security Policy | Not evidenced in scoped files  | No CSP changes were made in the reviewed files.                                     |
| CORS policy             | Out of scope                   | CORS is backend-controlled and not changed by this frontend task.                   |
| SameSite cookies        | Not applicable in scoped files | No cookie-based session handling was observed in the reviewed files.                |
| HSTS                    | Out of scope                   | HSTS is a response-header control and is not evidenced in the reviewed files.       |

## 6. Spec Security Compliance

| NFR   | Requirement                                                                              | Status | Findings                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| ----- | ---------------------------------------------------------------------------------------- | ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| NFR-2 | Keyboard navigation, focus management, and screen reader announcements remain unaffected | Met    | No unsafe template binding, direct DOM mutation, or focus hijacking was observed in [GameTablePage](../../../../src/app/features/game-board/game-table-page/game-table-page.ts#L1), [ActiveHandZone](../../../../src/app/features/game-board/game-table-page/zones/active-hand-zone/active-hand-zone.ts#L1), [OpponentZones](../../../../src/app/features/game-board/game-table-page/zones/opponent-zones/opponent-zones.ts#L1), or [CardVisual](../../../../src/app/features/game-board/game-table-page/components/card-visual/card-visual.ts#L1). |
| NFR-3 | Reduced-motion handling remains deterministic and safe                                   | Met    | The reviewed T-8 slice does not change reduced-motion behavior or introduce a bypass of the existing animation state flow.                                                                                                                                                                                                                                                                                                                                                                                                                          |

## 7. Traceability Matrix

| Finding | Severity | OWASP    | Affected Component                                   | Status |
| ------- | -------- | -------- | ---------------------------------------------------- | ------ |
| SEC-01  | Medium   | A06:2021 | package-lock.json / brace-expansion dependency chain | Open   |

## 8. Prioritised Recommendations

### Critical (fix before any deployment)

None.

### High (fix before release)

None.

### Medium (fix in next sprint)

1. Remove the vulnerable brace-expansion range from the lockfile and verify the remediation with a fresh npm audit run.

### Low / Info (monitor and address)

1. Continue routine checks that animation-oriented frontend changes do not introduce DOM-sanitization bypasses, unsafe style handling, or secret exposure.
