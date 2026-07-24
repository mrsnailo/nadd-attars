'use client'

import { useState } from 'react'
import { seedDatabaseAction } from '@/app/actions/seed'
import { useRouter } from 'next/navigation'

export function SeedDatabaseButton() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSeed() {
    setLoading(true)
    try {
      const res = await seedDatabaseAction()
      alert(res.message)
      if (res.success) {
        router.refresh()
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Error seeding database'
      alert(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button 
      onClick={handleSeed}
      disabled={loading}
      style={{ 
        padding: '0.5rem 1rem', 
        background: '#ecf0f1', 
        color: '#2c3e50', 
        border: '1px solid #bdc3c7',
        cursor: 'pointer',
        marginRight: '1rem',
        opacity: loading ? 0.7 : 1
      }}
    >
      {loading ? 'Seeding...' : 'Seed Database'}
    </button>
  )
}
