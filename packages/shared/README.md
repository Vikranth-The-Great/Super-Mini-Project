# @food-donation/shared

Shared constants, types, and utilities used by the web and mobile applications.

## Contents

### Constants

- **roles.ts**: User role constants (user, admin, delivery)
- **apiRoutes.ts**: API endpoint paths
- **donationStatus.ts**: Donation status values and helpers
- **errors.ts**: Error messages and codes
- **fieldNames.ts**: Form field names and labels

### Types

- **auth.ts**: Authentication-related types
- **donation.ts**: Donation model types
- **notification.ts**: Notification model types

### Utilities

- **validation.ts**: Input validation functions
- **formatters.ts**: Data formatting functions
- **errorParsing.ts**: Error handling and parsing

## Usage

```typescript
// Import from shared package
import { ROLE_USER, API_ROUTES, validateEmail } from '@food-donation/shared';
```

## Integration

This package is imported by:
- `apps/web/` - React web frontend
- `apps/mobile/` - React Native mobile app
