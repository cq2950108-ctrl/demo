<template>
  <div class="integrated-workspace">
    <!-- 装饰性背景图案 -->
    <div class="view-decorations">
      <div class="view-decoration view-decoration-1"></div>
      <div class="view-decoration view-decoration-2"></div>
      <div class="view-decoration view-decoration-3"></div>
    </div>

    <el-container class="workspace-container">
      <!-- 左侧：番茄钟区域 -->
      <el-aside width="400px" class="pomodoro-section">
        <el-card class="pomodoro-card">
          <template #header>
            <div class="section-header">
              <el-icon><Timer /></el-icon>
              <span>番茄钟</span>
            </div>
          </template>

          <!-- 番茄钟计时器 -->
          <div class="timer-display">
            <div 
              class="timer-circle"
              :class="{ 'working': currentMode === 'work', 'breaking': currentMode === 'break' }"
              :style="{ '--progress': progressPercentage }"
            >
              <div class="timer-inner">
                <div class="time-text">{{ formatTime(timeLeft) }}</div>
                <div class="mode-text">{{ getModeText() }}</div>
                <div class="session-info">第 {{ currentSession }} 个番茄钟</div>
              </div>
            </div>
          </div>

          <!-- 控制按钮 -->
          <div class="timer-controls">
            <el-button-group class="control-buttons">
              <el-button 
                :type="isRunning ? 'danger' : 'primary'"
                size="large"
                @click="toggleTimer"
                :icon="isRunning ? VideoPause : VideoPlay"
              >
                {{ isRunning ? '暂停' : '开始' }}
              </el-button>
              <el-button 
                size="large"
                @click="resetTimer"
                :icon="RefreshRight"
              >
                重置
              </el-button>
            </el-button-group>
          </div>

          <!-- 今日统计 -->
          <div class="daily-stats">
            <div class="stat-item">
              <span class="stat-label">完成番茄钟</span>
              <span class="stat-value">{{ todayStats.completedPomodoros }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">专注时间</span>
              <span class="stat-value">{{ formatDuration(todayStats.focusTime) }}</span>
            </div>
          </div>
        </el-card>
      </el-aside>

      <!-- 右侧：任务管理区域 -->
      <el-main class="tasks-section">
        <div class="tasks-container">
          <!-- 待办任务 -->
          <el-card class="tasks-card todo-card">
            <template #header>
              <div class="section-header">
                <el-icon><List /></el-icon>
                <span>今日待办 ({{ todayTasks.length }})</span>
                <el-button 
                  type="primary" 
                  size="small" 
                  @click="showAddTaskDialog = true"
                  :icon="Plus"
                >
                  添加任务
                </el-button>
              </div>
            </template>

            <div class="task-list">
              <div 
                v-for="task in todayTasks" 
                :key="task.id"
                class="task-item"
                :class="{ 'active': activeTaskId === task.id }"
                @click="setActiveTask(task.id)"
              >
                <div class="task-content">
                  <div class="task-header">
                    <span class="task-title">{{ task.title }}</span>
                    <el-tag 
                      :type="getPriorityType(task.priority)"
                      size="small"
                    >
                      {{ task.priority }}
                    </el-tag>
                  </div>
                  <div class="task-meta">
                    <span class="task-time">{{ task.due_date }}</span>
                    <span v-if="task.description" class="task-desc">{{ task.description }}</span>
                  </div>
                </div>
                <div class="task-actions">
                  <el-button 
                    type="success" 
                    size="small" 
                    @click.stop="completeTask(task.id)"
                    :icon="Check"
                  >
                    完成
                  </el-button>
                  <el-button 
                    size="small" 
                    @click.stop="editTask(task)"
                    :icon="Edit"
                  >
                    编辑
                  </el-button>
                </div>
              </div>

              <div v-if="todayTasks.length === 0" class="empty-state">
                <el-icon><Calendar /></el-icon>
                <p>今天没有待办任务</p>
              </div>
            </div>
          </el-card>

          <!-- 已完成任务 -->
          <el-card class="tasks-card completed-card">
            <template #header>
              <div class="section-header">
                <el-icon><Check /></el-icon>
                <span>今日已完成 ({{ todayCompletedTasks.length }})</span>
              </div>
            </template>

            <div class="task-list">
              <div 
                v-for="task in todayCompletedTasks" 
                :key="task.id"
                class="task-item completed"
              >
                <div class="task-content">
                  <div class="task-header">
                    <span class="task-title">{{ task.title }}</span>
                    <el-tag type="success" size="small">已完成</el-tag>
                  </div>
                  <div class="task-meta">
                    <span class="task-time">完成于 {{ formatDateTime(task.completed_at) }}</span>
                  </div>
                </div>
                <div class="task-actions">
                  <el-button 
                    size="small" 
                    @click="uncompleteTask(task.id)"
                    :icon="RefreshLeft"
                  >
                    撤销
                  </el-button>
                </div>
              </div>

              <div v-if="todayCompletedTasks.length === 0" class="empty-state">
                <el-icon><Check /></el-icon>
                <p>今天还没有完成任务</p>
              </div>
            </div>
          </el-card>
        </div>
      </el-main>
    </el-container>

    <!-- 添加任务对话框 -->
    <el-dialog 
      v-model="showAddTaskDialog" 
      title="添加新任务"
      width="500px"
    >
      <el-form :model="taskForm" label-width="100px">
        <el-form-item label="任务标题" required>
          <el-input v-model="taskForm.title" placeholder="请输入任务标题" />
        </el-form-item>
        <el-form-item label="任务描述">
          <el-input 
            v-model="taskForm.description" 
            type="textarea" 
            placeholder="请输入任务描述"
            :rows="3"
          />
        </el-form-item>
        <el-form-item label="优先级">
          <el-select v-model="taskForm.priority" placeholder="选择优先级">
            <el-option label="S - 紧急重要" value="S" />
            <el-option label="A - 重要不紧急" value="A" />
            <el-option label="B - 紧急不重要" value="B" />
            <el-option label="C - 一般" value="C" />
            <el-option label="D - 低优先级" value="D" />
          </el-select>
        </el-form-item>
        <el-form-item label="截止日期">
          <el-date-picker
            v-model="taskForm.due_date"
            type="date"
            placeholder="选择截止日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showAddTaskDialog = false">取消</el-button>
          <el-button type="primary" @click="saveTask">保存</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 编辑任务对话框 -->
    <el-dialog 
      v-model="showEditTaskDialog" 
      title="编辑任务"
      width="500px"
    >
      <el-form :model="editTaskForm" label-width="100px">
        <el-form-item label="任务标题" required>
          <el-input v-model="editTaskForm.title" placeholder="请输入任务标题" />
        </el-form-item>
        <el-form-item label="任务描述">
          <el-input 
            v-model="editTaskForm.description" 
            type="textarea" 
            placeholder="请输入任务描述"
            :rows="3"
          />
        </el-form-item>
        <el-form-item label="优先级">
          <el-select v-model="editTaskForm.priority" placeholder="选择优先级">
            <el-option label="S - 紧急重要" value="S" />
            <el-option label="A - 重要不紧急" value="A" />
            <el-option label="B - 紧急不重要" value="B" />
            <el-option label="C - 一般" value="C" />
            <el-option label="D - 低优先级" value="D" />
          </el-select>
        </el-form-item>
        <el-form-item label="截止日期">
          <el-date-picker
            v-model="editTaskForm.due_date"
            type="date"
            placeholder="选择截止日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showEditTaskDialog = false">取消</el-button>
          <el-button type="primary" @click="updateTask">保存</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { 
  Timer, 
  VideoPlay, 
  VideoPause, 
  RefreshRight,
  RefreshLeft,
  List,
  Plus,
  Check,
  Edit,
  Calendar
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useTaskStore } from '@/stores/taskStore'
import { DateUtils } from '@/utils/date'
import type { Task, Priority } from '@/types'

// Store
const taskStore = useTaskStore()

// 番茄钟状态
const currentMode = ref<'work' | 'break'>('work')
const timeLeft = ref(25 * 60) // 25分钟
const isRunning = ref(false)
const currentSession = ref(1)
let timer: NodeJS.Timeout | null = null

// 番茄钟设置
const settings = reactive({
  workDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  longBreakInterval: 4
})

// 今日统计
const todayStats = reactive({
  completedPomodoros: 0,
  focusTime: 0
})

// 任务状态
const activeTaskId = ref<string>('')
const showAddTaskDialog = ref(false)
const showEditTaskDialog = ref(false)
const editingTask = ref<Task | null>(null)

// 表单数据
const taskForm = reactive({
  title: '',
  description: '',
  priority: 'C' as Priority,
  due_date: DateUtils.getToday()
})

const editTaskForm = reactive({
  title: '',
  description: '',
  priority: 'C' as Priority,
  due_date: ''
})

// 计算属性
const progressPercentage = computed(() => {
  const total = getTotalTime()
  return ((total - timeLeft.value) / total) * 100
})

const todayTasks = computed(() => {
  return taskStore.todayTasks
})

const todayCompletedTasks = computed(() => {
  const today = DateUtils.getToday()
  return taskStore.completedTasks.filter(task => 
    task.completed_at && task.completed_at.startsWith(today)
  )
})

// 番茄钟方法
const getTotalTime = () => {
  return currentMode.value === 'work' 
    ? settings.workDuration * 60 
    : (currentSession.value % settings.longBreakInterval === 0 
        ? settings.longBreakDuration 
        : settings.shortBreakDuration) * 60
}

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

const formatDuration = (minutes: number) => {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hours > 0) {
    return `${hours}h ${mins}m`
  }
  return `${mins}m`
}

const formatDateTime = (dateTime?: string) => {
  if (!dateTime) return ''
  try {
    return DateUtils.formatTime(new Date(dateTime))
  } catch (error) {
    console.error('日期格式化错误:', error)
    return dateTime // 返回原始字符串作为备选
  }
}

const getModeText = () => {
  if (currentMode.value === 'work') {
    return '专注工作'
  }
  return currentSession.value % settings.longBreakInterval === 0 ? '长休息' : '短休息'
}

const toggleTimer = () => {
  if (isRunning.value) {
    pauseTimer()
  } else {
    startTimer()
  }
}

const startTimer = () => {
  isRunning.value = true
  timer = setInterval(() => {
    timeLeft.value--
    if (timeLeft.value <= 0) {
      completeSession()
    }
  }, 1000)
}

const pauseTimer = () => {
  isRunning.value = false
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

const resetTimer = () => {
  pauseTimer()
  timeLeft.value = getTotalTime()
}

const completeSession = () => {
  pauseTimer()
  
  if (currentMode.value === 'work') {
    todayStats.completedPomodoros++
    todayStats.focusTime += settings.workDuration
    currentSession.value++
    
    // 切换到休息模式
    currentMode.value = 'break'
    ElMessage.success('工作时间结束，休息一下吧！')
  } else {
    // 切换到工作模式
    currentMode.value = 'work'
    ElMessage.success('休息结束，继续专注工作！')
  }
  
  timeLeft.value = getTotalTime()
  saveStats()
}

// 任务管理方法
const setActiveTask = (taskId: string) => {
  activeTaskId.value = taskId
}

const completeTask = (taskId: string) => {
  taskStore.completeTask(taskId)
  ElMessage.success('任务已完成！')
}

const uncompleteTask = (taskId: string) => {
  taskStore.uncompleteTask(taskId)
  ElMessage.success('任务已撤销完成状态')
}

const editTask = (task: Task) => {
  editingTask.value = task
  editTaskForm.title = task.title
  editTaskForm.description = task.description || ''
  editTaskForm.priority = task.priority
  editTaskForm.due_date = task.due_date
  showEditTaskDialog.value = true
}

const saveTask = () => {
  if (!taskForm.title.trim()) {
    ElMessage.error('请输入任务标题')
    return
  }

  taskStore.createTask({
    title: taskForm.title,
    description: taskForm.description,
    priority: taskForm.priority,
    due_date: taskForm.due_date
  })

  // 重置表单
  taskForm.title = ''
  taskForm.description = ''
  taskForm.priority = 'C'
  taskForm.due_date = DateUtils.getToday()
  
  showAddTaskDialog.value = false
  ElMessage.success('任务添加成功！')
}

const updateTask = () => {
  if (!editTaskForm.title.trim()) {
    ElMessage.error('请输入任务标题')
    return
  }

  if (editingTask.value) {
    taskStore.updateTask(editingTask.value.id, {
      title: editTaskForm.title,
      description: editTaskForm.description,
      priority: editTaskForm.priority,
      due_date: editTaskForm.due_date
    })

    showEditTaskDialog.value = false
    editingTask.value = null
    ElMessage.success('任务更新成功！')
  }
}

const getPriorityType = (priority: Priority) => {
  const types = {
    S: 'danger',
    A: 'warning', 
    B: 'primary',
    C: 'success',
    D: 'info'
  }
  return types[priority]
}

// 数据持久化
const saveStats = () => {
  const today = new Date().toDateString()
  localStorage.setItem(`integrated_stats_${today}`, JSON.stringify(todayStats))
}

const loadStats = () => {
  try {
    const today = new Date().toDateString()
    const saved = localStorage.getItem(`integrated_stats_${today}`)
    if (saved) {
      Object.assign(todayStats, JSON.parse(saved))
    }
  } catch (error) {
    console.error('加载统计失败:', error)
  }
}

// 生命周期
onMounted(() => {
  taskStore.loadTasks()
  loadStats()
  timeLeft.value = getTotalTime()
})

onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
  }
})
</script>

<style scoped>
.integrated-workspace {
  height: 100vh;
  background: #0a0a1e;
  overflow: hidden;
  position: relative;
}

/* 动态背景层 */
.integrated-workspace::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, 
    #0a0a1e 0%, 
    #1a1a3e 25%, 
    #2a1a5e 50%, 
    #1a1a3e 75%, 
    #0a0a1e 100%);
  animation: backgroundShift 20s ease-in-out infinite;
  z-index: 0;
}

@keyframes backgroundShift {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.8; }
}

/* 装饰性背景图案 */
.view-decorations {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

.view-decoration {
  position: absolute;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(0, 245, 255, 0.1) 0%, transparent 70%);
  animation: float 6s ease-in-out infinite;
}

.view-decoration-1 {
  width: 200px;
  height: 200px;
  top: 10%;
  left: 5%;
  animation-delay: 0s;
}

.view-decoration-2 {
  width: 150px;
  height: 150px;
  top: 60%;
  right: 10%;
  animation-delay: 2s;
}

.view-decoration-3 {
  width: 100px;
  height: 100px;
  bottom: 20%;
  left: 15%;
  animation-delay: 4s;
}

@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(180deg); }
}

.workspace-container {
  position: relative;
  z-index: 2;
  height: 100vh;
  gap: 20px;
  padding: 20px;
}

/* 番茄钟区域 */
.pomodoro-section {
  margin-right: 20px;
}

.pomodoro-card {
  height: calc(100vh - 40px);
  background: rgba(10, 10, 30, 0.95);
  border: 1px solid rgba(0, 245, 255, 0.2);
  border-radius: 15px;
  box-shadow: 
    0 8px 32px rgba(0, 245, 255, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
}

.section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #00f5ff;
  font-weight: 600;
  font-size: 16px;
}

.timer-display {
  display: flex;
  justify-content: center;
  margin: 30px 0;
}

.timer-circle {
  width: 200px;
  height: 200px;
  border-radius: 50%;
  position: relative;
  background: conic-gradient(
    from 0deg,
    #00f5ff 0deg,
    #00f5ff calc(var(--progress) * 3.6deg),
    rgba(255, 255, 255, 0.1) calc(var(--progress) * 3.6deg),
    rgba(255, 255, 255, 0.1) 360deg
  );
  transition: all 0.3s ease;
  box-shadow: 
    0 0 30px rgba(0, 245, 255, 0.3),
    inset 0 0 30px rgba(0, 245, 255, 0.1);
  border: 3px solid rgba(0, 245, 255, 0.2);
}

.timer-circle.working {
  background: conic-gradient(
    from 0deg,
    #00f5ff 0deg,
    #00f5ff calc(var(--progress) * 3.6deg),
    rgba(255, 255, 255, 0.1) calc(var(--progress) * 3.6deg),
    rgba(255, 255, 255, 0.1) 360deg
  );
}

.timer-circle.breaking {
  background: conic-gradient(
    from 0deg,
    #ff00ff 0deg,
    #ff00ff calc(var(--progress) * 3.6deg),
    rgba(255, 255, 255, 0.1) calc(var(--progress) * 3.6deg),
    rgba(255, 255, 255, 0.1) 360deg
  );
  box-shadow: 
    0 0 30px rgba(255, 0, 255, 0.4),
    inset 0 0 30px rgba(255, 0, 255, 0.2);
  border-color: rgba(255, 0, 255, 0.3);
}

.timer-inner {
  position: absolute;
  top: 15px;
  left: 15px;
  right: 15px;
  bottom: 15px;
  background: rgba(10, 10, 30, 0.95);
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.time-text {
  font-size: 28px;
  font-weight: bold;
  color: #00f5ff;
  text-shadow: 0 0 10px rgba(0, 245, 255, 0.8);
  margin-bottom: 5px;
}

.mode-text {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 5px;
}

.session-info {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
}

.timer-controls {
  display: flex;
  justify-content: center;
  margin: 30px 0;
}

.control-buttons {
  gap: 10px;
}

.daily-stats {
  margin-top: 30px;
  padding: 20px;
  background: rgba(0, 245, 255, 0.05);
  border-radius: 10px;
  border: 1px solid rgba(0, 245, 255, 0.1);
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.stat-item:last-child {
  margin-bottom: 0;
}

.stat-label {
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
}

.stat-value {
  color: #00f5ff;
  font-weight: bold;
  font-size: 16px;
}

/* 任务区域 */
.tasks-section {
  padding: 0;
}

.tasks-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  height: calc(100vh - 40px);
}

.tasks-card {
  flex: 1;
  background: rgba(10, 10, 30, 0.95);
  border: 1px solid rgba(0, 245, 255, 0.2);
  border-radius: 15px;
  box-shadow: 
    0 8px 32px rgba(0, 245, 255, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
}

.todo-card .section-header {
  justify-content: space-between;
}

.task-list {
  max-height: calc(50vh - 120px);
  overflow-y: auto;
  padding-right: 5px;
}

.task-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  margin-bottom: 10px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  transition: all 0.3s ease;
  cursor: pointer;
}

.task-item:hover {
  background: rgba(0, 245, 255, 0.1);
  border-color: rgba(0, 245, 255, 0.3);
  transform: translateY(-2px);
}

.task-item.active {
  background: rgba(0, 245, 255, 0.15);
  border-color: rgba(0, 245, 255, 0.5);
  box-shadow: 0 0 15px rgba(0, 245, 255, 0.3);
}

.task-item.completed {
  opacity: 0.8;
  background: rgba(0, 255, 0, 0.05);
  border-color: rgba(0, 255, 0, 0.2);
}

.task-content {
  flex: 1;
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 5px;
}

.task-title {
  color: #ffffff;
  font-weight: 500;
  font-size: 16px;
}

.task-meta {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.task-time {
  color: rgba(255, 255, 255, 0.6);
  font-size: 12px;
}

.task-desc {
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
}

.task-actions {
  display: flex;
  gap: 8px;
  margin-left: 15px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  color: rgba(255, 255, 255, 0.5);
  text-align: center;
}

.empty-state .el-icon {
  font-size: 48px;
  margin-bottom: 15px;
  color: rgba(0, 245, 255, 0.3);
}

.empty-state p {
  margin: 0;
  font-size: 16px;
}

/* 对话框样式 */
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

/* 滚动条样式 */
.task-list::-webkit-scrollbar {
  width: 6px;
}

.task-list::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
}

.task-list::-webkit-scrollbar-thumb {
  background: rgba(0, 245, 255, 0.3);
  border-radius: 3px;
}

.task-list::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 245, 255, 0.5);
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .workspace-container {
    flex-direction: column;
    padding: 15px;
  }
  
  .pomodoro-section {
    width: 100% !important;
    margin-right: 0;
    margin-bottom: 20px;
  }
  
  .pomodoro-card {
    height: auto;
    min-height: 400px;
  }
  
  .tasks-container {
    height: auto;
  }
  
  .task-list {
    max-height: 300px;
  }
}

@media (max-width: 768px) {
  .timer-circle {
    width: 150px;
    height: 150px;
  }
  
  .time-text {
    font-size: 24px;
  }
  
  .task-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .task-actions {
    margin-left: 0;
    align-self: flex-end;
  }
}
</style>