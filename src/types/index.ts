import { FieldValue } from "firebase/firestore";

export type Song = {
  id: string;
  title: string;
  artist: string;
  album: string;
  albumArt: string;
  audioSrc?: string; // audioSrc is optional now
  liked: boolean;
  dateAdded?: FieldValue;
  playCount?: number;
};
