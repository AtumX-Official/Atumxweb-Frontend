declare module "*.svg?url" {
    const content: string;
    export default content;
  }

declare module "*.pdf" {
  const content: string;
  export default content;
}

declare module "*.gif" {
  const content: string;
  export default content;
}

// `src/app/screens/games/GameLibrary.tsx` still calls the Vite build-time
// `import.meta` helpers that the project used before it moved to Next.
interface ImportMeta {
  glob(
    pattern: string,
    options?: { eager?: boolean; import?: string }
  ): Record<string, string>;
  env: Record<string, string> & { BASE_URL: string };
}
