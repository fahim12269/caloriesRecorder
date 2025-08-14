/**
 * File: app/(tabs)/index.tsx
 * Purpose: Dashboard screen showing today's totals for calories and macros.
 * Exports: DashboardScreen (default) – computes summaries for the current day.
 */
import { StyleSheet } from 'react-native';
import { Link } from 'expo-router';
import dayjs from 'dayjs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useMemo, useState } from 'react';
import { Text, View } from '@/components/Themed';

const STORAGE_KEY = 'calorie_journal_entries_v1';

type Entry = {
  id: string;
  date: string | Date;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  meal?: 'Breakfast' | 'Lunch' | 'Snack' | 'Dinner';
};

type Totals = { calories: number; protein: number; carbs: number; fat: number; fiber: number };

const MEALS: Array<NonNullable<Entry['meal']>> = ['Breakfast', 'Lunch', 'Snack', 'Dinner'];

const GOALS: Totals & { calories: number } = {
  calories: 1760,
  protein: 120,
  carbs: 230,
  fat: 50,
  fiber: 25,
};

/**
 * Computes the sum of today's entries and renders a quick overview with a table and charts.
 */
export default function DashboardScreen() {
  const todayLabel = dayjs().format('dddd, MMM D');
  const [entries, setEntries] = useState<Entry[]>([]);

  const loadToday = async () => {
    const json = await AsyncStorage.getItem(STORAGE_KEY);
    const list: Entry[] = json ? JSON.parse(json) : [];
    const start = dayjs().startOf('day');
    const end = dayjs().endOf('day');
    const todayEntries = list.filter((e) => dayjs(e.date).isAfter(start) && dayjs(e.date).isBefore(end));
    setEntries(todayEntries);
  };

  useEffect(() => {
    loadToday();
  }, []);

  const totals: Totals = useMemo(() => {
    return entries.reduce(
      (acc, e) => ({
        calories: acc.calories + (Number(e.calories) || 0),
        protein: acc.protein + (Number(e.protein) || 0),
        carbs: acc.carbs + (Number(e.carbs) || 0),
        fat: acc.fat + (Number(e.fat) || 0),
        fiber: acc.fiber + (Number(e.fiber) || 0),
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }
    );
  }, [entries]);

  const byMeal = useMemo(() => {
    const grouped: Record<string, Totals & { calories: number }> = {};
    MEALS.forEach((m) => (grouped[m] = { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }));
    entries.forEach((e) => {
      const key = e.meal && MEALS.includes(e.meal) ? e.meal : 'Snack';
      const g = grouped[key];
      g.calories += Number(e.calories) || 0;
      g.protein += Number(e.protein) || 0;
      g.carbs += Number(e.carbs) || 0;
      g.fat += Number(e.fat) || 0;
      g.fiber += Number(e.fiber) || 0;
    });
    return grouped;
  }, [entries]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dashboard</Text>
      <Text className="text-gray-500" style={{ marginBottom: 12 }}>{todayLabel}</Text>

      <Card>
        <TableHeader />
        {MEALS.map((m) => (
          <TableRow
            key={m}
            label={m}
            protein={byMeal[m].protein}
            fat={byMeal[m].fat}
            carbs={byMeal[m].carbs}
            fiber={byMeal[m].fiber}
            calories={byMeal[m].calories}
          />
        ))}
        <View style={{ height: 8 }} />
        <TableRow
          label="TOTAL"
          protein={totals.protein}
          fat={totals.fat}
          carbs={totals.carbs}
          fiber={totals.fiber}
          calories={totals.calories}
          bold
        />
        <TableRow
          label="GOALS"
          protein={GOALS.protein}
          fat={GOALS.fat}
          carbs={GOALS.carbs}
          fiber={GOALS.fiber}
          calories={GOALS.calories}
          muted
        />
      </Card>

      <Link href="/(tabs)/add" className="mt-6 w-full">
        <View className="w-full rounded-2xl p-4 items-center" lightColor="#22c55e" darkColor="#16a34a">
          <Text className="text-white font-semibold">Add Entry</Text>
        </View>
      </Link>
    </View>
  );
}

function Card({ children, style }: { children: React.ReactNode; style?: any }) {
  return (
    <View className="w-full rounded-2xl p-4" lightColor="#fff" darkColor="#111" style={style}>
      {children}
    </View>
  );
}

function TableHeader() {
  return (
    <View className="flex-row border-b border-gray-200 pb-2 mb-2">
      <Text style={{ width: 110 }} className="text-gray-500">Aug {dayjs().format('DD')}</Text>
      <Text style={{ width: 60 }} className="text-gray-500">Protein</Text>
      <Text style={{ width: 50 }} className="text-gray-500">Fat</Text>
      <Text style={{ width: 60 }} className="text-gray-500">Carbs</Text>
      <Text style={{ width: 50 }} className="text-gray-500">Fiber</Text>
      <Text style={{ marginLeft: 'auto' }} className="text-gray-500">Calories</Text>
    </View>
  );
}

function TableRow({ label, protein, fat, carbs, fiber, calories, bold, muted }: { label: string; protein: number; fat: number; carbs: number; fiber: number; calories: number; bold?: boolean; muted?: boolean }) {
  return (
    <View className="flex-row py-2 border-b border-gray-100">
      <Text style={{ width: 110 }} className={bold ? 'font-extrabold' : muted ? 'text-gray-500' : ''}>{label}</Text>
      <Text style={{ width: 60 }} className={bold ? 'font-semibold' : muted ? 'text-gray-500' : ''}>{protein}</Text>
      <Text style={{ width: 50 }} className={bold ? 'font-semibold' : muted ? 'text-gray-500' : ''}>{fat}</Text>
      <Text style={{ width: 60 }} className={bold ? 'font-semibold' : muted ? 'text-gray-500' : ''}>{carbs}</Text>
      <Text style={{ width: 50 }} className={bold ? 'font-semibold' : muted ? 'text-gray-500' : ''}>{fiber}</Text>
      <Text style={{ marginLeft: 'auto' }} className={bold ? 'font-semibold' : muted ? 'text-gray-500' : ''}>{calories}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    gap: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
  },
});
