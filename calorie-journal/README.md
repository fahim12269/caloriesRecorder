# Calorie Journal

A simple offline calorie tracker with macros and micros. Built with Expo Router, TypeScript, AsyncStorage, and NativeWind.

## Overview

Calorie Journal lets you quickly log meals and snacks, track daily calories, and see macro breakdowns (protein, carbs, fat). Data is stored locally using AsyncStorage, so it works offline.

- Dashboard: Today’s totals and macro summary
- Add Entry: Add calories with macro and micro nutrients (fiber, sugar, sodium) and notes
- History: Scrollable list of all entries with delete

## Getting Started

- Install dependencies: `npm i`
- Start the dev server: `npm run start`
- Run on Android: `npm run android`
- Run on iOS: `npm run ios` (use Expo Go if you don’t have a Mac)
- Run on Web: `npm run web`

## Project Structure

```
app/
  _layout.tsx            # App root layout, fonts, splash, theme provider
  +html.tsx              # Web document shell for SSR
  +not-found.tsx         # Fallback route
  modal.tsx              # Example modal screen
  (tabs)/                # Tab navigator
    _layout.tsx          # Tabs config (Dashboard, Add, History)
    index.tsx            # Dashboard screen (today’s totals)
    add.tsx              # Add entry screen
    history.tsx          # History list with delete
components/
  Themed.tsx             # Theme-aware Text and View
  StyledText.tsx         # Monospace text example
  ExternalLink.tsx       # External link wrapper
  useColorScheme*.ts     # Color scheme hooks (web/native)
  useClientOnlyValue*.ts # SSR-safe client value hook
constants/
  Colors.ts              # Centralized color tokens
```

## Data Storage

- Entries are stored under the key `calorie_journal_entries_v1` in AsyncStorage.
- Each entry has: `id`, `date`, `name`, `calories`, `protein`, `carbs`, `fat`, plus optional `fiber`, `sugar`, `sodium`, and `notes`.

## Tech Stack

- Expo Router, React Native, TypeScript
- NativeWind (Tailwind for RN)
- AsyncStorage for local persistence
- Day.js for dates
- React Hook Form + Zod for validation

## Scripts

- `npm run start` – Start Expo dev server
- `npm run android` – Open on Android
- `npm run ios` – Open on iOS
- `npm run web` – Open on web
- `npm test` – Run tests (jest-expo)

## License

MIT