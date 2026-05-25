import React, { useRef } from "react";
import { UserProfile, WaterLog, CalorieLog, ProgressPhoto, DailyTracking } from "../types";
import { FileText, Printer, Calendar, Scale, Droplet, Flame, Sparkles } from "lucide-react";
import { motion } from "motion/react";

interface PDFExporterProps {
  profile: UserProfile;
  waterLogs: WaterLog[];
  calorieLogs: CalorieLog[];
  photos: ProgressPhoto[];
  tracking: DailyTracking;
}

export default function PDFExporter({
  profile,
  waterLogs,
  calorieLogs,
  photos,
  tracking,
}: PDFExporterProps) {
  const printAreaRef = useRef<HTMLDivElement | null>(null);

  // Group calorie logs by day
  const getLogsSum = () => {
    const consumed = calorieLogs.filter((l) => l.type === "consumed").reduce((acc, c) => acc + c.amount, 0);
    const burned = calorieLogs.filter((l) => l.type === "burned").reduce((acc, c) => acc + c.amount, 0);
    return { consumed, burned };
  };

  const handlePrint = () => {
    // Generate specialized stylesheet for printing or trigger window.print directly
    // This is clean and matches native device setups
    window.print();
  };

  const sums = getLogsSum();
  const todayStr = new Date().toLocaleDateString("pt-br");

  // Calculate IMC
  const imc = profile.height > 0 ? (profile.weight / (profile.height * profile.height)) : 0;
  
  let imcStatus = "Normal";
  if (imc < 18.5) imcStatus = "Abaixo do peso";
  else if (imc < 25) imcStatus = "Normal";
  else if (imc < 30) imcStatus = "Sobrepeso";
  else imcStatus = "Obesidade";

  return (
    <div id="pdf-view" className="space-y-6 max-w-lg mx-auto pb-6">
      {/* View Header */}
      <div className="text-center pt-2 print:hidden">
        <h2 className="text-2xl font-bold tracking-tight text-white mb-1 flex items-center justify-center gap-1.5 font-display">
          <FileText className="w-6 h-6 text-emerald-500" /> Relatório de Evolução
        </h2>
        <p className="text-xs text-zinc-500">Exporte ou imprima suas métricas de treino compiladas em PDF</p>
      </div>

      {/* Launcher print action block */}
      <div className="bg-zinc-900/80 rounded-2xl p-5 border border-zinc-800/80 box-glow text-left print:hidden">
        <h3 className="text-white text-sm font-bold mb-1.5 flex items-center gap-1.5">
          <Sparkles className="w-4.5 h-4.5 text-emerald-500 animate-pulse" /> Relatório Consistente
        </h3>
        <p className="text-xs text-zinc-400 leading-relaxed mb-4">
          Gere um documento formatado pronto para enviar ao seu treinador, nutricionista ou arquivar pessoalmente. O documento inclui histórico de água, ingestão calórica diária, dados biométricos de peso e diário estético de fotos.
        </p>

        <button
          id="btn-print-pdf-report"
          onClick={handlePrint}
          className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs py-3.5 rounded-xl transition flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.15)]"
        >
          <Printer className="w-4 h-4 text-black" /> GERAR & GERENCIAR PDF (IMPRIMIR)
        </button>
      </div>

      {/* The Printable Visual Document Area */}
      <div 
        id="printable-report-area" 
        ref={printAreaRef}
        className="bg-zinc-900/40 p-5 sm:p-6 rounded-2xl border border-zinc-850 space-y-6 print:bg-white print:text-black print:border-none print:shadow-none text-left"
      >
        {/* Document Header Logo */}
        <div className="border-b border-zinc-800 pb-4 flex justify-between items-center print:border-zinc-300">
          <div>
            <h1 className="text-lg font-bold uppercase tracking-widest font-display text-white print:text-black leading-none">
              Next Fitness <span className="text-emerald-500 print:text-emerald-600">Co.</span>
            </h1>
            <p className="text-[10px] text-zinc-500 print:text-zinc-500 mt-1 uppercase font-mono tracking-wide">
              Métricas Oficiais de Treinamento
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-mono font-semibold text-emerald-400 print:text-emerald-600">PDF REPORT ID: #NFT-2026</p>
            <p className="text-[9px] text-zinc-500 mt-0.5 font-mono">{todayStr}</p>
          </div>
        </div>

        {/* Biometrics Card */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-zinc-950/60 p-3.5 rounded-xl border border-zinc-900 print:bg-zinc-100 print:border-zinc-200">
            <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2 flex items-center gap-1 font-mono">
              <Scale className="w-3.5 h-3.5 text-emerald-500" /> Biometria Corporal
            </h4>
            <div className="space-y-1.5 text-xs text-zinc-300 print:text-black">
              <p>Membro: <strong className="text-white print:text-black">{profile.name}</strong></p>
              <p>Peso Atual: <strong>{profile.weight} kg</strong></p>
              <p>Meta Foco: <strong>{profile.weightGoal} kg</strong></p>
              <p>Altura: <strong>{profile.height} m</strong></p>
            </div>
          </div>

          <div className="bg-zinc-950/60 p-3.5 rounded-xl border border-zinc-900 print:bg-zinc-100 print:border-zinc-200">
            <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2 flex items-center gap-1 font-mono">
              <Flame className="w-3.5 h-3.5 text-emerald-500" /> Balanço do Dia
            </h4>
            <div className="space-y-1.5 text-xs text-zinc-300 print:text-black">
              <p>IMC Alcançado: <strong className="text-white print:text-black">{imc.toFixed(2)} ({imcStatus})</strong></p>
              <p>Calorias Alimento: <strong className="text-emerald-400 print:text-emerald-600">{sums.consumed} kcal</strong></p>
              <p>Calorias Gastas: <strong className="text-amber-500 print:text-amber-600">{sums.burned} kcal</strong></p>
              <p>Água Acumulada: <strong>{(waterLogs.reduce((sum, l) => sum + l.amount, 0) / 1000).toFixed(2)} Litros</strong></p>
            </div>
          </div>
        </div>

        {/* Daily Checklist Tracker Logs */}
        <div className="bg-zinc-950/60 p-4 rounded-xl border border-zinc-900 print:bg-zinc-100 print:border-zinc-300 space-y-3">
          <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1 font-mono">
            <Calendar className="w-3.5 h-3.5 text-emerald-500" /> Metas Concluídas Hoje
          </h4>
          <div className="grid grid-cols-2 gap-2 text-[11px] text-zinc-400 print:text-black font-medium">
            <div className="flex items-center gap-1.5">
              <span>{tracking.workoutDone ? "✅" : "❌"}</span> Treino Realizado
            </div>
            <div className="flex items-center gap-1.5">
              <span>{tracking.waterDone ? "✅" : "❌"}</span> Água Batida (4.4L)
            </div>
            <div className="flex items-center gap-1.5">
              <span>{tracking.caloriesReached ? "✅" : "❌"}</span> Meta Calórica Regular
            </div>
            <div className="flex items-center gap-1.5">
              <span>{tracking.photoDone ? "✅" : "❌"}</span> Diário Fotográfico Feito
            </div>
            <div className="flex items-center gap-1.5">
              <span>{tracking.sleepWell ? "✅" : "❌"}</span> Sono Consistente
            </div>
          </div>
        </div>

        {/* History Tables Water */}
        {waterLogs.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-[10px] uppercase tracking-wider text-zinc-450 font-bold flex items-center gap-1 font-mono">
              <Droplet className="w-3.5 h-3.5 text-emerald-500" /> Histórico logs de Hidratação
            </h4>
            <div className="border border-zinc-800 rounded-lg overflow-hidden print:border-zinc-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-950 text-zinc-500 uppercase text-[9px] font-mono print:bg-zinc-200 print:text-black">
                  <tr>
                    <th className="p-2.5">Horário</th>
                    <th className="p-2.5 text-right">Volume (mL)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800 print:divide-zinc-200">
                  {waterLogs.slice(0, 5).map((log) => {
                    const lDate = new Date(log.timestamp);
                    return (
                      <tr key={log.id} className="text-zinc-350 print:text-black">
                        <td className="p-2">
                          {lDate.toLocaleDateString("pt-br")} {lDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </td>
                        <td className="p-2 text-right font-mono font-semibold">{log.amount} mL</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {waterLogs.length > 5 && <p className="text-[9px] text-zinc-600 italic">Mais {waterLogs.length - 5} logs ocultados no PDF resumido.</p>}
          </div>
        )}

        {/* History Tables Calories */}
        {calorieLogs.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-[10px] uppercase tracking-wider text-zinc-450 font-bold flex items-center gap-1 font-mono">
              <Flame className="w-3.5 h-3.5 text-emerald-500" /> Histórico logs Energéticos
            </h4>
            <div className="border border-zinc-800 rounded-lg overflow-hidden print:border-zinc-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-950 text-zinc-500 uppercase text-[9px] font-mono print:bg-zinc-200 print:text-black">
                  <tr>
                    <th className="p-2.5">Log</th>
                    <th className="p-2.5">Descrição</th>
                    <th className="p-2.5 text-right">Calorias (kcal)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800 print:divide-zinc-200">
                  {calorieLogs.slice(0, 5).map((log) => (
                    <tr key={log.id} className="text-zinc-350 print:text-black">
                      <td className="p-2 capitalize">
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold ${log.type === "consumed" ? "bg-emerald-500/10 text-emerald-400 print:text-emerald-700" : "bg-amber-500/10 text-amber-500 print:text-amber-700"}`}>
                          {log.type === "consumed" ? "Alimento" : "Queimado"}
                        </span>
                      </td>
                      <td className="p-2 text-zinc-400 print:text-zinc-700">{log.description}</td>
                      <td className="p-2 text-right font-semibold font-mono">
                        {log.type === "consumed" ? "+" : "-"}{log.amount} kcal
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {calorieLogs.length > 5 && <p className="text-[9px] text-zinc-600 italic">Mais {calorieLogs.length - 5} logs calóricos salvos.</p>}
          </div>
        )}

        {/* Photos History Row in print */}
        {photos.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-[10px] uppercase tracking-wider text-zinc-450 font-bold flex items-center gap-1 font-mono">
              📸 Diário Estético de Evolução (Foto de Progresso)
            </h4>
            <div className="grid grid-cols-3 gap-2">
              {photos.slice(0, 3).map((p, i) => (
                <div key={p.id} className="border border-zinc-850 rounded-lg overflow-hidden bg-zinc-950/60 print:border-zinc-300">
                  <div className="aspect-video bg-black">
                    <img src={p.imageUrl} alt="Progress log" className="w-full h-full object-cover" />
                  </div>
                  <p className="text-[8px] p-1.5 font-mono text-zinc-500 print:text-black">
                    {new Date(p.timestamp).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Doctor recommendation footer text */}
        <div className="border-t border-zinc-850 pt-3.5 text-center text-[9px] text-zinc-600 print:text-zinc-500 print:border-zinc-300">
          <p>Next Fitness Co - Tecnologia voltada à saúde integrada e hipertrofia.</p>
          <p className="mt-0.5">Nota: Relatório automatizado gerado por IA para controle assistido das metas diárias de Dark Takemi.</p>
        </div>
      </div>
    </div>
  );
}
