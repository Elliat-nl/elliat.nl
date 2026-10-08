import { lstatSync, readdirSync } from "node:fs";
import { readFile, readdir } from "node:fs/promises";
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

// `public` is the Vite root and `publicDir` is disabled, so files that no page
// references have to be emitted explicitly.
const staticFiles = ["robots.txt", "sitemap.xml", "favicon.png"];

function copyStaticFiles() {
  return {
    name: "copy-static-files",
    async generateBundle() {
      for (const fileName of staticFiles) {
        this.emitFile({
          type: "asset",
          fileName,
          source: await readFile(resolve(__dirname, "public", fileName)),
        });
      }
    },
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
    plugins: [copyStaticFiles()],
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
