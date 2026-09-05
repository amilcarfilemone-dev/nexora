"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { supabase } from "../lib/supabaseClient";
import Auth from "./Auth";
import {
  Flame, Star, Trophy, CheckCircle2, Timer, Target, User, Home,
  Plus, X, Check, ChevronRight, Copy, Users, TrendingUp, Award,
  BookOpen, Briefcase, Zap, Crown, Lock, ArrowRight, Play, Pause,
  RotateCcw, Sparkles, LogOut
} from "lucide-react";

/* ---------------------------------------------------------
   NEXORA — "Transforme intenção em evolução."
--------------------------------------------------------- */

const LEVELS = [
  { n: 1, name: "Iniciante", min: 0 },
  { n: 2, name: "Determinado", min: 200 },
  { n: 3, name: "Disciplinado", min: 500 },
  { n: 4, name: "Focado", min: 1000 },
  { n: 5, name: "Evoluído", min: 1800 },
  { n: 6, name: "Imparável", min: 3000 },
];

const ACHIEVEMENTS = [
  { id: "a1", icon: Flame, name: "Primeira Vitória", desc: "Conclua seu primeiro desafio" },
  { id: "a2", icon: Zap, name: "7 Dias", desc: "Mantenha 7 dias de sequência" },
  { id: "a3", icon: Target, name: "10 Desafios", desc: "Conclua 10 desafios" },
  { id: "a4", icon: BookOpen, name: "Foco nos Estudos", desc: "5 sessões de foco em Study" },
  { id: "a5", icon: Briefcase, name: "Máquina de Execução", desc: "10 tarefas em Business" },
  { id: "a6", icon: Trophy, name: "30 Dias", desc: "Sequência de 30 dias" },
  { id: "a7", icon: Crown, name: "NEXORA Elite", desc: "Alcance o Nível 6" },
];

const DAILY_CHALLENGES = [
  "Dedique 25 minutos à tarefa que você está adiando.",
  "Beba 2 litros de água e anote como se sentiu.",
  "Escreva 3 coisas que você fez bem esta semana.",
  "Envie uma proposta ou contacto que você vem adiando.",
  "Estude 30 minutos sem abrir redes sociais.",
];

function levelFor(xp) {
  let current = LEVELS[0];
  for (const l of LEVELS) if (xp >= l.min) current = l;
  const idx = LEVELS.indexOf(current);
  const next = LEVELS[idx + 1] || null;
  const pct = next ? Math.min(100, Math.round(((xp - current.min) / (next.min - current.min)) * 100)) : 100;
  return { current, next, pct };
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function unlockedAchievements(profile) {
  const ids = [];
  if (profile.challenges_done >= 1) ids.push("a1");
  if (profile.streak >= 7) ids.push("a2");
  if (profile.challenges_done >= 10) ids.push("a3");
  if (profile.streak >= 30) ids.push("a6");
  if (levelFor(profile.xp).current.n >= 6) ids.push("a7");
  return ids;
}

/* ---------------------------------------------------------
   Shell primitives
--------------------------------------------------------- */

function GradientText({ children, className = "" }) {
  return (
    <span
      className={className}
      style={{
        background: "linear-gradient(90deg, #8B5CF6, #2DD4EE)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
      }}
    >
      {children}
    </span>
  );
}

function Card({ children, className = "", style = {} }) {
  return (
    <div
      className={`rounded-2xl ${className}`}
      style={{ background: "#121218", border: "1px solid #1F1F29", ...style }}
    >
      {children}
    </div>
  );
}

function Toast({ message }) {
  if (!message) return null;
  return (
    <div
      className="fixed left-1/2 z-50 px-5 py-3 rounded-xl text-sm font-medium shadow-2xl"
      style={{
        bottom: "92px",
        transform: "translateX(-50%)",
        background: "#181822",
        border: "1px solid #2A2A38",
        color: "#F4F4F8",
        animation: "nexora-toast .25s ease-out",
      }}
    >
      {message}
    </div>
  );
}

function Loading() {
  return (
    <div
      style={{ background: "#08080D", color: "#F4F4F8", minHeight: "100%" }}
      className="flex items-center justify-center"
    >
      <p className="text-[13px]" style={{ color: "#8A8A9B" }}>Carregando...</p>
    </div>
  );
}

/* ---------------------------------------------------------
   Landing
--------------------------------------------------------- */

function Landing({ onEnter }) {
  const steps = [
    { n: "01", t: "Defina", d: "Escolha o que deseja melhorar." },
    { n: "02", t: "Desafie-se", d: "Receba uma tarefa simples e objetiva." },
    { n: "03", t: "Execute", d: "Use o Modo Foco para realizar a tarefa." },
    { n: "04", t: "Evolua", d: "Ganhe XP, suba de nível e construa sua sequência." },
  ];

  return (
    <div style={{ background: "#08080D", color: "#F4F4F8", minHeight: "100%" }}>
      <div className="flex items-center justify-between px-5 py-5">
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "linear-gradient(135deg,#8B5CF6,#2DD4EE)" }}
          >
            <Sparkles size={16} color="#08080D" />
          </div>
          <span className="font-semibold tracking-tight text-[17px]">NEXORA</span>
        </div>
        <button
          onClick={onEnter}
          className="text-sm px-4 py-2 rounded-full font-medium"
          style={{ background: "#181822", border: "1px solid #2A2A38" }}
        >
          Entrar
        </button>
      </div>

      <div className="px-5 pt-10 pb-14 relative overflow-hidden">
        <div
          className="absolute -top-24 -right-24 w-64 h-64 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(139,92,246,0.25), transparent 70%)", filter: "blur(20px)" }}
        />
        <div
          className="absolute top-40 -left-20 w-56 h-56 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(45,212,238,0.18), transparent 70%)", filter: "blur(20px)" }}
        />
        <div className="relative">
          <p className="text-xs font-medium mb-4" style={{ color: "#8A8A9B" }}>
            Plataforma de evolução pessoal
          </p>
          <h1 className="text-[38px] leading-[1.08] font-semibold tracking-tight mb-5">
            O seu próximo nível <GradientText>começa hoje</GradientText>.
          </h1>
          <p className="text-[15px] leading-relaxed mb-8" style={{ color: "#B4B4C4" }}>
            A NEXORA transforma objetivos em ações diárias para você vencer a
            procrastinação, construir disciplina e evoluir de verdade.
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={onEnter}
              className="w-full py-3.5 rounded-xl font-semibold text-[15px]"
              style={{ background: "linear-gradient(90deg,#8B5CF6,#2DD4EE)", color: "#08080D" }}
            >
              Começar agora
            </button>
            <a
              href="#como-funciona"
              className="w-full py-3.5 rounded-xl font-medium text-[15px] text-center"
              style={{ border: "1px solid #2A2A38", color: "#F4F4F8" }}
            >
              Como funciona
            </a>
          </div>

          <div className="mt-10 flex items-end gap-2 h-28">
            {[28, 44, 36, 60, 52, 78, 100].map((h, i) => (
              <div
                key={i}
                className="flex-1 rounded-t-md"
                style={{
                  height: `${h}%`,
                  background: i === 6 ? "linear-gradient(180deg,#2DD4EE,#8B5CF6)" : "#181822",
                  border: i === 6 ? "none" : "1px solid #22222E",
                }}
              />
            ))}
          </div>
          <p className="text-[11px] mt-2" style={{ color: "#5C5C6E" }}>
            Progresso composto, dia após dia.
          </p>
        </div>
      </div>

      <div id="como-funciona" className="px-5 pb-14">
        <h2 className="text-xl font-semibold mb-6">Como funciona</h2>
        <div className="flex flex-col gap-3">
          {steps.map((s) => (
            <Card key={s.n} className="p-4 flex items-start gap-4">
              <span className="text-[13px] font-semibold shrink-0 pt-0.5" style={{ color: "#8B5CF6" }}>
                {s.n}
              </span>
              <div>
                <p className="font-medium text-[15px] mb-1">{s.t}</p>
                <p className="text-[13px]" style={{ color: "#8A8A9B" }}>{s.d}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <div className="px-5 pb-24 text-center">
        <p className="text-[13px] mb-4" style={{ color: "#5C5C6E" }}>
          Ação → Consistência → Progresso → Evolução
        </p>
        <button
          onClick={onEnter}
          className="w-full py-3.5 rounded-xl font-semibold text-[15px]"
          style={{ background: "linear-gradient(90deg,#8B5CF6,#2DD4EE)", color: "#08080D" }}
        >
          Começar agora
        </button>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   Dashboard
--------------------------------------------------------- */

function Dashboard({ profile, challengeStatus, onAcceptChallenge, onStartChallenge, onCompleteChallenge, goTo, challengeText }) {
  const { xp, streak, challenges_done } = profile;
  const { current, next, pct } = levelFor(xp);
  const todayProgress =
    challengeStatus === "done" ? 100 : challengeStatus === "active" ? 55 : challengeStatus === "accepted" ? 20 : 0;

  return (
    <div className="px-5 pt-6 pb-6">
      <p className="text-[13px] mb-1" style={{ color: "#8A8A9B" }}>Meu NEXORA</p>
      <h1 className="text-2xl font-semibold mb-6">
        Olá, {profile.name || "Evolução"}. Pronto para evoluir hoje?
      </h1>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Flame size={16} color="#F5B942" />
            <span className="text-[12px]" style={{ color: "#8A8A9B" }}>Sequência</span>
          </div>
          <p className="text-2xl font-semibold">{streak} <span className="text-sm font-normal" style={{ color: "#8A8A9B" }}>dias</span></p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Star size={16} color="#2DD4EE" />
            <span className="text-[12px]" style={{ color: "#8A8A9B" }}>XP</span>
          </div>
          <p className="text-2xl font-semibold">{xp}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Trophy size={16} color="#8B5CF6" />
            <span className="text-[12px]" style={{ color: "#8A8A9B" }}>Nível</span>
          </div>
          <p className="text-2xl font-semibold">{current.n} <span className="text-sm font-normal" style={{ color: "#8A8A9B" }}>{current.name}</span></p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 size={16} color="#4ADE80" />
            <span className="text-[12px]" style={{ color: "#8A8A9B" }}>Concluídos</span>
          </div>
          <p className="text-2xl font-semibold">{challenges_done}</p>
        </Card>
      </div>

      <Card className="p-4 mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[13px]" style={{ color: "#8A8A9B" }}>Progresso de hoje</span>
          <span className="text-[13px] font-medium">{todayProgress}%</span>
        </div>
        <div className="h-2 rounded-full overflow-hidden" style={{ background: "#1F1F29" }}>
          <div className="h-full rounded-full" style={{ width: `${todayProgress}%`, background: "linear-gradient(90deg,#8B5CF6,#2DD4EE)" }} />
        </div>
      </Card>

      <Card className="p-5 mb-6" style={{ background: "linear-gradient(145deg,#15121F,#0F1620)" }}>
        <p className="text-[12px] font-medium mb-2" style={{ color: "#8B5CF6" }}>DESAFIO DE HOJE</p>
        <p className="text-[16px] leading-snug mb-5">{challengeText}</p>

        {challengeStatus === "idle" && (
          <button
            onClick={onAcceptChallenge}
            className="w-full py-3 rounded-xl font-semibold text-[14px]"
            style={{ background: "linear-gradient(90deg,#8B5CF6,#2DD4EE)", color: "#08080D" }}
          >
            Aceitar desafio
          </button>
        )}
        {challengeStatus === "accepted" && (
          <button
            onClick={onStartChallenge}
            className="w-full py-3 rounded-xl font-semibold text-[14px] flex items-center justify-center gap-2"
            style={{ background: "#181822", border: "1px solid #2A2A38" }}
          >
            <Play size={15} /> Iniciar
          </button>
        )}
        {challengeStatus === "active" && (
          <button
            onClick={onCompleteChallenge}
            className="w-full py-3 rounded-xl font-semibold text-[14px] flex items-center justify-center gap-2"
            style={{ background: "#181822", border: "1px solid #2A2A38" }}
          >
            <Check size={15} /> Marcar como concluído
          </button>
        )}
        {challengeStatus === "done" && (
          <div className="text-center">
            <p className="font-semibold text-[14px] mb-1" style={{ color: "#4ADE80" }}>Desafio concluído · +50 XP</p>
            <p className="text-[13px]" style={{ color: "#8A8A9B" }}>Mais uma vitória. Continue avançando.</p>
          </div>
        )}
      </Card>

      <Card className="p-4 mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[13px]" style={{ color: "#8A8A9B" }}>
            {next ? `Próximo nível: ${next.name}` : "Nível máximo alcançado"}
          </span>
          <span className="text-[13px] font-medium">{pct}%</span>
        </div>
        <div className="h-2 rounded-full overflow-hidden" style={{ background: "#1F1F29" }}>
          <div className="h-full rounded-full" style={{ width: `${pct}%`, background: "#F5B942" }} />
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <button onClick={() => goTo("focus")}>
          <Card className="p-4 text-left h-full">
            <Timer size={18} color="#2DD4EE" className="mb-2" />
            <p className="font-medium text-[14px]">Modo Foco</p>
            <p className="text-[12px]" style={{ color: "#8A8A9B" }}>Foco total. Zero desculpas.</p>
          </Card>
        </button>
        <button onClick={() => goTo("goals")}>
          <Card className="p-4 text-left h-full">
            <Target size={18} color="#8B5CF6" className="mb-2" />
            <p className="font-medium text-[14px]">Minhas Metas</p>
            <p className="text-[12px]" style={{ color: "#8A8A9B" }}>Acompanhe seu avanço.</p>
          </Card>
        </button>
      </div>

      <button onClick={() => goTo("study")} className="w-full mt-3">
        <Card className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BookOpen size={18} color="#2DD4EE" />
            <div className="text-left">
              <p className="text-[14px] font-medium">NEXORA Study</p>
              <p className="text-[12px]" style={{ color: "#8A8A9B" }}>Metas, tarefas e desafios acadêmicos.</p>
            </div>
          </div>
          <ChevronRight size={16} color="#8A8A9B" />
        </Card>
      </button>

      <button onClick={() => goTo("business")} className="w-full mt-3">
        <Card className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Briefcase size={18} color="#F5B942" />
            <div className="text-left">
              <p className="text-[14px] font-medium">NEXORA Business</p>
              <p className="text-[12px]" style={{ color: "#8A8A9B" }}>Desafios para vendedores e empreendedores.</p>
            </div>
          </div>
          <ChevronRight size={16} color="#8A8A9B" />
        </Card>
      </button>
    </div>
  );
}

/* ---------------------------------------------------------
   Focus Mode
--------------------------------------------------------- */

function Focus({ onSessionComplete }) {
  const durations = [10, 25, 45, 60];
  const [selected, setSelected] = useState(25);
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!running) return;
    intervalRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(intervalRef.current);
          setRunning(false);
          onSessionComplete(selected);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [running]);

  function selectDuration(d) {
    setSelected(d);
    setSecondsLeft(d * 60);
    setRunning(false);
  }

  function reset() {
    setRunning(false);
    setSecondsLeft(selected * 60);
  }

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const ss = String(secondsLeft % 60).padStart(2, "0");
  const totalSec = selected * 60;
  const progress = 1 - secondsLeft / totalSec;
  const r = 88;
  const circumference = 2 * Math.PI * r;

  return (
    <div className="px-5 pt-6 pb-6 flex flex-col items-center">
      <h1 className="text-2xl font-semibold mb-1 self-start">NEXORA Focus</h1>
      <p className="text-[14px] mb-8 self-start" style={{ color: "#8A8A9B" }}>Foco total. Zero desculpas.</p>

      <div className="flex gap-2 mb-8 w-full justify-center">
        {durations.map((d) => (
          <button
            key={d}
            onClick={() => selectDuration(d)}
            className="px-4 py-2 rounded-full text-[13px] font-medium"
            style={{
              background: selected === d ? "linear-gradient(90deg,#8B5CF6,#2DD4EE)" : "#181822",
              color: selected === d ? "#08080D" : "#B4B4C4",
              border: selected === d ? "none" : "1px solid #2A2A38",
            }}
          >
            {d} min
          </button>
        ))}
      </div>

      <div className="relative w-56 h-56 mb-8">
        <svg width="224" height="224" className="-rotate-90">
          <circle cx="112" cy="112" r={r} fill="none" stroke="#1F1F29" strokeWidth="10" />
          <circle
            cx="112" cy="112" r={r} fill="none" stroke="url(#focusGrad)" strokeWidth="10"
            strokeLinecap="round" strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - progress)}
            style={{ transition: "stroke-dashoffset 1s linear" }}
          />
          <defs>
            <linearGradient id="focusGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8B5CF6" />
              <stop offset="100%" stopColor="#2DD4EE" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-4xl font-semibold tabular-nums">{mm}:{ss}</span>
        </div>
      </div>

      <div className="flex gap-3 w-full">
        <button onClick={reset} className="p-3.5 rounded-xl" style={{ background: "#181822", border: "1px solid #2A2A38" }}>
          <RotateCcw size={18} />
        </button>
        <button
          onClick={() => setRunning((r) => !r)}
          className="flex-1 py-3.5 rounded-xl font-semibold text-[15px] flex items-center justify-center gap-2"
          style={{ background: "linear-gradient(90deg,#8B5CF6,#2DD4EE)", color: "#08080D" }}
        >
          {running ? <><Pause size={16} /> Pausar</> : <><Play size={16} /> Iniciar sessão</>}
        </button>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   Goals (sincronizado com Supabase)
--------------------------------------------------------- */

const CATEGORIES = ["Estudos", "Carreira", "Saúde", "Finanças", "Pessoal"];

function Goals({ goals, userId, onGoalsChanged, onGoalCompleted, toast }) {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [days, setDays] = useState(30);

  async function createGoal() {
    if (!title.trim()) return;
    const { data, error } = await supabase
      .from("goals")
      .insert({ user_id: userId, title, category, progress: 0, days, done: false })
      .select()
      .single();
    if (!error && data) {
      onGoalsChanged([...goals, data]);
      setTitle("");
      setShowForm(false);
    }
  }

  async function updateProgress(goal, delta) {
    const progress = Math.max(0, Math.min(100, goal.progress + delta));
    const done = progress === 100;
    const { error } = await supabase
      .from("goals")
      .update({ progress, done })
      .eq("id", goal.id);
    if (!error) {
      onGoalsChanged(goals.map((g) => (g.id === goal.id ? { ...g, progress, done } : g)));
      if (done && !goal.done) {
        onGoalCompleted();
        toast("Meta concluída · +100 XP");
      }
    }
  }

  async function removeGoal(id) {
    const { error } = await supabase.from("goals").delete().eq("id", id);
    if (!error) onGoalsChanged(goals.filter((g) => g.id !== id));
  }

  return (
    <div className="px-5 pt-6 pb-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Minhas Metas</h1>
        <button
          onClick={() => setShowForm((s) => !s)}
          className="w-9 h-9 rounded-full flex items-center justify-center"
          style={{ background: "linear-gradient(90deg,#8B5CF6,#2DD4EE)" }}
        >
          {showForm ? <X size={18} color="#08080D" /> : <Plus size={18} color="#08080D" />}
        </button>
      </div>

      {showForm && (
        <Card className="p-4 mb-6">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex: Estudar programação"
            className="w-full mb-3 px-3 py-2.5 rounded-lg text-[14px] outline-none"
            style={{ background: "#0D0D13", border: "1px solid #2A2A38", color: "#F4F4F8" }}
          />
          <div className="flex gap-2 mb-3 flex-wrap">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className="text-[12px] px-3 py-1.5 rounded-full"
                style={{
                  background: category === c ? "#8B5CF6" : "#181822",
                  color: category === c ? "#08080D" : "#B4B4C4",
                  border: category === c ? "none" : "1px solid #2A2A38",
                }}
              >
                {c}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-[13px]" style={{ color: "#8A8A9B" }}>Prazo</span>
            <input
              type="number"
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              className="w-20 px-3 py-2 rounded-lg text-[14px] outline-none"
              style={{ background: "#0D0D13", border: "1px solid #2A2A38", color: "#F4F4F8" }}
            />
            <span className="text-[13px]" style={{ color: "#8A8A9B" }}>dias</span>
          </div>
          <button
            onClick={createGoal}
            className="w-full py-2.5 rounded-lg font-medium text-[14px]"
            style={{ background: "linear-gradient(90deg,#8B5CF6,#2DD4EE)", color: "#08080D" }}
          >
            Criar meta
          </button>
        </Card>
      )}

      {goals.length === 0 && !showForm && (
        <Card className="p-6 text-center">
          <p className="text-[14px]" style={{ color: "#8A8A9B" }}>
            Nenhuma meta ainda. Crie a primeira e comece a acompanhar seu avanço.
          </p>
        </Card>
      )}

      <div className="flex flex-col gap-3">
        {goals.map((g) => (
          <Card key={g.id} className="p-4">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="font-medium text-[15px]">{g.title}</p>
                <p className="text-[12px]" style={{ color: "#8A8A9B" }}>
                  {g.category} · prazo {g.days} dias
                </p>
              </div>
              <button onClick={() => removeGoal(g.id)}>
                <X size={16} color="#5C5C6E" />
              </button>
            </div>
            <div className="h-2 rounded-full overflow-hidden mb-3" style={{ background: "#1F1F29" }}>
              <div
                className="h-full rounded-full"
                style={{ width: `${g.progress}%`, background: g.done ? "#4ADE80" : "linear-gradient(90deg,#8B5CF6,#2DD4EE)" }}
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-medium">{g.progress}%</span>
              {g.done ? (
                <span className="text-[12px] font-medium flex items-center gap-1" style={{ color: "#4ADE80" }}>
                  <Check size={14} /> Concluída
                </span>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => updateProgress(g, -10)}
                    className="px-2.5 py-1 rounded-md text-[12px]"
                    style={{ background: "#181822", border: "1px solid #2A2A38" }}
                  >
                    −10%
                  </button>
                  <button
                    onClick={() => updateProgress(g, 10)}
                    className="px-2.5 py-1 rounded-md text-[12px]"
                    style={{ background: "#181822", border: "1px solid #2A2A38" }}
                  >
                    +10%
                  </button>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   Ranking (top usuários por XP, dados reais)
--------------------------------------------------------- */

function Ranking({ userId }) {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, name, xp")
        .order("xp", { ascending: false })
        .limit(20);
      if (!error && data) setList(data);
      setLoading(false);
    }
    load();
  }, []);

  const medals = ["🥇", "🥈", "🥉"];

  return (
    <div className="px-5 pt-6 pb-6">
      <h1 className="text-2xl font-semibold mb-6">NEXORA Rank</h1>
      {loading ? (
        <p className="text-[13px]" style={{ color: "#8A8A9B" }}>Carregando ranking...</p>
      ) : (
        <div className="flex flex-col gap-2">
          {list.map((r, i) => (
            <Card
              key={r.id}
              className="p-3.5 flex items-center gap-3"
              style={r.id === userId ? { border: "1px solid #8B5CF6", background: "#15121F" } : {}}
            >
              <span className="w-7 text-center text-[15px] font-semibold" style={{ color: i < 3 ? "#F5B942" : "#5C5C6E" }}>
                {i < 3 ? medals[i] : i + 1}
              </span>
              <div className="flex-1">
                <p className="text-[14px] font-medium">
                  {r.id === userId ? "Você" : r.name || "Usuário NEXORA"}
                </p>
              </div>
              <p className="text-[13px] font-semibold" style={{ color: "#2DD4EE" }}>{r.xp} XP</p>
            </Card>
          ))}
          {list.length === 0 && (
            <p className="text-[13px]" style={{ color: "#8A8A9B" }}>Ainda não há usuários no ranking.</p>
          )}
        </div>
      )}
    </div>
  );
}

/* ---------------------------------------------------------
   Profile
--------------------------------------------------------- */

function Profile({ profile, goals, goTo, onLogout }) {
  const { current } = levelFor(profile.xp);
  const [copied, setCopied] = useState(false);
  const unlocked = unlockedAchievements(profile);

  function copyCode() {
    if (navigator.clipboard) navigator.clipboard.writeText(profile.referral_code || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="px-5 pt-6 pb-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Meu Perfil</h1>
        <button onClick={onLogout} className="flex items-center gap-1 text-[12px]" style={{ color: "#8A8A9B" }}>
          <LogOut size={14} /> Sair
        </button>
      </div>

      <Card className="p-5 mb-6 flex items-center gap-4">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-semibold shrink-0"
          style={{ background: "linear-gradient(135deg,#8B5CF6,#2DD4EE)", color: "#08080D" }}
        >
          {(profile.name || "U")[0].toUpperCase()}
        </div>
        <div className="flex-1">
          <p className="font-semibold text-[16px]">{profile.name || "Usuário NEXORA"}</p>
          <p className="text-[13px]" style={{ color: "#8A8A9B" }}>
            Nível {current.n} · {current.name}
          </p>
        </div>
      </Card>

      <div className="grid grid-cols-3 gap-3 mb-6">
        <Card className="p-3.5 text-center">
          <p className="text-lg font-semibold">{profile.streak}</p>
          <p className="text-[11px]" style={{ color: "#8A8A9B" }}>Streak</p>
        </Card>
        <Card className="p-3.5 text-center">
          <p className="text-lg font-semibold">{profile.challenges_done}</p>
          <p className="text-[11px]" style={{ color: "#8A8A9B" }}>Desafios</p>
        </Card>
        <Card className="p-3.5 text-center">
          <p className="text-lg font-semibold">{goals.filter((g) => g.done).length}</p>
          <p className="text-[11px]" style={{ color: "#8A8A9B" }}>Metas</p>
        </Card>
      </div>

      <Card className="p-4 mb-6">
        <p className="text-[13px] font-medium mb-3">Convide amigos</p>
        <div className="flex items-center gap-2 mb-3">
          <div className="flex-1 px-3 py-2.5 rounded-lg text-[14px] font-mono" style={{ background: "#0D0D13", border: "1px solid #2A2A38" }}>
            {profile.referral_code || "NEXORA-----"}
          </div>
          <button
            onClick={copyCode}
            className="px-3 py-2.5 rounded-lg flex items-center gap-1.5 text-[13px] font-medium"
            style={{ background: "#181822", border: "1px solid #2A2A38" }}
          >
            <Copy size={14} /> {copied ? "Copiado" : "Copiar"}
          </button>
        </div>
      </Card>

      <div className="flex items-center justify-between mb-3">
        <p className="text-[15px] font-medium">Conquistas</p>
        <button onClick={() => goTo("achievements")} className="text-[12px] flex items-center gap-1" style={{ color: "#8B5CF6" }}>
          Ver todas <ChevronRight size={13} />
        </button>
      </div>
      <div className="grid grid-cols-4 gap-2.5 mb-6">
        {ACHIEVEMENTS.slice(0, 4).map((a) => {
          const Icon = a.icon;
          const isUnlocked = unlocked.includes(a.id);
          return (
            <Card key={a.id} className="p-3 flex flex-col items-center gap-1.5" style={{ opacity: isUnlocked ? 1 : 0.4 }}>
              <Icon size={18} color={isUnlocked ? "#F5B942" : "#5C5C6E"} />
              <p className="text-[10px] text-center leading-tight" style={{ color: "#8A8A9B" }}>{a.name}</p>
            </Card>
          );
        })}
      </div>

      <button
        onClick={() => goTo("pro")}
        className="w-full p-4 rounded-2xl flex items-center justify-between"
        style={{ background: "linear-gradient(135deg,#1B1530,#0F1B24)", border: "1px solid #2A2A38" }}
      >
        <div className="flex items-center gap-3">
          <Crown size={20} color="#F5B942" />
          <div className="text-left">
            <p className="text-[14px] font-medium">NEXORA PRO</p>
            <p className="text-[12px]" style={{ color: "#8A8A9B" }}>Recursos avançados de evolução</p>
          </div>
        </div>
        <ChevronRight size={16} color="#8A8A9B" />
      </button>
    </div>
  );
}

/* ---------------------------------------------------------
   Achievements / PRO
--------------------------------------------------------- */

function AchievementsPage({ profile }) {
  const unlocked = unlockedAchievements(profile);
  return (
    <div className="px-5 pt-6 pb-6">
      <h1 className="text-2xl font-semibold mb-6">Conquistas</h1>
      <div className="flex flex-col gap-3">
        {ACHIEVEMENTS.map((a) => {
          const Icon = a.icon;
          const isUnlocked = unlocked.includes(a.id);
          return (
            <Card key={a.id} className="p-4 flex items-center gap-4" style={{ opacity: isUnlocked ? 1 : 0.5 }}>
              <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: isUnlocked ? "#1B1530" : "#181822" }}>
                {isUnlocked ? <Icon size={20} color="#F5B942" /> : <Lock size={16} color="#5C5C6E" />}
              </div>
              <div className="flex-1">
                <p className="font-medium text-[14px]">{a.name}</p>
                <p className="text-[12px]" style={{ color: "#8A8A9B" }}>{a.desc}</p>
              </div>
              {isUnlocked && <Check size={16} color="#4ADE80" />}
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function ProPage() {
  const benefits = [
    "Estatísticas avançadas", "Mais desafios exclusivos", "Relatórios semanais",
    "Personalização completa", "Recursos avançados de foco", "Conteúdo exclusivo",
  ];
  return (
    <div className="px-5 pt-6 pb-6">
      <div className="text-center mb-8">
        <Crown size={32} color="#F5B942" className="mx-auto mb-3" />
        <h1 className="text-2xl font-semibold mb-2">NEXORA PRO</h1>
        <p className="text-[13px]" style={{ color: "#8A8A9B" }}>Leve sua evolução para o próximo nível.</p>
      </div>
      <Card className="p-5 mb-6">
        <div className="flex flex-col gap-3">
          {benefits.map((b) => (
            <div key={b} className="flex items-center gap-3">
              <Check size={16} color="#4ADE80" />
              <span className="text-[14px]">{b}</span>
            </div>
          ))}
        </div>
      </Card>
      <button
        disabled
        className="w-full py-3.5 rounded-xl font-semibold text-[14px]"
        style={{ background: "#181822", border: "1px solid #2A2A38", color: "#5C5C6E" }}
      >
        Em breve
      </button>
      <p className="text-[11px] text-center mt-3" style={{ color: "#5C5C6E" }}>Cobrança ainda não ativa nesta versão.</p>
    </div>
  );
}

/* ---------------------------------------------------------
   NEXORA Study
--------------------------------------------------------- */

const ACADEMIC_CHALLENGES = [
  "Estude 45 minutos sem abrir redes sociais.",
  "Refaça os exercícios da última aula que você errou.",
  "Resuma em 5 linhas o que você aprendeu hoje.",
  "Adiante 1 capítulo do material da semana.",
  "Revise suas anotações de 3 dias atrás.",
];

function StudyPage({ userId, goTo }) {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [loading, setLoading] = useState(true);
  const [focusMinutesWeek, setFocusMinutesWeek] = useState(0);

  const academicChallenge = ACADEMIC_CHALLENGES[new Date().getDate() % ACADEMIC_CHALLENGES.length];

  useEffect(() => {
    async function load() {
      const { data: taskData } = await supabase
        .from("study_tasks")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      setTasks(taskData || []);

      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const { data: sessions } = await supabase
        .from("focus_sessions")
        .select("duration_minutes")
        .eq("user_id", userId)
        .gte("completed_at", weekAgo.toISOString());
      const total = (sessions || []).reduce((sum, s) => sum + (s.duration_minutes || 0), 0);
      setFocusMinutesWeek(total);

      setLoading(false);
    }
    load();
  }, [userId]);

  async function addTask() {
    if (!newTask.trim()) return;
    const { data, error } = await supabase
      .from("study_tasks")
      .insert({ user_id: userId, title: newTask, done: false })
      .select()
      .single();
    if (!error && data) {
      setTasks((t) => [data, ...t]);
      setNewTask("");
    }
  }

  async function toggleTask(task) {
    const { error } = await supabase
      .from("study_tasks")
      .update({ done: !task.done })
      .eq("id", task.id);
    if (!error) {
      setTasks((ts) => ts.map((t) => (t.id === task.id ? { ...t, done: !t.done } : t)));
    }
  }

  async function removeTask(id) {
    const { error } = await supabase.from("study_tasks").delete().eq("id", id);
    if (!error) setTasks((ts) => ts.filter((t) => t.id !== id));
  }

  const done = tasks.filter((t) => t.done).length;
  const total = tasks.length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <div className="px-5 pt-6 pb-6">
      <div className="flex items-center gap-2 mb-1">
        <button onClick={() => goTo("home")} className="text-[13px]" style={{ color: "#8A8A9B" }}>← Voltar</button>
      </div>
      <div className="flex items-center gap-2 mb-6">
        <BookOpen size={22} color="#2DD4EE" />
        <h1 className="text-2xl font-semibold">NEXORA Study</h1>
      </div>

      <Card className="p-5 mb-6" style={{ background: "linear-gradient(145deg,#0F1620,#15121F)" }}>
        <p className="text-[12px] font-medium mb-2" style={{ color: "#2DD4EE" }}>DESAFIO ACADÊMICO</p>
        <p className="text-[15px] leading-snug">{academicChallenge}</p>
      </Card>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <Card className="p-4">
          <p className="text-[11px] mb-1" style={{ color: "#8A8A9B" }}>Foco esta semana</p>
          <p className="text-xl font-semibold">{focusMinutesWeek} <span className="text-sm font-normal" style={{ color: "#8A8A9B" }}>min</span></p>
        </Card>
        <Card className="p-4">
          <p className="text-[11px] mb-1" style={{ color: "#8A8A9B" }}>Tarefas concluídas</p>
          <p className="text-xl font-semibold">{done}<span className="text-sm font-normal" style={{ color: "#8A8A9B" }}>/{total}</span></p>
        </Card>
      </div>

      <button onClick={() => goTo("focus")} className="w-full mb-6">
        <Card className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Timer size={18} color="#8B5CF6" />
            <div className="text-left">
              <p className="text-[14px] font-medium">Cronômetro de estudo</p>
              <p className="text-[12px]" style={{ color: "#8A8A9B" }}>Use o Modo Foco para estudar sem distrações.</p>
            </div>
          </div>
          <ChevronRight size={16} color="#8A8A9B" />
        </Card>
      </button>

      <div className="flex items-center justify-between mb-3">
        <p className="text-[15px] font-medium">Lista de tarefas</p>
        {total > 0 && <span className="text-[12px]" style={{ color: "#8A8A9B" }}>{pct}% concluído</span>}
      </div>

      <div className="flex gap-2 mb-4">
        <input
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addTask()}
          placeholder="Ex: Ler capítulo 3"
          className="flex-1 px-3 py-2.5 rounded-lg text-[14px] outline-none"
          style={{ background: "#121218", border: "1px solid #1F1F29", color: "#F4F4F8" }}
        />
        <button
          onClick={addTask}
          className="px-4 rounded-lg font-medium text-[13px]"
          style={{ background: "linear-gradient(90deg,#8B5CF6,#2DD4EE)", color: "#08080D" }}
        >
          <Plus size={16} />
        </button>
      </div>

      {loading ? (
        <p className="text-[13px]" style={{ color: "#8A8A9B" }}>Carregando...</p>
      ) : tasks.length === 0 ? (
        <Card className="p-6 text-center">
          <p className="text-[14px]" style={{ color: "#8A8A9B" }}>Nenhuma tarefa ainda. Adicione a primeira acima.</p>
        </Card>
      ) : (
        <div className="flex flex-col gap-2">
          {tasks.map((t) => (
            <Card key={t.id} className="p-3 flex items-center gap-3">
              <button
                onClick={() => toggleTask(t)}
                className="w-5 h-5 rounded-md flex items-center justify-center shrink-0"
                style={{ background: t.done ? "#4ADE80" : "transparent", border: t.done ? "none" : "1px solid #2A2A38" }}
              >
                {t.done && <Check size={13} color="#08080D" />}
              </button>
              <p
                className="flex-1 text-[14px]"
                style={{ color: t.done ? "#5C5C6E" : "#F4F4F8", textDecoration: t.done ? "line-through" : "none" }}
              >
                {t.title}
              </p>
              <button onClick={() => removeTask(t.id)}>
                <X size={15} color="#5C5C6E" />
              </button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------------------------------------------------------
   NEXORA Business
--------------------------------------------------------- */

const BUSINESS_CHALLENGES = [
  "Contacte 3 clientes potenciais hoje.",
  "Publique um produto ou serviço novo.",
  "Crie um anúncio para o seu negócio.",
  "Envie uma proposta que você vem adiando.",
  "Responda todos os clientes pendentes.",
  "Estude 20 minutos sobre técnicas de venda.",
  "Crie uma peça de conteúdo para suas redes.",
];

function BusinessPage({ userId, goTo }) {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [loading, setLoading] = useState(true);

  const businessChallenge = BUSINESS_CHALLENGES[new Date().getDate() % BUSINESS_CHALLENGES.length];

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("business_tasks")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      setTasks(data || []);
      setLoading(false);
    }
    load();
  }, [userId]);

  async function addTask() {
    if (!newTask.trim()) return;
    const { data, error } = await supabase
      .from("business_tasks")
      .insert({ user_id: userId, title: newTask, done: false })
      .select()
      .single();
    if (!error && data) {
      setTasks((t) => [data, ...t]);
      setNewTask("");
    }
  }

  async function toggleTask(task) {
    const { error } = await supabase
      .from("business_tasks")
      .update({ done: !task.done })
      .eq("id", task.id);
    if (!error) {
      setTasks((ts) => ts.map((t) => (t.id === task.id ? { ...t, done: !t.done } : t)));
    }
  }

  async function removeTask(id) {
    const { error } = await supabase.from("business_tasks").delete().eq("id", id);
    if (!error) setTasks((ts) => ts.filter((t) => t.id !== id));
  }

  const done = tasks.filter((t) => t.done).length;
  const total = tasks.length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <div className="px-5 pt-6 pb-6">
      <div className="flex items-center gap-2 mb-1">
        <button onClick={() => goTo("home")} className="text-[13px]" style={{ color: "#8A8A9B" }}>← Voltar</button>
      </div>
      <div className="flex items-center gap-2 mb-2">
        <Briefcase size={22} color="#F5B942" />
        <h1 className="text-2xl font-semibold">NEXORA Business</h1>
      </div>
      <p className="text-[13px] mb-6" style={{ color: "#8A8A9B" }}>Menos planejamento. Mais execução.</p>

      <Card className="p-5 mb-6" style={{ background: "linear-gradient(145deg,#1B1530,#15121F)" }}>
        <p className="text-[12px] font-medium mb-2" style={{ color: "#F5B942" }}>DESAFIO DE NEGÓCIO</p>
        <p className="text-[15px] leading-snug">{businessChallenge}</p>
      </Card>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <Card className="p-4">
          <p className="text-[11px] mb-1" style={{ color: "#8A8A9B" }}>Tarefas concluídas</p>
          <p className="text-xl font-semibold">{done}<span className="text-sm font-normal" style={{ color: "#8A8A9B" }}>/{total}</span></p>
        </Card>
        <Card className="p-4">
          <p className="text-[11px] mb-1" style={{ color: "#8A8A9B" }}>Progresso</p>
          <p className="text-xl font-semibold">{pct}%</p>
        </Card>
      </div>

      <div className="flex items-center justify-between mb-3">
        <p className="text-[15px] font-medium">Tarefas de execução</p>
      </div>

      <div className="flex gap-2 mb-4">
        <input
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addTask()}
          placeholder="Ex: Ligar para 5 leads"
          className="flex-1 px-3 py-2.5 rounded-lg text-[14px] outline-none"
          style={{ background: "#121218", border: "1px solid #1F1F29", color: "#F4F4F8" }}
        />
        <button
          onClick={addTask}
          className="px-4 rounded-lg font-medium text-[13px]"
          style={{ background: "linear-gradient(90deg,#F5B942,#8B5CF6)", color: "#08080D" }}
        >
          <Plus size={16} />
        </button>
      </div>

      {loading ? (
        <p className="text-[13px]" style={{ color: "#8A8A9B" }}>Carregando...</p>
      ) : tasks.length === 0 ? (
        <Card className="p-6 text-center">
          <p className="text-[14px]" style={{ color: "#8A8A9B" }}>Nenhuma tarefa ainda. Adicione a primeira acima.</p>
        </Card>
      ) : (
        <div className="flex flex-col gap-2">
          {tasks.map((t) => (
            <Card key={t.id} className="p-3 flex items-center gap-3">
              <button
                onClick={() => toggleTask(t)}
                className="w-5 h-5 rounded-md flex items-center justify-center shrink-0"
                style={{ background: t.done ? "#4ADE80" : "transparent", border: t.done ? "none" : "1px solid #2A2A38" }}
              >
                {t.done && <Check size={13} color="#08080D" />}
              </button>
              <p
                className="flex-1 text-[14px]"
                style={{ color: t.done ? "#5C5C6E" : "#F4F4F8", textDecoration: t.done ? "line-through" : "none" }}
              >
                {t.title}
              </p>
              <button onClick={() => removeTask(t.id)}>
                <X size={15} color="#5C5C6E" />
              </button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------------------------------------------------------
   Root App
--------------------------------------------------------- */

export default function NexoraApp() {
  const [screen, setScreen] = useState("boot"); // boot | landing | auth | app
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [goals, setGoals] = useState([]);
  const [tab, setTab] = useState("home");
  const [toastMsg, setToastMsg] = useState("");
  const [challengeStatus, setChallengeStatus] = useState("idle");
  const [challengeText] = useState(
    DAILY_CHALLENGES[new Date().getDate() % DAILY_CHALLENGES.length]
  );

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setSession(data.session);
      } else {
        setScreen("landing");
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(sess);
      if (!sess) {
        setProfile(null);
        setGoals([]);
        setScreen("landing");
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) return;

    async function loadData() {
      let { data: prof } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      // fallback: se o trigger ainda não criou o perfil, tenta de novo em 1s
      if (!prof) {
        await new Promise((r) => setTimeout(r, 1000));
        const retry = await supabase.from("profiles").select("*").eq("id", session.user.id).single();
        prof = retry.data;
      }

      const { data: goalsData } = await supabase
        .from("goals")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      // reset diário do desafio: se last_challenge_date não é hoje, status volta a idle
      if (prof && prof.last_challenge_date === todayStr()) {
        setChallengeStatus("done");
      } else {
        setChallengeStatus("idle");
      }

      setProfile(prof);
      setGoals(goalsData || []);
      setScreen("app");
    }

    loadData();
  }, [session]);

  function showToast(msg) {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 2200);
  }

  async function updateProfile(fields) {
    const { error } = await supabase.from("profiles").update(fields).eq("id", session.user.id);
    if (!error) setProfile((p) => ({ ...p, ...fields }));
  }

  function acceptChallenge() {
    setChallengeStatus("accepted");
  }
  function startChallenge() {
    setChallengeStatus("active");
  }
  async function completeChallenge() {
    setChallengeStatus("done");
    await updateProfile({
      xp: profile.xp + 50,
      streak: profile.streak + 1,
      challenges_done: profile.challenges_done + 1,
      last_challenge_date: todayStr(),
    });
    showToast("Desafio concluído · +50 XP");
  }

  async function onFocusSessionComplete(minutes) {
    await supabase.from("focus_sessions").insert({ user_id: session.user.id, duration_minutes: minutes });
    await updateProfile({ xp: profile.xp + 20 });
    showToast("Sessão concluída. Você acabou de investir no seu futuro. · +20 XP");
  }

  async function onGoalCompleted() {
    await updateProfile({ xp: profile.xp + 100 });
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    setTab("home");
  }

  if (screen === "boot") return <div style={{ maxWidth: 480, margin: "0 auto" }}><Loading /></div>;

  if (screen === "landing") {
    return (
      <div style={{ maxWidth: 480, margin: "0 auto", fontFamily: "Inter, system-ui, sans-serif" }}>
        <style>{`@keyframes nexora-toast{from{opacity:0;transform:translate(-50%,8px)}to{opacity:1;transform:translate(-50%,0)}}`}</style>
        <Landing onEnter={() => setScreen("auth")} />
      </div>
    );
  }

  if (screen === "auth") {
    return (
      <div style={{ maxWidth: 480, margin: "0 auto", fontFamily: "Inter, system-ui, sans-serif" }}>
        <Auth onAuthed={() => {}} />
      </div>
    );
  }

  if (screen === "app" && (!profile || !session)) {
    return <div style={{ maxWidth: 480, margin: "0 auto" }}><Loading /></div>;
  }

  const navItems = [
    { id: "home", icon: Home, label: "Início" },
    { id: "goals", icon: Target, label: "Metas" },
    { id: "focus", icon: Timer, label: "Foco" },
    { id: "rank", icon: Trophy, label: "Rank" },
    { id: "profile", icon: User, label: "Perfil" },
  ];

  return (
    <div
      style={{
        maxWidth: 480, margin: "0 auto", background: "#08080D", color: "#F4F4F8",
        minHeight: "100%", fontFamily: "Inter, system-ui, sans-serif", position: "relative", paddingBottom: "76px",
      }}
    >
      <style>{`@keyframes nexora-toast{from{opacity:0;transform:translate(-50%,8px)}to{opacity:1;transform:translate(-50%,0)}}`}</style>

      {tab === "home" && (
        <Dashboard
          profile={profile}
          challengeStatus={challengeStatus}
          challengeText={challengeText}
          onAcceptChallenge={acceptChallenge}
          onStartChallenge={startChallenge}
          onCompleteChallenge={completeChallenge}
          goTo={setTab}
        />
      )}
      {tab === "goals" && (
        <Goals goals={goals} userId={session.user.id} onGoalsChanged={setGoals} onGoalCompleted={onGoalCompleted} toast={showToast} />
      )}
      {tab === "focus" && <Focus onSessionComplete={onFocusSessionComplete} />}
      {tab === "study" && <StudyPage userId={session.user.id} goTo={setTab} />}
      {tab === "business" && <BusinessPage userId={session.user.id} goTo={setTab} />}
      {tab === "rank" && <Ranking userId={session.user.id} />}
      {tab === "profile" && <Profile profile={profile} goals={goals} goTo={setTab} onLogout={handleLogout} />}
      {tab === "achievements" && (
        <div>
          <div className="px-5 pt-4">
            <button onClick={() => setTab("profile")} className="text-[13px]" style={{ color: "#8A8A9B" }}>← Voltar</button>
          </div>
          <AchievementsPage profile={profile} />
        </div>
      )}
      {tab === "pro" && (
        <div>
          <div className="px-5 pt-4">
            <button onClick={() => setTab("profile")} className="text-[13px]" style={{ color: "#8A8A9B" }}>← Voltar</button>
          </div>
          <ProPage />
        </div>
      )}

      <Toast message={toastMsg} />

      <div className="fixed bottom-0 left-0 right-0" style={{ maxWidth: 480, margin: "0 auto" }}>
        <div className="flex items-center justify-around py-2.5" style={{ background: "#0D0D13", borderTop: "1px solid #1F1F29" }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = tab === item.id || (item.id === "profile" && ["achievements", "pro"].includes(tab));
            return (
              <button key={item.id} onClick={() => setTab(item.id)} className="flex flex-col items-center gap-1 px-3 py-1">
                <Icon size={20} color={active ? "#2DD4EE" : "#5C5C6E"} />
                <span className="text-[10px] font-medium" style={{ color: active ? "#2DD4EE" : "#5C5C6E" }}>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
