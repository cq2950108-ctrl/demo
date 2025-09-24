<template>
  <div class="pomodoro-view">
    <!-- 装饰性背景图案 -->
    <div class="view-decorations">
      <div class="view-decoration view-decoration-1"></div>
      <div class="view-decoration view-decoration-2"></div>
      <div class="view-decoration view-decoration-3"></div>
    </div>
    
    <el-container>
      <!-- 主计时器区域 -->
      <el-main class="timer-main">
        <el-card class="timer-card">
          <!-- 计时器显示 -->
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
              <el-button 
                size="large"
                @click="skipSession"
                :icon="DArrowRight"
              >
                跳过
              </el-button>
            </el-button-group>
          </div>

          <!-- 模式切换 -->
          <div class="mode-selector">
            <el-radio-group v-model="currentMode" @change="switchMode">
              <el-radio-button label="work">工作时间</el-radio-button>
              <el-radio-button label="break">休息时间</el-radio-button>
            </el-radio-group>
          </div>
        </el-card>
      </el-main>

      <!-- 侧边栏 - 设置和统计 -->
      <el-aside width="350px" class="timer-sidebar">
        <!-- 设置面板 -->
        <el-card class="settings-card">
          <template #header>
            <div class="card-header">
              <el-icon><Setting /></el-icon>
              <span>番茄钟设置</span>
            </div>
          </template>

          <div class="settings-content">
            <div class="setting-item">
              <label>工作时间（分钟）</label>
              <el-input-number 
                v-model="settings.workDuration" 
                :min="1" 
                :max="60" 
                :disabled="isRunning"
                @change="updateSettings"
              />
            </div>

            <div class="setting-item">
              <label>短休息时间（分钟）</label>
              <el-input-number 
                v-model="settings.shortBreakDuration" 
                :min="1" 
                :max="30" 
                :disabled="isRunning"
                @change="updateSettings"
              />
            </div>

            <div class="setting-item">
              <label>长休息时间（分钟）</label>
              <el-input-number 
                v-model="settings.longBreakDuration" 
                :min="1" 
                :max="60" 
                :disabled="isRunning"
                @change="updateSettings"
              />
            </div>

            <div class="setting-item">
              <label>长休息间隔（个番茄钟）</label>
              <el-input-number 
                v-model="settings.longBreakInterval" 
                :min="2" 
                :max="10" 
                :disabled="isRunning"
                @change="updateSettings"
              />
            </div>

            <div class="setting-item">
              <label>自动开始下一个</label>
              <el-switch 
                v-model="settings.autoStart" 
                @change="updateSettings"
              />
            </div>

            <div class="setting-item">
              <label>声音提醒</label>
              <el-switch 
                v-model="settings.soundEnabled" 
                @change="updateSettings"
              />
            </div>
          </div>
        </el-card>

        <!-- 今日统计 -->
        <el-card class="stats-card">
          <template #header>
            <div class="card-header">
              <el-icon><DataAnalysis /></el-icon>
              <span>今日统计</span>
            </div>
          </template>

          <div class="stats-content">
            <div class="stat-item">
              <div class="stat-icon work-stat">
                <el-icon><Timer /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ todayStats.completedSessions }}</div>
                <div class="stat-label">完成番茄钟</div>
              </div>
            </div>

            <div class="stat-item">
              <div class="stat-icon focus-stat">
                <el-icon><View /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ formatDuration(todayStats.focusTime) }}</div>
                <div class="stat-label">专注时间</div>
              </div>
            </div>

            <div class="stat-item">
              <div class="stat-icon break-stat">
                <el-icon><Coffee /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ formatDuration(todayStats.breakTime) }}</div>
                <div class="stat-label">休息时间</div>
              </div>
            </div>
          </div>
        </el-card>

        <!-- 任务列表 -->
        <el-card class="tasks-card">
          <template #header>
            <div class="card-header">
              <el-icon><List /></el-icon>
              <span>当前任务</span>
              <el-button size="small" type="primary" @click="showTaskDialog = true">
                <el-icon><Plus /></el-icon>
              </el-button>
            </div>
          </template>

          <div class="tasks-content">
            <div v-if="currentTasks.length === 0" class="empty-tasks">
              <el-empty description="暂无任务" :image-size="60" />
            </div>
            <div v-else class="task-list">
              <div 
                v-for="(task, index) in currentTasks" 
                :key="task.id"
                class="task-item"
                :class="{ 'active': index === activeTaskIndex }"
                @click="setActiveTask(index)"
              >
                <div class="task-content">
                  <div class="task-title">{{ task.title }}</div>
                  <div class="task-progress">
                    <span>{{ task.completedPomodoros }}/{{ task.estimatedPomodoros }}</span>
                    <el-progress 
                      :percentage="(task.completedPomodoros / task.estimatedPomodoros) * 100"
                      :show-text="false"
                      :stroke-width="4"
                    />
                  </div>
                </div>
                <div class="task-actions">
                  <el-button size="small" type="text" @click.stop="editTask(task)">
                    <el-icon><Edit /></el-icon>
                  </el-button>
                  <el-button size="small" type="text" @click.stop="deleteTask(task.id)">
                    <el-icon><Delete /></el-icon>
                  </el-button>
                </div>
              </div>
            </div>
          </div>
        </el-card>
      </el-aside>
    </el-container>

    <!-- 任务对话框 -->
    <el-dialog 
      v-model="showTaskDialog" 
      :title="editingTask ? '编辑任务' : '新建任务'"
      width="400px"
    >
      <el-form :model="taskForm" label-width="100px">
        <el-form-item label="任务标题">
          <el-input v-model="taskForm.title" placeholder="请输入任务标题" />
        </el-form-item>
        <el-form-item label="预估番茄钟">
          <el-input-number v-model="taskForm.estimatedPomodoros" :min="1" :max="20" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showTaskDialog = false">取消</el-button>
          <el-button type="primary" @click="saveTask">保存</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 完成提示 -->
    <el-dialog 
      v-model="showCompletionDialog" 
      title="番茄钟完成！"
      width="300px"
      :show-close="false"
      :close-on-click-modal="false"
    >
      <div class="completion-content">
        <div class="completion-icon">
          <el-icon><SuccessFilled /></el-icon>
        </div>
        <div class="completion-text">
          <p v-if="currentMode === 'work'">工作时间结束，休息一下吧！</p>
          <p v-else>休息结束，继续专注工作！</p>
        </div>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dismissCompletion">稍后</el-button>
          <el-button type="primary" @click="startNextSession">开始下一个</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { 
  VideoPlay, 
  VideoPause, 
  RefreshRight, 
  DArrowRight,
  Setting,
  DataAnalysis,
  Timer,
  View,
  Coffee,
  List,
  Plus,
  Edit,
  Delete,
  SuccessFilled
} from '@element-plus/icons-vue'
import { ElMessage, ElNotification } from 'element-plus'

interface PomodoroSettings {
  workDuration: number
  shortBreakDuration: number
  longBreakDuration: number
  longBreakInterval: number
  autoStart: boolean
  soundEnabled: boolean
}

interface Task {
  id: string
  title: string
  estimatedPomodoros: number
  completedPomodoros: number
}

interface TodayStats {
  completedSessions: number
  focusTime: number
  breakTime: number
}

const isRunning = ref(false)
const currentMode = ref<'work' | 'break'>('work')
const timeLeft = ref(25 * 60) // 默认25分钟
const currentSession = ref(1)
const activeTaskIndex = ref(0)
const showTaskDialog = ref(false)
const showCompletionDialog = ref(false)
const editingTask = ref<Task | null>(null)

const settings = reactive<PomodoroSettings>({
  workDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  longBreakInterval: 4,
  autoStart: false,
  soundEnabled: true
})

const todayStats = reactive<TodayStats>({
  completedSessions: 0,
  focusTime: 0,
  breakTime: 0
})

const currentTasks = ref<Task[]>([])

const taskForm = reactive({
  title: '',
  estimatedPomodoros: 1
})

let timer: ReturnType<typeof setInterval> | null = null
let startTime: number = 0

// 计算进度百分比
const progressPercentage = computed(() => {
  const totalTime = currentMode.value === 'work' 
    ? settings.workDuration * 60 
    : (currentSession.value % settings.longBreakInterval === 0 
        ? settings.longBreakDuration * 60 
        : settings.shortBreakDuration * 60)
  return ((totalTime - timeLeft.value) / totalTime) * 100
})

// 格式化时间显示
const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

// 格式化持续时间
const formatDuration = (minutes: number) => {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hours > 0) {
    return `${hours}h ${mins}m`
  }
  return `${mins}m`
}

// 获取模式文本
const getModeText = () => {
  if (currentMode.value === 'work') {
    return '专注工作'
  }
  return currentSession.value % settings.longBreakInterval === 0 ? '长休息' : '短休息'
}

// 开始/暂停计时器
const toggleTimer = () => {
  if (isRunning.value) {
    pauseTimer()
  } else {
    startTimer()
  }
}

// 开始计时器
const startTimer = () => {
  isRunning.value = true
  startTime = Date.now() - (getTotalTime() - timeLeft.value) * 1000
  
  timer = setInterval(() => {
    timeLeft.value--
    
    if (timeLeft.value <= 0) {
      completeSession()
    }
  }, 1000)
}

// 暂停计时器
const pauseTimer = () => {
  isRunning.value = false
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

// 重置计时器
const resetTimer = () => {
  pauseTimer()
  timeLeft.value = getTotalTime()
}

// 跳过当前会话
const skipSession = () => {
  pauseTimer()
  completeSession()
}

// 完成会话
const completeSession = () => {
  pauseTimer()
  
  // 播放提示音
  if (settings.soundEnabled) {
    playNotificationSound()
  }
  
  // 更新统计
  updateStats()
  
  // 显示完成对话框
  showCompletionDialog.value = true
  
  // 发送通知
  sendNotification()
}

// 开始下一个会话
const startNextSession = () => {
  showCompletionDialog.value = false
  
  if (currentMode.value === 'work') {
    // 工作结束，进入休息
    currentMode.value = 'break'
    if (currentSession.value % settings.longBreakInterval === 0) {
      timeLeft.value = settings.longBreakDuration * 60
    } else {
      timeLeft.value = settings.shortBreakDuration * 60
    }
  } else {
    // 休息结束，进入工作
    currentMode.value = 'work'
    currentSession.value++
    timeLeft.value = settings.workDuration * 60
  }
  
  if (settings.autoStart) {
    startTimer()
  }
}

// 关闭完成对话框
const dismissCompletion = () => {
  showCompletionDialog.value = false
  startNextSession()
}

// 切换模式
const switchMode = (mode: 'work' | 'break') => {
  if (isRunning.value) {
    ElMessage.warning('请先暂停当前计时器')
    return
  }
  
  currentMode.value = mode
  timeLeft.value = getTotalTime()
}

// 获取总时间
const getTotalTime = () => {
  if (currentMode.value === 'work') {
    return settings.workDuration * 60
  }
  return currentSession.value % settings.longBreakInterval === 0 
    ? settings.longBreakDuration * 60 
    : settings.shortBreakDuration * 60
}

// 更新设置
const updateSettings = () => {
  if (!isRunning.value) {
    timeLeft.value = getTotalTime()
  }
  saveSettings()
}

// 更新统计
const updateStats = () => {
  if (currentMode.value === 'work') {
    todayStats.completedSessions++
    todayStats.focusTime += settings.workDuration
    
    // 更新任务进度
    if (currentTasks.value[activeTaskIndex.value]) {
      currentTasks.value[activeTaskIndex.value].completedPomodoros++
    }
  } else {
    const breakDuration = currentSession.value % settings.longBreakInterval === 0 
      ? settings.longBreakDuration 
      : settings.shortBreakDuration
    todayStats.breakTime += breakDuration
  }
  
  saveStats()
  saveTasks()
}

// 播放提示音
const playNotificationSound = () => {
  try {
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT')
    audio.play()
  } catch (error) {
    console.log('无法播放提示音:', error)
  }
}

// 发送通知
const sendNotification = () => {
  const title = currentMode.value === 'work' ? '工作时间结束！' : '休息时间结束！'
  const message = currentMode.value === 'work' ? '该休息一下了' : '继续专注工作吧'
  
  ElNotification({
    title,
    message,
    type: 'success',
    duration: 5000
  })
}

// 任务管理
const setActiveTask = (index: number) => {
  activeTaskIndex.value = index
}

const editTask = (task: Task) => {
  editingTask.value = task
  taskForm.title = task.title
  taskForm.estimatedPomodoros = task.estimatedPomodoros
  showTaskDialog.value = true
}

const deleteTask = (taskId: string) => {
  const index = currentTasks.value.findIndex(task => task.id === taskId)
  if (index !== -1) {
    currentTasks.value.splice(index, 1)
    if (activeTaskIndex.value >= currentTasks.value.length) {
      activeTaskIndex.value = Math.max(0, currentTasks.value.length - 1)
    }
    saveTasks()
  }
}

const saveTask = () => {
  if (!taskForm.title.trim()) {
    ElMessage.warning('请输入任务标题')
    return
  }
  
  if (editingTask.value) {
    // 编辑现有任务
    editingTask.value.title = taskForm.title
    editingTask.value.estimatedPomodoros = taskForm.estimatedPomodoros
  } else {
    // 创建新任务
    const newTask: Task = {
      id: Date.now().toString(),
      title: taskForm.title,
      estimatedPomodoros: taskForm.estimatedPomodoros,
      completedPomodoros: 0
    }
    currentTasks.value.push(newTask)
  }
  
  saveTasks()
  resetTaskForm()
  showTaskDialog.value = false
}

const resetTaskForm = () => {
  taskForm.title = ''
  taskForm.estimatedPomodoros = 1
  editingTask.value = null
}

// 数据持久化
const saveSettings = () => {
  localStorage.setItem('pomodoro_settings', JSON.stringify(settings))
}

const loadSettings = () => {
  try {
    const saved = localStorage.getItem('pomodoro_settings')
    if (saved) {
      Object.assign(settings, JSON.parse(saved))
    }
  } catch (error) {
    console.error('加载设置失败:', error)
  }
}

const saveStats = () => {
  const today = new Date().toDateString()
  localStorage.setItem(`pomodoro_stats_${today}`, JSON.stringify(todayStats))
}

const loadStats = () => {
  try {
    const today = new Date().toDateString()
    const saved = localStorage.getItem(`pomodoro_stats_${today}`)
    if (saved) {
      Object.assign(todayStats, JSON.parse(saved))
    }
  } catch (error) {
    console.error('加载统计失败:', error)
  }
}

const saveTasks = () => {
  localStorage.setItem('pomodoro_tasks', JSON.stringify(currentTasks.value))
}

const loadTasks = () => {
  try {
    const saved = localStorage.getItem('pomodoro_tasks')
    if (saved) {
      currentTasks.value = JSON.parse(saved)
    }
  } catch (error) {
    console.error('加载任务失败:', error)
  }
}

// 生命周期
onMounted(() => {
  loadSettings()
  loadStats()
  loadTasks()
  timeLeft.value = getTotalTime()
})

onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
  }
})
</script>

<style scoped>
.pomodoro-view {
  height: 100vh;
  background: #0a0a1e;
  overflow: hidden;
  position: relative;
}

/* 动态背景层 */
.pomodoro-view::before {
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

/* 动态粒子效果 */
.pomodoro-view::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: 
    radial-gradient(2px 2px at 20px 30px, #00f5ff, transparent),
    radial-gradient(2px 2px at 40px 70px, rgba(255, 0, 255, 0.8), transparent),
    radial-gradient(1px 1px at 90px 40px, rgba(0, 255, 136, 0.6), transparent),
    radial-gradient(1px 1px at 130px 80px, rgba(255, 255, 0, 0.4), transparent),
    radial-gradient(2px 2px at 160px 30px, rgba(255, 100, 100, 0.5), transparent);
  background-repeat: repeat;
  background-size: 200px 100px;
  animation: particleMove 25s linear infinite;
  z-index: 0;
}

@keyframes particleMove {
  0% { transform: translate(0, 0); }
  100% { transform: translate(-200px, -100px); }
}

/* 科技风装饰性背景图案 */
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
  filter: blur(60px);
  animation: viewFloat 25s infinite ease-in-out;
}

.view-decoration-1 {
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, rgba(0, 245, 255, 0.3) 0%, transparent 70%);
  top: 20%;
  right: 10%;
  animation-delay: 0s;
}

.view-decoration-2 {
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba(255, 0, 255, 0.25) 0%, transparent 70%);
  bottom: 30%;
  left: 5%;
  animation-delay: -8s;
}

.view-decoration-3 {
  width: 250px;
  height: 250px;
  background: radial-gradient(circle, rgba(0, 255, 136, 0.2) 0%, transparent 70%);
  top: 10%;
  left: 30%;
  animation-delay: -15s;
}

@keyframes viewFloat {
  0%, 100% {
    transform: translateY(0px) rotate(0deg) scale(1);
    opacity: 0.3;
  }
  33% {
    transform: translateY(-50px) rotate(120deg) scale(1.2);
    opacity: 0.5;
  }
  66% {
    transform: translateY(-25px) rotate(240deg) scale(0.8);
    opacity: 0.2;
  }
}

.el-container {
  height: 100%;
  position: relative;
  z-index: 2;
}

.timer-main {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.timer-card {
  background: rgba(10, 10, 30, 0.9);
  border: 2px solid rgba(0, 245, 255, 0.3);
  border-radius: 24px;
  box-shadow: 
    0 0 30px rgba(0, 245, 255, 0.2),
    0 0 60px rgba(255, 0, 255, 0.1),
    inset 0 0 30px rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  padding: 48px;
  text-align: center;
  min-width: 400px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.timer-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, #00f5ff, #ff00ff, #00f5ff);
  animation: cardGlow 3s ease-in-out infinite;
}

@keyframes cardGlow {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
}

.timer-card:hover {
  transform: translateY(-8px);
  box-shadow: 
    0 0 40px rgba(0, 245, 255, 0.4),
    0 0 80px rgba(255, 0, 255, 0.2),
    inset 0 0 40px rgba(255, 255, 255, 0.1);
  border-color: rgba(0, 245, 255, 0.5);
}

.timer-display {
  margin-bottom: 40px;
}

.timer-circle {
  width: 300px;
  height: 300px;
  border-radius: 50%;
  margin: 0 auto;
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
  box-shadow: 
    0 0 30px rgba(0, 245, 255, 0.4),
    inset 0 0 30px rgba(0, 245, 255, 0.2);
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
  top: 20px;
  left: 20px;
  right: 20px;
  bottom: 20px;
  background: rgba(10, 10, 30, 0.95);
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 
    inset 0 0 30px rgba(0, 0, 0, 0.5),
    inset 0 0 50px rgba(0, 245, 255, 0.1);
  border: 2px solid rgba(0, 245, 255, 0.2);
}

.time-text {
  font-size: 52px;
  font-weight: 800;
  background: linear-gradient(135deg, #00f5ff 0%, #ff00ff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 8px;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
  letter-spacing: -2px;
  filter: drop-shadow(0 0 10px rgba(0, 245, 255, 0.5));
  text-shadow: 0 0 20px rgba(0, 245, 255, 0.8);
  animation: textGlow 3s ease-in-out infinite;
}

@keyframes textGlow {
  0%, 100% { 
    filter: drop-shadow(0 0 10px rgba(0, 245, 255, 0.5));
    text-shadow: 0 0 20px rgba(0, 245, 255, 0.8);
  }
  50% { 
    filter: drop-shadow(0 0 20px rgba(255, 0, 255, 0.8));
    text-shadow: 0 0 30px rgba(255, 0, 255, 1);
  }
}

.mode-text {
  font-size: 18px;
  color: #00f5ff;
  margin-bottom: 4px;
  font-weight: 700;
  text-shadow: 0 0 10px rgba(0, 245, 255, 0.8);
}

.session-info {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 600;
  text-shadow: 0 0 5px rgba(255, 255, 255, 0.5);
}

.timer-controls {
  margin-bottom: 30px;
}

.control-buttons {
  gap: 12px;
}

.control-buttons .el-button {
  padding: 12px 24px;
  border-radius: 25px;
  font-weight: 600;
  background: rgba(10, 10, 30, 0.8);
  border: 1px solid rgba(0, 245, 255, 0.5);
  color: #00f5ff;
  text-shadow: 0 0 10px rgba(0, 245, 255, 0.8);
  box-shadow: 
    0 0 15px rgba(0, 245, 255, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.control-buttons .el-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(0, 245, 255, 0.2), transparent);
  transition: left 0.5s ease;
}

.control-buttons .el-button:hover {
  background: rgba(0, 245, 255, 0.1);
  border-color: rgba(0, 245, 255, 0.8);
  box-shadow: 
    0 0 25px rgba(0, 245, 255, 0.4),
    0 5px 15px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.control-buttons .el-button:hover::before {
  left: 100%;
}

.control-buttons .el-button--primary {
  background: linear-gradient(135deg, #00f5ff, #0080ff);
  border-color: rgba(0, 245, 255, 0.8);
  color: white;
}

.control-buttons .el-button--primary:hover {
  background: linear-gradient(135deg, #00d4ff, #0066cc);
  box-shadow: 
    0 0 30px rgba(0, 245, 255, 0.6),
    0 8px 20px rgba(0, 0, 0, 0.3);
}

.mode-selector {
  margin-top: 20px;
}

.timer-sidebar {
  background: rgba(10, 10, 30, 0.8);
  backdrop-filter: blur(15px);
  border-left: 1px solid rgba(0, 245, 255, 0.3);
  padding: 20px;
  overflow-y: auto;
  position: relative;
}

.timer-sidebar::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, #00f5ff, transparent);
  animation: sidebarGlow 2s ease-in-out infinite;
}

@keyframes sidebarGlow {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
}

.settings-card,
.stats-card,
.tasks-card {
  background: rgba(10, 10, 30, 0.9);
  border: 1px solid rgba(0, 245, 255, 0.3);
  border-radius: 15px;
  margin-bottom: 20px;
  box-shadow: 
    0 0 20px rgba(0, 245, 255, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(15px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.settings-card::before,
.stats-card::before,
.tasks-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(0, 245, 255, 0.1), transparent);
  transition: left 0.5s ease;
}

.settings-card:hover,
.stats-card:hover,
.tasks-card:hover {
  transform: translateY(-3px);
  box-shadow: 
    0 0 30px rgba(0, 245, 255, 0.3),
    0 10px 40px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  border-color: rgba(0, 245, 255, 0.6);
}

.settings-card:hover::before,
.stats-card:hover::before,
.tasks-card:hover::before {
  left: 100%;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #00f5ff;
  text-shadow: 0 0 10px rgba(0, 245, 255, 0.8);
}

.settings-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.setting-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.setting-item label {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 600;
  text-shadow: 0 0 5px rgba(255, 255, 255, 0.5);
}

.stats-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: rgba(0, 245, 255, 0.05);
  border: 1px solid rgba(0, 245, 255, 0.2);
  border-radius: 8px;
  transition: all 0.3s ease;
}

.stat-item:hover {
  background: rgba(0, 245, 255, 0.1);
  border-color: rgba(0, 245, 255, 0.4);
  box-shadow: 0 0 15px rgba(0, 245, 255, 0.2);
}

.stat-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 18px;
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.3);
}

.work-stat {
  background: linear-gradient(135deg, #00f5ff, #0080ff);
}

.focus-stat {
  background: linear-gradient(135deg, #ff00ff, #8000ff);
}

.break-stat {
  background: linear-gradient(135deg, #00ff80, #00ffff);
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 20px;
  font-weight: 800;
  color: #00f5ff;
  text-shadow: 0 0 10px rgba(0, 245, 255, 0.8);
}

.stat-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 600;
  text-shadow: 0 0 5px rgba(255, 255, 255, 0.5);
}

.tasks-content {
  max-height: 300px;
  overflow-y: auto;
}

.empty-tasks {
  text-align: center;
  padding: 20px;
}

.task-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.task-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: rgba(0, 245, 255, 0.05);
  border: 1px solid rgba(0, 245, 255, 0.2);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  color: rgba(255, 255, 255, 0.9);
}

.task-item:hover {
  background: rgba(0, 245, 255, 0.1);
  border-color: rgba(0, 245, 255, 0.4);
  box-shadow: 0 0 15px rgba(0, 245, 255, 0.2);
  transform: translateX(5px);
}

.task-item.active {
  background: linear-gradient(135deg, #00f5ff, #0080ff);
  border-color: rgba(0, 245, 255, 0.8);
  color: white;
  box-shadow: 0 0 20px rgba(0, 245, 255, 0.4);
}

.task-content {
  flex: 1;
  min-width: 0;
}

.task-title {
  font-weight: 500;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.task-progress {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
}

.task-actions {
  display: flex;
  gap: 4px;
}

.completion-content {
  text-align: center;
  padding: 20px;
  background: rgba(10, 10, 30, 0.9);
  border-radius: 15px;
}

.completion-icon {
  font-size: 48px;
  color: #00f5ff;
  margin-bottom: 16px;
  text-shadow: 0 0 20px rgba(0, 245, 255, 0.8);
  animation: completionGlow 2s ease-in-out infinite;
}

@keyframes completionGlow {
  0%, 100% { 
    color: #00f5ff;
    text-shadow: 0 0 20px rgba(0, 245, 255, 0.8);
  }
  50% { 
    color: #ff00ff;
    text-shadow: 0 0 30px rgba(255, 0, 255, 1);
  }
}

.completion-text p {
  margin: 0;
  font-size: 16px;
  color: rgba(255, 255, 255, 0.9);
  text-shadow: 0 0 5px rgba(255, 255, 255, 0.5);
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .el-container {
    flex-direction: column;
  }
  
  .el-aside {
    width: 100% !important;
    height: auto;
    max-height: 40vh;
  }
  
  .timer-main {
    padding: 20px;
  }
  
  .timer-card {
    min-width: auto;
    padding: 20px;
  }
  
  .timer-circle {
    width: 250px;
    height: 250px;
  }
  
  .time-text {
    font-size: 36px;
  }
}
</style>