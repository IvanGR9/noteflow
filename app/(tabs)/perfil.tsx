import { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { useTheme } from '../../hooks/useTheme';
import { Colors, Typography, Spacing, Radius } from '../../constants/theme';

interface UserProfile {
  name: string;
  email: string;
  avatarUrl: string | null;
}

export default function PerfilScreen() {
  const colors = useTheme();
  const insets = useSafeAreaInsets();
  const uid = auth().currentUser?.uid;

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [localAvatar, setLocalAvatar] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) return;

    const unsubscribe = firestore()
      .collection('users')
      .doc(uid)
      .onSnapshot((doc) => {
        if (doc.exists) {
          setProfile(doc.data() as UserProfile);
        }
        setLoading(false);
      });

    return unsubscribe;
  }, [uid]);

  async function pickImage() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setLocalAvatar(result.assets[0].uri);
    }
  }

  const avatarUri = localAvatar ?? profile?.avatarUrl ?? null;
  const initial = profile?.name?.charAt(0).toUpperCase() ?? '?';

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={[
        styles.container,
        { paddingTop: insets.top + Spacing[6], paddingBottom: insets.bottom + Spacing[8] },
      ]}
    >
      <Text style={[styles.screenTitle, { color: colors.text }]}>Perfil</Text>

      {loading ? (
        <ActivityIndicator color={Colors.dark.accent} size="large" style={styles.loader} />
      ) : (
        <>
          <View style={styles.avatarSection}>
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <Text style={styles.avatarInitial}>{initial}</Text>
              </View>
            )}

            <TouchableOpacity
              style={[styles.changePhotoButton, { borderColor: Colors.dark.accent }]}
              onPress={pickImage}
              activeOpacity={0.75}
            >
              <Text style={styles.changePhotoText}>Cambiar foto de perfil</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.field}>
              <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Nombre</Text>
              <Text style={[styles.fieldValue, { color: colors.text }]}>
                {profile?.name ?? '—'}
              </Text>
            </View>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <View style={styles.field}>
              <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Email</Text>
              <Text style={[styles.fieldValue, { color: colors.text }]}>
                {profile?.email ?? '—'}
              </Text>
            </View>
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: Spacing[5],
    gap: Spacing[6],
  },
  screenTitle: {
    fontSize: Typography.size.xl,
    fontWeight: Typography.weight.bold,
  },
  loader: {
    marginTop: Spacing[16],
  },
  avatarSection: {
    alignItems: 'center',
    gap: Spacing[4],
    paddingVertical: Spacing[4],
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: Radius.full,
  },
  avatarPlaceholder: {
    backgroundColor: Colors.dark.accentMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontSize: Typography.size['2xl'],
    fontWeight: Typography.weight.bold,
    color: Colors.dark.accent,
  },
  changePhotoButton: {
    paddingHorizontal: Spacing[5],
    paddingVertical: Spacing[2],
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  changePhotoText: {
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.medium,
    color: Colors.dark.accent,
  },
  card: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  field: {
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[4],
    gap: Spacing[1],
  },
  fieldLabel: {
    fontSize: Typography.size.xs,
    fontWeight: Typography.weight.medium,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  fieldValue: {
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.regular,
  },
  divider: {
    height: 1,
    marginHorizontal: Spacing[4],
  },
});
