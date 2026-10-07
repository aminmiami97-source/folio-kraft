/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot 
} from 'firebase/firestore';

import { 
  auth, 
  db, 
  loginWithGoogle, 
  logoutUser, 
  testConnection, 
  handleFirestoreError, 
  OperationType 
} from './lib/firebase';

import { 
  encryptData, 
  decryptData, 
  generateKeyFingerprint 
} from './lib/crypto';

import { 
  INITIAL_FOLDERS, 
  INITIAL_BOARDS, 
  INITIAL_NOTES, 
  DEFAULT_PASSPHRASE 
} from './lib/initialData';

import { 
  INITIAL_CHANGELOG_ENTRIES, 
  INITIAL_USER_FEEDBACK_UPDATES 
} from './lib/changelogData';

import { Folder, Board, Note, NoteContent, UserFeedbackUpdate, ChangelogEntry, UserProfile } from './types';

import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { BoardView } from './components/BoardView';
import { AllBoardsOverview } from './components/AllBoardsOverview';
import { OnboardingModal } from './components/OnboardingModal';
import { NoteModal } from './components/NoteModal';
import { MoveNoteModal } from './components/MoveNoteModal';
import { CipherInspectorModal } from './components/CipherInspectorModal';
import { SettingsModal } from './components/SettingsModal';

const LOCAL_STORAGE_KEY_FOLDERS = 'folio_kraft_folders_v2';
const LOCAL_STORAGE_KEY_BOARDS = 'folio_kraft_boards_v2';
const LOCAL_STORAGE_KEY_NOTES = 'folio_kraft_notes_v2';
const LOCAL_STORAGE_KEY_PASSPHRASE = 'folio_kraft_passphrase_v2';
const LOCAL_STORAGE_KEY_FEEDBACK = 'folio_kraft_feedback_v2';
const LOCAL_STORAGE_KEY_DARK_MODE = 'folio_kraft_dark_mode_v2';
const LOCAL_STORAGE_KEY_PROFILE = 'folio_kraft_profile_v2';

export default function App() {
  // Authentication State
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'offline'>('offline');

  // User Profile & Onboarding State
  const [userProfile, setUserProfile] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY_PROFILE);
    return saved ? JSON.parse(saved) : null;
  });
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);

  // Dark Mode State (Eye Strain Relief)
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY_DARK_MODE);
    if (saved !== null) return saved === 'true';
    return false; // Warm paper default
  });

  // End-to-End Encryption Passphrase
  const [passphrase, setPassphrase] = useState<string>(() => {
    return localStorage.getItem(LOCAL_STORAGE_KEY_PASSPHRASE) || DEFAULT_PASSPHRASE;
  });
  const [keyFingerprint, setKeyFingerprint] = useState<string>('00:00:00:00:00:00:00:00');
  const [isEncryptedUnlocked, setIsEncryptedUnlocked] = useState(true);

  // Data Collections (Pristine clean start with NO dummy template notes)
  const [folders, setFolders] = useState<Folder[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY_FOLDERS);
    return saved ? JSON.parse(saved) : INITIAL_FOLDERS;
  });

  const [boards, setBoards] = useState<Board[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY_BOARDS);
    return saved ? JSON.parse(saved) : INITIAL_BOARDS;
  });

  const [notes, setNotes] = useState<Note[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY_NOTES);
    if (!saved) return INITIAL_NOTES;
    try {
      const parsed: Note[] = JSON.parse(saved);
      // Clean out any old template demo notes if present
      const cleaned = parsed.filter(n => !n.id.startsWith('note-1') && !n.id.startsWith('note-2') && !n.id.startsWith('note-3') && !n.id.startsWith('note-4'));
      return cleaned;
    } catch {
      return INITIAL_NOTES;
    }
  });

  const [userFeedbackUpdates, setUserFeedbackUpdates] = useState<UserFeedbackUpdate[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY_FEEDBACK);
    return saved ? JSON.parse(saved) : INITIAL_USER_FEEDBACK_UPDATES;
  });

  const [changelogEntries] = useState<ChangelogEntry[]>(INITIAL_CHANGELOG_ENTRIES);

  // Active Navigation & Workspace View
  const [selectedBoardId, setSelectedBoardId] = useState<string | null>(() => {
    return boards[0]?.id || null;
  });
  const [isOverviewActive, setIsOverviewActive] = useState<boolean>(false);

  // Modal Dialogs
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  const [movingNote, setMovingNote] = useState<Note | null>(null);
  const [inspectingCipherNote, setInspectingCipherNote] = useState<Note | null>(null);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsActiveTab, setSettingsActiveTab] = useState<'changelog' | 'encryption' | 'sync' | 'paper' | 'profile'>('changelog');

  // Trigger onboarding on initial boot if not yet completed
  useEffect(() => {
    if (!userProfile || !userProfile.hasCompletedOnboarding) {
      // Open onboarding modal on start so user can explain character, enter name (optional), and referral
      setIsOnboardingOpen(true);
    }
  }, []);

  // Dark Mode Class Sync
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem(LOCAL_STORAGE_KEY_DARK_MODE, String(isDarkMode));
  }, [isDarkMode]);

  // Key Fingerprint Computation
  useEffect(() => {
    generateKeyFingerprint(passphrase).then(fp => setKeyFingerprint(fp));
    localStorage.setItem(LOCAL_STORAGE_KEY_PASSPHRASE, passphrase);
  }, [passphrase]);

  // Test Connection on startup (Skill mandate)
  useEffect(() => {
    testConnection();
  }, []);

  // Decrypt notes whenever notes or passphrase changes
  const decryptAllNotes = useCallback(async (notesToDecrypt: Note[], currentPass: string) => {
    const decrypted = await Promise.all(
      notesToDecrypt.map(async note => {
        if (!note.isEncrypted) {
          return note;
        }
        if (!note.encryptedPayload && note.decryptedContent) {
          try {
            const cipher = await encryptData(note.decryptedContent, currentPass);
            return { ...note, encryptedPayload: cipher };
          } catch {
            return note;
          }
        }
        try {
          const content = await decryptData<NoteContent>(note.encryptedPayload, currentPass);
          return { ...note, decryptedContent: content };
        } catch {
          return { ...note, decryptedContent: undefined };
        }
      })
    );
    return decrypted;
  }, []);

  // Save state to local storage
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_FOLDERS, JSON.stringify(folders));
  }, [folders]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_BOARDS, JSON.stringify(boards));
  }, [boards]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_NOTES, JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_FEEDBACK, JSON.stringify(userFeedbackUpdates));
  }, [userFeedbackUpdates]);

  useEffect(() => {
    if (userProfile) {
      localStorage.setItem(LOCAL_STORAGE_KEY_PROFILE, JSON.stringify(userProfile));
    }
  }, [userProfile]);

  // Firebase Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, currentUser => {
      setUser(currentUser);
      setAuthReady(true);
      if (currentUser) {
        setSyncStatus('syncing');
        // If user signs in and hasn't completed onboarding, prompt them
        if (!userProfile?.hasCompletedOnboarding) {
          setIsOnboardingOpen(true);
        }
      } else {
        setSyncStatus('offline');
      }
    });
    return () => unsubscribe();
  }, [userProfile]);

  // Real-time Firestore Sync Listeners (when authenticated)
  useEffect(() => {
    if (!authReady || !user) return;

    setSyncStatus('syncing');

    // Profile listener
    const profilePath = `users/${user.uid}/profile/main`;
    const profileUnsub = onSnapshot(
      doc(db, 'users', user.uid, 'profile', 'main'),
      snap => {
        if (snap.exists()) {
          const data = snap.data() as UserProfile;
          setUserProfile(data);
        }
      },
      err => {
        console.warn('Profile listener note:', err);
      }
    );

    // 1. Folders Listener
    const foldersPath = `users/${user.uid}/folders`;
    const foldersUnsub = onSnapshot(
      collection(db, foldersPath),
      snapshot => {
        if (!snapshot.empty) {
          const remoteFolders = snapshot.docs.map(d => d.data() as Folder);
          setFolders(remoteFolders);
        } else if (folders.length > 0) {
          folders.forEach(async f => {
            const path = `users/${user.uid}/folders/${f.id}`;
            try {
              await setDoc(doc(db, 'users', user.uid, 'folders', f.id), {
                ...f,
                ownerId: user.uid,
              });
            } catch (err) {
              handleFirestoreError(err, OperationType.WRITE, path);
            }
          });
        }
      },
      error => {
        handleFirestoreError(error, OperationType.GET, foldersPath);
      }
    );

    // 2. Boards Listener
    const boardsPath = `users/${user.uid}/boards`;
    const boardsUnsub = onSnapshot(
      collection(db, boardsPath),
      snapshot => {
        if (!snapshot.empty) {
          const remoteBoards = snapshot.docs.map(d => d.data() as Board);
          setBoards(remoteBoards);
        } else if (boards.length > 0) {
          boards.forEach(async b => {
            const path = `users/${user.uid}/boards/${b.id}`;
            try {
              await setDoc(doc(db, 'users', user.uid, 'boards', b.id), {
                ...b,
                ownerId: user.uid,
              });
            } catch (err) {
              handleFirestoreError(err, OperationType.WRITE, path);
            }
          });
        }
      },
      error => {
        handleFirestoreError(error, OperationType.GET, boardsPath);
      }
    );

    // 3. Notes Listener (Sealed E2EE payloads)
    const notesPath = `users/${user.uid}/notes`;
    const notesUnsub = onSnapshot(
      collection(db, notesPath),
      async snapshot => {
        if (!snapshot.empty) {
          const remoteNotes = snapshot.docs.map(d => d.data() as Note);
          const decrypted = await decryptAllNotes(remoteNotes, passphrase);
          setNotes(decrypted);
          setSyncStatus('synced');
        } else if (notes.length > 0) {
          notes.forEach(async n => {
            const path = `users/${user.uid}/notes/${n.id}`;
            try {
              let payload = n.encryptedPayload;
              if (!payload && n.decryptedContent) {
                payload = await encryptData(n.decryptedContent, passphrase);
              }
              await setDoc(doc(db, 'users', user.uid, 'notes', n.id), {
                id: n.id,
                boardId: n.boardId,
                ownerId: user.uid,
                isEncrypted: true,
                encryptedPayload: payload,
                color: n.color,
                isPinned: n.isPinned,
                order: n.order,
                createdAt: n.createdAt,
                updatedAt: n.updatedAt,
              });
            } catch (err) {
              handleFirestoreError(err, OperationType.WRITE, path);
            }
          });
          setSyncStatus('synced');
        } else {
          setSyncStatus('synced');
        }
      },
      error => {
        handleFirestoreError(error, OperationType.GET, notesPath);
      }
    );

    // 4. Feedback updates listener
    const feedbackPath = 'feedbackUpdates';
    const feedbackUnsub = onSnapshot(
      collection(db, feedbackPath),
      snapshot => {
        if (!snapshot.empty) {
          const list = snapshot.docs.map(d => d.data() as UserFeedbackUpdate);
          const map = new Map<string, UserFeedbackUpdate>();
          INITIAL_USER_FEEDBACK_UPDATES.forEach(u => map.set(u.id, u));
          list.forEach(u => map.set(u.id, u));
          setUserFeedbackUpdates(Array.from(map.values()));
        }
      },
      error => {
        console.warn('Feedback listener note:', error);
      }
    );

    return () => {
      profileUnsub();
      foldersUnsub();
      boardsUnsub();
      notesUnsub();
      feedbackUnsub();
    };
  }, [authReady, user, passphrase, decryptAllNotes]);

  // Derived current Board and Folder
  const currentBoard = useMemo(() => {
    return boards.find(b => b.id === selectedBoardId) || boards[0] || null;
  }, [boards, selectedBoardId]);

  const currentFolder = useMemo(() => {
    if (!currentBoard) return null;
    return folders.find(f => f.id === currentBoard.folderId) || null;
  }, [currentBoard, folders]);

  // Profile Save Handler (from onboarding modal or settings)
  const handleSaveProfile = async (profilePartial: Partial<UserProfile>) => {
    const updated: UserProfile = {
      userId: user?.uid || userProfile?.userId || 'local-user',
      name: profilePartial.name || userProfile?.name,
      characterExplanation: profilePartial.characterExplanation || userProfile?.characterExplanation,
      referralSource: profilePartial.referralSource || userProfile?.referralSource,
      hasCompletedOnboarding: profilePartial.hasCompletedOnboarding ?? true,
      updatedAt: new Date().toISOString(),
    };

    setUserProfile(updated);
    localStorage.setItem(LOCAL_STORAGE_KEY_PROFILE, JSON.stringify(updated));

    if (user) {
      const path = `users/${user.uid}/profile/main`;
      try {
        await setDoc(doc(db, 'users', user.uid, 'profile', 'main'), updated);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, path);
      }
    }
  };

  // Folder Actions
  const handleCreateFolder = async (name: string, color?: string) => {
    const newFolder: Folder = {
      id: `folder-${Date.now()}`,
      name,
      color: color || '#8E4A35',
      order: folders.length,
      ownerId: user?.uid || 'local-owner',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setFolders(prev => [...prev, newFolder]);

    if (user) {
      const path = `users/${user.uid}/folders/${newFolder.id}`;
      try {
        await setDoc(doc(db, 'users', user.uid, 'folders', newFolder.id), newFolder);
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, path);
      }
    }
  };

  const handleUpdateFolder = async (folderId: string, name: string, color?: string) => {
    setFolders(prev =>
      prev.map(f => (f.id === folderId ? { ...f, name, color: color || f.color, updatedAt: new Date().toISOString() } : f))
    );

    if (user) {
      const path = `users/${user.uid}/folders/${folderId}`;
      try {
        const folder = folders.find(f => f.id === folderId);
        if (folder) {
          await setDoc(doc(db, 'users', user.uid, 'folders', folderId), {
            ...folder,
            name,
            color: color || folder.color,
            updatedAt: new Date().toISOString(),
          });
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, path);
      }
    }
  };

  const handleDeleteFolder = async (folderId: string) => {
    setBoards(prev =>
      prev.map(b => (b.folderId === folderId ? { ...b, folderId: 'root' } : b))
    );
    setFolders(prev => prev.filter(f => f.id !== folderId));

    if (user) {
      const path = `users/${user.uid}/folders/${folderId}`;
      try {
        await deleteDoc(doc(db, 'users', user.uid, 'folders', folderId));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, path);
      }
    }
  };

  // Board Actions
  const handleCreateBoard = async (folderId: string, name: string, description?: string) => {
    const newBoard: Board = {
      id: `board-${Date.now()}`,
      folderId,
      name,
      description,
      paperTheme: 'kraft',
      order: boards.length,
      ownerId: user?.uid || 'local-owner',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setBoards(prev => [...prev, newBoard]);
    setSelectedBoardId(newBoard.id);
    setIsOverviewActive(false);

    if (user) {
      const path = `users/${user.uid}/boards/${newBoard.id}`;
      try {
        await setDoc(doc(db, 'users', user.uid, 'boards', newBoard.id), newBoard);
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, path);
      }
    }
  };

  const handleUpdateBoard = async (boardId: string, name: string, description?: string) => {
    setBoards(prev =>
      prev.map(b => (b.id === boardId ? { ...b, name, description, updatedAt: new Date().toISOString() } : b))
    );

    if (user) {
      const path = `users/${user.uid}/boards/${boardId}`;
      try {
        const b = boards.find(b => b.id === boardId);
        if (b) {
          await setDoc(doc(db, 'users', user.uid, 'boards', boardId), {
            ...b,
            name,
            description,
            updatedAt: new Date().toISOString(),
          });
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, path);
      }
    }
  };

  const handleDeleteBoard = async (boardId: string) => {
    const notesToDelete = notes.filter(n => n.boardId === boardId);
    setNotes(prev => prev.filter(n => n.boardId !== boardId));
    setBoards(prev => prev.filter(b => b.id !== boardId));

    if (selectedBoardId === boardId) {
      const remaining = boards.filter(b => b.id !== boardId);
      setSelectedBoardId(remaining[0]?.id || null);
    }

    if (user) {
      const path = `users/${user.uid}/boards/${boardId}`;
      try {
        await deleteDoc(doc(db, 'users', user.uid, 'boards', boardId));
        for (const n of notesToDelete) {
          await deleteDoc(doc(db, 'users', user.uid, 'notes', n.id));
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, path);
      }
    }
  };

  // Note Actions (Encrypted Write & Cloud Sync)
  const handleSaveNote = async (noteData: {
    id?: string;
    boardId: string;
    color: string;
    isPinned: boolean;
    content: NoteContent;
  }) => {
    const isEditing = !!noteData.id;
    const noteId = noteData.id || `note-${Date.now()}`;
    const now = new Date().toISOString();

    const encryptedPayload = await encryptData(noteData.content, passphrase);

    const savedNote: Note = {
      id: noteId,
      boardId: noteData.boardId,
      ownerId: user?.uid || 'local-owner',
      isEncrypted: true,
      encryptedPayload,
      color: noteData.color,
      isPinned: noteData.isPinned,
      order: 0,
      createdAt: isEditing ? (notes.find(n => n.id === noteId)?.createdAt || now) : now,
      updatedAt: now,
      decryptedContent: noteData.content,
    };

    setNotes(prev => {
      if (isEditing) {
        return prev.map(n => (n.id === noteId ? savedNote : n));
      } else {
        return [savedNote, ...prev];
      }
    });

    if (user) {
      const path = `users/${user.uid}/notes/${noteId}`;
      try {
        await setDoc(doc(db, 'users', user.uid, 'notes', noteId), {
          id: savedNote.id,
          boardId: savedNote.boardId,
          ownerId: user.uid,
          isEncrypted: true,
          encryptedPayload: savedNote.encryptedPayload,
          color: savedNote.color,
          isPinned: savedNote.isPinned,
          order: savedNote.order,
          createdAt: savedNote.createdAt,
          updatedAt: savedNote.updatedAt,
        });
      } catch (err) {
        handleFirestoreError(err, isEditing ? OperationType.UPDATE : OperationType.CREATE, path);
      }
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    setNotes(prev => prev.filter(n => n.id !== noteId));

    if (user) {
      const path = `users/${user.uid}/notes/${noteId}`;
      try {
        await deleteDoc(doc(db, 'users', user.uid, 'notes', noteId));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, path);
      }
    }
  };

  const handleTogglePinNote = async (noteId: string) => {
    const note = notes.find(n => n.id === noteId);
    if (!note) return;

    const newPinned = !note.isPinned;
    const now = new Date().toISOString();

    setNotes(prev =>
      prev.map(n => (n.id === noteId ? { ...n, isPinned: newPinned, updatedAt: now } : n))
    );

    if (user) {
      const path = `users/${user.uid}/notes/${noteId}`;
      try {
        await setDoc(doc(db, 'users', user.uid, 'notes', noteId), {
          id: note.id,
          boardId: note.boardId,
          ownerId: user.uid,
          isEncrypted: note.isEncrypted,
          encryptedPayload: note.encryptedPayload,
          color: note.color,
          isPinned: newPinned,
          order: note.order,
          createdAt: note.createdAt,
          updatedAt: now,
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, path);
      }
    }
  };

  const handleMoveNote = async (noteId: string, targetBoardId: string) => {
    const note = notes.find(n => n.id === noteId);
    if (!note || note.boardId === targetBoardId) return;

    const now = new Date().toISOString();
    setNotes(prev =>
      prev.map(n => (n.id === noteId ? { ...n, boardId: targetBoardId, updatedAt: now } : n))
    );

    if (user) {
      const path = `users/${user.uid}/notes/${noteId}`;
      try {
        await setDoc(doc(db, 'users', user.uid, 'notes', noteId), {
          id: note.id,
          boardId: targetBoardId,
          ownerId: user.uid,
          isEncrypted: note.isEncrypted,
          encryptedPayload: note.encryptedPayload,
          color: note.color,
          isPinned: note.isPinned,
          order: note.order,
          createdAt: note.createdAt,
          updatedAt: now,
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, path);
      }
    }
  };

  const handleToggleChecklistItem = async (noteId: string, itemId: string) => {
    const note = notes.find(n => n.id === noteId);
    if (!note || !note.decryptedContent) return;

    const updatedChecklist = (note.decryptedContent.checklist || []).map(item =>
      item.id === itemId ? { ...item, done: !item.done } : item
    );

    const updatedContent: NoteContent = {
      ...note.decryptedContent,
      checklist: updatedChecklist,
    };

    const newCipher = await encryptData(updatedContent, passphrase);
    const now = new Date().toISOString();

    const updatedNote: Note = {
      ...note,
      decryptedContent: updatedContent,
      encryptedPayload: newCipher,
      updatedAt: now,
    };

    setNotes(prev => prev.map(n => (n.id === noteId ? updatedNote : n)));

    if (user) {
      const path = `users/${user.uid}/notes/${noteId}`;
      try {
        await setDoc(doc(db, 'users', user.uid, 'notes', noteId), {
          id: updatedNote.id,
          boardId: updatedNote.boardId,
          ownerId: user.uid,
          isEncrypted: true,
          encryptedPayload: newCipher,
          color: updatedNote.color,
          isPinned: updatedNote.isPinned,
          order: updatedNote.order,
          createdAt: updatedNote.createdAt,
          updatedAt: now,
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, path);
      }
    }
  };

  const handleUpdatePassphrase = async (newPassphrase: string) => {
    if (!newPassphrase || newPassphrase.trim() === '') return;

    const reEncryptedNotes = await Promise.all(
      notes.map(async note => {
        if (!note.decryptedContent) return note;
        const cipher = await encryptData(note.decryptedContent, newPassphrase);
        return {
          ...note,
          encryptedPayload: cipher,
        };
      })
    );

    setPassphrase(newPassphrase);
    setNotes(reEncryptedNotes);

    if (user) {
      for (const n of reEncryptedNotes) {
        const path = `users/${user.uid}/notes/${n.id}`;
        try {
          await setDoc(doc(db, 'users', user.uid, 'notes', n.id), {
            id: n.id,
            boardId: n.boardId,
            ownerId: user.uid,
            isEncrypted: true,
            encryptedPayload: n.encryptedPayload,
            color: n.color,
            isPinned: n.isPinned,
            order: n.order,
            createdAt: n.createdAt,
            updatedAt: n.updatedAt,
          });
        } catch (err) {
          handleFirestoreError(err, OperationType.UPDATE, path);
        }
      }
    }
  };

  const handleSubmitUserFeedback = async (feedback: {
    title: string;
    description: string;
    category: string;
  }) => {
    const newFeedback: UserFeedbackUpdate = {
      id: `req-${Date.now()}`,
      ownerId: user?.uid || 'guest-user',
      authorName: userProfile?.name || user?.displayName || user?.email?.split('@')[0] || 'User',
      title: feedback.title,
      description: feedback.description,
      category: feedback.category,
      status: 'submitted',
      createdAt: new Date().toISOString(),
    };

    setUserFeedbackUpdates(prev => [newFeedback, ...prev]);

    if (user) {
      const path = `feedbackUpdates/${newFeedback.id}`;
      try {
        await setDoc(doc(db, 'feedbackUpdates', newFeedback.id), newFeedback);
      } catch (err) {
        console.warn('Feedback write note:', err);
      }
    }
  };

  const handleForceResync = async () => {
    if (!user) return;
    setSyncStatus('syncing');
    try {
      for (const n of notes) {
        let payload = n.encryptedPayload;
        if (!payload && n.decryptedContent) {
          payload = await encryptData(n.decryptedContent, passphrase);
        }
        await setDoc(doc(db, 'users', user.uid, 'notes', n.id), {
          id: n.id,
          boardId: n.boardId,
          ownerId: user.uid,
          isEncrypted: true,
          encryptedPayload: payload,
          color: n.color,
          isPinned: n.isPinned,
          order: n.order,
          createdAt: n.createdAt,
          updatedAt: n.updatedAt,
        });
      }
      setSyncStatus('synced');
    } catch {
      setSyncStatus('offline');
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F3EA] dark:bg-[#141210] text-[#2B2621] dark:text-[#EAE4D8] flex flex-col transition-colors selection:bg-[#E2D4C0] selection:text-[#2B2621]">
      {/* Top Paper Header Bar */}
      <Header
        currentBoard={currentBoard}
        currentFolder={currentFolder}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        user={user}
        userProfile={userProfile}
        onLogin={loginWithGoogle}
        onLogout={logoutUser}
        onOpenSettings={tab => {
          if (tab) setSettingsActiveTab(tab);
          setIsSettingsOpen(true);
        }}
        onAddNote={() => {
          setEditingNote(null);
          setIsNoteModalOpen(true);
        }}
        isEncryptedUnlocked={isEncryptedUnlocked}
        syncStatus={syncStatus}
        isOverviewActive={isOverviewActive}
        onSelectOverview={() => setIsOverviewActive(true)}
      />

      {/* Main Workspace Layout */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Sidebar: Organized Folders & Boards */}
        <Sidebar
          folders={folders}
          boards={boards}
          notes={notes}
          selectedBoardId={selectedBoardId}
          onSelectBoard={id => {
            setSelectedBoardId(id);
            setIsOverviewActive(false);
          }}
          onSelectOverview={() => setIsOverviewActive(true)}
          isOverviewActive={isOverviewActive}
          onCreateFolder={handleCreateFolder}
          onUpdateFolder={handleUpdateFolder}
          onDeleteFolder={handleDeleteFolder}
          onCreateBoard={handleCreateBoard}
          onUpdateBoard={handleUpdateBoard}
          onDeleteBoard={handleDeleteBoard}
        />

        {/* Workspace Display Area: All Boards Directory or Board Idea Canvas */}
        {isOverviewActive ? (
          <AllBoardsOverview
            folders={folders}
            boards={boards}
            notes={notes}
            onSelectBoard={id => {
              setSelectedBoardId(id);
              setIsOverviewActive(false);
            }}
            onCreateFolder={handleCreateFolder}
            onCreateBoard={handleCreateBoard}
            onDeleteBoard={handleDeleteBoard}
            onDeleteFolder={handleDeleteFolder}
          />
        ) : currentBoard ? (
          <BoardView
            board={currentBoard}
            folder={currentFolder}
            notes={notes}
            onAddNote={() => {
              setEditingNote(null);
              setIsNoteModalOpen(true);
            }}
            onEditNote={note => {
              setEditingNote(note);
              setIsNoteModalOpen(true);
            }}
            onDeleteNote={handleDeleteNote}
            onTogglePinNote={handleTogglePinNote}
            onMoveNote={note => setMovingNote(note)}
            onInspectCipher={note => setInspectingCipherNote(note)}
            onToggleChecklistItem={handleToggleChecklistItem}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center p-8 text-center text-[#7E7365] font-serif-paper">
            <div>
              <div className="paper-pin mx-auto mb-3" />
              <h2 className="text-xl font-bold text-[#2B2621] dark:text-[#EAE4D8]">
                No Board Selected
              </h2>
              <p className="text-xs mt-1">
                Select an organized folder board on the left or open the All Folders & Boards directory.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Onboarding Persona & Referral Questionnaire Modal */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        onSaveProfile={handleSaveProfile}
        initialName={userProfile?.name || user?.displayName || ''}
      />

      {/* Note Creation / Edit Modal */}
      <NoteModal
        isOpen={isNoteModalOpen}
        onClose={() => {
          setIsNoteModalOpen(false);
          setEditingNote(null);
        }}
        onSave={handleSaveNote}
        boards={boards}
        activeBoardId={selectedBoardId || boards[0]?.id || 'root'}
        initialNote={editingNote}
      />

      {/* Move Note Modal */}
      <MoveNoteModal
        isOpen={movingNote !== null}
        onClose={() => setMovingNote(null)}
        note={movingNote}
        boards={boards}
        folders={folders}
        onMove={handleMoveNote}
      />

      {/* Zero Knowledge Ciphertext Inspector */}
      <CipherInspectorModal
        isOpen={inspectingCipherNote !== null}
        onClose={() => setInspectingCipherNote(null)}
        note={inspectingCipherNote}
      />

      {/* Settings & Transparency Desk Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        activeTab={settingsActiveTab}
        user={user}
        userProfile={userProfile}
        onUpdateProfile={handleSaveProfile}
        onLogin={loginWithGoogle}
        onLogout={logoutUser}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        passphrase={passphrase}
        onUpdatePassphrase={handleUpdatePassphrase}
        keyFingerprint={keyFingerprint}
        changelogEntries={changelogEntries}
        userFeedbackUpdates={userFeedbackUpdates}
        onSubmitUserFeedback={handleSubmitUserFeedback}
        notes={notes}
        boards={boards}
        folders={folders}
        onForceResync={handleForceResync}
        syncStatus={syncStatus}
      />
    </div>
  );
}
