import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Flame, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const success = await login(username, password);
      if (success) {
        navigate("/");
      } else {
        setError("Usuário ou senha incorretos");
      }
    } catch (err) {
      setError("Ocorreu um erro ao conectar com o servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-amber-100/50 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-stone-200/50 blur-[150px] pointer-events-none" />

      <div className="w-full max-w-[420px] z-10 animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out">
        {/* Logo and Header */}
        <div className="flex flex-col items-center mb-10 space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-white border border-stone-200 shadow-sm flex items-center justify-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-amber-50 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out" />
            <Flame className="w-8 h-8 text-amber-600 relative z-10" strokeWidth={1.5} />
          </div>
          <div className="text-center space-y-1.5">
            <h1 className="text-3xl font-semibold tracking-tight text-stone-900 font-serif">
              Bem-vindo
            </h1>
            <p className="text-sm text-stone-500 tracking-wide uppercase">
              Clarigo • Controle de Estoque
            </p>
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-white/80 backdrop-blur-xl border border-stone-200/80 rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Error Message */}
            <div className={`
              overflow-hidden transition-all duration-300 ease-in-out
              ${error ? "max-h-12 opacity-100 mb-6" : "max-h-0 opacity-0 mb-0"}
            `}>
              <div className="p-3 bg-red-50 border border-red-100/50 rounded-xl text-sm text-red-600 font-medium text-center">
                {error}
              </div>
            </div>

            <div className="space-y-5">
              <div className="space-y-2 group">
                <Label 
                  htmlFor="username" 
                  className="text-xs font-semibold text-stone-500 uppercase tracking-wider group-focus-within:text-amber-600 transition-colors"
                >
                  Usuário
                </Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Seu usuário de acesso"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={loading}
                  className="h-12 bg-white/50 border-stone-200 focus-visible:ring-amber-500/20 focus-visible:border-amber-500 rounded-xl transition-all shadow-sm"
                  required
                />
              </div>

              <div className="space-y-2 group">
                <div className="flex items-center justify-between">
                  <Label 
                    htmlFor="password" 
                    className="text-xs font-semibold text-stone-500 uppercase tracking-wider group-focus-within:text-amber-600 transition-colors"
                  >
                    Senha
                  </Label>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  className="h-12 bg-white/50 border-stone-200 focus-visible:ring-amber-500/20 focus-visible:border-amber-500 rounded-xl transition-all shadow-sm"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-stone-900 hover:bg-stone-800 text-white rounded-xl shadow-lg shadow-stone-900/10 transition-all duration-300 group flex items-center justify-center font-medium text-sm"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Entrar no sistema
                  <ArrowRight className="w-4 h-4 ml-2 opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </>
              )}
            </Button>
          </form>
        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-xs text-stone-400 font-medium">
          Sistema protegido e operado por IMSControl
        </p>
      </div>
    </div>
  );
}
