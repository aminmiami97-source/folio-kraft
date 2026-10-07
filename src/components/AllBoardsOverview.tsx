import React, { useState } from 'react';
import { Board, Folder, Note } from '../types';
import { 
  Folder as FolderIcon, 
  FolderPlus, 
  Layout, 
  Plus, 
  Trash2, 
  Edit3, 
  Search, 
  Layers, 
  ChevronRight,
  FileText,
  Pin
} from 'lucide-react';

interface AllBoardsOverviewProps {
  folders: Folder[];
  boards: Board[];
  notes: Note[];
  onSelectBoard: (boardId: string) => void;
  onCreateFolder: (name: string, color?: string) => void;
  onCreateBoard: (folderId: string, name: string, description?: string) => void;
  onDeleteBoard: (boardId: string) => void;
  onDeleteFolder: (folderId: string) => void;
}

export const AllBoardsOverview: React.FC<AllBoardsOverviewProps> = ({
  folders,
  boards,
  notes,
  onSelectBoard,
  onCreateFolder,
  onCreateBoard,
  onDeleteBoard,
  onDeleteFolder,
}) => {
  const [search, setSearch] = useState('');
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderColor, setNewFolderColor] = useState('#8E4A35');

  const [activeNewBoardFolderId, setActiveNewBoardFolderId] = useState<string | null>(null);
  const [newBoardName, setNewBoardName] = useState('');
  const [newBoardDesc, setNewBoardDesc] = useState('');

  const handleCreateFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    onCreateFolder(newFolderName.trim(), newFolderColor);
    setNewFolderName('');
    setIsCreatingFolder(false);
  };

  const handleCreateBoard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBoardName.trim() || !activeNewBoardFolderId) return;
    onCreateBoard(activeNewBoardFolderId, newBoardName.trim(), newBoardDesc.trim());
    setNewBoardName('');
    setNewBoardDesc('');
    setActiveNewBoardFolderId(null);
  };

  const getNotesCount = (boardId: string) => notes.filter(n => n.boardId === boardId).length;

  const filteredBoards = boards.filter(b =>
    b.name.toLowerCase().includes(search.toLowerCase()) ||
    (b.description && b.description.toLowerCase().includes(search.toLowerCase()))
  );

  const looseBoards = filteredBoards.filter(b => !b.folderId || b.folderId === 'root');

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[#F6F1E6] dark:bg-[#141210] min-h-[calc(100vh-65px)]">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Top Filing Cabinet Banner */}
        <div className="p-6 rounded-lg bg-[#FAF6EE] dark:bg-[#1B1815] border border-[#E3D8C4] dark:border-[#2D2721] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono-paper text-xs uppercase px-2 py-0.5 rounded bg-[#EDE4D2] dark:bg-[#29241E] text-[#7E7365] dark:text-[#A89E90] border border-[#DDD0BC] dark:border-[#362E25]">
                Archival Filing Cabinet
              </span>
              <span className="text-xs text-[#9E9283] font-mono-paper">
                • {folders.length} Folders, {boards.length} Boards, {notes.length} Notes
              </span>
            </div>
            <h1 className="font-serif-paper text-2xl sm:text-3xl font-bold tracking-tight text-[#2B2621] dark:text-[#EAE4D8]">
              Desk Organization Directory
            </h1>
            <p className="text-xs text-[#736859] dark:text-[#A89E90] font-serif-paper max-w-xl">
              Organize all your ideas into folders and boards. Click any board to open its idea cards canvas.
            </p>
          </div>

          <div className="flex items-center flex-wrap gap-2.5">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-[#9E9283]" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search across boards..."
                className="pl-8 pr-3 py-1.5 text-xs rounded bg-[#FCFAF6] dark:bg-[#221F1B] border border-[#DDD3C0] dark:border-[#38322A] text-[#2B2621] dark:text-[#EAE4D8] focus:ring-1 focus:ring-[#8E4A35] w-48"
              />
            </div>

            <button
              onClick={() => setIsCreatingFolder(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-serif-paper font-semibold bg-[#FAF7F0] dark:bg-[#221F1B] border border-[#DDD3C0] dark:border-[#38322A] text-[#2B2621] dark:text-[#EAE4D8] hover:bg-[#F2ECE0] cursor-pointer"
            >
              <FolderPlus className="w-3.5 h-3.5 text-[#8E4A35]" />
              <span>New Folder</span>
            </button>
          </div>
        </div>

        {/* Create Folder Modal Drawer */}
        {isCreatingFolder && (
          <form onSubmit={handleCreateFolder} className="p-4 rounded-lg bg-[#FAF7F0] dark:bg-[#1E1B18] border border-[#DDD3C0] dark:border-[#38322A] space-y-3">
            <div className="text-xs font-bold font-serif-paper text-[#2B2621] dark:text-[#EAE4D8]">
              Create New Organizational Folder
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                autoFocus
                value={newFolderName}
                onChange={e => setNewFolderName(e.target.value)}
                placeholder="Folder title (e.g. Work Projects, Personal Journals)"
                className="w-full px-3 py-1.5 text-xs rounded bg-[#FCFAF6] dark:bg-[#24201C] border border-[#DDD3C0] dark:border-[#38322A] text-[#2B2621] dark:text-[#EAE4D8]"
              />
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono-paper text-[#7E7365]">Tint:</span>
                {['#8E4A35', '#657252', '#C48439', '#546A7B', '#7A6B84'].map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setNewFolderColor(color)}
                    style={{ backgroundColor: color }}
                    className={`w-5 h-5 rounded-full border ${newFolderColor === color ? 'ring-2 ring-offset-1 ring-[#2B2621]' : 'opacity-80'}`}
                  />
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsCreatingFolder(false)}
                className="px-3 py-1 text-xs text-[#7E7365]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1 text-xs rounded bg-[#8E4A35] text-white font-serif-paper font-semibold cursor-pointer"
              >
                Create Folder
              </button>
            </div>
          </form>
        )}

        {/* Folders and Boards Grid */}
        <div className="space-y-6">
          {folders.map(folder => {
            const folderBoards = filteredBoards.filter(b => b.folderId === folder.id);

            return (
              <div
                key={folder.id}
                className="rounded-lg border border-[#E3D8C4] dark:border-[#2D2721] bg-[#FAF7F0] dark:bg-[#1C1916] p-5 shadow-xs space-y-4"
              >
                {/* Folder Tab Header */}
                <div className="flex items-center justify-between border-b border-[#E8DEC8] dark:border-[#2F2923] pb-3">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-3.5 h-3.5 rounded-full"
                      style={{ backgroundColor: folder.color || '#8E4A35' }}
                    />
                    <h2 className="font-serif-paper text-lg font-bold text-[#2B2621] dark:text-[#EAE4D8]">
                      {folder.name}
                    </h2>
                    <span className="text-[11px] font-mono-paper px-2 py-0.5 rounded bg-[#EDE4D2] dark:bg-[#28231E] text-[#7E7365] dark:text-[#A89E90]">
                      {folderBoards.length} {folderBoards.length === 1 ? 'board' : 'boards'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setActiveNewBoardFolderId(folder.id)}
                      className="flex items-center gap-1 px-2.5 py-1 text-xs font-serif-paper font-semibold rounded bg-[#F2ECE0] dark:bg-[#25211D] border border-[#DDD3C0] dark:border-[#38322A] text-[#8E4A35] dark:text-[#D97E59] hover:bg-[#EAE0D0] cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Board</span>
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete folder "${folder.name}"? Boards will be moved to loose boards.`)) {
                          onDeleteFolder(folder.id);
                        }
                      }}
                      className="p-1 rounded text-[#9E9080] hover:text-[#8E4A35] cursor-pointer"
                      title="Delete Folder"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Boards in Folder */}
                {folderBoards.length === 0 ? (
                  <div className="p-6 text-center border border-dashed border-[#DDD0BC] dark:border-[#332C25] rounded text-xs text-[#9E9283] font-serif-paper">
                    No boards in this folder yet. Click "+ Add Board" to create one.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {folderBoards.map(board => {
                      const noteCount = getNotesCount(board.id);
                      return (
                        <div
                          key={board.id}
                          onClick={() => onSelectBoard(board.id)}
                          className="p-4 rounded-md border border-[#DDD3C0] dark:border-[#38322A] bg-[#FCFAF6] dark:bg-[#221F1B] hover:shadow-md hover:border-[#8E4A35] transition-all cursor-pointer group flex flex-col justify-between space-y-3"
                        >
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 font-serif-paper font-bold text-base text-[#2B2621] dark:text-[#EAE4D8] group-hover:text-[#8E4A35]">
                                <Layout className="w-4 h-4 text-[#8E4A35] shrink-0" />
                                <span className="truncate">{board.name}</span>
                              </div>
                              <span className="text-[10px] font-mono-paper px-1.5 py-0.5 rounded bg-[#EFE8DC] dark:bg-[#2C2620] text-[#7E7365]">
                                {noteCount} notes
                              </span>
                            </div>
                            {board.description && (
                              <p className="text-xs text-[#736859] dark:text-[#B5AAA] font-serif-paper line-clamp-2">
                                {board.description}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-[#000000]/6 dark:border-[#FFFFFF]/6 text-[11px] font-serif-paper text-[#8E4A35] dark:text-[#D97E59]">
                            <span className="font-semibold flex items-center gap-1 group-hover:underline">
                              Open Board Canvas <ChevronRight className="w-3 h-3" />
                            </span>
                            <button
                              onClick={e => {
                                e.stopPropagation();
                                if (confirm(`Delete board "${board.name}"?`)) {
                                  onDeleteBoard(board.id);
                                }
                              }}
                              className="text-[#9E9080] hover:text-red-700 p-0.5"
                              title="Delete board"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}

          {/* Loose Boards Section */}
          {looseBoards.length > 0 && (
            <div className="rounded-lg border border-[#E3D8C4] dark:border-[#2D2721] bg-[#FAF7F0] dark:bg-[#1C1916] p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-[#E8DEC8] dark:border-[#2F2923] pb-3">
                <div className="flex items-center gap-2 font-serif-paper font-bold text-lg text-[#2B2621] dark:text-[#EAE4D8]">
                  <Layers className="w-4 h-4 text-[#7E7365]" />
                  <span>Loose Boards (Unfiled)</span>
                  <span className="text-[11px] font-mono-paper px-2 py-0.5 rounded bg-[#EDE4D2] text-[#7E7365]">
                    {looseBoards.length}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {looseBoards.map(board => {
                  const noteCount = getNotesCount(board.id);
                  return (
                    <div
                      key={board.id}
                      onClick={() => onSelectBoard(board.id)}
                      className="p-4 rounded-md border border-[#DDD3C0] dark:border-[#38322A] bg-[#FCFAF6] dark:bg-[#221F1B] hover:shadow-md hover:border-[#8E4A35] transition-all cursor-pointer group flex flex-col justify-between space-y-3"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 font-serif-paper font-bold text-base text-[#2B2621] dark:text-[#EAE4D8] group-hover:text-[#8E4A35]">
                            <Layout className="w-4 h-4 text-[#8E4A35] shrink-0" />
                            <span className="truncate">{board.name}</span>
                          </div>
                          <span className="text-[10px] font-mono-paper px-1.5 py-0.5 rounded bg-[#EFE8DC] dark:bg-[#2C2620] text-[#7E7365]">
                            {noteCount} notes
                          </span>
                        </div>
                        {board.description && (
                          <p className="text-xs text-[#736859] dark:text-[#B5AAA] font-serif-paper line-clamp-2">
                            {board.description}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-[#000000]/6 dark:border-[#FFFFFF]/6 text-[11px] font-serif-paper text-[#8E4A35]">
                        <span className="font-semibold flex items-center gap-1 group-hover:underline">
                          Open Board Canvas <ChevronRight className="w-3 h-3" />
                        </span>
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            if (confirm(`Delete board "${board.name}"?`)) {
                              onDeleteBoard(board.id);
                            }
                          }}
                          className="text-[#9E9080] hover:text-red-700 p-0.5"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* New Board Drawer */}
      {activeNewBoardFolderId !== null && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateBoard}
            className="bg-[#FAF7F0] dark:bg-[#1E1B18] border border-[#DDD3C0] dark:border-[#38322A] rounded-lg p-5 max-w-sm w-full shadow-2xl space-y-3"
          >
            <h3 className="font-serif-paper text-base font-bold text-[#2B2621] dark:text-[#EAE4D8]">
              Create New Board
            </h3>
            <input
              type="text"
              autoFocus
              required
              value={newBoardName}
              onChange={e => setNewBoardName(e.target.value)}
              placeholder="Board title..."
              className="w-full px-3 py-1.5 text-xs rounded bg-[#FCFAF6] dark:bg-[#25211D] border border-[#DDD3C0] dark:border-[#38322A] text-[#2B2621] dark:text-[#EAE4D8]"
            />
            <textarea
              rows={2}
              value={newBoardDesc}
              onChange={e => setNewBoardDesc(e.target.value)}
              placeholder="Board memo or focus..."
              className="w-full px-3 py-1.5 text-xs rounded bg-[#FCFAF6] dark:bg-[#25211D] border border-[#DDD3C0] dark:border-[#38322A] text-[#2B2621] dark:text-[#EAE4D8]"
            />
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setActiveNewBoardFolderId(null)}
                className="px-3 py-1 text-xs text-[#7E7365]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs rounded bg-[#8E4A35] text-white font-serif-paper font-semibold cursor-pointer"
              >
                Create Board
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
