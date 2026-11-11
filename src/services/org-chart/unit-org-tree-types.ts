/**
 * src/services/org-chart/unit-org-tree-types.ts
 * Định nghĩa cấu trúc dữ liệu cho Sơ đồ cây Vị trí việc làm & Danh mục công việc dự kiến
 */

export type UnitOrgNodeType = 'unit' | 'dean' | 'vice-dean' | 'position';

export interface ExpectedTaskItem {
  id: string;
  taskCode: string;
  taskName: string;
  missionCode?: string;
  missionName?: string;
  productName?: string;
  standardMinutes?: number;
  standardHoursYear?: number;
  method?: string;
  digitalImpact?: string;
  unitCode: string;
}

export interface UnitOrgNode {
  id: string;
  title: string;
  roleCode: string;
  nodeType: UnitOrgNodeType;
  levelLabel: string;
  careerLevel?: string;
  groupLabel?: string;
  personnelType?: string;
  workingRegime?: string;
  standardHoursYear?: number;
  expectedStaffCount: number;
  unitCode: string;
  unitNameVi: string;
  tasks: ExpectedTaskItem[];
  children: UnitOrgNode[];
}

export interface UnitOrgTreeData {
  unitCode: string;
  unitNameVi: string;
  unitGroup: string;
  unitGroupLabel: string;
  totalPositions: number;
  totalTasks: number;
  totalExpectedStaff: number;
  rootNode: UnitOrgNode;
}

