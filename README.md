# FleetOps Dashboard

### Prerequisites
**Must have:**
- Node 22.x+ LTS
- pnpm 9+ via Corepack
- Git

**Nice to have:**
- VS Code with TypeScript and ESLint extensions.
- For optional e2e Playwright browsers tests, run: pnpm --filter @fleetops/e2e i && npx playwright install
- Or you can always run later: npx playwright install

**Setup on Windows (using PowerShell, run as administartor)**
1. install required elements by:
```powershell
nvm install 22.18.0
nvm use 22.18.0
corepack enable
corepack prepare pnpm@9 --activate
```
**NOTE:** On Node 25+, install Corepack manually by: npm i -g corepack

2. Optional, update Git and corepack versions:
- `git update-git-for-windows`
- corepack use pnpm@10.14.0

3. verify versions by:
```powershell
node -v
pnpm -v
corepack --version
git --version
```

4. Run ro verify:
- `pnpm i`
- `pnpm -w typecheck`
- `pnpm -w lint`
- `pnpm -w test`
- `pnpm --filter @fleetops/web build`

