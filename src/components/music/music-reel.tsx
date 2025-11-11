
"use client";

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Heart, Play, Pause, Shuffle, Music, ListMusic } from 'lucide-react';
import type { Song } from '@/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Waveform } from './waveform';
import { Slider } from '@/components/ui/slider';
import { localAudio } from '@/lib/local-audio-store';
import { useUser, useFirestore } from '@/firebase';
import { doc } from 'firebase/firestore';
import { updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useToast } from '@/hooks/use-toast';

type MusicReelProps = {
  song: Song;
  isPlaying: boolean;
  isActive: boolean;
  onPlayPause: (playing: boolean) => void;
  onNext: () => void;
};

function formatTime(seconds: number) {
  if (isNaN(seconds)) return '0:00';
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

export function MusicReel({ song, isPlaying, isActive, onPlayPause, onNext }: MusicReelProps) {
  const [isLiked, setIsLiked] = useState(song.liked);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioSrc = song.audioSrc || localAudio.get(song.id);
  
  useEffect(() => {
    setIsLiked(song.liked);
  }, [song.liked]);

  useEffect(() => {
    if (audioRef.current && audioSrc) {
      if (audioRef.current.src !== audioSrc) {
        audioRef.current.src = audioSrc;
      }
    }
  }, [audioSrc]);

  useEffect(() => {
    if (isActive) {
      if (isPlaying) {
        audioRef.current?.play().catch(error => console.error("Error playing audio:", error));
      } else {
        audioRef.current?.pause();
      }
    } else {
      audioRef.current?.pause();
      if(audioRef.current) {
        audioRef.current.currentTime = 0;
      }
    }
  }, [isPlaying, isActive]);


  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    onPlayPause(!isPlaying);
  };

  const toggleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user || !firestore) return;

    const newLikedStatus = !isLiked;
    setIsLiked(newLikedStatus);

    const songRef = doc(firestore, `users/${user.uid}/songs/${song.id}`);
    updateDocumentNonBlocking(songRef, { liked: newLikedStatus });
    
    toast({
        title: newLikedStatus ? "Added to Favorites" : "Removed from Favorites",
        description: `"${song.title}" has been updated.`,
    });
  };
  
  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    onNext();
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      setProgress((audioRef.current.currentTime / audioRef.current.duration) * 100);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };
  
  const handleEnded = () => {
    onNext();
  };

  const handleSliderChange = (value: number[]) => {
    if (audioRef.current) {
      const newTime = (value[0] / 100) * duration;
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  if (!audioSrc) {
    return (
        <div className="relative h-full w-full flex flex-col items-center justify-center overflow-hidden bg-background text-center p-8">
             <Music className="w-16 h-16 text-muted-foreground/50 mb-4" />
            <h2 className="text-xl font-semibold text-muted-foreground">Audio Not Available on this Device</h2>
            <p className="text-sm text-muted-foreground/70 mt-2 max-w-sm">
                This app plays music directly from your device. The audio for "{song.title}" needs to be re-selected to play. This happens if you've refreshed the page or are on a new device.
            </p>
        </div>
    )
  }

  return (
    <div className="relative h-full w-full flex flex-col items-center justify-center overflow-hidden" onClick={() => onPlayPause(!isPlaying)}>
      <audio
        ref={audioRef}
        src={audioSrc}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
      />
      {/* Background */}
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
            {/* Album Art & Waveform */}
            <div className="relative w-64 h-64 md:w-80 md:h-80">
                <Image
                    src={song.albumArt}
                    alt={`Album art for ${song.title}`}
                    width={320}
                    height={320}
                    className="rounded-full object-cover shadow-2xl aspect-square"
                    data-ai-hint="album art"
                />
                <div className={cn(
                    "absolute inset-0 flex items-center justify-center transition-opacity duration-500",
                    isPlaying && isActive ? "opacity-100" : "opacity-0"
                )}>
                    <Waveform />
                </div>
            </div>
        </div>

        <div className="w-full max-w-md">
            {/* Song Info */}
            <div className='mb-6'>
                <h1 className="text-3xl font-bold tracking-tight">{song.title}</h1>
                <p className="text-lg text-muted-foreground mt-1">{song.artist}</p>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between w-full mb-4">
              <div className='flex items-center gap-4'>
                <Button
                    variant="ghost"
                    size="icon"
                    className="w-16 h-16 rounded-full"
                    onClick={togglePlay}
                    aria-label={isPlaying ? 'Pause song' : 'Play song'}
                >
                    {isPlaying && isActive ? (
                      <Pause className="w-8 h-8 fill-current" />
                    ) : (
                      <Play className="w-8 h-8 fill-current ml-1" />
                    )}
                </Button>
                 <Button
                    variant="ghost"
                    size="icon"
                    className="w-16 h-16 rounded-full"
                    onClick={toggleLike}
                    aria-label="Like song"
                >
                    <Heart
                    className={cn(
                        'w-8 h-8 transition-all',
                        isLiked ? 'text-primary fill-current' : 'text-foreground'
                    )}
                    />
                </Button>
              </div>
            
              <Button
                  variant="ghost"
                  size="icon"
                  className="w-16 h-16 rounded-full"
                  onClick={handleNext}
                  aria-label="Shuffle/Next"
              >
                  <ListMusic className="w-7 h-7 text-foreground" />
              </Button>
            </div>

            {/* Duration Slider */}
            <div className='w-full' onClick={(e) => e.stopPropagation()}>
                <Slider 
                    value={isActive ? [progress] : [0]}
                    max={100} 
                    step={1} 
                    className="w-full"
                    onValueChange={handleSliderChange}
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1.5">
                    <span>{formatTime(isActive ? currentTime: 0)}</span>
                    <span>{formatTime(duration)}</span>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
