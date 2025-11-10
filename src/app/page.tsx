"use client";

import { useMemo } from 'react';
import { useCollection, useUser, useFirestore, useMemoFirebase } from "@/firebase";
import { collection } from 'firebase/firestore';
import { ReelFeed } from '@/components/music/reel-feed';
import type { Song } from '@/types';
import { useSearchParams } from 'next/navigation';

export default function HomePage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const searchParams = useSearchParams();
  const songId = searchParams.get('songId');

  const songsCollection = useMemoFirebase(() => {
    if (!user) return null;
    return collection(firestore, `users/${user.uid}/songs`);
  }, [firestore, user]);

  const { data: allSongs, isLoading: areSongsLoading } = useCollection<Song>(songsCollection);

  const songs = useMemo(() => {
    if (!allSongs) return [];

    let songs: Song[] = [...allSongs];
    if (songId) {
      const selectedSongIndex = songs.findIndex(song => song.id === songId);
      if (selectedSongIndex > -1) {
        const selectedSong = songs.splice(selectedSongIndex, 1)[0];
        songs.unshift(selectedSong);
      }
    }
    return songs;
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
    <div className="h-screen w-full">
       {songs && songs.length > 0 ? (
        <ReelFeed songs={songs} />
      ) : (
        <div className="h-screen w-full flex items-center justify-center">
          <p>No songs in your library. Upload some songs to get started!</p>
        </div>
      )}
    </div>
  );
}
