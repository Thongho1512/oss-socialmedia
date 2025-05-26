# 1. Cài đặt

install: JDK 21, Maven 3.9.9, MongoDB 8.0, Apache Tomcat 10.0.20, Visual Studio Code.


# 2. Cài biến môi trường 

## Dự án sử dụng Brevo API
### Cài đặt

#### Bước 1: Tạo tài khoản Brevo

1. Đăng ký tài khoản tại [Brevo](https://www.brevo.com).
2. Sau khi đăng nhập vào tài khoản, vào phần `SMTP & API` trong bảng điều khiển.
3. Tạo một API key mới từ phần **API Keys**.(1)

#### Bước 2: Cấu hình Biến Môi Trường (Environment Variables)

1. Tạo một file `.env` trong thư mục gốc của dự án.
2. Thêm API key của Brevo vào file `.env` như sau:

```bash
SENDINBLUE_API_KEY=your_brevo_api_key_here(1)
```

#### Bước 3: Chạy ứng dụng.
1. Chạy back-end bằng mvn tại folder backend-socialmedia.
```bash
mvn spring-boot:run
```
Ứng dụng chạy tại http://localhost:8080 , truy cập tài liệu API tại địa chỉ: http://localhost:8080/swagger-ui.html.

2.Chạy front-end bằng npm tại folder frontend-socialmedia
```bash
npm install && npm start
```
Ứng dụng chạy tại http://localhost:3000
### ⚠️ Lưu ý: Dịch vụ MongoDB phải được bật trước khi chạy ứng dụng
