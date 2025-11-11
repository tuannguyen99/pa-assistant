'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

/**
 * Hook to warn users about unsaved changes when they try to leave the page
 * @param hasUnsavedChanges - Whether there are unsaved changes
 * @param message - Optional custom warning message
 */
export function useUnsavedChangesWarning(
  hasUnsavedChanges: boolean,
  message: string = 'You have unsaved changes. Are you sure you want to leave?'
) {
  const router = useRouter()
  const navigationBlockedRef = useRef(false)

  useEffect(() => {
    // Warn before page reload/close
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault()
        e.returnValue = message
        return message
      }
    }

    // Intercept Next.js navigation
    const originalPush = router.push
    const originalReplace = router.replace

    const wrapNavigation = (
      originalMethod: (href: string) => void,
      methodName: string
    ) => {
      return (href: string) => {
        if (hasUnsavedChanges && !navigationBlockedRef.current) {
          navigationBlockedRef.current = true
          const confirmed = window.confirm(message)
          navigationBlockedRef.current = false

          if (!confirmed) {
            return
          }
        }
        originalMethod.call(router, href)
      }
    }

    router.push = wrapNavigation(originalPush, 'push')
    router.replace = wrapNavigation(originalReplace, 'replace')

    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      router.push = originalPush
      router.replace = originalReplace
    }
  }, [hasUnsavedChanges, message, router])
}
