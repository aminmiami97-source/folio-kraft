import React, { useState, useRef } from 'react';
import { Board, Note, NoteContent, ChecklistItem } from '../types';
import { 
  X, 
  Image as ImageIcon, 
  CheckSquare, 
  Plus, 
  Trash2, 
  Lock, 
  Pin, 
  Tag as TagIcon,
  AlignLeft,
  Upload
} from 'lucide-react';

interface NoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (noteData: {
    id?: string;
    boardId: string;
    color: string;
    isPinned: boolean;
    content: NoteContent;
  }) => void;
  boards: Board[];
  activeBoardId: string;
  initialNote?: Note | null;
}

const PAPER_COLORS = [
  { id: 'manila', name: 'Manila', bg: 'bg-[#FCF8EE]', darkBg: 'dark:bg-[#27241E]', border: 'border-[#E2D8C3]' },
  { id: 'kraft', name: 'Kraft', bg: 'bg-[#F2E5D0]', darkBg: 'dark:bg-[#2A231B]', border: 'border-[#D9C4A7]' },
  { id: 'parchment', name: 'Parchment', bg: 'bg-[#F6EEDD]', darkBg: 'dark:bg-[#28221B]', border: 'border-[#DFCFA]' },
  { id: 'sage', name: 'Sage Linen', bg: 'bg-[#EBF0E6]', darkBg: 'dark:bg-[#20271E]', border: 'border-[#C8D5BE]' },
  { id: 'terracotta', name: 'Terracotta', bg: 'bg-[#F7EDE8]', darkBg: 'dark:bg-[#2B201D]', border: 'border-[#E4CDC5]' },
  { id: 'charcoal', name: 'Charcoal', bg: 'bg-[#EAE6DF]', darkBg: 'dark:bg-[#1E1B18]', border: 'border-[#CCC4B8]' },
];

export const NoteModal: React.FC<NoteModalProps> = ({
  isOpen,
  onClose,
  onSave,
  boards,
  activeBoardId,
  initialNote,
}) => {
  const [boardId, setBoardId] = useState(initialNote?.boardId || activeBoardId);
  const [color, setColor] = useState(initialNote?.color || 'manila');
  const [isPinned, setIsPinned] = useState(initialNote?.isPinned || false);
  const [useRuledLines, setUseRuledLines] = useState(false);

  // Content fields
  const [title, setTitle] = useState(initialNote?.decryptedContent?.title || '');
  const [body, setBody] = useState(initialNote?.decryptedContent?.body || '');
  const [pictures, setPictures] = useState<string[]>(initialNote?.decryptedContent?.pictures || []);
  const [tags, setTags] = useState<string[]>(initialNote?.decryptedContent?.tags || []);
  const [checklist, setChecklist] = useState<ChecklistItem[]>(initialNote?.decryptedContent?.checklist || []);

  const [tagInput, setTagInput] = useState('');
  const [checklistInput, setChecklistInput] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Process image files to Base64
  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    Array.from(files).forEach(file => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = e => {
        if (e.target?.result && typeof e.target.result === 'string') {
          // Limit image resolution via canvas to prevent bloated payloads
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const maxDimension = 1000;
            let width = img.width;
            let height = img.height;

            if (width > maxDimension || height > maxDimension) {
              if (width > height) {
                height = Math.round((height * maxDimension) / width);
                width = maxDimension;
              } else {
                width = Math.round((width * maxDimension) / height);
                height = maxDimension;
              }
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(img, 0, 0, width, height);
              const compressedBase64 = canvas.toDataURL('image/jpeg', 0.85);
              setPictures(prev => [...prev, compressedBase64]);
            }
          };
          img.src = e.target.result;
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
      e.preventDefault();
      const cleaned = tagInput.trim().replace(/^#/, '');
      if (!tags.includes(cleaned)) {
        setTags([...tags, cleaned]);
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const handleAddChecklistItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!checklistInput.trim()) return;
    setChecklist([
      ...checklist,
      { id: `c-${Date.now()}-${Math.random()}`, text: checklistInput.trim(), done: false },
    ]);
    setChecklistInput('');
  };

  const handleRemoveChecklistItem = (id: string) => {
    setChecklist(checklist.filter(item => item.id !== id));
  };

  const handleToggleChecklistItem = (id: string) => {
    setChecklist(
      checklist.map(item => (item.id === id ? { ...item, done: !item.done } : item))
    );
  };

  const handleRemovePicture = (index: number) => {
    setPictures(pictures.filter((_, idx) => idx !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() && !body.trim() && pictures.length === 0) return;

    onSave({
      id: initialNote?.id,
      boardId,
      color,
      isPinned,
      content: {
        title: title.trim(),
        body: body.trim(),
        pictures,
        tags,
        checklist,
      },
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-3 sm:p-5 overflow-y-auto backdrop-blur-xs">
      <div className="bg-[#FAF7F0] dark:bg-[#1C1916] border border-[#DDD0BC] dark:border-[#383129] rounded-lg w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-[#E8DEC8] dark:border-[#302922] bg-[#F4EDE0] dark:bg-[#201C18]">
          <div className="flex items-center gap-2">
            <span className="font-serif-paper text-base font-bold text-[#2B2621] dark:text-[#EAE4D8]">
              {initialNote ? 'Edit Idea Note' : 'Write Idea Note'}
            </span>
            <span className="text-[11px] font-mono-paper px-2 py-0.5 rounded bg-[#E4D7C2] dark:bg-[#2C2620] text-[#7E7365] dark:text-[#A89E90] flex items-center gap-1">
              <Lock className="w-3 h-3 text-[#5B8246]" />
              <span>AES-256 Encrypted</span>
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded text-[#7E7365] hover:text-[#2B2621] dark:hover:text-[#FAF7F0] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* Top Options Bar: Target Board & Paper Finish */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-mono-paper text-[#7E7365] dark:text-[#9F9485]">Board:</span>
              <select
                value={boardId}
                onChange={e => setBoardId(e.target.value)}
                className="px-2.5 py-1 rounded bg-[#FCFAF6] dark:bg-[#25211D] border border-[#D5C7B2] dark:border-[#383129] text-[#2B2621] dark:text-[#EAE4D8] font-medium"
              >
                {boards.map(b => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Paper Card Color Palette */}
            <div className="flex items-center gap-1.5">
              <span className="font-mono-paper text-[#7E7365] dark:text-[#9F9485] mr-1">Paper:</span>
              {PAPER_COLORS.map(p => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setColor(p.id)}
                  title={p.name}
                  className={`w-5 h-5 rounded border ${p.bg} ${p.border} cursor-pointer transition-transform ${
                    color === p.id ? 'ring-2 ring-offset-1 ring-[#8E4A35] scale-110' : 'opacity-80'
                  }`}
                />
              ))}
            </div>

            {/* Ruled lines & Pin options */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setUseRuledLines(!useRuledLines)}
                className={`flex items-center gap-1 px-2 py-1 rounded font-mono-paper text-[11px] border cursor-pointer ${
                  useRuledLines
                    ? 'bg-[#8E4A35] text-white border-[#8E4A35]'
                    : 'bg-[#FCFAF6] dark:bg-[#25211D] border-[#DDD0BC] text-[#7E7365]'
                }`}
              >
                <AlignLeft className="w-3 h-3" />
                <span>Lines</span>
              </button>

              <button
                type="button"
                onClick={() => setIsPinned(!isPinned)}
                className={`flex items-center gap-1 px-2 py-1 rounded font-mono-paper text-[11px] border cursor-pointer ${
                  isPinned
                    ? 'bg-[#8E4A35] text-white border-[#8E4A35]'
                    : 'bg-[#FCFAF6] dark:bg-[#25211D] border-[#DDD0BC] text-[#7E7365]'
                }`}
              >
                <Pin className="w-3 h-3" />
                <span>Pin</span>
              </button>
            </div>
          </div>

          {/* Note Title Input */}
          <div>
            <input
              type="text"
              autoFocus
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Title or headline..."
              className="w-full text-xl sm:text-2xl font-serif-paper font-bold px-3 py-2 rounded bg-transparent text-[#2B2621] dark:text-[#EAE4D8] border-b border-[#D8CCB8] dark:border-[#383129] focus:outline-none focus:border-[#8E4A35] placeholder:text-[#A69B8C]"
            />
          </div>

          {/* Note Body with Optional Ruled Lines */}
          <div className="relative">
            <textarea
              rows={6}
              value={body}
              onChange={e => setBody(e.target.value)}
              placeholder="Write your note, idea, draft, or journal entry here..."
              className={`w-full p-3 font-serif-paper text-sm sm:text-base text-[#2B2621] dark:text-[#EAE4D8] rounded bg-[#FCFAF6] dark:bg-[#211E1A] border border-[#DDD0BC] dark:border-[#383129] focus:outline-none focus:ring-1 focus:ring-[#8E4A35] leading-relaxed resize-y ${
                useRuledLines ? 'bg-ruled-paper' : ''
              }`}
            />
          </div>

          {/* Pictures Attachment Zone */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono-paper text-xs uppercase text-[#7E7365] dark:text-[#9F9485] font-semibold flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-[#8E4A35]" />
                <span>Pictures & Attachments ({pictures.length})</span>
              </span>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1 px-2.5 py-1 rounded text-xs font-serif-paper bg-[#EFE8DC] dark:bg-[#28241F] text-[#8E4A35] dark:text-[#D97E59] border border-[#DDD0BC] hover:bg-[#E7DDCE] cursor-pointer"
              >
                <Upload className="w-3 h-3" />
                <span>Add Pictures</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={e => handleFiles(e.target.files)}
                className="hidden"
              />
            </div>

            {/* Pictures Previews Grid or Drop Zone */}
            {pictures.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 rounded bg-[#F4EDE0] dark:bg-[#221F1B] border border-[#DDD0BC] dark:border-[#332C25]">
                {pictures.map((pic, idx) => (
                  <div key={idx} className="relative aspect-video rounded overflow-hidden border border-[#D5C7B2] group">
                    <img src={pic} alt={`Attached ${idx + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemovePicture(idx)}
                      className="absolute top-1 right-1 p-1 rounded-full bg-black/70 text-white hover:bg-red-700 transition-colors cursor-pointer"
                      title="Remove image"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div
                onDragOver={e => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={e => {
                  e.preventDefault();
                  setIsDragging(false);
                  handleFiles(e.dataTransfer.files);
                }}
                onClick={() => fileInputRef.current?.click()}
                className={`p-4 rounded-md border-2 border-dashed text-center cursor-pointer transition-colors ${
                  isDragging
                    ? 'border-[#8E4A35] bg-[#8E4A35]/5'
                    : 'border-[#DDD0BC] dark:border-[#383129] hover:bg-[#F2ECE0] dark:hover:bg-[#24201C]'
                }`}
              >
                <p className="text-xs text-[#7E7365] dark:text-[#9F9485] font-serif-paper">
                  Drag and drop photos or click to attach pictures to this card
                </p>
              </div>
            )}
          </div>

          {/* Checklist Items Section */}
          <div className="space-y-2">
            <span className="font-mono-paper text-xs uppercase text-[#7E7365] dark:text-[#9F9485] font-semibold flex items-center gap-1.5">
              <CheckSquare className="w-3.5 h-3.5 text-[#5B8246]" />
              <span>Checklist & Tasks</span>
            </span>

            {checklist.length > 0 && (
              <div className="space-y-1.5 p-2 rounded bg-[#F4EDE0] dark:bg-[#221F1B] border border-[#DDD0BC] dark:border-[#332C25]">
                {checklist.map(item => (
                  <div key={item.id} className="flex items-center justify-between gap-2 text-xs">
                    <div 
                      onClick={() => handleToggleChecklistItem(item.id)}
                      className="flex items-center gap-2 cursor-pointer flex-1 select-none"
                    >
                      <input
                        type="checkbox"
                        checked={item.done}
                        onChange={() => {}}
                        className="rounded border-[#C5B8A3] text-[#8E4A35]"
                      />
                      <span className={item.done ? 'line-through text-[#8C8070]' : 'text-[#2B2621] dark:text-[#EAE4D8]'}>
                        {item.text}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveChecklistItem(item.id)}
                      className="text-[#998B7B] hover:text-[#8E4A35]"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <input
                type="text"
                value={checklistInput}
                onChange={e => setChecklistInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddChecklistItem(e);
                  }
                }}
                placeholder="Add checklist item and press Enter..."
                className="flex-1 px-3 py-1.5 text-xs rounded bg-[#FCFAF6] dark:bg-[#211E1A] border border-[#DDD0BC] dark:border-[#383129] text-[#2B2621] dark:text-[#EAE4D8]"
              />
              <button
                type="button"
                onClick={handleAddChecklistItem}
                className="px-3 py-1.5 text-xs rounded bg-[#EADECE] dark:bg-[#2C2721] text-[#2B2621] dark:text-[#EAE4D8] font-medium border border-[#DDD0BC] hover:bg-[#DECFC] cursor-pointer"
              >
                Add
              </button>
            </div>
          </div>

          {/* Tags Section */}
          <div className="space-y-2">
            <span className="font-mono-paper text-xs uppercase text-[#7E7365] dark:text-[#9F9485] font-semibold flex items-center gap-1.5">
              <TagIcon className="w-3.5 h-3.5 text-[#C48439]" />
              <span>Tags</span>
            </span>

            <div className="flex flex-wrap items-center gap-1.5">
              {tags.map(tag => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 text-xs font-mono-paper px-2 py-0.5 rounded bg-[#E4D9C7] dark:bg-[#2E2822] text-[#4A4033] dark:text-[#D5CDBD]"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-red-700 ml-0.5"
                  >
                    ×
                  </button>
                </span>
              ))}

              <input
                type="text"
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                placeholder="Type tag and press Enter..."
                className="px-2 py-1 text-xs rounded bg-[#FCFAF6] dark:bg-[#211E1A] border border-[#DDD0BC] dark:border-[#383129] text-[#2B2621] dark:text-[#EAE4D8] w-48"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-3 border-t border-[#E8DEC8] dark:border-[#302922] flex items-center justify-between">
            <span className="text-[11px] font-mono-paper text-[#8E7E6E] dark:text-[#8E8478]">
              Saved securely to board
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-serif-paper text-[#7E7365] dark:text-[#9F9485] hover:text-[#2B2621] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs rounded-md font-serif-paper font-semibold bg-[#8E4A35] hover:bg-[#7D3F2D] text-[#FAF7F0] border border-[#6B3423] shadow-md cursor-pointer active:scale-95 transition-transform"
              >
                {initialNote ? 'Update Card' : 'Pin to Board'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
