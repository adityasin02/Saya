
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
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";
import { localAudio } from "@/lib/local-audio-store";

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

  const processFile = async (file: File) => {
    if (!file.type.startsWith("audio/")) return;

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
        title: file.name.replace(/\.[^/.]+$/, ""),
        artist: "Unknown Artist",
        album: "Unknown Album",
        albumArt: PlaceHolderImages[Math.floor(Math.random() * PlaceHolderImages.length)].imageUrl,
        liked: false,
        dateAdded: serverTimestamp(),
        playCount: 0,
      };

      const songsCollection = collection(firestore, `users/${userId}/songs`);

      const docRef = await addDoc(songsCollection, songForDb).catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
          path: songsCollection.path,
          operation: 'create',
          requestResourceData: songForDb,
        });
        errorEmitter.emit('permission-error', permissionError);
        throw serverError; // re-throw to be caught by the outer try/catch
      });
      
      // Store the audio source locally with the new document ID
      localAudio.set(docRef.id, audioDataUrl);
      
      return songForDb.title;

    } catch (error) {
      console.error("Error processing song:", file.name, error);
      throw new Error(`Failed to process ${file.name}`);
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsProcessing(true);
    
    const fileList = Array.from(files);
    const totalFiles = fileList.length;
    let successfulUploads = 0;

    for (const file of fileList) {
        try {
            const title = await processFile(file);
            if (title) {
                successfulUploads++;
            }
        } catch (error) {
            // Error is already logged in processFile
        }
    }

    if (successfulUploads > 0) {
      toast({
        title: "Upload Complete",
        description: `${successfulUploads} of ${totalFiles} song(s) have been added to your library.`,
      });
    }

    if (successfulUploads < totalFiles) {
        toast({
            variant: "destructive",
            title: "Upload Incomplete",
            description: `Could not process ${totalFiles - successfulUploads} file(s). See console for details.`,
        });
    }

    setIsOpen(false);
    resetState();
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
          <DialogTitle>Upload Songs</DialogTitle>
          <DialogDescription>
            Select audio files or a folder to add to your library.
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
                  <p className="text-xs">Songs or Folders (MP3, FLAC, WAV, etc.)</p>
                </>
              )}
            </div>
            <Input 
              id="audio-file-input" 
              type="file" 
              accept="audio/*" 
              className="hidden" 
              onChange={handleFileChange} 
              disabled={isProcessing}
              multiple
              // @ts-ignore
              webkitdirectory="true" 
            />
          </Label>
        </div>
      </DialogContent>
    </Dialog>
  );
}
