# deployhealth env check

A GitHub Action that scans your repository for env var drift on every push and reports it to
[deployhealth](https://deployhealth.dev): variables your code reads that no env file declares
(MISSING), variables declared but never read (UNUSED), and `.env` / `.env.example` disagreements
(MISMATCH), each with its file and line.

deployhealth keeps the **deploy history** per project (what each deploy added or fixed) and links
an **alert** to the deploy that broke things when an endpoint you monitor starts failing.

**Names and line numbers only, never values.** The scanner reads your source and env files on the
runner and sends variable names, file paths and line numbers. It never sends, stores or prints an
env value.

> Want checks on pull requests instead? Those come from the deployhealth GitHub App, which needs no
> token and no workflow. This Action is for deploy history and alerts. See
> [deployhealth.dev](https://deployhealth.dev).

## Usage

1. In deployhealth, create a project for the repository and copy its ingest token (shown once).
2. In the repository on GitHub: **Settings → Secrets and variables → Actions → Secrets tab → New
   repository secret**, named `DEPLOYHEALTH_TOKEN`, with the token as its value. Not a Variable:
   the Variables tab shows values in plain text to anyone with access to the repository. Not an
   environment secret: the workflow below declares no environment, so it wouldn't see one.
3. Add the workflow:

```yaml
# .github/workflows/deployhealth.yml
name: deployhealth

# Push events only: the job reads a repository secret, so never run it on pull_request
# events from forks.
on:
  push:
    branches: [main]

jobs:
  env-scan:
    runs-on: ubuntu-latest
    permissions:
      contents: read
    steps:
      - uses: actions/checkout@v5
        with:
          persist-credentials: false
      - uses: Utsav-mishra-25/deployhealth-action@v1
        with:
          token: ${{ secrets.DEPLOYHEALTH_TOKEN }}
```

`@v1` follows the latest 1.x release. A tag can be moved, so if you'd rather run exactly the code
you reviewed, pin the full commit SHA of a release instead, with the version in a comment:

```yaml
      - uses: Utsav-mishra-25/deployhealth-action@<full-commit-sha> # v1.0.0
```

### Try it without an account

`dry-run: true` prints the findings in the job log and sends nothing, so it needs no token:

```yaml
      - uses: Utsav-mishra-25/deployhealth-action@v1
        with:
          dry-run: true
```

Or on your machine, from the repository root: `npx -y deployhealth-scan --dry-run`.

## Inputs

| Input | Default | What it does |
| --- | --- | --- |
| `token` | none | The project's ingest token, from the `DEPLOYHEALTH_TOKEN` secret. Required unless `dry-run` is `true`. |
| `url` | `https://deployhealth.dev` | The deployhealth instance to report to (set it if you run your own). |
| `sha` | `github.sha` | The commit being deployed. |
| `branch` | `github.ref_name` | The branch being deployed. |
| `dry-run` | `false` | `true` prints the findings instead of sending them. |
| `working-directory` | `.` | The directory to scan, relative to the repository root. |

Without a token and without `dry-run`, the step fails with a message that names the secret to add.

## Permissions and requirements

- **Permissions:** `contents: read` is all the job needs (to check out the code). The Action makes
  no GitHub API calls.
- **Node.js:** the scanner runs with `npx`, so the runner needs Node.js 20 or later and access to
  the npm registry. GitHub-hosted runners have both; on a self-hosted runner, install Node first
  (for example with `actions/setup-node`).
- **What runs:** a pinned, exact version of the MIT-licensed npm package
  [`deployhealth-scan`](https://www.npmjs.com/package/deployhealth-scan). The token reaches it
  through the `DEPLOYHEALTH_TOKEN` environment variable, never on the command line, and is never
  echoed.

## What it reads

JS/TS, Python, Go, Ruby, PHP and Java/Kotlin source, env and declaration files (`.env`,
`.env.example`, …), and framework config such as Spring's `application*.yml`. Tests, fixtures,
vendored code and build output are skipped. The stack guides at
[deployhealth.dev/docs](https://deployhealth.dev/docs) list the exact read forms per framework.

## License

MIT. deployhealth is an independent project; this Action is not affiliated with or endorsed by
GitHub.
