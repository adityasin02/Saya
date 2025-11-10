"use client";

import { useMemo } from "react";
import { useCollection, useUser, useFirestore, useMemoFirebase } from "@/firebase";
import { collection } from "firebase/firestore";
import { SongTable } from "@/components/music/song-table";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import type { Song } from "@/types";
import { UploadSongButton } from "@/components/music/upload-song-button";
import { Skeleton } from "@/components/ui/skeleton";

export default function LibraryPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const songsCollection = useMemoFirebase(() => {
    if (!user) return null;
    return collection(firestore, `users/${user.uid}/songs`);
  }, [firestore, user]);

  const { data: songs, isLoading: areSongsLoading } = useCollection<Song>(songsCollection);

  const isLoading = isUserLoading || areSongsLoading;

  return (
    <div className="container mx-auto py-8 px-4 pb-24">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-bold">Library</h1>
        <div className="flex gap-2">
          {user && <UploadSongButton userId={user.uid} />}
          <Button variant="outline">
            <Sparkles className="mr-2 h-4 w-4" /> AI Playlist
          </Button>
        </div>
      </div>
      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : (
        <SongTable songs={songs ?? []} />
      )}
    </div>
  );
}
