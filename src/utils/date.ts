/**
 * 日期工具类
 */
export class DateUtils {
  /**
   * 获取北京时间的Date对象
   */
  static getBeijingTime(date?: Date | string): Date {
    const d = date ? new Date(date) : new Date()
    // 获取UTC时间
    const utc = d.getTime() + (d.getTimezoneOffset() * 60000)
    // 北京时间 = UTC + 8小时
    return new Date(utc + (8 * 3600000))
  }

  /**
   * 格式化日期为 YYYY-MM-DD 格式（使用北京时间）
   */
  static formatDate(date: Date | string): string {
    const d = this.getBeijingTime(date)
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  /**
   * 格式化日期时间为 ISO 字符串（使用北京时间）
   */
  static formatDateTime(date: Date | string): string {
    return this.getBeijingTime(date).toISOString()
  }

  /**
   * 格式化时间为 HH:MM 格式（使用北京时间）
   */
  static formatTime(date: Date | string): string {
    const d = this.getBeijingTime(date)
    const hours = String(d.getHours()).padStart(2, '0')
    const minutes = String(d.getMinutes()).padStart(2, '0')
    return `${hours}:${minutes}`
  }

  /**
   * 获取今天的日期字符串（北京时间）
   */
  static getToday(): string {
    return this.formatDate(this.getBeijingTime())
  }

  /**
   * 获取本周的开始和结束日期（使用北京时间）
   */
  static getThisWeek(): { start: string; end: string } {
    const today = this.getBeijingTime()
    const dayOfWeek = today.getDay()
    const start = new Date(today)
    start.setDate(today.getDate() - dayOfWeek)
    const end = new Date(today)
    end.setDate(today.getDate() + (6 - dayOfWeek))
    
    return {
      start: this.formatDate(start),
      end: this.formatDate(end)
    }
  }

  /**
   * 获取本月的开始和结束日期（使用北京时间）
   */
  static getThisMonth(): { start: string; end: string } {
    const today = this.getBeijingTime()
    const start = new Date(today.getFullYear(), today.getMonth(), 1)
    const end = new Date(today.getFullYear(), today.getMonth() + 1, 0)
    
    return {
      start: this.formatDate(start),
      end: this.formatDate(end)
    }
  }

  /**
   * 获取指定日期的周开始和结束日期（使用北京时间）
   */
  static getWeekRange(date: string): { start: string; end: string } {
    const d = this.getBeijingTime(date)
    const dayOfWeek = d.getDay()
    const start = new Date(d)
    start.setDate(d.getDate() - dayOfWeek)
    const end = new Date(d)
    end.setDate(d.getDate() + (6 - dayOfWeek))
    
    return {
      start: this.formatDate(start),
      end: this.formatDate(end)
    }
  }

  /**
   * 获取指定日期的月开始和结束日期（使用北京时间）
   */
  static getMonthRange(date: string): { start: string; end: string } {
    const d = this.getBeijingTime(date)
    const start = new Date(d.getFullYear(), d.getMonth(), 1)
    const end = new Date(d.getFullYear(), d.getMonth() + 1, 0)
    
    return {
      start: this.formatDate(start),
      end: this.formatDate(end)
    }
  }

  /**
   * 计算两个日期之间的天数差（使用北京时间）
   */
  static getDaysDiff(startDate: string, endDate: string): number {
    const start = this.getBeijingTime(startDate)
    const end = this.getBeijingTime(endDate)
    const diffTime = Math.abs(end.getTime() - start.getTime())
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  /**
   * 检查日期是否为今天
   */
  static isToday(date: string): boolean {
    return date === this.getToday()
  }

  /**
   * 检查日期是否已过期
   */
  static isOverdue(date: string): boolean {
    return date < this.getToday()
  }

  /**
   * 获取友好的日期显示（使用北京时间）
   */
  static getFriendlyDate(date: string): string {
    const today = this.getToday()
    const beijingNow = this.getBeijingTime()
    const yesterday = this.formatDate(new Date(beijingNow.getTime() - 24 * 60 * 60 * 1000))
    const tomorrow = this.formatDate(new Date(beijingNow.getTime() + 24 * 60 * 60 * 1000))

    if (date === today) {
      return '今天'
    } else if (date === yesterday) {
      return '昨天'
    } else if (date === tomorrow) {
      return '明天'
    } else {
      return date
    }
  }

  /**
   * 生成日期范围数组（使用北京时间）
   */
  static generateDateRange(startDate: string, endDate: string): string[] {
    const dates: string[] = []
    const start = this.getBeijingTime(startDate)
    const end = this.getBeijingTime(endDate)
    
    while (start <= end) {
      dates.push(this.formatDate(start))
      start.setDate(start.getDate() + 1)
    }
    
    return dates
  }
}