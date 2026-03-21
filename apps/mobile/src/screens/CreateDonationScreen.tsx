import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { DonationForm } from '../components';

export const CreateDonationScreen = () => {
  return (
    <ScrollView style={styles.container}>
      <DonationForm />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
