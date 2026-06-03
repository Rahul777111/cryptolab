// Classical ciphers. Each round-trips: decrypt(encrypt(x)) === x for letters.

const A = "A".charCodeAt(0);
const a = "a".charCodeAt(0);

function mod(n, m) {
  return ((n % m) + m) % m;
}

function shiftChar(ch, shift) {
  const code = ch.charCodeAt(0);
  if (code >= 65 && code <= 90) return String.fromCharCode(A + mod(code - A + shift, 26));
  if (code >= 97 && code <= 122) return String.fromCharCode(a + mod(code - a + shift, 26));
  return ch;
}

// --- Caesar ---
function caesarEnc(text, p) {
  const s = parseInt(p.shift, 10) || 0;
  return [...text].map((c) => shiftChar(c, s)).join("");
}
function caesarDec(text, p) {
  const s = parseInt(p.shift, 10) || 0;
  return [...text].map((c) => shiftChar(c, -s)).join("");
}

// --- Vigenere ---
function vigenere(text, key, decrypt) {
  const k = (key || "").replace(/[^a-zA-Z]/g, "");
  if (!k) return text;
  let ki = 0;
  return [...text]
    .map((c) => {
      const code = c.charCodeAt(0);
      const isUpper = code >= 65 && code <= 90;
      const isLower = code >= 97 && code <= 122;
      if (!isUpper && !isLower) return c;
      let shift = k[ki % k.length].toLowerCase().charCodeAt(0) - a;
      if (decrypt) shift = -shift;
      ki++;
      return shiftChar(c, shift);
    })
    .join("");
}

// --- Atbash ---
function atbash(text) {
  return [...text]
    .map((c) => {
      const code = c.charCodeAt(0);
      if (code >= 65 && code <= 90) return String.fromCharCode(A + (25 - (code - A)));
      if (code >= 97 && code <= 122) return String.fromCharCode(a + (25 - (code - a)));
      return c;
    })
    .join("");
}

// --- Rail Fence ---
function railEnc(text, p) {
  const rails = Math.max(2, parseInt(p.rails, 10) || 3);
  const rows = Array.from({ length: rails }, () => []);
  let r = 0;
  let dir = 1;
  for (const ch of text) {
    rows[r].push(ch);
    if (r === 0) dir = 1;
    else if (r === rails - 1) dir = -1;
    r += dir;
  }
  return rows.map((row) => row.join("")).join("");
}
function railDec(text, p) {
  const rails = Math.max(2, parseInt(p.rails, 10) || 3);
  const len = text.length;
  const pattern = [];
  let r = 0;
  let dir = 1;
  for (let i = 0; i < len; i++) {
    pattern.push(r);
    if (r === 0) dir = 1;
    else if (r === rails - 1) dir = -1;
    r += dir;
  }
  const counts = Array(rails).fill(0);
  pattern.forEach((row) => counts[row]++);
  const railStrings = [];
  let pos = 0;
  for (let i = 0; i < rails; i++) {
    railStrings.push(text.slice(pos, pos + counts[i]).split(""));
    pos += counts[i];
  }
  const idx = Array(rails).fill(0);
  let out = "";
  for (let i = 0; i < len; i++) {
    const row = pattern[i];
    out += railStrings[row][idx[row]++];
  }
  return out;
}

// --- XOR (hex output) ---
function xorEnc(text, p) {
  const key = p.key || "key";
  let out = "";
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i) ^ key.charCodeAt(i % key.length);
    out += code.toString(16).padStart(2, "0");
  }
  return out;
}
function xorDec(hex, p) {
  const key = p.key || "key";
  const clean = (hex || "").replace(/[^0-9a-fA-F]/g, "");
  let out = "";
  for (let i = 0; i < clean.length; i += 2) {
    const byte = parseInt(clean.slice(i, i + 2), 16);
    if (Number.isNaN(byte)) continue;
    const ki = (i / 2) % key.length;
    out += String.fromCharCode(byte ^ key.charCodeAt(ki));
  }
  return out;
}

// --- Monoalphabetic substitution ---
function buildMaps(keyStr) {
  const key = (keyStr || "").toUpperCase().replace(/[^A-Z]/g, "");
  const valid = key.length === 26 && new Set(key).size === 26;
  const k = valid ? key : "QWERTYUIOPASDFGHJKLZXCVBNM";
  const enc = {};
  const dec = {};
  const ALPHA = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  for (let i = 0; i < 26; i++) {
    enc[ALPHA[i]] = k[i];
    dec[k[i]] = ALPHA[i];
  }
  return { enc, dec };
}
function monoEnc(text, p) {
  const { enc } = buildMaps(p.key);
  return [...text]
    .map((c) => {
      const up = c.toUpperCase();
      if (enc[up] === undefined) return c;
      const mapped = enc[up];
      return c === up ? mapped : mapped.toLowerCase();
    })
    .join("");
}
function monoDec(text, p) {
  const { dec } = buildMaps(p.key);
  return [...text]
    .map((c) => {
      const up = c.toUpperCase();
      if (dec[up] === undefined) return c;
      const mapped = dec[up];
      return c === up ? mapped : mapped.toLowerCase();
    })
    .join("");
}

export const CLASSICAL = {
  caesar: {
    name: "Caesar",
    description: "Shifts every letter by a fixed amount around the alphabet. The simplest substitution cipher.",
    params: [{ key: "shift", label: "Shift", type: "number", default: 3 }],
    encrypt: caesarEnc,
    decrypt: caesarDec,
    showMapping: true,
    mappingShift: (p) => parseInt(p.shift, 10) || 0,
  },
  vigenere: {
    name: "Vigenere",
    description: "A keyword selects a different Caesar shift for each position, defeating simple frequency analysis.",
    params: [{ key: "key", label: "Keyword", type: "text", default: "LEMON" }],
    encrypt: (t, p) => vigenere(t, p.key, false),
    decrypt: (t, p) => vigenere(t, p.key, true),
    showMapping: false,
  },
  atbash: {
    name: "Atbash",
    description: "Mirrors the alphabet so A maps to Z, B to Y, and so on. Its own inverse.",
    params: [],
    encrypt: (t) => atbash(t),
    decrypt: (t) => atbash(t),
    showMapping: false,
  },
  railFence: {
    name: "Rail Fence",
    description: "A transposition cipher that writes text in a zig-zag across rails, then reads row by row.",
    params: [{ key: "rails", label: "Rails", type: "number", default: 3 }],
    encrypt: railEnc,
    decrypt: railDec,
    showMapping: false,
  },
  xorHex: {
    name: "XOR (hex)",
    description: "XORs each byte with a repeating key. Output is hex. The foundation of stream ciphers.",
    params: [{ key: "key", label: "Key", type: "text", default: "secret" }],
    encrypt: xorEnc,
    decrypt: xorDec,
    showMapping: false,
  },
  monoSubstitution: {
    name: "Substitution",
    description: "Maps each letter to another via a 26-letter permutation key. Strong against brute force, weak to frequency analysis.",
    params: [{ key: "key", label: "Cipher alphabet (26 letters)", type: "text", default: "QWERTYUIOPASDFGHJKLZXCVBNM" }],
    encrypt: monoEnc,
    decrypt: monoDec,
    showMapping: false,
  },
};
