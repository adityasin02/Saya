import type { Song } from '@/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export const mockSongs: Song[] = [
  {
    id: '1',
    title: 'Midnight City',
    artist: 'M83',
    album: 'Hurry Up, We\'re Dreaming',
    albumArt: PlaceHolderImages[0].imageUrl,
    audioSrc: '/music/midnight-city.mp3', // Placeholder
    liked: true,
  },
  {
    id: '2',
    title: 'Blinding Lights',
    artist: 'The Weeknd',
    album: 'After Hours',
    albumArt: PlaceHolderImages[1].imageUrl,
    audioSrc: '/music/blinding-lights.mp3', // Placeholder
    liked: false,
  },
  {
    id: '3',
    title: 'A Sky Full of Stars',
    artist: 'Coldplay',
    album: 'Ghost Stories',
    albumArt: PlaceHolderImages[2].imageUrl,
    audioSrc: '/music/sky-full-of-stars.mp3', // Placeholder
    liked: true,
  },
  {
    id: '4',
    title: 'Get Lucky',
    artist: 'Daft Punk ft. Pharrell Williams',
    album: 'Random Access Memories',
    albumArt: PlaceHolderImages[3].imageUrl,
    audioSrc: '/music/get-lucky.mp3', // Placeholder
    liked: false,
  },
  {
    id: '5',
    title: 'Adore You',
    artist: 'Harry Styles',
    album: 'Fine Line',
    albumArt: PlaceHolderImages[4].imageUrl,
    audioSrc: '/music/adore-you.mp3', // Placeholder
    liked: true,
  },
  {
    id: '6',
    title: 'Levitating',
    artist: 'Dua Lipa',
    album: 'Future Nostalgia',
    albumArt: PlaceHolderImages[5].imageUrl,
    audioSrc: '/music/levitating.mp3', // Placeholder
    liked: false,
  },
];
