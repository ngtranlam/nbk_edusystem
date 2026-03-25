import extractedData from './extracted_data.json';

// Re-export typed data from the extracted JSON

export const teachers = extractedData.teachers;
export const classStats = extractedData.classStats;
export const gradeTotals = extractedData.gradeTotals;
export const schoolTotal = extractedData.schoolTotal;
export const classScoreSummaries = extractedData.classScoreSummaries;
export const scores = extractedData.scores;
export const weeklyPlans = extractedData.weeklyPlans;

// Computed stats
export const totalStudents = schoolTotal?.siSo || classStats.reduce((s, c) => s + c.siSo, 0);
export const totalFemale = schoolTotal?.nu || classStats.reduce((s, c) => s + c.nu, 0);
export const totalEthnic = schoolTotal?.danToc || classStats.reduce((s, c) => s + c.danToc, 0);
export const totalClasses = classStats.length;
export const totalTeachers = teachers.filter(t => t.viTriViecLam === 'Giáo viên').length;
export const totalStaff = teachers.length;

// Get class-only stats (exclude "Tổng Cộng" rows)
export const classOnlyStats = classStats.filter(c => !c.tenLop.startsWith('Tổng'));

// Calculate overall academic performance from score summaries
export const overallAcademic = classScoreSummaries.reduce(
  (acc, s) => ({
    tot: acc.tot + s.tot,
    kha: acc.kha + s.kha,
    dat: acc.dat + s.dat,
    chuaDat: acc.chuaDat + s.chuaDat,
    total: acc.total + s.tongHS,
  }),
  { tot: 0, kha: 0, dat: 0, chuaDat: 0, total: 0 }
);

// Calculate average score per class
export function getClassAvgScore(lop: string): number {
  const classScores = scores.filter(s => s.lop?.toUpperCase() === lop.toUpperCase());
  if (classScores.length === 0) return 0;

  let totalSum = 0;
  let count = 0;
  classScores.forEach(s => {
    const numericScores = [s.toan, s.lsDl, s.khtn, s.tin, s.van, s.ngNgu, s.gdcd, s.cNghe]
      .filter(v => typeof v === 'number' && !isNaN(v)) as number[];
    if (numericScores.length > 0) {
      totalSum += numericScores.reduce((a, b) => a + b, 0) / numericScores.length;
      count++;
    }
  });
  return count > 0 ? Math.round((totalSum / count) * 10) / 10 : 0;
}

// Get school-wide average score
export function getSchoolAvgScore(): number {
  let totalSum = 0;
  let count = 0;
  scores.forEach(s => {
    const numericScores = [s.toan, s.lsDl, s.khtn, s.tin, s.van, s.ngNgu, s.gdcd, s.cNghe]
      .filter(v => typeof v === 'number' && !isNaN(v)) as number[];
    if (numericScores.length > 0) {
      totalSum += numericScores.reduce((a, b) => a + b, 0) / numericScores.length;
      count++;
    }
  });
  return count > 0 ? Math.round((totalSum / count) * 10) / 10 : 0;
}

// Students with high absence
export function getStudentsHighAbsence(threshold: number = 5) {
  return scores
    .filter(s => (s.buoiNghiTong || 0) >= threshold)
    .sort((a, b) => (b.buoiNghiTong || 0) - (a.buoiNghiTong || 0))
    .map(s => ({
      hoTen: s.hoTen || '',
      lop: s.lop || '',
      buoiNghiPhep: s.buoiNghiPhep || 0,
      buoiNghiKhongPhep: s.buoiNghiKhongPhep || 0,
      buoiNghiTong: s.buoiNghiTong || 0,
      ketQuaHocTap: s.ketQuaHocTap || '',
    }));
}

// Students with low scores (Chưa Đạt or Đạt with low avg)
export function getStudentsToWatch() {
  const watchList: any[] = [];

  scores.forEach(s => {
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

// Average scores by grade for charts
export function getAvgScoresByGrade() {
  const grades = ['6', '7', '8', '9'];
  return grades.map(g => {
    const gradeScores = scores.filter(s => s.lop?.startsWith(g));
    const subjects = ['toan', 'van', 'ngNgu', 'lsDl', 'khtn', 'tin', 'gdcd', 'cNghe'] as const;

    const avgs: Record<string, number> = {};
    subjects.forEach(subj => {
      const vals = gradeScores
        .map(s => (s as any)[subj])
        .filter(v => typeof v === 'number' && !isNaN(v)) as number[];
      avgs[subj] = vals.length > 0 ? Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10 : 0;
    });

    return { khoi: `Khối ${g}`, ...avgs };
  });
}

// Average score per class (ĐTB tất cả môn) grouped by grade
export function getAvgScoreByClass(): { khoi: string; classes: { lop: string; avg: number }[] }[] {
  const grades = ['6', '7', '8', '9'];
  return grades.map(g => {
    const gradeClasses = Array.from(new Set(scores.filter(s => s.lop?.startsWith(g)).map(s => s.lop || ''))).sort();

    const classes = gradeClasses.map(lop => {
      const classScores = scores.filter(s => s.lop === lop);
      let totalAvg = 0;
      let count = 0;
      classScores.forEach(s => {
        const nums = [s.toan, s.lsDl, s.khtn, s.tin, s.van, s.ngNgu, s.gdcd, s.cNghe]
          .filter(v => typeof v === 'number' && !isNaN(v)) as number[];
        if (nums.length > 0) {
          totalAvg += nums.reduce((a, b) => a + b, 0) / nums.length;
          count++;
        }
      });
      return { lop, avg: count > 0 ? Math.round((totalAvg / count) * 10) / 10 : 0 };
    });

    return { khoi: `Khối ${g}`, classes };
  });
}

// Get current/latest weekly plan
export function getLatestWeeklyPlan() {
  if (weeklyPlans.length === 0) return null;
  return weeklyPlans[weeklyPlans.length - 1];
}
