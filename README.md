# CryptoLab — Cryptography Playground

An interactive playground for learning cryptography, from classic pen-and-paper ciphers to real browser-native modern crypto. Everything runs locally in your browser; no keys or plaintext ever leave the page.

![Tech](https://img.shields.io/badge/React-19-34d399) ![Tech](https://img.shields.io/badge/Vite-purple) ![Tech](https://img.shields.io/badge/Web%20Crypto%20API-black)

## Features

### Classical ciphers
Caesar, Vigenère, Atbash, Rail Fence, XOR (hex), and monoalphabetic substitution. Live encrypt/decrypt with a real-time alphabet mapping for shift ciphers. Every cipher round-trips correctly.

### Modern crypto (Web Crypto API)
- **Hashing** — SHA-1, SHA-256, SHA-512, and HMAC-SHA256.
- **AES-GCM** — AES-256-GCM with a key derived from your password via PBKDF2 (100,000 iterations). Wrong passwords fail loudly.
- **RSA** — Generate a real RSA-OAEP 2048-bit key pair, export to PEM, then encrypt with the public key and decrypt with the private key.

## Tech stack

React 19 · Vite · Tailwind CSS v4 · Motion · Phosphor Icons · Web Crypto API

## Getting started

```bash
npm install
npm run dev
npm run build
npm run preview
```

## Why this exists

Cryptography is far easier to understand when you can watch a cipher transform text in real time and inspect actual key material. CryptoLab pairs the intuition of classical ciphers with the rigor of standards-based modern primitives, all implemented with the native `SubtleCrypto` API.

## Author

**D L Narayana** — [GitHub](https://github.com/Rahul777111)
