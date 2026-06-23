import { FlatCompat } from "@eslint/eslintrc";

const compat = new FlatCompat({ baseDirectory: import.meta.dirname });

const config = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      ".next/**",
      ".pytest_cache/**",
      "node_modules/**",
      "backend/.pytest_cache/**",
      "backend/**/__pycache__/**",
      "media-production/raw/**",
      "next-env.d.ts",
    ],
  },
];

export default config;
