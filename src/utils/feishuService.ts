import type { DocumentConfig, ApiResponse, BusinessData } from '@/types'

// 飞书API配置
// 注意：在生产环境中，CLIENT_ID和CLIENT_SECRET应该从环境变量或配置文件中获取
const FEISHU_CONFIG = {
  CLIENT_ID: import.meta.env.VITE_FEISHU_CLIENT_ID || 'cli_a1234567890abcde', // 需要在飞书开放平台申请
  CLIENT_SECRET: import.meta.env.VITE_FEISHU_CLIENT_SECRET || '', // 需要在飞书开放平台申请
  REDIRECT_URI: `${window.location.origin}/feishu-callback`,
  SCOPE: 'sheets:read',
  API_BASE_URL: 'https://open.feishu.cn/open-apis'
}

/**
 * 检查飞书配置是否完整
 */
function checkFeishuConfig(): { isValid: boolean; error?: string } {
  if (!FEISHU_CONFIG.CLIENT_ID || FEISHU_CONFIG.CLIENT_ID === 'cli_a1234567890abcde') {
    return {
      isValid: false,
      error: '请在.env文件中配置VITE_FEISHU_CLIENT_ID'
    }
  }
  
  if (!FEISHU_CONFIG.CLIENT_SECRET) {
    return {
      isValid: false,
      error: '请在.env文件中配置VITE_FEISHU_CLIENT_SECRET'
    }
  }
  
  return { isValid: true }
}

// 飞书授权相关的存储键
const FEISHU_STORAGE_KEYS = {
  ACCESS_TOKEN: 'feishu_access_token',
  REFRESH_TOKEN: 'feishu_refresh_token',
  TOKEN_EXPIRES_AT: 'feishu_token_expires_at',
  USER_INFO: 'feishu_user_info'
}

/**
 * 飞书服务类
 */
export class FeishuService {
  /**
   * 获取飞书OAuth2.0授权URL
   */
  static getAuthUrl(): string {
    const configCheck = checkFeishuConfig()
    if (!configCheck.isValid) {
      throw new Error(configCheck.error)
    }
    
    const params = new URLSearchParams({
      client_id: FEISHU_CONFIG.CLIENT_ID,
      redirect_uri: FEISHU_CONFIG.REDIRECT_URI,
      response_type: 'code',
      scope: FEISHU_CONFIG.SCOPE,
      state: this.generateState()
    })
    
    return `https://open.feishu.cn/open-apis/authen/v1/authorize?${params.toString()}`
  }

  /**
   * 生成随机状态码用于防止CSRF攻击
   */
  private static generateState(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  }

  /**
   * 处理授权回调，获取访问令牌
   */
  static async handleAuthCallback(code: string): Promise<ApiResponse<any>> {
    const configCheck = checkFeishuConfig()
    if (!configCheck.isValid) {
      return {
        success: false,
        error: configCheck.error!
      }
    }
    
    try {
      const response = await fetch(`${FEISHU_CONFIG.API_BASE_URL}/authen/v1/access_token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          grant_type: 'authorization_code',
          client_id: FEISHU_CONFIG.CLIENT_ID,
          client_secret: FEISHU_CONFIG.CLIENT_SECRET,
          code: code,
          redirect_uri: FEISHU_CONFIG.REDIRECT_URI
        })
      })

      const data = await response.json()
      
      if (data.code === 0) {
        // 保存令牌信息
        const expiresAt = Date.now() + (data.data.expires_in * 1000)
        
        localStorage.setItem(FEISHU_STORAGE_KEYS.ACCESS_TOKEN, data.data.access_token)
        localStorage.setItem(FEISHU_STORAGE_KEYS.REFRESH_TOKEN, data.data.refresh_token)
        localStorage.setItem(FEISHU_STORAGE_KEYS.TOKEN_EXPIRES_AT, expiresAt.toString())
        
        return {
          success: true,
          data: data.data
        }
      } else {
        return {
          success: false,
          error: data.msg || '获取访问令牌失败'
        }
      }
    } catch (error) {
      return {
        success: false,
        error: `授权失败: ${error instanceof Error ? error.message : '未知错误'}`
      }
    }
  }

  /**
   * 刷新访问令牌
   */
  static async refreshAccessToken(): Promise<ApiResponse<any>> {
    const refreshToken = localStorage.getItem(FEISHU_STORAGE_KEYS.REFRESH_TOKEN)
    
    if (!refreshToken) {
      return {
        success: false,
        error: '没有刷新令牌，需要重新授权'
      }
    }

    try {
      const response = await fetch(`${FEISHU_CONFIG.API_BASE_URL}/authen/v1/refresh_access_token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          grant_type: 'refresh_token',
          refresh_token: refreshToken
        })
      })

      const data = await response.json()
      
      if (data.code === 0) {
        const expiresAt = Date.now() + (data.data.expires_in * 1000)
        
        localStorage.setItem(FEISHU_STORAGE_KEYS.ACCESS_TOKEN, data.data.access_token)
        localStorage.setItem(FEISHU_STORAGE_KEYS.REFRESH_TOKEN, data.data.refresh_token)
        localStorage.setItem(FEISHU_STORAGE_KEYS.TOKEN_EXPIRES_AT, expiresAt.toString())
        
        return {
          success: true,
          data: data.data
        }
      } else {
        return {
          success: false,
          error: data.msg || '刷新令牌失败'
        }
      }
    } catch (error) {
      return {
        success: false,
        error: `刷新令牌失败: ${error instanceof Error ? error.message : '未知错误'}`
      }
    }
  }

  /**
   * 获取有效的访问令牌
   */
  static async getValidAccessToken(): Promise<string | null> {
    const accessToken = localStorage.getItem(FEISHU_STORAGE_KEYS.ACCESS_TOKEN)
    const expiresAt = localStorage.getItem(FEISHU_STORAGE_KEYS.TOKEN_EXPIRES_AT)
    
    if (!accessToken || !expiresAt) {
      return null
    }
    
    // 检查令牌是否即将过期（提前5分钟刷新）
    if (Date.now() > (parseInt(expiresAt) - 5 * 60 * 1000)) {
      const refreshResult = await this.refreshAccessToken()
      if (refreshResult.success) {
        return localStorage.getItem(FEISHU_STORAGE_KEYS.ACCESS_TOKEN)
      } else {
        return null
      }
    }
    
    return accessToken
  }

  /**
   * 检查是否已授权
   */
  static isAuthorized(): boolean {
    const accessToken = localStorage.getItem(FEISHU_STORAGE_KEYS.ACCESS_TOKEN)
    const expiresAt = localStorage.getItem(FEISHU_STORAGE_KEYS.TOKEN_EXPIRES_AT)
    
    return !!(accessToken && expiresAt && Date.now() < parseInt(expiresAt))
  }

  /**
   * 清除授权信息
   */
  static clearAuth(): void {
    localStorage.removeItem(FEISHU_STORAGE_KEYS.ACCESS_TOKEN)
    localStorage.removeItem(FEISHU_STORAGE_KEYS.REFRESH_TOKEN)
    localStorage.removeItem(FEISHU_STORAGE_KEYS.TOKEN_EXPIRES_AT)
    localStorage.removeItem(FEISHU_STORAGE_KEYS.USER_INFO)
  }

  /**
   * 测试飞书表格连接
   */
  static async testConnection(config: DocumentConfig): Promise<ApiResponse<boolean>> {
    const configCheck = checkFeishuConfig()
    if (!configCheck.isValid) {
      return {
        success: false,
        error: configCheck.error!
      }
    }
    
    try {
      const accessToken = await this.getValidAccessToken()
      
      if (!accessToken) {
        return {
          success: false,
          error: '未授权，请先进行飞书授权'
        }
      }

      // 从URL中提取spreadsheet_token
      const spreadsheetToken = this.extractSpreadsheetToken(config.url)
      if (!spreadsheetToken) {
        return {
          success: false,
          error: '无效的飞书表格链接'
        }
      }

      // 测试获取表格信息
      const response = await fetch(
        `${FEISHU_CONFIG.API_BASE_URL}/sheets/v1/spreadsheets/${spreadsheetToken}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      )

      const data = await response.json()
      
      if (data.code === 0) {
        return {
          success: true,
          data: true
        }
      } else {
        return {
          success: false,
          error: data.msg || '连接测试失败'
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
   * 从飞书表格URL中提取spreadsheet_token
   */
  private static extractSpreadsheetToken(url: string): string | null {
    // 飞书表格URL格式: https://xxx.feishu.cn/sheets/shtcnxxxxxx
    const match = url.match(/\/sheets\/(\w+)/)
    return match ? match[1] : null
  }

  /**
   * 从飞书表格同步数据
   */
  static async syncData(config: DocumentConfig): Promise<ApiResponse<BusinessData[]>> {
    console.log('开始飞书数据同步，配置:', config)
    
    const configCheck = checkFeishuConfig()
    if (!configCheck.isValid) {
      console.error('飞书配置检查失败:', configCheck.error)
      return {
        success: false,
        error: configCheck.error!
      }
    }
    
    try {
      const accessToken = await this.getValidAccessToken()
      console.log('获取访问令牌:', accessToken ? '成功' : '失败')
      
      if (!accessToken) {
        return {
          success: false,
          error: '未授权，请先进行飞书授权'
        }
      }

      const spreadsheetToken = this.extractSpreadsheetToken(config.url)
      console.log('提取表格Token:', spreadsheetToken)
      if (!spreadsheetToken) {
        return {
          success: false,
          error: '无效的飞书表格链接，请检查URL格式是否正确'
        }
      }

      // 获取表格的工作表列表
      console.log('正在获取工作表列表...')
      const sheetsResponse = await fetch(
        `${FEISHU_CONFIG.API_BASE_URL}/sheets/v1/spreadsheets/${spreadsheetToken}/sheets`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      )

      const sheetsData = await sheetsResponse.json()
      console.log('工作表列表响应:', sheetsData)
      
      if (sheetsData.code !== 0) {
        return {
          success: false,
          error: `获取工作表列表失败: ${sheetsData.msg || '未知错误'} (错误代码: ${sheetsData.code})`
        }
      }

      // 使用第一个工作表或指定的工作表
      const sheetId = config.sheetId || sheetsData.data.sheets[0]?.sheet_id
      console.log('使用工作表ID:', sheetId)
      if (!sheetId) {
        return {
          success: false,
          error: '未找到有效的工作表，请检查表格是否包含工作表'
        }
      }

      // 获取表格数据
      const range = config.range || 'A1:G1000' // 默认范围
      console.log('正在获取表格数据，范围:', range)
      const dataResponse = await fetch(
        `${FEISHU_CONFIG.API_BASE_URL}/sheets/v1/spreadsheets/${spreadsheetToken}/sheets/${sheetId}/values/${range}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      )

      const dataResult = await dataResponse.json()
      console.log('表格数据响应:', dataResult)
      
      if (dataResult.code !== 0) {
        return {
          success: false,
          error: `获取表格数据失败: ${dataResult.msg || '未知错误'} (错误代码: ${dataResult.code})`
        }
      }

      // 转换数据格式
      const businessData = this.convertToBusinessData(dataResult.data.values)
      console.log('转换后的业务数据:', businessData)
      
      return {
        success: true,
        data: businessData
      }
    } catch (error) {
      console.error('数据同步异常:', error)
      return {
        success: false,
        error: `数据同步失败: ${error instanceof Error ? error.message : '未知错误'}`
      }
    }
  }

  /**
   * 将飞书表格数据转换为BusinessData格式
   */
  private static convertToBusinessData(values: any[][]): BusinessData[] {
    if (!values || values.length < 2) {
      return []
    }

    const businessData: BusinessData[] = []
    
    // 假设第一行是标题行，从第二行开始处理数据
    for (let i = 1; i < values.length; i++) {
      const row = values[i]
      
      try {
        // 假设列的顺序为：日期、成交数量、成交金额、转化成本、曝光量、转化率
        const date = this.parseDate(row[0])
        const transactionCount = this.parseNumber(row[1])
        const transactionAmount = this.parseNumber(row[2])
        const conversionCost = this.parseNumber(row[3])
        const exposureCount = this.parseNumber(row[4])
        const conversionRate = this.parseNumber(row[5])

        if (date && !isNaN(transactionCount) && !isNaN(transactionAmount)) {
          businessData.push({
            id: `feishu_${Date.now()}_${i}`,
            date: date,
            transaction_count: transactionCount,
            transaction_amount: transactionAmount,
            conversion_cost: conversionCost,
            exposure_count: exposureCount,
            conversion_rate: conversionRate,
            created_at: new Date().toISOString()
          })
        }
      } catch (error) {
        console.warn(`第${i + 1}行数据处理失败:`, error)
      }
    }

    return businessData
  }

  /**
   * 解析日期
   */
  private static parseDate(value: any): string | null {
    if (!value) return null
    
    try {
      // 处理各种日期格式
      if (typeof value === 'string') {
        const date = new Date(value)
        if (!isNaN(date.getTime())) {
          return date.toISOString().split('T')[0] // YYYY-MM-DD格式
        }
      } else if (typeof value === 'number') {
        // Excel日期格式（从1900年1月1日开始的天数）
        const date = new Date((value - 25569) * 86400 * 1000)
        if (!isNaN(date.getTime())) {
          return date.toISOString().split('T')[0]
        }
      }
    } catch (error) {
      console.warn('日期解析失败:', value, error)
    }
    
    return null
  }

  /**
   * 解析数字
   */
  private static parseNumber(value: any): number {
    if (typeof value === 'number') {
      return value
    }
    
    if (typeof value === 'string') {
      const num = parseFloat(value.replace(/[^\d.-]/g, ''))
      return isNaN(num) ? 0 : num
    }
    
    return 0
  }

  /**
   * 启动授权流程
   */
  static startAuth(): void {
    const authUrl = this.getAuthUrl()
    window.open(authUrl, '_blank', 'width=600,height=700')
  }
}