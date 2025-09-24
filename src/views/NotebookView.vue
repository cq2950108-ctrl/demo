<template>
  <div class="notebook-view">
    <!-- 装饰性背景图案 -->
    <div class="view-decorations">
      <div class="view-decoration view-decoration-1"></div>
      <div class="view-decoration view-decoration-2"></div>
      <div class="view-decoration view-decoration-3"></div>
      <div class="view-decoration view-decoration-4"></div>
    </div>
    
    <el-container>
      <!-- 左侧笔记列表 -->
      <el-aside width="350px" class="notebook-sidebar">
        <div class="sidebar-header">
          <h3>我的笔记</h3>
          <el-button type="primary" @click="createNewNote" :icon="Plus" circle />
        </div>
        
        <!-- 搜索框 -->
        <div class="search-section">
          <el-input
            v-model="searchQuery"
            placeholder="搜索笔记..."
            :prefix-icon="Search"
            clearable
            @input="handleSearch"
          />
        </div>
        
        <!-- 分类筛选 -->
        <div class="category-section">
          <el-select v-model="selectedCategory" placeholder="选择分类" clearable @change="handleCategoryFilter">
            <el-option label="全部" value="" />
            <el-option label="工作" value="work" />
            <el-option label="学习" value="study" />
            <el-option label="生活" value="life" />
            <el-option label="想法" value="idea" />
          </el-select>
        </div>
        
        <!-- 笔记列表 -->
        <div class="notes-list">
          <div
            v-for="note in filteredNotes"
            :key="note.id"
            class="note-item"
            :class="{ active: currentNote?.id === note.id }"
            @click="selectNote(note)"
          >
            <div class="note-header">
              <h4 class="note-title">{{ note.title || '无标题' }}</h4>
              <div class="note-actions">
                <el-button
                  type="danger"
                  :icon="Delete"
                  size="small"
                  circle
                  @click.stop="deleteNote(note.id)"
                />
              </div>
            </div>
            <p class="note-preview">{{ getPreview(note.content) }}</p>
            <div class="note-meta">
              <el-tag v-if="note.category" size="small" :type="getCategoryType(note.category)">
                {{ getCategoryLabel(note.category) }}
              </el-tag>
              <span class="note-date">{{ formatDate(note.updatedAt) }}</span>
            </div>
          </div>
        </div>
      </el-aside>
      
      <!-- 右侧编辑器 -->
      <el-main class="notebook-main">
        <div v-if="!currentNote" class="welcome-section">
          <div class="welcome-content">
            <el-icon size="64" class="welcome-icon"><Document /></el-icon>
            <h3>欢迎使用记事本</h3>
            <p>选择一个笔记开始编辑，或创建新的笔记</p>
            <el-button type="primary" @click="createNewNote" :icon="Plus">
              创建新笔记
            </el-button>
          </div>
        </div>
        
        <div v-else class="editor-section">
          <!-- 笔记标题 -->
          <div class="note-title-section">
            <el-input
              v-model="currentNote.title"
              placeholder="输入笔记标题..."
              class="title-input"
              @input="handleTitleChange"
            />
            <div class="note-toolbar">
              <el-select v-model="currentNote.category" placeholder="选择分类" @change="handleCategoryChange">
                <el-option label="工作" value="work" />
                <el-option label="学习" value="study" />
                <el-option label="生活" value="life" />
                <el-option label="想法" value="idea" />
              </el-select>
              <el-button @click="saveNote" type="primary" :icon="Check">保存</el-button>
            </div>
          </div>
          
          <!-- 文本编辑器 -->
          <div class="editor-container">
            <el-input
              v-model="currentNote.content"
              type="textarea"
              placeholder="开始写下你的想法..."
              :rows="20"
              resize="none"
              class="note-editor"
              @input="handleContentChange"
            />
          </div>
          
          <!-- 编辑器底部信息 -->
          <div class="editor-footer">
            <div class="word-count">
              字数: {{ getWordCount(currentNote.content) }}
            </div>
            <div class="last-saved">
              最后保存: {{ formatDate(currentNote.updatedAt) }}
            </div>
          </div>
        </div>
      </el-main>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Plus, Search, Delete, Document, Check } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { StorageService } from '../utils/storage'

interface Note {
  id: string
  title: string
  content: string
  category: string
  createdAt: Date
  updatedAt: Date
}

// 响应式数据
const notes = ref<Note[]>([])
const currentNote = ref<Note | null>(null)
const searchQuery = ref('')
const selectedCategory = ref('')
const isModified = ref(false)

// 计算属性
const filteredNotes = computed(() => {
  let filtered = notes.value
  
  // 按搜索关键词筛选
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(note => 
      note.title.toLowerCase().includes(query) ||
      note.content.toLowerCase().includes(query)
    )
  }
  
  // 按分类筛选
  if (selectedCategory.value) {
    filtered = filtered.filter(note => note.category === selectedCategory.value)
  }
  
  // 按更新时间排序
  return filtered.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
})

// 方法
const loadNotes = () => {
  const savedNotes = StorageService.getNotes()
  notes.value = savedNotes
}

const createNewNote = () => {
  const newNote: Note = {
    id: Date.now().toString(),
    title: '',
    content: '',
    category: '',
    createdAt: new Date(),
    updatedAt: new Date()
  }
  
  notes.value.unshift(newNote)
  currentNote.value = newNote
  isModified.value = true
}

const selectNote = (note: Note) => {
  if (isModified.value && currentNote.value) {
    ElMessageBox.confirm(
      '当前笔记有未保存的更改，是否保存？',
      '提示',
      {
        confirmButtonText: '保存',
        cancelButtonText: '不保存',
        type: 'warning'
      }
    ).then(() => {
      saveNote()
      currentNote.value = note
      isModified.value = false
    }).catch(() => {
      currentNote.value = note
      isModified.value = false
    })
  } else {
    currentNote.value = note
    isModified.value = false
  }
}

const saveNote = () => {
  if (!currentNote.value) return
  
  currentNote.value.updatedAt = new Date()
  StorageService.saveNotes(notes.value)
  isModified.value = false
  ElMessage.success('笔记已保存')
}

const deleteNote = (noteId: string) => {
  ElMessageBox.confirm(
    '确定要删除这个笔记吗？此操作不可恢复。',
    '删除确认',
    {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    notes.value = notes.value.filter(note => note.id !== noteId)
    if (currentNote.value?.id === noteId) {
      currentNote.value = null
    }
    StorageService.saveNotes(notes.value)
    ElMessage.success('笔记已删除')
  })
}

const handleSearch = () => {
  // 搜索逻辑已在计算属性中处理
}

const handleCategoryFilter = () => {
  // 分类筛选逻辑已在计算属性中处理
}

const handleTitleChange = () => {
  isModified.value = true
}

const handleContentChange = () => {
  isModified.value = true
}

const handleCategoryChange = () => {
  isModified.value = true
}

const getPreview = (content: string) => {
  return content.length > 100 ? content.substring(0, 100) + '...' : content
}

const getWordCount = (content: string) => {
  return content.length
}

const formatDate = (date: Date) => {
  return new Date(date).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getCategoryType = (category: string) => {
  const types: Record<string, string> = {
    work: 'danger',
    study: 'warning',
    life: 'success',
    idea: 'info'
  }
  return types[category] || 'info'
}

const getCategoryLabel = (category: string) => {
  const labels: Record<string, string> = {
    work: '工作',
    study: '学习',
    life: '生活',
    idea: '想法'
  }
  return labels[category] || category
}

// 生命周期
onMounted(() => {
  loadNotes()
})
</script>

<style scoped>
.notebook-view {
  height: calc(100vh - 60px);
  background: transparent;
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
  opacity: 0.05;
  animation: notebookFloat 28s infinite ease-in-out;
}

.view-decoration-1 {
  width: 260px;
  height: 260px;
  background: linear-gradient(45deg, #667eea, #764ba2);
  top: 12%;
  right: 12%;
  animation-delay: 0s;
}

.view-decoration-2 {
  width: 200px;
  height: 200px;
  background: linear-gradient(45deg, #ffecd2, #fcb69f);
  bottom: 25%;
  left: 8%;
  animation-delay: -9s;
}

.view-decoration-3 {
  width: 140px;
  height: 140px;
  background: linear-gradient(45deg, #a8edea, #fed6e3);
  top: 45%;
  left: 38%;
  animation-delay: -18s;
}

.view-decoration-4 {
  width: 180px;
  height: 180px;
  background: linear-gradient(45deg, #d299c2, #fef9d3);
  bottom: 8%;
  right: 28%;
  animation-delay: -6s;
}

@keyframes notebookFloat {
  0%, 100% {
    transform: translateY(0px) rotate(0deg) scale(1);
  }
  25% {
    transform: translateY(-22px) rotate(90deg) scale(1.04);
  }
  50% {
    transform: translateY(-40px) rotate(180deg) scale(0.96);
  }
  75% {
    transform: translateY(-18px) rotate(270deg) scale(1.02);
  }
}

.el-container {
  height: 100%;
  position: relative;
  z-index: 1;
}

/* 左侧边栏样式 */
.notebook-sidebar {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(15px);
  border-right: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 2px 0 20px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  padding: 1.5rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(255, 255, 255, 0.8);
}

.sidebar-header h3 {
  color: #111827;
  margin: 0;
  font-size: 1.2rem;
  font-weight: 700;
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.6);
}

.search-section {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.category-section {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.notes-list {
  flex: 1;
  overflow-y: auto;
  padding: 0.5rem;
}

.note-item {
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 0.5rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.note-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  border-color: rgba(102, 126, 234, 0.3);
}

.note-item.active {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1));
  border-color: #667eea;
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.2);
}

.note-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.5rem;
}

.note-title {
  color: #111827;
  font-size: 1rem;
  font-weight: 600;
  margin: 0;
  flex: 1;
  text-shadow: 0 1px 1px rgba(255, 255, 255, 0.5);
}

.note-actions {
  opacity: 0;
  transition: opacity 0.3s;
}

.note-item:hover .note-actions {
  opacity: 1;
}

.note-preview {
  color: #374151;
  font-size: 0.9rem;
  line-height: 1.4;
  margin: 0.5rem 0;
  font-weight: 500;
}

.note-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0.5rem;
}

.note-date {
  color: #6b7280;
  font-size: 0.8rem;
  font-weight: 500;
}

/* 右侧主区域样式 */
.notebook-main {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(15px);
  display: flex;
  flex-direction: column;
}

.welcome-section {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.welcome-content {
  text-align: center;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(15px);
  border-radius: 20px;
  padding: 3rem;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.welcome-icon {
  color: #667eea;
  margin-bottom: 1rem;
}

.welcome-content h3 {
  color: #111827;
  margin: 1rem 0;
  font-weight: 700;
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.6);
}

.welcome-content p {
  color: #374151;
  margin-bottom: 2rem;
  font-weight: 500;
}

.editor-section {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 1.5rem;
}

.note-title-section {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  align-items: center;
}

.title-input {
  flex: 1;
}

.title-input .el-input__wrapper {
  font-size: 1.2rem;
  font-weight: 600;
}

.note-toolbar {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.editor-container {
  flex: 1;
  margin-bottom: 1rem;
}

.note-editor .el-textarea__inner {
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, sans-serif;
  font-size: 1rem;
  line-height: 1.6;
  border-radius: 12px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.note-editor .el-textarea__inner:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2);
}

.editor-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  color: #6b7280;
  font-size: 0.9rem;
  font-weight: 500;
}

.word-count {
  color: #374151;
  font-weight: 600;
}

.last-saved {
  color: #6b7280;
}

/* 滚动条样式 */
.notes-list::-webkit-scrollbar {
  width: 6px;
}

.notes-list::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
}

.notes-list::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 3px;
}

.notes-list::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(135deg, #5a6fd8, #6a4190);
}
</style>