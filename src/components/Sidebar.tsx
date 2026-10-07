import React, { useState } from 'react';
import { Folder, Board, Note } from '../types';
import { 
  Folder as FolderIcon, 
  FolderPlus, 
  ChevronRight, 
  ChevronDown, 
  Layout, 
  Plus, 
  Trash2, 
  Edit2, 
  Layers,
  Search,
  Grid,
  FileText,
  SlidersHorizontal
} from 'lucide-react';

interface SidebarProps {
  folders: Folder[];
  boards: Board[];
  notes: Note[];
  selectedBoardId: string | null;
  onSelectBoard: (boardId: string) => void;
  onSelectOverview: () => void;
  isOverviewActive: boolean;
  onCreateFolder: (name: string, color?: string) => void;
  onUpdateFolder: (folderId: string, name: string, color?: string) => void;
  onDeleteFolder: (folderId: string) => void;
  onCreateBoard: (folderId: string, name: string, description?: string) => void;
  onUpdateBoard: (boardId: string, name: string, description?: string) => void;
  onDeleteBoard: (boardId: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  folders,
  boards,
  notes,
  selectedBoardId,
  onSelectBoard,
  onSelectOverview,
  isOverviewActive,
  onCreateFolder,
  onUpdateFolder,
  onDeleteFolder,
  onCreateBoard,
  onUpdateBoard,
  onDeleteBoard,
}) => {
  const [collapsedFolders, setCollapsedFolders] = useState<Record<string, boolean>>({});
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderColor, setNewFolderColor] = useState('#8E4A35');

  const [activeBoardModalFolderId, setActiveBoardModalFolderId] = useState<string | null>(null);
  const [newBoardName, setNewBoardName] = useState('');
  const [newBoardDesc, setNewBoardDesc] = useState('');

  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [editFolderName, setEditFolderName] = useState('');

  const [editingBoardId, setEditingBoardId] = useState<string | null>(null);
  const [editBoardName, setEditBoardName] = useState('');

  const [searchQuery, setSearchQuery] = useState('');

  const toggleFolder = (folderId: string) => {
    setCollapsedFolders(prev => ({ ...prev, [folderId]: !prev[folderId] }));
  };

  const handleCreateFolderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    onCreateFolder(newFolderName.trim(), newFolderColor);
    setNewFolderName('');
    setIsCreatingFolder(false);
  };

  const handleCreateBoardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBoardName.trim() || !activeBoardModalFolderId) return;
    onCreateBoard(activeBoardModalFolderId, newBoardName.trim(), newBoardDesc.trim());
    setNewBoardName('');
    setNewBoardDesc('');
    setActiveBoardModalFolderId(null);
  };

  const getBoardNoteCount = (boardId: string) => {
    return notes.filter(n => n.boardId === boardId).length;
  };

  const filteredBoards = boards.filter(b => 
    b.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (b.description && b.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const looseBoards = filteredBoards.filter(b => !b.folderId || b.folderId === 'root');

  return (
    <aside className="w-full md:w-72 lg:w-80 shrink-0 border-r border-[#E3D9C6] dark:border-[#2C2721] bg-[#F5EFE4] dark:bg-[#1A1714] p-4 flex flex-col justify-between h-auto md:h-[calc(100vh-65px)] overflow-y-auto">
      <div className="space-y-4">
        {/* Archival Directory / Overview Button */}
        <div className="space-y-2">
          <button
            onClick={onSelectOverview}
            className={`w-full p-2.5 rounded-md flex items-center justify-between text-xs font-serif-paper font-bold transition-all cursor-pointer ${
              isOverviewActive
                ? 'bg-[#8E4A35] text-white shadow-xs'
                : 'bg-[#FCFAF6] dark:bg-[#221F1B] border border-[#DDD3C0] dark:border-[#38322A] text-[#2B2621] dark:text-[#EAE4D8] hover:bg-[#F2ECE0]'
            }`}
          >
            <div className="flex items-center gap-2">
              <Grid className="w-4 h-4 text-[#C48439]" />
              <span>All Folders & Boards Directory</span>
            </div>
            <span className={`text-[10px] font-mono-paper px-1.5 py-0.5 rounded ${
              isOverviewActive ? 'bg-black/20 text-white' : 'bg-[#EAE0D0] dark:bg-[#2C2721] text-[#7E7365]'
            }`}>
              {boards.length}
            </span>
          </button>

          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-[#9E9283]" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Filter boards..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded bg-[#FCFAF6] dark:bg-[#221F1B] border border-[#DDD3C0] dark:border-[#38322A] text-[#2B2621] dark:text-[#EAE4D8] focus:outline-none focus:ring-1 focus:ring-[#8E4A35]"
            />
          </div>
        </div>

        {/* Section Title & Add Folder */}
        <div className="flex items-center justify-between px-1">
          <span className="font-serif-paper text-xs uppercase tracking-wider text-[#7E7365] dark:text-[#9F9485] font-bold">
            Filing Drawers ({folders.length})
          </span>
          <button
            onClick={() => setIsCreatingFolder(true)}
            className="flex items-center gap-1 text-xs text-[#8E4A35] dark:text-[#D97E59] hover:underline font-semibold cursor-pointer"
          >
            <FolderPlus className="w-3.5 h-3.5" />
            <span>New Drawer</span>
          </button>
        </div>

        {/* Quick New Folder Drawer */}
        {isCreatingFolder && (
          <form onSubmit={handleCreateFolderSubmit} className="p-3 rounded bg-[#FCFAF6] dark:bg-[#23201C] border border-[#D5C9B5] dark:border-[#3A332B] shadow-xs space-y-2">
            <div className="text-xs font-serif-paper font-bold text-[#2B2621] dark:text-[#EAE4D8]">
              New Drawer / Folder
            </div>
            <input
              type="text"
              autoFocus
              value={newFolderName}
              onChange={e => setNewFolderName(e.target.value)}
              placeholder="e.g. Work, Journal, Novel"
              className="w-full px-2.5 py-1 text-xs rounded bg-[#FAF7F0] dark:bg-[#1A1714] border border-[#DDD3C0] dark:border-[#38322A] text-[#2B2621] dark:text-[#EAE4D8]"
            />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                {['#8E4A35', '#657252', '#C48439', '#546A7B', '#7A6B84'].map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setNewFolderColor(color)}
                    style={{ backgroundColor: color }}
                    className={`w-4 h-4 rounded-full border ${newFolderColor === color ? 'ring-2 ring-offset-1 ring-[#2B2621]' : 'opacity-80'}`}
                  />
                ))}
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setIsCreatingFolder(false)}
                  className="px-2 py-0.5 text-xs text-[#7E7365] dark:text-[#9F9485] hover:text-[#2B2621] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-2.5 py-0.5 text-xs rounded bg-[#8E4A35] text-[#FCFAF6] font-medium cursor-pointer"
                >
                  Save
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Folders & Boards Tree */}
        <div className="space-y-3">
          {folders.map(folder => {
            const folderBoards = filteredBoards.filter(b => b.folderId === folder.id);
            const isCollapsed = !!collapsedFolders[folder.id];

            return (
              <div key={folder.id} className="rounded-md border border-[#E3D9C6] dark:border-[#2C2721] bg-[#FAF7F0] dark:bg-[#1E1B18] overflow-hidden">
                {/* Folder Header */}
                <div className="flex items-center justify-between px-2.5 py-2 hover:bg-[#F2ECE0] dark:hover:bg-[#25211D] transition-colors group">
                  <div 
                    onClick={() => toggleFolder(folder.id)}
                    className="flex items-center gap-2 flex-1 cursor-pointer select-none"
                  >
                    <button className="text-[#8E7E6E] dark:text-[#8E8478]">
                      {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                    <div 
                      className="w-2.5 h-2.5 rounded-full shrink-0" 
                      style={{ backgroundColor: folder.color || '#8E4A35' }}
                    />
                    {editingFolderId === folder.id ? (
                      <input
                        type="text"
                        autoFocus
                        value={editFolderName}
                        onChange={e => setEditFolderName(e.target.value)}
                        onBlur={() => {
                          if (editFolderName.trim()) onUpdateFolder(folder.id, editFolderName.trim(), folder.color);
                          setEditingFolderId(null);
                        }}
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            if (editFolderName.trim()) onUpdateFolder(folder.id, editFolderName.trim(), folder.color);
                            setEditingFolderId(null);
                          }
                        }}
                        className="text-xs px-1 py-0.5 rounded bg-white dark:bg-[#2A2621] text-[#2B2621] dark:text-[#EAE4D8] border border-[#DDD3C0]"
                      />
                    ) : (
                      <span className="font-serif-paper font-bold text-xs text-[#2B2621] dark:text-[#E2DC CE] truncate">
                        {folder.name}
                      </span>
                    )}
                    <span className="text-[10px] font-mono-paper text-[#998D7E] px-1 rounded bg-[#EFE8DC] dark:bg-[#292420]">
                      {folderBoards.length}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => setActiveBoardModalFolderId(folder.id)}
                      title="Add Board to Drawer"
                      className="p-1 rounded text-[#8E4A35] hover:bg-[#EAE0D0] dark:hover:bg-[#332D26] cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        setEditingFolderId(folder.id);
                        setEditFolderName(folder.name);
                      }}
                      title="Rename Drawer"
                      className="p-1 rounded text-[#7E7365] hover:text-[#2B2621] dark:hover:text-[#EAE4D8] cursor-pointer"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete folder "${folder.name}"? Boards will be moved to loose boards.`)) {
                          onDeleteFolder(folder.id);
                        }
                      }}
                      title="Delete Drawer"
                      className="p-1 rounded text-[#8E4A35] hover:bg-[#F2D7D0] dark:hover:bg-[#3D2520] cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Boards inside folder */}
                {!isCollapsed && (
                  <div className="px-2 pb-2 pt-0.5 space-y-1">
                    {folderBoards.length === 0 ? (
                      <div className="px-3 py-2 text-[11px] text-[#A69B8C] font-mono-paper italic">
                        No boards yet. Click '+' to add one.
                      </div>
                    ) : (
                      folderBoards.map(board => {
                        const isSelected = !isOverviewActive && selectedBoardId === board.id;
                        const noteCount = getBoardNoteCount(board.id);

                        return (
                          <div
                            key={board.id}
                            onClick={() => onSelectBoard(board.id)}
                            className={`flex items-center justify-between px-2.5 py-1.5 rounded text-xs transition-all cursor-pointer group ${
                              isSelected
                                ? 'bg-[#EADECE] dark:bg-[#2F2923] text-[#2B2621] dark:text-[#FAF7F0] font-semibold shadow-xs border-l-3 border-[#8E4A35]'
                                : 'text-[#5C5346] dark:text-[#C5BCAD] hover:bg-[#F0E8DC] dark:hover:bg-[#25211D]'
                            }`}
                          >
                            <div className="flex items-center gap-2 truncate flex-1">
                              <Layout className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-[#8E4A35] dark:text-[#D97E59]' : 'opacity-60'}`} />
                              {editingBoardId === board.id ? (
                                <input
                                  type="text"
                                  autoFocus
                                  value={editBoardName}
                                  onChange={e => setEditBoardName(e.target.value)}
                                  onBlur={() => {
                                    if (editBoardName.trim()) onUpdateBoard(board.id, editBoardName.trim(), board.description);
                                    setEditingBoardId(null);
                                  }}
                                  onKeyDown={e => {
                                    if (e.key === 'Enter') {
                                      if (editBoardName.trim()) onUpdateBoard(board.id, editBoardName.trim(), board.description);
                                      setEditingBoardId(null);
                                    }
                                  }}
                                  className="text-xs px-1 py-0.5 rounded bg-white text-[#2B2621] border border-[#DDD3C0]"
                                />
                              ) : (
                                <span className="truncate">{board.name}</span>
                              )}
                            </div>

                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] font-mono-paper px-1.5 py-0.2 rounded bg-[#E4D9C7] dark:bg-[#383129] text-[#7E7365] dark:text-[#A89E90]">
                                {noteCount}
                              </span>
                              <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5">
                                <button
                                  onClick={e => {
                                    e.stopPropagation();
                                    setEditingBoardId(board.id);
                                    setEditBoardName(board.name);
                                  }}
                                  title="Rename Board"
                                  className="p-0.5 text-[#7E7365] hover:text-[#2B2621]"
                                >
                                  <Edit2 className="w-2.5 h-2.5" />
                                </button>
                                <button
                                  onClick={e => {
                                    e.stopPropagation();
                                    if (confirm(`Delete board "${board.name}" and its notes?`)) {
                                      onDeleteBoard(board.id);
                                    }
                                  }}
                                  title="Delete Board"
                                  className="p-0.5 text-[#8E4A35] hover:text-red-700"
                                >
                                  <Trash2 className="w-2.5 h-2.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {/* Loose Boards Section */}
          <div className="space-y-1 pt-1">
            <div className="flex items-center justify-between px-1">
              <span className="font-serif-paper text-xs uppercase tracking-wider text-[#7E7365] dark:text-[#9F9485] font-semibold flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 opacity-70" />
                <span>Loose Boards</span>
              </span>
              <button
                onClick={() => setActiveBoardModalFolderId('root')}
                className="text-xs text-[#8E4A35] dark:text-[#D97E59] hover:underline flex items-center gap-1 font-semibold cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>Add Board</span>
              </button>
            </div>

            {looseBoards.length === 0 ? (
              <div className="px-3 py-2 text-[11px] text-[#A69B8C] font-mono-paper italic">
                No loose boards.
              </div>
            ) : (
              looseBoards.map(board => {
                const isSelected = !isOverviewActive && selectedBoardId === board.id;
                const noteCount = getBoardNoteCount(board.id);

                return (
                  <div
                    key={board.id}
                    onClick={() => onSelectBoard(board.id)}
                    className={`flex items-center justify-between px-2.5 py-1.5 rounded text-xs transition-all cursor-pointer group ${
                      isSelected
                        ? 'bg-[#EADECE] dark:bg-[#2F2923] text-[#2B2621] dark:text-[#FAF7F0] font-semibold shadow-xs border-l-3 border-[#8E4A35]'
                        : 'text-[#5C5346] dark:text-[#C5BCAD] hover:bg-[#F0E8DC] dark:hover:bg-[#25211D]'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate flex-1">
                      <Layout className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-[#8E4A35] dark:text-[#D97E59]' : 'opacity-60'}`} />
                      <span className="truncate">{board.name}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-mono-paper px-1.5 py-0.2 rounded bg-[#E4D9C7] dark:bg-[#383129] text-[#7E7365] dark:text-[#A89E90]">
                        {noteCount}
                      </span>
                      <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5">
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            if (confirm(`Delete board "${board.name}" and its notes?`)) {
                              onDeleteBoard(board.id);
                            }
                          }}
                          className="p-0.5 text-[#8E4A35] hover:text-red-700"
                        >
                          <Trash2 className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* New Board Modal Drawer */}
      {activeBoardModalFolderId !== null && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-[#FAF7F0] dark:bg-[#1E1B18] border border-[#DDD3C0] dark:border-[#38322A] rounded-lg p-5 max-w-sm w-full shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#E8DEC8] dark:border-[#332C25] pb-2">
              <h3 className="font-serif-paper text-base font-bold text-[#2B2621] dark:text-[#EAE4D8]">
                Create Idea Board
              </h3>
              <button
                onClick={() => setActiveBoardModalFolderId(null)}
                className="text-xs text-[#8E7E6E] hover:text-[#2B2621]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateBoardSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#5C5346] dark:text-[#C5BCAD] mb-1">
                  Board Title
                </label>
                <input
                  type="text"
                  autoFocus
                  required
                  value={newBoardName}
                  onChange={e => setNewBoardName(e.target.value)}
                  placeholder="e.g. Brainstorming, Tasks"
                  className="w-full px-3 py-1.5 text-xs rounded bg-[#FCFAF6] dark:bg-[#25211D] border border-[#DDD3C0] dark:border-[#38322A] text-[#2B2621] dark:text-[#EAE4D8]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#5C5346] dark:text-[#C5BCAD] mb-1">
                  Board Memo (Optional)
                </label>
                <textarea
                  rows={2}
                  value={newBoardDesc}
                  onChange={e => setNewBoardDesc(e.target.value)}
                  placeholder="Short purpose of this board..."
                  className="w-full px-3 py-1.5 text-xs rounded bg-[#FCFAF6] dark:bg-[#25211D] border border-[#DDD3C0] dark:border-[#38322A] text-[#2B2621] dark:text-[#EAE4D8]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveBoardModalFolderId(null)}
                  className="px-3 py-1 text-xs text-[#7E7365]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs rounded bg-[#8E4A35] text-white font-semibold cursor-pointer"
                >
                  Create Board
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Sidebar Footer Note */}
      <div className="pt-4 border-t border-[#E3D9C6] dark:border-[#2C2721] text-[11px] text-[#8E7E6E] dark:text-[#8E8478] font-mono-paper flex items-center justify-between">
        <span>Drawers: {folders.length}</span>
        <span>Boards: {boards.length}</span>
        <span>Notes: {notes.length}</span>
      </div>
    </aside>
  );
};
