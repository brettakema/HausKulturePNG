import { Link, router } from 'expo-router';
import { Image } from 'expo-image';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import { useAuth } from '@/context/auth-context';
import { colors } from '@/constants/palette';
import { Banner, Button, Field, AppText } from '@/components/ui';

export function AuthScreen({ mode }: { mode: 'login' | 'register' }) {
  const { isConfigured, signIn, signUp } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const isRegister = mode === 'register';

  const submit = async () => {
    setError('');
    setMessage('');
    if (!email.trim() || !password || (isRegister && !displayName.trim())) {
      setError('Please complete each field before continuing.');
      return;
    }
    if (isRegister && password.length < 8) {
      setError('Choose a password with at least 8 characters.');
      return;
    }

    setBusy(true);
    try {
      if (isRegister) {
        const signedIn = await signUp(email.trim(), password, displayName.trim());
        if (signedIn) router.replace('/(app)/(tabs)/home');
        else setMessage('Your account is ready. Check your email to confirm it, then sign in.');
      } else {
        await signIn(email.trim(), password);
        router.replace('/(app)/(tabs)/home');
      }
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Something went wrong. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboard}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Image
          accessibilityLabel="Haus Kulture PNG logo"
          contentFit="contain"
          source={require('@/assets/images/haus-kulture-logo.png')}
          style={styles.logo}
        />
        <AppText variant="title" style={styles.title}>
          {isRegister ? 'Join the circle.' : 'Welcome home.'}
        </AppText>
        <AppText style={styles.subtitle}>
          {isRegister
            ? 'Help keep the songs, stories and places of our communities close for generations to come.'
            : 'A living archive for the songs, stories and traditions of Papua New Guinea.'}
        </AppText>

        <View style={styles.form}>
          {!isConfigured ? (
            <Banner tone="info">
              Supabase is not connected yet. Add your project URL and public anon key to{' '}
              <AppText variant="label" style={{ color: colors.green }}>
                .env
              </AppText>{' '}
              to enable secure registration and sign in.
            </Banner>
          ) : null}
          {error ? <Banner tone="error">{error}</Banner> : null}
          {message ? <Banner tone="success">{message}</Banner> : null}

          {isRegister ? (
            <Field
              label="Your name"
              placeholder="Name you go by"
              value={displayName}
              onChangeText={setDisplayName}
              maxLength={80}
              autoCapitalize="words"
              returnKeyType="next"
            />
          ) : null}
          <Field
            label="Email address"
            placeholder="you@example.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            textContentType="emailAddress"
            returnKeyType="next"
          />
          <Field
            label="Password"
            placeholder={isRegister ? 'At least 8 characters' : 'Your password'}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
            autoComplete={isRegister ? 'new-password' : 'current-password'}
            textContentType={isRegister ? 'newPassword' : 'password'}
            returnKeyType="done"
          />
          <Button
            onPress={submit}
            loading={busy}
            disabled={!isConfigured}
            style={styles.submit}>
            {isRegister ? 'Create my account' : 'Sign in'}
          </Button>
          <View style={styles.switchRow}>
            <AppText variant="caption" style={{ color: colors.ink }}>
              {isRegister ? 'Already part of the circle?' : 'New to Haus Kulture?'}
            </AppText>
            <Link href={isRegister ? '/(auth)/login' : '/(auth)/register'} asChild>
              <Pressable>
                <AppText variant="label" style={styles.switchLink}>
                  {isRegister ? 'Sign in' : 'Create account'}
                </AppText>
              </Pressable>
            </Link>
          </View>
        </View>
        <AppText variant="caption" style={styles.footer}>
          Our stories belong to our communities.
        </AppText>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboard: { flex: 1, backgroundColor: colors.paper },
  content: {
    flexGrow: 1,
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
    justifyContent: 'center',
    padding: 26,
    paddingTop: 42,
    paddingBottom: 32,
    gap: 14,
  },
  logo: { width: 210, height: 210, marginBottom: 2 },
  title: { marginTop: 5 },
  subtitle: { color: colors.muted, fontSize: 15, lineHeight: 23, maxWidth: 390 },
  form: { gap: 16, marginTop: 15 },
  submit: { marginTop: 2 },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  switchLink: { color: colors.orange },
  footer: { textAlign: 'center', marginTop: 12 },
});
