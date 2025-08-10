# FleetOps Dashboard

## Local Instalation

### Prerequisites
**Must have:**
- Node 22.x+ LTS
- pnpm 9+ via Corepack
- Git

**Nice to have:**
- VS Code with TypeScript and ESLint extensions.
- For optional e2e Playwright browsers tests, run: pnpm --filter @fleetops/e2e i && npx playwright install
- Or you can always run later: npx playwright install
- GitHub-CLI (install from https://cli.github.com/ or using 'winget install -e --id GitHub.cli')

### **Setup on Windows (using PowerShell, run as administartor)**
1. install required elements by:
```powershell
nvm install 22.18.0
nvm use 22.18.0
corepack enable
corepack prepare pnpm@9 --activate
```

**NOTE:** On Node 25+, install Corepack manually by: npm i -g corepack

2. Optional, update Git and corepack versions:
- git update-git-for-windows
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

## AWS Services (production usage)
- Frontend: S3 static hosting behind CloudFront.
- Auth: Amazon Cognito user pool for operators.
- API - control plane:
    Amazon API Gateway HTTP API for REST (cancel, snapshots).
    API Gateway WebSocket or AppSync for live updates to the UI.
- Compute:
    AWS Lambda for control APIs, or ECS Fargate if long-lived simulation/services.
    AWS Step Functions for mission workflows in real robots scenario.
- Data:
    DynamoDB tables Robots, Missions, MissionEvents for scale and streams.
- Messaging and events:
    EventBridge bus for mission-created, state-changed, cancel-requested.
- Device connectivity for real robots:
    AWS IoT Core (MQTT) for robot telemetry and command channel.
- Observability: CloudWatch logs and metrics, optional OpenSearch for analytics.
- Security: IAM least privilege, WAF on CloudFront, Parameter Store/Secrets Manager for config.
