
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getWorkoutInsights = async (reps: number, exercise: string, qualityScore: number) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `The user just finished a set of ${reps} ${exercise}s with a form quality score of ${qualityScore}/100. Provide a short, motivating, and professional summary (max 3 sentences) and one specific tip for improving their form next time.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            tip: { type: Type.STRING },
            encouragement: { type: Type.STRING }
          },
          required: ["summary", "tip", "encouragement"]
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini Insight Error:", error);
    return {
      summary: `Great work on those ${reps} ${exercise}s!`,
      tip: "Keep your core engaged for maximum stability.",
      encouragement: "Ready for the next set?"
    };
  }
};
