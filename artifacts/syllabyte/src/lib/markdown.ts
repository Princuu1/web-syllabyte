export function parseMarkdown(md: string): string {
  if (!md) return '';

  // 1. Code blocks
  let html = md.replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code class="language-$1">$2</code></pre>');

  // 2. Tables (simple implementation)
  html = html.replace(/((\|.*\|(?:\n|\r))+)/g, (match) => {
    const rows = match.trim().split('\n');
    let tableHtml = '<table>';
    let isHeader = true;

    rows.forEach(row => {
      // Check for separator row (e.g. |---|---|)
      if (row.match(/^\|[\s\-\|]+\|$/)) {
        isHeader = false;
        return;
      }
      
      const cells = row.split('|').filter((_, i, arr) => i > 0 && i < arr.length - 1).map(c => c.trim());
      if (cells.length === 0) return;

      tableHtml += '<tr>';
      cells.forEach(cell => {
        if (isHeader) {
          tableHtml += `<th>${cell}</th>`;
        } else {
          tableHtml += `<td>${cell}</td>`;
        }
      });
      tableHtml += '</tr>';
    });
    tableHtml += '</table>';
    return tableHtml;
  });

  // 3. Headers
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

  // 4. Blockquotes
  html = html.replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>');

  // 5. Unordered Lists (simple bullet points)
  html = html.replace(/^\s*-\s+(.*$)/gim, '<ul><li>$1</li></ul>');
  // Combine adjacent uls
  html = html.replace(/<\/ul>\n<ul>/g, '\n');

  // 6. Ordered Lists (simple numbered points)
  html = html.replace(/^\s*\d+\.\s+(.*$)/gim, '<ol><li>$1</li></ol>');
  // Combine adjacent ols
  html = html.replace(/<\/ol>\n<ol>/g, '\n');

  // 7. Bold & Italic
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

  // 8. Inline Code
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

  // 9. Paragraphs (lines that don't start with a tag)
  const lines = html.split('\n');
  const parsedLines = lines.map(line => {
    const trimmed = line.trim();
    if (!trimmed) return '';
    if (trimmed.startsWith('<h') || trimmed.startsWith('<pre') || trimmed.startsWith('<table') || 
        trimmed.startsWith('<ul') || trimmed.startsWith('<ol') || trimmed.startsWith('<blockquote') ||
        trimmed.startsWith('<tr') || trimmed.startsWith('</table')) {
      return line;
    }
    return `<p>${line}</p>`;
  });

  return parsedLines.join('\n');
}
