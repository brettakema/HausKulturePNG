import { Image } from 'expo-image';
import { router } from 'expo-router';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { useAuth } from '@/context/auth-context';
import { useEntries } from '@/hooks/use-entries';
import { colors } from '@/constants/palette';
import { AppText, Banner, Button, EntryCard, Page, SectionHeading, TopBar } from '@/components/ui';

const categories = [
  { title: 'Songs & stories', detail: 'Words passed down', mark: '♫', route: '/(app)/(tabs)/songs' },
  { title: 'Traditional attire', detail: 'Patterns with meaning', mark: '✳', route: '/(app)/(tabs)/attire' },
  { title: 'Dance & movement', detail: 'Rhythms of a place', mark: '〰', route: '/(app)/(tabs)/dances' },
  { title: 'Places to remember', detail: 'Land, water, journeys', mark: '⌖', route: '/(app)/(tabs)/places' },
] as const;

export default function HomeScreen() {
  const { session } = useAuth();
  const { entries, error, isLoading, refresh } = useEntries();
  const firstName = session?.user.user_metadata?.display_name?.split(' ')[0] ?? 'Wantok';

  return (
    <Page>
      <TopBar
        right={
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Open your profile"
            onPress={() => router.push('/(app)/(tabs)/profile')}
            style={styles.profileButton}>
            <AppText variant="label" style={{ color: colors.green }}>
              {firstName.slice(0, 1).toUpperCase()}
            </AppText>
          </Pressable>
        }
      />

      <View style={styles.welcome}>
        <AppText variant="caption" style={styles.eyebrow}>
          A LIVING ARCHIVE, CARRIED TOGETHER
        </AppText>
        <AppText variant="title">Our stories live here, {firstName}.</AppText>
        <AppText style={styles.lead}>
          Songs, traditions and places held by the communities who know them best.
        </AppText>
      </View>

      <View style={styles.hero}>
        <Image
          source={{
            uri: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?auto=format&fit=crop&w=1200&q=85',
          }}
          contentFit="cover"
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.heroShade} />
        <View style={styles.heroContent}>
          <AppText variant="caption" style={styles.heroEyebrow}>
            HAUS KULTURE · PAPUA NEW GUINEA
          </AppText>
          <AppText variant="heading" style={styles.heroTitle}>
            Keep the voices{'\n'}of home close.
          </AppText>
          <AppText variant="caption" style={styles.heroText}>
            Shared with care. Remembered by many.
          </AppText>
          <Button
            onPress={() => router.push('/(app)/contribute')}
            variant="secondary"
            style={styles.heroButton}>
            Share a story  →
          </Button>
        </View>
      </View>

      <SectionHeading title="Explore the archive" />
      <View style={styles.categoryGrid}>
        {categories.map((category, index) => (
          <Pressable
            key={category.title}
            onPress={() => router.push(category.route)}
            style={({ pressed }) => [
              styles.categoryCard,
              index % 2 === 0 ? styles.categoryYellow : styles.categoryOrange,
              pressed && styles.pressed,
            ]}>
            <AppText variant="heading" style={styles.categoryMark}>
              {category.mark}
            </AppText>
            <AppText variant="label" style={styles.categoryTitle}>
              {category.title}
            </AppText>
            <AppText variant="caption" style={styles.categoryDetail}>
              {category.detail}
            </AppText>
          </Pressable>
        ))}
      </View>

      <SectionHeading
        title="Recently shared"
        action="See all"
        onAction={() => router.push('/(app)/(tabs)/archive')}
      />
      {isLoading ? (
        <ActivityIndicator color={colors.green} />
      ) : error ? (
        <View style={styles.firstStory}>
          <Banner tone="error">{error}</Banner>
          <Button onPress={refresh} variant="quiet">
            Try again
          </Button>
        </View>
      ) : entries.length ? (
        <View style={styles.recentList}>
          {entries.slice(0, 3).map((entry) => (
            <EntryCard key={entry.id} entry={entry} />
          ))}
        </View>
      ) : (
        <View style={styles.firstStory}>
          <AppText variant="label">The archive starts with us.</AppText>
          <AppText variant="caption">
            Be the first to share a song, a memory, or a place worth protecting.
          </AppText>
          <Button onPress={() => router.push('/(app)/contribute')} variant="quiet">
            Share the first story
          </Button>
        </View>
      )}
    </Page>
  );
}

const styles = StyleSheet.create({
  profileButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.greenSoft,
  },
  welcome: { gap: 8, paddingTop: 8 },
  eyebrow: { color: colors.orange, fontWeight: '700', letterSpacing: 1.1, fontSize: 10 },
  lead: { color: colors.muted, maxWidth: 410 },
  hero: { minHeight: 246, overflow: 'hidden', borderRadius: 24, backgroundColor: colors.darkYellow },
  heroShade: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(23, 20, 13, 0.68)',
  },
  heroContent: { flex: 1, minHeight: 246, justifyContent: 'center', alignItems: 'flex-start', padding: 22, gap: 10 },
  heroEyebrow: { color: colors.lightYellow, fontSize: 9, letterSpacing: 1.2, fontWeight: '700' },
  heroTitle: { color: colors.white, fontSize: 27, lineHeight: 33 },
  heroText: { color: colors.white },
  heroButton: { marginTop: 5, minHeight: 43, borderRadius: 14 },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  categoryCard: { flexBasis: '48%', flexGrow: 1, minHeight: 132, borderRadius: 18, padding: 14, gap: 4 },
  categoryYellow: { backgroundColor: colors.lightYellow },
  categoryOrange: { backgroundColor: colors.orangeSoft },
  categoryMark: { color: colors.green, fontSize: 25, marginBottom: 3 },
  categoryTitle: { color: colors.ink, fontSize: 13 },
  categoryDetail: { color: colors.muted, fontSize: 10 },
  pressed: { opacity: 0.8 },
  recentList: { gap: 10 },
  firstStory: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 18,
    padding: 17,
    gap: 7,
    alignItems: 'flex-start',
  },
});
