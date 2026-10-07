import React, { useState } from 'react';
import { User } from 'firebase/auth';
import { ChangelogEntry, UserFeedbackUpdate, Note, Board, Folder, UserProfile } from '../types';
import { 
  X, 
  BookOpen, 
  Lock, 
  Cloud, 
  Palette, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  Send, 
  Key, 
  Download, 
  RefreshCw, 
  Moon, 
  Sun,
  Filter,
  Search,
  Sparkles,
  User as UserIcon,
  HelpCircle,
  Feather
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab?: 'changelog' | 'encryption' | 'sync' | 'paper' | 'profile';
  user: User | null;
  userProfile?: UserProfile | null;
  onUpdateProfile?: (profile: Partial<UserProfile>) => void;
  onLogin: () => void;
  onLogout: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  passphrase: string;
  onUpdatePassphrase: (newPassphrase: string) => Promise<void>;
  keyFingerprint: string;
  changelogEntries: ChangelogEntry[];
  userFeedbackUpdates: UserFeedbackUpdate[];
  onSubmitUserFeedback: (feedback: { title: string; description: string; category: string }) => void;
  notes: Note[];
  boards: Board[];
  folders: Folder[];
  onForceResync: () => void;
  syncStatus: 'synced' | 'syncing' | 'offline';
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  activeTab = 'changelog',
  user,
  userProfile,
  onUpdateProfile,
  onLogin,
  onLogout,
  isDarkMode,
  onToggleDarkMode,
  passphrase,
  onUpdatePassphrase,
  keyFingerprint,
  changelogEntries,
  userFeedbackUpdates,
  onSubmitUserFeedback,
  notes,
  boards,
  folders,
  onForceResync,
  syncStatus,
}) => {
  const [currentTab, setCurrentTab] = useState<'changelog' | 'encryption' | 'sync' | 'paper' | 'profile'>(activeTab);

  // Profile edit state
  const [profileName, setProfileName] = useState(userProfile?.name || '');
  const [profileBio, setProfileBio] = useState(userProfile?.characterExplanation || '');
  const [profileReferral, setProfileReferral] = useState(userProfile?.referralSource || '');
  const [profileSaved, setProfileSaved] = useState(false);

  // New Passphrase state
  const [newPassphraseInput, setNewPassphraseInput] = useState('');
  const [passphraseStatus, setPassphraseStatus] = useState<string | null>(null);

  // User suggestion submission form state
  const [suggestionTitle, setSuggestionTitle] = useState('');
  const [suggestionDesc, setSuggestionDesc] = useState('');
  const [suggestionCategory, setSuggestionCategory] = useState('Paper Styling & Boards');
  const [suggestionSuccess, setSuggestionSuccess] = useState(false);

  // Filter for Changelog
  const [changelogFilter, setChangelogFilter] = useState<string>('all');
  const [changelogSearch, setChangelogSearch] = useState('');

  if (!isOpen) return null;

  const handlePassphraseSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassphraseInput.trim()) return;
    try {
      setPassphraseStatus('Re-encrypting local notes...');
      await onUpdatePassphrase(newPassphraseInput.trim());
      setPassphraseStatus('Master Passphrase updated successfully!');
      setNewPassphraseInput('');
      setTimeout(() => setPassphraseStatus(null), 3000);
    } catch (err) {
      setPassphraseStatus('Error updating passphrase.');
    }
  };

  const handleSuggestionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!suggestionTitle.trim() || !suggestionDesc.trim()) return;

    onSubmitUserFeedback({
      title: suggestionTitle.trim(),
      description: suggestionDesc.trim(),
      category: suggestionCategory,
    });

    setSuggestionTitle('');
    setSuggestionDesc('');
    setSuggestionSuccess(true);
    setTimeout(() => setSuggestionSuccess(false), 4000);
  };

  const exportDataBackup = () => {
    const backup = {
      exportDate: new Date().toISOString(),
      folders,
      boards,
      notes: notes.map(n => ({
        id: n.id,
        boardId: n.boardId,
        isEncrypted: n.isEncrypted,
        encryptedPayload: n.encryptedPayload,
        color: n.color,
        isPinned: n.isPinned,
        createdAt: n.createdAt,
        updatedAt: n.updatedAt,
      })),
    };

    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `folio-kraft-encrypted-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredChangelog = changelogEntries.filter(entry => {
    const matchesFilter = changelogFilter === 'all' || entry.type === changelogFilter;
    const matchesSearch =
      !changelogSearch ||
      entry.title.toLowerCase().includes(changelogSearch.toLowerCase()) ||
      entry.description.toLowerCase().includes(changelogSearch.toLowerCase()) ||
      entry.version.toLowerCase().includes(changelogSearch.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-3 sm:p-5 backdrop-blur-xs overflow-y-auto">
      <div className="bg-[#FAF7F0] dark:bg-[#1A1815] border border-[#DDD3C0] dark:border-[#38322A] rounded-lg w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8DEC8] dark:border-[#2F2923] bg-[#F4EDE0] dark:bg-[#201C18]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-[#8E4A35] text-white flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-serif-paper text-lg font-bold text-[#2B2621] dark:text-[#EAE4D8]">
                Settings & Transparency Desk
              </h2>
              <p className="text-[11px] text-[#7E7365] dark:text-[#9F9485] font-mono-paper">
                End-to-End Encryption • User Updates History • Cloud Sync
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-1 rounded text-[#7E7365] hover:text-[#2B2621] dark:hover:text-[#FAF7F0]">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-[#E8DEC8] dark:border-[#2F2923] bg-[#F1E9DB] dark:bg-[#1E1B17] px-4 overflow-x-auto text-xs font-serif-paper font-semibold">
          <button
            onClick={() => setCurrentTab('changelog')}
            className={`px-4 py-2.5 border-b-2 flex items-center gap-1.5 whitespace-nowrap cursor-pointer transition-colors ${
              currentTab === 'changelog'
                ? 'border-[#8E4A35] text-[#8E4A35] dark:text-[#D97E59] bg-[#FAF7F0] dark:bg-[#1A1815]'
                : 'border-transparent text-[#7E7365] dark:text-[#A89E90] hover:text-[#2B2621]'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Changelog & User Updates</span>
            <span className="text-[10px] font-mono-paper px-1.5 py-0.2 rounded bg-[#E4D9C7] dark:bg-[#2F2923]">
              {changelogEntries.length}
            </span>
          </button>

          <button
            onClick={() => setCurrentTab('encryption')}
            className={`px-4 py-2.5 border-b-2 flex items-center gap-1.5 whitespace-nowrap cursor-pointer transition-colors ${
              currentTab === 'encryption'
                ? 'border-[#8E4A35] text-[#8E4A35] dark:text-[#D97E59] bg-[#FAF7F0] dark:bg-[#1A1815]'
                : 'border-transparent text-[#7E7365] dark:text-[#A89E90] hover:text-[#2B2621]'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>E2E Encryption & Keys</span>
          </button>

          <button
            onClick={() => setCurrentTab('sync')}
            className={`px-4 py-2.5 border-b-2 flex items-center gap-1.5 whitespace-nowrap cursor-pointer transition-colors ${
              currentTab === 'sync'
                ? 'border-[#8E4A35] text-[#8E4A35] dark:text-[#D97E59] bg-[#FAF7F0] dark:bg-[#1A1815]'
                : 'border-transparent text-[#7E7365] dark:text-[#A89E90] hover:text-[#2B2621]'
            }`}
          >
            <Cloud className="w-3.5 h-3.5" />
            <span>Cloud Sync & Account</span>
          </button>

          <button
            onClick={() => setCurrentTab('paper')}
            className={`px-4 py-2.5 border-b-2 flex items-center gap-1.5 whitespace-nowrap cursor-pointer transition-colors ${
              currentTab === 'paper'
                ? 'border-[#8E4A35] text-[#8E4A35] dark:text-[#D97E59] bg-[#FAF7F0] dark:bg-[#1A1815]'
                : 'border-transparent text-[#7E7365] dark:text-[#A89E90] hover:text-[#2B2621]'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>Paper & Eye Strain</span>
          </button>

          <button
            onClick={() => setCurrentTab('profile')}
            className={`px-4 py-2.5 border-b-2 flex items-center gap-1.5 whitespace-nowrap cursor-pointer transition-colors ${
              currentTab === 'profile'
                ? 'border-[#8E4A35] text-[#8E4A35] dark:text-[#D97E59] bg-[#FAF7F0] dark:bg-[#1A1815]'
                : 'border-transparent text-[#7E7365] dark:text-[#A89E90] hover:text-[#2B2621]'
            }`}
          >
            <Feather className="w-3.5 h-3.5" />
            <span>Desk Persona</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: CHANGELOG & USER UPDATES */}
          {currentTab === 'changelog' && (
            <div className="space-y-6">
              {/* Transparency Mission Statement Banner */}
              <div className="p-4 rounded-md bg-[#F2EAE0] dark:bg-[#231F1B] border border-[#DDD0BC] dark:border-[#383129] space-y-1.5">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#8E4A35] dark:text-[#D97E59]" />
                  <span className="font-serif-paper font-bold text-sm text-[#2B2621] dark:text-[#EAE4D8]">
                    Accountability & Complete Transparency in Development
                  </span>
                </div>
                <p className="text-xs text-[#6B5F50] dark:text-[#C5BCAD] font-serif-paper leading-relaxed">
                  Every single update, security decision, and feature enhancement is recorded here for full accountability. Users can track how features evolve over time and inspect the lifecycle of suggested improvements.
                </p>
              </div>

              {/* Interactive Submit User Suggestion Form */}
              <div className="p-4 sm:p-5 rounded-md bg-[#FCFAF6] dark:bg-[#1F1C18] border border-[#DDD0BC] dark:border-[#383129] space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif-paper text-sm font-bold text-[#2B2621] dark:text-[#EAE4D8] flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-[#C48439]" />
                    <span>Suggest an Improvement / Feature</span>
                  </h3>
                  <span className="text-[11px] font-mono-paper text-[#8E7E6E]">
                    Public Lifecycle Tracker
                  </span>
                </div>

                <form onSubmit={handleSuggestionSubmit} className="space-y-3 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block font-serif-paper font-semibold text-[#5C5346] dark:text-[#C5BCAD] mb-1">
                        Title of Suggestion
                      </label>
                      <input
                        type="text"
                        required
                        value={suggestionTitle}
                        onChange={e => setSuggestionTitle(e.target.value)}
                        placeholder="e.g. Export boards as PDF index booklet..."
                        className="w-full px-3 py-1.5 rounded bg-[#FAF7F0] dark:bg-[#28241F] border border-[#DDD3C0] dark:border-[#38322A] text-[#2B2621] dark:text-[#EAE4D8]"
                      />
                    </div>
                    <div>
                      <label className="block font-serif-paper font-semibold text-[#5C5346] dark:text-[#C5BCAD] mb-1">
                        Category
                      </label>
                      <select
                        value={suggestionCategory}
                        onChange={e => setSuggestionCategory(e.target.value)}
                        className="w-full px-3 py-1.5 rounded bg-[#FAF7F0] dark:bg-[#28241F] border border-[#DDD3C0] dark:border-[#38322A] text-[#2B2621] dark:text-[#EAE4D8]"
                      >
                        <option value="Paper Styling & Boards">Paper Styling & Boards</option>
                        <option value="Security & Encryption">Security & Encryption</option>
                        <option value="Folders & Notes">Folders & Notes</option>
                        <option value="Media & Attachments">Media & Attachments</option>
                        <option value="Cloud Sync">Cloud Sync</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block font-serif-paper font-semibold text-[#5C5346] dark:text-[#C5BCAD] mb-1">
                      Improvement Details & Reasoning
                    </label>
                    <textarea
                      rows={2}
                      required
                      value={suggestionDesc}
                      onChange={e => setSuggestionDesc(e.target.value)}
                      placeholder="Explain how this improves your workflow or privacy..."
                      className="w-full px-3 py-1.5 rounded bg-[#FAF7F0] dark:bg-[#28241F] border border-[#DDD3C0] dark:border-[#38322A] text-[#2B2621] dark:text-[#EAE4D8]"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    {suggestionSuccess ? (
                      <span className="text-xs font-mono-paper text-[#5B8246] flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Suggestion submitted to transparent lifecycle log!</span>
                      </span>
                    ) : (
                      <span className="text-[11px] font-mono-paper text-[#8E7E6E]">
                        Recorded directly to user accountability registry
                      </span>
                    )}

                    <button
                      type="submit"
                      className="flex items-center gap-1.5 px-4 py-1.5 rounded bg-[#8E4A35] hover:bg-[#7D3F2D] text-white font-serif-paper font-semibold shadow-xs cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Submit Suggestion</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* User Suggested Improvements Lifecycle List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif-paper text-sm font-bold text-[#2B2621] dark:text-[#EAE4D8] uppercase tracking-wider">
                    User Suggestions & Lifecycle State
                  </h3>
                  <span className="text-[11px] font-mono-paper text-[#8E7E6E]">
                    {userFeedbackUpdates.length} Recorded
                  </span>
                </div>

                <div className="space-y-2.5">
                  {userFeedbackUpdates.map(update => (
                    <div
                      key={update.id}
                      className="p-3.5 rounded-md bg-[#FCFAF6] dark:bg-[#221F1B] border border-[#DDD3C0] dark:border-[#38322A] flex flex-col sm:flex-row sm:items-start justify-between gap-3 text-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-serif-paper font-bold text-sm text-[#2B2621] dark:text-[#EAE4D8]">
                            {update.title}
                          </span>
                          <span className="font-mono-paper text-[10px] px-1.5 py-0.2 rounded bg-[#E4D9C7] dark:bg-[#302A24] text-[#7E7365] dark:text-[#A89E90]">
                            {update.category}
                          </span>
                        </div>
                        <p className="font-serif-paper text-[#5C5346] dark:text-[#C5BCAD] leading-relaxed">
                          {update.description}
                        </p>
                        <div className="text-[10px] font-mono-paper text-[#8E7E6E] pt-1">
                          Author: {update.authorName} • {new Date(update.createdAt).toLocaleDateString()}
                        </div>
                      </div>

                      <div className="shrink-0">
                        <span className={`inline-flex items-center gap-1 font-mono-paper text-[10px] font-bold px-2 py-0.5 rounded border ${
                          update.status === 'shipped'
                            ? 'bg-[#EBF0E6] text-[#3D5C2C] border-[#B8CCA5]'
                            : update.status === 'in-progress'
                            ? 'bg-[#F9EED9] text-[#7A561D] border-[#E5CFA0]'
                            : 'bg-[#F2EFE8] text-[#6B5F50] border-[#D4C8B4]'
                        }`}>
                          <CheckCircle2 className="w-3 h-3" />
                          <span>{update.status.toUpperCase()}</span>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Comprehensive Chronological Changelog Timeline */}
              <div className="space-y-3 pt-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-[#E8DEC8] dark:border-[#2F2923] pt-4">
                  <h3 className="font-serif-paper text-sm font-bold text-[#2B2621] dark:text-[#EAE4D8] uppercase tracking-wider">
                    Full History of Every Release Update
                  </h3>

                  <div className="flex items-center gap-2">
                    <select
                      value={changelogFilter}
                      onChange={e => setChangelogFilter(e.target.value)}
                      className="text-xs px-2 py-1 rounded bg-[#FCFAF6] dark:bg-[#25211D] border border-[#DDD3C0] dark:border-[#38322A] text-[#2B2621] dark:text-[#EAE4D8]"
                    >
                      <option value="all">All Updates</option>
                      <option value="security">Security & Crypto</option>
                      <option value="design">Paper Design</option>
                      <option value="user-suggested">User Suggested</option>
                      <option value="milestone">Milestones</option>
                    </select>

                    <input
                      type="text"
                      value={changelogSearch}
                      onChange={e => setChangelogSearch(e.target.value)}
                      placeholder="Search updates..."
                      className="text-xs px-2 py-1 rounded bg-[#FCFAF6] dark:bg-[#25211D] border border-[#DDD3C0] dark:border-[#38322A] text-[#2B2621] dark:text-[#EAE4D8] w-36"
                    />
                  </div>
                </div>

                <div className="relative border-l-2 border-[#D8CCB8] dark:border-[#383129] ml-3 pl-5 space-y-6">
                  {filteredChangelog.map(entry => (
                    <div key={entry.version} className="relative group">
                      {/* Timeline dot */}
                      <div className="absolute -left-[27px] top-1 w-3.5 h-3.5 rounded-full bg-[#8E4A35] border-2 border-[#FAF7F0] dark:border-[#1A1815] shadow-xs" />

                      <div className="p-4 rounded-md bg-[#FCFAF6] dark:bg-[#201D19] border border-[#DDD3C0] dark:border-[#38322A] space-y-2">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="font-mono-paper text-xs font-bold px-2 py-0.5 rounded bg-[#8E4A35] text-white">
                              {entry.version}
                            </span>
                            <h4 className="font-serif-paper text-base font-bold text-[#2B2621] dark:text-[#EAE4D8]">
                              {entry.title}
                            </h4>
                          </div>

                          <div className="flex items-center gap-2 text-[10px] font-mono-paper text-[#8E7E6E]">
                            <span>{entry.releaseDate}</span>
                            <span className="px-1.5 py-0.2 rounded bg-[#EBF0E6] text-[#3D5C2C] font-semibold border border-[#B8CCA5]">
                              VERIFIED & SHIPPED
                            </span>
                          </div>
                        </div>

                        <p className="text-xs font-serif-paper text-[#5C5346] dark:text-[#C5BCAD] leading-relaxed">
                          {entry.description}
                        </p>

                        {/* Origin Reference */}
                        {entry.userRequestRef && (
                          <div className="p-2 rounded bg-[#F4EDE0] dark:bg-[#28231E] border border-[#E3D7C5] dark:border-[#3A332B] text-[11px] font-serif-paper text-[#7E7365] dark:text-[#A89E90] italic">
                            Origin / Need: {entry.userRequestRef}
                          </div>
                        )}

                        {/* Specific Highlights */}
                        <div className="space-y-1 pt-1">
                          <span className="text-[10px] font-mono-paper text-[#8E7E6E] uppercase block">
                            Specific Architectural Changes:
                          </span>
                          <ul className="list-disc list-inside text-xs font-serif-paper text-[#4A4134] dark:text-[#B5AAA] space-y-0.5">
                            {entry.highlights.map((h, i) => (
                              <li key={i}>{h}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: END-TO-END ENCRYPTION */}
          {currentTab === 'encryption' && (
            <div className="space-y-6">
              <div className="p-4 rounded-md bg-[#EBF0E6] dark:bg-[#1E271C] border border-[#C8D5BE] dark:border-[#2F3D2B] space-y-2">
                <div className="flex items-center gap-2 text-[#3D5C2C] dark:text-[#88B86E]">
                  <ShieldCheck className="w-5 h-5" />
                  <span className="font-serif-paper font-bold text-base">
                    Zero-Knowledge Mathematical Protection
                  </span>
                </div>
                <p className="text-xs text-[#4A5D3B] dark:text-[#ABC49E] font-serif-paper leading-relaxed">
                  All notes (titles, body memos, checklist items, attached pictures) are encrypted on your local device with <strong>AES-GCM 256</strong> using your master passphrase. Firebase servers only store encrypted ciphertext.
                </p>
              </div>

              {/* Passphrase Manager */}
              <div className="p-4 rounded-md bg-[#FCFAF6] dark:bg-[#201D19] border border-[#DDD3C0] dark:border-[#38322A] space-y-4">
                <h3 className="font-serif-paper text-sm font-bold text-[#2B2621] dark:text-[#EAE4D8] flex items-center gap-2">
                  <Key className="w-4 h-4 text-[#8E4A35]" />
                  <span>Master Encryption Passphrase</span>
                </h3>

                <form onSubmit={handlePassphraseSave} className="space-y-3">
                  <div>
                    <label className="block text-xs font-serif-paper font-semibold text-[#5C5346] dark:text-[#C5BCAD] mb-1">
                      Set or Change Passphrase
                    </label>
                    <input
                      type="password"
                      value={newPassphraseInput}
                      onChange={e => setNewPassphraseInput(e.target.value)}
                      placeholder="Enter new master passphrase..."
                      className="w-full px-3 py-1.5 text-xs rounded bg-[#FAF7F0] dark:bg-[#28241F] border border-[#DDD3C0] dark:border-[#38322A] text-[#2B2621] dark:text-[#EAE4D8]"
                    />
                    <span className="text-[11px] text-[#8E7E6E] font-mono-paper block mt-1">
                      Changing passphrase will re-seal your notes with the new AES-256 key.
                    </span>
                  </div>

                  {passphraseStatus && (
                    <div className="text-xs font-mono-paper text-[#8E4A35] font-semibold">
                      {passphraseStatus}
                    </div>
                  )}

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={!newPassphraseInput.trim()}
                      className="px-4 py-1.5 text-xs rounded bg-[#8E4A35] hover:bg-[#7D3F2D] text-white font-serif-paper font-semibold disabled:opacity-50 cursor-pointer"
                    >
                      Update Passphrase
                    </button>
                  </div>
                </form>

                {/* Fingerprint */}
                <div className="pt-3 border-t border-[#E8DEC8] dark:border-[#302922] flex items-center justify-between text-xs font-mono-paper">
                  <span className="text-[#7E7365]">Key Fingerprint (SHA-256):</span>
                  <span className="px-2 py-0.5 rounded bg-[#EAE0D0] dark:bg-[#2A2520] text-[#2B2621] dark:text-[#EAE4D8] font-bold">
                    {keyFingerprint}
                  </span>
                </div>
              </div>

              {/* Data Export / Backup */}
              <div className="p-4 rounded-md bg-[#FCFAF6] dark:bg-[#201D19] border border-[#DDD3C0] dark:border-[#38322A] space-y-2">
                <h3 className="font-serif-paper text-sm font-bold text-[#2B2621] dark:text-[#EAE4D8]">
                  Export Encrypted Backup
                </h3>
                <p className="text-xs text-[#6B5F50] dark:text-[#C5BCAD] font-serif-paper">
                  Download an archival JSON backup of all your boards and encrypted note payloads for offline preservation.
                </p>
                <button
                  onClick={exportDataBackup}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded bg-[#FAF7F0] dark:bg-[#26211C] border border-[#DDD3C0] dark:border-[#38322A] text-[#2B2621] dark:text-[#EAE4D8] hover:bg-[#EFE7D8] font-serif-paper font-semibold cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Encrypted Archive</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: CLOUD SYNC & ACCOUNT */}
          {currentTab === 'sync' && (
            <div className="space-y-6">
              {/* Google Account Profile */}
              <div className="p-4 rounded-md bg-[#FCFAF6] dark:bg-[#201D19] border border-[#DDD3C0] dark:border-[#38322A] space-y-3">
                <h3 className="font-serif-paper text-sm font-bold text-[#2B2621] dark:text-[#EAE4D8] flex items-center gap-2">
                  <UserIcon className="w-4 h-4 text-[#8E4A35]" />
                  <span>Google Account Synchronization</span>
                </h3>

                {user ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {user.photoURL ? (
                        <img src={user.photoURL} alt={user.displayName || 'User'} className="w-10 h-10 rounded-full border border-[#DDD3C0]" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-[#8E4A35] text-white flex items-center justify-center font-bold">
                          {user.email?.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <div className="font-serif-paper font-bold text-sm text-[#2B2621] dark:text-[#EAE4D8]">
                          {user.displayName || 'Google User'}
                        </div>
                        <div className="text-xs font-mono-paper text-[#7E7365] dark:text-[#9F9485]">
                          {user.email}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={onLogout}
                      className="px-3 py-1.5 text-xs rounded border border-[#DEC0B7] text-[#8E4A35] hover:bg-[#FBEBE8] dark:hover:bg-[#3D231E] font-medium cursor-pointer"
                    >
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-xs text-[#6B5F50] dark:text-[#C5BCAD] font-serif-paper leading-relaxed">
                      Sign in with your Google account to sync all encrypted folders, boards, and idea notes seamlessly across devices.
                    </p>
                    <button
                      onClick={onLogin}
                      className="flex items-center gap-2 px-4 py-2 rounded bg-white dark:bg-[#2A2520] border border-[#DDD3C0] dark:border-[#38322A] text-xs font-semibold text-[#2B2621] dark:text-[#EAE4D8] hover:bg-[#F7F2E8] shadow-xs cursor-pointer"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
                        <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"/>
                        <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                        <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                      </svg>
                      <span>Sign in with Google</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Cloud Synchronization Status */}
              <div className="p-4 rounded-md bg-[#FCFAF6] dark:bg-[#201D19] border border-[#DDD3C0] dark:border-[#38322A] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="font-serif-paper font-bold text-sm text-[#2B2621] dark:text-[#EAE4D8]">
                      Cloud Sync Engine
                    </span>
                    <span className="text-[11px] font-mono-paper text-[#7E7365] block">
                      Google Cloud Firestore (Enterprise Edition)
                    </span>
                  </div>

                  <span className={`px-2 py-0.5 text-xs font-mono-paper rounded ${
                    syncStatus === 'synced'
                      ? 'bg-[#EBF0E6] text-[#3D5C2C]'
                      : syncStatus === 'syncing'
                      ? 'bg-[#FDF3DE] text-[#8C631B]'
                      : 'bg-[#ECE5D8] text-[#7E7365]'
                  }`}>
                    {syncStatus.toUpperCase()}
                  </span>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={onForceResync}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded bg-[#FAF7F0] dark:bg-[#26211C] border border-[#DDD3C0] dark:border-[#38322A] text-[#2B2621] dark:text-[#EAE4D8] hover:bg-[#EFE7D8] cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Force Cloud Re-sync</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: PAPER & EYE STRAIN */}
          {currentTab === 'paper' && (
            <div className="space-y-6">
              <div className="p-4 rounded-md bg-[#FCFAF6] dark:bg-[#201D19] border border-[#DDD3C0] dark:border-[#38322A] flex items-center justify-between">
                <div className="space-y-1">
                  <span className="font-serif-paper font-bold text-sm text-[#2B2621] dark:text-[#EAE4D8] block">
                    Dark Paper Mode (Eye Strain Relief)
                  </span>
                  <p className="text-xs text-[#6B5F50] dark:text-[#C5BCAD] font-serif-paper">
                    Deep charred parchment tone and espresso desk backgrounds designed to eliminate glare in dark rooms.
                  </p>
                </div>

                <button
                  onClick={onToggleDarkMode}
                  className="px-3.5 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 border border-[#DDD3C0] dark:border-[#38322A] bg-[#F2ECE0] dark:bg-[#2B2620] text-[#2B2621] dark:text-[#EAE4D8] cursor-pointer"
                >
                  {isDarkMode ? <Sun className="w-3.5 h-3.5 text-[#E6B655]" /> : <Moon className="w-3.5 h-3.5 text-[#665D52]" />}
                  <span>{isDarkMode ? 'Light Paper' : 'Dark Paper'}</span>
                </button>
              </div>

              <div className="p-4 rounded-md bg-[#FCFAF6] dark:bg-[#201D19] border border-[#DDD3C0] dark:border-[#38322A] space-y-2">
                <span className="font-serif-paper font-bold text-sm text-[#2B2621] dark:text-[#EAE4D8] block">
                  Paper Design Constitution
                </span>
                <p className="text-xs text-[#6B5F50] dark:text-[#C5BCAD] font-serif-paper leading-relaxed">
                  Folio Kraft uses real stationery material references: Manila fibers, cotton rag paper, aged parchment, Terracotta sealing wax, and charcoal calligraphy ink. All modern corporate blue styles and generic UI buttons have been strictly eliminated.
                </p>
              </div>
            </div>
          )}

          {/* TAB 5: DESK PERSONA & ONBOARDING */}
          {currentTab === 'profile' && (
            <div className="space-y-6">
              <div className="p-4 rounded-md bg-[#FAF7F0] dark:bg-[#201D19] border border-[#DDD3C0] dark:border-[#38322A] space-y-4">
                <div className="flex items-center gap-2">
                  <Feather className="w-5 h-5 text-[#8E4A35]" />
                  <h3 className="font-serif-paper text-base font-bold text-[#2B2621] dark:text-[#EAE4D8]">
                    Desk Character & Persona Settings
                  </h3>
                </div>
                <p className="text-xs text-[#6B5F50] dark:text-[#C5BCAD] font-serif-paper leading-relaxed">
                  Customize the creative identity, pen name, and character explanation you entered during onboarding. All fields remain completely optional.
                </p>

                <form
                  onSubmit={e => {
                    e.preventDefault();
                    if (onUpdateProfile) {
                      onUpdateProfile({
                        name: profileName.trim() || undefined,
                        characterExplanation: profileBio.trim() || undefined,
                        referralSource: profileReferral || undefined,
                        hasCompletedOnboarding: true,
                      });
                      setProfileSaved(true);
                      setTimeout(() => setProfileSaved(false), 3000);
                    }
                  }}
                  className="space-y-3.5 text-xs"
                >
                  <div>
                    <label className="block font-serif-paper font-bold text-xs text-[#5C5346] dark:text-[#C5BCAD] mb-1">
                      Pen Name / Display Name
                    </label>
                    <input
                      type="text"
                      value={profileName}
                      onChange={e => setProfileName(e.target.value)}
                      placeholder="e.g. Elena, Alex, or anonymous"
                      className="w-full px-3 py-1.5 rounded bg-[#FCFAF6] dark:bg-[#25211D] border border-[#DDD3C0] dark:border-[#38322A] text-[#2B2621] dark:text-[#EAE4D8]"
                    />
                  </div>

                  <div>
                    <label className="block font-serif-paper font-bold text-xs text-[#5C5346] dark:text-[#C5BCAD] mb-1">
                      What explains your character / creative persona?
                    </label>
                    <textarea
                      rows={3}
                      value={profileBio}
                      onChange={e => setProfileBio(e.target.value)}
                      placeholder="Explain what drives your writing, your focus, or how you think..."
                      className="w-full px-3 py-1.5 rounded bg-[#FCFAF6] dark:bg-[#25211D] border border-[#DDD3C0] dark:border-[#38322A] text-[#2B2621] dark:text-[#EAE4D8]"
                    />
                  </div>

                  <div>
                    <label className="block font-serif-paper font-bold text-xs text-[#5C5346] dark:text-[#C5BCAD] mb-1">
                      Where did you hear about us?
                    </label>
                    <input
                      type="text"
                      value={profileReferral}
                      onChange={e => setProfileReferral(e.target.value)}
                      placeholder="YouTube, WhatsApp, Twitter, Instagram, or somewhere else..."
                      className="w-full px-3 py-1.5 rounded bg-[#FCFAF6] dark:bg-[#25211D] border border-[#DDD3C0] dark:border-[#38322A] text-[#2B2621] dark:text-[#EAE4D8]"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    {profileSaved ? (
                      <span className="text-xs font-mono-paper text-[#5B8246] flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Persona profile updated successfully!</span>
                      </span>
                    ) : (
                      <span className="text-[11px] font-mono-paper text-[#8E7E6E]">
                        Saves locally and to your cloud account
                      </span>
                    )}

                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded bg-[#8E4A35] text-white font-serif-paper font-semibold cursor-pointer"
                    >
                      Save Persona
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Bar */}
        <div className="px-6 py-3 border-t border-[#E8DEC8] dark:border-[#2F2923] bg-[#F4EDE0] dark:bg-[#201C18] flex items-center justify-between text-xs font-mono-paper text-[#7E7365] dark:text-[#9F9485]">
          <span>Folio Kraft v1.4.0 • Zero Knowledge E2EE</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded bg-[#8E4A35] text-white font-serif-paper font-semibold cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
