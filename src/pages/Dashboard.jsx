import { useState, useEffect, useCallback } from 'react'
import { getLiveAlerts, getDashboardStats } from '../lib/db'

// ── ACCURATE INDIA SVG (simplified but recognisable) ──────────
// viewBox 0 0 500 560  — dots placed against this coordinate space
const INDIA_PATH = `
  M 245,18 L 258,14 L 272,12 L 286,14 L 298,20 L 308,28 L 318,22
  L 330,18 L 344,20 L 356,28 L 364,38 L 370,50 L 374,64 L 378,58
  L 388,54 L 400,56 L 410,64 L 416,76 L 418,90 L 414,104 L 406,114
  L 412,122 L 420,132 L 424,144 L 422,158 L 416,170 L 420,180
  L 428,190 L 432,204 L 430,218 L 424,230 L 430,240 L 436,252
  L 438,266 L 434,280 L 426,292 L 420,304 L 414,318 L 406,330
  L 396,342 L 384,354 L 372,364 L 358,374 L 344,382 L 330,390
  L 316,400 L 304,412 L 294,426 L 286,440 L 278,454 L 270,468
  L 262,482 L 254,496 L 248,510 L 242,496 L 234,482 L 226,468
  L 218,454 L 210,440 L 200,426 L 188,412 L 176,400 L 162,390
  L 148,380 L 134,368 L 122,354 L 112,340 L 104,326 L 98,312
  L 94,298 L 92,284 L 94,270 L 100,258 L 106,246 L 100,236
  L 92,226 L 86,214 L 84,200 L 86,186 L 92,174 L 98,162
  L 96,150 L 90,140 L 86,128 L 88,114 L 94,102 L 102,92
  L 112,84 L 124,78 L 136,74 L 148,70 L 160,68 L 172,66
  L 184,66 L 196,68 L 208,72 L 218,78 L 226,86 L 232,76
  L 236,64 L 238,52 L 240,38 L 244,26 Z
  M 248,510 L 252,524 L 254,536 L 250,546 L 244,552 L 238,546
  L 236,534 L 238,522 L 244,514 Z
  M 290,490 L 300,486 L 308,490 L 312,500 L 308,510 L 298,514
  L 290,510 L 286,500 Z
`

// ── HOTSPOTS — x,y matched to the path above ──────────────────
const HOTSPOTS = [
  { city:'Delhi NCR',  x:238, y:112, reports:847, type:'Digital Arrest Scams', sev:'danger' },
  { city:'Jaipur',     x:174, y:150, reports:132, type:'Digital Arrest',       sev:'warn'   },
  { city:'Lucknow',    x:274, y:140, reports:156, type:'OTP Fraud',            sev:'warn'   },
  { city:'Kolkata',    x:334, y:188, reports:198, type:'Counterfeit Currency', sev:'warn'   },
  { city:'Ahmedabad',  x:136, y:218, reports:201, type:'Job Scams',            sev:'warn'   },
  { city:'Mumbai',     x:138, y:274, reports:623, type:'UPI Fraud',            sev:'danger' },
  { city:'Pune',       x:154, y:300, reports:312, type:'Investment Scams',     sev:'warn'   },
  { city:'Hyderabad',  x:226, y:298, reports:289, type:'Courier Fraud',        sev:'warn'   },
  { city:'Bengaluru',  x:200, y:356, reports:534, type:'Job Scams',            sev:'danger' },
  { city:'Chennai',    x:242, y:374, reports:178, type:'OTP Fraud',            sev:'safe'   },
]

const SEV_COLOR = { danger:'#E05252', warn:'#F5A623', safe:'#00C896' }

const FEED_DATA = [
  { icon:'📞', type:'danger', label:'Digital Arrest Scam',  text:'Fake ED officer targeting retirees — do not engage', city:'Delhi' },
  { icon:'💸', type:'warn',   label:'UPI Fraud',            text:'Rs.48,000 siphoned via QR redirect scam', city:'Pune' },
  { icon:'🎭', type:'danger', label:'Deepfake Call',        text:'AI voice clone impersonating a judge reported', city:'Hyderabad' },
  { icon:'🏧', type:'warn',   label:'Counterfeit Note',     text:'Fake Rs.500 batch flagged at 3 ATMs', city:'Kolkata' },
  { icon:'📱', type:'safe',   label:'Warning Issued',       text:'TRAI SIM-block scam spreading via WhatsApp', city:'Nationwide' },
  { icon:'💼', type:'warn',   label:'Job Scam',             text:'89 new victims of work-from-home fraud', city:'Bengaluru' },
  { icon:'🔐', type:'danger', label:'OTP Interception',     text:'SIM-swap fraud cluster — 3 telecom nodes hit', city:'Mumbai' },
  { icon:'🛒', type:'warn',   label:'Shopping Fraud',       text:'Fake site cloning Flipkart checkout page', city:'Jaipur' },
]

const AI_INSIGHTS = [
  '🔴 Spike detected: Digital arrest calls up 34% in Delhi NCR — targeting numbers starting +91-98xx series.',
  '📊 Peak fraud window: UPI scams spike between 2 PM–4 PM IST on weekdays. Stay alert during these hours.',
  '💵 Counterfeit alert: Rs.500 notes with serial prefix YAK are suspect — RBI has been formally notified.',
  '🎭 New script: Scammers now claim to be from "Ministry of Electronics Cyber Branch" — always a fraud.',
  '🔗 Network link: Same voice fingerprint detected in scam calls across Delhi, Pune, Bengaluru this week.',
  '⚡ Live: 3 new mule account clusters flagged in Maharashtra — coordinated UPI fraud ring suspected.',
]

const AI_CHAT_RESPONSES = {
  default: `Based on current NCRP data, the top threats right now are:\n\n• **Digital Arrest Scams** — 847 reports in Delhi NCR alone this week\n• **UPI Fraud** — Rs.48,000 avg loss per victim in Pune\n• **Job Scams** — 534 reports in Bengaluru\n\nStay safe: Never transfer money on a call, even if the caller sounds official.`,
  delhi: `Delhi NCR Threat Summary:\n\n⚠️ 847 reports this week — highest in India\n🔴 Primary threat: Digital Arrest Scams\n📞 Fake CBI/ED officers demanding wire transfers\n\nWhat to do: Hang up immediately. Real government officers NEVER demand money over phone.`,
  mumbai: `Mumbai Threat Summary:\n\n⚠️ 623 reports this week\n🔴 Primary threat: UPI Fraud via QR redirect\n💸 Average loss: Rs.52,000 per victim\n\nWhat to do: Never scan a QR code sent by someone you don't know in person.`,
  scam: `How to spot a scam call:\n\n🚨 They claim to be CBI, ED, Police, or TRAI\n🚨 They threaten "digital arrest" or FIR\n🚨 They demand immediate money transfer\n🚨 They tell you to keep it secret\n\nRemember: NO government agency demands money over a phone call. Ever.`,
  report: `How to report fraud:\n\n1. Call **1930** — National Cyber Crime Helpline (24x7)\n2. File online at **cybercrime.gov.in**\n3. Visit your nearest police station\n4. Use the Report Fraud tool on this platform\n\nAct within 24 hours — early reporting helps freeze mule accounts.`,
}

function getAIResponse(question) {
  const q = question.toLowerCase()
  if (q.includes('delhi') || q.includes('ncr')) return AI_CHAT_RESPONSES.delhi
  if (q.includes('mumbai') || q.includes('upi')) return AI_CHAT_RESPONSES.mumbai
  if (q.includes('scam') || q.includes('call') || q.includes('spot') || q.includes('identify')) return AI_CHAT_RESPONSES.scam
  if (q.includes('report') || q.includes('complain') || q.includes('file')) return AI_CHAT_RESPONSES.report
  return AI_CHAT_RESPONSES.default
}

export default function Dashboard() {
  const [alerts, setAlerts]         = useState(FEED_DATA)
  const [tip, setTip]               = useState(null)
  const [aiIdx, setAiIdx]           = useState(0)
  const [aiVisible, setAiVisible]   = useState(true)
  const [pulseHot, setPulseHot]     = useState(null)
  const [liveCount, setLiveCount]   = useState(2847)
  const [newAlertIdx, setNewAlertIdx] = useState(null)
  // AI Chat
  const [chatOpen, setChatOpen]     = useState(false)
  const [chatInput, setChatInput]   = useState('')
  const [chatMessages, setChatMessages] = useState([
    { role:'ai', text:'Hi! I\'m ShieldAI Assistant. Ask me about fraud patterns, scam threats, or how to stay safe in any city.' }
  ])
  const [chatLoading, setChatLoading] = useState(false)
  // Stats
  const [counts, setCounts] = useState({ r:0, c:0, s:0, ci:0 })

  // Animate counters on mount
  useEffect(() => {
    const targets = { r:2847, c:1204, s:389, ci:847 }
    const dur = 1600
    const steps = 60
    const interval = dur / steps
    let step = 0
    const t = setInterval(() => {
      step++
      const pct = Math.min(step / steps, 1)
      const ease = 1 - Math.pow(1 - pct, 3)
      setCounts({
        r: Math.floor(targets.r * ease),
        c: Math.floor(targets.c * ease),
        s: Math.floor(targets.s * ease),
        ci: Math.floor(targets.ci * ease),
      })
      if (step >= steps) clearInterval(t)
    }, interval)
    return () => clearInterval(t)
  }, [])

  // Rotate AI insight
  useEffect(() => {
    const id = setInterval(() => {
      setAiVisible(false)
      setTimeout(() => { setAiIdx(i => (i + 1) % AI_INSIGHTS.length); setAiVisible(true) }, 380)
    }, 5500)
    return () => clearInterval(id)
  }, [])

  // Live feed + hotspot pulse every 4s
  useEffect(() => {
    getLiveAlerts(8).then(d => { if (d?.length) setAlerts(d) }).catch(() => {})
    getDashboardStats().then(d => {
      if (d.reportsToday > 0) setLiveCount(d.reportsToday)
    }).catch(() => {})

    const id = setInterval(() => {
      const idx = Math.floor(Math.random() * FEED_DATA.length)
      setAlerts(prev => [FEED_DATA[idx], ...prev.slice(0, 7)])
      setNewAlertIdx(0)
      const hIdx = Math.floor(Math.random() * HOTSPOTS.length)
      setPulseHot(hIdx)
      setLiveCount(c => c + Math.floor(Math.random() * 3) + 1)
      setTimeout(() => { setNewAlertIdx(null); setPulseHot(null) }, 2200)
    }, 4000)
    return () => clearInterval(id)
  }, [])

  // AI Chat send
  async function sendChat() {
    const q = chatInput.trim()
    if (!q) return
    setChatMessages(m => [...m, { role:'user', text:q }])
    setChatInput('')
    setChatLoading(true)
    await new Promise(r => setTimeout(r, 900))
    const answer = getAIResponse(q)
    setChatMessages(m => [...m, { role:'ai', text:answer }])
    setChatLoading(false)
  }

  const STAT_CARDS = [
    { n: counts.r.toLocaleString('en-IN'), l:'Reports today',    c:'#E05252' },
    { n: counts.c.toLocaleString('en-IN'), l:'Scam checks',      c:'#00C896' },
    { n: counts.s.toLocaleString('en-IN'), l:'Currency scans',   c:'#4FA3D1' },
    { n: counts.ci.toLocaleString('en-IN'),l:'Cities monitored', c:'#F5A623' },
  ]

  return (
    <div style={{ paddingTop:64, minHeight:'100vh', background:'var(--ink)' }}>

      {/* HEADER */}
      <section style={{ background:'var(--surface)', padding:'44px 0 32px', borderBottom:'1px solid var(--border)' }}>
        <div className="wrap">
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', flexWrap:'wrap', gap:16 }}>
            <div>
              <p className="label-cap">Live Threat Dashboard</p>
              <h1 className="heading" style={{ fontSize:'clamp(1.8rem,4vw,2.5rem)', color:'#fff', margin:'10px 0 6px' }}>
                Active fraud patterns across India
              </h1>
              <p style={{ color:'var(--muted)', fontSize:'0.9rem' }}>अपने शहर में सक्रिय घोटाले देखें — हर घंटे अपडेट होता है</p>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:12 }}>
              <button onClick={() => setChatOpen(true)}
                style={{ display:'flex', alignItems:'center', gap:8, background:'linear-gradient(135deg,rgba(0,200,150,0.15),rgba(79,163,209,0.1))', border:'1px solid rgba(0,200,150,0.3)', borderRadius:10, padding:'10px 18px', color:'var(--accent)', fontWeight:700, fontSize:'0.875rem', cursor:'pointer', fontFamily:'Inter,sans-serif' }}>
                🤖 Ask AI Assistant
              </button>
              <div style={{ textAlign:'right' }}>
                <div style={{ fontFamily:"'Sora',sans-serif", fontSize:'1.3rem', fontWeight:800, color:'#fff' }}>
                  {liveCount.toLocaleString('en-IN')}
                </div>
                <div style={{ fontSize:'0.72rem', color:'var(--muted)' }}>total today</div>
              </div>
              <span className="live-pill"><span className="dot"/>Live</span>
            </div>
          </div>
        </div>
      </section>

      <section style={{ background:'var(--ink)', paddingTop:32, paddingBottom:60 }}>
        <div className="wrap">

          {/* STAT CARDS */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:20 }} className="stat-g">
            {STAT_CARDS.map((s, i) => (
              <div key={i} className="card" style={{ textAlign:'center', position:'relative', overflow:'hidden' }}>
                <div style={{ position:'absolute', inset:0, background:`radial-gradient(ellipse at 50% 0%,${s.c}14,transparent 70%)`, pointerEvents:'none' }} />
                <span style={{ display:'block', fontFamily:"'Sora',sans-serif", fontSize:'clamp(1.4rem,3vw,2rem)', fontWeight:800, color:s.c, lineHeight:1, marginBottom:6 }}>{s.n}</span>
                <span style={{ fontSize:'0.75rem', color:'var(--muted)' }}>{s.l}</span>
              </div>
            ))}
          </div>

          {/* AI INSIGHT BANNER */}
          <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:20, background:'linear-gradient(135deg,rgba(0,200,150,0.07),rgba(79,163,209,0.05))', border:'1px solid rgba(0,200,150,0.22)', borderRadius:12, padding:'14px 18px' }}>
            <div style={{ width:36, height:36, borderRadius:10, background:'rgba(0,200,150,0.15)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.1rem', flexShrink:0 }}>🤖</div>
            <div style={{ flex:1, minWidth:0 }}>
              <span style={{ fontSize:'0.67rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.12em', color:'var(--accent)', display:'block', marginBottom:3 }}>AI Insight — Updated Live</span>
              <p style={{ fontSize:'0.84rem', color:'var(--text)', lineHeight:1.5, opacity:aiVisible?1:0, transition:'opacity 0.38s' }}>{AI_INSIGHTS[aiIdx]}</p>
            </div>
          </div>

          {/* MAP + FEED */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 350px', gap:18, marginBottom:20 }} className="dash-g">

            {/* ── INDIA MAP ─────────────────────────────────── */}
            <div className="card" style={{ padding:24 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
                <span style={{ fontFamily:"'Sora',sans-serif", fontWeight:700, fontSize:'0.95rem', color:'#fff' }}>Cybercrime Hotspots — India 2026</span>
                <span className="live-pill"><span className="dot"/>Live</span>
              </div>

              <svg viewBox="80 8 340 550" style={{ width:'100%', maxHeight:460, display:'block' }} xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <radialGradient id="mapfill" cx="50%" cy="45%" r="55%">
                    <stop offset="0%" stopColor="#1a5244"/>
                    <stop offset="100%" stopColor="#0d2e22"/>
                  </radialGradient>
                  <filter id="dotglow">
                    <feGaussianBlur stdDeviation="2.5" result="blur"/>
                    <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
                  </filter>
                </defs>

                {/* India filled shape */}
                <path d={INDIA_PATH} fill="url(#mapfill)" stroke="#00C896" strokeWidth="1.4" strokeOpacity="0.6"/>

                {/* Subtle internal state dividers */}
                <path d="M 150,180 Q 200,175 250,180 Q 280,182 310,178" stroke="rgba(0,200,150,0.1)" strokeWidth="0.8" fill="none"/>
                <path d="M 130,260 Q 190,255 250,258 Q 300,260 340,255" stroke="rgba(0,200,150,0.1)" strokeWidth="0.8" fill="none"/>
                <path d="M 140,320 Q 200,316 250,318 Q 290,320 320,316" stroke="rgba(0,200,150,0.1)" strokeWidth="0.8" fill="none"/>

                {/* Hotspot markers */}
                {HOTSPOTS.map((h, i) => {
                  const col = SEV_COLOR[h.sev]
                  const isPulsing = pulseHot === i
                  const r1 = isPulsing ? 22 : 16
                  const r2 = isPulsing ? 14 : 10
                  const rc = isPulsing ? 7 : 5
                  return (
                    <g key={i} style={{ cursor:'pointer' }}
                      onMouseEnter={() => setTip(i)}
                      onMouseLeave={() => setTip(null)}>

                      {/* Outer pulse ring */}
                      <circle cx={h.x} cy={h.y} r={r1} fill={col} opacity="0" style={{ transition:'r 0.4s' }}>
                        <animate attributeName="r"    values={`${r1*0.5};${r1};${r1*0.5}`} dur="2.2s" repeatCount="indefinite"/>
                        <animate attributeName="opacity" values="0.35;0;0.35"               dur="2.2s" repeatCount="indefinite"/>
                      </circle>

                      {/* Mid ring */}
                      <circle cx={h.x} cy={h.y} r={r2} fill={col} opacity="0">
                        <animate attributeName="r"    values={`${r2*0.6};${r2};${r2*0.6}`} dur="2.2s" begin="0.4s" repeatCount="indefinite"/>
                        <animate attributeName="opacity" values="0.45;0.1;0.45"             dur="2.2s" begin="0.4s" repeatCount="indefinite"/>
                      </circle>

                      {/* Core dot */}
                      <circle cx={h.x} cy={h.y} r={rc} fill={col} filter="url(#dotglow)"/>
                      <circle cx={h.x} cy={h.y} r={rc} fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="1"/>

                      {/* Tooltip */}
                      {tip === i && (() => {
                        const tx = h.x > 280 ? h.x - 165 : h.x + 12
                        const ty = h.y < 80 ? h.y + 8 : h.y - 68
                        return (
                          <g>
                            <rect x={tx} y={ty} width={154} height={62} rx="7" fill="#111D2E" stroke="#1E3048" strokeWidth="1" opacity="0.97"/>
                            <text x={tx+10} y={ty+18} fill="#fff" fontSize="11" fontWeight="700" fontFamily="Sora,sans-serif">{h.city}</text>
                            <text x={tx+10} y={ty+33} fill={col} fontSize="10" fontFamily="Inter,sans-serif">{h.type}</text>
                            <text x={tx+10} y={ty+50} fill="#6B8199" fontSize="9.5" fontFamily="Inter,sans-serif">{h.reports} reports this week</text>
                          </g>
                        )
                      })()}
                    </g>
                  )
                })}
              </svg>

              {/* Legend */}
              <div style={{ display:'flex', gap:20, marginTop:8, fontSize:'0.75rem', color:'var(--muted)' }}>
                {[['#E05252','High'],['#F5A623','Moderate'],['#00C896','Low']].map(([c,l]) => (
                  <span key={l} style={{ display:'flex', alignItems:'center', gap:6 }}>
                    <span style={{ width:10, height:10, borderRadius:'50%', background:c, display:'inline-block', boxShadow:`0 0 7px ${c}88` }}/>
                    {l}
                  </span>
                ))}
              </div>
            </div>

            {/* ── RIGHT COLUMN ──────────────────────────────── */}
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>

              {/* Live alert feed */}
              <div className="card" style={{ flex:1, overflow:'hidden' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
                  <span style={{ fontFamily:"'Sora',sans-serif", fontWeight:700, fontSize:'0.88rem', color:'#fff' }}>Recent Alerts</span>
                  <span className="live-pill"><span className="dot"/>Live</span>
                </div>
                {alerts.slice(0,6).map((a, i) => {
                  const col = SEV_COLOR[a.type || 'warn']
                  const isNew = i === 0 && newAlertIdx === 0
                  return (
                    <div key={i} style={{ display:'flex', gap:10, padding:'9px 0', borderBottom: i < 5 ? '1px solid var(--border)' : 'none', background: isNew ? 'rgba(0,200,150,0.04)' : 'transparent', borderRadius: isNew ? 6 : 0, transition:'background 0.5s', animation: isNew ? 'slideDown 0.4s ease' : 'none' }}>
                      <div style={{ width:30, height:30, borderRadius:7, background:`${col}18`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontSize:'0.85rem' }}>{a.icon || '🔴'}</div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontSize:'0.63rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em', color:col, marginBottom:1 }}>{a.label || a.fraud_type}</div>
                        <div style={{ fontSize:'0.78rem', color:'var(--text)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{a.text || a.description}</div>
                        <div style={{ fontSize:'0.65rem', color:'var(--muted)', marginTop:1 }}>{a.city}</div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* AI Pattern card */}
              <div className="card" style={{ background:'linear-gradient(135deg,rgba(0,200,150,0.06),transparent)', border:'1px solid rgba(0,200,150,0.18)' }}>
                <div style={{ fontSize:'0.67rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.12em', color:'var(--accent)', marginBottom:12 }}>🤖 AI Pattern Summary</div>
                {[
                  { label:'Top scam type',    value:'Digital Arrest', color:'var(--danger)' },
                  { label:'Peak fraud time',   value:'2 PM–4 PM IST',  color:'var(--warn)' },
                  { label:'Most targeted',     value:'Delhi NCR',       color:'var(--sky)' },
                  { label:'Scam calls blocked',value:'3,241 today',     color:'var(--accent)' },
                ].map((s, i) => (
                  <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'7px 0', borderBottom: i < 3 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                    <span style={{ fontSize:'0.78rem', color:'var(--muted)' }}>{s.label}</span>
                    <span style={{ fontSize:'0.78rem', fontWeight:700, color:s.color }}>{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* CITY BREAKDOWN */}
          <div className="card">
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
              <span style={{ fontFamily:"'Sora',sans-serif", fontWeight:700, fontSize:'0.95rem', color:'#fff' }}>City-wise Breakdown</span>
              <span style={{ fontSize:'0.75rem', color:'var(--muted)' }}>Updated hourly · NCRP data</span>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(190px,1fr))', gap:12 }}>
              {[...HOTSPOTS].sort((a,b) => b.reports - a.reports).map((h, i) => (
                <div key={i} style={{ background:'rgba(255,255,255,0.02)', border:'1px solid var(--border)', borderRadius:8, padding:'12px 14px' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
                    <span style={{ width:8, height:8, borderRadius:'50%', background:SEV_COLOR[h.sev], flexShrink:0, boxShadow:`0 0 6px ${SEV_COLOR[h.sev]}88` }}/>
                    <span style={{ fontWeight:700, fontSize:'0.85rem', color:'#fff', flex:1 }}>{h.city}</span>
                    <span style={{ fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:'0.9rem', color:SEV_COLOR[h.sev] }}>{h.reports}</span>
                  </div>
                  <div style={{ height:4, background:'rgba(255,255,255,0.06)', borderRadius:4, overflow:'hidden', marginBottom:6 }}>
                    <div style={{ height:'100%', width:`${(h.reports/847)*100}%`, background:SEV_COLOR[h.sev], borderRadius:4, transition:'width 1.2s ease' }}/>
                  </div>
                  <div style={{ fontSize:'0.7rem', color:'var(--muted)' }}>{h.type}</div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* ── AI CHAT MODAL ─────────────────────────────────────── */}
      {chatOpen && (
        <div style={{ position:'fixed', inset:0, zIndex:600, background:'rgba(0,0,0,0.6)', backdropFilter:'blur(6px)', display:'flex', alignItems:'flex-end', justifyContent:'flex-end', padding:24 }}>
          <div style={{ width:'100%', maxWidth:420, background:'var(--surface)', border:'1px solid var(--border)', borderRadius:16, overflow:'hidden', display:'flex', flexDirection:'column', maxHeight:'80vh', animation:'slideUp 0.3s ease' }}>

            {/* Chat header */}
            <div style={{ padding:'16px 20px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', gap:12 }}>
              <div style={{ width:36, height:36, borderRadius:10, background:'rgba(0,200,150,0.15)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.1rem', flexShrink:0 }}>🤖</div>
              <div style={{ flex:1 }}>
                <div style={{ fontFamily:"'Sora',sans-serif", fontWeight:700, fontSize:'0.9rem', color:'#fff' }}>ShieldAI Assistant</div>
                <div style={{ fontSize:'0.72rem', color:'var(--accent)' }}>● Online · AI-powered fraud intelligence</div>
              </div>
              <button onClick={() => setChatOpen(false)} style={{ background:'var(--raised)', border:'1px solid var(--border)', color:'var(--muted)', borderRadius:8, width:30, height:30, cursor:'pointer', fontSize:'0.9rem' }}>✕</button>
            </div>

            {/* Quick prompts */}
            <div style={{ padding:'10px 16px', borderBottom:'1px solid var(--border)', display:'flex', gap:6, flexWrap:'wrap' }}>
              {['Threats in Delhi?','How to spot a scam?','How to report fraud?','Mumbai threats?'].map(q => (
                <button key={q} onClick={() => { setChatInput(q) }}
                  style={{ fontSize:'0.72rem', padding:'4px 10px', borderRadius:100, background:'rgba(0,200,150,0.08)', border:'1px solid rgba(0,200,150,0.2)', color:'var(--accent)', cursor:'pointer', fontFamily:'Inter,sans-serif', whiteSpace:'nowrap' }}>
                  {q}
                </button>
              ))}
            </div>

            {/* Messages */}
            <div style={{ flex:1, overflowY:'auto', padding:16, display:'flex', flexDirection:'column', gap:12 }}>
              {chatMessages.map((m, i) => (
                <div key={i} style={{ display:'flex', justifyContent: m.role==='user' ? 'flex-end' : 'flex-start' }}>
                  <div style={{
                    maxWidth:'85%', padding:'10px 14px', borderRadius: m.role==='user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                    background: m.role==='user' ? 'var(--accent)' : 'var(--raised)',
                    border: m.role==='ai' ? '1px solid var(--border)' : 'none',
                    fontSize:'0.83rem', color: m.role==='user' ? 'var(--ink)' : 'var(--text)',
                    lineHeight:1.55, fontWeight: m.role==='user' ? 600 : 400,
                    whiteSpace:'pre-line',
                  }}>
                    {m.text}
                  </div>
                </div>
              ))}
              {chatLoading && (
                <div style={{ display:'flex', justifyContent:'flex-start' }}>
                  <div style={{ padding:'10px 14px', background:'var(--raised)', border:'1px solid var(--border)', borderRadius:'12px 12px 12px 2px', display:'flex', gap:5, alignItems:'center' }}>
                    {[0,1,2].map(i => (
                      <span key={i} style={{ width:6, height:6, borderRadius:'50%', background:'var(--accent)', display:'inline-block', animation:`bounce 1.2s ${i*0.2}s ease-in-out infinite` }}/>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div style={{ padding:'12px 16px', borderTop:'1px solid var(--border)', display:'flex', gap:8 }}>
              <input
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => { if (e.key==='Enter' && !e.shiftKey) { e.preventDefault(); sendChat() } }}
                placeholder="Ask about fraud patterns, threats, safety tips…"
                style={{ flex:1, background:'var(--raised)', border:'1px solid var(--border)', borderRadius:8, padding:'10px 14px', color:'var(--text)', fontSize:'0.85rem', fontFamily:'Inter,sans-serif', outline:'none' }}
              />
              <button onClick={sendChat} disabled={chatLoading || !chatInput.trim()}
                style={{ background:'var(--accent)', border:'none', borderRadius:8, width:40, height:40, cursor:'pointer', fontSize:'1rem', flexShrink:0, opacity: chatLoading || !chatInput.trim() ? 0.5 : 1 }}>
                ↑
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @media(max-width:960px){.dash-g{grid-template-columns:1fr!important}.stat-g{grid-template-columns:1fr 1fr!important}}
        @media(max-width:500px){.stat-g{grid-template-columns:1fr 1fr!important}}
        @keyframes slideDown{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        @keyframes bounce{0%,80%,100%{transform:scale(0.6);opacity:0.4}40%{transform:scale(1);opacity:1}}
      `}</style>
    </div>
  )
}
