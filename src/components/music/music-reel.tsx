"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { Heart, Play, Pause, Shuffle } from 'lucide-react';
import type { Song } from '@/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Waveform } from './waveform';

type MusicReelProps = {
  song: Song;
};

export function MusicReel({ song }: MusicReelProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLiked, setIsLiked] = useState(song.liked);

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPlaying(!isPlaying);
  };
  const toggleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
  };
  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    // In a real app, this would trigger the carousel to go to the next slide
    console.log("Next song");
  }

  return (
    <div className="relative h-full w-full flex flex-col items-center justify-center overflow-hidden" onClick={() => setIsPlaying(p => !p)}>
      {/* Background Gradient */}
      <div className="absolute inset-0 z-0">
        <Image
          src={song.albumArt}
          alt={`Background for ${song.title}`}
          fill
          className="object-cover blur-3xl scale-125 opacity-30"
          data-ai-hint="abstract background"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />
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
                    isPlaying ? "opacity-100" : "opacity-0"
                )}>
                    <Waveform />
                </div>
                <div className={cn(
                    "absolute inset-0 rounded-full bg-black/40 flex items-center justify-center transition-opacity duration-300",
                    isPlaying ? "opacity-0 group-hover:opacity-100" : "opacity-100"
                )}>
                     <Button
                        variant="ghost"
                        size="icon"
                        className="w-24 h-24 rounded-full text-white"
                        onClick={togglePlay}
                        aria-label='Play song'
                    >
                        <Play className="w-12 h-12 fill-current ml-1" />
                    </Button>
                </div>
            </div>
        </div>

        <div className="w-full max-w-md">
            {/* Song Info */}
            <div className='mb-8'>
                <h1 className="text-3xl font-bold tracking-tight">{song.title}</h1>
                <p className="text-lg text-muted-foreground mt-1">{song.artist}</p>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between w-full">
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
            
            <Button
                variant="ghost"
                size="icon"
                className="w-16 h-16 rounded-full"
                onClick={handleNext}
                aria-label="Shuffle/Next"
            >
                <Shuffle className="w-8 h-8 text-foreground" />
            </Button>
            </div>
        </div>
      </div>
    </div>
  );
}
