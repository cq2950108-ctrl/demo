import type { DocumentConfig, SyncRecord, BusinessData, ApiResponse } from '@/types'
import { StorageService } from './storage'
import { DateUtils } from './date'
import { FeishuService } from './feishuService'

// 存储键名常量
const DOCUMENT_STORAGE_KEYS = {
  CONFIGS: 'personal_efficiency_document_configs',
  SYNC_RECORDS: 'personal_efficiency_sync_records'
}

/**
 * 在线文档服务类
 */
export class DocumentService {
  /**
   * 获取所有文档配置
   */
  static getDocumentConfigs(): DocumentConfig[] {
    try {
      const data = localStorage.getItem(DOCUMENT_STORAGE_KEYS.CONFIGS)
      return data ? JSON.parse(data) : []
    } catch (error) {
      console.error('获取文档配置失败:', error)
      return []
    }
  }

  /**
   * 保存文档配置
   */
  static saveDocumentConfigs(configs: DocumentConfig[]): void {
    try {
      localStorage.setItem(DOCUMENT_STORAGE_KEYS.CONFIGS, JSON.stringify(configs))
    } catch (error) {
      console.error('保存文档配置失败:', error)
    }
  }

  /**
   * 添加文档配置
   */
  static addDocumentConfig(config: Omit<DocumentConfig, 'id' | 'created_at' | 'updated_at'>): DocumentConfig {
    const newConfig: DocumentConfig = {
      ...config,
      id: StorageService.generateId(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    const configs = this.getDocumentConfigs()
    configs.push(newConfig)
    this.saveDocumentConfigs(configs)
    
    return newConfig
  }

  /**
   * 更新文档配置
   */
  static updateDocumentConfig(configId: string, updates: Partial<DocumentConfig>): void {
    const configs = this.getDocumentConfigs()
    const index = configs.findIndex(config => config.id === configId)
    
    if (index !== -1) {
      configs[index] = {
        ...configs[index],
        ...updates,
        updated_at: new Date().toISOString()
      }
      this.saveDocumentConfigs(configs)
    }
  }

  /**
   * 删除文档配置
   */
  static deleteDocumentConfig(configId: string): void {
    const configs = this.getDocumentConfigs()
    const filteredConfigs = configs.filter(config => config.id !== configId)
    this.saveDocumentConfigs(filteredConfigs)
    
    // 同时删除相关的同步记录
    const syncRecords = this.getSyncRecords()
    const filteredRecords = syncRecords.filter(record => record.configId !== configId)
    this.saveSyncRecords(filteredRecords)
  }

  /**
   * 获取同步记录
   */
  static getSyncRecords(): SyncRecord[] {
    try {
      const data = localStorage.getItem(DOCUMENT_STORAGE_KEYS.SYNC_RECORDS)
      return data ? JSON.parse(data) : []
    } catch (error) {
      console.error('获取同步记录失败:', error)
      return []
    }
  }

  /**
   * 保存同步记录
   */
  static saveSyncRecords(records: SyncRecord[]): void {
    try {
      localStorage.setItem(DOCUMENT_STORAGE_KEYS.SYNC_RECORDS, JSON.stringify(records))
    } catch (error) {
      console.error('保存同步记录失败:', error)
    }
  }

  /**
   * 添加同步记录
   */
  static addSyncRecord(record: Omit<SyncRecord, 'id' | 'created_at'>): SyncRecord {
    const newRecord: SyncRecord = {
      ...record,
      id: StorageService.generateId(),
      created_at: new Date().toISOString()
    }
    
    const records = this.getSyncRecords()
    records.push(newRecord)
    
    // 只保留最近100条记录
    if (records.length > 100) {
      records.splice(0, records.length - 100)
    }
    
    this.saveSyncRecords(records)
    return newRecord
  }

  /**
   * 测试文档连接
   */
  static async testConnection(config: DocumentConfig): Promise<ApiResponse<boolean>> {
    try {
      switch (config.type) {
        case 'google_sheets':
          return await this.testGoogleSheetsConnection(config)
        case 'tencent_docs':
          return await this.testTencentDocsConnection(config)
        case 'feishu_sheets':
          return await this.testFeishuSheetsConnection(config)
        case 'dingtalk_sheets':
          return await this.testDingtalkSheetsConnection(config)
        default:
          return {
            success: false,
            error: '不支持的文档类型'
          }
      }
    } catch (error) {
      return {
        success: false,
        error: `连接测试失败: ${error instanceof Error ? error.message : '未知错误'}`
      }
    }
  }

  /**
   * 从在线文档同步数据
   */
  static async syncDataFromDocument(config: DocumentConfig): Promise<ApiResponse<BusinessData[]>> {
    const startTime = new Date().toISOString()
    let syncRecord: SyncRecord
    
    try {
      // 创建同步记录
      syncRecord = this.addSyncRecord({
        configId: config.id,
        status: 'syncing',
        startTime,
        recordsCount: 0
      })

      let result: ApiResponse<BusinessData[]>
      
      switch (config.type) {
        case 'google_sheets':
          result = await this.syncFromGoogleSheets(config)
          break
        case 'tencent_docs':
          result = await this.syncFromTencentDocs(config)
          break
        case 'feishu_sheets':
          result = await this.syncFromFeishuSheets(config)
          break
        case 'dingtalk_sheets':
          result = await this.syncFromDingtalkSheets(config)
          break
        default:
          result = {
            success: false,
            error: '不支持的文档类型'
          }
      }

      // 更新同步记录
      const records = this.getSyncRecords()
      const recordIndex = records.findIndex(r => r.id === syncRecord.id)
      if (recordIndex !== -1) {
        records[recordIndex] = {
          ...records[recordIndex],
          status: result.success ? 'success' : 'error',
          endTime: new Date().toISOString(),
          recordsCount: result.success ? (result.data?.length || 0) : 0,
          errorMessage: result.error
        }
        this.saveSyncRecords(records)
      }

      // 更新配置的最后同步时间
      if (result.success) {
        this.updateDocumentConfig(config.id, {
          lastSyncTime: new Date().toISOString()
        })
      }

      return result
    } catch (error) {
      // 更新同步记录为错误状态
      const records = this.getSyncRecords()
      const recordIndex = records.findIndex(r => r.id === syncRecord!.id)
      if (recordIndex !== -1) {
        records[recordIndex] = {
          ...records[recordIndex],
          status: 'error',
          endTime: new Date().toISOString(),
          errorMessage: error instanceof Error ? error.message : '未知错误'
        }
        this.saveSyncRecords(records)
      }

      return {
        success: false,
        error: `同步失败: ${error instanceof Error ? error.message : '未知错误'}`
      }
    }
  }

  // 私有方法：各平台连接测试
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private static async testGoogleSheetsConnection(_config: DocumentConfig): Promise<ApiResponse<boolean>> {
    // TODO: 实现Google Sheets连接测试
    return {
      success: false,
      error: 'Google Sheets连接功能待实现'
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private static async testTencentDocsConnection(_config: DocumentConfig): Promise<ApiResponse<boolean>> {
    // TODO: 实现腾讯文档连接测试
    return {
      success: false,
      error: '腾讯文档连接功能待实现'
    }
  }

  private static async testFeishuSheetsConnection(config: DocumentConfig): Promise<ApiResponse<boolean>> {
    return await FeishuService.testConnection(config)
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private static async testDingtalkSheetsConnection(_config: DocumentConfig): Promise<ApiResponse<boolean>> {
    // TODO: 实现钉钉表格连接测试
    return {
      success: false,
      error: '钉钉表格连接功能待实现'
    }
  }

  // 私有方法：各平台数据同步
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private static async syncFromGoogleSheets(_config: DocumentConfig): Promise<ApiResponse<BusinessData[]>> {
    // TODO: 实现Google Sheets数据同步
    return {
      success: false,
      error: 'Google Sheets数据同步功能待实现'
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private static async syncFromTencentDocs(_config: DocumentConfig): Promise<ApiResponse<BusinessData[]>> {
    // TODO: 实现腾讯文档数据同步
    return {
      success: false,
      error: '腾讯文档数据同步功能待实现'
    }
  }

  private static async syncFromFeishuSheets(config: DocumentConfig): Promise<ApiResponse<BusinessData[]>> {
    return await FeishuService.syncData(config)
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private static async syncFromDingtalkSheets(_config: DocumentConfig): Promise<ApiResponse<BusinessData[]>> {
    // TODO: 实现钉钉表格数据同步
    return {
      success: false,
      error: '钉钉表格数据同步功能待实现'
    }
  }

  /**
   * 导出数据为指定格式
   */
  static async exportData(data: BusinessData[], format: 'xlsx' | 'csv' | 'json', filename?: string): Promise<void> {
    const defaultFilename = `business_data_${DateUtils.formatDate(new Date())}`
    const finalFilename = filename || defaultFilename

    switch (format) {
      case 'xlsx':
        await this.exportToExcel(data, finalFilename)
        break
      case 'csv':
        await this.exportToCSV(data, finalFilename)
        break
      case 'json':
        await this.exportToJSON(data, finalFilename)
        break
    }
  }

  private static async exportToExcel(data: BusinessData[], filename: string): Promise<void> {
    // 使用现有的XLSX库
    const XLSX = await import('xlsx')
    
    const worksheet = XLSX.utils.json_to_sheet(data.map(item => ({
      '日期': item.date,
      '成交数量': item.transaction_count,
      '成交金额': item.transaction_amount,
      '转化成本': item.conversion_cost,
      '曝光量': item.exposure_count,
      '转化率': item.conversion_rate
    })))
    
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, '业务数据')
    
    XLSX.writeFile(workbook, `${filename}.xlsx`)
  }

  private static async exportToCSV(data: BusinessData[], filename: string): Promise<void> {
    // 使用现有的papaparse库
    const Papa = await import('papaparse')
    
    const csvData = data.map(item => ({
      '日期': item.date,
      '成交数量': item.transaction_count,
      '成交金额': item.transaction_amount,
      '转化成本': item.conversion_cost,
      '曝光量': item.exposure_count,
      '转化率': item.conversion_rate
    }))
    
    const csv = Papa.unparse(csvData)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `${filename}.csv`
    link.click()
  }

  private static async exportToJSON(data: BusinessData[], filename: string): Promise<void> {
    const jsonString = JSON.stringify(data, null, 2)
    const blob = new Blob([jsonString], { type: 'application/json' })
    
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `${filename}.json`
    link.click()
  }
}