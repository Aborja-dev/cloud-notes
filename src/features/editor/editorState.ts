export interface ActiveFormats {
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

export interface EditorStats {
    words: number;
    chars: number;
    readTime: number;
}

export interface EditorState {
    title: string;
    copied: boolean;
    activeFormats: ActiveFormats;
    stats: EditorStats;
    showFolderMenu: boolean;
    showColorMenu: boolean;
    showBlockMenu: boolean;
    showEditorState: boolean;
}

export type EditorAction =
    | { type: "SET_TITLE"; payload: string }
    | { type: "SET_COPIED"; payload: boolean }
    | { type: "SET_ACTIVE_FORMATS"; payload: ActiveFormats }
    | { type: "SET_STATS"; payload: EditorStats }
    | { type: "TOGGLE_FOLDER_MENU" }
    | { type: "CLOSE_FOLDER_MENU" }
    | { type: "TOGGLE_COLOR_MENU" }
    | { type: "CLOSE_COLOR_MENU" }
    | { type: "TOGGLE_BLOCK_MENU" }
    | { type: "CLOSE_BLOCK_MENU" }
    | { type: "TOGGLE_EDITOR_STATE" };

export const INITIAL_EDITOR_STATE: EditorState = {
    title: "",
    copied: false,
    activeFormats: {
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
    },
    stats: { words: 0, chars: 0, readTime: 1 },
    showFolderMenu: false,
    showColorMenu: false,
    showBlockMenu: false,
    showEditorState: false,
};

export function editorReducer(state: EditorState, action: EditorAction): EditorState {
    switch (action.type) {
        case "SET_TITLE":
            return { ...state, title: action.payload };
        case "SET_COPIED":
            return { ...state, copied: action.payload };
        case "SET_ACTIVE_FORMATS":
            return { ...state, activeFormats: action.payload };
        case "SET_STATS":
            return { ...state, stats: action.payload };
        case "TOGGLE_FOLDER_MENU": {
            const showFolderMenu = !state.showFolderMenu;
            return {
                ...state,
                showFolderMenu,
                showColorMenu: showFolderMenu ? false : state.showColorMenu,
            };
        }
        case "CLOSE_FOLDER_MENU":
            return { ...state, showFolderMenu: false };
        case "TOGGLE_COLOR_MENU": {
            const showColorMenu = !state.showColorMenu;
            return {
                ...state,
                showColorMenu,
                showFolderMenu: showColorMenu ? false : state.showFolderMenu,
            };
        }
        case "CLOSE_COLOR_MENU":
            return { ...state, showColorMenu: false };
        case "TOGGLE_BLOCK_MENU":
            return { ...state, showBlockMenu: !state.showBlockMenu };
        case "CLOSE_BLOCK_MENU":
            return { ...state, showBlockMenu: false };
        case "TOGGLE_EDITOR_STATE":
            return { ...state, showEditorState: !state.showEditorState };
        default: {
            const exhaustiveCheck: never = action;
            return exhaustiveCheck;
        }
    }
}
