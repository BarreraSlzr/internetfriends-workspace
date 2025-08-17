// Advanced Analytics Dashboard with Charts
// Real-time data visualization for go.rich gateway

'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useAuth, usePermissions } from '@/lib/auth/go-rich-auth'

interface AnalyticsData {
  pageViews: { date: string; count: number }[]
  linkClicks: { date: string; count: number }[]
  userActivity: { hour: number; users: number }[]
  topLinks: { code: string; clicks: number; destination: string }[]
  marketInteractions: { symbol: string; interactions: number }[]
  friendConnections: { date: string; connections: number }[]
}

interface ChartProps {
  data: any[]
  type: 'line' | 'bar' | 'pie'
  title: string
  xKey: string
  yKey: string
  color?: string
  className?: string
}

// Simple Chart Component (SVG-based for no dependencies)
function SimpleChart({ data, type, title, xKey, yKey, color = '#3b82f6', className = '' }: ChartProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  
  if (!data || data.length === 0) {
    return (
      <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
        <div className="text-gray-500 text-center py-8">No data available</div>
      </div>
    )
  }

  const width = 400
  const height = 200
  const margin = { top: 20, right: 20, bottom: 40, left: 60 }
  const chartWidth = width - margin.left - margin.right
  const chartHeight = height - margin.top - margin.bottom

  const maxY = Math.max(...data.map(d => d[yKey]))
  const minY = Math.min(...data.map(d => d[yKey]))
  const rangeY = maxY - minY || 1

  const scaleX = (index: number) => (index / (data.length - 1)) * chartWidth
  const scaleY = (value: number) => chartHeight - ((value - minY) / rangeY) * chartHeight

  const renderLineChart = () => {
    const points = data.map((d, i) => `${scaleX(i)},${scaleY(d[yKey])}`).join(' ')
    
    return (
      <g>
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="2"
          points={points}
        />
        {data.map((d, i) => (
          <circle
            key={i}
            cx={scaleX(i)}
            cy={scaleY(d[yKey])}
            r="3"
            fill={color}
          />
        ))}
      </g>
    )
  }

  const renderBarChart = () => {
    const barWidth = chartWidth / data.length * 0.8
    
    return (
      <g>
        {data.map((d, i) => (
          <rect
            key={i}
            x={scaleX(i) - barWidth / 2}
            y={scaleY(d[yKey])}
            width={barWidth}
            height={chartHeight - scaleY(d[yKey])}
            fill={color}
            opacity={0.8}
          />
        ))}
      </g>
    )
  }

  return (
    <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <svg ref={svgRef} width={width} height={height} className="mx-auto">
        <g transform={`translate(${margin.left},${margin.top})`}>
          {/* Y-axis */}
          <line x1="0" y1="0" x2="0" y2={chartHeight} stroke="#e5e7eb" strokeWidth="1" />
          {/* X-axis */}
          <line x1="0" y1={chartHeight} x2={chartWidth} y2={chartHeight} stroke="#e5e7eb" strokeWidth="1" />
          
          {/* Chart content */}
          {type === 'line' && renderLineChart()}
          {type === 'bar' && renderBarChart()}
          
          {/* Y-axis labels */}
          <text x="-10" y="5" textAnchor="end" fontSize="12" fill="#6b7280">{maxY}</text>
          <text x="-10" y={chartHeight + 5} textAnchor="end" fontSize="12" fill="#6b7280">{minY}</text>
          
          {/* X-axis labels (show first and last) */}
          <text x="0" y={chartHeight + 20} textAnchor="start" fontSize="12" fill="#6b7280">
            {data[0]?.[xKey]}
          </text>
          <text x={chartWidth} y={chartHeight + 20} textAnchor="end" fontSize="12" fill="#6b7280">
            {data[data.length - 1]?.[xKey]}
          </text>
        </g>
      </svg>
    </div>
  )
}

// Pie Chart Component
function PieChart({ data, title, className = '' }: { data: any[], title: string, className?: string }) {
  if (!data || data.length === 0) {
    return (
      <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
        <div className="text-gray-500 text-center py-8">No data available</div>
      </div>
    )
  }

  const radius = 80
  const total = data.reduce((sum, d) => sum + d.value, 0)
  let currentAngle = 0

  const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4']

  return (
    <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <div className="flex items-center justify-center">
        <svg width={radius * 2 + 40} height={radius * 2 + 40}>
          <g transform={`translate(${radius + 20},${radius + 20})`}>
            {data.map((d, i) => {
              const angle = (d.value / total) * 2 * Math.PI
              const x1 = Math.cos(currentAngle) * radius
              const y1 = Math.sin(currentAngle) * radius
              const x2 = Math.cos(currentAngle + angle) * radius
              const y2 = Math.sin(currentAngle + angle) * radius
              
              const largeArcFlag = angle > Math.PI ? 1 : 0
              
              const pathData = [
                `M 0 0`,
                `L ${x1} ${y1}`,
                `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                'Z'
              ].join(' ')
              
              const slice = (
                <path
                  key={i}
                  d={pathData}
                  fill={colors[i % colors.length]}
                  opacity={0.8}
                />
              )
              
              currentAngle += angle
              return slice
            })}
          </g>
        </svg>
      </div>
      <div className="mt-4 space-y-2">
        {data.map((d, i) => (
          <div key={i} className="flex items-center justify-between text-sm">
            <div className="flex items-center">
              <div 
                className="w-3 h-3 rounded mr-2"
                style={{ backgroundColor: colors[i % colors.length] }}
              />
              <span>{d.label}</span>
            </div>
            <span className="font-medium">{d.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// Main Analytics Dashboard Component
interface AdvancedAnalyticsDashboardProps {
  title?: string
  className?: string
  disabled?: boolean
  timeRange?: '24h' | '7d' | '30d'
}

const AdvancedAnalyticsDashboard: React.FC<AdvancedAnalyticsDashboardProps> = ({
  title = 'Advanced Analytics',
  className = '',
  disabled = false,
  timeRange = '24h'
}) => {
  const { user } = useAuth()
  const permissions = usePermissions()
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [selectedTimeRange, setSelectedTimeRange] = useState(timeRange)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (disabled || !permissions.isPremium) return
    
    loadAnalyticsData()
    
    // Refresh data every 30 seconds
    const interval = setInterval(loadAnalyticsData, 30000)
    return () => clearInterval(interval)
  }, [disabled, permissions.isPremium, selectedTimeRange])

  const loadAnalyticsData = async () => {
    try {
      setIsLoading(true)
      
      // Simulate loading analytics data
      // In production, this would call real analytics APIs
      const mockData: AnalyticsData = {
        pageViews: generateTimeSeriesData(selectedTimeRange, 'views'),
        linkClicks: generateTimeSeriesData(selectedTimeRange, 'clicks'),
        userActivity: generateHourlyData(),
        topLinks: [
          { code: 'ig', clicks: 1250, destination: 'Instagram' },
          { code: 'gh', clicks: 890, destination: 'GitHub' },
          { code: 'tw', clicks: 670, destination: 'Twitter' },
          { code: 'ln', clicks: 420, destination: 'LinkedIn' }
        ],
        marketInteractions: [
          { symbol: 'BTC', interactions: 340 },
          { symbol: 'ETH', interactions: 280 },
          { symbol: 'AAPL', interactions: 180 },
          { symbol: 'TSLA', interactions: 150 }
        ],
        friendConnections: generateTimeSeriesData(selectedTimeRange, 'connections')
      }
      
      setAnalyticsData(mockData)
    } catch (error) {
      console.error('Failed to load analytics data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const generateTimeSeriesData = (range: string, type: string): { date: string; count: number }[] => {
    const days = range === '24h' ? 1 : range === '7d' ? 7 : 30
    const data = []
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      
      const baseValue = type === 'views' ? 100 : type === 'clicks' ? 50 : 10
      const count = baseValue + Math.floor(Math.random() * baseValue)
      
      data.push({
        date: range === '24h' ? date.getHours().toString() : date.toLocaleDateString(),
        count
      })
    }
    
    return data
  }

  const generateHourlyData = (): { hour: number; users: number }[] => {
    const data = []
    for (let hour = 0; hour < 24; hour++) {
      data.push({
        hour,
        users: Math.floor(Math.random() * 50) + 10
      })
    }
    return data
  }

  if (!permissions.isPremium) {
    return (
      <div className={`${className} bg-white rounded-lg shadow p-8`}>
        <div className="text-center">
          <div className="text-4xl mb-4">📊</div>
          <h3 className="text-lg font-semibold mb-2">Premium Analytics</h3>
          <p className="text-gray-600 mb-4">
            Upgrade to Premium to access advanced analytics dashboard with charts and insights
          </p>
          <button className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700">
            Upgrade to Premium
          </button>
        </div>
      </div>
    )
  }

  if (disabled) {
    return <div className={`opacity-50 ${className}`}>Analytics dashboard disabled</div>
  }

  return (
    <div className={`advanced-analytics-dashboard ${className}`}>
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">{title}</h2>
            <p className="text-gray-600 mt-1">
              Real-time insights for {user?.name}'s go.rich gateway
            </p>
          </div>
          
          <div className="flex space-x-2">
            {(['24h', '7d', '30d'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setSelectedTimeRange(range)}
                className={`px-3 py-1 rounded text-sm ${
                  selectedTimeRange === range
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-gray-600">Loading analytics data...</div>
        </div>
      ) : analyticsData ? (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-2xl font-bold text-blue-600">
                {analyticsData.pageViews.reduce((sum, d) => sum + d.count, 0)}
              </div>
              <div className="text-sm text-gray-600">Total Page Views</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-2xl font-bold text-green-600">
                {analyticsData.linkClicks.reduce((sum, d) => sum + d.count, 0)}
              </div>
              <div className="text-sm text-gray-600">Link Clicks</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-2xl font-bold text-purple-600">
                {analyticsData.friendConnections.reduce((sum, d) => sum + d.count, 0)}
              </div>
              <div className="text-sm text-gray-600">Friend Connections</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-2xl font-bold text-orange-600">
                {analyticsData.marketInteractions.reduce((sum, d) => sum + d.interactions, 0)}
              </div>
              <div className="text-sm text-gray-600">Market Interactions</div>
            </div>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <SimpleChart
              data={analyticsData.pageViews}
              type="line"
              title="Page Views Over Time"
              xKey="date"
              yKey="count"
              color="#3b82f6"
            />
            
            <SimpleChart
              data={analyticsData.linkClicks}
              type="bar"
              title="Link Clicks"
              xKey="date"
              yKey="count"
              color="#10b981"
            />
            
            <SimpleChart
              data={analyticsData.userActivity}
              type="line"
              title="User Activity by Hour"
              xKey="hour"
              yKey="users"
              color="#f59e0b"
            />
            
            <PieChart
              data={analyticsData.topLinks.map(link => ({
                label: link.code,
                value: link.clicks
              }))}
              title="Top Links Distribution"
            />
          </div>

          {/* Data Tables */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Links */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-4 border-b bg-gray-50">
                <h3 className="text-lg font-semibold">Top Performing Links</h3>
              </div>
              <div className="divide-y">
                {analyticsData.topLinks.map((link, index) => (
                  <div key={link.code} className="p-4 flex items-center justify-between">
                    <div>
                      <div className="font-medium">go.rich/{link.code}</div>
                      <div className="text-sm text-gray-600">{link.destination}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-blue-600">{link.clicks}</div>
                      <div className="text-sm text-gray-500">clicks</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Market Interactions */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-4 border-b bg-gray-50">
                <h3 className="text-lg font-semibold">Market Symbol Interactions</h3>
              </div>
              <div className="divide-y">
                {analyticsData.marketInteractions.map((item, index) => (
                  <div key={item.symbol} className="p-4 flex items-center justify-between">
                    <div>
                      <div className="font-medium">{item.symbol}</div>
                      <div className="text-sm text-gray-600">Price alerts, watchlist adds</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-green-600">{item.interactions}</div>
                      <div className="text-sm text-gray-500">interactions</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="text-gray-500">Failed to load analytics data</div>
        </div>
      )}
    </div>
  )
}

export default AdvancedAnalyticsDashboard