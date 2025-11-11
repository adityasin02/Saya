'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Heart, Play, Pause, ListMusic, Music, SkipForward } from 'lucide-react';
import type { Song } from '@/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Waveform } from './waveform';
import { Slider } from '@/components/ui/slider';
import { useUser, useFirestore } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useToast } from '@/hooks/use-toast';
import { localAudio } from '@/lib/local-audio-store';

type MusicReelProps = {
  song: Song;
  isActive: boolean;
  onNext: () => void;
};

function formatTime(seconds: number) {
  if (isNaN(seconds)) return '0:00';
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

export function MusicReel({ song, isActive, onNext }: MusicReelProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isLiked, setIsLiked] = useState(song.liked);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const togglePlayPause = useCallback(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(e => console.error('Error playing audio:', e));
      setIsPlaying(true);
    }
  }, [isPlaying]);

  useEffect(() => {
    if (isActive) {
      const audioSrc = localAudio.get(song.id);
      if (audioSrc && audioRef.current) {
        if (audioRef.current.src !== audioSrc) {
          audioRef.current.src = audioSrc;
        }
        audioRef.current.play().catch(e => console.error('Audio play failed', e));
        setIsPlaying(true);
      } else {
        setIsPlaying(false);
      }
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      setIsPlaying(false);
    }
  }, [isActive, song.id]);

  useEffect(() => {
    const audio = (audioRef.current = new Audio());
    audio.volume = 0.7; // Example volume

    const updateProgress = () => {
      if (audio.duration > 0) {
        setCurrentTime(audio.currentTime);
        setDuration(audio.duration);
        setProgress((audio.currentTime / audio.duration) * 100);
      }
    };
    const handleSongEnd = () => onNext();

    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('ended', handleSongEnd);
    audio.addEventListener('canplay', () => {
        setDuration(audio.duration);
        if (isActive) {
            audio.play().catch(e => console.error('Audio play failed on canplay', e));
            setIsPlaying(true);
        }
    });

    return () => {
      audio.removeEventListener('timeupdate', updateProgress);
      audio.removeEventListener('ended', handleSongEnd);
      // eslint-disable-next-line react-hooks/exhaustive-deps
      audio.removeEventListener('canplay', () => setDuration(audio.duration));
      audio.pause();
      audio.src = '';
    };
  }, [onNext, isActive]);

  const handleSeek = (value: number[]) => {
    if (audioRef.current && isFinite(audioRef.current.duration)) {
      const newTime = (value[0] / 100) * audioRef.current.duration;
      audioRef.current.currentTime = newTime;
      setProgress(value[0]);
    }
  };

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user || !firestore) return;

    const newLikedStatus = !isLiked;
    setIsLiked(newLikedStatus);

    const songRef = doc(firestore, `users/${user.uid}/songs/${song.id}`);
    updateDocumentNonBlocking(songRef, { liked: newLikedStatus });

    toast({
      title: newLikedStatus ? 'Added to Favorites' : 'Removed from Favorites',
      description: `"${song.title}" has been updated.`,
    });
  };

  const audioSrc = localAudio.get(song.id);

  if (!audioSrc && isActive) {
    return (
      <div className="relative h-full w-full flex flex-col items-center justify-center overflow-hidden bg-background text-center p-8">
        <Music className="w-16 h-16 text-muted-foreground/50 mb-4" />
        <h2 className="text-xl font-semibold text-muted-foreground">Audio Not Available on this Device</h2>
        <p className="text-sm text-muted-foreground/70 mt-2 max-w-sm">
          This app plays music directly from your device. The audio for "{song.title}" needs to be re-selected to
          play. This happens if you've refreshed the page or are on a new device.
        </p>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full flex flex-col items-center justify-center overflow-hidden" onClick={togglePlayPause}>
      <div className="absolute inset-0 z-0">
        <Image
          src={song.albumArt}
          alt={`Background for ${song.title}`}
          fill
          className="object-cover"
          data-ai-hint="album art"
        />
        <div className="absolute inset-0 bg-black/60 bg-gradient-to-b from-black/30 via-black/50 to-black/80" />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center text-center text-foreground w-full h-full p-8 pb-24">
        <div className="flex-1 flex items-center justify-center">
          <div className="relative w-64 h-64 md:w-80 md:h-80">
            <Image
              src={song.albumArt}
              alt={`Album art for ${song.title}`}
              width={320}
              height={320}
              className="rounded-full object-cover shadow-2xl aspect-square"
              data-ai-hint="album art"
            />
            <div
              className={cn(
                'absolute inset-0 flex items-center justify-center transition-opacity duration-500',
                isPlaying && isActive ? 'opacity-100' : 'opacity-0'
              )}
            >
              <Waveform />
            </div>
          </div>
        </div>

        <div className="w-full max-w-md">
          <div className="mb-6">
            <h1 className="text-3xl font-bold tracking-tight">{song.title}</h1>
            <p className="text-lg text-muted-foreground mt-1">{song.artist}</p>
          </div>

          <div className="flex items-center justify-between w-full mb-4">
            <Button
              variant="ghost"
              size="icon"
              className="w-16 h-16 rounded-full"
              onClick={e => {
                e.stopPropagation();
                handleLike(e);
              }}
              aria-label="Like song"
            >
              <Heart
                className={cn(
                  'w-8 h-8 transition-all',
                  isLiked ? 'text-primary fill-current' : 'text-foreground'
                )}
              />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="w-20 h-20 rounded-full bg-foreground/10"
              onClick={e => {
                e.stopPropagation();
                togglePlayPause();
              }}
              aria-label={isPlaying ? 'Pause song' : 'Play song'}
            >
              {isPlaying ? (
                <Pause className="w-10 h-10 fill-current" />
              ) : (
                <Play className="w-10 h-10 fill-current ml-1" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="w-16 h-16 rounded-full"
              onClick={e => {
                e.stopPropagation();
                onNext();
              }}
              aria-label="Shuffle/Next"
            >
              <SkipForward className="w-7 h-7 text-foreground" />
            </Button>
          </div>

          <div className="w-full" onClick={e => e.stopPropagation()}>
            <Slider value={[progress]} max={100} step={1} className="w-full" onValueChange={handleSeek} />
            <div className="flex justify-between text-xs text-muted-foreground mt-1.5">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
