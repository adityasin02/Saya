
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import useEmblaCarousel, { type EmblaAPI } from 'embla-carousel-react';
import { type EmblaOptionsType } from 'embla-carousel';
import { type Song } from '@/types';
import { MusicReel } from './music-reel';

type ReelFeedProps = {
  songs: Song[];
};

const OPTIONS: EmblaOptionsType = {
  axis: 'y',
  loop: true,
  align: 'start',
};

export function ReelFeed({ songs }: ReelFeedProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel(OPTIONS);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const onSelect = useCallback((emblaApi: EmblaAPI) => {
    setActiveIndex(emblaApi.selectedScrollSnap());
    setIsPlaying(true); // Autoplay on swipe
  }, []);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on('select', onSelect);
    // Set initial active index
    setActiveIndex(emblaApi.selectedScrollSnap());
    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi, onSelect]);

  const handlePlayPause = (playing: boolean) => {
    setIsPlaying(playing);
  };

  const handleNext = useCallback(() => {
    emblaApi?.scrollNext();
  }, [emblaApi]);

  return (
    <div className="h-full overflow-hidden" ref={emblaRef}>
      <div className="flex flex-col h-full">
        {songs.map((song, index) => (
          <div className="relative flex-[0_0_100%] h-full" key={song.id}>
            <MusicReel 
              song={song} 
              isPlaying={isPlaying}
              isActive={index === activeIndex}
              onPlayPause={handlePlayPause}
              onNext={handleNext}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
