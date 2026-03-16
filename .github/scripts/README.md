# AI-Powered Secret Scanner

Scanner này sử dụng **Claude AI** để phát hiện thông minh các secrets, API keys, passwords và thông tin nhạy cảm trong code.

## 🎯 Tính năng

- ✅ **AI-First Detection**: Sử dụng Claude 3.5 Sonnet để phân tích code với context awareness
- ✅ **Giảm False Positives**: AI hiểu context và loại bỏ các cảnh báo giả
- ✅ **Intelligent Recommendations**: Đề xuất cách fix cụ thể cho từng finding
- ✅ **Fallback Mode**: Tự động chuyển sang regex patterns nếu không có API key

## 📋 Setup

### 1. Cài đặt dependencies

```bash
npm install @anthropic-ai/sdk
```

### 2. Lấy Anthropic API Key

1. Truy cập [https://console.anthropic.com/](https://console.anthropic.com/)
2. Đăng nhập hoặc tạo tài khoản
3. Vào **API Keys** → **Create Key**
4. Copy API key

### 3. Cấu hình trong GitHub

1. Vào repository → **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Tạo secret:
   - Name: `ANTHROPIC_API_KEY`
   - Value: `sk-ant-api...` (API key vừa copy)

### 4. Local Testing

Để test local:

```bash
# Set API key
export ANTHROPIC_API_KEY="sk-ant-api..."

# Scan changed files
node .github/scripts/secret-scanner.js changed

# Scan all files
node .github/scripts/secret-scanner.js all
```

## 🔄 Cách hoạt động

### AI-First Mode (When API key available)

```
Code → Claude AI Analysis → Intelligent Detection → Verify Real Secrets → Report
```

Claude AI sẽ:
- Đọc và hiểu context của code
- Phân biệt giữa test data và production code
- Loại bỏ false positives (env vars, placeholders, examples)
- Đánh giá mức độ nguy hiểm thực tế
- Đề xuất cách fix cụ thể

### Fallback Mode (No API key)

```
Code → Regex Patterns → Basic Detection → Report
```

Vẫn hoạt động với regex patterns truyền thống nếu không có API key.

## 📊 Output Example

```
🔐 AI-Powered Secret Scanner Report
==================================================

Files scanned: 5
AI Engine: ✓ Claude 3.5 Sonnet
Potential secrets found: 2

🚨 CRITICAL (1):

1. MongoDB URI
   File: src/config/database.js:12
   Description: MongoDB connection string with embedded credentials
   Found: mongodb+srv://admin:password123@cluster...
   💡 Fix: Move to environment variable MONGODB_URI

⚠️  HIGH (1):

2. JWT Secret
   File: src/auth/jwt.js:5
   Description: JWT secret key hardcoded
   Found: jwt_secret_key_production_2024
   💡 Fix: Move to environment variable JWT_SECRET
```

## 🛡️ Security Notes

- ⚠️ **KHÔNG commit API key** vào code
- ✅ API key chỉ được lưu trong GitHub Secrets
- ✅ CI/CD tự động inject API key khi chạy
- ✅ Local development cần set environment variable

## 🔧 Troubleshooting

### "ANTHROPIC_API_KEY not found"

Scanner sẽ tự động fallback sang regex mode. Để dùng AI:
- Local: `export ANTHROPIC_API_KEY="your-key"`
- GitHub: Thêm secret `ANTHROPIC_API_KEY` trong Settings

### "AI analysis failed"

Nếu AI fail (network, quota, etc), scanner tự động fallback sang regex mode.

### False Positives

Nếu scanner báo sai:
1. Kiểm tra xem có phải secret thật không
2. Nếu là test data, thêm vào whitelist trong scanner
3. AI thường rất chính xác nên cân nhắc kỹ trước khi ignore

## 💰 Cost Estimate

- Model: Claude 3.5 Sonnet
- ~$0.003 per file scan (average)
- Typical PR with 5 files = ~$0.015
- Monthly cost for active repo: ~$1-5

## 📚 Further Reading

- [Anthropic API Docs](https://docs.anthropic.com/)
- [Claude 3.5 Sonnet](https://www.anthropic.com/claude)
- [Secret Management Best Practices](https://owasp.org/www-community/vulnerabilities/Use_of_hard-coded_password)
