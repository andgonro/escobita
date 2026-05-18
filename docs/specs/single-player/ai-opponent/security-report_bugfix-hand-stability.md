# Security Report: Single Player Mode - AI Opponent (Laia)

**Review Mode:** Incremental (Bugfix: opponent hand rendering stability)
**Source:** docs/specs/single-player/ai-opponent/
**Reviewed against:** spec.md (FR-6, FR-8, NFR-2.1, NFR-2.2), design.md (AD-5, AD-8), Angular Security Guide, OWASP Top 10:2021

## 1. Risk Summary

This scoped review of the rendering stability bugfix found no exploitable security vulnerabilities in the changed files. The implementation remains template-driven, does not use sanitization bypass APIs, and does not introduce direct DOM write patterns or untrusted URL composition. Two patterns that can look risky at a glance were validated as false positives.

- Total findings: 2 (0 Critical, 0 High, 0 Medium, 0 Low, 2 Info - false positives)
- Dependency vulnerabilities: 0 Critical, 0 High (from npm audit)
- Most critical risk areas: None observed in scoped bugfix files
- Overall risk level: Low

## 2. Dependency Vulnerabilities

Results of npm audit --json:

| Package | Version | Severity | CVE | Fix Available |
| ------- | ------- | -------- | --- | ------------- |
| None    | N/A     | N/A      | N/A | N/A           |

Total: 0 Critical, 0 High, 0 Medium, 0 Low

npm audit reports no vulnerabilities.

## 3. Security Findings

### SEC-01: Opponent name interpolation flagged as XSS risk, validated as false positive [Info]

- **OWASP Category:** A03:2021 - Injection
- **Severity:** Info (False Positive)
- **Affected:** src/app/features/game-board/game-table-page/zones/opponent-zones/opponent-zones.html
- **Description:** The template renders opponent names through Angular interpolation in text content. This can be misclassified as XSS risk during static review.
- **Risk:** If interpolation were not escaped, attacker-controlled names could inject script content.
- **Expected Practice:** Render untrusted display strings via Angular interpolation rather than raw HTML binding.
- **Recommendation:** Keep interpolation-based rendering and avoid introducing innerHTML or sanitization bypass methods for opponent labels.
- **References:** https://owasp.org/Top10/A03_2021-Injection/, https://angular.dev/best-practices/security
- **Spec Traceability:** FR-8.1, FR-8.2, AD-8
- **False Positive Rationale:** Angular escapes interpolated values by default, and no raw HTML sink is used in this file.

### SEC-02: Dynamic test-id attributes flagged as DOM injection risk, validated as false positive [Info]

- **OWASP Category:** A03:2021 - Injection
- **Severity:** Info (False Positive)
- **Affected:** src/app/features/game-board/game-table-page/zones/opponent-zones/opponent-zones.html
- **Description:** The template builds data-testid attributes by concatenating a fixed string with the loop index. This can be misread as dynamic attribute injection.
- **Risk:** If attacker input reached attribute construction, it could create DOM manipulation or selector confusion issues.
- **Expected Practice:** Restrict dynamic attribute values to deterministic internal state only.
- **Recommendation:** Keep attribute generation limited to numeric indices and avoid user-controlled values in dynamic attribute expressions.
- **References:** https://owasp.org/Top10/A03_2021-Injection/, https://angular.dev/best-practices/security
- **Spec Traceability:** FR-6.2, FR-8.3, AD-5
- **False Positive Rationale:** Values come from internal numeric loop state, not from external or user-controlled input.

## 4. Authentication and Authorisation Summary

| Protected Route / Resource   | Guard                                            | Token Storage  | Session Management                   | Status                          |
| ---------------------------- | ------------------------------------------------ | -------------- | ------------------------------------ | ------------------------------- |
| Opponent hand rendering zone | N/A (UI-only scope)                              | Not applicable | Not applicable                       | Secure for scoped files         |
| Game route access context    | Existing session guard outside this bugfix scope | Not applicable | Session required before route access | No regression observed in scope |

## 5. Transport Security Summary

| Control                 | Status           | Notes                                                                            |
| ----------------------- | ---------------- | -------------------------------------------------------------------------------- |
| HTTPS enforcement       | Partial evidence | Not verifiable from these UI bugfix files; must be confirmed at deployment edge. |
| Content Security Policy | Partial evidence | No CSP changes in this bugfix scope.                                             |
| CORS policy             | Partial evidence | Backend concern, not verifiable in scoped files.                                 |
| SameSite cookies        | Partial evidence | No cookie handling in scoped files.                                              |
| HSTS                    | Missing evidence | Not verifiable in frontend bugfix scope.                                         |

## 6. Spec Security Compliance

| NFR     | Requirement                                    | Status                                | Findings                                                           |
| ------- | ---------------------------------------------- | ------------------------------------- | ------------------------------------------------------------------ |
| NFR-2.1 | AI strategy must not produce illegal plays     | Partial (out of this UI bugfix scope) | SEC-01, SEC-02 are false positives only; no contradictory evidence |
| NFR-2.2 | AI strategy must produce one decision per turn | Partial (out of this UI bugfix scope) | SEC-01, SEC-02 are false positives only; no contradictory evidence |

## 7. Traceability Matrix

| Finding | Severity              | OWASP    | Affected Component                           | Status |
| ------- | --------------------- | -------- | -------------------------------------------- | ------ |
| SEC-01  | Info (False Positive) | A03:2021 | opponent-zones template rendering            | Closed |
| SEC-02  | Info (False Positive) | A03:2021 | opponent-zones data-testid attribute binding | Closed |

## 8. Prioritised Recommendations

### Critical (fix before any deployment)

1. None.

### High (fix before release)

1. None.

### Medium (fix in next sprint)

1. Continue periodic security checks for Angular template sink usage in game-table zone components, with special focus on preventing any future innerHTML adoption in opponent rendering.

### Low / Info (monitor and address)

1. Keep false-positive triage notes with this report to avoid repeated misclassification of safe Angular interpolation patterns.
2. Re-run scoped security review if this zone later introduces rich text rendering, external URLs, or sanitization bypass APIs.
