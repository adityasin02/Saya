import { mockSongs } from "@/lib/data";
import { FavoritesGrid } from "@/components/music/favorites-grid";
import { AiPlaylistButton } from "@/components/music/ai-playlist-button";

export default function FavoritesPage() {
  const likedSongs = mockSongs.filter((song) => song.liked);

  return (
    <div className="container mx-auto py-8 px-4 pb-24">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-bold">Favorites</h1>
        <AiPlaylistButton likedSongs={likedSongs.map(s => s.title)} />
      </div>
      <FavoritesGrid songs={likedSongs} />
    </div>
  );
}
