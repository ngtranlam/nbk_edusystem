import React, { useState, useMemo } from 'react';
import { getStudentsToWatch } from '../data/realData';
import './StudentWatchList.css';

type FilterType = 'all' | 'Cao' | 'Vừa';

const StudentWatchList: React.FC = () => {
  const [filter, setFilter] = useState<FilterType>('all');

  const allStudents = useMemo(() => getStudentsToWatch(), []);

  const filtered = filter === 'all'
    ? allStudents
    : allStudents.filter((s: any) => s.mucDo === filter);

  return (
    <div className="student-watch-list">
      <div className="watch-header">
        <div className="watch-title-row">
          <h3>Học sinh cần theo dõi</h3>
          <span className="watch-update">Cập nhật 10:43</span>
        </div>
        <div className="watch-filters">
          <button
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            Tất cả
          </button>
          <button
            className={`filter-btn filter-cao ${filter === 'Cao' ? 'active' : ''}`}
            onClick={() => setFilter('Cao')}
          >
            Cao
          </button>
          <button
            className={`filter-btn filter-vua ${filter === 'Vừa' ? 'active' : ''}`}
            onClick={() => setFilter('Vừa')}
          >
            Vừa
          </button>
        </div>
      </div>
      <div className="watch-table-wrapper">
        <table className="watch-table">
          <thead>
            <tr>
              <th>HỌC SINH</th>
              <th>MỨC ĐỘ</th>
              <th>NGUYÊN NHÂN</th>
              <th>VẮNG</th>
              <th>ĐIỂM TB</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((student, index) => (
              <tr key={index} className="watch-row" style={{ animationDelay: `${index * 0.05}s` }}>
                <td>
                  <div className="student-name">{student.hoTen}</div>
                  <div className="student-class">Lớp {student.lop}</div>
                </td>
                <td>
                  <span className={`badge-level ${student.mucDo === 'Cao' ? 'level-cao' : 'level-vua'}`}>
                    {student.mucDo}
                  </span>
                </td>
                <td>
                  <div className="reason-tags">
                    {student.nguyenNhan.map((nn: string, i: number) => (
                      <span key={i} className={`reason-tag ${nn === 'Vắng nhiều' ? 'tag-vang' : nn === 'Điểm thấp' ? 'tag-diem' : 'tag-vipham'}`}>
                        {nn}
                      </span>
                    ))}
                  </div>
                </td>
                <td>
                  <span className="absence-count">{student.vang} buổi</span>
                </td>
                <td>
                  <span className={`score-avg ${student.diemTB < 5.0 ? 'score-low' : ''}`}>
                    {student.diemTB.toFixed(1)}
                  </span>
                </td>
                <td>
                  <button className="btn-detail">Chi tiết</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StudentWatchList;
