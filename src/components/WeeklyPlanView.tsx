import React, { useMemo } from 'react';
import { getLatestWeeklyPlan } from '../data/realData';
import Icon from './Icon';
import './WeeklyPlanView.css';

const WeeklyPlanView: React.FC = () => {
  const plan = useMemo(() => getLatestWeeklyPlan(), []);

  if (!plan) {
    return <div className="weekly-plan-view"><p>Không có dữ liệu kế hoạch tuần.</p></div>;
  }

  // Split noiDung into meaningful items (max 15 lines displayed)
  const contentItems = plan.noiDung
    .filter((line: string) => line.trim().length > 10)
    .slice(0, 15);

  return (
    <div className="weekly-plan-view">
      <div className="plan-header">
        <div className="plan-title-row">
          <span className="plan-icon"><Icon name="clipboard" size={18} /></span>
          <h3>Kế hoạch tuần {plan.tuan}</h3>
        </div>
        <span className="plan-week">{plan.ngay}</span>
      </div>
      <div className="plan-schedule">
        {contentItems.map((item: string, index: number) => (
          <div key={index} className="plan-day" style={{ animationDelay: `${index * 0.04}s` }}>
            <div className="day-items">
              <div className="day-item">
                <span className="item-dot"></span>
                <span className="item-text">{item}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WeeklyPlanView;
