import { Song, UserProfile, Playlist } from './types';

const DB_NAME = 'VibeMusicDB';
const DB_VERSION = 2;
const STORES = {
  SONGS: 'songs',
  PROFILE: 'profile',
  META: 'metadata',
  PLAYLISTS: 'playlists'
};

const ADMIN_EMAIL = 'ridhamgupta805@gmail.com';

const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (event) => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORES.SONGS)) {
        db.createObjectStore(STORES.SONGS, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORES.PROFILE)) {
        db.createObjectStore(STORES.PROFILE, { keyPath: 'email' });
      }
      if (!db.objectStoreNames.contains(STORES.META)) {
        db.createObjectStore(STORES.META);
      }
      if (!db.objectStoreNames.contains(STORES.PLAYLISTS)) {
        db.createObjectStore(STORES.PLAYLISTS, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

async function toBlob(url: string): Promise<Blob | null> {
  if (!url || !url.startsWith('blob:')) return null;
  try {
    const response = await fetch(url);
    return await response.blob();
  } catch (e) {
    console.error("Blob conversion failed:", e);
    return null;
  }
}

const getScopedKey = (email: string, key: string) => `${email}_${key}`;

export const saveSongs = async (songs: Song[], email: string): Promise<boolean> => {
  try {
    const db = await openDB();
    const tx = db.transaction([STORES.SONGS, STORES.META], 'readwrite');
    const songStore = tx.objectStore(STORES.SONGS);
    const metaStore = tx.objectStore(STORES.META);
    
    const userSongIds = songs.map(s => s.id);
    metaStore.put(userSongIds, getScopedKey(email, 'song_ids'));
    metaStore.put(true, 'has_initialized');

    // Handle public song IDs if admin
    if (email === ADMIN_EMAIL) {
      const publicIdsReq = metaStore.get('public_song_ids');
      publicIdsReq.onsuccess = () => {
        const existingPublicIds = (publicIdsReq.result || []) as string[];
        const newPublicIds = [...new Set([...existingPublicIds, ...userSongIds])];
        metaStore.put(newPublicIds, 'public_song_ids');
      };
    }

    for (const song of songs) {
      const songToSave = { ...song };
      if (song.audioUrl?.startsWith('blob:') && !song.audioBlob) {
        songToSave.audioBlob = await toBlob(song.audioUrl) || undefined;
      }
      if (song.coverUrl?.startsWith('blob:') && !song.coverBlob) {
        songToSave.coverBlob = await toBlob(song.coverUrl) || undefined;
      }
      songStore.put(songToSave);
    }

    return new Promise((resolve) => {
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => resolve(false);
    });
  } catch (err) {
    console.error("Error saving songs:", err);
    return false;
  }
};

export const loadSongs = async (email: string): Promise<Song[]> => {
  try {
    const db = await openDB();
    const tx = db.transaction([STORES.SONGS, STORES.META], 'readonly');
    const songStore = tx.objectStore(STORES.SONGS);
    const metaStore = tx.objectStore(STORES.META);
    
    const userIdsReq = metaStore.get(getScopedKey(email, 'song_ids'));
    const publicIdsReq = metaStore.get('public_song_ids');
    
    return new Promise((resolve) => {
      let userIds: string[] = [];
      let publicIds: string[] = [];
      let requestsDone = 0;

      const processResults = () => {
        const allIds = [...new Set([...userIds, ...publicIds])];
        if (allIds.length === 0) return resolve([]);
        
        const results: Song[] = [];
        let completed = 0;
        
        allIds.forEach(id => {
          const songReq = songStore.get(id);
          songReq.onsuccess = () => {
            if (songReq.result) {
              const item = { ...songReq.result } as Song;
              if (item.audioBlob instanceof Blob) {
                item.audioUrl = URL.createObjectURL(item.audioBlob);
              }
              if (item.coverBlob instanceof Blob) {
                item.coverUrl = URL.createObjectURL(item.coverBlob);
              }
              results.push(item);
            }
            completed++;
            if (completed === allIds.length) resolve(results);
          };
          songReq.onerror = () => {
            completed++;
            if (completed === allIds.length) resolve(results);
          };
        });
      };

      userIdsReq.onsuccess = () => {
        userIds = userIdsReq.result || [];
        requestsDone++;
        if (requestsDone === 2) processResults();
      };
      publicIdsReq.onsuccess = () => {
        publicIds = publicIdsReq.result || [];
        requestsDone++;
        if (requestsDone === 2) processResults();
      };
      
      userIdsReq.onerror = () => { requestsDone++; if(requestsDone === 2) processResults(); };
      publicIdsReq.onerror = () => { requestsDone++; if(requestsDone === 2) processResults(); };
    });
  } catch (err) {
    console.error("Error loading songs:", err);
    return [];
  }
};

export const saveProfile = async (profile: UserProfile) => {
  try {
    const db = await openDB();
    const tx = db.transaction([STORES.PROFILE, STORES.META], 'readwrite');
    tx.objectStore(STORES.PROFILE).put(profile);
    tx.objectStore(STORES.META).put(profile.email, 'last_active_email');
    return new Promise((resolve) => {
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => resolve(false);
    });
  } catch (err) {
    return false;
  }
};

export const loadActiveProfile = async (): Promise<UserProfile | null> => {
  try {
    const db = await openDB();
    const metaStore = db.transaction(STORES.META, 'readonly').objectStore(STORES.META);
    const emailReq = metaStore.get('last_active_email');
    
    return new Promise((resolve) => {
      emailReq.onsuccess = () => {
        const email = emailReq.result;
        if (!email) return resolve(null);
        
        const profileReq = db.transaction(STORES.PROFILE, 'readonly').objectStore(STORES.PROFILE).get(email);
        profileReq.onsuccess = () => resolve(profileReq.result || null);
        profileReq.onerror = () => resolve(null);
      };
      emailReq.onerror = () => resolve(null);
    });
  } catch (err) {
    return null;
  }
};

export const isAppInitialized = async (): Promise<boolean> => {
  try {
    const db = await openDB();
    const request = db.transaction(STORES.META, 'readonly').objectStore(STORES.META).get('has_initialized');
    return new Promise((resolve) => {
      request.onsuccess = () => resolve(!!request.result);
      request.onerror = () => resolve(false);
    });
  } catch {
    return false;
  }
};

export const saveRecentlyPlayed = async (ids: string[], email: string) => {
  try {
    const db = await openDB();
    db.transaction(STORES.META, 'readwrite').objectStore(STORES.META).put(ids, getScopedKey(email, 'recently_played'));
  } catch (err) {}
};

export const loadRecentlyPlayed = async (email: string): Promise<string[]> => {
  try {
    const db = await openDB();
    const request = db.transaction(STORES.META, 'readonly').objectStore(STORES.META).get(getScopedKey(email, 'recently_played'));
    return new Promise((resolve) => {
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => resolve([]);
    });
  } catch { return []; }
};

export const savePlaylists = async (playlists: Playlist[], email: string) => {
  try {
    const db = await openDB();
    const tx = db.transaction([STORES.PLAYLISTS, STORES.META], 'readwrite');
    const store = tx.objectStore(STORES.PLAYLISTS);
    const metaStore = tx.objectStore(STORES.META);
    
    const playlistIds = playlists.map(p => p.id);
    metaStore.put(playlistIds, getScopedKey(email, 'playlist_ids'));

    for (const p of playlists) store.put(p);
  } catch {}
};

export const loadPlaylists = async (email: string): Promise<Playlist[]> => {
  try {
    const db = await openDB();
    const tx = db.transaction([STORES.PLAYLISTS, STORES.META], 'readonly');
    const store = tx.objectStore(STORES.PLAYLISTS);
    const metaStore = tx.objectStore(STORES.META);
    
    const idRequest = metaStore.get(getScopedKey(email, 'playlist_ids'));
    
    return new Promise((resolve) => {
      idRequest.onsuccess = () => {
        const ids = (idRequest.result || []) as string[];
        if (ids.length === 0) return resolve([]);
        
        const results: Playlist[] = [];
        let completed = 0;
        
        ids.forEach(id => {
          const pReq = store.get(id);
          pReq.onsuccess = () => {
            if (pReq.result) results.push(pReq.result as Playlist);
            completed++;
            if (completed === ids.length) resolve(results);
          };
          pReq.onerror = () => {
            completed++;
            if (completed === ids.length) resolve(results);
          };
        });
      };
      idRequest.onerror = () => resolve([]);
    });
  } catch { return []; }
};

export const saveSearchHistory = async (history: string[]) => {
  try {
    const db = await openDB();
    db.transaction(STORES.META, 'readwrite').objectStore(STORES.META).put(history, 'search_history');
  } catch {}
};

export const loadSearchHistory = async (): Promise<string[]> => {
  try {
    const db = await openDB();
    const request = db.transaction(STORES.META, 'readonly').objectStore(STORES.META).get('search_history');
    return new Promise((resolve) => {
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => resolve([]);
    });
  } catch { return []; }
};

export const clearActiveSession = async () => {
  try {
    const db = await openDB();
    const tx = db.transaction(STORES.META, 'readwrite');
    tx.objectStore(STORES.META).delete('last_active_email');
  } catch {}
};