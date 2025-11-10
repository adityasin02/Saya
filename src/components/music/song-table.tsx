
"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { MoreHorizontal, Heart, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Song } from "@/types";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUser, useFirestore } from "@/firebase";
import { doc, deleteDoc } from "firebase/firestore";
import { localAudio } from "@/lib/local-audio-store";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { deleteDocumentNonBlocking } from "@/firebase/non-blocking-updates";

export function SongTable({ songs }: { songs: Song[] }) {
  const router = useRouter();
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [songToDelete, setSongToDelete] = useState<Song | null>(null);

  const handleRowClick = (songId: string) => {
    router.push(`/?songId=${songId}`);
  };

  const handleDeleteClick = (e: React.MouseEvent, song: Song) => {
    e.stopPropagation();
    setSongToDelete(song);
  };

  const confirmDelete = () => {
    if (!user || !songToDelete) return;

    const songRef = doc(firestore, `users/${user.uid}/songs/${songToDelete.id}`);
    
    deleteDocumentNonBlocking(songRef);
    localAudio.delete(songToDelete.id);

    toast({
      title: "Song Deleted",
      description: `"${songToDelete.title}" has been removed from your library.`,
    });

    setSongToDelete(null);
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]"></TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Artist</TableHead>
              <TableHead>Album</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {songs.length ? (
              songs.map((song) => (
                <TableRow
                  key={song.id}
                  onClick={() => handleRowClick(song.id)}
                  className="cursor-pointer"
                >
                  <TableCell>
                    <Heart
                      className={cn(
                        "h-5 w-5",
                        song.liked
                          ? "fill-primary text-primary"
                          : "text-muted-foreground"
                      )}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-4">
                      <Image
                        src={song.albumArt}
                        alt={song.album}
                        width={40}
                        height={40}
                        className="rounded"
                        data-ai-hint="album art"
                      />
                      <span className="font-medium">{song.title}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {song.artist}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {song.album}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={(e) => handleDeleteClick(e, song)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No songs found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog
        open={!!songToDelete}
        onOpenChange={(isOpen) => !isOpen && setSongToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete{" "}
              <span className="font-bold">"{songToDelete?.title}"</span> from your
              library.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={confirmDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

