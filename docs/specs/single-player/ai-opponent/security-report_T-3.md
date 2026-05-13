# Security Report: Single Player Mode — AI Opponent (Laia)

**Review Mode:** Incremental (T-3: Extend OpponentZones to render Laia's face-down hand cards with animation support)
**Source:** `docs/specs/single-player/ai-opponent/`
**Reviewed against:** spec.md (FR-6, FR-8, NFR-2.1, NFR-2.2), design.md (AD-5, AD-8), Angular Security Guide, OWASP Top 10:2021

## 1. Risk Summary

The incremental T-3 scope does not introduce evidence-based exploitable security weaknesses in the reviewed implementation. The opponent hand rendering uses Angular template interpolation and signal-driven state without sanitization bypasses or direct DOM mutation patterns. Dependency scanning shows no known vulnerabilities.

- Total findings: 0 (0 Critical, 0 High, 0 Medium, 0 Low, 0 Info)
- Dependency vulnerabilities: 0 Critical, 0 High (from npm audit)
- Most critical risk areas: None observed in T-3 scope
- Overall risk level: Low

## 2. Dependency Vulnerabilities

Results of `npm audit --json`:

npm audit reports no vulnerabilities.

Total: 0 Critical, 0 High, 0 Medium, 0 Low

## 3. Security Findings

No evidence-based security findings were identified in the incremental T-3 scope.

Reviewed evidence includes:

- Opponent hand rendering logic in OpponentZones and CardVisual (face-down/face-up state handling)
- Angular route guard wiring for game table route access
- Environment files for credential exposure
- Build/runtime security-relevant configuration in angular.json and index.html

## 4. Authentication & Authorisation Summary

| Protected Route / Resource   | Guard                          | Token Storage         | Session Management                              | Status                       |
| ---------------------------- | ------------------------------ | --------------------- | ----------------------------------------------- | ---------------------------- |
| /partida route               | ✅ Yes (`partidaSessionGuard`) | Not used in T-3 scope | Session presence is enforced before route match | ✅ Secure for reviewed scope |
| Opponent hand-zone rendering | N/A                            | Not applicable        | UI-only rendering logic                         | ✅ Secure for reviewed scope |

## 5. Transport Security Summary

| Control                 | Status              | Notes                                                                                                               |
| ----------------------- | ------------------- | ------------------------------------------------------------------------------------------------------------------- |
| HTTPS enforcement       | ⚠️ Partial          | Frontend repository does not provide deploy-time transport policy evidence. Confirm at hosting/reverse-proxy layer. |
| Content Security Policy | ✅ Configured       | CSP meta policy is present in index.html with restrictive directives and nonce-based style allowance.               |
| CORS policy             | ⚠️ Partial          | Not verifiable from frontend-only code in this task scope; requires backend/API configuration evidence.             |
| SameSite cookies        | ⚠️ Partial          | No cookie-based auth/session controls in T-3 scope; backend/session configuration not present here.                 |
| HSTS                    | ❌ Missing evidence | Not verifiable from repository artifacts reviewed in this task scope.                                               |

## 6. Spec Security Compliance

| NFR     | Requirement                                                                        | Status     | Findings                                                                                              |
| ------- | ---------------------------------------------------------------------------------- | ---------- | ----------------------------------------------------------------------------------------------------- |
| NFR-2.1 | AI strategy must never produce an illegal play accepted by engine validation rules | ⚠️ Partial | Not directly implemented by T-3 rendering files; no contradictory behavior observed in reviewed scope |
| NFR-2.2 | Service must always produce exactly one play decision per AI turn                  | ⚠️ Partial | Not directly implemented by T-3 rendering files; no contradictory behavior observed in reviewed scope |

## 7. Traceability Matrix

| Finding           | Severity | OWASP | Affected Component                                       | Status            |
| ----------------- | -------- | ----- | -------------------------------------------------------- | ----------------- |
| None in T-3 scope | N/A      | N/A   | OpponentZones, CardVisual, route/config review artifacts | Closed (no issue) |

## 8. Prioritised Recommendations

### Critical (fix before any deployment)

1. None.

### High (fix before release)

1. None.

### Medium (fix in next sprint)

1. Confirm HTTPS and HSTS enforcement at the deployment edge and document the control in operational runbooks.

### Low / Info (monitor and address)

1. Keep CSP policy aligned with Angular guidance as new assets or third-party integrations are introduced: https://angular.dev/best-practices/security
2. Continue periodic dependency audits and patch management per OWASP guidance: https://owasp.org/Top10/A06_2021-Vulnerable_and_Outdated_Components/
