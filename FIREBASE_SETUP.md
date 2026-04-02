# Firebase — configuração para desenvolvimento e staging (ppgpsi-web)

## 1. Projeto no Console

1. Acesse [Firebase Console](https://console.firebase.google.com/) e crie um projeto (ou use um existente).
2. **Adicionar app Web**: ícone `</>` → registre o app → copie as credenciais para o `.env` local.

## 2. Variáveis de ambiente (`.env`)

Na raiz de `ppgpsi-web`, copie `.env.example` para `.env` e preencha:

| Variável | Onde obter |
|----------|------------|
| `VITE_FIREBASE_API_KEY` | Configurações do projeto → Seus apps → SDK |
| `VITE_FIREBASE_AUTH_DOMAIN` | idem (`projeto.firebaseapp.com`) |
| `VITE_FIREBASE_PROJECT_ID` | idem |
| `VITE_FIREBASE_STORAGE_BUCKET` | idem (ex.: `projeto.firebasestorage.app`) |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | idem |
| `VITE_FIREBASE_APP_ID` | idem |

Reinicie `npm run dev` após alterar `.env`.

## 3. Authentication — Google (único método de login)

O app usa **somente** `signInWithPopup` com Google (`src/services/googleAuth.ts`). Apenas contas com e-mail **@ufscar.br** ou **@estudante.ufscar.br** são aceitas após o login (validação no cliente).

1. **Authentication** → **Sign-in method** → **Google** → ative e conclua o assistente (e-mail de suporte do projeto).
2. **Authentication** → **Settings** → **Authorized domains**: inclua `localhost`, `127.0.0.1` e o domínio de produção (ex.: `seu-projeto.web.app`).
3. No [Google Cloud Console](https://console.cloud.google.com/) → **APIs e serviços** → **Credenciais**, abra a **API key** usada pelo app Web e garanta que **Identity Toolkit API** não esteja bloqueada (ou use restrições compatíveis com Firebase Auth).
4. Em **OAuth 2.0 Client ID** (tipo Web), em **Authorized JavaScript origins**:
   - `http://localhost:5173` e `http://127.0.0.1:5173` (dev)
   - URL do seu site em produção
5. Em **Authorized redirect URIs**, inclua:
   - `https://SEU-PROJECT-ID.firebaseapp.com/__/auth/handler`
6. O erro **CONFIGURATION_NOT_FOUND** / 400 em `identitytoolkit` costuma indicar provedor Google desativado ou API key restrita de forma incorreta.

## 4. Firestore e Storage

1. Crie o banco **Firestore** (modo produção ou teste, conforme política da instituição).
2. Publique as regras: `firebase deploy --only firestore:rules` (arquivo `firestore.rules` na raiz).
3. Publique índices se necessário: `firebase deploy --only firestore:indexes`.
4. Ative **Storage** e publique `storage.rules`.

## 5. Cloud Functions (região `southamerica-east1`)

O app e `src/config/firebase.ts` usam `getFunctions(app, 'southamerica-east1')`.

```bash
cd functions
npm install
npm run build
cd ..
firebase deploy --only functions
```

A função **`updateUserRoles`** sincroniza **custom claims** após edição de perfis na página Usuários. Sem deploy, a UI avisa com mensagem orientando o deploy.

## 6. Primeiro administrador (bootstrap)

As regras exigem que quem **cria** ou **edita** outros usuários tenha perfil **Secretaria** ou **Coordenacao** no documento `users/{uid}` (o `uid` deve ser o do Firebase Auth).

1. Faça login uma vez com **Google** usando e-mail `@ufscar.br` ou `@estudante.ufscar.br`.
2. No Firestore, localize ou crie o documento `users/{seuAuthUid}` com pelo menos:
   - `email`, `nome`, `roles`: `["Secretaria"]` ou `["Coordenacao"]`, `status`: `"Ativo"`.
3. Faça **logout e login** de novo (ou aguarde o token renovar) para que `onUserCreate` / claims reflitam o perfil, se necessário.
4. A partir daí, use **Usuários** no app para pré-cadastrar e editar perfis; a edição chama `updateUserRoles` para alinhar claims.

## 7. Verificação rápida

- `npm run dev` → login com **Google** → home conforme perfil.
- Como Secretaria/Coordenacao: **Usuários** → editar perfis → rota protegida e sidebar coerentes após salvar (e `getIdToken` atualizado para o próprio usuário).

## 8. Hosting (opcional)

`firebase.json` já aponta `hosting.public` para `dist`. Build: `npm run build` → `firebase deploy --only hosting`.
