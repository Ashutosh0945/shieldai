import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { signUp } from '../lib/db'
import { Shield } from 'lucide-react'

export default function Register() {
  const navigate = useNavigate()
  const [name, setName]         = useState('')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm]   = useState('')
  const [loading, setLoading]   = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!name || !email || !password) { toast.error('Please fill all fields'); return }
    if (password !== confirm) { toast.error('Passwords do not match'); return }
    if (password.length < 6)  { toast.error('Password must be at least 6 characters'); return }
    setLoading(true)
    try {
      await signUp(email, password, name)
      toast.success('Account created! Check your email to verify.')
      navigate('/login')
    } catch (err) {
      toast.error(err.message || 'Registration failed')
    }
    setLoading(false)
  }

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--ink)', padding:'100px 24px 60px' }}>
      <div style={{ width:'100%', maxWidth:440 }}>
        <div style={{ textAlign:'center', marginBottom:32 }}>
          <div style={{ width:48, height:48, borderRadius:12, background:'var(--accent)', display:'inline-flex', alignItems:'center', justifyContent:'center', marginBottom:16 }}>
            <Shield size={24} color="#0D1B2A" strokeWidth={2.5} />
          </div>
          <h1 style={{ fontFamily:"'Sora',sans-serif", fontSize:'1.8rem', fontWeight:800, color:'#fff', marginBottom:6 }}>Create your account</h1>
          <p style={{ color:'var(--muted)', fontSize:'0.9rem' }}>Free forever · No credit card needed</p>
        </div>

        <form onSubmit={handleSubmit} className="card" style={{ padding:32 }}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input className="input" type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Arjun Sharma" autoFocus />
          </div>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="input" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Min 6 characters" />
          </div>
          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <input className="input" type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Repeat password" />
          </div>
          <p style={{ fontSize:'0.76rem', color:'var(--muted)', marginBottom:14, lineHeight:1.5 }}>
            By registering, you agree that your fraud reports may be used to improve ShieldAI's scam detection. No personal data is sold.
          </p>
          <button type="submit" className="btn btn-primary btn-full" disabled={loading} style={{ padding:'13px' }}>
            {loading ? <><span className="spinner" />Creating account…</> : 'Create Account →'}
          </button>
        </form>

        <p style={{ textAlign:'center', marginTop:20, fontSize:'0.875rem', color:'var(--muted)' }}>
          Already have an account? <Link to="/login" style={{ color:'var(--accent)', fontWeight:600 }}>Sign in →</Link>
        </p>
      </div>
    </div>
  )
}
