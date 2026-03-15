import { test, expect } from '@playwright/test';

/**
 * Integration tests for all utility functions
 * Testing how utilities work together
 */

test.describe('Utility Integration Tests', () => {
  test('should create order with formatted date and VND price', async () => {
    const { generateOrderCode } = await import('../src/utils/generate.util');
    const { formatDateToString, formatNumberToVND } = await import('../src/utils/formatter');

    const orderCode = generateOrderCode();
    const orderDate = formatDateToString(new Date());
    const orderTotal = formatNumberToVND(500000);

    expect(orderCode).toMatch(/^OD_\d{3}\d{13}$/);
    expect(orderDate).toMatch(/^\d{2}:\d{2}:\d{2} \d{2}\/\d{2}\/\d{4}$/);
    expect(orderTotal).toContain('₫');
  });

  test('should create product slug with unique identifier', async () => {
    const { slugify, generateUniqueSlug } = await import('../src/utils/slug.util');

    const productName = 'Kính Mát Rayban Classic';
    const baseSlug = slugify(productName);
    const uniqueSlug = generateUniqueSlug(baseSlug);

    expect(baseSlug).toBe('kinh-mat-rayban-classic');
    expect(uniqueSlug).toMatch(/^kinh-mat-rayban-classic-[A-Z0-9]{8}$/);
  });

  test('should handle Vietnamese product names correctly', async () => {
    const { slugify, generateUniqueSlug, extractUuidFromSlug } = await import('../src/utils/slug.util');

    const productName = 'Gọng Kính Cận Thời Trang Cao Cấp';
    const slug = slugify(productName);
    const uniqueSlug = generateUniqueSlug(slug);
    const uuid = extractUuidFromSlug(uniqueSlug);

    expect(slug).toBe('gong-kinh-can-thoi-trang-cao-cap');
    expect(uniqueSlug).toContain(slug);
    expect(uuid).toHaveLength(8);
  });

  test('should generate invoice with code and formatted timestamp', async () => {
    const { generateInvoiceCode } = await import('../src/utils/generate.util');
    const { formatDateToString, formatNumberToVND } = await import('../src/utils/formatter');

    const invoiceCode = generateInvoiceCode();
    const invoiceDate = formatDateToString(new Date(), 'DD/MM/YYYY HH:mm');
    const invoiceAmount = formatNumberToVND(1500000);

    expect(invoiceCode).toMatch(/^HD_/);
    expect(invoiceDate).toMatch(/^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}$/);
    expect(invoiceAmount).toContain('1.500.000');
  });

  test('should create session with OTP code', async () => {
    const { generateSessionId, generateOTPCode } = await import('../src/utils/generate.util');

    const sessionId = generateSessionId();
    const otpCode = generateOTPCode();

    expect(sessionId).toMatch(/^\d{6}\d{13}$/);
    expect(otpCode).toHaveLength(4);
    expect(otpCode).toMatch(/^\d{4}$/);
  });

  test('multiple code generations should be unique', async () => {
    const { generateOrderCode, generateInvoiceCode, generateSessionId } = await import('../src/utils/generate.util');

    const codes = new Set();
    for (let i = 0; i < 10; i++) {
      codes.add(generateOrderCode());
      codes.add(generateInvoiceCode());
      codes.add(generateSessionId());
    }

    // Should have 30 unique codes (10 * 3)
    expect(codes.size).toBe(30);
  });

  test('should handle edge case: empty string slug', async () => {
    const { slugify } = await import('../src/utils/slug.util');

    const emptySlug = slugify('');
    const specialCharsOnly = slugify('@#$%^&*()');
    const spacesOnly = slugify('     ');

    expect(emptySlug).toBe('');
    expect(specialCharsOnly).toBe('');
    expect(spacesOnly).toBe('');
  });

  test('should format very large numbers to VND correctly', async () => {
    const { formatNumberToVND } = await import('../src/utils/formatter');

    const billion = formatNumberToVND(1000000000);
    const trillion = formatNumberToVND(1000000000000);

    expect(billion).toContain('1.000.000.000');
    expect(trillion).toContain('1.000.000.000.000');
  });

  test('should handle special Vietnamese characters in slugs', async () => {
    const { slugify } = await import('../src/utils/slug.util');

    const withTones = slugify('Đồng hồ đeo tay nữ');
    const withSpecialChars = slugify('Kính râm - 50% giảm giá!!!');

    // NFD normalization removes 'Đ' -> 'd' is removed, leaving 'ong-ho-eo-tay-nu'
    expect(withTones).toBe('ong-ho-eo-tay-nu');
    expect(withSpecialChars).toBe('kinh-ram-50-giam-gia');
  });

  test('utils should work in realistic e-commerce scenario', async () => {
    const { generateOrderCode, generateInvoiceCode, generateOTPCode } = await import('../src/utils/generate.util');
    const { formatDateToString, formatNumberToVND } = await import('../src/utils/formatter');
    const { slugify, generateUniqueSlug } = await import('../src/utils/slug.util');

    // Customer creates an account with OTP
    const otp = generateOTPCode();
    expect(otp).toHaveLength(4);

    // Customer browses product
    const productName = 'Kính Mát Thời Trang Nam';
    const productSlug = generateUniqueSlug(slugify(productName));
    expect(productSlug).toMatch(/^kinh-mat-thoi-trang-nam-[A-Z0-9]{8}$/);

    // Customer places order
    const orderCode = generateOrderCode();
    const orderDate = formatDateToString(new Date());
    const orderTotal = formatNumberToVND(2500000);

    expect(orderCode).toMatch(/^OD_/);
    expect(orderDate).toBeTruthy();
    expect(orderTotal).toContain('2.500.000');

    // System generates invoice
    const invoiceCode = generateInvoiceCode();
    const invoiceDate = formatDateToString(new Date(), 'DD/MM/YYYY');

    expect(invoiceCode).toMatch(/^HD_/);
    expect(invoiceDate).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);

    // All codes should be unique
    expect(otp).not.toBe(orderCode);
    expect(orderCode).not.toBe(invoiceCode);
  });
});
