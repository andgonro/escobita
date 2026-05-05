# Security Report: Game Table MVP

**Review Mode:** Incremental (T-18: Reviewer and Security checkpoint GREEN)
**Source:** docs/specs/ui/game-table-mvp/
**Reviewed against:** spec.md (NFR-2.1, NFR-2.2, NFR-2.3, NFR-3.1, NFR-3.2, NFR-4.1), design.md (AD-7, AD-8, AD-9), Angular Security Guide, OWASP Top 10:2021

## 1. Risk Summary

This incremental T-18 review found no evidence of exploitable OWASP Top 10:2021 vulnerabilities in the reviewed implementation scope. Angular-specific injection primitives were not present, route and interaction gating remained aligned to design intent, no committed credentials were identified, and dependency audit returned zero known vulnerabilities. Transport controls that are deployment-managed were clarified during review and are recorded below.

- Total findings: 0 (0 Critical, 0 High, 0 Medium, 0 Low, 0 Info)
- Dependency vulnerabilities: 0 Critical, 0 High
- Most critical risk areas: ongoing deployment-control verification and regression monitoring
- Overall risk level: Low

## 2. Dependency Vulnerabilities

Results of npm audit:

| Package         | Version        | Severity       | CVE            | Fix Available  |
| --------------- | -------------- | -------------- | -------------- | -------------- |
| None identified | Not applicable | Not applicable | Not applicable | Not applicable |

Total: 0 Critical, 0 High, 0 Medium, 0 Low

npm audit reports no vulnerabilities.

## 3. Security Findings

No security findings were identified in scope for this incremental review.

Evidence reviewed in current workspace state included:

- partida route guard and session gate behavior
- game-table container and subcomponents for selection, submission, handoff, and accessibility announcement flows
- feature interaction-state and card-asset mapping services
- environment and configuration files for secret exposure and misconfiguration indicators
- index-level CSP declarations and runtime nonce usage assumptions (validated as deployment-injected per response)
- dependency vulnerability output from npm audit

## 4. Authentication & Authorisation Summary

| Protected Route / Resource                     | Guard                                               | Token Storage            | Session Management                                   | Status                      |
| ---------------------------------------------- | --------------------------------------------------- | ------------------------ | ---------------------------------------------------- | --------------------------- |
| /partida route                                 | Yes, partidaSessionGuard (CanMatch)                 | Not used in this feature | In-memory session configuration gate via GameSession | ✅ Secure in reviewed scope |
| Game table actions (submit play, confirm turn) | Yes, phase and interaction gating in component flow | Not applicable           | Engine-authoritative turn phase gating               | ✅ Secure in reviewed scope |

## 5. Transport Security Summary

| Control                 | Status                              | Notes                                                                                                                           |
| ----------------------- | ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| HTTPS enforcement       | ✅ Enforced                         | No insecure API URLs were found in reviewed feature code. Deployment confirms HSTS policy is enabled.                           |
| Content Security Policy | ✅ Configured                       | CSP policy is declared in src/index.html. Nonce usage is deployment-managed and confirmed as dynamically replaced per response. |
| CORS policy             | ✅ Not applicable in reviewed scope | The feature performs no backend HTTP calls in this implementation scope.                                                        |
| SameSite cookies        | ✅ Not applicable                   | Cookie-based auth/session model is not used in this feature scope.                                                              |
| HSTS                    | ✅ Configured                       | Confirmed as enforced in deployment for this app.                                                                               |
| Referrer Policy         | ✅ Configured                       | Confirmed as enforced in deployment for this app.                                                                               |

## 6. Spec Security Compliance

| NFR     | Requirement                                                                               | Status | Findings |
| ------- | ----------------------------------------------------------------------------------------- | ------ | -------- |
| NFR-2.1 | Keyboard-only play path is supported for all core table actions                           | ✅ Met | None     |
| NFR-2.2 | Screen-reader users can identify active controls and turn context                         | ✅ Met | None     |
| NFR-2.3 | Contrast and readability remain compliant over textured backgrounds                       | ✅ Met | None     |
| NFR-3.1 | UI state must remain synchronized with engine state after every action                    | ✅ Met | None     |
| NFR-3.2 | Invalid action attempts must fail gracefully without visual desynchronization             | ✅ Met | None     |
| NFR-4.1 | Feature structure should allow future additions without redesigning core interaction flow | ✅ Met | None     |

## 7. Traceability Matrix

No open SEC findings for this incremental review.

## 8. Prioritised Recommendations

### Critical (fix before any deployment)

1. None.

### High (fix before release)

1. None.

### Medium (fix in next sprint)

1. Keep deployment security-header verification (CSP, HSTS, Referrer-Policy) in release validation checklists aligned with OWASP secure headers guidance: https://owasp.org/www-project-secure-headers/
2. Re-validate frontend and deployment alignment against Angular security best practices during each release increment: https://angular.dev/best-practices/security

### Low / Info (monitor and address)

1. Continue zero-tolerance dependency gate for Critical and High vulnerabilities before release.
2. Re-run incremental security review after any change to route guards, handoff masking, or CSP policy behavior.
