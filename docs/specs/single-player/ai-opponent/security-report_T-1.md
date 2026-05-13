# Security Report: Single Player Mode - AI Opponent (Laia)

**Review Mode:** Incremental (T-1: Lobby registers "Laia" as the second player name in Single Player configuration)
**Source:** docs/specs/single-player/ai-opponent/
**Reviewed against:** spec.md (FR-1, TR-3), design.md (AD-1, AD-2), Angular Security Guide, OWASP Top 10:2021

## 1. Risk Summary

This incremental review focused on the T-1 implementation surface in the Lobby configuration flow and adjacent security context (routing guard, environment files, Angular build configuration, and dependency posture). The observed T-1 change appends the fixed AI name "Laia" to the Single Player player list and does not introduce new credential, injection, authentication, authorisation, or transport risk by itself.

- Total findings: 0 (0 Critical, 0 High, 0 Medium, 0 Low, 0 Info)
- Dependency vulnerabilities: 0 Critical, 0 High (from npm audit --json)
- Most critical risk areas: none identified in T-1 scope
- Overall risk level: Low

## 2. Dependency Vulnerabilities

Results of npm audit --json:

| Package | Version | Severity | CVE | Fix Available |
| ------- | ------- | -------- | --- | ------------- |
| None    | N/A     | N/A      | N/A | N/A           |

Total: 0 Critical, 0 High, 0 Medium, 0 Low

npm audit reports no vulnerabilities.

## 3. Security Findings

No evidence-based security findings were identified in the T-1 task scope.

Evidence reviewed:

- src/app/features/lobby/lobby/lobby.ts (Single Player configuration now sets playerNames to human name plus fixed AI name)
- src/app/app.routes.ts and src/app/core/guards/partida-session.guard.ts (existing guard still protects game route entry)
- src/environments/environment.ts and src/environments/environment.development.ts (no embedded secrets)
- angular.json and src/index.html (existing build and CSP posture reviewed; no T-1 changes)
- package.json and npm audit --json output (no dependency vulnerabilities)

OWASP categorisation result for T-1:

- A01, A02, A03, A04, A05, A07, A08, A09, A10: no new violations observed in task scope.
- A06: no vulnerable and outdated component findings from audit output.

## 4. Authentication & Authorisation Summary

| Protected Route / Resource | Guard                       | Token Storage                      | Session Management                          | Status                      |
| -------------------------- | --------------------------- | ---------------------------------- | ------------------------------------------- | --------------------------- |
| /partida                   | partidaSessionGuard present | No token storage introduced by T-1 | Session bootstrap behavior unchanged by T-1 | ✅ Secure in reviewed scope |

## 5. Transport Security Summary

| Control                 | Status                                       | Notes                                                                                          |
| ----------------------- | -------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| HTTPS enforcement       | ⚠️ Partial                                   | Not directly enforceable in frontend code; requires deployment/server policy validation.       |
| Content Security Policy | ✅ Configured                                | CSP meta policy is present in index HTML and was not weakened by T-1.                          |
| CORS policy             | ⚠️ Partial                                   | Backend concern; not configurable from this frontend task scope.                               |
| SameSite cookies        | ⚠️ Partial                                   | No auth cookie handling introduced by T-1; cookie policy must be verified server-side if used. |
| HSTS                    | ❌ Missing (not evidenced in frontend scope) | Must be enforced by hosting/server response headers, not by this Angular task.                 |

## 6. Spec Security Compliance

No explicit security NFR entries are defined in this feature spec for T-1. Security-relevant behavior in scope is addressed by FR-1/TR-3 identity and routing guard behavior.

| NFR | Requirement                                                | Status | Findings |
| --- | ---------------------------------------------------------- | ------ | -------- |
| N/A | No security-specific NFR defined for this incremental task | ✅ Met | None     |

## 7. Traceability Matrix

| Finding | Severity | OWASP | Affected Component                  | Status |
| ------- | -------- | ----- | ----------------------------------- | ------ |
| None    | N/A      | N/A   | T-1 scoped Lobby configuration flow | Closed |

## 8. Prioritised Recommendations

### Critical (fix before any deployment)

1. No critical remediation required for T-1.

### High (fix before release)

1. No high-priority remediation required for T-1.

### Medium (fix in next sprint)

1. Continue incremental security reviews for T-2 onward tasks because those tasks introduce runtime AI orchestration and rendering surfaces with higher injection and access-control relevance.

### Low / Info (monitor and address)

1. Validate production deployment headers (HSTS, Referrer-Policy, strict transport handling) at environment level, because these controls are outside T-1 frontend code scope.
