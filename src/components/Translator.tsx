import React, { useState } from "react";
import { TranslationHistory } from "../types";
import { Languages, ArrowRightLeft, Copy, Download, Trash2, Globe, AlertCircle, RefreshCw, FileText } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface TranslatorProps {
  onTranslate: (text: string, from: string, to: string, autoDetect: boolean) => Promise<string>;
  history: TranslationHistory[];
  onAddHistory: (originText: string, translatedText: string, fromLang: string, toLang: string) => void;
  onClearHistory: () => void;
  onDeleteHistoryItem: (id: string) => void;
}

const languagesList = [
  { code: "pt", name: "Português", isRtl: false },
  { code: "en", name: "Inglês", isRtl: false },
  { code: "ar", name: "Árabe (العربية)", isRtl: true },
  { code: "fr", name: "Francês", isRtl: false },
  { code: "zu", name: "Zulu (isiZulu)", isRtl: false },
];

export default function Translator({
  onTranslate,
  history,
  onAddHistory,
  onClearHistory,
  onDeleteHistoryItem,
}: TranslatorProps) {
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [fromLang, setFromLang] = useState("pt");
  const [toLang, setToLang] = useState("en");
  const [autoDetect, setAutoDetect] = useState(true);
  const [isTranslating, setIsTranslating] = useState(false);
  const [errorText, setErrorText] = useState("");
  const [copied, setCopied] = useState(false);

  const handleTranslate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isTranslating) return;

    setIsTranslating(true);
    setErrorText("");

    try {
      const result = await onTranslate(inputText, fromLang, toLang, autoDetect);
      setOutputText(result);
      if (result) {
        onAddHistory(inputText, result, autoDetect ? "Auto" : fromLang, toLang);
      }
    } catch (err: any) {
      console.error(err);
      setErrorText(err.message || "Erro de conexão ao servidor de tradução.");
    } finally {
      setIsTranslating(false);
    }
  };

  const handleSwapLanguages = () => {
    // Cannot swap nicely with autoDetect active
    const oldFrom = fromLang;
    setFromLang(toLang);
    setToLang(oldFrom);
    
    // Swap contents too if available
    const oldInput = inputText;
    setInputText(outputText);
    setOutputText(oldInput);
  };

  const handleCopy = () => {
    if (outputText) {
      navigator.clipboard.writeText(outputText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (outputText) {
      const fromName = languagesList.find((l) => l.code === fromLang)?.name || fromLang;
      const toName = languagesList.find((l) => l.code === toLang)?.name || toLang;

      const fileContent = `Next Fitness Translator File\n===================================\nOriginal (${fromName}):\n${inputText}\n\nTradução resultante (${toName}):\n${outputText}\n===================================\nData: ${new Date().toLocaleString()}`;
      
      const blob = new Blob([fileContent], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `traducao_next_${fromLang}_para_${toLang}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  const loadHistoryItem = (item: TranslationHistory) => {
    setInputText(item.originText);
    setOutputText(item.translatedText);
    setFromLang(item.fromLang === "Auto" ? "pt" : item.fromLang);
    setToLang(item.toLang);
    setAutoDetect(item.fromLang === "Auto");
  };

  // Check if output language requires Right-to-Left (RTL) text align
  const isOutputRtl = languagesList.find((lang) => lang.code === toLang)?.isRtl || false;
  const isInputRtl = languagesList.find((lang) => lang.code === fromLang)?.isRtl || false;

  return (
    <div id="translator-view" className="space-y-6 max-w-lg mx-auto pb-6">
      {/* View Header */}
      <div className="text-center pt-2">
        <h2 className="text-2xl font-bold tracking-tight text-white mb-1 flex items-center justify-center gap-1.5 font-display">
          <Globe className="w-6 h-6 text-emerald-500" /> Tradutor Integrado
        </h2>
        <p className="text-xs text-zinc-500">Comunicação sem barreiras de idiomas powered by Gemini AI</p>
      </div>

      {/* Main Translator Widget Container */}
      <div className="bg-zinc-900/80 rounded-2xl p-5 border border-zinc-800/80 box-glow flex flex-col space-y-4">
        {/* Languages Selection Panel */}
        <div className="flex items-center justify-between gap-1 bg-zinc-950 p-1.5 rounded-xl border border-zinc-900">
          {/* FROM SELECT */}
          <div className="flex-1">
            {autoDetect ? (
              <div className="bg-zinc-90 w-full text-xs text-zinc-400 font-medium py-2 px-3 text-left">
                Detecção Automática
              </div>
            ) : (
              <select
                id="select-from-lang"
                value={fromLang}
                onChange={(e) => setFromLang(e.target.value)}
                className="w-full bg-zinc-90 bg-transparent text-xs text-zinc-300 font-semibold p-2 focus:outline-none"
              >
                {languagesList.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* SWAP TOGGLER BUTTON */}
          <button
            id="btn-swap-languages"
            type="button"
            onClick={handleSwapLanguages}
            className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-emerald-500 hover:text-emerald-400 hover:bg-zinc-800 transition"
            title="Trocar Idiomas"
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
          </button>

          {/* TO SELECT */}
          <div className="flex-1">
            <select
              id="select-to-lang"
              value={toLang}
              onChange={(e) => setToLang(e.target.value)}
              className="w-full bg-zinc-90 bg-transparent text-xs text-zinc-300 font-semibold p-2 text-right focus:outline-none"
            >
              {languagesList.map((lang) => (
                <option key={lang.code} value={lang.code} disabled={lang.code === fromLang}>
                  {lang.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Checkbox settings */}
        <div className="flex items-center justify-between px-1">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              id="checkbox-autodetect-lang"
              type="checkbox"
              checked={autoDetect}
              onChange={(e) => setAutoDetect(e.target.checked)}
              className="accent-emerald-500"
            />
            <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400">Deteção automática de idioma</span>
          </label>

          <span className="text-[9px] font-mono text-zinc-500">RTL Auto-Switch ON</span>
        </div>

        {/* Translation processing layout */}
        <form onSubmit={handleTranslate} className="space-y-4">
          {/* Input text box mapping */}
          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Texto Original</label>
            <textarea
              id="input-translate-text"
              required
              rows={4}
              placeholder="Digite o texto de treino ou nutrição para traduzir..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              dir={isInputRtl ? "rtl" : "ltr"}
              className="w-full bg-zinc-950 border border-zinc-850 p-3 rounded-xl text-xs text-white placeholder-zinc-700 font-sans focus:outline-none focus:border-emerald-500 leading-relaxed"
            />
          </div>

          <button
            id="btn-trigger-translation"
            type="submit"
            disabled={isTranslating || !inputText.trim()}
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs py-3.5 rounded-xl transition flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.15)] disabled:opacity-40"
          >
            {isTranslating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-black" /> Traduzindo com IA...
              </>
            ) : (
              <>
                <Languages className="w-4 h-4 text-black" /> TRADUZIR AGORA
              </>
            )}
          </button>
        </form>

        {/* Error warning notification alert prompt */}
        {errorText && (
          <div className="p-3 bg-red-950/40 border border-red-900/60 rounded-xl flex gap-2 text-left">
            <AlertCircle className="w-4.5 h-4.5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-[11px] text-zinc-350">{errorText}</p>
          </div>
        )}

        {/* Output Translated result Container panel */}
        {(outputText || isTranslating) && (
          <div className="space-y-1 pt-2">
            <div className="flex items-center justify-between">
              <label className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Tradução Resultante</label>
              
              {/* Copy / Download tools row */}
              {outputText && (
                <div className="flex space-x-1.5">
                  <button
                    id="btn-copy-translation"
                    onClick={handleCopy}
                    className="p-1 px-2.5 rounded bg-zinc-950 border border-zinc-800 hover:border-emerald-500/40 text-zinc-400 hover:text-emerald-400 text-[10px] font-mono flex items-center gap-1 transition"
                    title="Copiar área de transferência"
                  >
                    <Copy className="w-3 h-3" /> {copied ? "Copiado!" : "Copiar"}
                  </button>

                  <button
                    id="btn-download-translation"
                    onClick={handleDownload}
                    className="p-1 px-2.5 rounded bg-zinc-950 border border-zinc-800 hover:border-emerald-500/40 text-zinc-400 hover:text-emerald-400 text-[10px] font-mono flex items-center gap-1 transition"
                    title="Baixar ficheiro TXT"
                  >
                    <Download className="w-3 h-3" /> Baixar (.txt)
                  </button>
                </div>
              )}
            </div>

            <div 
              id="translation-output-box"
              dir={isOutputRtl ? "rtl" : "ltr"}
              className={`w-full bg-zinc-950/90 border border-zinc-800/80 p-3.5 rounded-xl text-xs text-white leading-relaxed text-left min-h-24 ${
                isTranslating ? "opacity-40 select-none animate-pulse" : ""
              }`}
            >
              {isTranslating ? "Conectando ao Lovable AI (Gemini Flash)..." : outputText}
            </div>
          </div>
        )}
      </div>

      {/* Translation History local cache list */}
      <div className="bg-zinc-900/80 border border-zinc-800/80 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold tracking-wider text-zinc-400 uppercase">
            Histórico Local de Tradução
          </h3>
          {history.length > 0 && (
            <button
              onClick={onClearHistory}
              className="text-[10px] text-zinc-500 hover:text-rose-400 flex items-center gap-1 font-semibold transition"
            >
              <Trash2 className="w-3 h-3" /> Limpar Tudo
            </button>
          )}
        </div>

        {history.length === 0 ? (
          <div className="text-center py-8 border border-dashed border-zinc-850 rounded-xl">
            <FileText className="w-7 h-7 text-zinc-700 mx-auto mb-1.5" />
            <p className="text-[11px] text-zinc-550">Nenhuma tradução efetuada até o momento.</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            <AnimatePresence initial={false}>
              {history.map((h) => {
                const langPair = `${h.fromLang.toUpperCase()} → ${h.toLang.toUpperCase()}`;
                return (
                  <motion.div
                    key={h.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="bg-zinc-950/70 border border-zinc-900 p-2.5 rounded-lg flex items-start justify-between cursor-pointer hover:border-emerald-500/20 group text-left"
                    onClick={() => loadHistoryItem(h)}
                  >
                    <div className="space-y-1 flex-grow pr-3">
                      <div className="flex items-center space-x-1.5">
                        <span className="text-[8px] font-mono font-bold bg-zinc-800 text-zinc-400 px-1 py-0.5 rounded tracking-wide">
                          {langPair}
                        </span>
                        <span className="text-[9px] text-zinc-550">
                          {new Date(h.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      <p className="text-xs text-white truncate max-w-[280px] font-sans font-medium">{h.originText}</p>
                      <p className="text-[10px] text-zinc-400 truncate max-w-[280px] italic">{h.translatedText}</p>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteHistoryItem(h.id);
                      }}
                      className="text-zinc-650 hover:text-red-400 p-1 rounded hover:bg-zinc-900 transition mt-1"
                      title="Excluir item"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
