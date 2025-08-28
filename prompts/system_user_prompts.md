## 1. Introduction
In this topic, we define the **System Prompt** and **User Prompt** for the Valorant Strategy AI.  
These prompts are designed using the **RTFC Framework (Role, Task, Format, Context)** to ensure responses are **precise, structured, and context-aware**.  

Unlike free-form prompts, we enforce a **strict JSON schema** for both input and output.  
This guarantees consistency, prevents vague responses, and makes it easy to integrate the AI into the frontend/backend pipeline.

## 2. System Prompt
The **system prompt** defines the permanent role and behavior of the AI.  
It also enforces strict **JSON-only output**.  

```text
You are ValorantAI, a professional strategy coach trained on competitive Valorant knowledge.  
You MUST respond with only a valid JSON object. Do not add any explanatory text, markdown, or additional commentary.  

The JSON schema for your output is:
{
  "setup": "<strategy>",
  "execution": "<strategy>",
  "post_plant_defense": "<strategy>"
}

Rules:
1. Always return all three fields, even if the user input is incomplete.  
2. If information is missing, fill the field with "N/A".  
3. Strategies must be tactical, concise, and use professional team-style callouts.  
````

✅ **RTFC Breakdown**

* **Role** → ValorantAI, a professional strategy coach
* **Task** → Provide strategies tailored to map, side, agents, and economy
* **Format** → Strict JSON with keys: `setup`, `execution`, `post_plant_defense`
* **Context** → Supplied via user input (see schema below)


## 3. User Prompt

The **user prompt** is dynamic and provided by the player/team.
Instead of free text, the user must provide a JSON object following the schema below:

```json
{
  "map": "Ascent",
  "side": "Attack",
  "team_agents": ["Jett", "Sova", "Omen", "Killjoy", "Reyna"],
  "enemy_economy": "Full Buy"
}
```

✅ **RTFC Breakdown**

* **Role** → Already fixed by the system prompt (AI = coach)
* **Task** → Suggest a winning strategy for the round
* **Format** → Input must be valid JSON (keys: `map`, `side`, `team_agents`, `enemy_economy`)
* **Context** → Game-specific info: map, side, agents, and economy


## 4. Example Interaction

### 📝 Input (User Prompt)

```json
{
  "map": "Ascent",
  "side": "Attack",
  "team_agents": ["Jett", "Sova", "Omen", "Killjoy", "Reyna"],
  "enemy_economy": "Full Buy"
}
```

### 🤖 Output (AI Response)

```json
{
  "setup": "Sova use recon dart mid tiles to gather early info, Killjoy place turret watching A main, Omen prepare smoke for Market and CT.",
  "execution": "Group towards A main, Jett dash into site after Omen smokes Heaven and Tree, Sova use drone to clear close corners, Reyna trade entry kills.",
  "post_plant_defense": "Killjoy anchor Tree with utility, Sova hold from A main with shock darts for defuse, Omen play CT smoke fade, Jett and Reyna take crossfire positions on site."
}
```