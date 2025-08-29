import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

const OLLAMA_HOST = process.env.OLLAMA_HOST || "http://localhost:11434";
const MODEL_NAME = process.env.MODEL_NAME || "mistral";

// Use Ollama's /api/chat for role-based messages (system/user/assistant)
export async function chatWithOllama({ system, user, temperature = 0.7, timeoutMs = 60_000 }) {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), timeoutMs);

    const res = await fetch(`${OLLAMA_HOST}/api/chat`, {
        method: "POST",
        signal: controller.signal,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            model: MODEL_NAME,
            stream: false,
            options: { temperature },
            messages: [
                { role: "system", content: system },
                { role: "user", content: user }
            ]
        })
    });

    clearTimeout(t);

    if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`Ollama error ${res.status}: ${text}`);
    }

    const data = await res.json();
    // data.message.content contains the assistant reply
    return data?.message?.content ?? "";
}
