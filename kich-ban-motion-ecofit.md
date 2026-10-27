# Kịch bản hiệu ứng Ecofit

**Trạng thái:** Đã tăng cường chuyển động sau phản hồi “lướt qua không nhận ra” và triển khai vào `assets/ecofit-stories.js` cùng `assets/ecofit-stories.css`.

## Hướng thiết kế

Một hành trình liền mạch **“Từ chất liệu đến chuyển động”**. Chỉ có **một hero carousel** ở đầu trang; ba ảnh đang có ở hero được giữ nguyên trong cùng khung. Các ảnh khác chỉ xuất hiện đúng một lần ở những phần nội dung phù hợp. Áo luôn là màu trắng ngà với hai sọc hồng nhạt; giữ chữ nằm sẵn trong ảnh gốc.

Kịch bản ưu tiên một hiệu ứng chủ đạo có liên hệ với chất liệu áo, thay vì phủ nhiều hiệu ứng nhỏ lên toàn trang. Người xem lần lượt hiểu chất liệu, nhìn kỹ chi tiết áo, rồi mới tới phong cách Ecofit và khu vực sản phẩm.

## Kịch bản theo nhịp cuộn

### 1. Vào trang — hero duy nhất

- Giữ banner Ecofit gốc làm ảnh mở đầu và giữ nguyên chữ trong ảnh.
- Hai ảnh mẫu áo trắng hiện có nằm chung trong carousel này; không tách thành hero thứ hai và không đem lặp xuống dưới.
- Sau 5 giây mới chuyển ảnh. Chuyển cảnh bằng một đường cắt chéo đỏ hồng và mép sáng chạy hết khung trong khoảng 1 giây; ảnh mới lùi nhẹ từ 1.085 về 1.00. Đây là một lớp chuyển cảnh trên cùng carousel, không thêm hero.
- Thay thanh điều khiển dạng viên nổi bằng mũi tên gọn và vạch tiến trình mảnh ở đáy ảnh. Giữ nút tạm dừng và thao tác bằng bàn phím.

### 2. Rời hero — mở câu chuyện Bamboo

- Khi hero gần ra khỏi màn hình, tiêu đề “Vải Bamboo” hiện lên trước; một nét màu hồng san hô chạy dưới tiêu đề rồi dẫn mắt xuống ảnh.
- Hai infographic Bamboo được trình bày **lần lượt theo chiều cuộn**, không ghép thành hai ảnh lớn sát nhau. Ảnh thứ nhất giới thiệu áo polo; ảnh thứ hai xuất hiện sau đoạn mô tả ngắn về bề mặt vải.
- Ảnh mở bằng mặt nạ chéo từ hai hướng, đường chỉ sáng chạy ngang theo mép mở và ảnh có độ sâu khi cuộn. Dùng scroll-driven animation của CSS khi trình duyệt hỗ trợ; giữ hiệu ứng mở ảnh làm phương án dự phòng. Không ghim màn hình, nên cuộn vẫn theo tay người xem.

### 3. Điểm nhấn — soi chi tiết mẫu áo trắng

- Dành ảnh cận mẫu áo trắng riêng cho một khung lớn, nền trắng ngà; không lấy ảnh đã dùng ở hero.
- Khi khung đi vào vùng nhìn, vệt sáng rõ hơn lướt một lần trên ảnh; hai điểm đánh số 01/02 phát nhịp sáng để chỉ sọc vai và cổ tim. Vệt sáng không đổi màu áo.
- Hai điểm tương tác mở nhãn giải thích. Trên điện thoại, chạm để mở; trên máy tính, rê chuột hoặc bấm.
- Nhãn chỉ nói những chi tiết đã xác nhận: vải bamboo prime, màu trắng ngà, cổ tim, tay ngắn và hai sọc hồng nhạt.

### 4. Phong cách Ecofit — chuyển từ chi tiết sang cách mặc

- Tiêu đề và ảnh phong cách xuất hiện so le; ảnh trượt vào từ hai hướng, mở bằng đường chéo rồi dịch chuyển nhẹ theo tiến độ cuộn.
- Ảnh sưu tập, athleisure và ảnh thể thao xanh giữ đúng vai trò nội dung; không chuyển chúng lên hero và không lặp ảnh mẫu áo.
- Ảnh cuối mở ra lời dẫn tới khu vực sản phẩm bằng một nút rõ ràng.

## Hiệu năng và khả năng dùng

- Không dựng cảnh 3D/WebGL, không phát video nền, không khóa cuộn. Hiệu ứng chính dùng opacity, transform và mask nhẹ.
- Chỉ ưu tiên tải ảnh hero đầu tiên; ảnh kế tiếp được giải mã trước lúc chuyển để tránh khựng. Tạm dừng tự chạy khi tab bị ẩn hoặc hero ra khỏi màn hình.
- Nếu người dùng bật giảm chuyển động, bỏ vệt sáng và mask; ảnh, chữ và thao tác vẫn dùng được.
- Trên màn hình nhỏ, giữ cuộn dọc tự nhiên, xếp ảnh Bamboo thành từng khối và giữ vùng bấm đủ lớn.

## Cơ sở tham khảo

- **PUMA Velocity 2 Experience — Awwwards:** trang cảm hứng ghi nhận nhịp kể chuyện gồm mở đầu, giải thích tính năng và giới thiệu sản phẩm. Kịch bản Ecofit mượn cấu trúc kể chuyện, không bê nguyên 3D nặng. [Awwwards: PUMA Velocity 2 Experience](https://www.awwwards.com/inspiration/high-fidelity-3d-scrolling-experience)
- **NAMESAKE — CSS Design Awards, Website of the Day:** trang ghi nhận e-commerce có animation/liquid; điểm bình chọn công khai UI 8.83, UX 8.59, Innovation 8.80 và điểm hội đồng 8.74. Đây là tín hiệu tham khảo từ hệ thống chấm giải, không phải khảo sát đại diện cho mọi khách hàng. [CSSDA: NAMESAKE](https://www.cssdesignawards.com/sites/namesake/43003)
- **Protest Sportswear — CSS Design Awards, Website of the Day:** ví dụ thuộc ngành thể thao, được gắn nhãn animated, eCommerce, responsive; điểm hội đồng 7.65. [CSSDA: Protest Sportswear](https://www.cssdesignawards.com/sites/protest-sportswear/29627/)
- **GSAP ScrollTrigger:** tài liệu mô tả cách gắn animation vào vị trí cuộn, tối ưu cập nhật cuộn và tránh scroll-jacking; đây là hướng kỹ thuật có thể cân nhắc sau khi duyệt kịch bản. [GSAP ScrollTrigger](https://gsap.com/docs/v3/Plugins/ScrollTrigger/)
- **CSS scroll-driven animations — MDN:** `view()` gắn tiến độ hiệu ứng với phần tử đi vào và ra khỏi vùng nhìn; CSS xử lý trực tiếp theo thao tác cuộn, tránh dùng vòng lặp JavaScript đọc vị trí cuộn. [MDN: Scroll-driven animation timelines](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Scroll-driven_animations/Timelines)
