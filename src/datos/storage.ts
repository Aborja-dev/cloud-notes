import { create } from "zustand";
import type { Folder, UserProfile } from "../types";
import { collection, doc, onSnapshot, query, serverTimestamp, setDoc, where } from "firebase/firestore";
import { db } from "../firebase";
import { generateId } from "../context/NotesContext";

class FolderClass {
    subscribe = (
        userId: string,
        onFolders: (folders: Folder[]) => void,
        onError: (error: Error) => void
    ) => {
        const foldersQuery = query(collection(db, 'folders'), where('userId', '==', userId));

        return onSnapshot(
            foldersQuery,
            (snapshot) => {
                const folderList = snapshot.docs
                    .map((docSnap) => ({ ...docSnap.data(), id: docSnap.id } as Folder))
                    .sort((a, b) => a.name.localeCompare(b.name));
                onFolders(folderList);
            },
            onError
        );
    }
}

export const folderRepository = new FolderClass();

interface StorageState {
    folders: Folder[];
    setFolders: (folders: Folder[]) => void;
    createFolder: (folder:{ name: string, color: string, icon: string }, user: UserProfile) => Promise<string>;
    updateFolder: (updatedFolder: Folder) => void;
    deleteFolder: (folderId: string) => void;
}

export const useStorage = create<StorageState>()((set) => ({
    folders: [],
    setFolders: (folders) => set({ folders }),
    createFolder: async (folder: { name: string, color: string, icon: string }, user: UserProfile): Promise<string> => {
        const { name, color, icon } = folder;
        const newId = generateId();
        const newFolder: Folder = {
            id: newId,
            userId: user.uid,
            name: name.trim() || 'Nueva Carpeta',
            color,
            icon,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        };
        await setDoc(doc(db, 'folders', newId), newFolder);
        return newId;

    },
    updateFolder: (updatedFolder: Folder) => set((state) => ({
        folders: state.folders.map((folder: Folder) => folder.id === updatedFolder.id ? updatedFolder : folder)
    })),
    deleteFolder: (folderId: string) => set((state) => ({
        folders: state.folders.filter((folder: Folder) => folder.id !== folderId)
    }))
}))
