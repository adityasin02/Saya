"use client";

import React from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { type EmblaOptionsType } from 'embla-carousel';
import { MusicReel } from './music-reel';
import type { Song } from '@/types';
import { localAudio } from '@/lib/local-audio-store';

const OPTIONS: EmblaOptionsType = {
  axis: 'y',
  loop: true,
  align: 'start',
};

export function ReelFeed({ songs }: { songs: Song[] }) {
  const [emblaRef, emblaApi] = useEmblaCarousel(OPTIONS);

  const handleNext = React.useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  if (!songs || songs.length === 0) {
    return null;
  }

  return (
    <div className="h-full overflow-hidden" ref={emblaRef}>
      <div className="flex flex-col h-full">
        {songs.map((song, index) => (
          <div className="relative flex-[0_0_100%] h-full" key={song.id}>
            <MusicReel 
              song={song} 
              isActive={index === emblaApi?.selectedScrollSnap()}
              onNext={handleNext}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
