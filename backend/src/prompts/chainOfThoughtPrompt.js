// prompts/chainOfThoughtPrompt.js
export const systemPrompt = `
You are ValorantAI, a professional esports coach. 
You MUST first reason step-by-step about the round and then provide a JSON strategy. Do not include explanations outside the JSON in the output.

JSON schema:
{
  "setup": "<team setup strategy>",
  "execution": "<round execution strategy>",
  "post_plant_or_retake": "<strategy for post-plant or retake>"
}

Rules:
1) Think step-by-step: evaluate map control, team composition, enemy economy, ultimates.
2) Then output only the JSON object with setup, execution, and post_plant_or_retake.
`;

export function makeUserPrompt({ map, side, team_agents, enemy_economy, lastRoundOutcome, previousStrategies, teamUlts, enemyUlts }) {
  return JSON.stringify({
    map: map ?? "N/A",
    side: side ?? "N/A",
    team_agents: Array.isArray(team_agents) ? team_agents : [],
    enemy_economy: enemy_economy ?? "N/A",
    lastRoundOutcome: lastRoundOutcome ?? "N/A",
    previousStrategies: previousStrategies ?? [],
    teamUlts: teamUlts ?? [],
    enemyUlts: enemyUlts ?? []
  });
}
