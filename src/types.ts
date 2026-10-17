import type { Timestamp } from './firebase';

export interface Folder {
  id: string;
  userId: string;
  name: string;
  color: string;
  icon: string;
  createdAt: Timestamp | any;
  updatedAt: Timestamp | any;
}

export interface Note {
  id: string;
  userId: string;
  folderId: string; // empty string "" means without folder / root
  title: string;
  content: string;
  isPinned: boolean;
  isArchived: boolean;
  color: string;
  tags?: string[];
  createdAt: Timestamp | any;
  updatedAt: Timestamp | any;
}

export type ViewFilter = 'all' | 'unorganized' | 'pinned' | 'trash' | string; // string when it's a folderId

export interface UserProfile {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
}
