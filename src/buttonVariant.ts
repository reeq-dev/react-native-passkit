import type { AndroidVariant } from './types';

const LEGACY_ANDROID_VARIANTS: readonly string[] = [
  'dark',
  'light',
  'light-outline',
];
const warnedLegacyVariants = new Set<string>();

/**
 * Maps the public Android variant to the native one. The old "Save to Google
 * Pay" styles render the primary Google Wallet button (Google only allows the
 * black button) and warn once in development.
 */
export const resolveAndroidVariant = (
  variant?: AndroidVariant
): 'primary' | 'condensed' => {
  if (variant === 'condensed') {
    return 'condensed';
  }
  if (
    __DEV__ &&
    variant &&
    LEGACY_ANDROID_VARIANTS.includes(variant) &&
    !warnedLegacyVariants.has(variant)
  ) {
    warnedLegacyVariants.add(variant);
    console.warn(
      `[@reeq/react-native-passkit] AddPassButton variant.android '${variant}' is deprecated. ` +
        "Google Wallet only allows the black button: use 'primary' or 'condensed'."
    );
  }
  return 'primary';
};
