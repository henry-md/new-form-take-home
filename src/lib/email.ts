import nodemailer from 'nodemailer';
import { analyzeData, createSVGChart, createInsightsHTML } from '@/lib/svg-chart';

interface EmailConfig {
  to: string;
  subject: string;
  html: string;
}

// Create a transporter using SMTP or a service like Gmail
// For development, using a test account or simple SMTP
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587, // 587
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
});

export const sendEmail = async ({ to, subject, html }: EmailConfig) => {
  try {
    const info = await transporter.sendMail({
      from: `"NewForm Reports" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html
    });
    
    console.log('Email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

export const createReportEmail = (data: { 
  platform?: string; 
  dateRangeEnum?: string; 
  data?: unknown; 
  summary?: string;
  reportId?: string;
}) => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const publicLink = data.reportId ? `${baseUrl}/view-report/${data.reportId}` : '#';
  
  // Analyze data and generate insights
  const { insights, chartData } = analyzeData(data.data);
  
  // Create simple HTML table chart for email compatibility
  const createEmailChart = (chartData: { labels: string[], values: number[] }) => {
    if (chartData.labels.length === 0) {
      return '<p style="text-align: center; color: #6c7280; font-style: italic;">No data available for visualization</p>';
    }
    
    const maxValue = Math.max(...chartData.values);
    const rows = chartData.labels.map((label, i) => {
      const value = chartData.values[i];
      const percentage = (value / maxValue) * 100;
      const barWidth = Math.max(percentage, 5); // Minimum 5% width
      
      // Color based on performance
      let color = '#ef4444'; // Red for lowest
      if (percentage > 70) color = '#10b981'; // Green for top
      else if (percentage > 40) color = '#3b82f6'; // Blue for medium
      else if (percentage > 20) color = '#f59e0b'; // Orange for lower
      
      const formattedValue = value >= 1000 ? 
        `$${(value / 1000).toFixed(1)}k` : 
        `$${value.toLocaleString()}`;
      
      return `
        <tr>
          <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; font-weight: 500; color: #374151;">${label}</td>
          <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; width: 200px;">
            <div style="background-color: #f3f4f6; border-radius: 4px; height: 20px; position: relative; overflow: hidden;">
              <div style="background-color: ${color}; height: 100%; width: ${barWidth}%; border-radius: 4px; transition: width 0.3s ease;"></div>
            </div>
          </td>
          <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: 600; color: #6b7280;">${formattedValue}</td>
        </tr>
      `;
    }).join('');
    
    return `
      <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0;">
        <h3 style="margin: 0 0 20px 0; color: #1f2937; font-size: 18px; text-align: center;">Spend by Age Group</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <thead>
            <tr style="background-color: #f9fafb;">
              <th style="padding: 12px; text-align: left; border-bottom: 2px solid #e5e7eb; color: #374151; font-weight: 600;">Age Group</th>
              <th style="padding: 12px; text-align: left; border-bottom: 2px solid #e5e7eb; color: #374151; font-weight: 600;">Spend</th>
              <th style="padding: 12px; text-align: right; border-bottom: 2px solid #e5e7eb; color: #374151; font-weight: 600;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
      </div>
    `;
  };
  
  const emailChart = createEmailChart(chartData);
  const insightsHTML = createInsightsHTML(insights);
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Your Scheduled Report</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          margin: 0;
          padding: 0;
          background-color: #f8f9fa;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          border-radius: 8px;
          overflow: hidden;
        }
        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 40px 30px;
          text-align: center;
        }
        .header h1 {
          margin: 0 0 10px 0;
          font-size: 28px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
        }
        .header p {
          margin: 0;
          font-size: 16px;
          opacity: 0.9;
        }
        .content {
          padding: 40px 30px;
        }
        .section {
          margin-bottom: 30px;
        }
        .section h2 {
          color: #2c3e50;
          font-size: 20px;
          font-weight: 600;
          margin: 0 0 15px 0;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .ai-summary {
          background: linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%);
          border-left: 4px solid #2196f3;
          padding: 20px;
          border-radius: 8px;
          margin: 15px 0;
        }
        .ai-summary h3 {
          margin: 0 0 12px 0;
          font-size: 16px;
          font-weight: 600;
          color: #1976d2;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .ai-summary p {
          margin: 0;
          line-height: 1.7;
          color: #37474f;
        }
        .metrics-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin: 20px 0;
        }
        .metric-card {
          background-color: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
          border: 1px solid #e9ecef;
        }
        .metric-card h4 {
          margin: 0 0 10px 0;
          font-size: 14px;
          font-weight: 600;
          color: #6c757d;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .metric-card p {
          margin: 0;
          font-size: 16px;
          font-weight: 500;
          color: #495057;
        }
        .chart-section {
          background-color: #ffffff;
          border: 1px solid #e9ecef;
          border-radius: 8px;
          padding: 20px;
          margin: 20px 0;
          text-align: center;
        }
        .chart-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 350px;
        }
        .insights-section {
          background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
          border-left: 4px solid #0ea5e9;
          padding: 20px;
          border-radius: 8px;
          margin: 20px 0;
        }
        .insights-section h3 {
          margin: 0 0 15px 0;
          color: #0c4a6e;
          font-size: 16px;
          font-weight: 600;
        }
        .insights-section ul {
          margin: 0;
          padding-left: 20px;
          color: #0c4a6e;
        }
        .insights-section li {
          margin-bottom: 8px;
          line-height: 1.5;
        }
        .cta-section {
          text-align: center;
          margin: 40px 0;
          padding: 30px;
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          border-radius: 12px;
        }
        .cta-button {
          display: inline-block;
          background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
          color: white;
          padding: 16px 32px;
          text-decoration: none;
          border-radius: 8px;
          font-weight: 600;
          font-size: 16px;
          box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
          transition: all 0.3s ease;
        }
        .cta-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(0, 123, 255, 0.4);
        }
        .footer {
          background-color: #f8f9fa;
          padding: 20px 30px;
          text-align: center;
          border-top: 1px solid #e9ecef;
        }
        .footer p {
          margin: 0;
          font-size: 12px;
          color: #6c757d;
        }
        .footer a {
          color: #007bff;
          text-decoration: none;
        }
        @media (max-width: 600px) {
          .container {
            margin: 0;
            border-radius: 0;
          }
          .metrics-grid {
            grid-template-columns: 1fr;
          }
          .header, .content {
            padding: 20px;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>
            <span style="font-size: 24px;">📊</span>&nbsp;
            Your Scheduled Report
          </h1>
          <p>Hello! Here's your automated insight report.</p>
        </div>
        
        <div class="content">
          <div class="section">
            <h2>
              <span style="font-size: 18px;">🤖</span>&nbsp;
              AI Summary
            </h2>
            
            <div class="ai-summary">
              <p>${data.summary || 'Summary not available'}</p>
            </div>
          </div>
          
          <div class="section">
            <h2>
              <span style="font-size: 18px;">📈</span>&nbsp;
              Performance Analysis
            </h2>
            
            <div class="chart-section">
              <div class="chart-container">
                ${emailChart}
              </div>
            </div>
            
            ${insightsHTML}
          </div>
          
          <div class="section">
            <h2>
              <span style="font-size: 18px;">📊</span>&nbsp;
              Key Metrics
            </h2>
            
            <div class="metrics-grid">
              <div class="metric-card">
                <h4>Platform</h4>
                <p>${data.platform || 'N/A'}</p>
              </div>
              <div class="metric-card">
                <h4>Date Range</h4>
                <p>${data.dateRangeEnum || 'N/A'}</p>
              </div>
            </div>
          </div>
          
          <div class="cta-section">
            <a href="${publicLink}" class="cta-button" style="color: white !important; margin: 0 auto;">
              📊&nbsp;View Full Report
            </a>
            <p style="margin-top: 15px; font-size: 14px; color: #6c757d;">
              Click to view complete report with interactive charts, detailed metrics, and comprehensive insights.
            </p>
          </div>
        </div>
        
        <div class="footer">
          <p>Generated by NewForm Scheduled Reports | <a href="#">Unsubscribe</a></p>
        </div>
      </div>
    </body>
    </html>
  `;
}; 