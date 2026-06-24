import { Link } from 'react-router-dom'
import { Shield } from 'lucide-react'

export default function Footer() {
  return (
    <footer style={{ background:'var(--surface)', borderTop:'1px solid var(--border)', padding:'52px 0 28px' }}>
      <div className="wrap">
        <div style={{ display:'grid', gridTemplateColumns:'1.3fr 1fr 1fr 1fr', gap:40, marginBottom:36 }} className="foot-grid">
          <div>
            <Link to="/" style={{ display:'inline-flex', alignItems:'center', gap:10, fontFamily:"'Sora',sans-serif", fontWeight:700, fontSize:'1rem', color:'var(--text)' }}>
              <span style={{ width:32, height:32, borderRadius:7, background:'var(--accent)', display:'inline-flex', alignItems:'center', justifyContent:'center' }}>
                <Shield size={16} color="#0D1B2A" strokeWidth={2.5}/>
              </span>
              Shield<span style={{ color:'var(--accent)' }}>AI</span>
            </Link>
            <p style={{ fontSize:'0.82rem', color:'var(--muted)', marginTop:10, lineHeight:1.65, maxWidth:220 }}>
              India's free digital safety platform — protecting citizens from scams, fraud, and counterfeit currency.
            </p>
            <a href="tel:1930" style={{ display:'inline-flex', alignItems:'center', gap:8, marginTop:14, background:'rgba(224,82,82,0.08)', border:'1px solid rgba(224,82,82,0.2)', borderRadius:8, padding:'8px 14px', fontSize:'0.82rem', color:'var(--danger)', textDecoration:'none', fontWeight:700 }}>
              🚨 Helpline: 1930
            </a>
          </div>

          {[
            { title:'Tools', links:[
              { label:'Scam Call Checker', to:'/tools' },
              { label:'Currency Scanner', to:'/tools' },
              { label:'Report Fraud', to:'/report' },
              { label:'NCRP Portal ↗', href:'https://cybercrime.gov.in' },
            ]},
            { title:'Official Links', links:[
              { label:'cybercrime.gov.in ↗', href:'https://cybercrime.gov.in' },
              { label:'RBI — Fake Currency ↗', href:'https://www.rbi.org.in' },
              { label:'MHA Cyber Safety ↗', href:'https://mha.gov.in' },
              { label:'Sanchar Saathi ↗', href:'https://sancharsaathi.gov.in' },
            ]},
            { title:'ShieldAI', links:[
              { label:'About Us', to:'/about' },
              { label:'Login', to:'/login' },
              { label:'Register', to:'/register' },
              { label:'Contact', href:'mailto:help@shieldai.in' },
            ]},
          ].map(col => (
            <div key={col.title}>
              <h4 style={{ fontSize:'0.7rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.12em', color:'var(--muted)', marginBottom:14 }}>{col.title}</h4>
              {col.links.map(l => l.href
                ? <a key={l.label} href={l.href} target="_blank" rel="noopener" style={{ display:'block', fontSize:'0.82rem', color:'var(--muted)', marginBottom:9, transition:'color 0.18s' }} onMouseEnter={e=>e.target.style.color='var(--accent)'} onMouseLeave={e=>e.target.style.color='var(--muted)'}>{l.label}</a>
                : <Link key={l.label} to={l.to} style={{ display:'block', fontSize:'0.82rem', color:'var(--muted)', marginBottom:9 }}>{l.label}</Link>
              )}
            </div>
          ))}
        </div>

        <div style={{ borderTop:'1px solid var(--border)', paddingTop:20, display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:12 }}>
          <p style={{ fontSize:'0.75rem', color:'var(--muted)' }}>© 2026 ShieldAI — Digital Suraksha for Every Indian. Not affiliated with any government body.</p>
          <div style={{ display:'flex', gap:4, flexWrap:'wrap' }}>
            {['हिं','EN','मर','தமி','తెలు'].map(l => (
              <button key={l} style={{ background:'transparent', border:'1px solid var(--border)', color:'var(--muted)', borderRadius:6, padding:'4px 9px', fontSize:'0.72rem', cursor:'pointer', fontFamily:'Inter,sans-serif' }}>{l}</button>
            ))}
          </div>
        </div>
      </div>
      <style>{`@media(max-width:900px){.foot-grid{grid-template-columns:1fr 1fr!important;gap:24px!important}}@media(max-width:540px){.foot-grid{grid-template-columns:1fr!important}}`}</style>
    </footer>
  )
}
