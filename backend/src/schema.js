// Simple schema checks (no external validator to keep setup minimal)
export function validateInput(body) {
    const errors = [];

    if (!body || typeof body !== "object") {
        errors.push("Body must be a JSON object.");
        return { ok: false, errors };
    }

    const { map, side, team_agents, enemy_economy } = body;

    if (map && typeof map !== "string") errors.push("map must be a string.");
    if (side && typeof side !== "string") errors.push("side must be a string.");
    if (team_agents && !Array.isArray(team_agents)) {
        errors.push("team_agents must be an array of strings.");
    } else if (Array.isArray(team_agents)) {
        const bad = team_agents.some(a => typeof a !== "string");
        if (bad) errors.push("team_agents must be an array of strings.");
    }
    if (enemy_economy && typeof enemy_economy !== "string") {
        errors.push("enemy_economy must be a string.");
    }

    if (errors.length) return { ok: false, errors };
    return { ok: true, errors: [] };
}

// Enforce output structure & fix common model mistakes.
export function coerceStrategyOutput(rawText) {
    // 1) Extract the first JSON object in the string (in case model adds stray text)
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    let obj;
    try {
        obj = JSON.parse(jsonMatch ? jsonMatch[0] : rawText);
    } catch {
        // If it's not parseable, return fallback
        return {
            setup: "N/A",
            execution: "N/A",
            post_plant_or_retake: "N/A",
            _note: "Model returned non-JSON; coerced to fallback."
        };
    }

    // 2) Normalize keys & enforce required fields
    const out = {
        setup: sanitizeField(obj.setup),
        execution: sanitizeField(obj.execution),
        post_plant_or_retake: sanitizeField(
            obj.post_plant_or_retake ?? obj.post_plant ?? obj.defense ?? obj["post_plant/retake"]
        )
    };

    // 3) Final fill
    if (!out.setup) out.setup = "N/A";
    if (!out.execution) out.execution = "N/A";
    if (!out.post_plant_or_retake) out.post_plant_or_retake = "N/A";

    return out;
}

function sanitizeField(v) {
    if (typeof v === "string" && v.trim().length > 0) return v.trim();
    return null;
}
