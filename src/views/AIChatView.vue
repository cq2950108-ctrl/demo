<template>
  <div class="ai-chat-view">
    <!-- 装饰性背景图案 -->
    <div class="view-decorations">
      <div class="view-decoration view-decoration-1"></div>
      <div class="view-decoration view-decoration-2"></div>
      <div class="view-decoration view-decoration-3"></div>
      <div class="view-decoration view-decoration-4"></div>
    </div>
    
    <el-container>
      <!-- 侧边栏 - 搜索历史和快捷操作 -->
      <el-aside width="300px" class="chat-sidebar">
        <el-card class="sidebar-card">
          <template #header>
            <div class="sidebar-header">
              <el-icon><ChatDotRound /></el-icon>
              <span>AI 助手</span>
            </div>
          </template>
          
          <!-- 快捷搜索 -->
          <div class="quick-search">
            <h4>快捷搜索</h4>
            <el-button-group class="search-buttons">
              <el-button size="small" @click="quickSearch('今天的任务')">
                <el-icon><Calendar /></el-icon>
                今日任务
              </el-button>
              <el-button size="small" @click="quickSearch('重要事项')">
                <el-icon><Star /></el-icon>
                重要事项
              </el-button>
            </el-button-group>
            <el-button-group class="search-buttons">
              <el-button size="small" @click="quickSearch('最近记录')">
                <el-icon><Clock /></el-icon>
                最近记录
              </el-button>
              <el-button size="small" @click="quickSearch('数据统计')">
                <el-icon><DataAnalysis /></el-icon>
                数据分析
              </el-button>
            </el-button-group>
          </div>

          <!-- 搜索历史 -->
          <div class="search-history">
            <h4>搜索历史</h4>
            <div class="history-list">
              <div 
                v-for="(item, index) in searchHistory" 
                :key="index"
                class="history-item"
                @click="selectHistoryItem(item)"
              >
                <el-icon><Search /></el-icon>
                <span class="history-text">{{ item.query }}</span>
                <span class="history-time">{{ formatTime(item.timestamp) }}</span>
              </div>
            </div>
          </div>
        </el-card>
      </el-aside>

      <!-- 主聊天区域 -->
      <el-main class="chat-main">
        <el-card class="chat-card">
          <!-- 聊天消息区域 -->
          <div class="chat-messages" ref="messagesContainer">
            <div v-if="messages.length === 0" class="welcome-message">
              <div class="welcome-content">
                <el-icon class="welcome-icon"><Avatar /></el-icon>
                <h3>AI 智能助手</h3>
                <p>我可以帮您搜索和分析所有的记事本数据、待办事项和相关信息</p>
                <div class="example-queries">
                  <el-tag 
                    v-for="example in exampleQueries" 
                    :key="example"
                    class="example-tag"
                    @click="sendMessage(example)"
                  >
                    {{ example }}
                  </el-tag>
                </div>
              </div>
            </div>

            <div 
              v-for="(message, index) in messages" 
              :key="index"
              class="message-item"
              :class="{ 'user-message': message.type === 'user', 'ai-message': message.type === 'ai' }"
            >
              <div class="message-avatar">
                <el-avatar v-if="message.type === 'user'" :size="32">
                  <el-icon><User /></el-icon>
                </el-avatar>
                <el-avatar v-else :size="32" class="ai-avatar">
                  <el-icon><Avatar /></el-icon>
                </el-avatar>
              </div>
              <div class="message-content">
                <div class="message-text" v-html="formatMessage(message.content)"></div>
                <div class="message-time">{{ formatTime(message.timestamp) }}</div>
                <!-- 搜索结果展示 -->
                <div v-if="message.searchResults" class="search-results">
                  <h5>相关数据：</h5>
                  <div class="result-list">
                    <div 
                      v-for="(result, idx) in message.searchResults" 
                      :key="idx"
                      class="result-item"
                      @click="openResult(result)"
                    >
                      <el-icon class="result-icon">
                        <Document v-if="result.type === 'note'" />
                        <Calendar v-else-if="result.type === 'task'" />
                        <DataAnalysis v-else />
                      </el-icon>
                      <div class="result-content">
                        <div class="result-title">{{ result.title }}</div>
                        <div class="result-snippet">{{ result.snippet }}</div>
                        <div class="result-meta">
                          <el-tag size="small" :type="getResultTagType(result.type)">{{ result.type }}</el-tag>
                          <span class="result-date">{{ formatDate(result.date) }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- AI 思考中状态 -->
            <div v-if="isThinking" class="message-item ai-message">
              <div class="message-avatar">
                <el-avatar :size="32" class="ai-avatar">
                  <el-icon><Avatar /></el-icon>
                </el-avatar>
              </div>
              <div class="message-content">
                <div class="thinking-indicator">
                  <el-icon class="thinking-icon"><Loading /></el-icon>
                  <span>AI 正在思考...</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 输入区域 -->
          <div class="chat-input">
            <el-input
              v-model="currentMessage"
              type="textarea"
              :rows="2"
              placeholder="请输入您的问题，我会帮您搜索相关的记事本数据..."
              @keydown.enter.prevent="handleEnterKey"
              :disabled="isThinking"
            />
            <div class="input-actions">
              <el-button 
                type="primary" 
                @click="sendMessage()"
                :loading="isThinking"
                :disabled="!currentMessage.trim()"
              >
                <el-icon><Promotion /></el-icon>
                发送
              </el-button>
              <el-button @click="clearChat">
                <el-icon><Delete /></el-icon>
                清空
              </el-button>
            </div>
          </div>
        </el-card>
      </el-main>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { 
  ChatDotRound, 
  Avatar, 
  User, 
  Search, 
  Calendar, 
  Star, 
  Clock, 
  DataAnalysis,
  Document,
  Loading,
  Promotion,
  Delete
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { StorageService } from '@/utils/storage'

interface Message {
  type: 'user' | 'ai'
  content: string
  timestamp: number
  searchResults?: SearchResult[]
}

interface SearchResult {
  type: 'note' | 'task' | 'data'
  title: string
  snippet: string
  date: string
  id: string
  score: number
}

interface HistoryItem {
  query: string
  timestamp: number
}

const messages = ref<Message[]>([])
const currentMessage = ref('')
const isThinking = ref(false)
const messagesContainer = ref<HTMLElement>()
const searchHistory = ref<HistoryItem[]>([])

const exampleQueries = [
  '今天有什么重要任务？',
  '最近一周的数据记录',
  '帮我找找关于工作的记录',
  '统计本月完成的任务数量'
]

// 加载搜索历史
onMounted(() => {
  loadSearchHistory()
})

// 发送消息
const sendMessage = async (message?: string) => {
  const messageText = message || currentMessage.value.trim()
  if (!messageText) return

  // 添加用户消息
  messages.value.push({
    type: 'user',
    content: messageText,
    timestamp: Date.now()
  })

  // 保存到搜索历史
  addToSearchHistory(messageText)

  // 清空输入
  currentMessage.value = ''
  
  // 显示AI思考状态
  isThinking.value = true
  await nextTick()
  scrollToBottom()

  try {
    // 执行搜索
    const searchResults = await performSearch(messageText)
    
    // 生成AI回复
    const aiResponse = generateAIResponse(messageText, searchResults)
    
    // 添加AI回复
    messages.value.push({
      type: 'ai',
      content: aiResponse,
      timestamp: Date.now(),
      searchResults: searchResults
    })
  } catch (error) {
    console.error('AI搜索错误:', error)
    messages.value.push({
      type: 'ai',
      content: '抱歉，搜索过程中出现了错误，请稍后再试。',
      timestamp: Date.now()
    })
  } finally {
    isThinking.value = false
    await nextTick()
    scrollToBottom()
  }
}

// 执行智能搜索
const performSearch = async (query: string): Promise<SearchResult[]> => {
  const results: SearchResult[] = []
  
  try {
    // 搜索待办事项
    const tasks = StorageService.getTasks() || []
    const taskResults = searchInTasks(query, tasks)
    results.push(...taskResults)
    
    // 搜索业务数据记录
    const businessData = StorageService.getBusinessData() || []
    const dataResults = searchInBusinessData(query, businessData)
    results.push(...dataResults)
    
    // 按相关性排序
    results.sort((a, b) => b.score - a.score)
    
    return results.slice(0, 10) // 返回前10个最相关的结果
  } catch (error) {
    console.error('搜索数据时出错:', error)
    return []
  }
}

// 在任务中搜索
const searchInTasks = (query: string, tasks: any[]): SearchResult[] => {
  const results: SearchResult[] = []
  const keywords = query.toLowerCase().split(' ')
  
  tasks.forEach(task => {
    let score = 0
    const searchText = `${task.title} ${task.description || ''}`.toLowerCase()
    
    keywords.forEach(keyword => {
      if (searchText.includes(keyword)) {
        score += keyword.length
      }
    })
    
    if (score > 0) {
      results.push({
        type: 'task',
        title: task.title,
        snippet: task.description || '无描述',
        date: task.due_date || task.created_at,
        id: task.id,
        score
      })
    }
  })
  
  return results
}

// 在业务数据中搜索
const searchInBusinessData = (query: string, records: any[]): SearchResult[] => {
  const results: SearchResult[] = []
  const keywords = query.toLowerCase().split(' ')
  
  records.forEach(record => {
    let score = 0
    const searchText = `${record.content || ''} ${record.category || ''} ${record.tags || ''}`.toLowerCase()
    
    keywords.forEach(keyword => {
      if (searchText.includes(keyword)) {
        score += keyword.length
      }
    })
    
    if (score > 0) {
      results.push({
        type: 'data',
        title: `${record.category || '数据记录'} - ${formatDate(record.created_at)}`,
        snippet: record.content || '无内容',
        date: record.created_at,
        id: record.id,
        score
      })
    }
  })
  
  return results
}

// 生成AI回复
const generateAIResponse = (query: string, results: SearchResult[]): string => {
  if (results.length === 0) {
    return `很抱歉，我没有找到与"${query}"相关的信息。您可以尝试使用不同的关键词进行搜索。`
  }
  
  const taskCount = results.filter(r => r.type === 'task').length
  const dataCount = results.filter(r => r.type === 'data').length
  
  let response = `根据您的查询"${query}"，我找到了 ${results.length} 条相关信息：\n\n`
  
  if (taskCount > 0) {
    response += `📋 任务相关：${taskCount} 条\n`
  }
  if (dataCount > 0) {
    response += `📊 数据记录：${dataCount} 条\n`
  }
  
  response += '\n您可以点击下方的搜索结果查看详细信息。'
  
  return response
}

// 快捷搜索
const quickSearch = (query: string) => {
  sendMessage(query)
}

// 选择历史记录
const selectHistoryItem = (item: HistoryItem) => {
  currentMessage.value = item.query
}

// 添加到搜索历史
const addToSearchHistory = (query: string) => {
  const newItem: HistoryItem = {
    query,
    timestamp: Date.now()
  }
  
  // 避免重复
  const existingIndex = searchHistory.value.findIndex(item => item.query === query)
  if (existingIndex !== -1) {
    searchHistory.value.splice(existingIndex, 1)
  }
  
  searchHistory.value.unshift(newItem)
  
  // 限制历史记录数量
  if (searchHistory.value.length > 20) {
    searchHistory.value = searchHistory.value.slice(0, 20)
  }
  
  saveSearchHistory()
}

// 保存搜索历史
const saveSearchHistory = () => {
  localStorage.setItem('ai_search_history', JSON.stringify(searchHistory.value))
}

// 加载搜索历史
const loadSearchHistory = () => {
  try {
    const saved = localStorage.getItem('ai_search_history')
    if (saved) {
      searchHistory.value = JSON.parse(saved)
    }
  } catch (error) {
    console.error('加载搜索历史失败:', error)
  }
}

// 处理回车键
const handleEnterKey = (event: KeyboardEvent) => {
  if (!event.shiftKey) {
    sendMessage()
  }
}

// 清空聊天
const clearChat = () => {
  messages.value = []
  ElMessage.success('聊天记录已清空')
}

// 滚动到底部
const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

// 格式化消息
const formatMessage = (content: string) => {
  return content.replace(/\n/g, '<br>')
}

// 格式化时间
const formatTime = (timestamp: number) => {
  return new Date(timestamp).toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 格式化日期
const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('zh-CN')
}

// 获取结果标签类型
const getResultTagType = (type: string) => {
  switch (type) {
    case 'task': return 'primary'
    case 'data': return 'success'
    default: return 'info'
  }
}

// 打开搜索结果
const openResult = (result: SearchResult) => {
  // 这里可以实现跳转到具体的数据页面
  ElMessage.info(`打开${result.title}`)
}
</script>

<style scoped>
.ai-chat-view {
  height: calc(100vh - 60px);
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
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
  opacity: 0.06;
  animation: chatFloat 30s infinite ease-in-out;
}

.view-decoration-1 {
  width: 250px;
  height: 250px;
  background: linear-gradient(45deg, #667eea, #764ba2);
  top: 15%;
  right: 15%;
  animation-delay: 0s;
}

.view-decoration-2 {
  width: 180px;
  height: 180px;
  background: linear-gradient(45deg, #f093fb, #f5576c);
  bottom: 25%;
  left: 10%;
  animation-delay: -10s;
}

.view-decoration-3 {
  width: 120px;
  height: 120px;
  background: linear-gradient(45deg, #4facfe, #00f2fe);
  top: 40%;
  left: 40%;
  animation-delay: -20s;
}

.view-decoration-4 {
  width: 200px;
  height: 200px;
  background: linear-gradient(45deg, #43e97b, #38f9d7);
  bottom: 10%;
  right: 5%;
  animation-delay: -5s;
}

@keyframes chatFloat {
  0%, 100% {
    transform: translateY(0px) rotate(0deg) scale(1);
  }
  25% {
    transform: translateY(-25px) rotate(90deg) scale(1.05);
  }
  50% {
    transform: translateY(-50px) rotate(180deg) scale(0.95);
  }
  75% {
    transform: translateY(-25px) rotate(270deg) scale(1.02);
  }
}

.el-container {
  height: 100%;
}

.chat-sidebar {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(15px);
  border-right: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px 0 0 20px;
}

.sidebar-card {
  height: 100%;
  background: transparent;
  border: none;
  border-radius: 20px 0 0 20px;
  box-shadow: none;
}

.sidebar-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 700;
  color: #1f2937;
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.6);
}

.quick-search {
  margin-bottom: 24px;
}

.quick-search h4 {
  margin: 0 0 12px 0;
  color: #111827;
  font-size: 14px;
  font-weight: 700;
  text-shadow: 0 1px 1px rgba(255, 255, 255, 0.5);
}

.search-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 8px;
}

.search-buttons .el-button {
  flex: 1;
  min-width: 120px;
  margin: 3px;
  border-radius: 12px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.search-buttons .el-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.search-history h4 {
  margin: 0 0 12px 0;
  color: #111827;
  font-size: 14px;
  font-weight: 700;
  text-shadow: 0 1px 1px rgba(255, 255, 255, 0.5);
}

.history-list {
  max-height: 300px;
  overflow-y: auto;
}

.history-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.history-item:hover {
  background-color: #f5f7fa;
}

.history-text {
  flex: 1;
  font-size: 13px;
  color: #374151;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.history-time {
  font-size: 11px;
  color: #c0c4cc;
}

.chat-main {
  padding: 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 0 20px 20px 0;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.chat-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: rgba(255, 255, 255, 0.95);
  border: none;
}

.chat-messages {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  max-height: calc(100vh - 200px);
}

.welcome-message {
  text-align: center;
  padding: 60px 20px;
}

.welcome-content {
  max-width: 500px;
  margin: 0 auto;
}

.welcome-icon {
  font-size: 48px;
  color: #409eff;
  margin-bottom: 16px;
}

.welcome-content h3 {
  margin: 0 0 12px 0;
  color: #111827;
  font-weight: 700;
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.6);
}

.welcome-content p {
  margin: 0 0 24px 0;
  color: #374151;
  font-weight: 500;
  line-height: 1.6;
}

.example-queries {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
}

.example-tag {
  cursor: pointer;
  transition: all 0.2s;
}

.example-tag:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.message-item {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  padding: 16px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.message-item:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.15);
}

.user-message {
  flex-direction: row-reverse;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  border: 1px solid rgba(102, 126, 234, 0.2);
}

.user-message .message-content {
  background: linear-gradient(135deg, #409eff, #67c23a);
  color: white;
  margin-left: 60px;
}

.ai-message .message-content {
  background: #f5f7fa;
  color: #1f2937;
  font-weight: 500;
  text-shadow: 0 1px 1px rgba(255, 255, 255, 0.8);
  margin-right: 60px;
}

.message-avatar {
  flex-shrink: 0;
}

.ai-avatar {
  background: linear-gradient(135deg, #409eff, #67c23a);
  color: white;
}

.message-content {
  flex: 1;
  padding: 12px 16px;
  border-radius: 12px;
  position: relative;
}

.message-text {
  line-height: 1.6;
  margin-bottom: 4px;
}

.message-time {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.7);
  text-align: right;
}

.ai-message .message-time {
  color: #c0c4cc;
}

.thinking-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #909399;
}

.thinking-icon {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.search-results {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
}

.ai-message .search-results {
  border-top-color: #e4e7ed;
}

.search-results h5 {
  margin: 0 0 8px 0;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.9);
}

.ai-message .search-results h5 {
  color: #606266;
}

.result-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.result-item {
  display: flex;
  gap: 8px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  margin-bottom: 12px;
}

.ai-message .result-item {
  background: rgba(0, 0, 0, 0.05);
}

.result-item:hover {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  border-color: #667eea;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.2);
}

.ai-message .result-item:hover {
  background: rgba(0, 0, 0, 0.1);
}

.result-icon {
  flex-shrink: 0;
  margin-top: 2px;
}

.result-content {
  flex: 1;
  min-width: 0;
}

.result-title {
  font-weight: 700;
  font-size: 13px;
  color: #111827;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-shadow: 0 1px 1px rgba(255, 255, 255, 0.5);
}

.result-snippet {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ai-message .result-snippet {
  color: #909399;
}

.result-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.result-date {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.6);
}

.ai-message .result-date {
  color: #c0c4cc;
}

.chat-input {
  padding: 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.5);
  border-radius: 0 0 20px 0;
}

.input-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 12px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .el-aside {
    width: 100% !important;
    height: auto;
  }
  
  .el-container {
    flex-direction: column;
  }
  
  .chat-messages {
    max-height: 50vh;
  }
  
  .message-content {
    margin-left: 0 !important;
    margin-right: 0 !important;
  }
}
</style>