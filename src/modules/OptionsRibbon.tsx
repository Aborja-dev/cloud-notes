
export const OptionsRibbon = ({ activeNote, folders, currentFolder }: any) => {
    return (
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
                        onClick={() => {
                            setShowFolderMenu(!showFolderMenu);
                            setShowColorMenu(false);
                        }}
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
                                    setShowFolderMenu(false);
                                }}
                                className={`w-full px-3 py-2 text-left flex items-center gap-2.5 hover:bg-slate-100 dark:hover:bg-slate-700 transition ${!activeNote.folderId ? 'text-blue-600 font-semibold' : 'text-slate-700 dark:text-slate-200'}`}
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
                                            setShowFolderMenu(false);
                                        }}
                                        className={`w-full px-3 py-2 text-left flex items-center gap-2.5 hover:bg-slate-100 dark:hover:bg-slate-700 transition ${activeNote.folderId === f.id ? 'text-blue-600 font-semibold' : 'text-slate-700 dark:text-slate-200'}`}
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
                        onClick={() => {
                            setShowColorMenu(!showColorMenu);
                            setShowFolderMenu(false);
                        }}
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
                                        setShowColorMenu(false);
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
                    className={`p-2 rounded-xl transition ${activeNote.isPinned
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
                    {syncState === 'saving' ? (
                        <>
                            <RefreshCw className="w-3 h-3 text-amber-500 animate-spin" />
                            <span className="text-amber-600 dark:text-amber-400">Guardando en la nube...</span>
                        </>
                    ) : isOnline ? (
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
    );
};

