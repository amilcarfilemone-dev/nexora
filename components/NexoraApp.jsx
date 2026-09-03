"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Flame, Star, Trophy, CheckCircle2, Timer, Target, User, Home,
  Plus, X, Check, ChevronRight, Copy, Users, TrendingUp, Award,
  BookOpen, Briefcase, Zap, Crown, Lock, ArrowRight, Play, Pause,
  RotateCcw, Sparkles
} from "lucide-react";

const LEVELS = [
  { n: 1, name: "Iniciante", min: 0 },
  { n: 2, name: "Determinado", min: 200 },
  { n: 3, name: "Disciplinado", min: 500 },
  { n: 4, name: "Focado", min: 1000 },
  { n: 5, name: "Evoluído", min: 1800 },
  { n: 6, name: "Imparável", min: 3000 },
];

const ACHIEVEMENTS = [
  { id: "a1", icon: Flame, name: "Primeira Vitória", desc: "Conclua seu primeiro desafio", unlocked: true },
  { id: "a2", icon: Zap, name: "7 Dias", desc: "Mantenha 7 dias de sequência", unlocked: true },
  { id: "a3", icon: Target, name: "10 Desafios", desc: "Conclua 10 desafios", unlocked: true },
  { id: "a4", icon: BookOpen, name: "Foco nos Estudos", desc: "5 sessões de foco em Study", unlocked: false },
  { id: "a5", icon: Briefcase, name: "Máquina de Execução", desc: "10 tarefas em Business", unlocked: false },
  { id: "a6", icon: Trophy, name: "30 Dias", desc: "Sequência de 30 dias", unlocked: false },
  { id: "a7", icon: Crown, name: "NEXORA Elite", desc: "Alcance o Nível 6", unlocked: false },
];

const DAILY_CHALLENGES = [
  "Dedique 25 minutos à tarefa que você está adiando.",
  "Beba 2 litros de água e anote como se sentiu.",
  "Escreva 3 coisas que você fez bem esta semana.",
  "Envie uma proposta ou contacto que você vem adiando.",
  "Estude 30 minutos sem abrir redes sociais.",
];

const RANKING = [
  { name: "Kianda M.", xp: 4820 },
  { name: "Você", xp: 1240, isUser: true },
  { name: "Edson T.", xp: 3990 },
  { name: "Ruth A.", xp: 2870 },
  { name: "Fabrice N.", xp: 2510 },
  { name: "Nídia K.", xp: 1890 },
  { name: "Bruno S.", xp: 1660 },
].sort((a, b) => b.xp - a.xp);

function levelFor(xp) {
  let current = LEVELS[0];
  for (const l of LEVELS) if (xp >= l.min) current = l;
  const idx = LEVELS.indexOf(current);
  const next = LEVELS[idx + 1] || null;
  const pct = next ? Math.min(100, Math.round(((xp - current.min) / (next.min - current.min)) * 100)) : 100;
  return { current, next, pct };
}

function todayKey(offset = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
}

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
      style={{
        background: "#121218",
        border: "1px solid #1F1F29",
        ...style,
      }}
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
                  background:
                    i === 6
                      ? "linear-gradient(180deg,#2DD4EE,#8B5CF6)"
                      : "#181822",
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
              <span
                className="text-[13px] font-semibold shrink-0 pt-0.5"
                style={{ color: "#8B5CF6" }}
              >
                {s.n}
              </span>
              <div>
                <p className="font-medium text-[15px] mb-1">{s.t}</p>
                <p className="text-[13px]" style={{ color: "#8A8A9B" }}>
                  {s.d}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <div className="px-5 pb-16">
        <Card className="p-6" style={{ background: "linear-gradient(145deg,#121218,#15121F)" }}>
          <p className="text-[15px] leading-relaxed mb-4">
            Desafios diários, metas, hábitos, um cronômetro de foco e um
            sistema de progresso feito para uma coisa: fazer você agir.
          </p>
          <div className="flex flex-wrap gap-2">
            {["Desafios", "Metas", "Foco", "XP & Níveis", "Streak", "Ranking"].map((t) => (
              <span
                key={t}
                className="text-[12px] px-3 py-1.5 rounded-full"
                style={{ background: "#181822", border: "1px solid #2A2A38", color: "#B4B4C4" }}
              >
                {t}
              </span>
            ))}
          </div>
        </Card>
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

function Dashboard({ state, onAcceptChallenge, onStartChallenge, onCompleteChallenge, goTo }) {
  const { xp, streak, challengesDone, challenge } = state;
  const { current, next, pct } = levelFor(xp);
  const todayProgress = challenge.status === "done" ? 100 : challenge.status === "active" ? 55 : challenge.status === "accepted" ? 20 : 0;

  return (
    <div className="px-5 pt-6 pb-6">
      <p className="text-[13px] mb-1" style={{ color: "#8A8A9B" }}>
        Meu NEXORA
      </p>
      <h1 className="text-2xl font-semibold mb-6">
        Olá, Marcos. Pronto para evoluir hoje?
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
          <p className="text-2xl font-semibold">{challengesDone}</p>
        </Card>
      </div>

      <Card className="p-4 mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[13px]" style={{ color: "#8A8A9B" }}>Progresso de hoje</span>
          <span className="text-[13px] font-medium">{todayProgress}%</span>
        </div>
        <div className="h-2 rounded-full overflow-hidden" style={{ background: "#1F1F29" }}>
          <div
            className="h-full rounded-full"
            style={{ width: `${todayProgress}%`, background: "linear-gradient(90deg,#8B5CF6,#2DD4EE)" }}
          />
        </div>
      </Card>

      <Card className="p-5 mb-6" style={{ background: "linear-gradient(145deg,#15121F,#0F1620)" }}>
        <p className="text-[12px] font-medium mb-2" style={{ color: "#8B5CF6" }}>DESAFIO DE HOJE</p>
        <p className="text-[16px] leading-snug mb-5">{challenge.text}</p>

        {challenge.status === "idle" && (
          <button
            onClick={onAcceptChallenge}
            className="w-full py-3 rounded-xl font-semibold text-[14px]"
            style={{ background: "linear-gradient(90deg,#8B5CF6,#2DD4EE)", color: "#08080D" }}
          >
            Aceitar desafio
          </button>
        )}
        {challenge.status === "accepted" && (
          <button
            onClick={onStartChallenge}
            className="w-full py-3 rounded-xl font-semibold text-[14px] flex items-center justify-center gap-2"
            style={{ background: "#181822", border: "1px solid #2A2A38" }}
          >
            <Play size={15} /> Iniciar
          </button>
        )}
        {challenge.status === "active" && (
          <button
            onClick={onCompleteChallenge}
            className="w-full py-3 rounded-xl font-semibold text-[14px] flex items-center justify-center gap-2"
            style={{ background: "#181822", border: "1px solid #2A2A38" }}
          >
            <Check size={15} /> Marcar como concluído
          </button>
        )}
        {challenge.status === "done" && (
          <div className="text-center">
            <p className="font-semibold text-[14px] mb-1" style={{ color: "#4ADE80" }}>
              Desafio concluído · +50 XP
            </p>
            <p className="text-[13px]" style={{ color: "#8A8A9B" }}>
              Mais uma vitória. Continue avançando.
            </p>
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
    </div>
  );
}

function Focus({ addXp, toast }) {
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
          addXp(20);
          toast("Sessão concluída. Você acabou de investir no seu futuro. · +20 XP");
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
      <p className="text-[14px] mb-8 self-start" style={{ color: "#8A8A9B" }}>
        Foco total. Zero desculpas.
      </p>

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
            cx="112"
            cy="112"
            r={r}
            fill="none"
            stroke="url(#focusGrad)"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
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
        <button
          onClick={reset}
          className="p-3.5 rounded-xl"
          style={{ background: "#181822", border: "1px solid #2A2A38" }}
        >
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

const CATEGORIES = ["Estudos", "Carreira", "Saúde", "Finanças", "Pessoal"];

function Goals({ goals, setGoals, addXp, toast }) {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [days, setDays] = useState(30);

  function createGoal() {
    if (!title.trim()) return;
    setGoals((g) => [
      ...g,
      { id: Date.now(), title, category, progress: 0, days, done: false },
    ]);
    setTitle("");
    setShowForm(false);
  }

  function updateProgress(id, delta) {
    setGoals((gs) =>
      gs.map((g) => {
        if (g.id !== id) return g;
        const progress = Math.max(0, Math.min(100, g.progress + delta));
        const justCompleted = progress === 100 && g.progress !== 100;
        if (justCompleted) {
          addXp(100);
          toast("Meta concluída · +100 XP");
        }
        return { ...g, progress, done: progress === 100 };
      })
    );
  }

  function removeGoal(id) {
    setGoals((gs) => gs.filter((g) => g.id !== id));
  }

  return (
    <div className="px-5 pt-6 pb-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-se
