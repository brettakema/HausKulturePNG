import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { useAuth } from '@/context/auth-context';
import { useMyEntries } from '@/hooks/use-entries';
import { colors } from '@/constants/palette';
import { AppText, Banner, Button, EntryCard, Page, SectionHeading, TopBar } from '@/components/ui';

export default function ProfileScreen() {
  const { session, signOut } = useAuth();
  const { refresh } = useLocalSearchParams<{ refresh?: string }>();
  const { entries, error, isLoading, refresh: refreshEntries } = useMyEntries(session?.user.id, refresh);
  const [signOutError, setSignOutError] = useState('');
  const [busy, setBusy] = useState(false);
  const name = session?.user.user_metadata?.display_name || 'Community member';

  const handleSignOut = async () => {
    setSignOutError('');
    setBusy(true);
    try {
      await signOut();
    } catch (error) {
      setSignOutError(error instanceof Error ? error.message : 'Unable to sign out. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Page>
      <TopBar title="YOUR CIRCLE" />
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <AppText variant="heading" style={{ color: colors.green }}>
            {name.slice(0, 1).toUpperCase()}
          </AppText>
        </View>
        <View style={styles.identity}>
          <AppText variant="subheading">{name}</AppText>
          <AppText variant="caption">{session?.user.email}</AppText>
        </View>
      </View>

      <View style={styles.intro}>
        <AppText variant="title">Your contributions</AppText>
        <AppText style={styles.description}>
          Stories you share stay yours. New contributions are private until approved by a community moderator.
        </AppText>
      </View>

      <Button onPress={() => router.push('/(app)/contribute')}>Share a story</Button>
      {signOutError ? <Banner tone="error">{signOutError}</Banner> : null}
      <SectionHeading title="Your archive" />
      {isLoading ? (
        <ActivityIndicator color={colors.green} />
      ) : error ? (
        <View style={styles.empty}>
          <Banner tone="error">{error}</Banner>
          <Button onPress={refreshEntries} variant="quiet">
            Try again
          </Button>
        </View>
      ) : entries.length ? (
        <View style={styles.entryList}>
          {entries.map((entry) => (
            <View key={entry.id} style={styles.contribution}>
              <EntryCard entry={entry} />
              <View
                style={[
                  styles.status,
                  { backgroundColor: entry.status === 'published' ? colors.greenSoft : colors.orangeSoft },
                ]}>
                <AppText
                  variant="caption"
                  style={{ color: entry.status === 'published' ? colors.green : colors.orange, fontWeight: '600' }}>
                  {entry.status === 'published' ? 'Published' : 'Under community review'}
                </AppText>
              </View>
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.empty}>
          <AppText variant="caption">Your shared stories and media will appear here.</AppText>
        </View>
      )}
      <View style={styles.signOutArea}>
        <Button onPress={handleSignOut} loading={busy} variant="quiet">
          Sign out
        </Button>
      </View>
    </Page>
  );
}

const styles = StyleSheet.create({
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    backgroundColor: colors.white,
    padding: 17,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: colors.line,
  },
  avatar: {
    width: 54,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 19,
    backgroundColor: colors.greenSoft,
  },
  identity: { flex: 1, gap: 4 },
  intro: { gap: 8, paddingTop: 4 },
  description: { color: colors.muted },
  entryList: { gap: 13 },
  contribution: { gap: 7 },
  status: { alignSelf: 'flex-start', paddingHorizontal: 11, paddingVertical: 6, borderRadius: 14 },
  empty: { padding: 16, borderRadius: 16, backgroundColor: colors.white },
  signOutArea: { borderTopColor: colors.line, borderTopWidth: 1, paddingTop: 12, marginTop: 4 },
});
