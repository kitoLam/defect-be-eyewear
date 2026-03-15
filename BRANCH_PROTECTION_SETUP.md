# Hướng dẫn thiết lập Branch Protection Rules

## Bước 1: Vào Settings của Repository

1. Truy cập repository của bạn trên GitHub
2. Click vào tab **Settings**
3. Trong menu bên trái, click vào **Branches** (dưới mục "Code and automation")

## Bước 2: Thêm Branch Protection Rule

1. Click nút **Add branch protection rule**
2. Trong mục **Branch name pattern**, nhập: `master` (hoặc `main` nếu bạn dùng main)

## Bước 3: Cấu hình Required Checks

Tích chọn các options sau:

### ✅ Require a pull request before merging
- Tích chọn option này
- (Optional) Tích **Require approvals** nếu muốn yêu cầu review trước khi merge

### ✅ Require status checks to pass before merging
- **BẮT BUỘC**: Tích chọn option này
- Tích **Require branches to be up to date before merging**
- Trong ô search **Status checks that are required**, tìm và chọn:
  - ✅ `API Tests (REQUIRED)`
  - (Optional) `ESLint Check`
  - (Optional) `Build Check`

### ✅ Require conversation resolution before merging
- (Optional) Tích chọn nếu muốn resolve tất cả comments trước khi merge

### ✅ Do not allow bypassing the above settings
- Tích chọn để admin cũng phải tuân theo rules

## Bước 4: Lưu settings

Click nút **Create** hoặc **Save changes** ở cuối trang.

---

## ✨ Kết quả

Sau khi thiết lập xong:

1. ❌ **KHÔNG THỂ merge PR** nếu tests trong `src/tests/api.spec.ts` fail
2. ✅ **CHỈ CÓ THỂ merge** khi tất cả tests PASS
3. 🤖 GitHub Actions sẽ tự động chạy tests mỗi khi có PR
4. 💬 Bot sẽ comment kết quả test trên PR

---

## 🧪 Test thử

Để test xem đã hoạt động chưa:

1. Tạo một branch mới
2. Sửa code để test fail (ví dụ: đổi `expect(response.status()).toBe(200)` thành `toBe(500)`)
3. Tạo Pull Request
4. Bạn sẽ thấy:
   - ❌ Merge button bị disable
   - 💬 Bot comment là tests failed
   - ⚠️ GitHub hiển thị "Required status check has not run"

5. Fix lại test để pass
6. Push code mới
7. Bạn sẽ thấy:
   - ✅ Merge button được enable
   - 💬 Bot comment là tests passed
   - ✅ GitHub hiển thị "All checks have passed"

---

## 📝 Lưu ý quan trọng

- File workflow đã được tạo tại: `.github/workflows/test-required.yml`
- Test file: `src/tests/api.spec.ts`
- Workflow sẽ tự động chạy khi có Pull Request vào master/main
- Nếu test fail, PR KHÔNG THỂ merge cho đến khi fix

## 🔧 Troubleshooting

### Nếu status check không hiển thị trong Branch Protection Rules:
1. Tạo một PR test để trigger workflow lần đầu
2. Đợi workflow chạy xong
3. Quay lại Settings → Branches → Edit rule
4. Status check sẽ xuất hiện trong danh sách

### Nếu muốn test locally trước khi push:
```bash
npm test
```

### Xem test report:
```bash
npm run test:report
```

### Debug tests:
```bash
npm run test:debug
```
