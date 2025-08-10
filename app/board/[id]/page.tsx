import React from 'react'
import BoardPage from './Components/BoardPage'
import { RequireAuth } from '@/components/auth/ProtectedRoute'
import BackButton from '@/components/ui/BackButton'

function page() {
  return (
    <RequireAuth>
      <div className="relative">
        <BackButton 
          variant="dark" 
          position="fixed"
          showLabel={false}
          size="md"
        />
        <BoardPage />
      </div>
    </RequireAuth>
  )
}

export default page