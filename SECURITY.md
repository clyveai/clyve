# Security Policy

Clyve is a memory layer for how people reason about their investments. That
means the data we hold, why someone holds a position, what they believe,
what they're tracking, is unusually personal. We take the security of
that data, and of the systems that protect it, seriously.

We welcome security and vulnerability reports as part of building a product
worth that trust.

## Reporting a Vulnerability

If you've read this document and believe you've found an issue in scope,
please report it using [GitHub Security Advisory](../../security/advisories/new).
Do not open a public issue, advisories are private by default and let us
work with you before anything is disclosed.

A good report includes:

- A clear summary of the issue and its potential impact
- Detailed steps to reproduce it
- Relevant environment details (browser, OS, endpoint, version)
- Proof-of-concept code, if you have one

We'll acknowledge your report within a few days and keep you updated as we
investigate, including if we need more information from you, or if we've
concluded something is out of scope.

We don't currently run a paid bug bounty program. For confirmed,
high-impact vulnerabilities, we're happy to credit you publicly (with your
permission) and will consider compensation at our discretion, but please
report in good faith regardless of whether that applies.

## What we're most interested in

- Authentication bypass or privilege escalation
- Cross-tenant data exposure, one user able to read, modify, or infer
  another user's thesis, portfolio, or account data
- Unauthenticated access to non-public user data
- Prompt injection or data-source content that causes our LLM layer to
  leak, alter, or act on another user's data
- Exposure of secrets, credentials, or infrastructure access

## In scope

- [ClyveAI](https://clyveai.vercel.app/)
- [ClyveAI Collective](https://github.com/clyveai)

## Out of scope

- Automated scanner output with no demonstrated, working exploit
- Social engineering, phishing, or physical-access attacks
- Denial-of-service or rate-limit exhaustion testing
- Man-in-the-middle attacks
- Clickjacking / UI redress
- CSV or HTML injection with no meaningful impact
- Missing security headers, weak TLS ciphers, or DNS configuration,
  informative, but not something we'll track as a vulnerability report

## While you're testing

- Only test against your own account, or with explicit permission from the
  account owner
- Don't access, modify, or retain data that isn't yours
- Avoid anything that could degrade the service for other users
- If you land access you didn't expect, stop and report it, don't try to
  go further

## For contributors

This is a public repository behind a production product. A few things we
hold as non-negotiable in review, independent of the process above:

- Every query touching thesis, portfolio, or account data must be scoped
  to the authenticated user, no client-supplied ID is trusted without an
  ownership check.
- No secrets, API keys, or `.env` values in commits, PRs, or issues ever,
  even temporarily.
- Treat filing/news content passed to the LLM layer as untrusted input.

See [CONTRIBUTING.md](./CONTRIBUTING.md) for the full workflow.
