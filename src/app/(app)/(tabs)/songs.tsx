import { EntryCollection } from '@/components/entry-collection';

export default function SongsScreen() {
  return (
    <EntryCollection
      category="song"
      title="Songs & stories"
      description="Lyrics, languages and recordings shared by the people who carry them."
    />
  );
}
