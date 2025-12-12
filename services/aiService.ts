
import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const aiService = {
  createChat: (): Chat => {
    return ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: "Ты — полезный ИИ-помощник для городского портала «Снежинск Онлайн». Твоя цель — помогать жителям находить информацию о новостях, событиях, объявлениях и организациях города Снежинск. Будь вежлив, краток и отвечай на русском языке. Если спрашивают о конкретных данных (погода, новости), старайся использовать актуальную информацию или общие знания.",
        tools: [{ googleSearch: {} }]
      },
    });
  },

  sendMessageStream: async (chat: Chat, message: string) => {
    return await chat.sendMessageStream({ message });
  }
};
