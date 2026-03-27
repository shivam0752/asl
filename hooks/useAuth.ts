// hooks/useAuth.ts
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { AuthChangeEvent, Session, User } from '@supabase/supabase-js'
import * as Linking from 'expo-linking'
import { Platform } from 'react-native'

type AuthSnapshot = {
  user: User | null
  session: Session | null
  loading: boolean
}

type AuthListener = (snapshot: AuthSnapshot) => void

let authSnapshot: AuthSnapshot = {
  user: null,
  session: null,
  loading: true,
}
const authListeners = new Set<AuthListener>()
let isAuthInitialized = false

function getEmailRedirectTo(): string {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined' && window.location?.origin) {
      return `${window.location.origin}/(auth)/login`
    }
    return 'http://localhost:8081/(auth)/login'
  }

  return Linking.createURL('/(auth)/login')
}

function notifyAuthListeners() {
  authListeners.forEach((listener) => listener(authSnapshot))
}

function updateAuthSnapshot(session: Session | null) {
  authSnapshot = {
    user: session?.user ?? null,
    session,
    loading: false,
  }
  notifyAuthListeners()
}

async function initializeAuthIfNeeded() {
  if (isAuthInitialized) return
  isAuthInitialized = true

  const { data } = await supabase.auth.getSession()
  updateAuthSnapshot(data.session)

  supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
    updateAuthSnapshot(session)
  })
}

export function useAuth() {
  const [user, setUser]       = useState<User | null>(authSnapshot.user)
  const [session, setSession] = useState<Session | null>(authSnapshot.session)
  const [loading, setLoading] = useState(authSnapshot.loading)
  const [error, setError]     = useState<string | null>(null)

  useEffect(() => {
    const listener: AuthListener = (snapshot) => {
      setUser(snapshot.user)
      setSession(snapshot.session)
      setLoading(snapshot.loading)
    }

    authListeners.add(listener)
    listener(authSnapshot)
    initializeAuthIfNeeded()

    return () => {
      authListeners.delete(listener)
    }
  }, [])

  const signUp = async (email: string, password: string): Promise<boolean> => {
    setError(null)
    const normalizedEmail = email.trim().toLowerCase()
    const { data, error } = await supabase.auth.signUp({
      email: normalizedEmail,
      password,
      options: {
        emailRedirectTo: getEmailRedirectTo(),
      },
    })
    if (error) {
      setError(error.message)
      return false
    }

    // Supabase may return no new identity for an already-registered address.
    if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
      setError('This email is already registered. Try logging in or use "Resend confirmation email".')
      return false
    }

    return true
  }

  const signIn = async (email: string, password: string): Promise<boolean> => {
    setError(null)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      return false
    }
    return true
  }

  const signOut = async (): Promise<boolean> => {
    setError(null)
    const { error } = await supabase.auth.signOut()
    if (error) {
      setError(error.message)
      return false
    }
    return true
  }

  const signInWithGoogle = async (): Promise<void> => {
    setError(null)
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' })
    if (error) setError(error.message)
  }

  return { user, session, loading, error, signUp, signIn, signOut, signInWithGoogle }
}