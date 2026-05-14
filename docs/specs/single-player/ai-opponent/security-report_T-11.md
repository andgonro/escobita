# Security Report: Single Player Mode — AI Opponent

**Review Mode:** Incremental (T-11: Implement accessibility announcements for Laia's actions)
**Source:** docs/specs/single-player/ai-opponent/
**Reviewed against:** spec.md (FR-8, FR-9), design.md (AD-4, AD-5, AD-6), Angular Security Guide, OWASP Top 10:2021

## 1. Risk Summary

This incremental review focused on the T-11 implementation in the game table orchestration layer, especially live-region announcement generation and AI turn orchestration around capture and escoba outcomes. No exploitable security vulnerabilities were identified in the scoped implementation. Announcement text is generated from fixed strings plus capture counts, and is written as plain text rather than HTML, which prevents script injection through this path.

- Total findings: 0 (0 Critical, 0 High, 0 Medium, 0 Low, 0 Info)
- Dependency vulnerabilities: 0 Critical, 0 High (from npm audit)
- Most critical risk areas: none observed in T-11 scope
- Overall risk level: Low

## 2. Dependency Vulnerabilities

Results of npm audit --json:

| Package | Version | Severity | CVE | Fix Available |
| ------- | ------- | -------- | --- | ------------- |
| None    | N/A     | N/A      | N/A | N/A           |

Total: 0 Critical, 0 High, 0 Medium, 0 Low

npm audit reports no vulnerabilities.

## 3. Security Findings

No security findings were identified for this incremental T-11 implementation.

## 4. Authentication & Authorisation Summary

| Protected Route / Resource                 | Guard                    | Token Storage                                | Session Management                                            | Status                   |
| ------------------------------------------ | ------------------------ | -------------------------------------------- | ------------------------------------------------------------- | ------------------------ |
| partida route                              | Yes, route guard present | No auth token storage observed in T-11 scope | Session-based route entry check via GameSession configuration | Secure for scoped review |
| T-11 AI announcement flow in GameTablePage | Not an auth surface      | Not applicable                               | Not applicable                                                | Secure for scoped review |

## 5. Transport Security Summary

| Control                 | Status                    | Notes                                                                                                               |
| ----------------------- | ------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| HTTPS enforcement       | Partial                   | No HTTP API calls are present in the T-11 flow; deployment-level HTTPS enforcement is outside this repository scope |
| Content Security Policy | Missing evidence in scope | No CSP header configuration is present in reviewed frontend files; likely managed at hosting layer                  |
| CORS policy             | Not applicable in scope   | No outbound HTTP requests were identified in reviewed T-11 paths                                                    |
| SameSite cookies        | Not applicable in scope   | No cookie-based authentication logic in reviewed scope                                                              |
| HSTS                    | Missing evidence in scope | HSTS is a server response header and is not configurable in the reviewed Angular source files                       |

## 6. Spec Security Compliance

| NFR                                           | Requirement                                                                                                          | Status | Findings |
| --------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- | ------ | -------- |
| No explicit security NFRs in spec.md for T-11 | Security controls are expressed through FR-8 and FR-9 (hidden AI hand identity and safe accessibility announcements) | Met    | None     |

## 7. Traceability Matrix

| Finding | Severity | OWASP | Affected Component | Status |
| ------- | -------- | ----- | ------------------ | ------ |
| None    | None     | None  | T-11 scoped files  | Closed |

## 8. Prioritised Recommendations

### Critical (fix before any deployment)

1. None.

### High (fix before release)

1. None.

### Medium (fix in next sprint)

1. Verify CSP, HSTS, and HTTPS enforcement at hosting or reverse-proxy level because these controls are not expressed in the frontend repository.

### Low / Info (monitor and address)

1. Keep announcement content constrained to fixed phrases and non-sensitive counts, and continue writing content as plain text only.
