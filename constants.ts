
import { Song, Collection } from './types';

export const COLORS = {
  primary: '#B6FF1A', // Lime Green
  bg: '#000000',
  surface: '#121212',
  textSecondary: '#9CA3AF',
};

const STARBOY_LYRICS = [
  { time: 0, text: "I'm tryna put you in the worst mood, ah" },
  { time: 4, text: "P1 cleaner than your church shoes, ah" },
  { time: 8, text: "Milli point two on the dashboard, ah" },
  { time: 12, text: "Receipt on the table, it's a cash tour, ah" },
  { time: 16, text: "Look what you've done" },
  { time: 20, text: "I'm a motherf***in' Starboy" },
  { time: 24, text: "Look what you've done" },
  { time: 28, text: "I'm a motherf***in' Starboy" },
  { time: 32, text: "Every day a n***a try to test me, ah" },
  { time: 36, text: "Every day a n***a try to end me, ah" },
  { time: 40, text: "Pull up in a Roadster, no cap, ah" },
  { time: 44, text: "All these n***as tryna act like they bad, ah" }
];

const CHILL_LYRICS = [
  { time: 0, text: "Look, if you had one shot" },
  { time: 5, text: "Or one opportunity" },
  { time: 10, text: "To seize everything you ever wanted" },
  { time: 15, text: "In one moment" },
  { time: 20, text: "Would you capture it?" },
  { time: 25, text: "Or just let it slip?" }
];

export const MOCK_SONGS: Song[] = [
  {
    id: '1',
    title: 'Starboy Remix',
    artist: 'The Weeknd',
    album: 'Starboy',
    coverUrl: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=600&auto=format&fit=crop',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    duration: '6:12',
    genre: 'Party',
    releaseYear: 2024,
    isFixed: true,
    lyrics: STARBOY_LYRICS
  },
  {
    id: '2',
    title: 'Lofi Chill',
    artist: 'Eminiem',
    album: 'The Eminem Show',
    coverUrl: 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?q=80&w=600&auto=format&fit=crop',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    duration: '7:05',
    genre: 'Hip Hop',
    releaseYear: 2002,
    isFixed: true,
    lyrics: CHILL_LYRICS
  },
  {
    id: '3',
    title: 'Midnight Dance',
    artist: 'Kyanu & L',
    album: 'Dance Vibes',
    coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=600&auto=format&fit=crop',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    duration: '5:24',
    genre: 'Party',
    releaseYear: 2023,
    isFixed: true,
    lyrics: STARBOY_LYRICS
  },
  {
    id: '4',
    title: 'Blue Horizon',
    artist: 'The Weeknd',
    album: 'After Hours',
    coverUrl: 'https://images.unsplash.com/photo-1459749411177-042180ce6742?q=80&w=600&auto=format&fit=crop',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    duration: '5:41',
    genre: 'Blues',
    releaseYear: 2020,
    isFixed: true,
    lyrics: CHILL_LYRICS
  }
];

export const MOCK_COLLECTIONS: Collection[] = [
  {
    id: 'c1',
    title: 'TOP SONGS GLOBAL',
    subtitle: 'Discover 85 songs',
    imageUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=400&auto=format&fit=crop',
  },
  {
    id: 'c2',
    title: 'PURE SOUL HITS',
    subtitle: 'Discover 42 songs',
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop',
  }
];

export const CATEGORIES = ['All', 'Party', 'Blues', 'Sad', 'Hip Hop'];
export const YEARS = ['All', '2024', '2023', '2020', '2002'];
