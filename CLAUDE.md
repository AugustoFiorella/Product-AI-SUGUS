# CLAUDE.md

## Current State

**Project**: Product AI SUGUS — plataforma para crear Product Briefs, Features y PRDs con Gemini AI.

**Stack**: React 19 + TypeScript + Vite + `@google/genai` (Gemini 2.5 Flash). No router, navegación por estado.

**Views activas**: ProductBrief → FeatureIdeation → PRDGenerator → UserJourney

**Pending commits**: `services/geminiService.ts` y `views/ProductBrief.tsx` tienen cambios sin commitear.

**Roadmap activo** (del README, sin implementar):
- [ ] Export a Notion / PDF / Docs
- [ ] Multi-project dashboard
- [ ] Sistema de métricas (NPS, ROI, Success Rate)
- [ ] Motor de recomendaciones predictivo
- [ ] A/B Testing
- [ ] Integración con Salesforce (CRM)

**MCP server**: `mcp-server/rag-mcp-server.js` — requiere `cd mcp-server && npm install` antes de usar.

> Actualizar esta sección al cierre de cada sesión de trabajo.

## Session Closing Checklist

Before ending any session where a service was created or modified:

1. **Start the server** — don't just create files, verify they run
2. **Run a test query** — confirm output matches expectations
3. **Fix failures in-context** — while context is fresh, not next session
4. **Update `## Current State`** above with what's working / what's pending

Prompt to use before closing:
> "Now start the server, run a test query, and show me the output. If anything fails, fix it before we finish."

**Known shell limitation**: Bash commands fail in this environment (shell routes through `git.exe`). Use PowerShell scripts instead — see `mcp-server/test-server.ps1` as the pattern.

## Project Conventions

Primary languages: TypeScript, Python. For React/Vite projects, use `import.meta.env` instead of `process.env` for environment variables.

### Multi-file service prompt template

When requesting any service with 3+ files, **always open the prompt with**:

```
Create a [N]-file [service type] for [topic].
Requirements: use Playwright for scraping, TypeScript for servers,
Python only for ingest scripts. Use import.meta.env for env vars.
```

This prevents rewrites caused by unspecified defaults (e.g., `requests.get()` instead of Playwright, `process.env` instead of `import.meta.env`).

## Code Generation Defaults

When creating Python scripts that scrape or fetch web content, use Playwright (headless browser) by default unless explicitly told otherwise. Do not use `requests.get()` for web scraping.

## File Operations

Before attempting file operations on external drives (D:, E:, etc.), verify drive accessibility first with a simple test command. If inaccessible, immediately fall back to generating a setup script the user can run.

## Custom Skills

### /rag-service

Scaffolds a complete RAG (Retrieval-Augmented Generation) service with:
- TypeScript config with `import.meta.env`
- Python ingest using Playwright (never `requests.get()`)
- Express query server with SQLite backend
- MCP integration for Claude queries
- Full README with setup instructions

Usage: `/rag-service` then specify project name, data source type, and domains.

Generates: `config.ts`, `ingest.py`, `server.ts`, `mcp-server.ts`, `README.md`

## Lifecycle Hooks

**Configured in `~/.claude/settings.json`**

### postToolUse: TypeScript type checking

Runs `npx tsc --noEmit` after every file Write or Edit.

- Detects type errors immediately (before they compound)
- Catches wrong_approach issues early
- Output limited to first 20 lines to stay concise
- Disabled on non-TypeScript files automatically
