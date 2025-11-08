'use server';

/**
 * @fileOverview A flow for suggesting song order and titles for playlists.
 *
 * - suggestPlaylist - A function that handles the playlist suggestion process.
 * - SuggestPlaylistInput - The input type for the suggestPlaylist function.
 * - SuggestPlaylistOutput - The return type for the suggestPlaylist function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestPlaylistInputSchema = z.object({
  likedSongs: z
    .array(z.string())
    .describe('A list of song names that the user likes.'),
});
export type SuggestPlaylistInput = z.infer<typeof SuggestPlaylistInputSchema>;

const SuggestPlaylistOutputSchema = z.object({
  playlistName: z
    .string()
    .describe('A catchy name for the playlist that fits the vibe of the songs.'),
  songOrder: z
    .array(z.string())
    .describe(
      'A list of song names in the suggested order to maintain vibe continuity.'
    ),
  vibeDescription: z
    .string()
    .describe('A one-sentence description of the overall vibe of the playlist.'),
});
export type SuggestPlaylistOutput = z.infer<typeof SuggestPlaylistOutputSchema>;

export async function suggestPlaylist(
  input: SuggestPlaylistInput
): Promise<SuggestPlaylistOutput> {
  return suggestPlaylistFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestPlaylistPrompt',
  input: {schema: SuggestPlaylistInputSchema},
  output: {schema: SuggestPlaylistOutputSchema},
  prompt: `You are an AI music expert. Given the following list of songs that a user likes, generate a playlist name, suggest a song order for vibe continuity, and provide a one-sentence vibe description.\n\nLiked Songs: {{#each likedSongs}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}\n\nOutput: {\n  "playlistName": "[playlist name]",\n  "songOrder": ["song1", "song2", "song3"],\n  "vibeDescription": "[one-sentence description]"\n}`,
});

const suggestPlaylistFlow = ai.defineFlow(
  {
    name: 'suggestPlaylistFlow',
    inputSchema: SuggestPlaylistInputSchema,
    outputSchema: SuggestPlaylistOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
