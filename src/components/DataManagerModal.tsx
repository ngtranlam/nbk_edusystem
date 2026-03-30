import React, { useState } from 'react';
import Icon from './Icon';
import { useData } from '../contexts/DataContext';
import './DataManagerModal.css';

interface DataManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DataManagerModal: React.FC<DataManagerModalProps> = ({ isOpen, onClose }) => {
  const { uploadedFiles, removeFile, clearUploads } = useData();
  const [confirm, setConfirm] = useState<{ type: 'single' | 'all'; index?: number } | null>(null);

  const handleConfirmDelete = async () => {
    if (!confirm) return;
    if (confirm.type === 'single' && confirm.index !== undefined) {
      await removeFile(confirm.index);
    } else if (confirm.type === 'all') {
      await clearUploads();
    }
    setConfirm(null);
  };

  if (!isOpen) return null;

  return (
    <div className="dm-overlay" onClick={onClose}>
      <div className="dm-modal" onClick={e => e.stopPropagation()}>
        <div className="dm-header">
          <h3>
            <Icon name="database" size={16} className="dm-header-icon" />
            Dữ liệu đã tải lên
          </h3>
          <button className="dm-close-btn" onClick={onClose}>&times;</button>
        </div>

        <div className="dm-body">
          {uploadedFiles.length === 0 ? (
            <div className="dm-empty">
              <Icon name="fileText" size={28} className="dm-empty-icon" />
              <p>Chưa có dữ liệu nào được tải lên</p>
              <span>Bấm nút <strong>Upload</strong> để thêm file Excel/CSV</span>
            </div>
          ) : (
            <>
              <div className="dm-list">
                {uploadedFiles.map((f, i) => (
                  <div key={i} className="dm-item">
                    <div className="dm-item-icon">
                      <Icon name="fileText" size={16} />
                    </div>
                    <div className="dm-item-info">
                      <span className="dm-item-name">{f.fileName}</span>
                      <span className="dm-item-meta">
                        <span className="dm-item-type">{getTypeLabel(f.fileType)}</span>
                        <span className="dm-item-sep">&middot;</span>
                        <span>{f.recordCount} bản ghi</span>
                        <span className="dm-item-sep">&middot;</span>
                        <span>{formatDate(f.uploadedAt)}</span>
                      </span>
                    </div>
                    <button className="dm-item-delete" onClick={() => setConfirm({ type: 'single', index: i })} title="Xoá file này">
                      <Icon name="trash" size={14} />
                    </button>
                  </div>
                ))}
              </div>
              <div className="dm-footer">
                <span className="dm-count">{uploadedFiles.length} file</span>
                <button className="dm-clear-all" onClick={() => setConfirm({ type: 'all' })}>Xoá tất cả</button>
              </div>
            </>
          )}
        </div>

        {/* Confirm popup */}
        {confirm && (
          <div className="dm-confirm-overlay" onClick={() => setConfirm(null)}>
            <div className="dm-confirm" onClick={e => e.stopPropagation()}>
              <div className="dm-confirm-icon">
                <Icon name="trash" size={20} />
              </div>
              <p className="dm-confirm-text">
                {confirm.type === 'all'
                  ? 'Xoá tất cả dữ liệu đã tải lên?'
                  : `Xoá file "${uploadedFiles[confirm.index!]?.fileName}"?`}
              </p>
              <span className="dm-confirm-hint">Thao tác này không thể hoàn tác</span>
              <div className="dm-confirm-actions">
                <button className="dm-confirm-cancel" onClick={() => setConfirm(null)}>Huỷ</button>
                <button className="dm-confirm-delete" onClick={handleConfirmDelete}>Xoá</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

function getTypeLabel(type: string): string {
  const map: Record<string, string> = {
    scores: 'Sổ điểm',
    classification: 'Tỉ lệ XL',
    teachers: 'Giáo viên',
    classStats: 'Sĩ số',
  };
  return map[type] || type;
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}

export default DataManagerModal;
