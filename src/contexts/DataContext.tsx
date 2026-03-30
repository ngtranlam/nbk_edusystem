/**
 * DataContext — provides dynamic school data to all components.
 * Merges default JSON data with any uploaded data from IndexedDB.
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import defaultData from '../data/extracted_data.json';
import { saveData, loadData, deleteData } from '../services/dataStore';
import { ParseResult } from '../services/fileParser';
import { updateAIData } from '../services/geminiService';

// ============================================================
// TYPES
// ============================================================

interface PeriodData {
  periodKey: string;
  periodLabel: string;
  scores: any[];
  schoolTotal: any;
  classScoreSummaries: any[];
}

interface UploadedFile {
  fileName: string;
  fileType: string;
  uploadedAt: string;
  recordCount: number;
  periodKey?: string;
}

interface SchoolData {
  periods: PeriodData[];
  teachers: any[];
  classStats: any[];
  weeklyPlans: any[];
  uploadedFiles: UploadedFile[];
}

interface DataContextType {
  data: SchoolData;
  uploadedFiles: UploadedFile[];
  applyUpload: (result: ParseResult, periodKey?: string, periodLabel?: string) => Promise<void>;
  removeFile: (index: number) => Promise<void>;
  clearUploads: () => Promise<void>;
  isLoading: boolean;
}

const DataContext = createContext<DataContextType | null>(null);

// ============================================================
// BUILD DEFAULT DATA
// ============================================================

function getDefaultData(): SchoolData {
  const d = defaultData as any;
  return {
    periods: d.periods || [],
    teachers: d.teachers || [],
    classStats: d.classStats || [],
    weeklyPlans: d.weeklyPlans || [],
    uploadedFiles: [],
  };
}

// ============================================================
// PROVIDER
// ============================================================

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<SchoolData>(getDefaultData);
  const [isLoading, setIsLoading] = useState(true);

  // Load persisted uploads on mount
  useEffect(() => {
    (async () => {
      try {
        const saved = await loadData('school_data_overrides');
        if (saved) {
          setData(prev => mergeData(prev, saved));
        }
      } catch {}
      setIsLoading(false);
    })();
  }, []);

  const persistOverrides = useCallback(async (overrides: any) => {
    await saveData('school_data_overrides', overrides);
  }, []);

  const applyUpload = useCallback(async (result: ParseResult, periodKey?: string, periodLabel?: string) => {
    setData(prev => {
      const next = { ...prev };
      const fileRecord: UploadedFile = {
        fileName: result.fileName,
        fileType: result.fileType,
        uploadedAt: new Date().toISOString(),
        recordCount: 0,
        periodKey: periodKey,
      };

      switch (result.fileType) {
        case 'scores': {
          if (result.scores && result.scores.length > 0 && periodKey) {
            fileRecord.recordCount = result.scores.length;
            const existingIdx = next.periods.findIndex(p => p.periodKey === periodKey);
            const periodData: PeriodData = {
              periodKey,
              periodLabel: periodLabel || periodKey,
              scores: result.scores,
              schoolTotal: existingIdx >= 0 ? next.periods[existingIdx].schoolTotal : {},
              classScoreSummaries: existingIdx >= 0 ? next.periods[existingIdx].classScoreSummaries : [],
            };
            if (existingIdx >= 0) {
              next.periods = [...next.periods];
              next.periods[existingIdx] = { ...next.periods[existingIdx], scores: result.scores };
            } else {
              next.periods = [...next.periods, periodData];
            }
          }
          break;
        }
        case 'classification': {
          if (periodKey) {
            fileRecord.recordCount = result.classSummaries?.length || 0;
            const existingIdx = next.periods.findIndex(p => p.periodKey === periodKey);
            if (existingIdx >= 0) {
              next.periods = [...next.periods];
              next.periods[existingIdx] = {
                ...next.periods[existingIdx],
                schoolTotal: result.schoolTotal || next.periods[existingIdx].schoolTotal,
                classScoreSummaries: result.classSummaries || next.periods[existingIdx].classScoreSummaries,
              };
            } else {
              next.periods = [...next.periods, {
                periodKey,
                periodLabel: periodLabel || periodKey,
                scores: [],
                schoolTotal: result.schoolTotal || {},
                classScoreSummaries: result.classSummaries || [],
              }];
            }
          }
          break;
        }
        case 'teachers': {
          if (result.teachers) {
            next.teachers = result.teachers;
            fileRecord.recordCount = result.teachers.length;
          }
          break;
        }
        case 'classStats': {
          if (result.classStats) {
            next.classStats = result.classStats;
            fileRecord.recordCount = result.classStats.length;
          }
          break;
        }
      }

      next.uploadedFiles = [...next.uploadedFiles, fileRecord];
      return next;
    });

    // Persist the overrides
    setData(prev => {
      const overrides = {
        periods: prev.periods,
        teachers: prev.teachers,
        classStats: prev.classStats,
        uploadedFiles: prev.uploadedFiles,
      };
      persistOverrides(overrides);
      return prev;
    });
  }, [persistOverrides]);

  // Sync data to AI service whenever it changes
  useEffect(() => {
    updateAIData(data);
  }, [data]);

  const removeFile = useCallback(async (index: number) => {
    setData(prev => {
      const fileToRemove = prev.uploadedFiles[index];
      const next = { ...prev };
      next.uploadedFiles = prev.uploadedFiles.filter((_, i) => i !== index);

      // Remove associated period if it was added by this upload
      if (fileToRemove?.periodKey) {
        const defaultPeriodKeys = new Set(getDefaultData().periods.map(p => p.periodKey));
        // Only remove if it's not a default period
        if (!defaultPeriodKeys.has(fileToRemove.periodKey)) {
          // Check if any other uploaded file still references this period
          const stillUsed = next.uploadedFiles.some(f => f.periodKey === fileToRemove.periodKey);
          if (!stillUsed) {
            next.periods = prev.periods.filter(p => p.periodKey !== fileToRemove.periodKey);
          }
        }
      }

      // If file was teachers/classStats, revert to defaults
      if (fileToRemove?.fileType === 'teachers') {
        const hasOtherTeacherFile = next.uploadedFiles.some(f => f.fileType === 'teachers');
        if (!hasOtherTeacherFile) next.teachers = getDefaultData().teachers;
      }
      if (fileToRemove?.fileType === 'classStats') {
        const hasOtherClassFile = next.uploadedFiles.some(f => f.fileType === 'classStats');
        if (!hasOtherClassFile) next.classStats = getDefaultData().classStats;
      }

      // Persist
      const overrides = {
        periods: next.periods,
        teachers: next.teachers,
        classStats: next.classStats,
        uploadedFiles: next.uploadedFiles,
      };
      persistOverrides(overrides);
      return next;
    });
  }, [persistOverrides]);

  const clearUploads = useCallback(async () => {
    await deleteData('school_data_overrides');
    setData(getDefaultData());
  }, []);

  return (
    <DataContext.Provider value={{
      data,
      uploadedFiles: data.uploadedFiles,
      applyUpload,
      removeFile,
      clearUploads,
      isLoading,
    }}>
      {children}
    </DataContext.Provider>
  );
};

export function useData(): DataContextType {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}

// ============================================================
// MERGE HELPER
// ============================================================

function mergeData(base: SchoolData, overrides: any): SchoolData {
  const merged = { ...base };

  if (overrides.teachers?.length > 0) {
    merged.teachers = overrides.teachers;
  }
  if (overrides.classStats?.length > 0) {
    merged.classStats = overrides.classStats;
  }
  if (overrides.periods?.length > 0) {
    // Replace matching periods, add new ones
    const periodMap = new Map(merged.periods.map(p => [p.periodKey, p]));
    overrides.periods.forEach((op: PeriodData) => {
      periodMap.set(op.periodKey, op);
    });
    merged.periods = Array.from(periodMap.values());
  }
  if (overrides.uploadedFiles) {
    merged.uploadedFiles = overrides.uploadedFiles;
  }

  return merged;
}
