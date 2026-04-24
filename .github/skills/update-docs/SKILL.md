---
name: update-docs
description: Update existing documentation artifacts for a change before implementing code. Use when implementation reveals issues that require updating proposal, user-stories, specs, design docs, or tasks — before writing any code. Presents all doc changes for user approval before proceeding.
license: MIT
---

Update existing documentation artifacts for a change in response to issues found during implementation or new requirements clarified by the user.

This skill **only touches documentation** — no code changes are made until the user explicitly approves the updated docs.

**Input**: The user describes a behaviour that needs to change because something was wrong and the implementation is not working as expected, or because new requirements have come to light that were not captured in the original docs.

---

**Steps**

1. **Select the change**

   If the user named a change, use it. Otherwise:
   - Infer from conversation context (e.g., a change was recently discussed)
   - Auto-select if only one active change exists
   - If ambiguous, run `openspec list --json` and use the **AskUserQuestion tool** to let the user choose

   Always announce: "Updating docs for change: **<name>**"

2. **Check status and understand which artifacts exist**

   ```bash
   openspec status --change "<name>" --json
   ```

   Parse the JSON to understand:
   - `schemaName`: The workflow schema (e.g., `spec-driven`)
   - Which artifacts are present and their status

3. **Load all existing artifacts**

   ```bash
   openspec instructions apply --change "<name>" --json
   ```

   Read every file listed in `contextFiles`. Typical artifacts include:
   - `proposal.md` — high-level intent
   - `specs/<capability>/spec.md` — requirements and scenarios
   - `design.md` — technical approach and decisions
   - `tasks.md` — implementation task list
   - `user-stories.md` — user stories and scenarios

   Also check for delta specs under `openspec/changes/<name>/specs/`.

4. **Understand what needs to change**

   If the user's request is clear, proceed. If it is vague:
   - Use the **AskUserQuestion tool** to ask targeted questions such as:
     - "Which artifact needs updating — spec, design, tasks, proposal, or user stories?"
     - "What specifically is wrong or missing?"

   **Do NOT guess at what the user wants to update.** If ambiguous, ask.

5. **Plan and apply documentation updates**

   For each artifact that needs updating, make precise, targeted edits:

   **Specs** (`spec.md`):
   - Adding a missing requirement → add a `### Requirement:` block in the correct section
   - Correcting a scenario → update only the affected `#### Scenario:` block
   - Removing an outdated requirement → delete the block and note it

   **Design** (`design.md`):
   - Updating a decision → revise the relevant decision block; preserve surrounding content
   - Adding a new approach detail → append under the relevant section
   - Correcting a data model or flow → update the affected diagram or description

   **Tasks** (`tasks.md`):
   - Adding a missing task → insert a new `- [ ]` checkbox with a clear description
   - Splitting an overly broad task → replace it with two or more focused tasks
   - Reordering tasks → adjust order to reflect correct implementation sequence
   - Removing a task made obsolete by the doc update → delete and note it

   **Proposal** (`proposal.md`):
   - Only update if the change fundamentally alters scope or intent
   - Keep proposals concise (under 500 words per project conventions)

     **User Stories** (`user-stories.md`):

   - Adding a missing user story → insert a new `### User Story:` block with a clear description and acceptance criteria
   - Correcting an existing user story → update only the affected `### User Story:` block
   - Removing an outdated user story → delete the block and note it

   **Rules for all edits:**
   - Preserve formatting conventions of the existing file
   - Do not rewrite sections that are not affected
   - If a new capability spec file is required, create it following the existing spec format

6. **Present all changes for review**

   After applying updates, show the user a clear summary of every change made:

   ```
   ## Documentation Update Summary

   **Change:** <name>
   **Artifacts updated:** <list>

   ### specs/<capability>/spec.md
   - ADDED Scenario: <name> under Requirement: <name>
     > "<scenario text>"
   - MODIFIED Requirement: <name>
     > Changed: "<old text>" → "<new text>"

   ### design.md
   - UPDATED decision: <decision name>
     > "<summary of what changed>"

   ### tasks.md
   - ADDED task: "<task description>"
   - MODIFIED task: "<old>" → split into:
     - "<task A>"
     - "<task B>"

   ### user-stories.md
   - ADDED User Story: "<user story description>"
     > "<acceptance criteria>"
   - MODIFIED User Story: "<old>" → "<new>"
   - REMOVED User Story: "<user story description>"
   ```

   Then ask:

   > **Do these documentation changes look correct?**
   > Reply **yes** to confirm and proceed to code implementation, or describe what else needs adjusting.

7. **Wait for user approval — do NOT implement any code**
   - If the user **approves**: Confirm the docs are finalized and state:
     > "Documentation is up to date. You can now run the apply-change skill to implement the code changes."
   - If the user **requests adjustments**: Go back to step 5 and apply the requested corrections, then re-present for review.
   - If the user **rejects entirely**: Revert any file changes and inform the user.

---

**Output Format (Step 6)**

```
## Documentation Update Summary

**Change:** <name>
**Schema:** <schema-name>
**Artifacts updated:** <comma-separated list>

### <artifact-filename>
- <ADDED|MODIFIED|REMOVED|SPLIT> <element type>: "<description>"
  [optional detail of change]

---

Do these documentation changes look correct?
Reply **yes** to confirm and proceed to code implementation, or describe what else needs adjusting.
```

---

**Guardrails**

- **Never write or modify source code** — this skill is documentation-only
- **Never auto-approve** — always pause and wait for explicit user confirmation after showing changes
- If updating a spec also makes a task obsolete (or requires a new task), update tasks.md as well and call it out in the summary
- Keep each edit minimal and targeted — do not rewrite artifacts wholesale
- If the user's requested change contradicts an existing design decision, flag the contradiction and ask the user which one should take precedence before editing
- After approval, do not proceed to implementation — direct the user to the `openspec-apply-change` skill
