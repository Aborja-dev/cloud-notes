import { useCallback, useEffect, useReducer, useRef, type ChangeEvent } from "react";
import type { Note } from "../../types";
import { editorReducer, INITIAL_EDITOR_STATE } from "./editorState";
import {
    calculateEditorStats,
    copyNote,
    executeEditorCommand,
    exportNote,
    readActiveFormats,
} from "./operations";

type UpdateNote = (id: string, updates: Partial<Note>) => Promise<void>;

export const useEditor = (
    activeNote: Note | undefined,
    updateNote: UpdateNote,
) => {
    const [editorState, dispatch] = useReducer(editorReducer, INITIAL_EDITOR_STATE);
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
    const editorRef = useRef<HTMLDivElement>(null);
    const isUpdatingFromProp = useRef(false);
    const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const copiedTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const updateStats = useCallback((html: string) => {
        dispatch({ type: "SET_STATS", payload: calculateEditorStats(html) });
    }, []);

    const updateActiveFormats = useCallback(() => {
        if (!editorRef.current) return;

        try {
            dispatch({
                type: "SET_ACTIVE_FORMATS",
                payload: readActiveFormats(editorRef.current),
            });
        } catch {
            // The browser may reject formatting queries when the selection is outside the editor.
        }
    }, []);

    useEffect(() => {
        if (activeNote) {
            dispatch({ type: "SET_TITLE", payload: activeNote.title || "" });
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
            dispatch({ type: "SET_TITLE", payload: "" });
            if (editorRef.current) editorRef.current.innerHTML = "";
            dispatch({ type: "SET_STATS", payload: { words: 0, chars: 0, readTime: 1 } });
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
        dispatch({ type: "SET_TITLE", payload: newTitle });
        triggerSave(newTitle, editorRef.current?.innerHTML ?? "");
    }, [triggerSave]);

    const executeFormat = useCallback((command: string, value?: string) => {
        if (!editorRef.current) return;
        executeEditorCommand(editorRef.current, command, value);
        updateActiveFormats();
        handleContentInput();
    }, [handleContentInput, updateActiveFormats]);

    const handleCopy = useCallback(() => {
        if (!editorRef.current) return;
        void copyNote(title, editorRef.current.innerHTML);
        dispatch({ type: "SET_COPIED", payload: true });
        if (copiedTimeoutRef.current) clearTimeout(copiedTimeoutRef.current);
        copiedTimeoutRef.current = setTimeout(() => {
            dispatch({ type: "SET_COPIED", payload: false });
        }, 2000);
    }, [title]);

    const handleExport = useCallback((type: "html" | "txt") => {
        if (!editorRef.current) return;
        exportNote(title, editorRef.current.innerHTML, type);
    }, [title]);

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
        editorRef,
        updateActiveFormats,
        handleContentInput,
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