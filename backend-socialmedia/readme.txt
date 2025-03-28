1. Cài đặt.
install jdk 21, maven 3.9.9, mongodb 8.0, apache tomcat 10.0.20, visual studio code.


2. Cài biến môi trường 

# Dự án sử dụng Brevo API
## Cài đặt

### Bước 1: Tạo tài khoản Brevo

1. Đăng ký tài khoản tại [Brevo](https://www.brevo.com).
2. Sau khi đăng nhập vào tài khoản, vào phần `SMTP & API` trong bảng điều khiển.
3. Tạo một API key mới từ phần **API Keys**.

### Bước 2: Cấu hình Biến Môi Trường (Environment Variables)

1. Tạo một file `.env` trong thư mục gốc của dự án.
2. Thêm API key của Brevo vào file `.env` như sau:

```bash
SENDINBLUE_API_KEY=your_brevo_api_key_here


3. Chạy ứng dụng.
- Chạy ứng dụng bằng mvn tại folder socialmedia.
mvn spring-boot:run







