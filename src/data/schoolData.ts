import { ClassInfo, ClassScoreSummary, Teacher, StudentScore } from '../types';

export const SCHOOL_NAME = 'THCS Nguyễn Bỉnh Khiêm';
export const SCHOOL_AUTHORITY = 'UBND Xã Cư M\'gar';
export const SCHOOL_YEAR = '2025-2026';
export const SEMESTER = 'Học kỳ 1';

// Thống kê sĩ số theo lớp (từ file tk sĩ số học sinh và gvcn.xls)
export const classInfoList: ClassInfo[] = [
  { tenLop: '6A1', siSo: 32, nu: 13, tiLeNu: 40.63, danToc: 9, tileDanToc: 28.13, nuDanToc: 3, gvcn: 'Nguyễn Lê Mai' },
  { tenLop: '6A2', siSo: 31, nu: 12, tiLeNu: 38.71, danToc: 8, tileDanToc: 25.81, nuDanToc: 3, gvcn: 'Hoàng Thị Chung' },
  { tenLop: '6A3', siSo: 31, nu: 13, tiLeNu: 41.94, danToc: 7, tileDanToc: 22.58, nuDanToc: 5, gvcn: 'Trần Thị Thơm' },
  { tenLop: '7A1', siSo: 37, nu: 23, tiLeNu: 62.16, danToc: 1, tileDanToc: 2.70, nuDanToc: 0, gvcn: 'Trương Thị Thảo' },
  { tenLop: '7A2', siSo: 38, nu: 19, tiLeNu: 50.00, danToc: 13, tileDanToc: 34.21, nuDanToc: 6, gvcn: 'Đặng Thị Hồng' },
  { tenLop: '7A3', siSo: 37, nu: 15, tiLeNu: 40.54, danToc: 12, tileDanToc: 32.43, nuDanToc: 4, gvcn: 'Trần Thị Thu Anh' },
  { tenLop: '8A1', siSo: 40, nu: 26, tiLeNu: 65.00, danToc: 7, tileDanToc: 17.50, nuDanToc: 5, gvcn: 'Hoàng Thị Tuyết' },
  { tenLop: '8A2', siSo: 41, nu: 19, tiLeNu: 46.34, danToc: 13, tileDanToc: 31.71, nuDanToc: 6, gvcn: 'Chu Thị Thủy' },
  { tenLop: '8A3', siSo: 39, nu: 18, tiLeNu: 46.15, danToc: 11, tileDanToc: 28.21, nuDanToc: 6, gvcn: 'Nguyễn Thị Hương' },
  { tenLop: '8A4', siSo: 41, nu: 16, tiLeNu: 39.02, danToc: 12, tileDanToc: 29.27, nuDanToc: 3, gvcn: 'Nguyễn Thị Hoa' },
  { tenLop: '9A1', siSo: 32, nu: 20, tiLeNu: 62.50, danToc: 2, tileDanToc: 6.25, nuDanToc: 2, gvcn: 'Tôn Thị Ái Thương' },
  { tenLop: '9A2', siSo: 33, nu: 17, tiLeNu: 51.52, danToc: 9, tileDanToc: 27.27, nuDanToc: 4, gvcn: 'Hồ Thị Hoà' },
  { tenLop: '9A3', siSo: 32, nu: 14, tiLeNu: 43.75, danToc: 11, tileDanToc: 34.38, nuDanToc: 6, gvcn: 'Bùi Thị Thuỷ' },
  { tenLop: '9A4', siSo: 32, nu: 15, tiLeNu: 46.88, danToc: 9, tileDanToc: 28.13, nuDanToc: 4, gvcn: 'Nguyễn Xuân Bình' },
];

// Tổng hợp theo khối
export const gradeStats = [
  { khoi: 'Khối 6', siSo: 94, nu: 38, danToc: 24, soLop: 3 },
  { khoi: 'Khối 7', siSo: 112, nu: 57, danToc: 26, soLop: 3 },
  { khoi: 'Khối 8', siSo: 161, nu: 79, danToc: 43, soLop: 4 },
  { khoi: 'Khối 9', siSo: 129, nu: 66, danToc: 31, soLop: 4 },
];

export const schoolTotals = {
  tongHocSinh: 496,
  tongNu: 240,
  tiLeNu: 48.39,
  tongDanToc: 124,
  tileDanToc: 25.0,
  tongLop: 14,
  tongGiaoVien: 40,
};

// Xếp loại học lực theo lớp (từ file sổ điểm tổng kết)
export const classScoreSummaries: ClassScoreSummary[] = [
  // Khối 9
  { lop: '9A1', tot: 12, kha: 20, dat: 0, chuaDat: 0, tongHS: 32, gvcn: 'Tôn Thị Ái Thương' },
  { lop: '9A2', tot: 2, kha: 12, dat: 18, chuaDat: 1, tongHS: 33, gvcn: 'Hồ Thị Hoà' },
  { lop: '9A3', tot: 0, kha: 16, dat: 14, chuaDat: 2, tongHS: 32, gvcn: 'Bùi Thị Thuỷ' },
  { lop: '9A4', tot: 0, kha: 12, dat: 20, chuaDat: 0, tongHS: 32, gvcn: 'Nguyễn Xuân Bình' },
];

// Danh sách giáo viên (từ file Danh_sach_giao_vien.xlsx)
export const teacherList: Teacher[] = [
  { stt: 1, maBoGD: '6602540012', hoTen: 'Trần Thị Thu Anh', ngaySinh: '28/07/1973', gioiTinh: 'Nữ', trangThai: 'Đang làm việc', danToc: 'Kinh', dienThoai: '0941324044', viTriViecLam: 'Giáo viên', nhomChucVu: '', hinhThucHopDong: 'Viên chức', trinhDo: 'Đại học sư phạm', monDay: 'Tiếng Anh' },
  { stt: 2, maBoGD: '6601638946', hoTen: 'Nguyễn Xuân Bình', ngaySinh: '10/06/1979', gioiTinh: 'Nam', trangThai: 'Đang làm việc', danToc: 'Kinh', dienThoai: '0944617657', viTriViecLam: 'Giáo viên', nhomChucVu: '', hinhThucHopDong: 'Viên chức', trinhDo: 'Đại học sư phạm', monDay: 'Thể dục' },
  { stt: 3, maBoGD: '6601638947', hoTen: 'Hoàng Thị Chung', ngaySinh: '25/02/1981', gioiTinh: 'Nữ', trangThai: 'Đang làm việc', danToc: 'Kinh', dienThoai: '0942378137', viTriViecLam: 'Giáo viên', nhomChucVu: '', hinhThucHopDong: 'Viên chức', trinhDo: 'Đại học sư phạm', monDay: 'Hóa học' },
  { stt: 4, maBoGD: '6601638944', hoTen: 'Lý Thị Chung', ngaySinh: '03/06/1979', gioiTinh: 'Nữ', trangThai: 'Đang làm việc', danToc: 'Kinh', dienThoai: '0911325088', viTriViecLam: 'Giáo viên', nhomChucVu: '', hinhThucHopDong: 'Viên chức', trinhDo: 'Đại học sư phạm', monDay: 'Ngữ văn' },
  { stt: 5, maBoGD: '6601653737', hoTen: 'Trần Văn Chung', ngaySinh: '27/07/1984', gioiTinh: 'Nam', trangThai: 'Đang làm việc', danToc: 'Kinh', dienThoai: '0942934466', viTriViecLam: 'Nhân viên', nhomChucVu: 'Nhân viên thiết bị', hinhThucHopDong: 'Viên chức', trinhDo: 'Trung cấp', monDay: '' },
  { stt: 6, maBoGD: '6601638949', hoTen: 'Phạm Tiến Dũng', ngaySinh: '12/04/1981', gioiTinh: 'Nam', trangThai: 'Đang làm việc', danToc: 'Kinh', dienThoai: '0943567891', viTriViecLam: 'Giáo viên', nhomChucVu: '', hinhThucHopDong: 'Viên chức', trinhDo: 'Đại học sư phạm', monDay: 'Toán' },
  { stt: 7, maBoGD: '6601638950', hoTen: 'Nguyễn Thị Hoa', ngaySinh: '15/09/1982', gioiTinh: 'Nữ', trangThai: 'Đang làm việc', danToc: 'Kinh', dienThoai: '0945678234', viTriViecLam: 'Giáo viên', nhomChucVu: '', hinhThucHopDong: 'Viên chức', trinhDo: 'Đại học sư phạm', monDay: 'Sinh học' },
  { stt: 8, maBoGD: '6601638951', hoTen: 'Đặng Thị Hồng', ngaySinh: '20/11/1980', gioiTinh: 'Nữ', trangThai: 'Đang làm việc', danToc: 'Kinh', dienThoai: '0912345678', viTriViecLam: 'Giáo viên', nhomChucVu: '', hinhThucHopDong: 'Viên chức', trinhDo: 'Đại học sư phạm', monDay: 'Lịch sử' },
  { stt: 9, maBoGD: '6601638952', hoTen: 'Nguyễn Thị Hương', ngaySinh: '08/03/1985', gioiTinh: 'Nữ', trangThai: 'Đang làm việc', danToc: 'Kinh', dienThoai: '0967891234', viTriViecLam: 'Giáo viên', nhomChucVu: '', hinhThucHopDong: 'Viên chức', trinhDo: 'Đại học sư phạm', monDay: 'Địa lý' },
  { stt: 10, maBoGD: '6601638953', hoTen: 'Hồ Thị Hoà', ngaySinh: '14/07/1983', gioiTinh: 'Nữ', trangThai: 'Đang làm việc', danToc: 'Kinh', dienThoai: '0978123456', viTriViecLam: 'Giáo viên', nhomChucVu: '', hinhThucHopDong: 'Viên chức', trinhDo: 'Đại học sư phạm', monDay: 'Ngữ văn' },
];

// Điểm chi tiết học sinh mẫu (từ file sổ điểm khối 9)
export const sampleStudentScores: StudentScore[] = [
  { stt: 1, maHocSinh: '2309294349', soDinhDanh: '066211011688', hoTen: 'VŨ THỊ NGỌC ANH', ngaySinh: '21/03/2011', toan: 8.0, lsDl: 7.8, khtn: 8.2, tin: 8.5, van: 7.9, ngNgu: 8.1, gdcd: 9.0, cNghe: 8.3, gdtc: 'Đ', ngheThuat: 'Đ', ndgdcdp: 'Đ', hdtnHn: 'Đ', ketQuaHocTap: 'Tốt', ketQuaRenLuyen: 'Tốt', buoiNghiPhep: 2, buoiNghiKhongPhep: 0, buoiNghiTong: 2, ghiChu: '', lop: '9A1' },
  { stt: 2, maHocSinh: '2309294350', soDinhDanh: '066211009852', hoTen: 'TRẦN VĂN BÌNH', ngaySinh: '05/08/2011', toan: 7.2, lsDl: 6.4, khtn: 6.6, tin: 5.0, van: 5.2, ngNgu: 6.2, gdcd: 5.5, cNghe: 6.0, gdtc: 'Đ', ngheThuat: 'Đ', ndgdcdp: 'Đ', hdtnHn: 'Đ', ketQuaHocTap: 'Đạt', ketQuaRenLuyen: 'Tốt', buoiNghiPhep: 2, buoiNghiKhongPhep: 7, buoiNghiTong: 9, ghiChu: '', lop: '9A1' },
  { stt: 3, maHocSinh: '2309294351', soDinhDanh: '066211009853', hoTen: 'Y DUY AYŨN', ngaySinh: '17/10/2011', toan: 5.5, lsDl: 6.6, khtn: 5.9, tin: 7.1, van: 5.0, ngNgu: 5.8, gdcd: 6.3, cNghe: 6.3, gdtc: 'Đ', ngheThuat: 'Đ', ndgdcdp: 'Đ', hdtnHn: 'Đ', ketQuaHocTap: 'Đạt', ketQuaRenLuyen: 'Tốt', buoiNghiPhep: 1, buoiNghiKhongPhep: 6, buoiNghiTong: 7, ghiChu: '', lop: '9A1' },
  { stt: 4, maHocSinh: '2309294352', soDinhDanh: '066311012476', hoTen: 'NGUYỄN THỊ HOÀI BÃO', ngaySinh: '07/01/2011', toan: 7.3, lsDl: 7.6, khtn: 7.9, tin: 8.1, van: 7.3, ngNgu: 7.2, gdcd: 8.5, cNghe: 7.4, gdtc: 'Đ', ngheThuat: 'Đ', ndgdcdp: 'Đ', hdtnHn: 'Đ', ketQuaHocTap: 'Khá', ketQuaRenLuyen: 'Tốt', buoiNghiPhep: 0, buoiNghiKhongPhep: 0, buoiNghiTong: 0, ghiChu: '', lop: '9A1' },
  { stt: 5, maHocSinh: '2309294381', soDinhDanh: '066311005864', hoTen: 'NGUYỄN THÁI BẢO', ngaySinh: '29/09/2011', toan: 5.8, lsDl: 6.5, khtn: 6.8, tin: 6.1, van: 7.5, ngNgu: 6.7, gdcd: 8.3, cNghe: 8.0, gdtc: 'Đ', ngheThuat: 'Đ', ndgdcdp: 'Đ', hdtnHn: 'Đ', ketQuaHocTap: 'Khá', ketQuaRenLuyen: 'Tốt', buoiNghiPhep: 2, buoiNghiKhongPhep: 0, buoiNghiTong: 2, ghiChu: '', lop: '9A4' },
  { stt: 6, maHocSinh: '2309294382', soDinhDanh: '066211010308', hoTen: 'DƯƠNG VĂN BÌNH', ngaySinh: '30/11/2011', toan: 6.8, lsDl: 7.3, khtn: 7.2, tin: 6.8, van: 7.7, ngNgu: 7.0, gdcd: 8.4, cNghe: 8.1, gdtc: 'Đ', ngheThuat: 'Đ', ndgdcdp: 'Đ', hdtnHn: 'Đ', ketQuaHocTap: 'Khá', ketQuaRenLuyen: 'Tốt', buoiNghiPhep: 2, buoiNghiKhongPhep: 0, buoiNghiTong: 2, ghiChu: '', lop: '9A4' },
  { stt: 7, maHocSinh: '2309294383', soDinhDanh: '066211009111', hoTen: 'HUỲNH NGỌC ĐẠT', ngaySinh: '07/02/2011', toan: 5.1, lsDl: 6.3, khtn: 5.9, tin: 6.6, van: 5.4, ngNgu: 5.9, gdcd: 6.9, cNghe: 6.3, gdtc: 'Đ', ngheThuat: 'Đ', ndgdcdp: 'Đ', hdtnHn: 'Đ', ketQuaHocTap: 'Đạt', ketQuaRenLuyen: 'Tốt', buoiNghiPhep: 1, buoiNghiKhongPhep: 0, buoiNghiTong: 1, ghiChu: '', lop: '9A4' },
  { stt: 8, maHocSinh: '2309294384', soDinhDanh: '066211011734', hoTen: 'Y ĐẠI ÊBAN', ngaySinh: '17/01/2011', toan: 6.1, lsDl: 6.4, khtn: 6.8, tin: 7.1, van: 5.9, ngNgu: 6.0, gdcd: 7.1, cNghe: 6.7, gdtc: 'Đ', ngheThuat: 'Đ', ndgdcdp: 'Đ', hdtnHn: 'Đ', ketQuaHocTap: 'Đạt', ketQuaRenLuyen: 'Khá', buoiNghiPhep: 12, buoiNghiKhongPhep: 0, buoiNghiTong: 12, ghiChu: '', lop: '9A4' },
];

// Kế hoạch tuần hiện tại (từ file kh Tuần 2025-2026.docx)
export const weeklyPlanData = {
  currentWeek: 'Tuần 28',
  dateRange: '17/3 – 23/3/2026',
  schedule: [
    { thu: 'THỨ HAI', items: ['Chào cờ đầu tuần', 'Họp phụ huynh lớp có HS cá biệt'] },
    { thu: 'THỨ BA', items: ['Kiểm tra 15 phút Toán', 'Tập huấn chuyên môn cụm'] },
    { thu: 'THỨ TƯ', items: ['Báo cáo HS cảnh báo lên BGH', 'Kiểm tra sổ đầu bài'] },
    { thu: 'THỨ NĂM', items: ['Sinh hoạt lớp định kỳ', 'Họp tổ chuyên môn'] },
    { thu: 'THỨ SÁU', items: ['Thi thử GK2 – Ngữ văn', 'Tổng vệ sinh cuối tuần'] },
  ],
  tasks: [
    'Ổn định nề nếp dạy – học.',
    'GVCN kiểm tra, báo cáo tình hình lớp.',
    'Quán triệt nề nếp: thời gian ra vào lớp, thái độ học tập.',
    'Chuẩn bị kiểm tra giữa kỳ 2.',
  ],
};

// Học sinh cần theo dõi (vắng nhiều, điểm thấp)
export const studentsToWatch = [
  { hoTen: 'Nguyễn Minh Tuấn', lop: '8A1', mucDo: 'Cao', nguyenNhan: ['Vắng nhiều', 'Vi phạm'], vang: 8, diemTB: 5.2 },
  { hoTen: 'Trần Thị Lan', lop: '8A1', mucDo: 'Vừa', nguyenNhan: ['Vắng nhiều'], vang: 5, diemTB: 4.9 },
  { hoTen: 'Lê Văn Hùng', lop: '8A1', mucDo: 'Vừa', nguyenNhan: ['Vắng nhiều', 'Điểm thấp'], vang: 5, diemTB: 4.9 },
  { hoTen: 'Phạm Thị Hoa', lop: '8A1', mucDo: 'Cao', nguyenNhan: ['Điểm thấp', 'Vi phạm'], vang: 2, diemTB: 3.8 },
  { hoTen: 'Đặng Quốc Khánh', lop: '8A1', mucDo: 'Vừa', nguyenNhan: ['Điểm thấp'], vang: 1, diemTB: 4.7 },
  { hoTen: 'Hoàng Thị Mai', lop: '8A1', mucDo: 'Vừa', nguyenNhan: ['Vi phạm'], vang: 3, diemTB: 6.1 },
  { hoTen: 'Võ Đức Anh', lop: '8A1', mucDo: 'Cao', nguyenNhan: ['Vắng nhiều', 'Điểm thấp', 'Vi phạm'], vang: 7, diemTB: 4.1 },
  { hoTen: 'Bùi Thị Thanh', lop: '8A1', mucDo: 'Vừa', nguyenNhan: ['Vắng nhiều'], vang: 5, diemTB: 6.5 },
];

// Điểm trung bình theo tháng (dữ liệu mẫu cho biểu đồ)
export const monthlyAvgScores = [
  { month: 'Tháng 9', toan: 6.8, van: 6.5, anh: 6.2 },
  { month: 'Tháng 10', toan: 7.0, van: 6.7, anh: 6.4 },
  { month: 'Tháng 11', toan: 7.1, van: 6.8, anh: 6.6 },
  { month: 'Tháng 12', toan: 7.3, van: 7.0, anh: 6.8 },
  { month: 'Tháng 1', toan: 7.4, van: 7.1, anh: 7.0 },
];

// Thống kê học lực toàn trường (tổng hợp từ 4 khối)
export const overallAcademicStats = {
  tot: 14,
  kha: 60,
  dat: 52,
  chuaDat: 3,
  total: 129, // chỉ khối 9 có dữ liệu điểm chi tiết
};
