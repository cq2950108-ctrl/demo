<template>
  <div class="diagnostic-view">
    <div class="header">
      <h2>系统诊断</h2>
      <p class="subtitle">检查系统配置和数据同步功能</p>
    </div>

    <div class="diagnostic-sections">
      <!-- 环境配置检查 -->
      <div class="section">
        <h3>环境配置检查</h3>
        <div class="check-item">
          <span class="label">飞书应用配置:</span>
          <span :class="['status', configStatus.feishu.valid ? 'success' : 'error']">
            {{ configStatus.feishu.message }}
          </span>
        </div>
        <div class="check-item">
          <span class="label">文档配置:</span>
          <span :class="['status', configStatus.document.valid ? 'success' : 'error']">
            {{ configStatus.document.message }}
          </span>
        </div>
      </div>

      <!-- 连接测试 -->
      <div class="section">
        <h3>连接测试</h3>
        <button 
          @click="testConnection" 
          :disabled="testing"
          class="test-btn"
        >
          {{ testing ? '测试中...' : '测试飞书连接' }}
        </button>
        <div v-if="connectionResult" class="test-result">
          <div :class="['result-status', connectionResult.success ? 'success' : 'error']">
            {{ connectionResult.success ? '✓ 连接成功' : '✗ 连接失败' }}
          </div>
          <div v-if="connectionResult.error" class="error-message">
            {{ connectionResult.error }}
          </div>
        </div>
      </div>

      <!-- 数据同步测试 -->
      <div class="section">
        <h3>数据同步测试</h3>
        <button 
          @click="testDataSync" 
          :disabled="syncing || !hasValidConfig"
          class="sync-btn"
        >
          {{ syncing ? '同步中...' : '测试数据同步' }}
        </button>
        <div v-if="syncResult" class="test-result">
          <div :class="['result-status', syncResult.success ? 'success' : 'error']">
            {{ syncResult.success ? '✓ 同步成功' : '✗ 同步失败' }}
          </div>
          <div v-if="syncResult.error" class="error-message">
            {{ syncResult.error }}
          </div>
          <div v-if="syncResult.data" class="sync-data">
            <p>同步到 {{ syncResult.data.length }} 条数据</p>
            <details v-if="syncResult.data.length > 0">
              <summary>查看数据详情</summary>
              <pre>{{ JSON.stringify(syncResult.data.slice(0, 3), null, 2) }}</pre>
              <p v-if="syncResult.data.length > 3">... 还有 {{ syncResult.data.length - 3 }} 条数据</p>
            </details>
          </div>
        </div>
      </div>

      <!-- 控制台日志 -->
      <div class="section">
        <h3>控制台日志</h3>
        <p class="log-hint">请打开浏览器开发者工具的控制台查看详细日志信息</p>
        <button @click="clearLogs" class="clear-btn">清空控制台</button>
      </div>

      <!-- 配置指南 -->
      <div class="section">
        <h3>配置指南</h3>
        <div class="guide">
          <h4>1. 飞书应用配置</h4>
          <p>确保 .env 文件包含以下配置：</p>
          <pre class="config-example">
VUE_APP_FEISHU_APP_ID=your_app_id
VUE_APP_FEISHU_APP_SECRET=your_app_secret
VUE_APP_FEISHU_REDIRECT_URI=http://localhost:3000/feishu/callback
          </pre>
          
          <h4>2. 文档配置</h4>
          <p>在文档配置页面添加飞书表格链接，格式如：</p>
          <pre class="config-example">
https://example.feishu.cn/sheets/shtcnxxxxxx
          </pre>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { DocumentService } from '@/utils/documentService'
import { FeishuService } from '@/utils/feishuService'
import { checkFeishuConfig } from '@/utils/config.ts'

const testing = ref(false)
const syncing = ref(false)
const connectionResult = ref<any>(null)
const syncResult = ref<any>(null)

const configStatus = ref({
  feishu: { valid: false, message: '检查中...' },
  document: { valid: false, message: '检查中...' }
})

const hasValidConfig = computed(() => {
  return configStatus.value.feishu.valid && configStatus.value.document.valid
})

// 检查配置状态
const checkConfigs = async () => {
  // 检查飞书配置
  const feishuCheck = checkFeishuConfig()
  configStatus.value.feishu = {
    valid: feishuCheck.isValid,
    message: feishuCheck.isValid ? '配置正常' : feishuCheck.error || '配置错误'
  }

  // 检查文档配置
  try {
    const configs = await DocumentService.getConfigs()
    const hasFeishuConfig = configs.some(config => config.type === 'feishu')
    configStatus.value.document = {
      valid: hasFeishuConfig,
      message: hasFeishuConfig ? '已配置飞书文档' : '未配置飞书文档'
    }
  } catch (error) {
    configStatus.value.document = {
      valid: false,
      message: '配置检查失败'
    }
  }
}

// 测试连接
const testConnection = async () => {
  testing.value = true
  connectionResult.value = null
  
  console.log('开始测试飞书连接...')
  
  try {
    const configs = await DocumentService.getConfigs()
    const feishuConfig = configs.find(config => config.type === 'feishu')
    
    if (!feishuConfig) {
      connectionResult.value = {
        success: false,
        error: '未找到飞书文档配置'
      }
      return
    }
    
    const result = await FeishuService.testConnection(feishuConfig)
    connectionResult.value = result
    
    console.log('连接测试结果:', result)
  } catch (error) {
    console.error('连接测试异常:', error)
    connectionResult.value = {
      success: false,
      error: `测试失败: ${error instanceof Error ? error.message : '未知错误'}`
    }
  } finally {
    testing.value = false
  }
}

// 测试数据同步
const testDataSync = async () => {
  syncing.value = true
  syncResult.value = null
  
  console.log('开始测试数据同步...')
  
  try {
    const configs = await DocumentService.getConfigs()
    const feishuConfig = configs.find(config => config.type === 'feishu')
    
    if (!feishuConfig) {
      syncResult.value = {
        success: false,
        error: '未找到飞书文档配置'
      }
      return
    }
    
    const result = await DocumentService.syncDataFromDocument(feishuConfig.id)
    syncResult.value = result
    
    console.log('数据同步测试结果:', result)
  } catch (error) {
    console.error('数据同步测试异常:', error)
    syncResult.value = {
      success: false,
      error: `同步失败: ${error instanceof Error ? error.message : '未知错误'}`
    }
  } finally {
    syncing.value = false
  }
}

// 清空控制台
const clearLogs = () => {
  console.clear()
  console.log('控制台已清空，可以重新进行测试')
}

onMounted(() => {
  checkConfigs()
})
</script>

<style scoped>
.diagnostic-view {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.header {
  text-align: center;
  margin-bottom: 30px;
}

.header h2 {
  color: #333;
  margin-bottom: 8px;
}

.subtitle {
  color: #666;
  font-size: 14px;
}

.diagnostic-sections {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.section {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  border: 1px solid #e9ecef;
}

.section h3 {
  margin: 0 0 16px 0;
  color: #333;
  font-size: 16px;
}

.check-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.label {
  font-weight: 500;
  color: #555;
}

.status {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.status.success {
  background: #d4edda;
  color: #155724;
}

.status.error {
  background: #f8d7da;
  color: #721c24;
}

.test-btn, .sync-btn, .clear-btn {
  background: #007bff;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
}

.test-btn:hover, .sync-btn:hover, .clear-btn:hover {
  background: #0056b3;
}

.test-btn:disabled, .sync-btn:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

.clear-btn {
  background: #6c757d;
  font-size: 12px;
  padding: 6px 12px;
}

.test-result {
  margin-top: 16px;
  padding: 12px;
  border-radius: 6px;
  background: white;
  border: 1px solid #dee2e6;
}

.result-status {
  font-weight: 500;
  margin-bottom: 8px;
}

.result-status.success {
  color: #28a745;
}

.result-status.error {
  color: #dc3545;
}

.error-message {
  color: #721c24;
  background: #f8d7da;
  padding: 8px;
  border-radius: 4px;
  font-size: 13px;
  margin-top: 8px;
}

.sync-data {
  margin-top: 12px;
}

.sync-data details {
  margin-top: 8px;
}

.sync-data pre {
  background: #f8f9fa;
  padding: 8px;
  border-radius: 4px;
  font-size: 12px;
  overflow-x: auto;
  margin: 8px 0;
}

.log-hint {
  color: #666;
  font-size: 14px;
  margin-bottom: 12px;
}

.guide h4 {
  color: #333;
  margin: 16px 0 8px 0;
  font-size: 14px;
}

.guide p {
  color: #666;
  font-size: 13px;
  margin-bottom: 8px;
}

.config-example {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 4px;
  padding: 12px;
  font-size: 12px;
  color: #333;
  margin: 8px 0 16px 0;
  overflow-x: auto;
}
</style>