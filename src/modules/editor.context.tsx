import React, { createContext } from 'react'
export const editorContext = createContext<any | null>(null)
export const EditorProvider = (
    { children }: { children: React.ReactNode }
) => {
    const [editor, setEditor] = React.useState<any | null>(null)
    return (
        <editorContext.Provider value={{ editor, setEditor }}>
            {children}
        </editorContext.Provider>
    )
}