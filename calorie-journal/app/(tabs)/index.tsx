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

  const macroPie = [
    { key: 'Protein', value: totals.protein, color: '#22c55e' },
    { key: 'Carbs', value: totals.carbs, color: '#3b82f6' },
    { key: 'Fat', value: totals.fat, color: '#f59e0b' },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dashboard</Text>
      <Text className="text-gray-500" style={{ marginBottom: 12 }}>{todayLabel}</Text>

      <Card>
        <Text className="text-xl font-semibold">Today</Text>
        <Text className="text-4xl font-extrabold mt-2">{totals.calories} kcal</Text>
        <View className="flex-row gap-3 mt-4">
          <Stat label="Protein" value={`${totals.protein} g`} color="#22c55e" progress={totals.protein / GOALS.protein} />
          <Stat label="Carbs" value={`${totals.carbs} g`} color="#3b82f6" progress={totals.carbs / GOALS.carbs} />
          <Stat label="Fat" value={`${totals.fat} g`} color="#f59e0b" progress={totals.fat / GOALS.fat} />
        </View>
      </Card>

      <Card>
        <Text className="text-lg font-semibold mb-3">Meals</Text>
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

      <View className="flex-row gap-12 items-center justify-between">
        <Card style={{ flex: 1 }}>
          <Text className="text-lg font-semibold mb-3">Macro split</Text>
          <BarChart data={macroPie} />
          <View className="mt-4">
            {macroPie.map((s) => (
              <View key={s.key} className="flex-row items-center mb-1">
                <View style={{ width: 10, height: 10, backgroundColor: s.color, borderRadius: 2, marginRight: 8 }} />
                <Text className="text-gray-500">{s.key}</Text>
                <Text style={{ marginLeft: 'auto' }}>{s.value} g</Text>
              </View>
            ))}
          </View>
        </Card>

        <Card style={{ flex: 1 }}>
          <Text className="text-lg font-semibold mb-3">Calories progress</Text>
          <Progress value={totals.calories} goal={GOALS.calories} color="#ef4444" />
          <Text className="mt-2 text-gray-500">Goal: {GOALS.calories} kcal</Text>
        </Card>
      </View>

      <Card>
        <Text className="text-lg font-semibold mb-3">Calories by meal</Text>
        <HorizontalBars
          items={MEALS.map((m) => ({ label: m, value: byMeal[m].calories, color: '#9ca3af' }))}
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

function Stat({ label, value, color, progress }: { label: string; value: string; color: string; progress: number }) {
  return (
    <View style={{ flex: 1 }}>
      <Text className="text-xs text-gray-500">{label}</Text>
      <Text className="text-lg font-semibold mb-1">{value}</Text>
      <View style={{ height: 6, backgroundColor: '#e5e7eb', borderRadius: 999 }}>
        <View style={{ height: 6, width: `${Math.min(100, Math.max(0, progress * 100))}%`, backgroundColor: color, borderRadius: 999 }} />
      </View>
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
    <View className="flex-row py-2">
      <Text style={{ width: 110 }} className={bold ? 'font-extrabold' : muted ? 'text-gray-500' : ''}>{label}</Text>
      <Text style={{ width: 60 }} className={bold ? 'font-semibold' : muted ? 'text-gray-500' : ''}>{protein}</Text>
      <Text style={{ width: 50 }} className={bold ? 'font-semibold' : muted ? 'text-gray-500' : ''}>{fat}</Text>
      <Text style={{ width: 60 }} className={bold ? 'font-semibold' : muted ? 'text-gray-500' : ''}>{carbs}</Text>
      <Text style={{ width: 50 }} className={bold ? 'font-semibold' : muted ? 'text-gray-500' : ''}>{fiber}</Text>
      <Text style={{ marginLeft: 'auto' }} className={bold ? 'font-semibold' : muted ? 'text-gray-500' : ''}>{calories}</Text>
    </View>
  );
}

function Progress({ value, goal, color }: { value: number; goal: number; color: string }) {
  const pct = Math.min(100, Math.max(0, (value / goal) * 100));
  return (
    <View>
      <View style={{ height: 16, backgroundColor: '#e5e7eb', borderRadius: 999 }}>
        <View style={{ height: 16, width: `${pct}%`, backgroundColor: color, borderRadius: 999 }} />
      </View>
      <Text className="mt-1 text-right text-gray-500">{Math.round(pct)}%</Text>
    </View>
  );
}

function BarChart({ data }: { data: Array<{ key: string; value: number; color: string }> }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <View style={{ height: 140, flexDirection: 'row', alignItems: 'flex-end', gap: 12 }}>
      {data.map((d) => (
        <View key={d.key} style={{ flex: 1, alignItems: 'center' }}>
          <View style={{ width: '100%', height: (d.value / max) * 120, backgroundColor: d.color, borderRadius: 8 }} />
          <Text className="text-xs mt-1 text-gray-500">{d.key}</Text>
        </View>
      ))}
    </View>
  );
}

function HorizontalBars({ items }: { items: Array<{ label: string; value: number; color?: string }> }) {
  const max = Math.max(...items.map((i) => i.value), 1);
  return (
    <View style={{ gap: 8 }}>
      {items.map((i) => (
        <View key={i.label}>
          <View className="flex-row mb-1">
            <Text className="text-gray-500">{i.label}</Text>
            <Text style={{ marginLeft: 'auto' }}>{i.value} kcal</Text>
          </View>
          <View style={{ height: 12, backgroundColor: '#e5e7eb', borderRadius: 999 }}>
            <View style={{ height: 12, width: `${(i.value / max) * 100}%`, backgroundColor: i.color || '#9ca3af', borderRadius: 999 }} />
          </View>
        </View>
      ))}
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
