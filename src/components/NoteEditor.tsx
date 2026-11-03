import React from 'react';
import { EditorContent } from '@tiptap/react';
import { 
  Pin, 
  Trash2, 
  Folder as FolderIcon, 
  Download, 
  Copy, 
  Check, 
  Bold, 
  Italic, 
  Underline,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List, 
  ListOrdered, 
  Quote, 
  Minus, 
  RotateCcw,
  RefreshCw,
  WifiOff,
  Palette,
  ChevronDown,
  ChevronLeft,
  RemoveFormatting,
  Heading1,
  Heading2,
  Heading3,
  Type,
  Info,
  X,
} from 'lucide-react';
import { useNotes } from '../context/NotesContext';
import { FOLDER_ICONS } from './FolderModal';
import { useEditor } from '../features/editor/useEditor';

const NOTE_COLORS = [
  { name: 'Blanco', value: '#ffffff' },
  { name: 'Ámbar suave', value: '#fef3c7' },
  { name: 'Esmeralda menta', value: '#d1fae5' },
  { name: 'Cielo azul', value: '#e0f2fe' },
  { name: 'Lavanda', value: '#ede9fe' },
  { name: 'Rosa suave', value: '#ffe4e6' },
  { name: 'Pizarra tenue', value: '#f1f5f9' },
];

export const NoteEditor: React.FC = () => {
  const {
    notes,
    state,
    folders,
    updateNote,
    deleteNote,
    restoreNote,
    togglePinNote,
    createNote,
    setMobileView,
  } = useNotes();
  const activeNote = notes.find((n) => n.id === state.selectedNoteId);

  const {
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
  } = useEditor(activeNote, updateNote);

  if (!activeNote) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-white dark:bg-slate-900">
        <div className="w-16 h-16 rounded-3xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4">
          <Type className="w-8 h-8 stroke-[1.5]" />
        </div>
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
          Ninguna nota seleccionada
        </h3>
        <p className="text-sm text-slate-400 max-w-sm mt-1 mb-6">
          Selecciona una nota de la lista o crea una nueva para comenzar a escribir con texto enriquecido.
        </p>
        <button
          onClick={() => createNote()}
          className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm transition shadow-sm cursor-pointer"
        >
          Crear nueva nota
        </button>
      </div>
    );
  }

  const currentFolder = folders.find((f) => f.id === activeNote.folderId);
  const CurrentFolderIcon = currentFolder ? FOLDER_ICONS[currentFolder.icon] || FolderIcon : FolderIcon;

  const blockLabels: Record<string, string> = {
    p: 'Párrafo',
    h1: 'Título grande (H1)',
    h2: 'Título mediano (H2)',
    h3: 'Subtítulo (H3)',
    blockquote: 'Cita en bloque',
  };

  return (
    <div className="relative flex-1 flex flex-col h-full bg-white dark:bg-slate-900 overflow-hidden select-text">
      {/* Top Banner if in Trash */}
      {activeNote.isArchived && (
        <div className="bg-rose-500/10 border-b border-rose-500/20 px-6 py-2.5 flex items-center justify-between text-xs text-rose-700 dark:text-rose-300">
          <span>Esta nota está en la papelera.</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => restoreNote(activeNote.id)}
              className="px-3 py-1 font-semibold rounded-lg bg-rose-600 text-white hover:bg-rose-700 transition"
            >
              Restaurar nota
            </button>
            <button
              onClick={() => {
                if (window.confirm('¿Eliminar permanentemente esta nota? Esta acción no se puede deshacer.')) {
                  deleteNote(activeNote.id, true);
                }
              }}
              className="px-3 py-1 font-semibold rounded-lg border border-rose-400/40 hover:bg-rose-500/20 transition"
            >
              Eliminar definitivamente
            </button>
          </div>
        </div>
      )}

      {/* Editor Top Navigation Bar */}
      <div className="px-4 py-2.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Mobile Back to Notes button */}
          <button
            type="button"
            onClick={() => setMobileView('list')}
            className="md:hidden px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center gap-1 text-xs font-semibold shrink-0 transition cursor-pointer"
            title="Volver a la lista de notas"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Notas</span>
          </button>

          {/* Folder selector pill */}
          <div className="relative">
            <button
              type="button"
              onClick={toggleFolderMenu}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-xs font-medium text-slate-700 dark:text-slate-200 flex items-center gap-2 transition"
            >
              <CurrentFolderIcon
                className="w-3.5 h-3.5"
                style={{ color: currentFolder ? currentFolder.color : '#94a3b8' }}
              />
              <span className="max-w-[130px] truncate">
                {currentFolder ? currentFolder.name : 'Sin carpeta'}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {/* Folder Dropdown */}
            {showFolderMenu && (
              <div 
                className="absolute left-0 top-10 z-30 w-56 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 py-1.5 text-xs animate-in fade-in"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="px-3 py-1 font-semibold text-slate-400 uppercase tracking-wider text-[10px]">
                  Mover a carpeta
                </div>
                <button
                  type="button"
                  onClick={() => {
                    updateNote(activeNote.id, { folderId: '' });
                    closeFolderMenu();
                  }}
                  className={`w-full px-3 py-2 text-left flex items-center gap-2.5 hover:bg-slate-100 dark:hover:bg-slate-700 transition ${
                    !activeNote.folderId ? 'text-blue-600 font-semibold' : 'text-slate-700 dark:text-slate-200'
                  }`}
                >
                  <FolderIcon className="w-4 h-4 text-slate-400" />
                  <span>Sin carpeta</span>
                </button>

                {folders.map((f) => {
                  const Icon = FOLDER_ICONS[f.icon] || FolderIcon;
                  return (
                    <button
                      type="button"
                      key={f.id}
                      onClick={() => {
                        updateNote(activeNote.id, { folderId: f.id });
                        closeFolderMenu();
                      }}
                      className={`w-full px-3 py-2 text-left flex items-center gap-2.5 hover:bg-slate-100 dark:hover:bg-slate-700 transition ${
                        activeNote.folderId === f.id ? 'text-blue-600 font-semibold' : 'text-slate-700 dark:text-slate-200'
                      }`}
                    >
                      <Icon className="w-4 h-4" style={{ color: f.color }} />
                      <span className="truncate">{f.name}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Color palette selector */}
          <div className="relative">
            <button
              type="button"
              onClick={toggleColorMenu}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title="Color de tarjeta"
            >
              <Palette className="w-4 h-4" />
            </button>

            {showColorMenu && (
              <div 
                className="absolute left-0 top-10 z-30 p-2 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 flex gap-1.5"
                onClick={(e) => e.stopPropagation()}
              >
                {NOTE_COLORS.map((col) => (
                  <button
                    key={col.value}
                    onClick={() => {
                      updateNote(activeNote.id, { color: col.value });
                      closeColorMenu();
                    }}
                    style={{ backgroundColor: col.value }}
                    className="w-6 h-6 rounded-full border border-slate-300 dark:border-slate-600 hover:scale-110 transition flex items-center justify-center"
                    title={col.name}
                  >
                    {activeNote.color === col.value && <Check className="w-3 h-3 text-slate-800 stroke-[3]" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Pin toggle */}
          <button
            type="button"
            onClick={() => togglePinNote(activeNote.id)}
            className={`p-2 rounded-xl transition ${
              activeNote.isPinned
                ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/40'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            title={activeNote.isPinned ? 'Desfijar de la parte superior' : 'Fijar nota'}
          >
            <Pin className="w-4 h-4" fill={activeNote.isPinned ? 'currentColor' : 'none'} />
          </button>

          {/* Trash button */}
          {!activeNote.isArchived && (
            <button
              type="button"
              onClick={() => deleteNote(activeNote.id, false)}
              className="p-2 rounded-xl text-slate-500 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition"
              title="Mover a papelera"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Right side controls: Real-time sync status & export */}
        <div className="flex items-center gap-2">
          {/* Cloud Sync indicator pill */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
            {state.syncState === 'saving' ? (
              <>
                <RefreshCw className="w-3 h-3 text-amber-500 animate-spin" />
                <span className="text-amber-600 dark:text-amber-400">Guardando en la nube...</span>
              </>
            ) : state.isOnline ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-emerald-600 dark:text-emerald-400">Guardado en la nube</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3 h-3 text-red-500" />
                <span className="text-red-500">Sin conexión</span>
              </>
            )}
          </div>

          {/* Copy content button */}
          <button
            type="button"
            onClick={handleCopy}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title="Copiar texto de la nota"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
          </button>

          {/* Export dropdown */}
          <div className="relative group">
            <button
              type="button"
              onClick={() => handleExport('html')}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center gap-1"
              title="Descargar nota"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* RICH TEXT FORMATTING TOOLBAR */}
      <div 
        className="px-4 sm:px-6 py-2 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/90 flex items-center gap-1 overflow-x-auto text-slate-600 dark:text-slate-300 shrink-0 select-none scrollbar-none"
        onMouseDown={(e) => {
          // Keep editor selection active when clicking toolbar empty space
          if ((e.target as HTMLElement).tagName !== 'BUTTON') {
            e.preventDefault();
          }
        }}
      >
        {/* Paragraph / Heading Block Selector */}
        <div className="relative">
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              toggleBlockMenu();
            }}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-medium flex items-center gap-1.5 transition"
            title="Estilo de párrafo o encabezado"
          >
            <span>{blockLabels[activeFormats.currentBlock] || 'Párrafo'}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {showBlockMenu && (
            <div 
              className="absolute left-0 top-9 z-40 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-1 text-xs animate-in fade-in"
              onMouseDown={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  executeFormat('formatBlock', '<p>');
                  closeBlockMenu();
                }}
                className={`w-full px-3 py-1.5 text-left hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2 ${
                  activeFormats.currentBlock === 'p' ? 'text-blue-600 font-semibold' : ''
                }`}
              >
                <Type className="w-3.5 h-3.5" />
                <span>Párrafo normal</span>
              </button>
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  executeFormat('formatBlock', '<h1>');
                  closeBlockMenu();
                }}
                className={`w-full px-3 py-1.5 text-left hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2 ${
                  activeFormats.currentBlock === 'h1' ? 'text-blue-600 font-semibold' : ''
                }`}
              >
                <Heading1 className="w-3.5 h-3.5" />
                <span className="font-bold text-sm">Título grande (H1)</span>
              </button>
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  executeFormat('formatBlock', '<h2>');
                  closeBlockMenu();
                }}
                className={`w-full px-3 py-1.5 text-left hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2 ${
                  activeFormats.currentBlock === 'h2' ? 'text-blue-600 font-semibold' : ''
                }`}
              >
                <Heading2 className="w-3.5 h-3.5" />
                <span className="font-semibold text-xs">Título mediano (H2)</span>
              </button>
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  executeFormat('formatBlock', '<h3>');
                  closeBlockMenu();
                }}
                className={`w-full px-3 py-1.5 text-left hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2 ${
                  activeFormats.currentBlock === 'h3' ? 'text-blue-600 font-semibold' : ''
                }`}
              >
                <Heading3 className="w-3.5 h-3.5" />
                <span>Subtítulo (H3)</span>
              </button>
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  executeFormat('formatBlock', '<blockquote>');
                  closeBlockMenu();
                }}
                className={`w-full px-3 py-1.5 text-left hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2 ${
                  activeFormats.currentBlock === 'blockquote' ? 'text-blue-600 font-semibold' : ''
                }`}
              >
                <Quote className="w-3.5 h-3.5" />
                <span className="italic">Cita en bloque</span>
              </button>
            </div>
          )}
        </div>

        <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 mx-1 shrink-0" />

        {/* Inline styles: Negrita, Cursiva, Subrayado, Tachado */}
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              executeFormat('bold');
            }}
            className={`p-1.5 rounded-lg transition ${
              activeFormats.bold
                ? 'bg-blue-600 text-white shadow-xs font-bold'
                : 'hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
            title="Negrita (Ctrl+B)"
          >
            <Bold className="w-4 h-4 stroke-[2.5]" />
          </button>

          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              executeFormat('italic');
            }}
            className={`p-1.5 rounded-lg transition ${
              activeFormats.italic
                ? 'bg-blue-600 text-white shadow-xs'
                : 'hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
            title="Cursiva (Ctrl+I)"
          >
            <Italic className="w-4 h-4" />
          </button>

          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              executeFormat('underline');
            }}
            className={`p-1.5 rounded-lg transition ${
              activeFormats.underline
                ? 'bg-blue-600 text-white shadow-xs font-bold'
                : 'hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
            title="Subrayado (Ctrl+U)"
          >
            <Underline className="w-4 h-4" />
          </button>

          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              executeFormat('strikeThrough');
            }}
            className={`p-1.5 rounded-lg transition ${
              activeFormats.strike
                ? 'bg-blue-600 text-white shadow-xs'
                : 'hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
            title="Tachado"
          >
            <Strikethrough className="w-4 h-4" />
          </button>
        </div>

        <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 mx-1 shrink-0" />

        {/* Text Alignment Controls */}
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              executeFormat('justifyLeft');
            }}
            className={`p-1.5 rounded-lg transition ${
              activeFormats.alignLeft
                ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 font-bold'
                : 'hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
            title="Alinear a la izquierda"
          >
            <AlignLeft className="w-4 h-4" />
          </button>

          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              executeFormat('justifyCenter');
            }}
            className={`p-1.5 rounded-lg transition ${
              activeFormats.alignCenter
                ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 font-bold'
                : 'hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
            title="Centrar"
          >
            <AlignCenter className="w-4 h-4" />
          </button>

          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              executeFormat('justifyRight');
            }}
            className={`p-1.5 rounded-lg transition ${
              activeFormats.alignRight
                ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 font-bold'
                : 'hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
            title="Alinear a la derecha"
          >
            <AlignRight className="w-4 h-4" />
          </button>

          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              executeFormat('justifyFull');
            }}
            className={`p-1.5 rounded-lg transition ${
              activeFormats.alignJustify
                ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 font-bold'
                : 'hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
            title="Justificar texto"
          >
            <AlignJustify className="w-4 h-4" />
          </button>
        </div>

        <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 mx-1 shrink-0" />

        {/* List Controls: Con viñetas y numeradas */}
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              executeFormat('insertUnorderedList');
            }}
            className={`p-1.5 rounded-lg transition ${
              activeFormats.bulletList
                ? 'bg-blue-600 text-white shadow-xs'
                : 'hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
            title="Lista con viñetas"
          >
            <List className="w-4 h-4" />
          </button>

          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              executeFormat('insertOrderedList');
            }}
            className={`p-1.5 rounded-lg transition ${
              activeFormats.orderedList
                ? 'bg-blue-600 text-white shadow-xs'
                : 'hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
            title="Lista numerada"
          >
            <ListOrdered className="w-4 h-4" />
          </button>
        </div>

        <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 mx-1 shrink-0" />

        {/* Additional formatting: Cita, Separador horizontal, Limpiar formato */}
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              executeFormat('formatBlock', '<blockquote>');
            }}
            className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition"
            title="Cita en bloque"
          >
            <Quote className="w-4 h-4" />
          </button>

          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              executeFormat('insertHorizontalRule');
            }}
            className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition"
            title="Insertar línea divisoria"
          >
            <Minus className="w-4 h-4" />
          </button>

          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              executeFormat('removeFormat');
            }}
            className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition"
            title="Eliminar formato"
          >
            <RemoveFormatting className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Editor Content Surface */}
      <div 
        className="flex-1 flex flex-col p-4 sm:p-8 overflow-y-auto cursor-text"
        onClick={() => {
          if (editor && !editor.isFocused) {
            editor.commands.focus();
          }
        }}
        onTouchEnd={(e) => {
          if (e.target === e.currentTarget && editor) {
            editor.commands.focus();
          }
        }}
      >
        {/* Note Title Input */}
        <input
          type="text"
          placeholder="Título de la nota..."
          value={title}
          maxLength={200}
          onChange={handleTitleChange}
          className="text-xl sm:text-3xl font-extrabold text-slate-900 dark:text-white placeholder-slate-300 dark:placeholder-slate-600 border-none outline-hidden bg-transparent mb-3 sm:mb-4 tracking-tight shrink-0"
        />

        <EditorContent
          editor={editor}
          className="flex-1 text-slate-800 dark:text-slate-200 text-base leading-relaxed font-sans
            [&_.ProseMirror]:min-h-[400px] [&_.ProseMirror]:pb-36 [&_.ProseMirror]:outline-hidden
            [&_.ProseMirror_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)] [&_.ProseMirror_p.is-editor-empty:first-child::before]:float-left [&_.ProseMirror_p.is-editor-empty:first-child::before]:h-0 [&_.ProseMirror_p.is-editor-empty:first-child::before]:text-slate-400 [&_.ProseMirror_p.is-editor-empty:first-child::before]:pointer-events-none
            [&_h1]:text-2xl [&_h1]:font-extrabold [&_h1]:my-3 [&_h1]:pb-1 [&_h1]:border-b [&_h1]:border-slate-200 dark:[&_h1]:border-slate-800
            [&_h2]:text-xl [&_h2]:font-bold [&_h2]:my-2.5 [&_h2]:pb-1 [&_h2]:border-b [&_h2]:border-slate-200 dark:[&_h2]:border-slate-800
            [&_h3]:text-lg [&_h3]:font-bold [&_h3]:my-2
            [&_p]:my-1.5
            [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-2
            [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:my-2
            [&_li]:my-1
            [&_blockquote]:border-l-4 [&_blockquote]:border-blue-500 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:my-3 [&_blockquote]:text-slate-600 dark:[&_blockquote]:text-slate-400
            [&_hr]:my-4 [&_hr]:border-slate-200 dark:[&_hr]:border-slate-800
            [&_b]:font-bold [&_strong]:font-bold
            [&_i]:italic [&_em]:italic
            [&_u]:underline
            [&_strike]:line-through
          "
        />
      </div>

      <div className="absolute bottom-14 right-4 z-50 flex flex-col items-end gap-2">
        {showEditorState && (
          <section
            id="editor-state-panel"
            aria-label="Estado interno del editor"
            className="w-[min(22rem,calc(100vw-2rem))] max-h-[min(70vh,32rem)] overflow-auto rounded-xl border border-slate-200 bg-white p-4 shadow-xl dark:border-slate-700 dark:bg-slate-800"
          >
            <h2 className="mb-3 text-sm font-semibold text-slate-800 dark:text-slate-100">
              Estado del editor
            </h2>
            <dl className="space-y-3 text-xs">
              <div>
                <dt className="mb-1 font-medium text-slate-500 dark:text-slate-400">showEditorState</dt>
                <dd className="rounded-md bg-slate-50 p-2 text-slate-700 dark:bg-slate-900 dark:text-slate-200">
                  {JSON.stringify(editorState.showEditorState)}
                </dd>
              </div>
              <div>
                <dt className="mb-1 font-medium text-slate-500 dark:text-slate-400">title</dt>
                <dd className="break-words rounded-md bg-slate-50 p-2 text-slate-700 dark:bg-slate-900 dark:text-slate-200">
                  {JSON.stringify(title)}
                </dd>
              </div>
              <div>
                <dt className="mb-1 font-medium text-slate-500 dark:text-slate-400">copied</dt>
                <dd className="rounded-md bg-slate-50 p-2 text-slate-700 dark:bg-slate-900 dark:text-slate-200">
                  {JSON.stringify(copied)}
                </dd>
              </div>
              <div>
                <dt className="mb-1 font-medium text-slate-500 dark:text-slate-400">showFolderMenu</dt>
                <dd className="rounded-md bg-slate-50 p-2 text-slate-700 dark:bg-slate-900 dark:text-slate-200">
                  {JSON.stringify(showFolderMenu)}
                </dd>
              </div>
              <div>
                <dt className="mb-1 font-medium text-slate-500 dark:text-slate-400">showColorMenu</dt>
                <dd className="rounded-md bg-slate-50 p-2 text-slate-700 dark:bg-slate-900 dark:text-slate-200">
                  {JSON.stringify(showColorMenu)}
                </dd>
              </div>
              <div>
                <dt className="mb-1 font-medium text-slate-500 dark:text-slate-400">showBlockMenu</dt>
                <dd className="rounded-md bg-slate-50 p-2 text-slate-700 dark:bg-slate-900 dark:text-slate-200">
                  {JSON.stringify(showBlockMenu)}
                </dd>
              </div>
              <div>
                <dt className="mb-1 font-medium text-slate-500 dark:text-slate-400">activeFormats</dt>
                <dd>
                  <pre className="overflow-x-auto whitespace-pre-wrap break-words rounded-md bg-slate-50 p-2 text-slate-700 dark:bg-slate-900 dark:text-slate-200">
                    {JSON.stringify(activeFormats, null, 2)}
                  </pre>
                </dd>
              </div>
              <div>
                <dt className="mb-1 font-medium text-slate-500 dark:text-slate-400">stats</dt>
                <dd>
                  <pre className="rounded-md bg-slate-50 p-2 text-slate-700 dark:bg-slate-900 dark:text-slate-200">
                    {JSON.stringify(stats, null, 2)}
                  </pre>
                </dd>
              </div>
            </dl>
          </section>
        )}
        <button
          type="button"
          aria-expanded={showEditorState}
          aria-controls="editor-state-panel"
          aria-label={showEditorState ? 'Ocultar estado del editor' : 'Mostrar estado del editor'}
          onClick={(event) => {
            event.stopPropagation();
            toggleEditorState();
          }}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg transition hover:bg-blue-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          {showEditorState ? <X className="h-5 w-5" /> : <Info className="h-5 w-5" />}
        </button>
      </div>

      {/* Bottom Metadata & Statistics Bar */}
      <div className="px-6 py-2.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900 text-xs text-slate-400 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <span>{stats.words} palabras</span>
          <span>{stats.chars} caracteres</span>
          <span className="hidden sm:inline">~{stats.readTime} min de lectura</span>
        </div>
        <div className="flex items-center gap-2 text-[11px]">
          <span className="inline-flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-medium">
            Formato de texto enriquecido activo
          </span>
          <span className="hidden md:inline text-slate-300 dark:text-slate-700">•</span>
          <span className="hidden md:inline">Sincronizado con Firebase Firestore</span>
        </div>
      </div>
    </div>
  );
};
