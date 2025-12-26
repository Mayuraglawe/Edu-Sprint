import { createClient } from '@supabase/supabase-js'

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://mdofvunyvoljkemihsrf.supabase.co'
const supabaseAnonKey = import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1kb2Z2dW55dm9samtlbWloc3JmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYyNjMxMDUsImV4cCI6MjA4MTgzOTEwNX0.IohjGM3en4o0m4RJXJrwEfX-FNp_PAKnrA8Y7XSXeeI'

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Supabase Auth helpers
export const supabaseAuth = {
  /**
   * Sign up new user
   */
  signUp: async (email: string, password: string, metadata?: { name?: string; role?: string; institution?: string }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
      },
    })
    return { data, error }
  },

  /**
   * Sign in existing user
   */
  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  },

  /**
   * Sign out current user
   */
  signOut: async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  /**
   * Get current session
   */
  getSession: async () => {
    const { data: { session }, error } = await supabase.auth.getSession()
    return { session, error }
  },

  /**
   * Get current user
   */
  getCurrentUser: async () => {
    const { data: { user }, error } = await supabase.auth.getUser()
    return { user, error }
  },

  /**
   * Listen to auth state changes
   */
  onAuthStateChange: (callback: (event: string, session: any) => void) => {
    return supabase.auth.onAuthStateChange(callback)
  },
}

// Supabase Database helpers
export const supabaseDB = {
  /**
   * Get all users
   */
  getUsers: async () => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
    return { data, error }
  },

  /**
   * Get user by ID
   */
  getUserById: async (id: string) => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single()
    return { data, error }
  },

  /**
   * Get user by email
   */
  getUserByEmail: async (email: string) => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single()
    return { data, error }
  },

  /**
   * Insert new user (called after auth signup)
   */
  insertUser: async (user: {
    id: string
    name: string
    email: string
    role: string
    institution?: string
  }) => {
    const { data, error } = await supabase
      .from('users')
      .insert([user])
      .select()
    return { data, error }
  },

  /**
   * Get subjects
   */
  getSubjects: async () => {
    const { data, error } = await supabase
      .from('subjects')
      .select('*')
    return { data, error }
  },

  /**
   * Get tasks
   */
  getTasks: async () => {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
    return { data, error }
  },

  /**
   * Get grades for a student
   */
  getGradesByStudent: async (studentId: string) => {
    const { data, error } = await supabase
      .from('grades')
      .select('*')
      .eq('student_id', studentId)
    return { data, error }
  },
}

export default supabase
