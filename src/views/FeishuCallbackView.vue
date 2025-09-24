<template>
  <div class="feishu-callback">
    <div class="callback-container">
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>正在处理飞书授权...</p>
      </div>
      
      <div v-else-if="success" class="success-state">
        <div class="success-icon">✓</div>
        <h2>授权成功</h2>
        <p>飞书授权已完成，您现在可以同步飞书表格数据了。</p>
        <button @click="closeWindow" class="btn btn-primary">
          关闭窗口
        </button>
      </div>
      
      <div v-else class="error-state">
        <div class="error-icon">✗</div>
        <h2>授权失败</h2>
        <p>{{ errorMessage }}</p>
        <button @click="closeWindow" class="btn btn-secondary">
          关闭窗口
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { FeishuService } from '@/utils/feishuService'

const route = useRoute()
const loading = ref(true)
const success = ref(false)
const errorMessage = ref('')

onMounted(async () => {
  try {
    const code = route.query.code as string
    const error = route.query.error as string
    
    if (error) {
      throw new Error(`授权被拒绝: ${error}`)
    }
    
    if (!code) {
      throw new Error('未收到授权码')
    }
    
    // 处理授权回调
    const result = await FeishuService.handleAuthCallback(code)
    
    if (result.success) {
      success.value = true
      
      // 通知父窗口授权成功
      if (window.opener) {
        window.opener.postMessage({
          type: 'feishu-auth-success',
          data: result.data
        }, window.location.origin)
      }
    } else {
      throw new Error(result.error || '授权处理失败')
    }
  } catch (error) {
    success.value = false
    errorMessage.value = error instanceof Error ? error.message : '未知错误'
    
    // 通知父窗口授权失败
    if (window.opener) {
      window.opener.postMessage({
        type: 'feishu-auth-error',
        error: errorMessage.value
      }, window.location.origin)
    }
  } finally {
    loading.value = false
  }
})

const closeWindow = () => {
  if (window.opener) {
    window.close()
  } else {
    // 如果不是弹窗，跳转回主页
    window.location.href = '/'
  }
}
</script>

<style scoped>
.feishu-callback {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.callback-container {
  background: white;
  border-radius: 12px;
  padding: 3rem;
  text-align: center;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  max-width: 400px;
  width: 90%;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.success-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.success-icon {
  width: 60px;
  height: 60px;
  background: #4CAF50;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: bold;
}

.error-icon {
  width: 60px;
  height: 60px;
  background: #f44336;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: bold;
}

h2 {
  margin: 0;
  color: #333;
  font-size: 1.5rem;
}

p {
  margin: 0;
  color: #666;
  line-height: 1.5;
}

.btn {
  padding: 0.75rem 2rem;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 1rem;
}

.btn-primary {
  background: #667eea;
  color: white;
}

.btn-primary:hover {
  background: #5a6fd8;
  transform: translateY(-1px);
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background: #5a6268;
  transform: translateY(-1px);
}
</style>