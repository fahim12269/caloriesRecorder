/**
 * File: components/Themed.tsx
 * Purpose: Light/Dark theme-aware Text and View components plus a color hook.
 * Exports: useThemeColor, Text, View and related prop types.
 */
/**
 * Learn more about Light and Dark modes:
 * https://docs.expo.io/guides/color-schemes/
 */

import * as React from 'react';
import { Text as DefaultText, View as DefaultView } from 'react-native';

import Colors from '@/constants/Colors';
import { useColorScheme } from './useColorScheme';

/**
 * Returns a theme-aware color value for the given semantic color name.
 */
export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark
) {
  const theme = useColorScheme() ?? 'light';
  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return Colors[theme][colorName];
  }
}

export type ThemeProps = {
  lightColor?: string;
  darkColor?: string;
  className?: string;
};

export type TextProps = ThemeProps & DefaultText['props'];
export type ViewProps = ThemeProps & DefaultView['props'];

/**
 * Theme-aware replacement for React Native Text that applies color and supports Tailwind className.
 */
export function Text(props: TextProps) {
  const { style, lightColor, darkColor, className, ...otherProps } = props;
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

  return (
    <DefaultText
      style={[{ color }, style]}
      {...otherProps}
      className={className as any}
    />
  );
}

/**
 * Theme-aware replacement for React Native View that applies background color and supports Tailwind className.
 */
export function View(props: ViewProps) {
  const { style, lightColor, darkColor, className, ...otherProps } = props;
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'background');

  return (
    <DefaultView
      style={[{ backgroundColor }, style]}
      {...otherProps}
      className={className as any}
    />
  );
}
