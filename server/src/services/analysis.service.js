import { groqConfig } from '../config/groq.js';

const fallback = source => {
  const issues = [];
  source.split('\n').forEach((line, index) => {
    if (/\beval\s*\(/.test(line)) issues.push({ title: 'Dynamic code execution', description: 'eval() executes arbitrary strings and can expose the application to code injection.', suggestion: 'Replace eval with explicit parsing or a safe mapping.', severity: 'critical', category: 'security', line: index + 1 });
    if (/\b(password|secret|api[_-]?key)\s*[:=]\s*['"][^'"]+['"]/i.test(line)) issues.push({ title: 'Possible hardcoded secret', description: 'A credential appears to be embedded in source code.', suggestion: 'Move credentials to environment variables and rotate any exposed key.', severity: 'high', category: 'security', line: index + 1 });
    if (/\bconsole\.log\s*\(/.test(line)) issues.push({ title: 'Debug logging left in code', description: 'Debug output can leak sensitive details and add noise in production.', suggestion: 'Remove the log or use a controlled logger.', severity: 'low', category: 'quality', line: index + 1 });
    if (/==(?!=)/.test(line)) issues.push({ title: 'Loose equality comparison', description: 'Type coercion can produce surprising comparison results.', suggestion: 'Use strict equality (===) when coercion is not intentional.', severity: 'low', category: 'bug', line: index + 1 });
  });
  const score = Math.max(30, 100 - issues.reduce((sum, issue) => sum + ({ critical: 25, high: 15, medium: 8, low: 3 }[issue.severity] || 3), 0));
  return {
    summary: issues.length ? `Found ${issues.length} potential issue${issues.length === 1 ? '' : 's'}. This basic local scan checks common patterns; connect a Groq API key for deeper analysis and suggested corrections.` : 'No common risky patterns detected by the local scan. Connect a Groq API key for deeper analysis and suggested corrections.',
    score,
    issues,
    fixedSource: ''
  };
};

export async function analyzeCode(source, filename = 'source') {
  if (!groqConfig.apiKey) return fallback(source);

  const prompt = `Review and correct this ${filename} source code for bugs, security issues, and maintainability. Return ONLY JSON with this shape: {"summary":"...","score":0-100,"issues":[{"title":"...","description":"...","suggestion":"...","severity":"critical|high|medium|low","category":"bug|security|quality|performance","line":1}],"fixedSource":"complete corrected source code"}. Keep the code's intended behavior, make only justified corrections, and return the complete corrected file in fixedSource. If no changes are needed, return the original source unchanged. Be precise, avoid speculative findings, maximum 12 issues. Source:\n${source}`;
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${groqConfig.apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: groqConfig.model,
      temperature: 0.1,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: 'You are a careful senior software security and code quality reviewer. Return valid JSON only, and preserve the source code in fixedSource except for justified fixes.' },
        { role: 'user', content: prompt }
      ]
    })
  });
  if (!response.ok) throw new Error(`AI provider request failed (${response.status})`);
  const data = await response.json();
  let result;
  try {
    result = JSON.parse(data.choices?.[0]?.message?.content || '{}');
  } catch {
    throw new Error('AI provider returned invalid review data');
  }
  return {
    summary: String(result.summary || 'Review complete.'),
    score: Math.max(0, Math.min(100, Number(result.score) || 0)),
    issues: Array.isArray(result.issues) ? result.issues.slice(0, 12).map(issue => ({ ...issue, file: filename, severity: ['critical', 'high', 'medium', 'low'].includes(issue.severity) ? issue.severity : 'low' })) : [],
    fixedSource: typeof result.fixedSource === 'string' ? result.fixedSource : ''
  };
}
