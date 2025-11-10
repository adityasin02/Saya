"use client";

import React from 'react';
import useEmblaCarousel from 'embla-carousel-react';
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
  const [emblaRef] = useEmblaCarousel(OPTIONS);

  return (
    <div className="h-full overflow-hidden" ref={emblaRef}>
      <div className="flex flex-col h-full">
        {songs.map((song) => (
          <div className="relative flex-[0_0_100%] h-full" key={song.id}>
            <MusicReel song={song} />
          </div>
        ))}
      </div>
    </div>
  );
}
