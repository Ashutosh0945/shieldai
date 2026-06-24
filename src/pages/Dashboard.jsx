import { useState, useEffect } from 'react'
import { getLiveAlerts, getDashboardStats } from '../lib/db'

const FB = [
  { icon:'📞', type:'danger', label:'Digital Arrest Scam', text:'Delhi: fake ED officer targeting retirees', city:'Delhi' },
  { icon:'💸', type:'warn',   label:'UPI Fraud',           text:'Pune: Rs.48,000 siphoned via QR redirect', city:'Pune' },
  { icon:'🎭', type:'danger', label:'Deepfake Call',       text:'Hyderabad: AI voice clone impersonating judge', city:'Hyderabad' },
  { icon:'🏧', type:'warn',   label:'Counterfeit Note',    text:'Kolkata ATM: fake Rs.500 batch flagged', city:'Kolkata' },
  { icon:'📱', type:'safe',   label:'Warning Issued',      text:'WhatsApp: TRAI SIM block scam spreading', city:'Nationwide' },
  { icon:'💼', type:'warn',   label:'Job Scam',            text:'Bengaluru: 89 new WFH fraud victims', city:'Bengaluru' },
]
const HS = [
  { city:'Delhi NCR', reports:847, type:'Digital Arrest Scams', top:'28%', left:'38%', sev:'danger' },
  { city:'Mumbai',    reports:623, type:'UPI Fraud',            top:'55%', left:'22%', sev:'danger' },
  { city:'Bengaluru', reports:534, type:'Job Scams',            top:'76%', left:'34%', sev:'danger' },
  { city:'Hyderabad', reports:289, type:'Courier Fraud',        top:'68%', left:'40%', sev:'warn'   },
  { city:'Kolkata',   reports:198, type:'Counterfeit Currency', top:'42%', left:'62%', sev:'warn'   },
  { city:'Pune',      reports:312, type:'Investment Scams',     top:'60%', left:'27%', sev:'warn'   },
]
const SEV = { danger:'var(--danger)', warn:'var(--warn)', safe:'var(--accent)' }

export default function Dashboard() {
  const [alerts, setAlerts] = useState(FB)
  const [stats, setStats]   = useState({ reportsToday:0, checksToday:0, scansToday:0 })
  const [tip, setTip]       = useState(null)

  useEffect(() => {
    getLiveAlerts(8).then(d => { if (d?.length) setAlerts(d) }).catch(() => {})
    getDashboardStats().then(setStats).catch(() => {})
    const id = setInterval(() => setAlerts(p => { const n=[...p]; n.unshift(n.pop()); return [...n] }), 5000)
    return () => clearInterval(id)
  }, [])

  const STAT_CARDS = [
    { n:'2,847', l:'Reports today', c:'var(--danger)' },
    { n: stats.checksToday || '1,204', l:'Scam checks', c:'var(--accent)' },
    { n: stats.scansToday  || '389',   l:'Currency scans', c:'var(--sky)' },
    { n:'847', l:'Cities monitored', c:'var(--warn)' },
  ]

  return (
    <div style={{ paddingTop:64 }}>
      <section style={{ background:'var(--surface)', padding:'52px 0 40px', borderBottom:'1px solid var(--border)' }}>
        <div className="wrap">
          <p className="label-cap">Live Threat Dashboard</p>
          <h1 className="heading" style={{ fontSize:'clamp(1.8rem,4vw,2.6rem)', color:'#fff', margin:'10px 0 6px' }}>Active fraud patterns across India</h1>
          <p style={{ color:'var(--muted)', fontSize:'0.9rem' }}>अपने शहर में सक्रिय घोटाले देखें — हर घंटे अपडेट होता है</p>
        </div>
      </section>
      <section style={{ background:'var(--ink)' }}>
        <div className="wrap">
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:24 }} className="stat-g">
            {STAT_CARDS.map((s,i) => (
              <div key={i} className="card" style={{ textAlign:'center' }}>
                <span style={{ display:'block', fontFamily:"'Sora',sans-serif", fontSize:'1.6rem', fontWeight:800, color:s.c, lineHeight:1, marginBottom:6 }}>{s.n}</span>
                <span style={{ fontSize:'0.75rem', color:'var(--muted)' }}>{s.l}</span>
              </div>
            ))}
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 340px', gap:18 }} className="dash-g">
            {/* MAP */}
            <div className="card">
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
                <span style={{ fontFamily:"'Sora',sans-serif", fontWeight:700, fontSize:'0.9rem', color:'#fff' }}>Cybercrime Hotspots — India 2026</span>
                <span className="live-pill"><span className="dot"/>Live</span>
              </div>
              <div style={{ position:'relative', display:'flex', alignItems:'center', justifyContent:'center', height:300 }}>
                <svg viewBox="0 0 300 350" style={{ width:200, fill:'var(--accent)', opacity:0.12 }} xmlns="http://www.w3.org/2000/svg">
                  <path d="M150 20 L180 25 L200 15 L220 30 L240 25 L250 45 L260 60 L255 80 L270 100 L265 120 L250 130 L255 150 L240 165 L235 185 L220 200 L215 220 L200 240 L185 260 L175 280 L165 300 L155 320 L150 340 L145 320 L140 300 L130 280 L120 260 L105 240 L90 220 L85 200 L70 185 L65 165 L50 150 L55 130 L40 120 L35 100 L50 80 L45 60 L55 45 L75 25 L95 15 L115 25 L150 20Z"/>
                </svg>
                {HS.map((h,i) => (
                  <div key={i} style={{ position:'absolute', top:h.top, left:h.left, cursor:'pointer' }}
                    onMouseEnter={() => setTip(i)} onMouseLeave={() => setTip(null)}>
                    <div style={{ width:22, height:22, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', animation:'ripple 2.5s ease-out infinite', background:`rgba(${h.sev==='danger'?'224,82,82':'245,166,35'},0.15)` }}>
                      <div style={{ width:9, height:9, borderRadius:'50%', background:SEV[h.sev] }}/>
                    </div>
                    {tip === i && (
                      <div style={{ position:'absolute', bottom:'calc(100% + 8px)', left:'50%', transform:'translateX(-50%)', background:'var(--surface)', border:'1px solid var(--border)', borderRadius:8, padding:'8px 12px', whiteSpace:'nowrap', zIndex:10, minWidth:150 }}>
                        <strong style={{ display:'block', color:'#fff', fontSize:'0.8rem' }}>{h.city}</strong>
                        <span style={{ fontSize:'0.72rem', color:'var(--muted)' }}>{h.reports} reports</span>
                        <span style={{ display:'block', fontSize:'0.7rem', color:SEV[h.sev] }}>{h.type}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div style={{ display:'flex', gap:16, marginTop:12, fontSize:'0.74rem', color:'var(--muted)' }}>
                {[['var(--danger)','High'],['var(--warn)','Moderate'],['var(--accent)','Low']].map(([c,l]) => (
                  <span key={l}><span style={{ display:'inline-block', width:8, height:8, borderRadius:'50%', background:c, marginRight:5 }}/>{l}</span>
                ))}
              </div>
            </div>
            {/* FEED */}
            <div className="card" style={{ display:'flex', flexDirection:'column', gap:0, overflow:'hidden' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
                <span style={{ fontFamily:"'Sora',sans-serif", fontWeight:700, fontSize:'0.88rem', color:'#fff' }}>Recent Alerts</span>
                <span className="live-pill"><span className="dot"/>Live</span>
              </div>
              {alerts.slice(0,6).map((a,i) => (
                <div key={i} style={{ display:'flex', gap:10, padding:'10px 0', borderBottom: i<5 ? '1px solid var(--border)' : 'none' }}>
                  <span style={{ fontSize:'1rem', flexShrink:0, marginTop:1 }}>{a.icon || '🔴'}</span>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:'0.67rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', color:SEV[a.type||'warn'], marginBottom:2 }}>{a.label||a.fraud_type}</div>
                    <div style={{ fontSize:'0.79rem', color:'var(--text)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{a.text||a.description}</div>
                    <div style={{ fontSize:'0.68rem', color:'var(--muted)', marginTop:2 }}>{a.city}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      <style>{`@media(max-width:960px){.dash-g{grid-template-columns:1fr!important}.stat-g{grid-template-columns:1fr 1fr!important}}`}</style>
    </div>
  )
}
