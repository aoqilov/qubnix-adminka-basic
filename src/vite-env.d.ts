/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Backend manzili (qubnix Dashboard API), masalan `https://app.qubnix.uz`. */
  readonly VITE_API_URL?: string;
}

/** package.json `version` — vite.config.ts `define` orqali build vaqtida qo'yiladi. */
declare const __APP_VERSION__: string;

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
