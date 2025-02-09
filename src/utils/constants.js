/**
 * 图表颜色常量
 * @constant {Object}
 */
export const CHART_COLORS = {
  success: '#10b981',   // 绿色，表示成功或正常状态
  warning: '#f59e0b',   // 黄色，表示警告状态
  orange: '#ea580c',    // 橙色，表示中等风险或需要注意的状态
  error: '#ef4444',     // 红色，表示错误或失败状态
  gray: '#9ca3af',      // 灰色，表示未知或创建前的状态
  paused: '#6b7280'     // 灰蓝色，表示暂停状态
}

/**
 * 监控状态常量
 * @constant {Object}
 */
export const STATUS = {
  ONLINE: 2,    // 在线状态
  PAUSED: 0,    // 暂停状态
  PREPARING: 1, // 准备中状态
  OFFLINE: 9    // 离线状态
}
