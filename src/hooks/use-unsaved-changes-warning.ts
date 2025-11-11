'use client'

import { useEffect, useCallback } from 'react'
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

  useEffect(() => {
    // Warn before page reload/close
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault()
        e.returnValue = message
        return message
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [hasUnsavedChanges, message])

  // Return a function to check before navigation
  const confirmNavigation = useCallback(() => {
    if (hasUnsavedChanges) {
      return window.confirm(message)
    }
    return true
  }, [hasUnsavedChanges, message])

  return { confirmNavigation }
}
