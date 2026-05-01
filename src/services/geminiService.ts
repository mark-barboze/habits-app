import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });

export const generateWeeklySummary = async (stats: any, habits: string[], todos: string[]) => {
  const prompt = `
    Generate a concise weekly habit and productivity report summary for a user.
    
    Stats:
    - Habits Completed: ${stats.habitsCompleted}
    - Tasks Completed: ${stats.todosCompleted}
    - Current Total Streaks: ${stats.totalStreaks}
    - Missed Days: ${stats.missedDays}
    
    Recent Habits: ${habits.join(', ')}
    Recent Tasks: ${todos.join(', ')}
    
    Please provide the response in the following JSON format:
    {
      "summary": "A positive and encouraging summary of the week's performance.",
      "whatWentWrong": "A gentle analysis of what might have hindered progress (be general and empathetic).",
      "improvementSteps": "3 clear, actionable steps to improve for next week.",
      "quote": "A short motivational quote that fits the week's mood."
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            whatWentWrong: { type: Type.STRING },
            improvementSteps: { type: Type.STRING },
            quote: { type: Type.STRING },
          },
          required: ["summary", "whatWentWrong", "improvementSteps", "quote"],
        },
      },
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini Error:", error);
    return {
      summary: "You had a productive week focusing on your goals. Keep up the great work!",
      whatWentWrong: "Sometimes life gets in the way of our routines, which is perfectly normal.",
      improvementSteps: "1. Prioritize your most important habit. 2. Set realistic daily goals. 3. Reflect on your progress nightly.",
      quote: "Believe you can and you're halfway there."
    };
  }
};
