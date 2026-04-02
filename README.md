# PPGPsi Web

Sistema de solicitações (PPGPsi / UFSCar) — React, Vite, Firebase.

## Rodar no navegador (desenvolvimento local)

### Opção A — Projeto Firebase na nuvem (recomendado se você **não** tiver Java)

O emulador do **Firestore** precisa de **Java (JDK 17+)** instalado. Sem Java, use um projeto real (plano Spark é suficiente para testes).

1. `npm install`
2. No [Firebase Console](https://console.firebase.google.com), crie um projeto e um app Web; copie as chaves do SDK.
3. Copie [`env.local.sample`](env.local.sample) para **`.env.local`** na raiz, preencha as variáveis e mantenha `VITE_USE_FIREBASE_EMULATORS=false`.
4. Siga [FIREBASE_SETUP.md](FIREBASE_SETUP.md) (Authentication com **Google**, Firestore, Storage, opcionalmente Functions).
5. `npm run dev` — o navegador abre em [http://localhost:5173](http://localhost:5173).

**Importante (Vite):** a ordem de prioridade é `.env.development` **>** `.env.local`. Se `.env.development` tiver `VITE_FIREBASE_*` ou emuladores, isso **sobrescreve** o `.env.local` e o login quebra. Por isso [`.env.development`](.env.development) no repositório **não** define mais essas variáveis.

### Opção B — Emuladores Firebase (máquina **com** Java JDK 17+)

1. Instale [OpenJDK 17+](https://adoptium.net/) e confira no terminal: `java -version`
2. `npm install`
3. Copie [`env.emulator.sample`](env.emulator.sample) para **`.env.development.local`** (na raiz).
4. **Terminal 1:** `npm run emulators` — UI em [http://127.0.0.1:4000](http://127.0.0.1:4000)
5. **Terminal 2:** `npm run dev`

**Login com Google (emulador):** use a UI do Auth Emulator ou fluxo de teste da documentação Firebase.

**Primeiro administrador (emulador):** na UI Firestore, crie `users/{UID}` com `email`, `nome`, `roles: ["Secretaria"]`, `status: "Ativo"` (o **UID** está na aba Authentication).

**Atalho:** `npm run dev:stack` — emuladores + Vite juntos (requer Java).

## Firebase CLI (`deploy`, `firestore:rules`)

O arquivo [`.firebaserc`](.firebaserc) define o projeto **padrão** para `firebase deploy`. Ele deve ser o **mesmo** `VITE_FIREBASE_PROJECT_ID` do seu `.env.local`.

- Se aparecer `Project 'demo-ppgpsi' not found`: `demo-ppgpsi` é só para emuladores; troque o projeto com `firebase use ppgpsi-9727e` (ou outro ID da lista `firebase projects:list`).
- Aliases úteis no `.firebaserc`: `firebase use ppgpsi-alt` → `ppgpsi-b54fc`, `firebase use ppgpsi-banco` → `ppgpsibancodados`.

Os emuladores continuam usando `demo-ppgpsi` via flag no script `npm run emulators` (não dependem do `default`).

## Scripts

| Comando | Descrição |
|--------|-----------|
| `npm run dev` | App Vite (modo desenvolvimento) |
| `npm run emulators` | Auth, Firestore, Storage, Functions emulados |
| `npm run dev:stack` | Emuladores + Vite em paralelo |
| `npm run build` | Typecheck + build de produção |

## Erro `auth/network-request-failed` ou `CONFIGURATION_NOT_FOUND`

- **Emulador** ligado no `.env` sem `npm run emulators` rodando: use só **`.env.local`** com `VITE_USE_FIREBASE_EMULATORS=false` e reinicie o Vite.
- **Google:** ative o provedor em Authentication e ajuste API key / OAuth conforme [FIREBASE_SETUP.md](FIREBASE_SETUP.md).

## Requisitos

- Node 20+ recomendado (Functions). Emuladores: [Firebase CLI](https://firebase.google.com/docs/cli) via `npm install` (inclui `firebase-tools`).
