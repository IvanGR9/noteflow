import { useNotesStore } from '../store/notesStore';
import { Colors } from '../constants/theme';

export const useTheme = () => {
  const isDarkMode = useNotesStore((s) => s.isDarkMode);
  return isDarkMode ? Colors.dark : Colors.light;
};
