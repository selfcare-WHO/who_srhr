/**
 * Parse text and convert URLs into clickable links
 */
export function linkifyText(text: string): { type: 'text' | 'link'; content: string; url?: string }[] {
  // Regular expression to match URLs
  const urlRegex = /(https?:\/\/[^\s]+)/g
  const parts: { type: 'text' | 'link'; content: string; url?: string }[] = []
  
  let lastIndex = 0
  let match
  
  while ((match = urlRegex.exec(text)) !== null) {
    // Add text before the URL if any
    if (match.index > lastIndex) {
      parts.push({
        type: 'text',
        content: text.slice(lastIndex, match.index)
      })
    }
    
    // Add the URL as a link
    parts.push({
      type: 'link',
      content: match[1],
      url: match[1]
    })
    
    lastIndex = urlRegex.lastIndex
  }
  
  // Add remaining text after the last URL if any
  if (lastIndex < text.length) {
    parts.push({
      type: 'text',
      content: text.slice(lastIndex)
    })
  }
  
  // If no URLs found, return the entire text as a single part
  if (parts.length === 0) {
    parts.push({
      type: 'text',
      content: text
    })
  }
  
  return parts
}

/**
 * Extract domain name from URL for display
 */
export function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url)
    return urlObj.hostname.replace('www.', '')
  } catch {
    return url
  }
}