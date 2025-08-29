// prompts/dynamicPrompt.js
export const systemPromptTemplate = `
You are ValorantAI, a professional esports coach. 
You MUST respond with only a valid JSON object. Do not include explanations.

JSON schema:
{
  "setup": "<team setup strategy>",
  "execution": "<round execution strategy>",
  "post_plant_or_retake": "<strategy for post-plant or retake>"
}

Rules:
1) Include all three fields in your response.
2) Keep strategies concise and tactical.
3) Use context from the current round and previous rounds if provided.

Dynamic context example insertion:
- Last round outcome: {{lastRoundOutcome}}
- Previous strategies: {{previousStrategies}}
- Team ultimates: {{teamUlts}}
- Enemy ultimates: {{enemyUlts}}
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
