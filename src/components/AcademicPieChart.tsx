import React, { useRef, useEffect, useState, useCallback } from 'react';
import { getOverallAcademic } from '../data/realData';
import { useData } from '../contexts/DataContext';
import './AcademicPieChart.css';

interface SegmentData {
  label: string;
  value: number;
  color: string;
  colorLight: string;
  startAngle: number;
  endAngle: number;
  percent: string;
}

interface AcademicPieChartProps {
  periodKey: string;
}

const AcademicPieChart: React.FC<AcademicPieChartProps> = ({ periodKey }) => {
  const { data } = useData();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const segmentAnglesRef = useRef<SegmentData[]>([]);

  const stats = getOverallAcademic(periodKey, data.periods);
  const segments = [
    { label: 'Tốt', value: stats.tot, color: '#22c55e', colorLight: '#dcfce7' },
    { label: 'Khá', value: stats.kha, color: '#3b82f6', colorLight: '#dbeafe' },
    { label: 'Đạt', value: stats.dat, color: '#f59e0b', colorLight: '#fef3c7' },
    { label: 'Chưa đạt', value: stats.chuaDat, color: '#ef4444', colorLight: '#fee2e2' },
  ];
  const total = segments.reduce((s, seg) => s + seg.value, 0);

  const segmentDataList: SegmentData[] = [];
  const GAP_ANGLE = 0.03;
  let angle = -Math.PI / 2;
  segments.forEach(seg => {
    const sliceAngle = Math.max(0, (seg.value / total) * Math.PI * 2 - GAP_ANGLE);
    segmentDataList.push({
      ...seg,
      startAngle: angle + GAP_ANGLE / 2,
      endAngle: angle + sliceAngle + GAP_ANGLE / 2,
      percent: ((seg.value / total) * 100).toFixed(1),
    });
    angle += sliceAngle + GAP_ANGLE;
  });
  segmentAnglesRef.current = segmentDataList;

  const CANVAS_SIZE = 200;
  const OUTER_R = 88;
  const INNER_R = 58;

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = CANVAS_SIZE / rect.width;
    const scaleY = CANVAS_SIZE / rect.height;
    const x = (e.clientX - rect.left) * scaleX - CANVAS_SIZE / 2;
    const y = (e.clientY - rect.top) * scaleY - CANVAS_SIZE / 2;
    const dist = Math.sqrt(x * x + y * y);

    if (dist < INNER_R - 5 || dist > OUTER_R + 8) {
      setHoveredIndex(null);
      return;
    }

    let mouseAngle = Math.atan2(y, x);
    if (mouseAngle < -Math.PI / 2) mouseAngle += Math.PI * 2;

    const idx = segmentAnglesRef.current.findIndex(seg => {
      let start = seg.startAngle;
      let end = seg.endAngle;
      if (start < -Math.PI / 2) start += Math.PI * 2;
      if (end < -Math.PI / 2) end += Math.PI * 2;
      return mouseAngle >= start && mouseAngle < end;
    });

    setHoveredIndex(idx >= 0 ? idx : null);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHoveredIndex(null);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = CANVAS_SIZE * dpr;
    canvas.height = CANVAS_SIZE * dpr;
    canvas.style.width = CANVAS_SIZE + 'px';
    canvas.style.height = CANVAS_SIZE + 'px';
    ctx.scale(dpr, dpr);

    const cx = CANVAS_SIZE / 2;
    const cy = CANVAS_SIZE / 2;

    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // Background track ring
    ctx.beginPath();
    ctx.arc(cx, cy, OUTER_R, 0, Math.PI * 2);
    ctx.arc(cx, cy, INNER_R, Math.PI * 2, 0, true);
    ctx.closePath();
    ctx.fillStyle = '#f5f5f8';
    ctx.fill();

    // Draw segments with rounded ends
    segmentDataList.forEach((seg, i) => {
      const isHovered = hoveredIndex === i;
      const expand = isHovered ? 6 : 0;
      const midAngle = (seg.startAngle + seg.endAngle) / 2;
      const offsetX = isHovered ? Math.cos(midAngle) * 5 : 0;
      const offsetY = isHovered ? Math.sin(midAngle) * 5 : 0;

      ctx.save();
      ctx.translate(offsetX, offsetY);

      if (isHovered) {
        ctx.shadowColor = seg.color + '55';
        ctx.shadowBlur = 16;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 4;
      }

      ctx.beginPath();
      ctx.arc(cx, cy, OUTER_R + expand, seg.startAngle, seg.endAngle);
      ctx.arc(cx, cy, INNER_R - (isHovered ? 2 : 0), seg.endAngle, seg.startAngle, true);
      ctx.closePath();

      ctx.fillStyle = seg.color;
      ctx.globalAlpha = isHovered ? 1 : 0.9;
      ctx.fill();

      // Subtle lighter stroke
      ctx.strokeStyle = 'rgba(255,255,255,0.3)';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.globalAlpha = 1;
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.restore();
    });

    // Center text
    if (hoveredIndex !== null && hoveredIndex >= 0 && hoveredIndex < segmentDataList.length) {
      const seg = segmentDataList[hoveredIndex];
      ctx.fillStyle = seg.color;
      ctx.font = 'bold 30px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(seg.value), cx, cy - 10);
      ctx.font = '600 12px Inter, sans-serif';
      ctx.fillText(seg.label, cx, cy + 10);
      ctx.font = '11px Inter, sans-serif';
      ctx.fillStyle = '#aaa';
      ctx.fillText(`${seg.percent}%`, cx, cy + 26);
    } else {
      ctx.fillStyle = '#1a1a2e';
      ctx.font = 'bold 34px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(total), cx, cy - 8);
      ctx.font = '500 11px Inter, sans-serif';
      ctx.fillStyle = '#aaa';
      ctx.fillText('Tổng học sinh', cx, cy + 14);
    }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hoveredIndex, periodKey, data.periods]);

  return (
    <div className="academic-pie-chart">
      <div className="pie-canvas-wrapper">
        <canvas
          ref={canvasRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{ cursor: hoveredIndex !== null ? 'pointer' : 'default' }}
        />
      </div>
      <div className="pie-legend">
        {segmentDataList.map((seg, i) => {
          const pct = parseFloat(seg.percent);
          return (
            <div
              key={i}
              className={`legend-card ${hoveredIndex === i ? 'legend-card-active' : ''}`}
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
              style={{ '--seg-color': seg.color, '--seg-light': seg.colorLight } as React.CSSProperties}
            >
              <div className="legend-card-top">
                <span className="legend-dot" style={{ background: seg.color }}></span>
                <span className="legend-card-label">{seg.label}</span>
                <span className="legend-card-value">{seg.value}</span>
              </div>
              <div className="legend-card-bar-track">
                <div
                  className="legend-card-bar-fill"
                  style={{ width: `${pct}%`, background: seg.color }}
                />
              </div>
              <span className="legend-card-pct">{seg.percent}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AcademicPieChart;
