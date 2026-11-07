export interface MilestoneItem {
  id: string;
  dateStr: string;
  day: string;
  month: string;
  title: string;
  description: string;
  note: string;
  status: 'completed' | 'active' | 'upcoming';
  badgeText: string;
}

export const VTVL_MILESTONES: MilestoneItem[] = [
  {
    id: 'ms-1',
    dateStr: '2026-11-03',
    day: '03',
    month: 'tháng 11',
    title: 'Giai đoạn 1: Rà soát danh mục nhiệm vụ và vị trí việc làm',
    description: 'Khởi tạo tệp đơn vị (21 trang tính); chuẩn hóa biểu A1, A2, C1, C2 theo Nghị định số 232/2026/NĐ-CP và Thông tư số 31/2026/TT-BGDĐT.',
    note: 'Áp dụng đối với 51 đơn vị thuộc và trực thuộc Trường.',
    status: 'completed',
    badgeText: 'Đã hoàn thành'
  },
  {
    id: 'ms-2',
    dateStr: '2026-11-10',
    day: '10',
    month: 'tháng 11',
    title: 'Giai đoạn 2: Khảo sát sản lượng và đo định mức thời gian',
    description: 'Phân phối phiếu khảo sát theo vị trí việc làm, thực hiện đo định mức thời gian (phút/sản phẩm) và tích hợp số liệu vào biểu B1, B2, D1.',
    note: 'Tổng hợp tự động các phiếu khảo sát thành tệp đơn vị phiên bản v2.',
    status: 'active',
    badgeText: 'Đang triển khai'
  },
  {
    id: 'ms-3',
    dateStr: '2026-11-15',
    day: '15',
    month: 'tháng 11',
    title: 'Giai đoạn 3: Thẩm định chéo bộ biểu và trình ký hồ sơ',
    description: 'Kiểm tra chéo 6 chỉ tiêu tại biểu K_KiemTra, hoàn thiện phương án biên chế giai đoạn 2027–2031 (biểu D2) và gửi Phòng Tổ chức - Nhân sự.',
    note: 'Trình ký Tờ trình kèm tệp dữ liệu điện tử (.xlsx) qua hệ thống E-Office.',
    status: 'upcoming',
    badgeText: 'Sắp tới hạn'
  }
];
