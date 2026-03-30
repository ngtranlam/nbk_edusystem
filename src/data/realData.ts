import extractedData from './extracted_data.json';

// ============================================================
// TYPES
// ============================================================

interface ScoreRecord {
  hoTen?: string;
  lop?: string;
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

interface PeriodData {
  periodKey: string;
  periodLabel: string;
  scores: ScoreRecord[];
  schoolTotal: { siSo?: number; tot?: number; kha?: number; dat?: number; chuaDat?: number; nu?: number; danToc?: number };
  classScoreSummaries: { lop: string; siSo: number; tot: number; kha: number; dat: number; chuaDat: number }[];
}

// ============================================================
// PERIOD DATA ACCESS
// ============================================================

export const periods: PeriodData[] = (extractedData as any).periods || [];
export const teachers = extractedData.teachers;
export const classStats = extractedData.classStats;
export const weeklyPlans = extractedData.weeklyPlans;

// Available period options for the filter
export const periodOptions = periods.map(p => ({
  key: p.periodKey,
  label: p.periodLabel,
}));

// Default period key
export const defaultPeriodKey = periods.length > 0 ? periods[0].periodKey : '';

// Get data for a specific period (accepts optional external periods for dynamic data)
export function getPeriodData(periodKey: string, externalPeriods?: any[]): PeriodData | undefined {
  const src = externalPeriods || periods;
  return src.find((p: any) => p.periodKey === periodKey);
}

// Get scores for a specific period
function getScores(periodKey: string, ext?: any[]): ScoreRecord[] {
  return getPeriodData(periodKey, ext)?.scores || [];
}

// Get school total for a specific period
function getSchoolTotal(periodKey: string, ext?: any[]) {
  return getPeriodData(periodKey, ext)?.schoolTotal || {};
}

// Get class score summaries for a specific period
function getClassScoreSummaries(periodKey: string, ext?: any[]) {
  return getPeriodData(periodKey, ext)?.classScoreSummaries || [];
}

// Get period options from external data
export function getPeriodOptions(externalPeriods?: any[]) {
  const src = externalPeriods || periods;
  return src.map((p: any) => ({ key: p.periodKey, label: p.periodLabel }));
}

// ============================================================
// SHARED (non-period) DATA
// ============================================================

export const totalClasses = classStats.length;
export const totalTeachers = teachers.filter((t: any) => t.viTriViecLam === 'Giáo viên').length;
export const totalStaff = teachers.length;
export const classOnlyStats = classStats.filter((c: any) => !c.tenLop.startsWith('Tổng'));

// ============================================================
// PERIOD-AWARE COMPUTED FUNCTIONS
// ============================================================

export function getStatCards(periodKey: string, ext?: any[]) {
  const total = getSchoolTotal(periodKey, ext);
  const scoresArr = getScores(periodKey, ext);
  const siSo = total.siSo || scoresArr.length;

  // Count absence
  const absenceStudents = scoresArr.filter(s => (s.buoiNghiTong || 0) >= 3).length;
  // School avg
  let totalSum = 0;
  let count = 0;
  scoresArr.forEach(s => {
    const nums = [s.toan, s.lsDl, s.khtn, s.tin, s.van, s.ngNgu, s.gdcd, s.cNghe]
      .filter(v => typeof v === 'number' && !isNaN(v)) as number[];
    if (nums.length > 0) {
      totalSum += nums.reduce((a, b) => a + b, 0) / nums.length;
      count++;
    }
  });
  const avgScore = count > 0 ? Math.round((totalSum / count) * 10) / 10 : 0;

  // Watch list count
  const watchCount = scoresArr.filter(s => {
    const nums = [s.toan, s.lsDl, s.khtn, s.tin, s.van, s.ngNgu, s.gdcd, s.cNghe]
      .filter(v => typeof v === 'number' && !isNaN(v)) as number[];
    const avg = nums.length > 0 ? nums.reduce((a, b) => a + b, 0) / nums.length : 0;
    return (s.buoiNghiTong || 0) >= 5 || (avg > 0 && avg < 5.0) ||
      s.ketQuaHocTap === 'Chưa Đạt' || s.ketQuaHocTap === 'Chưa đạt' ||
      (s.buoiNghiKhongPhep || 0) >= 3;
  }).length;

  return { siSo, absenceStudents, avgScore, watchCount };
}

export function getOverallAcademic(periodKey: string, ext?: any[]) {
  const summaries = getClassScoreSummaries(periodKey, ext);
  const total = getSchoolTotal(periodKey, ext);

  // Use schoolTotal if available
  if (total.tot !== undefined) {
    return {
      tot: total.tot || 0,
      kha: total.kha || 0,
      dat: total.dat || 0,
      chuaDat: total.chuaDat || 0,
    };
  }

  return summaries.reduce(
    (acc, s) => ({
      tot: acc.tot + (s.tot || 0),
      kha: acc.kha + (s.kha || 0),
      dat: acc.dat + (s.dat || 0),
      chuaDat: acc.chuaDat + (s.chuaDat || 0),
    }),
    { tot: 0, kha: 0, dat: 0, chuaDat: 0 }
  );
}

export function getAvgScoreByClass(periodKey: string, ext?: any[]): { khoi: string; classes: { lop: string; avg: number }[] }[] {
  const scoresArr = getScores(periodKey, ext);
  const grades = ['6', '7', '8', '9'];
  return grades.map(g => {
    const gradeClasses = Array.from(new Set(scoresArr.filter(s => s.lop?.startsWith(g)).map(s => s.lop || ''))).sort();

    const classes = gradeClasses.map(lop => {
      const classScores = scoresArr.filter(s => s.lop === lop);
      let totalAvg = 0;
      let cnt = 0;
      classScores.forEach(s => {
        const nums = [s.toan, s.lsDl, s.khtn, s.tin, s.van, s.ngNgu, s.gdcd, s.cNghe]
          .filter(v => typeof v === 'number' && !isNaN(v)) as number[];
        if (nums.length > 0) {
          totalAvg += nums.reduce((a, b) => a + b, 0) / nums.length;
          cnt++;
        }
      });
      return { lop, avg: cnt > 0 ? Math.round((totalAvg / cnt) * 10) / 10 : 0 };
    });

    return { khoi: `Khối ${g}`, classes };
  });
}

export function getStudentsToWatch(periodKey: string, ext?: any[]) {
  const scoresArr = getScores(periodKey, ext);
  const watchList: any[] = [];

  scoresArr.forEach(s => {
    const numericScores = [s.toan, s.lsDl, s.khtn, s.tin, s.van, s.ngNgu, s.gdcd, s.cNghe]
      .filter(v => typeof v === 'number' && !isNaN(v)) as number[];
    const avg = numericScores.length > 0
      ? numericScores.reduce((a, b) => a + b, 0) / numericScores.length
      : 0;

    const reasons: string[] = [];
    let mucDo: 'Cao' | 'Vừa' = 'Vừa';

    if ((s.buoiNghiTong || 0) >= 5) reasons.push('Vắng nhiều');
    if (avg > 0 && avg < 5.0) reasons.push('Điểm thấp');
    if (s.ketQuaHocTap === 'Chưa Đạt' || s.ketQuaHocTap === 'Chưa đạt') reasons.push('Chưa đạt');
    if ((s.buoiNghiKhongPhep || 0) >= 3) reasons.push('Nghỉ KP');

    if (reasons.length >= 2 || avg < 4.0 || (s.buoiNghiKhongPhep || 0) >= 5) {
      mucDo = 'Cao';
    }

    if (reasons.length > 0) {
      watchList.push({
        hoTen: s.hoTen || '',
        lop: s.lop || '',
        mucDo,
        nguyenNhan: reasons,
        vang: s.buoiNghiTong || 0,
        diemTB: Math.round(avg * 10) / 10,
        ketQuaHocTap: s.ketQuaHocTap || '',
      });
    }
  });

  return watchList.sort((a, b) => {
    if (a.mucDo !== b.mucDo) return a.mucDo === 'Cao' ? -1 : 1;
    return b.vang - a.vang;
  });
}

// Get current/latest weekly plan
export function getLatestWeeklyPlan() {
  if (weeklyPlans.length === 0) return null;
  return weeklyPlans[weeklyPlans.length - 1];
}

// ============================================================
// BACKWARD COMPATIBILITY (default period)
// ============================================================

export const scores = (extractedData as any).scores || [];
export const schoolTotal = (extractedData as any).schoolTotal || {};
export const classScoreSummaries = (extractedData as any).classScoreSummaries || [];
export const overallAcademic = getOverallAcademic(defaultPeriodKey);
