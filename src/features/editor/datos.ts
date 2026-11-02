import { useCallback, useEffect, useRef, useState, type ChangeEvent } from "react";
import type { Note } from "../../types";

type UpdateNote = (id: string, updates: Partial<Note>) => Promise<void>;

interface ActiveFormats {
    bold: boolean;
    italic: boolean;
    underline: boolean;
    strike: boolean;
    bulletList: boolean;
    orderedList: boolean;
    alignLeft: boolean;
    alignCenter: boolean;
    alignRight: boolean;
    alignJustify: boolean;
    currentBlock: string;
}

interface EditorStats {
    words: number;
    chars: number;
    readTime: number;
}

const INITIAL_FORMATS: ActiveFormats = {
    bold: false,
    italic: false,
    underline: false,
    strike: false,
    bulletList: false,
    orderedList: false,
    alignLeft: true,
    alignCenter: false,
    alignRight: false,
    alignJustify: false,
    currentBlock: "p",
};

const extractText = (html: string): string => {
    const element = document.createElement("div");
    element.innerHTML = html;
    return element.textContent || element.innerText || "";
};

export const useEditor = (
    activeNote: Note | undefined,
    updateNote: UpdateNote,
) => {
    const [title, setTitle] = useState("");
    const [copied, setCopied] = useState(false);
    const [activeFormats, setActiveFormats] = useState<ActiveFormats>(INITIAL_FORMATS);
    const [stats, setStats] = useState<EditorStats>({ words: 0, chars: 0, readTime: 1 });
    const editorRef = useRef<HTMLDivElement>(null);
    const isUpdatingFromProp = useRef(false);
    const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const copiedTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const updateStats = useCallback((html: string) => {
        const text = extractText(html).trim();
        const words = text ? text.split(/\s+/).length : 0;
        const chars = text.length;
        setStats({ words, chars, readTime: Math.max(1, Math.ceil(words / 200)) });
    }, []);

    const updateActiveFormats = useCallback(() => {
        if (!editorRef.current) return;

        try {
            const bold = document.queryCommandState("bold");
            const italic = document.queryCommandState("italic");
            const underline = document.queryCommandState("underline");
            const strike = document.queryCommandState("strikeThrough");
            const bulletList = document.queryCommandState("insertUnorderedList");
            const orderedList = document.queryCommandState("insertOrderedList");
            const alignCenter = document.queryCommandState("justifyCenter");
            const alignRight = document.queryCommandState("justifyRight");
            const alignJustify = document.queryCommandState("justifyFull");
            const alignLeft = !alignCenter && !alignRight && !alignJustify;

            let currentBlock = "p";
            const selection = window.getSelection();
            if (selection && selection.rangeCount > 0) {
                let node: Node | null = selection.getRangeAt(0).commonAncestorContainer;
                if (node.nodeType === Node.TEXT_NODE) node = node.parentNode;
                while (node && node !== editorRef.current) {
                    const tag = (node as HTMLElement).tagName?.toLowerCase();
                    if (["h1", "h2", "h3", "blockquote", "p"].includes(tag)) {
                        currentBlock = tag;
                        break;
                    }
                    node = node.parentNode;
                }
            }

            setActiveFormats({
                bold,
                italic,
                underline,
                strike,
                bulletList,
                orderedList,
                alignLeft,
                alignCenter,
                alignRight,
                alignJustify,
                currentBlock,
            });
        } catch {
            // The browser may reject formatting queries when the selection is outside the editor.
        }
    }, []);

    useEffect(() => {
        if (activeNote) {
            setTitle(activeNote.title || "");
            if (editorRef.current) {
                isUpdatingFromProp.current = true;
                const initialHtml = activeNote.content || "";
                if (initialHtml && !initialHtml.includes("<") && initialHtml.includes("\n")) {
                    editorRef.current.innerHTML = initialHtml
                        .split("\n")
                        .map((line) => `<p>${line || "<br>"}</p>`)
                        .join("");
                } else {
                    editorRef.current.innerHTML = initialHtml;
                }
                updateStats(editorRef.current.innerHTML);
                isUpdatingFromProp.current = false;
            }
        } else {
            setTitle("");
            if (editorRef.current) editorRef.current.innerHTML = "";
            setStats({ words: 0, chars: 0, readTime: 1 });
        }
        updateActiveFormats();
    }, [activeNote?.id, updateActiveFormats, updateStats]);

    useEffect(() => () => {
        if (copiedTimeoutRef.current) clearTimeout(copiedTimeoutRef.current);
    }, []);

    const triggerSave = useCallback((newTitle: string, newContent: string) => {
        if (!activeNote) return;
        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = setTimeout(() => {
            void updateNote(activeNote.id, {
                title: newTitle || "Sin título",
                content: newContent,
            });
        }, 400);
    }, [activeNote, updateNote]);

    const handleContentInput = useCallback(() => {
        if (!editorRef.current || isUpdatingFromProp.current) return;
        const currentHtml = editorRef.current.innerHTML;
        updateStats(currentHtml);
        triggerSave(title, currentHtml);
    }, [title, triggerSave, updateStats]);

    const handleTitleChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
        const newTitle = event.target.value;
        setTitle(newTitle);
        triggerSave(newTitle, editorRef.current?.innerHTML ?? "");
    }, [triggerSave]);

    const executeFormat = useCallback((command: string, value?: string) => {
        if (!editorRef.current) return;
        editorRef.current.focus();
        document.execCommand(command, false, value);
        updateActiveFormats();
        handleContentInput();
    }, [handleContentInput, updateActiveFormats]);

    const handleCopy = useCallback(() => {
        if (!editorRef.current) return;
        const text = extractText(editorRef.current.innerHTML);
        void navigator.clipboard.writeText(`${title}\n\n${text}`);
        setCopied(true);
        if (copiedTimeoutRef.current) clearTimeout(copiedTimeoutRef.current);
        copiedTimeoutRef.current = setTimeout(() => setCopied(false), 2000);
    }, [title]);

    const handleExport = useCallback((type: "html" | "txt") => {
        if (!editorRef.current) return;
        let blob: Blob;
        let extension: string;

        if (type === "html") {
            const fullHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${title || "Nota"}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; max-width: 800px; margin: 40px auto; padding: 0 20px; color: #1e293b; }
    h1 { border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; }
    blockquote { border-left: 4px solid #3b82f6; margin: 16px 0; padding-left: 16px; color: #64748b; font-style: italic; }
  </style>
</head>
<body>
  <h1>${title || "Sin título"}</h1>
  ${editorRef.current.innerHTML}
</body>
</html>`;
            blob = new Blob([fullHtml], { type: "text/html" });
            extension = "html";
        } else {
            const text = `${title}\n\n${extractText(editorRef.current.innerHTML)}`;
            blob = new Blob([text], { type: "text/plain" });
            extension = "txt";
        }

        const url = URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = `${(title || "nota").replace(/[/\\?%*:|"<>]/g, "-")}.${extension}`;
        anchor.click();
        URL.revokeObjectURL(url);
    }, [title]);

    return {
        title,
        copied,
        activeFormats,
        stats,
        editorRef,
        updateActiveFormats,
        handleContentInput,
        handleTitleChange,
        executeFormat,
        handleCopy,
        handleExport,
    };
};