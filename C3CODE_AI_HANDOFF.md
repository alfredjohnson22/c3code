# c3code project handoff

This file is the current operating handoff for the next person or AI agent.
Read it before changing the VS Code checkout, restarting services, or
reinstalling dependencies.

## Product decision

- c3code is a custom-branded, private browser IDE built on the VS Code
  workbench. Do not replace the workbench with an unrelated editor.
- Use password authentication and bind to `127.0.0.1` by default. The owner
  chose local-only access; use an SSH tunnel for a remote host.
- No c3code repository URL, issue tracker, release feed, or support URL has
  been supplied. Do not invent or publish one.
- Keep upstream VS Code/code-server attribution and names where they describe
  the actual source or compatibility interfaces.

## Current checkout

- Project directory: `/srv/c3code`.
- The c3code GitHub repository is `https://github.com/popperton22/c3code.git`.
  It was confirmed empty and public before the owner explicitly approved
  publishing this project there. The local root Git repository is initialized
  on `main` with that remote configured. The initial source commit is
  `bf93de4`; its push was blocked because this host has no GitHub credentials.
  Authenticate Git safely on the host, verify the remote is still empty, then
  push `main`. Do not force-push or rewrite remote history.
- The project root had no `.git` metadata when this source-provided copy was
  received. It now has local Git metadata; continue with normal root Git
  commands and do not replace this project with an upstream clone.
- The VS Code source exists in `lib/vscode`, is a Git checkout of tag
  `1.141.0` at commit
  `2a59476c9bfcb90b3ddc372c36762471b7dfad1c`, and has the c3code patch series
  applied as working-tree changes. Keep both the source changes and
  `lib/vscode/.git` metadata.
- Node.js `v24.21.0` is installed locally at
  `/home/ec2-user/.local/lib/node-v24.21.0-linux-x64`; add
  `/home/ec2-user/.local/bin` to `PATH`.
- The c3code TypeScript output exists under `out/`; the focused password hash
  unit tests passed in the previous work.
- The VS Code browser/server bundle is **not built**:
  `lib/vscode/out/server-main.js` and `lib/vscode-reh-web-linux-x64` are
  missing. The most recent request to `http://127.0.0.1:8080/` returned
  connection refused because no c3code server is running.
- Do not start `out/node/entry.js` until the missing VS Code output exists.
  Starting it early returns HTTP 500 and does not mean the IDE is available.
- c3code is intentionally stopped to protect the host. The separate
  `/home/ec2-user/.vscode-server` processes belong to the active VS Code remote
  coding session; do not stop or modify them.

## Build blocker and safe recovery

The current host has about 4 GB RAM and no swap. A VS Code dependency install
previously reached roughly 2.9 GB of use with only about 117 MB free. It was
stopped before the host or active editor was destabilized. The dependency
installation is incomplete; there are partial `node_modules` directories, but
no successful postinstall state or compiled VS Code output.

Do not retry the full dependency install/build on this host without an
explicitly approved memory plan. The recommended destination is a build host
with at least 16 GB RAM and 50 GB free disk space. This is a resource-safety
blocker, not evidence of a source-code compile failure.

### Continuing on a larger server

After the initial c3code commit has been pushed, clone it with the upstream
VS Code submodule on the new server:

```bash
git clone --recurse-submodules https://github.com/popperton22/c3code.git /srv/c3code
cd /srv/c3code
quilt push -a
npm ci
(cd lib/vscode && npm ci)
npm run build
VERSION=0.0.0 npm run build:vscode
test -f lib/vscode/out/server-main.js
```

The public project contains the c3code source and patch series; the VS Code
source itself remains an upstream submodule. On the existing source-provided
copy, preserve `lib/vscode/.git`, its pinned commit, and all applied patch
changes. If transferring installed user settings/extensions, copy their
`--user-data-dir` separately with private ownership and permissions. Do not
copy or reuse the temporary test password from earlier startup attempts.

### Build on the destination

Use Node.js 24.x and a Bash environment. Install Git, `jq`, a C/C++ toolchain,
Python 3, and native headers needed by npm modules (the previous install needed
Kerberos development headers). Then, from `/srv/c3code`:

```bash
export PATH="$HOME/.local/bin:$PATH"
npm ci
(cd lib/vscode && npm ci)
npm run build
VERSION=0.0.0 npm run build:vscode
test -f lib/vscode/out/server-main.js
```

The nested VS Code `npm ci` runs VS Code's postinstall to install build,
remote, and extension dependencies; allow it to complete. The c3code build
script computes a fallback build identifier when the c3code root has no Git
metadata. The VS Code build still needs the nested `lib/vscode/.git` checkout.
The build script updates VS Code product metadata for c3code during the build
and restores the checked-in `product.json` afterward.

If the build fails, capture the **first** error and the last 100 lines of the
same build log before retrying. Do not suppress errors or continue after a
failed prerequisite.

## Starting and checking the IDE

Only after the `test -f` check above succeeds, start from `/srv/c3code`:

```bash
read -rsp "Choose a c3code password: " PASSWORD
printf '\n'
export PASSWORD
node out/node/entry.js \
  --auth password \
  --bind-addr 127.0.0.1:8080 \
  --disable-telemetry \
  --disable-update-check
```

Open <http://127.0.0.1:8080> on that host. A remote client should use an SSH
tunnel (`ssh -N -L 8080:127.0.0.1:8080 user@your-server`) and then browse to
the same loopback URL on the client. Confirm the log says it is listening on
`127.0.0.1:8080` and authentication is enabled. Do not bind this service to
`0.0.0.0` or a public address as a shortcut.

## Project changes already made

- c3code package identity, CLI/runtime labels, login expectations, and version
  output; `codeServer` remains in version JSON as a compatibility field.
- New c3code config/data paths are preferred, while existing code-server paths
  remain usable if they are already present. Legacy environment-variable names
  remain supported.
- VS Code build metadata uses the c3code product name and does not link issue
  reports to the unrelated upstream code-server project.
- `ci/build/build-vscode.sh` has a deterministic source-version fallback for
  a c3code source copy without root Git metadata.
- `docs/README.md` contains build, localhost launch, and SSH tunnel instructions.

The root `package.json` deliberately has no guessed homepage/repository fields;
its lockfile package name and executable entry must continue to match it.

## Verification record

- `npm run build` for c3code completed successfully earlier in this setup.
- Focused password-hash tests passed.
- The initial VS Code build did **not** complete: its dependency setup was
  interrupted for memory safety, and no VS Code server output exists yet.
- The server has not been validated in a browser and must not be described as
  running until an authenticated HTTP/browser check succeeds.

When continuing, verify the lockfile/package identity, run the focused
c3code build and tests, complete the VS Code install/build on the larger host,
then perform the localhost-only launch and login check. Update this handoff
with actual outcomes; never turn an attempted command into a claimed success.
