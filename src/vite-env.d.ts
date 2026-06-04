/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL of the Rachead backend API, e.g. http://localhost:5001/api */
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
