import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { pngRegions } from '@/constants/png-regions';
import { colors } from '@/constants/palette';
import { AppText } from '@/components/ui';

export function ProvincePicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (province: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [openRegion, setOpenRegion] = useState<string | null>(null);

  return (
    <View style={styles.container}>
      <AppText variant="label" style={styles.label}>
        Province
      </AppText>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: isOpen }}
        onPress={() => setIsOpen((open) => !open)}
        style={styles.trigger}>
        <AppText style={value ? styles.value : styles.placeholder}>
          {value || 'Choose a province'}
        </AppText>
        <AppText variant="label" style={styles.chevron}>
          {isOpen ? '⌃' : '⌄'}
        </AppText>
      </Pressable>
      {isOpen ? (
        <View style={styles.options}>
          {pngRegions.map((region) => {
            const expanded = openRegion === region.name;
            return (
              <View key={region.name}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ expanded }}
                  onPress={() => setOpenRegion(expanded ? null : region.name)}
                  style={styles.regionButton}>
                  <AppText variant="label">{region.name}</AppText>
                  <AppText style={styles.chevron}>{expanded ? '−' : '+'}</AppText>
                </Pressable>
                {expanded ? (
                  <View style={styles.provinceList}>
                    {region.provinces.map((province) => (
                      <Pressable
                        key={province}
                        accessibilityRole="button"
                        accessibilityState={{ selected: value === province }}
                        onPress={() => {
                          onChange(province);
                          setIsOpen(false);
                          setOpenRegion(null);
                        }}
                        style={[styles.provinceButton, value === province && styles.selectedProvince]}>
                        <AppText>{province}</AppText>
                      </Pressable>
                    ))}
                  </View>
                ) : null}
              </View>
            );
          })}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, gap: 8 },
  label: { color: colors.ink },
  trigger: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 14,
    backgroundColor: colors.white,
    paddingHorizontal: 15,
    paddingVertical: 13,
  },
  value: { flex: 1, color: colors.ink },
  placeholder: { flex: 1, color: colors.muted },
  chevron: { color: colors.darkYellow },
  options: {
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 14,
    backgroundColor: colors.white,
  },
  regionButton: {
    minHeight: 46,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  provinceList: { padding: 8, gap: 4, backgroundColor: colors.babyYellow },
  provinceButton: { paddingVertical: 10, paddingHorizontal: 12, borderRadius: 9 },
  selectedProvince: { backgroundColor: colors.lightYellow },
});
