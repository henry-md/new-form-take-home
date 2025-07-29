import { removeDuplicateData } from '../src/lib/svg-chart';

interface DataPoint {
  [key: string]: unknown;
  spend?: number;
  impressions?: number;
  clicks?: number;
  conversions?: number;
  age?: string;
  date_start?: string;
  date_stop?: string;
}

// Simple test runner
function test(name: string, fn: () => void) {
  try {
    fn();
    console.log(`✅ ${name}`);
  } catch (error) {
    console.log(`❌ ${name}`);
    console.error(error);
  }
}

function expect(actual: unknown) {
  return {
    toEqual: (expected: unknown) => {
      if (JSON.stringify(actual) !== JSON.stringify(expected)) {
        throw new Error(`Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
      }
    },
    toBe: (expected: unknown) => {
      if (actual !== expected) {
        throw new Error(`Expected ${expected}, got ${actual}`);
      }
    },
    toBeNull: () => {
      if (actual !== null) {
        throw new Error(`Expected null, got ${actual}`);
      }
    },
    toBeUndefined: () => {
      if (actual !== undefined) {
        throw new Error(`Expected undefined, got ${actual}`);
      }
    }
  };
}

console.log('🧪 Testing removeDuplicateData function...\n');

test('should return empty array for empty input', () => {
  const result = removeDuplicateData([]);
  expect(result).toEqual([]);
});

test('should return same array when no duplicates exist', () => {
  const data: DataPoint[] = [
    {
      age: '18-24',
      date_start: '2025-07-21',
      date_stop: '2025-07-27',
      spend: 100
    },
    {
      age: '25-34',
      date_start: '2025-07-21',
      date_stop: '2025-07-27',
      spend: 200
    }
  ];

  const result = removeDuplicateData(data);
  expect(result).toEqual(data);
  expect(result.length).toBe(2);
});

test('should remove exact duplicates based on age, date_start, and date_stop', () => {
  const data: DataPoint[] = [
    {
      age: '18-24',
      date_start: '2025-07-21',
      date_stop: '2025-07-27',
      spend: 100,
      impressions: 1000
    },
    {
      age: '18-24',
      date_start: '2025-07-21',
      date_stop: '2025-07-27',
      spend: 150, // Different spend - should still be considered duplicate
      impressions: 1200
    },
    {
      age: '25-34',
      date_start: '2025-07-21',
      date_stop: '2025-07-27',
      spend: 200
    }
  ];

  const result = removeDuplicateData(data);
  expect(result.length).toBe(2);
  expect(result[0]).toEqual(data[0]); // First occurrence kept
  expect(result[1]).toEqual(data[2]); // Different age group kept
});

test('should keep entries with same age but different dates', () => {
  const data: DataPoint[] = [
    {
      age: '18-24',
      date_start: '2025-07-21',
      date_stop: '2025-07-27',
      spend: 100
    },
    {
      age: '18-24',
      date_start: '2025-07-22', // Different date_start
      date_stop: '2025-07-27',
      spend: 150
    },
    {
      age: '18-24',
      date_start: '2025-07-21',
      date_stop: '2025-07-28', // Different date_stop
      spend: 200
    }
  ];

  const result = removeDuplicateData(data);
  expect(result.length).toBe(3); // All should be kept as they have different date combinations
});

test('should handle missing age, date_start, or date_stop fields', () => {
  const data: DataPoint[] = [
    {
      age: '18-24',
      date_start: '2025-07-21',
      date_stop: '2025-07-27',
      spend: 100
    },
    {
      age: '18-24',
      date_start: '2025-07-21',
      // Missing date_stop
      spend: 150
    },
    {
      age: '18-24',
      // Missing date_start
      date_stop: '2025-07-27',
      spend: 200
    },
    {
      // Missing age
      date_start: '2025-07-21',
      date_stop: '2025-07-27',
      spend: 250
    }
  ];

  const result = removeDuplicateData(data);
  expect(result.length).toBe(4); // All should be kept as they have different key combinations
});

test('should handle multiple duplicates and keep only first occurrence', () => {
  const data: DataPoint[] = [
    {
      age: '18-24',
      date_start: '2025-07-21',
      date_stop: '2025-07-27',
      spend: 100
    },
    {
      age: '25-34',
      date_start: '2025-07-21',
      date_stop: '2025-07-27',
      spend: 200
    },
    {
      age: '18-24',
      date_start: '2025-07-21',
      date_stop: '2025-07-27',
      spend: 300 // Duplicate of first
    },
    {
      age: '18-24',
      date_start: '2025-07-21',
      date_stop: '2025-07-27',
      spend: 400 // Another duplicate of first
    },
    {
      age: '25-34',
      date_start: '2025-07-21',
      date_stop: '2025-07-27',
      spend: 500 // Duplicate of second
    }
  ];

  const result = removeDuplicateData(data);
  expect(result.length).toBe(2);
  expect(result[0].spend).toBe(100); // First occurrence of 18-24 group
  expect(result[1].spend).toBe(200); // First occurrence of 25-34 group
});

console.log('\n🎉 All tests completed!');