import Reveal from "reveal.js";
import RevealHighlight from "reveal.js/plugin/highlight/highlight.esm.js";
import RevealNotes from "reveal.js/plugin/notes/notes";

import "reveal.js/dist/reveal.css";
import "reveal.js/dist/theme/moon.css";
import "reveal.js/plugin/highlight/monokai.css";
import "@picocss/pico";

import prettierPluginXQuery from "prettier-plugin-xquery";
import prettierPluginXml from "@prettier/plugin-xml";
import prettier, { Plugin } from "prettier";
const deck = new Reveal({
  plugins: [RevealHighlight, RevealNotes],
  controlsTutorial: false,
  history: true,
  navigationMode: "linear",
});

await deck.initialize();

const highlight = deck.getPlugin("highlight");

const xsltplugin: Plugin = {
  ...prettierPluginXml,
  printers: {
    xml: {
      embed: (path, options) => {
        const node = path.node;
        if (node.name === "attribute") {
          console.log("!!!");
          return async (textToDoc, print) => {
            const docNode = await textToDoc(node.content, {
              parser: prettierPluginXQuery.parsers!.xquery!,
            });

            return group(docNode);
          };
        }
        return prettierPluginXml.printer.embed(path, options);
      },
      ...prettierPluginXml,
    },
  },
};

const formatCodeBlock = async (cb: HTMLElement, language: string) => {
  const formatted = await prettier.format(cb.textContent ?? "", {
    plugins: [prettierPluginXQuery, xsltplugin],
    parser: language,
  });

  console.log(formatted);
  cb.replaceChildren(document.createTextNode(formatted));
  delete cb.dataset.highlighted;
  highlight.highlightBlock(cb);
};
class PrettifyButton extends HTMLButtonElement {
  private _clickHandler: () => void;
  constructor() {
    super();
    this._clickHandler = async () => {
      const xqueryCodeBlocks = Array.from(
        this.closest("section")?.querySelectorAll(".language-xquery code") ??
          [],
      ) as HTMLElement[];
      for (const cb of xqueryCodeBlocks) {
        const language = cb.hasAttribute("data-xquery-4")
          ? "xquery4"
          : "xquery";
        await formatCodeBlock(cb, language);
      }
      const xsltCodeBlocks = Array.from(
        this.closest("section")?.querySelectorAll(".language-xslt code") ?? [],
      ) as HTMLElement[];
      for (const cb of xsltCodeBlocks) {
        await formatCodeBlock(cb, "xml");
      }
    };
  }
  connectedCallback() {
    this.addEventListener("click", this._clickHandler);
  }
  disconnectedCallback() {
    this.removeEventListener("click", this._clickHandler);
  }
}

window.customElements.define("prettify-button", PrettifyButton, {
  extends: "button",
});
