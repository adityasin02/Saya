"use client";

import Image from "next/image";
import { Play, Pause, Forward } from "lucide-react";
import { useMusicPlayer } from "@/context/music-player-context";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";

export function MiniPlayer() {
  const {
    currentSong,
    isPlaying,
    progress,
    togglePlayPause,
    playNext,
  } = useMusicPlayer();
  const router = useRouter();

  if (!currentSong) {
    return null;
  }

  const handlePlayerClick = () => {
    router.push(`/?songId=${currentSong.id}`);
  };

  return (
    <div
      className="fixed bottom-16 left-0 right-0 z-50 bg-background/80 backdrop-blur-md"
      onClick={handlePlayerClick}
    >
      <div className="max-w-lg mx-auto h-16 flex items-center justify-between px-4 cursor-pointer">
        <div className="flex items-center gap-3">
          <Image
            src={currentSong.albumArt}
            alt={currentSong.album}
            width={40}
            height={40}
            className="rounded"
            data-ai-hint="album art"
          />
          <div>
            <p className="font-semibold text-sm truncate">{currentSong.title}</p>
            <p className="text-xs text-muted-foreground truncate">
              {currentSong.artist}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              togglePlayPause();
            }}
          >
            {isPlaying ? (
              <Pause className="h-6 w-6" />
            ) : (
              <Play className="h-6 w-6" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              playNext();
            }}
          >
            <Forward className="h-6 w-6" />
          </Button>
        </div>
      </div>
      <div
        className="absolute bottom-0 left-0 h-0.5 bg-primary"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
