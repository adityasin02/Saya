"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { MoreHorizontal, Heart } from "lucide-react";
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

export function SongTable({ songs }: { songs: Song[] }) {
  const router = useRouter();

  const handleRowClick = (songId: string) => {
    router.push(`/?songId=${songId}`);
  };

  return (
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
                    <Heart className={cn("h-5 w-5", song.liked ? "fill-primary text-primary" : "text-muted-foreground")}/>
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
                <TableCell className="text-muted-foreground">{song.artist}</TableCell>
                <TableCell className="text-muted-foreground">{song.album}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
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
  );
}
