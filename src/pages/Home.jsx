import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Modal from '../components/Modal'
import ScamChecker from '../components/ScamChecker'
import CurrencyScanner from '../components/CurrencyScanner'
import ReportWizard from '../components/ReportWizard'

const TICKERS = [
  '<strong>Mumbai:</strong> Digital arrest scam calls up 34% this week',
  '<strong>Delhi:</strong> 412 fake CBI calls in last 24 hours — do not transfer money',
  '<strong>Alert:</strong> WhatsApp TRAI SIM-block scam spreading — ignore and report',
  '<strong>Bengaluru:</strong> Fake job offer scams spiking — 156 victims this week',
]

const PROTECT = [
  { icon:'📞', bg:'rgba(0,200,150,0.1)',  title:'Digital Arrest Scam Detector', hindi:'डिजिटल गिरफ्तारी घोटाला पहचानें', desc:'Paste what a caller said. ShieldAI instantly checks for fake CBI/ED scripts and digital arrest threats.',   badge:'● Live Detection',      bc:'var(--accent)' },
  { icon:'💵', bg:'rgba(79,163,209,0.1)', title:'Counterfeit Currency Scanner',  hindi:'नकली नोट जांचें',                  desc:'Upload a photo of any ₹500 or ₹2000 note. AI checks 14 security features in seconds.',                  badge:'Free · No App Needed', bc:'var(--sky)'    },
  { icon:'📝', bg:'rgba(245,166,35,0.1)', title:'Guided Fraud Report Assistant', hindi:'धोखाधड़ी की शिकायत दर्ज करें',     desc:'Step-by-step assistant creates a ready-to-submit NCRP complaint in your language.',                       badge:'Hindi · English · 10+', bc:'var(--warn)'  },
  { icon:'🗺️', bg:'rgba(224,82,82,0.1)',  title:'Live Cybercrime Hotspot Alerts',hindi:'अपने शहर में साइबर अलर्ट देखें',  desc:'See active scam patterns in your city updated every hour from NCRP data.',                              badge:'● Updated Hourly',     bc:'var(--danger)' },
]

const STATS = [
  { n:'1.14M',      l:'cybercrime complaints in India in 2023 — 1 every 28 seconds' },
  { n:'₹11,333 Cr', l:'lost to online financial fraud in 2024' },
  { n:'70%',        l:'of scam victims never file a complaint — they do not know how' },
  { n:'12',         l:'languages ShieldAI supports — help is never lost in translation' },
]

export default function Home() {
  const [modal, setModal]         = useState(null)
  const [tickerIdx, setTickerIdx] = useState(0)
  const [opacity, setOpacity]     = useState(1)

  useEffect(() => {
    const id = setInterval(() => {
      setOpacity(0)
      setTimeout(() => { setTickerIdx(i => (i + 1) % TICKERS.length); setOpacity(1) }, 320)
    }, 4200)
    return () => clearInterval(id)
  }, [])

  return (
    <>
      {/* HERO */}
      <section style={{ minHeight:'100vh', display:'flex', alignItems:'center', paddingTop:64, position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', inset:0, backgroundImage:'linear-gradient(#1E3048 1px,transparent 1px),linear-gradient(90deg,#1E3048 1px,transparent 1px)', backgroundSize:'48px 48px', opacity:0.22, pointerEvents:'none' }} />
        <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse 60% 50% at 10% 90%,rgba(0,200,150,0.09) 0%,transparent 70%)', pointerEvents:'none' }} />
        <div className="wrap" style={{ position:'relative', zIndex:2, padding:'80px 24px 60px' }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:'rgba(0,200,150,0.1)', border:'1px solid rgba(0,200,150,0.22)', borderRadius:100, padding:'6px 16px', marginBottom:28 }}>
            <span style={{ width:6, height:6, background:'var(--accent)', borderRadius:'50%', animation:'blink 2s infinite' }} />
            <span style={{ fontSize:'0.77rem', fontWeight:700, color:'var(--accent)', letterSpacing:'0.1em', textTransform:'uppercase' }}>Free · 12 Languages · No App Needed</span>
          </div>
          <h1 className="display" style={{ fontSize:'clamp(2.4rem,6vw,4.2rem)', color:'#fff', marginBottom:4 }}>
            Stay Safe from Scams,<br />Fraud &amp; Fake Currency
          </h1>
          <p style={{ fontSize:'clamp(1rem,2.5vw,1.4rem)', color:'var(--muted)', fontFamily:"'Sora',sans-serif", fontWeight:600, marginTop:6, marginBottom:20 }}>
            ठगी से बचें — AI आपकी सुरक्षा करता है
          </p>
          <p style={{ fontSize:'1rem', color:'var(--muted)', maxWidth:520, marginBottom:36, lineHeight:1.72 }}>
            ShieldAI detects digital arrest scam calls, spots counterfeit notes, and guides you through reporting fraud — in plain language, instantly, for free.
          </p>
          <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
            <button className="btn btn-primary" onClick={() => setModal('call')} style={{ fontSize:'0.95rem', padding:'13px 24px' }}>📞 Check a Suspicious Call</button>
            <button className="btn btn-outline" onClick={() => setModal('currency')} style={{ fontSize:'0.95rem', padding:'13px 24px' }}>🔍 Scan Currency</button>
            <button className="btn btn-outline" onClick={() => setModal('report')} style={{ fontSize:'0.95rem', padding:'13px 24px' }}>⚠️ Report Fraud</button>
          </div>
          <div style={{ marginTop:44, display:'flex', alignItems:'center', gap:12, background:'var(--raised)', border:'1px solid var(--border)', borderRadius:10, padding:'12px 18px', maxWidth:560 }}>
            <span style={{ flexShrink:0, background:'rgba(224,82,82,0.12)', border:'1px solid rgba(224,82,82,0.25)', borderRadius:4, padding:'3px 8px', fontSize:'0.67rem', fontWeight:700, color:'var(--danger)', textTransform:'uppercase', letterSpacing:'0.1em' }}>🔴 Alert</span>
            <span style={{ fontSize:'0.82rem', color:'var(--muted)', opacity, transition:'opacity 0.32s' }} dangerouslySetInnerHTML={{ __html: TICKERS[tickerIdx] }} />
          </div>
        </div>
      </section>

      {/* TRUST */}
      <div style={{ background:'var(--surface)', padding:'48px 0', borderTop:'1px solid var(--border)', borderBottom:'1px solid var(--border)' }}>
        <div className="wrap">
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)' }} className="trust-g">
            {STATS.map((s, i) => (
              <div key={i} style={{ padding:'16px 28px', textAlign:'center', borderRight: i < 3 ? '1px solid var(--border)' : 'none' }}>
                <span style={{ display:'block', fontFamily:"'Sora',sans-serif", fontSize:'1.8rem', fontWeight:800, color:'#fff', marginBottom:8 }}>{s.n}</span>
                <span style={{ fontSize:'0.78rem', color:'var(--muted)', lineHeight:1.45 }}>{s.l}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="hdiv" />

      {/* PROTECT */}
      <section style={{ background:'var(--ink)' }}>
        <div className="wrap">
          <p className="label-cap">How ShieldAI Protects You</p>
          <h2 className="heading" style={{ fontSize:'clamp(1.5rem,3vw,2.2rem)', color:'#fff', margin:'10px 0 44px', maxWidth:480 }}>Four shields, working 24x7 for every Indian</h2>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:18 }} className="protect-g">
            {PROTECT.map((p, i) => (
              <div key={i} className="card" style={{ transition:'border-color 0.2s,transform 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor='rgba(0,200,150,0.3)'; e.currentTarget.style.transform='translateY(-3px)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.transform='none' }}>
                <div style={{ width:46, height:46, borderRadius:11, background:p.bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.4rem', marginBottom:16 }}>{p.icon}</div>
                <h3 style={{ fontFamily:"'Sora',sans-serif", fontSize:'1rem', fontWeight:700, color:'#fff', marginBottom:3 }}>{p.title}</h3>
                <span style={{ display:'block', fontSize:'0.75rem', color:'var(--accent)', marginBottom:8 }}>{p.hindi}</span>
                <p style={{ fontSize:'0.84rem', color:'var(--muted)', lineHeight:1.6 }}>{p.desc}</p>
                <span style={{ display:'inline-block', fontSize:'0.7rem', fontWeight:700, padding:'4px 10px', borderRadius:4, marginTop:14, background:p.bg, color:p.bc }}>{p.badge}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
      <div className="hdiv" />

      {/* HOW IT WORKS */}
      <section style={{ background:'var(--surface)' }}>
        <div className="wrap">
          <p className="label-cap">How It Works</p>
          <h2 className="heading" style={{ fontSize:'clamp(1.5rem,3vw,2.2rem)', color:'#fff', margin:'10px 0 6px' }}>Three steps to safety</h2>
          <p style={{ color:'var(--muted)', fontSize:'0.88rem', marginBottom:52 }}>कोई ऐप नहीं, कोई रजिस्ट्रेशन नहीं — बस तुरंत मदद</p>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', position:'relative' }} className="steps-g">
            <div className="steps-line" style={{ position:'absolute', top:35, left:'calc(16.67% + 20px)', right:'calc(16.67% + 20px)', height:2, background:'linear-gradient(90deg,var(--accent),var(--sky))' }} />
            {[
              { n:'1', t:'Describe or Upload',    h:'बताएं या अपलोड करें',          d:'Type what a caller told you, paste a suspicious message, or upload a currency note photo.' },
              { n:'2', t:'AI Analyses Instantly', h:'AI तुरंत विश्लेषण करता है',    d:'ShieldAI compares your input against real scam patterns from crores of reported incidents.' },
              { n:'3', t:'Get a Clear Answer',    h:'स्पष्ट उत्तर पाएं',            d:'You get a plain-language verdict — safe, suspicious, or danger — and exactly what to do next.' },
            ].map((s, i) => (
              <div key={i} style={{ padding:'0 28px', textAlign:'center', position:'relative', zIndex:1 }}>
                <div style={{ width:70, height:70, borderRadius:'50%', background:'var(--surface)', border:'2px solid var(--accent)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Sora',sans-serif", fontSize:'1.5rem', fontWeight:800, color:'var(--accent)', margin:'0 auto 22px' }}>{s.n}</div>
                <h3 style={{ fontFamily:"'Sora',sans-serif", fontWeight:700, fontSize:'1rem', color:'#fff', marginBottom:4 }}>{s.t}</h3>
                <span style={{ display:'block', fontSize:'0.75rem', color:'var(--accent)', marginBottom:8 }}>{s.h}</span>
                <p style={{ fontSize:'0.84rem', color:'var(--muted)' }}>{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <div className="hdiv" />

      {/* CTA */}
      <section style={{ background:'var(--ink)', padding:'64px 0' }}>
        <div className="wrap">
          <div style={{ background:'linear-gradient(135deg,rgba(0,200,150,0.07),rgba(79,163,209,0.07))', border:'1px solid rgba(0,200,150,0.18)', borderRadius:16, padding:'40px 44px', display:'flex', justifyContent:'space-between', alignItems:'center', gap:28, flexWrap:'wrap' }}>
            <div>
              <h2 className="heading" style={{ color:'#fff', fontSize:'clamp(1.3rem,2.5vw,1.8rem)' }}>Ready to protect yourself?</h2>
              <p style={{ color:'var(--muted)', fontSize:'0.9rem', marginTop:6 }}>अभी सुरक्षित हों — सब कुछ मुफ्त है</p>
            </div>
            <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
              <button className="btn btn-primary" onClick={() => setModal('call')}>Check a Call Now</button>
              <Link to="/tools" className="btn btn-outline">All Safety Tools</Link>
            </div>
          </div>
        </div>
      </section>

      <Modal open={modal==='call'}     onClose={() => setModal(null)} title="📞 Scam Call Checker"    hindiLabel="घोटाला कॉल जांचें"><ScamChecker /></Modal>
      <Modal open={modal==='currency'} onClose={() => setModal(null)} title="💵 Currency Note Scanner" hindiLabel="नोट स्कैनर — नकली नोट पहचानें"><CurrencyScanner /></Modal>
      <Modal open={modal==='report'}   onClose={() => setModal(null)} title="⚠️ Report Fraud"         hindiLabel="धोखाधड़ी की शिकायत दर्ज करें"><ReportWizard /></Modal>

      <style>{`@media(max-width:900px){.trust-g,.protect-g{grid-template-columns:1fr 1fr!important}.steps-g{grid-template-columns:1fr!important;gap:32px!important}.steps-line{display:none!important}}@media(max-width:560px){.trust-g{grid-template-columns:1fr 1fr!important}.protect-g{grid-template-columns:1fr!important}}`}</style>
    </>
  )
}
