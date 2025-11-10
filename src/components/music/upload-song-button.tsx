"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { UploadSongDialog } from "./upload-song-dialog";
import type { Song } from "@/types";

export function UploadSongButton({ onSongAdded }: { onSongAdded: (song: Song) => void }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsDialogOpen(true)}>
        <Plus className="mr-2 h-4 w-4" /> Upload Song
      </Button>
      <UploadSongDialog
        isOpen={isDialogOpen}
        setIsOpen={setIsDialogOpen}
        onSongAdded={onSongAdded}
      />
    </>
  );
}
