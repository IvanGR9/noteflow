import { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Modal,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
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
  const router = useRouter();
  const uid = auth().currentUser?.uid;

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [localAvatar, setLocalAvatar] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [menuVisible, setMenuVisible] = useState(false);

  useEffect(() => {
    if (!uid) return;

    const unsubscribe = firestore()
      .collection('users')
      .doc(uid)
      .onSnapshot((doc) => {
        if (doc.exists) {
          const data = doc.data() as UserProfile;
          setProfile(data);
          if (!editingName) setNameInput(data.name ?? '');
        }
        setLoading(false);
      });

    return unsubscribe;
  }, [uid]);

  async function saveName() {
    setEditingName(false);
    const trimmed = nameInput.trim();
    if (!trimmed || !uid || trimmed === profile?.name) return;
    try {
      await firestore().collection('users').doc(uid).update({ name: trimmed });
    } catch (err) {
      console.error('Error saving name:', err);
    }
  }

  async function pickImage() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (result.canceled || !uid) return;

    const asset = result.assets[0];
    const fileName = asset.fileName ?? `avatar_${uid}.jpg`;
    const fileType = asset.mimeType ?? 'image/jpeg';

    setUploading(true);
    setSuccessMessage(null);

    try {
      const token = await auth().currentUser?.getIdToken();
      const presignedRes = await fetch(
        'https://noteflow-api-three.vercel.app/api/upload/presigned-url',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ fileName, fileType }),
        }
      );

      if (!presignedRes.ok) throw new Error('Error al obtener URL de subida');
      const { signedUrl, publicUrl } = await presignedRes.json();

      const imageBlob = await fetch(asset.uri).then((r) => r.blob());
      const s3Res = await fetch(signedUrl, {
        method: 'PUT',
        headers: { 'Content-Type': fileType },
        body: imageBlob,
      });

      if (!s3Res.ok) throw new Error('Error al subir la imagen a S3');

      await firestore().collection('users').doc(uid).update({ avatarUrl: publicUrl });

      setLocalAvatar(asset.uri);
      setSuccessMessage('Foto de perfil actualizada');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
    }
  }

  const avatarUri = localAvatar ?? profile?.avatarUrl ?? null;
  const initial = profile?.name?.charAt(0).toUpperCase() ?? '?';

  return (
    <>
      <ScrollView
        style={{ backgroundColor: colors.background }}
        contentContainerStyle={[
          styles.container,
          { paddingTop: insets.top + Spacing[6], paddingBottom: insets.bottom + Spacing[8] },
        ]}
      >
        <View style={styles.headerRow}>
          <Text style={[styles.screenTitle, { color: colors.text }]}>Perfil</Text>
          <TouchableOpacity
            onPress={() => setMenuVisible(true)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="ellipsis-vertical" size={20} color={colors.text} />
          </TouchableOpacity>
        </View>

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
                style={[styles.changePhotoButton, { borderColor: Colors.dark.accent, opacity: uploading ? 0.5 : 1 }]}
                onPress={pickImage}
                activeOpacity={0.75}
                disabled={uploading}
              >
                {uploading ? (
                  <ActivityIndicator size="small" color={Colors.dark.accent} />
                ) : (
                  <Text style={styles.changePhotoText}>Cambiar foto de perfil</Text>
                )}
              </TouchableOpacity>

              {successMessage && (
                <Text style={styles.successText}>{successMessage}</Text>
              )}
            </View>

            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.field}>
                <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Nombre</Text>
                {editingName ? (
                  <TextInput
                    style={[styles.fieldValue, styles.nameInput, { color: colors.text, borderBottomColor: Colors.dark.accent }]}
                    value={nameInput}
                    onChangeText={setNameInput}
                    onBlur={saveName}
                    onSubmitEditing={saveName}
                    autoFocus
                    returnKeyType="done"
                  />
                ) : (
                  <TouchableOpacity
                    style={styles.nameRow}
                    onPress={() => setEditingName(true)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.fieldValue, { color: colors.text }]}>
                      {profile?.name ?? '—'}
                    </Text>
                    <Ionicons name="pencil-outline" size={14} color={colors.textSecondary} />
                  </TouchableOpacity>
                )}
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

      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setMenuVisible(false)}>
          <View style={styles.menuOverlay}>
            <TouchableWithoutFeedback>
              <View
                style={[
                  styles.menuCard,
                  {
                    backgroundColor: colors.surfaceElevated,
                    borderColor: colors.border,
                    top: insets.top + Spacing[6] + Spacing[10],
                  },
                ]}
              >
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => { setMenuVisible(false); router.push('/ajustes'); }}
                  activeOpacity={0.7}
                >
                  <Ionicons name="settings-outline" size={16} color={colors.text} />
                  <Text style={[styles.menuItemText, { color: colors.text }]}>Ajustes</Text>
                </TouchableOpacity>

                <View style={[styles.menuDivider, { backgroundColor: colors.border }]} />

                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => { setMenuVisible(false); auth().signOut(); }}
                  activeOpacity={0.7}
                >
                  <Ionicons name="log-out-outline" size={16} color={Colors.dark.destructive} />
                  <Text style={[styles.menuItemText, { color: Colors.dark.destructive }]}>Cerrar sesión</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: Spacing[5],
    gap: Spacing[6],
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  successText: {
    fontSize: Typography.size.sm,
    color: Colors.dark.accent,
    fontWeight: Typography.weight.medium,
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
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
  },
  nameInput: {
    borderBottomWidth: 1,
    paddingVertical: 2,
    paddingHorizontal: 0,
  },
  divider: {
    height: 1,
    marginHorizontal: Spacing[4],
  },
  menuOverlay: {
    flex: 1,
  },
  menuCard: {
    position: 'absolute',
    right: Spacing[5],
    borderRadius: Radius.lg,
    borderWidth: 1,
    minWidth: 160,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[4],
  },
  menuItemText: {
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.medium,
  },
  menuDivider: {
    height: 1,
  },
});
