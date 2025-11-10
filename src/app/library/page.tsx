"use client";

import { useState } from "react";
import { mockSongs as initialMockSongs } from "@/lib/data";
import { SongTable } from "@/components/music/song-table";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import type { Song } from "@/types";
import { UploadSongButton } from "@/components/music/upload-song-button";

export default function LibraryPage() {
  const [songs, setSongs] = useState<Song[]>(initialMockSongs);

  const handleSongAdded = (newSong: Song) => {
    setSongs((prevSongs) => [...prevSongs, newSong]);
  };

  return (
    <div className="container mx-auto py-8 px-4 pb-24">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-bold">Library</h1>
        <div className="flex gap-2">
          <UploadSongButton onSongAdded={handleSongAdded} />
          <Button variant="outline">
            <Sparkles className="mr-2 h-4 w-4" /> AI Playlist
          </Button>
        </div>
      </div>
      <SongTable songs={songs} />
    </div>
  );
}
