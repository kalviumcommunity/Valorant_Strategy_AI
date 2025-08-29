import express from "express";
import { systemPromptTemplate, makeUserPrompt } from "../prompts/dynamicPrompt.js";
import { validateInput, coerceStrategyOutput } from "../schema.js";
import { chatWithOllama } from "../ollamaClient.js";

const router = express.Router();

router.post("/", async (req, res) => {
  const validation = validateInput(req.body);
  if (!validation.ok) {
    return res.status(400).json({ error: "Invalid input.", details: validation.errors });
  }

  try {
    const userMsg = makeUserPrompt(req.body);
    const raw = await chatWithOllama({
      system: systemPromptTemplate,
      user: userMsg,
      temperature: 0.7
    });

    const parsed = coerceStrategyOutput(raw);
    return res.json(parsed);
  } catch (err) {
    console.error("Dynamic prompting error:", err);
    return res.status(500).json({
      error: "Failed to generate strategy.",
      details: err?.message || "Unknown error"
    });
  }
});

export default router;
