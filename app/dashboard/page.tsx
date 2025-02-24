'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser, isAdmin } from '@/lib/utils'
// import { isAdmin, getCurrentUser } from '@/lib/auth'

export default function DashboardPage() {
  const router = useRouter()

  useEffect(() => {
    const user = getCurrentUser()

    if (isAdmin(user)) {
      router.push('/dashboard/admin')
    } else if (user) {
      router.push(`/dashboard/${user.id}`)
    } else {
      router.push('/auth/login')
    }
  }, [router])

  return null
}