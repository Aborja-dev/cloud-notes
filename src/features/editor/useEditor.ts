import { useCallback, useEffect, useReducer, useRef, useState, type ChangeEvent } from "react";
import type { Editor as TiptapEditor } from "@tiptap/core";
import type { Note } from "../../types";
import { useEditorContext } from "../../modules/editor.context";
import { editorReducer, INITIAL_EDITOR_STATE } from "./editorState";
import {
    calculateEditorStats,
    copyNote,
    executeEditorCommand,
    exportNote,
    readActiveFormats,
} from "./tiptap";

type UpdateNote = (id: string, updates: Partial<Note>) => Promise<void>;

function escapeHtml(value: string): string {
    return value.replace(/[&<>"']/g, (character) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;",
        "'": "&#39;",
    })[character] ?? character);
}

function getInitialContent(content: string): string {
    if (content && !content.includes("<") && content.includes("\n")) {
        return content
            .split("\n")
            .map((line) => `<p>${escapeHtml(line) || "<br>"}</p>`)
            .join("");
    }

    return content;
}

export const useEditor = (
    activeNote: Note | undefined,
    updateNote: UpdateNote,
) => {
    const [editorState, dispatch] = useReducer(editorReducer, INITIAL_EDITOR_STATE);
    const [canUndo, setCanUndo] = useState(false);
    const { editor, setHandlers } = useEditorContext();
    const {
        title,
        copied,
        activeFormats,
        stats,
        showFolderMenu,
        showColorMenu,
        showBlockMenu,
        showEditorState,
    } = editorState;
    const isUpdatingFromProp = useRef(false);
    const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const copiedTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const updateStats = useCallback((currentEditor: TiptapEditor) => {
        dispatch({ type: "SET_STATS", payload: calculateEditorStats(currentEditor) });
    }, []);

    const updateActiveFormats = useCallback((currentEditor: TiptapEditor | null = editor) => {
        if (!currentEditor) return;
        dispatch({
            type: "SET_ACTIVE_FORMATS",
            payload: readActiveFormats(currentEditor),
        });
    }, [editor]);

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

    const handleContentInput = useCallback((currentEditor: TiptapEditor) => {
        if (isUpdatingFromProp.current) return;
        const currentHtml = currentEditor.getHTML();
        updateStats(currentEditor);
        triggerSave(title, currentHtml);
    }, [title, triggerSave, updateStats]);

    useEffect(() => {
        setHandlers({
            onUpdate: handleContentInput,
            onSelectionUpdate: updateActiveFormats,
            onTransaction: (currentEditor) => setCanUndo(currentEditor.can().undo()),
        });
        return () => setHandlers({});
    }, [handleContentInput, setHandlers, updateActiveFormats]);

    useEffect(() => {
        if (!editor) return;

        isUpdatingFromProp.current = true;
        try {
            if (activeNote) {
                dispatch({ type: "SET_TITLE", payload: activeNote.title || "" });
                editor.commands.setContent(getInitialContent(activeNote.content || ""), {
                    emitUpdate: false,
                });
                updateStats(editor);
            } else {
                dispatch({ type: "SET_TITLE", payload: "" });
                editor.commands.clearContent(false);
                dispatch({
                    type: "SET_STATS",
                    payload: { words: 0, chars: 0, readTime: 1 },
                });
            }
        } finally {
            isUpdatingFromProp.current = false;
        }
        updateActiveFormats(editor);
    }, [activeNote?.id, editor, updateActiveFormats, updateStats]);

    useEffect(() => () => {
        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
        if (copiedTimeoutRef.current) clearTimeout(copiedTimeoutRef.current);
    }, []);

    const handleTitleChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
        const newTitle = event.target.value;
        dispatch({ type: "SET_TITLE", payload: newTitle });
        triggerSave(newTitle, editor?.getHTML() ?? "");
    }, [editor, triggerSave]);

    const executeFormat = useCallback((command: string, value?: string | number) => {
        if (!editor) return;
        executeEditorCommand(editor, command, value);
        updateActiveFormats(editor);
    }, [editor, updateActiveFormats]);

    const undo = useCallback(() => {
        if (!editor?.can().undo()) return;
        editor.chain().focus().undo().run();
    }, [editor]);

    const handleCopy = useCallback(() => {
        if (!editor) return;
        void copyNote(title, editor);
        dispatch({ type: "SET_COPIED", payload: true });
        if (copiedTimeoutRef.current) clearTimeout(copiedTimeoutRef.current);
        copiedTimeoutRef.current = setTimeout(() => {
            dispatch({ type: "SET_COPIED", payload: false });
        }, 2000);
    }, [editor, title]);

    const handleExport = useCallback((type: "html" | "txt") => {
        if (!editor) return;
        exportNote(title, editor, type);
    }, [editor, title]);

    const toggleFolderMenu = useCallback(() => {
        dispatch({ type: "TOGGLE_FOLDER_MENU" });
    }, []);
    const closeFolderMenu = useCallback(() => {
        dispatch({ type: "CLOSE_FOLDER_MENU" });
    }, []);
    const toggleColorMenu = useCallback(() => {
        dispatch({ type: "TOGGLE_COLOR_MENU" });
    }, []);
    const closeColorMenu = useCallback(() => {
        dispatch({ type: "CLOSE_COLOR_MENU" });
    }, []);
    const toggleBlockMenu = useCallback(() => {
        dispatch({ type: "TOGGLE_BLOCK_MENU" });
    }, []);
    const closeBlockMenu = useCallback(() => {
        dispatch({ type: "CLOSE_BLOCK_MENU" });
    }, []);
    const toggleEditorState = useCallback(() => {
        dispatch({ type: "TOGGLE_EDITOR_STATE" });
    }, []);

    return {
        editorState,
        title,
        copied,
        activeFormats,
        stats,
        showFolderMenu,
        showColorMenu,
        showBlockMenu,
        showEditorState,
        editor,
        canUndo,
        undo,
        handleTitleChange,
        executeFormat,
        handleCopy,
        handleExport,
        toggleFolderMenu,
        closeFolderMenu,
        toggleColorMenu,
        closeColorMenu,
        toggleBlockMenu,
        closeBlockMenu,
        toggleEditorState,
    };
};
