
"use client";

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Heart, Play, Pause, Shuffle } from 'lucide-react';
import type { Song } from '@/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Waveform } from './waveform';
import { Slider } from '@/components/ui/slider';
import { localAudio } from '@/lib/local-audio-store';

type MusicReelProps = {
  song: Song;
};

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

export function MusicReel({ song }: MusicReelProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLiked, setIsLiked] = useState(song.liked);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // When the component mounts or the song ID changes, get the audio source
  const audioSrc = song.audioSrc || localAudio.get(song.id);

  useEffect(() => {
    if (audioRef.current && audioSrc) {
      if (audioRef.current.src !== audioSrc) {
        audioRef.current.src = audioSrc;
      }
      if (isPlaying) {
        audioRef.current.play().catch(error => console.error("Error playing audio:", error));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, audioSrc]);

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
    console.log("Next song");
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

  const handleSliderChange = (value: number[]) => {
    if (audioRef.current) {
      const newTime = (value[0] / 100) * duration;
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  if (!audioSrc) {
    return (
        <div className="relative h-full w-full flex flex-col items-center justify-center overflow-hidden bg-background">
            <div className="text-center">
                <p className="text-lg text-muted-foreground">Audio for this song is not available on this device.</p>
                <p className="text-sm text-muted-foreground/50">Please re-upload the file.</p>
            </div>
        </div>
    )
  }

  return (
    <div className="relative h-full w-full flex flex-col items-center justify-center overflow-hidden" onClick={() => setIsPlaying(p => !p)}>
      <audio
        ref={audioRef}
        src={audioSrc}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
      />
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
                    isPlaying ? "opacity-0 hover:opacity-100" : "opacity-100"
                )}>
                     <Button
                        variant="ghost"
                        size="icon"
                        className="w-24 h-24 rounded-full text-white"
                        onClick={togglePlay}
                        aria-label={isPlaying ? 'Pause song' : 'Play song'}
                    >
                        {isPlaying ? (
                          <Pause className="w-12 h-12 fill-current" />
                        ) : (
                          <Play className="w-12 h-12 fill-current ml-1" />
                        )}
                    </Button>
                </div>
            </div>
        </div>

        <div className="w-full max-w-md">
            {/* Song Info */}
            <div className='mb-6'>
                <h1 className="text-3xl font-bold tracking-tight">{song.title}</h1>
                <p className="text-lg text-muted-foreground mt-1">{song.artist}</p>
            </div>

            {/* Duration Slider */}
            <div className='mb-6 w-full' onClick={(e) => e.stopPropagation()}>
                <Slider 
                    value={[progress]} 
                    max={100} 
                    step={1} 
                    className="w-full"
                    onValueChange={handleSliderChange}
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1.5">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                </div>
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
