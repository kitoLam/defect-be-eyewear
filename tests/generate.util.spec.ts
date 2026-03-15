import { test, expect } from '@playwright/test';
import {
  generateOrderCode,
  generateInvoiceCode,
  generateSessionId,
  generateOTPCode,
} from '../src/utils/generate.util';

test.describe('Generate Utility Tests', () => {
  test('generateOrderCode should start with OD_ prefix', () => {
    const orderCode = generateOrderCode();
    expect(orderCode).toMatch(/^OD_/);
  });

  test('generateOrderCode should contain 3 random digits after prefix', () => {
    const orderCode = generateOrderCode();
    // Format: OD_XXXtimestamp where XXX are 3 digits
    expect(orderCode).toMatch(/^OD_\d{3}\d{13}$/);
  });

  test('generateOrderCode should generate unique codes', () => {
    const code1 = generateOrderCode();
    const code2 = generateOrderCode();
    expect(code1).not.toBe(code2);
  });

  test('generateInvoiceCode should start with HD_ prefix', () => {
    const invoiceCode = generateInvoiceCode();
    expect(invoiceCode).toMatch(/^HD_/);
  });

  test('generateInvoiceCode should contain 3 random digits after prefix', () => {
    const invoiceCode = generateInvoiceCode();
    // Format: HD_XXXtimestamp where XXX are 3 digits
    expect(invoiceCode).toMatch(/^HD_\d{3}\d{13}$/);
  });

  test('generateInvoiceCode should generate unique codes', () => {
    const code1 = generateInvoiceCode();
    const code2 = generateInvoiceCode();
    expect(code1).not.toBe(code2);
  });

  test('generateSessionId should contain 6 random digits', () => {
    const sessionId = generateSessionId();
    // Format: XXXXXXtimestamp where XXXXXX are 6 digits
    expect(sessionId).toMatch(/^\d{6}\d{13}$/);
  });

  test('generateSessionId should generate unique IDs', () => {
    const id1 = generateSessionId();
    const id2 = generateSessionId();
    expect(id1).not.toBe(id2);
  });

  test('generateOTPCode should be 4 digits long', () => {
    const otp = generateOTPCode();
    expect(otp).toHaveLength(4);
    expect(otp).toMatch(/^\d{4}$/);
  });

  test('generateOTPCode should only contain numeric characters', () => {
    const otp = generateOTPCode();
    const isNumeric = /^\d+$/.test(otp);
    expect(isNumeric).toBe(true);
  });

  test('generateOTPCode should generate different codes (high probability)', () => {
    const otp1 = generateOTPCode();
    const otp2 = generateOTPCode();
    const otp3 = generateOTPCode();

    // At least one should be different (very high probability with 10000 possible combinations)
    const allSame = otp1 === otp2 && otp2 === otp3;
    expect(allSame).toBe(false);
  });

  test('generated codes should contain timestamp for uniqueness', () => {
    const beforeTime = Date.now();
    const orderCode = generateOrderCode();
    const afterTime = Date.now();

    // Extract timestamp from code (remove prefix and 3 random digits)
    const timestamp = parseInt(orderCode.slice(6));

    expect(timestamp).toBeGreaterThanOrEqual(beforeTime);
    expect(timestamp).toBeLessThanOrEqual(afterTime);
  });

  test('all code generators should produce non-empty strings', () => {
    expect(generateOrderCode().length).toBeGreaterThan(0);
    expect(generateInvoiceCode().length).toBeGreaterThan(0);
    expect(generateSessionId().length).toBeGreaterThan(0);
    expect(generateOTPCode().length).toBeGreaterThan(0);
  });

  test('generateOrderCode and generateInvoiceCode should have different prefixes', () => {
    const orderCode = generateOrderCode();
    const invoiceCode = generateInvoiceCode();

    expect(orderCode.startsWith('OD_')).toBe(true);
    expect(invoiceCode.startsWith('HD_')).toBe(true);
    expect(orderCode.substring(0, 3)).not.toBe(invoiceCode.substring(0, 3));
  });
});
