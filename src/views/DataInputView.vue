<template>
  <div class="data-input-view">
    <el-row :gutter="20">
      <!-- 左侧数据录入表单 -->
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>业务数据录入</span>
              <el-button type="primary" @click="saveData" :loading="saving">
                <el-icon><DocumentAdd /></el-icon>
                保存数据
              </el-button>
            </div>
          </template>

          <el-form 
            ref="dataFormRef" 
            :model="dataForm" 
            :rules="dataFormRules" 
            label-width="100px"
            class="data-form"
          >
            <el-form-item label="数据日期" prop="date">
              <el-date-picker
                v-model="dataForm.date"
                type="date"
                placeholder="选择数据日期"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                style="width: 100%"
                @change="handleDateChange"
              />
            </el-form-item>

            <el-form-item label="成交数量" prop="transaction_count">
              <el-input-number
                v-model="dataForm.transaction_count"
                :min="0"
                :precision="0"
                style="width: 100%"
                placeholder="请输入成交数量"
              />
              <div class="form-help">单位：笔</div>
            </el-form-item>

            <el-form-item label="成交金额" prop="transaction_amount">
              <el-input-number
                v-model="dataForm.transaction_amount"
                :min="0"
                :precision="2"
                style="width: 100%"
                placeholder="请输入成交金额"
              />
              <div class="form-help">单位：元</div>
            </el-form-item>

            <el-form-item label="转化成本" prop="conversion_cost">
              <el-input-number
                v-model="dataForm.conversion_cost"
                :min="0"
                :precision="2"
                style="width: 100%"
                placeholder="请输入转化成本"
              />
              <div class="form-help">单位：元</div>
            </el-form-item>

            <el-form-item label="曝光量" prop="exposure_count">
              <el-input-number
                v-model="dataForm.exposure_count"
                :min="0"
                :precision="0"
                style="width: 100%"
                placeholder="请输入曝光量"
              />
              <div class="form-help">单位：次</div>
            </el-form-item>

            <el-form-item label="转化率" prop="conversion_rate">
              <el-input-number
                v-model="dataForm.conversion_rate"
                :min="0"
                :max="100"
                :precision="2"
                style="width: 100%"
                placeholder="请输入转化率"
              />
              <div class="form-help">单位：%</div>
            </el-form-item>

            <!-- 计算指标 -->
            <el-divider>计算指标</el-divider>
            
            <el-form-item label="平均客单价">
              <el-input 
                :value="averageOrderValue" 
                readonly 
                style="width: 100%"
              >
                <template #suffix>元</template>
              </el-input>
            </el-form-item>

            <el-form-item label="ROI">
              <el-input 
                :value="roi" 
                readonly 
                style="width: 100%"
              >
                <template #suffix>%</template>
              </el-input>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>

      <!-- 右侧历史数据和快捷操作 -->
      <el-col :span="12">
        <!-- 快捷日期选择 -->
        <el-card class="quick-actions-card">
          <template #header>
            <span>快捷操作</span>
          </template>
          
          <div class="quick-dates">
            <el-button 
              v-for="date in quickDates" 
              :key="date.value"
              :type="dataForm.date === date.value ? 'primary' : 'default'"
              size="small"
              @click="selectQuickDate(date.value)"
            >
              {{ date.label }}
            </el-button>
          </div>

          <el-divider />

          <div class="quick-actions">
            <el-button size="small" @click="copyPreviousData">
              <el-icon><CopyDocument /></el-icon>
              复制昨日数据
            </el-button>
            <el-button size="small" @click="clearForm">
              <el-icon><Delete /></el-icon>
              清空表单
            </el-button>
            <el-button size="small" @click="loadTemplate">
              <el-icon><Document /></el-icon>
              加载模板
            </el-button>
            <el-button size="small" @click="triggerFileUpload" type="success">
              <el-icon><Upload /></el-icon>
              上传数据
            </el-button>
            <el-button size="small" @click="openDocumentSync" type="warning">
              <el-icon><Link /></el-icon>
              同步文档
            </el-button>
            <el-button size="small" @click="goToDiagnostic" type="info">
              <el-icon><Tools /></el-icon>
              系统诊断
            </el-button>
          </div>
          
          <!-- 隐藏的文件输入 -->
          <input 
            ref="fileInputRef" 
            type="file" 
            accept=".csv,.xlsx,.xls" 
            style="display: none" 
            @change="handleFileUpload"
          />
        </el-card>

        <!-- 最近数据记录 -->
        <el-card class="recent-data-card">
          <template #header>
            <div class="card-header">
              <span>最近数据记录</span>
              <el-button size="small" @click="refreshRecentData">
                <el-icon><Refresh /></el-icon>
                刷新
              </el-button>
            </div>
          </template>

          <div class="recent-data-list">
            <div v-if="recentData.length === 0" class="empty-state">
              <el-empty description="暂无数据记录" :image-size="80" />
            </div>
            
            <div v-else>
              <div 
                v-for="data in recentData" 
                :key="data.id" 
                class="data-item"
                :class="{ 'selected': data.date === dataForm.date }"
                @click="loadDataToForm(data)"
              >
                <div class="data-header">
                  <span class="data-date">{{ formatDate(data.date) }}</span>
                  <el-button 
                    type="text" 
                    size="small" 
                    @click.stop="deleteData(data.id)"
                  >
                    <el-icon><Delete /></el-icon>
                  </el-button>
                </div>
                
                <div class="data-summary">
                  <div class="summary-item">
                    <span class="label">成交:</span>
                    <span class="value">{{ data.transaction_count }}笔</span>
                  </div>
                  <div class="summary-item">
                    <span class="label">金额:</span>
                    <span class="value">¥{{ formatNumber(data.transaction_amount) }}</span>
                  </div>
                  <div class="summary-item">
                    <span class="label">转化率:</span>
                    <span class="value">{{ data.conversion_rate }}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 数据模板对话框 -->
    <el-dialog 
      v-model="showTemplateDialog" 
      title="选择数据模板"
      width="400px"
    >
      <div class="template-list">
        <div 
          v-for="template in dataTemplates" 
          :key="template.name"
          class="template-item"
          @click="applyTemplate(template)"
        >
          <div class="template-name">{{ template.name }}</div>
          <div class="template-desc">{{ template.description }}</div>
        </div>
      </div>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showTemplateDialog = false">取消</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive, h } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  DocumentAdd, 
  CopyDocument, 
  Delete, 
  Document, 
  Refresh,
  Upload,
  Link,
  Tools 
} from '@element-plus/icons-vue'
import { useBusinessStore } from '@/stores/businessStore'
import { DateUtils } from '@/utils/date'
import type { BusinessData, DocumentConfig } from '@/types'
import { StorageService } from '@/utils/storage'
import { DocumentService } from '@/utils/documentService'
import Papa from 'papaparse'
import * as XLSX from 'xlsx'
import { useRouter } from 'vue-router'

const businessStore = useBusinessStore()
const router = useRouter()

// 响应式数据
const saving = ref(false)
const showTemplateDialog = ref(false)
const dataFormRef = ref()
const fileInputRef = ref()
const uploading = ref(false)

// 数据表单
const dataForm = reactive({
  date: DateUtils.getToday(),
  transaction_count: 0,
  transaction_amount: 0,
  conversion_cost: 0,
  exposure_count: 0,
  conversion_rate: 0
})

// 表单验证规则
const dataFormRules = {
  date: [
    { required: true, message: '请选择数据日期', trigger: 'change' }
  ],
  transaction_count: [
    { required: true, message: '请输入成交数量', trigger: 'blur' },
    { type: 'number', min: 0, message: '成交数量不能小于0', trigger: 'blur' }
  ],
  transaction_amount: [
    { required: true, message: '请输入成交金额', trigger: 'blur' },
    { type: 'number', min: 0, message: '成交金额不能小于0', trigger: 'blur' }
  ],
  conversion_cost: [
    { required: true, message: '请输入转化成本', trigger: 'blur' },
    { type: 'number', min: 0, message: '转化成本不能小于0', trigger: 'blur' }
  ],
  exposure_count: [
    { required: true, message: '请输入曝光量', trigger: 'blur' },
    { type: 'number', min: 0, message: '曝光量不能小于0', trigger: 'blur' }
  ],
  conversion_rate: [
    { required: true, message: '请输入转化率', trigger: 'blur' },
    { type: 'number', min: 0, max: 100, message: '转化率应在0-100之间', trigger: 'blur' }
  ]
}

// 数据模板
const dataTemplates = [
  {
    name: '标准模板',
    description: '适用于一般直播场景',
    data: {
      transaction_count: 10,
      transaction_amount: 1000,
      conversion_cost: 50,
      exposure_count: 5000,
      conversion_rate: 2.5
    }
  },
  {
    name: '高转化模板',
    description: '适用于高转化率场景',
    data: {
      transaction_count: 20,
      transaction_amount: 2000,
      conversion_cost: 40,
      exposure_count: 4000,
      conversion_rate: 5.0
    }
  },
  {
    name: '大流量模板',
    description: '适用于大流量低转化场景',
    data: {
      transaction_count: 50,
      transaction_amount: 5000,
      conversion_cost: 80,
      exposure_count: 20000,
      conversion_rate: 1.5
    }
  }
]

// 计算属性
const quickDates = computed(() => {
  const today = DateUtils.getToday()
  const beijingNow = DateUtils.getBeijingTime()
  const yesterday = DateUtils.formatDate(new Date(beijingNow.getTime() - 24 * 60 * 60 * 1000))
  const dayBeforeYesterday = DateUtils.formatDate(new Date(beijingNow.getTime() - 2 * 24 * 60 * 60 * 1000))
  
  return [
    { label: '今天', value: today },
    { label: '昨天', value: yesterday },
    { label: '前天', value: dayBeforeYesterday }
  ]
})

const recentData = computed(() => {
  return businessStore.businessData
    .slice()
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 10)
})

const averageOrderValue = computed(() => {
  if (dataForm.transaction_count === 0) return '0.00'
  return (dataForm.transaction_amount / dataForm.transaction_count).toFixed(2)
})

const roi = computed(() => {
  if (dataForm.conversion_cost === 0) return '0.00'
  return ((dataForm.transaction_amount / dataForm.conversion_cost - 1) * 100).toFixed(2)
})

// 方法
const handleDateChange = () => {
  // 检查是否已有该日期的数据
  const existingData = businessStore.businessData.find(data => data.date === dataForm.date)
  if (existingData) {
    loadDataToForm(existingData)
  }
}

const selectQuickDate = (date: string) => {
  dataForm.date = date
  handleDateChange()
}

const saveData = async () => {
  try {
    await dataFormRef.value.validate()
    
    saving.value = true
    
    const businessData = {
      date: dataForm.date,
      transaction_count: dataForm.transaction_count,
      transaction_amount: dataForm.transaction_amount,
      conversion_cost: dataForm.conversion_cost,
      exposure_count: dataForm.exposure_count,
      conversion_rate: dataForm.conversion_rate
    }
    
    businessStore.saveBusinessData(businessData)
    ElMessage.success('数据保存成功')
    
  } catch (error) {
    console.error('保存数据失败:', error)
    ElMessage.error('数据保存失败')
  } finally {
    saving.value = false
  }
}

const copyPreviousData = () => {
  const beijingNow = DateUtils.getBeijingTime()
  const yesterday = DateUtils.formatDate(new Date(beijingNow.getTime() - 24 * 60 * 60 * 1000))
  const previousData = businessStore.businessData.find(data => data.date === yesterday)
  
  if (previousData) {
    Object.assign(dataForm, {
      transaction_count: previousData.transaction_count,
      transaction_amount: previousData.transaction_amount,
      conversion_cost: previousData.conversion_cost,
      exposure_count: previousData.exposure_count,
      conversion_rate: previousData.conversion_rate
    })
    ElMessage.success('已复制昨日数据')
  } else {
    ElMessage.warning('未找到昨日数据')
  }
}

const clearForm = () => {
  Object.assign(dataForm, {
    transaction_count: 0,
    transaction_amount: 0,
    conversion_cost: 0,
    exposure_count: 0,
    conversion_rate: 0
  })
  dataFormRef.value?.clearValidate()
  ElMessage.success('表单已清空')
}

const loadTemplate = () => {
  showTemplateDialog.value = true
}

const applyTemplate = (template: any) => {
  Object.assign(dataForm, template.data)
  showTemplateDialog.value = false
  ElMessage.success(`已应用${template.name}`)
}

const loadDataToForm = (data: BusinessData) => {
  Object.assign(dataForm, {
    date: data.date,
    transaction_count: data.transaction_count,
    transaction_amount: data.transaction_amount,
    conversion_cost: data.conversion_cost,
    exposure_count: data.exposure_count,
    conversion_rate: data.conversion_rate
  })
}

const deleteData = async (dataId: string) => {
  try {
    await ElMessageBox.confirm('确定要删除这条数据记录吗？', '确认删除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    // 从存储中删除数据
    const index = businessStore.businessData.findIndex(data => data.id === dataId)
    if (index !== -1) {
      businessStore.businessData.splice(index, 1)
      ElMessage.success('数据已删除')
    }
  } catch {
    // 用户取消删除
  }
}

const refreshRecentData = () => {
  businessStore.loadBusinessData()
  ElMessage.success('数据已刷新')
}

const formatDate = (date: string) => {
  return DateUtils.getFriendlyDate(date)
}

const formatNumber = (num: number) => {
  return num.toLocaleString('zh-CN')
}

// 文件上传相关方法
const triggerFileUpload = () => {
  fileInputRef.value?.click()
}

const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (!file) return
  
  uploading.value = true
  
  const fileExtension = file.name.split('.').pop()?.toLowerCase()
  
  if (fileExtension === 'csv') {
    parseCSVFile(file)
  } else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
    parseExcelFile(file)
  } else {
    ElMessage.error('不支持的文件格式，请上传CSV或Excel文件')
    uploading.value = false
  }
  
  // 清空文件输入
  target.value = ''
}

const parseCSVFile = (file: File) => {
  Papa.parse(file, {
    header: true,
    skipEmptyLines: true,
    complete: async (results) => {
      try {
        const importedData = processImportedData(results.data)
        await importDataToBusiness(importedData)
      } catch (error) {
        console.error('CSV解析错误:', error)
        ElMessage.error('CSV文件解析失败，请检查文件格式')
      } finally {
        uploading.value = false
      }
    },
    error: (error) => {
      console.error('CSV解析错误:', error)
      ElMessage.error('CSV文件解析失败')
      uploading.value = false
    }
  })
}

const parseExcelFile = (file: File) => {
  const reader = new FileReader()
  
  reader.onload = async (e) => {
    try {
      const data = new Uint8Array(e.target?.result as ArrayBuffer)
      const workbook = XLSX.read(data, { type: 'array' })
      const sheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[sheetName]
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })
      
      // 转换为对象格式
      const headers = jsonData[0] as string[]
      const rows = jsonData.slice(1) as any[][]
      
      const objectData = rows.map(row => {
        const obj: any = {}
        headers.forEach((header, index) => {
          obj[header] = row[index]
        })
        return obj
      })
      
      const importedData = processImportedData(objectData)
      await importDataToBusiness(importedData)
    } catch (error) {
      console.error('Excel解析错误:', error)
      ElMessage.error('Excel文件解析失败，请检查文件格式')
    } finally {
      uploading.value = false
    }
  }
  
  reader.onerror = () => {
    ElMessage.error('文件读取失败')
    uploading.value = false
  }
  
  reader.readAsArrayBuffer(file)
}

const processImportedData = (rawData: any[]) => {
  const processedData: BusinessData[] = []
  
  rawData.forEach((row, index) => {
    try {
      // 支持多种列名格式
      const date = row['日期'] || row['数据日期'] || row['date'] || row['Date']
      const transactionCount = parseFloat(row['成交数量'] || row['成交笔数'] || row['transaction_count'] || row['Transaction Count'] || 0)
      const transactionAmount = parseFloat(row['成交金额'] || row['transaction_amount'] || row['Transaction Amount'] || 0)
      const conversionCost = parseFloat(row['转化成本'] || row['conversion_cost'] || row['Conversion Cost'] || 0)
      const exposureCount = parseFloat(row['曝光量'] || row['exposure_count'] || row['Exposure Count'] || 0)
      const conversionRate = parseFloat(row['转化率'] || row['conversion_rate'] || row['Conversion Rate'] || 0)
      
      if (!date) {
        console.warn(`第${index + 1}行缺少日期信息，跳过`)
        return
      }
      
      // 格式化日期
      let formattedDate: string
      if (typeof date === 'string') {
        formattedDate = DateUtils.formatDate(new Date(date))
      } else if (date instanceof Date) {
        formattedDate = DateUtils.formatDate(date)
      } else {
        // Excel日期可能是数字格式
        const excelDate = new Date((date - 25569) * 86400 * 1000)
        formattedDate = DateUtils.formatDate(excelDate)
      }
      
      processedData.push({
        id: `imported_${Date.now()}_${index}`,
        date: formattedDate,
        transaction_count: transactionCount,
        transaction_amount: transactionAmount,
        conversion_cost: conversionCost,
        exposure_count: exposureCount,
        conversion_rate: conversionRate,
        created_at: new Date().toISOString()
      })
    } catch (error) {
      console.warn(`第${index + 1}行数据处理失败:`, error)
    }
  })
  
  return processedData
}

const importDataToBusiness = async (importedData: BusinessData[]) => {
  if (importedData.length === 0) {
    ElMessage.warning('没有找到有效的数据行')
    return
  }
  
  // 检查是否有重复日期的数据
  const duplicateDates = importedData.filter(data => 
    businessStore.businessData.some(existing => existing.date === data.date)
  ).map(data => data.date)
  
  let shouldOverwrite = false
  if (duplicateDates.length > 0) {
    try {
      await ElMessageBox.confirm(
        `发现 ${duplicateDates.length} 条重复日期的数据：${duplicateDates.join(', ')}。是否覆盖现有数据？`,
        '数据重复确认',
        {
          confirmButtonText: '覆盖',
          cancelButtonText: '跳过重复数据',
          type: 'warning'
        }
      )
      shouldOverwrite = true
    } catch {
      shouldOverwrite = false
    }
  }
  
  let successCount = 0
  let skipCount = 0
  
  importedData.forEach(data => {
    // 检查是否已存在相同日期的数据
    const existingIndex = businessStore.businessData.findIndex(existing => existing.date === data.date)
    
    if (existingIndex !== -1) {
      if (shouldOverwrite) {
        businessStore.businessData[existingIndex] = data
        successCount++
      } else {
        skipCount++
      }
    } else {
      businessStore.businessData.push(data)
      successCount++
    }
  })
  
  // 保存到本地存储
  StorageService.saveBusinessData(businessStore.businessData)
  
  ElMessage.success(`数据导入完成！成功导入 ${successCount} 条数据${skipCount > 0 ? `，跳过 ${skipCount} 条重复数据` : ''}`)
  
  // 刷新显示
  refreshRecentData()
}

// 在线文档同步相关方法
const openDocumentSync = async () => {
  try {
    const configs = DocumentService.getDocumentConfigs()
    if (configs.length === 0) {
      await ElMessageBox.confirm(
        '您还没有配置任何在线文档。是否前往配置页面？',
        '提示',
        {
          confirmButtonText: '前往配置',
          cancelButtonText: '取消',
          type: 'info'
        }
      )
      router.push('/document-config')
      return
    }
    
    // 显示文档选择对话框
    showDocumentSyncDialog()
  } catch {
    // 用户取消
  }
}

const showDocumentSyncDialog = () => {
  const configs = DocumentService.getDocumentConfigs()
  const activeConfigs = configs.filter((config: DocumentConfig) => config.isActive)
  
  if (activeConfigs.length === 0) {
    ElMessage.warning('没有激活的文档配置，请先在文档配置页面激活至少一个配置')
    return
  }
  
  // 如果只有一个激活的配置，直接同步
  if (activeConfigs.length === 1) {
    syncFromDocument(activeConfigs[0].id)
    return
  }
  
  // 多个配置时显示选择对话框
  ElMessageBox({
    title: '选择要同步的文档',
    message: h('div', [
      h('p', '请选择要同步数据的在线文档：'),
      h('div', { style: 'margin-top: 10px;' }, 
        activeConfigs.map((config: DocumentConfig) => 
          h('div', {
            key: config.id,
            style: 'margin: 5px 0; padding: 8px; border: 1px solid #ddd; border-radius: 4px; cursor: pointer;',
            onClick: () => {
              ElMessageBox.close()
              syncFromDocument(config.id)
            }
          }, [
            h('strong', config.name),
            h('div', { style: 'font-size: 12px; color: #666;' }, `${config.type} - ${config.url}`)
          ])
        )
      )
    ]),
    showCancelButton: true,
    confirmButtonText: '取消',
    cancelButtonText: '取消'
  })
}

const syncFromDocument = async (configId: string) => {
  try {
    ElMessage.info('正在同步数据...')
    
    const selectedConfig = DocumentService.getDocumentConfigs().find((config: DocumentConfig) => config.id === configId)
  if (!selectedConfig) {
    ElMessage.error('未找到指定的文档配置')
    return
  }
  
  const result = await DocumentService.syncDataFromDocument(selectedConfig)
    
    if (result.success && result.data) {
      // 处理同步的数据
      const importedData = processDocumentData(result.data)
      await importDataToBusiness(importedData)
      
      ElMessage.success(`成功从在线文档同步了 ${importedData.length} 条数据`)
    } else {
      ElMessage.error(result.message || '数据同步失败')
    }
  } catch (error) {
    console.error('文档同步失败:', error)
    ElMessage.error('文档同步失败，请检查网络连接和文档配置')
  }
}

const processDocumentData = (data: any[]): BusinessData[] => {
  // 处理从在线文档获取的数据，转换为BusinessData格式
  return processImportedData(data)
}

const goToDiagnostic = () => {
  router.push('/diagnostic')
}

// 生命周期
onMounted(() => {
  businessStore.loadBusinessData()
  handleDateChange()
})
</script>

<style scoped>
.data-input-view {
  padding: 0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.data-form {
  max-height: calc(100vh - 200px);
  overflow-y: auto;
}

.form-help {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.quick-actions-card {
  margin-bottom: 20px;
}

.quick-dates {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
}

.quick-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.recent-data-card {
  height: calc(100vh - 300px);
}

.recent-data-list {
  max-height: calc(100vh - 380px);
  overflow-y: auto;
}

.data-item {
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.data-item:hover {
  border-color: #409eff;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.2);
}

.data-item.selected {
  border-color: #409eff;
  background: #ecf5ff;
}

.data-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.data-date {
  font-weight: 500;
  color: #303133;
}

.data-summary {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
}

.summary-item .label {
  color: #909399;
}

.summary-item .value {
  color: #606266;
  font-weight: 500;
}

.empty-state {
  text-align: center;
  padding: 20px 0;
}

.template-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.template-item {
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  padding: 12px;
  cursor: pointer;
  transition: all 0.3s;
}

.template-item:hover {
  border-color: #409eff;
  background: #ecf5ff;
}

.template-name {
  font-weight: 500;
  color: #303133;
  margin-bottom: 4px;
}

.template-desc {
  font-size: 12px;
  color: #909399;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .data-input-view :deep(.el-row) {
    flex-direction: column;
  }
  
  .data-input-view :deep(.el-col) {
    width: 100% !important;
    margin-bottom: 16px;
  }
  
  .quick-dates,
  .quick-actions {
    justify-content: center;
  }
  
  .recent-data-card {
    height: auto;
  }
  
  .recent-data-list {
    max-height: 300px;
  }
}
</style>