/**
 * index.tsx — Entry Route
 * =========================
 * Loading screen while _layout.tsx checks auth
 * and handles the redirect.
 */

import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Colors } from '../src/theme';

export default function Index() {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={Colors.accent.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
