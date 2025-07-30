
import { GoogleGenAI, GenerateContentResponse, Type, Chat } from "@google/genai";
import { ItemData, GroundingChunk, ChatMessage } from '../types';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_API_KEY;

if (!API_KEY) {
  console.warn('Gemini API key not found. Using mock responses for testing.');
}

const ai = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;
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

  // If no API key is available, return mock data
  if (!ai || !API_KEY) {
    console.log('Using mock analysis data for testing');
    return {
      itemData: {
        title: "Premium Quality Item - Great Condition",
        description: "This is a high-quality item in excellent condition. Perfect for collectors or everyday use. Features include durable construction, attractive design, and great functionality. Don't miss this opportunity to own this fantastic piece!",
        price: "$25.00",
        category: "Electronics",
        condition: "Like New",
        tags: ["quality", "durable", "collectible", "functional"]
      },
      sources: [
        {
          title: "Similar Item on eBay",
          link: "https://ebay.com/example",
          snippet: "Similar items selling for $20-30"
        },
        {
          title: "Amazon Listing",
          link: "https://amazon.com/example",
          snippet: "Comparable product priced at $28"
        }
      ]
    };
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
      temperature: 0.3,
      topP: 0.8,
      topK: 40,
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
  const pricePrompt = "Based on the item in the image(s), act as a pricing expert. Search online marketplaces to determine a competitive but fair market price for this item if sold secondhand. Provide only a single numerical value representing the price in USD. Do not include currency symbols or any explanatory text.";
  
  const priceResponse: GenerateContentResponse = await ai.models.generateContent({
      model: searchModel,
      contents: { parts: [...imageParts, { text: pricePrompt }] },
      config: {
        tools: [{googleSearch: {}}],
        temperature: 0.2,
        topP: 0.7,
        topK: 30,
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
  // If no API key is available, return mock response
  if (!ai || !API_KEY) {
    const lastMessage = history[history.length - 1];
    console.log('Using mock assistant response for testing');
    return `Thanks for your question! I'm here to help you with SwiftSell AI. ${lastMessage?.content ? `Regarding "${lastMessage.content}", ` : ''}I'd be happy to assist you with listing items, pricing strategies, and marketplace optimization. However, I'm currently running in demo mode. Please configure your API keys for full functionality.`;
  }

  if (!assistantChat) {
    assistantChat = ai.models.startChat({
      model: chatModel,
      systemInstruction: "You are a friendly and helpful AI assistant for the 'SwiftSell AI' app. Your purpose is to guide users on how to operate the application. Keep your answers concise and easy to understand. The user is on a mobile device.",
      config: {
        temperature: 0.4,
        topP: 0.8,
        topK: 40,
      },
    });
  }

  const lastUserMessage = history[history.length - 1];
  
  const response = await assistantChat.sendMessage({ message: lastUserMessage.content });

  return response.text;
};
