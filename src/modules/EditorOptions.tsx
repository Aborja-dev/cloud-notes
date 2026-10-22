import { ChevronDown } from "lucide-react";

export const EditorOptions = ({ 
  setShowBlockMenu,
  executeFormat,
  activeFormats,
  blockLabels,
  showBlockMenu,

 }: any) => {
    return (
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
              setShowBlockMenu(!showBlockMenu);
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
                  setShowBlockMenu(false);
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
                  setShowBlockMenu(false);
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
                  setShowBlockMenu(false);
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
                  setShowBlockMenu(false);
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
                  setShowBlockMenu(false);
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
    )
}