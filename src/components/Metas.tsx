import React, { useState } from "react";
import { DailyTracking, CustomGoal } from "../types";
import { Target, CheckSquare, Square, Plus, Trash2, ListTodo, Award } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface MetasProps {
  tracking: DailyTracking;
  onToggleMainGoal: (key: keyof Omit<DailyTracking, "customGoals">) => void;
  onAddCustomGoal: (name: string) => void;
  onToggleCustomGoal: (id: string) => void;
  onDeleteCustomGoal: (id: string) => void;
}

export default function Metas({
  tracking,
  onToggleMainGoal,
  onAddCustomGoal,
  onToggleCustomGoal,
  onDeleteCustomGoal,
}: MetasProps) {
  const [newGoalInput, setNewGoalInput] = useState("");

  const handleAddGoalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newGoalInput.trim()) {
      onAddCustomGoal(newGoalInput.trim());
      setNewGoalInput("");
    }
  };

  // Calculate total progress
  const mainGoals = [
    { key: "workoutDone", label: "Realizar Treino do Dia", icon: "💪" },
    { key: "waterDone", label: "Bater Meta de Água (4.4L)", icon: "💧" },
    { key: "caloriesReached", label: "Alcançar Meta de Calorias", icon: "🔥" },
    { key: "photoDone", label: "Tirar Foto de Evolução", icon: "📸" },
    { key: "sleepWell", label: "Dormir 7 a 8 horas", icon: "💤" },
  ];

  const totalMainCount = mainGoals.length;
  const completedMainCount = mainGoals.filter((g) => tracking[g.key as keyof Omit<DailyTracking, "customGoals">]).length;

  const totalCustomCount = tracking.customGoals.length;
  const completedCustomCount = tracking.customGoals.filter((cg) => cg.completed).length;

  const totalAllCount = totalMainCount + totalCustomCount;
  const completedAllCount = completedMainCount + completedCustomCount;

  const percentageAll = totalAllCount > 0 ? (completedAllCount / totalAllCount) * 100 : 0;

  return (
    <div id="metas-view" className="space-y-6 max-w-lg mx-auto pb-6">
      {/* View Header */}
      <div className="text-center pt-2">
        <h2 className="text-2xl font-bold tracking-tight text-white mb-1 flex items-center justify-center gap-1.5 font-display">
          <Target className="w-6 h-6 text-emerald-500" /> Metas de Evolução
        </h2>
        <p className="text-xs text-zinc-500">Mapeie suas metas de consistência física e mental do dia</p>
      </div>

      {/* Gamification Circle Stats */}
      <div className="bg-zinc-900/80 rounded-2xl p-5 border border-zinc-800/80 box-glow flex items-center justify-between gap-4">
        <div className="space-y-1.5 flex-1 text-left">
          <div className="flex items-center gap-1 text-emerald-400">
            <Award className="w-5 h-5 animate-bounce" />
            <h3 className="text-sm font-bold uppercase tracking-wider">Metas Diárias</h3>
          </div>
          <p className="text-zinc-400 text-xs leading-relaxed">
            Seu sucesso é medido pela consistência. Complete hoje para manter sua rotina firme.
          </p>
          <p className="text-emerald-500 font-mono text-xs font-bold pt-1">
            {completedAllCount} de {totalAllCount} tarefas concluídas!
          </p>
        </div>

        {/* Circular Dial progress */}
        <div className="relative w-20 h-20 flex items-center justify-center flex-shrink-0">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="40" stroke="#18181b" strokeWidth="8" fill="transparent" />
            <motion.circle
              cx="50"
              cy="50"
              r="40"
              stroke="#22c55e"
              strokeWidth="8"
              fill="transparent"
              strokeDasharray="251.2"
              initial={{ strokeDashoffset: 251.2 }}
              animate={{ strokeDashoffset: 251.2 - (251.2 * percentageAll) / 100 }}
              transition={{ duration: 1 }}
            />
          </svg>
          <span className="absolute text-sm font-extrabold font-mono text-white">
            {percentageAll.toFixed(0)}%
          </span>
        </div>
      </div>

      {/* Key Base Targets check log */}
      <div className="bg-zinc-900/80 rounded-2xl p-4 border border-zinc-850">
        <h3 className="text-xs font-bold tracking-wider text-zinc-400 uppercase mb-3.5 flex items-center gap-1">
          <CheckSquare className="w-4 h-4 text-emerald-500" /> Metas Principais de Consistência
        </h3>

        <div className="space-y-2">
          {mainGoals.map((goal) => {
            const isCompleted = tracking[goal.key as keyof Omit<DailyTracking, "customGoals">] as boolean;
            return (
              <div
                key={goal.key}
                onClick={() => onToggleMainGoal(goal.key as keyof Omit<DailyTracking, "customGoals">)}
                className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer select-none transition ${
                  isCompleted
                    ? "bg-emerald-500/5 border-emerald-500/25 hover:bg-emerald-500/10 text-white"
                    : "bg-zinc-950/60 border-zinc-900 hover:border-zinc-800 text-zinc-300"
                }`}
              >
                <div className="flex items-center space-x-3 text-left">
                  <span className="text-lg">{goal.icon}</span>
                  <span className={`text-xs font-medium ${isCompleted ? "line-through text-zinc-550" : ""}`}>
                    {goal.label}
                  </span>
                </div>

                <div className="text-emerald-500 font-bold">
                  {isCompleted ? (
                    <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }}>
                      <CheckSquare className="w-5 h-5 text-emerald-500" />
                    </motion.div>
                  ) : (
                    <Square className="w-5 h-5 text-zinc-700" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Custom Workout Targets check list panel */}
      <div className="bg-zinc-900/85 rounded-2xl p-4 border border-zinc-850">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-bold tracking-wider text-zinc-400 uppercase flex items-center gap-1">
            <ListTodo className="w-4 h-4 text-emerald-500" /> Metas Personalizadas do Treino
          </h3>
          <span className="text-[10px] bg-zinc-800 text-zinc-500 px-2 py-0.5 rounded font-mono">
            LOGS ({completedCustomCount}/{totalCustomCount})
          </span>
        </div>

        {/* Add custom goal form input */}
        <form onSubmit={handleAddGoalSubmit} className="flex gap-2 mb-4">
          <input
            type="text"
            required
            placeholder="Ex: Treino de Panturrilha, Estudar Dieta..."
            value={newGoalInput}
            onChange={(e) => setNewGoalInput(e.target.value)}
            className="flex-grow bg-zinc-950 border border-zinc-800 text-xs rounded-xl p-3 text-white placeholder-zinc-700 focus:outline-none focus:border-emerald-500"
          />
          <button
            type="submit"
            className="bg-emerald-500 hover:bg-emerald-400 text-black p-3.5 rounded-xl transition"
            title="Criar customizado"
          >
            <Plus className="w-4 h-4" />
          </button>
        </form>

        {tracking.customGoals.length === 0 ? (
          <div className="text-center py-6 border border-dashed border-zinc-850 rounded-xl">
            <p className="text-xs text-zinc-550">Sem metas personalizadas para hoje.</p>
          </div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence initial={false}>
              {tracking.customGoals.map((cg) => (
                <motion.div
                  key={cg.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="flex items-center justify-between p-3.5 bg-zinc-950/60 border border-zinc-900 rounded-xl"
                >
                  <div 
                    onClick={() => onToggleCustomGoal(cg.id)}
                    className="flex items-center space-x-3 cursor-pointer select-none flex-grow text-left"
                  >
                    <div>
                      {cg.completed ? (
                        <CheckSquare className="w-4.5 h-4.5 text-emerald-500" />
                      ) : (
                        <Square className="w-4.5 h-4.5 text-zinc-750" />
                      )}
                    </div>
                    <span className={`text-xs ${cg.completed ? "line-through text-zinc-550 italic" : "text-white"}`}>
                      {cg.name}
                    </span>
                  </div>

                  <button
                    onClick={() => onDeleteCustomGoal(cg.id)}
                    className="text-zinc-600 hover:text-rose-500 p-1.5 rounded transition"
                    title="Excluir"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
