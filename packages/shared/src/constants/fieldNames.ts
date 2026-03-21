/**
 * Form field names and labels - prevents typos and enables consistency
 */

export const FIELD_NAMES = {
  // Common fields
  NAME: 'name',
  EMAIL: 'email',
  PASSWORD: 'password',
  CONFIRM_PASSWORD: 'confirmPassword',
  PHONE_NUMBER: 'phoneno',
  PHONE: 'phone',
  CITY: 'city',
  ADDRESS: 'address',
  LATITUDE: 'latitude',
  LONGITUDE: 'longitude',

  // User fields
  GENDER: 'gender',

  // Donation fields
  FOOD_NAME: 'food',
  FOOD_TYPE: 'type',
  CATEGORY: 'category',
  QUANTITY: 'quantity',
  LOCATION: 'location',
  EXPIRY_DATE: 'expiryDate',
  EXPIRY_TIME: 'expiryTime',
  DONOR_NAME: 'donorName',

  // Admin/NGO fields
  ORGANIZATION_NAME: 'name',
  ORGANIZATION_ADDRESS: 'address',
  ORGANIZATION_LOCATION: 'location',

  // Delivery fields
  DELIVERY_CITY: 'city',
} as const;

export const FIELD_LABELS: Record<string, string> = {
  [FIELD_NAMES.NAME]: 'Full Name',
  [FIELD_NAMES.EMAIL]: 'Email Address',
  [FIELD_NAMES.PASSWORD]: 'Password',
  [FIELD_NAMES.CONFIRM_PASSWORD]: 'Confirm Password',
  [FIELD_NAMES.PHONE_NUMBER]: 'Phone Number',
  [FIELD_NAMES.CITY]: 'City',
  [FIELD_NAMES.ADDRESS]: 'Address',
  [FIELD_NAMES.GENDER]: 'Gender',
  [FIELD_NAMES.FOOD_NAME]: 'Food Name',
  [FIELD_NAMES.FOOD_TYPE]: 'Food Type',
  [FIELD_NAMES.CATEGORY]: 'Category',
  [FIELD_NAMES.QUANTITY]: 'Quantity',
  [FIELD_NAMES.LOCATION]: 'Location',
  [FIELD_NAMES.LATITUDE]: 'Latitude',
  [FIELD_NAMES.LONGITUDE]: 'Longitude',
  [FIELD_NAMES.EXPIRY_DATE]: 'Expiry Date',
  [FIELD_NAMES.EXPIRY_TIME]: 'Expiry Time',
};

export const GENDER_OPTIONS = [
  { label: 'Male', value: 'M' },
  { label: 'Female', value: 'F' },
  { label: 'Other', value: 'O' },
];

export const FOOD_CATEGORIES = [
  { label: 'Cooked Food', value: 'cooked' },
  { label: 'Raw Ingredients', value: 'raw' },
  { label: 'Fruits & Vegetables', value: 'produce' },
  { label: 'Dairy & Eggs', value: 'dairy' },
  { label: 'Bakery', value: 'bakery' },
  { label: 'Other', value: 'other' },
];
