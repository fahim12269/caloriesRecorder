import { StyleSheet } from 'react-native';
import { Link } from 'expo-router';
import dayjs from 'dayjs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
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
};

export default function DashboardScreen() {
  const today = dayjs().format('dddd, MMM D');
  const [totals, setTotals] = useState({ calories: 0, protein: 0, carbs: 0, fat: 0 });

  const loadTodayTotals = async () => {
    const json = await AsyncStorage.getItem(STORAGE_KEY);
    const list: Entry[] = json ? JSON.parse(json) : [];
    const start = dayjs().startOf('day');
    const end = dayjs().endOf('day');
    const todayEntries = list.filter((e) => dayjs(e.date).isAfter(start) && dayjs(e.date).isBefore(end));
    const sum = todayEntries.reduce(
      (acc, e) => ({
        calories: acc.calories + (Number(e.calories) || 0),
        protein: acc.protein + (Number(e.protein) || 0),
        carbs: acc.carbs + (Number(e.carbs) || 0),
        fat: acc.fat + (Number(e.fat) || 0),
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
    setTotals(sum);
  };

  useEffect(() => {
    loadTodayTotals();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Today</Text>
      <Text className="text-gray-500" style={{ marginBottom: 12 }}>{today}</Text>

      <View className="w-full rounded-2xl p-4" lightColor="#fff" darkColor="#111">
        <Text className="text-xl font-semibold">Calories</Text>
        <Text className="text-4xl font-extrabold mt-2">{totals.calories} kcal</Text>
        <View className="flex-row justify-between mt-4">
          <View className="items-center flex-1">
            <Text className="text-xs text-gray-500">Protein</Text>
            <Text className="text-lg font-semibold">{totals.protein} g</Text>
          </View>
          <View className="items-center flex-1">
            <Text className="text-xs text-gray-500">Carbs</Text>
            <Text className="text-lg font-semibold">{totals.carbs} g</Text>
          </View>
          <View className="items-center flex-1">
            <Text className="text-xs text-gray-500">Fat</Text>
            <Text className="text-lg font-semibold">{totals.fat} g</Text>
          </View>
        </View>
      </View>

      <Link href="/(tabs)/add" className="mt-6 w-full">
        <View className="w-full rounded-2xl p-4 items-center" lightColor="#22c55e" darkColor="#16a34a">
          <Text className="text-white font-semibold">Add Entry</Text>
        </View>
      </Link>
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
