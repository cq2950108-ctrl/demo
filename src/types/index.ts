// 任务优先级类型
export type Priority = 'S' | 'A' | 'B' | 'C' | 'D'

// 任务状态类型
export type TaskStatus = 'pending' | 'completed'

// 任务接口
export interface Task {
  id: string
  title: string
  description: string
  due_date: string // YYYY-MM-DD格式
  priority: Priority
  status: TaskStatus
  created_at: string // ISO日期字符串
  completed_at?: string // ISO日期字符串
  confirmed?: boolean // 人工确认标记，用于已完成任务的二次确认
  confirmed_at?: string // 确认时间
}

// 业务数据接口
export interface BusinessData {
  id: string
  date: string // YYYY-MM-DD格式
  transaction_count: number // 成交数量
  transaction_amount: number // 成交金额
  conversion_cost: number // 转化成本
  exposure_count: number // 曝光量
  conversion_rate: number // 转化率
  created_at: string // ISO日期字符串
}

// 图表数据类型
export interface ChartData {
  date: string
  value: number
  label?: string
}

// 时间维度类型
export type TimePeriod = 'day' | 'week' | 'month' | 'custom'

// 图表类型
export type ChartType = 'transaction_count' | 'transaction_amount' | 'conversion_cost' | 'exposure_count' | 'conversion_rate'

// 搜索参数接口
export interface SearchParams {
  keyword?: string
  startDate?: string
  endDate?: string
  priority?: Priority
  status?: TaskStatus
}

// 分析参数接口
export interface AnalyticsParams {
  startDate: string
  endDate: string
  chartType: ChartType
  period: TimePeriod
}

// 在线文档类型
export type DocumentType = 'google_sheets' | 'tencent_docs' | 'feishu_sheets' | 'dingtalk_sheets'

// 在线文档配置接口
export interface DocumentConfig {
  id: string
  name: string // 配置名称
  type: DocumentType
  url: string // 文档链接
  apiKey?: string // API密钥
  accessToken?: string // 访问令牌
  refreshToken?: string // 刷新令牌
  sheetId?: string // 工作表ID
  range?: string // 数据范围，如 'A1:G100'
  isActive: boolean // 是否启用
  autoSync: boolean // 是否自动同步
  syncInterval: number // 同步间隔（分钟）
  lastSyncTime?: string // 最后同步时间
  created_at: string
  updated_at: string
}

// 数据同步状态
export type SyncStatus = 'idle' | 'syncing' | 'success' | 'error'

// 数据同步记录接口
export interface SyncRecord {
  id: string
  configId: string // 关联的文档配置ID
  status: SyncStatus
  startTime: string
  endTime?: string
  recordsCount: number // 同步的记录数
  errorMessage?: string
  created_at: string
}

// 表格导出配置接口
export interface ExportConfig {
  format: 'xlsx' | 'csv' | 'json'
  filename?: string
  includeHeaders: boolean
  dateRange?: {
    startDate: string
    endDate: string
  }
  columns?: string[] // 要导出的列
}

// API响应接口
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

// 项目管理类型定义

// 项目状态类型
export type ProjectStatus = 'not_started' | 'in_progress' | 'completed' | 'paused'

// 任务状态类型（项目管理）
export type ProjectTaskStatus = 'todo' | 'in_progress' | 'completed' | 'overdue'

// 任务优先级类型（项目管理）
export type ProjectTaskPriority = 'high' | 'medium' | 'low'

// 团队成员角色类型
export type TeamMemberRole = 'admin' | 'member' | 'viewer'

// 项目接口
export interface Project {
  id: string
  name: string
  description: string
  status: ProjectStatus
  startDate: string // YYYY-MM-DD格式
  endDate: string // YYYY-MM-DD格式
  teamMembers: string[] // 成员ID列表
  totalTasks: number
  completedTasks: number
  createdAt: string // ISO日期字符串
  updatedAt: string // ISO日期字符串
}

// 项目任务接口
export interface ProjectTask {
  id: string
  title: string
  description?: string
  projectId: string
  projectName: string
  assignee: string // 分配给的成员ID
  priority: ProjectTaskPriority
  status: ProjectTaskStatus
  dueDate: string // YYYY-MM-DD格式
  estimatedHours?: number // 预估工时
  actualHours?: number // 实际工时
  createdAt: string // ISO日期字符串
  updatedAt: string // ISO日期字符串
}

// 团队成员接口
export interface TeamMember {
  id: string
  name: string
  email: string
  avatar?: string
  role: TeamMemberRole
  projects: string[] // 参与的项目ID列表
  totalTasks: number
  createdAt: string // ISO日期字符串
}

// 项目统计接口
export interface ProjectStats {
  totalProjects: number
  activeProjects: number
  completedProjects: number
  totalTasks: number
  completedTasks: number
  teamMembers: number
}

// 任务统计接口
export interface TaskStats {
  todo: number
  inProgress: number
  completed: number
  overdue: number
}

// 项目搜索参数接口
export interface ProjectSearchParams {
  keyword?: string
  status?: ProjectStatus
  startDate?: string
  endDate?: string
  teamMember?: string
}

// 任务搜索参数接口
export interface TaskSearchParams {
  keyword?: string
  projectId?: string
  assignee?: string
  priority?: ProjectTaskPriority
  status?: ProjectTaskStatus
  dueDateFrom?: string
  dueDateTo?: string
}

// 团队搜索参数接口
export interface TeamSearchParams {
  keyword?: string
  role?: TeamMemberRole
}