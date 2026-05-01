import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import pb from '@/lib/pocketbase/client'

interface AuthContextType {
  user: any
  signUp: (
    email: string,
    password: string,
    passwordConfirm: string,
    name: string,
  ) => Promise<{ error: any }>
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signOut: () => void
  requestPasswordReset: (email: string) => Promise<{ error: any }>
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any>(pb.authStore.record)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    const initAuth = async () => {
      if (pb.authStore.isValid) {
        try {
          const authData = await pb.collection('users').authRefresh()
          if (authData.record.status === 'blocked') {
            pb.authStore.clear()
            if (mounted) setUser(null)
          }
        } catch (err) {
          pb.authStore.clear()
          if (mounted) setUser(null)
        }
      }
      if (mounted) setLoading(false)
    }

    initAuth()

    const unsubscribe = pb.authStore.onChange((_token, record) => {
      if (record?.status === 'blocked') {
        pb.authStore.clear()
        if (mounted) setUser(null)
      } else {
        if (mounted) setUser(record)
      }
    })

    return () => {
      mounted = false
      unsubscribe()
    }
  }, [])

  const signUp = async (email: string, password: string, passwordConfirm: string, name: string) => {
    try {
      await pb.collection('users').create({
        email,
        password,
        passwordConfirm,
        name,
        role: 'student',
        status: 'pending',
        unlocked_level: 1,
      })
      await pb.collection('users').authWithPassword(email, password)
      return { error: null }
    } catch (error) {
      return { error }
    }
  }

  const requestPasswordReset = async (email: string) => {
    try {
      await pb.collection('users').requestPasswordReset(email)
      return { error: null }
    } catch (error) {
      return { error }
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      const authData = await pb.collection('users').authWithPassword(email, password)
      if (authData.record.status === 'blocked') {
        pb.authStore.clear()
        return { error: new Error('Sua conta está bloqueada e não pode acessar o sistema.') }
      }
      return { error: null }
    } catch (error) {
      return { error }
    }
  }

  const signOut = () => {
    pb.authStore.clear()
  }

  return (
    <AuthContext.Provider value={{ user, signUp, signIn, signOut, loading }}>
      {children}
    </AuthContext.Provider>
  )
}
