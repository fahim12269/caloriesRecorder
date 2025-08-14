import AsyncStorage from '@react-native-async-storage/async-storage';

jest.mock('@react-native-async-storage/async-storage', () => require('@react-native-async-storage/async-storage/jest/async-storage-mock'));

describe('goals storage', () => {
	const KEY = 'calorie_journal_goals_v1';
	const data = { calories: 1234, protein: 100, carbs: 200, fat: 50, fiber: 25 };

	it('saves and reads goals JSON', async () => {
		await AsyncStorage.setItem(KEY, JSON.stringify(data));
		const json = await AsyncStorage.getItem(KEY);
		expect(json).toBe(JSON.stringify(data));
		const parsed = json ? JSON.parse(json) : null;
		expect(parsed).toEqual(data);
	});
});