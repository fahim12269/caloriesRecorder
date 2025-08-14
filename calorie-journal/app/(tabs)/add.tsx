/**
 * File: app/(tabs)/add.tsx
 * Purpose: Screen for creating a new calorie journal entry with macros and notes.
 * Exports: AddEntryScreen (default) – form-driven UI using react-hook-form and zod validation.
 */
import React, { useEffect, useMemo, useState } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Pressable, ScrollView, TextInput } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import dayjs from 'dayjs';
import * as Crypto from 'expo-crypto';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { Text, View } from '@/components/Themed';

const STORAGE_KEY = 'calorie_journal_entries_v1';
const EXPANDED_STATE_KEY = 'add_screen_expanded_state_v1';
const BORDER_COLOR = '#2f2f2f';

const mealSchema = z.object({
  name: z.string(),
  calories: z.coerce.number().nonnegative().optional(),
  protein: z.coerce.number().nonnegative().optional(),
  carbs: z.coerce.number().nonnegative().optional(),
  fat: z.coerce.number().nonnegative().optional(),
  fiber: z.coerce.number().nonnegative().optional(),
  sugar: z.coerce.number().nonnegative().optional(),
});

const dayEntrySchema = z.object({
  date: z.date(),
  notes: z.string().optional(),
  meals: z.array(mealSchema).min(1),
});

export type DayEntryForm = z.infer<typeof dayEntrySchema>;

async function loadEntries(): Promise<any[]> {
  const json = await AsyncStorage.getItem(STORAGE_KEY);
  return json ? JSON.parse(json) : [];
}

async function saveEntries(newEntries: any[]) {
  if (!newEntries.length) return;
  const existing = await loadEntries();
  const updated = [...newEntries, ...existing];
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

export default function AddEntryScreen() {
  const [showDate, setShowDate] = useState(false);

  const { control, handleSubmit, formState: { errors }, reset, watch } = useForm<DayEntryForm>({
    resolver: zodResolver(dayEntrySchema),
    defaultValues: {
      date: new Date(),
      notes: '',
      meals: [
        { name: 'Breakfast' },
        { name: 'Lunch' },
        { name: 'Dinner' },
      ],
    },
  });

  const { fields, append } = useFieldArray({ control, name: 'meals' });

  // Track expanded/collapsed state per meal; default to all closed.
  const [expandedByIndex, setExpandedByIndex] = useState<Record<number, boolean>>({});
  const toggleExpanded = (index: number) => {
    setExpandedByIndex((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  // Ensure state exists for all current fields and defaults to closed
  useEffect(() => {
    setExpandedByIndex((prev) => {
      const next: Record<number, boolean> = { ...prev };
      fields.forEach((_, i) => {
        if (next[i] === undefined) next[i] = false;
      });
      Object.keys(next).forEach((k) => {
        const idx = Number(k);
        if (idx >= fields.length) delete next[idx];
      });
      return next;
    });
  }, [fields.length]);

  // Load persisted expanded state on mount
  useEffect(() => {
    (async () => {
      try {
        const json = await AsyncStorage.getItem(EXPANDED_STATE_KEY);
        if (json) {
          const saved = JSON.parse(json) as Record<number, boolean>;
          setExpandedByIndex((prev) => ({ ...prev, ...saved }));
        }
      } catch (e) {
        // ignore
      }
    })();
  }, []);

  // Persist expanded state whenever it changes
  useEffect(() => {
    AsyncStorage.setItem(EXPANDED_STATE_KEY, JSON.stringify(expandedByIndex)).catch(() => {});
  }, [expandedByIndex]);

  const onSubmit = async (data: DayEntryForm) => {
    const entriesToSave: any[] = [];
    for (const meal of data.meals) {
      const calories = Number(meal.calories || 0);
      const protein = Number(meal.protein || 0);
      const carbs = Number(meal.carbs || 0);
      const fat = Number(meal.fat || 0);
      const fiber = Number(meal.fiber || 0);
      const sugar = Number(meal.sugar || 0);

      const hasAnyValue = [calories, protein, carbs, fat, fiber, sugar].some((v) => v > 0);
      if (!hasAnyValue) continue;

      entriesToSave.push({
        id: await Crypto.randomUUID(),
        date: data.date,
        name: meal.name,
        calories,
        protein,
        carbs,
        fat,
        fiber,
        sugar,
        meal: meal.name,
      });
    }

    await saveEntries(entriesToSave);
    reset({
      date: new Date(),
      notes: '',
      meals: [
        { name: 'Breakfast' },
        { name: 'Lunch' },
        { name: 'Dinner' },
      ],
    });
    // Keep expanded state as-is to respect user's preference across screen switches
    alert(entriesToSave.length ? 'Saved' : 'Nothing to save');
  };

  const nextMealName = useMemo(() => `Meal ${fields.length + 1}`, [fields.length]);

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
      <Text className="text-2xl font-extrabold">Add Entry</Text>

      <Controller
        control={control}
        name="date"
        render={({ field: { value, onChange } }) => (
          <View>
            <Pressable onPress={() => setShowDate(true)}>
              <View className="rounded-2xl p-4" lightColor="#fff" darkColor="#111" style={{ borderWidth: 1, borderColor: BORDER_COLOR }}>
                <Text className="text-gray-500">Date</Text>
                <Text className="text-lg font-semibold mt-1">{dayjs(value).format('YYYY-MM-DD')}</Text>
              </View>
            </Pressable>
            {showDate && (
              <DateTimePicker
                value={value}
                mode="date"
                onChange={(event, selectedDate) => {
                  setShowDate(false);
                  if (selectedDate) onChange(selectedDate);
                }}
              />
            )}
          </View>
        )}
      />

      {fields.map((field, index) => (
        <View key={field.id}>
          <Pressable onPress={() => toggleExpanded(index)}>
            <View className="rounded-2xl p-4 flex-row items-center justify-between" lightColor="#fff" darkColor="#111" style={{ borderWidth: 1, borderColor: BORDER_COLOR }}>
              <Text className="text-lg font-semibold">{watch(`meals.${index}.name`) || field.name}</Text>
              <Text className="text-gray-500">{expandedByIndex[index] ? '▲' : '▼'}</Text>
            </View>
          </Pressable>

          {expandedByIndex[index] && (
            <View className="rounded-2xl p-4 mt-2" lightColor="#fff" darkColor="#111" style={{ borderWidth: 1, borderColor: BORDER_COLOR }}>
              <View className="flex-row gap-3">
                <MacroInput control={control} name={`meals.${index}.calories`} label="Calories" error={undefined} />
                <MacroInput control={control} name={`meals.${index}.protein`} label="Protein (g)" error={undefined} />
                <MacroInput control={control} name={`meals.${index}.carbs`} label="Carbs (g)" error={undefined} />
              </View>
              <View className="flex-row gap-3 mt-3">
                <MacroInput control={control} name={`meals.${index}.fat`} label="Fat (g)" error={undefined} />
                <MacroInput control={control} name={`meals.${index}.fiber`} label="Fiber (g)" error={undefined} />
                <MacroInput control={control} name={`meals.${index}.sugar`} label="Sugar (g)" error={undefined} />
              </View>
            </View>
          )}
        </View>
      ))}

      <Pressable onPress={() => append({ name: nextMealName })}>
        <View className="rounded-2xl p-4 items-center border-2 border-dashed" lightColor="#e5e7eb" darkColor="#333" style={{ borderColor: BORDER_COLOR }}>
          <Text className="font-semibold">+ Add meal</Text>
        </View>
      </Pressable>

      <FormField label="Notes" error={errors.notes?.message}>
        <Controller
          control={control}
          name="notes"
          render={({ field: { value, onChange, onBlur } }) => (
            <TextInput
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder="Optional"
              className="rounded-2xl p-4 bg-white dark:bg-[#111] border"
              style={{ minHeight: 100, borderColor: BORDER_COLOR }}
              multiline
            />
          )}
        />
      </FormField>

      <Pressable onPress={handleSubmit(onSubmit)}>
        <View className="rounded-2xl p-4 items-center" lightColor="#111" darkColor="#fff" style={{ borderWidth: 1, borderColor: BORDER_COLOR }}>
          <Text className="font-semibold" lightColor="#fff" darkColor="#000">Save</Text>
        </View>
      </Pressable>
    </ScrollView>
  );
}

function FormField({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <View>
      <Text className="mb-2 text-gray-500">{label}</Text>
      {children}
      {!!error && <Text className="text-red-500 mt-1">{error}</Text>}
    </View>
  );
}

function MacroInput({ control, name, label, error }: any) {
  return (
    <View style={{ flex: 1 }}>
      <FormField label={label} error={error}>
        <Controller
          control={control}
          name={name}
          render={({ field: { value, onChange, onBlur } }) => (
            <TextInput
              value={String(value ?? '')}
              onChangeText={onChange}
              onBlur={onBlur}
              keyboardType="numeric"
              placeholder="0"
              className="rounded-2xl p-4 bg-white dark:bg-[#111] border"
              style={{ borderColor: BORDER_COLOR }}
            />
          )}
        />
      </FormField>
    </View>
  );
}