"use client";

import React, { useState, useTransition } from 'react';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { suggestPlaylist } from '@/ai/flows/ai-playlist-suggestion';
import type { SuggestPlaylistOutput } from '@/ai/flows/ai-playlist-suggestion';
import { useToast } from '@/hooks/use-toast';
import { AiPlaylistDialog } from './ai-playlist-dialog';

export function AiPlaylistButton({ likedSongs }: { likedSongs: string[] }) {
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();
    const [playlist, setPlaylist] = useState<SuggestPlaylistOutput | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const handleGenerate = () => {
        startTransition(async () => {
            if (likedSongs.length < 3) {
                toast({
                    title: "Not enough songs",
                    description: "Please like at least 3 songs to generate a playlist.",
                    variant: "destructive",
                });
                return;
            }
            try {
                const result = await suggestPlaylist({ likedSongs });
                setPlaylist(result);
                setIsDialogOpen(true);
            } catch (error) {
                console.error(error);
                toast({
                    title: "Error generating playlist",
                    description: "Something went wrong. Please try again later.",
                    variant: "destructive",
                });
            }
        });
    };

    return (
        <>
            <Button onClick={handleGenerate} disabled={isPending}>
                <Sparkles className={`mr-2 h-4 w-4 ${isPending ? 'animate-spin' : ''}`} />
                {isPending ? "Generating..." : "Generate New Mix"}
            </Button>
            {playlist && (
                 <AiPlaylistDialog
                    isOpen={isDialogOpen}
                    setIsOpen={setIsDialogOpen}
                    playlist={playlist}
                />
            )}
        </>
    );
}
