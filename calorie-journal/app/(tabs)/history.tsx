/**
 * File: app/(tabs)/history.tsx
 * Purpose: Displays a scrollable list of saved entries with ability to delete.
 * Exports: HistoryScreen (default) – reads entries from AsyncStorage and renders them.
 */
import React, { useEffect, useState } from 'react';
import { FlatList, Pressable } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import dayjs from 'dayjs';
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
  meal?: 'Breakfast' | 'Lunch' | 'Snack' | 'Dinner';
};

/**
 * Lists entries and allows removing an entry by id.
 */
export default function HistoryScreen() {
  const [entries, setEntries] = useState<Entry[]>([]);

  const load = async () => {
    const json = await AsyncStorage.getItem(STORAGE_KEY);
    const list: Entry[] = json ? JSON.parse(json) : [];
    setEntries(list);
  };

  useEffect(() => {
    const unsubscribe = () => {};
    load();
    return unsubscribe;
  }, []);

  const deleteEntry = async (id: string) => {
    const filtered = entries.filter((e) => e.id !== id);
    setEntries(filtered);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  };

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text className="text-2xl font-extrabold mb-2">History</Text>
      <FlatList
        data={entries}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ gap: 12, paddingBottom: 40 }}
        renderItem={({ item }) => (
          <View className="rounded-2xl p-4 flex-row items-center justify-between" lightColor="#fff" darkColor="#111">
            <View style={{ flex: 1 }}>
              <Text className="text-gray-500 text-xs">{dayjs(item.date).format('YYYY-MM-DD')}</Text>
              <Text className="text-lg font-semibold">{item.name}</Text>
              <Text className="text-gray-500">{item.calories} kcal • P {item.protein} | C {item.carbs} | F {item.fat}</Text>
              {!!(item as any).meal && <Text className="text-gray-500 text-xs">{(item as any).meal}</Text>}
            </View>
            <Pressable onPress={() => deleteEntry(item.id)}>
              <Text className="text-red-500">Delete</Text>
            </Pressable>
          </View>
        )}
        ListEmptyComponent={<Text className="text-gray-500 mt-10 text-center">No entries yet</Text>}
      />
    </View>
  );
}