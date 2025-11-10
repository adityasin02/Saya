// A simple in-memory store for local audio data URIs.
// This allows us to associate a Firestore document ID with a local, playable audio source
// without saving the large audio file data to the database.

const localAudioStore = new Map<string, string>();

export const localAudio = {
  set: (id: string, audioSrc: string) => {
    localAudioStore.set(id, audioSrc);
  },
  get: (id: string): string | undefined => {
    return localAudioStore.get(id);
  },
  has: (id: string): boolean => {
    return localAudioStore.has(id);
  },
  delete: (id: string): boolean => {
    return localAudioStore.delete(id);
  }
};
