import "server-only";
import sanitizeHtml from "sanitize-html";
import type { ArticleBlock } from "@/lib/db/models";

// Everything the rich-text editor can produce, and nothing else. Anything outside this list is removed.
const SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: ["p", "br", "h2", "h3", "strong", "em", "u", "s", "ul", "ol", "li", "blockquote", "a", "img"],
  allowedAttributes: {
    a: ["href", "target", "rel"],
    img: ["src", "alt", "width", "height"],
  },
  allowedSchemes: ["http", "https", "mailto", "tel"],
  allowedSchemesByTag: { img: ["http", "https"] },
  allowProtocolRelative: false,
  transformTags: {
    a: (tagName, attribs) => ({
      tagName,
      attribs: {
        ...attribs,
        rel: "noopener noreferrer",
      },
    }),
  },
};

/** Removes anything the editor could not have produced, such as scripts, event handlers and unknown tags. */
export function sanitizeArticleHtml(html: string): string {
  return sanitizeHtml(html, SANITIZE_OPTIONS).trim();
}

/** Plain text of some HTML, used to check that an article is not empty. */
export function htmlToText(html: string): string {
  return sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} }).replace(/\s+/g, " ").trim();
}

/** Converts articles stored in the old block format into HTML. */
export function blocksToHtml(blocks: ArticleBlock[]): string {
  return blocks
    .map((block) => {
      if (block.type === "h2") return `<h2>${escapeHtml(block.text ?? "")}</h2>`;
      if (block.type === "ul") {
        return `<ul>${(block.items ?? []).map((item) => `<li><p>${escapeHtml(item)}</p></li>`).join("")}</ul>`;
      }
      return `<p>${escapeHtml(block.text ?? "")}</p>`;
    })
    .join("");
}

function escapeHtml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
