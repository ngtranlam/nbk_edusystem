import React, { useRef, useEffect, useState, useCallback } from 'react';
import { overallAcademic } from '../data/realData';
import './AcademicPieChart.css';

interface SegmentData {
  label: string;
  value: number;
  color: string;
  startAngle: number;
  endAngle: number;
  percent: string;
}

const AcademicPieChart: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const segmentAnglesRef = useRef<SegmentData[]>([]);

  const stats = overallAcademic;
  const segments = [
    { label: 'Tốt', value: stats.tot, color: '#22c55e' },
    { label: 'Khá', value: stats.kha, color: '#0ea5e9' },
    { label: 'Đạt', value: stats.dat, color: '#f59e0b' },
    { label: 'Chưa đạt', value: stats.chuaDat, color: '#ef4444' },
  ];
  const total = segments.reduce((s, seg) => s + seg.value, 0);

  // Pre-calculate segment angles
  const segmentDataList: SegmentData[] = [];
  let angle = -Math.PI / 2;
  segments.forEach(seg => {
    const sliceAngle = (seg.value / total) * Math.PI * 2;
    segmentDataList.push({
      ...seg,
      startAngle: angle,
      endAngle: angle + sliceAngle,
      percent: ((seg.value / total) * 100).toFixed(1),
    });
    angle += sliceAngle;
  });
  segmentAnglesRef.current = segmentDataList;

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left - 80; // center offset (size/2)
    const y = e.clientY - rect.top - 80;
    const dist = Math.sqrt(x * x + y * y);
    const innerR = 45;
    const outerR = 70;

    if (dist < innerR || dist > outerR + 5) {
      setHoveredIndex(null);
      return;
    }

    let mouseAngle = Math.atan2(y, x);
    // Normalize to match our starting angle (-PI/2)
    if (mouseAngle < -Math.PI / 2) mouseAngle += Math.PI * 2;

    const idx = segmentAnglesRef.current.findIndex(seg => {
      let start = seg.startAngle;
      let end = seg.endAngle;
      // Normalize
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
    const size = 160;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = size + 'px';
    canvas.style.height = size + 'px';
    ctx.scale(dpr, dpr);

    const cx = size / 2;
    const cy = size / 2;
    const outerR = 70;
    const innerR = 45;

    ctx.clearRect(0, 0, size, size);

    segmentDataList.forEach((seg, i) => {
      const isHovered = hoveredIndex === i;
      const expandR = isHovered ? 5 : 0;
      const midAngle = (seg.startAngle + seg.endAngle) / 2;
      const offsetX = isHovered ? Math.cos(midAngle) * 4 : 0;
      const offsetY = isHovered ? Math.sin(midAngle) * 4 : 0;

      ctx.save();
      ctx.translate(offsetX, offsetY);

      if (isHovered) {
        ctx.shadowColor = 'rgba(0,0,0,0.25)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
      }

      ctx.beginPath();
      ctx.arc(cx, cy, outerR + expandR, seg.startAngle, seg.endAngle);
      ctx.arc(cx, cy, innerR, seg.endAngle, seg.startAngle, true);
      ctx.closePath();
      ctx.fillStyle = seg.color;
      ctx.globalAlpha = isHovered ? 1 : 0.85;
      ctx.fill();

      ctx.globalAlpha = 1;
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.restore();
    });

    // Center text — show hovered segment info or total
    if (hoveredIndex !== null && hoveredIndex >= 0 && hoveredIndex < segmentDataList.length) {
      const seg = segmentDataList[hoveredIndex];
      ctx.fillStyle = seg.color;
      ctx.font = 'bold 24px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(seg.value), cx, cy - 10);
      ctx.font = 'bold 11px Inter, sans-serif';
      ctx.fillText(seg.label, cx, cy + 8);
      ctx.font = '10px Inter, sans-serif';
      ctx.fillStyle = '#999';
      ctx.fillText(`${seg.percent}%`, cx, cy + 22);
    } else {
      ctx.fillStyle = '#1a1a2e';
      ctx.font = 'bold 28px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(total), cx, cy - 6);
      ctx.font = '11px Inter, sans-serif';
      ctx.fillStyle = '#999';
      ctx.fillText('Toàn trường', cx, cy + 14);
    }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hoveredIndex]);

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
        {segmentDataList.map((seg, i) => (
          <div
            key={i}
            className={`legend-item ${hoveredIndex === i ? 'legend-active' : ''}`}
            onMouseEnter={() => setHoveredIndex(i)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <span className="legend-dot" style={{ background: seg.color }}></span>
            <span className="legend-label">{seg.label}</span>
            <span className="legend-value">{seg.value}</span>
            <span className="legend-percent">({seg.percent}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AcademicPieChart;
