import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ShieldCheck, GithubLogo } from "@phosphor-icons/react";
import ClassicalPanel from "./components/ClassicalPanel.jsx";
import ModernPanel from "./components/ModernPanel.jsx";

const TABS = [
  { id: "classical", label: "Classical" },
  { id: "modern", label: "Modern" },
];

export default function App() {
  const [tab, setTab] = useState("classical");

  return (
    <div className="min-h-[100dvh] bg-[var(--bg)]">
      <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-[rgba(8,9,13,0.82)] backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-[var(--encrypt)] text-[#08090d]">
              <ShieldCheck size={18} weight="bold" />
            </span>
            <span className="text-lg font-semibold tracking-tight">CryptoLab</span>
          </div>
          <nav className="flex items-center gap-1 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-1">
            {TABS.map((t) => {
              const active = tab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className="relative rounded-md px-4 py-1.5 text-sm transition"
                  style={{ color: active ? "#08090d" : "var(--text-dim)" }}
                >
                  {active && (
                    <motion.span
                      layoutId="tab-pill"
                      className="absolute inset-0 rounded-md bg-[var(--encrypt)]"
                      transition={{ type: "spring", stiffness: 400, damping: 32 }}
                    />
                  )}
                  <span className="relative">{t.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-[1200px] px-4 pt-8 pb-6">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Encrypt, decrypt, understand.
        </h1>
        <p className="mt-1.5 max-w-xl text-sm text-[var(--text-dim)]">
          Explore classic ciphers and real browser-native crypto: hashing, AES-GCM, and RSA key pairs.
        </p>
      </div>

      <main className="mx-auto max-w-[1200px] px-4 pb-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22 }}
          >
            {tab === "classical" ? <ClassicalPanel /> : <ModernPanel />}
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="border-t border-[var(--border)]">
        <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-3 px-4 py-6 text-sm text-[var(--text-dim)]">
          <span>Built by D L Narayana</span>
          <div className="flex items-center gap-4">
            <span className="mono text-xs">All crypto runs locally. React · Vite · Web Crypto API</span>
            <a
              href="https://github.com/Rahul777111"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 transition hover:text-[var(--text)]"
            >
              <GithubLogo size={18} weight="fill" /> Rahul777111
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
