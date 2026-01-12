import { GoogleGenAI } from "@google/genai";
import { Song } from "./types";

export const searchGlobalSongs = async (query: string): Promise<Partial<Song>[]> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Search for music tracks matching: "${query}". Return the top 5 results with title, artist, album, a high-quality cover image URL, and a likely release year.`,
      config: {
        tools: [{ googleSearch: {} }],
        // Note: Google Search grounding might return text, so we handle it gracefully.
        responseMimeType: "application/json",
      },
    });

    try {
      // Clean up response if it contains markdown or extra text
      const rawText = response.text || "[]";
      const jsonStart = rawText.indexOf('[');
      const jsonEnd = rawText.lastIndexOf(']') + 1;
      const jsonStr = jsonStart !== -1 ? rawText.substring(jsonStart, jsonEnd) : rawText;
      return JSON.parse(jsonStr);
    } catch {
      return [];
    }
  } catch (error) {
    console.error("Global search failed:", error);
    return [];
  }
};

export const resolveTrackFromLink = async (metadata: string): Promise<Partial<Song> | null> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Find metadata for the track ID/Name: "${metadata}". Include title, artist, album, genre, releaseYear, and a representative cover image URL.`,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
      },
    });

    try {
      const rawText = response.text || "{}";
      const jsonStart = rawText.indexOf('{');
      const jsonEnd = rawText.lastIndexOf('}') + 1;
      const jsonStr = jsonStart !== -1 ? rawText.substring(jsonStart, jsonEnd) : rawText;
      return JSON.parse(jsonStr);
    } catch {
      return null;
    }
  } catch (error) {
    console.error("Link resolution failed:", error);
    return null;
  }
};