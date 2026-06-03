import { useState, useMemo } from "react";
import { motion } from "motion/react";
import { Copy, Check, ArrowsLeftRight, LockSimple, LockSimpleOpen } from "@phosphor-icons/react";
import { CLASSICAL } from "../crypto/classical.js";

const ALPHA = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export default function ClassicalPanel() {
  const [cipherId, setCipherId] = useState("caesar");
  const [mode, setMode] = useState("encrypt");
  const [input, setInput] = useState("The quick brown fox jumps over the lazy dog");
  const [params, setParams] = useState({ shift: 3 });
  const [copied, setCopied] = useState(false);

  const cipher = CLASSICAL[cipherId];

  const setCipher = (id) => {
    setCipherId(id);
    const next = {};
    CLASSICAL[id].params.forEach((p) => (next[p.key] = p.default));
    setParams(next);
  };

  const output = useMemo(() => {
    try {
      return mode === "encrypt"
        ? cipher.encrypt(input, params)
        : cipher.decrypt(input, params);
    } catch {
      return "";
    }
  }, [cipher, input, params, mode]);

  const copy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  const swap = () => {
    setInput(output);
    setMode((m) => (m === "encrypt" ? "decrypt" : "encrypt"));
  };

  const mapShift = cipher.showMapping ? cipher.mappingShift(params) : 0;

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
      {/* input side */}
      <div className="flex flex-col gap-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
        <div className="flex flex-wrap gap-2">
          {Object.entries(CLASSICAL).map(([id, c]) => (
            <button
              key={id}
              onClick={() => setCipher(id)}
              className="rounded-lg px-3 py-1.5 text-sm transition active:scale-[0.97]"
              style={{
                backgroundColor: cipherId === id ? "var(--elevated)" : "transparent",
                color: cipherId === id ? "var(--text)" : "var(--text-dim)",
                border: `1px solid ${cipherId === id ? "var(--border)" : "transparent"}`,
              }}
            >
              {c.name}
            </button>
          ))}
        </div>

        <p className="text-xs leading-relaxed text-[var(--text-dim)]">{cipher.description}</p>

        {/* mode toggle */}
        <div className="flex w-fit rounded-lg border border-[var(--border)] bg-[var(--bg)] p-1">
          {["encrypt", "decrypt"].map((m) => {
            const active = mode === m;
            const color = m === "encrypt" ? "var(--encrypt)" : "var(--decrypt)";
            return (
              <button
                key={m}
                onClick={() => setMode(m)}
                className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition"
                style={{
                  backgroundColor: active ? color : "transparent",
                  color: active ? "#08090d" : "var(--text-dim)",
                }}
              >
                {m === "encrypt" ? <LockSimple size={15} weight="bold" /> : <LockSimpleOpen size={15} weight="bold" />}
                {m === "encrypt" ? "Encrypt" : "Decrypt"}
              </button>
            );
          })}
        </div>

        {/* params */}
        {cipher.params.length > 0 && (
          <div className="flex flex-wrap gap-3">
            {cipher.params.map((p) => (
              <label key={p.key} className="flex flex-1 flex-col gap-1 text-xs text-[var(--text-dim)]">
                {p.label}
                <input
                  type={p.type}
                  value={params[p.key] ?? ""}
                  onChange={(e) =>
                    setParams((prev) => ({ ...prev, [p.key]: e.target.value }))
                  }
                  className="mono rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm text-[var(--text)] outline-none focus:border-[var(--encrypt)]"
                />
              </label>
            ))}
          </div>
        )}

        {/* alphabet mapping for caesar */}
        {cipher.showMapping && (
          <div className="overflow-x-auto">
            <div className="mono flex gap-[3px] text-[11px]">
              {ALPHA.map((ch, i) => {
                const mapped = ALPHA[(i + mapShift + 2600) % 26];
                return (
                  <div key={ch} className="flex flex-col items-center">
                    <span className="text-[var(--text-dim)]">{ch}</span>
                    <span className="text-[var(--text-dim)]">↓</span>
                    <motion.span
                      key={mapped}
                      initial={{ opacity: 0.4 }}
                      animate={{ opacity: 1 }}
                      className="font-semibold text-[var(--encrypt)]"
                    >
                      {mapped}
                    </motion.span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <label className="flex flex-1 flex-col gap-1 text-xs text-[var(--text-dim)]">
          Input text
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={6}
            className="mono rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm leading-relaxed text-[var(--text)] outline-none focus:border-[var(--encrypt)]"
          />
        </label>
      </div>

      {/* output side */}
      <div className="flex flex-col gap-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-dim)]">
            {mode === "encrypt" ? "Ciphertext" : "Plaintext"}
          </span>
          <div className="flex gap-2">
            <button
              onClick={swap}
              className="flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--elevated)] px-3 py-1.5 text-xs text-[var(--text)] transition hover:border-[var(--decrypt)] active:scale-[0.97]"
            >
              <ArrowsLeftRight size={14} weight="bold" /> Swap
            </button>
            <button
              onClick={copy}
              className="flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--elevated)] px-3 py-1.5 text-xs text-[var(--text)] transition hover:border-[var(--encrypt)] active:scale-[0.97]"
            >
              {copied ? <Check size={14} weight="bold" /> : <Copy size={14} weight="bold" />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
        </div>

        <div className="mono min-h-[220px] flex-1 whitespace-pre-wrap break-words rounded-lg border border-[var(--border)] bg-[var(--bg)] p-4 text-sm leading-relaxed text-[var(--hex)]">
          {output || <span className="text-[var(--text-dim)]">Output appears here.</span>}
        </div>

        <div className="mono flex justify-between text-xs text-[var(--text-dim)]">
          <span>Input: {input.length} chars</span>
          <span>Output: {output.length} chars</span>
        </div>
      </div>
    </div>
  );
}
