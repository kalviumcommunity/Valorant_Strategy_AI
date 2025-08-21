# Valorant AI Strategy Assistant

A web application that takes match context (map, agents, team economy, and round situation) as input and uses AI to generate actionable, context‑aware strategy recommendations for Valorant players. The app demonstrates industry‑standard GenAI practices: prompt engineering variants (zero‑shot, one‑shot, multi‑shot, dynamic, chain‑of‑thought), structured JSON outputs, token usage logging, controllable decoding parameters, evaluation via a small test set and a judge prompt, and optional retrieval using embeddings + a vector index.

> **Scope & Status**
>
> - Strategy generation (text) from structured inputs
> - Prompting variants (zero/one/multi/dynamic/CoT)
> - Structured output (JSON schema) + stop sequences
> - Token usage logging (per request)
> - Decoding controls (temperature, top‑p; top‑k if provider supports it)
> - Minimal evaluation pipeline (≥5 scenarios + judge prompt)
> - Embeddings + vector index for similar‑strategy retrieval (FAISS or compatible)
> - Visual minimap overlay (positions/utility as shapes)
> - Voice callouts (TTS)

---

## Table of Contents
- [Motivation](#motivation)
- [What the App Does (Objective, not hype)](#what-the-app-does-objective-not-hype)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Local Setup](#local-setup)
- [Environment Variables](#environment-variables)
- [Run](#run)
- [Deployment](#deployment)
- [Data Model & Structured Output](#data-model--structured-output)
- [API Surface](#api-surface)
- [Prompt Engineering (with templates)](#prompt-engineering-with-templates)
- [Evaluation Dataset & Testing Framework](#evaluation-dataset--testing-framework)
- [Tokenization & Cost Controls](#tokenization--cost-controls)
- [Decoding Parameters (Temperature, Top‑p, Top‑k, Stop)](#decoding-parameters-temperature-top-p-top-k-stop)
- [Embeddings, Vector Index & Similarity](#embeddings-vector-index--similarity)
- [Security & Privacy](#security--privacy)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)

---

## Motivation
Players often need quick, situation-appropriate plans. Existing tools mostly provide static lineups or whiteboards. This app generates **dynamic strategies** driven by the current context a player supplies.

## What the App Does (Objective, not hype)
- Accepts structured match context (map, side, agents, round type/economy, optional notes) via a web UI.
- Produces **strategy recommendations** as structured JSON and human‑readable text.
- Supports multiple prompting styles and a **judge/eval pipeline** to compare outputs against expected patterns for at least five test cases.
- Optionally retrieves similar historical strategies using **embeddings** and a local **vector index** to inform the generation.

---

## Architecture
graph TD
    Frontend["Frontend (React/Tailwind)"] --> Backend["Backend API (Node/Express)"];
    Backend --> LLM["LLM Provider<br>(default: OpenAI GPT-4o mini; pluggable: Mistral/Llama via HF)"];
    Backend --> Embeddings["Embeddings<br>(OpenAI or Sentence-Transformers)"];
    Backend --> VectorIndex["Vector Index<br>(FAISS or Pinecone/Weaviate alternative)"];
    Backend --> EvalRunner["Eval Runner<br>(Node script + judge prompt)"];
Design goals:
- Keep the LLM provider **pluggable** (OpenAI by default; open‑source optional).
- Standardize on a **strict JSON schema** for strategies to make UI/visualization predictable.
- Log tokens and parameters for each call for transparency.

---

## Tech Stack
- **Frontend:** React, Tailwind CSS
- **Backend:** Node.js, Express
- **LLM (default):** OpenAI GPT‑4o mini (configurable)
- **Alt LLM (optional):** Hugging Face Inference for Mistral/Llama
- **Embeddings:** OpenAI `text-embedding-3-small` **or** `sentence-transformers` (e.g., `all-MiniLM-L6-v2`)
- **Vector Index:** FAISS (local) **or** Pinecone/Supabase/Weaviate
- **Testing/Eval:** Node + JSON test fixtures; judge prompt

---

## Local Setup
1. **Prerequisites**
   - Node.js ≥ 18
   - pnpm or npm
2. **Install**
   ```bash
   pnpm install
   # or
   npm install
   ```
3. **Copy environment**
   ```bash
   cp .env.example .env
   ```

---

## Environment Variables
```env
# Provider: OpenAI (default)
OPENAI_API_KEY=...
OPENAI_MODEL=gpt-4o-mini
OPENAI_EMBED_MODEL=text-embedding-3-small

# Optional: Hugging Face
HF_API_TOKEN=...
HF_MODEL_ID=mistralai/Mistral-7B-Instruct-v0.3

# Vector index
VECTOR_BACKEND=faiss            # faiss | pinecone | weaviate | supabase
VECTOR_DIR=./vector_store

# Server
PORT=3001
NODE_ENV=development
```

---

## Run
```bash
# Dev
pnpm dev
# Backend on :3001, frontend on :3000 (configure as needed)
```

---

## Deployment
- **Vercel** for frontend.
- **Backend** can be deployed to Vercel Serverless, Fly.io, or Railway. Ensure env vars are set and CORS is configured.

---

## Data Model & Structured Output
**Strategy JSON Schema (v1):**
```json
{
  "map": "Ascent",
  "side": "attack",
  "round_type": "full_buy",
  "agents": ["Jett", "Omen", "Sova", "Killjoy", "Sage"],
  "plan": {
    "setup": ["Killjoy holds A lobby for flank", "Sage watches B main"],
    "execute": ["Omen smokes A Heaven & Tree", "Jett dash after Sova drone mid"],
    "post_plant": ["Killjoy turret Tree", "Sage wall CT if needed"],
    "fallback": ["If mid control denied, regroup B with market smoke"]
  },
  "rationale": "Mid control pressures rotations; A split is favored vs double sentinel setups."
}
```
A **stop sequence** (e.g., `"### END STRATEGY ###"`) is used to terminate generation cleanly.

---

## API Surface
### `POST /api/strategy`
Generate a strategy from structured inputs.
- **Body**
  ```json
  {
    "map": "Ascent",
    "side": "attack",
    "agents": ["Jett", "Omen", "Sova", "Killjoy", "Sage"],
    "round_type": "full_buy",
    "economy": "balanced",
    "prompting_mode": "zero",
    "decoding": { "temperature": 0.7, "top_p": 0.9, "top_k": 40 },
    "use_retrieval": true
  }
  ```
- **Response** (200)
  ```json
  { "strategy": { /* see schema above */ }, "text": "...", "tokens": {"input": 523, "output": 187} }
  ```

### `POST /api/search`
Retrieve similar historical strategies via embeddings.

### `POST /api/eval/run`
Run the evaluation suite over the 5+ sample scenarios; returns per‑case judgments and an aggregate score.

---

## Prompt Engineering (with templates)
> The app exposes modes: **zero‑shot, one‑shot, multi‑shot, dynamic, chain‑of‑thought (CoT)**.

**System Prompt**
```
You are a professional Valorant coach. Generate realistic, safe, and concise strategies. Output valid JSON matching the schema, followed by a short readable summary. Do not invent non‑existent agent abilities. Stop at: ### END STRATEGY ###
```

**Zero‑shot (User Template)**
```
Map: {{map}} | Side: {{side}} | Round: {{round_type}} | Agents: {{agents}}
Provide a strategy that includes setup, execute, post_plant, fallback, and a brief rationale.
```

**One‑shot** (prepend one labeled example before the user input).

**Multi‑shot** (prepend 2–3 diverse examples covering different maps/sides).

**Dynamic Prompting**
```
Context:
- Map: {{map}}
- Side: {{side}}
- Round: {{round_type}}
- Economy: {{economy}}
- Detected enemy tendencies: {{tendencies|optional}}
Task: Using the context, adapt the strategy. Prefer defaults proven on this map unless context suggests otherwise.
```

**Chain‑of‑Thought (internal)**
Prompt the model to reason step‑by‑step *internally* and return only the final JSON + summary to the user. (Implementation tip: use a hidden rationale field or use a separate call; do not expose raw CoT to the UI.)

---

## Evaluation Dataset & Testing Framework
- **Dataset:** `eval/cases/*.json` (≥5 scenarios). Each contains inputs + an expected outline.
- **Judge Prompt:** compares model output to expectations on clarity, feasibility, alignment with inputs, and JSON validity.
- **Runner:** Node script executes all cases, logs pass/fail, token usage, and aggregate metrics.

**Example case**
```json
{
  "name": "Ascent_attack_fullbuy_default_mid_control",
  "input": {"map":"Ascent","side":"attack","agents":["Jett","Omen","Sova","Killjoy","Sage"],"round_type":"full_buy"},
  "expect": {"themes": ["mid control", "A split"], "forbidden": ["Sage entry fragging"]}
}
```

**Judge prompt (excerpt)**
```
Score 0–1 for each: (1) JSON schema validity, (2) alignment with inputs, (3) tactical plausibility for the map/side, (4) clarity/conciseness. Return total and brief reason.
```

---

## Tokenization & Cost Controls
- Log input/output tokens per call and persist in `logs/requests.jsonl`.
- Keep prompts compact; prefer few‑shot only when needed.
- Consider using a smaller model (e.g., GPT‑4o mini) by default; expose a “Pro” toggle for a larger model.

---

## Decoding Parameters (Temperature, Top‑p, Top‑k, Stop)
- **Temperature**: controls randomness (0.1 = deterministic; 0.9 = creative)
- **Top‑p**: nucleus sampling; lower = safer.
- **Top‑k**: keeps only k most probable tokens (if provider supports).
- **Stop sequences**: enforce clean termination (e.g., `### END STRATEGY ###`).
Parameters are user‑tunable in the UI and recorded with outputs for reproducibility.

---

## Embeddings, Vector Index & Similarity
- Build an index of historical strategies.
- **Embeddings**: OpenAI or Sentence‑Transformers.
- **Index**: FAISS (flat or IVF) stored under `VECTOR_DIR`.
- **Similarity metrics** implemented:
  - Cosine similarity
  - Euclidean (L2) distance
  - Dot product
The app can retrieve k‑nearest strategies to surface as references and/or feed as context.

---

## Security & Privacy
- Do not log API keys or raw provider responses in client‑visible logs.
- PII: none expected; treat any uploaded notes as sensitive and avoid persistence unless necessary.
- Rate‑limit API to prevent misuse.

---

## Roadmap
- Visual minimap overlay (SVG/Canvas) for positions and utility zones
- TTS for concise voice callouts
- Expanded evaluation set (≥25 scenarios) and automated CI gate
- In‑game overlay client (Overwolf/Electron) as optional extension

---

## Contributing
Pull requests are welcome. Please include:
- A brief description of the change and the motivation
- Screenshots/GIFs for UI changes
- Test updates if you touch evaluation logic

---

## License
MIT © 2025
