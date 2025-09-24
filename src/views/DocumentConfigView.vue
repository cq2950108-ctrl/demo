<template>
  <div class="document-config-view">
    <el-card class="config-header-card">
      <template #header>
        <div class="card-header">
          <span>在线文档配置</span>
          <el-button type="primary" @click="showAddDialog = true">
            <el-icon><DocumentAdd /></el-icon>
            添加文档配置
          </el-button>
        </div>
      </template>
      
      <div class="config-stats">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-statistic title="总配置数" :value="documentConfigs.length" />
          </el-col>
          <el-col :span="6">
            <el-statistic title="活跃配置" :value="activeConfigsCount" />
          </el-col>
          <el-col :span="6">
            <el-statistic title="自动同步" :value="autoSyncConfigsCount" />
          </el-col>
          <el-col :span="6">
            <el-statistic title="最近同步" :value="recentSyncCount" />
          </el-col>
        </el-row>
      </div>
    </el-card>

    <el-row :gutter="20">
      <el-col :span="16">
        <el-card class="config-list-card">
          <template #header>
            <div class="card-header">
              <span>文档配置列表</span>
              <div>
                <el-button @click="checkSystemConfig" type="info" size="small">
                  <el-icon><Setting /></el-icon>
                  系统诊断
                </el-button>
                <el-button @click="refreshConfigs">
                  <el-icon><Refresh /></el-icon>
                  刷新
                </el-button>
              </div>
            </div>
          </template>
          
          <div class="config-list">
            <div v-if="documentConfigs.length === 0" class="empty-state">
              <el-empty description="暂无文档配置" />
            </div>
            
            <div v-else>
              <div 
                v-for="config in documentConfigs" 
                :key="config.id" 
                class="config-item"
                :class="{ active: config.isActive }"
              >
                <div class="config-header">
                  <div class="config-info">
                    <h4>{{ config.name }}</h4>
                    <el-tag :type="getDocumentTypeColor(config.type)">{{ getDocumentTypeName(config.type) }}</el-tag>
                  </div>
                  <div class="config-actions">
                    <el-button size="small" @click="testConnection(config)" :loading="testingConfigs.has(config.id)">
                      <el-icon><Connection /></el-icon>
                      测试连接
                    </el-button>
                    <el-button size="small" type="primary" @click="syncData(config)" :loading="syncingConfigs.has(config.id)">
                      <el-icon><Refresh /></el-icon>
                      同步数据
                    </el-button>
                    <el-button size="small" @click="editConfig(config)">
                      <el-icon><Edit /></el-icon>
                      编辑
                    </el-button>
                    <el-button size="small" type="danger" @click="deleteConfig(config.id)">
                      <el-icon><Delete /></el-icon>
                      删除
                    </el-button>
                  </div>
                </div>
                
                <div class="config-details">
                  <div class="detail-item">
                    <span class="label">文档链接:</span>
                    <span class="value">{{ config.url }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="label">数据范围:</span>
                    <span class="value">{{ config.range || '未设置' }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="label">自动同步:</span>
                    <el-switch v-model="config.autoSync" @change="updateAutoSync(config)" />
                    <span v-if="config.autoSync" class="sync-interval">每{{ config.syncInterval }}分钟</span>
                  </div>
                  <div class="detail-item">
                    <span class="label">最后同步:</span>
                    <span class="value">{{ formatLastSyncTime(config.lastSyncTime) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="8">
        <el-card class="sync-records-card">
          <template #header>
            <span>同步记录</span>
          </template>
          
          <div class="sync-records">
            <div v-if="syncRecords.length === 0" class="empty-state">
              <el-empty description="暂无同步记录" />
            </div>
            
            <div v-else class="records-list">
              <div v-for="record in recentSyncRecords" :key="record.id" class="record-item">
                <div class="record-header">
                  <el-tag :type="getSyncStatusColor(record.status)">{{ getSyncStatusText(record.status) }}</el-tag>
                  <span class="record-time">{{ formatTime(record.startTime) }}</span>
                </div>
                <div class="record-details">
                  <div>配置: {{ getConfigName(record.configId) }}</div>
                  <div>记录数: {{ record.recordsCount }}</div>
                  <div v-if="record.errorMessage" class="error-message">{{ record.errorMessage }}</div>
                </div>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 添加/编辑配置对话框 -->
    <el-dialog 
      v-model="showAddDialog" 
      :title="editingConfig ? '编辑文档配置' : '添加文档配置'"
      width="600px"
    >
      <el-form ref="configFormRef" :model="configForm" :rules="configFormRules" label-width="120px">
        <el-form-item label="配置名称" prop="name">
          <el-input v-model="configForm.name" placeholder="请输入配置名称" />
        </el-form-item>
        
        <el-form-item label="文档类型" prop="type">
          <el-select v-model="configForm.type" placeholder="请选择文档类型">
            <el-option label="Google Sheets" value="google_sheets" />
            <el-option label="腾讯文档" value="tencent_docs" />
            <el-option label="飞书表格" value="feishu_sheets" />
            <el-option label="钉钉表格" value="dingtalk_sheets" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="文档链接" prop="url">
          <el-input v-model="configForm.url" placeholder="请输入文档链接" />
        </el-form-item>
        
        <el-form-item label="API密钥" prop="apiKey">
          <el-input v-model="configForm.apiKey" type="password" placeholder="请输入API密钥（可选）" show-password />
        </el-form-item>
        
        <el-form-item label="访问令牌" prop="accessToken">
          <div class="access-token-field">
            <el-input v-model="configForm.accessToken" type="password" placeholder="请输入访问令牌（可选）" show-password />
            <el-button 
              v-if="configForm.type === 'feishu_sheets'" 
              type="primary" 
              @click="startFeishuAuth"
              :disabled="feishuAuthLoading"
              class="auth-button"
            >
              <el-icon v-if="feishuAuthLoading"><Loading /></el-icon>
              {{ feishuAuthLoading ? '授权中...' : (isFeishuAuthorized ? '重新授权' : '飞书授权') }}
            </el-button>
          </div>
          <div v-if="configForm.type === 'feishu_sheets' && isFeishuAuthorized" class="auth-status">
            <el-tag type="success" size="small">
              <el-icon><Check /></el-icon>
              已授权
            </el-tag>
            <el-button type="text" size="small" @click="clearFeishuAuth">清除授权</el-button>
          </div>
        </el-form-item>
        
        <el-form-item label="工作表ID" prop="sheetId">
          <el-input v-model="configForm.sheetId" placeholder="请输入工作表ID（可选）" />
        </el-form-item>
        
        <el-form-item label="数据范围" prop="range">
          <el-input v-model="configForm.range" placeholder="例如: A1:G100" />
        </el-form-item>
        
        <el-form-item label="启用配置">
          <el-switch v-model="configForm.isActive" />
        </el-form-item>
        
        <el-form-item label="自动同步">
          <el-switch v-model="configForm.autoSync" />
        </el-form-item>
        
        <el-form-item v-if="configForm.autoSync" label="同步间隔" prop="syncInterval">
          <el-input-number v-model="configForm.syncInterval" :min="5" :max="1440" /> 分钟
        </el-form-item>
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showAddDialog = false">取消</el-button>
          <el-button type="primary" @click="saveConfig" :loading="saving">保存</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  DocumentAdd, 
  Refresh, 
  Edit, 
  Delete, 
  Connection,
  Loading,
  Check,
  Setting
} from '@element-plus/icons-vue'
import { DocumentService } from '@/utils/documentService'
import { DateUtils } from '@/utils/date'
import { FeishuService } from '@/utils/feishuService'
import type { DocumentConfig, SyncRecord, DocumentType, SyncStatus } from '@/types'

// 响应式数据
const documentConfigs = ref<DocumentConfig[]>([])
const syncRecords = ref<SyncRecord[]>([])
const showAddDialog = ref(false)
const saving = ref(false)
const testingConfigs = ref(new Set<string>())
const syncingConfigs = ref(new Set<string>())
const editingConfig = ref<DocumentConfig | null>(null)
const configFormRef = ref()
const feishuAuthLoading = ref(false)
const isFeishuAuthorized = ref(false)

// 表单数据
const configForm = reactive({
  name: '',
  type: 'google_sheets' as DocumentType,
  url: '',
  apiKey: '',
  accessToken: '',
  sheetId: '',
  range: '',
  isActive: true,
  autoSync: false,
  syncInterval: 60
})

// 表单验证规则
const configFormRules = {
  name: [
    { required: true, message: '请输入配置名称', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择文档类型', trigger: 'change' }
  ],
  url: [
    { required: true, message: '请输入文档链接', trigger: 'blur' },
    { type: 'url', message: '请输入有效的URL', trigger: 'blur' }
  ],
  syncInterval: [
    { required: true, message: '请输入同步间隔', trigger: 'blur' },
    { type: 'number', min: 5, max: 1440, message: '同步间隔应在5-1440分钟之间', trigger: 'blur' }
  ]
}

// 计算属性
const activeConfigsCount = computed(() => {
  return documentConfigs.value.filter(config => config.isActive).length
})

const autoSyncConfigsCount = computed(() => {
  return documentConfigs.value.filter(config => config.autoSync).length
})

const recentSyncCount = computed(() => {
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  return syncRecords.value.filter(record => record.startTime > oneDayAgo).length
})

const recentSyncRecords = computed(() => {
  return syncRecords.value
    .slice()
    .sort((a, b) => b.startTime.localeCompare(a.startTime))
    .slice(0, 10)
})

// 方法
const loadData = () => {
  documentConfigs.value = DocumentService.getDocumentConfigs()
  syncRecords.value = DocumentService.getSyncRecords()
}

const refreshConfigs = () => {
  loadData()
  ElMessage.success('配置已刷新')
}

const resetForm = () => {
  Object.assign(configForm, {
    name: '',
    type: 'google_sheets' as DocumentType,
    url: '',
    apiKey: '',
    accessToken: '',
    sheetId: '',
    range: '',
    isActive: true,
    autoSync: false,
    syncInterval: 60
  })
  editingConfig.value = null
}

const editConfig = (config: DocumentConfig) => {
  editingConfig.value = config
  Object.assign(configForm, {
    name: config.name,
    type: config.type,
    url: config.url,
    apiKey: config.apiKey || '',
    accessToken: config.accessToken || '',
    sheetId: config.sheetId || '',
    range: config.range || '',
    isActive: config.isActive,
    autoSync: config.autoSync,
    syncInterval: config.syncInterval
  })
  showAddDialog.value = true
}

const saveConfig = async () => {
  try {
    await configFormRef.value.validate()
    
    saving.value = true
    
    if (editingConfig.value) {
      // 更新配置
      DocumentService.updateDocumentConfig(editingConfig.value.id, {
        name: configForm.name,
        type: configForm.type,
        url: configForm.url,
        apiKey: configForm.apiKey || undefined,
        accessToken: configForm.accessToken || undefined,
        sheetId: configForm.sheetId || undefined,
        range: configForm.range || undefined,
        isActive: configForm.isActive,
        autoSync: configForm.autoSync,
        syncInterval: configForm.syncInterval
      })
      ElMessage.success('配置更新成功')
    } else {
      // 添加配置
      DocumentService.addDocumentConfig({
        name: configForm.name,
        type: configForm.type,
        url: configForm.url,
        apiKey: configForm.apiKey || undefined,
        accessToken: configForm.accessToken || undefined,
        sheetId: configForm.sheetId || undefined,
        range: configForm.range || undefined,
        isActive: configForm.isActive,
        autoSync: configForm.autoSync,
        syncInterval: configForm.syncInterval
      })
      ElMessage.success('配置添加成功')
    }
    
    showAddDialog.value = false
    resetForm()
    loadData()
  } catch (error) {
    console.error('保存配置失败:', error)
  } finally {
    saving.value = false
  }
}

const deleteConfig = async (configId: string) => {
  try {
    await ElMessageBox.confirm('确定要删除这个文档配置吗？', '确认删除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    DocumentService.deleteDocumentConfig(configId)
    ElMessage.success('配置删除成功')
    loadData()
  } catch {
    // 用户取消删除
  }
}

const testConnection = async (config: DocumentConfig) => {
  testingConfigs.value.add(config.id)
  
  try {
    const result = await DocumentService.testConnection(config)
    
    if (result.success) {
      ElMessage.success('连接测试成功')
    } else {
      const errorMessage = result.error || '连接测试失败'
      
      if (errorMessage.includes('配置')) {
        ElMessageBox.alert(
          '飞书应用配置不完整，请检查以下配置：\n\n' +
          '1. VITE_FEISHU_CLIENT_ID 是否已正确配置\n' +
          '2. VITE_FEISHU_CLIENT_SECRET 是否已正确配置\n' +
          '3. 是否已重启开发服务器\n\n' +
          '详细配置说明请参考 FEISHU_SETUP.md 文件',
          '配置错误',
          {
            confirmButtonText: '我知道了',
            type: 'warning'
          }
        )
      } else {
        ElMessage.error(errorMessage)
      }
    }
  } catch (error) {
    ElMessage.error('连接测试失败')
  } finally {
    testingConfigs.value.delete(config.id)
  }
}

const syncData = async (config: DocumentConfig) => {
  syncingConfigs.value.add(config.id)
  
  try {
    const result = await DocumentService.syncDataFromDocument(config)
    
    if (result.success) {
      ElMessage.success(`数据同步成功，共同步 ${result.data?.length || 0} 条记录`)
      loadData() // 刷新同步记录
    } else {
      const errorMessage = result.error || '数据同步失败'
      
      if (errorMessage.includes('配置')) {
        ElMessageBox.alert(
          '飞书应用配置不完整，请检查以下配置：\n\n' +
          '1. VITE_FEISHU_CLIENT_ID 是否已正确配置\n' +
          '2. VITE_FEISHU_CLIENT_SECRET 是否已正确配置\n' +
          '3. 是否已重启开发服务器\n\n' +
          '详细配置说明请参考 FEISHU_SETUP.md 文件',
          '配置错误',
          {
            confirmButtonText: '我知道了',
            type: 'warning'
          }
        )
      } else if (errorMessage.includes('授权')) {
        ElMessageBox.confirm(
          '飞书授权已过期或无效，是否重新授权？',
          '授权失效',
          {
            confirmButtonText: '重新授权',
            cancelButtonText: '取消',
            type: 'warning'
          }
        ).then(() => {
          startFeishuAuth()
        }).catch(() => {
          // 用户取消
        })
      } else {
        ElMessage.error(errorMessage)
      }
    }
  } catch (error) {
    ElMessage.error('数据同步失败')
  } finally {
    syncingConfigs.value.delete(config.id)
  }
}

const updateAutoSync = (config: DocumentConfig) => {
  DocumentService.updateDocumentConfig(config.id, {
    autoSync: config.autoSync
  })
  ElMessage.success(`自动同步已${config.autoSync ? '启用' : '禁用'}`)
}

// 工具方法
const getDocumentTypeName = (type: DocumentType): string => {
  const typeNames = {
    google_sheets: 'Google Sheets',
    tencent_docs: '腾讯文档',
    feishu_sheets: '飞书表格',
    dingtalk_sheets: '钉钉表格'
  }
  return typeNames[type] || type
}

const getDocumentTypeColor = (type: DocumentType): string => {
  const typeColors = {
    google_sheets: 'success',
    tencent_docs: 'primary',
    feishu_sheets: 'warning',
    dingtalk_sheets: 'info'
  }
  return typeColors[type] || 'default'
}

const getSyncStatusText = (status: SyncStatus): string => {
  const statusTexts = {
    idle: '空闲',
    syncing: '同步中',
    success: '成功',
    error: '失败'
  }
  return statusTexts[status] || status
}

const getSyncStatusColor = (status: SyncStatus): string => {
  const statusColors = {
    idle: 'info',
    syncing: 'warning',
    success: 'success',
    error: 'danger'
  }
  return statusColors[status] || 'default'
}

const getConfigName = (configId: string): string => {
  const config = documentConfigs.value.find(c => c.id === configId)
  return config?.name || '未知配置'
}

const formatLastSyncTime = (time?: string): string => {
  if (!time) return '从未同步'
  return DateUtils.getFriendlyDate(time)
}

const formatTime = (time: string): string => {
  return DateUtils.getFriendlyDate(time)
}

// 飞书授权相关方法
const checkFeishuAuthStatus = () => {
  isFeishuAuthorized.value = FeishuService.isAuthorized()
}

const startFeishuAuth = () => {
  feishuAuthLoading.value = true
  
  try {
    // 监听授权回调消息
    const handleAuthMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return
      
      if (event.data.type === 'feishu-auth-success') {
        ElMessage.success('飞书授权成功')
        isFeishuAuthorized.value = true
        feishuAuthLoading.value = false
        window.removeEventListener('message', handleAuthMessage)
      } else if (event.data.type === 'feishu-auth-error') {
        ElMessage.error(`飞书授权失败: ${event.data.error}`)
        feishuAuthLoading.value = false
        window.removeEventListener('message', handleAuthMessage)
      }
    }
    
    window.addEventListener('message', handleAuthMessage)
    
    // 启动授权流程
    FeishuService.startAuth()
    
    // 设置超时处理
    setTimeout(() => {
      if (feishuAuthLoading.value) {
        feishuAuthLoading.value = false
        window.removeEventListener('message', handleAuthMessage)
        ElMessage.warning('授权超时，请重试')
      }
    }, 60000) // 60秒超时
  } catch (error) {
    feishuAuthLoading.value = false
    const errorMessage = error instanceof Error ? error.message : '启动授权失败'
    
    if (errorMessage.includes('配置')) {
      ElMessageBox.alert(
        '飞书应用配置不完整，请按以下步骤配置：\n\n' +
        '1. 在项目根目录找到 .env 文件\n' +
        '2. 配置 VITE_FEISHU_CLIENT_ID（飞书应用的App ID）\n' +
        '3. 配置 VITE_FEISHU_CLIENT_SECRET（飞书应用的App Secret）\n' +
        '4. 重启开发服务器\n\n' +
        '详细配置说明请参考 FEISHU_SETUP.md 文件',
        '配置错误',
        {
          confirmButtonText: '我知道了',
          type: 'warning'
        }
      )
    } else {
      ElMessage.error(errorMessage)
    }
  }
}

const clearFeishuAuth = () => {
  FeishuService.clearAuth()
  isFeishuAuthorized.value = false
  configForm.accessToken = ''
  ElMessage.success('飞书授权已清除')
}

const checkSystemConfig = () => {
  const diagnostics = []
  
  // 检查环境变量
  const clientId = import.meta.env.VITE_FEISHU_CLIENT_ID
  const clientSecret = import.meta.env.VITE_FEISHU_CLIENT_SECRET
  
  if (!clientId || clientId === 'cli_a1234567890abcde') {
    diagnostics.push('❌ VITE_FEISHU_CLIENT_ID 未配置或使用默认值')
  } else {
    diagnostics.push('✅ VITE_FEISHU_CLIENT_ID 已配置')
  }
  
  if (!clientSecret) {
    diagnostics.push('❌ VITE_FEISHU_CLIENT_SECRET 未配置')
  } else {
    diagnostics.push('✅ VITE_FEISHU_CLIENT_SECRET 已配置')
  }
  
  // 检查飞书授权状态
  if (FeishuService.isAuthorized()) {
    diagnostics.push('✅ 飞书授权状态正常')
  } else {
    diagnostics.push('⚠️ 飞书未授权或授权已过期')
  }
  
  // 检查配置数量
  const feishuConfigs = documentConfigs.value.filter(config => config.type === 'feishu_sheets')
  if (feishuConfigs.length > 0) {
    diagnostics.push(`✅ 已配置 ${feishuConfigs.length} 个飞书表格`)
  } else {
    diagnostics.push('⚠️ 尚未配置飞书表格')
  }
  
  const message = diagnostics.join('\n')
  const hasErrors = diagnostics.some(d => d.includes('❌'))
  
  ElMessageBox.alert(
    message,
    '系统配置诊断',
    {
      confirmButtonText: '我知道了',
      type: hasErrors ? 'error' : 'success',
      dangerouslyUseHTMLString: false
    }
  )
}

// 生命周期
onMounted(() => {
  loadData()
  checkFeishuAuthStatus()
})
</script>

<style scoped>
.document-config-view {
  padding: 0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.config-stats {
  margin-top: 16px;
}

.config-list-card,
.sync-records-card {
  margin-top: 20px;
  height: calc(100vh - 300px);
}

.config-list {
  max-height: calc(100vh - 380px);
  overflow-y: auto;
}

.config-item {
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
  transition: all 0.3s;
}

.config-item:hover {
  border-color: #409eff;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.2);
}

.config-item.active {
  border-color: #67c23a;
  background: #f0f9ff;
}

.config-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.config-info h4 {
  margin: 0 0 8px 0;
  color: #303133;
}

.config-actions {
  display: flex;
  gap: 8px;
}

.config-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.detail-item .label {
  color: #909399;
  min-width: 80px;
}

.detail-item .value {
  color: #606266;
  flex: 1;
  word-break: break-all;
}

.sync-interval {
  color: #909399;
  font-size: 12px;
  margin-left: 8px;
}

.sync-records {
  max-height: calc(100vh - 380px);
  overflow-y: auto;
}

.records-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.record-item {
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  padding: 12px;
  background: #fafafa;
}

.record-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.record-time {
  font-size: 12px;
  color: #909399;
}

.record-details {
  font-size: 12px;
  color: #606266;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.error-message {
  color: #f56c6c;
  font-style: italic;
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

.access-token-field {
  display: flex;
  gap: 8px;
  align-items: center;
}

.access-token-field .el-input {
  flex: 1;
}

.auth-button {
  white-space: nowrap;
}

.auth-status {
  margin-top: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .document-config-view :deep(.el-row) {
    flex-direction: column;
  }
  
  .document-config-view :deep(.el-col) {
    width: 100% !important;
    margin-bottom: 16px;
  }
  
  .config-actions {
    flex-direction: column;
    gap: 4px;
  }
  
  .config-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
}
</style>