import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Hash, Lock, Key, Copy, Check, CircleNotch, Warning } from "@phosphor-icons/react";
import {
  HASHES,
  hmacSha256,
  aesGcmEncrypt,
  aesGcmDecrypt,
  generateRsaKeyPair,
  rsaEncrypt,
  rsaDecrypt,
} from "../crypto/modern.js";

const SUBTABS = [
  { id: "hash", label: "Hash", icon: Hash },
  { id: "aes", label: "AES-GCM", icon: Lock },
  { id: "rsa", label: "RSA", icon: Key },
];

function CopyBtn({ text }) {
  const [done, setDone] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text);
        setDone(true);
        setTimeout(() => setDone(false), 1200);
      }}
      className="flex items-center gap-1 rounded-md border border-[var(--border)] bg-[var(--elevated)] px-2 py-1 text-[11px] text-[var(--text-dim)] transition hover:text-[var(--text)]"
    >
      {done ? <Check size={12} weight="bold" /> : <Copy size={12} weight="bold" />}
      {done ? "Copied" : "Copy"}
    </button>
  );
}

function MonoBox({ value, placeholder, accent = "var(--hex)", min = "120px" }) {
  return (
    <div
      className="mono whitespace-pre-wrap break-all rounded-lg border border-[var(--border)] bg-[var(--bg)] p-3 text-xs leading-relaxed"
      style={{ color: value ? accent : "var(--text-dim)", minHeight: min }}
    >
      {value || placeholder}
    </div>
  );
}

function HashTab() {
  const [text, setText] = useState("Hello, CryptoLab");
  const [algo, setAlgo] = useState("SHA-256");
  const [hmacKey, setHmacKey] = useState("");
  const [out, setOut] = useState("");

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const result =
          algo === "HMAC" ? await hmacSha256(text, hmacKey) : await HASHES[algo].fn(text);
        if (active) setOut(result);
      } catch {
        if (active) setOut("");
      }
    })();
    return () => {
      active = false;
    };
  }, [text, algo, hmacKey]);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap gap-2">
          {[...Object.keys(HASHES), "HMAC"].map((k) => (
            <button
              key={k}
              onClick={() => setAlgo(k)}
              className="rounded-lg px-3 py-1.5 text-sm transition"
              style={{
                backgroundColor: algo === k ? "var(--elevated)" : "transparent",
                color: algo === k ? "var(--text)" : "var(--text-dim)",
                border: `1px solid ${algo === k ? "var(--border)" : "transparent"}`,
              }}
            >
              {k === "HMAC" ? "HMAC-SHA256" : k}
            </button>
          ))}
        </div>
        {algo === "HMAC" && (
          <input
            value={hmacKey}
            onChange={(e) => setHmacKey(e.target.value)}
            placeholder="HMAC secret key"
            className="mono rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm text-[var(--text)] outline-none focus:border-[var(--encrypt)]"
          />
        )}
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={8}
          className="mono rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm text-[var(--text)] outline-none focus:border-[var(--encrypt)]"
        />
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-dim)]">
            Digest
          </span>
          <CopyBtn text={out} />
        </div>
        <MonoBox value={out} placeholder="Hash output" min="180px" />
        <span className="mono text-xs text-[var(--text-dim)]">
          {out ? `${out.length * 4} bits · ${out.length} hex chars` : ""}
        </span>
      </div>
    </div>
  );
}

function AesTab() {
  const [text, setText] = useState("Top secret message");
  const [pw, setPw] = useState("correct horse battery staple");
  const [bundle, setBundle] = useState(null);
  const [decPw, setDecPw] = useState("");
  const [decOut, setDecOut] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const encrypt = async () => {
    setBusy(true);
    setErr("");
    try {
      const b = await aesGcmEncrypt(text, pw);
      setBundle(b);
      setDecPw(pw);
      setDecOut("");
    } catch (e) {
      setErr(String(e.message || e));
    }
    setBusy(false);
  };

  const decrypt = async () => {
    if (!bundle) return;
    setErr("");
    try {
      const plain = await aesGcmDecrypt(bundle, decPw);
      setDecOut(plain);
    } catch {
      setDecOut("");
      setErr("Decryption failed. Wrong password or tampered ciphertext.");
    }
  };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="flex flex-col gap-3 rounded-xl border border-[var(--border)] bg-[var(--bg)] p-4">
        <span className="text-xs font-semibold uppercase tracking-wider text-[var(--encrypt)]">Encrypt</span>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={3}
          placeholder="Plaintext"
          className="mono rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text)] outline-none focus:border-[var(--encrypt)]"
        />
        <input
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          placeholder="Password"
          className="mono rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text)] outline-none focus:border-[var(--encrypt)]"
        />
        <button
          onClick={encrypt}
          disabled={busy}
          className="flex items-center justify-center gap-1.5 rounded-lg bg-[var(--encrypt)] px-4 py-2 text-sm font-medium text-[#08090d] transition hover:brightness-110 active:scale-[0.98] disabled:opacity-60"
        >
          {busy ? <CircleNotch size={15} className="animate-spin" /> : <Lock size={15} weight="bold" />}
          Encrypt
        </button>
        {bundle && (
          <div className="flex flex-col gap-2 text-xs">
            <Field label="Ciphertext (base64)" value={bundle.cipher} />
            <Field label="IV" value={bundle.iv} />
            <Field label="Salt" value={bundle.salt} />
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-[var(--border)] bg-[var(--bg)] p-4">
        <span className="text-xs font-semibold uppercase tracking-wider text-[var(--decrypt)]">Decrypt</span>
        <input
          value={decPw}
          onChange={(e) => setDecPw(e.target.value)}
          placeholder="Password"
          className="mono rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text)] outline-none focus:border-[var(--decrypt)]"
        />
        <button
          onClick={decrypt}
          disabled={!bundle}
          className="flex items-center justify-center gap-1.5 rounded-lg bg-[var(--decrypt)] px-4 py-2 text-sm font-medium text-[#08090d] transition hover:brightness-110 active:scale-[0.98] disabled:opacity-40"
        >
          <Key size={15} weight="bold" /> Decrypt
        </button>
        {decOut && (
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-dim)]">Recovered</span>
            <MonoBox value={decOut} accent="var(--encrypt)" min="80px" />
          </div>
        )}
        {err && (
          <p className="flex items-center gap-1.5 rounded-lg bg-[#2a1620] px-3 py-2 text-xs text-[var(--error)]">
            <Warning size={14} weight="fill" /> {err}
          </p>
        )}
        <p className="text-xs leading-relaxed text-[var(--text-dim)]">
          AES-256-GCM with a key derived from your password via PBKDF2 (100k iterations).
        </p>
      </div>
    </div>
  );
}

function Field({ label, value }) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="text-[var(--text-dim)]">{label}</span>
        <CopyBtn text={value} />
      </div>
      <MonoBox value={value} min="auto" />
    </div>
  );
}

function RsaTab() {
  const [keys, setKeys] = useState(null);
  const [gen, setGen] = useState(false);
  const [msg, setMsg] = useState("Asymmetric crypto is elegant");
  const [cipher, setCipher] = useState("");
  const [plain, setPlain] = useState("");
  const [err, setErr] = useState("");

  const generate = async () => {
    setGen(true);
    setErr("");
    setCipher("");
    setPlain("");
    try {
      const k = await generateRsaKeyPair();
      setKeys(k);
    } catch (e) {
      setErr(String(e.message || e));
    }
    setGen(false);
  };

  const encrypt = async () => {
    if (!keys) return;
    setErr("");
    try {
      setCipher(await rsaEncrypt(msg, keys.publicKeyPem));
      setPlain("");
    } catch (e) {
      setErr(String(e.message || e));
    }
  };

  const decrypt = async () => {
    if (!keys || !cipher) return;
    setErr("");
    try {
      setPlain(await rsaDecrypt(cipher, keys.privateKeyPem));
    } catch (e) {
      setErr(String(e.message || e));
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <button
        onClick={generate}
        disabled={gen}
        className="flex w-fit items-center gap-1.5 rounded-lg bg-[var(--encrypt)] px-4 py-2 text-sm font-medium text-[#08090d] transition hover:brightness-110 active:scale-[0.98] disabled:opacity-60"
      >
        {gen ? <CircleNotch size={15} className="animate-spin" /> : <Key size={15} weight="bold" />}
        {keys ? "Regenerate Key Pair" : "Generate Key Pair"}
      </button>

      {keys && (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <div className="mb-1 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-[var(--encrypt)]">Public key</span>
                <CopyBtn text={keys.publicKeyPem} />
              </div>
              <MonoBox value={keys.publicKeyPem} min="160px" accent="var(--text-dim)" />
            </div>
            <div>
              <div className="mb-1 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-[var(--decrypt)]">Private key</span>
                <CopyBtn text={keys.privateKeyPem} />
              </div>
              <MonoBox value={keys.privateKeyPem} min="160px" accent="var(--text-dim)" />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex flex-col gap-2 rounded-xl border border-[var(--border)] bg-[var(--bg)] p-4">
              <input
                value={msg}
                onChange={(e) => setMsg(e.target.value)}
                className="mono rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text)] outline-none focus:border-[var(--encrypt)]"
              />
              <button
                onClick={encrypt}
                className="flex items-center justify-center gap-1.5 rounded-lg bg-[var(--encrypt)] px-4 py-2 text-sm font-medium text-[#08090d] transition hover:brightness-110 active:scale-[0.98]"
              >
                <Lock size={15} weight="bold" /> Encrypt with public key
              </button>
              <MonoBox value={cipher} placeholder="Ciphertext (base64)" min="80px" />
            </div>
            <div className="flex flex-col gap-2 rounded-xl border border-[var(--border)] bg-[var(--bg)] p-4">
              <button
                onClick={decrypt}
                disabled={!cipher}
                className="flex items-center justify-center gap-1.5 rounded-lg bg-[var(--decrypt)] px-4 py-2 text-sm font-medium text-[#08090d] transition hover:brightness-110 active:scale-[0.98] disabled:opacity-40"
              >
                <Key size={15} weight="bold" /> Decrypt with private key
              </button>
              <MonoBox value={plain} placeholder="Recovered plaintext" accent="var(--encrypt)" min="80px" />
            </div>
          </div>
        </>
      )}
      {err && (
        <p className="flex items-center gap-1.5 rounded-lg bg-[#2a1620] px-3 py-2 text-xs text-[var(--error)]">
          <Warning size={14} weight="fill" /> {err}
        </p>
      )}
      <p className="text-xs leading-relaxed text-[var(--text-dim)]">
        RSA-OAEP 2048-bit with SHA-256. Keys are generated in your browser and never leave this page.
      </p>
    </div>
  );
}

export default function ModernPanel() {
  const [sub, setSub] = useState("hash");
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
      <div className="mb-5 flex w-fit gap-1 rounded-lg border border-[var(--border)] bg-[var(--bg)] p-1">
        {SUBTABS.map((t) => {
          const Icon = t.icon;
          const active = sub === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setSub(t.id)}
              className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm transition"
              style={{
                backgroundColor: active ? "var(--elevated)" : "transparent",
                color: active ? "var(--text)" : "var(--text-dim)",
              }}
            >
              <Icon size={15} weight="bold" /> {t.label}
            </button>
          );
        })}
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={sub}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.18 }}
        >
          {sub === "hash" && <HashTab />}
          {sub === "aes" && <AesTab />}
          {sub === "rsa" && <RsaTab />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
