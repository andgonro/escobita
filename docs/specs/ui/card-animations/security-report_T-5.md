# Security Report: Card Animation System

**Review Mode:** Incremental (T-5: Integrate animation metadata into zone components)
**Source:** docs/specs/ui/card-animations/
**Reviewed against:** spec.md (NFR-2, NFR-3), design.md (AD-1, AD-7), Angular Security Guide, OWASP Top 10:2021

## 1. Risk Summary

This incremental review focused on the T-5 component scope (ActiveHandZone, CenterTableZone, OpponentZones) and the metadata propagation path from GameTablePage into those zones. No direct injection, credential, or access-control vulnerabilities were found in the task-scoped zone implementations. One Medium security misconfiguration finding remains at the application entrypoint: the Content Security Policy style nonce is static and predictable instead of per-response dynamic. Dependency scan found no Critical or High vulnerabilities.

- Total findings: 1 (0 Critical, 0 High, 1 Medium, 0 Low, 0 Info)
- Dependency vulnerabilities: 0 Critical, 0 High (from npm audit --json)
- Most critical risk areas: content security policy nonce management
- Overall risk level: Medium

## 2. Dependency Vulnerabilities

Results of npm audit --json:

| Package              | Version | Severity | CVE | Fix Available |
| -------------------- | ------- | -------- | --- | ------------- |
| None (Critical/High) | N/A     | N/A      | N/A | N/A           |

Total: 0 Critical, 0 High, 1 Medium, 0 Low

Medium advisory observed in the same audit output:

| Package         | Version       | Severity | CVE                 | Fix Available                     |
| --------------- | ------------- | -------- | ------------------- | --------------------------------- |
| brace-expansion | 5.0.2 - 5.0.5 | Moderate | GHSA-jxxr-4gwj-5jf2 | Yes (dependency update available) |

## 3. Security Findings

### SEC-01: Content Security Policy nonce is static and predictable [Medium]

- **OWASP Category:** A05:2021 - Security Misconfiguration
- **Severity:** Medium
- **Affected:** src/index.html
- **Description:** The CSP header equivalent declared in the HTML uses a fixed style nonce value and the root component uses the same fixed nonce. This nonce does not rotate per response and is therefore predictable.
- **Risk:** If an attacker gains any markup/style injection path, a fixed nonce weakens CSP as a defense-in-depth control because the nonce value is reusable instead of one-time.
- **Expected Practice:** CSP nonces should be cryptographically random and generated per response/request lifecycle, not hardcoded in static assets.
- **Recommendation:** Move nonce generation to runtime delivery infrastructure so each response gets a unique nonce, and align Angular CSP nonce handling with that dynamic value. Validate policy behavior against Angular security guidance and OWASP CSP recommendations.
- **References:** https://owasp.org/Top10/A05_2021-Security_Misconfiguration/ ; https://angular.dev/best-practices/security ; https://owasp.org/www-project-cheat-sheets/cheatsheets/Content_Security_Policy_Cheat_Sheet.html
- **Spec Traceability:** AD-1, AD-7 (T-5 metadata propagation remains unaffected by this control gap)

## 4. Authentication & Authorisation Summary

| Protected Route / Resource                          | Guard                     | Token Storage                           | Session Management                                    | Status                              |
| --------------------------------------------------- | ------------------------- | --------------------------------------- | ----------------------------------------------------- | ----------------------------------- |
| /partida route                                      | Yes (partidaSessionGuard) | No token storage used in reviewed scope | Route gated on active in-memory session configuration | ✅ Secure for T-5 scope             |
| Game table zone metadata flow (hand/table/opponent) | Not an auth boundary      | Not applicable                          | Presentation-only metadata path                       | ✅ No access-control issue observed |

## 5. Transport Security Summary

| Control                 | Status                     | Notes                                                                                                 |
| ----------------------- | -------------------------- | ----------------------------------------------------------------------------------------------------- |
| HTTPS enforcement       | ⚠️ Partial                 | No HTTP calls in T-5 scope; enforcement is deployment/server concern outside this task implementation |
| Content Security Policy | ⚠️ Partial                 | CSP exists but uses static nonce (SEC-01)                                                             |
| CORS policy             | ⚠️ Not verifiable in scope | No backend CORS config present in this frontend task scope                                            |
| SameSite cookies        | ❌ Missing/Not used        | No cookie-based session in reviewed scope                                                             |
| HSTS                    | ❌ Missing/Not verifiable  | Server response-header control not defined in task scope                                              |

## 6. Spec Security Compliance

| NFR   | Requirement                                                               | Status                            | Findings |
| ----- | ------------------------------------------------------------------------- | --------------------------------- | -------- |
| NFR-2 | Animations must not interfere with keyboard navigation and focus handling | ✅ Met in reviewed implementation | None     |
| NFR-3 | Reduced-motion preference should disable motion while preserving behavior | ✅ Met in reviewed implementation | None     |

## 7. Traceability Matrix

| Finding | Severity | OWASP    | Affected Component                     | Status |
| ------- | -------- | -------- | -------------------------------------- | ------ |
| SEC-01  | Medium   | A05:2021 | Application document CSP configuration | Open   |

## 8. Prioritised Recommendations

### Critical (fix before any deployment)

1. None.

### High (fix before release)

1. None.

### Medium (fix in next sprint)

1. Replace static CSP nonce handling with per-response dynamic nonce generation and verify Angular nonce propagation matches the generated value. References: https://angular.dev/best-practices/security and https://owasp.org/www-project-cheat-sheets/cheatsheets/Content_Security_Policy_Cheat_Sheet.html
2. Upgrade dependency chain to remove GHSA-jxxr-4gwj-5jf2 exposure in brace-expansion, then re-run dependency audit verification. Reference: https://github.com/advisories/GHSA-jxxr-4gwj-5jf2

### Low / Info (monitor and address)

1. Continue keeping zone animation metadata flow presentation-only, with no privilege or trust-boundary decisions inside zone components.
