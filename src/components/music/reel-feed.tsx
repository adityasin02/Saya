"use client";

import React, { useEffect } from 'react';
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
  const [emblaRef, emblaApi] = useEmblaCarousel({ ...OPTIONS, startIndex: currentSongIndex });

  useEffect(() => {
    if (!emblaApi) return;
    
    const onSelect = () => {
      playSongAt(emblaApi.selectedScrollSnap());
    };

    emblaApi.on('select', onSelect);

    // This is the cleanup function that runs when the component unmounts.
    // It is essential that this function does NOT call pause() or any other
    // function that would interrupt playback when navigating away.
    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi, playSongAt]);

  useEffect(() => {
    if (emblaApi && emblaApi.selectedScrollSnap() !== currentSongIndex) {
      emblaApi.scrollTo(currentSongIndex, true); // Use instant scroll to avoid animation conflicts
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
