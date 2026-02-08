
import { GoogleGenAI, Type } from "@google/genai";

const SYSTEM_INSTRUCTION = `Вы — Снежик, интеллектуальный ИИ-ассистент платформы "Простор" (Prostor) в городе Снежинск. 
Ваша задача — помогать жителям находить информацию о городе, услугах, расписаниях и мероприятиях. 
Ваш тон: дружелюбный, технологичный, современный. Вы — проводник в "Просторе" возможностей города.
Будьте лаконичны, используйте эмодзи там, где это уместно, чтобы подчеркнуть дружелюбие.`;

export const aiService = {
  async sendMessage(message: string, history: { role: string, parts: { text: string }[] }[] = []) {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [
          ...history,
          { role: 'user', parts: [{ text: message }] }
        ],
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          temperature: 0.7,
        },
      });

      return response.text;
    } catch (error: any) {
      console.error("Gemini AI Core Error:", error);
      if (error.message?.includes('fetch') || error.message?.includes('network')) {
        return "Извините, Снежик временно потерял связь с центральным сервером Простора. Проверьте интернет-соединение.";
      }
      return "У Снежика произошел небольшой системный сбой. Пожалуйста, повторите ваш вопрос чуть позже.";
    }
  },

  async parseDocumentToBlocks(rawText: string): Promise<any[]> {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Преобразуй предоставленный текст в массив JSON-блоков для конструктора Простора.
      Текст может быть меню, прайсом или списком услуг.
      
      СТРОГИЙ ФОРМАТ:
      [
        {
          "type": "grid" (если есть описания) или "pricing" (просто цена),
          "title": "Логичный заголовок блока",
          "items": [
             {"name": "Название", "desc": "Описание", "price": "Число без валюты"}
          ]
        }
      ]

      ВХОДНОЙ ТЕКСТ:
      ${rawText}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        type: { type: Type.STRING },
                        title: { type: Type.STRING },
                        items: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    name: { type: Type.STRING },
                                    desc: { type: Type.STRING },
                                    price: { type: Type.STRING }
                                }
                            }
                        }
                    }
                }
            }
        }
      });

      return JSON.parse(response.text || '[]');
    } catch (error) {
      console.error("AI Parser Failure:", error);
      return [];
    }
  }
};
