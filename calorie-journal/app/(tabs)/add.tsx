/**
 * File: app/(tabs)/add.tsx
 * Purpose: Screen for creating a new calorie journal entry with macros and notes.
 * Exports: AddEntryScreen (default) – form-driven UI using react-hook-form and zod validation.
 */
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Platform, ScrollView, TextInput, Pressable } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import dayjs from 'dayjs';
import * as Crypto from 'expo-crypto';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { Text, View } from '@/components/Themed';

const entrySchema = z.object({
  date: z.date(),
  name: z.string().min(1, 'Required'),
  calories: z.coerce.number().nonnegative(),
  protein: z.coerce.number().nonnegative().default(0),
  carbs: z.coerce.number().nonnegative().default(0),
  fat: z.coerce.number().nonnegative().default(0),
  fiber: z.coerce.number().nonnegative().default(0),
  sugar: z.coerce.number().nonnegative().default(0),
  sodium: z.coerce.number().nonnegative().default(0),
  notes: z.string().optional(),
  meal: z.enum(['Breakfast', 'Lunch', 'Snack', 'Dinner']).default('Snack'),
});

export type EntryForm = z.infer<typeof entrySchema>;

const STORAGE_KEY = 'calorie_journal_entries_v1';

/**
 * Reads all saved entries from AsyncStorage.
 * Returns an empty array when no entries exist.
 */
async function loadEntries(): Promise<any[]> {
  const json = await AsyncStorage.getItem(STORAGE_KEY);
  return json ? JSON.parse(json) : [];
}

/**
 * Persists a new entry by prepending to the stored list in AsyncStorage.
 */
async function saveEntry(entry: any) {
  const entries = await loadEntries();
  const updated = [entry, ...entries];
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

/**
 * Displays a form to create a new entry, validates input, and saves to local storage.
 */
export default function AddEntryScreen() {
  const [showDate, setShowDate] = useState(false);

  const { control, handleSubmit, formState: { errors }, reset } = useForm<EntryForm>({
    resolver: zodResolver(entrySchema),
    defaultValues: {
      date: new Date(),
      name: '',
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
      sugar: 0,
      sodium: 0,
      notes: '',
      meal: 'Snack',
    },
  });

  const onSubmit = async (data: EntryForm) => {
    const entry = { id: await Crypto.randomUUID(), ...data };
    await saveEntry(entry);
    reset();
    alert('Saved');
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
      <Text className="text-2xl font-extrabold">Add Entry</Text>

      <Controller
        control={control}
        name="date"
        render={({ field: { value, onChange } }) => (
          <View>
            <Pressable onPress={() => setShowDate(true)}>
              <View className="rounded-2xl p-4" lightColor="#fff" darkColor="#111">
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

      <FormField label="Meal" error={errors.meal?.message}>
        <Controller
          control={control}
          name="meal"
          render={({ field: { value, onChange } }) => (
            <View className="flex-row gap-2">
              {(['Breakfast', 'Lunch', 'Snack', 'Dinner'] as const).map((option) => (
                <Pressable key={option} onPress={() => onChange(option)} style={{ flex: 1 }}>
                  <View
                    className="rounded-xl p-3 items-center"
                    lightColor={value === option ? '#111' : '#fff'}
                    darkColor={value === option ? '#fff' : '#111'}
                  >
                    <Text className={value === option ? 'font-semibold' : ''} lightColor={value === option ? '#fff' : undefined} darkColor={value === option ? '#000' : undefined}>
                      {option}
                    </Text>
                  </View>
                </Pressable>
              ))}
            </View>
          )}
        />
      </FormField>

      <FormField label="Name" error={errors.name?.message}>
        <Controller
          control={control}
          name="name"
          render={({ field: { value, onChange, onBlur } }) => (
            <TextInput
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder="e.g. Chicken bowl"
              className="rounded-2xl p-4"
              style={{ backgroundColor: '#fff' }}
            />
          )}
        />
      </FormField>

      <FormField label="Calories (kcal)" error={errors.calories?.message}>
        <Controller
          control={control}
          name="calories"
          render={({ field: { value, onChange, onBlur } }) => (
            <TextInput
              value={String(value ?? '')}
              onChangeText={onChange}
              onBlur={onBlur}
              keyboardType="numeric"
              placeholder="0"
              className="rounded-2xl p-4"
              style={{ backgroundColor: '#fff' }}
            />
          )}
        />
      </FormField>

      <View className="flex-row gap-3">
        <MacroInput control={control} name="protein" label="Protein (g)" error={errors.protein?.message} />
        <MacroInput control={control} name="carbs" label="Carbs (g)" error={errors.carbs?.message} />
        <MacroInput control={control} name="fat" label="Fat (g)" error={errors.fat?.message} />
      </View>

      <View className="flex-row gap-3">
        <MacroInput control={control} name="fiber" label="Fiber (g)" error={errors.fiber?.message} />
        <MacroInput control={control} name="sugar" label="Sugar (g)" error={errors.sugar?.message} />
        <MacroInput control={control} name="sodium" label="Sodium (mg)" error={errors.sodium?.message} />
      </View>

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
              className="rounded-2xl p-4"
              style={{ backgroundColor: '#fff', minHeight: 100 }}
              multiline
            />
          )}
        />
      </FormField>

      <Pressable onPress={handleSubmit(onSubmit)}>
        <View className="rounded-2xl p-4 items-center" lightColor="#22c55e" darkColor="#16a34a">
          <Text className="text-white font-semibold">Save</Text>
        </View>
      </Pressable>
    </ScrollView>
  );
}

/**
 * Simple wrapper to show a label, children input, and an optional error message.
 */
function FormField({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <View>
      <Text className="mb-2 text-gray-500">{label}</Text>
      {children}
      {!!error && <Text className="text-red-500 mt-1">{error}</Text>}
    </View>
  );
}

/**
 * Numeric input used for macro/micro nutrient fields.
 */
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
              className="rounded-2xl p-4"
              style={{ backgroundColor: '#fff' }}
            />
          )}
        />
      </FormField>
    </View>
  );
}