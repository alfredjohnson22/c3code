# c3code project handoff

This file is the current operating handoff for the next person or AI agent.
Read it before changing the VS Code checkout, restarting services, or
reinstalling dependencies.

## Product decision

- c3code is a custom-branded, private browser IDE built on the VS Code
  workbench. Do not replace the workbench with an unrelated editor.
- Use password authentication and bind to `127.0.0.1` by default. The owner
  chose local-only access; use an SSH tunnel for a remote host.
- No c3code release feed or support URL has been supplied. Do not invent or
  publish one.
- Keep upstream VS Code/code-server attribution and names where they describe
  the actual source or compatibility interfaces.

## Current checkout

- Project directory: `/srv/c3code`.
- The c3code GitHub repository is `https://github.com/popperton22/c3code.git`.
  The owner approved public publishing; the source has been pushed to `main`.
  The latest published commit at handoff time is `4507996`. Check the remote
  before any further push; do not force-push or rewrite history.
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
- The current build host has 15 GiB RAM and about 143 GiB free disk.
- The c3code TypeScript output and VS Code browser/server bundle have been
  built. The assembled release is `/srv/c3code/release`.
- c3code is running from the release, bound only to `127.0.0.1:8080` with
  password authentication. The password is stored privately in
  `/home/ec2-user/.config/c3code/server-password` (mode 600); logs are in
  `/home/ec2-user/.local/state/c3code/server.log` (mode 600).
- The separate `/home/ec2-user/.vscode-server` processes belong to the active
  VS Code remote coding session; do not stop or modify them.

## Build blocker and safe recovery

An earlier 4 GB host could not safely complete the VS Code dependency install.
The project was moved to the current larger host; on this host, the required
builds completed successfully.

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
and restores the checked-in `product.json` afterward. Keep the VS Code build
on Gulp 4 (`^4.0.0`); the attempted Gulp 5 stream migration produced malformed
native modules in the packaged output and was reverted.

If the build fails, capture the **first** error and the last 100 lines of the
same build log before retrying. Do not suppress errors or continue after a
failed prerequisite.

## Starting and checking the IDE

The currently running service was assembled with `KEEP_MODULES=1 npm run
release`. This keeps the native modules from the validated Linux build; do not
run `npm install` in the release directory, as it replaced native addons with
malformed binaries on this host. To start it again:

```bash
cd /srv/c3code/release
PASSWORD="$(cat /home/ec2-user/.config/c3code/server-password)" \
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
- `README.md` and `docs/README.md` contain build, localhost launch, and SSH
  tunnel instructions.

The root `package.json` repository points to the user-provided GitHub project;
its lockfile package name and executable entry must continue to match it.

## Verification record

- `npm run build` for c3code succeeded, including after package identity and
  documentation updates.
- Focused path, CLI, and package-identity tests passed: 149 tests across
  `util.test.ts`, `cli.test.ts`, and `constants.test.ts`. Jest warned about
  open handles after the passing results; the test process was stopped rather
  than left competing for host resources.
- On the 15 GiB host, `npm run build`,
  `VSCODE_QUALITY=stable npm run gulp compile-copilot-extension-full-build`,
  `VSCODE_QUALITY=stable npm run gulp core-ci`, and
  `BUILD_SOURCEVERSION=f242824c53e6f94e8981ac78d1bc276190fb6852 VSCODE_QUALITY=stable npm run gulp
  vscode-reh-web-linux-x64-min-ci` completed successfully. The Linux server
  package was rebuilt with Gulp 4 and its native addons validated.
- `KEEP_MODULES=1 npm run release` assembled the runnable release. The
  packaged `spdlog`, SQLite, watcher, and node-pty addons loaded successfully
  under Node 24, and every shipped `.node` file passed ELF validation.
- Runtime check passed: unauthenticated `/` returned 302 to `/login`, `/login`
  returned 200, and password-authenticated `/` returned 200. The process
  remains bound to loopback; access remotely through an SSH tunnel.
- The root project audit was clean; the VS Code core dependency tree still has
  upstream high-severity advisories without an available fix. Do not describe
  every dependency tree as clear.
