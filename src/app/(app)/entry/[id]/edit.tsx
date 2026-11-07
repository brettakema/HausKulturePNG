import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { useAuth } from '@/context/auth-context';
import { useEntry } from '@/hooks/use-entries';
import { ProvincePicker } from '@/components/province-picker';
import { updateEntry } from '@/services/archive-service';
import { colors } from '@/constants/palette';
import type { CulturalEntry, EntryCategory } from '@/lib/types';
import { AppText, Banner, Button, Field, Page, TopBar } from '@/components/ui';

const categories: { id: EntryCategory; label: string }[] = [
  { id: 'song', label: 'Song & story' },
  { id: 'attire', label: 'Traditional attire' },
  { id: 'dance', label: 'Dance' },
  { id: 'place', label: 'Place' },
];

export default function EditEntryScreen() {
  const { id, refresh } = useLocalSearchParams<{ id: string; refresh?: string }>();
  const { session } = useAuth();
  const { entry, error, isLoading } = useEntry(id, refresh);

  if (isLoading) {
    return (
      <Page>
        <TopBar title="EDIT CONTRIBUTION" />
        <AppText>Loading your contribution…</AppText>
      </Page>
    );
  }
  if (error) {
    return (
      <Page>
        <TopBar title="EDIT CONTRIBUTION" />
        <Banner tone="error">{error}</Banner>
        <Button
          onPress={() =>
            router.replace({
              pathname: '/(app)/entry/[id]/edit',
              params: { id, refresh: String(Date.now()) },
            })
          }
          variant="secondary">
          Try again
        </Button>
      </Page>
    );
  }
  if (!entry || entry.created_by !== session?.user.id) {
    return (
      <Page>
        <TopBar title="EDIT CONTRIBUTION" />
        <Banner tone="error">This contribution is unavailable or you don’t have permission to edit it.</Banner>
        <Button onPress={() => router.back()} variant="secondary">
          Go back
        </Button>
      </Page>
    );
  }

  return <EntryEditForm key={entry.id} entry={entry} />;
}

function EntryEditForm({ entry }: { entry: CulturalEntry }) {
  const [category, setCategory] = useState<EntryCategory>(entry.category);
  const [title, setTitle] = useState(entry.title);
  const [description, setDescription] = useState(entry.description);
  const [community, setCommunity] = useState(entry.community);
  const [province, setProvince] = useState(entry.province);
  const [language, setLanguage] = useState(entry.language);
  const [lyrics, setLyrics] = useState(entry.lyrics ?? '');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const saveChanges = async () => {
    setError('');
    if (!title.trim() || !description.trim() || !community.trim() || !province.trim()) {
      setError('Add a title, description, community, and province to continue.');
      return;
    }

    setBusy(true);
    try {
      await updateEntry(entry.id, {
        title: title.trim(),
        description: description.trim(),
        category,
        community: community.trim(),
        province: province.trim(),
        language: language.trim(),
        lyrics: category === 'song' ? lyrics.trim() || null : null,
      });
      router.replace({
        pathname: '/(app)/entry/[id]',
        params: { id: entry.id, refresh: String(Date.now()) },
      });
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Your changes could not be saved.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Page>
      <TopBar
        title="EDIT CONTRIBUTION"
        right={
          <Pressable onPress={() => router.back()} hitSlop={12}>
            <AppText variant="label" style={{ color: colors.orange }}>
              Cancel
            </AppText>
          </Pressable>
        }
      />
      <View style={styles.intro}>
        <AppText variant="caption" style={styles.eyebrow}>
          YOUR COMMUNITY STORY
        </AppText>
        <AppText variant="title">Make an update.</AppText>
        <AppText style={styles.description}>
          Changes to a published story return it to community review. Your attached media will be kept.
        </AppText>
      </View>
      {error ? <Banner tone="error">{error}</Banner> : null}

      <View style={styles.fieldGroup}>
        <AppText variant="label">Collection</AppText>
        <View style={styles.chips}>
          {categories.map((item) => (
            <Pressable
              key={item.id}
              onPress={() => setCategory(item.id)}
              style={[styles.chip, category === item.id && styles.chipSelected]}>
              <AppText
                variant="caption"
                style={{ color: category === item.id ? colors.white : colors.ink, fontWeight: '600' }}>
                {item.label}
              </AppText>
            </Pressable>
          ))}
        </View>
      </View>
      <Field
        label="Story title"
        value={title}
        onChangeText={setTitle}
        maxLength={160}
        placeholder="A name people will remember"
      />
      <Field
        label="Description & context"
        value={description}
        onChangeText={setDescription}
        maxLength={5000}
        placeholder="What is shared here? Why does it matter?"
        multiline
      />
      <Field
        label="Community"
        value={community}
        onChangeText={setCommunity}
        placeholder="People or place"
      />
      <ProvincePicker value={province} onChange={setProvince} />
      <Field
        label="Language (optional)"
        value={language}
        onChangeText={setLanguage}
        placeholder="Language or dialect"
      />
      {category === 'song' ? (
        <Field
          label="Lyrics (optional)"
          value={lyrics}
          onChangeText={setLyrics}
          placeholder="Write the words as they are sung."
          multiline
        />
      ) : null}
      {entry.media_type ? (
        <View style={styles.mediaNote}>
          <AppText variant="label">Attached {entry.media_type} is retained</AppText>
          <AppText variant="caption">To replace the attached file, submit a new contribution.</AppText>
        </View>
      ) : null}
      <Button onPress={() => void saveChanges()} loading={busy}>
        Save changes
      </Button>
    </Page>
  );
}

const styles = StyleSheet.create({
  intro: { gap: 8, paddingTop: 6 },
  eyebrow: { color: colors.orange, fontWeight: '700', letterSpacing: 1.2 },
  description: { color: colors.muted },
  fieldGroup: { gap: 9 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 13,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.white,
  },
  chipSelected: { backgroundColor: colors.green, borderColor: colors.green },
  mediaNote: { gap: 5, padding: 14, borderRadius: 15, backgroundColor: colors.greenSoft },
});
