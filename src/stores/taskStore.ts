import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Task, Priority, TaskStatus, SearchParams } from '@/types'
import { StorageService } from '@/utils/storage'
import { DateUtils } from '@/utils/date'

export const useTaskStore = defineStore('task', () => {
  // 状态
  const tasks = ref<Task[]>([])
  const selectedDate = ref<string>(DateUtils.getToday())
  const searchKeyword = ref<string>('')

  // 计算属性
  const todayTasks = computed(() => {
    return tasks.value.filter(task => 
      task.due_date === DateUtils.getToday() && task.status === 'pending'
    )
  })

  const selectedDateTasks = computed(() => {
    return tasks.value.filter(task => 
      task.due_date === selectedDate.value && task.status === 'pending'
    )
  })

  const completedTasks = computed(() => {
    return tasks.value.filter(task => task.status === 'completed')
      .sort((a, b) => {
        const aTime = new Date(a.completed_at || a.created_at).getTime()
        const bTime = new Date(b.completed_at || b.created_at).getTime()
        return bTime - aTime // 按完成时间倒序
      })
  })

  const overdueTasks = computed(() => {
    const today = DateUtils.getToday()
    return tasks.value.filter(task => 
      task.status === 'pending' && task.due_date < today
    )
  })

  const tasksByPriority = computed(() => {
    const priorityOrder: Priority[] = ['S', 'A', 'B', 'C', 'D']
    return selectedDateTasks.value.sort((a, b) => {
      return priorityOrder.indexOf(a.priority) - priorityOrder.indexOf(b.priority)
    })
  })

  // 方法
  const loadTasks = () => {
    tasks.value = StorageService.getTasks()
  }

  const createTask = (taskData: Omit<Task, 'id' | 'created_at' | 'status'>) => {
    const newTask: Task = {
      ...taskData,
      id: StorageService.generateId(),
      status: 'pending',
      created_at: DateUtils.formatDateTime(new Date())
    }
    
    tasks.value.push(newTask)
    StorageService.addTask(newTask)
    return newTask
  }

  const updateTask = (taskId: string, updates: Partial<Task>) => {
    const index = tasks.value.findIndex(task => task.id === taskId)
    if (index !== -1) {
      tasks.value[index] = { ...tasks.value[index], ...updates }
      StorageService.updateTask(taskId, updates)
    }
  }

  const deleteTask = (taskId: string) => {
    const index = tasks.value.findIndex(task => task.id === taskId)
    if (index !== -1) {
      tasks.value.splice(index, 1)
      StorageService.deleteTask(taskId)
    }
  }

  const completeTask = (taskId: string) => {
    const updates = {
      status: 'completed' as TaskStatus,
      completed_at: DateUtils.formatDateTime(new Date())
    }
    updateTask(taskId, updates)
  }

  const uncompleteTask = (taskId: string) => {
    const updates = {
      status: 'pending' as TaskStatus,
      completed_at: undefined
    }
    updateTask(taskId, updates)
  }

  const searchTasks = (params: SearchParams) => {
    let filteredTasks = tasks.value

    // 关键词搜索
    if (params.keyword) {
      const keyword = params.keyword.toLowerCase()
      filteredTasks = filteredTasks.filter(task => 
        task.title.toLowerCase().includes(keyword) ||
        task.description.toLowerCase().includes(keyword)
      )
    }

    // 日期范围筛选
    if (params.startDate && params.endDate) {
      filteredTasks = filteredTasks.filter(task => 
        task.due_date >= params.startDate! && task.due_date <= params.endDate!
      )
    }

    // 优先级筛选
    if (params.priority) {
      filteredTasks = filteredTasks.filter(task => task.priority === params.priority)
    }

    // 状态筛选
    if (params.status) {
      filteredTasks = filteredTasks.filter(task => task.status === params.status)
    }

    return filteredTasks
  }

  const getTasksByDateRange = (startDate: string, endDate: string) => {
    return tasks.value.filter(task => 
      task.due_date >= startDate && task.due_date <= endDate
    )
  }

  const getTaskCountByDate = (date: string) => {
    return tasks.value.filter(task => 
      task.due_date === date && task.status === 'pending'
    ).length
  }

  const setSelectedDate = (date: string) => {
    selectedDate.value = date
  }

  const setSearchKeyword = (keyword: string) => {
    searchKeyword.value = keyword
  }

  // 获取优先级颜色
  const getPriorityColor = (priority: Priority): string => {
    const colors = {
      S: '#f56c6c', // 红色
      A: '#e6a23c', // 橙色
      B: '#409eff', // 蓝色
      C: '#67c23a', // 绿色
      D: '#909399'  // 灰色
    }
    return colors[priority]
  }

  // 获取优先级标签
  const getPriorityLabel = (priority: Priority): string => {
    const labels = {
      S: '紧急重要',
      A: '重要不紧急',
      B: '紧急不重要',
      C: '一般',
      D: '低优先级'
    }
    return labels[priority]
  }

  return {
    // 状态
    tasks,
    selectedDate,
    searchKeyword,
    
    // 计算属性
    todayTasks,
    selectedDateTasks,
    completedTasks,
    overdueTasks,
    tasksByPriority,
    
    // 方法
    loadTasks,
    createTask,
    updateTask,
    deleteTask,
    completeTask,
    uncompleteTask,
    searchTasks,
    getTasksByDateRange,
    getTaskCountByDate,
    setSelectedDate,
    setSearchKeyword,
    getPriorityColor,
    getPriorityLabel
  }
})