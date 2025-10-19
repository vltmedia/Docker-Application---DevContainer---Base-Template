// scripts/utils.js
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");
const os = require("os");

function expandHome(p) {
  if (!p) return p;
  if (p.startsWith("~/")) return path.join(os.homedir(), p.slice(2));
  return p;
}

function loadYaml(filePath) {
  return yaml.load(fs.readFileSync(filePath, "utf8")) || {};
}

function loadConfig() {
  const basePath = path.resolve(process.cwd(), "config.yaml");
  if (!fs.existsSync(basePath)) {
    console.error("Missing config.yaml at repo root.");
    process.exit(1);
  }
  const base = loadYaml(basePath);

  let local = {};
  const localPath = path.resolve(process.cwd(), "config.local.yaml");
  if (fs.existsSync(localPath)) {
    local = loadYaml(localPath);
  }

  // shallow merge (local overrides base)
  const cfg = { ...base, ...local };

  // Defaults + normalization
  cfg.appName ||= "app";
  cfg.imageOrg ||= "";
  cfg.imageName ||= cfg.appName;
  cfg.version = process.env.VERSION || cfg.version || "latest";
  cfg.port = Number(process.env.PORT || cfg.port || 3000);
  cfg.restartPolicy ||= "unless-stopped";
  cfg.gpus = (process.env.GPUS ?? cfg.gpus) || null;

  cfg.dockerfileTargets ||= {};
  cfg.env ||= {};
  cfg.buildArgs ||= [];
  cfg.runArgs ||= [];
  cfg.volumes = (cfg.volumes || []).map(v => {
    const [left, right] = String(v).split(":");
    return `${expandHome(left)}:${right}`;
  });

  cfg.healthcheck ||= null;
  cfg.tagLatestOnPublish = cfg.tagLatestOnPublish !== false;

  // Allow a few ENV overrides for convenience
  if (process.env.APP_NAME) cfg.appName = process.env.APP_NAME;
  if (process.env.IMAGE_NAME) cfg.imageName = process.env.IMAGE_NAME;
  if (process.env.IMAGE_ORG) cfg.imageOrg = process.env.IMAGE_ORG;

  return cfg;
}

function imageTag(cfg) {
  const repo = [cfg.imageOrg && cfg.imageOrg.trim(), cfg.imageName && cfg.imageName.trim()]
    .filter(Boolean)
    .join("/");
  return `${repo}:${cfg.version}`;
}

function imageTagLatest(cfg) {
  const repo = [cfg.imageOrg && cfg.imageOrg.trim(), cfg.imageName && cfg.imageName.trim()]
    .filter(Boolean)
    .join("/");
  return `${repo}:latest`;
}

function sh(cmd, args, opts = {}) {
  const res = spawnSync(cmd, args, { stdio: "inherit", ...opts });
  if (res.error) {
    console.error(`Failed to run: ${cmd} ${args.join(" ")}`);
    console.error(res.error);
    process.exit(1);
  }
  if (typeof res.status === "number" && res.status !== 0) {
    process.exit(res.status);
  }
  return res;
}

module.exports = { loadConfig, imageTag, imageTagLatest, sh };
