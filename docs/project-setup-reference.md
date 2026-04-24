# Angular Project Setup Reference Guide

> Based on the **escobita** project setup (Angular 21 + Cypress BDD + GitHub Copilot Agents)
> Date: April 2026

---

## Table of Contents

1. [Angular App Scaffolding](#1-angular-app-scaffolding)
2. [Cypress + Cucumber BDD Setup](#2-cypress--cucumber-bdd-setup)
3. [ESLint + Prettier (Code Quality)](#3-eslint--prettier-code-quality)
4. [Husky + lint-staged (Pre-commit Hooks)](#4-husky--lint-staged-pre-commit-hooks)
5. [Environment Files](#5-environment-files)
6. [VS Code Configuration](#6-vs-code-configuration)
7. [CI Pipeline (GitHub Actions)](#7-ci-pipeline-github-actions)
8. [GitHub Copilot Instructions & Skills](#8-github-copilot-instructions--skills)
9. [GitHub Copilot Agent Pipeline](#9-github-copilot-agent-pipeline)
10. [Final Project Structure](#10-final-project-structure)
11. [NPM Scripts Reference](#11-npm-scripts-reference)
12. [Verification Checklist](#12-verification-checklist)

---

## 1. Angular App Scaffolding

### Command

```powershell
npx @angular/cli@latest new <project-name> --directory ./ --style=scss --interactive=false --skip-git
```

- `--directory ./` — scaffolds into the current folder (useful when the repo already exists)
- `--style=scss` — uses SCSS for component styles
- `--interactive=false` — accepts all defaults without prompts
- `--skip-git` — skips `git init` (repo already initialized)

### Result

- Angular 21.2.x with standalone components (no NgModules)
- Vitest 4.0.8 as the unit test runner
- TypeScript 5.9.x with strict mode
- Default app component at `src/app/app.ts`

---

## 2. Cypress + Cucumber BDD Setup

### Install

```powershell
npm install --save-dev cypress @badeball/cypress-cucumber-preprocessor @bahmutov/cypress-esbuild-preprocessor start-server-and-test
```

### Configuration — `cypress.config.ts`

```typescript
import { defineConfig } from 'cypress';
import createBundler from '@bahmutov/cypress-esbuild-preprocessor';
import {
  addCucumberPreprocessorPlugin,
  afterRunHandler,
  beforeRunHandler,
} from '@badeball/cypress-cucumber-preprocessor';
import { createEsbuildPlugin } from '@badeball/cypress-cucumber-preprocessor/esbuild';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:4200',
    specPattern: 'cypress/e2e/**/*.feature',
    supportFile: 'cypress/support/e2e.ts',
    async setupNodeEvents(on, config) {
      await addCucumberPreprocessorPlugin(on, config);

      on(
        'file:preprocessor',
        createBundler({
          plugins: [createEsbuildPlugin(config)],
        }),
      );

      on('before:run', async () => {
        await beforeRunHandler(config);
      });

      on('after:run', async (results) => {
        await afterRunHandler(config, results);
      });

      return config;
    },
  },
});
```

### Cucumber Preprocessor Config — in `package.json`

```json
"cypress-cucumber-preprocessor": {
  "stepDefinitions": "cypress/e2e/**/*.ts",
  "nonGlobalStepDefinitions": false
}
```

### Sample Feature File — `cypress/e2e/app-startup.feature`

```gherkin
Feature: Application Startup

  Scenario: The app loads successfully
    Given the application is running
    When I visit the home page
    Then I should see the application title
```

### Sample Step Definitions — `cypress/e2e/app-startup.ts`

Step definition files sit alongside `.feature` files in `cypress/e2e/`. They use `Given`, `When`, `Then` imports from `@badeball/cypress-cucumber-preprocessor`.

### Key Notes

- `afterRunHandler` requires **two arguments**: `(config, results)` — the `results` parameter comes from the `after:run` Cypress event callback
- `start-server-and-test` is needed for the `e2e` script to work (serves the app, waits for it, then runs Cypress)

---

## 3. ESLint + Prettier (Code Quality)

### Install ESLint with Angular Rules

```powershell
npx ng add @angular-eslint/schematics --skip-confirmation
npm install --save-dev eslint-config-prettier
```

This creates `eslint.config.js` and adds the `lint` architect target to `angular.json`.

### ESLint Config — `eslint.config.js`

```javascript
// @ts-check
const eslint = require('@eslint/js');
const { defineConfig } = require('eslint/config');
const tseslint = require('typescript-eslint');
const angular = require('angular-eslint');
const prettier = require('eslint-config-prettier');

module.exports = defineConfig([
  {
    files: ['**/*.ts'],
    extends: [
      eslint.configs.recommended,
      tseslint.configs.recommended,
      tseslint.configs.stylistic,
      angular.configs.tsRecommended,
      prettier, // MUST be last — disables formatting rules that conflict with Prettier
    ],
    processor: angular.processInlineTemplates,
    rules: {
      '@angular-eslint/directive-selector': [
        'error',
        { type: 'attribute', prefix: 'app', style: 'camelCase' },
      ],
      '@angular-eslint/component-selector': [
        'error',
        { type: 'element', prefix: 'app', style: 'kebab-case' },
      ],
    },
  },
  {
    files: ['**/*.html'],
    extends: [angular.configs.templateRecommended, angular.configs.templateAccessibility],
    rules: {},
  },
]);
```

### Prettier Config — `.prettierrc`

```json
{
  "printWidth": 100,
  "singleQuote": true,
  "overrides": [
    {
      "files": "*.html",
      "options": {
        "parser": "angular"
      }
    }
  ]
}
```

### Prettier Ignore — `.prettierignore`

```
# Build output
dist/
.angular/

# Dependencies
node_modules/

# Cypress
cypress/videos/
cypress/screenshots/

# Gherkin feature files (no Prettier parser)
*.feature
```

### Key Notes

- `eslint-config-prettier` **must** be the last item in `extends` to properly disable conflicting formatting rules
- `.prettierignore` excludes `.feature` files since Prettier has no Gherkin parser
- HTML files use the `angular` parser in Prettier (not the default HTML parser)

---

## 4. Husky + lint-staged (Pre-commit Hooks)

### Install & Initialize

```powershell
npm install --save-dev husky lint-staged
npx husky init
```

### Pre-commit Hook — `.husky/pre-commit`

```
npx lint-staged
```

### lint-staged Config — in `package.json`

```json
"lint-staged": {
  "*.{ts,html}": "eslint --fix",
  "*.{ts,html,scss,css,json,md}": "prettier --write"
}
```

### Key Notes

- Husky adds `"prepare": "husky"` to `package.json` scripts automatically
- Every commit runs ESLint with auto-fix on `.ts` and `.html` files, then Prettier on all formattable files

---

## 5. Environment Files

### Generate

```powershell
npx ng generate environments
```

### Result

- Creates `src/environments/environment.ts` (production)
- Creates `src/environments/environment.development.ts` (development)
- Updates `angular.json` with file replacement configuration

---

## 6. VS Code Configuration

### Recommended Extensions — `.vscode/extensions.json`

```json
{
  "recommendations": [
    "angular.ng-template",
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "alexkrechik.cucumberautocomplete"
  ]
}
```

| Extension                          | Purpose                                                                |
| ---------------------------------- | ---------------------------------------------------------------------- |
| `angular.ng-template`              | Angular language service (template intellisense, go-to-definition)     |
| `esbenp.prettier-vscode`           | Auto-format on save with Prettier                                      |
| `dbaeumer.vscode-eslint`           | Inline ESLint error highlighting                                       |
| `alexkrechik.cucumberautocomplete` | Gherkin syntax highlighting and step autocomplete for `.feature` files |

---

## 7. CI Pipeline (GitHub Actions)

### Workflow — `.github/workflows/ci.yml`

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build-and-test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm

      - run: npm ci

      - name: Lint
        run: npx ng lint

      - name: Build
        run: npx ng build

      - name: Unit Tests
        run: npx ng test --watch=false
```

### Key Notes

- Runs on every push to `main` and every PR targeting `main`
- Uses Node 22 with npm caching for faster installs
- Pipeline: Lint → Build → Unit Tests (fails fast)
- E2E tests are not included in CI yet (would need `start-server-and-test` + Cypress in headless mode)

---

## 8. GitHub Copilot Setup

This section covers all GitHub Copilot customisation: instructions, reference documents, skills, and agents. These live under `.github/` and are committed to the repository so every team member gets the same AI-assisted experience.

### 8.1 Folder Structure

```
.github/
├── agents/                         # Custom Copilot agents
│   ├── product-management-assistant.agent.md
│   ├── qa-assistant.agent.md
│   ├── architect-assistant.agent.md
│   ├── developer-assistant.agent.md
│   └── reviewer-assistant.agent.md
├── instructions/                   # Auto-loaded coding guidelines
│   ├── angular-developer.instructions.md
│   ├── angular-new-app.instructions.md
│   └── references/                 # 35 Angular reference docs
│       ├── components.md
│       ├── signals-overview.md
│       ├── signal-forms.md
│       └── ... (35 files total)
├── skills/                         # Reusable workflow skills
│   └── update-docs/
│       └── SKILL.md
└── workflows/
    └── ci.yml
```

### 8.2 Instructions — `.github/instructions/`

Instructions are markdown files with YAML frontmatter that Copilot **automatically loads** when the user opens files matching the `applyTo` glob pattern. They inject project-specific coding guidelines into every Copilot interaction.

#### How to Create an Instruction File

1. Create a `.instructions.md` file in `.github/instructions/`
2. Add YAML frontmatter with `applyTo` — a glob pattern that determines when the instruction is loaded
3. Write the guidelines in markdown below the frontmatter

#### Instruction File Template

```markdown
---
applyTo: '**/*.{ts,html,scss,css}'
---

# Instruction Title

Your guidelines here...
```

#### Instructions in This Project

**File: `angular-developer.instructions.md`**

```yaml
applyTo: '**/*.{ts,html,scss,css}'
```

Auto-loaded for all Angular source files. Contains:

- **General rules:** Always check Angular version before giving guidance. Use Angular CLI for scaffolding. Run `ng build` after generating code.
- **Project creation rules:** Version detection logic (`ng version` → local install → `npx @angular/cli@latest`)
- **Components:** Links to `references/components.md`, `inputs.md`, `outputs.md`, `host-elements.md`
- **Signals & state:** Prefer Angular Signals (`signal`, `computed`, `linkedSignal`, `resource`, `effect`). Links to reference docs.
- **Forms:** Prefer Signal Forms for Angular 21+. Links to `signal-forms.md`, `template-driven-forms.md`, `reactive-forms.md`
- **DI:** Use `inject()` function, `providedIn: 'root'`. Links to 5 DI reference docs.
- **Accessibility:** Angular Aria for Accordion, Listbox, Combobox, Menu, Tabs, Toolbar, Tree, Grid
- **Routing:** Links to 9 routing reference docs (routes, lazy loading, guards, resolvers, animations, SSR)
- **Styling:** Tailwind CSS, Angular Animations, component styling references
- **Testing:** Vitest fundamentals, component harnesses, router testing, E2E with Cypress
- **Tooling:** Angular CLI, Angular MCP Server

**File: `angular-new-app.instructions.md`**

```yaml
applyTo: '**/angular.json'
```

Loaded when editing `angular.json`. Contains step-by-step instructions for creating new Angular apps:

1. Check for Angular CLI installation (`where ng` on Windows, `which ng` on Unix)
2. Create app with `npx ng new <name> --interactive=false --ai-config=copilot` plus optional flags (`--style`, `--routing`, `--ssr`, `--prefix`, `--skip-tests`)
3. Use `ng generate` for all scaffolding (components, services, pipes, directives, guards, interceptors, resolvers, enums, classes)
4. Add Tailwind with `npx ng add tailwindcss`
5. References the Angular MCP Server for best practices (`npx ng mcp` + `get_best_practices`)

#### Reference Documents — `.github/instructions/references/`

35 markdown files providing deep Angular documentation that instruction files link to. Copilot reads these on demand when it encounters a relevant task.

| Category            | Files                                                                                                                                                                                                                | Topics Covered                                                                      |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| **Components**      | `components.md`, `inputs.md`, `outputs.md`, `host-elements.md`                                                                                                                                                       | Anatomy, metadata, signal inputs/outputs, host bindings                             |
| **Signals & State** | `signals-overview.md`, `linked-signal.md`, `resource.md`, `effects.md`                                                                                                                                               | `signal()`, `computed()`, `linkedSignal()`, `resource()`, `effect()`, `untracked()` |
| **Forms**           | `signal-forms.md`, `template-driven-forms.md`, `reactive-forms.md`                                                                                                                                                   | Signal forms (v21+), NgModel, FormControl/FormGroup                                 |
| **DI**              | `di-fundamentals.md`, `creating-services.md`, `defining-providers.md`, `injection-context.md`, `hierarchical-injectors.md`                                                                                           | `inject()`, `providedIn`, `InjectionToken`, `useFactory`, hierarchy                 |
| **Accessibility**   | `angular-aria.md`                                                                                                                                                                                                    | Headless accessible component patterns (Accordion, Listbox, etc.)                   |
| **Routing**         | `define-routes.md`, `loading-strategies.md`, `show-routes-with-outlets.md`, `navigate-to-routes.md`, `route-guards.md`, `data-resolvers.md`, `router-lifecycle.md`, `rendering-strategies.md`, `route-animations.md` | URL paths, lazy loading, outlets, guards, resolvers, CSR/SSG/SSR, View Transitions  |
| **Styling**         | `tailwind-css.md`, `angular-animations.md`, `component-styling.md`                                                                                                                                                   | Tailwind v4, CSS animations, encapsulation                                          |
| **Testing**         | `testing-fundamentals.md`, `component-harnesses.md`, `router-testing.md`, `e2e-testing.md`                                                                                                                           | Vitest, TestBed, harnesses, RouterTestingHarness, Cypress                           |
| **Tooling**         | `cli.md`, `mcp.md`                                                                                                                                                                                                   | CLI commands, MCP server tools                                                      |

#### How to Source References

The reference documents were sourced from the official Angular dev skills repository:

```
https://github.com/angular/angular/tree/main/skills/dev-skills/
```

To set up for a new project:

```powershell
# Clone the Angular repo (sparse checkout for just the skills)
git clone --depth 1 --filter=blob:none --sparse https://github.com/angular/angular.git
cd angular
git sparse-checkout set skills/dev-skills

# Copy reference docs to your project
cp skills/dev-skills/references/*.md <your-project>/.github/instructions/references/

# Copy the main instruction file
cp skills/dev-skills/angular-developer.instructions.md <your-project>/.github/instructions/

# Clean up
cd .. && rm -rf angular
```

Then customise `angular-developer.instructions.md` to fit your project's conventions (form strategy, preferred patterns, etc.).

### 8.3 Skills — `.github/skills/`

Skills are reusable workflow definitions that Copilot agents and the user can invoke. Each skill lives in its own folder with a `SKILL.md` file.

#### Skill File Template

```markdown
---
name: skill-name
description: What this skill does and when to use it.
license: MIT
---

Description of the skill's purpose.

**Input**: What the user provides.

---

**Steps**

1. Step one...
2. Step two...
```

#### Skills in This Project

**Skill: `update-docs`** — `.github/skills/update-docs/SKILL.md`

- **Purpose:** Updates existing documentation artifacts (proposal, spec, user-stories, design, tasks) when implementation reveals issues or new requirements — before any code is written.
- **When to use:** When the Developer or Reviewer agent finds that a spec is wrong, incomplete, or needs to change before implementation can proceed.
- **Policy:** Documentation-only — no code changes until the user explicitly approves the doc updates.

**Workflow:**

1. Select the change (by name, from context, or ask the user)
2. Check status and understand which artifacts exist
3. Load all existing artifacts (proposal.md, spec.md, design.md, tasks.md, user-stories.md)
4. Understand what needs to change (ask targeted questions if vague)
5. Plan and apply documentation updates with precise, targeted edits
6. Present all changes for review in a structured summary
7. Wait for user approval — do NOT implement any code

**Edit rules:** Preserve existing formatting. Only touch affected sections. Follow the existing file structure for new entries.

### 8.4 Agents — `.github/agents/`

Agents are custom Copilot personas with specific responsibilities, tool restrictions, and workflows. Each agent is a `.agent.md` file with YAML frontmatter.

#### Agent File Template

```markdown
---
name: Agent Name
description: One-line description of what this agent does.
argument-hint: 'Example of expected input from the user.'
tools: ['vscode', 'read', 'agent', 'edit', 'search', 'web', 'todo']
agents: ['Explore']
---

Role description paragraph.

<no-code-policy>
(Policy block — what this agent can and cannot produce)
</no-code-policy>

<rules>
(File-write scope, read-only restrictions, mandatory steps)
</rules>

## Workflow Steps

...
```

#### Frontmatter Reference

| Field           | Required | Description                                                           |
| --------------- | -------- | --------------------------------------------------------------------- |
| `name`          | Yes      | Human-readable name (shown in `@agent-name` autocomplete)             |
| `description`   | Yes      | One-line purpose description                                          |
| `argument-hint` | No       | Example input shown as placeholder text                               |
| `tools`         | No       | Array of allowed tool categories. If omitted, all tools are available |
| `agents`        | No       | Array of subagent names this agent can invoke via `runSubagent`       |

#### Tool Categories

| Tool      | Capability                                    |
| --------- | --------------------------------------------- |
| `vscode`  | VS Code UI interactions (askQuestions, etc.)  |
| `execute` | Run terminal commands                         |
| `read`    | Read files                                    |
| `edit`    | Create/modify files                           |
| `search`  | Search codebase (grep, semantic, file search) |
| `web`     | Fetch web pages                               |
| `agent`   | Invoke subagents                              |
| `todo`    | Manage todo lists                             |

#### Common Agent Design Patterns

These patterns are consistent across all agents in this project:

**1. No-Code Policy Block**

Every non-coding agent has a `<no-code-policy>` XML block that strictly prevents code generation. The block follows this pattern:

```markdown
<no-code-policy>
THIS IS AN ABSOLUTE, NON-NEGOTIABLE RULE. It overrides every other instruction...

- You MUST NEVER write, display, suggest, or generate code of any kind...
- You MUST NEVER use file-editing tools on any source file...
- You MUST NEVER run terminal commands that modify the codebase...
- The ONLY structured text permitted is: [agent-specific exception]
- If a user asks you to write code, refuse and redirect...
  </no-code-policy>
```

**Agent-specific exceptions:**

| Agent                        | Permitted Structured Text                                   |
| ---------------------------- | ----------------------------------------------------------- |
| Product Management Assistant | None — plain English prose only                             |
| QA Assistant                 | Gherkin syntax only (in `bdd-test.md`)                      |
| Architect Assistant          | Mermaid diagram syntax only (in `design.md` and `tasks.md`) |
| Developer Assistant          | Full source code (the only coding agent)                    |
| Reviewer Assistant           | Mermaid diagram syntax only (in `review-report.md`)         |

**2. File-Write Scope Restriction**

Every agent's `<rules>` block restricts file editing to specific output files:

```markdown
<rules>
- File-editing tools are ONLY permitted for writing [specific files] under
  `docs/specs/{epic-id}/{feature-id}/`. They MUST NOT be used on any other path.
- You are STRICTLY READ-ONLY for everything outside that path.
</rules>
```

**3. Discovery Phase with Explore Subagent**

Every agent starts by reading spec documents and running the `Explore` subagent with `<research_instructions>` for autonomous codebase research. The research instructions are tailored per agent but always end with: "DO NOT include code snippets. Describe findings in plain English only."

**4. Clarification with askQuestions**

All agents use `#tool:vscode/askQuestions` to resolve ambiguities before generating output. Each question is asked one at a time with options and trade-off explanations.

**5. Approval Gate Before File Generation**

All agents present a plan/summary and wait for explicit user confirmation before creating output files.

---

## 9. GitHub Copilot Agent Pipeline

### Pipeline Flow

```
PrM → QA → Architect → Developer → Reviewer
                                    ↑ (auto-invoked after each task)
```

### Agent Details

#### Agent 1: Product Management Assistant

```yaml
# Frontmatter
name: Product Management Assistant
description: This agent helps product managers plan and document new features within GitHub Copilot.
argument-hint: 'Short description of the feature to be implemented.'
tools: ['vscode', 'execute', 'read', 'agent', 'edit', 'search', 'web', 'todo']
agents: ['Explore']
```

- **Role:** Guides users through comprehensive feature planning via structured questioning
- **Writes code:** No (strict no-code policy, prose only)
- **Workflow:** Discovery → Structured Questioning (Feature Definition, UX/UI, NFR, Business, Compliance, Technical, Risks) → Data Collection & Confirmation → Documentation Generation
- **Output files** (under `docs/specs/{epic-id}/{feature-id}/`):
  - `proposal.md` — Title, Summary, Context, High-level approach, Deliverables, Notes
  - `spec.md` — Overview, FR-X.X (Functional), TR-X.X (Technical), NFR-X.X (Non-Functional), Out of Scope, Future
  - `user-stories.md` — US-X stories with As a/I want/So that + acceptance criteria checklists
- **Invocation:** `@product-management-assistant Add a card game scoring system`
- **Tone:** Friendly, encouraging, patient, action-oriented

#### Agent 2: QA Assistant

```yaml
# Frontmatter
name: QA Assistant
description: This agent reads spec documentation and generates BDD test scenarios in Gherkin format.
argument-hint: 'Path to the feature spec folder, e.g. docs/specs/my-epic/my-feature'
tools: ['vscode', 'read', 'agent', 'edit', 'search', 'todo']
agents: ['Explore']
```

- **Role:** Reads PrM output and generates comprehensive BDD test scenarios
- **Writes code:** No (only Gherkin syntax is permitted)
- **Workflow:** Discovery → Gap Analysis & Clarification → Test Coverage Planning → BDD Scenario Generation → Review
- **Output files** (under `docs/specs/{epic-id}/{feature-id}/`):
  - `bdd-test.md` — Traceability matrix (SC-XX → FR-X.X/US-X) + Feature blocks with Gherkin (Background, Scenarios, Scenario Outlines with Examples)
- **Gherkin rules:**
  - One behaviour per scenario
  - Unique SC-XX IDs mapped in traceability matrix
  - Given (past) / When (present) / Then (present) tense
  - Use Background for shared preconditions
  - Use Scenario Outline + Examples for data variations
  - Use Rule to group related scenarios
  - Include negative scenarios for every happy path
  - Include edge cases (empty states, max/min, special chars, concurrency, timeouts)
  - No CSS selectors, API endpoints, or internal function names
- **Invocation:** `@qa-assistant docs/specs/core/scoring-system`
- **Tone:** Analytical, thorough, precise, quality-focused

#### Agent 3: Architect Assistant

```yaml
# Frontmatter
name: Architect Assistant
description: This agent reads spec documentation and produces technical architecture designs with Mermaid diagrams and implementation task breakdowns.
argument-hint: 'Path to the feature spec folder, e.g. docs/specs/my-epic/my-feature'
tools: ['vscode', 'read', 'agent', 'edit', 'search', 'web', 'todo']
agents: ['Explore']
```

- **Role:** Translates what needs to be built into how it should be built, with visual diagrams
- **Writes code:** No (only Mermaid diagram syntax is permitted)
- **Workflow:** Discovery → Architecture Analysis & Clarification → Design Planning (with live Mermaid preview via `renderMermaidDiagram`) → Documentation Generation → Review
- **Output files** (under `docs/specs/{epic-id}/{feature-id}/`):
  - `design.md` — Overview, **Architecture Diagrams** (mandatory Mermaid section with component tree, data flow, sequence diagrams, service dependency, routing), Architectural Decisions (AD-X with Context/Decision/Rationale/Consequences), Component Architecture, State Management, Service Layer, Routing, Data Model, API Integration, Error Handling, Accessibility, Performance, Testing Strategy, Risk Assessment
  - `tasks.md` — Task Dependency Overview (Mermaid graph), T-X tasks (Description, AD-X reference, Dependencies, Components affected, Acceptance criteria, Estimation XS/S/M/L/XL, Spec traceability), Implementation Order
- **Mandatory diagrams in every `design.md`:**
  1. Component tree (`graph TD`) — smart vs presentational, inputs, outputs
  2. Data flow (`flowchart LR`) — data entry, transformation, UI
  3. Sequence diagram(s) (`sequenceDiagram`) — one per major user flow
  4. Service dependency (`graph TD`) — injection scopes
  5. Routing (`graph TD`) — lazy boundaries, guards, resolvers
  6. Task dependency graph in `tasks.md` (`graph LR`)
- **Invocation:** `@architect-assistant docs/specs/core/scoring-system`
- **Tone:** Strategic, visual-first, pragmatic, risk-aware

#### Agent 4: Developer Assistant

```yaml
# Frontmatter
name: Developer Assistant
description: Implements feature tasks from tasks.md following the architecture in design.md and Angular best practices. Automatically invokes the Reviewer Assistant after each task to validate the implementation.
argument-hint: 'Path to the feature spec folder and task, e.g. docs/specs/my-epic/my-feature T-3'
tools: ['vscode', 'execute', 'read', 'agent', 'edit', 'search', 'web', 'todo']
agents: ['Explore', 'Reviewer Assistant']
```

- **Role:** The implementation engine — turns architecture and tasks into working, tested code
- **Writes code:** **Yes** (the only agent with code-writing permission)
- **Workflow:** Context Loading → Implementation Planning (present plan, wait for approval) → Implementation (scaffold with CLI, write code, write tests) → Verification (`ng build`, `ng lint`, `ng test`) → Task Status Update → **Automatic Review** (invokes Reviewer Assistant) → Review Response → Next Task
- **Key behaviours:**
  - Works one task at a time (T-X). Never starts T-X+1 before T-X is reviewed.
  - Uses `ng generate` for all scaffolding
  - Follows `design.md` decisions precisely — asks before deviating
  - Reads `.github/instructions/` reference docs before implementing each pattern
  - Writes meaningful tests (see Test Writing Standards below)
  - **Automatically invokes `@reviewer-assistant` after every task** — review is not optional
  - Critical/Major review findings must be resolved or explicitly deferred before moving on
- **Test writing standards:**
  - **Unit tests:** Test behaviour (inputs → rendered output, state changes → UI updates), not existence. Include edge cases. Traceable to FR-X.X/US-X.
  - **E2E tests:** Match Gherkin from `bdd-test.md` exactly. Real browser actions + meaningful assertions. Never empty/no-op step defs.
  - **Forbidden:** `expect(component).toBeTruthy()` alone, empty step bodies, testing mocks instead of code, hardcoded literal matching
- **Invocation:** `@developer-assistant docs/specs/core/scoring-system T-1`
- **Tone:** Precise, quality-focused, transparent, standards-driven

#### Agent 5: Reviewer Assistant

```yaml
# Frontmatter
name: Reviewer Assistant
description: Validates implementation against spec documentation, architecture design, BDD scenarios, and Angular best practices. Produces a review report with findings and architecture comparison diagrams.
argument-hint: 'Path to the feature spec folder and review mode, e.g. docs/specs/my-epic/my-feature [full|task T-3]'
tools: ['vscode', 'read', 'agent', 'edit', 'search', 'web', 'todo']
agents: ['Explore']
```

- **Role:** Final quality gate — validates that what was planned is what was built
- **Writes code:** No (only Mermaid diagram syntax for architecture comparisons)
- **Review modes:**
  - `full` — comprehensive review of entire feature implementation
  - `task T-X` — incremental review of a specific task (auto-triggered by Developer)
- **Workflow:** Discovery (read all spec docs + research implementation) → Analysis (5 dimensions) → Clarification → Report Generation → Iteration
- **Five review dimensions:**
  1. **Code Quality & Angular Best Practices** — signals usage, DI patterns, component selectors, form strategy, accessibility
  2. **Spec Compliance** — FR-X.X fulfilment, US-X acceptance criteria, NFR-X.X adherence
  3. **Architecture Drift** — component hierarchy vs `design.md`, service scopes, routing, state management. **Produces Mermaid diagrams comparing planned vs actual architecture.**
  4. **Test Coverage Alignment** — SC-XX scenarios have step definitions, feature files exist, unit tests cover critical paths
  5. **Test Quality & Meaningfulness** — catches superficial assertions (Major), empty step defs (Major), tautological tests (Major), happy-path-only coverage (Minor), disconnected tests (Minor), hardcoded expectations (Minor)
- **Output files** (under `docs/specs/{epic-id}/{feature-id}/`):
  - `review-report.md` — Executive Summary, Architecture Comparison (planned vs actual Mermaid diagrams + drift analysis), Findings (RV-XX with Category/Severity/Related/Description/Expected/Actual/Recommendation/Impact), Traceability Matrix, Spec Compliance Summary, Task Completion Summary, Test Coverage Summary, Test Quality Summary, Recommendations
- **Finding severity levels:**
  - **Critical:** Blocks release (unmet requirement, security vulnerability, broken functionality)
  - **Major:** Fix before merge (design deviation, false-confidence tests, best practice violation)
  - **Minor:** Improvement recommended (missing edge case, small inconsistency)
  - **Note:** Informational (worth knowing, no action required)
- **Invocation:** `@reviewer-assistant docs/specs/core/scoring-system full` or `@reviewer-assistant docs/specs/core/scoring-system task T-3`
- **Tone:** Constructive, neutral, evidence-based, honest about test quality

### Pipeline Invocation — Full Workflow Example

```
# Step 1: Define the feature (PrM → proposal.md, spec.md, user-stories.md)
@product-management-assistant Add a card game scoring system

# Step 2: Generate BDD test scenarios (QA → bdd-test.md)
@qa-assistant docs/specs/core/scoring-system

# Step 3: Design the architecture (Architect → design.md, tasks.md)
@architect-assistant docs/specs/core/scoring-system

# Step 4: Implement task by task (Developer → code + tests, auto-triggers Reviewer)
@developer-assistant docs/specs/core/scoring-system T-1
@developer-assistant docs/specs/core/scoring-system T-2
@developer-assistant docs/specs/core/scoring-system T-3

# Step 5: Final comprehensive review (optional, for release validation)
@reviewer-assistant docs/specs/core/scoring-system full
```

### ID Scheme & Traceability

All artifacts use cross-referenced ID schemes for full traceability:

| ID        | Source             | Meaning                    | Created By |
| --------- | ------------------ | -------------------------- | ---------- |
| `FR-X.X`  | `spec.md`          | Functional Requirement     | PrM        |
| `TR-X.X`  | `spec.md`          | Technical Requirement      | PrM        |
| `NFR-X.X` | `spec.md`          | Non-Functional Requirement | PrM        |
| `US-X`    | `user-stories.md`  | User Story                 | PrM        |
| `SC-XX`   | `bdd-test.md`      | BDD Scenario               | QA         |
| `AD-X`    | `design.md`        | Architectural Decision     | Architect  |
| `T-X`     | `tasks.md`         | Implementation Task        | Architect  |
| `RV-XX`   | `review-report.md` | Review Finding             | Reviewer   |

**Traceability chain:** `FR-X.X` → `US-X` → `SC-XX` → `AD-X` → `T-X` → `RV-XX`

Every artifact references back to its source requirements, creating an unbroken chain from business need to implementation validation.

### Documentation Output Structure

```
docs/specs/{epic-id}/{feature-id}/
├── proposal.md          ← PrM Agent
├── spec.md              ← PrM Agent
├── user-stories.md      ← PrM Agent
├── bdd-test.md          ← QA Agent
├── design.md            ← Architect Agent
├── tasks.md             ← Architect Agent
└── review-report.md     ← Reviewer Agent
```

---

## 10. Final Project Structure

```
escobita/
├── .editorconfig
├── .gitignore
├── .prettierrc
├── .prettierignore
├── angular.json
├── cypress.config.ts
├── eslint.config.js
├── package.json
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.spec.json
│
├── .github/
│   ├── agents/
│   │   ├── product-management-assistant.agent.md
│   │   ├── qa-assistant.agent.md
│   │   ├── architect-assistant.agent.md
│   │   ├── developer-assistant.agent.md
│   │   └── reviewer-assistant.agent.md
│   ├── instructions/
│   │   ├── angular-developer.instructions.md
│   │   ├── angular-new-app.instructions.md
│   │   └── references/          (35 Angular reference docs)
│   ├── skills/
│   │   └── update-docs/
│   └── workflows/
│       └── ci.yml
│
├── .husky/
│   └── pre-commit
│
├── .vscode/
│   ├── extensions.json
│   ├── launch.json
│   ├── mcp.json
│   └── tasks.json
│
├── cypress/
│   ├── e2e/
│   │   ├── app-startup.feature
│   │   └── app-startup.ts
│   ├── support/
│   │   ├── commands.ts
│   │   └── e2e.ts
│   └── tsconfig.json
│
├── src/
│   ├── main.ts
│   ├── app/
│   │   ├── app.ts
│   │   ├── app.html
│   │   ├── app.scss
│   │   ├── app.config.ts
│   │   └── app.routes.ts
│   ├── environments/
│   │   ├── environment.ts
│   │   └── environment.development.ts
│   └── public/
│
└── docs/specs/               (created per-feature by agents)
```

---

## 11. NPM Scripts Reference

| Script            | Command                                                    | Purpose                               |
| ----------------- | ---------------------------------------------------------- | ------------------------------------- |
| `npm start`       | `ng serve`                                                 | Dev server at `http://localhost:4200` |
| `npm run build`   | `ng build`                                                 | Production build to `dist/`           |
| `npm test`        | `ng test`                                                  | Run unit tests (Vitest)               |
| `npm run lint`    | `ng lint`                                                  | Run ESLint                            |
| `npm run cy:open` | `cypress open`                                             | Open Cypress interactive UI           |
| `npm run cy:run`  | `cypress run`                                              | Run Cypress headless                  |
| `npm run e2e`     | `start-server-and-test start http://localhost:4200 cy:run` | Serve app + run Cypress E2E           |
| `npm run watch`   | `ng build --watch --configuration development`             | Rebuild on file changes               |

---

## 12. Verification Checklist

Run these commands after completing setup to verify everything works:

```powershell
# 1. Build
npx ng build

# 2. Lint
npx ng lint

# 3. Unit tests
npx ng test --watch=false

# 4. Cypress
npx cypress verify

# 5. E2E (starts server + runs tests)
npm run e2e
```

All should pass with zero errors before starting feature development.
