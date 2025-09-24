import { defineConfig } from "vite";
import handlebars from "vite-plugin-handlebars";
import { resolve } from "path";

export default defineConfig({
  root: resolve(__dirname, "src"),
  build: {
    outDir: resolve(__dirname, "dist"),
    emptyOutDir: true,
    rollupOptions: {
      input: resolve(__dirname, "src/index.html"),
    },
  },
  plugins: [
    handlebars({
      partialDirectory: resolve(__dirname, "./src/partials"),
      context: {
        username: "Evgen",
      },
    }),
  ],
  server: {
    port: 3000,
    open: "/",
    host: true,
  },
  base: "./",
});
