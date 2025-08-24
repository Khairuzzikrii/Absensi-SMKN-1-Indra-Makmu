import { GoogleGenAI, Type } from "@google/genai";
import { Coordinates } from "../types";

const apiKey = process.env.API_KEY;
if (!apiKey) {
  // In a real app, you might want to handle this more gracefully,
  // but for this context, an error is fine.
  console.error("Gemini API key is not set. Please set the API_KEY environment variable.");
}

const ai = new GoogleGenAI({ apiKey: apiKey! });

export const geminiService = {
  /**
   * Generates a short, uplifting motivational quote for a teacher.
   * @param teacherName The name of the teacher to personalize the quote for.
   * @returns A promise that resolves to the motivational quote string.
   */
  generateMotivation: async (teacherName: string): Promise<string> => {
    try {
      const prompt = `Berikan satu kutipan motivasi singkat (satu atau dua kalimat) untuk seorang guru bernama ${teacherName} di Indonesia. Buatlah kutipan yang membangkitkan semangat, relevan dengan profesi guru, dan inspiratif.`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      // Using the .text accessor is the correct and simplest way.
      return response.text.trim();
    } catch (error) {
      console.error("Error generating motivation from Gemini API:", error);
      // Provide a fallback message in case of an API error.
      return "Tetap semangat dalam mengajar, Anda adalah pahlawan tanpa tanda jasa.";
    }
  },

  /**
   * Gets a formatted address from GPS coordinates using Gemini.
   * @param coords The latitude and longitude.
   * @returns A promise that resolves to the formatted address string.
   */
  getAddressFromCoordinates: async (coords: Coordinates): Promise<string> => {
    if (!coords) return "Koordinat tidak valid.";
    try {
      const prompt = `Based on the following GPS coordinates, what is the address? 
      Latitude: ${coords.latitude}, Longitude: ${coords.longitude}. 
      Provide the address in the format: "Desa/Kelurahan, Kecamatan, Kabupaten/Kota, Provinsi".`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              address: {
                type: Type.STRING,
                description: 'The formatted address in "Desa, Kecamatan, Kabupaten, Provinsi" format.',
              },
            },
            required: ['address']
          },
        },
      });

      const jsonString = response.text.trim();
      if (!jsonString) {
          return "Alamat tidak dapat ditemukan.";
      }
      const parsed = JSON.parse(jsonString);
      return parsed.address || 'Alamat tidak ditemukan.';

    } catch (error) {
      console.error("Error getting address from Gemini API:", error);
      return "Gagal mengambil nama lokasi.";
    }
  },
};