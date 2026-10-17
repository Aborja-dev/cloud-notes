import React, { useState, useEffect } from 'react';
import { 
  Folder as FolderIcon, 
  Briefcase, 
  BookOpen, 
  Code, 
  Heart, 
  Star, 
  Sparkles, 
  Coffee, 
  Target, 
  Archive,
  X,
  Check
} from 'lucide-react';
import type { Folder } from '../types';

interface FolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, color: string, icon: string) => Promise<void>;
  editingFolder?: Folder | null;
}

const PRESET_COLORS = [
  { name: 'Azul', value: '#3b82f6' },
  { name: 'Esmeralda', value: '#10b981' },
  { name: 'Ámbar', value: '#f59e0b' },
  { name: 'Rosa', value: '#ec4899' },
  { name: 'Púrpura', value: '#8b5cf6' },
  { name: 'Índigo', value: '#6366f1' },
  { name: 'Cian', value: '#06b6d4' },
  { name: 'Naranja', value: '#f97316' },
  { name: 'Rojo', value: '#ef4444' },
  { name: 'Pizarra', value: '#64748b' },
];

export const FOLDER_ICONS: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  folder: FolderIcon,
  briefcase: Briefcase,
  book: BookOpen,
  code: Code,
  heart: Heart,
  star: Star,
  sparkles: Sparkles,
  coffee: Coffee,
  target: Target,
  archive: Archive,
};

export const FolderModal: React.FC<FolderModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingFolder,
}) => {
  const [name, setName] = useState('');
  const [color, setColor] = useState(PRESET_COLORS[0].value);
  const [icon, setIcon] = useState('folder');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (editingFolder) {
      setName(editingFolder.name);
      setColor(editingFolder.color || PRESET_COLORS[0].value);
      setIcon(editingFolder.icon || 'folder');
    } else {
      setName('');
      setColor(PRESET_COLORS[0].value);
      setIcon('folder');
    }
  }, [editingFolder, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || submitting) return;
    setSubmitting(true);
    try {
      await onSave(name.trim(), color, icon);
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div 
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div 
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white shadow-xs"
              style={{ backgroundColor: color }}
            >
              {React.createElement(FOLDER_ICONS[icon] || FolderIcon, { className: 'w-4 h-4' })}
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              {editingFolder ? 'Editar carpeta' : 'Nueva carpeta'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Nombre de la carpeta
            </label>
            <input
              type="text"
              required
              maxLength={100}
              placeholder="Ej. Proyectos, Recetas, Trabajo..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition text-sm"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              Color
            </label>
            <div className="grid grid-cols-5 gap-2.5">
              {PRESET_COLORS.map((c) => (
                <button
                  type="button"
                  key={c.value}
                  onClick={() => setColor(c.value)}
                  className="h-8 rounded-lg flex items-center justify-center transition ring-offset-2 dark:ring-offset-slate-900 focus:outline-hidden"
                  style={{ backgroundColor: c.value }}
                  title={c.name}
                >
                  {color === c.value && <Check className="w-4 h-4 text-white stroke-[3]" />}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              Icono
            </label>
            <div className="grid grid-cols-5 gap-2">
              {Object.entries(FOLDER_ICONS).map(([key, IconComponent]) => (
                <button
                  type="button"
                  key={key}
                  onClick={() => setIcon(key)}
                  className={`p-2.5 rounded-xl flex items-center justify-center transition border ${
                    icon === key
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <IconComponent className="w-5 h-5" />
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!name.trim() || submitting}
              className="px-5 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-xs transition flex items-center gap-2"
            >
              {submitting ? 'Guardando...' : editingFolder ? 'Guardar cambios' : 'Crear carpeta'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
