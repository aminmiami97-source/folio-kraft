import React from 'react';
import { User } from 'firebase/auth';
import { Board, Folder, UserProfile } from '../types';
import { 
  FileText, 
  Plus, 
  Moon, 
  Sun, 
  Lock, 
  Unlock, 
  Cloud, 
  CloudOff, 
  Settings, 
  Folder as FolderIcon,
  BookOpen,
  Grid,
  User as UserIcon
} from 'lucide-react';

interface HeaderProps {
  currentBoard: Board | null;
  currentFolder: Folder | null;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  user: User | null;
  userProfile?: UserProfile | null;
  onLogin: () => void;
  onLogout: () => void;
  onOpenSettings: (initialTab?: 'changelog' | 'encryption' | 'sync' | 'paper' | 'profile') => void;
  onAddNote: () => void;
  isEncryptedUnlocked: boolean;
  syncStatus: 'synced' | 'syncing' | 'offline';
  isOverviewActive: boolean;
  onSelectOverview: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentBoard,
  currentFolder,
  isDarkMode,
  onToggleDarkMode,
  user,
  userProfile,
  onLogin,
  onOpenSettings,
  onAddNote,
  isEncryptedUnlocked,
  syncStatus,
  isOverviewActive,
  onSelectOverview,
}) => {
  const displayName = userProfile?.name || user?.displayName || user?.email?.split('@')[0];

  return (
    <header className="border-b border-[#E3D9C6] dark:border-[#2C2721] bg-[#FAF7F0] dark:bg-[#181614] px-4 sm:px-6 py-3 transition-colors">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Brand & Breadcrumbs */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5">
            <div 
              onClick={onSelectOverview}
              className="w-9 h-9 rounded bg-[#8E4A35] text-[#FAF7F0] flex items-center justify-center shadow-[1px_2px_4px_rgba(50,30,20,0.2)] cursor-pointer"
              title="Open Desk Overview"
            >
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span 
                  onClick={onSelectOverview}
                  className="font-serif-paper text-xl font-bold tracking-tight text-[#2B2621] dark:text-[#EAE4D8] cursor-pointer hover:underline"
                >
                  Folio Kraft
                </span>
                <span className="hidden sm:inline-block text-[11px] font-mono-paper px-1.5 py-0.5 rounded bg-[#EFE7D8] dark:bg-[#28241F] text-[#7E7365] dark:text-[#A89E90] border border-[#DDD3C0] dark:border-[#38322A]">
                  PAPER DESK
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-[#7E7365] dark:text-[#9F9485] font-sans">
                {isOverviewActive ? (
                  <span className="font-semibold text-[#8E4A35] dark:text-[#D97E59] flex items-center gap-1">
                    <Grid className="w-3.5 h-3.5" /> All Folders & Boards Directory
                  </span>
                ) : (
                  <>
                    {currentFolder ? (
                      <>
                        <FolderIcon className="w-3.5 h-3.5 opacity-70" />
                        <span>{currentFolder.name}</span>
                        <span>/</span>
                      </>
                    ) : (
                      <span>Loose Boards /</span>
                    )}
                    <span className="font-medium text-[#2B2621] dark:text-[#D5CDBD]">
                      {currentBoard ? currentBoard.name : 'Select a Board'}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right side controls */}
        <div className="flex items-center flex-wrap gap-2">
          {/* User Persona / Character Button */}
          {displayName && (
            <button
              onClick={() => onOpenSettings('profile')}
              title={userProfile?.characterExplanation ? `Character: ${userProfile.characterExplanation}` : 'User Profile'}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-serif-paper font-semibold border transition-colors bg-[#F4EDE0] dark:bg-[#23201C] border-[#DECFA] dark:border-[#332C25] text-[#5C5346] dark:text-[#C5BCAD] hover:bg-[#EAE0D0] cursor-pointer"
            >
              <UserIcon className="w-3.5 h-3.5 text-[#8E4A35] dark:text-[#D97E59]" />
              <span className="max-w-[100px] truncate">{displayName}</span>
            </button>
          )}

          {/* E2EE Lock Status Badge */}
          <button
            onClick={() => onOpenSettings('encryption')}
            title="End-to-End Encryption Status (Click to manage)"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-mono-paper border transition-colors bg-[#F4EDE0] dark:bg-[#23201C] border-[#DECFA] dark:border-[#332C25] text-[#5C5346] dark:text-[#C5BCAD] hover:bg-[#EAE0D0] dark:hover:bg-[#2C2721] cursor-pointer"
          >
            {isEncryptedUnlocked ? (
              <>
                <Unlock className="w-3.5 h-3.5 text-[#5B8246] dark:text-[#88B86E]" />
                <span className="hidden sm:inline">E2EE:</span>
                <span className="font-semibold text-[#5B8246] dark:text-[#88B86E]">AES-256</span>
              </>
            ) : (
              <>
                <Lock className="w-3.5 h-3.5 text-[#8E4A35] dark:text-[#D97E59]" />
                <span className="font-semibold text-[#8E4A35] dark:text-[#D97E59]">Locked</span>
              </>
            )}
          </button>

          {/* Cloud Sync Status */}
          <button
            onClick={() => onOpenSettings('sync')}
            title={user ? `Cloud synced as ${user.email}` : 'Local offline storage (Click to sign in with Google)'}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-sans border transition-colors bg-[#F4EDE0] dark:bg-[#23201C] border-[#E0D5C3] dark:border-[#332C25] text-[#5C5346] dark:text-[#C5BCAD] hover:bg-[#EAE0D0] dark:hover:bg-[#2C2721] cursor-pointer"
          >
            {user ? (
              <>
                <Cloud className={`w-3.5 h-3.5 ${syncStatus === 'syncing' ? 'animate-pulse text-[#C48439]' : 'text-[#6A7F48] dark:text-[#95AF68]'}`} />
                <span className="hidden md:inline">Synced</span>
              </>
            ) : (
              <>
                <CloudOff className="w-3.5 h-3.5 text-[#8F8170]" />
                <span className="hidden sm:inline">Local Only</span>
              </>
            )}
          </button>

          {/* Google Sign In Button if not signed in */}
          {!user && (
            <button
              onClick={onLogin}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium border bg-[#FCFAF6] dark:bg-[#221F1B] border-[#D4C7B2] dark:border-[#383129] text-[#2B2621] dark:text-[#E8E1D5] hover:bg-[#F2ECE0] dark:hover:bg-[#2A2621] shadow-xs cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span>Sign in</span>
            </button>
          )}

          {/* Dark Mode Toggle (Eye Strain Relief) */}
          <button
            onClick={onToggleDarkMode}
            title={isDarkMode ? 'Switch to Warm Paper (Light)' : 'Switch to Charred Dark (Eye Strain Relief)'}
            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded text-xs border border-[#DECFA] dark:border-[#352F28] bg-[#F4EDE0] dark:bg-[#23201C] text-[#5C5346] dark:text-[#C5BCAD] hover:bg-[#EAE0D0] dark:hover:bg-[#2C2721] flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            {isDarkMode ? (
              <>
                <Sun className="w-4 h-4 text-[#E6B655]" />
                <span className="hidden lg:inline text-xs">Light Paper</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-[#665D52]" />
                <span className="hidden lg:inline text-xs">Eye Relief</span>
              </>
            )}
          </button>

          {/* Settings & Changelog Button */}
          <button
            onClick={() => onOpenSettings('changelog')}
            title="Changelog & Settings"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs border border-[#DECFA] dark:border-[#352F28] bg-[#F4EDE0] dark:bg-[#23201C] text-[#5C5346] dark:text-[#C5BCAD] hover:bg-[#EAE0D0] dark:hover:bg-[#2C2721] cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5 text-[#8E4A35] dark:text-[#D97E59]" />
            <span className="hidden sm:inline">Changelog</span>
            <Settings className="w-3.5 h-3.5 opacity-60 ml-0.5" />
          </button>

          {/* Primary CTA: Add Note */}
          <button
            onClick={onAddNote}
            disabled={!currentBoard}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded font-serif-paper text-sm font-semibold shadow-[1px_2px_4px_rgba(80,40,20,0.15)] transition-transform active:scale-95 cursor-pointer ${
              currentBoard
                ? 'bg-[#8E4A35] hover:bg-[#7D3F2D] text-[#FAF7F0] border border-[#6B3423]'
                : 'bg-[#D3C7B5] text-[#8C8070] cursor-not-allowed'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>Add Note</span>
          </button>
        </div>
      </div>
    </header>
  );
};
