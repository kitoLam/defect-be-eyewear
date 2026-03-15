import { test, expect } from '@playwright/test';
import {
  formatDateToString,
  formatNumberToVND,
} from '../src/utils/formatter';

test.describe('Formatter Utility Tests', () => {
  test('formatDateToString should format date to default format', () => {
    const date = new Date('2024-03-15T10:30:45.000Z');
    const formatted = formatDateToString(date);

    // Should match format HH:mm:ss DD/MM/YYYY in Asia/Ho_Chi_Minh timezone
    expect(formatted).toMatch(/^\d{2}:\d{2}:\d{2} \d{2}\/\d{2}\/\d{4}$/);
  });

  test('formatDateToString should format date with custom format', () => {
    const date = new Date('2024-03-15T10:30:45.000Z');
    const formatted = formatDateToString(date, 'DD/MM/YYYY');

    expect(formatted).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
  });

  test('formatDateToString should handle year format correctly', () => {
    const date = new Date('2024-03-15T10:30:45.000Z');
    const formatted = formatDateToString(date, 'YYYY');

    expect(formatted).toBe('2024');
  });

  test('formatNumberToVND should format number to Vietnamese currency', () => {
    const number = 1000000;
    const formatted = formatNumberToVND(number);

    expect(formatted).toContain('₫');
    expect(formatted).toContain('1.000.000');
  });

  test('formatNumberToVND should format zero correctly', () => {
    const number = 0;
    const formatted = formatNumberToVND(number);

    expect(formatted).toContain('₫');
    expect(formatted).toContain('0');
  });

  test('formatNumberToVND should format negative numbers', () => {
    const number = -500000;
    const formatted = formatNumberToVND(number);

    expect(formatted).toContain('₫');
    expect(formatted).toContain('-');
  });

  test('formatNumberToVND should format large numbers with proper separators', () => {
    const number = 123456789;
    const formatted = formatNumberToVND(number);

    expect(formatted).toContain('₫');
    expect(formatted).toContain('123.456.789');
  });

  test('formatNumberToVND should handle decimal numbers', () => {
    const number = 1234.56;
    const formatted = formatNumberToVND(number);

    expect(formatted).toContain('₫');
    // VND currency rounds decimals, so 1234.56 becomes 1.235
    expect(formatted).toMatch(/1\.23[45]/);
  });

  test('formatDateToString should handle time-only format', () => {
    const date = new Date('2024-03-15T10:30:45.000Z');
    const formatted = formatDateToString(date, 'HH:mm:ss');

    expect(formatted).toMatch(/^\d{2}:\d{2}:\d{2}$/);
  });

  test('formatDateToString should handle date-only format', () => {
    const date = new Date('2024-03-15T10:30:45.000Z');
    const formatted = formatDateToString(date, 'DD-MM-YYYY');

    expect(formatted).toMatch(/^\d{2}-\d{2}-\d{4}$/);
  });
});
