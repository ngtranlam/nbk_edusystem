import React from 'react';
import StatCards from './StatCards';
import MonthlyChart from './MonthlyChart';
import AcademicPieChart from './AcademicPieChart';
import StudentWatchList from './StudentWatchList';
import WeeklyPlanView from './WeeklyPlanView';
import Icon from './Icon';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { getPeriodOptions } from '../data/realData';
import './Dashboard.css';

interface DashboardProps {
  selectedClass: string;
  onClassChange: (cls: string) => void;
  periodKey: string;
  onPeriodChange: (key: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ selectedClass, onClassChange, periodKey, onPeriodChange }) => {
  const { isBGH } = useAuth();
  const { data } = useData();
  const dynPeriodOptions = getPeriodOptions(data.periods);
  const currentLabel = dynPeriodOptions.find((p: { key: string; label: string }) => p.key === periodKey)?.label || '';

  return (
    <div className={`dashboard ${!isBGH ? 'guest-mode' : ''}`}>
      <div className="dashboard-toolbar">
        <div className="toolbar-contact">
          <Icon name="contact" size={14} className="toolbar-contact-icon" />
          <span className="toolbar-contact-name">Thầy Ngô Văn Nam, PHT trường THCS Nguyễn Bỉnh Khiêm</span>
          <span className="toolbar-contact-divider">|</span>
          <Icon name="phone" size={12} className="toolbar-contact-icon" />
          <span className="toolbar-contact-detail">0971 000 858</span>
          <span className="toolbar-contact-divider">|</span>
          <Icon name="mail" size={12} className="toolbar-contact-icon" />
          <span className="toolbar-contact-detail">Ngovannam93@gmail.com</span>
        </div>
        <div className="period-filter">
          <Icon name="calendar" size={15} className="period-icon" />
          <label className="period-label">Kỳ học:</label>
          <select
            className="period-select"
            value={periodKey}
            onChange={e => onPeriodChange(e.target.value)}
          >
            {dynPeriodOptions.map((p: { key: string; label: string }) => (
              <option key={p.key} value={p.key}>{p.label}</option>
            ))}
          </select>
        </div>
      </div>
      <StatCards periodKey={periodKey} />
      <div className="dashboard-charts-row">
        <div className="chart-section chart-monthly">
          <div className="section-header">
            <h3>Điểm trung bình theo lớp</h3>
            <span className="section-subtitle">{currentLabel}</span>
          </div>
          <MonthlyChart periodKey={periodKey} />
        </div>
        <div className="chart-section chart-academic">
          <div className="section-header">
            <h3>Học lực toàn trường</h3>
            <span className="section-subtitle">{currentLabel}</span>
          </div>
          <AcademicPieChart periodKey={periodKey} />
        </div>
      </div>
      {isBGH && (
        <div className="dashboard-bottom-row">
          <div className="bottom-section student-watch">
            <StudentWatchList periodKey={periodKey} />
          </div>
          <div className="bottom-section weekly-plan">
            <WeeklyPlanView />
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
