import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { colors } from '@/constants/palette';
import { AppText, Page, TopBar } from '@/components/ui';

const collections = [
  { title: 'Songs & stories', note: 'Lyrics, language, and the voices that carry them.', mark: '♫', route: '/(app)/(tabs)/songs', background: colors.greenSoft },
  { title: 'Traditional attire', note: 'Clothing, adornment, and the meaning in each detail.', mark: '✳', route: '/(app)/(tabs)/attire', background: colors.orangeSoft },
  { title: 'Dance & movement', note: 'Steps, rhythms, and gatherings remembered.', mark: '〰', route: '/(app)/(tabs)/dances', background: colors.babyYellow },
  { title: 'Places to remember', note: 'Local destinations and the stories held by the land.', mark: '⌖', route: '/(app)/(tabs)/places', background: colors.lightYellow },
] as const;

export default function ArchiveScreen() {
  return (
    <Page>
      <TopBar title="THE ARCHIVE" />
      <View style={styles.intro}>
        <AppText variant="caption" style={styles.eyebrow}>
          MANY VOICES, MANY HOMES
        </AppText>
        <AppText variant="title">Browse the collections.</AppText>
        <AppText style={styles.description}>
          Each collection is a space for communities to document and share their own knowledge.
        </AppText>
      </View>
      <View style={styles.collectionList}>
        {collections.map((collection) => (
          <Pressable
            key={collection.title}
            onPress={() => router.push(collection.route)}
            style={({ pressed }) => [
              styles.collection,
              { backgroundColor: collection.background },
              pressed && styles.pressed,
            ]}>
            <View style={styles.mark}>
              <AppText variant="heading" style={{ color: colors.green }}>
                {collection.mark}
              </AppText>
            </View>
            <View style={styles.copy}>
              <AppText variant="subheading" style={styles.title}>
                {collection.title}
              </AppText>
              <AppText variant="caption" style={styles.note}>
                {collection.note}
              </AppText>
            </View>
            <AppText variant="heading" style={styles.arrow}>
              →
            </AppText>
          </Pressable>
        ))}
      </View>
      <View style={styles.noteCard}>
        <AppText variant="label">Held with care</AppText>
        <AppText variant="caption" style={styles.noteBody}>
          Add only what you have permission to share. Communities remain at the heart of every story.
        </AppText>
      </View>
    </Page>
  );
}

const styles = StyleSheet.create({
  intro: { gap: 8, paddingTop: 9 },
  eyebrow: { color: colors.orange, fontWeight: '700', letterSpacing: 1.3 },
  description: { color: colors.muted },
  collectionList: { gap: 11 },
  collection: {
    minHeight: 110,
    borderRadius: 20,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
  },
  mark: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.75)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: { flex: 1, gap: 4 },
  title: { fontSize: 15 },
  note: { lineHeight: 18 },
  arrow: { color: colors.green, fontSize: 20 },
  pressed: { opacity: 0.78 },
  noteCard: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 16,
    borderRadius: 18,
    gap: 6,
  },
  noteBody: { lineHeight: 19 },
});
