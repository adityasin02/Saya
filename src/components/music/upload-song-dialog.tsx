"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Song } from "@/types";

type UploadSongDialogProps = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onSongAdded: (song: Song) => void;
};

export function UploadSongDialog({ isOpen, setIsOpen, onSongAdded }: UploadSongDialogProps) {
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [album, setAlbum] = useState("");
  const [albumArt, setAlbumArt] = useState<File | null>(null);
  const [audioSrc, setAudioSrc] = useState<File | null>(null);

  const handleSubmit = () => {
    if (!title || !artist || !album || !albumArt || !audioSrc) {
      // Basic validation
      alert("Please fill out all fields.");
      return;
    }

    const newSong: Song = {
      id: new Date().getTime().toString(),
      title,
      artist,
      album,
      albumArt: URL.createObjectURL(albumArt),
      audioSrc: URL.createObjectURL(audioSrc),
      liked: false,
    };

    onSongAdded(newSong);
    setIsOpen(false);
    // Reset form
    setTitle("");
    setArtist("");
    setAlbum("");
    setAlbumArt(null);
    setAudioSrc(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Upload Song</DialogTitle>
          <DialogDescription>
            Add a new song to your library. Fill in the details below.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">
              Title
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="artist" className="text-right">
              Artist
            </Label>
            <Input
              id="artist"
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="album" className="text-right">
              Album
            </Label>
            <Input
              id="album"
              value={album}
              onChange={(e) => setAlbum(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="album-art" className="text-right">
              Album Art
            </Label>
            <Input
              id="album-art"
              type="file"
              accept="image/*"
              onChange={(e) => setAlbumArt(e.target.files?.[0] || null)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="audio-file" className="text-right">
              Audio File
            </Label>
            <Input
              id="audio-file"
              type="file"
              accept="audio/*"
              onChange={(e) => setAudioSrc(e.target.files?.[0] || null)}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleSubmit}>Upload</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
