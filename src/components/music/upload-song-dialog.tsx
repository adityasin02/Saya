"use client";

import { useState, useCallback, useMemo } from "react";
import Image from "next/image";
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
import { useFirestore, addDocumentNonBlocking } from "@/firebase";
import { collection, serverTimestamp } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Music, UploadCloud, FileCheck } from "lucide-react";
import jsmediatags from "jsmediatags";
import type { TagType } from "jsmediatags/types";

type UploadSongDialogProps = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  userId: string;
};

type SongDetails = {
  title: string;
  artist: string;
  album: string;
  albumArt: File | null;
  audioSrc: File | null;
};

export function UploadSongDialog({ isOpen, setIsOpen, userId }: UploadSongDialogProps) {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [songDetails, setSongDetails] = useState<SongDetails | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const resetState = useCallback(() => {
    setSongDetails(null);
    setIsParsing(false);
    setIsUploading(false);
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    resetState();
    setIsParsing(true);

    jsmediatags.read(file, {
      onSuccess: (tag: TagType) => {
        const { title, artist, album, picture } = tag.tags;
        let albumArtFile = null;

        if (picture) {
          const { data, format } = picture;
          const blob = new Blob([new Uint8Array(data)], { type: format });
          albumArtFile = new File([blob], "album-art.jpg", { type: format });
        }

        setSongDetails({
          title: title || "Unknown Title",
          artist: artist || "Unknown Artist",
          album: album || "Unknown Album",
          albumArt: albumArtFile,
          audioSrc: file,
        });
        setIsParsing(false);
      },
      onError: (error) => {
        console.error("Error reading media tags:", error);
        toast({
          title: "Metadata Error",
          description: "Could not read metadata from the audio file. Please enter details manually.",
          variant: "destructive",
        });
        // Fallback for files with no tags
        setSongDetails({
            title: file.name.replace(/\.[^/.]+$/, ""),
            artist: "Unknown Artist",
            album: "Unknown Album",
            albumArt: null,
            audioSrc: file,
        });
        setIsParsing(false);
      },
    });
  };

  const handleDetailChange = (field: keyof SongDetails, value: string) => {
    if (songDetails) {
      setSongDetails({ ...songDetails, [field]: value });
    }
  };

  const handleAlbumArtChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (songDetails && e.target.files?.[0]) {
      setSongDetails({ ...songDetails, albumArt: e.target.files[0] });
    }
  };

  const handleSubmit = async () => {
    if (!songDetails || !songDetails.audioSrc) {
      toast({
        title: "No Song Selected",
        description: "Please select an audio file to upload.",
        variant: "destructive",
      });
      return;
    }
    
    // In a real app, you must handle file uploads to a storage service (e.g., Firebase Storage)
    // and get back URLs. For this demo, we're using object URLs which are temporary.
    if (!songDetails.albumArt) {
       toast({
        title: "Missing Album Art",
        description: "Please add an album art image.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    const newSong = {
      title: songDetails.title,
      artist: songDetails.artist,
      album: songDetails.album,
      albumArt: URL.createObjectURL(songDetails.albumArt),
      audioSrc: URL.createObjectURL(songDetails.audioSrc),
      liked: false,
      dateAdded: serverTimestamp(),
      playCount: 0,
    };

    try {
      const songsCollection = collection(firestore, `users/${userId}/songs`);
      await addDocumentNonBlocking(songsCollection, newSong);

      toast({
        title: "Song Uploaded!",
        description: `${newSong.title} has been added to your library.`,
      });
      
      setIsOpen(false);
      resetState();
    } catch (error) {
      console.error("Error uploading song:", error);
      toast({
        title: "Upload Failed",
        description: "There was an error saving your song. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const albumArtUrl = useMemo(() => {
    if (songDetails?.albumArt) {
      return URL.createObjectURL(songDetails.albumArt);
    }
    return null;
  }, [songDetails?.albumArt]);

  const handleDialogClose = (open: boolean) => {
    if (!open) {
      resetState();
    }
    setIsOpen(open);
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Song</DialogTitle>
          <DialogDescription>
            Select an audio file from your device. Details will be auto-filled if available.
          </DialogDescription>
        </DialogHeader>

        {!songDetails && (
          <div className="py-8">
            <Label htmlFor="audio-file-input" className="mx-auto flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-muted/50">
              <div className="flex flex-col items-center justify-center pt-5 pb-6 text-muted-foreground">
                {isParsing ? (
                  <>
                    <Loader2 className="w-10 h-10 mb-3 animate-spin" />
                    <p className="mb-2 text-sm">Parsing file...</p>
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-10 h-10 mb-3" />
                    <p className="mb-2 text-sm"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                    <p className="text-xs">MP3, FLAC, WAV, etc.</p>
                  </>
                )}
              </div>
              <Input id="audio-file-input" type="file" accept="audio/*" className="hidden" onChange={handleFileChange} disabled={isParsing} />
            </Label>
          </div>
        )}

        {songDetails && (
          <div className="grid gap-4 py-4">
            <div className="flex items-center gap-2 p-2 rounded-md bg-green-500/10 text-green-400 border border-green-500/20">
                <FileCheck className="w-5 h-5"/>
                <p className="text-sm font-medium">{songDetails.audioSrc?.name} selected</p>
            </div>
            <div className="flex gap-4">
              <div className="w-24 h-24 flex-shrink-0">
                <Label htmlFor="album-art-edit" className="cursor-pointer">
                  {albumArtUrl ? (
                    <Image src={albumArtUrl} alt="Album art" width={96} height={96} className="w-24 h-24 rounded-md object-cover" />
                  ) : (
                    <div className="w-24 h-24 rounded-md bg-muted flex items-center justify-center">
                      <Music className="w-8 h-8 text-muted-foreground" />
                    </div>
                  )}
                </Label>
                <Input id="album-art-edit" type="file" accept="image/*" className="hidden" onChange={handleAlbumArtChange} />
              </div>
              <div className="space-y-2 flex-grow">
                  <Input
                    id="title"
                    value={songDetails.title}
                    onChange={(e) => handleDetailChange("title", e.target.value)}
                    className="text-lg font-semibold h-auto p-1 border-0 focus-visible:ring-0 focus-visible:bg-muted"
                    disabled={isUploading}
                  />
                  <Input
                    id="artist"
                    value={songDetails.artist}
                    onChange={(e) => handleDetailChange("artist", e.target.value)}
                    className="h-auto p-1 border-0 focus-visible:ring-0 focus-visible:bg-muted"
                    disabled={isUploading}
                  />
                  <Input
                    id="album"
                    value={songDetails.album}
                    onChange={(e) => handleDetailChange("album", e.target.value)}
                    className="h-auto p-1 border-0 focus-visible:ring-0 focus-visible:bg-muted"
                    disabled={isUploading}
                  />
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isUploading}>
            Cancel
          </Button>
          <Button type="submit" onClick={handleSubmit} disabled={!songDetails || isUploading || isParsing}>
            {isUploading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading...</> : 'Upload Song'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
