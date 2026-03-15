# 🚀 Quick Start Guide - Testing & CI/CD

## Bước 1: Cài đặt dependencies (nếu chưa có)

```bash
npm install
```

## Bước 2: Cài đặt Playwright browsers

```bash
npx playwright install --with-deps
```

## Bước 3: Chạy tests

```bash
# Chạy tất cả tests
npm run test

# Kết quả mong đợi:
# ✅ 44 tests PASSED
```

## Bước 4: Xem test report

```bash
npm run test:report
```

Browser sẽ tự động mở và hiển thị HTML report đẹp mắt! 🎨

---

## 📊 Test Summary

| Test Suite | Tests | Status |
|------------|-------|--------|
| Generate Utils | 14 | ✅ PASS |
| Slug Utils | 10 | ✅ PASS |
| Formatter | 10 | ✅ PASS |
| Integration | 10 | ✅ PASS |
| **TOTAL** | **44** | **✅ ALL PASS** |

---

## 🔥 Chạy tests nhanh

```bash
# Test một file cụ thể
npx playwright test tests/generate.util.spec.ts

# Test với pattern
npx playwright test -g "should format"

# Debug mode
npm run test:debug

# UI mode (interactive)
npm run test:ui
```

---

## 🎯 CI/CD trên GitHub

### Workflow tự động chạy khi:
1. Tạo Pull Request vào `main` hoặc `develop`
2. Push code lên `main`

### Workflow bao gồm:
1. ✅ **Lint & Type Check** - Kiểm tra code style
2. ✅ **Unit Tests** - Chạy 44 tests
3. ✅ **Build Check** - Kiểm tra build thành công
4. ✅ **Quality Gate** - Tổng kết (PASS/FAIL)

### ⚠️ Defect Management:
- Nếu **BẤT KỲ** test nào fail → **CHẶN** merge PR
- Nếu lint fail → **CHẶN** merge PR
- Nếu build fail → **CHẶN** merge PR

---

## 🎓 Best Practices

### Trước khi commit:
```bash
# 1. Chạy lint
npm run lint

# 2. Chạy tests
npm run test

# 3. Kiểm tra TypeScript
npx tsc --noEmit
```

### Trước khi tạo PR:
```bash
# Build project
npm run build

# Chạy tất cả tests
npm run test
```

---

## 📁 Cấu trúc files

```
.github/
└── workflows/
    └── ci.yml                    # GitHub Actions workflow

tests/
├── generate.util.spec.ts         # 14 tests
├── slug.util.spec.ts             # 10 tests
├── formatter.spec.ts             # 10 tests
├── integration.spec.ts           # 10 tests
├── README.md                     # Documentation
└── COMMANDS.md                   # Useful commands

playwright.config.ts              # Playwright configuration
TESTING_SETUP.md                  # Complete setup guide
```

---

## 🐛 Troubleshooting

### Tests fail với "module not found"?
```bash
npm ci
npx playwright install
```

### CI/CD fail trên GitHub?
1. Check logs trong Actions tab
2. Xem phần "Unit Tests" để biết test nào fail
3. Chạy test đó local: `npx playwright test tests/xxx.spec.ts`
4. Fix lỗi và push lại

---

## 🎉 Hoàn tất!

Bây giờ bạn có thể:
- ✅ Chạy tests local
- ✅ Xem test reports
- ✅ CI/CD tự động check PRs
- ✅ Defect management tự động

**Happy Testing! 🧪**
