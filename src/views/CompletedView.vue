<template>
  <div class="completed-view">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>已完成任务</span>
          <div class="header-actions">
            <el-date-picker
              v-model="dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              @change="handleDateRangeChange"
              style="margin-right: 10px"
            />
            <el-input
              v-model="searchKeyword"
              placeholder="搜索已完成任务..."
              style="width: 200px; margin-right: 10px"
              clearable
              @input="handleSearch"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
            <el-button @click="clearFilters">
              <el-icon><Refresh /></el-icon>
              清除筛选
            </el-button>
          </div>
        </div>
      </template>

      <!-- 统计信息 -->
      <div class="stats-section">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-statistic title="总完成任务" :value="filteredTasks.length" />
          </el-col>
          <el-col :span="6">
            <el-statistic title="本周完成" :value="thisWeekCompletedCount" />
          </el-col>
          <el-col :span="6">
            <el-statistic title="本月完成" :value="thisMonthCompletedCount" />
          </el-col>
          <el-col :span="6">
            <el-statistic title="完成率" :value="completionRate" suffix="%" :precision="1" />
          </el-col>
        </el-row>
      </div>

      <!-- 任务列表 -->
      <div class="task-list">
        <div v-if="filteredTasks.length === 0" class="empty-state">
          <el-empty description="暂无已完成任务" />
        </div>
        
        <div v-else>
          <!-- 按日期分组显示 -->
          <div v-for="(tasks, date) in groupedTasks" :key="date" class="date-group">
            <div class="date-header">
              <h3>{{ formatDateHeader(date) }}</h3>
              <el-tag size="small">{{ tasks.length }} 个任务</el-tag>
            </div>
            
            <div class="tasks-in-date">
              <div 
                v-for="task in tasks" 
                :key="task.id" 
                class="task-item"
              >
                <div class="task-content">
                  <div class="task-header">
                    <el-icon class="completed-icon"><Check /></el-icon>
                    <el-tag 
                      :color="getPriorityColor(task.priority)"
                      size="small"
                      class="priority-tag"
                    >
                      {{ task.priority }}
                    </el-tag>
                    <span class="task-title">{{ task.title }}</span>
                    <div class="task-actions">
                      <el-button 
                        type="text" 
                        size="small" 
                        @click="viewTaskDetail(task)"
                      >
                        <el-icon><View /></el-icon>
                        查看
                      </el-button>
                      <el-button 
                        type="text" 
                        size="small" 
                        @click="restoreTask(task)"
                      >
                        <el-icon><RefreshLeft /></el-icon>
                        恢复
                      </el-button>
                      <el-button 
                        type="text" 
                        size="small" 
                        @click="deleteTask(task.id)"
                      >
                        <el-icon><Delete /></el-icon>
                        删除
                      </el-button>
                    </div>
                  </div>
                  
                  <div v-if="task.description" class="task-description">
                    {{ task.description }}
                  </div>
                  
                  <div class="task-meta">
                    <span class="due-date">
                      <el-icon><Calendar /></el-icon>
                      截止: {{ formatDate(task.due_date) }}
                    </span>
                    <span class="completed-time">
                      <el-icon><Clock /></el-icon>
                      完成: {{ formatDateTime(task.completed_at) }}
                    </span>
                    <span class="priority-label">
                      {{ getPriorityLabel(task.priority) }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 分页 -->
      <div class="pagination" v-if="filteredTasks.length > pageSize">
        <el-pagination
          v-model:current-page="currentPage"
          :page-size="pageSize"
          :total="filteredTasks.length"
          layout="total, prev, pager, next, jumper"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>

    <!-- 任务详情对话框 -->
    <el-dialog 
      v-model="showDetailDialog" 
      title="任务详情"
      width="500px"
    >
      <div v-if="selectedTask" class="task-detail">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="任务标题">
            {{ selectedTask.title }}
          </el-descriptions-item>
          <el-descriptions-item label="任务描述">
            {{ selectedTask.description || '无描述' }}
          </el-descriptions-item>
          <el-descriptions-item label="优先级">
            <el-tag :color="getPriorityColor(selectedTask.priority)" size="small">
              {{ selectedTask.priority }} - {{ getPriorityLabel(selectedTask.priority) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="截止日期">
            {{ formatDate(selectedTask.due_date) }}
          </el-descriptions-item>
          <el-descriptions-item label="创建时间">
            {{ formatDateTime(selectedTask.created_at) }}
          </el-descriptions-item>
          <el-descriptions-item label="完成时间">
            {{ formatDateTime(selectedTask.completed_at) }}
          </el-descriptions-item>
          <el-descriptions-item label="任务状态">
            <el-tag type="success">已完成</el-tag>
          </el-descriptions-item>
        </el-descriptions>
      </div>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showDetailDialog = false">关闭</el-button>
          <el-button type="warning" @click="restoreTask(selectedTask!)">
            <el-icon><RefreshLeft /></el-icon>
            恢复任务
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Search, 
  Refresh, 
  Check, 
  View, 
  RefreshLeft, 
  Delete, 
  Calendar, 
  Clock 
} from '@element-plus/icons-vue'
import { useTaskStore } from '@/stores/taskStore'
import { DateUtils } from '@/utils/date'
import type { Task, Priority } from '@/types'

const taskStore = useTaskStore()

// 响应式数据
const dateRange = ref<[string, string] | null>(null)
const searchKeyword = ref('')
const currentPage = ref(1)
const pageSize = ref(20)
const showDetailDialog = ref(false)
const selectedTask = ref<Task | null>(null)

// 计算属性
const filteredTasks = computed(() => {
  let tasks = taskStore.completedTasks
  
  // 日期范围筛选
  if (dateRange.value) {
    const [startDate, endDate] = dateRange.value
    tasks = tasks.filter(task => {
      const completedDate = task.completed_at ? 
        DateUtils.formatDate(task.completed_at) : 
        DateUtils.formatDate(task.created_at)
      return completedDate >= startDate && completedDate <= endDate
    })
  }
  
  // 关键词搜索
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    tasks = tasks.filter(task => 
      task.title.toLowerCase().includes(keyword) ||
      task.description.toLowerCase().includes(keyword)
    )
  }
  
  return tasks
})

const paginatedTasks = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredTasks.value.slice(start, end)
})

const groupedTasks = computed(() => {
  const groups: { [key: string]: Task[] } = {}
  
  paginatedTasks.value.forEach(task => {
    const completedDate = task.completed_at ? 
      DateUtils.formatDate(task.completed_at) : 
      DateUtils.formatDate(task.created_at)
    
    if (!groups[completedDate]) {
      groups[completedDate] = []
    }
    groups[completedDate].push(task)
  })
  
  // 按日期倒序排列
  const sortedGroups: { [key: string]: Task[] } = {}
  Object.keys(groups)
    .sort((a, b) => b.localeCompare(a))
    .forEach(date => {
      sortedGroups[date] = groups[date]
    })
  
  return sortedGroups
})

const thisWeekCompletedCount = computed(() => {
  const { start, end } = DateUtils.getThisWeek()
  return taskStore.completedTasks.filter(task => {
    const completedDate = task.completed_at ? 
      DateUtils.formatDate(task.completed_at) : 
      DateUtils.formatDate(task.created_at)
    return completedDate >= start && completedDate <= end
  }).length
})

const thisMonthCompletedCount = computed(() => {
  const { start, end } = DateUtils.getThisMonth()
  return taskStore.completedTasks.filter(task => {
    const completedDate = task.completed_at ? 
      DateUtils.formatDate(task.completed_at) : 
      DateUtils.formatDate(task.created_at)
    return completedDate >= start && completedDate <= end
  }).length
})

const completionRate = computed(() => {
  const totalTasks = taskStore.tasks.length
  const completedTasks = taskStore.completedTasks.length
  return totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0
})

// 方法
const handleDateRangeChange = () => {
  currentPage.value = 1
}

const handleSearch = () => {
  currentPage.value = 1
}

const handlePageChange = (page: number) => {
  currentPage.value = page
}

const clearFilters = () => {
  dateRange.value = null
  searchKeyword.value = ''
  currentPage.value = 1
}

const viewTaskDetail = (task: Task) => {
  selectedTask.value = task
  showDetailDialog.value = true
}

const restoreTask = async (task: Task) => {
  try {
    await ElMessageBox.confirm('确定要恢复这个任务吗？', '确认恢复', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    taskStore.uncompleteTask(task.id)
    ElMessage.success('任务已恢复')
    showDetailDialog.value = false
  } catch {
    // 用户取消恢复
  }
}

const deleteTask = async (taskId: string) => {
  try {
    await ElMessageBox.confirm('确定要永久删除这个任务吗？此操作不可恢复！', '确认删除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'error'
    })
    
    taskStore.deleteTask(taskId)
    ElMessage.success('任务已删除')
  } catch {
    // 用户取消删除
  }
}

const formatDate = (date: string) => {
  return DateUtils.getFriendlyDate(date)
}

const formatDateTime = (datetime?: string) => {
  if (!datetime) return '未知'
  const date = new Date(datetime)
  return date.toLocaleString('zh-CN')
}

const formatDateHeader = (date: string | number) => {
  const dateStr = String(date)
  const friendlyDate = DateUtils.getFriendlyDate(dateStr)
  const dayOfWeek = new Date(dateStr).toLocaleDateString('zh-CN', { weekday: 'long' })
  return `${friendlyDate} (${dayOfWeek})`
}

const getPriorityColor = (priority: Priority) => {
  return taskStore.getPriorityColor(priority)
}

const getPriorityLabel = (priority: Priority) => {
  return taskStore.getPriorityLabel(priority)
}

// 生命周期
onMounted(() => {
  taskStore.loadTasks()
})
</script>

<style scoped>
.completed-view {
  padding: 0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions {
  display: flex;
  align-items: center;
}

.stats-section {
  margin-bottom: 24px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 6px;
}

.task-list {
  max-height: calc(100vh - 400px);
  overflow-y: auto;
}

.date-group {
  margin-bottom: 24px;
}

.date-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 2px solid #e4e7ed;
}

.date-header h3 {
  margin: 0;
  color: #303133;
  font-size: 16px;
}

.tasks-in-date {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.task-item {
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  padding: 12px;
  background: #fff;
  transition: all 0.3s;
}

.task-item:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.task-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.completed-icon {
  color: #67c23a;
  font-size: 16px;
}

.priority-tag {
  color: #fff;
  border: none;
  font-weight: bold;
  min-width: 24px;
  text-align: center;
}

.task-title {
  flex: 1;
  font-weight: 500;
  color: #606266;
}

.task-actions {
  display: flex;
  gap: 4px;
}

.task-description {
  color: #606266;
  font-size: 14px;
  margin-bottom: 8px;
  line-height: 1.4;
}

.task-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #909399;
  flex-wrap: wrap;
  gap: 8px;
}

.due-date,
.completed-time {
  display: flex;
  align-items: center;
  gap: 4px;
}

.priority-label {
  font-size: 12px;
}

.empty-state {
  text-align: center;
  padding: 40px 0;
}

.pagination {
  margin-top: 24px;
  text-align: center;
}

.task-detail {
  padding: 16px 0;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .header-actions {
    flex-direction: column;
    gap: 8px;
    align-items: stretch;
  }
  
  .header-actions > * {
    width: 100%;
  }
  
  .stats-section :deep(.el-row) {
    flex-direction: column;
  }
  
  .stats-section :deep(.el-col) {
    width: 100% !important;
    margin-bottom: 8px;
  }
  
  .task-meta {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .task-actions {
    flex-wrap: wrap;
  }
}
</style>