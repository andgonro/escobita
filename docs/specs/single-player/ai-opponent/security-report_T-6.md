# Security Report: Single Player Mode - AI Opponent (Laia)

**Review Mode:** Incremental (T-6: Implement Intermedio strategy)
**Source:** `docs/specs/single-player/ai-opponent/`
**Reviewed against:** spec.md (FR-4.1 through FR-4.7, NFR-2.1, NFR-2.2, TR-1.6), design.md (AD-3, AD-10), Angular Security Guide, OWASP Top 10:2021

## 1. Risk Summary

This GREEN-phase incremental review is scoped to the implemented T-6 Intermedio strategy surface. Evidence was gathered from the feature spec set, the AI strategy service, the related unit tests, the AI turn model, route/session gating, environment files, build configuration, bootstrap exposure controls, and `npm audit --json`. No evidence-based Critical, High, Medium, Low, or Info security findings were identified in the reviewed scope. The reviewed code remains a pure in-memory decision layer with no new DOM, network, storage, credential, or template-sanitisation exposure. The legal-play constraints and deterministic randomness seam requested by the spec are implemented in a way that does not introduce a security weakness in this slice.

- Total findings: 0 (0 Critical, 0 High, 0 Medium, 0 Low, 0 Info)
- Dependency vulnerabilities: 0 Critical, 0 High (from npm audit --json)
- Most critical risk areas reviewed: injection and DOM-sanitisation bypasses, secret exposure, randomness seam misuse, illegal-play generation, dependency CVEs
- Overall risk level: Low
- Recommendation: APPROVE

## 2. Dependency Vulnerabilities

Results of `npm audit --json`:

| Package | Version | Severity | CVE | Fix Available |
| ------- | ------- | -------- | --- | ------------- |
| None    | N/A     | N/A      | N/A | N/A           |

Total: 0 Critical, 0 High, 0 Medium, 0 Low

npm audit reports no vulnerabilities.

## 3. Security Findings

No confirmed security findings were identified for this review scope.

Evidence checked:

- `src/app/core/services/ai-strategy.service.ts` contains pure in-memory card-selection logic only. No network access, no DOM APIs, no browser storage APIs, no credential handling, and no dangerous code-execution patterns were observed.
- The randomness seam is explicitly implemented through the optional `RandomFn` parameter in `AiStrategyService.decide(...)`. When no test seam is supplied, the service prefers `globalThis.crypto.getRandomValues(...)` and falls back to `Math.random()` only for non-security-critical gameplay tie-breaking. No user-controlled executable input reaches the seam.
- The legal-play guarantee in the reviewed scope is implemented by enumerating only non-empty table subsets and accepting only combinations whose table-card total plus the AI hand card equals exactly 15. Placement decisions are restricted to cards already present in `aiPlayer.hand`. No code path synthesises cards, mutates game state directly, or reads the human player's hand for the Intermedio decision.
- `src/app/core/services/ai-strategy.service.spec.ts` exercises the Intermedio behaviour requested by T-6, including escoba preference, greedy high-value capture selection, random seam tie-breaking, 7 of Oros single-count handling, placement fallback, subset membership, and exact sum-to-15 assertions. No secrets, credentials, or unsafe runtime hooks were observed.
- `src/app/models/ai-turn.ts` and `src/app/models/ai-turn.spec.ts` define static TypeScript types and idle-state constants only. No dynamic evaluation, DOM interaction, or persistence mechanism is present.
- `src/environments/environment.ts` and `src/environments/environment.development.ts` are empty objects, with no hardcoded credentials or committed environment secrets.
- `src/app/app.routes.ts` and `src/app/core/guards/partida-session.guard.ts` retain route gating for the `partida` route through session presence checks. T-6 introduces no new route, privilege boundary, or authorisation surface.
- `src/index.html` defines a restrictive Content Security Policy. `src/main.ts` exposes the test API only when both development mode and Cypress are present, so the reviewed AI strategy tests do not widen production runtime access.
- No `DomSanitizer` bypass calls, no `innerHTML` or `outerHTML` usage, no `eval` or similar dynamic code execution, no `localStorage` or `sessionStorage` usage, and no checked-in `.env` files were observed in the reviewed scope.

## 4. Authentication & Authorisation Summary

| Protected Route / Resource | Guard                 | Token Storage                   | Session Management                               | Status                      |
| -------------------------- | --------------------- | ------------------------------- | ------------------------------------------------ | --------------------------- |
| `partida` route            | `partidaSessionGuard` | None observed in reviewed scope | In-memory session precondition via `GameSession` | ✅ Secure in reviewed scope |
| T-6 AI strategy service    | Not applicable        | None                            | In-memory only                                   | ✅ Secure in reviewed scope |

## 5. Transport Security Summary

| Control                 | Status                     | Notes                                                                                                                       |
| ----------------------- | -------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| HTTPS enforcement       | ⚠️ Partial                 | Deployment enforcement is outside the T-6 client-code scope. No insecure HTTP API usage was observed in the reviewed files. |
| Content Security Policy | ✅ Configured              | `src/index.html` defines a restrictive CSP for scripts, styles, images, fonts, objects, base URI, and frame ancestors.      |
| CORS policy             | ⚠️ Partial                 | No network request layer is involved in T-6. Backend CORS posture is outside this task scope.                               |
| SameSite cookies        | ⚠️ Not applicable in scope | No cookie-based authentication or session handling was introduced or modified by T-6.                                       |
| HSTS                    | ⚠️ Partial                 | Server header enforcement is outside the client-side task scope.                                                            |

## 6. Spec Security Compliance

| NFR     | Requirement                                                                                             | Status                   | Findings |
| ------- | ------------------------------------------------------------------------------------------------------- | ------------------------ | -------- |
| TR-1.6  | Random selection and tie-breaking must use a replaceable seam for deterministic tests                   | ✅ Met in reviewed scope | None     |
| NFR-2.1 | The AI strategy must never produce an illegal play and must only propose captures summing exactly to 15 | ✅ Met in reviewed scope | None     |
| NFR-2.2 | The service must always produce exactly one play decision per AI turn                                   | ✅ Met in reviewed scope | None     |

## 7. Traceability Matrix

| Finding | Severity | OWASP | Affected Component | Status |
| ------- | -------- | ----- | ------------------ | ------ |
| None    | N/A      | N/A   | T-6 reviewed scope | Closed |

## 8. Prioritised Recommendations

### Critical (fix before any deployment)

1. None.

### High (fix before release)

1. None.

### Medium (fix in next sprint)

1. None.

### Low / Info (monitor and address)

1. Re-run the incremental security review when T-7 lands, because the Difícil strategy will introduce a broader decision model and a new correctness surface even if it remains client-side only.
2. Keep the current dependency-audit baseline and CSP posture as part of future AI-task reviews so later orchestration changes do not widen the client attack surface.
