import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import type { Song } from "@/types";

export function FavoritesGrid({ songs }: { songs: Song[] }) {
  if (!songs.length) {
    return (
      <div className="flex items-center justify-center h-64 border border-dashed rounded-lg">
        <p className="text-muted-foreground">You haven't liked any songs yet.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {songs.map((song) => (
        <Card key={song.id} className="overflow-hidden group border-none shadow-md">
          <CardContent className="p-0 relative">
            <Image
              src={song.albumArt}
              alt={song.album}
              width={200}
              height={200}
              className="w-full aspect-square object-cover transition-transform group-hover:scale-105"
              data-ai-hint="album art"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
               <h3 className="font-semibold text-sm text-primary-foreground truncate">{song.title}</h3>
               <p className="text-xs text-gray-300 truncate">{song.artist}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
