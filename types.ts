
export interface LyricLine {
  time: number;
  text: string;
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  coverUrl: string;
  audioUrl?: string;
  audioBlob?: Blob; // Actual file data for persistence
  coverBlob?: Blob; // Actual file data for persistence
  duration: string;
  genre: string;
  releaseYear: number;
  isDownloaded?: boolean;
  isFixed?: boolean; // If true, song cannot be deleted
  lyrics?: LyricLine[];
}

export interface Collection {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
}

export interface Playlist {
  id: string;
  name: string;
  songIds: string[];
}

export interface UserProfile {
  name: string;
  email: string;
  profileImage: string;
  isLoggedIn: boolean;
}

export type ViewState = 'home' | 'player' | 'search' | 'library' | 'profile' | 'subscription' | 'add-details' | 'insights' | 'analytics' | 'communication' | 'lyrics-editor' | 'queue' | 'admin';
