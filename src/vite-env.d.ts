/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_KEY: string
  readonly VITE_API_KEY_SECRET: string
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_COOLIFY_API_URL: string
  readonly VITE_COOLIFY_TOKEN: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}