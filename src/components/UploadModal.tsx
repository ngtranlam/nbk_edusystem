import React, { useState, useRef, useCallback } from 'react';
import Icon from './Icon';
import { parseFile, ParseResult } from '../services/fileParser';
import { useData } from '../contexts/DataContext';
import './UploadModal.css';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ACCEPTED_FORMATS = '.xls,.xlsx,.csv';

const UploadModal: React.FC<UploadModalProps> = ({ isOpen, onClose }) => {
  const { applyUpload, uploadedFiles, clearUploads } = useData();
  const [dragOver, setDragOver] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [results, setResults] = useState<(ParseResult & { status: 'success' | 'error'; error?: string })[]>([]);
  const [periodKey, setPeriodKey] = useState('');
  const [periodLabel, setPeriodLabel] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(async (files: FileList | File[]) => {
    setProcessing(true);
    const newResults: typeof results = [];

    for (const file of Array.from(files)) {
      try {
        const result = await parseFile(file);
        if (result.fileType === 'unknown') {
          newResults.push({ ...result, status: 'error', error: 'Không nhận diện được loại file' });
        } else {
          const needsPeriod = result.fileType === 'scores' || result.fileType === 'classification';
          const pk = needsPeriod ? (periodKey || `upload_${Date.now()}`) : undefined;
          const pl = needsPeriod ? (periodLabel || file.name.replace(/\.[^.]+$/, '')) : undefined;
          await applyUpload(result, pk, pl);
          newResults.push({ ...result, status: 'success' });
        }
      } catch (err: any) {
        newResults.push({
          fileType: 'unknown',
          fileName: file.name,
          message: '',
          status: 'error',
          error: err.message,
        });
      }
    }

    setResults(prev => [...prev, ...newResults]);
    setProcessing(false);
  }, [applyUpload, periodKey, periodLabel]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  }, [handleFiles]);

  const onFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
    // Reset input so same file can be re-uploaded
    e.target.value = '';
  }, [handleFiles]);

  const handleClearAll = useCallback(async () => {
    await clearUploads();
    setResults([]);
  }, [clearUploads]);

  if (!isOpen) return null;

  return (
    <div className="upload-overlay" onClick={onClose}>
      <div className="upload-modal" onClick={e => e.stopPropagation()}>
        <div className="upload-modal-header">
          <h3>
            <Icon name="upload" size={18} className="upload-header-icon" />
            Tải lên dữ liệu
          </h3>
          <button className="upload-close-btn" onClick={onClose}>&times;</button>
        </div>

        <div className="upload-modal-body">
          {/* Period selection for scores/classification */}
          <div className="upload-period-row">
            <label>Kỳ học (cho file điểm/tỉ lệ):</label>
            <input
              type="text"
              className="upload-period-input"
              placeholder="VD: hk1_2025_2026"
              value={periodKey}
              onChange={e => setPeriodKey(e.target.value)}
            />
            <input
              type="text"
              className="upload-period-input"
              placeholder="VD: Học kỳ 1 — 2025-2026"
              value={periodLabel}
              onChange={e => setPeriodLabel(e.target.value)}
            />
          </div>

          {/* Drop zone */}
          <div
            className={`upload-dropzone ${dragOver ? 'dragover' : ''} ${processing ? 'processing' : ''}`}
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPTED_FORMATS}
              multiple
              onChange={onFileChange}
              style={{ display: 'none' }}
            />
            {processing ? (
              <div className="upload-processing">
                <div className="upload-spinner" />
                <span>Đang phân tích file...</span>
              </div>
            ) : (
              <>
                <Icon name="upload" size={32} className="upload-dropzone-icon" />
                <p className="upload-dropzone-text">
                  Kéo thả file vào đây hoặc <span className="upload-browse">chọn file</span>
                </p>
                <p className="upload-dropzone-hint">
                  Hỗ trợ: .xls, .xlsx, .csv — Sổ điểm, Tỉ lệ xếp loại, Danh sách GV, Sĩ số
                </p>
              </>
            )}
          </div>

          {/* Results */}
          {results.length > 0 && (
            <div className="upload-results">
              <h4>Kết quả tải lên</h4>
              {results.map((r, i) => (
                <div key={i} className={`upload-result-item ${r.status}`}>
                  <span className="upload-result-icon">{r.status === 'success' ? '✓' : '✗'}</span>
                  <div className="upload-result-info">
                    <span className="upload-result-name">{r.fileName}</span>
                    <span className="upload-result-msg">
                      {r.status === 'success' ? r.message : (r.error || r.message)}
                    </span>
                  </div>
                  <span className="upload-result-type">{r.fileType !== 'unknown' ? r.fileType : ''}</span>
                </div>
              ))}
            </div>
          )}

          {/* Upload history */}
          {uploadedFiles.length > 0 && (
            <div className="upload-history">
              <div className="upload-history-header">
                <h4>Dữ liệu đã tải ({uploadedFiles.length} file)</h4>
                <button className="upload-clear-btn" onClick={handleClearAll}>Xoá tất cả</button>
              </div>
              <div className="upload-history-list">
                {uploadedFiles.map((f, i) => (
                  <div key={i} className="upload-history-item">
                    <Icon name="fileText" size={14} className="upload-history-icon" />
                    <span className="upload-history-name">{f.fileName}</span>
                    <span className="upload-history-count">{f.recordCount} bản ghi</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UploadModal;
