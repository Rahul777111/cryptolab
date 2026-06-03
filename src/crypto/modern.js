// Modern crypto via the Web Crypto API (runs entirely in-browser).

const enc = new TextEncoder();
const dec = new TextDecoder();

function bufToHex(buf) {
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function bufToBase64(buf) {
  const bytes = new Uint8Array(buf);
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
}

function base64ToBuf(b64) {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes.buffer;
}

// ---------- Hashing ----------
async function digest(algo, text) {
  const data = enc.encode(text);
  const buf = await crypto.subtle.digest(algo, data);
  return bufToHex(buf);
}
export const sha1 = (t) => digest("SHA-1", t);
export const sha256 = (t) => digest("SHA-256", t);
export const sha512 = (t) => digest("SHA-512", t);

export async function hmacSha256(text, keyStr) {
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(keyStr || ""),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(text));
  return bufToHex(sig);
}

export const HASHES = {
  "SHA-1": { fn: sha1, bits: 160 },
  "SHA-256": { fn: sha256, bits: 256 },
  "SHA-512": { fn: sha512, bits: 512 },
};

// ---------- AES-GCM with PBKDF2 ----------
async function deriveKey(password, salt) {
  const baseKey = await crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: 100000, hash: "SHA-256" },
    baseKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

export async function aesGcmEncrypt(text, password) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(password, salt);
  const cipher = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    enc.encode(text)
  );
  return {
    cipher: bufToBase64(cipher),
    iv: bufToBase64(iv.buffer),
    salt: bufToBase64(salt.buffer),
  };
}

export async function aesGcmDecrypt({ cipher, iv, salt }, password) {
  const key = await deriveKey(password, new Uint8Array(base64ToBuf(salt)));
  const plain = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: new Uint8Array(base64ToBuf(iv)) },
    key,
    base64ToBuf(cipher)
  );
  return dec.decode(plain);
}

// ---------- RSA-OAEP ----------
function toPem(buf, label) {
  const b64 = bufToBase64(buf);
  const lines = b64.match(/.{1,64}/g).join("\n");
  return `-----BEGIN ${label}-----\n${lines}\n-----END ${label}-----`;
}

function fromPem(pem, label) {
  const body = pem
    .replace(`-----BEGIN ${label}-----`, "")
    .replace(`-----END ${label}-----`, "")
    .replace(/\s+/g, "");
  return base64ToBuf(body);
}

export async function generateRsaKeyPair() {
  const pair = await crypto.subtle.generateKey(
    {
      name: "RSA-OAEP",
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: "SHA-256",
    },
    true,
    ["encrypt", "decrypt"]
  );
  const spki = await crypto.subtle.exportKey("spki", pair.publicKey);
  const pkcs8 = await crypto.subtle.exportKey("pkcs8", pair.privateKey);
  return {
    publicKeyPem: toPem(spki, "PUBLIC KEY"),
    privateKeyPem: toPem(pkcs8, "PRIVATE KEY"),
  };
}

export async function rsaEncrypt(text, publicKeyPem) {
  const key = await crypto.subtle.importKey(
    "spki",
    fromPem(publicKeyPem, "PUBLIC KEY"),
    { name: "RSA-OAEP", hash: "SHA-256" },
    false,
    ["encrypt"]
  );
  const cipher = await crypto.subtle.encrypt({ name: "RSA-OAEP" }, key, enc.encode(text));
  return bufToBase64(cipher);
}

export async function rsaDecrypt(b64, privateKeyPem) {
  const key = await crypto.subtle.importKey(
    "pkcs8",
    fromPem(privateKeyPem, "PRIVATE KEY"),
    { name: "RSA-OAEP", hash: "SHA-256" },
    false,
    ["decrypt"]
  );
  const plain = await crypto.subtle.decrypt({ name: "RSA-OAEP" }, key, base64ToBuf(b64));
  return dec.decode(plain);
}
