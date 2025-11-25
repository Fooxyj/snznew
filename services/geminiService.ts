import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const generateAdDescription = async (title: string, category: string, keywords: string): Promise<string> => {
  if (!apiKey) return "API Key not found. Please write the description manually.";

  try {
    const prompt = `Напиши короткое, привлекательное объявление (максимум 40 слов) для продажи или аренды в городе Снежинск. 
    Заголовок: ${title}. 
    Категория: ${category}. 
    Ключевые особенности: ${keywords}.
    Стиль: Газетное объявление, вежливое, но продающее.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Не удалось сгенерировать описание. Пожалуйста, попробуйте позже.";
  }
};
