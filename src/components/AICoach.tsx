import React, { useState, useRef, useEffect } from "react";
import { CoachMessage, UserProfile } from "../types";
import { MessageSquare, Send, Sparkles, User, Dumbbell, ShieldAlert, BadgeAlert } from "lucide-react";
import { motion } from "motion/react";

interface AICoachProps {
  profile: UserProfile;
  messages: CoachMessage[];
  onSendMessage: (text: string) => Promise<void>;
  bmiStatus: string;
}

export default function AICoach({
  profile,
  messages,
  onSendMessage,
  bmiStatus,
}: AICoachProps) {
  const [inputText, setInputText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Auto scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isSending) return;

    const textToSend = inputText;
    setInputText("");
    setIsSending(true);

    try {
      await onSendMessage(textToSend);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSending(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputText(suggestion);
  };

  const suggestions = [
    "Qual treino musculação é ideal para proteger os joelhos?",
    "Me dê ideias de lanche pós-treino proteico saudável",
    "Estou com dificuldade no cárdio, como devo começar?",
    "Como bater a meta de ingestão de água diária de 4.4L?"
  ];

  return (
    <div id="coach-view" className="space-y-6 max-w-lg mx-auto pb-6">
      {/* View Header */}
      <div className="text-center pt-2">
        <h2 className="text-2xl font-bold tracking-tight text-white mb-1 flex items-center justify-center gap-1.5 font-display">
          <Dumbbell className="w-6 h-6 text-emerald-500 animate-spin-slow" /> Treinador Inteligente AI
        </h2>
        <p className="text-xs text-zinc-500">Coach virtual focado no seu reajuste metabólico e hipertrofia</p>
      </div>

      {/* Metrics Banner Warning */}
      <div className="bg-zinc-950/60 rounded-xl px-4 py-3 border border-zinc-900 flex gap-3 text-left">
        <BadgeAlert className="w-5 h-5 text-emerald-500 mt-1 flex-shrink-0" />
        <div className="text-[11px] leading-relaxed">
          <p className="font-bold text-white uppercase tracking-wider">Metas Carregadas no Coach</p>
          <p className="text-zinc-400 mt-0.5">
            O assistente analisa que seu peso é <strong className="text-emerald-400">{profile.weight}kg</strong> e por sua meta ser <strong className="text-emerald-400">{profile.weightGoal}kg</strong>, os algoritmos do Gemini priorizam proteção articular e déficit calórico focado.
          </p>
        </div>
      </div>

      {/* Chat Messages Interface Canvas */}
      <div className="bg-zinc-900/80 border border-zinc-800/80 rounded-2xl flex flex-col h-[400px] overflow-hidden box-glow">
        <div className="bg-zinc-950 px-4 py-3 border-b border-zinc-800 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-semibold text-white tracking-wide font-mono">Next Train Coach</span>
          </div>
          <span className="text-[10px] bg-emerald-500/10 text-[#4ade80] px-2 py-0.5 rounded font-bold uppercase">
            Gemini 3.5 Active
          </span>
        </div>

        {/* Message Streams box */}
        <div className="flex-grow overflow-y-auto p-4 space-y-4 scrollbar">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center px-4">
              <MessageSquare className="w-8 h-8 text-zinc-650 mb-3 animate-bounce" />
              <p className="text-xs font-semibold text-zinc-300">Olá {profile.name || "Takemi"}!</p>
              <p className="text-[11px] text-zinc-500 max-w-xs mt-1">
                Sou seu instrutor pessoal de dieta e hipertrofia. Como posso ajudar na sua evolução física hoje?
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((m) => {
                const isCoach = m.sender === "coach";
                return (
                  <div
                    key={m.id}
                    className={`flex ${isCoach ? "justify-start" : "justify-end"}`}
                  >
                    <div
                      className={`flex items-start max-w-[85%] gap-2 ${
                        isCoach ? "flex-row" : "flex-row-reverse"
                      }`}
                    >
                      {/* Avatar */}
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold ${
                          isCoach
                            ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"
                            : "bg-zinc-800 text-zinc-300"
                        }`}
                      >
                        {isCoach ? <Sparkles className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                      </div>

                      {/* Msg text bubble */}
                      <div
                        className={`p-3 rounded-2xl text-xs leading-relaxed text-left whitespace-pre-wrap ${
                          isCoach
                            ? "bg-zinc-950 text-zinc-200 rounded-tl-none border border-zinc-870"
                            : "bg-emerald-500 text-black font-medium rounded-tr-none shadow-md"
                        }`}
                      >
                        {m.text}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          {isSending && (
            <div className="flex justify-start">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5 animate-spin-slow" />
                </div>
                <div className="bg-zinc-950 text-xs italic text-zinc-500 p-2.5 rounded-xl border border-zinc-900">
                  Coach está estruturando seus treinos...
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Dynamic Suggestions block */}
        {messages.length === 0 && (
          <div className="p-3 bg-zinc-950/80 border-t border-zinc-850">
            <p className="text-[10px] text-zinc-500 mb-2 font-mono uppercase tracking-wider text-left pl-1">Sugestões de perguntas:</p>
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSuggestionClick(s)}
                  className="bg-zinc-900 text-[10px] text-zinc-400 border border-zinc-800 hover:border-emerald-500/40 hover:text-white px-2.5 py-1.5 rounded-lg text-left transition"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Send message Form */}
        <div className="p-3 bg-zinc-950 border-t border-zinc-800">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              required
              placeholder="Digite sua dúvida ou relato de treino..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-grow bg-zinc-900 border border-zinc-800 text-xs rounded-xl p-3 text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500"
            />
            <button
              type="submit"
              disabled={isSending || !inputText.trim()}
              className="bg-emerald-500 hover:bg-emerald-400 text-black p-3 rounded-xl transition flex items-center justify-center disabled:opacity-40"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
