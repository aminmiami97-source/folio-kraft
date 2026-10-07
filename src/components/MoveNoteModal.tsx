import React, { useState } from 'react';
import { Board, Folder, Note } from '../types';
import { X, MoveRight, Layout, Folder as FolderIcon } from 'lucide-react';

interface MoveNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  note: Note | null;
  boards: Board[];
  folders: Folder[];
  onMove: (noteId: string, targetBoardId: string) => void;
}

export const MoveNoteModal: React.FC<MoveNoteModalProps> = ({
  isOpen,
  onClose,
  note,
  boards,
  folders,
  onMove,
}) => {
  if (!isOpen || !note) return null;

  const [selectedBoardId, setSelectedBoardId] = useState(note.boardId);

  const handleConfirmMove = () => {
    if (selectedBoardId && selectedBoardId !== note.boardId) {
      onMove(note.id, selectedBoardId);
    }
    onClose();
  };

  const getFolderName = (folderId: string) => {
    if (!folderId || folderId === 'root') return 'Loose Boards';
    const folder = folders.find(f => f.id === folderId);
    return folder ? folder.name : 'Folder';
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs">
      <div className="bg-[#FAF7F0] dark:bg-[#1E1B18] border border-[#DDD3C0] dark:border-[#38322A] rounded-lg max-w-md w-full shadow-2xl overflow-hidden space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#E8DEC8] dark:border-[#302922] bg-[#F4EDE0] dark:bg-[#221F1B]">
          <div className="flex items-center gap-2">
            <MoveRight className="w-4 h-4 text-[#8E4A35]" />
            <h3 className="font-serif-paper text-base font-bold text-[#2B2621] dark:text-[#EAE4D8]">
              Move Idea Note
            </h3>
          </div>
          <button onClick={onClose} className="text-[#8E7E6E] hover:text-[#2B2621]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <span className="text-xs font-serif-paper font-semibold text-[#7E7365] dark:text-[#9F9485] block mb-1">
              Note Headline:
            </span>
            <div className="text-sm font-serif-paper font-bold text-[#2B2621] dark:text-[#EAE4D8] p-2 rounded bg-[#FCFAF6] dark:bg-[#25211D] border border-[#DDD3C0] dark:border-[#38322A] truncate">
              {note.decryptedContent?.title || 'Untitled Card'}
            </div>
          </div>

          <div>
            <label className="text-xs font-serif-paper font-semibold text-[#7E7365] dark:text-[#9F9485] block mb-2">
              Select Destination Board:
            </label>
            <div className="max-h-60 overflow-y-auto space-y-1.5 border border-[#DDD3C0] dark:border-[#38322A] rounded-md p-2 bg-[#FCFAF6] dark:bg-[#211E1A]">
              {boards.map(b => {
                const isCurrent = b.id === note.boardId;
                const isSelected = b.id === selectedBoardId;

                return (
                  <div
                    key={b.id}
                    onClick={() => setSelectedBoardId(b.id)}
                    className={`p-2.5 rounded text-xs flex items-center justify-between cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-[#8E4A35] text-[#FAF7F0] font-medium shadow-xs'
                        : isCurrent
                        ? 'opacity-60 bg-[#ECE5D8] dark:bg-[#2A2520] text-[#7E7365]'
                        : 'hover:bg-[#F2ECE0] dark:hover:bg-[#2C2721] text-[#2B2621] dark:text-[#EAE4D8]'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Layout className="w-3.5 h-3.5 shrink-0" />
                      <span className="font-serif-paper font-semibold truncate">{b.name}</span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 text-[10px] font-mono-paper opacity-80">
                      <span>{getFolderName(b.folderId)}</span>
                      {isCurrent && <span className="ml-1 font-bold">(Current)</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E8DEC8] dark:border-[#302922]">
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-[#7E7365] dark:text-[#9F9485] hover:text-[#2B2621]"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmMove}
              disabled={selectedBoardId === note.boardId}
              className={`px-4 py-1.5 text-xs rounded-md font-serif-paper font-semibold shadow-xs cursor-pointer ${
                selectedBoardId !== note.boardId
                  ? 'bg-[#8E4A35] text-[#FAF7F0] hover:bg-[#7D3F2D]'
                  : 'bg-[#D5C9B5] text-[#8E8070] cursor-not-allowed'
              }`}
            >
              Move Card
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
