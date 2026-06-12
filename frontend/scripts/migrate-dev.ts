import { execSync } from "node:child_process";
import path from "node:path";

const LOCAL_DATABASE_URL = "postgresql://inkgrader:inkgrader@localhost:5432/inkgrader";

const frontendDir = path.resolve(__dirname, "..");
const repoRoot = path.resolve(frontendDir, "..");
const composeFile = path.join(repoRoot, "docker-compose.yml");

function run(cmd: string, cwd: string, env: NodeJS.ProcessEnv = process.env) {
  console.log(`$ ${cmd}`);
  execSync(cmd, { stdio: "inherit", cwd, env });
}

run("npx drizzle-kit push", frontendDir, {
  ...process.env,
  DATABASE_URL: LOCAL_DATABASE_URL,
});

run(`docker compose -f "${composeFile}" restart backend`, repoRoot);

console.log("Pushed auth schema to local Postgres and restarted backend (recreates any tables drizzle-kit dropped).");
