/**
 * File: constants/Colors.ts
 * Purpose: Centralized light/dark color palette and semantic color tokens.
 * Exports: default color object containing light and dark theme values.
 */
const tintColorLight = '#22c55e';
const tintColorDark = '#16a34a';

export default {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
  },
};
