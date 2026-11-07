import { Image } from 'expo-image';
import { router } from 'expo-router';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type ScrollViewProps,
  type TextInputProps,
  type TextProps,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors } from '@/constants/palette';
import type { CulturalEntry, EntryCategory } from '@/lib/types';

export function Page({
  children,
  contentStyle,
  ...scrollProps
}: ScrollViewProps & { children: React.ReactNode; contentStyle?: ViewStyle }) {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        {...scrollProps}
        style={styles.scroll}
        contentContainerStyle={[styles.pageContent, contentStyle]}>
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

export function AppText({
  children,
  style,
  variant = 'body',
  ...textProps
}: TextProps & {
  children: React.ReactNode;
  style?: TextStyle;
  variant?: 'body' | 'title' | 'heading' | 'subheading' | 'label' | 'caption';
}) {
  return (
    <Text {...textProps} style={[textStyles[variant], style]}>
      {children}
    </Text>
  );
}

export function Button({
  children,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
}: {
  children: React.ReactNode;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'quiet' | 'danger';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        buttonStyles[variant],
        style,
        (disabled || loading) && styles.buttonDisabled,
        pressed && !disabled && !loading && styles.pressed,
      ]}>
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' || variant === 'danger' ? colors.white : colors.green}
        />
      ) : (
        <AppText
          variant="label"
          style={{
            color: variant === 'primary' || variant === 'danger' ? colors.white : colors.green,
            textAlign: 'center',
          }}>
          {children}
        </AppText>
      )}
    </Pressable>
  );
}

export function Field({
  label,
  multiline = false,
  style,
  ...inputProps
}: TextInputProps & { label: string }) {
  return (
    <View style={styles.fieldWrap}>
      <AppText variant="label" style={styles.fieldLabel}>
        {label}
      </AppText>
      <TextInput
        {...inputProps}
        multiline={multiline}
        placeholderTextColor={colors.muted}
        selectionColor={colors.green}
        style={[styles.input, multiline && styles.multiline, style]}
      />
    </View>
  );
}

export function Banner({
  children,
  tone = 'info',
}: {
  children: React.ReactNode;
  tone?: 'info' | 'error' | 'success';
}) {
  return (
    <View style={[styles.banner, bannerStyles[tone]]}>
      <AppText
        variant="caption"
        style={{
          color: tone === 'error' ? colors.error : tone === 'success' ? colors.green : colors.ink,
          lineHeight: 19,
        }}>
        {children}
      </AppText>
    </View>
  );
}

export function SectionHeading({
  title,
  action,
  onAction,
}: {
  title: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <View style={styles.sectionHeading}>
      <AppText variant="subheading">{title}</AppText>
      {action && onAction ? (
        <Pressable onPress={onAction} hitSlop={8}>
          <AppText variant="label" style={{ color: colors.orange }}>
            {action}
          </AppText>
        </Pressable>
      ) : null}
    </View>
  );
}

export function TopBar({
  title = 'HAUS KULTURE',
  right,
}: {
  title?: string;
  right?: React.ReactNode;
}) {
  return (
    <View style={styles.topBar}>
      <View style={styles.brandMark}>
        <Image
          accessibilityLabel="Haus Kulture logo"
          contentFit="cover"
          source={require('@/assets/images/haus-kulture-mark.png')}
          style={styles.brandMarkImage}
        />
      </View>
      <View style={styles.brandCopy}>
        <AppText variant="label" style={styles.brandName}>
          {title}
        </AppText>
        <AppText variant="caption" style={styles.brandCaption}>
          PAPUA NEW GUINEA
        </AppText>
      </View>
      {right}
    </View>
  );
}

export function EntryCard({ entry }: { entry: CulturalEntry }) {
  const image = entry.media_type === 'image' ? entry.media_url : null;

  return (
    <Pressable
      onPress={() =>
        router.push({ pathname: '/(app)/entry/[id]', params: { id: entry.id } })
      }
      style={({ pressed }) => [styles.entryCard, pressed && styles.pressed]}>
      <View style={styles.entryImage}>
        {image ? (
          <Image source={{ uri: image }} contentFit="cover" style={StyleSheet.absoluteFill} />
        ) : (
          <>
            <View style={styles.entryImageOrb} />
            <AppText variant="heading" style={styles.entryImageSymbol}>
              {categorySymbol[entry.category]}
            </AppText>
          </>
        )}
      </View>
      <View style={styles.entryCopy}>
        <AppText variant="caption" style={styles.entryEyebrow}>
          {categoryLabel[entry.category]} · {entry.province || 'Papua New Guinea'}
        </AppText>
        <AppText variant="label" style={styles.entryTitle} numberOfLines={2}>
          {entry.title}
        </AppText>
        <AppText variant="caption" style={styles.entryMeta} numberOfLines={1}>
          {entry.community || 'Community archive'} {entry.language ? `· ${entry.language}` : ''}
        </AppText>
      </View>
      <Text style={styles.entryArrow}>›</Text>
    </Pressable>
  );
}

export const categoryLabel: Record<EntryCategory, string> = {
  song: 'SONG & STORY',
  attire: 'TRADITIONAL ATTIRE',
  dance: 'DANCE',
  place: 'PLACE',
};

const categorySymbol: Record<EntryCategory, string> = {
  song: '♫',
  attire: '✳',
  dance: '〰',
  place: '⌖',
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.paper },
  scroll: { flex: 1 },
  pageContent: {
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 36,
    gap: 20,
  },
  button: {
    minHeight: 50,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  buttonDisabled: { opacity: 0.5 },
  pressed: { opacity: 0.82 },
  fieldWrap: { gap: 8 },
  fieldLabel: { color: colors.ink },
  input: {
    minHeight: 52,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 14,
    backgroundColor: colors.white,
    color: colors.ink,
    paddingHorizontal: 15,
    paddingVertical: 13,
    fontSize: 15,
  },
  multiline: { minHeight: 112, textAlignVertical: 'top' },
  banner: { borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12 },
  sectionHeading: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  topBar: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 42 },
  brandMark: {
    width: 38,
    height: 38,
    borderRadius: 13,
    overflow: 'hidden',
  },
  brandMarkImage: { width: '100%', height: '100%' },
  brandCopy: { gap: 1, flex: 1 },
  brandName: { color: colors.green, letterSpacing: 1.4, fontSize: 11 },
  brandCaption: { color: colors.muted, fontSize: 9, letterSpacing: 1.5 },
  entryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    minHeight: 102,
    backgroundColor: colors.white,
    padding: 10,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.line,
  },
  entryImage: {
    width: 76,
    height: 78,
    overflow: 'hidden',
    borderRadius: 13,
    backgroundColor: colors.greenSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  entryImageOrb: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.yellow,
    opacity: 0.42,
    position: 'absolute',
    right: -4,
    top: -5,
  },
  entryImageSymbol: { color: colors.green, fontSize: 30 },
  entryCopy: { flex: 1, gap: 5 },
  entryEyebrow: { color: colors.orange, fontSize: 9, letterSpacing: 0.65 },
  entryTitle: { color: colors.ink, fontSize: 14, lineHeight: 20 },
  entryMeta: { color: colors.muted, fontSize: 11 },
  entryArrow: { color: colors.muted, fontSize: 25, marginRight: 4 },
});

const textStyles = StyleSheet.create({
  body: { color: colors.ink, fontSize: 15, lineHeight: 23 },
  title: { color: colors.ink, fontSize: 31, fontWeight: '700', lineHeight: 37, letterSpacing: -0.5 },
  heading: { color: colors.ink, fontSize: 23, fontWeight: '700', lineHeight: 29 },
  subheading: { color: colors.ink, fontSize: 18, fontWeight: '700', lineHeight: 24 },
  label: { color: colors.ink, fontSize: 14, fontWeight: '600' },
  caption: { color: colors.muted, fontSize: 12, lineHeight: 17 },
});

const buttonStyles = StyleSheet.create({
  primary: { backgroundColor: colors.green },
  secondary: { backgroundColor: colors.greenSoft },
  quiet: { backgroundColor: 'transparent' },
  danger: { backgroundColor: colors.error },
});

const bannerStyles = StyleSheet.create({
  info: { backgroundColor: colors.greenSoft },
  error: { backgroundColor: colors.errorSoft },
  success: { backgroundColor: colors.greenSoft },
});
