import { supabase } from './supabase'

// ── AUTH ──────────────────────────────────────────────────────
export async function signUp(email, password, fullName) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  })
  if (error) throw error
  return data
}

export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function getSession() {
  const { data } = await supabase.auth.getSession()
  return data.session
}

// ── FRAUD REPORTS ─────────────────────────────────────────────
export async function submitFraudReport({ fraudType, description, phone, city, userId }) {
  const { data, error } = await supabase
    .from('fraud_reports')
    .insert([{ fraud_type: fraudType, description, phone, city, user_id: userId || null, status: 'pending' }])
    .select()
    .single()
  if (error) throw error
  return data
}

export async function getUserReports(userId) {
  const { data, error } = await supabase
    .from('fraud_reports')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function getAllReports() {
  const { data, error } = await supabase
    .from('fraud_reports')
    .select('id, fraud_type, city, status, created_at')
    .order('created_at', { ascending: false })
    .limit(50)
  if (error) throw error
  return data
}

// ── SCAM CHECKS ───────────────────────────────────────────────
export async function logScamCheck({ inputText, riskScore, verdict, userId }) {
  const { data, error } = await supabase
    .from('scam_checks')
    .insert([{ input_text: inputText.substring(0, 300), risk_score: riskScore, verdict, user_id: userId || null }])
    .select()
    .single()
  if (error) throw error
  return data
}

export async function getUserScamChecks(userId) {
  const { data, error } = await supabase
    .from('scam_checks')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(20)
  if (error) throw error
  return data
}

// ── CURRENCY SCANS ────────────────────────────────────────────
export async function logCurrencyScan({ verdict, score, userId }) {
  const { data, error } = await supabase
    .from('currency_scans')
    .insert([{ verdict, score, user_id: userId || null }])
    .select()
    .single()
  if (error) throw error
  return data
}

// ── LIVE ALERTS ───────────────────────────────────────────────
export async function getLiveAlerts(limit = 8) {
  const { data, error } = await supabase
    .from('live_alerts')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) throw error
  return data || []
}

// ── CITY HOTSPOTS ─────────────────────────────────────────────
export async function getCityHotspots() {
  const { data, error } = await supabase
    .from('city_hotspots')
    .select('*')
    .order('report_count', { ascending: false })
  if (error) throw error
  return data || []
}

// ── DASHBOARD STATS ───────────────────────────────────────────
export async function getDashboardStats() {
  const today = new Date().toISOString().split('T')[0]
  const [r, s, c] = await Promise.all([
    supabase.from('fraud_reports').select('id', { count: 'exact', head: true }).gte('created_at', today),
    supabase.from('scam_checks').select('id', { count: 'exact', head: true }).gte('created_at', today),
    supabase.from('currency_scans').select('id', { count: 'exact', head: true }).gte('created_at', today),
  ])
  return { reportsToday: r.count || 0, checksToday: s.count || 0, scansToday: c.count || 0 }
}

// ── USER PROFILE ──────────────────────────────────────────────
export async function upsertProfile(userId, updates) {
  const { data, error } = await supabase
    .from('profiles')
    .upsert({ id: userId, ...updates, updated_at: new Date().toISOString() })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function getProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  if (error && error.code !== 'PGRST116') throw error
  return data
}
