import Reveal from "reveal.js";
import RevealHighlight from "reveal.js/plugin/highlight/highlight.esm.js";
import RevealNotes from "reveal.js/plugin/notes/notes";

import "reveal.js/dist/reveal.css";
import "reveal.js/dist/theme/moon.css";
import "reveal.js/plugin/highlight/monokai.css";
import "@picocss/pico";

import prettierPluginXQuery from "prettier-plugin-xquery";
import prettier from "prettier";
const deck = new Reveal({
  plugins: [RevealHighlight, RevealNotes],
  controlsTutorial: false,
  history: true,
});

await deck.initialize();

const highlight = deck.getPlugin("highlight");

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
        const formatted = await prettier.format(cb.textContent ?? "", {
          plugins: [prettierPluginXQuery],
          parser: "xquery",
        });

        console.log(formatted);
        cb.replaceChildren(document.createTextNode(formatted));
        delete cb.dataset.highlighted;
        highlight.highlightBlock(cb);
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
