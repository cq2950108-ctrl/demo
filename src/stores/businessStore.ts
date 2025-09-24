import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { BusinessData, ChartData, ChartType, TimePeriod, AnalyticsParams } from '@/types'
import { StorageService } from '@/utils/storage'
import { DateUtils } from '@/utils/date'

export const useBusinessStore = defineStore('business', () => {
  // 状态
  const businessData = ref<BusinessData[]>([])
  const selectedDate = ref<string>(DateUtils.getToday())
  const selectedPeriod = ref<TimePeriod>('month')
  const selectedChartType = ref<ChartType>('transaction_amount')

  // 计算属性
  const todayData = computed(() => {
    return businessData.value.find(data => data.date === DateUtils.getToday())
  })

  const selectedDateData = computed(() => {
    return businessData.value.find(data => data.date === selectedDate.value)
  })

  // 方法
  const loadBusinessData = () => {
    businessData.value = StorageService.getBusinessData()
  }

  const saveBusinessData = (data: Omit<BusinessData, 'id' | 'created_at'>) => {
    const newData: BusinessData = {
      ...data,
      id: StorageService.generateId(),
      created_at: DateUtils.formatDateTime(new Date())
    }
    
    // 检查是否已存在相同日期的数据
    const existingIndex = businessData.value.findIndex(item => item.date === data.date)
    if (existingIndex !== -1) {
      // 更新现有数据
      businessData.value[existingIndex] = newData
    } else {
      // 添加新数据
      businessData.value.push(newData)
    }
    
    StorageService.addBusinessData(newData)
    return newData
  }

  const getDataByDateRange = (startDate: string, endDate: string): BusinessData[] => {
    return businessData.value.filter(data => 
      data.date >= startDate && data.date <= endDate
    ).sort((a, b) => a.date.localeCompare(b.date))
  }

  const getChartData = (params: AnalyticsParams): ChartData[] => {
    const { startDate, endDate, chartType, period } = params
    let data = getDataByDateRange(startDate, endDate)
    
    // 根据时间维度聚合数据
    if (period === 'week') {
      data = aggregateByWeek(data, chartType)
    } else if (period === 'month') {
      data = aggregateByMonth(data, chartType)
    }
    
    return data.map(item => ({
      date: item.date,
      value: getValueByChartType(item, chartType),
      label: getChartTypeLabel(chartType)
    }))
  }

  const aggregateByWeek = (data: BusinessData[], chartType: ChartType): BusinessData[] => {
    // TODO: 根据 chartType 实现不同的聚合逻辑
    console.log('聚合类型:', chartType)
    const weeklyData: { [key: string]: BusinessData[] } = {}
    
    data.forEach(item => {
      const weekRange = DateUtils.getWeekRange(item.date)
      const weekKey = `${weekRange.start}_${weekRange.end}`
      
      if (!weeklyData[weekKey]) {
        weeklyData[weekKey] = []
      }
      weeklyData[weekKey].push(item)
    })
    
    return Object.entries(weeklyData).map(([weekKey, items]) => {
      const [startDate] = weekKey.split('_')
      return {
        id: `week_${weekKey}`,
        date: startDate,
        transaction_count: items.reduce((sum, item) => sum + item.transaction_count, 0),
        transaction_amount: items.reduce((sum, item) => sum + item.transaction_amount, 0),
        conversion_cost: items.reduce((sum, item) => sum + item.conversion_cost, 0) / items.length,
        exposure_count: items.reduce((sum, item) => sum + item.exposure_count, 0),
        conversion_rate: items.reduce((sum, item) => sum + item.conversion_rate, 0) / items.length,
        created_at: items[0].created_at
      }
    })
  }

  const aggregateByMonth = (data: BusinessData[], chartType: ChartType): BusinessData[] => {
    // TODO: 根据 chartType 实现不同的聚合逻辑
    console.log('聚合类型:', chartType)
    const monthlyData: { [key: string]: BusinessData[] } = {}
    
    data.forEach(item => {
      const monthKey = item.date.substring(0, 7) // YYYY-MM
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = []
      }
      monthlyData[monthKey].push(item)
    })
    
    return Object.entries(monthlyData).map(([monthKey, items]) => {
      return {
        id: `month_${monthKey}`,
        date: `${monthKey}-01`,
        transaction_count: items.reduce((sum, item) => sum + item.transaction_count, 0),
        transaction_amount: items.reduce((sum, item) => sum + item.transaction_amount, 0),
        conversion_cost: items.reduce((sum, item) => sum + item.conversion_cost, 0) / items.length,
        exposure_count: items.reduce((sum, item) => sum + item.exposure_count, 0),
        conversion_rate: items.reduce((sum, item) => sum + item.conversion_rate, 0) / items.length,
        created_at: items[0].created_at
      }
    })
  }

  const getValueByChartType = (data: BusinessData, chartType: ChartType): number => {
    switch (chartType) {
      case 'transaction_count':
        return data.transaction_count
      case 'transaction_amount':
        return data.transaction_amount
      case 'conversion_cost':
        return data.conversion_cost
      case 'exposure_count':
        return data.exposure_count
      case 'conversion_rate':
        return data.conversion_rate
      default:
        return 0
    }
  }

  const getChartTypeLabel = (chartType: ChartType): string => {
    const labels = {
      transaction_count: '成交数量',
      transaction_amount: '成交金额',
      conversion_cost: '转化成本',
      exposure_count: '曝光量',
      conversion_rate: '转化率'
    }
    return labels[chartType]
  }

  const getChartTypeUnit = (chartType: ChartType): string => {
    const units = {
      transaction_count: '笔',
      transaction_amount: '元',
      conversion_cost: '元',
      exposure_count: '次',
      conversion_rate: '%'
    }
    return units[chartType]
  }

  const exportData = (startDate: string, endDate: string): string => {
    const data = getDataByDateRange(startDate, endDate)
    
    // 生成CSV格式数据
    const headers = ['日期', '成交数量', '成交金额', '转化成本', '曝光量', '转化率']
    const csvContent = [
      headers.join(','),
      ...data.map(item => [
        item.date,
        item.transaction_count,
        item.transaction_amount,
        item.conversion_cost,
        item.exposure_count,
        item.conversion_rate
      ].join(','))
    ].join('\n')
    
    return csvContent
  }

  const downloadCSV = (startDate: string, endDate: string) => {
    const csvContent = exportData(startDate, endDate)
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `业务数据_${startDate}_${endDate}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const setSelectedDate = (date: string) => {
    selectedDate.value = date
  }

  const setSelectedPeriod = (period: TimePeriod) => {
    selectedPeriod.value = period
  }

  const setSelectedChartType = (chartType: ChartType) => {
    selectedChartType.value = chartType
  }

  // 获取统计摘要
  const getSummary = (startDate: string, endDate: string) => {
    const data = getDataByDateRange(startDate, endDate)
    
    if (data.length === 0) {
      return {
        totalTransactionCount: 0,
        totalTransactionAmount: 0,
        avgConversionCost: 0,
        totalExposureCount: 0,
        avgConversionRate: 0
      }
    }
    
    return {
      totalTransactionCount: data.reduce((sum, item) => sum + item.transaction_count, 0),
      totalTransactionAmount: data.reduce((sum, item) => sum + item.transaction_amount, 0),
      avgConversionCost: data.reduce((sum, item) => sum + item.conversion_cost, 0) / data.length,
      totalExposureCount: data.reduce((sum, item) => sum + item.exposure_count, 0),
      avgConversionRate: data.reduce((sum, item) => sum + item.conversion_rate, 0) / data.length
    }
  }

  return {
    // 状态
    businessData,
    selectedDate,
    selectedPeriod,
    selectedChartType,
    
    // 计算属性
    todayData,
    selectedDateData,
    
    // 方法
    loadBusinessData,
    saveBusinessData,
    getDataByDateRange,
    getChartData,
    getChartTypeLabel,
    getChartTypeUnit,
    exportData,
    downloadCSV,
    setSelectedDate,
    setSelectedPeriod,
    setSelectedChartType,
    getSummary
  }
})