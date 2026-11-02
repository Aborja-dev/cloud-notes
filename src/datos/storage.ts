import { create } from "zustand";
import type { Folder, Note } from "../types";

interface FolderSlice {
    folders: Folder[];
    setFolders: (folders: Folder[]) => void;
    addFolder: (folder: Folder) => void;
    updateFolder: (folderId: string, updates: Pick<Folder, "name" | "color" | "icon">) => void;
    removeFolder: (folderId: string) => void;
}

interface NotesSlice {
    notes: Note[];
    setNotes: (notes: Note[]) => void;
    addNote: (note: Note) => void;
    updateNote: (noteId: string, updates: Partial<Note>) => void;
    removeNote: (noteId: string) => void;
}

type StorageState = FolderSlice & NotesSlice;

const createFolderSlice = (set: (partial: Partial<StorageState> | ((state: StorageState) => Partial<StorageState>)) => void): FolderSlice => ({
    folders: [],
    setFolders: (folders) => set({ folders }),
    addFolder: (folder) => set((state) => ({
        folders: [...state.folders.filter((storedFolder) => storedFolder.id !== folder.id), folder]
            .sort((a, b) => a.name.localeCompare(b.name)),
    })),
    updateFolder: (folderId, updates) => set((state) => ({
        folders: state.folders.map((folder) =>
            folder.id === folderId ? { ...folder, ...updates } : folder
        ).sort((a, b) => a.name.localeCompare(b.name)),
    })),
    removeFolder: (folderId) => set((state) => ({
        folders: state.folders.filter((folder) => folder.id !== folderId),
    })),
});

const createNotesSlice = (set: (partial: Partial<StorageState> | ((state: StorageState) => Partial<StorageState>)) => void): NotesSlice => ({
    notes: [],
    setNotes: (notes) => set({ notes }),
    addNote: (note) => set((state) => ({
        notes: [...state.notes.filter((storedNote) => storedNote.id !== note.id), note],
    })),
    updateNote: (noteId, updates) => set((state) => ({
        notes: state.notes.map((note) => note.id === noteId ? { ...note, ...updates } : note),
    })),
    removeNote: (noteId) => set((state) => ({
        notes: state.notes.filter((note) => note.id !== noteId),
    })),
});

export const useStorage = create<StorageState>()((set) => ({
    ...createFolderSlice(set),
    ...createNotesSlice(set),
}));
