import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { signIn } from '../lib/db'
import { Shield } from 'lucide-react'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!email || !password) { toast.error('Please fill all fields'); return }
    setLoading(true)
    try {
      await signIn(email, password)
      toast.success('Welcome back!')
      navigate('/profile')
    } catch (err) {
      toast.error(err.message || 'Login failed')
    }
    setLoading(false)
  }

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', paddingTop:64, background:'var(--ink)', padding:'100px 24px 60px' }}>
      <div style={{ width:'100%', maxWidth:420 }}>
        <div style={{ textAlign:'center', marginBottom:32 }}>
          <div style={{ width:48, height:48, borderRadius:12, background:'var(--accent)', display:'inline-flex', alignItems:'center', justifyContent:'center', marginBottom:16 }}>
            <Shield size={24} color="#0D1B2A" strokeWidth={2.5} />
          </div>
          <h1 style={{ fontFamily:"'Sora',sans-serif", fontSize:'1.8rem', fontWeight:800, color:'#fff', marginBottom:6 }}>Welcome back</h1>
          <p style={{ color:'var(--muted)', fontSize:'0.9rem' }}>Sign in to your ShieldAI account</p>
        </div>

        <form onSubmit={handleSubmit} className="card" style={{ padding:32 }}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" autoFocus />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="input" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Your password" />
          </div>
          <button type="submit" className="btn btn-primary btn-full" disabled={loading} style={{ marginTop:8, padding:'13px' }}>
            {loading ? <><span className="spinner" />Signing in…</> : 'Sign In →'}
          </button>
        </form>

        <p style={{ textAlign:'center', marginTop:20, fontSize:'0.875rem', color:'var(--muted)' }}>
          No account? <Link to="/register" style={{ color:'var(--accent)', fontWeight:600 }}>Create one free →</Link>
        </p>
        <p style={{ textAlign:'center', marginTop:12, fontSize:'0.82rem', color:'var(--muted)' }}>
          <Link to="/" style={{ color:'var(--muted)' }}>← Back to home</Link>
        </p>
      </div>
    </div>
  )
}
