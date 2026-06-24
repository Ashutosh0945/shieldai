import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { getUserReports, getUserScamChecks, signOut } from '../lib/db'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { User, FileText, Phone, LogOut, Shield } from 'lucide-react'

const SEV_COLOR = { danger:'var(--danger)', warn:'var(--warn)', safe:'var(--accent)', pending:'var(--muted)' }

export default function Profile() {
  const { user } = useAuth()
  const navigate  = useNavigate()
  const [tab, setTab]         = useState('reports')
  const [reports, setReports] = useState([])
  const [checks, setChecks]   = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    Promise.all([getUserReports(user.id), getUserScamChecks(user.id)])
      .then(([r, c]) => { setReports(r || []); setChecks(c || []) })
      .catch(() => toast.error('Could not load history'))
      .finally(() => setLoading(false))
  }, [user])

  async function handleSignOut() {
    try { await signOut(); toast.success('Signed out'); navigate('/') }
    catch { toast.error('Sign out failed') }
  }

  const name  = user?.user_metadata?.full_name || 'User'
  const email = user?.email

  return (
    <div style={{ paddingTop:64, minHeight:'100vh', background:'var(--ink)' }}>
      <div style={{ background:'var(--surface)', borderBottom:'1px solid var(--border)', padding:'48px 0 0' }}>
        <div className="wrap">
          <div style={{ display:'flex', alignItems:'center', gap:20, marginBottom:32, flexWrap:'wrap' }}>
            <div style={{ width:64, height:64, borderRadius:'50%', background:'linear-gradient(135deg,var(--accent),var(--sky))', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <User size={28} color="#0D1B2A" />
            </div>
            <div>
              <h1 style={{ fontFamily:"'Sora',sans-serif", fontSize:'1.5rem', fontWeight:800, color:'#fff' }}>{name}</h1>
              <p style={{ color:'var(--muted)', fontSize:'0.875rem' }}>{email}</p>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={handleSignOut} style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:6 }}>
              <LogOut size={14} /> Sign Out
            </button>
          </div>

          <div style={{ display:'flex', gap:0 }}>
            {[
              { id:'reports', label:'Fraud Reports', icon:<FileText size={14}/>, count: reports.length },
              { id:'checks',  label:'Scam Checks',   icon:<Phone size={14}/>,    count: checks.length  },
            ].map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                style={{ display:'flex', alignItems:'center', gap:6, padding:'12px 20px', background:'none', border:'none', borderBottom: tab===t.id ? '2px solid var(--accent)' : '2px solid transparent', color: tab===t.id ? 'var(--accent)' : 'var(--muted)', fontWeight:600, fontSize:'0.875rem', cursor:'pointer', transition:'color 0.18s' }}>
                {t.icon} {t.label} <span style={{ background:'var(--raised)', borderRadius:100, padding:'1px 7px', fontSize:'0.72rem', marginLeft:2 }}>{t.count}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="wrap" style={{ padding:'40px 24px 80px' }}>
        {loading ? (
          <div style={{ display:'flex', justifyContent:'center', padding:60 }}><div className="spinner" style={{ width:32, height:32, borderWidth:3 }} /></div>
        ) : tab === 'reports' ? (
          reports.length === 0
            ? <EmptyState icon={<FileText size={32} color="var(--muted)" />} text="No fraud reports yet" sub="Use the Report Fraud tool to file your first complaint." />
            : <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                {reports.map(r => (
                  <div key={r.id} className="card" style={{ display:'flex', gap:16, alignItems:'flex-start' }}>
                    <div style={{ width:40, height:40, borderRadius:10, background:'rgba(224,82,82,0.1)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                      <Shield size={18} color="var(--danger)" />
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:12, flexWrap:'wrap' }}>
                        <h3 style={{ fontFamily:"'Sora',sans-serif", fontSize:'0.925rem', fontWeight:700, color:'#fff' }}>{r.fraud_type}</h3>
                        <span className={`badge badge-${r.status === 'pending' ? 'warn' : 'accent'}`}>{r.status}</span>
                      </div>
                      <p style={{ fontSize:'0.8rem', color:'var(--muted)', marginTop:4 }}>
                        {r.city && `${r.city} · `}{new Date(r.created_at).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}
                      </p>
                      {r.description && <p style={{ fontSize:'0.82rem', color:'var(--text)', marginTop:6, lineHeight:1.5 }}>{r.description.substring(0,120)}{r.description.length>120?'…':''}</p>}
                    </div>
                  </div>
                ))}
              </div>
        ) : (
          checks.length === 0
            ? <EmptyState icon={<Phone size={32} color="var(--muted)" />} text="No scam checks yet" sub="Use the Scam Call Checker to analyse a suspicious call." />
            : <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                {checks.map(c => (
                  <div key={c.id} className="card" style={{ display:'flex', gap:16, alignItems:'flex-start' }}>
                    <div style={{ width:40, height:40, borderRadius:10, background:'rgba(0,200,150,0.1)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                      <Phone size={18} color="var(--accent)" />
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ display:'flex', justifyContent:'space-between', gap:12, flexWrap:'wrap', alignItems:'center' }}>
                        <span style={{ fontFamily:"'Sora',sans-serif", fontSize:'0.925rem', fontWeight:700, color: SEV_COLOR[c.verdict] || 'var(--text)' }}>
                          {c.verdict === 'danger' ? '🚨 High Risk' : c.verdict === 'warn' ? '⚠️ Suspicious' : '✅ Low Risk'} — Score: {c.risk_score}%
                        </span>
                        <span style={{ fontSize:'0.75rem', color:'var(--muted)' }}>{new Date(c.created_at).toLocaleDateString('en-IN')}</span>
                      </div>
                      {c.input_text && <p style={{ fontSize:'0.8rem', color:'var(--muted)', marginTop:4 }}>{c.input_text.substring(0,100)}{c.input_text.length>100?'…':''}</p>}
                    </div>
                  </div>
                ))}
              </div>
        )}
      </div>
    </div>
  )
}

function EmptyState({ icon, text, sub }) {
  return (
    <div style={{ textAlign:'center', padding:'60px 20px' }}>
      <div style={{ marginBottom:12 }}>{icon}</div>
      <h3 style={{ fontFamily:"'Sora',sans-serif", color:'var(--text)', marginBottom:6 }}>{text}</h3>
      <p style={{ color:'var(--muted)', fontSize:'0.875rem' }}>{sub}</p>
    </div>
  )
}
