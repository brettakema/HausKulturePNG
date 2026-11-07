import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { useAuth } from '@/context/auth-context';
import { colors } from '@/constants/palette';
import { ProvincePicker } from '@/components/province-picker';
import { createEntry } from '@/services/archive-service';
import { isSupabaseConfigured } from '@/services/supabase';
import type { EntryCategory, MediaType } from '@/lib/types';
import { AppText, Banner, Button, Field, Page, TopBar } from '@/components/ui';

const categories: { id: EntryCategory; label: string }[] = [
  { id: 'song', label: 'Song & story' },
  { id: 'attire', label: 'Traditional attire' },
  { id: 'dance', label: 'Dance' },
  { id: 'place', label: 'Place' },
];
const maxFileSize = 100 * 1024 * 1024;

type SelectedMedia = {
  uri: string;
  name: string;
  mimeType: string;
  type: Exclude<MediaType, 'link'>;
  size?: number;
};

function mediaFromFile(
  uri: string,
  name: string,
  mimeType: string | undefined,
  type: SelectedMedia['type'],
  size?: number,
): SelectedMedia {
  return {
    uri,
    name,
    mimeType: mimeType || (type === 'audio' ? 'audio/mpeg' : type === 'video' ? 'video/mp4' : 'image/jpeg'),
    type,
    size,
  };
}

export default function ContributeScreen() {
  const { session } = useAuth();
  const [category, setCategory] = useState<EntryCategory>('song');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [community, setCommunity] = useState('');
  const [province, setProvince] = useState('');
  const [language, setLanguage] = useState('');
  const [lyrics, setLyrics] = useState('');
  const [media, setMedia] = useState<SelectedMedia | null>(null);
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const setChosenMedia = (nextMedia: SelectedMedia) => {
    if (nextMedia.size && nextMedia.size > maxFileSize) {
      setMedia(null);
      setError('Files need to be 100 MB or smaller. Please choose a shorter or smaller recording.');
      return;
    }
    setError('');
    setMedia(nextMedia);
  };

  const chooseVisualMedia = async () => {
    setError('');
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images', 'videos'],
        allowsEditing: false,
        quality: 0.85,
      });
      if (result.canceled) return;
      const asset = result.assets[0];
      const type = asset.type === 'video' ? 'video' : 'image';
      setChosenMedia(
        mediaFromFile(
          asset.uri,
          asset.fileName || `community-${Date.now()}`,
          asset.mimeType,
          type,
          asset.fileSize,
        ),
      );
    } catch (pickerError) {
      setError(pickerError instanceof Error ? pickerError.message : 'The media library could not be opened.');
    }
  };

  const chooseAudio = async () => {
    setError('');
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'audio/*',
        copyToCacheDirectory: true,
      });
      if (result.canceled) return;
      const asset = result.assets[0];
      setChosenMedia(
        mediaFromFile(asset.uri, asset.name, asset.mimeType, 'audio', asset.size),
      );
    } catch (pickerError) {
      setError(pickerError instanceof Error ? pickerError.message : 'The audio file could not be opened.');
    }
  };

  const submit = async () => {
    setError('');
    if (!isSupabaseConfigured) {
      setError('Connect Supabase before sharing a contribution.');
      return;
    }
    if (!session) {
      setError('Your sign-in has expired. Sign in again before contributing.');
      return;
    }
    if (!title.trim() || !description.trim() || !community.trim() || !province.trim()) {
      setError('Add a title, description, community, and province to continue.');
      return;
    }
    if (!consent) {
      setError('Please confirm you have permission to share this material with the archive.');
      return;
    }

    setBusy(true);
    try {
      await createEntry({
        title: title.trim(),
        description: description.trim(),
        category,
        province: province.trim(),
        community: community.trim(),
        language: language.trim(),
        lyrics: category === 'song' ? lyrics.trim() || null : null,
      }, session.user.id, media ?? undefined);
      setSubmitted(true);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : 'Your contribution could not be saved. Please try again.',
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <Page>
      <TopBar
        title="ADD TO THE ARCHIVE"
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
          SHARE KNOWLEDGE WITH CARE
        </AppText>
        <AppText variant="title">Add a community story.</AppText>
        <AppText style={styles.lead}>
          Give it context so future generations know who shared it and where it belongs.
        </AppText>
      </View>

      {error ? <Banner tone="error">{error}</Banner> : null}
      {submitted ? (
        <>
          <Banner tone="success">
            Your contribution was saved and is waiting for community review.
          </Banner>
          <Button
            onPress={() =>
              router.replace({
                pathname: '/(app)/(tabs)/profile',
                params: { refresh: String(Date.now()) },
              })
            }>
            View your contributions
          </Button>
        </>
      ) : null}
      {!isSupabaseConfigured ? (
        <Banner tone="info">Connect Supabase and apply the database setup before contributing.</Banner>
      ) : null}

      <View style={styles.fieldGroup}>
        <AppText variant="label">Choose a collection</AppText>
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
      <Field label="Story title" value={title} onChangeText={setTitle} placeholder="A name people will remember" />
      <Field
        label="Description & context"
        value={description}
        onChangeText={setDescription}
        placeholder="What is shared here? Who taught you about it? Why does it matter?"
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
          placeholder="Write the words as they are sung. Add a translation in the description if you have one."
          multiline
        />
      ) : null}

      <View style={styles.uploadSection}>
        <View style={styles.uploadIntro}>
          <AppText variant="label">Add audio, photos, or video</AppText>
          <AppText variant="caption">One file, up to 100 MB. Your media will be uploaded to the archive.</AppText>
        </View>
        <View style={styles.uploadButtons}>
          <Button variant="secondary" onPress={chooseAudio} style={styles.uploadButton}>
            Choose audio
          </Button>
          <Button variant="secondary" onPress={chooseVisualMedia} style={styles.uploadButton}>
            Choose photo / video
          </Button>
        </View>
        {media ? (
          <View style={styles.selectedFile}>
            <AppText variant="caption" style={styles.selectedCopy} numberOfLines={2}>
              {media.type.toUpperCase()} · {media.name}
            </AppText>
            <Pressable onPress={() => setMedia(null)} accessibilityLabel="Remove selected media">
              <AppText variant="label" style={{ color: colors.error }}>
                Remove
              </AppText>
            </Pressable>
          </View>
        ) : null}
      </View>

      <Pressable onPress={() => setConsent((value) => !value)} style={styles.consentRow}>
        <View style={[styles.checkbox, consent && styles.checkboxSelected]}>
          {consent ? <AppText variant="label" style={{ color: colors.white }}>✓</AppText> : null}
        </View>
        <AppText variant="caption" style={styles.consentText}>
          I have permission from the people or community knowledge holders to share this material here.
        </AppText>
      </Pressable>

      <View style={styles.reviewNote}>
        <AppText variant="label">Community review first</AppText>
        <AppText variant="caption">
          New contributions stay private to you until a community moderator approves them.
        </AppText>
      </View>

      <Button onPress={submit} loading={busy} disabled={!isSupabaseConfigured || submitted}>
        {submitted ? 'Contribution submitted' : 'Submit for community review'}
      </Button>
    </Page>
  );
}

const styles = StyleSheet.create({
  intro: { gap: 8, paddingTop: 6 },
  eyebrow: { color: colors.orange, fontWeight: '700', letterSpacing: 1.2 },
  lead: { color: colors.muted },
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
  uploadSection: {
    backgroundColor: colors.white,
    borderColor: colors.line,
    borderWidth: 1,
    padding: 15,
    borderRadius: 17,
    gap: 12,
  },
  uploadIntro: { gap: 5 },
  uploadButtons: { flexDirection: 'row', gap: 9, flexWrap: 'wrap' },
  uploadButton: { minHeight: 44, flexGrow: 1, paddingHorizontal: 12 },
  selectedFile: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  selectedCopy: { flex: 1, color: colors.green, fontWeight: '600' },
  consentRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 11, paddingVertical: 5 },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.muted,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
  },
  checkboxSelected: { backgroundColor: colors.green, borderColor: colors.green },
  consentText: { flex: 1, color: colors.ink, lineHeight: 19 },
  reviewNote: { gap: 5, padding: 14, borderRadius: 15, backgroundColor: colors.orangeSoft },
});
