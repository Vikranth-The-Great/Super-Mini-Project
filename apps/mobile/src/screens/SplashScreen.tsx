import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { THEME } from '../config/env';

interface SplashScreenProps {
  onFinish?: () => void;
}

export const SplashScreen = ({ onFinish }: SplashScreenProps) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onFinish?.();
    }, 2000);

    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🍎 Food Donation</Text>
      <Text style={styles.subtitle}>Share the Surplus, Feed the Needy</Text>
      <ActivityIndicator size="large" color={THEME.colors.primary} style={styles.loader} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: THEME.colors.light,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: THEME.colors.dark,
    marginBottom: THEME.spacing.md,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: THEME.spacing.lg,
  },
  loader: {
    marginTop: THEME.spacing.lg,
  },
});
