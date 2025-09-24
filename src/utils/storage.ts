import type { Task, BusinessData, Project, ProjectTask, TeamMember, ProjectStats, TaskStats } from '@/types'

// 笔记接口定义
export interface Note {
  id: string
  title: string
  content: string
  category: string
  createdAt: Date
  updatedAt: Date
}

// 存储键名常量
const STORAGE_KEYS = {
  TASKS: 'personal_efficiency_tasks',
  BUSINESS_DATA: 'personal_efficiency_business_data',
  NOTES: 'personal_efficiency_notes',
  PROJECTS: 'personal_efficiency_projects',
  PROJECT_TASKS: 'personal_efficiency_project_tasks',
  TEAM_MEMBERS: 'personal_efficiency_team_members'
}

// 数据保存期限（2年，以毫秒为单位）
const DATA_RETENTION_PERIOD = 2 * 365 * 24 * 60 * 60 * 1000

/**
 * 本地存储工具类
 */
export class StorageService {
  /**
   * 清理过期数据
   */
  private static cleanExpiredData() {
    const now = Date.now()
    const cutoffDate = now - DATA_RETENTION_PERIOD

    // 清理过期任务 - 直接从localStorage读取，避免递归调用
    const tasksData = localStorage.getItem(STORAGE_KEYS.TASKS)
    const tasks = tasksData ? JSON.parse(tasksData) : []
    const validTasks = tasks.filter((task: any) => {
      const createdAt = new Date(task.created_at).getTime()
      return createdAt > cutoffDate
    })
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(validTasks))

    // 清理过期业务数据 - 直接从localStorage读取，避免递归调用
    const businessDataRaw = localStorage.getItem(STORAGE_KEYS.BUSINESS_DATA)
    const businessData = businessDataRaw ? JSON.parse(businessDataRaw) : []
    const validBusinessData = businessData.filter((data: any) => {
      const createdAt = new Date(data.created_at).getTime()
      return createdAt > cutoffDate
    })
    localStorage.setItem(STORAGE_KEYS.BUSINESS_DATA, JSON.stringify(validBusinessData))

    // 清理过期笔记 - 直接从localStorage读取，避免递归调用
    const notesData = localStorage.getItem(STORAGE_KEYS.NOTES)
    const notes = notesData ? JSON.parse(notesData) : []
    const validNotes = notes.filter((note: any) => {
      const createdAt = new Date(note.createdAt).getTime()
      return createdAt > cutoffDate
    })
    localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(validNotes))

    // 清理过期项目数据 - 直接从localStorage读取，避免递归调用
    const projectsData = localStorage.getItem(STORAGE_KEYS.PROJECTS)
    const projects = projectsData ? JSON.parse(projectsData) : []
    const validProjects = projects.filter((project: any) => {
      const createdAt = new Date(project.createdAt).getTime()
      return createdAt > cutoffDate
    })
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(validProjects))

    // 清理过期项目任务数据 - 直接从localStorage读取，避免递归调用
    const projectTasksData = localStorage.getItem(STORAGE_KEYS.PROJECT_TASKS)
    const projectTasks = projectTasksData ? JSON.parse(projectTasksData) : []
    const validProjectTasks = projectTasks.filter((task: any) => {
      const createdAt = new Date(task.createdAt).getTime()
      return createdAt > cutoffDate
    })
    localStorage.setItem(STORAGE_KEYS.PROJECT_TASKS, JSON.stringify(validProjectTasks))

    // 清理过期团队成员数据 - 直接从localStorage读取，避免递归调用
    const teamMembersData = localStorage.getItem(STORAGE_KEYS.TEAM_MEMBERS)
    const teamMembers = teamMembersData ? JSON.parse(teamMembersData) : []
    const validTeamMembers = teamMembers.filter((member: any) => {
      const createdAt = new Date(member.createdAt).getTime()
      return createdAt > cutoffDate
    })
    localStorage.setItem(STORAGE_KEYS.TEAM_MEMBERS, JSON.stringify(validTeamMembers))
  }

  /**
   * 获取所有任务
   */
  static getTasks(): Task[] {
    try {
      this.cleanExpiredData()
      const data = localStorage.getItem(STORAGE_KEYS.TASKS)
      const tasks = data ? JSON.parse(data) : []
      return tasks
    } catch (error) {
      console.error('获取任务数据失败:', error)
      return []
    }
  }

  /**
   * 保存任务
   */
  static saveTasks(tasks: Task[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks))
    } catch (error) {
      console.error('保存任务数据失败:', error)
    }
  }

  /**
   * 添加任务
   */
  static addTask(task: Task): void {
    const tasks = this.getTasks()
    tasks.push(task)
    this.saveTasks(tasks)
  }

  /**
   * 更新任务
   */
  static updateTask(taskId: string, updates: Partial<Task>): void {
    const tasks = this.getTasks()
    const index = tasks.findIndex(task => task.id === taskId)
    if (index !== -1) {
      tasks[index] = { ...tasks[index], ...updates }
      this.saveTasks(tasks)
    }
  }

  /**
   * 删除任务
   */
  static deleteTask(taskId: string): void {
    const tasks = this.getTasks()
    const filteredTasks = tasks.filter(task => task.id !== taskId)
    this.saveTasks(filteredTasks)
  }

  /**
   * 根据日期获取任务
   */
  static getTasksByDate(date: string): Task[] {
    const tasks = this.getTasks()
    return tasks.filter(task => task.due_date === date)
  }

  /**
   * 搜索任务
   */
  static searchTasks(keyword: string): Task[] {
    const tasks = this.getTasks()
    const lowerKeyword = keyword.toLowerCase()
    return tasks.filter(task => 
      task.title.toLowerCase().includes(lowerKeyword) ||
      task.description.toLowerCase().includes(lowerKeyword)
    )
  }

  /**
   * 获取所有业务数据
   */
  static getBusinessData(): BusinessData[] {
    try {
      this.cleanExpiredData()
      const data = localStorage.getItem(STORAGE_KEYS.BUSINESS_DATA)
      const businessData = data ? JSON.parse(data) : []
      return businessData
    } catch (error) {
      console.error('获取业务数据失败:', error)
      return []
    }
  }

  /**
   * 保存业务数据
   */
  static saveBusinessData(data: BusinessData[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.BUSINESS_DATA, JSON.stringify(data))
    } catch (error) {
      console.error('保存业务数据失败:', error)
    }
  }

  /**
   * 添加业务数据
   */
  static addBusinessData(data: BusinessData): void {
    const businessData = this.getBusinessData()
    // 检查是否已存在相同日期的数据
    const existingIndex = businessData.findIndex(item => item.date === data.date)
    if (existingIndex !== -1) {
      // 更新现有数据
      businessData[existingIndex] = data
    } else {
      // 添加新数据
      businessData.push(data)
    }
    this.saveBusinessData(businessData)
  }

  /**
   * 根据日期范围获取业务数据
   */
  static getBusinessDataByDateRange(startDate: string, endDate: string): BusinessData[] {
    const businessData = this.getBusinessData()
    return businessData.filter(data => 
      data.date >= startDate && data.date <= endDate
    ).sort((a, b) => a.date.localeCompare(b.date))
  }

  /**
   * 获取所有笔记
   */
  static getNotes(): Note[] {
    try {
      this.cleanExpiredData()
      const data = localStorage.getItem(STORAGE_KEYS.NOTES)
      const notes = data ? JSON.parse(data) : []
      return notes.map((note: any) => ({
        ...note,
        createdAt: new Date(note.createdAt),
        updatedAt: new Date(note.updatedAt)
      }))
    } catch (error) {
      console.error('获取笔记失败:', error)
      return []
    }
  }

  /**
   * 保存所有笔记
   */
  static saveNotes(notes: Note[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes))
    } catch (error) {
      console.error('保存笔记失败:', error)
    }
  }

  /**
   * 添加新笔记
   */
  static addNote(note: Note): void {
    const notes = this.getNotes()
    notes.unshift(note)
    this.saveNotes(notes)
  }

  /**
   * 更新笔记
   */
  static updateNote(noteId: string, updates: Partial<Note>): void {
    const notes = this.getNotes()
    const index = notes.findIndex(note => note.id === noteId)
    if (index !== -1) {
      notes[index] = { ...notes[index], ...updates, updatedAt: new Date() }
      this.saveNotes(notes)
    }
  }

  /**
   * 删除笔记
   */
  static deleteNote(noteId: string): void {
    const notes = this.getNotes().filter(note => note.id !== noteId)
    this.saveNotes(notes)
  }

  /**
   * 搜索笔记
   */
  static searchNotes(keyword: string): Note[] {
    const notes = this.getNotes()
    const lowerKeyword = keyword.toLowerCase()
    return notes.filter(note => 
      note.title.toLowerCase().includes(lowerKeyword) ||
      note.content.toLowerCase().includes(lowerKeyword)
    )
  }

  /**
   * 按分类获取笔记
   */
  static getNotesByCategory(category: string): Note[] {
    return this.getNotes().filter(note => note.category === category)
  }

  /**
   * 生成唯一ID
   */
  static generateId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9)
  }

  // ==================== 项目管理存储方法 ====================

  /**
   * 获取所有项目
   */
  static getProjects(): Project[] {
    try {
      this.cleanExpiredData()
      const data = localStorage.getItem(STORAGE_KEYS.PROJECTS)
      const projects = data ? JSON.parse(data) : []
      return projects
    } catch (error) {
      console.error('获取项目数据失败:', error)
      return []
    }
  }

  /**
   * 保存所有项目
   */
  static saveProjects(projects: Project[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects))
    } catch (error) {
      console.error('保存项目数据失败:', error)
    }
  }

  /**
   * 添加项目
   */
  static addProject(project: Project): void {
    const projects = this.getProjects()
    projects.push(project)
    this.saveProjects(projects)
  }

  /**
   * 更新项目
   */
  static updateProject(projectId: string, updates: Partial<Project>): void {
    const projects = this.getProjects()
    const index = projects.findIndex(project => project.id === projectId)
    if (index !== -1) {
      projects[index] = { ...projects[index], ...updates, updatedAt: new Date().toISOString() }
      this.saveProjects(projects)
    }
  }

  /**
   * 删除项目
   */
  static deleteProject(projectId: string): void {
    const projects = this.getProjects().filter(project => project.id !== projectId)
    this.saveProjects(projects)
  }

  /**
   * 获取所有项目任务
   */
  static getProjectTasks(): ProjectTask[] {
    try {
      this.cleanExpiredData()
      const data = localStorage.getItem(STORAGE_KEYS.PROJECT_TASKS)
      const tasks = data ? JSON.parse(data) : []
      return tasks
    } catch (error) {
      console.error('获取项目任务数据失败:', error)
      return []
    }
  }

  /**
   * 保存所有项目任务
   */
  static saveProjectTasks(tasks: ProjectTask[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.PROJECT_TASKS, JSON.stringify(tasks))
    } catch (error) {
      console.error('保存项目任务数据失败:', error)
    }
  }

  /**
   * 添加项目任务
   */
  static addProjectTask(task: ProjectTask): void {
    const tasks = this.getProjectTasks()
    tasks.push(task)
    this.saveProjectTasks(tasks)
  }

  /**
   * 更新项目任务
   */
  static updateProjectTask(taskId: string, updates: Partial<ProjectTask>): void {
    const tasks = this.getProjectTasks()
    const index = tasks.findIndex(task => task.id === taskId)
    if (index !== -1) {
      tasks[index] = { ...tasks[index], ...updates, updatedAt: new Date().toISOString() }
      this.saveProjectTasks(tasks)
    }
  }

  /**
   * 删除项目任务
   */
  static deleteProjectTask(taskId: string): void {
    const tasks = this.getProjectTasks().filter(task => task.id !== taskId)
    this.saveProjectTasks(tasks)
  }

  /**
   * 根据项目ID获取任务
   */
  static getTasksByProjectId(projectId: string): ProjectTask[] {
    const tasks = this.getProjectTasks()
    return tasks.filter(task => task.projectId === projectId)
  }

  /**
   * 根据成员ID获取任务
   */
  static getTasksByAssignee(assigneeId: string): ProjectTask[] {
    const tasks = this.getProjectTasks()
    return tasks.filter(task => task.assignee === assigneeId)
  }

  /**
   * 获取所有团队成员
   */
  static getTeamMembers(): TeamMember[] {
    try {
      this.cleanExpiredData()
      const data = localStorage.getItem(STORAGE_KEYS.TEAM_MEMBERS)
      const members = data ? JSON.parse(data) : []
      return members
    } catch (error) {
      console.error('获取团队成员数据失败:', error)
      return []
    }
  }

  /**
   * 保存所有团队成员
   */
  static saveTeamMembers(members: TeamMember[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.TEAM_MEMBERS, JSON.stringify(members))
    } catch (error) {
      console.error('保存团队成员数据失败:', error)
    }
  }

  /**
   * 添加团队成员
   */
  static addTeamMember(member: TeamMember): void {
    const members = this.getTeamMembers()
    members.push(member)
    this.saveTeamMembers(members)
  }

  /**
   * 更新团队成员
   */
  static updateTeamMember(memberId: string, updates: Partial<TeamMember>): void {
    const members = this.getTeamMembers()
    const index = members.findIndex(member => member.id === memberId)
    if (index !== -1) {
      members[index] = { ...members[index], ...updates }
      this.saveTeamMembers(members)
    }
  }

  /**
   * 删除团队成员
   */
  static deleteTeamMember(memberId: string): void {
    const members = this.getTeamMembers().filter(member => member.id !== memberId)
    this.saveTeamMembers(members)
  }

  /**
   * 获取项目统计信息
   */
  static getProjectStats(): ProjectStats {
    const projects = this.getProjects()
    const tasks = this.getProjectTasks()
    const members = this.getTeamMembers()

    return {
      totalProjects: projects.length,
      activeProjects: projects.filter(p => p.status === 'in_progress').length,
      completedProjects: projects.filter(p => p.status === 'completed').length,
      totalTasks: tasks.length,
      completedTasks: tasks.filter(t => t.status === 'completed').length,
      teamMembers: members.length
    }
  }

  /**
   * 获取任务统计信息
   */
  static getTaskStats(): TaskStats {
    const tasks = this.getProjectTasks()
    const now = new Date().toISOString().split('T')[0]

    return {
      todo: tasks.filter(t => t.status === 'todo').length,
      inProgress: tasks.filter(t => t.status === 'in_progress').length,
      completed: tasks.filter(t => t.status === 'completed').length,
      overdue: tasks.filter(t => t.status !== 'completed' && t.dueDate < now).length
    }
  }

  /**
   * 搜索项目
   */
  static searchProjects(keyword: string): Project[] {
    const projects = this.getProjects()
    const lowerKeyword = keyword.toLowerCase()
    return projects.filter(project => 
      project.name.toLowerCase().includes(lowerKeyword) ||
      project.description.toLowerCase().includes(lowerKeyword)
    )
  }

  /**
   * 搜索项目任务
   */
  static searchProjectTasks(keyword: string): ProjectTask[] {
    const tasks = this.getProjectTasks()
    const lowerKeyword = keyword.toLowerCase()
    return tasks.filter(task => 
      task.title.toLowerCase().includes(lowerKeyword) ||
      (task.description && task.description.toLowerCase().includes(lowerKeyword))
    )
  }

  /**
   * 搜索团队成员
   */
  static searchTeamMembers(keyword: string): TeamMember[] {
    const members = this.getTeamMembers()
    const lowerKeyword = keyword.toLowerCase()
    return members.filter(member => 
      member.name.toLowerCase().includes(lowerKeyword) ||
      member.email.toLowerCase().includes(lowerKeyword)
    )
  }
}