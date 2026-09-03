<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# ClyveAI — Agent Rules

## 1. Before writing any code

Read `docs/README.md` first, that's the index, not the content. Open only the doc(s) the task actually touches, don't blanket-load all seven, that wastes context on tasks that don't need it.

| Trigger | Doc |
|---|---|
| New feature, unclear "why" | `01-product.md` |
| Scoping, "is this in V1?" | `02-roadmap.md` |
| Anything touching module boundaries, data flow, adding a service | `03-architecture.md` |
| Adding a dependency, choosing a library | `04-tech-stack.md` |
| Env vars, local run, scripts | `05-development.md` |
| Revisiting something that looks like a past tradeoff | `06-decisions.md` |
| Pricing logic, quota/limit logic, COGS-sensitive code | `07-pricing.md` |

If a change contradicts `03-architecture.md` or `06-decisions.md`, stop and flag it, don't silently diverge. If a change *is* a new architectural decision, propose an entry for `06-decisions.md` in the same diff.

## 2. Stack and structure (non-negotiable)

- Next.js 16 App Router, React 19, TypeScript strict, pnpm.
- Modular Monolith + DDD. Domain logic lives inside its module (`thesis/`, `screening/`, etc.), never in route handlers or UI components. Route handlers orchestrate, they don't contain business rules.
- Drizzle ORM + Supabase Postgres. No raw SQL outside a module's data-access layer.
- Better Auth, Vercel AI SDK, Upstash Redis already cover auth, AI calls, and caching, don't introduce a competing library for the same job.
- Before adding any new dependency, check `04-tech-stack.md` for an existing tool that already solves it.

## 3. Code standards

**Consistency over cleverness.** Find the closest existing analogous file in the same module and mirror its shape, naming, error handling, file layout, import order. One dominant pattern beats three "better" ones.

**Comments explain why, not what.** No comment that restates the line below it. JSDoc only for exports that cross module boundaries, internal helpers don't need it.

**Small, single-responsibility files.** If a file does two unrelated things, split it. If a function needs a paragraph to explain itself, it's doing too much.

**No dead code, no commented-out blocks, no leftover `console.log`** in anything presented as done.

**Types are load-bearing.** No `any` without a one-line justification comment. Infer where obvious, annotate where not.

**Formatting is not a decision.** Prettier/ESLint via husky + lint-staged is the source of truth, don't hand-format against it.

## 4. Token discipline

- Describe the diff, don't restate unchanged code.
- No exhaustive commentary explaining standard language/framework behavior.
- Smallest correct diff over regenerating whole files.
- Commit messages and summaries: one or two lines, what changed and why.

## 5. Definition of done

- [ ] Types and lint pass
- [ ] Domain logic stays inside its module, no leakage into routes/UI
- [ ] Matches an existing codebase pattern, or the deviation is justified and logged in `06-decisions.md`
- [ ] No dashes in user-facing copy (commas instead, per brand voice)
- [ ] Docs updated if this change alters architecture or a prior decision