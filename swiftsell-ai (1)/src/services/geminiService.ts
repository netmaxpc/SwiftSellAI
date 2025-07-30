import { GoogleGenAI, GenerateContentResponse, Type, Chat } from "@google/genai";
import { ItemData, GroundingChunk, ChatMessage } from '../types';

if (!process.env.API_KEY) {
  // This check happens at runtime, but Vite's define plugin replaces `process.env.API_KEY` at build time.
  // If VITE_API_KEY is not set in .env, it will be replaced with 'undefined', and this error will be thrown.
  throw new Error("API_KEY environment variable not set. Please create a .env.local file with VITE_API_KEY=YOUR_KEY.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const chatModel = 'gemini-2.5-flash';
const searchModel = 'gemini-2.5-flash';

// Utility to convert File to base64
const fileToGenerativePart = async (file: File) => {
  const base64EncodedData = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
  return {
    inlineData: {
      data: base64EncodedData,
      mimeType: file.type,
    },
  };
};

export const analyzeImages = async (images: File[]): Promise<{ itemData: ItemData, sources: GroundingChunk[] }> => {
  if (images.length === 0) {
    throw new Error("No images provided for analysis.");
  }

  const imageParts = await Promise.all(images.map(fileToGenerativePart));

  // --- Call 1: Get Title and Description with JSON response ---
  const descriptionPrompt = "Analyze the item in the image(s). Generate a catchy, SEO-friendly product title (under 80 characters) and a detailed, persuasive product description. Highlight key features and potential uses.";

  const descriptionResponse: GenerateContentResponse = await ai.models.generateContent({
    model: chatModel,
    contents: { parts: [...imageParts, { text: descriptionPrompt }] },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: "Catchy product title, under 80 characters." },
          description: { type: Type.STRING, description: "Detailed and persuasive product description." },
        },
        required: ["title", "description"],
      },
    }
  });
  
  let parsedDescription;
  try {
    const rawJsonText = descriptionResponse.text.trim();
    parsedDescription = JSON.parse(rawJsonText);
  } catch (e) {
      console.error("Failed to parse JSON from description response:", e);
      throw new Error("The AI returned an invalid format for the item description. Please try again.");
  }


  // --- Call 2: Get Pricing info with Google Search ---
  const pricePrompt = "Based on the item in the image(s), act as a pricing expert. Search online marketplaces to determine a competitive but fair market price for this item if sold secondhand. Respond with ONLY a single floating-point number representing the price in USD, and nothing else. Example: 49.99";
  
  const priceResponse: GenerateContentResponse = await ai.models.generateContent({
      model: searchModel,
      contents: { parts: [...imageParts, { text: pricePrompt }] },
      config: {
        tools: [{googleSearch: {}}],
      }
  });

  const priceText = priceResponse.text.replace(/[^0-9.]/g, '');
  const price = parseFloat(priceText) || 0;
  const sources = priceResponse.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

  const finalItemData: ItemData = {
    title: parsedDescription.title,
    description: parsedDescription.description,
    price: price
  };

  return { itemData: finalItemData, sources: sources };
};


let assistantChat: Chat | null = null;

export const getAssistantResponse = async (history: ChatMessage[]): Promise<string> => {
  if (!assistantChat) {
    assistantChat = ai.chats.create({
      model: chatModel,
      config: {
        systemInstruction: "You are a friendly and helpful AI assistant for the 'SwiftSell AI' app. Your purpose is to guide users on how to operate the application. Keep your answers concise and easy to understand. The user is on a mobile device.",
      },
    });
  }

  const lastUserMessage = history[history.length - 1];
  
  const response = await assistantChat.sendMessage({ message: lastUserMessage.content });

  return response.text;
};