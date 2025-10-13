import { readdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * @param pathByName {Record<string, string>}
 * @param entry {string}
 * @returns {Record<string, string>}
 */
function accumulateFiles(pathByName, entry) {
  if (!entry.endsWith(".html")) {
    return pathByName;
  }

  return { ...pathByName, [entry]: resolve(__dirname, "public", entry) };
}

export default defineConfig(async () => {
  const files = await readdir(resolve(__dirname, "public"));
  const pathByName = files.reduce(accumulateFiles, {
    main: resolve(__dirname, "public", "index.html"),
  });

  console.log(pathByName);
  return {
    root: "./public",
    publicDir: false,
    build: {
      rollupOptions: {
        input: pathByName,
      },
      outDir: resolve(__dirname, "dist"),
      emptyOutDir: true,
    },
  };
});
