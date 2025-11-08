import { ReelFeed } from '@/components/music/reel-feed';
import { mockSongs } from '@/lib/data';

export default function HomePage() {
  // In a real app, you would fetch songs from a database or local storage.
  const songs = mockSongs;

  return (
    <div className="h-screen w-full">
      <ReelFeed songs={songs} />
    </div>
  );
}
