import React from 'react'
import BoardPage from './Components/BoardPage'
import { RequireAuth } from '@/components/auth/ProtectedRoute'

function page() {
  return (
    <RequireAuth>
      <BoardPage />
    </RequireAuth>
  )
}

export default page