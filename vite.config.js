import { lstatSync, readdirSync } from "node:fs";
import { readdir } from "node:fs/promises";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * @param pathByName {Record<string, string>}
 * @param entry {string}
 * @returns {Record<string, string>}
 */
function accumulateFiles(pathByName, entry) {
  // Might be a dir
  if (lstatSync(entry).isDirectory()) {
    return readdirSync(entry)
      .filter((entry) => entry !== "node_modules")
      .map((subentry) => resolve(entry, subentry))
      .reduce(accumulateFiles, pathByName);
  }

  if (!entry.endsWith(".html")) {
    // Only host html files
    return pathByName;
  }

  return {
    ...pathByName,
    [relative(resolve(__dirname, "public"), entry)]: resolve(entry),
  };
}

export default defineConfig(async () => {
  const files = await readdir(resolve(__dirname, "public"));

  const pathByName = files
    .map((file) => resolve(__dirname, "public", file))
    .reduce(accumulateFiles, {
      404: resolve(__dirname, "public", "404.html"),
      main: resolve(__dirname, "public", "index.html"),
    });

  console.log(pathByName);

  return {
    root: "./public",
    publicDir: false,
    assetsInclude: ["**/*.xql"],
    build: {
      rollupOptions: {
        input: pathByName,
      },
      outDir: resolve(__dirname, "dist"),
      emptyOutDir: true,
    },
  };
});
