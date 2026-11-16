import { useContext, useEffect, useState } from "react";
import type { Folder, Note, UserProfile } from "../types";
import { folderRepository } from "../storage/Folder";
import { notesRepository } from "../storage/Notes";
import { userProfileRepository } from "../storage/UserProfile";
import { AppContext } from "../context/AppContext";
const UIState = {
    loading: false,
    activeFilter: 'all',
    mode: 'online',
    activeView: 'all',
    collapseFiles: false,
    collapseNotes: false,
    editorState: 'show'
}

type UIStateType = typeof UIState
export const UIACTIONS_TYPES = {
    LOGIN: 'LOGIN',
    LOAD: 'LOAD',
    LOADING: 'LOADING',
    COLLAPSE_FILES: 'COLLAPSE_FILES',
    COLLAPSE_NOTES: 'COLLAPSE_NOTES',
    CHANGE_EDITOR_MODE: 'CHANGE_EDITOR_MODE'
} as const
export type UIActionType = typeof UIACTIONS_TYPES[keyof typeof UIACTIONS_TYPES];


const UIReducer = (state: UIStateType, action: { type: UIActionType, payload: undefined }) => {
    switch (action.type) {
        case 'LOADING':
            return {
                ...state,
                loading: true
            }
        case 'LOGIN':
            const newState: UIStateType = {
                ...state,
                loading: false,
                activeFilter: 'all',
                mode: 'online',
                activeView: 'all',
                collapseFiles: false,
                collapseNotes: false,
                editorState: 'show'
            }
            return newState
    }
}

export const useApp = () => {
    const [notes, setNotes] = useState<Note[]>([]);
    const [folders, setFolders] = useState<Folder[]>([]);
    const [session, setSession] = useState<UserProfile | null>(null);
    const value = useContext(AppContext)
    if (!value) throw new Error('')
    let unsubscribeNotes: (() => void) | undefined;
    let unsubscribeFolders: (() => void) | undefined;
    const cleanSession = () => {
        unsubscribeNotes?.();
        unsubscribeFolders?.();
        unsubscribeNotes = undefined;
        unsubscribeFolders = undefined;
        setNotes([]);
        setFolders([]);
    }

    const load = (user: UserProfile) => {
        unsubscribeNotes = notesRepository.subscribe(
            user.uid,
            setNotes,
            (error) => console.error("Notes subscription failed:", error),
        );
        unsubscribeFolders = folderRepository.subscribe(
            user.uid,
            setFolders,
            (error) => console.error("Folders subscription failed:", error),
        );
    }
    useEffect(() => {
        const unsubscribeProfile = userProfileRepository.subscribe(
            (user) => {
                cleanSession()
                setSession(user);
                if (!user) return;
                load(user)
            },
            (error) => console.error("User profile subscription failed:", error),
        );

        return () => {
            unsubscribeProfile();
            unsubscribeNotes?.();
            unsubscribeFolders?.();
        };
    }, []);

    return { notes, folders, session, };
};
