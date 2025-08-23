import { defineConfig } from "vite";
import handlebars from "vite-plugin-handlebars";
import { resolve } from "path";

export default defineConfig({
  root: resolve(__dirname, "src"),
  build: {
    outDir: resolve(__dirname, "dist"),
    rollupOptions: {
      input: {
        main: resolve(__dirname, "src/index.html"), // Главная точка входа
      },
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
  assetsInclude: ["**/*.html"],
});
