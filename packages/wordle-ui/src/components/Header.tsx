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
      {/* Botão de Modo Livre vs Diário */}
      <View style={styles.leftSection}>
        <Pressable
          accessibilityRole="button"
          onPress={() => onTogglePlayType(playType === 'daily' ? 'free' : 'daily')}
          style={({ pressed }) => [
            styles.typeToggle,
            {
              borderColor: theme.colors.border,
              backgroundColor: playType === 'daily' ? theme.colors.surface : 'transparent',
              opacity: pressed ? 0.7 : 1,
            },
          ]}
        >
          <Text
            style={{
              fontSize: 12,
              fontWeight: '700',
              color: playType === 'daily' ? theme.colors.primary : theme.colors.textMuted,
            }}
          >
            {playType === 'daily' ? '📅 DIÁRIO' : '♾️ LIVRE'}
          </Text>
        </Pressable>
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
  typeToggle: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
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
