import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateReportSummary(
  reportData: Record<string, string | number>[],
): Promise<string> {
  const content = `
    Please provide a brief, one-paragraph summary of the following ad campaign data.
    Do not start with "This report shows" or "Here is a summary". Just provide the summary directly.
    Highlight the best and worst performing metrics.

    Data:
    ${JSON.stringify(reportData, null, 2)}
  `;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content }],
      temperature: 0.7,
      max_tokens: 150,
    });

    const summary = response.choices[0]?.message?.content?.trim();
    if (!summary) {
      throw new Error('No summary was generated.');
    }
    return summary;
  } catch (error) {
    console.error('Error generating report summary:', error);
    throw new Error('Failed to generate report summary from OpenAI.');
  }
} 