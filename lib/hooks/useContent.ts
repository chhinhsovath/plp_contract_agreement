import { useState, useEffect } from 'react'

interface ContentText {
  key: string
  text_khmer: string
  text_english: string | null
  category: string
  description: string | null
}

interface ContentCache {
  [key: string]: string
}

let contentCache: ContentCache = {}
let isFetching = false
let fetchPromise: Promise<void> | null = null

export function useContent() {
  const [content, setContent] = useState<ContentCache>(contentCache)
  const [loading, setLoading] = useState(Object.keys(contentCache).length === 0)

  useEffect(() => {
    // If cache is empty and not currently fetching, fetch content
    if (Object.keys(contentCache).length === 0 && !isFetching) {
      fetchContent()
    }
  }, [])

  const fetchContent = async () => {
    if (fetchPromise) {
      await fetchPromise
      setContent(contentCache)
      setLoading(false)
      return
    }

    isFetching = true
    fetchPromise = (async () => {
      try {
        const response = await fetch('/api/content-texts')
        if (response.ok) {
          const data = await response.json()
          const newCache: ContentCache = {}

          data.texts.forEach((text: ContentText) => {
            // Default to Khmer text
            newCache[text.key] = text.text_khmer
          })

          contentCache = newCache
          setContent(contentCache)
        }
      } catch (error) {
        console.error('Failed to fetch content:', error)
      } finally {
        setLoading(false)
        isFetching = false
        fetchPromise = null
      }
    })()

    await fetchPromise
  }

  const t = (key: string, fallback?: string): string => {
    return content[key] || fallback || key
  }

  const refresh = async () => {
    contentCache = {}
    setLoading(true)
    await fetchContent()
  }

  return { t, loading, refresh, content }
}

// Standalone function for use outside components
export function getContentText(key: string, fallback?: string): string {
  return contentCache[key] || fallback || key
}

// Clear cache (useful after updates)
export function clearContentCache() {
  contentCache = {}
}
