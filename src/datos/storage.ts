import { create } from "zustand";
import type { Folder, UserProfile } from "../types";
import { collection, deleteDoc, doc, onSnapshot, query, serverTimestamp, setDoc, updateDoc, where } from "firebase/firestore";
import { db } from "../firebase";

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
    createFolder: (folder:{ name: string, color: string, icon: string }, user: UserProfile, newId: string) => Promise<string>;
    updateFolder: (id: string, name: string, color: string, icon: string) => Promise<void>;
    deleteFolder: (folderId: string) => Promise<void>;
}

export const useStorage = create<StorageState>()((set) => ({
    folders: [],
    setFolders: (folders) => set({ folders }),
    createFolder: async (
        folder: { name: string, color: string, icon: string },
        user: UserProfile,
        newId: string
    ): Promise<string> => {
        const { name, color, icon } = folder;
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
        set((state) => ({
            folders: [...state.folders, newFolder]
        }));
        return newId;
    },
    updateFolder: async (id: string, name: string, color: string, icon: string): Promise<void> => {
        const updatedAt = serverTimestamp();
        await updateDoc(doc(db, 'folders', id), {
            name: name.trim(),
            color,
            icon,
            updatedAt,
        });
        set((state) => ({
            folders: state.folders.map((folder) =>
                folder.id === id
                    ? { ...folder, name: name.trim(), color, icon, updatedAt }
                    : folder
            ),
        }));
    },
    deleteFolder: async (folderId: string): Promise<void> => {
        await deleteDoc(doc(db, 'folders', folderId));
        set((state) => ({
            folders: state.folders.filter((folder) => folder.id !== folderId),
        }));
    },
}))
