"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { SuggestPlaylistOutput } from "@/ai/flows/ai-playlist-suggestion";
import { ListMusic, Save, Quote } from "lucide-react";

type AiPlaylistDialogProps = {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    playlist: SuggestPlaylistOutput;
};

export function AiPlaylistDialog({ isOpen, setIsOpen, playlist }: AiPlaylistDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-2xl text-primary">{playlist.playlistName}</DialogTitle>
          <DialogDescription className="flex items-start gap-2 pt-2">
            <Quote className="w-4 h-4 mt-1 flex-shrink-0" />
            <span>{playlist.vibeDescription}</span>
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
            <h4 className="font-semibold mb-2 flex items-center gap-2"><ListMusic className="w-4 h-4" /> Tracklist</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
                {playlist.songOrder.map((song, index) => (
                    <li key={index} className="flex items-center">
                        <span className="w-6 text-right mr-2">{index + 1}.</span>
                        <span>{song}</span>
                    </li>
                ))}
            </ul>
        </div>
        <DialogFooter>
          <Button onClick={() => setIsOpen(false)}>
            <Save className="mr-2 h-4 w-4" /> Save Playlist
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
