/**
 * Mostrado no dev quando VITE_FIREBASE_* nao estao definidas (evita auth/invalid-api-key opaco).
 */
export function EnvMissingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-6">
      <div className="max-w-lg w-full rounded-2xl border border-amber-200 bg-white p-8 shadow-sm">
        <h1 className="text-lg font-bold text-slate-800">Firebase nao configurado</h1>
        <p className="mt-3 text-sm text-slate-600 leading-relaxed">
          O Vite so le arquivos como <code className="rounded bg-slate-100 px-1">.env.local</code> — nao
          use o nome <code className="rounded bg-slate-100 px-1">env.local.sample</code> como config ativa.
        </p>
        <ol className="mt-4 list-decimal list-inside text-sm text-slate-700 space-y-2">
          <li>
            Na raiz do projeto, copie{' '}
            <code className="rounded bg-slate-100 px-1">env.local.sample</code> para{' '}
            <code className="rounded bg-slate-100 px-1">.env.local</code>
          </li>
          <li>Cole as chaves do Firebase Console (app Web) nas variaveis VITE_FIREBASE_*</li>
          <li>
            Mantenha <code className="rounded bg-slate-100 px-1">VITE_USE_FIREBASE_EMULATORS=false</code>
          </li>
          <li>Pare o Vite (Ctrl+C) e rode <code className="rounded bg-slate-100 px-1">npm run dev</code> de novo</li>
        </ol>
        <p className="mt-4 text-xs text-slate-500">
          Emuladores: copie <code className="rounded bg-slate-100 px-1">env.emulator.sample</code> para{' '}
          <code className="rounded bg-slate-100 px-1">.env.development.local</code> e suba{' '}
          <code className="rounded bg-slate-100 px-1">npm run emulators</code>.
        </p>
      </div>
    </div>
  )
}
