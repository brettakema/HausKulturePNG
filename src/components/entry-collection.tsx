import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { useEntries } from '@/hooks/use-entries';
import { pngRegions } from '@/constants/png-regions';
import { colors } from '@/constants/palette';
import type { EntryCategory } from '@/lib/types';
import { AppText, Banner, Button, EntryCard, Page, TopBar } from '@/components/ui';

export function EntryCollection({
  category,
  title,
  description,
}: {
  category: EntryCategory;
  title: string;
  description: string;
}) {
  const [openRegion, setOpenRegion] = useState<string | null>(null);
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null);
  const { entries, error, isLoading, refresh } = useEntries(category, selectedProvince ?? undefined);

  return (
    <Page>
      <TopBar title="THE ARCHIVE" />
      <View style={styles.intro}>
        <AppText variant="caption" style={styles.eyebrow}>
          COMMUNITY COLLECTION
        </AppText>
        <AppText variant="title">{title}</AppText>
        <AppText style={styles.description}>{description}</AppText>
      </View>

      <Button onPress={() => router.push('/(app)/contribute')} style={styles.addButton}>
        Add to this collection
      </Button>

      <View style={styles.regionSection}>
        <View style={styles.regionHeading}>
          <View style={styles.regionCopy}>
            <AppText variant="subheading">Browse by region</AppText>
            <AppText variant="caption">Choose a region, then select one of its provinces.</AppText>
          </View>
          {selectedProvince ? (
            <Pressable onPress={() => setSelectedProvince(null)} accessibilityRole="button">
              <AppText variant="label" style={styles.changeProvince}>
                Change
              </AppText>
            </Pressable>
          ) : null}
        </View>
        {pngRegions.map((region) => {
          const expanded = openRegion === region.name;
          return (
            <View key={region.name} style={styles.regionCard}>
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ expanded }}
                onPress={() => setOpenRegion(expanded ? null : region.name)}
                style={styles.regionButton}>
                <View style={styles.regionCopy}>
                  <AppText variant="label">{region.name}</AppText>
                  <AppText variant="caption">{region.provinces.length} provinces</AppText>
                </View>
                <AppText variant="heading" style={styles.regionChevron}>
                  {expanded ? '−' : '+'}
                </AppText>
              </Pressable>
              {expanded ? (
                <View style={styles.provinces}>
                  {region.provinces.map((province) => (
                    <Pressable
                      key={province}
                      accessibilityRole="button"
                      accessibilityState={{ selected: selectedProvince === province }}
                      onPress={() => setSelectedProvince(province)}
                      style={[
                        styles.provinceButton,
                        selectedProvince === province && styles.selectedProvince,
                      ]}>
                      <AppText
                        variant="caption"
                        style={
                          selectedProvince === province
                            ? styles.selectedProvinceLabel
                            : styles.provinceLabel
                        }>
                        {province}
                      </AppText>
                    </Pressable>
                  ))}
                </View>
              ) : null}
            </View>
          );
        })}
      </View>

      <View style={styles.resultsHeading}>
        <AppText variant="subheading">
          {selectedProvince ? `Stories from ${selectedProvince}` : 'Stories across PNG'}
        </AppText>
        {selectedProvince ? (
          <Pressable onPress={() => setSelectedProvince(null)} accessibilityRole="button">
            <AppText variant="caption" style={styles.changeProvince}>
              Show all
            </AppText>
          </Pressable>
        ) : null}
      </View>
      {isLoading ? (
        <ActivityIndicator color={colors.green} style={styles.loader} />
      ) : error ? (
        <View style={styles.empty}>
          <Banner tone="error">{error}</Banner>
          <Button onPress={refresh} variant="quiet">
            Try again
          </Button>
        </View>
      ) : entries.length ? (
        <View style={styles.entries}>
          {entries.map((entry) => (
            <EntryCard key={entry.id} entry={entry} />
          ))}
        </View>
      ) : (
        <View style={styles.empty}>
          <AppText variant="heading" style={styles.emptySymbol}>
            ◌
          </AppText>
          <AppText variant="subheading">
            {selectedProvince ? `No stories from ${selectedProvince} yet` : 'A place for the first story'}
          </AppText>
          <AppText variant="caption" style={styles.emptyCopy}>
            {selectedProvince
              ? 'Choose another province or be the first to share a community contribution here.'
              : 'This collection is waiting for its first community contribution.'}
          </AppText>
          <Button onPress={refresh} variant="quiet">
            Refresh collection
          </Button>
        </View>
      )}
    </Page>
  );
}

const styles = StyleSheet.create({
  intro: { gap: 8, paddingTop: 10 },
  eyebrow: { color: colors.orange, fontWeight: '700', letterSpacing: 1.4 },
  description: { color: colors.muted, maxWidth: 480 },
  addButton: { alignSelf: 'flex-start' },
  regionSection: { gap: 10 },
  regionHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  regionCopy: { flex: 1, gap: 3 },
  changeProvince: { color: colors.orange },
  regionCard: {
    overflow: 'hidden',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.white,
  },
  regionButton: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  regionChevron: { color: colors.darkYellow, fontSize: 22 },
  provinces: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, padding: 12, backgroundColor: colors.babyYellow },
  provinceButton: {
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 18,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
  },
  selectedProvince: { backgroundColor: colors.lightYellow, borderColor: colors.darkYellow },
  provinceLabel: { color: colors.ink },
  selectedProvinceLabel: { color: colors.black, fontWeight: '700' },
  resultsHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  loader: { marginVertical: 28 },
  entries: { gap: 10 },
  empty: {
    alignItems: 'center',
    gap: 10,
    marginTop: 18,
    paddingHorizontal: 24,
    paddingVertical: 30,
    borderRadius: 22,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
  },
  emptySymbol: { color: colors.orange, fontSize: 32 },
  emptyCopy: { textAlign: 'center', maxWidth: 250, lineHeight: 20 },
});
