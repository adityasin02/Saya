"use client";

import { useMemo } from "react";
import { useCollection, useUser, useFirestore, useMemoFirebase } from "@/firebase";
import { collection } from "firebase/firestore";
import { SongTable } from "@/components/music/song-table";
import { AiPlaylistButton } from "@/components/music/ai-playlist-button";
import type { Song } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";

export default function FavoritesPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const songsCollection = useMemoFirebase(() => {
    if (!user) return null;
    return collection(firestore, `users/${user.uid}/songs`);
  }, [firestore, user]);

  const { data: allSongs, isLoading: areSongsLoading } = useCollection<Song>(songsCollection);

  const likedSongs = useMemo(() => {
    if (!allSongs) return [];
    return allSongs.filter((song) => song.liked);
  }, [allSongs]);

  const isLoading = isUserLoading || areSongsLoading;

  return (
    <div className="container mx-auto py-8 px-4 pb-24">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-bold">Favorites</h1>
        {likedSongs && likedSongs.length > 0 && <AiPlaylistButton likedSongs={likedSongs.map(s => s.title)} />}
      </div>
      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : likedSongs && likedSongs.length > 0 ? (
        <SongTable songs={likedSongs} />
      ) : (
        <div className="flex items-center justify-center h-64 border border-dashed rounded-lg">
          <p className="text-muted-foreground">You haven't liked any songs yet.</p>
        </div>
      )}
    </div>
  );
}
