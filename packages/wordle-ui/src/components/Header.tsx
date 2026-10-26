import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { GameMode } from 'wordle-engine';
import { useTheme } from '../ThemeProvider';

export type PlayType = 'free' | 'daily';

export interface HeaderProps {
  currentMode: GameMode;
  onSelectMode: (mode: GameMode) => void;
  playType: PlayType;
  onTogglePlayType: (type: PlayType) => void;
  onNewGamePress: () => void;
}

const MODES: { id: GameMode; label: string }[] = [
  { id: 'termo', label: 'TERMO' },
  { id: 'dueto', label: 'DUETO' },
  { id: 'quarteto', label: 'QUARTETO' },
];

export function Header({
  currentMode,
  onSelectMode,
  playType,
  onTogglePlayType,
  onNewGamePress,
}: HeaderProps) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          paddingHorizontal: theme.spacing.padding,
          borderBottomColor: theme.colors.border,
        },
      ]}
    >
      {/* Seletor Diário vs Livre */}
      <View style={styles.leftSection}>
        <View style={[styles.segmentedContainer, { borderColor: theme.colors.border }]}>
          <Pressable
            accessibilityRole="button"
            onPress={() => onTogglePlayType('daily')}
            style={({ pressed }) => [
              styles.segmentBtn,
              playType === 'daily' && { backgroundColor: theme.colors.primary },
              { opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <Text
              style={{
                fontSize: 11,
                fontWeight: '700',
                color: playType === 'daily' ? '#FFFFFF' : theme.colors.textMuted,
              }}
            >
              📅 DIÁRIO
            </Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={() => onTogglePlayType('free')}
            style={({ pressed }) => [
              styles.segmentBtn,
              playType === 'free' && { backgroundColor: theme.colors.primary },
              { opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <Text
              style={{
                fontSize: 11,
                fontWeight: '700',
                color: playType === 'free' ? '#FFFFFF' : theme.colors.textMuted,
              }}
            >
              ♾️ LIVRE
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Seletor de Modos (TERMO / DUETO / QUARTETO) */}
      <View style={styles.centerSection}>
        {MODES.map((m) => {
          const isActive = currentMode === m.id;
          return (
            <Pressable
              key={m.id}
              accessibilityRole="button"
              onPress={() => onSelectMode(m.id)}
              style={({ pressed }) => [
                styles.modeTab,
                isActive && {
                  borderBottomColor: theme.colors.primary,
                  borderBottomWidth: 3,
                },
                { opacity: pressed ? 0.7 : 1 },
              ]}
            >
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: isActive ? '800' : '600',
                  color: isActive ? theme.colors.text : theme.colors.textMuted,
                  letterSpacing: 1,
                }}
              >
                {m.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Botão de Nova Partida (Reset) */}
      <View style={styles.rightSection}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Nova Partida"
          onPress={onNewGamePress}
          style={({ pressed }) => [
            styles.newGameBtn,
            {
              backgroundColor: theme.colors.primary,
              opacity: pressed ? 0.7 : 1,
            },
          ]}
          hitSlop={8}
        >
          <Text style={styles.newGameIcon}>🔄</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  leftSection: {
    minWidth: 70,
    justifyContent: 'center',
  },
  segmentedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
    padding: 2,
    gap: 2,
  },
  segmentBtn: {
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  modeTab: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  rightSection: {
    minWidth: 70,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  newGameBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  newGameIcon: {
    fontSize: 14,
  },
});
