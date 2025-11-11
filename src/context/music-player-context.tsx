
"use client";

import React, { createContext, useContext, useState, useEffect, useRef, useCallback, ReactNode } from 'react';
import type { Song } from '@/types';
import { localAudio } from '@/lib/local-audio-store';
import { useUser, useFirestore } from '@/firebase';
import { updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

interface MusicPlayerContextType {
  playlist: Song[];
  currentSong: Song | null;
  currentSongIndex: number;
  isPlaying: boolean;
  progress: number;
  duration: number;
  currentTime: number;
  setPlaylist: (songs: Song[], startIndex?: number) => void;
  playSongAt: (index: number) => void;
  togglePlayPause: () => void;
  playNext: () => void;
  playPrevious: () => void;
  seek: (percentage: number) => void;
  toggleLike: () => void;
}

const MusicPlayerContext = createContext<MusicPlayerContextType | undefined>(undefined);

export function MusicPlayerProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playlist, setPlaylistState] = useState<Song[]>([]);
  const [currentSongIndex, setCurrentSongIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const currentSong = playlist[currentSongIndex] || null;

  useEffect(() => {
    const audio = audioRef.current = new Audio();
    audio.volume = 0.7;

    const handleTimeUpdate = () => {
      if (!audio.seeking) {
        setCurrentTime(audio.currentTime);
        setDuration(audio.duration);
        setProgress(audio.duration > 0 ? (audio.currentTime / audio.duration) * 100 : 0);
      }
    };

    const handleEnded = () => playNext();

    const handleCanPlay = () => {
        if (isPlaying) {
            audio.play().catch(e => console.error("Error playing audio on canplay:", e));
        }
    }

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('canplay', handleCanPlay);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.pause();
    };
  }, []);

  const playNext = useCallback(() => {
    setCurrentSongIndex((prevIndex) => (prevIndex + 1) % playlist.length);
    setIsPlaying(true);
  }, [playlist.length]);
  
  useEffect(() => {
    if (currentSong && audioRef.current) {
        const audioSrc = localAudio.get(currentSong.id);
        
        // Only change src if it's different to prevent re-loading the same audio
        if (audioSrc && audioRef.current.src !== audioSrc) {
            audioRef.current.src = audioSrc;
            // The 'canplay' event will handle playing if isPlaying is true.
        } else if (!audioSrc) {
            audioRef.current.src = ''; // Clear src if not available
            audioRef.current.pause();
        }
        
        if (isPlaying && audioSrc) {
            // Check if ready to play, otherwise the 'canplay' event will handle it
            if (audioRef.current.readyState >= 2) { // HAVE_CURRENT_DATA or more
                audioRef.current.play().catch(e => console.error("Error playing audio:", e));
            }
        } else {
            audioRef.current.pause();
        }
    } else if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
    }
  }, [currentSong, isPlaying]);

  const setPlaylist = (songs: Song[], startIndex = 0) => {
    setPlaylistState(songs.map(s => ({...s, audioSrc: localAudio.get(s.id)})));
    setCurrentSongIndex(startIndex);
    setIsPlaying(false);
  };

  const playSongAt = (index: number) => {
    if (index >= 0 && index < playlist.length) {
      if (index === currentSongIndex) {
        // If it's the same song, just toggle play/pause
        togglePlayPause();
      } else {
        // If it's a new song, switch to it and start playing
        setCurrentSongIndex(index);
        setIsPlaying(true);
      }
    }
  };

  const togglePlayPause = () => {
    if(currentSong && !localAudio.get(currentSong.id)) return;
    setIsPlaying(prev => !prev);
  };

  const playPrevious = () => {
    setCurrentSongIndex((prevIndex) => (prevIndex - 1 + playlist.length) % playlist.length);
    setIsPlaying(true);
  };

  const seek = (percentage: number) => {
    if (audioRef.current && isFinite(duration) && duration > 0) {
      audioRef.current.currentTime = (percentage / 100) * duration;
    }
  };

  const toggleLike = useCallback(() => {
    if (!user || !firestore || !currentSong) return;

    const newLikedStatus = !currentSong.liked;
    
    // Update UI immediately
    const updatedPlaylist = [...playlist];
    updatedPlaylist[currentSongIndex] = { ...currentSong, liked: newLikedStatus };
    setPlaylistState(updatedPlaylist);

    // Update Firestore in the background
    const songRef = doc(firestore, `users/${user.uid}/songs/${currentSong.id}`);
    updateDocumentNonBlocking(songRef, { liked: newLikedStatus });
    
    toast({
        title: newLikedStatus ? "Added to Favorites" : "Removed from Favorites",
        description: `"${currentSong.title}" has been updated.`,
    });
  }, [user, firestore, currentSong, playlist, currentSongIndex, toast]);

  const value: MusicPlayerContextType = {
    playlist,
    currentSong,
    currentSongIndex,
    isPlaying,
    progress,
    duration,
    currentTime,
    setPlaylist,
    playSongAt,
    togglePlayPause,
    playNext,
    playPrevious,
    seek,
    toggleLike
  };

  return <MusicPlayerContext.Provider value={value}>{children}</MusicPlayerContext.Provider>;
}

export const useMusicPlayer = (): MusicPlayerContextType => {
  const context = useContext(MusicPlayerContext);
  if (context === undefined) {
    throw new Error('useMusicPlayer must be used within a MusicPlayerProvider');
  }
  return context;
};
