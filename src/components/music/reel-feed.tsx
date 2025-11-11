
"use client";

import React, { useEffect, useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { type EmblaOptionsType } from 'embla-carousel';
import { MusicReel } from './music-reel';
import { useMusicPlayer } from '@/context/music-player-context';

const OPTIONS: EmblaOptionsType = {
  axis: 'y',
  loop: true,
  align: 'start',
};

export function ReelFeed() {
  const { playlist, currentSongIndex, playSongAt } = useMusicPlayer();
  // Pass playlist to options to re-init on playlist change
  const [emblaRef, emblaApi] = useEmblaCarousel({ ...OPTIONS, startIndex: currentSongIndex }, [], { playlist });

  useEffect(() => {
    if (!emblaApi) return;
    
    const onSelect = () => {
      const selectedIndex = emblaApi.selectedScrollSnap();
      if (selectedIndex !== currentSongIndex) {
        playSongAt(selectedIndex);
      }
    };

    emblaApi.on('select', onSelect);
    
    // Cleanup
    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi, playSongAt, currentSongIndex]);

  useEffect(() => {
    if (emblaApi && emblaApi.selectedScrollSnap() !== currentSongIndex) {
      emblaApi.scrollTo(currentSongIndex);
    }
  }, [currentSongIndex, emblaApi]);

  if (!playlist || playlist.length === 0) {
    return null;
  }

  return (
    <div className="h-full overflow-hidden" ref={emblaRef}>
      <div className="flex flex-col h-full">
        {playlist.map((song, index) => (
          <div className="relative flex-[0_0_100%] h-full" key={song.id}>
            <MusicReel 
              song={song} 
              isActive={index === currentSongIndex}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
