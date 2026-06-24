const STATS = [
  { n:'Rs.1,776 Cr', desc:'Lost to digital arrest scams in 9 months of 2024 (MHA data)' },
  { n:'1.14M',       desc:'Cybercrime complaints filed with NCRP in 2023 — up 60% from 2022' },
  { n:'7,000+',      desc:'Citizens defrauded every single day through phone, UPI, and online scams' },
  { n:'500L+',       desc:'Counterfeit currency seized by RBI in the most recent annual report' },
]
export default function About() {
  return (
    <div style={{ paddingTop:64 }}>
      <section style={{ background:'var(--surface)', padding:'60px 0', borderBottom:'1px solid var(--border)' }}>
        <div className="wrap">
          <p className="label-cap">About ShieldAI</p>
          <h1 className="heading" style={{ fontSize:'clamp(1.8rem,4vw,2.8rem)', color:'#fff', margin:'10px 0 16px', maxWidth:560 }}>Why we built India's free digital safety platform</h1>
          <p style={{ color:'var(--muted)', fontSize:'0.95rem', maxWidth:620, lineHeight:1.75 }}>ShieldAI exists because prevention needs to be as easy as the scam itself. Most victims are not careless — they are targeted by sophisticated, well-funded criminal networks using real government logos, AI-generated voices, and elaborate scripts.</p>
        </div>
      </section>
      <section style={{ background:'var(--ink)' }}>
        <div className="wrap">
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:48, alignItems:'start', marginBottom:64 }} className="about-g">
            <div>
              <h2 className="heading" style={{ fontSize:'clamp(1.4rem,2.5vw,2rem)', color:'#fff', marginBottom:20 }}>The threat is real — and growing</h2>
              <p style={{ color:'var(--muted)', fontSize:'0.9rem', lineHeight:1.8, marginBottom:14 }}>India's cybercrime problem has grown faster than awareness of how to fight it. The Ministry of Home Affairs reports that <strong style={{ color:'var(--text)' }}>digital arrest scams alone cost Indians Rs.1,776 crore</strong> in just the first nine months of 2024.</p>
              <p style={{ color:'var(--muted)', fontSize:'0.9rem', lineHeight:1.8, marginBottom:14 }}>Victims include retired teachers, homemakers, and students. The criminals are professional, organised, and use AI tools to impersonate government officials convincingly.</p>
              <p style={{ color:'var(--muted)', fontSize:'0.9rem', lineHeight:1.8 }}>ShieldAI was built so that <strong style={{ color:'var(--text)' }}>protection is free, instant, and available in your language</strong> — no app to download, no registration, no jargon.</p>
              <a href="/tools" className="btn btn-primary" style={{ marginTop:24, display:'inline-flex' }}>Try the Tools →</a>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              {STATS.map((s,i) => (
                <div key={i} className="card" style={{ display:'flex', gap:16, alignItems:'center' }}>
                  <span style={{ fontFamily:"'Sora',sans-serif", fontSize:'1.2rem', fontWeight:800, color:'var(--accent)', whiteSpace:'nowrap' }}>{s.n}</span>
                  <span style={{ fontSize:'0.82rem', color:'var(--muted)', lineHeight:1.5 }}>{s.desc}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ borderTop:'1px solid var(--border)', paddingTop:48 }}>
            <h3 className="heading" style={{ color:'#fff', fontSize:'1rem', marginBottom:20 }}>Official portals we link to</h3>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12 }} className="official-g">
              {[
                { name:'cybercrime.gov.in', desc:'National Cyber Crime Reporting Portal', url:'https://cybercrime.gov.in' },
                { name:'RBI',               desc:'Reserve Bank — Counterfeit Currency', url:'https://www.rbi.org.in' },
                { name:'MHA',               desc:'Ministry of Home Affairs — Cyber Safety', url:'https://mha.gov.in' },
                { name:'Sanchar Saathi',    desc:'Report lost or stolen SIM cards', url:'https://sancharsaathi.gov.in' },
              ].map((o,i) => (
                <a key={i} href={o.url} target="_blank" rel="noopener" className="card" style={{ display:'flex', flexDirection:'column', gap:4, transition:'border-color 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor='var(--accent)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor='var(--border)'}>
                  <strong style={{ color:'var(--accent)', fontSize:'0.85rem' }}>{o.name} ↗</strong>
                  <span style={{ color:'var(--muted)', fontSize:'0.77rem' }}>{o.desc}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>
      <style>{`@media(max-width:800px){.about-g{grid-template-columns:1fr!important}.official-g{grid-template-columns:1fr 1fr!important}}@media(max-width:480px){.official-g{grid-template-columns:1fr!important}}`}</style>
    </div>
  )
}
