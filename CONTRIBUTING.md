# Contributing to Clyve

Thanks for wanting to contribute. Clyve is a small team, right now three
people, building a thesis journal for investors.

We think about contributions as reliable, interpretable, and steerable.
Reliable means code that has actually been run, not just generated.
Interpretable means code and PRs that explain themselves. Steerable means
changes stay aligned with where the project is going, with room to
redirect before work is wasted. ✨

## Before you open a PR, open an issue first

Except for minor fixes, an issue must exist, and a maintainer must
assign it to you, before you start.

1. Search existing issues, or open a new one describing the bug,
   feature, or improvement.
2. Comment asking to be assigned.
3. Wait for a maintainer to assign it.
4. Then start implementation.

**Minor fixes** do not need an issue: typos, broken links, obvious
formatting, outdated version numbers in docs, small grammar fixes.

**Everything else does**, including small looking changes: logic
changes, new dependencies, API behavior, schema or migration changes, UI
changes, performance work, security related changes, config changes.
When in doubt, open an issue.

## 🤖 On AI assisted contributions

We use AI tools ourselves, so use them if you want. What we will not
accept is code that has been generated and submitted without being run.

* Test your changes in your local dev environment
* Run the existing test suite, nothing should regress
* Add tests for new behavior
* Confirm the app actually runs with your change in place

A PR that reads as generated and untested will be closed without a
lengthy back and forth.

## 🎨 Code style

* Self documenting code, names that explain intent over comments
* Follow the existing structure and patterns rather than introducing new
  ones for a single change
* Touch only what your issue is about
* Match the existing design system for anything UI facing

Run lint, typecheck, and tests locally before opening the PR:

```bash
pnpm lint
pnpm typecheck
pnpm test
```

## 🔍 Review process

* Automated checks must pass before human review starts
* Review focuses on data isolation, every query touching user data must
  be scoped to the authenticated user, this is what we scrutinize most
* No secrets or real user data anywhere in the diff
* We will tell you plainly if something needs rework, expect direct
  feedback, not silence
* Squash merge on approval, the PR title becomes the commit message

## 🚫 What we will not merge

* PRs without an assigned issue, outside minor fixes
* Anything that loosens auth, payment correctness, or cross user data
  isolation, even temporarily
* New dependencies for something a few lines of code could do
* Large refactors or architecture changes without prior discussion
* Changes that pull the product back toward research chatbot territory

## Types of contributions we welcome

* 🐛 Bug fixes
* ✨ Features, discuss in an issue first
* 📝 Docs
* 🧪 Tests
* 🔧 Developer experience

## License

By contributing, you agree your contribution may be used, modified, and
relicensed by Clyve AI as part of the project, see
[LICENSE](./LICENSE) for the specifics.

## Questions

Open a [Discussion](../../discussions) for anything open ended. For
something sensitive, see [SECURITY.md](./SECURITY.md) instead of an
issue.

One last thing. Quality, to us, is not a polish pass at the end, it is
being honest earlier, about what you actually tested, what you are still
unsure of, and where a change might not hold up. Say that plainly in
your PR, and we will meet you with the same transparency in review. 🚀 A
thesis worth keeping is one that holds up under scrutiny, and so is a
contribution.
