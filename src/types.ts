export interface ChecklistItem {
  id: string;
  text: string;
  done: boolean;
}

export interface NoteContent {
  title: string;
  body: string;
  pictures: string[]; // base64 or image URLs
  tags: string[];
  checklist: ChecklistItem[];
}

export interface Note {
  id: string;
  boardId: string;
  ownerId: string;
  isEncrypted: boolean;
  encryptedPayload: string; // AES-GCM ciphertext containing NoteContent JSON
  color: string; // 'manila' | 'kraft' | 'parchment' | 'sage' | 'terracotta' | 'charcoal'
  isPinned: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
  // Client-side decrypted cache (volatile, never saved plain to DB)
  decryptedContent?: NoteContent;
}

export interface Board {
  id: string;
  folderId: string; // folder ID or 'root'
  name: string;
  description?: string;
  paperTheme?: string;
  order: number;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Folder {
  id: string;
  name: string;
  color?: string;
  order: number;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export type LifecycleStatus = 'submitted' | 'under-review' | 'in-progress' | 'shipped';

export interface UserFeedbackUpdate {
  id: string;
  ownerId: string;
  authorName: string;
  title: string;
  description: string;
  category: string;
  status: LifecycleStatus;
  createdAt: string;
}

export interface UserProfile {
  userId: string;
  name?: string;
  characterExplanation?: string;
  referralSource?: string;
  hasCompletedOnboarding: boolean;
  updatedAt: string;
}

export interface ChangelogEntry {
  version: string;
  releaseDate: string;
  title: string;
  type: 'milestone' | 'security' | 'feature' | 'design' | 'user-suggested';
  description: string;
  highlights: string[];
  userRequestRef?: string;
  lifecycleStatus: LifecycleStatus;
}
