import React, { useState } from "react";
import { UserProfile } from "../types";
import { Settings, User, Scale, Flame, Droplet, RefreshCw, Sparkles, CheckCircle2 } from "lucide-react";
import { motion } from "motion/react";

interface AdminPanelProps {
  profile: UserProfile;
  onUpdateProfile: (updated: Partial<UserProfile>) => void;
  onSeedData: () => void;
  onResetApp: () => void;
}

export default function AdminPanel({
  profile,
  onUpdateProfile,
  onSeedData,
  onResetApp,
}: AdminPanelProps) {
  const [name, setName] = useState(profile.name);
  const [weight, setWeight] = useState(profile.weight.toString());
  const [weightGoal, setWeightGoal] = useState(profile.weightGoal.toString());
  const [height, setHeight] = useState(profile.height.toString());
  const [calorieGoal, setCalorieGoal] = useState(profile.calorieGoal.toString());
  const [waterGoal, setWaterGoal] = useState(profile.waterGoal.toString());
  
  const [successMsg, setSuccessMsg] = useState("");

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: Partial<UserProfile> = {
      name: name.trim(),
      weight: parseFloat(weight) || profile.weight,
      weightGoal: parseFloat(weightGoal) || profile.weightGoal,
      height: parseFloat(height) || profile.height,
      calorieGoal: parseInt(calorieGoal) || profile.calorieGoal,
      waterGoal: parseFloat(waterGoal) || profile.waterGoal,
    };

    onUpdateProfile(updated);
    setSuccessMsg("Configurações atualizadas com sucesso!");
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  const triggerSeed = () => {
    onSeedData();
    setSuccessMsg("Massa de testes gerada com sucesso! Gráficos e histórico populados.");
    setTimeout(() => setSuccessMsg(""), 4000);
  };

  const triggerReset = () => {
    if (confirm("Tem certeza que deseja redefinir o aplicativo? Isso apagará todas as fotos e logs permanentemente.")) {
      onResetApp();
      setSuccessMsg("Aplicativo redefinido aos padrões originais.");
      setTimeout(() => window.location.reload(), 1500);
    }
  };

  return (
    <div id="admin-view" className="space-y-6 max-w-lg mx-auto pb-6">
      {/* View Header */}
      <div className="text-center pt-2">
        <h2 className="text-2xl font-bold tracking-tight text-white mb-1 flex items-center justify-center gap-1.5 font-display">
          <Settings className="w-6 h-6 text-emerald-500 animate-spin-slow" /> Painel de Controle (Admin)
        </h2>
        <p className="text-xs text-zinc-500 font-mono text-center">Calibração de sensores e reajuste biométrico</p>
      </div>

      {successMsg && (
        <div className="p-3.5 bg-emerald-950/40 border border-emerald-900/60 rounded-xl flex gap-2 text-left">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-emerald-400 font-medium">{successMsg}</p>
        </div>
      )}

      {/* Profile modification Form */}
      <div className="bg-zinc-900/80 rounded-2xl p-5 border border-zinc-800/80 box-glow text-left">
        <h3 className="text-white text-sm font-semibold mb-4 flex items-center gap-2">
          <User className="w-4.5 h-4.5 text-emerald-500" /> Parâmetros Biométricos do Membro
        </h3>

        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="text-[10px] uppercase font-bold tracking-wider text-zinc-500 block mb-1">Nome do Membro</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-850 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold tracking-wider text-zinc-500 block mb-1">Peso Atual (kg)</label>
              <input
                type="number"
                step="0.1"
                required
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-850 rounded-lg p-2.5 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold tracking-wider text-zinc-500 block mb-1">Meta peso (kg)</label>
              <input
                type="number"
                step="0.1"
                required
                value={weightGoal}
                onChange={(e) => setWeightGoal(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-850 rounded-lg p-2.5 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold tracking-wider text-zinc-500 block mb-1">Altura (m)</label>
              <input
                type="number"
                step="0.01"
                required
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                placeholder="Ex: 1.75"
                className="w-full bg-zinc-950 border border-zinc-850 rounded-lg p-2.5 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold tracking-wider text-zinc-500 block mb-1">Meta Calorias (kcal)</label>
              <input
                type="number"
                required
                value={calorieGoal}
                onChange={(e) => setCalorieGoal(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-850 rounded-lg p-2.5 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="col-span-2">
              <label className="text-[10px] uppercase font-bold tracking-wider text-zinc-500 block mb-1">Meta Hidratação (L)</label>
              <input
                type="number"
                step="0.1"
                required
                value={waterGoal}
                onChange={(e) => setWaterGoal(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-850 rounded-lg p-2.5 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs py-3 rounded-lg transition mt-2"
          >
            SALVAR PARÂMETROS
          </button>
        </form>
      </div>

      {/* Seeding & Testing Operations */}
      <div className="bg-zinc-900/80 rounded-2xl p-5 border border-zinc-800/80 box-glow text-left space-y-4">
        <h3 className="text-white text-sm font-semibold flex items-center gap-2">
          <Sparkles className="w-4.5 h-4.5 text-emerald-500" /> Operações de Teste e Calibração
        </h3>

        <div className="space-y-2.5">
          {/* Seeding Trigger */}
          <div className="bg-zinc-950/60 p-3 rounded-lg border border-zinc-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold text-white">Massa de Testes (Simulador)</p>
              <p className="text-[10px] text-zinc-500 mt-0.5 max-w-xs">Gera logs inteligentes nos últimos 7 dias para visualização imediata de gráficos polidos no dashboard principal.</p>
            </div>
            <button
              onClick={triggerSeed}
              className="bg-zinc-800 hover:bg-zinc-700 text-emerald-400 text-xs font-semibold px-3.5 py-2 rounded-lg flex items-center gap-1 transition flex-shrink-0"
            >
              <RefreshCw className="w-3.5 h-3.5 animate-spin-slow" /> Seed Logs
            </button>
          </div>

          {/* Reset button */}
          <div className="bg-zinc-950/60 p-3 rounded-lg border border-zinc-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold text-rose-450">Redefinição Absoluta</p>
              <p className="text-[10px] text-zinc-500 mt-0.5 max-w-xs">Apaga todos os diários de evolução de fotos de progresso, bancos de hidratação local, metas e inicia do zero.</p>
            </div>
            <button
              onClick={triggerReset}
              className="bg-rose-950/20 hover:bg-rose-950/30 text-rose-500 hover:text-rose-400 text-xs font-bold px-3.5 py-2 rounded-lg transition flex-shrink-0"
            >
              Limpar LocalStorage
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
