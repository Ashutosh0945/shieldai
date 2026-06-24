import { useState, useEffect } from 'react'
import { NavLink, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { signOut } from '../lib/db'
import toast from 'react-hot-toast'
import { Menu, X, Shield, User, LogOut } from 'lucide-react'

const NAV = [
  { to: '/',          label: 'Home',        end: true },
  { to: '/tools',     label: 'Tools' },
  { to: '/dashboard', label: 'Live Alerts' },
  { to: '/report',    label: 'Report Fraud' },
  { to: '/about',     label: 'About' },
]

const s = {
  nav: { position:'fixed', top:0, left:0, right:0, zIndex:200, transition:'background 0.2s, border-color 0.2s' },
  inner: { display:'flex', alignItems:'center', justifyContent:'space-between', height:64 },
  logo: { display:'flex', alignItems:'center', gap:10, fontFamily:"'Sora',sans-serif", fontWeight:700, fontSize:'1.05rem', color:'var(--text)', textDecoration:'none' },
  logoIcon: { width:34, height:34, borderRadius:8, background:'var(--accent)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 },
  links: { display:'flex', gap:4, alignItems:'center' },
  link: { color:'var(--muted)', fontSize:'0.875rem', fontWeight:500, padding:'7px 13px', borderRadius:8, transition:'color 0.18s,background 0.18s', textDecoration:'none' },
  activeLink: { color:'var(--accent)' },
  reportBtn: { background:'var(--accent)', color:'var(--ink)', fontWeight:700, padding:'8px 16px', borderRadius:8, fontSize:'0.875rem', textDecoration:'none', marginLeft:6 },
  hamburger: { display:'none', background:'none', border:'1px solid var(--border)', color:'var(--text)', padding:'6px 9px', borderRadius:8 },
  mob: { position:'fixed', top:64, left:0, right:0, zIndex:199, background:'var(--surface)', borderBottom:'1px solid var(--border)', padding:'12px 24px 20px', display:'flex', flexDirection:'column', gap:4 },
  mobLink: { color:'var(--muted)', fontSize:'0.925rem', padding:'10px 0', borderBottom:'1px solid var(--border)', display:'block' },
}

export default function Navbar() {
  const { user } = useAuth()
  const navigate  = useNavigate()
  const [open, setOpen]       = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  async function handleSignOut() {
    try { await signOut(); toast.success('Signed out'); navigate('/') }
    catch { toast.error('Sign out failed') }
  }

  const navStyle = {
    ...s.nav,
    background: scrolled ? 'rgba(13,27,42,0.97)' : 'rgba(13,27,42,0.85)',
    backdropFilter: 'blur(18px)',
    borderBottom: scrolled ? '1px solid var(--border)' : '1px solid transparent',
  }

  return (
    <nav style={navStyle}>
      <div className="wrap" style={s.inner}>
        <Link to="/" style={s.logo}>
          <span style={s.logoIcon}><Shield size={18} color="#0D1B2A" strokeWidth={2.5} /></span>
          Shield<span style={{ color:'var(--accent)' }}>AI</span>
        </Link>

        <div style={s.links} className="nav-desktop">
          {NAV.map(n => (
            <NavLink key={n.to} to={n.to} end={n.end}
              style={({ isActive }) => ({ ...s.link, ...(isActive ? s.activeLink : {}) })}>
              {n.label}
            </NavLink>
          ))}
          {user ? (
            <>
              <Link to="/profile" style={{ ...s.link, display:'flex', alignItems:'center', gap:6 }}>
                <User size={14} /> {user.user_metadata?.full_name?.split(' ')[0] || 'Profile'}
              </Link>
              <button onClick={handleSignOut} style={{ ...s.link, background:'none', border:'none', cursor:'pointer', display:'flex', alignItems:'center', gap:6 }}>
                <LogOut size={14} /> Sign Out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" style={s.link}>Login</Link>
              <Link to="/register" style={{ ...s.reportBtn }}>Get Started</Link>
            </>
          )}
        </div>

        <button style={s.hamburger} className="hamburger-btn" onClick={() => setOpen(o => !o)}>
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {open && (
        <div style={s.mob}>
          {NAV.map(n => <NavLink key={n.to} to={n.to} end={n.end} style={s.mobLink} onClick={() => setOpen(false)}>{n.label}</NavLink>)}
          {user ? (
            <>
              <Link to="/profile" style={s.mobLink} onClick={() => setOpen(false)}>Profile</Link>
              <button onClick={() => { handleSignOut(); setOpen(false) }} style={{ ...s.mobLink, background:'none', border:'none', textAlign:'left', color:'var(--danger)' }}>Sign Out</button>
            </>
          ) : (
            <>
              <Link to="/login"    style={s.mobLink} onClick={() => setOpen(false)}>Login</Link>
              <Link to="/register" style={{ ...s.mobLink, color:'var(--accent)', fontWeight:700 }} onClick={() => setOpen(false)}>Register</Link>
            </>
          )}
        </div>
      )}

      <style>{`
        @media(max-width:860px){ .nav-desktop{display:none!important} .hamburger-btn{display:flex!important;align-items:center} }
      `}</style>
    </nav>
  )
}
