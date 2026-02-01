export type NoteType = "Idea" | "Quote" | "Observation" | "Project Note" | "Journal";

export type Mood = "Calm" | "Focused" | "Stressed" | "Excited";

export type Note = {
  id: string;
  title?: string;
  content: string;
  type: NoteType;
  tags?: string[];
  mood?: Mood;
  source?: string;
  createdAt: number;
  updatedAt: number;
  pinned: boolean;
  archived: boolean;
  links: string[];
};

export type NoteWithComputed = Note & {
  backlinks: string[];
  linkScore: number;
};
