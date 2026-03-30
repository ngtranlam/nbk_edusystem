import React, { useRef, useEffect, useState } from 'react';
import { getAvgScoreByClass } from '../data/realData';
import { useData } from '../contexts/DataContext';
import './MonthlyChart.css';

// Color palette for classes within each grade
const CLASS_COLORS = [
  '#e8560a', '#6366f1', '#0ea5e9', '#22c55e',
  '#f59e0b', '#ec4899', '#8b5cf6', '#14b8a6',
];

interface MonthlyChartProps {
  periodKey: string;
}

const MonthlyChart: React.FC<MonthlyChartProps> = ({ periodKey }) => {
  const { data } = useData();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredBar, setHoveredBar] = useState<{ lop: string; avg: number; x: number; y: number; w: number; h: number } | null>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check if mouse is over any bar (will be set in draw function)
    const found = (canvas as any).__barHitAreas?.find((bar: any) => 
      x >= bar.x && x <= bar.x + bar.w && y >= bar.y && y <= bar.y + bar.h
    );
    
    setHoveredBar(found || null);
  };

  const handleMouseLeave = () => {
    setHoveredBar(null);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;
    const padding = { top: 20, right: 10, bottom: 40, left: 40 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    ctx.clearRect(0, 0, width, height);

    const chartData = getAvgScoreByClass(periodKey, data.periods);

    // Determine Y axis range
    const minVal = 4;
    const maxVal = 8;
    const steps = 4;

    // Grid lines
    ctx.strokeStyle = '#f0f0f0';
    ctx.lineWidth = 1;
    ctx.font = '11px Inter, sans-serif';
    ctx.fillStyle = '#999';
    ctx.textAlign = 'right';

    for (let i = 0; i <= steps; i++) {
      const val = minVal + (maxVal - minVal) * (i / steps);
      const y = padding.top + chartH - (chartH * i) / steps;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.stroke();
      ctx.fillText(val.toFixed(0), padding.left - 8, y + 4);
    }

    // Divide chart into equal slots per grade, center bars within each slot
    const numGrades = chartData.length;
    const slotWidth = chartW / numGrades;
    const barGap = 4;
    const barHitAreas: any[] = [];

    chartData.forEach((grade: any, gi: number) => {
      const slotStartX = padding.left + gi * slotWidth;
      const slotCenterX = slotStartX + slotWidth / 2;
      const numBars = grade.classes.length;
      const barWidth = Math.min((slotWidth - (numBars + 1) * barGap) / numBars, 36);
      const groupW = numBars * barWidth + (numBars - 1) * barGap;
      const groupStartX = slotCenterX - groupW / 2;

      // Draw grade label
      ctx.fillStyle = '#555';
      ctx.font = 'bold 11px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(grade.khoi, slotCenterX, height - 6);

      // Draw bars for each class
      grade.classes.forEach((cls: any, ci: number) => {
        const val = cls.avg;
        const clampedVal = Math.max(minVal, Math.min(maxVal, val));
        const barH = ((clampedVal - minVal) / (maxVal - minVal)) * chartH;
        const x = groupStartX + ci * (barWidth + barGap);
        const y = padding.top + chartH - barH;
        const color = CLASS_COLORS[ci % CLASS_COLORS.length];
        
        const isHovered = hoveredBar?.lop === cls.lop;

        // Bar with rounded top
        const radius = 3;
        ctx.fillStyle = isHovered ? color : color;
        ctx.globalAlpha = isHovered ? 1 : 0.85;
        
        // Add shadow for hovered bar
        if (isHovered) {
          ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
          ctx.shadowBlur = 8;
          ctx.shadowOffsetY = 4;
        }
        
        ctx.beginPath();
        if (barH > radius * 2) {
          ctx.moveTo(x, y + radius);
          ctx.arcTo(x, y, x + barWidth, y, radius);
          ctx.arcTo(x + barWidth, y, x + barWidth, y + barH, radius);
          ctx.lineTo(x + barWidth, padding.top + chartH);
          ctx.lineTo(x, padding.top + chartH);
        } else {
          ctx.rect(x, y, barWidth, barH);
        }
        ctx.closePath();
        ctx.fill();
        
        // Reset shadow
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetY = 0;
        ctx.globalAlpha = 1;

        // Value on top of bar - more prominent when hovered
        ctx.fillStyle = isHovered ? '#1a1a2e' : '#555';
        ctx.font = isHovered ? 'bold 11px Inter, sans-serif' : '9px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(val.toFixed(1), x + barWidth / 2, y - (isHovered ? 6 : 4));

        // Class name below bar
        ctx.fillStyle = isHovered ? '#1a1a2e' : '#999';
        ctx.font = isHovered ? 'bold 9px Inter, sans-serif' : '8px Inter, sans-serif';
        ctx.fillText(cls.lop.replace(/^(\d+)/, ''), x + barWidth / 2, height - 18);

        // Store hit area for hover detection
        barHitAreas.push({
          lop: cls.lop,
          avg: val,
          x,
          y,
          w: barWidth,
          h: barH,
        });

      });
    });

    // Store hit areas on canvas for mouse detection
    (canvas as any).__barHitAreas = barHitAreas;

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hoveredBar, periodKey, data.periods]);

  return (
    <div className="monthly-chart">
      <canvas 
        ref={canvasRef} 
        className="chart-canvas" 
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ cursor: hoveredBar ? 'pointer' : 'default' }}
      />
    </div>
  );
};

export default MonthlyChart;
