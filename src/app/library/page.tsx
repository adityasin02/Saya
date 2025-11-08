import { mockSongs } from "@/lib/data";
import { SongTable } from "@/components/music/song-table";
import { Button } from "@/components/ui/button";
import { Plus, Sparkles } from "lucide-react";

export default function LibraryPage() {
  return (
    <div className="container mx-auto py-8 px-4 pb-24">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-bold">Library</h1>
        <div className="flex gap-2">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Import
          </Button>
          <Button variant="outline">
            <Sparkles className="mr-2 h-4 w-4" /> AI Playlist
          </Button>
        </div>
      </div>
      <SongTable songs={mockSongs} />
    </div>
  );
}
