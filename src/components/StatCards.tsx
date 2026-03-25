import React from 'react';
import { totalStudents, getSchoolAvgScore, getStudentsToWatch, totalClasses } from '../data/realData';
import Icon from './Icon';
import './StatCards.css';

const StatCards: React.FC = () => {
  const avgScore = getSchoolAvgScore();
  const watchCount = getStudentsToWatch().length;

  const cards = [
    {
      icon: 'students',
      value: totalStudents,
      label: 'Tổng học sinh',
      change: `${totalClasses} lớp`,
      changeType: 'up' as const,
      color: '#e8560a',
      bgGradient: 'linear-gradient(135deg, #fff5f0 0%, #ffe8d6 100%)',
    },
    {
      icon: 'absent',
      value: 3,
      label: 'Vắng hôm nay',
      subtitle: 'Bình thường',
      changeType: 'neutral' as const,
      color: '#6366f1',
      bgGradient: 'linear-gradient(135deg, #f0f0ff 0%, #e8e8ff 100%)',
    },
    {
      icon: 'trending',
      value: avgScore,
      label: 'Điểm TB trường',
      change: 'HK1',
      changeType: 'up' as const,
      color: '#0ea5e9',
      bgGradient: 'linear-gradient(135deg, #f0f9ff 0%, #dbeafe 100%)',
    },
    {
      icon: 'alert',
      value: watchCount,
      label: 'Cần theo dõi',
      change: 'HS',
      changeType: 'warn' as const,
      color: '#ef4444',
      bgGradient: 'linear-gradient(135deg, #fff5f5 0%, #ffe0e0 100%)',
    },
  ];

  return (
    <div className="stat-cards">
      {cards.map((card, index) => (
        <div
          key={index}
          className="stat-card"
          style={{
            background: card.bgGradient,
            animationDelay: `${index * 0.1}s`,
          }}
        >
          <div className="stat-card-top">
            <span className="stat-icon" style={{ background: card.color }}>
              <Icon name={card.icon} size={18} />
            </span>
            {card.change && (
              <span className={`stat-change ${card.changeType}`}>
                {card.changeType === 'up' && '↑'} {card.change}
              </span>
            )}
            {card.subtitle && (
              <span className="stat-badge neutral">● {card.subtitle}</span>
            )}
          </div>
          <div className="stat-value" style={{ color: card.color }}>
            {card.value}
          </div>
          <div className="stat-label">{card.label}</div>
        </div>
      ))}
    </div>
  );
};

export default StatCards;
