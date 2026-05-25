import React, { useState } from "react";
import { User, Lock, Mail, ChevronRight, LogOut, LogIn, CheckCircle2, ShieldAlert } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface LoginViewProps {
  isLoggedIn: boolean;
  userEmail: string;
  userName: string;
  onLogin: (email: string, name: string) => void;
  onLogout: () => void;
}

export default function LoginView({
  isLoggedIn,
  userEmail,
  userName,
  onLogin,
  onLogout,
}: LoginViewProps) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [errorText, setErrorText] = useState("");
  const [successText, setSuccessText] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setErrorText("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    if (isRegistering && !name.trim()) {
      setErrorText("Por favor, preencha o seu nome de membro.");
      return;
    }

    setErrorText("");
    setIsLoading(true);

    // Simulate standard fast authentication with local storage
    setTimeout(() => {
      setIsLoading(false);
      if (isRegistering) {
        onLogin(email.trim(), name.trim());
        setSuccessText("Conta criada com sucesso! Seja bem-vindo ao NEXTFIT PRO.");
      } else {
        // Fallback name if logging in
        onLogin(email.trim(), email.split("@")[0]);
        setSuccessText("Acesso autorizado. Carregando dados biométricos...");
      }

      // Reset fields
      setEmail("");
      setPassword("");
      setName("");
      setTimeout(() => setSuccessText(""), 3000);
    }, 1200);
  };

  if (isLoggedIn) {
    const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(userName || "Membro")}&background=BEF264&color=000&bold=true`;
    return (
      <div id="login-panel-view" className="space-y-6 max-w-lg mx-auto pb-6 text-left">
        {/* Header */}
        <div className="text-center pt-2">
          <h2 className="text-2xl font-bold tracking-tight text-white mb-1 flex items-center justify-center gap-1.5 font-display">
            <User className="w-6 h-6 text-emerald-500" /> Sessão Ativa
          </h2>
          <p className="text-xs text-zinc-500 font-mono">Conta Premium de Membro NEXTFIT</p>
        </div>

        {/* User profile card */}
        <div className="bg-zinc-900/80 rounded-2xl p-6 border border-zinc-800/80 box-glow space-y-6">
          <div className="flex items-center gap-4">
            <img 
              src={avatarUrl} 
              alt="User Avatar Badge" 
              className="w-16 h-16 rounded-2xl border-2 border-emerald-500/40 shadow-[0_0_15px_rgba(190,242,100,0.15)]"
            />
            <div>
              <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 tracking-wider">
                MEMBRO PREMIUM
              </span>
              <h3 className="text-lg font-bold text-white mt-1.5 font-display">{userName}</h3>
              <p className="text-xs text-zinc-400 font-mono flex items-center gap-1.5 mt-0.5">
                <Mail className="w-3.5 h-3.5 text-zinc-500" /> {userEmail}
              </p>
            </div>
          </div>

          {/* Details / Status list */}
          <div className="grid grid-cols-2 gap-3.5 pt-2">
            <div className="bg-zinc-950/60 p-3.5 rounded-xl border border-zinc-900">
              <p className="text-[9px] font-mono uppercase text-zinc-500 font-bold tracking-wider">INTEGRAÇÃO CLOUD</p>
              <p className="text-xs font-bold text-white mt-1">Sincronizado</p>
            </div>
            <div className="bg-zinc-950/60 p-3.5 rounded-xl border border-zinc-900">
              <p className="text-[9px] font-mono uppercase text-zinc-500 font-bold tracking-wider">STATUS MONITOR</p>
              <p className="text-xs font-bold text-emerald-400 mt-1 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Ativo
              </p>
            </div>
          </div>

          <button
            id="btn-trigger-logout"
            onClick={onLogout}
            className="w-full bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 hover:border-rose-500/30 text-rose-450 text-xs font-bold py-3.5 rounded-xl transition flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4 text-rose-500" /> LOGOUT / SAIR DA CONTA
          </button>
        </div>
      </div>
    );
  }

  return (
    <div id="login-panel-view" className="space-y-6 max-w-lg mx-auto pb-6 text-left">
      {/* Header */}
      <div className="text-center pt-2">
        <h2 className="text-2xl font-bold tracking-tight text-white mb-1 flex items-center justify-center gap-1.5 font-display">
          <LogIn className="w-6 h-6 text-emerald-500" /> Conta NEXTFIT
        </h2>
        <p className="text-xs text-zinc-500">Faça login para salvar seus logs e progresso de treino</p>
      </div>

      {/* Login box container */}
      <div className="bg-zinc-900/80 rounded-2xl p-5 border border-zinc-800/80 box-glow">
        <div className="flex border-b border-zinc-800 pb-4 mb-4">
          <button
            id="tab-toggle-signin"
            onClick={() => {
              setIsRegistering(false);
              setErrorText("");
            }}
            className={`flex-1 text-center pb-2 text-xs font-bold uppercase tracking-wider border-b-2 transition ${
              !isRegistering
                ? "border-emerald-500 text-emerald-400 font-extrabold"
                : "border-transparent text-zinc-500 hover:text-zinc-300"
            }`}
          >
            Entrar
          </button>
          <button
            id="tab-toggle-signup"
            onClick={() => {
              setIsRegistering(true);
              setErrorText("");
            }}
            className={`flex-1 text-center pb-2 text-xs font-bold uppercase tracking-wider border-b-2 transition ${
              isRegistering
                ? "border-emerald-500 text-emerald-400 font-extrabold"
                : "border-transparent text-zinc-500 hover:text-zinc-300"
            }`}
          >
            Cadastrar
          </button>
        </div>

        {/* User alert errors/success notifications */}
        <AnimatePresence mode="wait">
          {errorText && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="p-3 bg-rose-950/30 border border-rose-900/40 rounded-xl flex gap-2 mb-4"
            >
              <ShieldAlert className="w-4 h-4 text-rose-500 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-zinc-300">{errorText}</p>
            </motion.div>
          )}

          {successText && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="p-3 bg-emerald-950/30 border border-emerald-900/40 rounded-xl flex gap-2 mb-4"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-emerald-400 font-semibold">{successText}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Primary Forms Submit Handler */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegistering && (
            <div className="space-y-1.5">
              <label className="text-[9px] uppercase tracking-wider font-bold text-zinc-400 font-mono">Nome de Treino</label>
              <div className="relative">
                <User className="w-4 h-4 text-zinc-600 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  placeholder="Ex: Marcus, Takemi, etc."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-850 p-3 pl-11 rounded-xl text-xs text-white placeholder-zinc-700 font-sans focus:outline-none focus:border-emerald-500 leading-relaxed"
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-[9px] uppercase tracking-wider font-bold text-zinc-400 font-mono">E-mail</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-zinc-600 absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                placeholder="seu.email@dominio.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-850 p-3 pl-11 rounded-xl text-xs text-white placeholder-zinc-700 font-sans focus:outline-none focus:border-emerald-500 leading-relaxed"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[9px] uppercase tracking-wider font-bold text-zinc-400 font-mono">Senha</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-zinc-600 absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                placeholder="******"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-850 p-3 pl-11 rounded-xl text-xs text-white placeholder-zinc-700 font-sans focus:outline-none focus:border-emerald-500 leading-relaxed"
              />
            </div>
          </div>

          <button
            id="btn-login-submit"
            type="submit"
            disabled={isLoading}
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs py-3.5 rounded-xl transition flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(190,242,100,0.15)] disabled:opacity-40 mt-6"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                Processando...
              </span>
            ) : (
              <>
                {isRegistering ? "CONFIRMAR CADASTRO" : "ENTRAR NO SISTEMA"}{" "}
                <ChevronRight className="w-4 h-4 text-black" />
              </>
            )}
          </button>
        </form>
      </div>

      <div className="text-center bg-zinc-900/30 p-4 border border-zinc-900 rounded-xl">
        <p className="text-[10px] text-zinc-500 leading-relaxed">
          NEXTFIT protege seus logs de treino e fotos localmente de forma segura. Certifique-se de salvar suas senhas.
        </p>
      </div>
    </div>
  );
}
