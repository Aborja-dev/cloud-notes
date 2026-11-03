import { createContext, useCallback, useContext, useMemo, useRef, type ReactNode } from "react";
import type { Editor as TiptapEditor } from "@tiptap/core";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import { useEditor as useTiptapEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

export type EditorHandler = (editor: TiptapEditor) => void;

export interface EditorHandlers {
    onUpdate?: EditorHandler;
    onSelectionUpdate?: EditorHandler;
    onTransaction?: EditorHandler;
}

interface EditorContextValue {
    editor: TiptapEditor | null;
    setHandlers: (handlers: EditorHandlers) => void;
}

const editorContext = createContext<EditorContextValue | null>(null);

const EDITOR_EXTENSIONS = [
    StarterKit,
    Underline,
    TextAlign.configure({ types: ["heading", "paragraph"] }),
    Placeholder.configure({
        placeholder: "Escribe tu nota aquí... Puedes aplicar negrita, cursiva, subrayado, listas con viñetas o numeradas y ajustar la alineación del texto.",
    }),
];

export const EditorProvider = ({ children }: { children: ReactNode }) => {
    const handlersRef = useRef<EditorHandlers>({});
    const setHandlers = useCallback((handlers: EditorHandlers) => {
        handlersRef.current = handlers;
    }, []);

    const editor = useTiptapEditor({
        extensions: EDITOR_EXTENSIONS,
        content: "",
        onUpdate: ({ editor: currentEditor }) => handlersRef.current.onUpdate?.(currentEditor),
        onSelectionUpdate: ({ editor: currentEditor }) =>
            handlersRef.current.onSelectionUpdate?.(currentEditor),
        onTransaction: ({ editor: currentEditor }) =>
            handlersRef.current.onTransaction?.(currentEditor),
    });

    const value = useMemo(() => ({ editor, setHandlers }), [editor, setHandlers]);

    return <editorContext.Provider value={value}>{children}</editorContext.Provider>;
};

export function useEditorContext(): EditorContextValue {
    const context = useContext(editorContext);
    if (!context) {
        throw new Error("useEditorContext debe usarse dentro de EditorProvider");
    }

    return context;
}
