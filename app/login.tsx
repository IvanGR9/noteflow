import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { Colors, Typography, Spacing, Radius } from '../constants/theme';

const C = Colors.dark;

function mapFirebaseError(code: string): string {
  switch (code) {
    case 'auth/invalid-email':
      return 'El email no es válido.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Email o contraseña incorrectos.';
    case 'auth/email-already-in-use':
      return 'Este email ya está en uso.';
    case 'auth/weak-password':
      return 'La contraseña debe tener al menos 6 caracteres.';
    case 'auth/too-many-requests':
      return 'Demasiados intentos. Inténtalo más tarde.';
    case 'auth/network-request-failed':
      return 'Sin conexión. Revisa tu red.';
    default:
      return 'Ha ocurrido un error. Inténtalo de nuevo.';
  }
}

export default function LoginScreen() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: '315905142183-19edqim3uvhdla20qcps340prst2t7j2.apps.googleusercontent.com',
    });
  }, []);

  function toggleMode() {
    setMode((m) => (m === 'login' ? 'register' : 'login'));
    setError('');
  }

  async function handleSubmit() {
    setError('');
    if (!email.trim() || !password.trim()) {
      setError('Rellena todos los campos.');
      return;
    }
    if (mode === 'register' && !name.trim()) {
      setError('Introduce tu nombre.');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'login') {
        await auth().signInWithEmailAndPassword(email.trim(), password);
      } else {
        const credential = await auth().createUserWithEmailAndPassword(
          email.trim(),
          password
        );
        await firestore()
          .collection('users')
          .doc(credential.user.uid)
          .set({
            name: name.trim(),
            email: email.trim(),
            createdAt: firestore.FieldValue.serverTimestamp(),
            avatarUrl: null,
          });
      }
    } catch (e: any) {
      setError(mapFirebaseError(e.code ?? ''));
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    setError('');
    setLoadingGoogle(true);
    try {
      await GoogleSignin.hasPlayServices();
      await GoogleSignin.signOut();
      const result = await GoogleSignin.signIn();
      console.log('Google signIn result:', JSON.stringify(result, null, 2));
      const { idToken } = result.data;
      const credential = auth.GoogleAuthProvider.credential(idToken);
      const userCredential = await auth().signInWithCredential(credential);

      if (userCredential.additionalUserInfo?.isNewUser) {
        await firestore()
          .collection('users')
          .doc(userCredential.user.uid)
          .set({
            name: userCredential.user.displayName ?? '',
            email: userCredential.user.email ?? '',
            createdAt: firestore.FieldValue.serverTimestamp(),
            avatarUrl: null,
          });
      }
    } catch (e: any) {
      console.error('GoogleSignIn error:', e, JSON.stringify(e));
      if (e.code === statusCodes.SIGN_IN_CANCELLED) return;
      setError(mapFirebaseError(e.code ?? ''));
    } finally {
      setLoadingGoogle(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>noteflow</Text>
          <Text style={styles.subtitle}>
            {mode === 'login' ? 'Bienvenido de nuevo' : 'Crea tu cuenta'}
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {mode === 'register' && (
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Nombre</Text>
              <TextInput
                style={styles.input}
                placeholder="Tu nombre"
                placeholderTextColor={C.textMuted}
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                returnKeyType="next"
              />
            </View>
          )}

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="tu@email.com"
              placeholderTextColor={C.textMuted}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Contraseña</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor={C.textMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              returnKeyType="done"
              onSubmitEditing={handleSubmit}
            />
          </View>

          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <TouchableOpacity
            style={[styles.primaryButton, loading && styles.primaryButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryButtonText}>
                {mode === 'login' ? 'Entrar' : 'Crear cuenta'}
              </Text>
            )}
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>o</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Google Sign-In */}
          <TouchableOpacity
            style={[styles.googleButton, loadingGoogle && styles.primaryButtonDisabled]}
            onPress={handleGoogleSignIn}
            disabled={loadingGoogle || loading}
            activeOpacity={0.85}
          >
            {loadingGoogle ? (
              <ActivityIndicator color={C.text} />
            ) : (
              <>
                <Text style={styles.googleIcon}>G</Text>
                <Text style={styles.googleButtonText}>Continuar con Google</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Toggle mode */}
        <View style={styles.toggle}>
          <Text style={styles.toggleText}>
            {mode === 'login' ? '¿No tienes cuenta? ' : '¿Ya tienes cuenta? '}
          </Text>
          <TouchableOpacity onPress={toggleMode}>
            <Text style={styles.toggleLink}>
              {mode === 'login' ? 'Regístrate' : 'Inicia sesión'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: C.background,
  },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing[6],
    paddingVertical: Spacing[10],
  },
  header: {
    marginBottom: Spacing[8],
    alignItems: 'center',
  },
  logo: {
    fontSize: Typography.size['2xl'],
    fontWeight: Typography.weight.bold,
    color: C.accent,
    letterSpacing: -0.5,
    marginBottom: Spacing[2],
  },
  subtitle: {
    fontSize: Typography.size.base,
    color: C.textSecondary,
  },
  form: {
    gap: Spacing[4],
  },
  fieldGroup: {
    gap: Spacing[1],
  },
  label: {
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.medium,
    color: C.textSecondary,
    marginLeft: Spacing[1],
  },
  input: {
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
    fontSize: Typography.size.base,
    color: C.text,
  },
  errorBox: {
    backgroundColor: '#2d1010',
    borderWidth: 1,
    borderColor: C.destructive,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
  },
  errorText: {
    fontSize: Typography.size.sm,
    color: C.destructive,
  },
  primaryButton: {
    backgroundColor: C.accent,
    borderRadius: Radius.md,
    paddingVertical: Spacing[4],
    alignItems: 'center',
    marginTop: Spacing[1],
  },
  primaryButtonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.semibold,
    color: '#ffffff',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
    marginVertical: Spacing[1],
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: C.border,
  },
  dividerText: {
    fontSize: Typography.size.sm,
    color: C.textMuted,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing[3],
    backgroundColor: C.surfaceElevated,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: Radius.md,
    paddingVertical: Spacing[4],
  },
  googleIcon: {
    fontSize: Typography.size.md,
    fontWeight: Typography.weight.bold,
    color: '#4285F4',
  },
  googleButtonText: {
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.medium,
    color: C.text,
  },
  toggle: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: Spacing[8],
  },
  toggleText: {
    fontSize: Typography.size.sm,
    color: C.textSecondary,
  },
  toggleLink: {
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.semibold,
    color: C.accent,
  },
});
