"use client";

import { useMemo, useState } from 'react';
import { useCollection, useUser, useFirestore, useMemoFirebase } from "@/firebase";
import { collection } from 'firebase/firestore';
import { ReelFeed } from '@/components/music/reel-feed';
import type { Song } from '@/types';
import { useSearchParams } from 'next/navigation';
import { UploadSongButton } from '@/components/music/upload-song-button';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { UploadSongDialog } from "@/components/music/upload-song-dialog";

export default function HomePage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const searchParams = useSearchParams();
  const songId = searchParams.get('songId');
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);

  const songsCollection = useMemoFirebase(() => {
    if (!user) return null;
    return collection(firestore, `users/${user.uid}/songs`);
  }, [firestore, user]);

  const { data: allSongs, isLoading: areSongsLoading } = useCollection<Song>(songsCollection);

  const songs = useMemo(() => {
    if (!allSongs) return [];
    let initialSongs = allSongs.map(s => ({...s, audioSrc: ''}));

    if (songId) {
      const selectedSongIndex = initialSongs.findIndex(song => song.id === songId);
      if (selectedSongIndex > -1) {
        const selectedSong = initialSongs.splice(selectedSongIndex, 1)[0];
        initialSongs.unshift(selectedSong);
      }
    }
    return initialSongs;
  }, [allSongs, songId]);


  const isLoading = isUserLoading || areSongsLoading;

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <p>Loading your music...</p>
      </div>
    );
  }

  return (
    <div className="h-screen w-full relative">
       {songs && songs.length > 0 ? (
        <ReelFeed songs={songs} />
      ) : (
        <div className="h-screen w-full flex flex-col items-center justify-center text-center p-4">
          <p className="text-lg mb-4">No songs in your library yet.</p>
          {user && <UploadSongButton userId={user.uid} />}
        </div>
      )}
       {user && songs && songs.length > 0 && (
        <>
          <Button
            className="fixed bottom-24 right-4 z-50 h-14 w-14 rounded-full shadow-lg"
            size="icon"
            onClick={() => setIsUploadDialogOpen(true)}
            aria-label="Upload song"
          >
            <Plus className="h-6 w-6" />
          </Button>
          <UploadSongDialog
            userId={user.uid}
            isOpen={isUploadDialogOpen}
            setIsOpen={setIsUploadDialogOpen}
          />
        </>
      )}
    </div>
  );
}
