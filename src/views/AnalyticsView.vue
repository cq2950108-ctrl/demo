<template>
  <div class="analytics-view">
    <!-- 控制面板 -->
    <el-card class="control-panel">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-select 
            v-model="selectedChartType" 
            placeholder="选择指标"
            style="width: 100%"
            @change="updateChart"
          >
            <el-option label="成交金额" value="transaction_amount" />
            <el-option label="成交数量" value="transaction_count" />
            <el-option label="转化成本" value="conversion_cost" />
            <el-option label="曝光量" value="exposure_count" />
            <el-option label="转化率" value="conversion_rate" />
          </el-select>
        </el-col>
        
        <el-col :span="6">
          <el-select 
            v-model="selectedPeriod" 
            placeholder="选择时间维度"
            style="width: 100%"
            @change="updateChart"
          >
            <el-option label="按天" value="day" />
            <el-option label="按周" value="week" />
            <el-option label="按月" value="month" />
          </el-select>
        </el-col>
        
        <el-col :span="8">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            style="width: 100%"
            @change="updateChart"
          />
        </el-col>
        
        <el-col :span="4">
          <el-button type="primary" @click="exportData" style="width: 100%">
            <el-icon><Download /></el-icon>
            导出数据
          </el-button>
        </el-col>
      </el-row>
    </el-card>

    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stats-cards">
      <el-col :span="6">
        <el-card class="stat-card">
          <el-statistic 
            title="总成交金额" 
            :value="summary.totalTransactionAmount" 
            :precision="2"
            suffix="元"
          >
            <template #prefix>
              <el-icon style="color: #409eff"><Money /></el-icon>
            </template>
          </el-statistic>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card class="stat-card">
          <el-statistic 
            title="总成交数量" 
            :value="summary.totalTransactionCount" 
            suffix="笔"
          >
            <template #prefix>
              <el-icon style="color: #67c23a"><ShoppingCart /></el-icon>
            </template>
          </el-statistic>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card class="stat-card">
          <el-statistic 
            title="平均转化成本" 
            :value="summary.avgConversionCost" 
            :precision="2"
            suffix="元"
          >
            <template #prefix>
              <el-icon style="color: #e6a23c"><Coin /></el-icon>
            </template>
          </el-statistic>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card class="stat-card">
          <el-statistic 
            title="平均转化率" 
            :value="summary.avgConversionRate" 
            :precision="2"
            suffix="%"
          >
            <template #prefix>
              <el-icon style="color: #f56c6c"><TrendCharts /></el-icon>
            </template>
          </el-statistic>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表和表格 -->
    <el-row :gutter="20">
      <!-- 图表区域 -->
      <el-col :span="16">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>{{ chartTitle }}</span>
              <div class="chart-actions">
                <el-button-group>
                  <el-button 
                    :type="chartMode === 'line' ? 'primary' : 'default'"
                    size="small"
                    @click="setChartMode('line')"
                  >
                    <el-icon><TrendCharts /></el-icon>
                    折线图
                  </el-button>
                  <el-button 
                    :type="chartMode === 'bar' ? 'primary' : 'default'"
                    size="small"
                    @click="setChartMode('bar')"
                  >
                    <el-icon><Histogram /></el-icon>
                    柱状图
                  </el-button>
                </el-button-group>
              </div>
            </div>
          </template>
          
          <div ref="chartContainer" class="chart-container"></div>
        </el-card>
      </el-col>
      
      <!-- 数据表格 -->
      <el-col :span="8">
        <el-card class="table-card">
          <template #header>
            <span>数据详情</span>
          </template>
          
          <el-table 
            :data="tableData" 
            height="400"
            size="small"
            stripe
          >
            <el-table-column 
              prop="date" 
              label="日期" 
              width="100"
              :formatter="formatTableDate"
            />
            <el-table-column 
              prop="value" 
              :label="chartTypeLabel"
              :formatter="formatTableValue"
            />
          </el-table>
        </el-card>
      </el-col>
    </el-row>

    <!-- 趋势分析 -->
    <el-card class="trend-analysis">
      <template #header>
        <span>趋势分析</span>
      </template>
      
      <el-row :gutter="20">
        <el-col :span="8">
          <div class="trend-item">
            <div class="trend-title">环比增长</div>
            <div class="trend-value" :class="trendAnalysis.growth >= 0 ? 'positive' : 'negative'">
              <el-icon>
                <ArrowUp v-if="trendAnalysis.growth >= 0" />
                <ArrowDown v-else />
              </el-icon>
              {{ Math.abs(trendAnalysis.growth).toFixed(2) }}%
            </div>
          </div>
        </el-col>
        
        <el-col :span="8">
          <div class="trend-item">
            <div class="trend-title">最高值</div>
            <div class="trend-value">
              {{ trendAnalysis.maxValue.toFixed(2) }} {{ chartTypeUnit }}
            </div>
            <div class="trend-date">{{ formatDate(trendAnalysis.maxDate) }}</div>
          </div>
        </el-col>
        
        <el-col :span="8">
          <div class="trend-item">
            <div class="trend-title">最低值</div>
            <div class="trend-value">
              {{ trendAnalysis.minValue.toFixed(2) }} {{ chartTypeUnit }}
            </div>
            <div class="trend-date">{{ formatDate(trendAnalysis.minDate) }}</div>
          </div>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { 
  Download, 
  Money, 
  ShoppingCart, 
  Coin, 
  TrendCharts, 
  Histogram,
  ArrowUp,
  ArrowDown
} from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import { useBusinessStore } from '@/stores/businessStore'
import { DateUtils } from '@/utils/date'
import type { ChartType, TimePeriod } from '@/types'

const businessStore = useBusinessStore()

// 响应式数据
const chartContainer = ref<HTMLElement>()
const selectedChartType = ref<ChartType>('transaction_amount')
const selectedPeriod = ref<TimePeriod>('day')
const dateRange = ref<[string, string]>([DateUtils.getThisMonth().start, DateUtils.getThisMonth().end])
const chartMode = ref<'line' | 'bar'>('line')
let chartInstance: echarts.ECharts | null = null

// 计算属性
const chartData = computed(() => {
  if (!dateRange.value) return []
  
  const [startDate, endDate] = dateRange.value
  return businessStore.getChartData({
    startDate,
    endDate,
    chartType: selectedChartType.value,
    period: selectedPeriod.value
  })
})

const tableData = computed(() => {
  return chartData.value.map(item => ({
    date: item.date,
    value: item.value
  }))
})

const summary = computed(() => {
  if (!dateRange.value) return {
    totalTransactionAmount: 0,
    totalTransactionCount: 0,
    avgConversionCost: 0,
    avgConversionRate: 0
  }
  
  const [startDate, endDate] = dateRange.value
  return businessStore.getSummary(startDate, endDate)
})

const chartTitle = computed(() => {
  const typeLabel = businessStore.getChartTypeLabel(selectedChartType.value)
  const periodLabel = {
    day: '日',
    week: '周',
    month: '月',
    custom: '自定义'
  }[selectedPeriod.value]
  
  return `${typeLabel}趋势图（按${periodLabel}）`
})

const chartTypeLabel = computed(() => {
  return businessStore.getChartTypeLabel(selectedChartType.value)
})

const chartTypeUnit = computed(() => {
  return businessStore.getChartTypeUnit(selectedChartType.value)
})

const trendAnalysis = computed(() => {
  const data = chartData.value
  
  if (data.length === 0) {
    return {
      growth: 0,
      maxValue: 0,
      maxDate: '',
      minValue: 0,
      minDate: ''
    }
  }
  
  // 计算环比增长
  let growth = 0
  if (data.length >= 2) {
    const current = data[data.length - 1].value
    const previous = data[data.length - 2].value
    growth = previous !== 0 ? ((current - previous) / previous) * 100 : 0
  }
  
  // 找出最高值和最低值
  const maxItem = data.reduce((max, item) => item.value > max.value ? item : max, data[0])
  const minItem = data.reduce((min, item) => item.value < min.value ? item : min, data[0])
  
  return {
    growth,
    maxValue: maxItem.value,
    maxDate: maxItem.date,
    minValue: minItem.value,
    minDate: minItem.date
  }
})

// 方法
const initChart = () => {
  if (!chartContainer.value) return
  
  chartInstance = echarts.init(chartContainer.value)
  updateChart()
  
  // 监听窗口大小变化
  window.addEventListener('resize', () => {
    chartInstance?.resize()
  })
}

const updateChart = () => {
  if (!chartInstance) return
  
  const data = chartData.value
  const dates = data.map(item => item.date)
  const values = data.map(item => item.value)
  
  const option = {
    title: {
      text: chartTitle.value,
      left: 'center',
      textStyle: {
        fontSize: 16,
        fontWeight: 'normal'
      }
    },
    tooltip: {
      trigger: 'axis',
      formatter: (params: any) => {
        const data = params[0]
        return `${formatDate(data.axisValue)}<br/>${chartTypeLabel.value}: ${data.value} ${chartTypeUnit.value}`
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: dates,
      axisLabel: {
        formatter: (value: string) => formatDate(value)
      }
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: (value: number) => `${value} ${chartTypeUnit.value}`
      }
    },
    series: [
      {
        name: chartTypeLabel.value,
        type: chartMode.value,
        data: values,
        smooth: chartMode.value === 'line',
        itemStyle: {
          color: '#409eff'
        },
        areaStyle: chartMode.value === 'line' ? {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(64, 158, 255, 0.3)' },
              { offset: 1, color: 'rgba(64, 158, 255, 0.1)' }
            ]
          }
        } : undefined
      }
    ]
  }
  
  chartInstance.setOption(option)
}

const setChartMode = (mode: 'line' | 'bar') => {
  chartMode.value = mode
  updateChart()
}

const exportData = () => {
  if (!dateRange.value) {
    ElMessage.warning('请选择日期范围')
    return
  }
  
  const [startDate, endDate] = dateRange.value
  businessStore.downloadCSV(startDate, endDate)
  ElMessage.success('数据导出成功')
}

const formatDate = (date: string) => {
  return DateUtils.getFriendlyDate(date)
}

const formatTableDate = (row: any) => {
  return formatDate(row.date)
}

const formatTableValue = (row: any) => {
  return `${row.value.toFixed(2)} ${chartTypeUnit.value}`
}

// 监听数据变化
watch([selectedChartType, selectedPeriod, dateRange], () => {
  nextTick(() => {
    updateChart()
  })
}, { deep: true })

// 生命周期
onMounted(() => {
  businessStore.loadBusinessData()
  nextTick(() => {
    initChart()
  })
})
</script>

<style scoped>
.analytics-view {
  padding: 0;
}

.control-panel {
  margin-bottom: 20px;
}

.stats-cards {
  margin-bottom: 20px;
}

.stat-card {
  text-align: center;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chart-actions {
  display: flex;
  gap: 8px;
}

.chart-card {
  margin-bottom: 20px;
}

.chart-container {
  width: 100%;
  height: 400px;
}

.table-card {
  height: 500px;
}

.trend-analysis {
  margin-bottom: 20px;
}

.trend-item {
  text-align: center;
  padding: 16px;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  background: #fafafa;
}

.trend-title {
  font-size: 14px;
  color: #909399;
  margin-bottom: 8px;
}

.trend-value {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.trend-value.positive {
  color: #67c23a;
}

.trend-value.negative {
  color: #f56c6c;
}

.trend-date {
  font-size: 12px;
  color: #909399;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .analytics-view :deep(.el-row) {
    flex-direction: column;
  }
  
  .analytics-view :deep(.el-col) {
    width: 100% !important;
    margin-bottom: 16px;
  }
  
  .chart-container {
    height: 300px;
  }
  
  .table-card {
    height: auto;
  }
  
  .table-card :deep(.el-table) {
    height: 300px !important;
  }
}

@media (max-width: 768px) {
  .control-panel :deep(.el-row) {
    flex-direction: column;
  }
  
  .control-panel :deep(.el-col) {
    width: 100% !important;
    margin-bottom: 8px;
  }
  
  .stats-cards :deep(.el-row) {
    flex-direction: column;
  }
  
  .stats-cards :deep(.el-col) {
    width: 100% !important;
    margin-bottom: 8px;
  }
  
  .chart-actions {
    flex-direction: column;
  }
  
  .trend-analysis :deep(.el-row) {
    flex-direction: column;
  }
  
  .trend-analysis :deep(.el-col) {
    width: 100% !important;
    margin-bottom: 8px;
  }
}
</style>