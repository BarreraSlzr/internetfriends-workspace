import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import styles from './enhanced_markdown.module.scss'

interface EnhancedMarkdownProps {
  content: string
  variant?: 'post' | 'comment' | 'wiki' | 'announcement'
  allowInteractive?: boolean
  showMetrics?: boolean
  className?: string
}

export const EnhancedMarkdown: React.FC<EnhancedMarkdownProps> = ({
  content,
  variant = 'post',
  allowInteractive = false,
  showMetrics = false,
  className = ''
}) => {
  // Custom components for enhanced features
  const components = {
    // Enhanced code blocks with copy button
    code: ({ node, inline, className, children, ...props }: any) => {
      const match = /language-(\w+)/.exec(className || '')
      const language = match ? match[1] : ''
      
      if (!inline && language) {
        return (
          <div className={styles.codeBlock}>
            <div className={styles.codeHeader}>
              <span className={styles.language}>{language}</span>
              <button 
                className={styles.copyButton}
                onClick={() => navigator.clipboard.writeText(String(children))}
              >
                📋 Copy
              </button>
            </div>
            <pre className={className} {...props}>
              <code>{children}</code>
            </pre>
          </div>
        )
      }
      
      return <code className={className} {...props}>{children}</code>
    },

    // Enhanced images with zoom and gallery
    img: ({ src, alt, ...props }: any) => (
      <div className={styles.imageContainer}>
        <img 
          src={src} 
          alt={alt} 
          className={styles.image}
          onClick={() => {/* Open lightbox */}}
          {...props} 
        />
        {alt && <figcaption className={styles.caption}>{alt}</figcaption>}
      </div>
    ),

    // Enhanced links with preview
    a: ({ href, children, ...props }: any) => {
      const isExternal = href?.startsWith('http')
      return (
        <a 
          href={href}
          className={`${styles.link} ${isExternal ? styles.external : ''}`}
          target={isExternal ? '_blank' : undefined}
          rel={isExternal ? 'noopener noreferrer' : undefined}
          {...props}
        >
          {children}
          {isExternal && <span className={styles.externalIcon}>↗</span>}
        </a>
      )
    },

    // Custom blockquotes with styling
    blockquote: ({ children, ...props }: any) => (
      <blockquote className={styles.blockquote} {...props}>
        <div className={styles.quoteIcon}>💬</div>
        {children}
      </blockquote>
    ),

    // Enhanced tables
    table: ({ children, ...props }: any) => (
      <div className={styles.tableWrapper}>
        <table className={styles.table} {...props}>
          {children}
        </table>
      </div>
    ),

    // Custom components for InternetFriends features
    // G's balance display: {{gs_balance}}
    // Community link: {{community:tech_support}}
    // User mention: {{user:@username}}
    p: ({ children, ...props }: any) => {
      const text = String(children)
      
      // G's balance component
      if (text.includes('{{gs_balance}}')) {
        return (
          <div className={styles.gsBalance}>
            <span className={styles.gsIcon}>💰</span>
            <span>Current G's Balance: <strong>1,250 G's</strong></span>
          </div>
        )
      }
      
      // Community link component
      const communityMatch = text.match(/\{\{community:(\w+)\}\}/)
      if (communityMatch) {
        return (
          <div className={styles.communityLink}>
            <span className={styles.communityIcon}>🏘️</span>
            <a href={`/communities/${communityMatch[1]}`}>
              {communityMatch[1].replace('_', ' ').toUpperCase()} Community
            </a>
          </div>
        )
      }
      
      return <p {...props}>{children}</p>
    }
  }

  return (
    <div className={`${styles.container} ${styles[variant]} ${className}`}>
      {showMetrics && (
        <div className={styles.metrics}>
          <span className={styles.metric}>📖 2 min read</span>
          <span className={styles.metric}>👀 45 views</span>
          <span className={styles.metric}>💬 8 comments</span>
        </div>
      )}
      
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={components}
        className={styles.markdown}
      >
        {content}
      </ReactMarkdown>
      
      {allowInteractive && (
        <div className={styles.interactiveBar}>
          <button className={styles.reactionButton}>👍 12</button>
          <button className={styles.reactionButton}>❤️ 5</button>
          <button className={styles.reactionButton}>🔥 3</button>
          <button className={styles.shareButton}>📤 Share</button>
        </div>
      )}
    </div>
  )
}