import { Folder, Board, Note } from '../types';

export const DEFAULT_PASSPHRASE = 'paper-secret-desk';

export const INITIAL_FOLDERS: Folder[] = [
  {
    id: 'folder-main',
    name: 'Main Desk',
    color: '#8E4A35', // terracotta
    order: 0,
    ownerId: 'local-owner',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const INITIAL_BOARDS: Board[] = [
  {
    id: 'board-general',
    folderId: 'folder-main',
    name: 'General Ideas',
    description: 'A clean slate for your ideas, sketches, thoughts, and photos.',
    paperTheme: 'manila',
    order: 0,
    ownerId: 'local-owner',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Pristine starting state: all template notes removed
export const INITIAL_NOTES: Note[] = [];
