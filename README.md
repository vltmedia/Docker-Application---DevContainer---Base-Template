# 🧠 Node.js App - Docker Development Template

This project provides a **config-driven Docker pipeline** powered by Node scripts.  
Instead of hardcoding container names, ports, or image tags in your `package.json`,  
everything is defined in a single `config.yaml` — making it easy to version, override, and automate builds, runs, and publishes.

---

## ⚙️ Overview
This Node.js + YAML approach gives you full control and flexibility over your Docker workflows. The end goal is to put your app in a container easily, consistently, and reproducibly, this way it can be deployed by itself or as part of a Docker Compose or Kubernetes setup later. 

This also can be used for any codebase, not just Node.js apps since we are just using `npm Scripts` to allow for running scripts easily.

This repo replaces direct `docker` and `docker compose` calls with simple `npm run` commands that read a shared `config.yaml`.

- **Single source of truth**: All Docker info lives in one YAML file.  
- **Environment-safe**: No need for `.env` or shell variables — the YAML defines everything.  
- **Script-driven**: Each Docker action (`build`, `run`, `publish`, etc.) is handled by a Node script.  
- **Local overrides**: Optionally use a `config.local.yaml` for per-machine customization (e.g., ports, cache paths).

---

# Why Not Use Docker Compose?
While Docker Compose is powerful, it has limitations:
- **Environment variable quirks**: Substitutions can be inconsistent across platforms.
- **Limited logic**: Complex build/run logic is hard to express.  
- **Less portable**: Not all environments support Compose natively.
- **Single App Focus**: This setup is ideal for single-container apps where you want tight control over build/run parameters without the overhead of Compose.


## 📁 Directory Layout

```
.
├── config.yaml
├── config.local.yaml          # (optional, overrides config.yaml)
├── package.json
└── scripts/
    ├── utils.js               # shared functions
    ├── build.js               # builds Docker image
    ├── run.js                 # runs Docker container
    ├── stop-remove.js         # stops and removes container
    ├── logs.js                # tails container logs
    ├── ps.js                  # shows running container status
    ├── publish.js             # builds + pushes image to registry
    └── tag.js                 # creates new tags (local retagging)
```

---

## 🧩 config.yaml Reference

Example:

```yaml
appName: nodejs-template        # container name
imageOrg: your-dockerhub-username  # e.g. "mydockerhubuser"
imageName: nodejs-template
version: latest
port: 5000
restartPolicy: unless-stopped
gpus: all

dockerfileTargets:
  dev: dev
  prod: prod

volumes:
  - "~/.cache/huggingface:/root/.cache/huggingface"
  - "~/.cache/modelscope:/root/.cache/modelscope"
  - "~/.cache/torch:/root/.cache/torch"
  - "./:/data"

env:
  # Optional environment variables passed to container
  # API_KEY: abc123
  # MODE: development

buildArgs: []                   # Optional args for `docker build`
runArgs: []                     # Optional args for `docker run`

healthcheck:
  test: ["CMD", "curl", "-fsS", "http://localhost:5000/health"]
  interval: "15s"
  timeout: "5s"
  retries: 5
  startPeriod: "30s"

tagLatestOnPublish: true
```

> 🧩 **Optional:** `config.local.yaml` (gitignored) can override values for your local dev environment, e.g.:
> ```yaml
> port: 8080
> gpus: ""
> volumes:
>   - "/mnt/data/huggingface:/root/.cache/huggingface"
> ```

---

## 📦 Install Dependencies

```bash
npm install
```

This installs the YAML parser (`js-yaml`) used by the scripts.

---

## 🚀 Usage

### 🧱 Build

| Command | Description |
|----------|-------------|
| `npm run build-dev` | Builds the Docker image using the `dev` target from your Dockerfile |
| `npm run build-prod` | Builds the image using the `prod` target |
| `npm run docker:tag -- <tag>` | Adds a new local image tag (does not push) |

> All build parameters (name, version, org, target, etc.) come from `config.yaml`.

---

### ▶️ Run / Stop

| Command | Description |
|----------|-------------|
| `npm run start` | Builds (dev) + runs container |
| `npm run start-prod` | Builds (prod) + runs container |
| `npm run stop-remove` | Stops & removes the running container |
| `npm run ps` | Lists all containers matching the configured `appName` |
| `npm run logs` | Follows logs of the running container |

Each `run` call:
- Mounts all volumes from `config.yaml`
- Maps the configured port (e.g. `5000:5000`)
- Passes environment variables defined under `env:`
- Automatically uses GPU settings if defined (`gpus: all`)
- Respects your restart policy

---

### ☁️ Publish

| Command | Description |
|----------|-------------|
| `npm run publish` | Builds a **prod image**, pushes it to registry (`imageOrg/imageName:version`) and optionally `:latest` |

**Examples:**
```bash
npm run publish
# Uses version from config.yaml

VERSION=1.2.3 npm run publish
# Overrides version on the fly

IMAGE_ORG=myorg npm run publish
# Pushes to another org/repo
```

---

## ⚙️ Environment Overrides

While `config.yaml` is the main config, some fields can be overridden temporarily via environment variables:

| Env Var | Overrides |
|----------|------------|
| `APP_NAME` | `appName` |
| `IMAGE_NAME` | `imageName` |
| `IMAGE_ORG` | `imageOrg` |
| `VERSION` | `version` |
| `PORT` | `port` |
| `GPUS` | `gpus` |

Example:
```bash
PORT=8080 VERSION=2.0.0 npm run start-prod
```

---

## 🔧 Customization

### Custom build/run arguments

If your Dockerfile requires build args:
```yaml
buildArgs:
  - "--build-arg"
  - "MODE=dev"
```

If you need additional runtime flags:
```yaml
runArgs:
  - "--network"
  - "host"
```

These are injected directly into the Docker CLI commands.

---

### Add your own script

All scripts are plain Node executables that import `loadConfig()` from `scripts/utils.js`.  
To add a new operation, e.g. `restart.js`:

```js
// scripts/restart.js
const { loadConfig, sh } = require("./utils");
const cfg = loadConfig();
sh("docker", ["restart", cfg.appName]);
```

Then add to `package.json`:
```json
"restart": "node scripts/restart.js"
```

---

## 🧠 Behind the Scenes

### The logic pipeline
1. Each `npm run` command calls a Node script.
2. The script:
   - Reads `config.yaml` (and optional `config.local.yaml`)
   - Expands `~/` paths for volumes
   - Builds Docker CLI commands dynamically
   - Executes them via `child_process.spawnSync`

This avoids relying on environment substitution or Compose quirks.  
Everything is explicit, portable, and scriptable.

---

## 🧰 Common Tasks

| Task | Command |
|------|----------|
| Build dev image | `npm run build-dev` |
| Build prod image | `npm run build-prod` |
| Run container (dev) | `npm run start` |
| Run container (prod) | `npm run start-prod` |
| Stop container | `npm run stop-remove` |
| Check container status | `npm run ps` |
| Tail logs | `npm run logs` |
| Publish image to registry | `npm run publish` |
| Tag new image version | `npm run docker:tag -- stable` |

---

## 🧩 Why This System

| Feature | Benefit |
|----------|----------|
| **YAML-based config** | Readable, structured, version-controlled |
| **Local overrides** | No accidental config commits |
| **Full Node control** | Dynamic logic, no env substitution issues |
| **Cross-platform** | Works on Windows, macOS, and Linux |
| **Composable** | Add your own scripts easily |

This setup is ideal for environments where you:
- Need to manage multiple images or containers
- Want consistent naming/versioning
- Don’t want to rely on `.env` substitution behavior
- Prefer having all Docker logic in Node (not shell)

---

## 🧾 Example Workflow

```bash
# 1. Update your config
nano config.yaml

# 2. Build a new dev image
npm run build-dev

# 3. Start it up
npm run start

# 4. Check status
npm run ps

# 5. View logs
npm run logs

# 6. Publish your image
VERSION=1.0.0 npm run publish
```

---

## 🛠 Requirements

- **Docker 20+**
- **Node.js 18+**
- **npm** (or yarn / pnpm if adapted)
- `js-yaml` dependency installed via `npm install`

---

## 💬 Tips

- Use `config.local.yaml` for private local changes (ports, GPU flags, volume paths).  
- Use `VERSION` env var when publishing to tag unique versions.  
- You can chain scripts (e.g. `npm run stop-remove && npm run start-prod`).  
- Works great for **GPU-based AI services**, since GPU flags and cache mounts can differ per machine.

---

## 🧱 License

MIT © 2025 — VLT Media.  
Feel free to modify and adapt this workflow for your own internal automation setups.
