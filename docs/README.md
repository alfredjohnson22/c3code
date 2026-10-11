# c3code

c3code is a private, browser-based coding workspace. It uses the VS Code
workbench as its editor while presenting the c3code application identity.

## Build requirements

- Node.js 24.x and npm
- Git, Bash, `jq`, `quilt`, a C/C++ compiler toolchain, Python 3, and the native
  development headers required by VS Code's npm dependencies
- The VS Code source at **1.141.0**, with this project's patch series applied
- A build host with at least 16 GB RAM and 50 GB free disk space recommended.
  The VS Code source build is resource-intensive; the original 4 GB host ran
  out of safe memory headroom during dependency installation.

On Windows, build inside WSL2/Ubuntu. Do not use PowerShell for the Bash build
scripts.

## Build from a complete source checkout

The c3code source is hosted at
<https://github.com/popperton22/c3code>. Do not substitute the VS Code
repository for the c3code project. The VS Code Git checkout is a separate
dependency under `lib/vscode`; this project is pinned to tag `1.141.0`.

On a complete c3code Git checkout with its submodule initialized:

```bash
git submodule update --init --recursive
quilt push -a
npm ci
(cd lib/vscode && npm ci)
npm run build
VERSION=0.0.0 npm run build:vscode
```

If working from this source-provided copy, note that the c3code root has no
`.git` metadata. The VS Code checkout and applied patches are already present
in `lib/vscode`; keep that directory's `.git` metadata and working-tree
changes. Do not run `git submodule update` from this copy. See
[`C3CODE_AI_HANDOFF.md`](../C3CODE_AI_HANDOFF.md) for its verified state,
recovery steps, and migration instructions.

Verify that `lib/vscode/out/server-main.js` exists before starting the server.
A missing file means the VS Code build did not complete; do not start c3code
and treat an HTTP 500 response as a successful launch.

## Run locally

Start with password authentication and bind only to loopback:

```bash
read -rsp "c3code password: " PASSWORD
printf '\n'
export PASSWORD
node out/node/entry.js --auth password --bind-addr 127.0.0.1:8080
```

Open <http://127.0.0.1:8080> on the server. To reach a private remote host from
your own machine, create an SSH tunnel from that machine:

```bash
ssh -N -L 8080:127.0.0.1:8080 user@your-server
```

Then open <http://127.0.0.1:8080> locally. Do not bind to a public interface
without a deliberate HTTPS and network-access design.

## Identity and compatibility

- The web app and CLI identify as c3code; the editor workbench remains based on
  VS Code.
- Legacy code-server paths and environment variables are retained where needed
  to avoid breaking existing installations.
- No c3code release feed or support URL has been supplied. Do not invent or
  publish one.
