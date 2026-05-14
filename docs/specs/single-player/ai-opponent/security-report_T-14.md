# Security Report: Single Player Mode - AI Opponent (Laia)

**Review Mode:** Incremental (T-14: E2E tests for Single Player AI turn flow)
**Source:** docs/specs/single-player/ai-opponent/
**Reviewed against:** spec.md (TR-1.6, NFR-3.2), design.md (AD-4, AD-6), Angular Security Guide, OWASP Top 10:2021

## 1. Risk Summary

This incremental security review of T-14 did not identify evidence-based vulnerabilities introduced by the E2E feature scenarios or step definitions. The reviewed implementation remains focused on test orchestration and deterministic fixture control, with no new production authentication logic, no credential storage additions, and no unsafe HTML execution patterns observed in scope. Dependency auditing also reports zero known vulnerabilities.

- Total findings: 0 (0 Critical, 0 High, 0 Medium, 0 Low, 0 Info)
- Dependency vulnerabilities: 0 Critical, 0 High
- Most critical risk areas reviewed: test seam exposure controls, fixture invocation boundaries, route guard posture
- Overall risk level: Low

## 2. Dependency Vulnerabilities

Results of npm audit --json:

npm audit reports no vulnerabilities.

Total: 0 Critical, 0 High, 0 Medium, 0 Low

## 3. Security Findings

No security findings were identified in the reviewed T-14 scope.

Evidence reviewed:

- cypress/e2e/single-player-ai.feature
- cypress/e2e/single-player-ai.ts
- src/main.ts (Cypress-gated and dev-mode-gated test seam exposure)
- src/app/core/services/game-engine.ts (fixture switch with explicit known fixture names)
- src/app/app.routes.ts
- src/app/core/guards/partida-session.guard.ts
- src/environments/environment.ts
- src/environments/environment.development.ts
- src/index.html
- angular.json

## 4. Authentication & Authorisation Summary

| Protected Route / Resource                   | Guard                                                 | Token Storage                                | Session Management                                             | Status                   |
| -------------------------------------------- | ----------------------------------------------------- | -------------------------------------------- | -------------------------------------------------------------- | ------------------------ |
| /partida route                               | Yes, partidaSessionGuard canMatch guard is present    | No auth token storage observed in T-14 scope | In-memory session gate through GameSession configuration check | Secure in reviewed scope |
| Engine fixture seam used by Cypress E2E flow | Dev-mode and Cypress-context gating in bootstrap path | Not applicable                               | Not applicable                                                 | Secure in reviewed scope |

## 5. Transport Security Summary

| Control                 | Status                           | Notes                                                                                                                              |
| ----------------------- | -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| HTTPS enforcement       | Partial visibility               | No network/API calls are introduced in T-14 scope; transport enforcement is primarily deployment-side.                             |
| Content Security Policy | Configured                       | CSP meta policy exists in src/index.html and is unchanged by T-14.                                                                 |
| CORS policy             | Not applicable in reviewed scope | T-14 introduces no cross-origin request logic.                                                                                     |
| SameSite cookies        | Not applicable in reviewed scope | No cookie-based authentication/session handling added by T-14.                                                                     |
| HSTS                    | Missing repository evidence      | Requires server or hosting header configuration outside frontend source.                                                           |
| Referrer Policy         | Missing repository evidence      | No explicit Referrer-Policy control was identified in the reviewed frontend source; this is typically enforced by hosting headers. |

## 6. Spec Security Compliance

| NFR     | Requirement                                                                         | Status | Findings |
| ------- | ----------------------------------------------------------------------------------- | ------ | -------- |
| NFR-3.2 | AI turn orchestration remains testable through deterministic fixture-based E2E flow | Met    | None     |

No explicit security-focused NFR entries were defined in spec.md beyond testability requirements relevant to deterministic seams.

## 7. Traceability Matrix

| Finding | Severity | OWASP | Affected Component                                                    | Status           |
| ------- | -------- | ----- | --------------------------------------------------------------------- | ---------------- |
| None    | None     | None  | cypress/e2e/single-player-ai.feature; cypress/e2e/single-player-ai.ts | No open findings |

## 8. Prioritised Recommendations

### Critical (fix before any deployment)

1. None.

### High (fix before release)

1. None.

### Medium (fix in next sprint)

1. None.

### Low / Info (monitor and address)

1. Keep fixture entry points restricted to development and Cypress execution contexts.
2. Continue to reject unknown fixture names in the engine fixture switch to preserve fail-closed test seam behavior.
