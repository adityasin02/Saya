import { ReelFeed } from '@/components/music/reel-feed';
import { mockSongs } from '@/lib/data';
import type { Song } from '@/types';

type HomePageProps = {
  searchParams?: {
    songId?: string;
  };
};

export default function HomePage({ searchParams }: HomePageProps) {
  const songId = searchParams?.songId;
  let songs: Song[] = [...mockSongs];

  if (songId) {
    const selectedSongIndex = songs.findIndex(song => song.id === songId);
    if (selectedSongIndex > -1) {
      const selectedSong = songs.splice(selectedSongIndex, 1)[0];
      songs.unshift(selectedSong);
    }
  }

  return (
    <div className="h-screen w-full">
      <ReelFeed songs={songs} />
    </div>
  );
}
