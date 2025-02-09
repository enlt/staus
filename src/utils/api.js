/**
 * API 请求相关工具函数
 * 主要用于处理与 UptimeRobot API 的通信
 */

import axios from 'axios'
import { processMonitorData, generateTimeRanges } from './monitor'

/** API 配置常量 */
const API_URL = import.meta.env.VITE_UPTIMEROBOT_API_URL
const API_KEY = import.meta.env.VITE_UPTIMEROBOT_API_KEY

/**
 * 获取监控数据
 * @async
 * @returns {Promise<Array>} 处理后的监控数据数组 - 处理后的监控数据数组
 * @throws {Error} 当 API 请求失败时抛出错误，包含更详细的错误信息
 */
export const fetchMonitorData = async () => {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 30000)

  try {
    // 发送 POST 请求到 UptimeRobot API
    const response = await axios.post(
      API_URL,
      {
        api_key: API_KEY,
        format: 'json',
        response_times: 1,
        logs: 1,
        custom_uptime_ranges: generateTimeRanges(),
        response_times_start_date: Math.floor((Date.now() - 24 * 60 * 60 * 1000) / 1000),
        response_times_end_date: Math.floor(Date.now() / 1000)
      },
      {
        signal: controller.signal,
        timeout: 30000
      }
    )

    // 检查 API 响应状态
    if (response.data?.stat !== 'ok') {
      // 抛出包含 UptimeRobot API 返回的错误信息的错误
      throw new Error(`API 请求失败: ${response.data?.message || '未知错误'}`)
    }

    // 对从 UptimeRobot API 获取的监控数据进行排序和处理
    return response.data.monitors
      .sort((a, b) => b.create_datetime - a.create_datetime)
      .map(processMonitorData)

  } catch (error) {
    // 区分不同类型的错误，并提供更友好的提示信息
    let errorMessage = '获取监控数据失败，请稍后重试'

    if (error.message === 'Timeout') {
      errorMessage = '请求超时，请检查网络连接后重试'
    } else if (error.response) {
      // 请求成功发出且服务器也响应了状态码，但状态代码超出了 2xx 的范围
      errorMessage = `服务器错误: ${error.response.status} - ${error.response.data?.message || '未知错误'}`
    } else if (error.request) {
      // 请求已经成功发起，但是没有收到任何回应
      errorMessage = '无法连接到服务器，请检查网络'
    } else {
      // 在设置请求时发生了一些事情，触发了一个错误
      errorMessage = `请求设置错误: ${error.message}`
    }

    console.error('获取监控数据失败:', error)
    throw new Error(errorMessage) // 抛出包含详细错误信息的错误
  } finally {
    clearTimeout(timeoutId) // 清除超时定时器
  }
}
