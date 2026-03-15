# Unit Tests for Utility Functions

Đây là các unit tests cho dự án Eyewear Backend sử dụng Playwright Test Runner.

## 📋 Tổng quan

Dự án này bao gồm **34 unit tests** được chia thành 3 test suites:

### 1. Generate Utility Tests (`generate.util.spec.ts`)
- ✅ 14 tests cho các hàm tạo mã code (Order, Invoice, Session, OTP)
- Test các chức năng: `generateOrderCode()`, `generateInvoiceCode()`, `generateSessionId()`, `generateOTPCode()`

### 2. Slug Utility Tests (`slug.util.spec.ts`)
- ✅ 10 tests cho các hàm xử lý slug
- Test các chức năng: `slugify()`, `generateShortUuid()`, `generateUniqueSlug()`, `extractUuidFromSlug()`

### 3. Formatter Tests (`formatter.spec.ts`)
- ✅ 10 tests cho các hàm format dữ liệu
- Test các chức năng: `formatDateToString()`, `formatNumberToVND()`

## 🚀 Chạy Tests

### Chạy tất cả tests
```bash
npm run test
```

### Chạy tests với UI mode
```bash
npm run test:ui
```

### Chạy tests ở debug mode
```bash
npm run test:debug
```

### Xem test report
```bash
npm run test:report
```

### Chạy test cho một file cụ thể
```bash
npx playwright test tests/generate.util.spec.ts
```

## 📊 CI/CD Workflow

GitHub Actions workflow (`.github/workflows/ci.yml`) sẽ tự động chạy khi:
- 📌 Tạo Pull Request vào nhánh `main` hoặc `develop`
- 📌 Push code lên nhánh `main`

### Workflow bao gồm:

1. **Lint & Type Check** - Kiểm tra code style và type safety
2. **Unit Tests** - Chạy tất cả unit tests với Playwright
3. **Build Check** - Kiểm tra build project thành công
4. **Quality Gate** - Đánh giá tổng thể (fail nếu bất kỳ step nào fail)

### ⛔ Defect Management
- Nếu bất kỳ test nào **FAIL**, workflow sẽ **CHẶN** merge/push
- PR sẽ không thể merge cho đến khi tất cả tests PASS ✅

## 📁 Cấu trúc Tests

```
tests/
├── generate.util.spec.ts    # Tests cho generate utilities
├── slug.util.spec.ts         # Tests cho slug utilities
└── formatter.spec.ts         # Tests cho formatter utilities
```

## 🔧 Playwright Configuration

File `playwright.config.ts` đã được cấu hình với:
- ✅ Test directory: `./tests`
- ✅ Parallel execution
- ✅ HTML, List, JSON reporters
- ✅ Chromium browser
- ✅ Retry on CI (2 retries)

## 📝 Viết Tests Mới

Để thêm test mới, tạo file trong thư mục `tests/`:

```typescript
import { test, expect } from '@playwright/test';

test.describe('Your Test Suite', () => {
  test('should do something', () => {
    // Your test here
    expect(true).toBe(true);
  });
});
```

## 📈 Test Coverage

| Utility | Functions Tested | Test Cases |
|---------|------------------|------------|
| generate.util.ts | 4/4 (100%) | 14 tests |
| slug.util.ts | 4/4 (100%) | 10 tests |
| formatter.ts | 2/2 (100%) | 10 tests |

**Total: 34 unit tests ✅**

## 🐛 Troubleshooting

### Nếu tests fail:
1. Kiểm tra import paths trong test files
2. Đảm bảo tất cả dependencies đã được cài đặt: `npm ci`
3. Cài đặt Playwright browsers: `npx playwright install`

### Nếu CI/CD fail:
1. Xem logs trong GitHub Actions
2. Chạy tests local trước khi push: `npm run test`
3. Fix các lỗi lint: `npm run lint:fix`
4. Kiểm tra TypeScript errors: `npx tsc --noEmit`

## 📚 Tài liệu

- [Playwright Documentation](https://playwright.dev)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
