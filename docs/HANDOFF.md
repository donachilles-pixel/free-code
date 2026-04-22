# Focus Code Handoff Log

Last updated: 2026-04-22 08:12:02 CST
Workspace: `/Users/jetwang/free-code`
Remote: `https://github.com/donachilles-pixel/free-code`
Branch: `main`
Git author: `gpt-5.4 <jetwang2008@gmail.com>`

## Current Git State

- Working tree was clean before this handoff file was created.
- At log time, `main` was ahead of `origin/main` by 2 commits:
  - `7635447 docs: add skill marketplace design spec`
  - `6ded0d5 docs: add skill marketplace implementation plan`
- `origin/main` was at:
  - `ad7942d fix: suppress Kimi auth conflict notices`
- If this handoff file is committed locally, `main` will be ahead of `origin/main` by 3 commits until pushed.

## Completed Work

### Kimi for Coding Provider

Added Kimi for Coding support through the Claude Code-compatible Anthropic Messages endpoint:

- Default base URL: `https://api.kimi.com/coding/`
- Default model: `kimi-for-coding`
- Context window: `262144`
- Max output tokens: `32768`

Important constraints:

- Do not use `https://api.kimi.com/coding/v1` for the Anthropic-compatible path.
- Do not use `https://api.moonshot.ai/v1` for this mode.
- Kimi keys are expected to be `sk-kimi-...`; do not store or echo user secrets in logs.

Key files:

- `src/utils/model/kimiForCoding.ts`
- `src/utils/model/providers.ts`
- `src/services/api/client.ts`
- `src/utils/auth.ts`
- `src/utils/status.tsx`
- `src/utils/toolSearch.ts`

Runtime examples:

```bash
export CLAUDE_CODE_USE_KIMI_FOR_CODING=1
export KIMI_API_KEY="sk-kimi-..."
focus
```

Official-compatible env also works:

```bash
export ANTHROPIC_BASE_URL=https://api.kimi.com/coding/
export ANTHROPIC_AUTH_TOKEN="sk-kimi-..."
focus
```

### Kimi Auth Conflict Warning

Fixed false startup warning:

```text
Auth conflict: Both a token (claude.ai) and an API key (KIMI_API_KEY) are set.
```

Kimi provider now suppresses Claude/Anthropic-specific auth conflict notices. Logout is not required just because a Claude.ai token exists.

Changed file:

- `src/utils/statusNoticeDefinitions.tsx`

Pushed commit:

- `ad7942d fix: suppress Kimi auth conflict notices`

### Rebrand

Product name changed from Free Code/free code to Focus Code/focus-code in user-facing areas.

Relevant files include:

- `README.md`
- `install.sh`
- `src/main.tsx`
- `src/components/LogoV2/*`
- `src/utils/theme.ts`

Commit:

- `ca984c2 chore: rebrand product to Focus Code`

### CLI Aliases

Supported launch forms:

```bash
focus-code
focus
focus code
```

Local symlink intent:

- `~/.local/bin/focus-code -> /Users/jetwang/free-code/cli`
- `~/.local/bin/focus -> /Users/jetwang/free-code/cli`

Commits:

- `a7b923c chore: add focus-code bin entry`
- `fe4e584 chore: add focus command aliases`

### Zodiac Mascot

Added configurable startup mascot using zodiac icons.

Config file:

- `~/.claude/settings.json`

Example:

```json
{
  "mascot": "dragon"
}
```

Supported values:

- `default`
- `rat`
- `ox`
- `tiger`
- `rabbit`
- `dragon`
- `snake`
- `horse`
- `goat`
- `monkey`
- `rooster`
- `dog`
- `pig`

Key files:

- `src/utils/mascot.ts`
- `src/components/LogoV2/Mascot.tsx`
- `src/components/Settings/Config.tsx`
- `src/utils/settings/types.ts`

Commit:

- `4cdda5e feat: add configurable zodiac mascots`

### Feishu Phone Gateway

Implemented Focus Code gateway so Feishu mobile can remote-control development.

Current default mode uses the official Feishu Node SDK long connection:

- No public callback URL is required.
- No ngrok/cloudflared tunnel is required.
- Incoming Feishu text is submitted as the next prompt.
- Focus Code output is mirrored to Feishu.
- Tool permission prompts are relayed to Feishu with short approval codes.
- Feishu replies like `yes abcde` or `no abcde` approve/deny tool requests.
- `/interrupt` from Feishu cancels active work.

Long-connection setup:

```bash
export FOCUS_CODE_GATEWAY=feishu
export FOCUS_CODE_FEISHU_APP_ID="cli_..."
export FOCUS_CODE_FEISHU_APP_SECRET="..."
export FOCUS_CODE_FEISHU_CHAT_ID="oc_..." # optional; learned from first inbound message if omitted
focus --gateway feishu
```

Feishu app setup notes:

- Enable bot capability.
- Subscribe to `im.message.receive_v1`.
- Set event subscription method to long connection / `使用长连接接收事件`.
- `verificationToken` is not used in SDK long-connection mode.
- `FOCUS_CODE_FEISHU_VERIFICATION_TOKEN` is only for legacy callback mode.
- Event encryption is not supported by the callback gateway path.

Legacy callback mode remains available:

```bash
export FOCUS_CODE_GATEWAY=feishu
export FOCUS_CODE_GATEWAY_EVENT_MODE=callback
export FOCUS_CODE_FEISHU_APP_ID="cli_..."
export FOCUS_CODE_FEISHU_APP_SECRET="..."
export FOCUS_CODE_FEISHU_VERIFICATION_TOKEN="..."
export FOCUS_CODE_GATEWAY_PUBLIC_URL="https://your-tunnel.example/feishu/events"
focus --gateway feishu --gateway-mode callback --gateway-host 127.0.0.1 --gateway-port 8787
```

Key files:

- `src/gateway/config.ts`
- `src/gateway/feishuGateway.ts`
- `src/gateway/feishuClient.ts`
- `src/gateway/useFocusGateway.ts`
- `src/hooks/toolPermission/handlers/interactiveHandler.ts`
- `src/screens/REPL.tsx`
- `src/main.tsx`

Commits:

- `98bcfac feat: add Feishu phone gateway`
- `efe0e73 feat: use Feishu SDK long connection gateway`

### Skill Marketplace Docs

Two local documentation commits exist after the last pushed commit:

- `7635447 docs: add skill marketplace design spec`
- `6ded0d5 docs: add skill marketplace implementation plan`

Files:

- `docs/superpowers/specs/2026-04-22-skill-marketplace-design.md`
- `docs/superpowers/plans/2026-04-22-skill-marketplace.md`

Status:

- Design/spec and implementation plan only.
- No marketplace implementation code has been added yet.
- Local `main` is ahead of `origin/main` because these docs were not pushed at log time.

## Verification Already Run

Recent successful checks:

```bash
bun run build
focus --version
focus code --version
git diff --check
```

Observed version output:

```text
2.1.87 (Claude Code)
```

The direct raw TSX import test for status notices was not reliable because source snapshot imports failed on `isReplBridgeActive`; rely on `bun run build` instead.

## Startup Cheat Sheet

Kimi mode:

```bash
export CLAUDE_CODE_USE_KIMI_FOR_CODING=1
export KIMI_API_KEY="sk-kimi-..."
focus
```

Feishu gateway:

```bash
export FOCUS_CODE_GATEWAY=feishu
export FOCUS_CODE_FEISHU_APP_ID="cli_..."
export FOCUS_CODE_FEISHU_APP_SECRET="..."
focus --gateway feishu
```

Build:

```bash
bun install
bun run build
```

Push local commits when ready:

```bash
git push origin main
```

## Next Recommended Steps

1. Decide whether to push local docs commits and this handoff log.
2. If continuing Feishu work, perform a real mobile smoke test:
   - Send a prompt from Feishu.
   - Trigger a tool permission prompt.
   - Reply with `yes <code>` and confirm the tool continues.
   - Test `/interrupt`.
3. If continuing Kimi work, smoke test with a valid `sk-kimi-...` key:
   ```bash
   CLAUDE_CODE_USE_KIMI_FOR_CODING=1 KIMI_API_KEY="sk-kimi-..." focus -p "只输出 OK"
   ```
4. If continuing marketplace work, start from:
   - `docs/superpowers/specs/2026-04-22-skill-marketplace-design.md`
   - `docs/superpowers/plans/2026-04-22-skill-marketplace.md`
