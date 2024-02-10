import { defineConfig, normalizePath } from "vite"
import dotenv from "dotenv"
import { viteStaticCopy } from "vite-plugin-static-copy"
import path from "node:path"

export default defineConfig(() => {
  dotenv.config({ path: ".env.production" })

  return {
    plugins: [
      viteStaticCopy({
        targets: [
          {
            src: normalizePath(path.resolve(__dirname, "./src/assets/icons")),
            dest: "./assets",
          },
        ],
      }),
    ],
    define: {
      "process.env": process.env,
    },
  }
})