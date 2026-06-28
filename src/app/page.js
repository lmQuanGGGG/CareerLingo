"use client";

import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '../utils/supabase/client';
import { 
  Award, BookOpen, Calendar, CheckCircle2, ChevronRight, Compass, 
  Flame, Globe, HelpCircle, History, Info, Key, Languages, Layers, Repeat,
  MapPin, MessageCircle, MessageSquare, Mic, MicOff, Music, Play, Pause, Square, RotateCcw, 
  Search, ShieldAlert, Star, Trophy, Volume2, VolumeX, User, 
  Sparkles, Check, X, AlertCircle, Bookmark, BookmarkCheck, ChevronLeft, LogOut, ChevronDown, Smile, Lock, MoreHorizontal
} from 'lucide-react';

const COMPLETED_DAYS_KEY = 'hotel_english_completed_days';
const XP_KEY = 'hotel_english_xp';
const STREAK_KEY = 'hotel_english_streak';
const FAVORITES_KEY = 'hotel_english_favorites';

const SYLLABUS = [
  {
    week: 1,
    weekTitle: "Tuần 1: Giao tiếp cơ bản lễ tân",
    days: [
      { id: 1, title: "Day 1: Chào hỏi khách hàng sang trọng", desc: "Cách đón tiếp khách theo tiêu chuẩn resort 5 sao", icon: "Globe" },
      { id: 2, title: "Day 2: Xác nhận thông tin đặt phòng", desc: "Kiểm tra hệ thống PMS và chào đón khách đặt trước", icon: "BookOpen" },
      { id: 3, title: "Day 3: Thu thập thông tin cá nhân", desc: "Hỏi hộ chiếu, thông tin liên lạc lịch sự", icon: "User" },
      { id: 4, title: "Day 4: Hướng dẫn đường đi & tiện ích", desc: "Chỉ dẫn nhà hàng, spa, hồ bơi và khu vực thang máy", icon: "Compass" },
      { id: 5, title: "Day 5: Giới thiệu dịch vụ đặc trưng", desc: "Upsell gói ăn sáng và nâng hạng phòng", icon: "Star" },
      { id: 6, title: "Day 6: Đàm thoại xã giao ban đầu", desc: "Hỏi han chuyến đi và thời tiết lịch thiệp", icon: "MessageCircle" },
      { id: 7, title: "Day 7: Ôn tập & Kiểm tra Tuần 1", desc: "Đánh giá khả năng giao tiếp đón tiếp cơ bản", icon: "Trophy" }
    ]
  },
  {
    week: 2,
    weekTitle: "Tuần 2: Quy trình Check-in và Check-out",
    days: [
      { id: 8, title: "Day 8: Quy trình check-in tiêu chuẩn", desc: "Quy trình 5 bước đón khách chuẩn quốc tế", icon: "Key" },
      { id: 9, title: "Day 9: Thỏa thuận đặt cọc (Deposit)", desc: "Giải thích tiền ký quỹ giữ chỗ dịch vụ phát sinh", icon: "ShieldAlert" },
      { id: 10, title: "Day 10: Xử lý phòng chưa sẵn sàng", desc: "Khéo léo xoa dịu khách khi đến sớm trước giờ nhận phòng", icon: "History" },
      { id: 11, title: "Day 11: Quy trình check-out nhanh", desc: "Hỏi han trải nghiệm nghỉ dưỡng của khách", icon: "CheckCircle2" },
      { id: 12, title: "Day 12: Giải thích chi tiết hóa đơn", desc: "Bóc tách các khoản chi tiêu phòng, mini-bar, VAT", icon: "Info" },
      { id: 13, title: "Day 13: Xử lý thanh toán đa phương thức", desc: "Thanh toán qua thẻ tín dụng, chuyển khoản, tiền mặt", icon: "Award" },
      { id: 14, title: "Day 14: Ôn tập quy trình nhận trả phòng", desc: "Kiểm tra tình huống nghiệp vụ lễ tân quan trọng", icon: "Trophy" }
    ]
  },
  {
    week: 3,
    weekTitle: "Tuần 3: Dịch vụ khách hàng cao cấp (Concierge)",
    days: [
      { id: 15, title: "Day 15: Hỗ trợ hành lý & Bell service", desc: "Phối hợp với Bellman vận chuyển hành lý", icon: "Compass" },
      { id: 16, title: "Day 16: Đặt xe taxi & Phương tiện di chuyển", desc: "Sắp xếp xe Limousine đưa đón sân bay lịch sự", icon: "MapPin" },
      { id: 17, title: "Day 17: Đặt tour du lịch địa phương", desc: "Tư vấn điểm đến danh tiếng tại Việt Nam", icon: "Globe" },
      { id: 18, title: "Day 18: Đặt bàn nhà hàng Michelin", desc: "Hỗ trợ khách đặt chỗ ăn tối lãng mạn", icon: "Star" },
      { id: 19, title: "Day 19: Điều phối yêu cầu Room Service", desc: "Chuyển giao yêu cầu ẩm thực hoặc đồ dùng phòng", icon: "MessageCircle" },
      { id: 20, title: "Day 20: Xử lý các yêu cầu đặc biệt", desc: "Trang trí phòng trăng mật, chuẩn bị bánh sinh nhật", icon: "Sparkles" },
      { id: 21, title: "Day 21: Ôn tập nghiệp vụ khách hàng", desc: "Kiểm tra kỹ năng điều phối dịch vụ Concierge", icon: "Trophy" }
    ]
  },
  {
    week: 4,
    weekTitle: "Tuần 4: Xử lý tình huống khẩn cấp & Phàn nàn",
    days: [
      { id: 22, title: "Day 22: Tiếp nhận phàn nàn tiếng ồn", desc: "Cách xoa dịu khách khi phòng lân cận ồn ào", icon: "ShieldAlert" },
      { id: 23, title: "Day 23: Giải quyết sự cố hỏng thiết bị", desc: "Xử lý điều hòa không mát, mất nước nóng lập tức", icon: "Info" },
      { id: 24, title: "Day 24: Thủ tục đổi phòng (Room Change)", desc: "Đổi phòng mới tương đương hoặc nâng cấp miễn phí", icon: "Key" },
      { id: 25, title: "Day 25: Xử lý mất mát tài sản cá nhân", desc: "Hỗ trợ khách tìm kiếm đồ thất lạc (Lost & Found)", icon: "Search" },
      { id: 26, title: "Day 26: Xử lý khách say xỉn, quá khích", desc: "Giữ bình tĩnh và bảo vệ trật tự sảnh khách sạn", icon: "ShieldAlert" },
      { id: 27, title: "Day 27: Phục vụ khách siêu VIP (CIP/VIP)", desc: "Nghệ thuật chăm sóc chu đáo khách thượng lưu", icon: "Sparkles" },
      { id: 28, title: "Day 28: Tình huống y tế & khẩn cấp", desc: "Hô hoán cấp cứu hoặc xử lý báo động cháy nổ", icon: "AlertCircle" },
      { id: 29, title: "Day 29: Xử lý yêu cầu trả phòng muộn", desc: "Tính phí phụ thu hoặc ưu đãi miễn phí muộn", icon: "History" },
      { id: 30, title: "Day 30: Đánh giá tốt nghiệp Lễ tân 5 Sao", desc: "Bài kiểm tra tổng hợp toàn diện kỹ năng tiếng Anh", icon: "Trophy" }
    ]
  }
];

const RAW_VOCAB_30_DAYS = [
  "Welcome:Chào mừng,Greeting:Lời chào,Lobby:Sảnh,Arrival:Sự đến nơi,Guest:Khách hàng,Greet:Chào hỏi,Approach:Tiếp cận,Smile:Mỉm cười,Assist:Hỗ trợ,Escort:Hộ tống,Warm:Ấm áp,Courteous:Lịch sự,Professional:Chuyên nghiệp,Polite:Lịch thiệp,Luxurious:Sang trọng,Front Desk:Quầy lễ tân,First impression:Ấn tượng đầu,Eye contact:Giao tiếp mắt,Body language:Ngôn ngữ cơ thể,Check-in counter:Quầy nhận phòng",
  "Pool:Hồ bơi,Spa:Khu thư giãn,Gym:Phòng tập,Restaurant:Nhà hàng,Lounge:Phòng chờ,Direct:Chỉ đường,Show:Cho thấy,Explain:Giải thích,Locate:Định vị,Guide:Hướng dẫn,Spacious:Rộng rãi,Exclusive:Độc quyền,Fully-equipped:Đầy đủ thiết bị,Indoor:Trong nhà,Outdoor:Ngoài trời,Business Center:Trung tâm công tác,Banquet Hall:Phòng tiệc,Fitness Center:Trung tâm thể hình,Opening hours:Giờ mở cửa,Operating time:Thời gian hoạt động",
  "Name:Tên,Passport:Hộ chiếu,Address:Địa chỉ,Phone:Điện thoại,Email:Thư điện tử,Request:Yêu cầu,Verify:Xác minh,Provide:Cung cấp,Spell:Đánh vần,Confirm:Xác nhận,Valid:Hợp lệ,Current:Hiện tại,Official:Chính thức,Personal:Cá nhân,Confidential:Bảo mật,ID card:Thẻ căn cước,Nationality:Quốc tịch,Date of birth:Ngày sinh,Signature:Chữ ký,Registration form:Phiếu đăng ký",
  "Elevator:Thang máy,Corridor:Hành lang,Staircase:Cầu thang,Floor:Tầng,Exit:Lối ra,Turn:Rẽ,Go straight:Đi thẳng,Cross:Băng qua,Follow:Đi theo,Reach:Đến nơi,Left:Bên trái,Right:Bên phải,Ahead:Phía trước,Behind:Phía sau,Beside:Bên cạnh,Ground floor:Tầng trệt,Basement:Tầng hầm,Mezzanine:Tầng lửng,Emergency exit:Lối thoát hiểm,Signboard:Biển chỉ dẫn",
  "Telephone:Điện thoại bàn,Line:Đường dây,Message:Tin nhắn,Operator:Tổng đài viên,Receiver:Ống nghe,Hold:Giữ máy,Transfer:Chuyển máy,Connect:Kết nối,Answer:Trả lời,Hang up:Cúp máy,Busy:Bận,Available:Trống,Engaged:Đang gọi,Clear:Rõ ràng,Urgent:Khẩn cấp,Extension number:Số máy lẻ,Dial code:Mã vùng,Voicemail:Hộp thư thoại,Wake-up call:Cuộc gọi báo thức,Room to room:Gọi giữa các phòng",
  "Booking:Đặt chỗ,Availability:Sự có sẵn,Rate:Mức giá,Deposit:Tiền cọc,Confirmation:Sự xác nhận,Reserve:Đặt trước,Cancel:Hủy bỏ,Modify:Chỉnh sửa,Guarantee:Đảm bảo,Quote:Báo giá,Fully booked:Kín phòng,Available:Còn trống,Non-refundable:Không hoàn tiền,Flexible:Linh hoạt,Standard:Tiêu chuẩn,Reservation number:Mã đặt phòng,Credit card:Thẻ tín dụng,Arrival date:Ngày đến,Departure date:Ngày đi,Room type:Loại phòng",
  "Review:Ôn tập,Progress:Tiến độ,Knowledge:Kiến thức,Skill:Kỹ năng,Confidence:Sự tự tin,Practice:Luyện tập,Remember:Ghi nhớ,Apply:Áp dụng,Master:Làm chủ,Improve:Cải thiện,Excellent:Xuất sắc,Fluent:Trôi chảy,Accurate:Chính xác,Polished:Chỉn chu,Refined:Tinh tế,Weekly assessment:Đánh giá tuần,Role play:Đóng vai,Scenario:Tình huống,Communication:Giao tiếp,Standard protocol:Quy chuẩn",
  "Check-in:Nhận phòng,Keycard:Thẻ từ,Folio:Hồ sơ phòng,Upgrade:Nâng hạng,Luggage tag:Thẻ hành lý,Process:Xử lý,Hand over:Giao lại,Brief:Tóm tắt,Welcome back:Chào mừng trở lại,Settle in:Ổn định,Seamless:Mượt mà,Prompt:Nhanh chóng,Welcoming:Niềm nở,Efficient:Hiệu quả,Organized:Có tổ chức,Registration card:Thẻ đăng ký,Room key:Chìa khóa phòng,Welcome drink:Nước chào mừng,Luggage assistance:Hỗ trợ hành lý,Bellman:Nhân viên hành lý",
  "Visa:Thị thực,Document:Tài liệu,Expiration:Sự hết hạn,Customs:Hải quan,Identity:Danh tính,Scan:Quét,Photocopy:Sao chụp,Check:Kiểm tra,Validate:Xác thực,Return:Trả lại,Authentic:Thật,Expired:Hết hạn,Valid:Còn hạn,Foreign:Nước ngoài,Domestic:Trong nước,Immigration:Nhập cư,Entry stamp:Dấu nhập cảnh,Passport page:Trang hộ chiếu,Legal requirement:Yêu cầu pháp lý,Data privacy:Bảo mật dữ liệu",
  "Suite:Phòng Suite,View:Tầm nhìn,Balcony:Ban công,Minibar:Tủ lạnh nhỏ,Safe:Két sắt,Describe:Miêu tả,Highlight:Nhấn mạnh,Demonstrate:Minh họa,Enjoy:Thưởng thức,Relax:Thư giãn,Ocean-facing:Hướng biển,City-view:Hướng thành phố,Spacious:Rộng rãi,Cozy:Ấm cúng,Luxurious:Xa hoa,King-size bed:Giường King,Air conditioning:Điều hòa,Thermostat:Bộ điều chỉnh nhiệt,Complimentary water:Nước miễn phí,Wi-Fi password:Mật khẩu Wi-Fi",
  "Terminal:Máy cà thẻ,PIN:Mã PIN,Receipt:Biên lai,Cash:Tiền mặt,Currency:Tiền tệ,Swipe:Cà thẻ,Insert:Đút thẻ,Tap:Chạm thẻ,Authorize:Ủy quyền,Charge:Tính phí,Approved:Được chấp thuận,Declined:Bị từ chối,Insufficient:Không đủ,Pending:Đang chờ,Successful:Thành công,Credit card machine:Máy POS,Exchange rate:Tỷ giá,Signature line:Dòng chữ ký,Total amount:Tổng số tiền,Payment method:Phương thức thanh toán",
  "Check-out:Trả phòng,Departure:Sự khởi hành,Feedback:Phản hồi,Luggage:Hành lý,Transport:Vận chuyển,Finalize:Hoàn tất,Review:Xem xét lại,Hope:Hy vọng,Farewell:Tạm biệt,Depart:Khởi hành,Memorable:Đáng nhớ,Pleasant:Thú vị,Satisfactory:Hài lòng,Wonderful:Tuyệt vời,Safe:An toàn,Outstanding balance:Dư nợ,Guest satisfaction:Sự hài lòng,Farewell greeting:Lời tạm biệt,Transportation request:Yêu cầu xe cộ,Luggage storage:Gửi hành lý",
  "Invoice:Hóa đơn,Tax:Thuế,Fee:Phí,Discount:Giảm giá,Surcharge:Phụ phí,Explain:Giải thích,Clarify:Làm rõ,Calculate:Tính toán,Itemize:Liệt kê,Print:In ấn,Detailed:Chi tiết,Inclusive:Bao gồm,Exclusive:Không bao gồm,Net:Giá thực,Gross:Giá gộp,Room rate:Giá phòng,Service charge:Phí dịch vụ,VAT:Thuế VAT,Mini-bar consumption:Sử dụng mini-bar,Incidental charge:Phí phát sinh",
  "Settlement:Sự thanh toán,Transaction:Giao dịch,Record:Bản ghi,Account:Tài khoản,Balance:Số dư,Reconcile:Đối chiếu,Close:Đóng,Audit:Kiểm toán,Sign:Ký tên,Archive:Lưu trữ,Accurate:Chính xác,Balanced:Cân bằng,Clear:Rõ ràng,Final:Cuối cùng,Completed:Hoàn thành,Billing process:Quy trình lập hóa đơn,Folio closure:Đóng hồ sơ,Payment gateway:Cổng thanh toán,Audit report:Báo cáo kiểm toán,Guest history:Lịch sử khách",
  "Menu:Thực đơn,Tray:Khay,Cutlery:Dao nĩa,Beverage:Đồ uống,Delivery:Sự giao hàng,Order:Đặt món,Serve:Phục vụ,Pour:Rót,Clear:Dọn dẹp,Recommend:Gợi ý,Delicious:Ngon miệng,Hot:Nóng,Cold:Lạnh,Fresh:Tươi,Prompt:Nhanh chóng,Room service:Dịch vụ phòng,In-room dining:Ăn tại phòng,Dietary requirement:Yêu cầu ăn kiêng,Allergy:Dị ứng,Signature dish:Món đặc trưng",
  "Table:Bàn,Cuisine:Ẩm thực,Chef:Đầu bếp,Appetizer:Món khai vị,Dessert:Tráng miệng,Book:Đặt,Host:Đón tiếp,Seat:Sắp xếp chỗ,Taste:Nếm,Garnish:Trang trí món,Romantic:Lãng mạn,Authentic:Chuẩn vị,Gourmet:Thượng hạng,Vegan:Thuần chay,Gluten-free:Không Gluten,Fine dining:Ẩm thực cao cấp,Window seat:Chỗ ngồi cạnh cửa,Dress code:Quy định trang phục,Wine pairing:Kết hợp rượu,Buffet breakfast:Sáng tự chọn",
  "Cab:Xe taxi,Fare:Cước phí,Destination:Điểm đến,Driver:Tài xế,Limousine:Xe siêu sang,Hail:Gọi xe,Arrange:Sắp xếp,Wait:Chờ đợi,Drive:Lái xe,Drop off:Thả khách,Estimated:Ước tính,Metered:Tính theo đồng hồ,Fixed:Cố định,Private:Riêng tư,Shared:Đi chung,Taxi stand:Trạm taxi,Airport transfer:Đưa đón sân bay,Shuttle bus:Xe trung chuyển,Vehicle type:Loại xe,Traffic condition:Tình trạng giao thông",
  "Excursion:Chuyến tham quan,Guide:Hướng dẫn viên,Itinerary:Lịch trình,Ticket:Vé,Attraction:Điểm tham quan,Explore:Khám phá,Visit:Thăm quan,Experience:Trải nghiệm,Discover:Phát hiện,Join:Tham gia,Historical:Lịch sử,Cultural:Văn hóa,Scenic:Đẹp mắt,Local:Địa phương,Fascinating:Hấp dẫn,Tour desk:Quầy tour,City tour:Tour thành phố,Sightseeing:Ngắm cảnh,Entrance fee:Vé vào cổng,Half-day tour:Tour nửa ngày",
  "Pillow:Gối,Blanket:Chăn,Adapter:Bộ chuyển đổi,Charger:Cục sạc,Iron:Bàn ủi,Borrow:Mượn,Lend:Cho mượn,Deliver:Giao,Fulfill:Hoàn thành,Request:Yêu cầu,Extra:Thêm,Hypoallergenic:Chống dị ứng,Firm:Cứng,Soft:Mềm,International:Quốc tế,Special request:Yêu cầu đặc biệt,Housekeeping item:Vật dụng buồng phòng,Ironing board:Cầu là,Baby cot:Nôi em bé,Extra bed:Giường phụ",
  "Amenity:Tiện ích,Privacy:Sự riêng tư,Discretion:Sự thận trọng,Butler:Quản gia,Preference:Sở thích,Anticipate:Đoán trước,Exceed:Vượt quá,Pamper:Chiều chuộng,Tailor:Cá nhân hóa,Ensure:Đảm bảo,Exclusive:Độc quyền,Presidential:Tổng thống,Elite:Tinh hoa,Discreet:Kín đáo,Personalized:Cá nhân hóa,VIP treatment:Sự đối đãi VIP,Red carpet:Thảm đỏ,High-profile:Nổi tiếng,Welcome amenity:Quà chào mừng,Personal butler:Quản gia riêng",
  "Arrangement:Sự sắp xếp,Logistics:Hậu cần,Coordination:Sự phối hợp,Network:Mạng lưới,Contact:Liên hệ,Organize:Tổ chức,Liaise:Liên lạc,Manage:Quản lý,Facilitate:Tạo điều kiện,Execute:Thực thi,Flawless:Hoàn hảo,Seamless:Xuyên suốt,Efficient:Hiệu quả,Reliable:Đáng tin cậy,Proactive:Chủ động,Concierge desk:Quầy hỗ trợ,Guest experience:Trải nghiệm khách,Special occasion:Dịp đặc biệt,Surprise:Bất ngờ,Event planning:Lên kế hoạch sự kiện",
  "Issue:Vấn đề,Apology:Lời xin lỗi,Solution:Giải pháp,Compensation:Bồi thường,Patience:Sự kiên nhẫn,Apologize:Xin lỗi,Listen:Lắng nghe,Resolve:Giải quyết,Investigate:Điều tra,Compensate:Đền bù,Upset:Tức giận,Unacceptable:Không thể chấp nhận,Sorry:Rất tiếc,Sincere:Chân thành,Understanding:Thấu hiểu,Guest complaint:Phàn nàn của khách,Service failure:Lỗi dịch vụ,Action plan:Kế hoạch hành động,Service recovery:Phục hồi dịch vụ,Follow-up:Theo dõi",
  "Relocation:Sự di dời,Downgrade:Hạ hạng,Upgrade:Nâng hạng,Packing:Đóng gói,Availability:Phòng trống,Move:Di chuyển,Pack:Thu dọn,Transfer:Chuyển,Reassign:Phân công lại,Assist:Giúp đỡ,Inconvenient:Bất tiện,Better:Tốt hơn,Equivalent:Tương đương,Quiet:Yên tĩnh,Spacious:Rộng hơn,Room change:Đổi phòng,Maintenance issue:Lỗi bảo trì,Luggage transfer:Chuyển hành lý,New key:Chìa khóa mới,Room category:Hạng phòng",
  "Item:Vật dụng,Description:Mô tả,Location:Vị trí,Claim:Yêu cầu nhận lại,Belonging:Đồ đạc,Lose:Đánh mất,Find:Tìm thấy,Store:Lưu kho,Identify:Nhận diện,Return:Hoàn trả,Lost:Bị mất,Found:Được tìm thấy,Valuable:Giá trị,Missing:Thất lạc,Unclaimed:Chưa nhận,Lost and found:Thất lạc và tìm thấy,Security office:Phòng an ninh,Log book:Sổ ghi chép,Claim form:Đơn nhận lại,Dispatch:Gửi đi",
  "Extension:Sự gia hạn,Half-day:Nửa ngày,Fee:Khoản phí,Schedule:Lịch trình,Flight:Chuyến bay,Extend:Gia hạn,Charge:Tính tiền,Allow:Cho phép,Accommodate:Đáp ứng,Check:Kiểm tra,Late:Muộn,Complimentary:Miễn phí,Subject to:Tùy thuộc vào,Guaranteed:Được đảm bảo,Tentative:Dự kiến,Late check-out:Trả phòng trễ,Next guest:Khách tiếp theo,Occupancy:Công suất phòng,Departure time:Giờ khởi hành,Half-day charge:Phí nửa ngày",
  "Disturbance:Sự quấy rầy,Neighbor:Hàng xóm,Security:An ninh,Warning:Cảnh báo,Noise:Tiếng ồn,Complain:Phàn nàn,Warn:Cảnh cáo,Patrol:Tuần tra,Quiet down:Im lặng,Monitor:Giám sát,Loud:Ồn ào,Noisy:Mất trật tự,Disruptive:Gây rối,Peaceful:Yên bình,Strict:Nghiêm ngặt,Noise complaint:Phàn nàn tiếng ồn,Security guard:Bảo vệ,Warning call:Cuộc gọi nhắc nhở,Party:Tiệc tùng,Quiet hours:Giờ giới nghiêm",
  "Fire:Hỏa hoạn,Alarm:Báo động,Evacuation:Sơ tán,Ambulance:Xe cứu thương,Medical:Y tế,Evacuate:Sơ tán,Alert:Cảnh báo,Rescue:Cứu hộ,Call:Gọi,Protect:Bảo vệ,Urgent:Khẩn cấp,Critical:Nguy kịch,Safe:An toàn,Dangerous:Nguy hiểm,Immediate:Ngay lập tức,Emergency exit:Lối thoát hiểm,Fire extinguisher:Bình chữa cháy,First aid:Sơ cứu,Muster point:Điểm tập trung,Paramedic:Nhân viên y tế",
  "Policy:Chính sách,Manager:Quản lý,Understanding:Sự thấu hiểu,Conflict:Xung đột,Behavior:Hành vi,Calm:Giữ bình tĩnh,De-escalate:Làm dịu,Explain:Trình bày,Refuse:Từ chối,Stand firm:Giữ vững,Angry:Giận dữ,Difficult:Khó tính,Aggressive:Hung hăng,Polite:Lịch sự,Firm:Kiên quyết,Difficult guest:Khách khó tính,Hotel policy:Chính sách khách sạn,Manager on duty:Quản lý trực ca,Resolution:Cách giải quyết,Boundaries:Giới hạn",
  "Fluency:Sự trôi chảy,Articulation:Sự phát âm rõ,Tone:Giọng điệu,Pitch:Cao độ,Vocabulary:Từ vựng,Speak:Nói,Pronounce:Phát âm,Converse:Trò chuyện,Engage:Tương tác,Impress:Gây ấn tượng,Natural:Tự nhiên,Clear:Rõ ràng,Confident:Tự tin,Smooth:Mượt mà,Professional:Chuyên nghiệp,Final practice:Luyện tập cuối,Speaking test:Bài kiểm tra nói,Role play:Đóng vai,Scenario:Tình huống,Communication skill:Kỹ năng giao tiếp",
  "Certification:Chứng nhận,Excellence:Sự xuất sắc,Mastery:Sự thành thạo,Graduation:Tốt nghiệp,Professionalism:Sự chuyên nghiệp,Achieve:Đạt được,Complete:Hoàn thành,Celebrate:Ăn mừng,Succeed:Thành công,Award:Trao thưởng,Outstanding:Nổi bật,Certified:Được chứng nhận,Exceptional:Ngoại lệ,Proud:Tự hào,Ready:Sẵn sàng,Final assessment:Đánh giá cuối kỳ,Certificate:Bằng cấp,Career:Sự nghiệp,Five-star standard:Tiêu chuẩn năm sao,Hospitality master:Bậc thầy khách sạn"
];

const IPA_DICT = {
  "Welcome": "/ˈwɛlkəm/",
  "Greeting": "/ˈgritɪŋ/",
  "Lobby": "/ˈlɑbi/",
  "Arrival": "/ərˈaɪvəl/",
  "Guest": "/gɛst/",
  "Greet": "/grit/",
  "Approach": "/əˈproʊʧ/",
  "Smile": "/smaɪl/",
  "Assist": "/əˈsɪst/",
  "Escort": "/ˈɛskɔrt/",
  "Warm": "/wɔrm/",
  "Courteous": "/ˈkərtiəs/",
  "Professional": "/prəˈfɛʃənəl/",
  "Polite": "/pəˈlaɪt/",
  "Luxurious": "/ləgˈʒəriəs/",
  "Front Desk": "/frənt dɛsk/",
  "First impression": "/fərst ˌɪmˈprɛʃən/",
  "Eye contact": "/aɪ ˈkɑnˌtækt/",
  "Body language": "/ˈbɑdi ˈlæŋgwɪʤ/",
  "Check-in counter": "/ˈtʃek.ɪn ˈkaʊn.tər/",
  "Pool": "/pul/",
  "Spa": "/spɑ/",
  "Gym": "/ʤɪm/",
  "Restaurant": "/ˈrɛˌstrɑnt/",
  "Lounge": "/laʊnʤ/",
  "Direct": "/dɪˈrɛkt/",
  "Show": "/ʃoʊ/",
  "Explain": "/ɪkˈspleɪn/",
  "Locate": "/ˈloʊˌkeɪt/",
  "Guide": "/gaɪd/",
  "Spacious": "/ˈspeɪʃəs/",
  "Exclusive": "/ɪkˈsklusɪv/",
  "Fully-equipped": "/ˈfʊl.i.ɪˈkwɪpt/",
  "Indoor": "/ˈɪnˌdɔr/",
  "Outdoor": "/ˈaʊtˌdɔr/",
  "Business Center": "/ˈbɪznɪs ˈsɛnər/",
  "Banquet Hall": "/ˈbæŋkwət hɔl/",
  "Fitness Center": "/ˈfɪtnəs ˈsɛnər/",
  "Opening hours": "/ˈoʊpənɪŋ aʊərz/",
  "Operating time": "/ˈɔpərˌeɪtɪŋ taɪm/",
  "Name": "/neɪm/",
  "Passport": "/ˈpæˌspɔrt/",
  "Address": "/ˈæˌdrɛs/",
  "Phone": "/foʊn/",
  "Email": "/iˈmeɪl/",
  "Request": "/rɪkˈwɛst/",
  "Verify": "/ˈvɛrəˌfaɪ/",
  "Provide": "/prəˈvaɪd/",
  "Spell": "/spɛl/",
  "Confirm": "/kənˈfərm/",
  "Valid": "/ˈvælɪd/",
  "Current": "/ˈkɑrənt/",
  "Official": "/əˈfɪʃəl/",
  "Personal": "/ˈpərsɪnəl/",
  "Confidential": "/ˌkɑnfəˈdɛnʃəl/",
  "ID card": "/ˈaɪˈdi kɑrd/",
  "Nationality": "/ˌnæʃəˈnælɪti/",
  "Date of birth": "/deɪt əv bərθ/",
  "Signature": "/ˈsɪgnəʧər/",
  "Registration form": "/ˌrɛʤɪˈstreɪʃən fɔrm/",
  "Elevator": "/ˈɛləˌveɪtər/",
  "Corridor": "/ˈkɔrɪdər/",
  "Staircase": "/ˈstɛrˌkeɪs/",
  "Floor": "/flɔr/",
  "Exit": "/ˈɛksət/",
  "Turn": "/tərn/",
  "Go straight": "/goʊ streɪt/",
  "Cross": "/krɔs/",
  "Follow": "/ˈfɑloʊ/",
  "Reach": "/riʧ/",
  "Left": "/lɛft/",
  "Right": "/raɪt/",
  "Ahead": "/əˈhɛd/",
  "Behind": "/bɪˈhaɪnd/",
  "Beside": "/ˌbiˈsaɪd/",
  "Ground floor": "/graʊnd flɔr/",
  "Basement": "/ˈbeɪsmənt/",
  "Mezzanine": "/ˈmɛzəˌnin/",
  "Emergency exit": "/ˈimərʤənsi ˈɛksət/",
  "Signboard": "/ˈsaɪn.bɔːrd/",
  "Telephone": "/ˈtɛləˌfoʊn/",
  "Line": "/laɪn/",
  "Message": "/ˈmɛsɪʤ/",
  "Operator": "/ˈɑpərˌeɪtər/",
  "Receiver": "/rɪˈsivər/",
  "Hold": "/hoʊld/",
  "Transfer": "/ˈtrænsfər/",
  "Connect": "/kəˈnɛkt/",
  "Answer": "/ˈænsər/",
  "Hang up": "/hæŋ əp/",
  "Busy": "/ˈbɪzi/",
  "Available": "/əˈveɪləbəl/",
  "Engaged": "/ɪnˈgeɪʤd/",
  "Clear": "/klɪr/",
  "Urgent": "/ˈərʤənt/",
  "Extension number": "/ɪkˈstɛnʃən ˈnəmbər/",
  "Dial code": "/daɪəl koʊd/",
  "Voicemail": "/ˈvɔɪsˌmeɪl/",
  "Wake-up call": "/ˈweɪˌkəp kɔl/",
  "Room to room": "/rum tɪ rum/",
  "Booking": "/ˈbʊkɪŋ/",
  "Availability": "/əˌveɪləˈbɪlɪti/",
  "Rate": "/reɪt/",
  "Deposit": "/dɪˈpɑzət/",
  "Confirmation": "/ˌkɑnfərˈmeɪʃən/",
  "Reserve": "/rɪˈzərv/",
  "Cancel": "/ˈkænsəl/",
  "Modify": "/ˈmɑdəˌfaɪ/",
  "Guarantee": "/ˌgɛrənˈti/",
  "Quote": "/kwoʊt/",
  "Fully booked": "/ˈfʊli bʊkt/",
  "Non-refundable": "/nɑnrɪˈfəndəbəl/",
  "Flexible": "/ˈflɛksəbəl/",
  "Standard": "/ˈstændərd/",
  "Reservation number": "/ˌrɛzərˈveɪʃən ˈnəmbər/",
  "Credit card": "/ˈkrɛdɪt kɑrd/",
  "Arrival date": "/ərˈaɪvəl deɪt/",
  "Departure date": "/dɪˈpɑrʧər deɪt/",
  "Room type": "/rum taɪp/",
  "Review": "/ˌrivˈju/",
  "Progress": "/ˈprɑˌgrɛs/",
  "Knowledge": "/ˈnɑlɪʤ/",
  "Skill": "/skɪl/",
  "Confidence": "/ˈkɑnfədɛns/",
  "Practice": "/ˈpræktɪs/",
  "Remember": "/rɪˈmɛmbər/",
  "Apply": "/əˈplaɪ/",
  "Master": "/ˈmæstər/",
  "Improve": "/ˌɪmˈpruv/",
  "Excellent": "/ˈɛksələnt/",
  "Fluent": "/fluənt/",
  "Accurate": "/ˈækjərət/",
  "Polished": "/ˈpɑlɪʃt/",
  "Refined": "/rɪˈfaɪnd/",
  "Weekly assessment": "/ˈwikli əˈsɛsmənt/",
  "Role play": "/roʊl pleɪ/",
  "Scenario": "/sɪˈnɛrioʊ/",
  "Communication": "/kəmˌjunəˈkeɪʃən/",
  "Standard protocol": "/ˈstændərd ˈproʊtəˌkɔl/",
  "Check-in": "/ˈtʃek.ɪn/",
  "Keycard": "/ˈkiː.kɑːrd/",
  "Folio": "/ˈfəʊ.li.əʊ/",
  "Upgrade": "/ˈəpˈgreɪd/",
  "Luggage tag": "/ˈləgɪʤ tæg/",
  "Process": "/ˈprɔˌsɛs/",
  "Hand over": "/hænd ˈoʊvər/",
  "Brief": "/brif/",
  "Welcome back": "/ˈwɛlkəm bæk/",
  "Settle in": "/ˈsɛtəl ɪn/",
  "Seamless": "/ˈsimləs/",
  "Prompt": "/prɑmpt/",
  "Welcoming": "/ˈwɛlkəmɪŋ/",
  "Efficient": "/ɪˈfɪʃənt/",
  "Organized": "/ˈɔrgəˌnaɪzd/",
  "Registration card": "/ˌrɛʤɪˈstreɪʃən kɑrd/",
  "Room key": "/rum ki/",
  "Welcome drink": "/ˈwɛlkəm drɪŋk/",
  "Luggage assistance": "/ˈləgɪʤ əˈsɪstəns/",
  "Bellman": "/ˈbɛlmən/",
  "Visa": "/ˈvizə/",
  "Document": "/ˈdɑkjəmɛnt/",
  "Expiration": "/ˌɛkspərˈeɪʃən/",
  "Customs": "/ˈkəstəmz/",
  "Identity": "/aɪˈdɛntəˌti/",
  "Scan": "/skæn/",
  "Photocopy": "/ˈfoʊtoʊˌkɑpi/",
  "Check": "/ʧɛk/",
  "Validate": "/ˈvælədeɪt/",
  "Return": "/rɪˈtərn/",
  "Authentic": "/əˈθɛnɪk/",
  "Expired": "/ɪkˈspaɪrd/",
  "Foreign": "/ˈfɔrən/",
  "Domestic": "/dəˈmɛstɪk/",
  "Immigration": "/ˌɪməˈgreɪʃən/",
  "Entry stamp": "/ˈɛntri stæmp/",
  "Passport page": "/ˈpæˌspɔrt peɪʤ/",
  "Legal requirement": "/ˈligəl rɪkˈwaɪrmənt/",
  "Data privacy": "/ˈdætə ˈpraɪvəsi/",
  "Suite": "/swit/",
  "View": "/vju/",
  "Balcony": "/ˈbælkəni/",
  "Minibar": "/ˈmɪn.i.bɑːr/",
  "Safe": "/seɪf/",
  "Describe": "/dɪˈskraɪb/",
  "Highlight": "/ˈhaɪˌlaɪt/",
  "Demonstrate": "/ˈdɛmənˌstreɪt/",
  "Enjoy": "/ˌɛnˈʤɔɪ/",
  "Relax": "/rɪˈlæks/",
  "Ocean-facing": "/ˈəʊ.ʃən.feɪ.sɪŋ/",
  "City-view": "/ˈsɪt.i.vjuː/",
  "Cozy": "/ˈkoʊzi/",
  "King-size bed": "/ˈkɪŋ.saɪz bed/",
  "Air conditioning": "/ɛr kənˈdɪʃənɪŋ/",
  "Thermostat": "/ˈθərməˌstæt/",
  "Complimentary water": "/ˌkɑmpləˈmɛntəri ˈwɔtər/",
  "Wi-Fi password": "/ˈwaɪˌfaɪ ˈpæsˌwərd/",
  "Terminal": "/ˈtərmənəl/",
  "PIN": "/pɪn/",
  "Receipt": "/rɪˈsit/",
  "Cash": "/kæʃ/",
  "Currency": "/ˈkərənsi/",
  "Swipe": "/swaɪp/",
  "Insert": "/ˌɪnˈsərt/",
  "Tap": "/tæp/",
  "Authorize": "/ˈɔθərˌaɪz/",
  "Charge": "/ʧɑrʤ/",
  "Approved": "/əˈpruvd/",
  "Declined": "/dɪˈklaɪnd/",
  "Insufficient": "/ˌɪnsəˈfɪʃənt/",
  "Pending": "/ˈpɛndɪŋ/",
  "Successful": "/səkˈsɛsfəl/",
  "Credit card machine": "/ˈkrɛdɪt kɑrd məˈʃin/",
  "Exchange rate": "/ɪksˈʧeɪnʤ reɪt/",
  "Signature line": "/ˈsɪgnəʧər laɪn/",
  "Total amount": "/ˈtoʊtəl əˈmaʊnt/",
  "Payment method": "/ˈpeɪmənt ˈmɛθəd/",
  "Check-out": "/ˈtʃek.aʊt/",
  "Departure": "/dɪˈpɑrʧər/",
  "Feedback": "/ˈfidˌbæk/",
  "Luggage": "/ˈləgɪʤ/",
  "Transport": "/ˈtrænspɔrt/",
  "Finalize": "/ˈfaɪnəˌlaɪz/",
  "Hope": "/hoʊp/",
  "Farewell": "/ˌfɛrˈwɛl/",
  "Depart": "/dɪˈpɑrt/",
  "Memorable": "/ˈmɛmərəbəl/",
  "Pleasant": "/ˈplɛzənt/",
  "Satisfactory": "/ˌsætɪsˈfæktəri/",
  "Wonderful": "/ˈwəndərfəl/",
  "Outstanding balance": "/ˌaʊtˈstændɪŋ ˈbæləns/",
  "Guest satisfaction": "/gɛst ˌsætɪsˈfækʃən/",
  "Farewell greeting": "/ˌfɛrˈwɛl ˈgritɪŋ/",
  "Transportation request": "/ˌtrænspərˈteɪʃən rɪkˈwɛst/",
  "Luggage storage": "/ˈləgɪʤ ˈstɔrɪʤ/",
  "Invoice": "/ˈɪnvɔɪs/",
  "Tax": "/tæks/",
  "Fee": "/fi/",
  "Discount": "/ˈdɪskaʊnt/",
  "Surcharge": "/ˈsərˌʧɑrʤ/",
  "Clarify": "/ˈklɛrəˌfaɪ/",
  "Calculate": "/ˈkælkjəˌleɪt/",
  "Itemize": "/ˈaɪtəˌmaɪz/",
  "Print": "/prɪnt/",
  "Detailed": "/dɪˈteɪld/",
  "Inclusive": "/ˌɪnˈklusɪv/",
  "Net": "/nɛt/",
  "Gross": "/groʊs/",
  "Room rate": "/rum reɪt/",
  "Service charge": "/ˈsərvɪs ʧɑrʤ/",
  "VAT": "/væt/",
  "Mini-bar consumption": "/ˈmɪn.i.bɑːr kənˈsʌmp.ʃən/",
  "Incidental charge": "/ˌɪnsɪˈdɛntəl ʧɑrʤ/",
  "Settlement": "/ˈsɛtəlmənt/",
  "Transaction": "/trænˈzækʃən/",
  "Record": "/ˈrɛkərd/",
  "Account": "/əˈkaʊnt/",
  "Balance": "/ˈbæləns/",
  "Reconcile": "/ˈrɛkənˌsaɪl/",
  "Close": "/kloʊz/",
  "Audit": "/ˈɔdɪt/",
  "Sign": "/saɪn/",
  "Archive": "/ˈɑrˌkaɪv/",
  "Balanced": "/ˈbælənst/",
  "Final": "/ˈfaɪnəl/",
  "Completed": "/kəmˈplitɪd/",
  "Billing process": "/ˈbɪlɪŋ ˈprɔˌsɛs/",
  "Folio closure": "/ˈfəʊ.li.əʊ ˈkləʊ.ʒər/",
  "Payment gateway": "/ˈpeɪmənt ˈgeɪtˌweɪ/",
  "Audit report": "/ˈɔdɪt rɪˈpɔrt/",
  "Guest history": "/gɛst ˈhɪstəri/",
  "Menu": "/ˈmɛnju/",
  "Tray": "/treɪ/",
  "Cutlery": "/ˈkətləri/",
  "Beverage": "/ˈbɛvərɪʤ/",
  "Delivery": "/dɪˈlɪvəri/",
  "Order": "/ˈɔrdər/",
  "Serve": "/sərv/",
  "Pour": "/pɔr/",
  "Recommend": "/ˌrɛkəˈmɛnd/",
  "Delicious": "/dɪˈlɪʃəs/",
  "Hot": "/hɑt/",
  "Cold": "/koʊld/",
  "Fresh": "/frɛʃ/",
  "Room service": "/rum ˈsərvɪs/",
  "In-room dining": "/ɪn.ruːm ˈdaɪ.nɪŋ/",
  "Dietary requirement": "/ˈdaɪəˌtɛri rɪkˈwaɪrmənt/",
  "Allergy": "/ˈælərʤi/",
  "Signature dish": "/ˈsɪgnəʧər dɪʃ/",
  "Table": "/ˈteɪbəl/",
  "Cuisine": "/kwɪˈzin/",
  "Chef": "/ʃɛf/",
  "Appetizer": "/ˈæpəˌtaɪzər/",
  "Dessert": "/dɪˈzərt/",
  "Book": "/bʊk/",
  "Host": "/hoʊst/",
  "Seat": "/sit/",
  "Taste": "/teɪst/",
  "Garnish": "/ˈgɑrnɪʃ/",
  "Romantic": "/roʊˈmæntɪk/",
  "Gourmet": "/ˈgʊrˌmeɪ/",
  "Vegan": "/ˈvɛgən/",
  "Gluten-free": "/ˈɡluː.tən.friː/",
  "Fine dining": "/faɪn ˈdaɪnɪŋ/",
  "Window seat": "/ˈwɪndoʊ sit/",
  "Dress code": "/drɛs koʊd/",
  "Wine pairing": "/waɪn ˈpɛrɪŋ/",
  "Buffet breakfast": "/ˈbəfət ˈbrɛkfəst/",
  "Cab": "/kæb/",
  "Fare": "/fɛr/",
  "Destination": "/ˌdɛstɪˈneɪʃən/",
  "Driver": "/ˈdraɪvər/",
  "Limousine": "/ˈlɪməˌzin/",
  "Hail": "/heɪl/",
  "Arrange": "/əreɪnʤ/",
  "Wait": "/weɪt/",
  "Drive": "/draɪv/",
  "Drop off": "/drɔp ɔf/",
  "Estimated": "/ˈɛstəˌmeɪtɪd/",
  "Metered": "/ˈmitərd/",
  "Fixed": "/fɪkst/",
  "Private": "/ˈpraɪvət/",
  "Shared": "/ʃɛrd/",
  "Taxi stand": "/ˈtæksi stænd/",
  "Airport transfer": "/ˈɛrˌpɔrt ˈtrænsfər/",
  "Shuttle bus": "/ˈʃətəl bəs/",
  "Vehicle type": "/ˈviɪkəl taɪp/",
  "Traffic condition": "/ˈtræfɪk kənˈdɪʃən/",
  "Excursion": "/ɪkˈskərʒən/",
  "Itinerary": "/aɪˈtɪnərˌɛri/",
  "Ticket": "/ˈtɪkɪt/",
  "Attraction": "/əˈtrækʃən/",
  "Explore": "/ɪkˈsplɔr/",
  "Visit": "/ˈvɪzɪt/",
  "Experience": "/ɪkˈspɪriəns/",
  "Discover": "/dɪˈskəvər/",
  "Join": "/ʤɔɪn/",
  "Historical": "/hɪˈstɔrɪkəl/",
  "Cultural": "/ˈkəlʧərəl/",
  "Scenic": "/ˈsinɪk/",
  "Local": "/ˈloʊkəl/",
  "Fascinating": "/ˈfæsəˌneɪtɪŋ/",
  "Tour desk": "/tʊr dɛsk/",
  "City tour": "/ˈsɪti tʊr/",
  "Sightseeing": "/ˈsaɪtˈsiɪŋ/",
  "Entrance fee": "/ˈɛntrəns fi/",
  "Half-day tour": "/ˈhɑːf.deɪ tʊər/",
  "Pillow": "/ˈpɪloʊ/",
  "Blanket": "/ˈblæŋkɪt/",
  "Adapter": "/əˈdæptər/",
  "Charger": "/ˈʧɑrʤər/",
  "Iron": "/aɪərn/",
  "Borrow": "/ˈbɑˌroʊ/",
  "Lend": "/lɛnd/",
  "Deliver": "/dɪˈlɪvər/",
  "Fulfill": "/fʊlˈfɪl/",
  "Extra": "/ˈɛkstrə/",
  "Hypoallergenic": "/ˌhaɪ.pəʊ.æl.əˈdʒen.ɪk/",
  "Firm": "/fərm/",
  "Soft": "/sɔft/",
  "International": "/ˌɪnərˈnæʃənɑl/",
  "Special request": "/ˈspɛʃəl rɪkˈwɛst/",
  "Housekeeping item": "/ˈhaʊˌskipɪŋ ˈaɪtəm/",
  "Ironing board": "/ˈaɪərnɪŋ bɔrd/",
  "Baby cot": "/ˈbeɪbi kɑt/",
  "Extra bed": "/ˈɛkstrə bɛd/",
  "Amenity": "/əˈmɛnəti/",
  "Privacy": "/ˈpraɪvəsi/",
  "Discretion": "/dɪˈskrɛʃən/",
  "Butler": "/ˈbətlər/",
  "Preference": "/ˈprɛfərəns/",
  "Anticipate": "/ænˈtɪsəˌpeɪt/",
  "Exceed": "/ɪkˈsid/",
  "Pamper": "/ˈpæmpər/",
  "Tailor": "/ˈteɪlər/",
  "Ensure": "/ɪnˈʃʊr/",
  "Presidential": "/ˌprɛzɪˈdɛnʃəl/",
  "Elite": "/ɪˈlit/",
  "Discreet": "/dɪˈskrit/",
  "Personalized": "/ˈpərsənəˌlaɪzd/",
  "VIP treatment": "/ˌviˌaɪˈpi ˈtritmənt/",
  "Red carpet": "/rɛd ˈkɑrpət/",
  "High-profile": "/ˌhaɪˈproʊfaɪl/",
  "Welcome amenity": "/ˈwɛlkəm əˈmɛnəti/",
  "Personal butler": "/ˈpərsɪnəl ˈbətlər/",
  "Arrangement": "/ərˈeɪnʤmənt/",
  "Logistics": "/ləˈʤɪstɪks/",
  "Coordination": "/koʊˌɔrdəˈneɪʃən/",
  "Network": "/ˈnɛtˌwərk/",
  "Contact": "/ˈkɑnˌtækt/",
  "Organize": "/ˈɔrgəˌnaɪz/",
  "Liaise": "/liˈeɪz/",
  "Manage": "/ˈmænɪʤ/",
  "Facilitate": "/fəˈsɪləˌteɪt/",
  "Execute": "/ˈɛksəˌkjut/",
  "Flawless": "/ˈflɔləs/",
  "Reliable": "/rɪˈlaɪəbəl/",
  "Proactive": "/ˌproʊˈæktɪv/",
  "Concierge desk": "/ˌkɑnsiˈɛrʒ dɛsk/",
  "Guest experience": "/gɛst ɪkˈspɪriəns/",
  "Special occasion": "/ˈspɛʃəl əˈkeɪʒən/",
  "Surprise": "/səˈpraɪz/",
  "Event planning": "/ɪˈvɛnt ˈplænɪŋ/",
  "Issue": "/ˈɪʃu/",
  "Apology": "/əˈpɑləˌʤi/",
  "Solution": "/səˈluʃən/",
  "Compensation": "/ˌkɑmpənˈseɪʃən/",
  "Patience": "/ˈpeɪʃəns/",
  "Apologize": "/əˈpɑləˌʤaɪz/",
  "Listen": "/ˈlɪsən/",
  "Resolve": "/riˈzɑlv/",
  "Investigate": "/ˌɪnˈvɛstəˌgeɪt/",
  "Compensate": "/ˈkɑmpənˌseɪt/",
  "Upset": "/ˈəpˌsɛt/",
  "Unacceptable": "/ˌənækˈsɛptəbəl/",
  "Sorry": "/ˈsɑri/",
  "Sincere": "/sɪnˈsɪr/",
  "Understanding": "/ˌəndərˈstændɪŋ/",
  "Guest complaint": "/gɛst kəmˈpleɪnt/",
  "Service failure": "/ˈsərvɪs ˈfeɪljər/",
  "Action plan": "/ˈækʃən plæn/",
  "Service recovery": "/ˈsərvɪs rɪˈkəvəri/",
  "Follow-up": "/ˈfɑloʊˌəp/",
  "Relocation": "/ˌriˈloʊˈkeɪʃən/",
  "Downgrade": "/ˈdaʊnˈgreɪd/",
  "Packing": "/ˈpækɪŋ/",
  "Move": "/muv/",
  "Pack": "/pæk/",
  "Reassign": "/ˌriəˈsaɪn/",
  "Inconvenient": "/ˌɪnkənˈvinjənt/",
  "Better": "/ˈbɛtər/",
  "Equivalent": "/ɪkˈwɪvələnt/",
  "Quiet": "/kwaɪət/",
  "Room change": "/rum ʧeɪnʤ/",
  "Maintenance issue": "/ˈmeɪntənəns ˈɪʃu/",
  "Luggage transfer": "/ˈləgɪʤ ˈtrænsfər/",
  "New key": "/nu ki/",
  "Room category": "/rum ˈkætəˌgɔri/",
  "Item": "/ˈaɪtəm/",
  "Description": "/dɪˈskrɪpʃən/",
  "Location": "/loʊˈkeɪʃən/",
  "Claim": "/kleɪm/",
  "Belonging": "/bɪˈlɔŋɪŋ/",
  "Lose": "/luz/",
  "Find": "/faɪnd/",
  "Store": "/stɔr/",
  "Identify": "/aɪˈdɛntəˌfaɪ/",
  "Lost": "/lɔst/",
  "Found": "/faʊnd/",
  "Valuable": "/ˈvæljəbəl/",
  "Missing": "/ˈmɪsɪŋ/",
  "Unclaimed": "/ənˈkleɪmd/",
  "Lost and found": "/lɔst ənd faʊnd/",
  "Security office": "/sɪˈkjʊrəti ˈɔfəs/",
  "Log book": "/lɔg bʊk/",
  "Claim form": "/kleɪm fɔrm/",
  "Dispatch": "/dɪˈspæʧ/",
  "Extension": "/ɪkˈstɛnʃən/",
  "Half-day": "/ˈhɑːf.deɪ/",
  "Schedule": "/ˈskɛʤʊl/",
  "Flight": "/flaɪt/",
  "Extend": "/ɪkˈstɛnd/",
  "Allow": "/əˈlaʊ/",
  "Accommodate": "/əˈkɑməˌdeɪt/",
  "Late": "/leɪt/",
  "Complimentary": "/ˌkɑmpləˈmɛntəri/",
  "Subject to": "/ˈsəbʤɪkt tɪ/",
  "Guaranteed": "/ˌgɛrənˈtid/",
  "Tentative": "/ˈtɛntətɪv/",
  "Late check-out": "/leɪt ˈtʃek.aʊt/",
  "Next guest": "/nɛkst gɛst/",
  "Occupancy": "/ˈɑkjəpənsi/",
  "Departure time": "/dɪˈpɑrʧər taɪm/",
  "Half-day charge": "/ˈhɑːf.deɪ tʃɑːrdʒ/",
  "Disturbance": "/dɪˈstərbəns/",
  "Neighbor": "/ˈneɪbər/",
  "Security": "/sɪˈkjʊrəti/",
  "Warning": "/ˈwɔrnɪŋ/",
  "Noise": "/nɔɪz/",
  "Complain": "/kəmˈpleɪn/",
  "Warn": "/wɔrn/",
  "Patrol": "/pəˈtroʊl/",
  "Quiet down": "/kwaɪət daʊn/",
  "Monitor": "/ˈmɑnətər/",
  "Loud": "/laʊd/",
  "Noisy": "/ˈnɔɪzi/",
  "Disruptive": "/dɪsˈrəptɪv/",
  "Peaceful": "/ˈpisfəl/",
  "Strict": "/strɪkt/",
  "Noise complaint": "/nɔɪz kəmˈpleɪnt/",
  "Security guard": "/sɪˈkjʊrəti gɑrd/",
  "Warning call": "/ˈwɔrnɪŋ kɔl/",
  "Party": "/ˈpɑrti/",
  "Quiet hours": "/kwaɪət aʊərz/",
  "Fire": "/faɪər/",
  "Alarm": "/əˈlɑrm/",
  "Evacuation": "/ɪˌvækjəˈweɪʃən/",
  "Ambulance": "/ˈæmbjələns/",
  "Medical": "/ˈmɛdɪkəl/",
  "Evacuate": "/ɪˈvækjəˌeɪt/",
  "Alert": "/əˈlərt/",
  "Rescue": "/ˈrɛskju/",
  "Call": "/kɔl/",
  "Protect": "/prəˈtɛkt/",
  "Critical": "/ˈkrɪtɪkəl/",
  "Dangerous": "/ˈdeɪnʤərəs/",
  "Immediate": "/ˌɪˈmiˌdiət/",
  "Fire extinguisher": "/faɪər ɪkˈstɪŋgwɪʃər/",
  "First aid": "/fərst eɪd/",
  "Muster point": "/ˈməstər pɔɪnt/",
  "Paramedic": "/ˌpɛrəˈmɛdɪk/",
  "Policy": "/ˈpɑləsi/",
  "Manager": "/ˈmænɪʤər/",
  "Conflict": "/ˈkɑnflɪkt/",
  "Behavior": "/bɪˈheɪvjər/",
  "Calm": "/kɑm/",
  "De-escalate": "/diː.ˈes.kə.leɪt/",
  "Refuse": "/ˈrɛfˌjuz/",
  "Stand firm": "/stænd fərm/",
  "Angry": "/ˈæŋgri/",
  "Difficult": "/ˈdɪfəkəlt/",
  "Aggressive": "/əˈgrɛsɪv/",
  "Difficult guest": "/ˈdɪfəkəlt gɛst/",
  "Hotel policy": "/hoʊˈtɛl ˈpɑləsi/",
  "Manager on duty": "/ˈmænɪʤər ɔn ˈduti/",
  "Resolution": "/ˌrɛzəˈluʃən/",
  "Boundaries": "/ˈbaʊndəriz/",
  "Fluency": "/ˈfluənsi/",
  "Articulation": "/ˌɑrtɪkjəˈleɪʃən/",
  "Tone": "/toʊn/",
  "Pitch": "/pɪʧ/",
  "Vocabulary": "/voʊˈkæbjəˌlɛri/",
  "Speak": "/spik/",
  "Pronounce": "/prəˈnaʊns/",
  "Converse": "/ˈkɑnvərs/",
  "Engage": "/ɪnˈgeɪʤ/",
  "Impress": "/ˌɪmˈprɛs/",
  "Natural": "/ˈnæʧərəl/",
  "Confident": "/ˈkɑnfədənt/",
  "Smooth": "/smuð/",
  "Final practice": "/ˈfaɪnəl ˈpræktɪs/",
  "Speaking test": "/ˈspikɪŋ tɛst/",
  "Communication skill": "/kəmˌjunəˈkeɪʃən skɪl/",
  "Certification": "/ˌsərtəfəˈkeɪʃən/",
  "Excellence": "/ˈɛksələns/",
  "Mastery": "/ˈmæstəri/",
  "Graduation": "/ˌgræʤəˈweɪʃən/",
  "Professionalism": "/prəˈfɛʃənəˌlɪzəm/",
  "Achieve": "/əˈʧiv/",
  "Complete": "/kəmˈplit/",
  "Celebrate": "/ˈsɛləˌbreɪt/",
  "Succeed": "/səkˈsid/",
  "Award": "/əˈwɔrd/",
  "Outstanding": "/ˌaʊtˈstændɪŋ/",
  "Certified": "/ˈsərtəˌfaɪd/",
  "Exceptional": "/ɪkˈsɛpʃənəl/",
  "Proud": "/praʊd/",
  "Ready": "/ˈrɛdi/",
  "Final assessment": "/ˈfaɪnəl əˈsɛsmənt/",
  "Certificate": "/sərˈtɪfɪkət/",
  "Career": "/kərɪr/",
  "Five-star standard": "/faɪv.stɑːr ˈstæn.dərd/",
  "Hospitality master": "/ˌhɑspəˈtæləti ˈmæstər/"
};

const { LESSONS_DATA, VOCABULARY_BANK } = (() => {
  const vBank = [];
  const lData = {};

  for (let day = 1; day <= 30; day++) {
    const dayString = RAW_VOCAB_30_DAYS[day - 1];
    const dayPairs = dayString.split(',');
    
    const egTemplates = [
      "The guest was very impressed with our {word}.",
      "Please ensure the {word} process strictly follows our 5-star standard.",
      "Could you please assist the VIP guest with the {word}?",
      "Our hotel is renowned for its exceptional {word}.",
      "Make sure to handle the {word} with the utmost care.",
      "The manager requested a detailed report on the {word}.",
      "Excellent {word} can significantly boost our guest satisfaction scores.",
      "We always strive to maintain high quality in our {word}.",
      "Please review the {word} procedure for today's arriving guests.",
      "A proactive approach to {word} is expected from all staff members."
    ];
    
    const vocab = dayPairs.map((pair, index) => {
      const [en, vn] = pair.split(':');
      const ipa = IPA_DICT[en] || `/${en.toLowerCase().replace(/ /g, '.').replace(/-/g, '')}/`;
      
      const template = egTemplates[index % egTemplates.length];
      const eg = template.replace("{word}", en.toLowerCase());
      
      const wordObj = {
        word: en,
        ipa: ipa,
        mean: vn,
        eg: eg,
        category: `Day ${day}`
      };
      vBank.push(wordObj);
      return wordObj;
    });

    const dialogue = [
      { speaker: "Receptionist", text: `Good morning. Welcome to our hotel. How may I assist you regarding the ${vocab[0].word.toLowerCase()} today?` },
      { speaker: "Guest", text: `I have a specific question about the ${vocab[1].word.toLowerCase()}.` },
      { speaker: "Receptionist", text: `Certainly, Sir. Let me carefully check the ${vocab[2].word.toLowerCase()} for you right now.` },
      { speaker: "Guest", text: `Thank you. I truly appreciate your ${vocab[3].word.toLowerCase()} and professionalism.` },
      { speaker: "Receptionist", text: `It is my absolute pleasure. Everything regarding the ${vocab[4].word.toLowerCase()} is perfectly confirmed.` }
    ];

    const listening = {
      question: `Which specific item does the guest ask about in the conversation?`,
      options: [vocab[1].word, vocab[5].word, vocab[6].word, vocab[7].word],
      answer: vocab[1].word,
      blankSentence: `I have a specific question about the [blank].`,
      blankAnswer: vocab[1].word,
      scrambled: ["I", "have", "a", "specific", "question", "about", "the", vocab[1].word + "."],
      scrambledAnswer: `I have a specific question about the ${vocab[1].word}.`
    };

    const speaking = [
      {
        prompt: `How may I assist you regarding the ${vocab[0].word.toLowerCase()} today?`,
        translation: `Tôi có thể hỗ trợ quý khách về ${vocab[0].mean.toLowerCase()} hôm nay như thế nào ạ?`
      },
      {
        prompt: `Could you please provide more details about the ${vocab[1].word.toLowerCase()}?`,
        translation: `Quý khách có thể cung cấp thêm chi tiết về ${vocab[1].mean.toLowerCase()} được không ạ?`
      },
      {
        prompt: `I will ensure the ${vocab[2].word.toLowerCase()} is handled immediately.`,
        translation: `Tôi sẽ đảm bảo ${vocab[2].mean.toLowerCase()} được xử lý ngay lập tức.`
      },
      {
        prompt: `We apologize for any inconvenience caused by the ${vocab[3].word.toLowerCase()}.`,
        translation: `Chúng tôi xin lỗi vì bất kỳ sự bất tiện nào gây ra bởi ${vocab[3].mean.toLowerCase()}.`
      },
      {
        prompt: `Let me personally arrange the ${vocab[4].word.toLowerCase()} for you right away.`,
        translation: `Hãy để tôi đích thân sắp xếp ${vocab[4].mean.toLowerCase()} cho quý khách ngay bây giờ.`
      }
    ];

    const quiz = [];
    for (let i = 0; i < 10; i++) {
      // Create 10 deterministic questions out of the 20 words for this day to prevent hydration mismatches
      const v = vocab[i * 2]; 
      
      const optionsEn = [v.word, vocab[(i * 2 + 1) % 20].word, vocab[(i * 2 + 3) % 20].word, vocab[(i * 2 + 5) % 20].word].sort((a, b) => a.localeCompare(b));
      const optionsVn = [v.mean, vocab[(i * 2 + 1) % 20].mean, vocab[(i * 2 + 3) % 20].mean, vocab[(i * 2 + 5) % 20].mean].sort((a, b) => a.localeCompare(b));
      
      if (i % 3 === 0) {
        quiz.push({ q: `Đâu là ý nghĩa chuẩn nhất của từ '${v.word}'?`, a: v.mean, options: optionsVn });
      } else if (i % 3 === 1) {
        quiz.push({ q: `Từ tiếng Anh nào có nghĩa là "${v.mean}"?`, a: v.word, options: optionsEn });
      } else {
        quiz.push({ q: `Chọn từ thích hợp: 'Please ensure the ______ process strictly follows our 5-star standard.'`, a: v.word, options: optionsEn });
      }
    }

    lData[day] = { vocab, dialogue, listening, speaking, quiz };
  }

  return { LESSONS_DATA: lData, VOCABULARY_BANK: vBank };
})();

const SITUATIONS = [
  { id: 1, title: "Khách VIP đến nhận phòng đột xuất", category: "VIP Service", desc: "Đón tiếp chu đáo chính trị gia hoặc người nổi tiếng không có lịch hẹn trước.", dialog: "R: Welcome to Grand Palace, Excellency. It is a profound honor. We will escort you to our Royal Lounge immediately.\nG: Thank you, I appreciate the promptness and confidentiality.", vocab: "Excellency (Kính thưa Ngài), Confidentiality (Sự bảo mật), Royal Lounge (Phòng chờ hoàng gia)" },
  { id: 2, title: "Khách phàn nàn điều hòa phát ra tiếng kêu", category: "Complaint Handling", desc: "Khách gọi sảnh lúc nửa đêm báo điều hòa kêu rè rè khó ngủ.", dialog: "G: The AC in room 1205 is making an unbearable rattling noise!\nR: I deeply apologize for this disturbance, Sir. I will send our senior technician immediately. If it cannot be resolved in 10 minutes, I will arrange an immediate room upgrade.", vocab: "Unbearable rattling noise (Tiếng rè rè không thể chịu nổi), Disturbance (Sự làm phiền), Senior technician (Kỹ thuật viên trưởng)" },
  { id: 3, title: "Khách yêu cầu trả phòng muộn (Late Check-out)", category: "Check-out", desc: "Khách bay chuyến tối lúc 22:00 muốn xin check-out muộn tới 18:00.", dialog: "G: My flight is at 10 PM. Can I check out late around 6 PM?\nR: We can certainly offer you a late check-out. Up to 2 PM is complimentary for our elite members, and from 2 PM to 6 PM there will be a minor charge of 50% of the room rate.", vocab: "Elite members (Thành viên ưu tú), Minor charge (Khoản phụ thu nhỏ), Late check-out (Trả phòng muộn)" },
  { id: 4, title: "Khách làm mất thẻ từ phòng", category: "Check-in", desc: "Khách làm rơi thẻ từ tại bãi biển và lo lắng bị người khác đột nhập.", dialog: "G: I lost my key card on the beach! Can someone enter my room?\nR: Rest assured, Madam. I will deactivate your lost card on our security system immediately and issue a brand new pair of encoded keys for you. May I verify your passport for security?", vocab: "Deactivate (Vô hiệu hóa), Encoded keys (Thẻ từ mã hóa mới), Rest assured (Xin hãy yên tâm)" },
  { id: 5, title: "Khách muốn nâng hạng phòng lên Suite", category: "VIP Service", desc: "Cặp đôi kỷ niệm ngày cưới muốn chuyển từ phòng thường lên phòng Suite.", dialog: "G: Today is our wedding anniversary. Can we upgrade to a Suite?\nR: Happy Anniversary! I would love to make your stay magical. We have an exquisite Honeymoon Suite with private pool available. I can offer it to you at a special promotional upgrade rate.", vocab: "Wedding anniversary (Kỷ niệm ngày cưới), Honeymoon Suite (Phòng Suite tuần trăng mật), Upgrade rate (Mức giá nâng hạng)" },
  { id: 6, title: "Khách yêu cầu gọi xe Limousine đi sân bay", category: "Concierge", desc: "Khách doanh nhân cần xe sang đi sân bay Nội Bài gấp.", dialog: "G: I need a luxury ride to Noi Bai Airport in 20 minutes.\nR: Absolutely, Sir. I will arrange our private Mercedes S-Class Pullman. The driver will assist you with luggage. The fare can be charged directly to your room folio.", vocab: "Mercedes S-Class Pullman (Xe Mercedes cao cấp), Room folio (Hóa đơn phòng), Private driver (Tài xế riêng)" },
  { id: 7, title: "Khách phàn nàn phòng có mùi thuốc lá", category: "Complaint Handling", desc: "Khách không hút thuốc nhận phòng có mùi khói thuốc nồng nặc.", dialog: "G: This room smells heavily of cigarette smoke, and I requested a non-smoking room!\nR: I am terribly sorry for this unacceptable oversight, Madam. I am relocating you to a fresh, high-floor room immediately and sending our housekeeping team to sanitize the previous room.", vocab: "Relocating (Di dời phòng), Sanitize (Khử trùng/Làm sạch), Unacceptable oversight (Sự sơ suất không thể chấp nhận)" },
  { id: 8, title: "Khách say xỉn làm mất trật tự sảnh", category: "Emergency", desc: "Khách uống quá chén la hét gây phiền hà các khách hàng khác.", dialog: "R: Good evening, Sir. Let me escort you to your room for a comfortable rest. I can bring some warm ginger tea to your room.\nG: *slurring* I want to drink more at the bar!\nR: Our bar is currently closed, Sir. Please allow our guest relations officer to guide you safely to the elevator.", vocab: "Slurring (Nói lè nhè), Escort (Hộ tống), Guest relations officer (Nhân viên quan hệ khách hàng)" },
  { id: 9, title: "Khách phàn nàn ga trải giường có vết bẩn", category: "Complaint Handling", desc: "Khách phát hiện vết ố nhỏ trên ga trải giường khi vừa nhận phòng.", dialog: "G: There is a small stain on our bedsheet. This is not 5-star quality!\nR: I am deeply mortified to hear this, Madam. Our housekeeping supervisor will change the entire bedding set with ultra-fresh linens within 5 minutes. Please accept our sincerest apologies.", vocab: "Mortified (Cực kỳ xấu hổ/Hối lỗi), Linens (Ga gối), Bedding set (Bộ trải giường)" },
  { id: 10, title: "Khách yêu cầu dịch vụ báo thức (Wake-up Call)", category: "Concierge", desc: "Khách có buổi họp quan trọng lúc 7:00 sáng và cần báo thức lúc 5:30.", dialog: "G: I have an early meeting. Can you arrange a wake-up call at 5:30 AM?\nR: It would be my pleasure. I will program an automated telephone alarm for 5:30 AM, and our duty receptionist will personally call you 5 minutes later to ensure you are awake.", vocab: "Wake-up call (Cuộc gọi báo thức), Automated telephone alarm (Báo thức điện thoại tự động), Duty receptionist (Lễ tân trực ca)" },
  { id: 11, title: "Khách phàn nàn nước vòi sen không đủ nóng", category: "Complaint Handling", desc: "Khách muốn tắm bồn thư giãn nhưng nước chỉ ấm nhẹ.", dialog: "G: The hot water in my shower is barely lukewarm.\nR: I apologize for the inconvenience. I will ask our engineering team to inspect the central boiler system for your room's wing immediately. This should be resolved shortly.", vocab: "Central boiler system (Hệ thống lò hơi trung tâm), Lukewarm (Hơi ấm nhẹ), Inspect (Kiểm tra kỹ thuật)" },
  { id: 12, title: "Khách yêu cầu đặt bàn ăn tối ngắm hoàng hôn", category: "Concierge", desc: "Khách nhờ đặt nhà hàng ven biển có tầm nhìn ngắm hoàng hôn đẹp nhất Phú Quốc.", dialog: "G: Can you recommend a romantic restaurant with sunset views?\nR: I highly recommend 'The Ocean Whispers' on our rooftop terrace. I will secure the best front-row table for you at 5:30 PM to enjoy the golden hour perfectly.", vocab: "Rooftop terrace (Sân thượng), Golden hour (Khung giờ vàng hoàng hôn), Secure the table (Đảm bảo giữ bàn)" },
  { id: 13, title: "Khách muốn đổi tiền ngoại tệ sang VND", category: "Payment", desc: "Khách muốn đổi 500 USD sang tiền Việt tại quầy lễ tân.", dialog: "G: Can I exchange some US Dollars into Vietnamese Dong here?\nR: Certainly, Sir. We offer currency exchange services for our in-house guests based on today's official bank rates. May I have your passport to fill out the transaction form?", vocab: "Currency exchange (Đổi ngoại tệ), Official bank rates (Tỷ giá ngân hàng chính thức), In-house guests (Khách đang lưu trú)" },
  { id: 14, title: "Khách phàn nàn tiếng ồn từ công trường bên cạnh", category: "Complaint Handling", desc: "Khách bị đánh thức bởi tiếng búa đóng cọc từ dự án lân cận lúc 8:00 sáng.", dialog: "G: The construction noise outside is deafening! I came here to relax.\nR: We sincerely apologize. The local municipality is conducting road repairs. Let me relocate you to our premium garden-facing wing, which is completely insulated from the street side.", vocab: "Deafening (Điếc tai), Insulated (Cách âm), Municipality (Chính quyền thành phố)" },
  { id: 15, title: "Khách để quên hộ chiếu trong két an toàn sau check-out", category: "Emergency", desc: "Khách ra sân bay phát hiện quên hộ chiếu trong két an toàn phòng cũ.", dialog: "G: I am at the airport and just realized my passport is still in the room safe!\nR: Do not panic, Mr. Chen. I will send our security manager and head of housekeeping to open your safe box immediately. We will dispatch an express courier to deliver it directly to your terminal.", vocab: "Do not panic (Đừng hoảng sợ), Express courier (Chuyển phát nhanh hỏa tốc), Safe box (Két an toàn)" },
  { id: 16, title: "Khách hỏi thông tin Tour đi Vịnh Hạ Long", category: "Concierge", desc: "Khách muốn trải nghiệm du thuyền qua đêm trên Vịnh Hạ Long.", dialog: "G: What is the best way to see Halong Bay in two days?\nR: I highly recommend our partner luxury cruise, 'The Emperor'. It includes private limousine transfer, gourmet dining, and kayaking. I can book this exclusive experience for you.", vocab: "Luxury cruise (Du thuyền hạng sang), Gourmet dining (Ẩm thực thượng hạng), Limousine transfer (Xe đưa đón cao cấp)" },
  { id: 17, title: "Khách yêu cầu gối chống dị ứng (Hypoallergenic Pillow)", category: "Housekeeping", desc: "Khách bị hen suyễn cần đổi gối lông vũ sang gối sợi bông chống dị ứng.", dialog: "G: I am highly allergic to feather pillows. Do you have alternatives?\nR: Yes, Madam. We have high-quality hypoallergenic buckwheat and memory foam pillows. I will have housekeeping deliver them to your room immediately.", vocab: "Hypoallergenic (Chống gây dị ứng), Memory foam pillows (Gối cao su non), Feather pillows (Gối lông vũ)" },
  { id: 18, title: "Khách phàn nàn giá nước trong Mini-bar quá đắt", category: "Payment", desc: "Khách thắc mắc một lon nước ngọt giá 150,000 VND trên hóa đơn.", dialog: "G: 150k for a can of Coca-Cola in the room is outrageous!\nR: I understand your concern, Sir. Hotel mini-bar items carry a premium due to personalized restocking services. However, as an expression of goodwill, I will waive this beverage fee from your final bill.", vocab: "Outrageous (Quá đắt/Kinh khủng), Waive (Miễn trừ thanh toán), Expression of goodwill (Thể hiện thiện chí)" },
  { id: 19, title: "Khách bị dị ứng hải sản muốn gọi đồ ăn đặc biệt", category: "Room Service", desc: "Khách muốn đặt cơm chiên không chứa bất kỳ hải sản hay dầu hào nào.", dialog: "G: I have a severe shellfish allergy. Can I order seafood-free fried rice?\nR: Rest assured, Sir. I will put a high-priority allergy alert on your order and personally instruct our Executive Chef to prepare your dish using completely separate utensils.", vocab: "Shellfish allergy (Dị ứng hải sản có vỏ), Utensils (Dụng cụ nấu ăn), Executive Chef (Bếp trưởng điều hành)" },
  { id: 20, title: "Khách VIP yêu cầu dịch vụ quản gia riêng (Butler Service)", category: "VIP Service", desc: "Khách Tổng thống muốn quản gia chuẩn bị nước ấm bồn tắm lúc 19:00.", dialog: "G: I want my private bathtub prepared with rose petals and bath salts at exactly 7 PM.\nR: It would be an honor, Madam. Your dedicated butler will meticulously arrange the bath to your exact preferences at 7 PM sharp.", vocab: "Dedicated butler (Quản gia tận tụy), Rose petals (Cánh hoa hồng), Meticulously (Tỉ mỉ/Chu đáo)" }
];

for (let i = 21; i <= 50; i++) {
  const categories = ["Check-in", "Check-out", "Concierge", "Complaint Handling", "VIP Service", "Emergency"];
  const selectedCat = categories[i % categories.length];
  SITUATIONS.push({
    id: i,
    title: `Tình huống ${i}: Nghiệp vụ nâng cao chuyên ngành ${selectedCat}`,
    category: selectedCat,
    desc: `Quy trình thực tế nâng cao giúp rèn luyện khả năng giao tiếp và xử lý khủng hoảng tại quầy lễ tân liên quan đến ${selectedCat}.`,
    dialog: `G: This is an inquiry regarding high-end services.\nR: We are delighted to accommodate your request with our signature 5-star standard hospitality. How else may we exceed your expectations today?`,
    vocab: "Exceed expectations (Vượt mong đợi), Signature standard (Tiêu chuẩn đặc trưng), Accommodate request (Đáp ứng yêu cầu)"
  });
}

const ROLEPLAY_STARTERS = {
  'Khách VIP khó tính': [
    "Hello! I am checking in. I have a booking under the name of Richard Branson. I am extremely tired after a 12-hour flight. I expect exceptional service.",
    "Good evening. My assistant booked the Presidential Suite for me. I hope everything is perfectly arranged as requested.",
    "Excuse me. I arrived 10 minutes ago and nobody offered to carry my luggage. Is this how you treat your VIP members?",
    "I need to check in immediately. I also requested a room on the highest floor away from the elevator. I hope you got that right."
  ],
  'Khách du lịch': [
    "Hi there! We are checking in. We have a lot of luggage and the kids are exhausted. I booked a family suite under the name Smith. Can we get this done quickly?",
    "Hello! It's our first time visiting this city. I booked a double room for 3 nights. Could you also recommend some good local restaurants?",
    "Hi! I have a reservation under John Doe. Do you guys offer free breakfast and airport shuttle services?",
    "Good morning! We're here for our anniversary trip. Checking in under Emily. Are there any special upgrades available today?"
  ],
  'Khách doanh nhân': [
    "Good afternoon. Checking in. Name is David, Corporate booking. I have a very important Zoom meeting in 20 minutes, I need my room key and the fastest Wi-Fi password immediately.",
    "Hello. I'm here for the tech conference. Reservation under Michael. Could you also arrange a wake-up call for 5:30 AM tomorrow?",
    "Hi. Checking in for a business trip. Do you have a business center where I can print some documents later?",
    "Good evening. Corporate account under Sarah. I also need to book a taxi to the financial district for 8 AM tomorrow morning. Can you handle that?"
  ]
};

function getRandomRoleplayStart(persona) {
  const options = ROLEPLAY_STARTERS[persona] || ROLEPLAY_STARTERS['Khách VIP khó tính'];
  const randomIndex = Math.floor(Math.random() * options.length);
  return options[randomIndex];
}

export default function App() {
  const supabase = createClient();
  const [user, setUser] = useState(null);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);

  const [leaderboardUsers, setLeaderboardUsers] = useState([]);
  const [isLeaderboardLoading, setIsLeaderboardLoading] = useState(false);

  const [avatarUrl, setAvatarUrl] = useState('');
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [streakMessage, setStreakMessage] = useState(null);

  const [activeTab, setActiveTab] = useState('dashboard');
  const [showMobileMore, setShowMobileMore] = useState(false);
  const [completedDays, setCompletedDays] = useState([]);
  const [dayTasks, setDayTasks] = useState({});
  const [quizInputs, setQuizInputs] = useState({});
  const [xp, setXp] = useState(120);
  const [streak, setStreak] = useState(5);
  const [favorites, setFavorites] = useState([]);
  
  const [selectedDayId, setSelectedDayId] = useState(1);
  const [lessonActiveSubTab, setLessonActiveSubTab] = useState('vocab');
  
  const [listeningSelectedOption, setListeningSelectedOption] = useState(null);
  const [listeningShowResult, setListeningShowResult] = useState(false);
  const [listeningBlankInput, setListeningBlankInput] = useState('');
  const [listeningBlankCorrect, setListeningBlankCorrect] = useState(null);
  const [listeningScrambledWords, setListeningScrambledWords] = useState([]);
  const [listeningScrambledResult, setListeningScrambledResult] = useState([]);
  const [scrambledFeedback, setScrambledFeedback] = useState(null);
  const [quizAnswers, setQuizAnswers] = useState({});

  const [aiLessons, setAiLessons] = useState({});
  const [isLessonLoading, setIsLessonLoading] = useState(false);

  const [customScenarioPrompt, setCustomScenarioPrompt] = useState("");
  const [isGeneratingScenario, setIsGeneratingScenario] = useState(false);
  const [aiScenarios, setAiScenarios] = useState([]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      const fetchProgress = async () => {
        const { data, error } = await supabase
          .from('user_progress')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (data) {
          let currentXp = data.xp || 0;
          let currentStreak = data.streak || 0;
          let lastDateStr = data.last_active_date;
          
          const today = new Date();
          const todayStr = new Date(today.getTime() - (today.getTimezoneOffset() * 60000)).toISOString().split('T')[0];

          let didUpdateStreak = false;

          if (!lastDateStr) {
             // First time
             lastDateStr = todayStr;
             currentStreak = 0;
             didUpdateStreak = true;
          } else if (lastDateStr !== todayStr) {
             const lastDate = new Date(lastDateStr);
             const todayDate = new Date(todayStr);
             const diffTime = Math.abs(todayDate - lastDate);
             const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

             if (diffDays === 1) {
                // Consecutive day
                currentStreak += 1;
                lastDateStr = todayStr;
                didUpdateStreak = true;
             } else if (diffDays > 1) {
                // Missed days
                const missedDays = diffDays - 1;
                const cost = missedDays * 50;
                if (currentXp >= cost) {
                   // Streak freeze
                   currentXp -= cost;
                   currentStreak += 1;
                   lastDateStr = todayStr;
                   didUpdateStreak = true;
                   setStreakMessage({ type: 'saved', missedDays, cost });
                } else {
                   // Streak lost
                   currentStreak = 1;
                   lastDateStr = todayStr;
                   didUpdateStreak = true;
                   setStreakMessage({ type: 'lost', missedDays, cost });
                }
             }
          }

          setXp(currentXp);
          setStreak(currentStreak);
          setCompletedDays(data.completed_days || []);
          setDayTasks(data.day_tasks || {});
          setFavorites(data.favorites || []);
          setAiScenarios(data.ai_scenarios || []);
          setAiLessons(data.ai_lessons || {});
          if (data.avatar_url) setAvatarUrl(data.avatar_url);

          if (didUpdateStreak) {
            await supabase.from('user_progress').upsert({
              id: user.id,
              xp: currentXp,
              streak: currentStreak,
              last_active_date: lastDateStr
            });
          }
        }
      };
      fetchProgress();
    }
  }, [user]);

  useEffect(() => {
    if (activeTab === 'leaderboard') {
      const fetchLeaderboard = async () => {
        setIsLeaderboardLoading(true);
        const { data, error } = await supabase
          .from('leaderboard_view')
          .select('*')
          .limit(20);
        
        if (data && !error) {
          setLeaderboardUsers(data);
        }
        setIsLeaderboardLoading(false);
      };
      fetchLeaderboard();
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'lesson' && selectedDayId) {
      const correctCount = Object.values(quizAnswers).filter(a => a?.isCorrect).length;
      if (correctCount >= 8) {
        const currentDayTasks = dayTasks[selectedDayId] || {};
        if (!currentDayTasks.quiz) {
          const newTasks = { ...dayTasks, [selectedDayId]: { ...currentDayTasks, quiz: true } };
          setDayTasks(newTasks);
          
          if (newTasks[selectedDayId].vocab && !completedDays.includes(selectedDayId)) {
            const newCompleted = [...completedDays, selectedDayId];
            setCompletedDays(newCompleted);
            syncProgress(undefined, undefined, newCompleted, undefined, undefined, undefined, undefined, newTasks);
          } else {
            syncProgress(undefined, undefined, undefined, undefined, undefined, undefined, undefined, newTasks);
          }
        }
      }
    }
  }, [quizAnswers, selectedDayId, activeTab]);

  const syncProgress = async (newXp, newStreak, newCompleted, newFavs, newScenarios, newAiLessons, newAvatarUrl, newDayTasks) => {
    if (!user) return;
    await supabase.from('user_progress').upsert({
      id: user.id,
      xp: newXp !== undefined ? newXp : xp,
      streak: newStreak !== undefined ? newStreak : streak,
      completed_days: newCompleted !== undefined ? newCompleted : completedDays,
      day_tasks: newDayTasks !== undefined ? newDayTasks : dayTasks,
      favorites: newFavs !== undefined ? newFavs : favorites,
      ai_scenarios: newScenarios !== undefined ? newScenarios : aiScenarios,
      ai_lessons: newAiLessons !== undefined ? newAiLessons : aiLessons,
      avatar_url: newAvatarUrl !== undefined ? newAvatarUrl : avatarUrl,
    });
  };

  useEffect(() => {
    setQuizAnswers({});
    setScrambledFeedback(null);
  }, [selectedDayId]);

  useEffect(() => {
    if (activeTab === 'lesson' && !aiLessons[selectedDayId] && !isLessonLoading) {
      const fetchAiLesson = async () => {
        setIsLessonLoading(true);
        try {
          const vocabList = LESSONS_DATA[selectedDayId]?.vocab || LESSONS_DATA[1].vocab;
          const res = await fetch('/api/lesson', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ vocabList })
          });
          if (res.ok) {
            const data = await res.json();
            if (data.dialogue) {
              const updatedAiLessons = { ...aiLessons, [selectedDayId]: data };
              setAiLessons(updatedAiLessons);
              syncProgress(undefined, undefined, undefined, undefined, undefined, updatedAiLessons);
            }
          }
        } catch (error) {
          console.error("AI Lesson error:", error);
        } finally {
          setIsLessonLoading(false);
        }
      };
      fetchAiLesson();
    }
  }, [selectedDayId, activeTab, aiLessons]);

  // Audio Player States
  const audioRef = useRef(null);
  const [audioPlayer, setAudioPlayer] = useState({
    isVisible: false,
    isPlaying: false,
    progress: 0,
    duration: 0,
    text: '',
  });
  
  const [isRecording, setIsRecording] = useState(false);
  const [recognizedText, setRecognizedText] = useState('');
  const [speakingScore, setSpeakingScore] = useState(null);
  const [speakingFeedback, setSpeakingFeedback] = useState('');
  const [speakingBetterVersion, setSpeakingBetterVersion] = useState('');
  const [currentSpeakingIndex, setCurrentSpeakingIndex] = useState(0);

  const [librarySearch, setLibrarySearch] = useState('');
  const [libraryCategory, setLibraryCategory] = useState('All');
  const [selectedSituation, setSelectedSituation] = useState(null);

  const [vocabSearch, setVocabSearch] = useState('');
  const [selectedVocabCategory, setSelectedVocabCategory] = useState('All');

  // Vocab Check States
  const [isVocabCheckMode, setIsVocabCheckMode] = useState(false);
  const [currentVocabCheckIndex, setCurrentVocabCheckIndex] = useState(0);
  const [vocabCheckResults, setVocabCheckResults] = useState({ learned: 0, review: 0 });
  const [shuffledVocabCheckList, setShuffledVocabCheckList] = useState([]);
  const [currentVocabCheckOptions, setCurrentVocabCheckOptions] = useState([]);
  const [vocabCheckAnswerState, setVocabCheckAnswerState] = useState(null);

  // Smart Flashcards States
  const [currentFlashcardIndex, setCurrentFlashcardIndex] = useState(0);
  const [shuffledFlashcards, setShuffledFlashcards] = useState(VOCABULARY_BANK);
  const [currentFlashcardOptions, setCurrentFlashcardOptions] = useState([]);
  const [flashcardWrongAttempts, setFlashcardWrongAttempts] = useState([]);
  const [flashcardCorrectAttempt, setFlashcardCorrectAttempt] = useState(null);

  const [roleplayMessages, setRoleplayMessages] = useState(() => [
    { sender: 'guest', text: getRandomRoleplayStart('Khách VIP khó tính'), voicePlayed: false }
  ]);
  const [roleplayInput, setRoleplayInput] = useState('');
  const [isRoleplayLoading, setIsRoleplayLoading] = useState(false);
  const [roleplayDifficulty, setRoleplayDifficulty] = useState('Medium');
  const [roleplayPersona, setRoleplayPersona] = useState('Khách VIP khó tính');
  const [roleplaySpeechEnabled, setRoleplaySpeechEnabled] = useState(true);
  const [voices, setVoices] = useState([]);

  useEffect(() => {
    const savedCompletedDays = localStorage.getItem(COMPLETED_DAYS_KEY);
    if (savedCompletedDays) setCompletedDays(JSON.parse(savedCompletedDays));

    const savedXp = localStorage.getItem(XP_KEY);
    if (savedXp) setXp(parseInt(savedXp));

    const savedStreak = localStorage.getItem(STREAK_KEY);
    if (savedStreak) setStreak(parseInt(savedStreak));

    const savedFavs = localStorage.getItem(FAVORITES_KEY);
    if (savedFavs) setFavorites(JSON.parse(savedFavs));

    const loadVoices = () => {
      if ('speechSynthesis' in window) {
        setVoices(window.speechSynthesis.getVoices());
      }
    };
    loadVoices();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  const addXp = (amount) => {
    const newXp = xp + amount;
    setXp(newXp);
    localStorage.setItem(XP_KEY, newXp);
  };

  const markDayCompleted = (dayId) => {
    if (!completedDays.includes(dayId)) {
      const updated = [...completedDays, dayId];
      setCompletedDays(updated);
      localStorage.setItem(COMPLETED_DAYS_KEY, JSON.stringify(updated));
      addXp(100);
    }
  };

  const toggleFavorite = (word) => {
    let updated;
    if (favorites.includes(word)) {
      updated = favorites.filter(item => item !== word);
    } else {
      updated = [...favorites, word];
    }
    setFavorites(updated);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
  };

  const speakText = (text, lang = "en") => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    
    // Use local Next.js API route to proxy the TTS request and bypass browser CORS/policy blocks
    const shortLang = lang.split('-')[0] || 'en';
    const encodedText = encodeURIComponent(text.substring(0, 200));
    const audioUrl = `/api/tts?text=${encodedText}&lang=${shortLang}`;
    
    const audio = new Audio(audioUrl);
    audioRef.current = audio;
    
    setAudioPlayer({
      isVisible: true,
      isPlaying: true,
      progress: 0,
      duration: 0,
      text: text,
    });

    audio.addEventListener('loadedmetadata', () => {
      setAudioPlayer(prev => ({ ...prev, duration: audio.duration }));
    });

    audio.addEventListener('timeupdate', () => {
      setAudioPlayer(prev => ({ ...prev, progress: audio.currentTime }));
    });

    audio.addEventListener('ended', () => {
      setAudioPlayer(prev => ({ ...prev, isPlaying: false, progress: prev.duration || 0 }));
    });

    audio.play().catch(e => {
      console.error("Audio play failed, maybe mixed content or autoplay block", e);
    });
  };

  const toggleAudio = () => {
    if (audioRef.current) {
      if (audioPlayer.isPlaying) {
        audioRef.current.pause();
        setAudioPlayer(prev => ({ ...prev, isPlaying: false }));
      } else {
        audioRef.current.play();
        setAudioPlayer(prev => ({ ...prev, isPlaying: true }));
      }
    }
  };

  const seekAudio = (e) => {
    if (audioRef.current) {
      const time = parseFloat(e.target.value);
      audioRef.current.currentTime = time;
      setAudioPlayer(prev => ({ ...prev, progress: time }));
    }
  };

  const closeAudioPlayer = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setAudioPlayer(prev => ({ ...prev, isVisible: false, isPlaying: false, progress: 0, duration: 0 }));
  };

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds) || !isFinite(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const startSpeechRecognition = (onResultCallback) => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Trình duyệt của bạn chưa hỗ trợ nhận diện giọng nói. Hãy thử Chrome trên Desktop!");
      return null;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsRecording(true);
    };

    recognition.onresult = (event) => {
      const speechToText = event.results[0][0].transcript;
      onResultCallback(speechToText);
    };

    recognition.onerror = (event) => {
      console.error(event.error);
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognition.start();
    return recognition;
  };

  const handleStartSpeakingPractice = () => {
    const currentLesson = aiLessons[selectedDayId] || LESSONS_DATA[selectedDayId] || LESSONS_DATA[1];
    const speakingData = Array.isArray(currentLesson.speaking) ? currentLesson.speaking : [currentLesson.speaking];
    const currentPrompt = speakingData[currentSpeakingIndex] || speakingData[0];
    
    startSpeechRecognition(async (text) => {
      setRecognizedText(text);
      setSpeakingScore('...');
      setSpeakingFeedback('AI đang phân tích độ sang trọng trong câu nói của bạn...');
      setSpeakingBetterVersion('');

      try {
        const res = await fetch('/api/evaluate-speech', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            userInput: text,
            targetPrompt: currentPrompt.prompt
          })
        });

        if (res.ok) {
          const data = await res.json();
          setSpeakingScore(data.score || 0);
          setSpeakingFeedback(data.feedback || '');
          if (data.better_version) {
            setSpeakingBetterVersion(data.better_version);
          }
          if (data.score > 0) {
            addXp(Math.round(data.score / 5));
          }
        } else {
          setSpeakingScore(0);
          setSpeakingFeedback("Lỗi kết nối AI. Vui lòng thử lại.");
        }
      } catch (e) {
        setSpeakingScore(0);
        setSpeakingFeedback("Không thể kết nối đến máy chủ AI.");
      }
    });
  };

  const generateVocabCheckOptions = (correctWordObj, list) => {
    const options = [correctWordObj];
    const others = list.filter(w => w.word !== correctWordObj.word);
    const shuffledOthers = [...others].sort(() => 0.5 - Math.random());
    options.push(...shuffledOthers.slice(0, 3));
    return options.sort(() => 0.5 - Math.random());
  };

  const startVocabCheck = (shuffle = false) => {
    const vocabList = LESSONS_DATA[selectedDayId]?.vocab || LESSONS_DATA[1].vocab;
    const list = shuffle ? [...vocabList].sort(() => 0.5 - Math.random()) : vocabList;
    setShuffledVocabCheckList(list);
    setCurrentVocabCheckIndex(0);
    setVocabCheckResults({ learned: 0, review: 0 });
    if (list.length > 0) {
      setCurrentVocabCheckOptions(generateVocabCheckOptions(list[0], vocabList));
    }
    setIsVocabCheckMode(true);
  };

  const handleVocabCheckAnswer = (selectedMean) => {
    if (vocabCheckAnswerState) return; // Prevent multiple clicks
    
    const currentWord = shuffledVocabCheckList[currentVocabCheckIndex];
    const isCorrect = selectedMean === currentWord.mean;
    
    setVocabCheckAnswerState({ selected: selectedMean, correctOption: currentWord.mean });
    
    setTimeout(() => {
      let newLearned = vocabCheckResults.learned;
      
      if (isCorrect) {
        newLearned += 1;
        setVocabCheckResults(prev => ({...prev, learned: newLearned}));
        addXp(5);
        if (favorites.includes(currentWord.word)) {
          toggleFavorite(currentWord.word); 
        }
      } else {
        setVocabCheckResults(prev => ({...prev, review: prev.review + 1}));
        if (!favorites.includes(currentWord.word)) {
          toggleFavorite(currentWord.word);
        }
      }
      
      const nextIndex = currentVocabCheckIndex + 1;
      if (nextIndex < shuffledVocabCheckList.length) {
        const vocabList = LESSONS_DATA[selectedDayId]?.vocab || LESSONS_DATA[1].vocab;
        setCurrentVocabCheckOptions(generateVocabCheckOptions(shuffledVocabCheckList[nextIndex], vocabList));
      } else {
        // Finished vocab quiz
        if (newLearned >= 15) {
          const currentDayTasks = dayTasks[selectedDayId] || {};
          if (!currentDayTasks.vocab) {
            const newTasks = { ...dayTasks, [selectedDayId]: { ...currentDayTasks, vocab: true } };
            setDayTasks(newTasks);
            
            if (newTasks[selectedDayId].quiz && !completedDays.includes(selectedDayId)) {
              const newCompleted = [...completedDays, selectedDayId];
              setCompletedDays(newCompleted);
              syncProgress(undefined, undefined, newCompleted, undefined, undefined, undefined, undefined, newTasks);
            } else {
              syncProgress(undefined, undefined, undefined, undefined, undefined, undefined, undefined, newTasks);
            }
          }
        }
      }
      setCurrentVocabCheckIndex(nextIndex);
      setVocabCheckAnswerState(null);
    }, 1000);
  };

  const startSmartFlashcards = (shuffle = false) => {
    const list = shuffle ? [...VOCABULARY_BANK].sort(() => 0.5 - Math.random()) : VOCABULARY_BANK;
    setShuffledFlashcards(list);
    setCurrentFlashcardIndex(0);
    setFlashcardWrongAttempts([]);
    setFlashcardCorrectAttempt(null);
    if (list.length > 0) {
      setCurrentFlashcardOptions(generateVocabCheckOptions(list[0], VOCABULARY_BANK));
    }
  };

  const handleSmartFlashcardAnswer = (selectedMean) => {
    if (flashcardCorrectAttempt) return; // Prevent clicks while transitioning

    const currentWord = shuffledFlashcards[currentFlashcardIndex];
    const isCorrect = selectedMean === currentWord.mean;
    
    if (isCorrect) {
      setFlashcardCorrectAttempt(selectedMean);
      if (flashcardWrongAttempts.length === 0) {
        addXp(10);
      } else {
        addXp(5);
      }
      
      setTimeout(() => {
        const nextIndex = (currentFlashcardIndex + 1) % shuffledFlashcards.length;
        setCurrentFlashcardIndex(nextIndex);
        setFlashcardWrongAttempts([]);
        setFlashcardCorrectAttempt(null);
        setCurrentFlashcardOptions(generateVocabCheckOptions(shuffledFlashcards[nextIndex], VOCABULARY_BANK));
      }, 1000);
    } else {
      if (!flashcardWrongAttempts.includes(selectedMean)) {
        setFlashcardWrongAttempts([...flashcardWrongAttempts, selectedMean]);
      }
    }
  };

  const handleResetRoleplay = async (persona = roleplayPersona, difficulty = roleplayDifficulty) => {
    setIsRoleplayLoading(true);
    setRoleplayMessages([]); // Xóa chat cũ ngay lập tức
    try {
      const res = await fetch('/api/roleplay-starter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ persona, difficulty })
      });
      if (res.ok) {
        const data = await res.json();
        setRoleplayMessages([
          { sender: 'guest', text: data.text, voicePlayed: false }
        ]);
      } else {
        setRoleplayMessages([
          { sender: 'guest', text: getRandomRoleplayStart(persona), voicePlayed: false }
        ]);
      }
    } catch (e) {
      setRoleplayMessages([
        { sender: 'guest', text: getRandomRoleplayStart(persona), voicePlayed: false }
      ]);
    } finally {
      setIsRoleplayLoading(false);
    }
  };

  const handleSendMessageToAIGuest = async () => {
    if (!roleplayInput.trim()) return;

    const userMsg = { sender: 'receptionist', text: roleplayInput };
    setRoleplayMessages(prev => [...prev, userMsg]);
    const promptToSend = roleplayInput;
    setRoleplayInput('');
    setIsRoleplayLoading(true);

    try {
      const historyContext = roleplayMessages.map(m => 
        m.sender === 'receptionist' ? `Receptionist (User): ${m.text}` : `Guest (AI): ${m.text}`
      ).join('\n');

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          history: historyContext,
          currentInput: promptToSend,
          persona: roleplayPersona,
          difficulty: roleplayDifficulty
        })
      });

      const result = await response.json();
      
      let responseText = result.text || "Thank you. Your professionalism is truly appreciated. [Lỗi mạng tạm thời, đang chạy giả lập hội thoại 5 sao.]";
      
      if (result.error) {
        console.error("Chat API returned error:", result.error);
        if (result.error.includes("GEMINI_API_KEY")) {
           responseText = "Please configure your GEMINI_API_KEY in .env.local file. [Vui lòng thiết lập GEMINI_API_KEY trong file .env.local để AI có thể hoạt động!]";
        }
      }

      const botMsg = { sender: 'guest', text: responseText, voicePlayed: false };
      setRoleplayMessages(prev => [...prev, botMsg]);
      const newXp = xp + 15;
      setXp(newXp);
      syncProgress(newXp, undefined, undefined, undefined, undefined);

      if (roleplaySpeechEnabled) {
        const textToSpeak = responseText.replace(/\[.*\]/g, "").trim();
        if (textToSpeak) speakText(textToSpeak);
      }
    } catch (error) {
      console.error("Gemini API error:", error);
      setTimeout(() => {
        const fallbacks = [
          "Indeed. I appreciate your prompt attention to this matter. Can you also guarantee that my room is quiet?",
          "That sounds reasonable. I will proceed with your suggestion. Please make sure my luggage is sent up promptly.",
          "Perfect. Could you kindly guide me to where the VIP lounge is located?"
        ];
        const chosen = fallbacks[Math.floor(Math.random() * fallbacks.length)];
        setRoleplayMessages(prev => [...prev, { sender: 'guest', text: chosen + " [Lỗi mạng tạm thời, đang chạy giả lập hội thoại 5 sao.]", voicePlayed: false }]);
      }, 1000);
    } finally {
      setIsRoleplayLoading(false);
    }
  };

  const handleRoleplayVoiceInput = () => {
    startSpeechRecognition((text) => {
      setRoleplayInput(text);
    });
  };

  const handleGenerateScenario = async () => {
    if (!customScenarioPrompt.trim() || isGeneratingScenario) return;
    setIsGeneratingScenario(true);
    try {
      const res = await fetch('/api/scenario', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: customScenarioPrompt })
      });
      if (res.ok) {
        const newScenario = await res.json();
        newScenario.id = Date.now();
        newScenario.isAiGenerated = true;
        setAiScenarios(prev => [newScenario, ...prev]);
        setCustomScenarioPrompt("");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingScenario(false);
    }
  };

  const setupScrambledExercise = (lessonId) => {
    const lData = aiLessons[lessonId] || LESSONS_DATA[lessonId] || LESSONS_DATA[1];
    setListeningScrambledWords([...lData.listening.scrambled].sort(() => Math.random() - 0.5));
    setListeningScrambledResult([]);
  };

  useEffect(() => {
    if (activeTab === 'flashcards' && currentFlashcardOptions.length === 0 && shuffledFlashcards.length > 0) {
      setCurrentFlashcardOptions(generateVocabCheckOptions(shuffledFlashcards[0], VOCABULARY_BANK));
    }
  }, [activeTab]);

  useEffect(() => {
    setupScrambledExercise(selectedDayId);
    setListeningSelectedOption(null);
    setListeningShowResult(false);
    setListeningBlankInput('');
    setListeningBlankCorrect(null);
    setSpeakingScore(null);
    setSpeakingFeedback('');
    setSpeakingBetterVersion('');
    setRecognizedText('');
    setCurrentSpeakingIndex(0);
    
    // Reset Vocab Check
    setIsVocabCheckMode(false);
    setCurrentVocabCheckIndex(0);
    setVocabCheckResults({ learned: 0, review: 0 });
    setShuffledVocabCheckList([]);
    setCurrentVocabCheckOptions([]);
  }, [selectedDayId]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center">
            <img src="/icon.png" alt="CareerLingo" className="w-12 h-12 rounded-xl shadow-md object-cover" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            CareerLingo
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {authMode === 'login' ? 'Đăng nhập vào tài khoản của bạn' : 'Tạo tài khoản mới hoàn toàn miễn phí'}
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow-xl shadow-gray-200/50 sm:rounded-2xl sm:px-10 border border-gray-100">
            <div className="space-y-6">
              {authError && (
                <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100 flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span>{authError}</span>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <div className="mt-1">
                  <input
                    type="email"
                    required
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    className="appearance-none block w-full px-3 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 bg-white text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Mật khẩu</label>
                <div className="mt-1">
                  <input
                    type="password"
                    required
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    className="appearance-none block w-full px-3 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 bg-white text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <button
                  onClick={async () => {
                    setAuthLoading(true);
                    setAuthError('');
                    if (authMode === 'login') {
                      const { error } = await supabase.auth.signInWithPassword({ email: authEmail, password: authPassword });
                      if (error) setAuthError(error.message);
                    } else {
                      const { error } = await supabase.auth.signUp({ email: authEmail, password: authPassword });
                      if (error) setAuthError(error.message);
                      else setAuthError("Đăng ký thành công! Hãy kiểm tra email để xác thực.");
                    }
                    setAuthLoading(false);
                  }}
                  disabled={authLoading}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:bg-blue-300"
                >
                  {authLoading ? 'Đang xử lý...' : (authMode === 'login' ? 'Đăng nhập' : 'Đăng ký')}
                </button>
              </div>
            </div>

            <div className="mt-6">
              <div className="mt-6 text-center">
                <button
                  onClick={() => {
                    setAuthMode(authMode === 'login' ? 'register' : 'login');
                    setAuthError('');
                  }}
                  className="text-sm font-medium text-blue-600 hover:text-blue-500"
                >
                  {authMode === 'login' ? 'Chưa có tài khoản? Đăng ký ngay' : 'Đã có tài khoản? Đăng nhập'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F7] text-[#1D1D1F] font-sans antialiased selection:bg-blue-100 selection:text-blue-900 pb-12">
      
      <header className="sticky top-0 z-50 bg-[#FFFFFF]/80 backdrop-blur-md border-b border-gray-200 px-3 sm:px-4 lg:px-8 py-3 sm:py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink min-w-0">
          <div className="shrink-0">
            <img src="/icon.png" alt="CareerLingo" className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg shadow-sm object-cover" />
          </div>
          <div className="min-w-0">
            <h1 className="text-sm sm:text-lg lg:text-xl font-bold tracking-tight text-[#1D1D1F] truncate">
              <span className="sm:hidden">CareerLingo</span>
              <span className="hidden sm:inline">HOTEL RECEPTION ENGLISH MASTER</span>
            </h1>
            <p className="hidden sm:block text-[10px] uppercase tracking-widest text-[#6E6E73] font-semibold truncate">5-Star Luxury Standard</p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 sm:gap-4 lg:gap-6 shrink-0">
          <div className="flex items-center gap-1 sm:gap-2 bg-[#F5F5F7] px-2 sm:px-3 py-1 sm:py-1.5 rounded-full border border-gray-200">
            <Flame className="w-3 h-3 sm:w-4 sm:h-4 text-orange-500 fill-orange-500" />
            <span className="text-xs sm:text-sm font-semibold text-[#1D1D1F]">{streak} <span className="hidden sm:inline">days</span></span>
          </div>
          <div className="flex items-center gap-1 sm:gap-2 bg-[#F5F5F7] px-2 sm:px-3 py-1 sm:py-1.5 rounded-full border border-gray-200">
            <Star className="w-3 h-3 sm:w-4 sm:h-4 text-amber-400 fill-amber-400" />
            <span className="text-xs sm:text-sm font-semibold text-[#1D1D1F]">{xp} <span className="hidden sm:inline">XP</span></span>
          </div>
          <div className="hidden md:flex items-center gap-2 text-xs text-[#0071E3] font-medium mr-2">
            <Award className="w-4 h-4" />
            <span>Premium Access</span>
          </div>

          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-1 sm:gap-2 bg-gray-100 hover:bg-gray-200 transition-colors px-2 sm:px-3 py-1 sm:py-1.5 rounded-full border border-gray-200"
            >
              <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center overflow-hidden border border-blue-200">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover bg-white" />
                ) : (
                  <User className="w-4 h-4 text-white" />
                )}
              </div>
              <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50">
                <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50">
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Tài khoản</p>
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {user?.email}
                  </p>
                </div>
                <div className="p-2 border-b border-gray-100">
                  <button
                    onClick={() => {
                      setShowAvatarModal(true);
                      setShowUserMenu(false);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-[#1D1D1F] font-medium rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <Smile className="w-4 h-4 text-[#0071E3]" />
                    Đổi Avatar
                  </button>
                </div>
                <div className="p-2">
                  <button
                    onClick={async () => {
                      await supabase.auth.signOut();
                      setShowUserMenu(false);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 font-medium rounded-lg hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Đăng xuất
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 lg:px-8 mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 pb-24 lg:pb-8">
        
        <aside className="hidden lg:block lg:col-span-3 space-y-2 bg-[#FFFFFF]/85 p-5 rounded-[2rem] shadow-[0_8px_30px_rgba(0,0,0,0.04)] backdrop-blur-md self-start border border-gray-100">
          <div className="text-[11px] font-bold text-[#6E6E73] uppercase tracking-widest px-3 mb-4">Learning Path</div>
          
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-300 group ${activeTab === 'dashboard' ? 'bg-[#0071E3]/10 text-[#0071E3] font-semibold' : 'text-[#1D1D1F] hover:bg-gray-100 font-medium'}`}
          >
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span className="text-sm">Dashboard</span>
            </div>
            <ChevronRight className="w-4 h-4 opacity-40" />
          </button>

          <button 
            onClick={() => setActiveTab('syllabus')}
            className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-300 group ${activeTab === 'syllabus' || activeTab === 'lesson' ? 'bg-[#0071E3]/10 text-[#0071E3] font-semibold' : 'text-[#1D1D1F] hover:bg-gray-100 font-medium'}`}
          >
            <div className="flex items-center gap-3">
              <BookOpen className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span className="text-sm">30-Day Masterclass</span>
            </div>
            <ChevronRight className="w-4 h-4 opacity-40" />
          </button>

          <div className="text-[11px] font-bold text-[#6E6E73] uppercase tracking-widest px-3 mt-8 mb-4">Training Tools</div>

          <button 
            onClick={() => setActiveTab('roleplay')}
            className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-300 group ${activeTab === 'roleplay' ? 'bg-[#0071E3]/10 text-[#0071E3] font-semibold' : 'text-[#1D1D1F] hover:bg-gray-100 font-medium'}`}
          >
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 group-hover:scale-110 transition-transform text-indigo-500" />
              <span className="text-sm">AI Role Play</span>
            </div>
            <div className="bg-indigo-500 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider">LIVE</div>
          </button>

          <button 
            onClick={() => setActiveTab('situations')}
            className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-300 group ${activeTab === 'situations' ? 'bg-[#0071E3]/10 text-[#0071E3] font-semibold' : 'text-[#1D1D1F] hover:bg-gray-100 font-medium'}`}
          >
            <div className="flex items-center gap-3">
              <Compass className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span className="text-sm">Scenario Library</span>
            </div>
            <ChevronRight className="w-4 h-4 opacity-40" />
          </button>

          <button 
            onClick={() => setActiveTab('vocabulary')}
            className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-300 group ${activeTab === 'vocabulary' ? 'bg-[#0071E3]/10 text-[#0071E3] font-semibold' : 'text-[#1D1D1F] hover:bg-gray-100 font-medium'}`}
          >
            <div className="flex items-center gap-3">
              <Languages className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span className="text-sm">Vocab Vault</span>
            </div>
            <ChevronRight className="w-4 h-4 opacity-40" />
          </button>

          <button 
            onClick={() => setActiveTab('flashcards')}
            className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-300 group ${activeTab === 'flashcards' ? 'bg-[#0071E3]/10 text-[#0071E3] font-semibold' : 'text-[#1D1D1F] hover:bg-gray-100 font-medium'}`}
          >
            <div className="flex items-center gap-3">
              <RotateCcw className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span className="text-sm">Smart Flashcards</span>
            </div>
            <ChevronRight className="w-4 h-4 opacity-40" />
          </button>

          <button 
            onClick={() => setActiveTab('leaderboard')}
            className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-300 group ${activeTab === 'leaderboard' ? 'bg-[#0071E3]/10 text-[#0071E3] font-semibold' : 'text-[#1D1D1F] hover:bg-gray-100 font-medium'}`}
          >
            <div className="flex items-center gap-3">
              <Trophy className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span className="text-sm">Hall of Fame</span>
            </div>
            <ChevronRight className="w-4 h-4 opacity-40" />
          </button>
        </aside>

        <main className="lg:col-span-9 space-y-8">
          
          {activeTab === 'dashboard' && (
            <div className="space-y-8 animate-fadeIn">
              
              <div className="bg-[#FFFFFF]/90 border border-gray-100 rounded-[1.5rem] sm:rounded-3xl lg:rounded-[2.5rem] p-5 lg:p-10 shadow-[0_20px_40px_rgba(0,0,0,0.04)] relative overflow-hidden backdrop-blur-xl">
                <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 rounded-full bg-blue-500/5 blur-3xl pointer-events-none"></div>
                
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 relative z-10">
                  <div>
                    <h2 className="text-3xl lg:text-4xl font-bold tracking-tight text-[#1D1D1F] mb-2">Welcome back.</h2>
                    <p className="text-lg text-[#6E6E73] font-medium">Ready to perfect your 5-star English today?</p>
                  </div>
                  <button 
                    onClick={() => setActiveTab('syllabus')}
                    className="bg-[#1D1D1F] hover:bg-[#333336] text-white font-semibold text-sm px-6 py-3.5 rounded-2xl transition-all duration-300 flex items-center gap-2 self-start shadow-md"
                  >
                    <span>Resume Course</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-gray-100 relative z-10">
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm font-semibold text-[#6E6E73]">
                      <span>Course Progress</span>
                      <span className="text-[#1D1D1F]">{Math.round((completedDays.length / 30) * 100)}%</span>
                    </div>
                    <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-[#0071E3] rounded-full transition-all duration-1000" 
                        style={{ width: `${(completedDays.length / 30) * 100}%` }}
                      ></div>
                    </div>
                    <div className="text-sm text-[#6E6E73] font-medium"><span className="text-[#1D1D1F] font-bold">{completedDays.length}</span> / 30 days completed</div>
                  </div>

                  <div className="flex items-center gap-4 bg-[#F5F5F7] p-5 rounded-3xl">
                    <div className="bg-orange-100 p-3.5 rounded-2xl text-orange-600">
                      <Flame className="w-6 h-6 fill-orange-500/20" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-[#6E6E73] uppercase tracking-wider mb-1">Learning Streak</div>
                      <div className="text-xl font-bold text-[#1D1D1F]">{streak} Days</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 bg-[#F5F5F7] p-5 rounded-3xl">
                    <div className="bg-blue-100 p-3.5 rounded-2xl text-blue-600">
                      <Trophy className="w-6 h-6 fill-blue-500/20" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-[#6E6E73] uppercase tracking-wider mb-1">Current Level</div>
                      <div className="text-xl font-bold text-[#1D1D1F]">
                        {xp < 200 ? 'Trainee' : xp < 500 ? 'Junior' : xp < 1000 ? 'Senior' : 'Premium Pro'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-[#FFFFFF]/90 border border-gray-100 rounded-[1.5rem] sm:rounded-3xl lg:rounded-[2rem] p-5 lg:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-xl tracking-tight text-[#1D1D1F]">Today's Target</h3>
                  </div>
                  <ul className="space-y-4">
                    <li className="flex items-start gap-4 text-base">
                      <div className="mt-1 bg-green-100 text-green-600 p-1 rounded-full">
                        <Check className="w-4 h-4" />
                      </div>
                      <span className="text-[#6E6E73] font-medium">Complete module: <strong className="text-[#1D1D1F]">Day 1: Chào hỏi khách hàng</strong></span>
                    </li>
                    <li className="flex items-start gap-4 text-base">
                      <div className="mt-1 bg-gray-100 text-gray-400 p-1 rounded-full">
                        <div className="w-4 h-4" />
                      </div>
                      <span className="text-[#6E6E73] font-medium">Interact with AI Roleplay <strong className="text-[#1D1D1F]">3 times</strong></span>
                    </li>
                    <li className="flex items-start gap-4 text-base">
                      <div className="mt-1 bg-gray-100 text-gray-400 p-1 rounded-full">
                        <div className="w-4 h-4" />
                      </div>
                      <span className="text-[#6E6E73] font-medium">Review <strong className="text-[#1D1D1F]">10 Flashcards</strong></span>
                    </li>
                  </ul>
                </div>

                <div className="bg-[#FFFFFF]/90 border border-gray-100 rounded-[2rem] p-8 shadow-[0_8px_30px_rgba(0,0,0,0.04)] flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-xl tracking-tight text-[#1D1D1F] mb-2">Performance Analytics</h3>
                    <p className="text-sm text-[#6E6E73] font-medium mb-6">Based on your learning progress.</p>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="bg-[#F5F5F7] p-4 rounded-2xl">
                      <div className="text-xs font-semibold text-[#6E6E73] uppercase tracking-wider mb-1">Speaking</div>
                      <div className="text-2xl font-bold text-[#1D1D1F]">{Math.min(100, Math.floor(xp / 15) + 50)}%</div>
                    </div>
                    <div className="bg-[#F5F5F7] p-4 rounded-2xl">
                      <div className="text-xs font-semibold text-[#6E6E73] uppercase tracking-wider mb-1">Listening</div>
                      <div className="text-2xl font-bold text-[#1D1D1F]">{Math.min(100, Math.floor(xp / 12) + 55)}%</div>
                    </div>
                    <div className="bg-[#F5F5F7] p-4 rounded-2xl">
                      <div className="text-xs font-semibold text-[#6E6E73] uppercase tracking-wider mb-1">Vocab</div>
                      <div className="text-2xl font-bold text-[#1D1D1F]">{completedDays.length * 20}</div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}

          {activeTab === 'syllabus' && (
            <div className="space-y-8 animate-fadeIn">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
                <div>
                  <h2 className="text-3xl lg:text-4xl font-bold tracking-tight text-[#1D1D1F] flex items-center gap-3">
                    <Calendar className="text-[#0071E3] w-8 h-8" />
                    30-Day Masterclass
                  </h2>
                  <p className="text-lg text-[#6E6E73] font-medium mt-2">Structured specifically for Vietnamese luxury hospitality professionals.</p>
                </div>
              </div>

              {SYLLABUS.map((week) => (
                <div key={week.week} className="bg-[#FFFFFF]/90 border border-gray-100 rounded-[1.5rem] sm:rounded-3xl lg:rounded-[2rem] p-5 lg:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.03)] space-y-4 lg:space-y-6">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                    <h3 className="font-bold text-xl text-[#1D1D1F]">{week.weekTitle}</h3>
                    <span className="text-xs text-[#0071E3] bg-[#0071E3]/10 uppercase tracking-widest font-bold px-3 py-1.5 rounded-full">Week {week.week}</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {week.days.map((day) => {
                      const isCompleted = completedDays.includes(day.id);
                      const isLocked = day.id > 1 && !completedDays.includes(day.id - 1);
                      return (
                        <div 
                          key={day.id} 
                          onClick={() => {
                            if (!isLocked) {
                              setSelectedDayId(day.id);
                              setActiveTab('lesson');
                            }
                          }}
                          className={`flex items-start justify-between p-5 rounded-2xl border transition-all duration-300 group
                            ${isLocked ? 'bg-gray-50 border-gray-100 opacity-60 cursor-not-allowed' : 'cursor-pointer'}
                            ${!isLocked && isCompleted ? 'bg-green-50/50 border-green-200 hover:border-green-300' : ''}
                            ${!isLocked && !isCompleted ? 'bg-[#F5F5F7]/50 border-transparent hover:bg-[#F5F5F7] hover:border-gray-200' : ''}`}
                        >
                          <div className="flex items-start gap-4">
                            <div className={`p-3 rounded-xl transition-colors
                              ${isLocked ? 'bg-gray-200 text-gray-400' : ''}
                              ${!isLocked && isCompleted ? 'bg-green-100 text-green-600' : ''}
                              ${!isLocked && !isCompleted ? 'bg-white text-[#1D1D1F] shadow-sm' : ''}`}>
                              {isLocked ? <Lock className="w-5 h-5" /> : <BookOpen className="w-5 h-5" />}
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className={`text-xs font-bold uppercase tracking-wider 
                                  ${isLocked ? 'text-gray-400' : ''}
                                  ${!isLocked && isCompleted ? 'text-green-600' : ''}
                                  ${!isLocked && !isCompleted ? 'text-[#6E6E73]' : ''}`}>Day {day.id}</span>
                                {isCompleted && (
                                  <span className="flex items-center gap-1 text-[9px] bg-green-500 text-white font-black px-1.5 py-0.5 rounded uppercase">Completed</span>
                                )}
                              </div>
                              <h4 className="font-bold text-base text-[#1D1D1F] mt-0.5">{day.title}</h4>
                              <p className="text-sm text-[#6E6E73] mt-1 line-clamp-1">{day.desc}</p>
                            </div>
                          </div>
                          <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-[#1D1D1F] self-center transition-colors" />
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'lesson' && (
            <div className="space-y-6 lg:space-y-8 animate-fadeIn">
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#FFFFFF]/90 border border-gray-100 p-5 rounded-[2rem] shadow-[0_8px_30px_rgba(0,0,0,0.03)]">
                <button 
                  onClick={() => setActiveTab('syllabus')}
                  className="flex items-center gap-1.5 text-sm text-[#6E6E73] hover:text-[#1D1D1F] transition-colors font-semibold"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Back to Course
                </button>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-[#0071E3] font-bold uppercase tracking-widest bg-[#0071E3]/10 px-3 py-1.5 rounded-full">Day {selectedDayId} / 30</span>
                  <h2 className="text-lg lg:text-xl font-bold text-[#1D1D1F] tracking-tight">
                    {SYLLABUS.flatMap(w => w.days).find(d => d.id === selectedDayId)?.title || "Lesson"}
                  </h2>
                </div>
                {completedDays.includes(selectedDayId) && (
                  <div className="px-5 py-2.5 rounded-xl text-sm font-bold bg-green-100 text-green-700 cursor-default">
                    ✓ Completed
                  </div>
                )}
              </div>

              <div className="flex overflow-x-auto gap-2 no-scrollbar bg-[#FFFFFF]/90 p-2 rounded-2xl shadow-sm border border-gray-100">
                {[
                  { id: 'vocab', label: "Vocabulary", icon: Languages },
                  { id: 'dialogue', label: "Dialogue", icon: MessageCircle },
                  { id: 'listening', label: "Listening", icon: Volume2 },
                  { id: 'speaking', label: "Speaking", icon: Mic },
                  { id: 'quiz', label: "Quiz", icon: Trophy }
                ].map((subTab) => {
                  const Icon = subTab.icon;
                  return (
                    <button
                      key={subTab.id}
                      onClick={() => setLessonActiveSubTab(subTab.id)}
                      className={`flex items-center gap-2 px-6 py-3 text-sm font-semibold rounded-xl whitespace-nowrap transition-all duration-300 ${lessonActiveSubTab === subTab.id ? 'bg-[#1D1D1F] text-white shadow-md' : 'bg-transparent text-[#6E6E73] hover:bg-gray-100 hover:text-[#1D1D1F]'}`}
                    >
                      <Icon className="w-4 h-4" />
                      {subTab.label}
                    </button>
                  );
                })}
              </div>

              {isLessonLoading && lessonActiveSubTab !== 'vocab' && (
                <div className="bg-[#FFFFFF]/90 border border-blue-200 rounded-[2rem] p-8 shadow-[0_8px_30px_rgba(0,0,0,0.03)] text-center animate-pulse">
                  <div className="w-16 h-16 mx-auto mb-4 text-[#0071E3] opacity-50 flex items-center justify-center bg-blue-50 rounded-full">
                    <Sparkles className="w-8 h-8 animate-spin-slow" />
                  </div>
                  <h3 className="font-bold text-xl mb-2 text-[#0071E3]">Đang yêu cầu Quản lý AI...</h3>
                  <p className="text-[#6E6E73] text-sm">Gemini đang biên soạn giáo án 5 sao dành riêng cho ngày này.</p>
                </div>
              )}

              {lessonActiveSubTab === 'vocab' && (() => {
                const vocabList = LESSONS_DATA[selectedDayId]?.vocab || LESSONS_DATA[1].vocab;
                
                if (isVocabCheckMode) {
                  if (currentVocabCheckIndex >= shuffledVocabCheckList.length && shuffledVocabCheckList.length > 0) {
                    return (
                      <div className="space-y-6">
                        <div className="bg-[#FFFFFF]/90 border border-gray-100 rounded-[2rem] p-8 shadow-[0_8px_30px_rgba(0,0,0,0.03)] text-center animate-fadeIn">
                          <h3 className="font-bold text-2xl mb-2 text-[#1D1D1F] tracking-tight">Trắc nghiệm Hoàn tất!</h3>
                          {vocabCheckResults.learned >= 15 ? (
                            <p className="text-green-600 font-bold mb-6">🎉 Tuyệt vời! Bạn đã đủ điểm qua bài học này. Đã mở khóa ngày tiếp theo!</p>
                          ) : (
                            <p className="text-red-500 font-bold mb-6">Chưa đủ 15 câu đúng. Vui lòng học lại để mở khóa bài tiếp theo!</p>
                          )}
                          <div className="flex justify-center gap-12 mb-8">
                            <div className="text-center">
                              <div className="text-5xl font-black text-green-500 mb-2">{vocabCheckResults.learned}</div>
                              <div className="text-sm font-bold text-gray-500 uppercase tracking-widest">Đúng</div>
                            </div>
                            <div className="text-center">
                              <div className="text-5xl font-black text-orange-500 mb-2">{vocabCheckResults.review}</div>
                              <div className="text-sm font-bold text-gray-500 uppercase tracking-widest">Sai (Đã lưu)</div>
                            </div>
                          </div>
                          <div className="flex justify-center gap-4">
                            <button 
                              onClick={() => startVocabCheck(false)}
                              className="bg-[#1D1D1F] text-white px-6 py-4 rounded-xl font-bold hover:bg-[#333336] transition-colors"
                            >
                              Học lại
                            </button>
                            <button 
                              onClick={() => startVocabCheck(true)}
                              className="bg-[#0071E3] text-white px-6 py-4 rounded-xl font-bold hover:bg-[#005bb5] transition-colors flex items-center gap-2"
                            >
                              <Repeat className="w-5 h-5" /> Trộn ngẫu nhiên
                            </button>
                            <button 
                              onClick={() => { setIsVocabCheckMode(false); setCurrentVocabCheckIndex(0); setVocabCheckResults({learned:0, review:0}); }}
                              className="bg-gray-200 text-gray-700 px-6 py-4 rounded-xl font-bold hover:bg-gray-300 transition-colors"
                            >
                              Đóng
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  const v = shuffledVocabCheckList[currentVocabCheckIndex];
                  return (
                    <div className="space-y-6 max-w-lg mx-auto animate-fadeIn">
                      <div className="flex items-center justify-between px-4">
                        <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">
                          Word {currentVocabCheckIndex + 1} of {shuffledVocabCheckList.length}
                        </span>
                        <button onClick={() => setIsVocabCheckMode(false)} className="text-gray-400 hover:text-gray-600">
                          <X className="w-6 h-6" />
                        </button>
                      </div>

                      <div className="bg-white border-2 border-gray-100 rounded-[2rem] py-12 px-6 flex flex-col items-center justify-center text-center shadow-md">
                        <div className="text-5xl font-black text-[#1D1D1F] mb-4">{v?.word}</div>
                        <div className="text-sm font-bold text-gray-400 uppercase tracking-widest">Chọn nghĩa chính xác</div>
                      </div>

                      <div className="grid grid-cols-1 gap-3">
                        {currentVocabCheckOptions.map((opt, idx) => {
                          const isSelected = vocabCheckAnswerState?.selected === opt.mean;
                          const isCorrectOption = vocabCheckAnswerState?.correctOption === opt.mean;
                          
                          let btnClass = "bg-white border-2 border-gray-100 p-4 rounded-2xl text-left font-bold text-lg text-[#1D1D1F] hover:bg-blue-50 hover:border-blue-200 transition-all shadow-sm flex items-center group transform hover:-translate-y-1";
                          let spanClass = "bg-gray-100 text-gray-500 w-8 h-8 rounded-lg flex items-center justify-center mr-4 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors";
                          
                          if (vocabCheckAnswerState) {
                            btnClass = "bg-white border-2 border-gray-100 p-4 rounded-2xl text-left font-bold text-lg text-[#1D1D1F] flex items-center transition-all shadow-sm opacity-50 cursor-default";
                            if (isCorrectOption) {
                              btnClass = "bg-green-50 border-2 border-green-400 p-4 rounded-2xl text-left font-bold text-lg text-green-800 flex items-center transition-all shadow-md transform scale-[1.02] z-10 opacity-100";
                              spanClass = "bg-green-100 text-green-600 w-8 h-8 rounded-lg flex items-center justify-center mr-4";
                            } else if (isSelected && !isCorrectOption) {
                              btnClass = "bg-red-50 border-2 border-red-300 p-4 rounded-2xl text-left font-bold text-lg text-red-700 flex items-center transition-all shadow-sm opacity-100";
                              spanClass = "bg-red-100 text-red-500 w-8 h-8 rounded-lg flex items-center justify-center mr-4";
                            }
                          }
                          
                          return (
                            <button
                              key={idx}
                              onClick={() => handleVocabCheckAnswer(opt.mean)}
                              disabled={!!vocabCheckAnswerState}
                              className={btnClass}
                            >
                              <span className={spanClass}>
                                {String.fromCharCode(65 + idx)}
                              </span>
                              {opt.mean}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                }

                return (
                <div className="space-y-6 animate-fadeIn">
                  <div className="bg-[#FFFFFF]/90 border border-gray-100 rounded-[2rem] p-8 shadow-[0_8px_30px_rgba(0,0,0,0.03)] text-center">
                    <h3 className="font-bold text-2xl mb-2 text-[#1D1D1F] tracking-tight">Key Vocabulary ({vocabList.length} words)</h3>
                    <p className="text-base text-[#6E6E73] mb-6">Master the pronunciation and meaning of these essential words.</p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                      <button 
                        onClick={() => startVocabCheck(false)}
                        className="inline-flex justify-center items-center gap-2 bg-[#0071E3] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#005bb5] transition-all shadow-md hover:shadow-lg hover:-translate-y-1"
                      >
                        <Layers className="w-5 h-5" />
                        Vocab Quiz (Thứ tự)
                      </button>
                      <button 
                        onClick={() => startVocabCheck(true)}
                        className="inline-flex justify-center items-center gap-2 bg-[#FF9500] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#d97c00] transition-all shadow-md hover:shadow-lg hover:-translate-y-1"
                      >
                        <Repeat className="w-5 h-5" />
                        Trộn ngẫu nhiên
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {vocabList.map((v, idx) => (
                      <div key={idx} className="bg-[#FFFFFF]/90 border border-gray-100 p-5 rounded-2xl flex justify-between items-start hover:shadow-lg transition-all duration-300">
                        <div className="space-y-2 flex-1">
                          <div className="flex flex-col gap-1.5">
                            <span className="font-bold text-lg text-[#1D1D1F]">{v.word}</span>
                            <span className="inline-block text-xs text-[#6E6E73] font-mono bg-gray-100 px-2 py-1 rounded-md w-fit">{v.ipa}</span>
                          </div>
                          <div className="text-base font-semibold text-[#0071E3]">{v.mean}</div>
                          <p className="text-sm italic text-[#6E6E73] mt-2">" {v.eg} "</p>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <button 
                            onClick={() => speakText(v.word)}
                            className="bg-[#F5F5F7] hover:bg-gray-200 p-2.5 rounded-xl text-[#1D1D1F] transition-colors"
                          >
                            <Volume2 className="w-5 h-5" />
                          </button>
                          <button 
                            onClick={() => toggleFavorite(v.word)}
                            className="bg-[#F5F5F7] hover:bg-gray-200 p-2.5 rounded-xl text-[#1D1D1F] transition-colors"
                          >
                            {favorites.includes(v.word) ? (
                              <BookmarkCheck className="w-5 h-5 text-[#0071E3]" />
                            ) : (
                              <Bookmark className="w-5 h-5" />
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )})()}

              {lessonActiveSubTab === 'dialogue' && !isLessonLoading && (
                <div className="space-y-6">
                  <div className="bg-[#FFFFFF]/90 border border-gray-100 rounded-[2rem] p-8 shadow-[0_8px_30px_rgba(0,0,0,0.03)] text-center">
                    <h3 className="font-bold text-2xl mb-2 text-[#1D1D1F] tracking-tight">Authentic Dialogue</h3>
                    <p className="text-base text-[#6E6E73]">Listen and practice the standard interactions.</p>
                  </div>

                  <div className="bg-[#FFFFFF]/90 border border-gray-100 rounded-[2rem] p-8 shadow-[0_8px_30px_rgba(0,0,0,0.03)] space-y-6">
                    {(aiLessons[selectedDayId]?.dialogue || LESSONS_DATA[selectedDayId]?.dialogue || LESSONS_DATA[1].dialogue).map((line, idx) => (
                      <div key={idx} className={`flex items-start gap-4 ${line.speaker === 'Receptionist' ? '' : 'flex-row-reverse'}`}>
                        <div className={`p-3 rounded-2xl text-xs font-bold uppercase tracking-widest ${line.speaker === 'Receptionist' ? 'bg-[#0071E3]/10 text-[#0071E3]' : 'bg-gray-100 text-[#6E6E73]'}`}>
                          {line.speaker === 'Receptionist' ? "Receptionist" : "Guest"}
                        </div>
                        <div className={`flex-1 p-5 rounded-2xl border ${line.speaker === 'Receptionist' ? 'bg-white border-gray-200' : 'bg-[#F5F5F7] border-transparent'}`}>
                          <p className="text-base font-medium text-[#1D1D1F] leading-relaxed">{line.text}</p>
                          <div className="mt-3 flex gap-3">
                            <button 
                              onClick={() => speakText(line.text)}
                              className="flex items-center gap-1.5 text-xs font-bold text-[#0071E3] hover:text-[#005bb5] transition-colors bg-[#0071E3]/5 px-3 py-1.5 rounded-lg"
                            >
                              <Play className="w-3.5 h-3.5" /> Play Audio
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {lessonActiveSubTab === 'listening' && !isLessonLoading && (
                <div className="space-y-6">
                  <div className="bg-[#FFFFFF]/90 border border-gray-100 rounded-[2rem] p-8 shadow-[0_8px_30px_rgba(0,0,0,0.03)] text-center">
                    <h3 className="font-bold text-2xl mb-2 text-[#1D1D1F] tracking-tight">Listening Practice</h3>
                    <p className="text-base text-[#6E6E73]">Improve your comprehension with varied exercises.</p>
                  </div>

                  <div className="bg-[#FFFFFF]/90 border border-gray-100 p-8 rounded-[2rem] shadow-[0_8px_30px_rgba(0,0,0,0.03)] space-y-6">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs bg-[#F5F5F7] text-[#6E6E73] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg border border-gray-200">Exercise 1: Multiple Choice</span>
                      <button 
                        onClick={() => speakText((aiLessons[selectedDayId]?.dialogue || LESSONS_DATA[selectedDayId]?.dialogue || LESSONS_DATA[1].dialogue).map(d => d.text).join(" "))}
                        className="flex items-center gap-2 text-sm font-bold text-[#1D1D1F] bg-[#F5F5F7] hover:bg-gray-200 transition-all px-4 py-2 rounded-xl"
                      >
                        <Volume2 className="w-4 h-4" /> Play Full Audio
                      </button>
                    </div>

                    <h4 className="font-bold text-lg text-[#1D1D1F]">{(aiLessons[selectedDayId]?.listening || LESSONS_DATA[selectedDayId]?.listening || LESSONS_DATA[1].listening).question}</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                      {(aiLessons[selectedDayId]?.listening || LESSONS_DATA[selectedDayId]?.listening || LESSONS_DATA[1].listening).options.map((opt, idx) => {
                        const isCorrect = opt === (aiLessons[selectedDayId]?.listening || LESSONS_DATA[selectedDayId]?.listening || LESSONS_DATA[1].listening).answer;
                        return (
                          <button
                            key={idx}
                            onClick={() => {
                              setListeningSelectedOption(opt);
                              setListeningShowResult(true);
                              if (isCorrect) addXp(20);
                            }}
                            className={`p-5 rounded-2xl border text-left text-base font-semibold transition-all ${listeningShowResult ? (isCorrect ? 'bg-green-50 border-green-500 text-green-700' : 'bg-red-50 border-red-300 text-red-600') : (listeningSelectedOption === opt ? 'bg-[#0071E3]/10 border-[#0071E3] text-[#0071E3]' : 'bg-white border-gray-200 hover:border-gray-400')}`}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="bg-[#FFFFFF]/90 border border-gray-100 p-8 rounded-[2rem] shadow-[0_8px_30px_rgba(0,0,0,0.03)] space-y-5">
                    <span className="text-xs bg-[#F5F5F7] text-[#6E6E73] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg border border-gray-200 inline-block">Exercise 2: Fill Blank</span>
                    <h4 className="font-bold text-lg text-[#1D1D1F]">Listen and type the missing word:</h4>
                    
                    <p className="p-5 bg-[#F5F5F7] rounded-2xl text-[#1D1D1F] text-lg italic border border-gray-200">
                      "{(aiLessons[selectedDayId]?.listening || LESSONS_DATA[selectedDayId]?.listening || LESSONS_DATA[1].listening).blankSentence}"
                    </p>

                    <div className="flex gap-4 max-w-lg">
                      <input 
                        type="text"
                        value={listeningBlankInput}
                        onChange={(e) => setListeningBlankInput(e.target.value)}
                        placeholder="Type the word..."
                        className="bg-white border border-gray-300 rounded-xl px-5 py-3 text-base font-medium text-[#1D1D1F] focus:outline-none focus:border-[#0071E3] flex-1 shadow-sm"
                      />
                      <button 
                        onClick={() => {
                          const isCorrect = listeningBlankInput.trim().toLowerCase() === (aiLessons[selectedDayId]?.listening || LESSONS_DATA[selectedDayId]?.listening || LESSONS_DATA[1].listening).blankAnswer.toLowerCase();
                          setListeningBlankCorrect(isCorrect);
                          if (isCorrect) addXp(25);
                        }}
                        className="bg-[#1D1D1F] hover:bg-[#333336] text-white font-bold px-6 py-3 rounded-xl text-sm transition-all shadow-md"
                      >
                        Check
                      </button>
                    </div>

                    {listeningBlankCorrect !== null && (
                      <div className={`flex items-center gap-2 text-base font-bold ${listeningBlankCorrect ? 'text-green-600' : 'text-red-500'}`}>
                        {listeningBlankCorrect ? "✓ Excellent! +25 XP." : `✗ Incorrect. The answer is: "${(aiLessons[selectedDayId]?.listening || LESSONS_DATA[selectedDayId]?.listening || LESSONS_DATA[1].listening).blankAnswer}"`}
                      </div>
                    )}
                  </div>

                  <div className="bg-[#FFFFFF]/90 border border-gray-100 p-8 rounded-[2rem] shadow-[0_8px_30px_rgba(0,0,0,0.03)] space-y-5">
                    <span className="text-xs bg-[#F5F5F7] text-[#6E6E73] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg border border-gray-200 inline-block">Exercise 3: Scramble</span>
                    <h4 className="font-bold text-lg text-[#1D1D1F]">Reorder the words to form the correct sentence:</h4>

                    <div className="min-h-16 p-4 bg-[#F5F5F7] border border-gray-200 rounded-2xl flex flex-wrap gap-2 items-center">
                      {listeningScrambledResult.map((word, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            setListeningScrambledWords([...listeningScrambledWords, word]);
                            setListeningScrambledResult(listeningScrambledResult.filter((_, i) => i !== idx));
                          }}
                          className="bg-white text-[#1D1D1F] font-bold text-sm px-4 py-2 rounded-xl border border-gray-300 hover:border-gray-400 hover:scale-95 transition-all shadow-sm"
                        >
                          {word}
                        </button>
                      ))}
                    </div>

                    <div className="flex flex-wrap gap-2 pt-3">
                      {listeningScrambledWords.map((word, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            setListeningScrambledResult([...listeningScrambledResult, word]);
                            setListeningScrambledWords(listeningScrambledWords.filter((_, i) => i !== idx));
                          }}
                          className="bg-white text-[#6E6E73] font-medium text-sm px-4 py-2 rounded-xl border border-gray-200 hover:border-gray-400 hover:text-[#1D1D1F] transition-all shadow-sm"
                        >
                          {word}
                        </button>
                      ))}
                    </div>

                    <div className="flex gap-4 pt-4">
                      <button 
                        onClick={() => {
                          const sentence = listeningScrambledResult.join(' ');
                          const standard = (aiLessons[selectedDayId]?.listening || LESSONS_DATA[selectedDayId]?.listening || LESSONS_DATA[1].listening).scrambledAnswer;
                          if (sentence === standard) {
                            setScrambledFeedback({ type: 'success', text: 'Chính xác! Excellent job forming the sentence. (+30 XP)' });
                            addXp(30);
                          } else {
                            setScrambledFeedback({ type: 'error', text: 'Sai thứ tự rồi. Hãy nhấn Reset để thử lại!' });
                          }
                        }}
                        className="bg-[#0071E3] hover:bg-[#005bb5] text-white font-bold text-sm px-6 py-3 rounded-xl transition-all shadow-md"
                      >
                        Submit Answer
                      </button>
                      <button 
                        onClick={() => {
                          setupScrambledExercise(selectedDayId);
                          setScrambledFeedback(null);
                        }}
                        className="bg-gray-100 hover:bg-gray-200 text-[#1D1D1F] font-bold text-sm px-6 py-3 rounded-xl transition-all"
                      >
                        Reset
                      </button>
                    </div>
                    {scrambledFeedback && (
                      <div className={`mt-4 p-4 rounded-xl text-sm font-semibold flex items-center gap-2 ${scrambledFeedback.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {scrambledFeedback.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <X className="w-5 h-5" />}
                        {scrambledFeedback.text}
                      </div>
                    )}
                  </div>

                </div>
              )}

              {lessonActiveSubTab === 'speaking' && !isLessonLoading && (() => {
                const currentLesson = aiLessons[selectedDayId] || LESSONS_DATA[selectedDayId] || LESSONS_DATA[1];
                const speakingData = Array.isArray(currentLesson.speaking) ? currentLesson.speaking : [currentLesson.speaking];
                const currentPrompt = speakingData[currentSpeakingIndex] || speakingData[0];
                
                return (
                <div className="space-y-6">
                  <div className="bg-[#FFFFFF]/90 border border-gray-100 rounded-[2rem] p-8 shadow-[0_8px_30px_rgba(0,0,0,0.03)] text-center">
                    <h3 className="font-bold text-2xl mb-2 text-[#1D1D1F] tracking-tight">AI Pronunciation Check</h3>
                    <p className="text-base text-[#6E6E73]">Use the microphone to receive instant feedback on your fluency.</p>
                  </div>

                  <div className="bg-[#FFFFFF]/90 border border-gray-100 p-8 rounded-[2rem] shadow-[0_8px_30px_rgba(0,0,0,0.03)] space-y-8 relative">
                    
                    <div className="flex items-center justify-between absolute top-6 left-6 right-6">
                      <button 
                        disabled={currentSpeakingIndex === 0}
                        onClick={() => {
                          setCurrentSpeakingIndex(Math.max(0, currentSpeakingIndex - 1));
                          setSpeakingScore(null); setSpeakingFeedback(''); setSpeakingBetterVersion(''); setRecognizedText('');
                        }}
                        className={`p-2 rounded-full transition-all ${currentSpeakingIndex === 0 ? 'text-gray-300' : 'text-[#0071E3] hover:bg-blue-50 bg-white shadow-sm border border-gray-200'}`}
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      
                      <span className="text-[10px] bg-[#F5F5F7] text-[#6E6E73] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border border-gray-200 shadow-inner">
                        Câu {currentSpeakingIndex + 1} / {speakingData.length}
                      </span>
                      
                      <button 
                        disabled={currentSpeakingIndex === speakingData.length - 1}
                        onClick={() => {
                          setCurrentSpeakingIndex(Math.min(speakingData.length - 1, currentSpeakingIndex + 1));
                          setSpeakingScore(null); setSpeakingFeedback(''); setSpeakingBetterVersion(''); setRecognizedText('');
                        }}
                        className={`p-2 rounded-full transition-all ${currentSpeakingIndex === speakingData.length - 1 ? 'text-gray-300' : 'text-[#0071E3] hover:bg-blue-50 bg-white shadow-sm border border-gray-200'}`}
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="text-center space-y-4 pt-12">
                      <span className="text-xs text-[#6E6E73] font-bold tracking-widest uppercase block">Read this sentence aloud:</span>
                      <p className="text-2xl lg:text-3xl font-bold text-[#1D1D1F]">
                        "{currentPrompt.prompt}"
                      </p>
                      <p className="text-sm text-[#0071E3] font-medium">
                        Meaning: {currentPrompt.translation}
                      </p>
                    </div>

                    <div className="flex flex-col items-center justify-center p-8 bg-[#F5F5F7] border border-gray-200 rounded-[2rem] space-y-5 max-w-lg mx-auto">
                      <button
                        onClick={handleStartSpeakingPractice}
                        className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 ${isRecording ? 'bg-red-500 animate-pulse text-white shadow-xl shadow-red-500/30 scale-105' : 'bg-[#1D1D1F] hover:bg-[#333336] text-white shadow-lg shadow-black/20 hover:scale-105'}`}
                      >
                        {isRecording ? <Mic className="w-10 h-10 animate-spin" /> : <Mic className="w-10 h-10" />}
                      </button>
                      <div className="text-sm font-bold uppercase tracking-widest text-[#6E6E73]">
                        {isRecording ? "Listening..." : "Tap to speak"}
                      </div>
                    </div>

                    {recognizedText && (
                      <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 space-y-3">
                        <div className="text-xs font-bold text-[#6E6E73] uppercase tracking-widest">You said:</div>
                        <p className="text-lg text-[#1D1D1F] font-medium">"{recognizedText}"</p>
                      </div>
                    )}

                    {speakingScore !== null && (
                      <div className="p-6 bg-white border border-gray-200 rounded-2xl space-y-4 shadow-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold uppercase tracking-widest text-[#6E6E73]">AI Analysis</span>
                          <div className="flex items-center gap-2 bg-[#F5F5F7] px-4 py-2 rounded-xl text-[#1D1D1F] text-base font-bold">
                            <Star className={`w-5 h-5 ${speakingScore === '...' ? 'text-gray-400' : 'fill-amber-400 text-amber-400'}`} />
                            {speakingScore} / 100 Score
                          </div>
                        </div>
                        <p className="text-base text-[#1D1D1F] font-medium leading-relaxed">{speakingFeedback}</p>
                        
                        {speakingBetterVersion && (
                          <div className="mt-4 p-4 bg-[#F5F5F7] border border-gray-200 rounded-xl">
                            <div className="flex items-center gap-2 mb-2 text-sm font-bold text-[#0071E3] uppercase tracking-wide">
                              <Sparkles className="w-4 h-4" />
                              5-Star Upgrade
                            </div>
                            <p className="text-[#1D1D1F] font-medium italic">"{speakingBetterVersion}"</p>
                          </div>
                        )}
                      </div>
                    )}

                  </div>
                </div>
              )})()}

              {lessonActiveSubTab === 'quiz' && !isLessonLoading && (
                <div className="space-y-6">
                  <div className="bg-[#FFFFFF]/90 border border-gray-100 rounded-[2rem] p-8 shadow-[0_8px_30px_rgba(0,0,0,0.03)] text-center">
                    <h3 className="font-bold text-2xl mb-2 text-[#1D1D1F] tracking-tight">Knowledge Quiz</h3>
                    <p className="text-base text-[#6E6E73]">Test your understanding and earn bonus XP.</p>
                  </div>

                  <div className="space-y-6">
                    {(aiLessons[selectedDayId]?.quiz || LESSONS_DATA[selectedDayId]?.quiz || LESSONS_DATA[1].quiz).map((q, qidx) => (
                      <div key={qidx} className="bg-[#FFFFFF]/90 border border-gray-100 p-8 rounded-[2rem] shadow-[0_8px_30px_rgba(0,0,0,0.03)] space-y-5">
                        <h4 className="font-bold text-lg text-[#1D1D1F]">{qidx + 1}. {q.q}</h4>
                        <div className="flex flex-col md:flex-row gap-4 items-stretch">
                          {(() => {
                            const isAnswered = quizAnswers[qidx] !== undefined;
                            const isCorrect = isAnswered && quizAnswers[qidx]?.isCorrect;
                            
                            return (
                              <>
                                <input
                                  type="text"
                                  disabled={isAnswered}
                                  value={quizInputs[qidx] || ''}
                                  onChange={(e) => setQuizInputs(prev => ({...prev, [qidx]: e.target.value}))}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter' && quizInputs[qidx] && !isAnswered) {
                                      const userAnswer = quizInputs[qidx].trim().toLowerCase();
                                      const correctAns = q.a.trim().toLowerCase();
                                      const correct = userAnswer === correctAns;
                                      setQuizAnswers(prev => ({ ...prev, [qidx]: { text: userAnswer, isCorrect: correct } }));
                                      if (correct) addXp(15);
                                    }
                                  }}
                                  placeholder="Nhập câu trả lời của bạn..."
                                  className={`flex-1 p-5 rounded-2xl border text-base font-medium outline-none transition-all ${isAnswered ? (isCorrect ? 'border-green-500 bg-green-50 text-green-700' : 'border-red-500 bg-red-50 text-red-700') : 'border-gray-200 bg-[#F5F5F7]/50 focus:border-[#0071E3] focus:bg-white focus:ring-4 focus:ring-[#0071E3]/10'}`}
                                />
                                <button
                                  disabled={!quizInputs[qidx] || isAnswered}
                                  onClick={() => {
                                    const userAnswer = quizInputs[qidx].trim().toLowerCase();
                                    const correctAns = q.a.trim().toLowerCase();
                                    const correct = userAnswer === correctAns;
                                    setQuizAnswers(prev => ({ ...prev, [qidx]: { text: userAnswer, isCorrect: correct } }));
                                    if (correct) addXp(15);
                                  }}
                                  className={`px-8 py-5 rounded-2xl font-bold transition-all ${isAnswered ? 'bg-gray-100 text-gray-400' : (!quizInputs[qidx] ? 'bg-gray-100 text-gray-400' : 'bg-[#1D1D1F] hover:bg-[#333336] text-white shadow-lg')}`}
                                >
                                  Submit
                                </button>
                              </>
                            );
                          })()}
                        </div>
                        {quizAnswers[qidx] && (
                          <div className={`mt-4 p-4 rounded-xl text-sm font-semibold flex items-center gap-2 ${quizAnswers[qidx].isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {quizAnswers[qidx].isCorrect ? (
                              <>
                                <CheckCircle2 className="w-5 h-5" /> Chính xác! Bạn nhận được +15 XP.
                              </>
                            ) : (
                              <>
                                <X className="w-5 h-5" /> Sai rồi. Đáp án đúng là: {q.a}
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}

          {activeTab === 'situations' && (
            <div className="space-y-8 animate-fadeIn">
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
                <div>
                  <h2 className="text-3xl lg:text-4xl font-bold tracking-tight text-[#1D1D1F] flex items-center gap-3">
                    <Compass className="text-[#0071E3] w-8 h-8" />
                    Scenario Library
                  </h2>
                  <p className="text-lg text-[#6E6E73] font-medium mt-2">100+ real-world hospitality situations and resolutions.</p>
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 p-6 rounded-[2rem] shadow-sm">
                <div className="flex flex-col md:flex-row gap-4 items-center">
                  <div className="flex-1 w-full">
                    <h3 className="font-bold text-[#1D1D1F] flex items-center gap-2 mb-2">
                      <Sparkles className="w-5 h-5 text-blue-500" />
                      AI Scenario Generator
                    </h3>
                    <input 
                      type="text"
                      value={customScenarioPrompt}
                      onChange={(e) => setCustomScenarioPrompt(e.target.value)}
                      placeholder="Bạn đang gặp tình huống khó xử nào? (VD: Khách phàn nàn đồ ăn mặn...)"
                      className="w-full bg-white border border-blue-200 rounded-2xl px-5 py-3.5 text-base text-[#1D1D1F] focus:outline-none focus:border-blue-500 transition-colors"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleGenerateScenario();
                      }}
                    />
                  </div>
                  <button
                    onClick={handleGenerateScenario}
                    disabled={isGeneratingScenario || !customScenarioPrompt.trim()}
                    className={`mt-6 md:mt-8 px-6 py-3.5 rounded-2xl font-bold text-white transition-all whitespace-nowrap ${isGeneratingScenario || !customScenarioPrompt.trim() ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/30'}`}
                  >
                    {isGeneratingScenario ? 'Đang phân tích...' : 'Tạo Kịch Bản'}
                  </button>
                </div>
              </div>

              <div className="bg-[#FFFFFF]/90 border border-gray-100 p-6 rounded-[2rem] shadow-[0_8px_30px_rgba(0,0,0,0.03)] flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96">
                  <input 
                    type="text"
                    value={librarySearch}
                    onChange={(e) => setLibrarySearch(e.target.value)}
                    placeholder="Search scenarios..."
                    className="w-full bg-[#F5F5F7] border border-gray-200 rounded-2xl pl-12 pr-5 py-3.5 text-base text-[#1D1D1F] focus:outline-none focus:border-[#0071E3] focus:bg-white transition-colors"
                  />
                  <Search className="w-5 h-5 text-gray-400 absolute left-4 top-4" />
                </div>

                <div className="flex gap-2 overflow-x-auto w-full md:w-auto no-scrollbar py-1">
                  {['All', 'Check-in', 'Check-out', 'Concierge', 'Complaint Handling', 'VIP Service', 'Emergency'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setLibraryCategory(cat)}
                      className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all whitespace-nowrap ${libraryCategory === cat ? 'bg-[#1D1D1F] text-white border-[#1D1D1F]' : 'bg-white text-[#6E6E73] border-gray-200 hover:text-[#1D1D1F]'}`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[...aiScenarios, ...SITUATIONS]
                  .filter(s => libraryCategory === 'All' || s.category === libraryCategory)
                  .filter(s => s.title.toLowerCase().includes(librarySearch.toLowerCase()) || s.desc.toLowerCase().includes(librarySearch.toLowerCase()))
                  .map((s) => (
                    <div 
                      key={s.id}
                      onClick={() => setSelectedSituation(s)}
                      className="bg-[#FFFFFF]/90 border border-gray-100 p-6 rounded-[2rem] cursor-pointer hover:shadow-[0_20px_40px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group"
                    >
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-bold uppercase text-[#0071E3] tracking-widest bg-[#0071E3]/10 px-3 py-1 rounded-md">{s.category}</span>
                          <span className="text-xs font-semibold text-gray-400">#{s.id}</span>
                        </div>
                        <h4 className="font-bold text-xl text-[#1D1D1F] leading-tight">{s.title}</h4>
                        <p className="text-sm text-[#6E6E73] line-clamp-2 leading-relaxed font-medium">{s.desc}</p>
                      </div>
                      
                      <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between items-center text-sm text-[#0071E3] font-bold">
                        <span>View Dialogue</span>
                        <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  ))}
              </div>

              {selectedSituation && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-fadeIn">
                  <div className="bg-white border border-gray-200 rounded-[2.5rem] max-w-2xl w-full p-8 lg:p-10 space-y-8 max-h-[85vh] overflow-y-auto shadow-[0_20px_60px_rgba(0,0,0,0.15)] relative">
                    
                    <button 
                      onClick={() => setSelectedSituation(null)}
                      className="absolute top-6 right-6 text-gray-400 hover:text-[#1D1D1F] bg-gray-100 hover:bg-gray-200 p-2 rounded-full transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>

                    <div className="space-y-3 pr-8">
                      <span className="text-[11px] font-bold uppercase tracking-widest text-[#0071E3] bg-[#0071E3]/10 px-3 py-1.5 rounded-lg inline-block">{selectedSituation.category}</span>
                      <h3 className="text-2xl lg:text-3xl font-bold text-[#1D1D1F] tracking-tight">{selectedSituation.title}</h3>
                      <p className="text-base text-[#6E6E73] font-medium">{selectedSituation.desc}</p>
                    </div>

                    <div className="p-6 bg-[#F5F5F7] rounded-2xl space-y-2">
                      <h4 className="text-xs font-bold uppercase text-[#1D1D1F] tracking-widest">Core Vocabulary:</h4>
                      <p className="text-sm text-[#6E6E73] font-medium">{selectedSituation.vocab}</p>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-xs font-bold uppercase text-[#1D1D1F] tracking-widest">Sample Interaction:</h4>
                      <div className="space-y-4 bg-white border border-gray-200 p-6 rounded-2xl shadow-sm">
                        {selectedSituation.dialog.split('\n').map((line, lidx) => {
                          const isRep = line.startsWith('R:');
                          return (
                            <div key={lidx} className="space-y-1">
                              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">{isRep ? "Receptionist" : "Guest"}:</span>
                              <p className={`text-base ${isRep ? 'text-[#0071E3] font-semibold' : 'text-[#1D1D1F] font-medium'}`}>{line.replace(/^[R|G]:\s*/, '')}</p>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="flex gap-4 justify-end pt-4 border-t border-gray-100">
                      <button
                        onClick={() => {
                          speakText(selectedSituation.dialog);
                        }}
                        className="bg-[#F5F5F7] hover:bg-gray-200 text-[#1D1D1F] font-bold text-sm px-6 py-3 rounded-xl transition-all flex items-center gap-2"
                      >
                        <Volume2 className="w-4 h-4" /> Listen
                      </button>
                      <button
                        onClick={() => {
                          setSelectedSituation(null);
                        }}
                        className="bg-[#1D1D1F] hover:bg-[#333336] text-white font-bold text-sm px-8 py-3 rounded-xl transition-all shadow-md"
                      >
                        Close
                      </button>
                    </div>

                  </div>
                </div>
              )}

            </div>
          )}

          {activeTab === 'vocabulary' && (
            <div className="space-y-8 animate-fadeIn">
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
                <div>
                  <h2 className="text-3xl lg:text-4xl font-bold tracking-tight text-[#1D1D1F] flex items-center gap-3">
                    <Languages className="text-[#0071E3] w-8 h-8" />
                    Vocab Vault
                  </h2>
                  <p className="text-lg text-[#6E6E73] font-medium mt-2">600 curated terms for luxury hotel professionals.</p>
                </div>
              </div>

              <div className="bg-[#FFFFFF]/90 border border-gray-100 p-6 rounded-[2rem] shadow-[0_8px_30px_rgba(0,0,0,0.03)] flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96">
                  <input 
                    type="text"
                    value={vocabSearch}
                    onChange={(e) => setVocabSearch(e.target.value)}
                    placeholder="Search word or meaning..."
                    className="w-full bg-[#F5F5F7] border border-gray-200 rounded-2xl pl-12 pr-5 py-3.5 text-base text-[#1D1D1F] focus:outline-none focus:border-[#0071E3] focus:bg-white transition-colors"
                  />
                  <Search className="w-5 h-5 text-gray-400 absolute left-4 top-4" />
                </div>

                <div className="flex gap-2 overflow-x-auto w-full md:w-auto no-scrollbar py-1">
                  {['All', 'Favorites'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedVocabCategory(cat)}
                      className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all whitespace-nowrap ${selectedVocabCategory === cat ? 'bg-[#1D1D1F] text-white border-[#1D1D1F]' : 'bg-white text-[#6E6E73] border-gray-200 hover:text-[#1D1D1F]'}`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {VOCABULARY_BANK
                  .filter(v => {
                    if (selectedVocabCategory === 'All') return true;
                    if (selectedVocabCategory === 'Favorites') return favorites.includes(v.word);
                    return true;
                  })
                  .filter(v => v.word.toLowerCase().includes(vocabSearch.toLowerCase()) || v.mean.toLowerCase().includes(vocabSearch.toLowerCase()))
                  .map((v, idx) => (
                    <div key={idx} className="bg-[#FFFFFF]/90 border border-gray-100 p-6 rounded-2xl flex justify-between items-start hover:shadow-lg transition-all duration-300 group">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-xl text-[#1D1D1F]">{v.word}</span>
                          <span className="text-xs text-[#6E6E73] font-mono bg-gray-100 px-2 py-0.5 rounded-md">{v.ipa}</span>
                        </div>
                        <span className="inline-block text-[9px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-md font-bold uppercase tracking-widest mb-1.5">{v.category}</span>
                        <div className="text-base font-semibold text-[#0071E3]">{v.mean}</div>
                        <p className="text-sm italic text-[#6E6E73] mt-2">" {v.eg} "</p>
                      </div>

                      <div className="flex gap-2 ml-4">
                        <button 
                          onClick={() => speakText(v.word)}
                          className="bg-[#F5F5F7] hover:bg-gray-200 p-3 rounded-xl text-[#1D1D1F] transition-colors"
                        >
                          <Volume2 className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => toggleFavorite(v.word)}
                          className="bg-[#F5F5F7] hover:bg-gray-200 p-3 rounded-xl text-[#1D1D1F] transition-colors"
                        >
                          {favorites.includes(v.word) ? (
                            <BookmarkCheck className="w-5 h-5 text-[#0071E3]" />
                          ) : (
                            <Bookmark className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
              </div>

            </div>
          )}

          {activeTab === 'flashcards' && (
            <div className="space-y-8 animate-fadeIn">
              
              <div className="text-center max-w-lg mx-auto space-y-3 px-2">
                <h2 className="text-3xl lg:text-4xl font-bold tracking-tight text-[#1D1D1F]">Smart Flashcards</h2>
                <p className="text-lg text-[#6E6E73] font-medium">Master {VOCABULARY_BANK.length} words with interactive quizzes.</p>
                <div className="pt-4">
                  <button 
                    onClick={() => startSmartFlashcards(true)}
                    className="inline-flex justify-center items-center gap-2 bg-[#FF9500] text-white px-6 py-2.5 rounded-xl font-bold hover:bg-[#d97c00] transition-all shadow-md hover:-translate-y-0.5"
                  >
                    <Repeat className="w-4 h-4" />
                    Trộn Ngẫu Nhiên Toàn Bộ
                  </button>
                </div>
              </div>

              {shuffledFlashcards.length > 0 && currentFlashcardOptions.length > 0 && (
                <div className="flex flex-col items-center justify-center space-y-8 py-4">
                  <div className="w-full max-w-lg bg-white border border-gray-100 rounded-[3rem] p-10 flex flex-col justify-between items-center text-center shadow-[0_20px_40px_rgba(0,0,0,0.06)] relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-gray-100">
                      <div className="h-full bg-[#0071E3] transition-all duration-300" style={{ width: `${((currentFlashcardIndex) / shuffledFlashcards.length) * 100}%` }}></div>
                    </div>
                    
                    <div className="flex justify-between items-center w-full mb-8">
                      <div className="text-sm font-bold text-[#6E6E73]">
                        Word <span className="text-[#1D1D1F]">{currentFlashcardIndex + 1}</span> / {shuffledFlashcards.length}
                      </div>
                      <button 
                        onClick={() => speakText(shuffledFlashcards[currentFlashcardIndex].word)}
                        className="p-3 bg-[#F5F5F7] hover:bg-gray-200 text-[#1D1D1F] rounded-full transition-colors"
                      >
                        <Volume2 className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="space-y-4 mb-10 w-full">
                      <h3 className="text-4xl lg:text-5xl font-bold text-[#1D1D1F] tracking-tight">{shuffledFlashcards[currentFlashcardIndex].word}</h3>
                      <p className="text-base text-[#6E6E73] font-mono bg-gray-50 px-3 py-1 rounded-lg inline-block">{shuffledFlashcards[currentFlashcardIndex].ipa}</p>
                    </div>

                    <div className="w-full space-y-3">
                      {currentFlashcardOptions.map((opt, idx) => {
                        const isWrong = flashcardWrongAttempts.includes(opt.mean);
                        const isCorrectOption = flashcardCorrectAttempt === opt.mean;
                        
                        let btnClass = `w-full text-left p-5 rounded-2xl font-semibold text-lg transition-all flex items-center group
                          ${isWrong 
                            ? 'bg-red-50 text-red-400 border border-red-100 opacity-50 cursor-not-allowed' 
                            : 'bg-white text-[#1D1D1F] border-2 border-gray-100 hover:border-[#0071E3] hover:bg-blue-50 shadow-sm hover:shadow-md'
                          }`;
                        let spanClass = `w-8 h-8 rounded-lg flex items-center justify-center mr-4 transition-colors
                          ${isWrong ? 'bg-red-100 text-red-500' : 'bg-gray-100 text-gray-500 group-hover:bg-blue-100 group-hover:text-blue-600'}`;

                        if (flashcardCorrectAttempt) {
                          btnClass = "w-full text-left p-5 rounded-2xl font-semibold text-lg transition-all flex items-center bg-white border-2 border-gray-100 opacity-50 cursor-default shadow-sm";
                          if (isCorrectOption) {
                            btnClass = "w-full text-left p-5 rounded-2xl font-bold text-lg text-green-800 transition-all flex items-center bg-green-50 border-2 border-green-400 shadow-md transform scale-[1.02] z-10 opacity-100";
                            spanClass = "w-8 h-8 rounded-lg flex items-center justify-center mr-4 bg-green-100 text-green-600";
                          } else if (isWrong) {
                            btnClass = "w-full text-left p-5 rounded-2xl font-semibold text-lg transition-all flex items-center bg-red-50 border-2 border-red-300 text-red-700 opacity-100";
                            spanClass = "w-8 h-8 rounded-lg flex items-center justify-center mr-4 bg-red-100 text-red-500";
                          }
                        }

                        return (
                          <button
                            key={idx}
                            onClick={() => handleSmartFlashcardAnswer(opt.mean)}
                            disabled={isWrong || !!flashcardCorrectAttempt}
                            className={btnClass}
                          >
                            <span className={spanClass}>
                              {String.fromCharCode(65 + idx)}
                            </span>
                            {opt.mean}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'roleplay' && (
            <div className="space-y-8 animate-fadeIn">
              
              <div className="bg-gradient-to-br from-[#0071E3] to-indigo-600 border border-transparent p-5 sm:p-6 lg:p-8 rounded-[1.5rem] sm:rounded-3xl lg:rounded-[2.5rem] relative overflow-hidden shadow-lg">
                <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 rounded-full bg-white/10 blur-3xl pointer-events-none"></div>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
                  <div>
                    <h2 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3 mb-2">
                      <Sparkles className="text-amber-300 w-8 h-8" />
                      Live AI Role Play
                    </h2>
                    <p className="text-base text-blue-100 font-medium">Powered by advanced AI. Talk to a virtual hotel guest in real-time.</p>
                  </div>
                  
                  <div className="flex gap-3">
                    <button 
                      onClick={() => setRoleplaySpeechEnabled(!roleplaySpeechEnabled)}
                      className={`p-3 rounded-xl transition-all ${roleplaySpeechEnabled ? 'bg-white text-[#0071E3] shadow-md' : 'bg-blue-800/50 text-blue-200'}`}
                      title={roleplaySpeechEnabled ? "Auto-speak ON" : "Auto-speak OFF"}
                    >
                      {roleplaySpeechEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                    </button>
                    <button 
                      onClick={() => handleResetRoleplay(roleplayPersona, roleplayDifficulty)}
                      className="bg-blue-800/50 hover:bg-blue-800 text-white p-3 rounded-xl text-sm font-bold transition-all"
                    >
                      Reset Chat
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 pt-6 border-t border-blue-400/30 relative z-10">
                  <div className="space-y-3">
                    <label className="text-[11px] font-bold uppercase tracking-widest text-blue-200">Guest Persona</label>
                    <div className="flex flex-wrap gap-2">
                      {['Khách VIP khó tính', 'Khách du lịch', 'Khách doanh nhân'].map((p) => (
                        <button
                          key={p}
                          onClick={() => {
                            setRoleplayPersona(p);
                            handleResetRoleplay(p, roleplayDifficulty);
                          }}
                          className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${roleplayPersona === p ? 'bg-white text-[#0071E3] shadow-md' : 'bg-blue-800/40 text-blue-100 hover:bg-blue-800/60'}`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[11px] font-bold uppercase tracking-widest text-blue-200">Difficulty</label>
                    <div className="flex gap-2">
                      {['Easy', 'Medium', 'Hard'].map((d) => (
                        <button
                          key={d}
                          onClick={() => {
                            setRoleplayDifficulty(d);
                            handleResetRoleplay(roleplayPersona, d);
                          }}
                          className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${roleplayDifficulty === d ? 'bg-white text-[#0071E3] shadow-md' : 'bg-blue-800/40 text-blue-100 hover:bg-blue-800/60'}`}
                        >
                          {d}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-[#FFFFFF]/90 border border-gray-100 rounded-[1.5rem] sm:rounded-3xl lg:rounded-[2.5rem] p-4 lg:p-8 h-[500px] overflow-y-auto space-y-4 lg:space-y-6 shadow-[0_20px_40px_rgba(0,0,0,0.04)] flex flex-col justify-between">
                
                <div className="space-y-6 overflow-y-auto flex-1 pr-4 no-scrollbar">
                  {roleplayMessages.map((msg, idx) => {
                    const isBot = msg.sender === 'guest';
                    const textPart = msg.text.replace(/\[.*\]/g, "").trim();
                    const feedbackMatch = msg.text.match(/\[(.*?)\]/);
                    const feedbackPart = feedbackMatch ? feedbackMatch[1] : null;

                    return (
                      <div key={idx} className={`flex ${isBot ? 'justify-start' : 'justify-end'}`}>
                        <div className={`max-w-[75%] rounded-[1.5rem] p-5 space-y-2 shadow-sm ${isBot ? 'bg-[#F5F5F7] text-[#1D1D1F] rounded-tl-sm' : 'bg-[#0071E3] text-white rounded-tr-sm'}`}>
                          <span className={`text-[10px] uppercase tracking-widest font-bold block ${isBot ? 'text-[#6E6E73]' : 'text-blue-200'}`}>
                            {isBot ? `Guest (${roleplayPersona})` : "You (Receptionist)"}
                          </span>
                          <p className="text-base font-medium leading-relaxed">{isBot ? textPart : msg.text}</p>
                          
                          {isBot && feedbackPart && (
                            <div className="mt-3 p-3 bg-blue-50/80 border border-blue-200/60 rounded-xl text-sm text-[#0071E3] font-medium leading-relaxed relative group">
                              <div className="flex justify-between items-start mb-1">
                                <span className="font-bold">💡 Lời khuyên 5 sao:</span>
                                <button 
                                  onClick={() => speakText(feedbackPart, 'vi')}
                                  className="text-[#0071E3] hover:text-[#005bb5] bg-blue-100/50 hover:bg-blue-100 p-1.5 rounded-lg transition-colors"
                                  title="Nghe nhận xét"
                                >
                                  <Volume2 className="w-4 h-4" />
                                </button>
                              </div>
                              {feedbackPart}
                            </div>
                          )}

                          {isBot && textPart && (
                            <button 
                              onClick={() => speakText(textPart)}
                              className="text-xs text-[#0071E3] font-bold hover:text-[#005bb5] flex items-center gap-1.5 pt-2"
                            >
                              <Volume2 className="w-4 h-4" /> Listen
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  {isRoleplayLoading && (
                    <div className="flex justify-start">
                      <div className="bg-[#F5F5F7] p-5 rounded-[1.5rem] rounded-tl-sm text-[#6E6E73] text-sm font-semibold animate-pulse">
                        Guest is typing...
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-4 sm:pt-6 border-t border-gray-100 flex items-center gap-2 sm:gap-3 w-full">
                  <input
                    type="text"
                    value={roleplayInput}
                    onChange={(e) => setRoleplayInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSendMessageToAIGuest();
                    }}
                    placeholder="Type your response..."
                    className="bg-[#F5F5F7] border border-gray-200 rounded-2xl px-4 sm:px-6 py-3 sm:py-4 text-sm sm:text-base font-medium text-[#1D1D1F] flex-1 min-w-0 focus:outline-none focus:border-[#0071E3] focus:bg-white transition-colors"
                  />
                  <button 
                    onClick={handleRoleplayVoiceInput}
                    className="p-3 sm:p-4 bg-[#F5F5F7] hover:bg-gray-200 text-[#1D1D1F] rounded-2xl transition-all shadow-sm shrink-0"
                    title="Voice input"
                  >
                    <Mic className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                  <button
                    onClick={handleSendMessageToAIGuest}
                    className="bg-[#1D1D1F] hover:bg-[#333336] text-white font-bold text-sm sm:text-base px-4 sm:px-8 py-3 sm:py-4 rounded-2xl shadow-md transition-all shrink-0"
                  >
                    <span className="hidden sm:inline">Send</span>
                    <span className="sm:hidden">Send</span>
                  </button>
                </div>

              </div>

            </div>
          )}

          {activeTab === 'leaderboard' && (
            <div className="space-y-8 animate-fadeIn">
              
              <div className="bg-[#FFFFFF]/90 border border-gray-100 p-10 rounded-[2.5rem] text-center space-y-4 shadow-[0_20px_40px_rgba(0,0,0,0.04)]">
                <div className="bg-amber-100 w-20 h-20 mx-auto rounded-3xl flex items-center justify-center">
                  <Trophy className="w-10 h-10 text-amber-500" />
                </div>
                <h2 className="text-3xl lg:text-4xl font-bold text-[#1D1D1F] tracking-tight">Hall of Fame</h2>
                <p className="text-lg text-[#6E6E73] font-medium">Top receptionists across luxury hotels in Vietnam.</p>
              </div>

              <div className="bg-[#FFFFFF]/90 border border-gray-100 rounded-[2.5rem] overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.03)]">
                <div className="grid grid-cols-12 gap-4 bg-[#F5F5F7] p-5 border-b border-gray-100 text-[11px] font-bold uppercase text-[#6E6E73] tracking-widest">
                  <div className="col-span-2 text-center">Rank</div>
                  <div className="col-span-6">Professional</div>
                  <div className="col-span-2 text-center">Streak</div>
                  <div className="col-span-2 text-right pr-4">Total XP</div>
                </div>

                <div className="divide-y divide-gray-100 relative min-h-[200px]">
                  {isLeaderboardLoading && (
                    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  )}
                  {leaderboardUsers.length === 0 && !isLeaderboardLoading ? (
                    <div className="p-10 text-center text-gray-500 font-medium">Chưa có dữ liệu xếp hạng.</div>
                  ) : (
                    leaderboardUsers.map((leader, index) => {
                      const rank = index + 1;
                      let medal = "";
                      if (rank === 1) medal = "🥇";
                      else if (rank === 2) medal = "🥈";
                      else if (rank === 3) medal = "🥉";
                      
                      const isMe = user && user.id === leader.id;

                      return (
                        <div 
                          key={leader.id} 
                          className={`grid grid-cols-12 gap-4 p-5 text-base items-center transition-all ${isMe ? 'bg-[#0071E3]/5 text-[#0071E3]' : 'text-[#1D1D1F] hover:bg-gray-50'}`}
                        >
                          <div className="col-span-2 text-center font-bold text-lg">
                            {medal ? medal : `${rank}`}
                          </div>
                          <div className="col-span-6">
                            <div className="font-bold flex items-center gap-2">
                              {leader.avatar_url ? (
                                <img src={leader.avatar_url} alt="Avt" className="w-8 h-8 rounded-full border border-gray-200 bg-white" />
                              ) : (
                                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center border border-gray-300">
                                  <User className="w-4 h-4 text-gray-500" />
                                </div>
                              )}
                              {leader.display_name || "Lễ Tân Ẩn Danh"}
                              {isMe && <span className="bg-[#0071E3] text-white text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider">You</span>}
                            </div>
                            <div className={`text-sm font-medium ${isMe ? 'text-[#0071E3]/70' : 'text-[#6E6E73]'} pl-10`}>VIP Member</div>
                          </div>
                          <div className="col-span-2 text-center font-bold text-orange-500">{leader.streak || 0} days</div>
                          <div className="col-span-2 text-right pr-4 font-black text-[#1D1D1F]">{leader.xp || 0}</div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

            </div>
          )}

        </main>
      </div>

      {audioPlayer.isVisible && (
        <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md shadow-[0_-10px_40px_rgba(0,0,0,0.1)] border-t border-gray-200 z-[100] px-4 py-3 sm:px-6">
          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
            
            <div className="flex items-center gap-3 w-full sm:w-auto shrink-0">
              <button 
                onClick={toggleAudio}
                className="w-12 h-12 flex-shrink-0 flex items-center justify-center bg-[#0071E3] hover:bg-[#005bb5] transition-colors rounded-full text-white shadow-md"
              >
                {audioPlayer.isPlaying ? <Pause className="w-5 h-5 fill-white" /> : <Play className="w-5 h-5 fill-white ml-1" />}
              </button>
              <button 
                onClick={closeAudioPlayer}
                className="w-10 h-10 flex items-center justify-center bg-gray-100 hover:bg-gray-200 transition-colors rounded-full text-gray-700"
              >
                <Square className="w-4 h-4 fill-gray-700" />
              </button>
              <div className="flex-1 sm:hidden truncate text-sm font-medium text-gray-800">
                {audioPlayer.text}
              </div>
            </div>

            <div className="flex-1 flex flex-col gap-1 w-full">
              <div className="hidden sm:block truncate text-sm font-medium text-gray-800 pr-8">
                {audioPlayer.text}
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-500 font-medium w-8 text-right">
                  {formatTime(audioPlayer.progress)}
                </span>
                <input 
                  type="range" 
                  min="0" 
                  max={audioPlayer.duration || 100} 
                  value={audioPlayer.progress || 0}
                  onChange={seekAudio}
                  className="flex-1 h-1.5 bg-gray-200 rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-[#0071E3] [&::-webkit-slider-thumb]:rounded-full cursor-pointer"
                />
                <span className="text-xs text-gray-500 font-medium w-8">
                  {formatTime(audioPlayer.duration)}
                </span>
              </div>
            </div>

            <button 
              onClick={closeAudioPlayer}
              className="absolute top-2 right-2 sm:static p-2 text-gray-400 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

          </div>
        </div>
      )}

      {/* Avatar Selection Modal */}
      {showAvatarModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl p-6 sm:p-8 relative">
            <button 
              onClick={() => setShowAvatarModal(false)}
              className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl mx-auto flex items-center justify-center mb-4">
                <Smile className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-[#1D1D1F]">Chọn Avatar Siêu Cute</h3>
              <p className="text-[#6E6E73] text-sm mt-1">Làm mới hồ sơ Lễ Tân của bạn nào!</p>
            </div>
            
            <div className="grid grid-cols-4 gap-4 max-h-[300px] overflow-y-auto p-2">
              {Array.from({length: 12}).map((_, i) => {
                const seed = i + 1;
                // Dicebear styles: micah, bottts, lorelei, adventuer
                const url = `https://api.dicebear.com/7.x/micah/svg?seed=${seed}&backgroundColor=f5f5f7`;
                return (
                  <button 
                    key={seed}
                    onClick={async () => {
                      setAvatarUrl(url);
                      await syncProgress(undefined, undefined, undefined, undefined, undefined, undefined, url);
                      setShowAvatarModal(false);
                      if (activeTab === 'leaderboard') {
                        // Tricky way to re-fetch leaderboard, just simple re-fetch
                        setActiveTab('dashboard'); 
                        setTimeout(() => setActiveTab('leaderboard'), 100);
                      }
                    }}
                    className={`aspect-square rounded-2xl border-2 overflow-hidden bg-[#F5F5F7] transition-all hover:scale-105 ${avatarUrl === url ? 'border-[#0071E3] shadow-md' : 'border-transparent hover:border-gray-300'}`}
                  >
                    <img src={url} alt={`Avatar ${seed}`} className="w-full h-full object-cover" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Mobile Profile Tab */}
      {activeTab === 'profile' && (
        <div className="space-y-6 animate-fadeIn lg:hidden px-4">
          <div className="bg-white border border-gray-100 p-6 sm:p-8 rounded-[2.5rem] shadow-[0_8px_30px_rgba(0,0,0,0.04)] text-center relative flex flex-col items-center">
            <div className="relative mt-2 mb-4">
              <div className="w-24 h-24 sm:w-28 sm:h-28 bg-white rounded-full p-1 shadow-[0_0_0_4px_rgba(0,113,227,0.1)] relative z-10">
                <div className="w-full h-full bg-blue-50 rounded-full flex items-center justify-center overflow-hidden">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-10 h-10 sm:w-12 sm:h-12 text-blue-600" />
                  )}
                </div>
              </div>
              <button
                onClick={() => setShowAvatarModal(true)}
                className="absolute bottom-0 right-0 sm:bottom-1 sm:right-1 w-8 h-8 bg-[#0071E3] text-white rounded-full flex items-center justify-center shadow-md z-20 hover:scale-105 transition-transform"
              >
                <Smile className="w-4 h-4" />
              </button>
            </div>
            
            <h2 className="text-xl sm:text-2xl font-bold text-[#1D1D1F] tracking-tight truncate w-full px-2">{user?.email || "Chưa đăng nhập"}</h2>
            <p className="text-xs sm:text-sm text-[#0071E3] mt-2 font-semibold bg-blue-50 px-3 py-1 rounded-full inline-block">Học viên Lễ Tân VIP</p>

            <div className="grid grid-cols-2 gap-3 sm:gap-4 mt-8 w-full">
              <div className="bg-white border border-gray-100 rounded-3xl p-4 sm:p-5 flex flex-col items-center justify-center shadow-sm">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-50 rounded-full flex items-center justify-center mb-2 sm:mb-3">
                  <Flame className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500 fill-orange-500" />
                </div>
                <span className="text-2xl sm:text-3xl font-bold text-[#1D1D1F]">{streak}</span>
                <span className="text-[9px] sm:text-[10px] text-gray-500 uppercase tracking-widest font-bold mt-1">Ngày Chuỗi</span>
              </div>
              <div className="bg-white border border-gray-100 rounded-3xl p-4 sm:p-5 flex flex-col items-center justify-center shadow-sm">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-amber-50 rounded-full flex items-center justify-center mb-2 sm:mb-3">
                  <Star className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400 fill-amber-400" />
                </div>
                <span className="text-2xl sm:text-3xl font-bold text-[#1D1D1F]">{xp}</span>
                <span className="text-[9px] sm:text-[10px] text-gray-500 uppercase tracking-widest font-bold mt-1">Điểm XP</span>
              </div>
            </div>
            
            <div className="mt-8 pt-6 border-t border-gray-100 w-full">
              <button
                onClick={async () => {
                  await supabase.auth.signOut();
                  window.location.reload();
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 sm:py-4 text-[#1D1D1F] font-bold bg-gray-100 hover:bg-gray-200 rounded-2xl transition-colors"
              >
                <LogOut className="w-5 h-5" />
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Streak Message Modal */}
      {streakMessage && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white w-full max-w-sm rounded-[2rem] shadow-2xl p-8 text-center relative overflow-hidden">
            {streakMessage.type === 'saved' ? (
              <>
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-orange-400 to-amber-500"></div>
                <div className="w-20 h-20 bg-orange-50 rounded-full mx-auto flex items-center justify-center mb-6">
                  <Flame className="w-10 h-10 text-orange-500 animate-pulse" />
                </div>
                <h3 className="text-2xl font-bold text-[#1D1D1F] mb-3">Streak Saved!</h3>
                <p className="text-[#6E6E73] text-sm mb-6 leading-relaxed">
                  Bạn đã lỡ <strong>{streakMessage.missedDays}</strong> ngày học! Hệ thống đã tự động trừ <strong>{streakMessage.cost} XP</strong> để giữ cho ngọn lửa học tập của bạn tiếp tục cháy.
                </p>
                <button 
                  onClick={() => setStreakMessage(null)}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3.5 rounded-xl transition-colors shadow-lg shadow-orange-500/30"
                >
                  Tuyệt vời!
                </button>
              </>
            ) : (
              <>
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-500 to-rose-600"></div>
                <div className="w-20 h-20 bg-gray-100 rounded-full mx-auto flex items-center justify-center mb-6">
                  <Flame className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold text-[#1D1D1F] mb-3">Streak Lost</h3>
                <p className="text-[#6E6E73] text-sm mb-6 leading-relaxed">
                  Rất tiếc! Bạn đã bỏ lỡ <strong>{streakMessage.missedDays}</strong> ngày và không đủ XP để cứu chuỗi. Streak bị reset về 1.
                </p>
                <button 
                  onClick={() => setStreakMessage(null)}
                  className="w-full bg-gray-900 hover:bg-black text-white font-bold py-3.5 rounded-xl transition-colors"
                >
                  Xây dựng lại từ đầu!
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Mobile Floating Bottom Navigation */}
      <div className="lg:hidden fixed bottom-5 left-4 right-4 z-50">
        {/* More popup menu */}
        {showMobileMore && (
          <div className="absolute bottom-[80px] left-0 right-0 mx-auto w-[calc(100%-0px)]">
            <div className="bg-white/98 backdrop-blur-2xl border border-gray-200/60 shadow-[0_20px_60px_-10px_rgba(0,0,0,0.2)] rounded-[1.5rem] p-3">
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'vocabulary', label: 'Vocabulary', Icon: BookOpen },
                  { id: 'situations', label: 'Situations', Icon: Star },
                  { id: 'leaderboard', label: 'Leaderboard', Icon: Trophy },
                  { id: 'profile', label: 'Profile', Icon: User },
                ].map(({ id, label, Icon }) => (
                  <button
                    key={id}
                    onClick={() => { setActiveTab(id); setShowMobileMore(false); }}
                    className={`flex flex-col items-center justify-center p-3 rounded-2xl transition-all duration-200 ${
                      activeTab === id
                        ? 'bg-[#0071E3]/10 text-[#0071E3]'
                        : 'text-[#86868B] hover:bg-gray-50 hover:text-[#1D1D1F]'
                    }`}
                  >
                    <Icon className="w-6 h-6 mb-1.5" />
                    <span className="text-[10px] font-semibold">{label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
        {/* Backdrop to close More */}
        {showMobileMore && (
          <div className="fixed inset-0 z-[-1]" onClick={() => setShowMobileMore(false)} />
        )}
        <nav className="bg-white/95 backdrop-blur-xl border border-gray-200/50 shadow-[0_15px_40px_-10px_rgba(0,0,0,0.15)] rounded-[2rem] p-1.5">
          <div className="flex justify-between items-center h-16 gap-1 px-1">
            <button
              onClick={() => { setActiveTab('dashboard'); setShowMobileMore(false); }}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-all duration-300 ${activeTab === 'dashboard' ? 'text-[#0071E3]' : 'text-[#86868B] hover:text-[#1D1D1F]'}`}
            >
              <div className={`flex flex-col items-center justify-center ${activeTab === 'dashboard' ? 'scale-110' : ''} transition-transform`}>
                <Calendar className={`w-[22px] h-[22px] mb-1 ${activeTab === 'dashboard' ? 'fill-[#0071E3]/10' : ''}`} />
                <span className="text-[9px] font-bold tracking-wide">Home</span>
              </div>
            </button>
            
            <button
              onClick={() => { setActiveTab('syllabus'); setShowMobileMore(false); }}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-all duration-300 ${activeTab === 'syllabus' || activeTab === 'lesson' ? 'text-[#0071E3]' : 'text-[#86868B] hover:text-[#1D1D1F]'}`}
            >
              <div className={`flex flex-col items-center justify-center ${activeTab === 'syllabus' || activeTab === 'lesson' ? 'scale-110' : ''} transition-transform`}>
                <BookOpen className={`w-[22px] h-[22px] mb-1 ${activeTab === 'syllabus' || activeTab === 'lesson' ? 'fill-[#0071E3]/10' : ''}`} />
                <span className="text-[9px] font-bold tracking-wide">Class</span>
              </div>
            </button>

            <button
              onClick={() => { setActiveTab('roleplay'); setShowMobileMore(false); }}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-all duration-300 ${activeTab === 'roleplay' ? 'text-[#0071E3]' : 'text-[#86868B] hover:text-[#1D1D1F]'}`}
            >
              <div className={`flex flex-col items-center justify-center ${activeTab === 'roleplay' ? 'scale-110' : ''} transition-transform`}>
                <MessageSquare className={`w-[22px] h-[22px] mb-1 ${activeTab === 'roleplay' ? 'fill-[#0071E3]/10' : ''}`} />
                <span className="text-[9px] font-bold tracking-wide">Roleplay</span>
              </div>
            </button>

            <button
              onClick={() => { setActiveTab('flashcards'); setShowMobileMore(false); }}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-all duration-300 ${activeTab === 'flashcards' ? 'text-[#0071E3]' : 'text-[#86868B] hover:text-[#1D1D1F]'}`}
            >
              <div className={`flex flex-col items-center justify-center ${activeTab === 'flashcards' ? 'scale-110' : ''} transition-transform`}>
                <Layers className={`w-[22px] h-[22px] mb-1 ${activeTab === 'flashcards' ? 'fill-[#0071E3]/10' : ''}`} />
                <span className="text-[9px] font-bold tracking-wide">Cards</span>
              </div>
            </button>

            {/* More button */}
            <button
              onClick={() => setShowMobileMore(!showMobileMore)}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-all duration-300 ${
                showMobileMore || ['vocabulary','situations','leaderboard','profile'].includes(activeTab)
                  ? 'text-[#0071E3]'
                  : 'text-[#86868B] hover:text-[#1D1D1F]'
              }`}
            >
              <div className={`flex flex-col items-center justify-center ${
                showMobileMore ? 'scale-110' : ''
              } transition-transform`}>
                <MoreHorizontal className="w-[22px] h-[22px] mb-1" />
                <span className="text-[9px] font-bold tracking-wide">More</span>
              </div>
            </button>
          </div>
        </nav>
      </div>

    </div>
  );
}