import React, { useState } from 'react';
import { Board, Folder, Note } from '../types';
import { 
  Pin, 
  Plus, 
  MoreVertical, 
  Edit3, 
  MoveRight, 
  Trash2, 
  Eye, 
  Lock, 
  CheckSquare, 
  Square, 
  Image as ImageIcon,
  Tag, 
  Clock, 
  Search,
  Sparkles,
  Maximize2
} from 'lucide-react';

interface BoardViewProps {
  board: Board;
  folder: Folder | null;
  notes: Note[];
  onAddNote: () => void;
  onEditNote: (note: Note) => void;
  onDeleteNote: (noteId: string) => void;
  onTogglePinNote: (noteId: string) => void;
  onMoveNote: (note: Note) => void;
  onInspectCipher: (note: Note) => void;
  onToggleChecklistItem: (noteId: string, itemId: string) => void;
}

export const BoardView: React.FC<BoardViewProps> = ({
  board,
  folder,
  notes,
  onAddNote,
  onEditNote,
  onDeleteNote,
  onTogglePinNote,
  onMoveNote,
  onInspectCipher,
  onToggleChecklistItem,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Filter notes belonging to this board
  const boardNotes = notes.filter(n => n.boardId === board.id);

  // All tags in this board
  const allTags = Array.from(
    new Set(
      boardNotes.flatMap(n => n.decryptedContent?.tags || [])
    )
  );

  const filteredNotes = boardNotes.filter(n => {
    const content = n.decryptedContent;
    if (!content) return true;

    const matchesSearch =
      !searchQuery ||
      content.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      content.body.toLowerCase().includes(searchQuery.toLowerCase()) ||
      content.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesTag = !selectedTag || content.tags.includes(selectedTag);

    return matchesSearch && matchesTag;
  });

  const pinnedNotes = filteredNotes.filter(n => n.isPinned);
  const regularNotes = filteredNotes.filter(n => !n.isPinned);

  const getCardBgColor = (color: string) => {
    switch (color) {
      case 'kraft':
        return 'bg-[#F2E5D0] dark:bg-[#2A231B] border-[#D9C4A7] dark:border-[#3D3327]';
      case 'manila':
        return 'bg-[#FCF8EE] dark:bg-[#27241E] border-[#E2D8C3] dark:border-[#3A352B]';
      case 'sage':
        return 'bg-[#EBF0E6] dark:bg-[#20271E] border-[#C8D5BE] dark:border-[#323E2E]';
      case 'parchment':
        return 'bg-[#F6EEDD] dark:bg-[#28221B] border-[#DFCFA] dark:border-[#3C3227]';
      case 'terracotta':
        return 'bg-[#F7EDE8] dark:bg-[#2B201D] border-[#E4CDC5] dark:border-[#402D28]';
      case 'charcoal':
        return 'bg-[#EAE6DF] dark:bg-[#1E1B18] border-[#CCC4B8] dark:border-[#302B26]';
      default:
        return 'bg-[#FCF8EE] dark:bg-[#27241E] border-[#E2D8C3] dark:border-[#3A352B]';
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[#F6F1E6] dark:bg-[#141210] min-h-[calc(100vh-65px)]">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Board Header Bar */}
        <div className="p-5 sm:p-6 rounded-lg bg-[#FAF6EE] dark:bg-[#1B1815] border border-[#E3D8C4] dark:border-[#2D2721] shadow-xs relative overflow-hidden">
          {/* Subtle paper tape accent at the top */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-3.5 paper-tape rounded-b-sm border-b border-[#D7CABA] dark:border-[#3D352B]" />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-mono-paper text-xs uppercase px-2 py-0.5 rounded bg-[#EDE4D2] dark:bg-[#29241E] text-[#7E7365] dark:text-[#A89E90] border border-[#DDD0BC] dark:border-[#362E25]">
                  {folder ? folder.name : 'Desk Board'}
                </span>
                <span className="text-xs text-[#9E9283] font-mono-paper">
                  • {boardNotes.length} idea {boardNotes.length === 1 ? 'card' : 'cards'}
                </span>
              </div>
              <h1 className="font-serif-paper text-2xl sm:text-3xl font-bold tracking-tight text-[#2B2621] dark:text-[#EAE4D8]">
                {board.name}
              </h1>
              {board.description && (
                <p className="text-xs sm:text-sm text-[#736859] dark:text-[#B5AAA] font-serif-paper italic max-w-2xl">
                  {board.description}
                </p>
              )}
            </div>

            {/* Board Controls: Search & Add Note */}
            <div className="flex items-center flex-wrap gap-2.5">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-[#9E9283]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search cards in board..."
                  className="pl-8 pr-3 py-1.5 text-xs rounded-md bg-[#FCFAF6] dark:bg-[#221F1B] border border-[#DDD3C0] dark:border-[#38322A] text-[#2B2621] dark:text-[#EAE4D8] focus:ring-1 focus:ring-[#8E4A35] focus:outline-none w-44 sm:w-56"
                />
              </div>

              <button
                onClick={onAddNote}
                className="flex items-center gap-1.5 px-4 py-2 rounded-md font-serif-paper text-sm font-semibold bg-[#8E4A35] hover:bg-[#7D3F2D] text-[#FAF7F0] border border-[#6B3423] shadow-xs cursor-pointer active:scale-95 transition-transform"
              >
                <Plus className="w-4 h-4" />
                <span>Add Note</span>
              </button>
            </div>
          </div>

          {/* Tags Filter Strip */}
          {allTags.length > 0 && (
            <div className="flex items-center gap-1.5 pt-4 mt-3 border-t border-[#EAE0CE] dark:border-[#2D2721] overflow-x-auto text-xs">
              <span className="text-[11px] font-mono-paper text-[#8E7E6E] dark:text-[#8E8478] flex items-center gap-1">
                <Tag className="w-3 h-3" /> Filter:
              </span>
              <button
                onClick={() => setSelectedTag(null)}
                className={`px-2 py-0.5 rounded font-mono-paper text-[11px] border transition-colors cursor-pointer ${
                  selectedTag === null
                    ? 'bg-[#8E4A35] text-white border-[#8E4A35]'
                    : 'bg-[#FCFAF6] dark:bg-[#25211D] border-[#DED4C2] dark:border-[#38322A] text-[#6B6154] dark:text-[#B5AAA]'
                }`}
              >
                All
              </button>
              {allTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
                  className={`px-2 py-0.5 rounded font-mono-paper text-[11px] border transition-colors cursor-pointer ${
                    selectedTag === tag
                      ? 'bg-[#8E4A35] text-white border-[#8E4A35]'
                      : 'bg-[#FCFAF6] dark:bg-[#25211D] border-[#DED4C2] dark:border-[#38322A] text-[#6B6154] dark:text-[#B5AAA]'
                  }`}
                >
                  #{tag}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Empty State */}
        {boardNotes.length === 0 && (
          <div className="py-16 px-6 text-center rounded-lg border-2 border-dashed border-[#DED4C2] dark:border-[#2D2721] bg-[#FAF6EE]/50 dark:bg-[#1B1815]/50 space-y-4">
            <div className="paper-pin mx-auto mb-2" />
            <h3 className="font-serif-paper text-xl font-bold text-[#2B2621] dark:text-[#EAE4D8]">
              This Idea Board is Blank
            </h3>
            <p className="text-xs sm:text-sm text-[#736859] dark:text-[#A89E90] max-w-md mx-auto font-serif-paper">
              Pin your thoughts, long drafts, sketches, checklists, or pictures to this board. Everything is encrypted on your device with AES-GCM 256.
            </p>
            <button
              onClick={onAddNote}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md font-serif-paper text-sm font-semibold bg-[#8E4A35] hover:bg-[#7D3F2D] text-[#FAF7F0] border border-[#6B3423] shadow-md cursor-pointer transition-transform active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Write First Idea Note</span>
            </button>
          </div>
        )}

        {/* Pinned Notes Grid */}
        {pinnedNotes.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-serif-paper font-bold text-[#8E4A35] dark:text-[#D97E59] uppercase tracking-wider">
              <Pin className="w-3.5 h-3.5 rotate-45" />
              <span>Pinned Notes</span>
              <span className="text-[11px] font-mono-paper opacity-75">({pinnedNotes.length})</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {pinnedNotes.map(note => (
                <NoteCard
                  key={note.id}
                  note={note}
                  cardColorClass={getCardBgColor(note.color)}
                  onEdit={() => onEditNote(note)}
                  onDelete={() => onDeleteNote(note.id)}
                  onTogglePin={() => onTogglePinNote(note.id)}
                  onMove={() => onMoveNote(note)}
                  onInspectCipher={() => onInspectCipher(note)}
                  onToggleChecklistItem={itemId => onToggleChecklistItem(note.id, itemId)}
                  onImageClick={img => setPreviewImage(img)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Regular Notes Grid */}
        {regularNotes.length > 0 && (
          <div className="space-y-3 pt-2">
            {pinnedNotes.length > 0 && (
              <div className="flex items-center gap-2 text-xs font-serif-paper font-semibold text-[#7E7365] dark:text-[#A89E90] uppercase tracking-wider">
                <span>Board Cards</span>
                <span className="text-[11px] font-mono-paper opacity-75">({regularNotes.length})</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {regularNotes.map(note => (
                <NoteCard
                  key={note.id}
                  note={note}
                  cardColorClass={getCardBgColor(note.color)}
                  onEdit={() => onEditNote(note)}
                  onDelete={() => onDeleteNote(note.id)}
                  onTogglePin={() => onTogglePinNote(note.id)}
                  onMove={() => onMoveNote(note)}
                  onInspectCipher={() => onInspectCipher(note)}
                  onToggleChecklistItem={itemId => onToggleChecklistItem(note.id, itemId)}
                  onImageClick={img => setPreviewImage(img)}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Picture Zoom Modal */}
      {previewImage && (
        <div 
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-xs cursor-zoom-out"
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <img
              src={previewImage}
              alt="Enlarged note attachment"
              className="max-h-[85vh] max-w-full rounded shadow-2xl object-contain border-4 border-[#FCFAF6]"
            />
            <p className="text-center text-xs text-[#FAF7F0] mt-2 font-mono-paper">
              Click anywhere to close
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

interface NoteCardProps {
  note: Note;
  cardColorClass: string;
  onEdit: () => void;
  onDelete: () => void;
  onTogglePin: () => void;
  onMove: () => void;
  onInspectCipher: () => void;
  onToggleChecklistItem: (itemId: string) => void;
  onImageClick: (img: string) => void;
}

const NoteCard: React.FC<NoteCardProps> = ({
  note,
  cardColorClass,
  onEdit,
  onDelete,
  onTogglePin,
  onMove,
  onInspectCipher,
  onToggleChecklistItem,
  onImageClick,
}) => {
  const content = note.decryptedContent;
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div
      className={`relative rounded-md border p-4 sm:p-5 flex flex-col justify-between shadow-[2px_3px_8px_rgba(40,30,20,0.06)] dark:shadow-[2px_3px_8px_rgba(0,0,0,0.3)] transition-all hover:shadow-[3px_5px_14px_rgba(40,30,20,0.12)] group ${cardColorClass}`}
    >
      {/* Top Paper Header: Brass Pin or Tape */}
      <div className="flex items-center justify-between mb-3 border-b border-[#000000]/8 dark:border-[#FFFFFF]/8 pb-2">
        <div className="flex items-center gap-1.5">
          {note.isPinned ? (
            <div className="paper-pin shrink-0" title="Pinned to board" />
          ) : (
            <div className="w-8 h-2 paper-tape rounded-xs" />
          )}
          <span className="text-[10px] font-mono-paper text-[#7E7365] dark:text-[#9F9485] ml-1">
            {new Date(note.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
          </span>
        </div>

        {/* Card Actions Menu */}
        <div className="relative">
          <div className="flex items-center gap-1">
            <button
              onClick={onTogglePin}
              title={note.isPinned ? 'Unpin note' : 'Pin note to top'}
              className={`p-1 rounded hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer ${
                note.isPinned ? 'text-[#8E4A35] dark:text-[#D97E59]' : 'text-[#8C8070] opacity-40 hover:opacity-100'
              }`}
            >
              <Pin className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-1 rounded text-[#8C8070] hover:text-[#2B2621] dark:hover:text-[#EAE4D8] hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
            >
              <MoreVertical className="w-3.5 h-3.5" />
            </button>
          </div>

          {menuOpen && (
            <div 
              onMouseLeave={() => setMenuOpen(false)}
              className="absolute right-0 top-full mt-1 w-44 bg-[#FCFAF6] dark:bg-[#221F1B] border border-[#DDD3C0] dark:border-[#38322A] rounded-md shadow-lg z-20 py-1 text-xs"
            >
              <button
                onClick={() => {
                  setMenuOpen(false);
                  onEdit();
                }}
                className="w-full px-3 py-1.5 text-left text-[#2B2621] dark:text-[#EAE4D8] hover:bg-[#F2ECE0] dark:hover:bg-[#2C2721] flex items-center gap-2 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5 text-[#8E4A35]" />
                <span>Edit Card</span>
              </button>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  onMove();
                }}
                className="w-full px-3 py-1.5 text-left text-[#2B2621] dark:text-[#EAE4D8] hover:bg-[#F2ECE0] dark:hover:bg-[#2C2721] flex items-center gap-2 cursor-pointer"
              >
                <MoveRight className="w-3.5 h-3.5 text-[#5B8246]" />
                <span>Move to Board...</span>
              </button>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  onInspectCipher();
                }}
                className="w-full px-3 py-1.5 text-left text-[#2B2621] dark:text-[#EAE4D8] hover:bg-[#F2ECE0] dark:hover:bg-[#2C2721] flex items-center gap-2 cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5 text-[#C48439]" />
                <span>Inspect Ciphertext</span>
              </button>
              <div className="border-t border-[#EAE0CE] dark:border-[#332C25] my-1" />
              <button
                onClick={() => {
                  setMenuOpen(false);
                  if (confirm('Delete this idea note card?')) {
                    onDelete();
                  }
                }}
                className="w-full px-3 py-1.5 text-left text-[#8E4A35] hover:bg-[#FBEBE8] dark:hover:bg-[#3D221E] flex items-center gap-2 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Idea</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Card Content */}
      <div className="space-y-2.5 flex-1">
        {content ? (
          <>
            {content.title && (
              <h3 
                onClick={onEdit}
                className="font-serif-paper text-lg font-bold text-[#2B2621] dark:text-[#EAE4D8] leading-snug cursor-pointer hover:underline"
              >
                {content.title}
              </h3>
            )}

            {/* Note Body Text */}
            {content.body && (
              <p 
                onClick={onEdit}
                className="text-xs sm:text-sm text-[#4A4237] dark:text-[#C5BCAD] font-serif-paper whitespace-pre-wrap leading-relaxed cursor-pointer"
              >
                {content.body}
              </p>
            )}

            {/* Pictures Gallery */}
            {content.pictures && content.pictures.length > 0 && (
              <div className="grid grid-cols-2 gap-2 pt-1">
                {content.pictures.map((pic, idx) => (
                  <div
                    key={idx}
                    onClick={() => onImageClick(pic)}
                    className="relative group/pic aspect-video rounded overflow-hidden border border-[#D9CEBC] dark:border-[#383128] bg-black/5 cursor-zoom-in"
                  >
                    <img
                      src={pic}
                      alt={`Note attachment ${idx + 1}`}
                      className="w-full h-full object-cover transition-transform group-hover/pic:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/pic:opacity-100 flex items-center justify-center transition-opacity">
                      <Maximize2 className="w-4 h-4 text-white drop-shadow" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Checklist Items */}
            {content.checklist && content.checklist.length > 0 && (
              <div className="space-y-1.5 pt-1 border-t border-[#000000]/5 dark:border-[#FFFFFF]/5">
                {content.checklist.map(item => (
                  <div
                    key={item.id}
                    onClick={() => onToggleChecklistItem(item.id)}
                    className="flex items-start gap-2 text-xs font-serif-paper cursor-pointer select-none group/item"
                  >
                    <span className="mt-0.5 text-[#8E4A35] dark:text-[#D97E59]">
                      {item.done ? (
                        <CheckSquare className="w-3.5 h-3.5" />
                      ) : (
                        <Square className="w-3.5 h-3.5 opacity-60 group-hover/item:opacity-100" />
                      )}
                    </span>
                    <span className={item.done ? 'line-through text-[#8E8070] dark:text-[#7E7468]' : 'text-[#2B2621] dark:text-[#EAE4D8]'}>
                      {item.text}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Tags Strip */}
            {content.tags && content.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 pt-1">
                {content.tags.map(tag => (
                  <span
                    key={tag}
                    className="text-[10px] font-mono-paper px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/5 text-[#6B5F50] dark:text-[#A89E90]"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="py-4 text-center space-y-1">
            <Lock className="w-5 h-5 mx-auto text-[#8E4A35]" />
            <div className="text-xs font-mono-paper font-semibold text-[#8E4A35]">
              Card Locked (AES-GCM Encrypted)
            </div>
            <p className="text-[11px] text-[#8C8070]">
              Unlock with passphrase in Settings to read contents.
            </p>
          </div>
        )}
      </div>

      {/* Card Footer: Encryption Badge & Edit CTA */}
      <div className="mt-4 pt-2 border-t border-[#000000]/6 dark:border-[#FFFFFF]/6 flex items-center justify-between text-[11px] text-[#7E7365] dark:text-[#9F9485]">
        <button
          onClick={onInspectCipher}
          title="Inspect AES-256 GCM Raw Cipher Envelope"
          className="flex items-center gap-1 font-mono-paper text-[10px] hover:text-[#2B2621] dark:hover:text-[#FAF7F0] cursor-pointer"
        >
          <Lock className="w-3 h-3 text-[#5B8246] dark:text-[#88B86E]" />
          <span>E2EE Sealed</span>
        </button>

        <button
          onClick={onEdit}
          className="text-xs font-serif-paper font-semibold text-[#8E4A35] dark:text-[#D97E59] hover:underline cursor-pointer"
        >
          Edit Note
        </button>
      </div>
    </div>
  );
};
