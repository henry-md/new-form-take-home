interface ChartData {
  labels: string[];
  values: number[];
  title?: string;
  type?: 'bar' | 'line' | 'doughnut';
}

interface DataPoint {
  [key: string]: unknown;
  // Meta platform structure (flat)
  spend?: string | number;
  impressions?: string | number;
  clicks?: string | number;
  conversions?: string | number | unknown[];
  cost_per_conversion?: string | number | unknown[];
  reach?: string | number;
  frequency?: string | number;
  ctr?: string | number;
  cpc?: string | number;
  conversion_rate?: string | number;
  age?: string;
  date_start?: string;
  date_stop?: string;
  // TikTok platform structure (nested)
  metrics?: {
    [key: string]: unknown;
    spend?: string | number;
    impressions?: string | number;
    clicks?: string | number;
    conversions?: string | number;
    cost_per_conversion?: string | number;
    conversion_rate?: string | number;
    ctr?: string | number;
    cpc?: string | number;
    reach?: string | number;
    frequency?: string | number;
  };
  dimensions?: {
    [key: string]: unknown;
    age?: string;
    ad_id?: string;
    campaign_id?: string;
    adgroup_id?: string;
    advertiser_id?: string;
    stat_time_day?: string;
    campaign_name?: string;
    adgroup_name?: string;
    ad_name?: string;
    country_code?: string;
    gender?: string;
    province_id?: string;
    dma_id?: string;
  };
}

// Remove duplicate data entries based on age, date_start, and date_stop
export function removeDuplicateData(data: DataPoint[]): DataPoint[] {
  if (!Array.isArray(data) || data.length === 0) {
    return data;
  }

  const seen = new Map<string, boolean>();
  const cleanedData: DataPoint[] = [];

  for (const item of data) {
    // Create a unique key based on age, date_start, and date_stop
    const age = String(item.age || '');
    const dateStart = String(item.date_start || '');
    const dateStop = String(item.date_stop || '');
    
    const key = `${age}_${dateStart}_${dateStop}`;

    // Only add the first occurrence of each unique combination
    if (!seen.has(key)) {
      seen.set(key, true);
      cleanedData.push(item);
    }
  }

  console.log(`Cleaned data: removed ${data.length - cleanedData.length} duplicate entries`);
  return cleanedData;
}

export function analyzeData(data: unknown): { insights: string[], chartData: ChartData } {
  // Check if data itself is an array
  if (Array.isArray(data)) {
    const cleanedDataPoints = removeDuplicateData(data as DataPoint[]);
    return processCleanedData(cleanedDataPoints);
  }
  
  // Extract the data array from the object
  const dataObj = data as { data?: unknown };
  const actualData = dataObj?.data;
  
  if (!Array.isArray(actualData) || actualData.length === 0) {
    return {
      insights: ['No data available for visualization'],
      chartData: { labels: [], values: [], title: 'No Data Available' }
    };
  }

  // Clean duplicate data from the data array directly
  const cleanedDataPoints = removeDuplicateData(actualData as DataPoint[]);
  
  return processCleanedData(cleanedDataPoints);
}

function processCleanedData(cleanedDataPoints: DataPoint[]): { insights: string[], chartData: ChartData } {
  // Extract age groups and their primary metric value
  const ageMetricMap = new Map<string, number>();
  
  // All possible metrics from both TikTok and Meta platforms
  const availableMetrics = [
    'spend', 'clicks', 'impressions', 'reach', 'conversions', 
    'cost_per_conversion', 'conversion_rate', 'ctr', 'cpc', 'frequency'
  ];
  let primaryMetric = 'spend'; // default
  let chartTitle = 'Spend by Age Group';
  
  // Helper function to extract metric value from data point (handles nested structures)
  const extractMetricValue = (point: DataPoint, metric: string): number => {
    const pointObj = point as Record<string, unknown>;
    
    // Check if metric exists directly on the point
    if (metric in pointObj) {
      const rawValue = pointObj[metric];
      if (typeof rawValue === 'string') {
        return parseFloat(rawValue) || 0;
      } else if (typeof rawValue === 'number') {
        return rawValue;
      }
    }
    
    // Check nested metrics object (for TikTok data structure)
    if ('metrics' in pointObj && pointObj.metrics && typeof pointObj.metrics === 'object') {
      const metricsObj = pointObj.metrics as Record<string, unknown>;
      if (metric in metricsObj) {
        const rawValue = metricsObj[metric];
        if (typeof rawValue === 'string') {
          return parseFloat(rawValue) || 0;
        } else if (typeof rawValue === 'number') {
          return rawValue;
        }
      }
    }
    
    return 0;
  };
  
  // Helper function to extract age from data point (handles nested structures)
  const extractAge = (point: DataPoint): string => {
    const pointObj = point as Record<string, unknown>;
    
    // Check if age exists directly on the point
    if ('age' in pointObj && pointObj.age) {
      return String(pointObj.age);
    }
    
    // Check nested dimensions object (for TikTok data structure)
    if ('dimensions' in pointObj && pointObj.dimensions && typeof pointObj.dimensions === 'object') {
      const dimensionsObj = pointObj.dimensions as Record<string, unknown>;
      if ('age' in dimensionsObj && dimensionsObj.age) {
        return String(dimensionsObj.age);
      }
    }
    
    return 'Unknown';
  };
  
  // Find the first available metric in the data
  if (cleanedDataPoints.length > 0) {
    for (const metric of availableMetrics) {
      let hasMetric = false;
      
      // Check if any data point has this metric
      for (const point of cleanedDataPoints) {
        if (extractMetricValue(point, metric) > 0) {
          hasMetric = true;
          break;
        }
      }
      
      if (hasMetric) {
        primaryMetric = metric;
        chartTitle = `${metric.charAt(0).toUpperCase() + metric.slice(1)} by Age Group`;
        break;
      }
    }
  }
  
  const totalMetricValue = cleanedDataPoints.reduce((sum, point: DataPoint) => {
    const metricValue = extractMetricValue(point, primaryMetric);
    const ageGroup = extractAge(point);
    
    ageMetricMap.set(ageGroup, (ageMetricMap.get(ageGroup) || 0) + metricValue);
    return sum + metricValue;
  }, 0);

  // Sort by metric value and get top performers
  const sortedAgeGroups = Array.from(ageMetricMap.entries())
    .sort(([,a], [,b]) => b - a)
    .slice(0, 6);

  const labels = sortedAgeGroups.map(([age]) => age);
  const values = sortedAgeGroups.map(([,value]) => value);

  // Generate insights
  const insights: string[] = [];
  
  if (sortedAgeGroups.length > 0 && totalMetricValue > 0) {
    const topAgeGroup = sortedAgeGroups[0];
    const topPercentage = ((topAgeGroup[1] / totalMetricValue) * 100).toFixed(1);
    insights.push(`🎯 <b>${topAgeGroup[0]}</b> is your top-performing age group, accounting for <b>${topPercentage}%</b> of total ${primaryMetric}`);
    
    if (sortedAgeGroups.length > 1) {
      const secondAgeGroup = sortedAgeGroups[1];
      const secondPercentage = ((secondAgeGroup[1] / totalMetricValue) * 100).toFixed(1);
      insights.push(`📈 <b>${secondAgeGroup[0]}</b> follows with <b>${secondPercentage}%</b> of ${primaryMetric}`);
    }
  } else {
    insights.push(`No ${primaryMetric} data available for analysis`);
  }

  return {
    insights,
    chartData: {
      labels,
      values,
      title: chartTitle,
      type: 'bar'
    }
  };
}

export function createSVGChart(chartData: ChartData, width: number = 600, height: number = 350): string {
  if (chartData.labels.length === 0) {
    return `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="${width}" height="${height}" fill="#f8f9fa"/>
        <text x="${width/2}" y="${height/2}" text-anchor="middle" font-size="16" fill="#6b7280">
          No data available for visualization
        </text>
      </svg>
    `;
  }

  const maxValue = Math.max(...chartData.values);
  const margin = { top: 40, right: 30, bottom: 60, left: 60 };
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;
  
  const barWidth = chartWidth / chartData.labels.length * 0.8;
  const barSpacing = chartWidth / chartData.labels.length;

  // Color gradient based on performance
  const getBarColor = (value: number, index: number) => {
    const percentage = value / maxValue;
    if (percentage > 0.7) return '#10b981'; // Green for top performers
    if (percentage > 0.4) return '#3b82f6'; // Blue for medium
    if (percentage > 0.2) return '#f59e0b'; // Orange for lower
    return '#ef4444'; // Red for lowest
  };

  const bars = chartData.labels.map((label, i) => {
    const value = chartData.values[i];
    const barHeight = (value / maxValue) * chartHeight;
    const x = margin.left + i * barSpacing + (barSpacing - barWidth) / 2;
    const y = margin.top + chartHeight - barHeight;
    const color = getBarColor(value, i);
    
    const formattedValue = value >= 1000 ? 
      `$${(value / 1000).toFixed(1)}k` : 
      `$${value.toLocaleString()}`;

    return `
      <rect x="${x}" y="${y}" width="${barWidth}" height="${barHeight}" 
            fill="${color}" stroke="#ffffff" stroke-width="2" rx="4"/>
      <text x="${x + barWidth/2}" y="${margin.top + chartHeight + 20}" text-anchor="middle" 
            font-size="12" fill="#374151" font-weight="500">${label}</text>
      <text x="${x + barWidth/2}" y="${y - 8}" text-anchor="middle" 
            font-size="11" fill="#6b7280" font-weight="600">${formattedValue}</text>
    `;
  }).join('');

  return `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${width}" height="${height}" fill="#f8f9fa"/>
      <text x="${width/2}" y="25" text-anchor="middle" font-size="16" 
            font-weight="600" fill="#1f2937">${chartData.title}</text>
      ${bars}
      <line x1="${margin.left}" y1="${margin.top + chartHeight}" 
            x2="${width - margin.right}" y2="${margin.top + chartHeight}" 
            stroke="#d1d5db" stroke-width="2"/>
      <line x1="${margin.left}" y1="${margin.top}" 
            x2="${margin.left}" y2="${margin.top + chartHeight}" 
            stroke="#d1d5db" stroke-width="2"/>
    </svg>
  `;
}

export function createInsightsHTML(insights: string[]): string {
  if (insights.length === 0) return '';
  
  return `
    <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); 
                border-left: 4px solid #0ea5e9; 
                padding: 20px; 
                border-radius: 8px; 
                margin: 20px 0;">
      <h3 style="margin: 0 0 15px 0; color: #0c4a6e; font-size: 16px; font-weight: 600;">
        💡&nbsp;Key Insights
      </h3>
      <ul style="margin: 0; padding-left: 20px; color: #0c4a6e;">
        ${insights.map(insight => `<li style="margin-bottom: 8px; line-height: 1.5;">${insight}</li>`).join('')}
      </ul>
    </div>
  `;
}