import { GoogleGenAI } from "@google/genai";
import { Feature, FeaturePriority, FeatureComplexity, UserJourney, JourneyNode, JourneyEdge } from "../types";

// Initialize Gemini API
// Note: process.env.API_KEY is assumed to be available as per instructions.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const modelId = "gemini-2.5-flash";

export const generateBriefSection = async (
  sectionTitle: string,
  context: string,
  projectName: string
): Promise<string> => {
  try {
    const prompt = `
      Act as a Senior Product Manager. 
      Project Name: ${projectName}
      Context so far: ${context}
      
      Task: Write the content for the "${sectionTitle}" section of the Product Brief.
      Keep it professional, concise, and actionable. Do not use markdown headers for the title itself.
    `;

    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
    });

    return response.text || "";
  } catch (error) {
    console.error("Error generating brief section:", error);
    throw new Error("Failed to generate content. Please check your API Key.");
  }
};

export const generateFeatures = async (
  briefContext: string
): Promise<Feature[]> => {
  try {
    const prompt = `
      Based on the following Product Brief, generate a list of features categorized by MoSCoW prioritization (Must Have, Should Have, Could Have, Won't Have).
      
      Brief Context:
      ${briefContext}

      Return ONLY a JSON array with the following structure:
      [
        {
          "title": "Feature Title",
          "description": "Short description",
          "priority": "Must Have" | "Should Have" | "Could Have" | "Won't Have",
          "complexity": "Low" | "Medium" | "High"
        }
      ]
    `;

    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    const text = response.text || "[]";
    const rawFeatures = JSON.parse(text);

    return rawFeatures.map((f: any) => ({
      id: crypto.randomUUID(),
      title: f.title,
      description: f.description,
      priority: f.priority as FeaturePriority,
      complexity: f.complexity as FeatureComplexity,
    }));

  } catch (error) {
    console.error("Error generating features:", error);
    return [];
  }
};

export const generatePRD = async (
  feature: Feature,
  briefContext: string
): Promise<string> => {
  try {
    const prompt = `
      Generate a detailed Product Requirements Document (PRD) for the following feature.
      
      Feature: ${feature.title}
      Description: ${feature.description}
      Priority: ${feature.priority}
      
      Project Context:
      ${briefContext}

      Format the output in Markdown. Include sections:
      1. Overview
      2. User Story
      3. Use Cases (Actors, Preconditions, Flow, Postconditions)
      4. Acceptance Criteria
      5. Technical Notes
    `;

    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
    });

    return response.text || "";
  } catch (error) {
    console.error("Error generating PRD:", error);
    return "Failed to generate PRD.";
  }
};

export const generateUserJourney = async (
  context: string
): Promise<UserJourney> => {
  try {
    const prompt = `
      Create a logical User Journey Flow for a web application based on this context.
      
      Context:
      ${context}
      
      Task: Return a JSON object representing nodes (screens/steps) and edges (connections).
      
      Requirements:
      1. Identify Key Screens (e.g., Login, Dashboard, Settings, Feature X).
      2. Mark the first screen as type "entry".
      3. Mark the final goal/screen as type "exit".
      4. All others are "default".
      5. Create logical connections (edges) between them.
      
      Return JSON Format ONLY:
      {
        "nodes": [
          { "id": "1", "label": "Home/Login", "type": "entry" },
          { "id": "2", "label": "Dashboard", "type": "default" }
        ],
        "edges": [
          { "source": "1", "target": "2" }
        ]
      }
    `;

    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    const text = response.text || "{}";
    const data = JSON.parse(text);
    
    // Auto-layout simple grid
    const nodes: JourneyNode[] = (data.nodes || []).map((node: any, index: number) => ({
      id: node.id || crypto.randomUUID(),
      label: node.label,
      type: node.type || 'default',
      // Simple layout: zig-zag or grid
      x: 100 + (index % 3) * 350,
      y: 100 + Math.floor(index / 3) * 200,
    }));

    const edges: JourneyEdge[] = (data.edges || []).map((edge: any) => ({
      id: crypto.randomUUID(),
      source: edge.source,
      target: edge.target
    }));

    return { nodes, edges };

  } catch (error) {
    console.error("Error generating User Journey:", error);
    return { nodes: [], edges: [] };
  }
};
