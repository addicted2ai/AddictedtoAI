// The changelog is written in markdown, and its entries use exactly
// three inline constructs: `code`, **bold** and *italic*. Rather than
// pull in a markdown library (or, worse, set innerHTML from a file),
// tokenise those three into React nodes. Anything the tokeniser doesn't
// recognise stays literal text, so there is no HTML-injection surface
// at all.
const TOKEN = /`([^`]+)`|\*\*([^*]+)\*\*|\*([^*]+)\*/g;

export function inlineMarkdown(text) {
  if (!text) return null;

  const nodes = [];
  let lastIndex = 0;
  let key = 0;
  let match;

  TOKEN.lastIndex = 0;
  while ((match = TOKEN.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }
    if (match[1] !== undefined) {
      nodes.push(<code key={key++}>{match[1]}</code>);
    } else if (match[2] !== undefined) {
      nodes.push(<strong key={key++}>{match[2]}</strong>);
    } else {
      nodes.push(<em key={key++}>{match[3]}</em>);
    }
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) nodes.push(text.slice(lastIndex));
  return nodes;
}
