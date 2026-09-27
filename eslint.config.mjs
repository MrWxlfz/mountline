import { defineConfig, globalIgnores } from "eslint/config"
import nextVitals from "eslint-config-next/core-web-vitals"
import nextTypeScript from "eslint-config-next/typescript"

export default defineConfig([
  ...nextVitals,
  ...nextTypeScript,
  globalIgnores([
    // Other sessions' git worktrees and Xcode output are not this checkout's source.
    ".claude/**",
    "ios/DerivedData/**",
    ".next/**",
    "node_modules/**",
    "public/**",
    "next-env.d.ts",
    "services-grid.png",
  ]),
])
