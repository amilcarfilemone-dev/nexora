"use client";

import React, { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { Sparkles, ArrowLeft } from "lucide-react";

export default function Auth({ onAuthed }) {
  const [mode, setMode] = useState("login"); // login | signup | forgot
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (mode === "signup") {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name } },
      });
      if (error) {
        setError(traduzErro(error.message));
      } else if (data.user) {
        onAuthed();
      }
    } else if (mode === "forgot") {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: typeof window !== "undefined" ? window.location.origin : undefined,
      });
      if (error) {
        setError(traduzErro(error.message));
      } else {
        setSent(true);
      }
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setError(traduzErro(error.message));
      } else if (data.user) {
        onAuthed();
      }
    }
    setLoading(false);
  }

  function traduzErro(msg) {
    if (msg.includes("Invalid login credentials")) return "E-mail ou senha incorretos.";
    if (msg.includes("User already registered")) return "Este e-mail já está cadastrado.";
    if (msg.includes("Password should be at least")) return "A senha deve ter pelo menos 6 caracteres.";
    if (msg.includes("Unable to validate email")) return "E-mail inválido.";
    if (msg.includes("rate limit")) return "Muitas tentativas. Aguarde um pouco antes de tentar de novo.";
    return msg;
  }

  function switchMode(newMode) {
    setMode(newMode);
    setError("");
    setSent(false);
  }

  return (
    <div
      style={{ background: "#08080D", color: "#F4F4F8", minHeight: "100%" }}
      className="flex flex-col justify-center px-6 py-10"
    >
      <div className="flex items-center gap-2 mb-8 justify-center">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center"
          style={{ background: "linear-gradient(135deg,#8B5CF6,#2DD4EE)" }}
        >
          <Sparkles size={18} color="#08080D" />
        </div>
        <span className="font-semibold tracking-tight text-[19px]">NEXORA</span>
      </div>

      {mode === "forgot" && (
        <button
          onClick={() => switchMode("login")}
          className="flex items-center gap-1 text-[13px] mb-4"
          style={{ color: "#8A8A9B" }}
        >
          <ArrowLeft size={14} /> Voltar
        </button>
      )}

      <h1 className="text-2xl font-semibold text-center mb-1">
        {mode === "login" && "Bem-vindo de volta"}
        {mode === "signup" && "Crie sua conta"}
        {mode === "forgot" && "Recuperar senha"}
      </h1>
      <p className="text-[13px] text-center mb-8" style={{ color: "#8A8A9B" }}>
        {mode === "login" && "Entre para continuar sua evolução."}
        {mode === "signup" && "Comece a transformar intenção em evolução."}
        {mode === "forgot" && "Enviaremos um link para você criar uma senha nova."}
      </p>

      {mode === "forgot" && sent ? (
        <div className="text-center">
          <p className="text-[14px] mb-6" style={{ color: "#D4D4E0" }}>
            Enviamos um link de recuperação para <strong>{email}</strong>. Abra o e-mail e toque no link para criar uma nova senha.
          </p>
          <button
            onClick={() => switchMode("login")}
            className="text-[13px]"
            style={{ color: "#8B5CF6" }}
          >
            Voltar para o login
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {mode === "signup" && (
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Seu nome"
              required
              className="w-full px-4 py-3 rounded-xl text-[14px] outline-none"
              style={{ background: "#121218", border: "1px solid #1F1F29", color: "#F4F4F8" }}
            />
          )}
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="E-mail"
            required
            className="w-full px-4 py-3 rounded-xl text-[14px] outline-none"
            style={{ background: "#121218", border: "1px solid #1F1F29", color: "#F4F4F8" }}
          />
          {mode !== "forgot" && (
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Senha"
              required
              minLength={6}
              className="w-full px-4 py-3 rounded-xl text-[14px] outline-none"
              style={{ background: "#121218", border: "1px solid #1F1F29", color: "#F4F4F8" }}
            />
          )}

          {mode === "login" && (
            <button
              type="button"
              onClick={() => switchMode("forgot")}
              className="text-[12px] text-right"
              style={{ color: "#8A8A9B" }}
            >
              Esqueceu a senha?
            </button>
          )}

          {error && (
            <p className="text-[13px] text-center" style={{ color: "#F87171" }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl font-semibold text-[15px] mt-2"
            style={{
              background: "linear-gradient(90deg,#8B5CF6,#2DD4EE)",
              color: "#08080D",
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading
              ? "Aguarde..."
              : mode === "login"
              ? "Entrar"
              : mode === "signup"
              ? "Criar conta"
              : "Enviar link de recuperação"}
          </button>
        </form>
      )}

      {mode !== "forgot" && (
        <button
          onClick={() => switchMode(mode === "login" ? "signup" : "login")}
          className="text-[13px] text-center mt-6"
          style={{ color: "#8B5CF6" }}
        >
          {mode === "login"
            ? "Não tem conta? Criar agora"
            : "Já tem conta? Entrar"}
        </button>
      )}
    </div>
  );
}
