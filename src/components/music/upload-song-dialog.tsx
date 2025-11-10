
"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useFirestore } from "@/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { Loader2, UploadCloud } from "lucide-react";
import { PlaceHolderImages } from "@/lib/placeholder-images";

type UploadSongDialogProps = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  userId: string;
};

export function UploadSongDialog({ isOpen, setIsOpen, userId }: UploadSongDialogProps) {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const resetState = () => {
    setIsProcessing(false);
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);

    try {
      const audioDataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target && typeof e.target.result === 'string') {
            resolve(e.target.result);
          } else {
            reject(new Error("Failed to read file."));
          }
        };
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(file);
      });

      const songForDb = {
        title: file.name.replace(/\.[^/.]+$/, ""), // Use filename as title
        artist: "Unknown Artist",
        album: "Unknown Album",
        albumArt: PlaceHolderImages[Math.floor(Math.random() * PlaceHolderImages.length)].imageUrl,
        liked: false,
        dateAdded: serverTimestamp(),
        playCount: 0,
        // We explicitly DO NOT save the audioSrc to Firestore
      };

      const songsCollection = collection(firestore, `users/${userId}/songs`);
      
      // We are not awaiting this to make it non-blocking
      addDoc(songsCollection, songForDb);

      toast({
        title: "Song Added!",
        description: `${songForDb.title} has been added to your library.`,
      });
    } catch (error) {
      console.error("Error uploading song:", error);
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: "There was an error saving your song's metadata.",
      });
    } finally {
      setIsOpen(false);
      resetState();
    }
  };

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
            Select an audio file from your device to add it to your library.
          </DialogDescription>
        </DialogHeader>

        <div className="py-8">
          <Label htmlFor="audio-file-input" className="mx-auto flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-muted/50">
            <div className="flex flex-col items-center justify-center pt-5 pb-6 text-muted-foreground">
              {isProcessing ? (
                <>
                  <Loader2 className="w-10 h-10 mb-3 animate-spin" />
                  <p className="mb-2 text-sm">Adding to library...</p>
                </>
              ) : (
                <>
                  <UploadCloud className="w-10 h-10 mb-3" />
                  <p className="mb-2 text-sm"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                  <p className="text-xs">MP3, FLAC, WAV, etc.</p>
                </>
              )}
            </div>
            <Input id="audio-file-input" type="file" accept="audio/*" className="hidden" onChange={handleFileChange} disabled={isProcessing} />
          </Label>
        </div>
      </DialogContent>
    </Dialog>
  );
}
