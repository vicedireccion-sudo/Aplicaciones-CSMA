import { GoogleGenAI } from "@google/genai";
import { type Candidate } from "../types";

// Fix: Per Gemini API guidelines, initialize the SDK directly with the environment variable and remove manual API key checks.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateResultsSummary = async (candidates: Candidate[]): Promise<string> => {
  const sortedCandidates = [...candidates].sort((a, b) => b.votes - a.votes);

  const candidateList = sortedCandidates.map((c, index) => `${index + 1}. ${c.name}: ${c.votes} votos`).join('\n');
  const winners = sortedCandidates.slice(0, 9);
  const winnerList = winners.map(c => c.name).join(', ');

  const prompt = `
    Actúa como el director del CSMA (Conservatorio Superior de Música de Aragón).
    Se acaba de celebrar una elección para los representantes del profesorado en el consejo de centro.
    Basándote en los siguientes resultados, redacta un comunicado oficial y alentador para todo el profesorado.
    
    El comunicado debe:
    1.  Comenzar agradeciendo a todos los candidatos su participación y a todos los profesores por votar.
    2.  Anunciar los 9 representantes electos en una lista clara.
    3.  Felicitar a los ganadores.
    4.  Concluir con un mensaje positivo sobre la futura colaboración en el consejo de centro.

    Resultados de la Elección:
    ${candidateList}

    Los representantes electos son: ${winnerList}.

    Por favor, genera el texto del comunicado ahora.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return "Ocurrió un error al generar el resumen. Por favor, revisa la consola para más detalles.";
  }
};