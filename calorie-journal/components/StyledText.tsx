/**
 * File: components/StyledText.tsx
 * Purpose: Example of a themed text variant with a monospaced font.
 * Exports: MonoText – applies the SpaceMono font to the themed Text component.
 */
import { Text, TextProps } from './Themed';

/**
 * Displays text using the SpaceMono font.
 */
export function MonoText(props: TextProps) {
  return <Text {...props} style={[props.style, { fontFamily: 'SpaceMono' }]} />;
}
