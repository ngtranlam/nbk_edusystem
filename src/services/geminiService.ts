import { GoogleGenAI } from '@google/genai';
import extractedData from '../data/extracted_data.json';

// Read API key from environment variable (set in Render dashboard)
// Fallback to hardcoded key for local development
const API_KEY = process.env.REACT_APP_GEMINI_API_KEY || 'AIzaSyDeinwqke3doGCKwX6-OfpEXqHvARQYFDs';
const MODEL = 'gemini-3-flash-preview';

const ai = new GoogleGenAI({ apiKey: API_KEY });

// ============================================================
// DYNAMIC DATA SOURCE — can be updated by uploads
// ============================================================

let dynamicData: any = null;

export function updateAIData(schoolData: any): void {
  dynamicData = schoolData;
}

function getData(): any {
  if (dynamicData) {
    // Merge: use default periods + uploaded periods, uploaded teachers if available
    const base = extractedData as any;
    const allScores = dynamicData.periods?.flatMap((p: any) => p.scores || []) || base.scores || [];
    const allSummaries = dynamicData.periods?.[0]?.classScoreSummaries || base.classScoreSummaries || [];
    const schoolTotal = dynamicData.periods?.[0]?.schoolTotal || base.schoolTotal || {};
    return {
      ...base,
      scores: allScores.length > 0 ? allScores : (base.scores || []),
      classScoreSummaries: allSummaries,
      schoolTotal,
      teachers: dynamicData.teachers?.length > 0 ? dynamicData.teachers : base.teachers,
      classStats: dynamicData.classStats?.length > 0 ? dynamicData.classStats : base.classStats,
      periods: dynamicData.periods?.length > 0 ? dynamicData.periods : (base.periods || []),
    };
  }
  return extractedData;
}

// ============================================================
// SMART CONTEXT RETRIEVAL — only send relevant data per query
// ============================================================

function buildOverview(): string {
  const d = getData();
  const total = d.schoolTotal;
  const classes = d.classStats;
  const summaries = d.classScoreSummaries;

  let ctx = `=== TỔNG QUAN TRƯỜNG THCS NGUYỄN BỈNH KHIÊM ===\n`;
  ctx += `Năm học: 2025-2026, Học kỳ 1, Xã Cư M'gar\n`;
  ctx += `Tổng: ${total?.siSo || 0} HS, ${classes.length} lớp, ${d.teachers.length} GV/NV\n`;
  ctx += `Nữ: ${(total as any)?.nu || 0}, Dân tộc: ${(total as any)?.danToc || 0}\n\n`;

  ctx += `Sĩ số từng lớp:\n`;
  classes.forEach((c: any) => {
    ctx += `  ${c.tenLop}: ${c.siSo} HS (Nữ: ${c.nu}, DT: ${c.danToc}) GVCN: ${c.gvcn}\n`;
  });
  ctx += `\nXếp loại học lực HK1 toàn trường:\n`;
  summaries.forEach((s: any) => {
    ctx += `  ${s.lop}: Tốt=${s.tot}, Khá=${s.kha}, Đạt=${s.dat}, Chưa đạt=${s.chuaDat}\n`;
  });
  return ctx;
}

function buildTeacherContext(): string {
  const d = getData();
  let ctx = `=== DANH SÁCH GIÁO VIÊN/NHÂN VIÊN ===\n`;
  d.teachers.forEach((t: any) => {
    const parts = [`${t.stt}. ${t.hoTen}`];
    if (t.monDay) parts.push(`Môn: ${t.monDay}`);
    if (t.viTriViecLam) parts.push(`VT: ${t.viTriViecLam}`);
    if (t.nhomChucVu) parts.push(`CV: ${t.nhomChucVu}`);
    if (t.gioiTinh) parts.push(`GT: ${t.gioiTinh}`);
    if (t.dienThoai) parts.push(`SĐT: ${t.dienThoai}`);
    if (t.trinhDo) parts.push(`TĐ: ${t.trinhDo}`);
    ctx += parts.join(' | ') + '\n';
  });
  return ctx;
}

function buildClassScoreContext(classFilter?: string): string {
  const d = getData();
  let ctx = `=== ĐIỂM CHI TIẾT HỌC SINH ===\n`;
  let filtered = d.scores || [];
  if (classFilter) {
    filtered = filtered.filter((s: any) => s.lop?.toUpperCase().includes(classFilter.toUpperCase()));
  }
  filtered.forEach((sc: any) => {
    const parts = [`${sc.hoTen || '?'} (${sc.lop || '?'})`];
    const subjects: [string, string][] = [
      ['Toán', 'toan'], ['Văn', 'van'], ['Anh', 'ngNgu'], ['KHTN', 'khtn'],
      ['LS&ĐL', 'lsDl'], ['Tin', 'tin'], ['GDCD', 'gdcd'], ['CN', 'cNghe']
    ];
    subjects.forEach(([name, key]) => {
      const v = (sc as any)[key];
      if (v !== undefined && v !== '' && v !== 'nan' && typeof v === 'number') parts.push(`${name}:${v}`);
    });
    if (sc.ketQuaHocTap) parts.push(`XL:${sc.ketQuaHocTap}`);
    if (sc.ketQuaRenLuyen) parts.push(`RL:${sc.ketQuaRenLuyen}`);
    if ((sc.buoiNghiTong || 0) > 0) {
      parts.push(`Nghỉ:${sc.buoiNghiPhep || 0}P+${sc.buoiNghiKhongPhep || 0}K=${sc.buoiNghiTong || 0}`);
    }
    ctx += parts.join(' | ') + '\n';
  });
  return ctx;
}

function buildAbsenceContext(): string {
  const d = getData();
  let ctx = `=== HỌC SINH VẮNG NHIỀU (≥3 buổi) ===\n`;
  const absent = (d.scores || [])
    .filter((s: any) => (s.buoiNghiTong || 0) >= 3)
    .sort((a: any, b: any) => (b.buoiNghiTong || 0) - (a.buoiNghiTong || 0));
  absent.forEach((s: any) => {
    ctx += `${s.hoTen} (${s.lop}): Phép=${s.buoiNghiPhep || 0}, KPhép=${s.buoiNghiKhongPhep || 0}, Tổng=${s.buoiNghiTong || 0}\n`;
  });
  return ctx;
}

function buildLowScoreContext(): string {
  const d = getData();
  let ctx = `=== HỌC SINH ĐIỂM THẤP / CHƯA ĐẠT ===\n`;
  const low = (d.scores || []).filter((s: any) => {
    const nums = [s.toan, s.lsDl, s.khtn, s.tin, s.van, s.ngNgu, s.gdcd, s.cNghe]
      .filter((v: any) => typeof v === 'number' && !isNaN(v));
    const avg = nums.length > 0 ? (nums as number[]).reduce((a, b) => a + b, 0) / nums.length : 99;
    return avg < 5.5 || s.ketQuaHocTap === 'Chưa Đạt' || s.ketQuaHocTap === 'Chưa đạt';
  });
  low.forEach((s: any) => {
    const nums = [s.toan, s.lsDl, s.khtn, s.tin, s.van, s.ngNgu, s.gdcd, s.cNghe]
      .filter((v: any) => typeof v === 'number' && !isNaN(v));
    const avg = nums.length > 0 ? ((nums as number[]).reduce((a, b) => a + b, 0) / nums.length).toFixed(1) : '?';
    ctx += `${s.hoTen} (${s.lop}): ĐTB=${avg}, XL:${s.ketQuaHocTap || '?'} | Toán:${s.toan ?? '?'} Văn:${s.van ?? '?'} Anh:${s.ngNgu ?? '?'}\n`;
  });
  return ctx;
}

function buildTopStudentContext(): string {
  const d = getData();
  let ctx = `=== HỌC SINH XUẤT SẮC (XL Tốt) ===\n`;
  const top = (d.scores || []).filter((s: any) => s.ketQuaHocTap === 'Tốt');
  top.forEach((s: any) => {
    const nums = [s.toan, s.lsDl, s.khtn, s.tin, s.van, s.ngNgu, s.gdcd, s.cNghe]
      .filter((v: any) => typeof v === 'number' && !isNaN(v));
    const avg = nums.length > 0 ? ((nums as number[]).reduce((a, b) => a + b, 0) / nums.length).toFixed(1) : '?';
    ctx += `${s.hoTen} (${s.lop}): ĐTB=${avg}\n`;
  });
  return ctx;
}

function buildWeeklyPlanContext(): string {
  const d = getData();
  let ctx = `=== KẾ HOẠCH TUẦN ===\n`;
  (d.weeklyPlans || []).slice(-3).forEach((wp: any) => {
    ctx += `\n--- Tuần ${wp.tuan} (${wp.ngay}) ---\n`;
    wp.noiDung.forEach((line: string) => {
      if (line.trim().length > 5) ctx += `${line}\n`;
    });
  });
  return ctx;
}

// Detect which data topics are relevant to the user's query
function getRelevantContext(query: string): string {
  const q = query.toLowerCase();
  const parts: string[] = [];

  // Always include overview
  parts.push(buildOverview());

  // Detect class-specific queries (e.g. "lớp 8A1", "6A2")
  const classMatch = q.match(/(\d+)\s*a\s*(\d+)/i) || q.match(/lớp\s*(\d+[a-z]\d*)/i);
  const classFilter = classMatch ? classMatch[0].replace(/lớp\s*/i, '').replace(/\s+/g, '').toUpperCase() : undefined;

  // Teacher-related
  if (q.includes('giáo viên') || q.includes('gvcn') || q.includes('gv ') || q.includes('thầy') || q.includes('cô') || q.includes('dạy') || q.includes('chủ nhiệm') || q.includes('nhân viên')) {
    parts.push(buildTeacherContext());
  }

  // Absence
  if (q.includes('vắng') || q.includes('nghỉ') || q.includes('chuyên cần') || q.includes('absent') || q.includes('đi học')) {
    parts.push(buildAbsenceContext());
  }

  // Low scores / at-risk
  if (q.includes('điểm thấp') || q.includes('yếu') || q.includes('chưa đạt') || q.includes('cần theo dõi') || q.includes('cá biệt') || q.includes('kém')) {
    parts.push(buildLowScoreContext());
  }

  // Top students
  if (q.includes('xuất sắc') || q.includes('giỏi') || q.includes('tốt nhất') || q.includes('cao nhất') || q.includes('top') || q.includes('thành tích')) {
    parts.push(buildTopStudentContext());
  }

  // Weekly plan
  if (q.includes('kế hoạch') || q.includes('tuần') || q.includes('lịch') || q.includes('hoạt động')) {
    parts.push(buildWeeklyPlanContext());
  }

  // Score/grade queries — include relevant class scores
  if (q.includes('điểm') || q.includes('học lực') || q.includes('xếp loại') || q.includes('trung bình') || classFilter) {
    parts.push(buildClassScoreContext(classFilter));
  }

  // Broad questions — include everything essential
  if (q.includes('tổng quan') || q.includes('tóm tắt') || q.includes('báo cáo') || q.includes('thống kê') || q.includes('tổng hợp')) {
    parts.push(buildTeacherContext());
    parts.push(buildAbsenceContext());
    parts.push(buildLowScoreContext());
  }

  // If no specific topic detected, include class scores for general lookup
  if (parts.length === 1) {
    parts.push(buildClassScoreContext(classFilter));
    parts.push(buildTeacherContext());
  }

  // Deduplicate
  return Array.from(new Set(parts)).join('\n\n');
}

const BASE_SYSTEM_PROMPT = `Bạn là trợ lý AI giáo dục của trường THCS Nguyễn Bỉnh Khiêm (Xã Cư M'gar), năm học 2025-2026, học kỳ 1.

NHIỆM VỤ:
- Trả lời chính xác các câu hỏi về học sinh, giáo viên, điểm số, sĩ số, xếp loại, chuyên cần, kế hoạch tuần.
- Sử dụng DỮ LIỆU THỰC TẾ bên dưới để trả lời. KHÔNG bịa đặt thông tin.
- Trả lời bằng tiếng Việt, ngắn gọn, rõ ràng, có cấu trúc.
- Sử dụng markdown: **bold** cho tên/số quan trọng, bullet points, bảng khi cần.
- Nếu không tìm thấy thông tin, hãy nói rõ.
- Khi được hỏi về điểm, ghi rõ từng môn cụ thể.
- Khi được hỏi về HS cần theo dõi, ưu tiên HS vắng không phép nhiều hoặc điểm thấp.
- Luôn trích dẫn dữ liệu cụ thể (tên, lớp, số liệu).`;

interface ChatHistoryEntry {
  role: 'user' | 'model';
  parts: { text: string }[];
}

let chatHistory: ChatHistoryEntry[] = [];

export async function sendMessage(userMessage: string): Promise<string> {
  try {
    // Build context relevant to this specific query
    const relevantContext = getRelevantContext(userMessage);
    const systemPrompt = `${BASE_SYSTEM_PROMPT}\n\nDỮ LIỆU TRƯỜNG (lọc theo câu hỏi):\n${relevantContext}`;

    const contents = [
      {
        role: 'user' as const,
        parts: [{ text: systemPrompt + '\n\nHãy ghi nhớ dữ liệu trên. Trả lời: "Đã sẵn sàng."' }],
      },
      {
        role: 'model' as const,
        parts: [{ text: 'Đã sẵn sàng. Tôi đã đọc toàn bộ dữ liệu được cung cấp. Hãy hỏi tôi.' }],
      },
      ...chatHistory,
      {
        role: 'user' as const,
        parts: [{ text: userMessage }],
      },
    ];

    const response = await ai.models.generateContent({
      model: MODEL,
      contents: contents,
    });

    const assistantMessage = response.text || 'Xin lỗi, tôi không thể xử lý yêu cầu này.';

    // Update chat history (keep last 10 exchanges to save tokens)
    chatHistory.push({
      role: 'user',
      parts: [{ text: userMessage }],
    });
    chatHistory.push({
      role: 'model',
      parts: [{ text: assistantMessage }],
    });

    if (chatHistory.length > 20) {
      chatHistory = chatHistory.slice(-20);
    }

    return assistantMessage;
  } catch (error: any) {
    console.error('Gemini API error:', error);
    if (error?.message?.includes('API key')) {
      return 'Lỗi: API key không hợp lệ. Vui lòng kiểm tra lại.';
    }
    if (error?.message?.includes('quota')) {
      return 'Lỗi: Đã vượt quá giới hạn API. Vui lòng thử lại sau.';
    }
    return `Lỗi kết nối AI: ${error?.message || 'Không xác định'}. Vui lòng thử lại.`;
  }
}

export function resetChat(): void {
  chatHistory = [];
}

export function getExtractedData() {
  return extractedData;
}
