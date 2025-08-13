import React from 'react'
import BoardPage from '@/app/board/[id]/page/BoardPage'
import { RequireAuth } from '@/components/auth/ProtectedRoute'

function Board() {
  return (
    <RequireAuth>
      <div className="relative">
        <BoardPage />
      </div>
    </RequireAuth>
  )
}

export default Board