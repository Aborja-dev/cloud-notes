import React, { createContext, useContext, useEffect, useReducer, useTransition } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, googleProvider, signInWithPopup, signOut, handleFirestoreError, OperationType } from '../firebase';
import type { Note, Folder, UserProfile } from '../types';
import { useStorage } from '../datos/storage';
import { folderRepository } from '../features/folders/data/folderRepository';
import { notesRepository } from '../features/notes/data/notesRepository';
import { INITIAL_UI_STATE, type UIState } from '../state/uiState';
import { uiReducer } from '../state/actions';

interface NotesContextType {
  state: UIState;
  notes: Note[];
  folders: Folder[];
  setMobileView: (view: 'list' | 'editor') => void;
  setActiveFilter: (filter: UIState['activeFilter']) => void;
  setSelectedNoteId: (id: string | null) => void;
  setSearchQuery: (query: string) => void;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  createNote: (folderId?: string) => Promise<string | null>;
  updateNote: (id: string, updates: Partial<Note>) => Promise<void>;
  deleteNote: (id: string, permanent?: boolean) => Promise<void>;
  restoreNote: (id: string) => Promise<void>;
  togglePinNote: (id: string) => Promise<void>;
  moveNoteToFolder: (noteId: string, folderId: string) => Promise<void>;
  createFolder: (name: string, color?: string, icon?: string) => Promise<string | null>;
  updateFolder: (id: string, name: string, color: string, icon: string) => Promise<void>;
  deleteFolder: (id: string, moveNotesToRoot?: boolean) => Promise<void>;
}

const NotesContext = createContext<NotesContextType | null>(null);

export function generateId(): string {
  return 'id_' + Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
}

export const NotesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(uiReducer, INITIAL_UI_STATE);
  const {
    folders,
    notes,
    setFolders,
    setNotes,
    addFolder,
    updateFolder: updateStoredFolder,
    removeFolder,
    addNote: addStoredNote,
    updateNote: updateStoredNote,
    removeNote: removeStoredNote,
  } = useStorage();
  const [, startTransition] = useTransition();


  // Listen to network status
  useEffect(() => {
    dispatch({ type: 'SET_ONLINE', payload: { isOnline: navigator.onLine } });
    const handleOnline = () => dispatch({ type: 'SET_ONLINE', payload: { isOnline: true } });
    const handleOffline = () => dispatch({ type: 'SET_ONLINE', payload: { isOnline: false } });

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: User | null) => {
      if (firebaseUser) {
        const userProfile: UserProfile = {
          uid: firebaseUser.uid,
          displayName: firebaseUser.displayName || 'Usuario',
          email: firebaseUser.email,
          photoURL: firebaseUser.photoURL,
        };
        dispatch({ type: 'LOGIN', payload: { userProfile } });
      } else {
        dispatch({ type: 'LOGOUT' });
      }
    });

    return () => unsubscribe();
  }, []);

  // Real-time Firestore sync when authenticated
  useEffect(() => {
    if (!state.logged) {
      setNotes([]);
      return;
    }
    return notesRepository.subscribe(
      state.logged.uid,
      (syncedNotes) => {
        setNotes(syncedNotes);
        startTransition(() => dispatch({
          type: 'NOTES_LOADED',
          payload: {
            noteIds: syncedNotes.map((note) => note.id),
            firstActiveNoteId: syncedNotes.find((note) => !note.isArchived)?.id ?? null,
            updatedAt: new Date(),
          },
        }));
      },
      (error) => {
        dispatch({ type: 'NOTES_ERROR', payload: { errorMessage: error.message } });
        handleFirestoreError(error, OperationType.LIST, 'notes');
      }
    );
  }, [state.logged, setNotes, startTransition]);

  useEffect(() => {
    if (!state.logged) {
      setFolders([]);
      return;
    }
    if (!state.isOnline) {
      dispatch({ type: 'LOAD_ERROR', payload: { errorMessage: 'No internet connection' } });
      return;
    }
    dispatch({ type: 'LOADING' });
    return folderRepository.subscribe(
      state.logged.uid,
      (storedFolders) => {
        setFolders(storedFolders);
        dispatch({ type: 'LOAD_SUCCESS', payload: { updatedAt: new Date() } });
      },
      (error) => {
        dispatch({ type: 'LOAD_ERROR', payload: { errorMessage: error.message } });
        handleFirestoreError(error, OperationType.LIST, 'folders');
      }
    );
  }, [state.logged, state.isOnline, setFolders]);

  const loginWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      console.error('Login error:', err);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const createNote = async (folderId?: string): Promise<string | null> => {
    if (!state.logged) return null;
    dispatch({ type: 'CREATE_NOTE', status: 'started' });
    const newId = generateId();

    const newNote = {
      folderId: folderId || '',
      title: 'Nueva nota',
      content: '',
      isPinned: false,
      isArchived: false,
      color: '#ffffff',
      tags: [],
    };

    const path = `notes/${newId}`;
    try {
      const createdNote = await notesRepository.create(newNote, state.logged, newId);
      addStoredNote(createdNote);
      dispatch({
        type: 'CREATE_NOTE',
        status: 'succeeded',
        payload: { noteId: newId, updatedAt: new Date() },
      });
      return newId;
    } catch (err) {
      dispatch({
        type: 'CREATE_NOTE',
        status: 'failed',
        errorMessage: err instanceof Error ? err.message : String(err),
      });
      handleFirestoreError(err, OperationType.CREATE, path);
      return null;
    }
  };

  const updateNote = async (id: string, updates: Partial<Note>): Promise<void> => {
    if (!state.logged) return;
    dispatch({ type: 'UPDATE_NOTE', status: 'started' });
    const path = `notes/${id}`;
    try {
      await notesRepository.update(id, updates);
      updateStoredNote(id, { ...updates, updatedAt: new Date() });
      dispatch({ type: 'UPDATE_NOTE', status: 'succeeded', payload: { updatedAt: new Date() } });
    } catch (err) {
      dispatch({
        type: 'UPDATE_NOTE',
        status: 'failed',
        errorMessage: err instanceof Error ? err.message : String(err),
      });
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
  };

  const deleteNote = async (id: string, permanent = false): Promise<void> => {
    if (!state.logged) return;
    dispatch({ type: 'DELETE_NOTE', status: 'started' });
    const path = `notes/${id}`;
    try {
      if (permanent) {
        await notesRepository.delete(id);
        removeStoredNote(id);
      } else {
        await notesRepository.update(id, {
          isArchived: true,
        });
        updateStoredNote(id, { isArchived: true, updatedAt: new Date() });
      }
      dispatch({
        type: 'DELETE_NOTE',
        status: 'succeeded',
        payload: { noteId: id, permanent, updatedAt: new Date() },
      });
    } catch (err) {
      dispatch({
        type: 'DELETE_NOTE',
        status: 'failed',
        errorMessage: err instanceof Error ? err.message : String(err),
      });
      handleFirestoreError(err, permanent ? OperationType.DELETE : OperationType.UPDATE, path);
    }
  };

  const restoreNote = async (id: string): Promise<void> => {
    if (!state.logged) return;
    dispatch({ type: 'RESTORE_NOTE', status: 'started' });
    const path = `notes/${id}`;
    try {
      await notesRepository.update(id, {
        isArchived: false,
      });
      updateStoredNote(id, { isArchived: false, updatedAt: new Date() });
      dispatch({ type: 'RESTORE_NOTE', status: 'succeeded', payload: { updatedAt: new Date() } });
    } catch (err) {
      dispatch({
        type: 'RESTORE_NOTE',
        status: 'failed',
        errorMessage: err instanceof Error ? err.message : String(err),
      });
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
  };

  const togglePinNote = async (id: string): Promise<void> => {
    const note = notes.find((n) => n.id === id);
    if (!note) return;
    await updateNote(id, { isPinned: !note.isPinned });
  };

  const moveNoteToFolder = async (noteId: string, folderId: string): Promise<void> => {
    await updateNote(noteId, { folderId });
  };

  const createFolder = async (name: string, color = '#3b82f6', icon = 'folder'): Promise<string | null> => {
    if (!state.logged) return null;
    dispatch({ type: 'CREATE_FOLDER', status: 'started' });
    const newId = generateId();
    const newFolder = {
      name: name.trim() || 'Nueva Carpeta',
      color,
      icon,
    };
    try {
      const createdFolder = await folderRepository.create(newFolder, state.logged, newId);
      addFolder(createdFolder);
      dispatch({
        type: 'CREATE_FOLDER',
        status: 'succeeded',
        payload: { folderId: createdFolder.id, updatedAt: new Date() },
      });
      return createdFolder.id;
    } catch (err) {
      const path = `folders/${newId}`;
      dispatch({
        type: 'CREATE_FOLDER',
        status: 'failed',
        errorMessage: err instanceof Error ? err.message : String(err),
      });
      handleFirestoreError(err, OperationType.CREATE, path);
      return null;
    }
  };

  const updateFolder = async (id: string, name: string, color: string, icon: string): Promise<void> => {
    if (!state.logged) return;
    dispatch({ type: 'UPDATE_FOLDER', status: 'started' });
    const path = `folders/${id}`;
    try {
      const normalizedName = name.trim();
      await folderRepository.update(id, { name: normalizedName, color, icon });
      updateStoredFolder(id, { name: normalizedName, color, icon });
      dispatch({ type: 'UPDATE_FOLDER', status: 'succeeded', payload: { updatedAt: new Date() } });
    } catch (err) {
      dispatch({
        type: 'UPDATE_FOLDER',
        status: 'failed',
        errorMessage: err instanceof Error ? err.message : String(err),
      });
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
  };

  const deleteFolder = async (id: string, moveNotesToRoot = true): Promise<void> => {
    if (!state.logged) return;
    dispatch({ type: 'DELETE_FOLDER', status: 'started' });

    // Handle notes belonging to this folder
    const notesInFolder = notes.filter((n) => n.folderId === id);
    if (moveNotesToRoot) {
      for (const note of notesInFolder) {
        await updateNote(note.id, { folderId: '' });
      }
    } else {
      for (const note of notesInFolder) {
        await deleteNote(note.id, false);
      }
    }

    const path = `folders/${id}`;
    try {
      await folderRepository.delete(id);
      removeFolder(id);
      dispatch({
        type: 'DELETE_FOLDER',
        status: 'succeeded',
        payload: { folderId: id, updatedAt: new Date() },
      });
    } catch (err) {
      dispatch({
        type: 'DELETE_FOLDER',
        status: 'failed',
        errorMessage: err instanceof Error ? err.message : String(err),
      });
      handleFirestoreError(err, OperationType.DELETE, path);
    }
  };

  return (
    <NotesContext.Provider
      value={{
        state,
        notes,
        folders,
        setMobileView: (view) => dispatch({ type: 'SET_MOBILE_VIEW', payload: { view } }),
        setActiveFilter: (filter) => dispatch({ type: 'SET_ACTIVE_FILTER', payload: { filter } }),
        setSelectedNoteId: (id) => dispatch({ type: 'SET_SELECTED_NOTE_ID', payload: { noteId: id } }),
        setSearchQuery: (query) => dispatch({ type: 'SET_SEARCH_QUERY', payload: { query } }),
        loginWithGoogle,
        logout,
        createNote,
        updateNote,
        deleteNote,
        restoreNote,
        togglePinNote,
        moveNoteToFolder,
        createFolder,
        updateFolder,
        deleteFolder,
      }}
    >
      {children}
    </NotesContext.Provider>
  );
};

export const useNotes = () => {
  const context = useContext(NotesContext);
  if (!context) {
    throw new Error('useNotes must be used within a NotesProvider');
  }
  return context;
};
