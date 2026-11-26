"use client";

import { Icon } from "@iconify/react";
import Image from "@tiptap/extension-image";
import StarterKit from "@tiptap/starter-kit";
import { EditorContent, useEditor, useEditorState, type Editor } from "@tiptap/react";
import { useCallback, useState } from "react";
import { FieldError } from "@/components/portal/form-ui";
import { MediaPicker, type PickedImage } from "./media-picker";

/** Turns what the author typed into a web address, adding https:// when it is missing. */
function normaliseLink(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (/^(https?:\/\/|mailto:|tel:|\/)/i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

/**
 * Rich-text editor for article bodies. Its output is saved as HTML in a hidden field named `html`,
 * which the server sanitizes before storing.
 */
export function RichTextEditor({ initialHtml, error }: { initialHtml: string; error?: string }) {
  const [html, setHtml] = useState(initialHtml);
  const [pickerOpen, setPickerOpen] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        code: false,
        codeBlock: false,
        horizontalRule: false,
        strike: false,
        link: { openOnClick: false, autolink: true, HTMLAttributes: { rel: "noopener noreferrer" } },
      }),
      Image.configure({ allowBase64: false }),
    ],
    content: initialHtml,
    immediatelyRender: false,
    onUpdate: ({ editor: current }) => setHtml(current.getHTML()),
    editorProps: {
      attributes: {
        class: "rich-text rich-text-editor-content",
        "aria-label": "Article text",
        "aria-multiline": "true",
        role: "textbox",
      },
    },
  });

  // Re-renders the toolbar when the selection changes, so the buttons show the current formatting.
  const active = useEditorState({
    editor,
    selector: ({ editor: current }: { editor: Editor | null }) => ({
      bold: current?.isActive("bold") ?? false,
      italic: current?.isActive("italic") ?? false,
      underline: current?.isActive("underline") ?? false,
      h2: current?.isActive("heading", { level: 2 }) ?? false,
      h3: current?.isActive("heading", { level: 3 }) ?? false,
      bulletList: current?.isActive("bulletList") ?? false,
      orderedList: current?.isActive("orderedList") ?? false,
      blockquote: current?.isActive("blockquote") ?? false,
      link: current?.isActive("link") ?? false,
      canUndo: current?.can().undo() ?? false,
      canRedo: current?.can().redo() ?? false,
    }),
  });

  const insertImage = useCallback(
    (image: PickedImage) => {
      editor?.chain().focus().setImage({ src: image.url, alt: image.alt }).run();
      setPickerOpen(false);
    },
    [editor],
  );

  function toggleLink() {
    if (!editor) return;
    if (editor.isActive("link")) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    const value = window.prompt("Web address for this text (for example https://www.example.com)");
    const href = value ? normaliseLink(value) : null;
    if (href) editor.chain().focus().extendMarkRange("link").setLink({ href }).run();
  }

  // Buttons are grouped: a divider is drawn between groups.
  const buttons: { label: string; icon: string; group: number; onClick: () => void; pressed?: boolean; disabled?: boolean }[] = [
    { label: "Bold", icon: "lucide:bold", group: 0, onClick: () => editor?.chain().focus().toggleBold().run(), pressed: active?.bold },
    { label: "Italic", icon: "lucide:italic", group: 0, onClick: () => editor?.chain().focus().toggleItalic().run(), pressed: active?.italic },
    { label: "Underline", icon: "lucide:underline", group: 0, onClick: () => editor?.chain().focus().toggleUnderline().run(), pressed: active?.underline },
    { label: "Heading", icon: "lucide:heading-2", group: 1, onClick: () => editor?.chain().focus().toggleHeading({ level: 2 }).run(), pressed: active?.h2 },
    { label: "Subheading", icon: "lucide:heading-3", group: 1, onClick: () => editor?.chain().focus().toggleHeading({ level: 3 }).run(), pressed: active?.h3 },
    { label: "Bullet list", icon: "lucide:list", group: 2, onClick: () => editor?.chain().focus().toggleBulletList().run(), pressed: active?.bulletList },
    { label: "Numbered list", icon: "lucide:list-ordered", group: 2, onClick: () => editor?.chain().focus().toggleOrderedList().run(), pressed: active?.orderedList },
    { label: "Quote", icon: "lucide:quote", group: 2, onClick: () => editor?.chain().focus().toggleBlockquote().run(), pressed: active?.blockquote },
    { label: "Link", icon: "lucide:link", group: 3, onClick: toggleLink, pressed: active?.link },
    { label: "Insert image", icon: "lucide:image-plus", group: 3, onClick: () => setPickerOpen(true) },
    { label: "Undo", icon: "lucide:undo-2", group: 4, onClick: () => editor?.chain().focus().undo().run(), disabled: !active?.canUndo },
    { label: "Redo", icon: "lucide:redo-2", group: 4, onClick: () => editor?.chain().focus().redo().run(), disabled: !active?.canRedo },
  ];

  return (
    <div className={`overflow-hidden rounded-md border bg-white ${error ? "border-rose-400" : "border-slate-300"}`}>
      <div role="toolbar" aria-label="Formatting" className="flex flex-wrap items-center gap-1 border-b border-slate-200 bg-slate-50 p-2">
        {buttons.map((button, index) => (
          <span key={button.label} className="contents">
            {index > 0 && buttons[index - 1].group !== button.group && <span aria-hidden className="mx-1 h-5 w-px bg-slate-300" />}
            <button
              type="button"
              aria-label={button.label}
              title={button.label}
              aria-pressed={button.pressed ?? undefined}
              disabled={!editor || button.disabled}
              onClick={button.onClick}
              className={`flex h-8 w-8 items-center justify-center rounded-md transition disabled:opacity-40 ${
                button.pressed ? "bg-ink text-white" : "text-ink hover:bg-white hover:shadow-sm"
              }`}
            >
              <Icon icon={button.icon} className="h-4 w-4" aria-hidden />
            </button>
          </span>
        ))}
      </div>

      <EditorContent editor={editor} className="rich-text-editor" />

      <input type="hidden" name="html" value={html} />
      <div className="px-3 pb-2">
        <FieldError messages={error ? [error] : undefined} />
      </div>

      <MediaPicker
        open={pickerOpen}
        title="Insert an image"
        onClose={() => setPickerOpen(false)}
        onPick={insertImage}
      />
    </div>
  );
}
