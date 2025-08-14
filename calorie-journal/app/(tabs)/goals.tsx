import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, TextInput } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import dayjs from 'dayjs';
import { Text, View } from '@/components/Themed';

const GOALS_STORAGE_KEY = 'calorie_journal_goals_v1';

const DEFAULT_GOALS = {
  calories: 1760,
  protein: 120,
  carbs: 230,
  fat: 50,
  fiber: 25,
};

const BORDER_COLOR = '#2f2f2f';
const COL_WIDTHS = {
  label: 140,
  protein: 80,
  fat: 60,
  carbs: 80,
  fiber: 60,
  calories: 100,
};
const TABLE_MIN_WIDTH =
  COL_WIDTHS.label +
  COL_WIDTHS.protein +
  COL_WIDTHS.fat +
  COL_WIDTHS.carbs +
  COL_WIDTHS.fiber +
  COL_WIDTHS.calories;

export default function GoalsScreen() {
  const [goals, setGoals] = useState(DEFAULT_GOALS);

  useEffect(() => {
    (async () => {
      const json = await AsyncStorage.getItem(GOALS_STORAGE_KEY);
      setGoals(json ? JSON.parse(json) : DEFAULT_GOALS);
    })();
  }, []);

  const update = (key: keyof typeof DEFAULT_GOALS, value: string) => {
    const numeric = Number(value.replace(/[^0-9.]/g, '')) || 0;
    setGoals((g) => ({ ...g, [key]: numeric }));
  };

  const save = async () => {
    await AsyncStorage.setItem(GOALS_STORAGE_KEY, JSON.stringify(goals));
    alert('Goals saved');
  };

  const reset = async () => {
    setGoals(DEFAULT_GOALS);
    await AsyncStorage.setItem(GOALS_STORAGE_KEY, JSON.stringify(DEFAULT_GOALS));
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
      <Text className="text-2xl font-extrabold">Goals</Text>

      <View className="w-full rounded-2xl p-4" lightColor="#fff" darkColor="#111">
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={{ minWidth: TABLE_MIN_WIDTH, borderWidth: 1, borderColor: BORDER_COLOR, borderRadius: 12, overflow: 'hidden' }}>
            <TableHeader />
            <View style={{ flexDirection: 'row', borderTopWidth: 1, borderColor: BORDER_COLOR }}>
              <Cell width={COL_WIDTHS.label} textClass="font-extrabold">GOALS</Cell>
              <Cell width={COL_WIDTHS.protein}>
                <Input value={String(goals.protein)} onChangeText={(t) => update('protein', t)} />
              </Cell>
              <Cell width={COL_WIDTHS.fat}>
                <Input value={String(goals.fat)} onChangeText={(t) => update('fat', t)} />
              </Cell>
              <Cell width={COL_WIDTHS.carbs}>
                <Input value={String(goals.carbs)} onChangeText={(t) => update('carbs', t)} />
              </Cell>
              <Cell width={COL_WIDTHS.fiber}>
                <Input value={String(goals.fiber)} onChangeText={(t) => update('fiber', t)} />
              </Cell>
              <Cell width={COL_WIDTHS.calories} isLast>
                <Input value={String(goals.calories)} onChangeText={(t) => update('calories', t)} />
              </Cell>
            </View>
          </View>
        </ScrollView>
      </View>

      <Pressable onPress={save}>
        <View className="rounded-2xl p-4 items-center" lightColor="#111" darkColor="#fff">
          <Text className="font-semibold" lightColor="#fff" darkColor="#000">Save Goals</Text>
        </View>
      </Pressable>

      <Pressable onPress={reset}>
        <View className="rounded-2xl p-4 items-center border-2 border-dashed" lightColor="#e5e7eb" darkColor="#333">
          <Text className="font-semibold">Reset to defaults</Text>
        </View>
      </Pressable>
    </ScrollView>
  );
}

function Cell({ children, width, isLast, textClass }: { children: React.ReactNode; width: number; isLast?: boolean; textClass?: string }) {
  return (
    <View style={{ width, paddingVertical: 10, paddingHorizontal: 12, borderRightWidth: isLast ? 0 : 1, borderColor: BORDER_COLOR }}>
      {typeof children === 'string' || typeof children === 'number' ? (
        <Text className={textClass}>{children}</Text>
      ) : (
        children
      )}
    </View>
  );
}

function TableHeader() {
  return (
    <View style={{ flexDirection: 'row', borderBottomWidth: 1, borderColor: BORDER_COLOR }}>
      <Cell width={COL_WIDTHS.label} textClass="text-gray-500">{dayjs().format('MMM DD')}</Cell>
      <Cell width={COL_WIDTHS.protein} textClass="text-gray-500">Protein</Cell>
      <Cell width={COL_WIDTHS.fat} textClass="text-gray-500">Fat</Cell>
      <Cell width={COL_WIDTHS.carbs} textClass="text-gray-500">Carbs</Cell>
      <Cell width={COL_WIDTHS.fiber} textClass="text-gray-500">Fiber</Cell>
      <Cell width={COL_WIDTHS.calories} isLast textClass="text-gray-500">Calories</Cell>
    </View>
  );
}

function Input({ value, onChangeText }: { value: string; onChangeText: (t: string) => void }) {
  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      keyboardType="numeric"
      placeholder="0"
      className="rounded-xl p-2"
      style={{ backgroundColor: '#fff' }}
    />
  );
}