/**
 * Client-side Excel/CSV parser — ports the Python parse logic to JS using SheetJS.
 * Detects file type (scores, classification rates, teacher list, class stats)
 * and returns structured data matching the existing JSON format.
 */

import * as XLSX from 'xlsx';

// ============================================================
// TYPES
// ============================================================

export interface ScoreRecord {
  hoTen: string;
  lop: string;
  toan?: number | null;
  lsDl?: number | null;
  khtn?: number | null;
  tin?: number | null;
  van?: number | null;
  ngNgu?: number | null;
  gdcd?: number | null;
  cNghe?: number | null;
  ketQuaHocTap?: string;
  ketQuaRenLuyen?: string;
  buoiNghiPhep?: number;
  buoiNghiKhongPhep?: number;
  buoiNghiTong?: number;
}

export interface ClassSummary {
  lop: string;
  siSo: number;
  tot: number;
  kha: number;
  dat: number;
  chuaDat: number;
}

export interface SchoolTotal {
  siSo?: number;
  tot?: number;
  kha?: number;
  dat?: number;
  chuaDat?: number;
}

export interface TeacherRecord {
  stt: number;
  hoTen: string;
  gioiTinh?: string;
  dienThoai?: string;
  trinhDo?: string;
  monDay?: string;
  viTriViecLam?: string;
  nhomChucVu?: string;
}

export interface ClassStatRecord {
  tenLop: string;
  siSo: number;
  nu: number;
  danToc: number;
  gvcn: string;
}

export type FileType = 'scores' | 'classification' | 'teachers' | 'classStats' | 'unknown';

export interface ParseResult {
  fileType: FileType;
  fileName: string;
  scores?: ScoreRecord[];
  schoolTotal?: SchoolTotal;
  classSummaries?: ClassSummary[];
  teachers?: TeacherRecord[];
  classStats?: ClassStatRecord[];
  message: string;
}

// ============================================================
// HELPERS
// ============================================================

function safeNum(v: any): number | null {
  if (typeof v === 'number' && !isNaN(v)) return Math.round(v * 100) / 100;
  if (typeof v === 'string') {
    const n = parseFloat(v.replace(',', '.'));
    if (!isNaN(n)) return Math.round(n * 100) / 100;
  }
  return null;
}

function safeInt(v: any): number {
  const n = safeNum(v);
  return n !== null ? Math.round(n) : 0;
}

function getSheetData(sheet: XLSX.WorkSheet): any[][] {
  return XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' }) as any[][];
}

// ============================================================
// DETECT FILE TYPE
// ============================================================

export function detectFileType(workbook: XLSX.WorkBook, fileName: string): FileType {
  const fn = fileName.toLowerCase();

  // Check filename hints
  if (fn.includes('so_diem') || fn.includes('sổ_điểm') || fn.includes('diem_tong') || fn.includes('khoi_')) {
    return 'scores';
  }
  if (fn.includes('ti_le') || fn.includes('tỉ_lệ') || fn.includes('chat_luong') || fn.includes('chất_lượng') || fn.includes('xl_hk') || fn.includes('xlhk')) {
    return 'classification';
  }
  if (fn.includes('giao_vien') || fn.includes('giáo_viên') || fn.includes('danh_sach_g')) {
    return 'teachers';
  }
  if (fn.includes('si_so') || fn.includes('sĩ_số') || fn.includes('gvcn')) {
    return 'classStats';
  }

  // Inspect content of first sheet
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = getSheetData(sheet);
  const allText = rows.slice(0, 15).flat().map(c => String(c).toLowerCase()).join(' ');

  if (allText.includes('tổng cộng') && (allText.includes('tốt') || allText.includes('khá') || allText.includes('chưa đạt'))) {
    return 'classification';
  }
  if (allText.includes('stt') && allText.includes('họ') && allText.includes('toán')) {
    return 'scores';
  }
  if (allText.includes('môn dạy') || allText.includes('vị trí việc làm') || allText.includes('chức vụ')) {
    return 'teachers';
  }
  if (allText.includes('gvcn') && allText.includes('sĩ số')) {
    return 'classStats';
  }

  // Multi-sheet with class names = likely scores
  if (workbook.SheetNames.length >= 3) {
    const hasClassNames = workbook.SheetNames.some(n => /\d+[aA]\d+/.test(n));
    if (hasClassNames) return 'scores';
  }

  return 'unknown';
}

// ============================================================
// PARSE SCORES
// ============================================================

function parseScoresSheet(sheet: XLSX.WorkSheet, sheetName: string): ScoreRecord[] {
  const rows = getSheetData(sheet);
  const records: ScoreRecord[] = [];

  // Find header row (STT)
  let headerRow = -1;
  for (let r = 0; r < Math.min(10, rows.length); r++) {
    if (String(rows[r][0]).trim() === 'STT') {
      headerRow = r;
      break;
    }
  }
  if (headerRow < 0) return records;

  // Determine class name
  let lop = sheetName.toUpperCase().replace(/\s/g, '');
  for (let r = 0; r < Math.min(3, rows.length); r++) {
    for (let c = 0; c < rows[r].length; c++) {
      const cell = String(rows[r][c]);
      if (cell.includes('Lớp')) {
        const parts = cell.split('Lớp');
        if (parts.length > 1) {
          const lopPart = parts[1].split('-')[0].trim().replace(/\s/g, '');
          if (lopPart) lop = lopPart.toUpperCase();
        }
      }
    }
  }

  const headers = rows[headerRow].map((c: any) => String(c).trim());

  // Map columns
  const colMap: Record<string, number> = {};
  headers.forEach((h: string, c: number) => {
    const hl = h.toLowerCase();
    if (hl.includes('họ') && hl.includes('tên')) colMap['hoTen'] = c;
    else if (h === 'Toán') colMap['toan'] = c;
    else if (h.includes('LS') || h.includes('ĐL')) colMap['lsDl'] = c;
    else if (h.includes('KHTN')) colMap['khtn'] = c;
    else if (h === 'Tin') colMap['tin'] = c;
    else if (h === 'Văn') colMap['van'] = c;
    else if (h.includes('Ng.ngữ') || hl.includes('ngữ')) colMap['ngNgu'] = c;
    else if (h.includes('GDCD')) colMap['gdcd'] = c;
    else if (h.includes('C.nghệ') || hl === 'nghệ') colMap['cNghe'] = c;
    else if (h.includes('Kết quả học tập')) colMap['ketQuaHocTap'] = c;
    else if (h.includes('Kết quả rèn luyện')) colMap['ketQuaRenLuyen'] = c;
    else if (h.includes('Buổi nghỉ')) {
      colMap['buoiNghiPhep'] = c;
      if (c + 1 < headers.length) colMap['buoiNghiKhongPhep'] = c + 1;
      if (c + 2 < headers.length) colMap['buoiNghiTong'] = c + 2;
    }
  });

  // Check sub-header for P, K, Tổng
  if (!colMap['buoiNghiPhep'] && headerRow + 1 < rows.length) {
    const subRow = rows[headerRow + 1];
    subRow.forEach((v: any, c: number) => {
      const val = String(v).trim();
      if (val === 'P') colMap['buoiNghiPhep'] = c;
      else if (val === 'K') colMap['buoiNghiKhongPhep'] = c;
      else if (val === 'Tổng') colMap['buoiNghiTong'] = c;
    });
  }

  const dataStart = headerRow + 2;
  for (let r = dataStart; r < rows.length; r++) {
    const stt = rows[r][0];
    if (typeof stt !== 'number' || stt < 1) continue;

    const name = String(rows[r][colMap['hoTen'] ?? 3] || '').trim();
    if (!name) continue;

    const rec: ScoreRecord = { hoTen: name, lop };

    ['toan', 'lsDl', 'khtn', 'tin', 'van', 'ngNgu', 'gdcd', 'cNghe'].forEach(key => {
      if (key in colMap) (rec as any)[key] = safeNum(rows[r][colMap[key]]);
    });

    ['ketQuaHocTap', 'ketQuaRenLuyen'].forEach(key => {
      if (key in colMap) {
        const val = rows[r][colMap[key]];
        if (typeof val === 'string' && val.trim()) (rec as any)[key] = val.trim();
      }
    });

    ['buoiNghiPhep', 'buoiNghiKhongPhep', 'buoiNghiTong'].forEach(key => {
      if (key in colMap) (rec as any)[key] = safeInt(rows[r][colMap[key]]);
    });

    records.push(rec);
  }

  return records;
}

function parseScores(workbook: XLSX.WorkBook): ScoreRecord[] {
  const all: ScoreRecord[] = [];
  workbook.SheetNames.forEach(name => {
    const sheet = workbook.Sheets[name];
    all.push(...parseScoresSheet(sheet, name));
  });
  return all;
}

// ============================================================
// PARSE CLASSIFICATION RATES
// ============================================================

function parseClassification(workbook: XLSX.WorkBook): { schoolTotal: SchoolTotal; classSummaries: ClassSummary[] } {
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = getSheetData(sheet);
  const result: { schoolTotal: SchoolTotal; classSummaries: ClassSummary[] } = {
    schoolTotal: {},
    classSummaries: [],
  };

  for (let r = 0; r < rows.length; r++) {
    const col0 = String(rows[r][0]).trim();
    const col1 = String(rows[r][1]).trim();

    if (col0 === 'TỔNG CỘNG') {
      result.schoolTotal = {
        siSo: safeInt(rows[r][2]),
        tot: safeInt(rows[r][3]),
        kha: safeInt(rows[r][5]),
        dat: safeInt(rows[r][7]),
        chuaDat: safeInt(rows[r][9]),
      };
      continue;
    }

    if (typeof rows[r][0] === 'number' && rows[r][0] >= 1 && col1) {
      result.classSummaries.push({
        lop: col1,
        siSo: safeInt(rows[r][2]),
        tot: safeInt(rows[r][3]),
        kha: safeInt(rows[r][5]),
        dat: safeInt(rows[r][7]),
        chuaDat: safeInt(rows[r][9]),
      });
    }
  }

  return result;
}

// ============================================================
// PARSE TEACHERS
// ============================================================

function parseTeachers(workbook: XLSX.WorkBook): TeacherRecord[] {
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = getSheetData(sheet);
  const teachers: TeacherRecord[] = [];

  let headerIdx = -1;
  for (let i = 0; i < Math.min(10, rows.length); i++) {
    if (String(rows[i][0]).trim() === 'STT') {
      headerIdx = i;
      break;
    }
  }
  if (headerIdx < 0) return teachers;

  const headers = rows[headerIdx].map((c: any) => String(c).trim());

  for (let r = headerIdx + 1; r < rows.length; r++) {
    const stt = rows[r][0];
    if (typeof stt !== 'number' || stt < 1) continue;

    const t: TeacherRecord = { stt: Math.round(stt), hoTen: '' };

    headers.forEach((h: string, j: number) => {
      if (j >= rows[r].length || !rows[r][j]) return;
      const hl = h.toLowerCase();
      const val = String(rows[r][j]).trim();
      if (!val) return;

      if (hl.includes('họ') && hl.includes('tên')) t.hoTen = val;
      else if (hl.includes('giới tính')) t.gioiTinh = val;
      else if (hl.includes('điện thoại')) t.dienThoai = val;
      else if (hl.includes('trình độ') || hl.includes('t.độ') || hl.includes('chuyên môn')) t.trinhDo = val;
      else if (hl.includes('môn dạy')) t.monDay = val;
      else if (hl.includes('vị trí')) t.viTriViecLam = val;
      else if (hl.includes('chức vụ')) t.nhomChucVu = val;
    });

    if (t.hoTen) teachers.push(t);
  }

  return teachers;
}

// ============================================================
// PARSE CLASS STATS
// ============================================================

function parseClassStats(workbook: XLSX.WorkBook): ClassStatRecord[] {
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = getSheetData(sheet);
  const stats: ClassStatRecord[] = [];

  // Find header row
  let headerIdx = -1;
  for (let i = 0; i < Math.min(10, rows.length); i++) {
    const rowText = rows[i].map((c: any) => String(c).toLowerCase()).join(' ');
    if (rowText.includes('sĩ số') || rowText.includes('si so') || (rowText.includes('lớp') && rowText.includes('gvcn'))) {
      headerIdx = i;
      break;
    }
  }
  if (headerIdx < 0) return stats;

  for (let r = headerIdx + 1; r < rows.length; r++) {
    const col0 = String(rows[r][0]).trim();
    // Class name pattern: 6A1, 7A2, etc.
    if (/^\d+[A-Za-z]\d*$/.test(col0.replace(/\s/g, ''))) {
      stats.push({
        tenLop: col0.replace(/\s/g, ''),
        siSo: safeInt(rows[r][1]),
        nu: safeInt(rows[r][2]),
        danToc: safeInt(rows[r][3]),
        gvcn: String(rows[r][4] || '').trim(),
      });
    }
  }

  return stats;
}

// ============================================================
// MAIN PARSE FUNCTION
// ============================================================

export function parseFile(file: File): Promise<ParseResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target!.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const fileType = detectFileType(workbook, file.name);

        let result: ParseResult = {
          fileType,
          fileName: file.name,
          message: '',
        };

        switch (fileType) {
          case 'scores': {
            const scores = parseScores(workbook);
            result.scores = scores;
            result.message = `Đã phân tích ${scores.length} bản ghi điểm từ ${workbook.SheetNames.length} sheet`;
            break;
          }
          case 'classification': {
            const { schoolTotal, classSummaries } = parseClassification(workbook);
            result.schoolTotal = schoolTotal;
            result.classSummaries = classSummaries;
            result.message = `Đã phân tích tỉ lệ xếp loại: ${classSummaries.length} lớp, tổng ${schoolTotal.siSo || 0} HS`;
            break;
          }
          case 'teachers': {
            const teachers = parseTeachers(workbook);
            result.teachers = teachers;
            result.message = `Đã phân tích ${teachers.length} giáo viên/nhân viên`;
            break;
          }
          case 'classStats': {
            const classStats = parseClassStats(workbook);
            result.classStats = classStats;
            result.message = `Đã phân tích sĩ số ${classStats.length} lớp`;
            break;
          }
          default:
            result.message = 'Không nhận diện được loại file. Vui lòng kiểm tra lại định dạng.';
        }

        resolve(result);
      } catch (err: any) {
        reject(new Error(`Lỗi đọc file: ${err.message}`));
      }
    };
    reader.onerror = () => reject(new Error('Không thể đọc file'));
    reader.readAsArrayBuffer(file);
  });
}
