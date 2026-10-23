import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import type { MultiGamePhase } from 'wordle-engine';
import { useTheme } from '../ThemeProvider';

export interface EndGameModalProps {
  visible: boolean;
  phase: Extract<MultiGamePhase, 'won' | 'lost'>;
  attempts: number;
  maxAttempts?: number;
  targetWords: string[];
  title: string;
  message: string;
  ctaLabel: string;
  onClose: () => void;
  onPlayAgain: () => void;
}

export function EndGameModal({
  visible,
  phase,
  attempts,
  maxAttempts,
  targetWords,
  title,
  message,
  ctaLabel,
  onClose,
  onPlayAgain,
}: EndGameModalProps) {
  const theme = useTheme();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Fechar"
        onPress={onClose}
        style={[
          styles.backdrop,
          { backgroundColor: theme.colors.modal.backdrop },
        ]}
      >
        <Pressable
          onPress={(e) => e.stopPropagation()}
          style={[
            styles.surface,
            {
              backgroundColor: theme.colors.modal.surface,
              padding: theme.spacing.padding * 2,
            },
          ]}
        >
          <Text
            style={{
              fontSize: theme.typography.sizes.title,
              fontWeight: '700',
              color: theme.colors.text,
              fontFamily: theme.typography.fontFamily.title,
              marginBottom: 12,
              textAlign: 'center',
            }}
          >
            {title}
          </Text>

          <Text
            style={{
              fontSize: theme.typography.sizes.body,
              color: theme.colors.textMuted,
              textAlign: 'center',
              marginBottom: 16,
            }}
          >
            {message}
          </Text>

          {/* Palavras reveladas */}
          <View
            style={[
              styles.wordsBox,
              { backgroundColor: theme.colors.surface, marginBottom: 20 },
            ]}
          >
            <Text
              style={{
                fontSize: theme.typography.sizes.body - 2,
                color: theme.colors.textMuted,
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: 1,
                marginBottom: 8,
                textAlign: 'center',
              }}
            >
              {targetWords.length > 1
                ? 'Palavras corretas:'
                : 'Palavra correta:'}
            </Text>
            <View style={styles.targetList}>
              {targetWords.map((word, idx) => (
                <View key={idx} style={styles.targetBadge}>
                  <Text
                    style={{
                      fontSize: theme.typography.sizes.body + 2,
                      fontWeight: '800',
                      letterSpacing: 2,
                      color:
                        phase === 'won'
                          ? theme.colors.tile.correct
                          : theme.colors.tile.absent,
                    }}
                  >
                    {word.toUpperCase()}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={onPlayAgain}
            style={({ pressed }) => [
              styles.cta,
              {
                backgroundColor: theme.colors.primary,
                opacity: pressed ? 0.8 : 1,
              },
            ]}
          >
            <Text
              style={{
                color: '#FFFFFF',
                fontSize: theme.typography.sizes.body,
                fontWeight: '700',
              }}
            >
              {ctaLabel}
            </Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  surface: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 12,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  wordsBox: {
    padding: 12,
    borderRadius: 8,
  },
  targetList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  targetBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  cta: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
});
