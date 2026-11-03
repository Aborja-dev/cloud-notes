import type { ActiveFormats, EditorStats } from "./editorState";

export function extractText(html: string): string {
    const element = document.createElement("div");
    element.innerHTML = html;
    return element.textContent || element.innerText || "";
}

export function calculateEditorStats(html: string): EditorStats {
    const text = extractText(html).trim();
    const words = text ? text.split(/\s+/).length : 0;
    return {
        words,
        chars: text.length,
        readTime: Math.max(1, Math.ceil(words / 200)),
    };
}

export function readActiveFormats(editor: HTMLElement): ActiveFormats {
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
        while (node && node !== editor) {
            const tag = (node as HTMLElement).tagName?.toLowerCase();
            if (["h1", "h2", "h3", "blockquote", "p"].includes(tag)) {
                currentBlock = tag;
                break;
            }
            node = node.parentNode;
        }
    }

    return {
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
    };
}

export function executeEditorCommand(
    editor: HTMLElement,
    command: string,
    value?: string,
): void {
    editor.focus();
    document.execCommand(command, false, value);
}

export function copyNote(title: string, html: string): Promise<void> {
    return navigator.clipboard.writeText(`${title}\n\n${extractText(html)}`);
}

export function exportNote(title: string, html: string, type: "html" | "txt"): void {
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
  ${html}
</body>
</html>`;
        blob = new Blob([fullHtml], { type: "text/html" });
        extension = "html";
    } else {
        const text = `${title}\n\n${extractText(html)}`;
        blob = new Blob([text], { type: "text/plain" });
        extension = "txt";
    }

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${(title || "nota").replace(/[/\\?%*:|"<>]/g, "-")}.${extension}`;
    anchor.click();
    URL.revokeObjectURL(url);
}