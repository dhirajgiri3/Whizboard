import React from 'react'
import BoardPage from './components/BoardPage'
import { RequireAuth } from '@/components/auth/ProtectedRoute'

function page() {
  return (
    <RequireAuth>
      <div className="relative">
        <BoardPage />
      </div>
    </RequireAuth>
  )
}

export default page