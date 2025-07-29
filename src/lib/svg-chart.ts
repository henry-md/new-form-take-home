interface ChartData {
  labels: string[];
  values: number[];
  title?: string;
  type?: 'bar' | 'line' | 'doughnut';
}

interface DataPoint {
  [key: string]: unknown;
  spend?: number;
  impressions?: number;
  clicks?: number;
  conversions?: number;
  age?: string;
  date_start?: string;
  date_stop?: string;
}

export function analyzeData(data: unknown): { insights: string[], chartData: ChartData } {
  // Extract the nested data array
  const dataObj = data as { data?: unknown };
  const actualData = dataObj?.data;
  
  if (!Array.isArray(actualData) || actualData.length === 0) {
    return {
      insights: ['No data available for visualization'],
      chartData: { labels: [], values: [], title: 'No Data Available' }
    };
  }

  // Extract age groups and their spend
  const ageSpendMap = new Map<string, number>();
  const totalSpend = actualData.reduce((sum, point: DataPoint) => {
    let spend = 0;
    if (typeof point.spend === 'string') {
      spend = parseFloat(point.spend) || 0;
    } else if (typeof point.spend === 'number') {
      spend = point.spend;
    }
    
    const ageGroup = (point.age as string) || 'Unknown';
    ageSpendMap.set(ageGroup, (ageSpendMap.get(ageGroup) || 0) + spend);
    return sum + spend;
  }, 0);

  // Sort by spend and get top performers
  const sortedAgeGroups = Array.from(ageSpendMap.entries())
    .sort(([,a], [,b]) => b - a)
    .slice(0, 6);

  const labels = sortedAgeGroups.map(([age]) => age);
  const values = sortedAgeGroups.map(([,spend]) => spend);

  // Generate insights
  const insights: string[] = [];
  
  if (sortedAgeGroups.length > 0 && totalSpend > 0) {
    const topAgeGroup = sortedAgeGroups[0];
    const topPercentage = ((topAgeGroup[1] / totalSpend) * 100).toFixed(1);
    insights.push(`🎯 <b>${topAgeGroup[0]}</b> is your top-performing age group, accounting for <b>${topPercentage}%</b> of total spend`);
    
    if (sortedAgeGroups.length > 1) {
      const secondAgeGroup = sortedAgeGroups[1];
      const secondPercentage = ((secondAgeGroup[1] / totalSpend) * 100).toFixed(1);
      insights.push(`📈 <b>${secondAgeGroup[0]}</b> follows with <b>${secondPercentage}%</b> of spend`);
    }
  } else {
    insights.push('No spend data available for analysis');
  }

  return {
    insights,
    chartData: {
      labels,
      values,
      title: 'Spend by Age Group',
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

  const bars = chartData.labels.map((label, i) => {
    const value = chartData.values[i];
    const barHeight = (value / maxValue) * chartHeight;
    const x = margin.left + i * barSpacing + (barSpacing - barWidth) / 2;
    const y = margin.top + chartHeight - barHeight;
    
    const formattedValue = value >= 1000 ? 
      `$${(value / 1000).toFixed(1)}k` : 
      `$${value.toLocaleString()}`;

    return `
      <rect x="${x}" y="${y}" width="${barWidth}" height="${barHeight}" 
            fill="#3b82f6" stroke="#ffffff" stroke-width="2" rx="4"/>
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