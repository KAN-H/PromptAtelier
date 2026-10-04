# PromptAtelier

[![Node.js CI](https://github.com/KAN-H/PromptAtelier/actions/workflows/nodejs-tests.yml/badge.svg)](https://github.com/KAN-H/PromptAtelier/actions/workflows/nodejs-tests.yml)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D18-brightgreen)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Latest release](https://img.shields.io/github/v/release/KAN-H/PromptAtelier)](https://github.com/KAN-H/PromptAtelier/releases)

**PromptAtelier is an open-source design prompt workbench for turning creative briefs into structured prompts.** It provides a browser-based interface, configurable design parameters, prompt history and favorites, and optional AI-assisted generation.

PromptAtelier supports Chinese and English interfaces. Prompts can be generated in English from design requirements, then adapted for image-generation services such as Midjourney, DALL·E, Stable Diffusion, or Flux.

## Features

- Design prompt workflows with selectable categories, presets, styles, composition, colors, materials, and other parameters.
- Optional AI-assisted prompt improvement through OpenAI-compatible providers, including OpenAI, DeepSeek, Groq, SiliconFlow, OpenRouter, and compatible local services such as Ollama or LM Studio.
- Optional local model support for GGUF and ONNX models. Model dependencies are optional; the basic web application can run without them.
- Prompt history and favorites, stored in local JSON files.
- A Skills view with the built-in `nippon-colors` reference for Japanese traditional colors. Matching enabled Skills can provide additional context during prompt generation.
- Dynamic design workflows, safety checks, and prompt compression controls.
- JSON Schemas and examples for supported image and video prompt data: [`schemas/`](schemas/) and [`examples/`](examples/).

## Requirements

- Node.js 18 or later
- npm 8 or later
- Internet access for CDN-hosted frontend libraries and cloud AI providers; local AI providers can run on your own machine.

## Install and run

```bash
git clone https://github.com/KAN-H/PromptAtelier.git
cd PromptAtelier
npm install
npm start
```

Open <http://localhost:3000>. To use a different port, set `PORT` before starting the server:

```bash
PORT=3100 npm start
```

On Windows PowerShell:

```powershell
$env:PORT = 3100
npm start
```

For development with automatic server restarts, run `npm run dev`. To run the tests, use `npm test`.

On Windows, `npm run build` creates a standalone executable under `dist/`. The packaged app stores history and favorites under `~/.promptatelier/data` (or the directory set in `PROMPTATELIER_DATA_DIR`).

## Use the application

1. Open **Design** and select a design category or preset.
2. Describe the subject and adjust the available style and output parameters.
3. To use an AI provider, open settings, choose a provider, and enter its API endpoint, model, and key as applicable. Settings are stored in the browser. Local providers that do not require a key can be configured there as well.
4. Generate a prompt. Enable the built-in `nippon-colors` Skill in **Skills** to make its reference information available when relevant.
5. Review and reuse earlier results from **History** or **Favorites**.

Cloud-provider API usage may incur charges under that provider's terms. Do not share or commit API keys.

## Local models

The application includes a model-management view. GGUF and ONNX runtime packages are declared as optional dependencies and may require platform-specific native support. Use the model view to inspect available model options and download or manage model files. Local model inference can require substantial memory and disk space; it is not required for the standard prompt-generation workflow.

## Configuration and deployment

The server listens on `PORT` (default `3000`) and serves both the browser application and API from the same process. For a private deployment, run `npm start` under your chosen process manager and optionally place a reverse proxy in front of it. Configure the proxy to forward requests to the application port; the repository does not include a process-manager or reverse-proxy configuration.

The `/health` endpoint returns basic server status:

```bash
curl http://localhost:3000/health
```

History and favorites are stored in `data/history.json` and `data/favorites.json`, which are created when the application starts. These files are local runtime data and are excluded from version control. Back them up separately if you need to preserve user records.

## Troubleshooting

- **The server does not start:** check `node --version`, run `npm install`, and verify that the selected port is available. Set another `PORT` if needed.
- **The page or its styles do not load:** check the server URL and browser network access. Several frontend libraries are loaded from public CDNs.
- **AI requests fail:** verify the selected provider, endpoint, model name, and credentials in the application settings, and confirm that the provider is reachable.
- **A local model cannot load:** confirm that optional runtime dependencies are compatible with your OS and Node.js version, that the model download completed, and that enough memory is available. The main application can still run without local model support.
- **History or favorites are missing:** check that the server process can write to `data/` and that the local runtime JSON files are present.

## Project structure

| Path | Purpose |
| --- | --- |
| `backend/` | Express server, API routes, and services |
| `frontend/` | Browser UI, localization, and static assets |
| `data/` | Public presets, categories, templates, and safety configuration; runtime history/favorites are local |
| `skills/nippon-colors/` | Built-in Japanese traditional color reference |
| `schemas/`, `examples/` | Supported prompt data schemas and examples |
| `models/` | Local model storage location |

## Technology

- **Server:** Node.js and Express, with CORS and response compression.
- **Frontend:** HTML, CSS, and JavaScript, with Alpine.js, Tailwind CSS, DaisyUI, and Chart.js.
- **Validation and Skills metadata:** Ajv and js-yaml.
- **Optional local inference:** `node-llama-cpp` and `@huggingface/transformers`.
- **Tests:** Jest and Supertest.

Direct Node.js dependencies: [Express](https://www.npmjs.com/package/express), [CORS](https://www.npmjs.com/package/cors), [compression](https://www.npmjs.com/package/compression), [Ajv](https://www.npmjs.com/package/ajv), [js-yaml](https://www.npmjs.com/package/js-yaml), and [open](https://www.npmjs.com/package/open). Optional inference dependencies are [node-llama-cpp](https://www.npmjs.com/package/node-llama-cpp) and [@huggingface/transformers](https://www.npmjs.com/package/@huggingface/transformers).

## Version history

See [GitHub Releases](https://github.com/KAN-H/PromptAtelier/releases).

## License

PromptAtelier is released under the [MIT License](LICENSE).
