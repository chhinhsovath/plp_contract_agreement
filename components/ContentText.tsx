'use client'

import { useContent } from '@/lib/hooks/useContent'
import { Skeleton } from 'antd'

interface ContentTextProps {
  contentKey: string
  fallback?: string
  loading?: 'skeleton' | 'text' | 'none'
  className?: string
  style?: React.CSSProperties
}

export function ContentText({
  contentKey,
  fallback,
  loading: loadingType = 'text',
  className,
  style
}: ContentTextProps) {
  const { t, loading } = useContent()

  if (loading) {
    switch (loadingType) {
      case 'skeleton':
        return <Skeleton.Input active size="small" style={style} />
      case 'text':
        return <span className={className} style={style}>{fallback || '...'}</span>
      case 'none':
        return null
      default:
        return <span className={className} style={style}>{fallback || '...'}</span>
    }
  }

  return <span className={className} style={style}>{t(contentKey, fallback)}</span>
}

// HOC version for wrapping components
export function withContentText<P extends object>(
  Component: React.ComponentType<P>,
  contentKey: string
) {
  return function ContentTextWrapper(props: P) {
    const { t } = useContent()
    return <Component {...props}>{t(contentKey)}</Component>
  }
}
