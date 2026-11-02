import { createContext, useContext, useEffect, useReducer } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import type { UserProfile, ViewFilter } from "../types";
import { auth, handleFirestoreError, OperationType } from "../firebase";
import { folderRepository, useStorage } from "../datos/storage";
export type SyncState = 'synced' | 'saving' | 'offline' | 'error';
export interface UIState {
    loading: "loading" | "error" | "idle"; // representa el estado de la carga si esta cargando en espera o si hubo un error
    logged: null | UserProfile; // representa si el usuario esta logueado o no
    activeFilter: ViewFilter; // representa el filtro activo de la vista de notas
    selectedNoteId: string | null; // representa la nota seleccionada actualmente para su visualización o edición 
    searchQuery: string; // representa la consulta de búsqueda actual para filtrar las notas NO ESTOY MUY SEGURO si pertence a UIState o a datos
    lastSyncTime: Date | null; // representa la fecha y hora de la última sincronización exitosa con el servidor
    isOnline: boolean; // representa si la aplicación está en línea o sin conexión
    mobileView: "list" | "editor";
    errorMessage: string | null; // representa el mensaje de error actual
}
const INITIAL_UI_STATE: UIState = {
    loading: "idle",
    logged: null,
    activeFilter: "all",
    selectedNoteId: null,
    searchQuery: "",
    lastSyncTime: null,
    isOnline: true,
    mobileView: "list",
    errorMessage: null,
};

const uiContext = createContext<{state: UIState, actions: any}>({
    state: INITIAL_UI_STATE,
    actions: {},
});


export const loadStage = {
    trigger: (uiState: UIState): {allowed: boolean, reason?: string} => {
        if (!uiState.isOnline) return {allowed: false, reason: 'No internet connection'};
        if (uiState.loading === 'loading') return {allowed: false, reason: 'Already loading'};
        if (!uiState.logged) return {allowed: false, reason: 'User not logged in'};
        return {allowed: true};
    },
    onSuccess: () => ({
        type: 'LOAD_SUCCESS',
        payload: {
            operationStatus: 'success',
        },
    }),
    onError: ( errorMessage: string) => ({
        type: 'LOAD_ERROR',
        payload: {
            operationStatus: 'error',
            errorMessage
        },
    }),
}

export const createStage = {
    trigger: (uiState: any): {allowed: boolean, reason?: string} => {
        if (!uiState.isOnline) return {allowed: false, reason: 'No internet connection'};
        return {allowed: true};
    },
    onSuccess: () => ({
        type: 'CREATE_SUCCESS',
        payload: {
            operationStatus: 'success',
        },
    }),
    onError: ( errorMessage: string) => ({
        type: 'CREATE_ERROR',
        payload: {
            operationStatus: 'error',
            errorMessage
        },
    }),
}
const uiReducer = (state: UIState, action: any) => {
    switch (action.type) {
        case 'LOADING':
            return {  
                ...state,
                loading: 'loading' as const,
            };
        case 'FINISH_LOADING':
            return {  
                ...state,
                loading: 'idle' as const,
            };
        case 'LOAD_SUCCESS':
            return {  
                ...state,
                loading: 'idle' as const,
                lastSyncTime: new Date(),
                errorMessage: null,
            };
             
        case 'LOAD_ERROR':
            return { 
                ...state,
                loading: 'error' as const,
                errorMessage: action.payload.errorMessage,
            };
        case 'SET_LOGGED':
            return {
                ...state,
                logged: action.payload.user,
                loading: 'idle' as const,
                errorMessage: null,
            };
        case 'SET_ONLINE':
            return {
                ...state,
                isOnline: action.payload.isOnline,
            };
        default:
            return state;
    }
};
export const UiProvider = ({children}: {children: React.ReactNode}) =>{
    const [state, dispatch] = useReducer(uiReducer, INITIAL_UI_STATE);
    const {setFolders} = useStorage();
    useEffect(() => onAuthStateChanged(auth, (firebaseUser: User | null) => {
        const user: UserProfile | null = firebaseUser
            ? {
                uid: firebaseUser.uid,
                displayName: firebaseUser.displayName || 'Usuario',
                email: firebaseUser.email,
                photoURL: firebaseUser.photoURL,
            }
            : null;
        dispatch({ type: 'SET_LOGGED', payload: { user } });
    }), []);

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

    useEffect(() => {
        if (!state.logged) {
            setFolders([]);
            return;
        }

        const check = loadStage.trigger(state);
        if (!check.allowed) {
            if (!state.isOnline) {
                dispatch(loadStage.onError(check.reason || 'No internet connection'));
            }
            return;
        }

        dispatch({ type: 'LOADING' });
        return folderRepository.subscribe(
            state.logged.uid,
            (folders) => {
                setFolders(folders);
                dispatch(loadStage.onSuccess());
            },
            (error) => {
                dispatch(loadStage.onError(error.message));
                handleFirestoreError(error, OperationType.LIST, 'folders');
            }
        );
    }, [state.logged, state.isOnline, setFolders]);

    return (
        <uiContext.Provider value={{state, actions: {}}}>
            {children}
        </uiContext.Provider>
    )
};

export const useUI = () => {
    const context = useContext(uiContext);
    if (!context) {
        throw new Error("useUI must be used within a UiProvider");
    }
    return context;
}