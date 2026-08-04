import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { axisProps, gridProps, legendProps, seriesColor, tooltipProps } from './chartTheme';

/** Single-series area trend — volume over time. */
export function TrendArea({ data, xKey, yKey, name, formatX, formatY, gradientId = 'pmArea' }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--cf-chart-1)" stopOpacity={0.32} />
            <stop offset="100%" stopColor="var(--cf-chart-1)" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid {...gridProps} />
        <XAxis dataKey={xKey} tickFormatter={formatX} {...axisProps} minTickGap={16} />
        <YAxis tickFormatter={formatY} width={44} {...axisProps} />
        <Tooltip {...tooltipProps} labelFormatter={formatX} />
        <Area
          isAnimationActive={false}
          type="monotone"
          dataKey={yKey}
          name={name}
          stroke="var(--cf-chart-1)"
          strokeWidth={2}
          fill={`url(#${gradientId})`}
          dot={{ r: 2.5, fill: 'var(--cf-chart-1)', strokeWidth: 0 }}
          activeDot={{ r: 4 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

/** Many overlapping areas — used for alert volume split by source. */
export function MultiArea({ data, xKey, keys, formatX, stacked = false }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
        <CartesianGrid {...gridProps} />
        <XAxis dataKey={xKey} tickFormatter={formatX} {...axisProps} minTickGap={24} />
        <YAxis width={44} {...axisProps} />
        <Tooltip {...tooltipProps} labelFormatter={formatX} />
        <Legend {...legendProps} />
        {keys.map((key, index) => (
          <Area
            key={key}
            isAnimationActive={false}
            type="monotone"
            dataKey={key}
            stackId={stacked ? 'a' : undefined}
            stroke={seriesColor(index)}
            fill={seriesColor(index)}
            fillOpacity={stacked ? 0.7 : 0.18}
            strokeWidth={1.75}
            dot={false}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
}

/**
 * Donut with the headline figure in the hole. The reference portal leans on this
 * shape heavily, so it earns a dedicated component.
 */
export function DonutStat({ data, headline, subline, colors, showLegend = true }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          isAnimationActive={false}
          dataKey="value"
          nameKey="name"
          innerRadius="62%"
          outerRadius="88%"
          paddingAngle={1.5}
          startAngle={90}
          endAngle={-270}
          stroke="none"
        >
          {data.map((entry, index) => (
            <Cell key={entry.name} fill={colors?.[entry.name] ?? seriesColor(index)} />
          ))}
        </Pie>
        <Tooltip {...tooltipProps} cursor={false} />
        {showLegend ? <Legend {...legendProps} /> : null}
        {headline ? (
          <text
            x="50%"
            y={showLegend ? '46%' : '50%'}
            textAnchor="middle"
            dominantBaseline="middle"
            style={{
              fontFamily: 'var(--cf-font-display)',
              fontSize: '1.9rem',
              fill: 'var(--cf-ink-hex)',
            }}
          >
            {headline}
          </text>
        ) : null}
        {subline ? (
          <text
            x="50%"
            y={showLegend ? '58%' : '62%'}
            textAnchor="middle"
            dominantBaseline="middle"
            style={{ fontSize: '0.75rem', fill: 'var(--cf-ink-muted-hex)' }}
          >
            {subline}
          </text>
        ) : null}
      </PieChart>
    </ResponsiveContainer>
  );
}

/** Vertical or horizontal bars, optionally diverging around zero. */
export function Bars({
  data,
  xKey,
  yKey,
  layout = 'vertical',
  formatX,
  formatY,
  diverging = false,
  labelFormatter,
  categoryWidth = 64,
}) {
  const horizontal = layout === 'horizontal';
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        layout={horizontal ? 'vertical' : 'horizontal'}
        margin={{ top: 8, right: 20, left: horizontal ? 8 : 0, bottom: 0 }}
      >
        <CartesianGrid {...gridProps} vertical={horizontal} horizontal={!horizontal} />
        {horizontal ? (
          <>
            <XAxis type="number" tickFormatter={formatY} {...axisProps} />
            <YAxis
              type="category"
              dataKey={xKey}
              width={categoryWidth}
              interval={0}
              {...axisProps}
            />
          </>
        ) : (
          <>
            <XAxis dataKey={xKey} tickFormatter={formatX} {...axisProps} />
            <YAxis tickFormatter={formatY} width={44} {...axisProps} />
          </>
        )}
        <Tooltip {...tooltipProps} formatter={labelFormatter} />
        <Bar
          isAnimationActive={false}
          dataKey={yKey}
          radius={horizontal ? [0, 3, 3, 0] : [3, 3, 0, 0]}
          maxBarSize={38}
        >
          {data.map((entry, index) => (
            <Cell
              key={index}
              fill={
                diverging
                  ? entry[yKey] >= 0
                    ? 'var(--cf-chart-1)'
                    : 'var(--cf-line-strong-hex)'
                  : 'var(--cf-chart-1)'
              }
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

/** Grouped bars, for comparing two measures month over month. */
export function GroupedBars({ data, xKey, bars, formatX }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
        <CartesianGrid {...gridProps} />
        <XAxis dataKey={xKey} tickFormatter={formatX} {...axisProps} />
        <YAxis width={52} {...axisProps} />
        <Tooltip {...tooltipProps} labelFormatter={formatX} />
        <Legend {...legendProps} />
        {bars.map((bar, index) => (
          <Bar
            key={bar.key}
            isAnimationActive={false}
            dataKey={bar.key}
            name={bar.name}
            fill={seriesColor(index)}
            radius={[3, 3, 0, 0]}
            maxBarSize={26}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}

/** Bars plus a ratio line on a second axis — the Resultant KPI shape. */
export function BarsWithRatio({ data, xKey, bars, lineKey, lineName, formatX }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid {...gridProps} />
        <XAxis dataKey={xKey} tickFormatter={formatX} {...axisProps} />
        <YAxis yAxisId="left" width={52} {...axisProps} />
        <YAxis yAxisId="right" orientation="right" width={44} {...axisProps} />
        <Tooltip {...tooltipProps} labelFormatter={formatX} />
        <Legend {...legendProps} />
        {bars.map((bar, index) => (
          <Bar
            key={bar.key}
            isAnimationActive={false}
            yAxisId="left"
            dataKey={bar.key}
            name={bar.name}
            fill={seriesColor(index)}
            radius={[3, 3, 0, 0]}
            maxBarSize={24}
          />
        ))}
        <Line
          yAxisId="right"
          isAnimationActive={false}
          type="monotone"
          dataKey={lineKey}
          name={lineName}
          stroke="var(--cf-chart-3)"
          strokeWidth={2}
          dot={{ r: 2.5, strokeWidth: 0, fill: 'var(--cf-chart-3)' }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

/** Half-circle gauge for single-rate figures. */
export function Gauge({ value, max = 100, label, display }) {
  const clamped = Math.max(0, Math.min(value, max));
  const data = [
    { name: label, value: clamped },
    { name: 'remainder', value: max - clamped },
  ];
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          isAnimationActive={false}
          dataKey="value"
          startAngle={200}
          endAngle={-20}
          innerRadius="66%"
          outerRadius="92%"
          stroke="none"
          cy="62%"
        >
          <Cell fill="var(--cf-chart-3)" />
          <Cell fill="var(--cf-chart-grid)" />
        </Pie>
        <text
          x="50%"
          y="58%"
          textAnchor="middle"
          style={{
            fontFamily: 'var(--cf-font-display)',
            fontSize: '1.75rem',
            fill: 'var(--cf-ink-hex)',
          }}
        >
          {display ?? `${value}%`}
        </text>
        <text
          x="50%"
          y="72%"
          textAnchor="middle"
          style={{ fontSize: '0.75rem', fill: 'var(--cf-ink-muted-hex)' }}
        >
          {label}
        </text>
      </PieChart>
    </ResponsiveContainer>
  );
}
