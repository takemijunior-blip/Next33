import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize Gemini client on server safely
  const apiKey = process.env.GEMINI_API_KEY;
  let ai: GoogleGenAI | null = null;
  if (apiKey) {
    ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  } else {
    console.warn("WARNING: GEMINI_API_KEY environment variable is not defined.");
  }

  // API endpoint for translations
  app.post("/api/translate", async (req, res) => {
    try {
      const { text, from, to, autoDetect } = req.body;
      if (!text) {
        return res.status(400).json({ error: "Text is required for translation." });
      }

      if (!ai) {
        return res.status(500).json({ error: "O tradutor está temporariamente indisponível porque a chave GEMINI_API_KEY não foi configurada no servidor." });
      }

      const prompt = `Você é um tradutor especialista com precisão impecável. 
Traduza o seguinte texto para a língua '${to}'. 
${autoDetect ? "Detecte automaticamente o idioma original do texto." : `O texto original está em '${from}'.`}

Retorne APENAS a tradução resultante, sem explicações, sem comentários de introdução, preserve quebras de linha e estrutura original. Se o idioma detectado for o mesmo do idioma de destino, retorne o próprio texto sem alterações.

Texto para traduzir:
---
${text}
---`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
      });

      const translation = response.text || "";
      res.json({ translatedText: translation.trim() });
    } catch (error: any) {
      console.error("Translation error:", error);
      res.status(500).json({ error: error.message || "Erro durante a tradução." });
    }
  });

  // API endpoint for coach chat
  app.post("/api/coach-chat", async (req, res) => {
    try {
      const { messages, userProfile } = req.body;
      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: "A lista de mensagens é necessária." });
      }

      if (!ai) {
        // Simple mock response if API Key is not set, so the app remains interactive!
        const lastMsg = messages[messages.length - 1]?.text || "";
        return res.json({ 
          text: `Olá! Eu sou o seu Coach Fitness da Next Fitness. Para conversar por inteligência artificial em tempo real, por favor configure a chave 'GEMINI_API_KEY' no painel de Secrets. 
          
          Como um Coach virtual de apoio local, aqui estão algumas dicas baseadas no seu perfil (${userProfile?.name || 'Dark Takemi'}):
          - Peso atual: ${userProfile?.weight || '125'} kg (Meta: ${userProfile?.weightGoal || '78'} kg)
          - Seu consumo recomendado é estimado em ${userProfile?.calorieGoal || '1278'} kcal/dia.
          - Ingestão de água: ${userProfile?.waterGoal || '4.4'} Litros.
          
          Continue firme no seu progresso diário! Se tiver dúvidas sobre treinos para perda de peso, foque em atividades de baixo impacto (caminhada rápida, ciclismo, musculação) para proteger suas articulações.` 
        });
      }

      const systemInstruction = `Você é o "Next Coach", um treinador físico e profissional de nutrição da academia Next Fitness Co., extremamente focado, empático, motivador e inteligente.
Estilo de comunicação: Focado, amigável, direto, inspirador. Use português do Brasil como padrão. Sempre procure reajustar metas e incentivar a jornada sem ser excessivamente repetitivo.
Perfil do aluno atual:
- Nome: ${userProfile?.name || 'Dark Takemi'}
- Peso atual: ${userProfile?.weight || '125'} kg
- Meta de peso: ${userProfile?.weightGoal || '78'} kg
- Meta de Calorias recomendadas por dia: ${userProfile?.calorieGoal || '1278'} kcal
- Meta de água por dia: ${userProfile?.waterGoal || '4.4'} L
- Categoria de IMC correspondente: ${userProfile?.bmiStatus || 'Obesidade'}

Instruções específicas para o treino dele:
Como ele pesa cerca de ${userProfile?.weight || '125'} kg, treinos de musculação e aeróbicos de menor impacto nas articulações (elíptico, caminhadas ritmadas, natação ou treinos em aparelhos guiados) são altamente recomendados para evitar lesões nos joelhos, tornozelos e coluna. Sempre priorize treinos focados em hipertrofia moderada e déficit calórico focado em manter gordura corporal baixa. Explique de forma construtiva e motivadora!`;

      // Map to Gemini's dynamic chat parts representation
      const chatContents = messages.map((m: any) => ({
        role: m.sender === "user" ? "user" : "model",
        parts: [{ text: m.text }]
      }));

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: chatContents,
        config: {
          systemInstruction: systemInstruction,
        }
      });

      res.json({ text: response.text });
    } catch (error: any) {
      console.error("Coach API error:", error);
      res.status(500).json({ error: error.message || "Erro na resposta do Coach." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
