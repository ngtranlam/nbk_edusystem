export interface Teacher {
  stt: number;
  maBoGD: string;
  hoTen: string;
  ngaySinh: string;
  gioiTinh: string;
  trangThai: string;
  danToc: string;
  dienThoai: string;
  viTriViecLam: string;
  nhomChucVu: string;
  hinhThucHopDong: string;
  trinhDo: string;
  monDay: string;
}

export interface Student {
  stt: number;
  maHocSinh: string;
  soDinhDanh: string;
  hoTen: string;
  ngaySinh: string;
  gioiTinh: string;
  lop: string;
  danToc: string;
}

export interface ClassInfo {
  tenLop: string;
  siSo: number;
  nu: number;
  tiLeNu: number;
  danToc: number;
  tileDanToc: number;
  nuDanToc: number;
  gvcn: string;
}

export interface StudentScore {
  stt: number;
  maHocSinh: string;
  soDinhDanh: string;
  hoTen: string;
  ngaySinh: string;
  toan: number;
  lsDl: number;
  khtn: number;
  tin: number;
  van: number;
  ngNgu: number;
  gdcd: number;
  cNghe: number;
  gdtc: string;
  ngheThuat: string;
  ndgdcdp: string;
  hdtnHn: string;
  ketQuaHocTap: string;
  ketQuaRenLuyen: string;
  buoiNghiPhep: number;
  buoiNghiKhongPhep: number;
  buoiNghiTong: number;
  ghiChu: string;
  lop: string;
}

export interface ClassScoreSummary {
  lop: string;
  tot: number;
  kha: number;
  dat: number;
  chuaDat: number;
  tongHS: number;
  gvcn: string;
}

export interface WeeklyPlan {
  tuan: string;
  ngay: string;
  danhGia: string[];
  nhiemVu: string[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  attachmentName?: string;
}

export interface GradeStats {
  khoi: string;
  siSo: number;
  nu: number;
  danToc: number;
  soLop: number;
}
