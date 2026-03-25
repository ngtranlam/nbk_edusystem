# Hướng dẫn Deploy lên Render

## Bước 1: Chuẩn bị Git Repository

```bash
cd /Users/lamnguyen.dev/Documents/edusystem/edusystem-app

# Khởi tạo git (nếu chưa có)
git init

# Thêm remote repository
git remote add origin git@github.com:ngtranlam/nbk_edusystem.git

# Thêm tất cả file
git add .

# Commit
git commit -m "Initial commit: NBK EduSystem - Smart Education Management System"

# Push lên GitHub
git push -u origin main
```

**Lưu ý:** Nếu branch mặc định là `master`, dùng:
```bash
git branch -M main
git push -u origin main
```

## Bước 2: Deploy trên Render

### 2.1. Tạo tài khoản Render
1. Truy cập https://render.com
2. Đăng ký/Đăng nhập bằng GitHub account

### 2.2. Tạo Static Site mới
1. Click **"New +"** → **"Static Site"**
2. Connect GitHub repository: `ngtranlam/nbk_edusystem`
3. Cấu hình:
   - **Name:** `nbk-edusystem` (hoặc tên bạn muốn)
   - **Branch:** `main`
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `build`
   - **Auto-Deploy:** Yes (tự động deploy khi push code)

4. Click **"Create Static Site"**

### 2.3. Đợi deployment hoàn tất
- Render sẽ tự động:
  - Clone repository
  - Chạy `npm install`
  - Chạy `npm run build`
  - Deploy thư mục `build`
  
- Thời gian: ~3-5 phút

### 2.4. Truy cập website
Sau khi deploy xong, Render sẽ cung cấp URL dạng:
```
https://nbk-edusystem.onrender.com
```

## Bước 3: Cấu hình Custom Domain (Tùy chọn)

Nếu bạn có domain riêng:
1. Vào **Settings** → **Custom Domain**
2. Thêm domain của bạn
3. Cập nhật DNS records theo hướng dẫn của Render

## Bước 4: Cập nhật code sau này

Mỗi khi sửa code:
```bash
git add .
git commit -m "Mô tả thay đổi"
git push
```

Render sẽ **tự động deploy** phiên bản mới!

## Troubleshooting

### Lỗi build
- Kiểm tra logs tại Render Dashboard
- Đảm bảo `package.json` có đầy đủ dependencies
- Chạy `npm run build` local để test trước

### Lỗi 404 khi refresh
- Đã cấu hình `render.yaml` với rewrite rules
- Nếu vẫn lỗi, thêm file `public/_redirects`:
  ```
  /*    /index.html   200
  ```

### Performance
- Render free tier có thể sleep sau 15 phút không hoạt động
- Upgrade lên paid plan để tránh sleep

## Thông tin hệ thống

- **Framework:** React 19 + TypeScript
- **Build tool:** Create React App
- **AI:** Google Gemini API
- **Data:** JSON extracted từ Excel/Word
- **Hosting:** Render Static Site

---

**Liên hệ:** THCS Nguyễn Bỉnh Khiêm - Xã Cư M'gar
