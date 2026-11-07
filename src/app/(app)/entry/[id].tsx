import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Linking, Modal, Pressable, StyleSheet, View } from 'react-native';

import { useAuth } from '@/context/auth-context';
import { useEntry } from '@/hooks/use-entries';
import { deleteEntry, deleteEntryMedia } from '@/services/archive-service';
import { colors } from '@/constants/palette';
import { AppText, Banner, Button, Page, TopBar, categoryLabel } from '@/components/ui';

export default function EntryDetailScreen() {
  const { id, refresh } = useLocalSearchParams<{ id: string; refresh?: string }>();
  const { session } = useAuth();
  const { entry, error, isLoading } = useEntry(id, refresh);
  const [mediaError, setMediaError] = useState('');
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [deleteOutcome, setDeleteOutcome] = useState<{ tone: 'success' | 'error'; text: string } | null>(
    null,
  );

  const openMedia = async () => {
    if (!entry?.media_url) return;
    try {
      await Linking.openURL(entry.media_url);
    } catch (openError) {
      setMediaError(
        openError instanceof Error ? openError.message : 'This media could not be opened.',
      );
    }
  };

  const confirmDelete = async () => {
    if (!entry) return;
    setDeleteError('');
    setIsDeleting(true);
    try {
      await deleteEntry(entry.id);
      let text = 'This contribution and its archive record have been deleted.';
      let tone: 'success' | 'error' = 'success';
      if (entry.media_path) {
        try {
          await deleteEntryMedia(entry.media_path);
        } catch (mediaDeleteError) {
          tone = 'error';
          text = `The record was deleted, but its media file could not be removed: ${
            mediaDeleteError instanceof Error ? mediaDeleteError.message : 'Unknown media cleanup error.'
          }`;
        }
      }
      setDeleteOutcome({ tone, text });
      setDeleteOpen(false);
    } catch (deleteFailure) {
      setDeleteError(
        deleteFailure instanceof Error ? deleteFailure.message : 'This entry could not be deleted.',
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Page>
      <TopBar
        title="STORY DETAIL"
        right={
          <Pressable onPress={() => router.back()} hitSlop={12}>
            <AppText variant="label" style={{ color: colors.orange }}>
              Back
            </AppText>
          </Pressable>
        }
      />
      {deleteOutcome ? (
        <View style={styles.deletedState}>
          <Banner tone={deleteOutcome.tone}>{deleteOutcome.text}</Banner>
          <Button
            onPress={() =>
              router.replace({
                pathname: '/(app)/(tabs)/profile',
                params: { refresh: String(Date.now()) },
              })
            }>
            Go to your archive
          </Button>
        </View>
      ) : isLoading ? (
        <AppText>Loading this story…</AppText>
      ) : error ? (
        <>
          <Banner tone="error">{error}</Banner>
          <Button
            onPress={() =>
              router.replace({
                pathname: '/(app)/entry/[id]',
                params: { id, refresh: String(Date.now()) },
              })
            }
            variant="secondary">
            Try again
          </Button>
        </>
      ) : entry ? (
        <>
          {entry.media_type === 'image' && entry.media_url ? (
            <Image source={{ uri: entry.media_url }} contentFit="cover" style={styles.heroImage} />
          ) : null}
          <View style={styles.intro}>
            <AppText variant="caption" style={styles.eyebrow}>
              {categoryLabel[entry.category]}
            </AppText>
            <AppText variant="title">{entry.title}</AppText>
            <AppText variant="caption" style={styles.meta}>
              {[entry.community, entry.province, entry.language].filter(Boolean).join(' · ')}
            </AppText>
          </View>
          <View style={styles.storyCard}>
            <AppText variant="subheading">The story</AppText>
            <AppText style={styles.description}>{entry.description}</AppText>
          </View>
          {entry.lyrics ? (
            <View style={styles.lyricsCard}>
              <AppText variant="caption" style={styles.lyricsEyebrow}>
                LYRICS & WORDS
              </AppText>
              <AppText style={styles.lyrics}>{entry.lyrics}</AppText>
              <AppText variant="caption" style={styles.translationNote}>
                Shared by the community. Translations and context are welcome.
              </AppText>
            </View>
          ) : null}
          {entry.media_url && entry.media_type !== 'image' ? (
            <View style={styles.mediaCard}>
              <View style={styles.mediaSymbol}>
                <AppText variant="heading" style={{ color: colors.green }}>
                  {entry.media_type === 'audio' ? '♫' : '▶'}
                </AppText>
              </View>
              <View style={styles.mediaCopy}>
                <AppText variant="label">
                  {entry.media_type === 'audio' ? 'Listen to the recording' : 'View shared media'}
                </AppText>
                <AppText variant="caption">Opens the community-shared file</AppText>
              </View>
              <Button onPress={openMedia} variant="secondary" style={styles.playButton}>
                Open
              </Button>
            </View>
          ) : null}
          {mediaError ? <Banner tone="error">{mediaError}</Banner> : null}
          {entry.status === 'pending' ? (
            <Banner tone="info">Your contribution is waiting for community review.</Banner>
          ) : null}
          {entry.created_by === session?.user.id ? (
            <View style={styles.ownerActions}>
              <Button
                onPress={() =>
                  router.push({
                    pathname: '/(app)/entry/[id]/edit',
                    params: { id: entry.id },
                  })
                }
                variant="secondary"
                style={styles.ownerButton}>
                Edit contribution
              </Button>
              <Button
                onPress={() => {
                  setDeleteError('');
                  setDeleteOpen(true);
                }}
                variant="danger"
                style={styles.ownerButton}>
                Delete
              </Button>
            </View>
          ) : null}
          {deleteError ? <Banner tone="error">{deleteError}</Banner> : null}
          <View style={styles.careNote}>
            <AppText variant="label">Shared with care</AppText>
            <AppText variant="caption">
              This archive belongs to the people and communities whose knowledge it holds.
            </AppText>
          </View>
        </>
      ) : (
        <View style={styles.notFound}>
          <AppText variant="heading">This story isn’t available.</AppText>
          <AppText variant="caption">
            It may have been removed or may still be under community review.
          </AppText>
          <Button onPress={() => router.back()} variant="secondary">
            Go back
          </Button>
        </View>
      )}
      <Modal
        visible={deleteOpen}
        transparent
        animationType="fade"
        onRequestClose={() => {
          if (!isDeleting) setDeleteOpen(false);
        }}>
        <View style={styles.modalBackdrop}>
          <View style={styles.confirmDialog} accessibilityViewIsModal>
            <AppText variant="subheading">Delete this contribution?</AppText>
            <AppText variant="caption" style={styles.confirmCopy}>
              This permanently removes your entry and its attached media. This action can’t be undone.
            </AppText>
            {deleteError ? <Banner tone="error">{deleteError}</Banner> : null}
            <Button
              onPress={() => void confirmDelete()}
              variant="danger"
              loading={isDeleting}
              style={styles.dialogButton}>
              Delete permanently
            </Button>
            <Button
              onPress={() => setDeleteOpen(false)}
              variant="quiet"
              disabled={isDeleting}
              style={styles.dialogButton}>
              Keep contribution
            </Button>
          </View>
        </View>
      </Modal>
    </Page>
  );
}

const styles = StyleSheet.create({
  heroImage: { height: 245, borderRadius: 22, backgroundColor: colors.greenSoft },
  intro: { gap: 8, paddingTop: 6 },
  eyebrow: { color: colors.orange, fontWeight: '700', letterSpacing: 1.2 },
  meta: { color: colors.muted },
  storyCard: {
    backgroundColor: colors.white,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 17,
    gap: 8,
  },
  description: { lineHeight: 24 },
  lyricsCard: {
    backgroundColor: colors.greenSoft,
    borderRadius: 18,
    padding: 18,
    gap: 11,
  },
  lyricsEyebrow: { color: colors.green, fontWeight: '700', letterSpacing: 1.1 },
  lyrics: { color: colors.greenDark, fontSize: 17, lineHeight: 28 },
  translationNote: { color: colors.green, lineHeight: 18 },
  mediaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.white,
    borderRadius: 18,
    padding: 13,
    borderWidth: 1,
    borderColor: colors.line,
  },
  mediaSymbol: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.orangeSoft,
    borderRadius: 15,
  },
  mediaCopy: { flex: 1, gap: 4 },
  playButton: { minHeight: 40, borderRadius: 12, paddingHorizontal: 15 },
  careNote: { gap: 6, padding: 14, borderRadius: 16, backgroundColor: colors.lightYellow },
  notFound: { gap: 12, paddingTop: 20 },
  ownerActions: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  ownerButton: { flexGrow: 1 },
  deletedState: { gap: 14, paddingTop: 12 },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 22,
    backgroundColor: 'rgba(23, 20, 13, 0.55)',
  },
  confirmDialog: {
    width: '100%',
    maxWidth: 420,
    padding: 21,
    borderRadius: 22,
    gap: 13,
    backgroundColor: colors.paper,
  },
  confirmCopy: { color: colors.muted, lineHeight: 20 },
  dialogButton: { width: '100%' },
});
