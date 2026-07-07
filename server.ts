/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialize Gemini API client to avoid crashing if GEMINI_API_KEY is missing
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY environment variable is required");
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// -----------------------------------------------------------------
// 1. AI Stress Check Analysis Endpoint
// -----------------------------------------------------------------
app.post("/api/analyze", async (req, res) => {
  const { reflection, answersSummary, calculatedScore, category } = req.body;

  if (!reflection || reflection.trim().length < 3) {
    return res.status(400).json({ error: "Reflection text too short" });
  }

  try {
    const ai = getGeminiClient();
    
    const prompt = `You are an empathetic, professional emotional wellbeing coach guiding someone through a private self-assessment. 
Here is their stress check summary:
- Category Ratings: ${answersSummary}
- Calculated Score: ${calculatedScore}% (${category} stress)

The user wrote the following open reflection about their current stress sources:
"${reflection}"

Analyze their emotional state and write a supportive, deeply compassionate, non-judgmental reflection paragraph. Do NOT give medical advice or clinical diagnosis. Keep the tone warm, validating, and positive. Keep the paragraph under 110 words.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            sentiment: {
              type: Type.STRING,
              description: "The primary sentiment of the reflection: 'Positive', 'Neutral', or 'Negative'."
            },
            tone: {
              type: Type.STRING,
              description: "A single word or brief phrase representing the emotional tone: 'Calm', 'Hopeful', 'Stressed', 'Overwhelmed', 'Burned Out', 'Lonely', 'Frustrated', or 'Motivated'."
            },
            analysis: {
              type: Type.STRING,
              description: "The supportive, warm, non-judgmental reflection paragraph under 110 words."
            }
          },
          required: ["sentiment", "tone", "analysis"]
        }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("Empty response from GenAI model");
    }

    const result = JSON.parse(text.trim());
    res.json(result);

  } catch (error: any) {
    console.error("Gemini Analyze API Error:", error);
    res.status(500).json({ error: error.message || "Failed to process AI analysis" });
  }
});

// -----------------------------------------------------------------
// 2. AI Journal Reflection Endpoint
// -----------------------------------------------------------------
app.post("/api/reflect", async (req, res) => {
  const { title, content, moodTags } = req.body;

  if (!content || content.trim().length < 3) {
    return res.status(400).json({ error: "Journal content too short" });
  }

  try {
    const ai = getGeminiClient();

    const prompt = `You are a compassionate, non-judgmental journal reflection companion. A user has recorded their thoughts in their private diary.
- Title: "${title || 'Untitled'}"
- Associated Emotional Tags: ${moodTags ? moodTags.join(", ") : "None"}

Diary Content:
"${content}"

Provide a structured, supportive reflection. Give a validating summary, highlight core themes, make positive observations about their self-awareness or resilience, and offer gentle suggestions. Do NOT provide therapy or medical advice. Keep descriptions brief and focused.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: {
              type: Type.STRING,
              description: "A deeply warm, validating paragraph summarizing their entry and supporting their emotional state (under 80 words)."
            },
            themes: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "An array of 1 to 3 core themes identified in their diary entry."
            },
            positiveObs: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "An array of 1 to 3 positive observations or signs of self-awareness and strength in their text."
            },
            suggestions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "An array of 1 to 3 gentle, highly practical wellness suggestions (e.g., breathwork, stretching, talking to a friend)."
            }
          },
          required: ["summary", "themes", "positiveObs", "suggestions"]
        }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("Empty response from GenAI model");
    }

    const result = JSON.parse(text.trim());
    res.json({ reflection: result });

  } catch (error: any) {
    console.error("Gemini Reflect API Error:", error);
    res.status(500).json({ error: error.message || "Failed to generate AI reflection" });
  }
});

// -----------------------------------------------------------------
// 3. Vite Middleware and Static File Serving
// -----------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    // Support modern SPA routing fallback in production
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  });
}

startServer();
