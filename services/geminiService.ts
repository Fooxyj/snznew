import { GoogleGenAI } from "@google/genai";

let ai: GoogleGenAI | null = null;

const getAiClient = () => {
    if (!ai) {
        // Initialize lazy to prevent crash at startup if environment is not ready
        let apiKey = '';
        try {
            // Strict check: verify process exists before accessing process.env
            // This prevents "ReferenceError: process is not defined" in pure browser environments
            if (typeof process !== 'undefined' && process && typeof process.env === 'object') {
                apiKey = process.env.API_KEY || '';
            }
        } catch (e) {
            console.warn("Could not access process.env.API_KEY", e);
        }
        
        ai = new GoogleGenAI({ apiKey });
    }
    return ai;
};

export const generateAdDescription = async (title: string, category: string, keywords: string): Promise<string> => {
  try {
    const client = getAiClient();
    const prompt = `Напиши короткое, привлекательное объявление (максимум 40 слов) для продажи или аренды в городе Снежинск. 
    Заголовок: ${title}. 
    Категория: ${category}. 
    Ключевые особенности: ${keywords}.
    Стиль: Газетное объявление, вежливое, но продающее.`;

    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Не удалось сгенерировать описание.";
  }
};