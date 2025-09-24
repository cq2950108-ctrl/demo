<template>
  <div class="ai-project-management">
    <!-- AI-native 背景效果 -->
    <div class="ai-background">
      <div class="neural-network">
        <div class="node" v-for="i in 20" :key="i" :style="getNodeStyle(i)"></div>
      </div>
      <div class="gradient-orbs">
        <div class="orb orb-1"></div>
        <div class="orb orb-2"></div>
        <div class="orb orb-3"></div>
      </div>
    </div>

    <!-- AI 助手浮动按钮 -->
    <div class="ai-assistant-fab" @click="toggleAIChat">
      <div class="ai-pulse"></div>
      <el-icon class="ai-icon"><ChatDotRound /></el-icon>
      <span class="ai-status">AI 助手</span>
    </div>

    <!-- AI 聊天界面 -->
    <transition name="slide-left">
      <div v-if="showAIChat" class="ai-chat-panel">
        <div class="chat-header">
          <div class="ai-avatar">
            <el-icon><Robot /></el-icon>
          </div>
          <div class="ai-info">
            <h3>AI 项目助手</h3>
            <span class="ai-status-text">在线 · 智能分析中</span>
          </div>
          <el-button text @click="toggleAIChat">
            <el-icon><Close /></el-icon>
          </el-button>
        </div>
        
        <div class="chat-messages" ref="chatMessages">
          <div v-for="message in chatMessages" :key="message.id" 
               :class="['message', message.type]">
            <div class="message-content">
              <div class="message-text">{{ message.text }}</div>
              <div class="message-time">{{ message.time }}</div>
            </div>
          </div>
        </div>
        
        <div class="chat-input">
          <el-input 
            v-model="chatInput" 
            placeholder="询问 AI 助手关于项目的任何问题..."
            @keyup.enter="sendMessage"
          >
            <template #suffix>
              <el-button text @click="sendMessage">
                <el-icon><Position /></el-icon>
              </el-button>
            </template>
          </el-input>
        </div>
        
        <div class="ai-suggestions">
          <div class="suggestion-title">智能建议</div>
          <div class="suggestions-list">
            <div v-for="suggestion in aiSuggestions" :key="suggestion.id" 
                 class="suggestion-item" @click="applySuggestion(suggestion)">
              <el-icon class="suggestion-icon"><Lightbulb /></el-icon>
              <span>{{ suggestion.text }}</span>
            </div>
          </div>
        </div>
      </div>
    </transition>
    
    <el-container class="ai-container">
      <!-- AI-native 头部 -->
      <el-header class="ai-header">
        <div class="header-content">
          <div class="title-section">
            <div class="ai-logo">
              <el-icon><MagicStick /></el-icon>
            </div>
            <div class="title-text">
              <h1 class="ai-title">AI 项目管理中心</h1>
              <p class="ai-subtitle">智能驱动 · 高效协作</p>
            </div>
          </div>
          <div class="header-actions">
            <el-button class="ai-button primary" @click="showCreateProjectDialog = true">
              <el-icon><Plus /></el-icon>
              智能创建项目
            </el-button>
            <el-button class="ai-button" @click="refreshData">
              <el-icon><Refresh /></el-icon>
              同步数据
            </el-button>
            <el-button class="ai-button" @click="generateInsights">
              <el-icon><TrendCharts /></el-icon>
              AI 洞察
            </el-button>
          </div>
        </div>
      </el-header>

      <el-main class="ai-main">
        <!-- AI 智能洞察面板 -->
        <div class="ai-insights-panel">
          <div class="insights-header">
            <h2>AI 智能洞察</h2>
            <div class="insights-status">
              <div class="status-indicator"></div>
              <span>实时分析中</span>
            </div>
          </div>
          <div class="insights-content">
            <div class="insight-item">
              <el-icon class="insight-icon"><TrendCharts /></el-icon>
              <div class="insight-text">
                <strong>项目进度预测：</strong>基于当前进度，预计本月将完成 {{ predictedCompletions }} 个项目
              </div>
            </div>
            <div class="insight-item">
              <el-icon class="insight-icon"><Warning /></el-icon>
              <div class="insight-text">
                <strong>风险提醒：</strong>{{ riskProjects.length }} 个项目存在延期风险，建议优先关注
              </div>
            </div>
            <div class="insight-item">
              <el-icon class="insight-icon"><Star /></el-icon>
              <div class="insight-text">
                <strong>效率建议：</strong>团队协作效率较上月提升 15%，建议继续保持
              </div>
            </div>
          </div>
        </div>

        <!-- AI 智能概览卡片 -->
        <div class="ai-overview-grid">
          <div class="ai-card smart-card">
            <div class="card-glow"></div>
            <div class="card-content">
              <div class="card-header">
                <div class="card-icon total-projects">
                  <el-icon><Folder /></el-icon>
                </div>
                <div class="card-trend">
                  <el-icon><ArrowUp /></el-icon>
                  <span>+12%</span>
                </div>
              </div>
              <div class="card-data">
                <div class="card-value">{{ stats.totalProjects }}</div>
                <div class="card-label">总项目数</div>
                <div class="card-description">较上月增长 2 个项目</div>
              </div>
            </div>
          </div>
          
          <div class="ai-card smart-card">
            <div class="card-glow"></div>
            <div class="card-content">
              <div class="card-header">
                <div class="card-icon active-projects">
                  <el-icon><Lightning /></el-icon>
                </div>
                <div class="card-trend positive">
                  <el-icon><ArrowUp /></el-icon>
                  <span>+8%</span>
                </div>
              </div>
              <div class="card-data">
                <div class="card-value">{{ stats.activeProjects }}</div>
                <div class="card-label">活跃项目</div>
                <div class="card-description">AI 预测完成率 85%</div>
              </div>
            </div>
          </div>
          
          <div class="ai-card smart-card">
            <div class="card-glow"></div>
            <div class="card-content">
              <div class="card-header">
                <div class="card-icon completed-tasks">
                  <el-icon><CircleCheck /></el-icon>
                </div>
                <div class="card-trend positive">
                  <el-icon><ArrowUp /></el-icon>
                  <span>+25%</span>
                </div>
              </div>
              <div class="card-data">
                <div class="card-value">{{ stats.completedTasks }}</div>
                <div class="card-label">已完成任务</div>
                <div class="card-description">效率提升显著</div>
              </div>
            </div>
          </div>
          
          <div class="ai-card smart-card">
            <div class="card-glow"></div>
            <div class="card-content">
              <div class="card-header">
                <div class="card-icon team-members">
                  <el-icon><User /></el-icon>
                </div>
                <div class="card-trend">
                  <el-icon><ArrowRight /></el-icon>
                  <span>稳定</span>
                </div>
              </div>
              <div class="card-data">
                <div class="card-value">{{ stats.teamMembers }}</div>
                <div class="card-label">团队成员</div>
                <div class="card-description">协作指数 9.2/10</div>
              </div>
            </div>
          </div>
        </div>

        <!-- AI 智能选项卡 -->
        <div class="ai-tabs-container">
          <el-tabs v-model="activeTab" class="ai-tabs">
            <!-- AI 智能任务管理 -->
            <el-tab-pane name="tasks">
              <template #label>
                <div class="tab-label">
                  <el-icon><List /></el-icon>
                  <span>智能任务</span>
                  <div class="tab-indicator"></div>
                </div>
              </template>
              <div class="ai-tab-content">
                <div class="tab-header">
                  <div class="header-left">
                    <h3>AI 智能任务管理</h3>
                    <div class="ai-features">
                      <span class="feature-tag">自动分配</span>
                      <span class="feature-tag">智能提醒</span>
                      <span class="feature-tag">进度预测</span>
                    </div>
                  </div>
                  <div class="header-actions">
                    <el-button class="ai-button primary" @click="showCreateTaskDialog = true">
                      <el-icon><Plus /></el-icon>
                      AI 创建任务
                    </el-button>
                    <el-button class="ai-button" @click="optimizeTasks">
                      <el-icon><MagicStick /></el-icon>
                      智能优化
                    </el-button>
                  </div>
                </div>
              
              <el-table :data="filteredTasks" style="width: 100%" empty-text="暂无任务">
                <el-table-column prop="title" label="任务标题" min-width="200" />
                <el-table-column prop="projectName" label="所属项目" width="120" />
                <el-table-column prop="assignee" label="负责人" width="100" />
                <el-table-column prop="priority" label="优先级" width="100">
                  <template #default="{ row }">
                    <el-tag :type="getPriorityType(row.priority)">{{ row.priority }}</el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="status" label="状态" width="100">
                  <template #default="{ row }">
                    <el-tag :type="getStatusType(row.status)">{{ row.status }}</el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="dueDate" label="截止日期" width="120" />
                <el-table-column label="操作" width="120">
                  <template #default="{ row }">
                    <el-button size="small" @click="editTask(row)">编辑</el-button>
                    <el-button size="small" type="danger" @click="deleteTask(row.id)">删除</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </el-tab-pane>

          <!-- 项目规划 -->
          <el-tab-pane label="项目规划" name="planning">
            <div class="tab-content">
              <div class="tab-header">
                <h3>项目规划</h3>
                <el-input
                  v-model="projectSearch"
                  placeholder="搜索项目..."
                  style="width: 200px"
                  :prefix-icon="Search"
                />
              </div>
              
              <div class="project-grid">
                <el-card 
                  v-for="project in filteredProjects" 
                  :key="project.id"
                  class="project-card"
                  :class="{ 'active': project.status === '进行中', 'completed': project.status === '已完成' }"
                >
                  <template #header>
                    <div class="project-card-header">
                      <h4>{{ project.name }}</h4>
                      <el-tag :type="project.status === '进行中' ? 'success' : project.status === '已完成' ? 'info' : 'warning'">
                        {{ project.status }}
                      </el-tag>
                    </div>
                  </template>
                  
                  <div class="project-card-content">
                    <p class="project-description">{{ project.description }}</p>
                    
                    <div class="project-meta">
                      <div class="meta-item">
                        <el-icon><Calendar /></el-icon>
                        <span>{{ project.startDate }} - {{ project.endDate }}</span>
                      </div>
                      <div class="meta-item">
                        <el-icon><User /></el-icon>
                        <span>{{ project.teamMembers.length }} 成员</span>
                      </div>
                      <div class="meta-item">
                        <el-icon><List /></el-icon>
                        <span>{{ project.completedTasks }}/{{ project.totalTasks }} 任务</span>
                      </div>
                    </div>
                    
                    <el-progress 
                      :percentage="Math.round((project.completedTasks / project.totalTasks) * 100)" 
                      :color="project.status === '进行中' ? '#67c23a' : '#909399'"
                    />
                    
                    <div class="project-actions">
                      <el-button size="small" @click="viewProject(project)">查看详情</el-button>
                      <el-button size="small" type="primary" @click="editProject(project)">编辑</el-button>
                    </div>
                  </div>
                </el-card>
              </div>
            </div>
          </el-tab-pane>

          <!-- 团队协作 -->
          <el-tab-pane label="团队协作" name="collaboration">
            <div class="tab-content">
              <div class="tab-header">
                <h3>团队协作</h3>
                <el-button type="primary" size="small" @click="showInviteDialog = true">
                  <el-icon><Plus /></el-icon>
                  邀请成员
                </el-button>
              </div>
              
              <el-table :data="teamMembers" style="width: 100%" empty-text="暂无团队成员">
                <el-table-column prop="name" label="成员姓名" width="120" />
                <el-table-column prop="email" label="邮箱" width="180" />
                <el-table-column prop="role" label="角色" width="100" />
                <el-table-column prop="projects" label="参与项目" min-width="150">
                  <template #default="{ row }">
                    <el-tag 
                      v-for="project in row.projects" 
                      :key="project" 
                      size="small" 
                      style="margin-right: 4px; margin-bottom: 4px"
                    >
                      {{ project }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="tasks" label="负责任务" width="80">
                  <template #default="{ row }">
                    {{ row.tasks }}
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="120">
                  <template #default="{ row }">
                    <el-button size="small" @click="editMember(row)">编辑</el-button>
                    <el-button size="small" type="danger" @click="removeMember(row.id)">移除</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </el-tab-pane>

          <!-- 进度追踪 -->
          <el-tab-pane label="进度追踪" name="tracking">
            <div class="tab-content">
              <div class="tab-header">
                <h3>进度追踪</h3>
                <el-select v-model="progressFilter" placeholder="筛选项目" style="width: 200px">
                  <el-option label="所有项目" value="all" />
                  <el-option 
                    v-for="project in projects" 
                    :key="project.id" 
                    :label="project.name" 
                    :value="project.id" 
                  />
                </el-select>
              </div>
              
              <div class="progress-charts">
                <el-card class="chart-card">
                  <template #header>
                    <div class="chart-header">
                      <h4>项目完成进度</h4>
                    </div>
                  </template>
                  <div class="chart-content">
                    <div 
                      v-for="project in filteredProgressProjects" 
                      :key="project.id"
                      class="progress-item"
                    >
                      <div class="progress-info">
                        <span class="project-name">{{ project.name }}</span>
                        <span class="progress-percentage">
                          {{ Math.round((project.completedTasks / project.totalTasks) * 100) }}%
                        </span>
                      </div>
                      <el-progress 
                        :percentage="Math.round((project.completedTasks / project.totalTasks) * 100)" 
                        :color="project.status === '进行中' ? '#67c23a' : '#909399'"
                      />
                    </div>
                  </div>
                </el-card>
                
                <el-card class="chart-card">
                  <template #header>
                    <div class="chart-header">
                      <h4>任务分布</h4>
                    </div>
                  </template>
                  <div class="chart-content">
                    <div class="task-stats">
                      <div class="stat-item">
                        <div class="stat-icon todo">
                          <el-icon><Clock /></el-icon>
                        </div>
                        <div class="stat-info">
                          <div class="stat-value">{{ taskStats.todo }}</div>
                          <div class="stat-label">待处理</div>
                        </div>
                      </div>
                      <div class="stat-item">
                        <div class="stat-icon progress">
                          <el-icon><Loading /></el-icon>
                        </div>
                        <div class="stat-info">
                          <div class="stat-value">{{ taskStats.inProgress }}</div>
                          <div class="stat-label">进行中</div>
                        </div>
                      </div>
                      <div class="stat-item">
                        <div class="stat-icon completed">
                          <el-icon><CircleCheck /></el-icon>
                        </div>
                        <div class="stat-info">
                          <div class="stat-value">{{ taskStats.completed }}</div>
                          <div class="stat-label">已完成</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </el-card>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
        </div>
      </el-main>
    </el-container>

    <!-- 新建项目对话框 -->
    <el-dialog 
      v-model="showCreateProjectDialog" 
      title="新建项目"
      width="500px"
    >
      <el-form :model="projectForm" label-width="80px">
        <el-form-item label="项目名称">
          <el-input v-model="projectForm.name" placeholder="请输入项目名称" />
        </el-form-item>
        <el-form-item label="项目描述">
          <el-input 
            v-model="projectForm.description" 
            type="textarea" 
            :rows="3" 
            placeholder="请输入项目描述" 
          />
        </el-form-item>
        <el-form-item label="开始日期">
          <el-date-picker 
            v-model="projectForm.startDate" 
            type="date" 
            placeholder="选择开始日期" 
          />
        </el-form-item>
        <el-form-item label="结束日期">
          <el-date-picker 
            v-model="projectForm.endDate" 
            type="date" 
            placeholder="选择结束日期" 
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showCreateProjectDialog = false">取消</el-button>
          <el-button type="primary" @click="createProject">创建</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 新建任务对话框 -->
    <el-dialog 
      v-model="showCreateTaskDialog" 
      title="新建任务"
      width="500px"
    >
      <el-form :model="taskForm" label-width="80px">
        <el-form-item label="任务标题">
          <el-input v-model="taskForm.title" placeholder="请输入任务标题" />
        </el-form-item>
        <el-form-item label="所属项目">
          <el-select v-model="taskForm.projectId" placeholder="选择项目">
            <el-option 
              v-for="project in projects" 
              :key="project.id" 
              :label="project.name" 
              :value="project.id" 
            />
          </el-select>
        </el-form-item>
        <el-form-item label="负责人">
          <el-select v-model="taskForm.assignee" placeholder="选择负责人">
            <el-option 
              v-for="member in teamMembers" 
              :key="member.id" 
              :label="member.name" 
              :value="member.name" 
            />
          </el-select>
        </el-form-item>
        <el-form-item label="优先级">
          <el-select v-model="taskForm.priority" placeholder="选择优先级">
            <el-option label="高" value="高" />
            <el-option label="中" value="中" />
            <el-option label="低" value="低" />
          </el-select>
        </el-form-item>
        <el-form-item label="截止日期">
          <el-date-picker 
            v-model="taskForm.dueDate" 
            type="date" 
            placeholder="选择截止日期" 
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showCreateTaskDialog = false">取消</el-button>
          <el-button type="primary" @click="createTask">创建</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 邀请成员对话框 -->
    <el-dialog 
      v-model="showInviteDialog" 
      title="邀请团队成员"
      width="400px"
    >
      <el-form :model="inviteForm" label-width="80px">
        <el-form-item label="邮箱地址">
          <el-input v-model="inviteForm.email" placeholder="请输入邮箱地址" />
        </el-form-item>
        <el-form-item label="角色">
          <el-select v-model="inviteForm.role" placeholder="选择角色">
            <el-option label="成员" value="member" />
            <el-option label="管理员" value="admin" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showInviteDialog = false">取消</el-button>
          <el-button type="primary" @click="sendInvitation">发送邀请</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, nextTick } from 'vue'
import { 
  Plus, 
  Refresh, 
  Folder, 
  TrendCharts, 
  CircleCheck, 
  User,
  MagicStick,
  Lightning,
  ArrowUp,
  ArrowRight,
  Warning,
  Star,
  ChatDotRound,
  Monitor,
  Close,
  Position,
  Sunny, 
  Search, 
  Calendar, 
  List, 
  Clock, 
  Loading 
} from '@element-plus/icons-vue'
import { ElMessage, ElNotification } from 'element-plus'

interface Project {
  id: string
  name: string
  description: string
  status: '未开始' | '进行中' | '已完成' | '已暂停'
  startDate: string
  endDate: string
  teamMembers: string[]
  totalTasks: number
  completedTasks: number
}

interface Task {
  id: string
  title: string
  projectId: string
  projectName: string
  assignee: string
  priority: '高' | '中' | '低'
  status: '待处理' | '进行中' | '已完成' | '已延期'
  dueDate: string
  createdAt: string
}

interface TeamMember {
  id: string
  name: string
  email: string
  role: 'admin' | 'member'
  projects: string[]
  tasks: number
}

interface ProjectStats {
  totalProjects: number
  activeProjects: number
  completedTasks: number
  teamMembers: number
}

interface TaskStats {
  todo: number
  inProgress: number
  completed: number
}

interface ChatMessage {
  id: number
  type: string
  text: string
  time: string
  isThinking?: boolean
}

const activeTab = ref('tasks')
const showCreateProjectDialog = ref(false)
const showCreateTaskDialog = ref(false)
const showInviteDialog = ref(false)
const projectSearch = ref('')
const progressFilter = ref('all')

// AI 功能相关数据
const showAIChat = ref(false)
const chatInput = ref('')
const chatMessages = ref<ChatMessage[]>([
  {
    id: 1,
    type: 'ai',
    text: '您好！我是您的 AI 项目助手。我可以帮助您分析项目进度、预测风险、优化任务分配。有什么可以帮助您的吗？',
    time: '刚刚'
  }
])

const aiSuggestions = ref([
  { id: 1, text: '分析当前项目风险', action: 'analyze_risks' },
  { id: 2, text: '优化任务分配', action: 'optimize_tasks' },
  { id: 3, text: '预测项目完成时间', action: 'predict_completion' },
  { id: 4, text: '生成项目报告', action: 'generate_report' }
])

const predictedCompletions = ref(3)
const riskProjects = ref([
  { id: 1, name: '项目A', risk: '高' },
  { id: 2, name: '项目B', risk: '中' }
])

const projects = ref<Project[]>([])
const tasks = ref<Task[]>([])
const teamMembers = ref<TeamMember[]>([])

const stats = reactive<ProjectStats>({
  totalProjects: 0,
  activeProjects: 0,
  completedTasks: 0,
  teamMembers: 0
})

const taskStats = reactive<TaskStats>({
  todo: 0,
  inProgress: 0,
  completed: 0
})

const projectForm = reactive({
  name: '',
  description: '',
  startDate: '',
  endDate: ''
})

const taskForm = reactive({
  title: '',
  projectId: '',
  assignee: '',
  priority: '中' as '高' | '中' | '低',
  dueDate: ''
})

const inviteForm = reactive({
  email: '',
  role: 'member' as 'admin' | 'member'
})

// 计算属性
const filteredProjects = computed(() => {
  if (!projectSearch.value) return projects.value
  return projects.value.filter(project => 
    project.name.toLowerCase().includes(projectSearch.value.toLowerCase()) ||
    project.description.toLowerCase().includes(projectSearch.value.toLowerCase())
  )
})

const filteredTasks = computed(() => {
  return tasks.value
})

const filteredProgressProjects = computed(() => {
  if (progressFilter.value === 'all') return projects.value
  return projects.value.filter(project => project.id === progressFilter.value)
})

// AI 功能方法
const toggleAIChat = () => {
  showAIChat.value = !showAIChat.value
}

const sendMessage = () => {
  if (!chatInput.value.trim()) return
  
  // 添加用户消息
  chatMessages.value.push({
    id: Date.now(),
    type: 'user',
    text: chatInput.value,
    time: new Date().toLocaleTimeString()
  })
  
  const userMessage = chatInput.value.toLowerCase()
  chatInput.value = ''
  
  // 显示AI正在思考
  const thinkingId = Date.now() + 1
  chatMessages.value.push({
    id: thinkingId,
    type: 'ai',
    text: '🤔 AI正在分析...',
    time: new Date().toLocaleTimeString(),
    isThinking: true
  })
  
  // 滚动到底部
  nextTick(() => {
    const chatContainer = document.querySelector('.chat-messages')
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight
    }
  })
  
  // 模拟 AI 回复
  setTimeout(() => {
    // 移除思考消息
    chatMessages.value = chatMessages.value.filter(msg => msg.id !== thinkingId)
    
    let aiResponse = ''
    let newSuggestions = []
    
    if (userMessage.includes('风险') || userMessage.includes('问题') || userMessage.includes('危险')) {
      aiResponse = `🔍 **风险分析报告**\n\n根据AI深度分析，发现以下关键风险：\n\n⚠️ **高风险项目**\n• ${riskProjects.value.length > 0 ? riskProjects.value[0] : '电商平台重构 - 延期风险85%'}\n• ${riskProjects.value.length > 1 ? riskProjects.value[1] : '移动端适配 - 资源不足风险72%'}\n\n📊 **风险指标**\n• 整体风险等级：中高\n• 预计影响：项目延期2-3周\n• 建议优先级：立即处理\n\n💡 **智能建议**\n点击下方建议快速应用解决方案`
      newSuggestions = [
        { id: 1, text: '重新分配关键资源', action: 'reallocate_resources' },
        { id: 2, text: '调整项目优先级', action: 'adjust_priority' },
        { id: 3, text: '增加人力投入', action: 'add_resources' },
        { id: 4, text: '优化工作流程', action: 'optimize_workflow' }
      ]
    } else if (userMessage.includes('进度') || userMessage.includes('完成') || userMessage.includes('状态')) {
      const completionRate = Math.round((stats.completedTasks / (stats.completedTasks + taskStats.todo + taskStats.inProgress)) * 100) || 67
      aiResponse = `📈 **智能进度分析**\n\n🎯 **总体概况**\n• 项目完成度：${completionRate}%\n• 任务完成率：${stats.completedTasks}/${stats.completedTasks + taskStats.todo + taskStats.inProgress}\n• 团队效率：+15% ↗️\n\n⏰ **时间预测**\n• 预计完成：${predictedCompletions.value}天后\n• 关键路径：UI设计→开发→测试\n• 里程碑状态：按计划进行\n\n🚀 **效率洞察**\n当前团队表现优秀，建议保持现有节奏`
      newSuggestions = [
        { id: 1, text: '生成详细进度报告', action: 'generate_report' },
        { id: 2, text: '设置智能提醒', action: 'set_reminders' },
        { id: 3, text: '优化任务排序', action: 'optimize_tasks' },
        { id: 4, text: '预测风险点', action: 'predict_risks' }
      ]
    } else if (userMessage.includes('优化') || userMessage.includes('建议') || userMessage.includes('改进')) {
      aiResponse = `🧠 **AI智能优化方案**\n\n🎯 **核心建议**\n\n1️⃣ **智能任务分配**\n• 基于技能匹配度自动分配\n• 工作负载均衡优化\n• 效率提升预期：+25%\n\n2️⃣ **流程自动化**\n• 智能代码审查\n• 自动化测试部署\n• 减少重复工作60%\n\n3️⃣ **预测性维护**\n• 提前识别瓶颈\n• 智能资源调度\n• 风险预警系统`
      newSuggestions = [
        { id: 1, text: '启用智能分配', action: 'enable_smart_allocation' },
        { id: 2, text: '设置自动化流程', action: 'setup_automation' },
        { id: 3, text: '开启预测分析', action: 'enable_prediction' },
        { id: 4, text: '优化团队协作', action: 'optimize_collaboration' }
      ]
    } else if (userMessage.includes('团队') || userMessage.includes('成员') || userMessage.includes('协作')) {
      aiResponse = `👥 **团队协作分析**\n\n🌟 **团队表现**\n• 协作效率：92%\n• 沟通质量：优秀\n• 技能互补度：85%\n\n📊 **成员状态**\n• 活跃成员：${stats.teamMembers}/10\n• 工作负载：均衡\n• 满意度：4.6/5.0\n\n🔧 **优化建议**\n• 增强跨部门协作\n• 定期技能培训\n• 改进沟通工具`
      newSuggestions = [
        { id: 1, text: '查看成员详情', action: 'view_members' },
        { id: 2, text: '优化任务分配', action: 'optimize_tasks' },
        { id: 3, text: '安排技能培训', action: 'schedule_training' },
        { id: 4, text: '改进协作流程', action: 'improve_workflow' }
      ]
    } else if (userMessage.includes('报告') || userMessage.includes('数据') || userMessage.includes('统计')) {
      aiResponse = `📊 **智能数据报告**\n\n📈 **关键指标**\n• 项目成功率：94.2%\n• 平均交付时间：-12%\n• 客户满意度：4.8/5.0\n• 团队生产力：+18%\n\n🎯 **趋势分析**\n• 本月效率提升显著\n• 质量指标持续改善\n• 创新项目增长35%\n\n💡 **洞察发现**\nAI发现您的团队在敏捷开发方面表现突出`
      newSuggestions = [
        { id: 1, text: '导出详细报告', action: 'export_report' },
        { id: 2, text: '设置定期分析', action: 'schedule_analysis' },
        { id: 3, text: '创建仪表板', action: 'create_dashboard' },
        { id: 4, text: '分享团队成果', action: 'share_results' }
      ]
    } else {
      aiResponse = `🤖 **AI项目助手已就绪**\n\n我是您的智能项目管理助手，具备以下能力：\n\n🔍 **智能分析**\n• 项目风险评估\n• 进度预测分析\n• 团队效率优化\n\n🎯 **自动化服务**\n• 任务智能分配\n• 工作流程优化\n• 实时数据监控\n\n💡 **决策支持**\n• 数据驱动建议\n• 趋势预测\n• 最佳实践推荐\n\n请告诉我您需要什么帮助？`
      newSuggestions = [
        { id: 1, text: '分析项目风险', action: 'analyze_risks' },
        { id: 2, text: '查看进度报告', action: 'view_progress' },
        { id: 3, text: '优化团队协作', action: 'optimize_collaboration' },
        { id: 4, text: '生成数据洞察', action: 'generate_insights' }
      ]
    }
    
    chatMessages.value.push({
      id: Date.now(),
      type: 'ai',
      text: aiResponse,
      time: new Date().toLocaleTimeString()
    })
    
    // 更新建议
    aiSuggestions.value = newSuggestions
    
    // 滚动到底部
    nextTick(() => {
      const chatContainer = document.querySelector('.chat-messages')
      if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight
      }
    })
  }, 1500)
}

const applySuggestion = (suggestion: any) => {
  ElMessage.success(`✨ 已应用AI建议: ${suggestion.text}`)
  
  // 添加应用建议的消息到聊天
  chatMessages.value.push({
    id: Date.now(),
    type: 'ai',
    text: `✅ 已为您应用建议："${suggestion.text}"\n\n系统正在后台执行相关优化，您将在几分钟内看到改进效果。`,
    time: new Date().toLocaleTimeString()
  })
  
  // 模拟具体的建议应用逻辑
  setTimeout(() => {
    if (suggestion.text.includes('分配') || suggestion.text.includes('资源')) {
      // 模拟任务重新分配
      ElNotification({
        title: 'AI优化完成',
        message: '任务已根据团队成员技能和工作负载重新智能分配',
        type: 'success',
        duration: 3000
      })
    } else if (suggestion.text.includes('报告') || suggestion.text.includes('分析')) {
      // 模拟生成报告
      ElNotification({
        title: '报告生成中',
        message: 'AI正在生成详细分析报告，预计2分钟完成',
        type: 'info',
        duration: 3000
      })
    } else if (suggestion.text.includes('优化') || suggestion.text.includes('流程')) {
      // 模拟流程优化
      ElNotification({
        title: '流程优化完成',
        message: '工作流程已优化，预计效率提升25%',
        type: 'success',
        duration: 3000
      })
    } else if (suggestion.text.includes('预测') || suggestion.text.includes('风险')) {
      // 模拟风险预测
      ElNotification({
        title: '风险预测更新',
        message: 'AI已更新风险预测模型，新的预警已生效',
        type: 'warning',
        duration: 3000
      })
    }
  }, 2000)
  
  // 滚动到底部
  nextTick(() => {
    const chatContainer = document.querySelector('.chat-messages')
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight
    }
  })
}

const generateInsights = () => {
  ElMessage.info('🧠 AI正在深度分析项目数据...')
  
  // 模拟生成洞察过程
  setTimeout(() => {
    ElNotification({
      title: 'AI洞察生成完成',
      message: '发现3个优化机会和2个潜在风险，已更新到洞察面板',
      type: 'success',
      duration: 4000
    })
    
    // 更新洞察数据
    predictedCompletions.value = Math.floor(Math.random() * 10) + 15
    riskProjects.value = [
      { id: 1, name: '电商平台重构', risk: '延期风险' },
      { id: 2, name: '移动端适配', risk: '资源不足' }
    ]
    
    // 添加洞察消息到聊天
    chatMessages.value.push({
      id: Date.now(),
      type: 'ai',
      text: `🔍 **AI洞察生成完成**\n\n✨ **新发现**\n• 识别出3个效率优化机会\n• 检测到2个潜在项目风险\n• 团队协作模式分析完成\n\n📊 **关键洞察**\n• 建议调整任务优先级\n• 优化资源分配策略\n• 加强风险监控机制\n\n数据已更新到洞察面板，请查看详细分析。`,
      time: new Date().toLocaleTimeString()
    })
    
    // 滚动到底部
    nextTick(() => {
      const chatContainer = document.querySelector('.chat-messages')
      if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight
      }
    })
  }, 3000)
}

const optimizeTasks = () => {
  ElMessage.info('⚡ AI正在优化任务分配和工作流程...')
  
  // 模拟任务优化过程
  setTimeout(() => {
    ElNotification({
      title: '智能优化完成',
      message: '任务分配已优化，预计效率提升25%，工作负载更加均衡',
      type: 'success',
      duration: 4000
    })
    
    // 添加优化消息到聊天
    chatMessages.value.push({
      id: Date.now(),
      type: 'ai',
      text: `⚡ **任务优化完成**\n\n🎯 **优化结果**\n• 任务分配算法已更新\n• 工作负载重新平衡\n• 技能匹配度提升40%\n\n📈 **预期效果**\n• 整体效率提升25%\n• 项目完成时间缩短3天\n• 团队满意度预计提升\n\n🔄 **自动化改进**\n• 启用智能任务推荐\n• 优化工作流程\n• 增强协作机制`,
      time: new Date().toLocaleTimeString()
    })
    
    // 可以在这里更新任务数据
    updateStats()
    
    // 滚动到底部
    nextTick(() => {
      const chatContainer = document.querySelector('.chat-messages')
      if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight
      }
    })
  }, 2500)
}

const getNodeStyle = (index: number) => {
  const angle = (index * 360) / 20
  const radius = 100 + Math.sin(index) * 50
  return {
    left: `${50 + Math.cos(angle * Math.PI / 180) * radius}px`,
    top: `${50 + Math.sin(angle * Math.PI / 180) * radius}px`,
    animationDelay: `${index * 0.1}s`
  }
}

// 方法
const refreshData = () => {
  loadProjects()
  loadTasks()
  loadTeamMembers()
  updateStats()
  ElMessage.success('数据已刷新')
}

const loadProjects = () => {
  // 从存储加载项目数据
  const saved = localStorage.getItem('projects')
  if (saved) {
    projects.value = JSON.parse(saved)
  }
}

const loadTasks = () => {
  // 从存储加载任务数据
  const saved = localStorage.getItem('project_tasks')
  if (saved) {
    tasks.value = JSON.parse(saved)
  }
}

const loadTeamMembers = () => {
  // 从存储加载团队成员数据
  const saved = localStorage.getItem('team_members')
  if (saved) {
    teamMembers.value = JSON.parse(saved)
  }
}

const updateStats = () => {
  stats.totalProjects = projects.value.length
  stats.activeProjects = projects.value.filter(p => p.status === '进行中').length
  stats.completedTasks = tasks.value.filter(t => t.status === '已完成').length
  stats.teamMembers = teamMembers.value.length
  
  taskStats.todo = tasks.value.filter(t => t.status === '待处理').length
  taskStats.inProgress = tasks.value.filter(t => t.status === '进行中').length
  taskStats.completed = tasks.value.filter(t => t.status === '已完成').length
}

const createProject = () => {
  if (!projectForm.name.trim()) {
    ElMessage.warning('请输入项目名称')
    return
  }
  
  const newProject: Project = {
    id: Date.now().toString(),
    name: projectForm.name,
    description: projectForm.description,
    status: '未开始',
    startDate: projectForm.startDate,
    endDate: projectForm.endDate,
    teamMembers: [],
    totalTasks: 0,
    completedTasks: 0
  }
  
  projects.value.push(newProject)
  saveProjects()
  showCreateProjectDialog.value = false
  resetProjectForm()
  ElMessage.success('项目创建成功')
}

const createTask = () => {
  if (!taskForm.title.trim()) {
    ElMessage.warning('请输入任务标题')
    return
  }
  
  const project = projects.value.find(p => p.id === taskForm.projectId)
  if (!project) {
    ElMessage.warning('请选择有效的项目')
    return
  }
  
  const newTask: Task = {
    id: Date.now().toString(),
    title: taskForm.title,
    projectId: taskForm.projectId,
    projectName: project.name,
    assignee: taskForm.assignee,
    priority: taskForm.priority,
    status: '待处理',
    dueDate: taskForm.dueDate,
    createdAt: new Date().toISOString().split('T')[0]
  }
  
  tasks.value.push(newTask)
  project.totalTasks++
  saveTasks()
  saveProjects()
  showCreateTaskDialog.value = false
  resetTaskForm()
  ElMessage.success('任务创建成功')
}

const sendInvitation = () => {
  if (!inviteForm.email.trim()) {
    ElMessage.warning('请输入邮箱地址')
    return
  }
  
  const newMember: TeamMember = {
    id: Date.now().toString(),
    name: inviteForm.email.split('@')[0],
    email: inviteForm.email,
    role: inviteForm.role,
    projects: [],
    tasks: 0
  }
  
  teamMembers.value.push(newMember)
  saveTeamMembers()
  showInviteDialog.value = false
  resetInviteForm()
  ElMessage.success('邀请已发送')
}

const editProject = (project: Project) => {
  // 实现编辑项目逻辑
  console.log('编辑项目:', project)
  ElMessage.info('编辑项目功能待实现')
}

const viewProject = (project: Project) => {
  // 实现查看项目详情逻辑
  console.log('查看项目:', project)
  ElMessage.info('查看项目详情功能待实现')
}

const editTask = (task: Task) => {
  // 实现编辑任务逻辑
  console.log('编辑任务:', task)
  ElMessage.info('编辑任务功能待实现')
}

const deleteTask = (taskId: string) => {
  const index = tasks.value.findIndex(t => t.id === taskId)
  if (index !== -1) {
    tasks.value.splice(index, 1)
    saveTasks()
    ElMessage.success('任务删除成功')
  }
}

const editMember = (member: TeamMember) => {
  // 实现编辑成员逻辑
  console.log('编辑成员:', member)
  ElMessage.info('编辑成员功能待实现')
}

const removeMember = (memberId: string) => {
  const index = teamMembers.value.findIndex(m => m.id === memberId)
  if (index !== -1) {
    teamMembers.value.splice(index, 1)
    saveTeamMembers()
    ElMessage.success('成员移除成功')
  }
}

const getPriorityType = (priority: string) => {
  switch (priority) {
    case '高': return 'danger'
    case '中': return 'warning'
    case '低': return 'info'
    default: return ''
  }
}

const getStatusType = (status: string) => {
  switch (status) {
    case '待处理': return 'info'
    case '进行中': return 'warning'
    case '已完成': return 'success'
    case '已延期': return 'danger'
    default: return ''
  }
}

const resetProjectForm = () => {
  projectForm.name = ''
  projectForm.description = ''
  projectForm.startDate = ''
  projectForm.endDate = ''
}

const resetTaskForm = () => {
  taskForm.title = ''
  taskForm.projectId = ''
  taskForm.assignee = ''
  taskForm.priority = '中'
  taskForm.dueDate = ''
}

const resetInviteForm = () => {
  inviteForm.email = ''
  inviteForm.role = 'member'
}

const saveProjects = () => {
  localStorage.setItem('projects', JSON.stringify(projects.value))
}

const saveTasks = () => {
  localStorage.setItem('project_tasks', JSON.stringify(tasks.value))
}

const saveTeamMembers = () => {
  localStorage.setItem('team_members', JSON.stringify(teamMembers.value))
}

// 生命周期
onMounted(() => {
  loadProjects()
  loadTasks()
  loadTeamMembers()
  updateStats()
})
</script>

<style scoped>
/* AI-native 主容器 */
.ai-project-management {
  min-height: 100vh;
  background: #0a0a1e;
  position: relative;
  overflow: hidden;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

/* 动态背景层 */
.ai-project-management::before {
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
.ai-project-management::after {
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

/* AI 背景效果 */
.ai-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

/* 网格背景 */
.neural-network {
  position: absolute;
  width: 100%;
  height: 100%;
  opacity: 0.15;
  background-image: 
    linear-gradient(rgba(0, 245, 255, 0.1) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 245, 255, 0.1) 1px, transparent 1px);
  background-size: 50px 50px;
  animation: gridMove 30s linear infinite;
}

@keyframes gridMove {
  0% { transform: translate(0, 0); }
  100% { transform: translate(50px, 50px); }
}

.node {
  position: absolute;
  width: 4px;
  height: 4px;
  background: linear-gradient(45deg, #00f5ff, #ff00ff);
  border-radius: 50%;
  animation: nodeFloat 8s infinite ease-in-out;
  box-shadow: 0 0 10px currentColor;
}

@keyframes nodeFloat {
  0%, 100% { transform: translateY(0px) scale(1); opacity: 0.3; }
  50% { transform: translateY(-20px) scale(1.2); opacity: 0.8; }
}

/* 渐变光球 */
.gradient-orbs {
  position: absolute;
  width: 100%;
  height: 100%;
}

.orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(40px);
  animation: orbFloat 20s infinite ease-in-out;
}

.orb-1 {
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, rgba(0, 245, 255, 0.4) 0%, transparent 70%);
  top: 10%;
  right: 10%;
  animation-delay: 0s;
  filter: blur(60px);
}

.orb-2 {
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, rgba(255, 0, 255, 0.3) 0%, transparent 70%);
  bottom: 20%;
  left: 5%;
  animation-delay: -7s;
  filter: blur(80px);
}

.orb-3 {
  width: 350px;
  height: 350px;
  background: radial-gradient(circle, rgba(0, 255, 127, 0.35) 0%, transparent 70%);
  top: 50%;
  left: 50%;
  animation-delay: -14s;
  filter: blur(70px);
}

@keyframes orbFloat {
  0%, 100% { 
    transform: translate(0, 0) scale(1);
    opacity: 0.4;
  }
  33% { 
    transform: translate(-50px, -70px) scale(1.2);
    opacity: 0.6;
  }
  66% { 
    transform: translate(50px, -50px) scale(0.8);
    opacity: 0.3;
  }
}

/* 装饰性背景图案 */
/* AI 助手浮动按钮 */
.ai-assistant-fab {
  position: fixed;
  bottom: 30px;
  right: 30px;
  width: 70px;
  height: 70px;
  background: linear-gradient(135deg, #00f5ff, #ff00ff);
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 1000;
  transition: all 0.3s ease;
  box-shadow: 
    0 0 20px rgba(0, 245, 255, 0.5),
    0 0 40px rgba(255, 0, 255, 0.3),
    inset 0 0 20px rgba(255, 255, 255, 0.1);
  animation: fabPulse 3s infinite ease-in-out;
  border: 2px solid rgba(255, 255, 255, 0.2);
}

.ai-assistant-fab:hover {
  transform: scale(1.15) rotate(10deg);
  box-shadow: 
    0 0 30px rgba(0, 245, 255, 0.8),
    0 0 60px rgba(255, 0, 255, 0.5),
    inset 0 0 30px rgba(255, 255, 255, 0.2);
}

.ai-pulse {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: linear-gradient(135deg, #00f5ff, #ff00ff);
  opacity: 0.3;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { transform: scale(1); opacity: 0.3; }
  50% { transform: scale(1.2); opacity: 0.1; }
  100% { transform: scale(1.4); opacity: 0; }
}

@keyframes fabPulse {
  0%, 100% { 
    box-shadow: 
      0 0 20px rgba(0, 245, 255, 0.5),
      0 0 40px rgba(255, 0, 255, 0.3),
      inset 0 0 20px rgba(255, 255, 255, 0.1);
  }
  50% { 
    box-shadow: 
      0 0 30px rgba(0, 245, 255, 0.8),
      0 0 60px rgba(255, 0, 255, 0.5),
      0 0 0 15px rgba(0, 245, 255, 0.1),
      inset 0 0 30px rgba(255, 255, 255, 0.2);
  }
}

.ai-icon {
  font-size: 28px;
  color: white;
  z-index: 1;
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.8);
}

.ai-status {
  font-size: 10px;
  color: white;
  margin-top: 2px;
  z-index: 1;
}

/* AI 聊天面板 */
.ai-chat-panel {
  position: fixed;
  top: 0;
  right: 0;
  width: 400px;
  height: 100vh;
  background: rgba(10, 10, 30, 0.95);
  backdrop-filter: blur(20px);
  border-left: 1px solid rgba(0, 245, 255, 0.2);
  z-index: 999;
  display: flex;
  flex-direction: column;
  box-shadow: -10px 0 50px rgba(0, 0, 0, 0.5);
}

.chat-header {
  padding: 20px;
  border-bottom: 1px solid rgba(0, 245, 255, 0.1);
  display: flex;
  align-items: center;
  gap: 15px;
}

.ai-avatar {
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, #00f5ff, #ff00ff);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: white;
}

.ai-info h3 {
  color: white;
  margin: 0;
  font-size: 16px;
}

.ai-status-text {
  color: #00f5ff;
  font-size: 12px;
}

.chat-messages {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.message {
  display: flex;
  align-items: flex-start;
}

.message.user {
  justify-content: flex-end;
}

.message.ai {
  justify-content: flex-start;
}

.message-content {
  max-width: 80%;
  padding: 12px 16px;
  border-radius: 18px;
  position: relative;
}

.message.user .message-content {
  background: linear-gradient(135deg, #00f5ff, #0080ff);
  color: white;
}

.message.ai .message-content {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(0, 245, 255, 0.2);
  color: white;
}

.message-text {
  font-size: 14px;
  line-height: 1.4;
}

.message-time {
  font-size: 10px;
  opacity: 0.7;
  margin-top: 5px;
}

.chat-input {
  padding: 20px;
  border-top: 1px solid rgba(0, 245, 255, 0.1);
}

.ai-suggestions {
  padding: 20px;
  border-top: 1px solid rgba(0, 245, 255, 0.1);
}

.suggestion-title {
  color: white;
  font-size: 14px;
  margin-bottom: 10px;
  font-weight: 600;
}

.suggestions-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.suggestion-item {
  padding: 8px 12px;
  background: rgba(0, 245, 255, 0.1);
  border: 1px solid rgba(0, 245, 255, 0.2);
  border-radius: 8px;
  color: white;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.suggestion-item:hover {
  background: rgba(0, 245, 255, 0.2);
  transform: translateX(5px);
}

.suggestion-icon {
  font-size: 14px;
  color: #00f5ff;
}

/* 滑动动画 */
.slide-left-enter-active,
.slide-left-leave-active {
  transition: transform 0.3s ease;
}

.slide-left-enter-from {
  transform: translateX(100%);
}

.slide-left-leave-to {
  transform: translateX(100%);
}

.view-decoration {
  position: absolute;
  border-radius: 50%;
  opacity: 0.05;
  animation: viewFloat 25s infinite ease-in-out;
}

.view-decoration-1 {
  width: 300px;
  height: 300px;
  background: linear-gradient(45deg, #ff9a9e, #fecfef);
  top: 20%;
  right: 10%;
  animation-delay: 0s;
}

.view-decoration-2 {
  width: 200px;
  height: 200px;
  background: linear-gradient(45deg, #a8edea, #fed6e3);
  bottom: 30%;
  left: 5%;
  animation-delay: -8s;
}

.view-decoration-3 {
  width: 150px;
  height: 150px;
  background: linear-gradient(45deg, #ffecd2, #fcb69f);
  top: 10%;
  left: 30%;
  animation-delay: -15s;
}

@keyframes viewFloat {
  0%, 100% {
    transform: translateY(0px) rotate(0deg) scale(1);
  }
  33% {
    transform: translateY(-30px) rotate(120deg) scale(1.1);
  }
  66% {
    transform: translateY(-15px) rotate(240deg) scale(0.9);
  }
}

.project-container {
  height: 100%;
  position: relative;
  z-index: 2;
  padding: 20px;
}

/* AI 智能头部 */
.ai-header {
  background: rgba(10, 10, 30, 0.8);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(0, 245, 255, 0.2);
  border-radius: 20px;
  padding: 30px;
  margin-bottom: 30px;
  position: relative;
  overflow: hidden;
}

.ai-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, #00f5ff, #ff00ff, #00f5ff);
  animation: headerGlow 3s ease-in-out infinite;
}

@keyframes headerGlow {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
}

.ai-header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.ai-title-section {
  display: flex;
  align-items: center;
  gap: 20px;
}

.ai-logo {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #00f5ff, #ff00ff);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  color: white;
  animation: logoSpin 10s linear infinite;
}

@keyframes logoSpin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.ai-title-text h1 {
  color: white;
  font-size: 28px;
  margin: 0;
  background: linear-gradient(135deg, #00f5ff, #ff00ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.ai-subtitle {
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  margin-top: 5px;
}

.ai-actions {
  display: flex;
  gap: 15px;
}

.ai-action-btn {
  padding: 12px 20px;
  background: rgba(0, 245, 255, 0.1);
  border: 1px solid rgba(0, 245, 255, 0.3);
  border-radius: 12px;
  color: #00f5ff;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.ai-action-btn:hover {
  background: rgba(0, 245, 255, 0.2);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 245, 255, 0.3);
}

/* AI 智能洞察面板 */
.ai-insights-panel {
  background: rgba(10, 10, 30, 0.8);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(0, 245, 255, 0.2);
  border-radius: 20px;
  padding: 30px;
  margin-bottom: 30px;
  position: relative;
}

.insights-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 25px;
}

.insights-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.insights-title h2 {
  color: white;
  font-size: 20px;
  margin: 0;
}

.insights-icon {
  font-size: 24px;
  color: #00f5ff;
}

.insights-status {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #00ff88;
  font-size: 12px;
}

.status-dot {
  width: 8px;
  height: 8px;
  background: #00ff88;
  border-radius: 50%;
  animation: statusPulse 2s infinite;
}

@keyframes statusPulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

.insights-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.insight-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(0, 245, 255, 0.1);
  border-radius: 15px;
  padding: 20px;
  transition: all 0.3s ease;
}

.insight-card:hover {
  transform: translateY(-5px);
  border-color: rgba(0, 245, 255, 0.3);
  box-shadow: 0 10px 30px rgba(0, 245, 255, 0.1);
}

.insight-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 15px;
}

.insight-icon {
  font-size: 20px;
}

.insight-icon.prediction { color: #00f5ff; }
.insight-icon.risk { color: #ff4757; }
.insight-icon.efficiency { color: #00ff88; }

.insight-title {
  color: white;
  font-size: 16px;
  font-weight: 600;
  margin: 0;
}

.insight-content {
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  line-height: 1.5;
  margin-bottom: 15px;
}

.insight-metrics {
  display: flex;
  gap: 15px;
}

.metric {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
}

.metric-value {
  font-size: 18px;
  font-weight: bold;
  color: #00f5ff;
}

.metric-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
}

/* AI 智能概览卡片 */
.ai-overview-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.ai-overview-card {
  background: rgba(10, 10, 30, 0.8);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(0, 245, 255, 0.2);
  border-radius: 15px;
  padding: 25px;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
}

.ai-overview-card:hover {
  transform: translateY(-5px);
  border-color: rgba(0, 245, 255, 0.4);
  box-shadow: 0 15px 40px rgba(0, 245, 255, 0.1);
}

.ai-overview-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, #00f5ff, transparent);
  animation: cardGlow 3s ease-in-out infinite;
}

@keyframes cardGlow {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 1; }
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.card-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.card-icon {
  font-size: 24px;
  color: #00f5ff;
}

.card-title h3 {
  color: white;
  font-size: 16px;
  margin: 0;
  font-weight: 600;
}

.card-trend {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
}

.trend-up {
  color: #00ff88;
}

.trend-down {
  color: #ff4757;
}

.card-value {
  font-size: 32px;
  font-weight: bold;
  color: white;
  margin-bottom: 10px;
  background: linear-gradient(135deg, #00f5ff, #ff00ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.card-description {
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  line-height: 1.4;
}

/* AI 智能任务管理 */
.ai-task-management {
  background: rgba(10, 10, 30, 0.8);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(0, 245, 255, 0.2);
  border-radius: 20px;
  padding: 30px;
  margin-bottom: 30px;
}

.ai-tabs {
  display: flex;
  gap: 20px;
  margin-bottom: 30px;
  border-bottom: 1px solid rgba(0, 245, 255, 0.1);
}

.ai-tab {
  padding: 15px 25px;
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  font-size: 16px;
  font-weight: 500;
}

.ai-tab.active {
  color: #00f5ff;
}

.ai-tab.active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, #00f5ff, #ff00ff);
  border-radius: 1px;
}

.ai-tab:hover {
  color: white;
}

.task-actions {
  display: flex;
  gap: 15px;
  margin-bottom: 25px;
}

.ai-task-btn {
  padding: 12px 20px;
  background: rgba(0, 245, 255, 0.1);
  border: 1px solid rgba(0, 245, 255, 0.3);
  border-radius: 12px;
  color: #00f5ff;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.ai-task-btn:hover {
  background: rgba(0, 245, 255, 0.2);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 245, 255, 0.3);
}

.ai-task-btn.primary {
  background: linear-gradient(135deg, #00f5ff, #0080ff);
  border: none;
  color: white;
}

.ai-task-btn.primary:hover {
  background: linear-gradient(135deg, #00d4ff, #0066cc);
}

.task-features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 25px;
}

.feature-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(0, 245, 255, 0.1);
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  transition: all 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-3px);
  border-color: rgba(0, 245, 255, 0.3);
}

.feature-icon {
  font-size: 32px;
  color: #00f5ff;
  margin-bottom: 15px;
}

.feature-title {
  color: white;
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 10px;
}

.feature-description {
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  line-height: 1.4;
}

.project-header {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  padding: 0 40px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
}

.view-title {
  color: white;
  margin: 0;
  font-size: 24px;
  font-weight: 600;
}

.project-main {
  padding: 20px 40px;
  overflow-y: auto;
}

.overview-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 20px;
}

.project-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
}

.project-card {
  background: rgba(255, 255, 255, 0.98);
  border: none;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(102, 126, 234, 0.1);
  transition: all 0.3s ease;
}

.project-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 32px rgba(102, 126, 234, 0.15);
}

.project-card.active {
  border-left: 4px solid #67c23a;
}

.project-card.completed {
  border-left: 4px solid #909399;
}

.project-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.project-card-content {
  padding: 0 20px 20px;
}

.project-description {
  color: #606266;
  margin-bottom: 15px;
  line-height: 1.5;
}

.project-meta {
  margin-bottom: 15px;
}

.meta-item {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  color: #909399;
  font-size: 12px;
}

.meta-item .el-icon {
  margin-right: 6px;
}

.project-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 15px;
}

.progress-charts {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.chart-card {
  background: rgba(255, 255, 255, 0.98);
  border: none;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(102, 126, 234, 0.1);
}

.chart-header {
  padding: 20px 20px 0;
}

.chart-content {
  padding: 20px;
}

.progress-item {
  margin-bottom: 15px;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.project-name {
  font-weight: 500;
  color: #303133;
}

.progress-percentage {
  font-weight: bold;
  color: #67c23a;
}

.task-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.stat-item {
  display: flex;
  align-items: center;
  padding: 20px;
  background: rgba(102, 126, 234, 0.1);
  border-radius: 12px;
}

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
  font-size: 20px;
}

.stat-icon.todo {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
}

.stat-icon.progress {
  background: linear-gradient(135deg, #4ecdc4, #44a08d);
  color: white;
}

.stat-icon.completed {
  background: linear-gradient(135deg, #f093fb, #f5576c);
  color: white;
}

.stat-value {
  font-size: 20px;
  font-weight: bold;
  color: #2c3e50;
}

.stat-label {
  font-size: 12px;
  color: #7f8c8d;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .overview-cards {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .progress-charts {
    grid-template-columns: 1fr;
  }
  
  .task-stats {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .overview-cards {
    grid-template-columns: 1fr;
  }
  
  .project-grid {
    grid-template-columns: 1fr;
  }
  
  .header-content {
    flex-direction: column;
    gap: 15px;
  }
  
  .project-main {
    padding: 20px;
  }
}
</style> 30px;
}

.overview-card {
  background: rgba(255, 255, 255, 0.95);
  border: none;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(102, 126, 234, 0.1);
  backdrop-filter: blur(20px);
  transition: all 0.3s ease;
}

.overview-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(102, 126, 234, 0.15);
}

.card-content {
  display: flex;
  align-items: center;
  padding: 20px;
}

.card-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
  font-size: 24px;
}

.card-icon.total-projects {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
}

.card-icon.active-projects {
  background: linear-gradient(135deg, #4ecdc4, #44a08d);
  color: white;
}

.card-icon.completed-tasks {
  background: linear-gradient(135deg, #f093fb, #f5576c);
  color: white;
}

.card-icon.team-members {
  background: linear-gradient(135deg, #f6d365, #fda085);
  color: white;
}

.card-value {
  font-size: 24px;
  font-weight: bold;
  color: #2c3e50;
}

.card-label {
  font-size: 14px;
  color: #7f8c8d;
}

.project-tabs {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 8px 32px rgba(102, 126, 234, 0.1);
  backdrop-filter: blur(20px);
}

.tab-content {
  padding: 20px 0;
}

.tab-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .overview-cards {
    grid-template-columns: repeat(2, 1fr);
    gap: 15px;
  }
  
  .project-grid {
    grid-template-columns: 1fr;
    gap: 15px;
  }
  
  .project-main {
    padding: 15px 20px;
  }
}

@media (max-width: 480px) {
  .overview-cards {
    grid-template-columns: 1fr;
  }
  
  .header-content {
    flex-direction: column;
    gap: 15px;
  }
  
  .header-actions {
    width: 100%;
    justify-content: center;
  }
}