# c3code

A private, browser-based coding workspace using the VS Code workbench under
c3code branding.

## Build

Use Node.js 24.x, npm, Git, Bash, `jq`, `quilt`, a C/C++ compiler, Python 3,
and the native development headers required by VS Code dependencies. A build
host with at least 16 GB RAM and 50 GB free disk is recommended.

```bash
git clone --recurse-submodules https://github.com/popperton22/c3code.git
cd c3code
quilt push -a
npm ci
(cd lib/vscode && npm ci)
npm run build
VERSION=0.0.0 npm run build:vscode
test -f lib/vscode/out/server-main.js
```

The VS Code submodule is pinned to 1.141.0. Apply the project's patch series
before installing dependencies. See [docs/README.md](docs/README.md) for
requirements and safe localhost usage, and [C3CODE_AI_HANDOFF.md](C3CODE_AI_HANDOFF.md)
for the current build/runtime state and continuation steps.

## Run locally

After a successful build, start with password authentication on loopback:

```bash
read -rsp "c3code password: " PASSWORD
printf '\n'
export PASSWORD
node out/node/entry.js --auth password --bind-addr 127.0.0.1:8080
```

Open <http://127.0.0.1:8080>. Use an SSH tunnel for remote access; do not bind
to a public interface without configuring HTTPS and an explicit access policy.
