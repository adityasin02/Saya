'use server';

/**
 * @fileOverview AI-powered smart queue generator.
 *
 * - generateSmartQueue - A function that generates a smart queue of songs based on user preferences.
 * - GenerateSmartQueueInput - The input type for the generateSmartQueue function.
 * - GenerateSmartQueueOutput - The return type for the generateSmartQueue function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateSmartQueueInputSchema = z.object({
  likedSongs: z
    .array(z.string())
    .describe('A list of the user\'s liked songs (song names).'),
  playHistory: z
    .array(z.string())
    .describe('A list of the user\'s recently played songs (song names).'),
  timeOfDay: z
    .string()
    .describe(
      'The current time of day (e.g., morning, afternoon, evening, night).'n
    ),
});
export type GenerateSmartQueueInput = z.infer<typeof GenerateSmartQueueInputSchema>;

const GenerateSmartQueueOutputSchema = z.object({
  suggestedQueue: z
    .array(z.string())
    .describe('A list of song names for the suggested smart queue.'),
  reasoning: z.string().describe('The AI\'s reasoning for the suggested queue.'),
});
export type GenerateSmartQueueOutput = z.infer<typeof GenerateSmartQueueOutputSchema>;

export async function generateSmartQueue(
  input: GenerateSmartQueueInput
): Promise<GenerateSmartQueueOutput> {
  return generateSmartQueueFlow(input);
}

const generateSmartQueuePrompt = ai.definePrompt({
  name: 'generateSmartQueuePrompt',
  input: {schema: GenerateSmartQueueInputSchema},
  output: {schema: GenerateSmartQueueOutputSchema},
  prompt: `You are an AI music expert who curates personalized music playlists.

  Based on the user's listening history, preferences, and the time of day, create a "Smart Queue" of songs that the user will enjoy.

  Here is the information you have:
  Liked Songs: {{#each likedSongs}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
  Play History: {{#each playHistory}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
  Time of Day: {{{timeOfDay}}}

  Consider the following factors when creating the Smart Queue:
  - Play count: Songs that the user plays frequently should be prioritized.
  - Skip pattern: Songs that the user skips frequently should be avoided.
  - Time of day: The Smart Queue should be appropriate for the current time of day (e.g., upbeat songs in the morning, chill songs at night).
  - Liked genres/artists: The Smart Queue should include songs from genres and artists that the user likes.

  Suggest a queue of songs, and explain your reasoning for the choices.
  `,
});

const generateSmartQueueFlow = ai.defineFlow(
  {
    name: 'generateSmartQueueFlow',
    inputSchema: GenerateSmartQueueInputSchema,
    outputSchema: GenerateSmartQueueOutputSchema,
  },
  async input => {
    const {output} = await generateSmartQueuePrompt(input);
    return output!;
  }
);
