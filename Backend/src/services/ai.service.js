const ai = require("../config/gemini").ai;

const generateTasksWithAI = async(projectTitle, teamMembers) => {
    try {
        const prompt = `You are a senior project manager. Project: ${projectTitle}. 
            Team Members: ${JSON.stringify(teamMembers, null, 2)}
            Rules: 
            1. Frontend tasks MUST be assigned to Frontend developers.
            2. Backend tasks MUST be assigned to Backend developers.
            3. Fullstack developers can receive:
               - Frontend tasks
               - Backend tasks
               - Database tasks
               - DevOps tasks
            4. If a task doesn't clearly belong to a Frontend,
               Backend, or Fullstack developer,
               assign it to the workspace owner.
            5. Use exactly one of the names from the Team Members list in the assignedTo field.
               Do not invent any new person names.
            6. Distribute workload fairly.
            7. Generate realistic software development tasks.
            Generate a list of tasks for this project. Return the tasks in JSON.
            Format:

{
  "tasks":[
    {
      "title":"",
      "description":"",
      "priority":"low|medium|high",
      "category":"Frontend|Backend|Fullstack|Other",
      "assignedTo": "Member Name"
    }
  ]
}

No markdown.
No explanations.
No code block.
`;


const response = await ai.models.generateContent({
    model: "gemini-3.6-flash",
    contents: prompt,
});


const text = response.text;

const cleaned = text.replace(/```json/g, "").replace(/```/g, "").trim();


return JSON.parse(cleaned);

    } catch (err) {
        console.error("Error generating tasks with AI:", err);
    }
}


const askGemini = async(prompt) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
    });

    return response.text;
  } catch (err) {
      console.log("Gemini Error: ", err);

      throw new Error("Failed to get AI response");
  }
}


module.exports = {generateTasksWithAI, askGemini};