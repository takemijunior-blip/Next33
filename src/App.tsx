import React, { useState, useEffect } from "react";
import { 
  UserProfile, 
  WaterLog, 
  CalorieLog, 
  ProgressPhoto, 
  CoachMessage, 
  DailyTracking, 
  TranslationHistory, 
  ActiveTab 
} from "./types";
import Dashboard from "./components/Dashboard";
import WaterTracker from "./components/WaterTracker";
import ProgressPhotos from "./components/ProgressPhotos";
import AICoach from "./components/AICoach";
import Translator from "./components/Translator";
import Metas from "./components/Metas";
import PDFExporter from "./components/PDFExporter";
import AdminPanel from "./components/AdminPanel";
import { 
  Home, 
  Droplet, 
  Camera, 
  Dumbbell, 
  Globe, 
  Target, 
  FileText, 
  Settings, 
  Download,
  AlertCircle,
  Menu,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

// Default seed structures
const DEFAULT_PROFILE: UserProfile = {
  name: "Dark Takemi",
  weight: 125,
  weightGoal: 78,
  height: 1.75,
  calorieGoal: 1278,
  waterGoal: 4.4,
};

const DEFAULT_TRACKING: DailyTracking = {
  workoutDone: false,
  waterDone: false,
  caloriesReached: false,
  photoDone: false,
  sleepWell: false,
  customGoals: []
};

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("inicio");
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [waterLogs, setWaterLogs] = useState<WaterLog[]>([]);
  const [calorieLogs, setCalorieLogs] = useState<CalorieLog[]>([]);
  const [photos, setPhotos] = useState<ProgressPhoto[]>([]);
  const [coachMessages, setCoachMessages] = useState<CoachMessage[]>([]);
  const [tracking, setTracking] = useState<DailyTracking>(DEFAULT_TRACKING);
  const [translations, setTranslations] = useState<TranslationHistory[]>([]);
  const [showPwaPrompt, setShowPwaPrompt] = useState(false);

  // Initialize and load everything from LocalStorage
  useEffect(() => {
    try {
      const storedProfile = localStorage.getItem("next_profile");
      if (storedProfile) setProfile(JSON.parse(storedProfile));

      const storedWater = localStorage.getItem("next_water");
      if (storedWater) setWaterLogs(JSON.parse(storedWater));

      const storedCalories = localStorage.getItem("next_calories");
      if (storedCalories) setCalorieLogs(JSON.parse(storedCalories));

      const storedPhotos = localStorage.getItem("next_photos");
      if (storedPhotos) setPhotos(JSON.parse(storedPhotos));

      const storedCoach = localStorage.getItem("next_coach");
      if (storedCoach) setCoachMessages(JSON.parse(storedCoach));

      const storedTracking = localStorage.getItem("next_tracking");
      if (storedTracking) setTracking(JSON.parse(storedTracking));

      const storedTranslations = localStorage.getItem("next_translations");
      if (storedTranslations) setTranslations(JSON.parse(storedTranslations));
    } catch (e) {
      console.error("Error loading LocalStorage settings", e);
    }
  }, []);

  // Set default values for initial visual similarity if states are empty
  useEffect(() => {
    if (calorieLogs.length === 0 && waterLogs.length === 0) {
      // Direct mock seed values for aesthetics matching first experience!
      handleSeedData();
    }
  }, []);

  // Sync to local storage on changes
  const saveProfile = (p: UserProfile) => {
    setProfile(p);
    localStorage.setItem("next_profile", JSON.stringify(p));
  };

  const handleUpdateProfile = (updated: Partial<UserProfile>) => {
    const next = { ...profile, ...updated };
    saveProfile(next);
  };

  const handleAddWater = (amountDecimal: number) => {
    const todayStr = new Date().toISOString().split("T")[0];
    const newLog: WaterLog = {
      id: crypto.randomUUID(),
      amount: amountDecimal,
      timestamp: new Date().toISOString(),
    };
    const updated = [newLog, ...waterLogs];
    setWaterLogs(updated);
    localStorage.setItem("next_water", JSON.stringify(updated));

    // Check waterDone in tracking if goal reached
    const sumToday = updated
      .filter((l) => l.timestamp.startsWith(todayStr))
      .reduce((sum, l) => sum + l.amount, 0);

    if (sumToday >= profile.waterGoal * 1000) {
      handleToggleMainGoalSilent("waterDone", true);
    } else {
      handleToggleMainGoalSilent("waterDone", false);
    }
  };

  const handleDeleteWaterLog = (id: string) => {
    const updated = waterLogs.filter((log) => log.id !== id);
    setWaterLogs(updated);
    localStorage.setItem("next_water", JSON.stringify(updated));

    // Recheck waterDone
    const todayStr = new Date().toISOString().split("T")[0];
    const sumToday = updated
      .filter((l) => l.timestamp.startsWith(todayStr))
      .reduce((sum, l) => sum + l.amount, 0);

    if (sumToday >= profile.waterGoal * 1000) {
      handleToggleMainGoalSilent("waterDone", true);
    } else {
      handleToggleMainGoalSilent("waterDone", false);
    }
  };

  const handleAddCalorie = (amount: number, type: "consumed" | "burned", description: string) => {
    const todayStr = new Date().toISOString().split("T")[0];
    const newLog: CalorieLog = {
      id: crypto.randomUUID(),
      amount,
      type,
      description,
      timestamp: new Date().toISOString(),
    };
    const updated = [newLog, ...calorieLogs];
    setCalorieLogs(updated);
    localStorage.setItem("next_calories", JSON.stringify(updated));

    // Recheck caloriesReached in tracking
    const sumConsumed = updated
      .filter((l) => l.timestamp.startsWith(todayStr) && l.type === "consumed")
      .reduce((sum, l) => sum + l.amount, 0);

    if (sumConsumed >= profile.calorieGoal) {
      handleToggleMainGoalSilent("caloriesReached", true);
    } else {
      handleToggleMainGoalSilent("caloriesReached", false);
    }
  };

  const handleUpdateWeight = (weight: number) => {
    handleUpdateProfile({ weight });
  };

  const handleAddPhoto = (imageUrl: string, note?: string) => {
    const newPhoto: ProgressPhoto = {
      id: crypto.randomUUID(),
      imageUrl,
      timestamp: new Date().toISOString(),
      note,
    };
    const updated = [newPhoto, ...photos];
    setPhotos(updated);
    localStorage.setItem("next_photos", JSON.stringify(updated));

    handleToggleMainGoalSilent("photoDone", true);
  };

  const handleDeletePhoto = (id: string) => {
    const updated = photos.filter((p) => p.id !== id);
    setPhotos(updated);
    localStorage.setItem("next_photos", JSON.stringify(updated));
  };

  // Metas operations
  const handleToggleMainGoal = (key: keyof Omit<DailyTracking, "customGoals">) => {
    const nextTracking = {
      ...tracking,
      [key]: !tracking[key]
    };
    setTracking(nextTracking);
    localStorage.setItem("next_tracking", JSON.stringify(nextTracking));
  };

  const handleToggleMainGoalSilent = (key: keyof Omit<DailyTracking, "customGoals">, val: boolean) => {
    setTracking((prev) => {
      const nextTracking = { ...prev, [key]: val };
      localStorage.setItem("next_tracking", JSON.stringify(nextTracking));
      return nextTracking;
    });
  };

  const handleAddCustomGoal = (name: string) => {
    const newCustom: any = {
      id: crypto.randomUUID(),
      name,
      completed: false,
    };
    const nextTracking = {
      ...tracking,
      customGoals: [...tracking.customGoals, newCustom]
    };
    setTracking(nextTracking);
    localStorage.setItem("next_tracking", JSON.stringify(nextTracking));
  };

  const handleToggleCustomGoal = (id: string) => {
    const nextCustom = tracking.customGoals.map((cg) => 
      cg.id === id ? { ...cg, completed: !cg.completed } : cg
    );
    const nextTracking = {
      ...tracking,
      customGoals: nextCustom
    };
    setTracking(nextTracking);
    localStorage.setItem("next_tracking", JSON.stringify(nextTracking));
  };

  const handleDeleteCustomGoal = (id: string) => {
    const nextCustom = tracking.customGoals.filter((cg) => cg.id !== id);
    const nextTracking = {
      ...tracking,
      customGoals: nextCustom
    };
    setTracking(nextTracking);
    localStorage.setItem("next_tracking", JSON.stringify(nextTracking));
  };

  // Integration with our server Express backend
  const handleSendMessage = async (text: string) => {
    const userMsg: CoachMessage = {
      id: crypto.randomUUID(),
      text,
      sender: "user",
      timestamp: new Date().toISOString(),
    };

    const tempMessages = [...coachMessages, userMsg];
    setCoachMessages(tempMessages);
    localStorage.setItem("next_coach", JSON.stringify(tempMessages));

    try {
      // IMC calculations
      const imc = profile.height > 0 ? (profile.weight / (profile.height * profile.height)) : 0;
      let bmiStatus = "Obesidade";
      if (imc < 18.5) bmiStatus = "Abaixo do peso";
      else if (imc < 25) bmiStatus = "Peso normal";
      else if (imc < 30) bmiStatus = "Sobrepeso";

      const res = await fetch("/api/coach-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: tempMessages,
          userProfile: {
            name: profile.name,
            weight: profile.weight,
            weightGoal: profile.weightGoal,
            calorieGoal: profile.calorieGoal,
            waterGoal: profile.waterGoal,
            bmiStatus: bmiStatus,
          }
        }),
      });

      if (!res.ok) {
        throw new Error("Falha ao comunicar com o Treinador.");
      }

      const data = await res.json();
      const coachMsg: CoachMessage = {
        id: crypto.randomUUID(),
        text: data.text || "Pode reformular a pergunta? Tive um problema de carregamento.",
        sender: "coach",
        timestamp: new Date().toISOString(),
      };

      const finalMessages = [...tempMessages, coachMsg];
      setCoachMessages(finalMessages);
      localStorage.setItem("next_coach", JSON.stringify(finalMessages));
    } catch (err) {
      console.error(err);
      const errorMsg: CoachMessage = {
        id: crypto.randomUUID(),
        text: "Desculpe, deu um erro de rede temporário. Por favor verifique sua conexão ou reinicie o aplicativo.",
        sender: "coach",
        timestamp: new Date().toISOString(),
      };
      setCoachMessages((prev) => [...prev, errorMsg]);
    }
  };

  const handleTranslate = async (text: string, from: string, to: string, autoDetect: boolean): Promise<string> => {
    const res = await fetch("/api/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, from, to, autoDetect }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || "Erro de chamada do tradutor.");
    }

    const data = await res.json();
    return data.translatedText || "";
  };

  const handleAddTranslationHistory = (originText: string, translatedText: string, fromLang: string, toLang: string) => {
    const newHistory: TranslationHistory = {
      id: crypto.randomUUID(),
      originText,
      translatedText,
      fromLang,
      toLang,
      timestamp: new Date().toISOString(),
    };
    const updated = [newHistory, ...translations];
    setTranslations(updated);
    localStorage.setItem("next_translations", JSON.stringify(updated));
  };

  const handleClearTranslationHistory = () => {
    setTranslations([]);
    localStorage.setItem("next_translations", JSON.stringify([]));
  };

  const handleDeleteTranslationHistoryItem = (id: string) => {
    const updated = translations.filter((t) => t.id !== id);
    setTranslations(updated);
    localStorage.setItem("next_translations", JSON.stringify(updated));
  };

  // Seeding tools
  const handleSeedData = () => {
    // Generate lovely weekly log records
    const today = new Date();
    const mockCalories: CalorieLog[] = [];
    const mockWater: WaterLog[] = [];

    // Seed 7 days of calories
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dateString = d.toISOString().split("T")[0];

      if (i === 1) { // Sunday (D) (represented as index 1 or so for D in chart)
        mockCalories.push({
          id: crypto.randomUUID(),
          amount: 850,
          type: "consumed",
          description: "Refeição Completa Domingo",
          timestamp: `${dateString}T12:00:00Z`
        });
      } else if (i === 5 || i === 6) { // T / Q
        mockCalories.push({
          id: crypto.randomUUID(),
          amount: 150,
          type: "consumed",
          description: "Lanche Rápido",
          timestamp: `${dateString}T15:00:00Z`
        });
      }
    }

    // Seed water logs
    for (let hour = 8; hour <= 20; hour += 3) {
      const d = new Date();
      d.setHours(hour, 0, 0, 0);
      mockWater.push({
        id: crypto.randomUUID(),
        amount: 500,
        timestamp: d.toISOString(),
      });
    }

    setCalorieLogs(mockCalories);
    setWaterLogs(mockWater);
    localStorage.setItem("next_calories", JSON.stringify(mockCalories));
    localStorage.setItem("next_water", JSON.stringify(mockWater));
  };

  const handleResetApp = () => {
    localStorage.clear();
    setProfile(DEFAULT_PROFILE);
    setWaterLogs([]);
    setCalorieLogs([]);
    setPhotos([]);
    setCoachMessages([]);
    setTracking(DEFAULT_TRACKING);
    setTranslations([]);
  };

  return (
    <div id="main-applet-root" className="min-h-screen bg-[#0A0A0A] text-zinc-100 flex flex-col justify-between max-w-lg mx-auto border-x border-zinc-900 shadow-2xl relative">
      
      {/* Top Banner Branding / Installation trigger */}
      <header id="top-branding-header" className="px-5 py-4 border-b border-zinc-900 bg-[#0A0A0A]/90 backdrop-blur-md sticky top-0 z-40 flex items-center justify-between text-left print:hidden">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Dumbbell className="w-4.5 h-4.5 animate-spin-slow" />
          </div>
          <div>
            <span className="text-xs text-zinc-500 font-mono leading-none flex items-center gap-1">
              Next Fitness Tracker <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </span>
            <p className="text-[10px] text-zinc-400 font-semibold mt-0.5">Membro Premium</p>
          </div>
        </div>

        {/* Download App trigger */}
        <button
          id="btn-pwa-download-trigger"
          onClick={() => setShowPwaPrompt(true)}
          className="rounded-lg bg-zinc-900/90 border border-zinc-800 text-emerald-500 hover:text-emerald-400 hover:bg-zinc-800 p-2 text-xs flex items-center gap-1.5 transition font-semibold"
          title="Baixar para o Celular"
        >
          <Download className="w-4 h-4 text-emerald-400 animate-bounce" />
          <span className="hidden sm:inline">Baixar App</span>
        </button>
      </header>

      {/* Main Container screen rendering */}
      <main id="applet-viewport" className="flex-grow p-5 pb-24 overflow-y-auto print:p-0 print:pb-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            {activeTab === "inicio" && (
              <Dashboard
                profile={profile}
                waterLogs={waterLogs}
                calorieLogs={calorieLogs}
                onAddWater={handleAddWater}
                onAddCalorie={handleAddCalorie}
                onUpdateWeight={handleUpdateWeight}
              />
            )}

            {activeTab === "agua" && (
              <WaterTracker
                profile={profile}
                waterLogs={waterLogs}
                onAddWater={handleAddWater}
                onDeleteWaterLog={handleDeleteWaterLog}
              />
            )}

            {activeTab === "foto" && (
              <ProgressPhotos
                photos={photos}
                onAddPhoto={handleAddPhoto}
                onDeletePhoto={handleDeletePhoto}
                currentWeight={profile.weight}
              />
            )}

            {activeTab === "coach" && (
              <AICoach
                profile={profile}
                messages={coachMessages}
                onSendMessage={handleSendMessage}
                bmiStatus={profile.weight >= 120 ? "Obesidade" : "Normal"}
              />
            )}

            {activeTab === "idiomas" && (
              <Translator
                onTranslate={handleTranslate}
                history={translations}
                onAddHistory={handleAddTranslationHistory}
                onClearHistory={handleClearTranslationHistory}
                onDeleteHistoryItem={handleDeleteTranslationHistoryItem}
              />
            )}

            {activeTab === "metas" && (
              <Metas
                tracking={tracking}
                onToggleMainGoal={handleToggleMainGoal}
                onAddCustomGoal={handleAddCustomGoal}
                onToggleCustomGoal={handleToggleCustomGoal}
                onDeleteCustomGoal={handleDeleteCustomGoal}
              />
            )}

            {activeTab === "pdf" && (
              <PDFExporter
                profile={profile}
                waterLogs={waterLogs}
                calorieLogs={calorieLogs}
                photos={photos}
                tracking={tracking}
              />
            )}

            {activeTab === "admin" && (
              <AdminPanel
                profile={profile}
                onUpdateProfile={handleUpdateProfile}
                onSeedData={handleSeedData}
                onResetApp={handleResetApp}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* PWA / Install Application simulated popover with exact detailed instructions */}
      {showPwaPrompt && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4 z-50 print:hidden">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-sm text-left relative overflow-hidden box-glow">
            <button
              onClick={() => setShowPwaPrompt(false)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-white p-1 rounded-lg hover:bg-zinc-800 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center justify-center text-emerald-400 mb-4">
              <Download className="w-6 h-6 animate-pulse" />
            </div>

            <h3 className="text-base font-bold text-white mb-2">Instalar Next Fitness Tracker</h3>
            <p className="text-xs text-zinc-400 leading-relaxed mb-4">
              Tenha acesso rápido ao seu diário de evolução de treino e fotos sem precisar de navegadores! Siga as instruções para o seu celular:
            </p>

            <div className="space-y-3.5 text-xs text-zinc-350 bg-zinc-950 p-4 rounded-xl border border-zinc-850">
              <div>
                <p className="font-semibold text-white flex items-center gap-1.5">
                  <span className="w-4 h-4 bg-zinc-800 text-[10px] rounded-full flex items-center justify-center text-emerald-400 font-bold font-mono">1</span> 
                  Para Celulares iOS (Safari / iPhone)
                </p>
                <p className="pl-5 text-[11px] text-zinc-500 mt-0.5">Toque no ícone de <strong className="text-zinc-300">Compartilhar</strong> na barra inferior ou superior e selecione <strong className="text-zinc-300">"Adicionar à Tela de Início"</strong>.</p>
              </div>

              <hr className="border-zinc-900" />

              <div>
                <p className="font-semibold text-white flex items-center gap-1.5">
                  <span className="w-4 h-4 bg-zinc-800 text-[10px] rounded-full flex items-center justify-center text-emerald-400 font-bold font-mono">2</span> 
                  Para Celulares Android (Chrome)
                </p>
                <p className="pl-5 text-[11px] text-zinc-500 mt-0.5">Toque nos <strong className="text-zinc-300">3 pontinhos</strong> do menu lateral do navegador e selecione <strong className="text-emerald-400">"Instalar Aplicativo"</strong>.</p>
              </div>
            </div>

            <button
              onClick={() => setShowPwaPrompt(false)}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs py-3 rounded-lg transition mt-4"
            >
              ENTENDI, SENSACIONAL!
            </button>
          </div>
        </div>
      )}

      {/* Styled Bottom Navigation Panel - EXACT SAME COLORS INTERACTION NO ALTERATIONS */}
      <nav id="bottom-navigation-deck" className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-lg bg-black border-t border-zinc-900/90 py-1.5 z-40 flex justify-around items-center px-2 print:hidden backdrop-blur-lg">
        
        {/* Nav tabs selection buttons row */}
        {[
          { tab: "inicio", label: "Início", icon: Home },
          { tab: "agua", label: "Água", icon: Droplet },
          { tab: "foto", label: "Foto", icon: Camera },
          { tab: "coach", label: "Coach", icon: Dumbbell },
          { tab: "idiomas", label: "Idiomas", icon: Globe },
          { tab: "metas", label: "Metas", icon: Target },
          { tab: "pdf", label: "PDF", icon: FileText },
          { tab: "admin", label: "Admin", icon: Settings },
        ].map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.tab;
          
          return (
            <button
              id={`nav-tab-trigger-${item.tab}`}
              key={item.tab}
              onClick={() => setActiveTab(item.tab as ActiveTab)}
              className="flex flex-col items-center justify-center flex-1 py-1 px-1 relative transition group select-none cursor-pointer"
            >
              {/* Dynamic light bullet feedback */}
              {isActive && (
                <motion.span 
                  layoutId="nav-active-tracker-indicator"
                  className="absolute top-[-4px] w-5 h-[2px] bg-emerald-400 rounded-full" 
                />
              )}

              <Icon 
                className={`w-4.5 h-4.5 mb-1.5 transition ${
                  isActive 
                    ? "text-emerald-400 scale-110 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]" 
                    : "text-zinc-550 group-hover:text-zinc-300"
                }`} 
              />
              <span className={`text-[9px] tracking-tight transition ${
                isActive 
                  ? "text-emerald-400 font-extrabold" 
                  : "text-zinc-550 group-hover:text-zinc-300"
              }`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
