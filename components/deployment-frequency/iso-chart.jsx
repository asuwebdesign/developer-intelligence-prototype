'use client'

import { useState } from 'react'
import { useTheme } from "next-themes"
import { format } from 'date-fns'
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart, Area, Line, ReferenceLine } from 'recharts'
import { DeploymentFrequencyTooltip } from './tooltip'

const dateFormatter = date => {
  return format(new Date(date), "MMM d")
}

const calculateMean = data => {
  if (data.length < 1) {
    return
  }
  return data.reduce((prev, current) => prev + current) / data.length
}

export function IsolatedDeploymentFrequencyChart({ data }) {

  const { resolvedTheme } = useTheme()
  const animationDuration = 1000

  // Chart colors
  const strokeGrid = '#d4d4d4'            // Neutral 300
  const strokeGridDark = '#404040'        // Neutral 700
  const strokeCursor = '#3b82f6'          // Blue 500
  const strokeActiveDot = '#ffffff'       // White
  const strokeActiveDotDark = '#171717'   // Neutral 900
  const strokeAnomaly = '#f97316'         // Orange 500

  const fillRange = '#bfdbfe'             // Blue 200
  const fillRangeDark = '#1e3a8a'         // Blue 900
  const strokeRange = '#3b82f6'           // Blue 500
  const strokeRollingAverage = '#3b82f6'  // Blue 500
  const strokeGoal = '#f59e0b'            // Amber 500

  // Calculate the mean
  const averages = data.map(element => {
    return element.rollingAverage
  })

  const chartMean = calculateMean(averages)

  // Reports
  const [reportDeploymentFrequencyData, setReportDeploymentFrequencyData] = useState(null)
  const [showReportDeploymentFrequencyData, setShowReportDeploymentFrequencyData] = useState(false)

  function handleChartClick(event) {
    setReportDeploymentFrequencyData(event)
    setShowReportDeploymentFrequencyData(true)
  }

  // Anomaly detection
  const showAnomalyWarning = data.some((day) => {
    if (day.rollingAverage < day.expectedRange[0] || day.rollingAverage > day.expectedRange[1]) { return true }
    return false
  })

  const customAnomalyLabel = props => {
    return (
      <g className="w-[32px] h-[32px] fill-none" transform={`translate(${props.viewBox.x - 16}, ${props.viewBox.y + 1})`}>
        <rect className="fill-orange-50 dark:fill-orange-950 stroke-orange-600 dark:stroke-orange-400 stroke-2" width="32" height="32" rx="16" />
        <path className="fill-orange-600 dark:fill-orange-400" d="M23.799 21.026 17.482 9.38a1.668 1.668 0 0 0-.683-.68 1.693 1.693 0 0 0-2.284.68L8.199 21.026A1.678 1.678 0 0 0 9.685 23.5h12.628a1.7 1.7 0 0 0 1.308-.615 1.671 1.671 0 0 0 .178-1.859Zm-7.8.474a1 1 0 1 1 0-2 1 1 0 0 1 0 2Zm1-3.5a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-4a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v4Z" />
      </g>
    )
  }

  return (
    <>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 0, left: 0, right: 4, bottom: 0 }} onClick={handleChartClick}>
          <CartesianGrid vertical={false} stroke={resolvedTheme === 'dark' ? strokeGridDark : strokeGrid} />
          <XAxis style={{ fontSize: '0.75rem' }} dataKey="date" axisLine={false} tickLine={false} tickFormatter={dateFormatter} />
          <YAxis style={{ fontSize: '0.75rem' }} domain={[0, 20]} axisLine={false} tickLine={false} />
          <Tooltip content={<DeploymentFrequencyTooltip />} cursor={{ stroke: strokeCursor }} />
          <Area type="monotone" dataKey="expectedRange" activeDot={resolvedTheme === 'dark' ? { stroke: strokeActiveDotDark } : { stroke: strokeActiveDot }} fill={resolvedTheme === 'dark' ? fillRangeDark : fillRange} stroke={strokeRange} strokeWidth={0} strokeDasharray="4 4" animationDuration={animationDuration} />
          <Line type="monotone" dataKey="rollingAverage" dot={false} activeDot={resolvedTheme === 'dark' ? { stroke: strokeActiveDotDark } : { stroke: strokeActiveDot }} stroke={strokeRollingAverage} strokeWidth={3} strokeLinecap="round" animationDuration={animationDuration} />
          <Line type="monotone" dataKey="goal" dot={false} activeDot={resolvedTheme === 'dark' ? { stroke: strokeActiveDotDark } : { stroke: strokeActiveDot }} stroke={strokeGoal} strokeWidth={2} strokeDasharray="4 4" strokeLinecap="round" isAnimationActive={false} />

          {data.map((day, index) => (
            day.rollingAverage < day.expectedRange[0] || day.rollingAverage > day.expectedRange[1] && (
              <ReferenceLine className="anomaly-reference-line" key={index} x={day.date} stroke={strokeAnomaly} strokeWidth={1} label={customAnomalyLabel} />
            )
          ))}
        </ComposedChart>
      </ResponsiveContainer>
      {/* <DeploymentFrequencyReport reportDeploymentFrequencyData={reportDeploymentFrequencyData} showReportDeploymentFrequencyData={showReportDeploymentFrequencyData} setShowReportDeploymentFrequencyData={setShowReportDeploymentFrequencyData} /> */}
    </>
  )
}