// scripts/run.js
const { loadConfig, imageTag, sh } = require("./utils");

const cfg = loadConfig();

const args = [
  "run",
  "--name", cfg.appName,
  "--restart", cfg.restartPolicy,
  "-d",
  "-p", `${cfg.port}:${cfg.port}`
];

// GPUs
if (cfg.gpus) {
  args.push("--gpus", cfg.gpus);
}

// Volumes
for (const v of cfg.volumes) {
  args.push("-v", v);
}

// Env
for (const [k, v] of Object.entries(cfg.env)) {
  // allow env passthrough if value is null/undefined
  if (v === null || typeof v === "undefined") args.push("-e", k);
  else args.push("-e", `${k}=${String(v)}`);
}

// Healthcheck (docker run --health-* works; if you prefer Dockerfile HC, skip this)
if (cfg.healthcheck && Array.isArray(cfg.healthcheck.test)) {
  const hc = cfg.healthcheck;
  args.push(
    `--health-cmd=${JSON.stringify(hc.test).replace(/"/g, '\\"')}`, // stringify the array command
  );
  if (hc.interval) args.push(`--health-interval=${hc.interval}`);
  if (hc.timeout) args.push(`--health-timeout=${hc.timeout}`);
  if (hc.retries != null) args.push(`--health-retries=${hc.retries}`);
  if (hc.startPeriod) args.push(`--health-start-period=${hc.startPeriod}`);
}

// Any extra run args
if (Array.isArray(cfg.runArgs) && cfg.runArgs.length) {
  args.push(...cfg.runArgs);
}

// Image
args.push(imageTag(cfg));

console.log("docker", args.join(" "));
sh("docker", args);
