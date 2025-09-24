<template>
  <div class="todo-view">
    <!-- 装饰性背景图案 -->
    <div class="view-decorations">
      <div class="view-decoration view-decoration-1"></div>
      <div class="view-decoration view-decoration-2"></div>
      <div class="view-decoration view-decoration-3"></div>
      <div class="view-decoration view-decoration-4"></div>
    </div>
    <el-row :gutter="20">
      <!-- 左侧日历 -->
      <el-col :span="8">
        <el-card class="calendar-card">
          <template #header>
            <div class="card-header">
              <span>日历</span>
              <el-button type="primary" size="small" @click="showTaskDialog = true">
                <el-icon><Plus /></el-icon>
                新建任务
              </el-button>
            </div>
          </template>
          
          <el-calendar ref="calendarRef" v-model="selectedDate" @change="handleDateChange">
            <template #header="{ date }">
              <div class="calendar-header">
                <div class="month-navigation">
                  <el-button-group>
                    <el-button size="small" @click="selectDate('prev-year')">
                      <el-icon><DArrowLeft /></el-icon>
                    </el-button>
                    <el-button size="small" @click="selectDate('prev-month')">
                      <el-icon><ArrowLeft /></el-icon>
                    </el-button>
                    <el-button size="small" @click="selectDate('today')">今天</el-button>
                    <el-button size="small" @click="selectDate('next-month')">
                      <el-icon><ArrowRight /></el-icon>
                    </el-button>
                    <el-button size="small" @click="selectDate('next-year')">
                      <el-icon><DArrowRight /></el-icon>
                    </el-button>
                  </el-button-group>
                </div>
                <div class="current-month">
                  <span class="month-text">{{ formatCurrentMonth(date) }}</span>
                </div>
                <div class="month-slider">
                  <el-slider
                    v-model="currentMonthIndex"
                    :min="0"
                    :max="23"
                    :step="1"
                    :show-tooltip="false"
                    @change="handleMonthSliderChange"
                    style="width: 200px;"
                  />
                  <span class="slider-label">{{ getSliderLabel() }}</span>
                </div>
              </div>
            </template>
            <template #date-cell="{ data }">
              <div 
                class="calendar-cell" 
                :class="{
                  'is-selected': isDateSelected(data.day),
                  'is-today': isToday(data.day),
                  'has-tasks': getTaskCount(data.day) > 0,
                  'is-other-month': data.type !== 'current-month'
                }"
                @click="selectSpecificDate(data.day)"
              >
                <span class="date-number">{{ data.day.split('-').pop() }}</span>
                <div class="task-indicators">
                  <el-badge 
                    v-if="getTaskCount(data.day) > 0" 
                    :value="getTaskCount(data.day)" 
                    :max="99"
                    class="task-badge"
                  />
                </div>
              </div>
            </template>
          </el-calendar>
        </el-card>
      </el-col>

      <!-- 右侧任务列表 -->
      <el-col :span="16">
        <el-card class="task-list-card">
          <template #header>
            <div class="card-header">
              <span>{{ formatSelectedDate }} 的任务</span>
              <div class="header-actions">
                <el-input
                  v-model="searchKeyword"
                  placeholder="搜索任务..."
                  style="width: 200px; margin-right: 10px"
                  clearable
                  @input="handleSearch"
                >
                  <template #prefix>
                    <el-icon><Search /></el-icon>
                  </template>
                </el-input>
                <el-button type="primary" @click="showTaskDialog = true">
                  <el-icon><Plus /></el-icon>
                  添加任务
                </el-button>
              </div>
            </div>
          </template>

          <!-- 任务统计 -->
          <div class="task-stats" v-if="!searchKeyword">
            <el-tag v-if="overdueTasks.length > 0" type="danger" size="small">
              逾期任务: {{ overdueTasks.length }}
            </el-tag>
            <el-tag type="info" size="small">
              今日任务: {{ todayTaskCount }}
            </el-tag>
            <el-tag type="success" size="small">
              当前选中: {{ currentDateTasks.length }}
            </el-tag>
          </div>

          <!-- 任务列表 -->
          <div class="task-list">
            <div v-if="displayTasks.length === 0" class="empty-state">
              <el-empty description="暂无任务" />
            </div>
            
            <div v-else>
              <div 
                v-for="task in displayTasks" 
                :key="task.id" 
                class="task-item"
                :class="{ 'overdue': isOverdue(task.due_date) }"
              >
                <div class="task-content">
                  <div class="task-header">
                    <el-checkbox 
                      :model-value="task.status === 'completed'"
                      @change="toggleTaskStatus(task)"
                    />
                    <el-tag 
                      :color="getPriorityColor(task.priority)"
                      size="small"
                      class="priority-tag"
                    >
                      {{ task.priority }}
                    </el-tag>
                    <span class="task-title" :class="{ 'completed': task.status === 'completed' }">
                      {{ task.title }}
                    </span>
                    <div class="task-actions">
                      <el-button 
                        type="text" 
                        size="small" 
                        @click="editTask(task)"
                      >
                        <el-icon><Edit /></el-icon>
                      </el-button>
                      <el-button 
                        type="text" 
                        size="small" 
                        @click="deleteTask(task.id)"
                      >
                        <el-icon><Delete /></el-icon>
                      </el-button>
                    </div>
                  </div>
                  
                  <div v-if="task.description" class="task-description">
                    {{ task.description }}
                  </div>
                  
                  <div class="task-meta">
                    <span class="due-date">
                      <el-icon><Calendar /></el-icon>
                      {{ formatDate(task.due_date) }}
                    </span>
                    <span class="priority-label">
                      {{ getPriorityLabel(task.priority) }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 任务创建/编辑对话框 -->
    <el-dialog 
      v-model="showTaskDialog" 
      :title="editingTask ? '编辑任务' : '新建任务'"
      width="500px"
    >
      <el-form 
        ref="taskFormRef" 
        :model="taskForm" 
        :rules="taskFormRules" 
        label-width="80px"
      >
        <el-form-item label="任务标题" prop="title">
          <el-input v-model="taskForm.title" placeholder="请输入任务标题" />
        </el-form-item>
        
        <el-form-item label="任务描述" prop="description">
          <el-input 
            v-model="taskForm.description" 
            type="textarea" 
            :rows="3"
            placeholder="请输入任务描述（可选）"
          />
        </el-form-item>
        
        <el-form-item label="截止日期" prop="due_date">
          <el-date-picker
            v-model="taskForm.due_date"
            type="date"
            placeholder="选择截止日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>
        
        <el-form-item label="优先级" prop="priority">
          <el-select v-model="taskForm.priority" placeholder="选择优先级" style="width: 100%">
            <el-option label="S - 紧急重要" value="S" />
            <el-option label="A - 重要不紧急" value="A" />
            <el-option label="B - 紧急不重要" value="B" />
            <el-option label="C - 一般" value="C" />
            <el-option label="D - 低优先级" value="D" />
          </el-select>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showTaskDialog = false">取消</el-button>
          <el-button type="primary" @click="saveTask">保存</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search, Edit, Delete, Calendar, ArrowLeft, ArrowRight, DArrowLeft, DArrowRight } from '@element-plus/icons-vue'
import { useTaskStore } from '@/stores/taskStore'
import { DateUtils } from '@/utils/date'
import type { Task, Priority } from '@/types'

const taskStore = useTaskStore()

// 响应式数据
const selectedDate = ref(new Date())
const showTaskDialog = ref(false)
const editingTask = ref<Task | null>(null)
const searchKeyword = ref('')
const taskFormRef = ref()
const calendarRef = ref()
const currentMonthIndex = ref(getCurrentMonthIndex())

// 任务表单
const taskForm = reactive({
  title: '',
  description: '',
  due_date: '',
  priority: 'C' as Priority
})

// 表单验证规则
const taskFormRules = {
  title: [
    { required: true, message: '请输入任务标题', trigger: 'blur' }
  ],
  due_date: [
    { required: true, message: '请选择截止日期', trigger: 'change' }
  ],
  priority: [
    { required: true, message: '请选择优先级', trigger: 'change' }
  ]
}

// 计算属性
const formatSelectedDate = computed(() => {
  return DateUtils.getFriendlyDate(DateUtils.formatDate(selectedDate.value))
})

const currentDateTasks = computed(() => {
  const dateStr = DateUtils.formatDate(selectedDate.value)
  return taskStore.tasks.filter(task => 
    task.due_date === dateStr && task.status === 'pending'
  )
})

const todayTaskCount = computed(() => {
  return taskStore.todayTasks.length
})

const overdueTasks = computed(() => {
  return taskStore.overdueTasks
})

const displayTasks = computed(() => {
  if (searchKeyword.value) {
    return taskStore.searchTasks({ keyword: searchKeyword.value })
  }
  return [...currentDateTasks.value].sort((a, b) => {
    const priorityOrder: Priority[] = ['S', 'A', 'B', 'C', 'D']
    return priorityOrder.indexOf(a.priority) - priorityOrder.indexOf(b.priority)
  })
})

// 方法
const handleDateChange = (date: Date) => {
  const dateStr = DateUtils.formatDate(date)
  taskStore.setSelectedDate(dateStr)
}

const getTaskCount = (date: string) => {
  return taskStore.getTaskCountByDate(date)
}

const handleSearch = () => {
  taskStore.setSearchKeyword(searchKeyword.value)
}

const toggleTaskStatus = (task: Task) => {
  if (task.status === 'pending') {
    taskStore.completeTask(task.id)
    ElMessage.success('任务已完成')
  } else {
    taskStore.uncompleteTask(task.id)
    ElMessage.success('任务已恢复')
  }
}

const editTask = (task: Task) => {
  editingTask.value = task
  taskForm.title = task.title
  taskForm.description = task.description
  taskForm.due_date = task.due_date
  taskForm.priority = task.priority
  showTaskDialog.value = true
}

const deleteTask = async (taskId: string) => {
  try {
    await ElMessageBox.confirm('确定要删除这个任务吗？', '确认删除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    taskStore.deleteTask(taskId)
    ElMessage.success('任务已删除')
  } catch {
    // 用户取消删除
  }
}

const saveTask = async () => {
  try {
    await taskFormRef.value.validate()
    
    if (editingTask.value) {
      // 编辑任务
      taskStore.updateTask(editingTask.value.id, {
        title: taskForm.title,
        description: taskForm.description,
        due_date: taskForm.due_date,
        priority: taskForm.priority
      })
      ElMessage.success('任务已更新')
    } else {
      // 创建新任务
      taskStore.createTask({
        title: taskForm.title,
        description: taskForm.description,
        due_date: taskForm.due_date,
        priority: taskForm.priority
      })
      ElMessage.success('任务已创建')
    }
    
    resetForm()
    showTaskDialog.value = false
  } catch (error) {
    console.error('保存任务失败:', error)
  }
}

const resetForm = () => {
  taskForm.title = ''
  taskForm.description = ''
  taskForm.due_date = DateUtils.formatDate(selectedDate.value)
  taskForm.priority = 'C'
  editingTask.value = null
  taskFormRef.value?.clearValidate()
}

const formatDate = (date: string) => {
  return DateUtils.getFriendlyDate(date)
}

const isOverdue = (date: string) => {
  return DateUtils.isOverdue(date)
}

const getPriorityColor = (priority: Priority) => {
  return taskStore.getPriorityColor(priority)
}

const getPriorityLabel = (priority: Priority) => {
  return taskStore.getPriorityLabel(priority)
}

// 月份导航相关方法
function getCurrentMonthIndex(): number {
  const now = DateUtils.getBeijingTime()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth()
  const baseYear = currentYear - 1
  return (currentYear - baseYear) * 12 + currentMonth
}

const selectDate = (type: 'prev-year' | 'next-year' | 'prev-month' | 'next-month' | 'today') => {
  if (!calendarRef.value) return
  calendarRef.value.selectDate(type)
  updateMonthIndex()
}

const formatCurrentMonth = (date: Date | string) => {
  const dateObj = typeof date === 'string' ? DateUtils.getBeijingTime(date) : DateUtils.getBeijingTime(date)
  if (!dateObj || isNaN(dateObj.getTime())) {
    return DateUtils.getBeijingTime().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long' })
  }
  return dateObj.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long' })
}

const updateMonthIndex = () => {
  const current = selectedDate.value
  const currentYear = current.getFullYear()
  const currentMonth = current.getMonth()
  const baseYear = currentYear - 1
  currentMonthIndex.value = (currentYear - baseYear) * 12 + currentMonth
}

const handleMonthSliderChange = (value: number) => {
  const baseYear = DateUtils.getBeijingTime().getFullYear() - 1
  const targetYear = baseYear + Math.floor(value / 12)
  const targetMonth = value % 12
  
  const newDate = new Date(targetYear, targetMonth, 1)
  selectedDate.value = newDate
  handleDateChange(newDate)
}

const getSliderLabel = () => {
  const baseYear = DateUtils.getBeijingTime().getFullYear() - 1
  const targetYear = baseYear + Math.floor(currentMonthIndex.value / 12)
  const targetMonth = currentMonthIndex.value % 12
  const monthNames = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
  return `${targetYear}年${monthNames[targetMonth]}`
}

// 日期选择优化方法
const selectSpecificDate = (dateStr: string) => {
  const newDate = DateUtils.getBeijingTime(dateStr)
  selectedDate.value = newDate
  handleDateChange(newDate)
  updateMonthIndex()
}

const isDateSelected = (dateStr: string) => {
  const selectedDateStr = DateUtils.formatDate(selectedDate.value)
  return selectedDateStr === dateStr
}

const isToday = (dateStr: string) => {
  const today = DateUtils.getToday()
  return today === dateStr
}

// 生命周期
onMounted(() => {
  taskStore.loadTasks()
  taskForm.due_date = DateUtils.formatDate(selectedDate.value)
  updateMonthIndex()
})
</script>

<style scoped>
.todo-view {
  padding: 0;
  position: relative;
  overflow: hidden;
}

/* 装饰性背景图案 */
.view-decorations {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
}

.view-decoration {
  position: absolute;
  border-radius: 50%;
  opacity: 0.04;
  animation: todoFloat 35s infinite ease-in-out;
}

.view-decoration-1 {
  width: 280px;
  height: 280px;
  background: linear-gradient(45deg, #667eea, #764ba2);
  top: 10%;
  right: 8%;
  animation-delay: 0s;
}

.view-decoration-2 {
  width: 220px;
  height: 220px;
  background: linear-gradient(45deg, #ffecd2, #fcb69f);
  bottom: 20%;
  left: 5%;
  animation-delay: -12s;
}

.view-decoration-3 {
  width: 160px;
  height: 160px;
  background: linear-gradient(45deg, #a8edea, #fed6e3);
  top: 50%;
  left: 35%;
  animation-delay: -25s;
}

.view-decoration-4 {
  width: 190px;
  height: 190px;
  background: linear-gradient(45deg, #d299c2, #fef9d3);
  bottom: 5%;
  right: 25%;
  animation-delay: -8s;
}

@keyframes todoFloat {
  0%, 100% {
    transform: translateY(0px) rotate(0deg) scale(1);
  }
  20% {
    transform: translateY(-20px) rotate(72deg) scale(1.03);
  }
  40% {
    transform: translateY(-35px) rotate(144deg) scale(0.97);
  }
  60% {
    transform: translateY(-25px) rotate(216deg) scale(1.05);
  }
  80% {
    transform: translateY(-10px) rotate(288deg) scale(0.98);
  }
}

.calendar-card {
  height: calc(100vh - 140px);
  overflow-y: auto;
  position: relative;
  background: linear-gradient(135deg, 
    rgba(255, 255, 255, 0.95) 0%, 
    rgba(102, 126, 234, 0.05) 100%);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(102, 126, 234, 0.2);
  box-shadow: 
    0 8px 32px rgba(102, 126, 234, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
}

.calendar-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(circle at 20% 20%, rgba(102, 126, 234, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 80%, rgba(118, 75, 162, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 40% 60%, rgba(245, 158, 11, 0.05) 0%, transparent 50%);
  pointer-events: none;
  z-index: 0;
}

.calendar-card :deep(.el-card__body) {
  padding: 16px;
  height: calc(100% - 60px);
  overflow-y: auto;
  position: relative;
  z-index: 1;
  background: transparent;
}

.calendar-card :deep(.el-calendar) {
  height: 100%;
  background: transparent;
}

.calendar-card :deep(.el-calendar__body) {
  padding: 12px;
  background: transparent;
}

.calendar-card :deep(.el-calendar__header) {
  display: none;
}

/* 自定义滚动条样式 */
.calendar-card::-webkit-scrollbar,
.calendar-card :deep(.el-card__body)::-webkit-scrollbar {
  width: 8px;
}

.calendar-card::-webkit-scrollbar-track,
.calendar-card :deep(.el-card__body)::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.calendar-card::-webkit-scrollbar-thumb,
.calendar-card :deep(.el-card__body)::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

.calendar-card::-webkit-scrollbar-thumb:hover,
.calendar-card :deep(.el-card__body)::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

.task-list-card {
  height: calc(100vh - 140px);
  overflow: hidden;
  position: relative;
  background: linear-gradient(135deg, 
    rgba(255, 255, 255, 0.95) 0%, 
    rgba(118, 75, 162, 0.05) 100%);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(118, 75, 162, 0.2);
  box-shadow: 
    0 8px 32px rgba(118, 75, 162, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
}

.task-list-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(circle at 80% 20%, rgba(118, 75, 162, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 20% 80%, rgba(102, 126, 234, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 60% 40%, rgba(245, 158, 11, 0.05) 0%, transparent 50%);
  pointer-events: none;
  z-index: 0;
}

.task-list-card :deep(.el-card__body) {
  position: relative;
  z-index: 1;
  background: transparent;
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

.calendar-header {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 24px;
  background: linear-gradient(135deg, 
    rgba(102, 126, 234, 0.15) 0%, 
    rgba(118, 75, 162, 0.15) 50%, 
    rgba(255, 255, 255, 0.9) 100%);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  margin-bottom: 24px;
  border: 1px solid rgba(102, 126, 234, 0.3);
  box-shadow: 
    0 8px 32px rgba(102, 126, 234, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.5),
    0 0 0 1px rgba(102, 126, 234, 0.1);
  position: relative;
  overflow: hidden;
}

.calendar-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, 
    transparent 0%, 
    rgba(102, 126, 234, 0.6) 50%, 
    transparent 100%);
}

.calendar-header::after {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, 
    rgba(102, 126, 234, 0.05) 0%, 
    transparent 70%);
  animation: headerGlow 8s ease-in-out infinite;
  pointer-events: none;
}

@keyframes headerGlow {
  0%, 100% {
    opacity: 0.3;
    transform: scale(1) rotate(0deg);
  }
  50% {
    opacity: 0.6;
    transform: scale(1.1) rotate(180deg);
  }
}

.month-navigation {
  display: flex;
  justify-content: center;
  position: relative;
  z-index: 2;
}

.month-navigation :deep(.el-button-group) {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.2);
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(102, 126, 234, 0.2);
}

.month-navigation :deep(.el-button) {
  border: none;
  background: transparent;
  color: #667eea;
  font-weight: 600;
  padding: 12px 16px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.month-navigation :deep(.el-button::before) {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, 
    transparent 0%, 
    rgba(102, 126, 234, 0.1) 50%, 
    transparent 100%);
  transition: left 0.5s ease;
}

.month-navigation :deep(.el-button:hover) {
  background: linear-gradient(135deg, 
    rgba(102, 126, 234, 0.1) 0%, 
    rgba(118, 75, 162, 0.1) 100%);
  color: #5a67d8;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.3);
}

.month-navigation :deep(.el-button:hover::before) {
  left: 100%;
}

.month-navigation :deep(.el-button:active) {
  transform: translateY(0);
}

.current-month {
  text-align: center;
  position: relative;
  z-index: 2;
  padding: 16px 24px;
  background: linear-gradient(135deg, 
    rgba(255, 255, 255, 0.9) 0%, 
    rgba(102, 126, 234, 0.05) 100%);
  border-radius: 16px;
  border: 1px solid rgba(102, 126, 234, 0.2);
  box-shadow: 
    0 4px 16px rgba(102, 126, 234, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
}

.month-text {
  font-size: 20px;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: none;
  position: relative;
  display: inline-block;
}

.month-text::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 50%;
  transform: translateX(-50%);
  width: 60%;
  height: 2px;
  background: linear-gradient(90deg, 
    transparent 0%, 
    rgba(102, 126, 234, 0.6) 50%, 
    transparent 100%);
  border-radius: 1px;
}

.month-slider {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  position: relative;
  z-index: 2;
  padding: 16px 20px;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 12px;
  border: 1px solid rgba(102, 126, 234, 0.15);
  backdrop-filter: blur(8px);
}

.month-slider :deep(.el-slider) {
  flex: 1;
  max-width: 200px;
}

.month-slider :deep(.el-slider__runway) {
  background: linear-gradient(90deg, 
    rgba(102, 126, 234, 0.2) 0%, 
    rgba(118, 75, 162, 0.2) 100%);
  height: 6px;
  border-radius: 3px;
}

.month-slider :deep(.el-slider__bar) {
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  border-radius: 3px;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
}

.month-slider :deep(.el-slider__button) {
  width: 16px;
  height: 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: 2px solid #ffffff;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  transition: all 0.3s ease;
}

.month-slider :deep(.el-slider__button:hover) {
  transform: scale(1.2);
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.6);
}

.slider-label {
  font-size: 14px;
  color: #667eea;
  font-weight: 600;
  min-width: 90px;
  text-align: center;
  padding: 8px 12px;
  background: rgba(102, 126, 234, 0.1);
  border-radius: 8px;
  border: 1px solid rgba(102, 126, 234, 0.2);
}

.calendar-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  position: relative;
  cursor: pointer;
  border-radius: 12px;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  padding: 8px;
  min-height: 48px;
  background: linear-gradient(135deg, 
    rgba(255, 255, 255, 0.9) 0%, 
    rgba(255, 255, 255, 0.7) 100%);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(102, 126, 234, 0.15);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.calendar-cell::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, 
    rgba(102, 126, 234, 0.05) 0%, 
    rgba(118, 75, 162, 0.05) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
  border-radius: 12px;
}

.calendar-cell:hover {
  background: linear-gradient(135deg, 
    rgba(102, 126, 234, 0.15) 0%, 
    rgba(118, 75, 162, 0.15) 100%);
  border-color: rgba(102, 126, 234, 0.4);
  transform: translateY(-2px) scale(1.02);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.2);
}

.calendar-cell:hover::before {
  opacity: 1;
}

.calendar-cell.is-selected {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-color: #5a67d8;
  box-shadow: 
    0 8px 25px rgba(102, 126, 234, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.calendar-cell.is-selected::before {
  background: linear-gradient(135deg, 
    rgba(255, 255, 255, 0.1) 0%, 
    rgba(255, 255, 255, 0.05) 100%);
  opacity: 1;
}

.calendar-cell.is-selected .date-number {
  font-weight: bold;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.calendar-cell.is-today {
  background: linear-gradient(135deg, 
    rgba(245, 158, 11, 0.2) 0%, 
    rgba(217, 119, 6, 0.2) 100%);
  border-color: #f59e0b;
  box-shadow: 
    0 4px 16px rgba(245, 158, 11, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
  color: #92400e;
}

.calendar-cell.is-today::before {
  background: linear-gradient(135deg, 
    rgba(245, 158, 11, 0.1) 0%, 
    rgba(217, 119, 6, 0.1) 100%);
  opacity: 1;
}

.calendar-cell.is-today .date-number {
  font-weight: bold;
  text-shadow: 0 1px 1px rgba(255, 255, 255, 0.5);
}

.calendar-cell.has-tasks {
  border: 2px solid #67c23a;
  background: linear-gradient(135deg, 
    rgba(103, 194, 58, 0.1) 0%, 
    rgba(255, 255, 255, 0.9) 100%);
}

.calendar-cell.has-tasks::after {
  content: '';
  position: absolute;
  top: 4px;
  right: 4px;
  width: 6px;
  height: 6px;
  background: #67c23a;
  border-radius: 50%;
  box-shadow: 0 0 8px rgba(103, 194, 58, 0.6);
}

.calendar-cell.is-other-month {
  opacity: 0.4;
  background: rgba(255, 255, 255, 0.3);
}

.calendar-cell.is-other-month:hover {
  opacity: 0.7;
  background: rgba(102, 126, 234, 0.05);
}

.date-number {
  font-size: 16px;
  line-height: 1;
  font-weight: 700;
  color: #1f2937;
  position: relative;
  z-index: 2;
  transition: all 0.3s ease;
}

.calendar-cell:hover .date-number {
  color: #667eea;
  transform: scale(1.1);
}

.task-indicators {
  margin-top: 4px;
  pointer-events: none;
  position: relative;
  z-index: 2;
}

.task-badge {
  transform: scale(0.85);
  pointer-events: none;
}

.task-badge :deep(.el-badge__content) {
  background: linear-gradient(135deg, #67c23a 0%, #85ce61 100%);
  border: 1px solid #ffffff;
  box-shadow: 0 2px 8px rgba(103, 194, 58, 0.4);
  font-weight: 700;
  font-size: 10px;
}

.task-stats {
  margin-bottom: 16px;
  display: flex;
  gap: 8px;
}

.task-list {
  max-height: calc(100vh - 280px);
  overflow-y: auto;
}

.task-item {
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.task-item:hover {
  border-color: #667eea;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.2);
}

.task-item.overdue {
  border-color: #f56c6c;
  background: #fef0f0;
}

.task-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
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
  font-weight: 600;
  color: #1f2937;
  text-shadow: 0 1px 1px rgba(255, 255, 255, 0.8);
}

.task-title.completed {
  text-decoration: line-through;
  color: #909399;
}

.task-actions {
  display: flex;
  gap: 4px;
}

.task-description {
  color: #374151;
  font-size: 14px;
  margin-bottom: 8px;
  line-height: 1.4;
  font-weight: 500;
}

.task-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #4b5563;
  font-weight: 500;
}

.due-date {
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

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .calendar-header {
    padding: 20px;
    gap: 16px;
  }
  
  .month-navigation :deep(.el-button) {
    padding: 10px 14px;
  }
  
  .month-text {
    font-size: 18px;
  }
  
  .calendar-cell {
    min-height: 44px;
    padding: 6px;
  }
  
  .date-number {
    font-size: 15px;
  }
}

@media (max-width: 768px) {
  .todo-view :deep(.el-row) {
    flex-direction: column;
  }
  
  .todo-view :deep(.el-col) {
    width: 100% !important;
    margin-bottom: 20px;
  }
  
  .calendar-card,
  .task-list-card {
    height: auto;
    min-height: 500px;
  }
  
  .calendar-header {
    padding: 16px;
    gap: 12px;
  }
  
  .month-navigation {
    flex-wrap: wrap;
    gap: 8px;
  }
  
  .month-navigation :deep(.el-button-group) {
    flex-wrap: wrap;
  }
  
  .month-navigation :deep(.el-button) {
    padding: 8px 12px;
    font-size: 14px;
  }
  
  .current-month {
    padding: 12px 16px;
  }
  
  .month-text {
    font-size: 16px;
  }
  
  .month-slider {
    flex-direction: column;
    gap: 12px;
    padding: 12px 16px;
  }
  
  .month-slider :deep(.el-slider) {
    max-width: 100%;
  }
  
  .calendar-cell {
    min-height: 40px;
    padding: 4px;
    border-radius: 8px;
  }
  
  .date-number {
    font-size: 14px;
  }
  
  .task-list {
    max-height: 400px;
  }
  
  .task-item {
    padding: 12px;
    margin-bottom: 8px;
  }
}

@media (max-width: 480px) {
  .calendar-header {
    padding: 12px;
    gap: 10px;
  }
  
  .month-navigation :deep(.el-button) {
    padding: 6px 10px;
    font-size: 12px;
  }
  
  .current-month {
    padding: 8px 12px;
  }
  
  .month-text {
    font-size: 14px;
  }
  
  .month-slider {
    padding: 8px 12px;
  }
  
  .slider-label {
    font-size: 12px;
    min-width: 70px;
    padding: 6px 8px;
  }
  
  .calendar-cell {
    min-height: 36px;
    padding: 2px;
    border-radius: 6px;
  }
  
  .date-number {
    font-size: 12px;
  }
  
  .task-badge {
    transform: scale(0.75);
  }
}
</style>