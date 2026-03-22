import { createContext, useContext, useState } from 'react'

interface ModalContextValue {
  isCreatePostOpen: boolean
  openCreatePost: () => void
  closeCreatePost: () => void
  isARModalOpen: boolean
  openARModal: () => void
  closeARModal: () => void
}

const ModalContext = createContext<ModalContextValue | undefined>(undefined)

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false)
  const [isARModalOpen, setIsARModalOpen] = useState(false)

  return (
    <ModalContext.Provider
      value={{
        isCreatePostOpen,
        openCreatePost: () => setIsCreatePostOpen(true),
        closeCreatePost: () => setIsCreatePostOpen(false),
        isARModalOpen,
        openARModal: () => setIsARModalOpen(true),
        closeARModal: () => setIsARModalOpen(false),
      }}
    >
      {children}
    </ModalContext.Provider>
  )
}

export function useModal() {
  const context = useContext(ModalContext)
  if (!context) {
    throw new Error('useModal must be used within ModalProvider')
  }
  return context
}
