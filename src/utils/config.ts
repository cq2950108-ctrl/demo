/**
 * 配置检查工具
 */

export interface ConfigCheckResult {
  isValid: boolean
  error?: string
}

/**
 * 检查飞书配置是否完整
 */
export function checkFeishuConfig(): ConfigCheckResult {
  const appId = import.meta.env.VUE_APP_FEISHU_APP_ID
  const appSecret = import.meta.env.VUE_APP_FEISHU_APP_SECRET
  const redirectUri = import.meta.env.VUE_APP_FEISHU_REDIRECT_URI

  if (!appId) {
    return {
      isValid: false,
      error: '缺少飞书应用ID (VUE_APP_FEISHU_APP_ID)'
    }
  }

  if (!appSecret) {
    return {
      isValid: false,
      error: '缺少飞书应用密钥 (VUE_APP_FEISHU_APP_SECRET)'
    }
  }

  if (!redirectUri) {
    return {
      isValid: false,
      error: '缺少飞书重定向URI (VUE_APP_FEISHU_REDIRECT_URI)'
    }
  }

  return {
    isValid: true
  }
}

/**
 * 获取飞书配置信息
 */
export function getFeishuConfig() {
  return {
    appId: import.meta.env.VUE_APP_FEISHU_APP_ID,
    appSecret: import.meta.env.VUE_APP_FEISHU_APP_SECRET,
    redirectUri: import.meta.env.VUE_APP_FEISHU_REDIRECT_URI
  }
}

/**
 * 检查环境变量配置
 */
export function checkEnvironmentConfig(): ConfigCheckResult {
  const nodeEnv = import.meta.env.NODE_ENV

  if (!nodeEnv) {
    return {
      isValid: false,
      error: '缺少NODE_ENV环境变量'
    }
  }

  return {
    isValid: true
  }
}

/**
 * 获取所有配置状态
 */
export function getAllConfigStatus() {
  return {
    feishu: checkFeishuConfig(),
    environment: checkEnvironmentConfig()
  }
}