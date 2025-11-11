
"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { Heart, Play, Pause, ListMusic } from 'lucide-react';
import type { Song } from '@/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Waveform } from './waveform';
import { Slider } from '@/components/ui/slider';
import { useMusicPlayer } from '@/context/music-player-context';
import { Music } from 'lucide-react';

type MusicReelProps = {
  song: Song;
  isActive: boolean;
};

function formatTime(seconds: number) {
  if (isNaN(seconds)) return '0:00';
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

export function MusicReel({ song, isActive }: MusicReelProps) {
    const { 
        currentSong,
        isPlaying, 
        progress,
        duration,
        currentTime,
        togglePlayPause,
        seek,
        playNext,
        toggleLike
    } = useMusicPlayer();

    // Local state to manage whether the user is actively sliding
    const [isSeeking, setIsSeeking] = useState(false);
    
    // When user releases the slider, perform the seek and sync states
    const handleSliderCommit = (value: number[]) => {
      seek(value[0]);
      setIsSeeking(false);
    };

    const displaySong = isActive ? currentSong : song;

    if (!displaySong) return null;

    const audioSrc = displaySong.audioSrc;
    const isLiked = displaySong.liked;

    if (!audioSrc && isActive) {
      return (
          <div className="relative h-full w-full flex flex-col items-center justify-center overflow-hidden bg-background text-center p-8">
               <Music className="w-16 h-16 text-muted-foreground/50 mb-4" />
              <h2 className="text-xl font-semibold text-muted-foreground">Audio Not Available on this Device</h2>
              <p className="text-sm text-muted-foreground/70 mt-2 max-w-sm">
                  This app plays music directly from your device. The audio for "{displaySong.title}" needs to be re-selected to play. This happens if you've refreshed the page or are on a new device.
              </p>
          </div>
      )
    }

  return (
    <div className="relative h-full w-full flex flex-col items-center justify-center overflow-hidden" onClick={togglePlayPause}>
      <div className="absolute inset-0 z-0">
        <Image
          src={displaySong.albumArt}
          alt={`Background for ${displaySong.title}`}
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
                    src={displaySong.albumArt}
                    alt={`Album art for ${displaySong.title}`}
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
            <div className='mb-6'>
                <h1 className="text-3xl font-bold tracking-tight">{displaySong.title}</h1>
                <p className="text-lg text-muted-foreground mt-1">{displaySong.artist}</p>
            </div>

            <div className="flex items-center justify-between w-full mb-4">
              <div className='flex items-center gap-4'>
                <Button
                    variant="ghost"
                    size="icon"
                    className="w-16 h-16 rounded-full"
                    onClick={(e) => {
                        e.stopPropagation();
                        togglePlayPause();
                    }}
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
                    onClick={(e) => {
                        e.stopPropagation();
                        toggleLike();
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
              </div>
            
              <Button
                  variant="ghost"
                  size="icon"
                  className="w-16 h-16 rounded-full"
                  onClick={(e) => {
                      e.stopPropagation();
                      playNext();
                  }}
                  aria-label="Shuffle/Next"
              >
                  <ListMusic className="w-7 h-7 text-foreground" />
              </Button>
            </div>

            <div className='w-full' onClick={(e) => e.stopPropagation()}>
                <Slider 
                    value={isActive && !isSeeking ? [progress] : undefined}
                    defaultValue={[isActive ? progress : 0]}
                    max={100} 
                    step={1} 
                    className="w-full"
                    onValueChange={() => setIsSeeking(true)}
                    onValueCommit={handleSliderCommit}
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1.5">
                    <span>{formatTime(isActive ? currentTime : 0)}</span>
                    <span>{formatTime(isActive ? duration : 0)}</span>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
