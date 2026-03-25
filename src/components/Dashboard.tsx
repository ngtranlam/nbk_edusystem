import React from 'react';
import StatCards from './StatCards';
import MonthlyChart from './MonthlyChart';
import AcademicPieChart from './AcademicPieChart';
import StudentWatchList from './StudentWatchList';
import WeeklyPlanView from './WeeklyPlanView';
import './Dashboard.css';

interface DashboardProps {
  selectedClass: string;
  onClassChange: (cls: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ selectedClass, onClassChange }) => {
  return (
    <div className="dashboard">
      <StatCards />
      <div className="dashboard-charts-row">
        <div className="chart-section chart-monthly">
          <div className="section-header">
            <h3>Điểm trung bình theo lớp</h3>
            <span className="section-subtitle">Học kỳ 1 – 2025-2026</span>
          </div>
          <MonthlyChart />
        </div>
        <div className="chart-section chart-academic">
          <div className="section-header">
            <h3>Học lực toàn trường</h3>
            <span className="section-subtitle">Học kỳ 1 – 2025-2026</span>
          </div>
          <AcademicPieChart />
        </div>
      </div>
      <div className="dashboard-bottom-row">
        <div className="bottom-section student-watch">
          <StudentWatchList />
        </div>
        <div className="bottom-section weekly-plan">
          <WeeklyPlanView />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
