import React, { useState } from "react";
import { WaterLog, UserProfile } from "../types";
import { Droplet, Plus, Trash2, ShieldAlert, Coffee, Milk } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface WaterTrackerProps {
  profile: UserProfile;
  waterLogs: WaterLog[];
  onAddWater: (amount: number) => void;
  onDeleteWaterLog: (id: string) => void;
}

export default function WaterTracker({
  profile,
  waterLogs,
  onAddWater,
  onDeleteWaterLog,
}: WaterTrackerProps) {
  const [customInput, setCustomInput] = useState("");

  const todayStr = new Date().toISOString().split("T")[0];
  const todayLogs = waterLogs
    .filter((log) => log.timestamp.startsWith(todayStr))
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const totalMel = todayLogs.reduce((acc, curr) => acc + curr.amount, 0);
  const goalMl = profile.waterGoal * 1000;
  const percentage = Math.min((totalMel / goalMl) * 100, 100);

  // Status message
  let statusText = "Desidratado";
  let statusColor = "text-amber-500";
  if (percentage >= 100) {
    statusText = "Hidratação Máxima!";
    statusColor = "text-emerald-400";
  } else if (percentage >= 70) {
    statusText = "Excelente nível de água";
    statusColor = "text-indigo-400";
  } else if (percentage >= 35) {
    statusText = "Nível regular de hidratação";
    statusColor = "text-sky-400";
  }

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amnt = parseInt(customInput);
    if (!isNaN(amnt) && amnt > 0) {
      onAddWater(amnt);
      setCustomInput("");
    }
  };

  return (
    <div id="water-view" className="space-y-6 max-w-lg mx-auto pb-6">
      {/* View Header */}
      <div className="text-center pt-2">
        <h2 className="text-2xl font-bold tracking-tight text-white mb-1 flex items-center justify-center gap-1.5 font-display">
          <Droplet className="w-6 h-6 text-emerald-500" /> Hidratação Diária
        </h2>
        <p className="text-xs text-zinc-500">Mantenha seu corpo em perfeito funcionamento para o treino</p>
      </div>

      {/* Visual Cup/Bottle Animator */}
      <div className="bg-zinc-900/80 rounded-2xl p-6 border border-zinc-800/80 box-glow flex flex-col items-center relative overflow-hidden">
        {/* Dynamic Water Flask Representation */}
        <div className="relative w-44 h-64 border-4 border-zinc-800 rounded-b-3xl rounded-t-lg bg-zinc-950/80 overflow-hidden flex flex-col justify-end shadow-2xl">
          {/* Water level height animator */}
          <motion.div 
            id="water-interior-level"
            initial={{ height: 0 }}
            animate={{ height: `${percentage}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-emerald-600/60 to-emerald-400/50 shadow-[0_0_15px_rgba(52,211,153,0.4)] flex items-center justify-center"
          >
            {/* Water Wave Animations */}
            <div className="absolute top-0 left-[-50%] right-[-50%] h-4 bg-emerald-300/40 rounded-[40%] animate-spin duration-10000" />
            <div className="absolute top-0 left-[-40%] right-[-40%] h-3.5 bg-emerald-400/20 rounded-[45%] animate-spin duration-7000" />
          </motion.div>

          {/* Value Labels overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10 select-none">
            <span className="text-4xl font-extrabold font-mono text-white tracking-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
              {percentage.toFixed(0)}%
            </span>
            <span className="text-xs text-emerald-300 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] mt-1 font-mono">
              {(totalMel / 1000).toFixed(2)}L de {(goalMl / 1000).toFixed(1)}L
            </span>
          </div>
        </div>

        {/* Dynamic Status Display */}
        <div className="text-center mt-5">
          <p className="text-xs text-zinc-500">Status atual:</p>
          <p className={`text-sm font-semibold tracking-wide ${statusColor} mt-0.5`}>
            {statusText}
          </p>
        </div>
      </div>

      {/* Logging Shortcuts Grid */}
      <div className="grid grid-cols-4 gap-2">
        <button
          onClick={() => onAddWater(150)}
          className="bg-zinc-900 border border-zinc-800 hover:border-emerald-500/40 rounded-xl py-3 flex flex-col items-center text-zinc-300 hover:text-emerald-400 transition"
        >
          <Coffee className="w-5 h-5 mb-1" />
          <span className="text-[10px] font-mono">150 ml</span>
          <span className="text-[8px] text-zinc-500">Copo pequeno</span>
        </button>

        <button
          onClick={() => onAddWater(250)}
          className="bg-zinc-900 border border-zinc-800 hover:border-emerald-500/40 rounded-xl py-3 flex flex-col items-center text-zinc-300 hover:text-emerald-400 transition"
        >
          <Droplet className="w-5 h-5 mb-1 text-emerald-500" />
          <span className="text-[10px] font-mono">250 ml</span>
          <span className="text-[8px] text-zinc-500">Copo Padrão</span>
        </button>

        <button
          onClick={() => onAddWater(500)}
          className="bg-zinc-900 border border-zinc-800 hover:border-emerald-500/40 rounded-xl py-3 flex flex-col items-center text-zinc-300 hover:text-emerald-400 transition"
        >
          <Milk className="w-5 h-5 mb-1" />
          <span className="text-[10px] font-mono">500 ml</span>
          <span className="text-[8px] text-zinc-500">Garrafa Peq</span>
        </button>

        <button
          onClick={() => onAddWater(1000)}
          className="bg-zinc-900 border border-zinc-800 hover:border-emerald-500/40 rounded-xl py-3 flex flex-col items-center text-zinc-300 hover:text-emerald-400 transition"
        >
          <Droplet className="w-5 h-5 mb-1 text-emerald-400 animate-bounce" />
          <span className="text-[10px] font-mono font-bold">1.0 L</span>
          <span className="text-[8px] text-zinc-500">Garrafa Gde</span>
        </button>
      </div>

      {/* Manual Input Panel */}
      <div className="bg-zinc-900/60 rounded-xl p-4 border border-zinc-800/85">
        <form onSubmit={handleCustomSubmit} className="flex gap-2">
          <input
            type="number"
            min="1"
            max="5000"
            required
            placeholder="Registro Personalizado (mL)"
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            className="flex-grow bg-zinc-950 border border-zinc-800 text-xs rounded-lg p-3 text-white placeholder-zinc-650 focus:outline-none focus:border-emerald-500"
          />
          <button
            type="submit"
            className="bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs rounded-lg px-5 flex items-center gap-1 transition"
          >
            <Plus className="w-4 h-4" /> Adicionar
          </button>
        </form>
      </div>

      {/* Registry Log History Card List */}
      <div className="bg-zinc-900/80 rounded-2xl p-4 border border-zinc-800/80">
        <h3 className="text-xs font-semibold tracking-wider text-zinc-400 uppercase mb-3">
          Histórico de Ingestão (Hoje)
        </h3>

        {todayLogs.length === 0 ? (
          <div className="text-center py-6 border border-dashed border-zinc-800 rounded-xl">
            <ShieldAlert className="w-7 h-7 text-zinc-600 mx-auto mb-2" />
            <p className="text-xs text-zinc-500">Nenhum copo de água registrado hoje.</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            <AnimatePresence initial={false}>
              {todayLogs.map((log) => {
                const timeStr = new Date(log.timestamp).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                });
                return (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="flex items-center justify-between bg-zinc-950/60 border border-zinc-800/50 p-2.5 rounded-lg"
                  >
                    <div className="flex items-center space-x-2.5">
                      <div className="w-7 h-7 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-400">
                        <Droplet className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-white font-mono">{log.amount} mL</p>
                        <p className="text-[10px] text-zinc-500">{timeStr}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => onDeleteWaterLog(log.id)}
                      className="text-zinc-500 hover:text-rose-500 p-1.5 rounded-lg hover:bg-zinc-800 transition"
                      title="Excluir entrada"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
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
