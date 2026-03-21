import React, { useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useLocation } from '../hooks';
import { donationApi } from '../api/donations';
import { THEME } from '../config/env';
import type { DonationCreatePayload } from '@food-donation/shared/types';

interface DonationFormProps {
  onSuccess?: () => void;
}

const FOOD_TYPES = [
  { label: 'Veg', value: 'veg' },
  { label: 'Non-Veg', value: 'non-veg' },
] as const;

const FOOD_CATEGORIES = [
  { label: 'Raw Food', value: 'raw-food' },
  { label: 'Cooked Food', value: 'cooked-food' },
  { label: 'Packed Food', value: 'packed-food' },
] as const;

const pad = (value: number) => String(value).padStart(2, '0');

const formatDate = (date: Date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
const formatTime = (date: Date) => `${pad(date.getHours())}:${pad(date.getMinutes())}`;

export const DonationForm = ({ onSuccess }: DonationFormProps) => {
  const { location, requestLocation, isLoading: locationLoading } = useLocation();
  const [loading, setLoading] = React.useState(false);
  const [showDatePicker, setShowDatePicker] = React.useState(false);
  const [showTimePicker, setShowTimePicker] = React.useState(false);
  const [selectedDate, setSelectedDate] = React.useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = React.useState<Date>(new Date());

  const [formData, setFormData] = React.useState({
    food: '',
    type: 'veg',
    category: 'cooked-food',
    quantity: '',
    phoneno: '',
    location: '',
    address: '',
    expiryDate: '',
    expiryTime: '',
    latitude: '',
    longitude: '',
  });

  useEffect(() => {
    if (location) {
      setFormData((prev) => ({
        ...prev,
        latitude: location.latitude.toFixed(6),
        longitude: location.longitude.toFixed(6),
      }));
    }
  }, [location]);

  const handleGetLocation = async () => {
    await requestLocation();
  };

  const handleDateChange = (event: DateTimePickerEvent, date?: Date) => {
    setShowDatePicker(false);
    if (!date || event.type === 'dismissed') return;

    setSelectedDate(date);
    setFormData((prev) => ({ ...prev, expiryDate: formatDate(date) }));
  };

  const handleTimeChange = (event: DateTimePickerEvent, date?: Date) => {
    setShowTimePicker(false);
    if (!date || event.type === 'dismissed') return;

    setSelectedTime(date);
    setFormData((prev) => ({ ...prev, expiryTime: formatTime(date) }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (
        !formData.food ||
        !formData.type ||
        !formData.category ||
        !formData.quantity ||
        !formData.phoneno ||
        !formData.location ||
        !formData.address ||
        !formData.expiryDate ||
        !formData.expiryTime
      ) {
        Alert.alert('Error', 'Please fill all required fields');
        return;
      }

      const payload: DonationCreatePayload = {
        food: formData.food,
        type: formData.type,
        category: formData.category,
        quantity: formData.quantity,
        phoneno: formData.phoneno,
        location: formData.location,
        address: formData.address,
        expiryDate: formData.expiryDate,
        expiryTime: formData.expiryTime,
        latitude: formData.latitude ? parseFloat(formData.latitude) : undefined,
        longitude: formData.longitude ? parseFloat(formData.longitude) : undefined,
      };

      await donationApi.create(payload);
      Alert.alert('Success', 'Donation created successfully');
      onSuccess?.();
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to create donation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.title}>Donate Food</Text>

      <Text style={styles.label}>Food Name *</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g., Biryani, Vegetables"
        value={formData.food}
        onChangeText={(text) => setFormData({ ...formData, food: text })}
        editable={!loading}
      />

      <Text style={styles.label}>Food Type *</Text>
      <View style={styles.optionRow}>
        {FOOD_TYPES.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[styles.optionChip, formData.type === option.value && styles.optionChipSelected]}
            onPress={() => setFormData({ ...formData, type: option.value })}
            disabled={loading}
          >
            <Text style={[styles.optionText, formData.type === option.value && styles.optionTextSelected]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Category *</Text>
      <View style={styles.optionRowWrap}>
        {FOOD_CATEGORIES.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[styles.optionChip, formData.category === option.value && styles.optionChipSelected]}
            onPress={() => setFormData({ ...formData, category: option.value })}
            disabled={loading}
          >
            <Text style={[styles.optionText, formData.category === option.value && styles.optionTextSelected]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Quantity *</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g., 5 plates"
        value={formData.quantity}
        onChangeText={(text) => setFormData({ ...formData, quantity: text })}
        editable={!loading}
      />

      <Text style={styles.label}>Phone Number *</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g., 9876543210"
        keyboardType="phone-pad"
        value={formData.phoneno}
        onChangeText={(text) => setFormData({ ...formData, phoneno: text })}
        editable={!loading}
      />

      <Text style={styles.label}>City/Area *</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g., Bengaluru"
        value={formData.location}
        onChangeText={(text) => setFormData({ ...formData, location: text })}
        editable={!loading}
      />

      <Text style={styles.label}>Address *</Text>
      <TextInput
        style={[styles.input, { minHeight: 80 }]}
        placeholder="Full address"
        value={formData.address}
        onChangeText={(text) => setFormData({ ...formData, address: text })}
        multiline
        editable={!loading}
      />

      <Text style={styles.label}>Get Current Location</Text>
      <TouchableOpacity
        style={[styles.button, styles.secondaryButton, locationLoading && styles.buttonDisabled]}
        onPress={handleGetLocation}
        disabled={locationLoading || loading}
      >
        {locationLoading ? (
          <ActivityIndicator color={THEME.colors.primary} />
        ) : (
          <Text style={styles.secondaryButtonText}>{location ? '📍 Location Updated' : '📍 Get My Location'}</Text>
        )}
      </TouchableOpacity>

      {location && (
        <Text style={styles.locationText}>
          Lat: {location.latitude.toFixed(4)}, Lon: {location.longitude.toFixed(4)}
        </Text>
      )}

      <Text style={styles.label}>Expiry Date *</Text>
      <TouchableOpacity style={styles.inputButton} onPress={() => setShowDatePicker(true)} disabled={loading}>
        <Text style={formData.expiryDate ? styles.inputButtonText : styles.inputButtonPlaceholder}>
          {formData.expiryDate || 'Select expiry date'}
        </Text>
      </TouchableOpacity>

      <Text style={styles.label}>Expiry Time *</Text>
      <TouchableOpacity style={styles.inputButton} onPress={() => setShowTimePicker(true)} disabled={loading}>
        <Text style={formData.expiryTime ? styles.inputButtonText : styles.inputButtonPlaceholder}>
          {formData.expiryTime || 'Select expiry time'}
        </Text>
      </TouchableOpacity>

      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          minimumDate={new Date()}
          onChange={handleDateChange}
        />
      )}

      {showTimePicker && (
        <DateTimePicker
          value={selectedTime}
          mode="time"
          is24Hour
          onChange={handleTimeChange}
        />
      )}

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Donate Now</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: THEME.spacing.lg,
  },
  contentContainer: {
    paddingBottom: THEME.spacing.xl,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: THEME.spacing.lg,
    color: THEME.colors.dark,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.colors.dark,
    marginBottom: THEME.spacing.sm,
    marginTop: THEME.spacing.md,
  },
  input: {
    borderWidth: 1,
    borderColor: THEME.colors.border,
    borderRadius: THEME.borderRadius.md,
    padding: THEME.spacing.md,
    fontSize: 16,
  },
  inputButton: {
    borderWidth: 1,
    borderColor: THEME.colors.border,
    borderRadius: THEME.borderRadius.md,
    padding: THEME.spacing.md,
    justifyContent: 'center',
  },
  inputButtonText: {
    color: THEME.colors.dark,
    fontSize: 16,
  },
  inputButtonPlaceholder: {
    color: '#888',
    fontSize: 16,
  },
  optionRow: {
    flexDirection: 'row',
    gap: THEME.spacing.sm,
  },
  optionRowWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: THEME.spacing.sm,
  },
  optionChip: {
    borderWidth: 1,
    borderColor: THEME.colors.border,
    borderRadius: THEME.borderRadius.md,
    paddingVertical: THEME.spacing.sm,
    paddingHorizontal: THEME.spacing.md,
    backgroundColor: '#fff',
  },
  optionChipSelected: {
    borderColor: THEME.colors.primary,
    backgroundColor: '#FFF0F0',
  },
  optionText: {
    color: THEME.colors.dark,
    fontWeight: '500',
  },
  optionTextSelected: {
    color: THEME.colors.primary,
    fontWeight: '700',
  },
  button: {
    backgroundColor: THEME.colors.success,
    padding: THEME.spacing.md,
    borderRadius: THEME.borderRadius.md,
    alignItems: 'center',
    marginTop: THEME.spacing.lg,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: THEME.colors.primary,
  },
  secondaryButtonText: {
    color: THEME.colors.primary,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  locationText: {
    fontSize: 12,
    color: THEME.colors.success,
    marginTop: THEME.spacing.sm,
  },
});
