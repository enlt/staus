/**
 * API 代理实现
 * 这是一个边缘函数，运行在边缘节点上或作为 Serverless Function 运行
 * 用于代理 UptimeRobot API 请求，避免跨域问题
 *
 * 支持以下部署平台：
 * - Vercel Serverless Functions
 * - 腾讯云 EdgeOne Pages
 * - Cloudflare Pages
 * - 其他 Node.js 环境
 *
 * 环境变量配置说明：
 * 在 .env 文件中设置 VITE_UPTIMEROBOT_API_URL：
 * - 使用默认配置：设置为 "/api/status" (Vercel, 腾讯云 EdgeOne Pages, Cloudflare Pages)
 * - 其他部署方式：设置为你的完整代理地址
 */

// 设置 CORS 头
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
}

// 统一处理请求的函数
const handleRequest = async (request) => {
  // 处理 OPTIONS 请求
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // 从请求中获取数据
    const data = await request.json()

    // 转发请求到 UptimeRobot API
    const response = await fetch('https://api.uptimerobot.com/v2/getMonitors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })

    const newResponse = new Response(response.body, response)
    newResponse.headers.set('Access-Control-Allow-Origin', '*')
    return newResponse

  } catch (error) {
    console.error('API 请求失败:', error)
    return new Response(JSON.stringify({ error: '请求失败', details: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    })
  }
}

// Cloudflare Pages
export async function onRequest(context) {
  return handleRequest(context.request)
}

// Vercel Serverless Functions 和其他 Node.js 环境
export default async function handler(req, res) {
  // 处理 OPTIONS 请求
  if (req.method === 'OPTIONS') {
    Object.entries(corsHeaders).forEach(([key, value]) => {
      res.setHeader(key, value)
    })
    return res.status(200).end()
  }

  try {
    const result = await handleRequest(req)
    const body = await result.text() // 获取响应体
    Object.entries(corsHeaders).forEach(([key, value]) => {
      res.setHeader(key, value)
    })
    return res.status(result.status).send(body)
  } catch (error) {
    console.error('API 请求失败:', error)
    Object.entries(corsHeaders).forEach(([key, value]) => {
      res.setHeader(key, value)
    })
    return res.status(500).json({ error: '请求失败', details: error.message })
  }
}
