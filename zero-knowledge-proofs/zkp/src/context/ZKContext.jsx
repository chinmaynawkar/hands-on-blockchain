import React, { createContext, useContext } from 'react'

const ZKContext = createContext()

export const useZK = () => {
  const context = useContext(ZKContext)
  if (!context) {
    throw new Error('useZK must be used within a ZKContext.Provider')
  }
  return context
}

export { ZKContext } 