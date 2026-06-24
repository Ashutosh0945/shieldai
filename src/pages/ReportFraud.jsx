import ReportWizard from '../components/ReportWizard'

export default function ReportFraud() {
  return (
    <div style={{ paddingTop:64 }}>
      <section style={{ background:'var(--surface)', padding:'52px 0 40px', borderBottom:'1px solid var(--border)' }}>
        <div className="wrap">
          <p className="label-cap">File a Complaint</p>
          <h1 className="heading" style={{ fontSize:'clamp(1.8rem,4vw,2.6rem)', color:'#fff', margin:'10px 0 6px' }}>Report Fraud</h1>
          <p style={{ color:'var(--muted)', fontSize:'0.9rem' }}>धोखाधड़ी की शिकायत दर्ज करें — हम आपकी मदद करेंगे</p>
        </div>
      </section>
      <section style={{ background:'var(--ink)' }}>
        <div className="wrap">
          <div style={{ display:'grid', gridTemplateColumns:'1fr 300px', gap:24 }} className="report-g">
            <div className="card" style={{ padding:32 }}><ReportWizard /></div>
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <div style={{ background:'rgba(224,82,82,0.06)', border:'1px solid rgba(224,82,82,0.18)', borderRadius:12, padding:24 }}>
                <div style={{ fontSize:'1.5rem', marginBottom:10 }}>🚨</div>
                <h3 style={{ color:'#fff', fontFamily:"'Sora',sans-serif", marginBottom:6 }}>Emergency?</h3>
                <p style={{ color:'var(--muted)', fontSize:'0.82rem', marginBottom:12 }}>If you are actively being scammed right now, call immediately:</p>
                <a href="tel:1930" style={{ display:'block', fontSize:'2.2rem', fontFamily:"'Sora',sans-serif", fontWeight:800, color:'var(--danger)', textDecoration:'none' }}>1930</a>
                <p style={{ color:'var(--muted)', fontSize:'0.74rem', marginTop:4 }}>National Cyber Crime Helpline · 24x7</p>
              </div>
              <div className="card">
                <h4 style={{ color:'#fff', fontFamily:"'Sora',sans-serif", marginBottom:12, fontSize:'0.9rem' }}>What to keep ready</h4>
                {['Caller number or screenshot','Amount lost (if any)','Date and time of incident','Any transaction IDs or UPI refs','Bank account details involved'].map((t,i) => (
                  <div key={i} style={{ display:'flex', gap:8, marginBottom:8, fontSize:'0.82rem', color:'var(--muted)' }}>
                    <span style={{ color:'var(--accent)', flexShrink:0 }}>✓</span>{t}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
      <style>{`@media(max-width:760px){.report-g{grid-template-columns:1fr!important}}`}</style>
    </div>
  )
}
