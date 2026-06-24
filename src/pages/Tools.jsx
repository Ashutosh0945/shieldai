import { useState } from 'react'
import Modal from '../components/Modal'
import ScamChecker from '../components/ScamChecker'
import CurrencyScanner from '../components/CurrencyScanner'
import ReportWizard from '../components/ReportWizard'

const TOOLS = [
  { id:'call',     icon:'📞', bg:'rgba(0,200,150,0.1)',  title:'Scam Call Checker',    hindi:'कॉल चेकर — घोटाला पहचानें',            desc:'Received a suspicious call from "CBI", "ED", or a bank? Paste what they said and get an instant verdict.',          action:'Check Now' },
  { id:'currency', icon:'💵', bg:'rgba(79,163,209,0.1)', title:'Currency Note Scanner', hindi:'नोट स्कैनर — नकली नोट जांचें',          desc:'Upload a photo of a Rs.500 or Rs.2000 note. AI checks 14 security features in seconds.',                          action:'Scan a Note' },
  { id:'report',   icon:'📝', bg:'rgba(245,166,35,0.1)', title:'Fraud Report Assistant',hindi:'शिकायत सहायक — धोखाधड़ी रिपोर्ट करें', desc:'Answer a few questions and we create a complete complaint ready to file with cybercrime.gov.in.',                  action:'Start Report' },
  { id:'ncrp',     icon:'🚨', bg:'rgba(224,82,82,0.1)',  title:'NCRP Direct Complaint', hindi:'NCRP — सीधे साइबर शिकायत दर्ज करें',    desc:"Go directly to India's National Cyber Crime Reporting Portal. File a complaint or call 1930 — the national helpline.", action:'Open Portal' },
]

export default function Tools() {
  const [modal, setModal] = useState(null)
  function handle(id) {
    if (id === 'ncrp') { window.open('https://cybercrime.gov.in','_blank'); return }
    setModal(id)
  }
  return (
    <div style={{ paddingTop:64 }}>
      <section style={{ background:'var(--surface)', padding:'56px 0 44px', borderBottom:'1px solid var(--border)' }}>
        <div className="wrap">
          <p className="label-cap">Citizen Safety Tools</p>
          <h1 className="heading" style={{ fontSize:'clamp(1.8rem,4vw,2.8rem)', color:'#fff', margin:'10px 0 6px' }}>Everything you need, right here</h1>
          <p style={{ color:'var(--muted)', fontSize:'0.9rem' }}>सभी उपकरण मुफ्त में — किसी ऐप की जरूरत नहीं</p>
        </div>
      </section>
      <section style={{ background:'var(--ink)' }}>
        <div className="wrap">
          <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:16, marginBottom:28 }} className="tools-g">
            {TOOLS.map(t => (
              <div key={t.id} className="card" style={{ display:'flex', gap:18, cursor:'pointer', transition:'border-color 0.2s,transform 0.2s' }}
                onClick={() => handle(t.id)}
                onMouseEnter={e => { e.currentTarget.style.borderColor='rgba(0,200,150,0.35)'; e.currentTarget.style.transform='translateY(-3px)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.transform='none' }}>
                <div style={{ width:52, height:52, borderRadius:12, background:t.bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.5rem', flexShrink:0 }}>{t.icon}</div>
                <div>
                  <h3 style={{ fontFamily:"'Sora',sans-serif", fontSize:'0.95rem', fontWeight:700, color:'#fff', marginBottom:2 }}>{t.title}</h3>
                  <span style={{ display:'block', fontSize:'0.74rem', color:'var(--accent)', marginBottom:7 }}>{t.hindi}</span>
                  <p style={{ fontSize:'0.82rem', color:'var(--muted)', lineHeight:1.55 }}>{t.desc}</p>
                  <span style={{ display:'inline-block', marginTop:12, fontSize:'0.8rem', fontWeight:700, color:'var(--accent)' }}>{t.action} →</span>
                </div>
              </div>
            ))}
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:16, background:'rgba(224,82,82,0.07)', border:'1px solid rgba(224,82,82,0.2)', borderRadius:12, padding:'20px 24px' }}>
            <span style={{ fontSize:'1.6rem' }}>🚨</span>
            <div><strong style={{ color:'#fff' }}>National Cyber Crime Helpline</strong><p style={{ fontSize:'0.82rem', color:'var(--muted)', marginTop:2 }}>Available 24x7 in multiple languages</p></div>
            <a href="tel:1930" style={{ marginLeft:'auto', fontFamily:"'Sora',sans-serif", fontSize:'2rem', fontWeight:800, color:'var(--danger)', textDecoration:'none' }}>1930</a>
          </div>
        </div>
      </section>
      <Modal open={modal==='call'}     onClose={() => setModal(null)} title="📞 Scam Call Checker"     hindiLabel="घोटाला कॉल जांचें"><ScamChecker /></Modal>
      <Modal open={modal==='currency'} onClose={() => setModal(null)} title="💵 Currency Note Scanner"  hindiLabel="नोट स्कैनर — नकली नोट पहचानें"><CurrencyScanner /></Modal>
      <Modal open={modal==='report'}   onClose={() => setModal(null)} title="⚠️ Report Fraud"          hindiLabel="धोखाधड़ी की शिकायत दर्ज करें"><ReportWizard /></Modal>
      <style>{`@media(max-width:700px){.tools-g{grid-template-columns:1fr!important}}`}</style>
    </div>
  )
}
