import { Router } from "express";
import { GoogleGenAI } from "@google/genai";
import OpenAI from "openai";

const router = Router();

// Gemini
const gemini = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

// Groq (OpenAI-compatible)
const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY!,
  baseURL: "https://api.groq.com/openai/v1",
});

router.post("/", async (req, res) => {
  try {
    const {
      message,
      model = "gemini-3.5-flash",
    } = req.body;

    if (!message) {
      return res.status(400).json({
        error: "Message is required",
      });
    }

    let reply = "";

    // --------------------
    // Gemini Models
    // --------------------
    if (model.startsWith("gemini")) {
      const response = await gemini.models.generateContent({
        model,
        contents: message,
      });

      reply = response.text ?? "";
    }

    // --------------------
    // Groq Models
    // --------------------
    else {
      const response = await groq.chat.completions.create({
        model,
        messages: [
          {
            role: "user",
            content: message,
          },
        ],
      });

      reply = response.choices[0].message.content ?? "";
    }

    return res.json({
      reply,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Failed to generate response.",
    });
  }
});

export default router;