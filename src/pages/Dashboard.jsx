import { useState, useEffect, useRef } from 'react'
import { getDashboardStats } from '../lib/db'

// ── HOTSPOTS: percentage positions on the map image ─────────────
// x% = left, y% = top — calibrated for india-map.png (standard outline)
const HOTSPOTS = [
  { city:'Delhi NCR',  x:46, y:22, reports:847, type:'Digital Arrest',       sev:'danger' },
  { city:'Jaipur',     x:38, y:26, reports:132, type:'Investment Scam',       sev:'warn'   },
  { city:'Lucknow',    x:54, y:24, reports:156, type:'OTP Fraud',             sev:'warn'   },
  { city:'Kolkata',    x:68, y:34, reports:198, type:'Counterfeit Currency',  sev:'warn'   },
  { city:'Ahmedabad',  x:29, y:38, reports:201, type:'Job Scam',              sev:'warn'   },
  { city:'Mumbai',     x:27, y:50, reports:623, type:'UPI Fraud',             sev:'danger' },
  { city:'Pune',       x:30, y:53, reports:312, type:'Investment Scam',       sev:'warn'   },
  { city:'Hyderabad',  x:44, y:57, reports:289, type:'Courier Fraud',         sev:'warn'   },
  { city:'Bengaluru',  x:40, y:68, reports:534, type:'Job Scam',              sev:'danger' },
  { city:'Chennai',    x:50, y:70, reports:178, type:'OTP Fraud',             sev:'safe'   },
]

const SEV = { danger:'#E05252', warn:'#F5A623', safe:'#00C896' }
const SEV_BG = { danger:'rgba(224,82,82,0.15)', warn:'rgba(245,166,35,0.15)', safe:'rgba(0,200,150,0.15)' }


const INSIGHTS = [
  '🔴 Spike: Digital arrest calls up 34% in Delhi NCR — targeting +91-98xx numbers.',
  '📊 Pattern: UPI fraud peaks 2 PM–4 PM IST weekdays. Extra vigilance advised.',
  '💵 Alert: Rs.500 notes with serial prefix YAK may be counterfeit — RBI notified.',
  '🎭 New script: Callers claiming "Ministry of Electronics Cyber Branch" — always fraud.',
  '🔗 Same voice fingerprint in scam calls across Delhi, Pune, Bengaluru this week.',
  '⚡ 3 new mule account clusters flagged in Maharashtra — coordinated UPI ring.',
]

const AI_KB = {
  delhi:  '📍 Delhi NCR — 847 reports this week (highest in India)\n🔴 Top threat: Digital Arrest Scams\nFake CBI/ED officers demand wire transfers over phone.\n\n✅ Action: Hang up immediately. Real officers NEVER demand money by phone.',
  mumbai: '📍 Mumbai — 623 reports this week\n🔴 Top threat: UPI Fraud via QR redirect\nAverage loss: Rs.52,000 per victim.\n\n✅ Action: Never scan a QR code received from someone unknown.',
  scam:   '🚨 How to spot a scam call:\n• Caller claims to be CBI, ED, Police or TRAI\n• Threatens "digital arrest" or FIR\n• Demands immediate money transfer\n• Asks you to keep it secret\n\n✅ Rule: NO government agency ever demands money over phone.',
  report: '📋 How to report fraud:\n1. Call 1930 — Cyber Crime Helpline (24×7)\n2. File at cybercrime.gov.in\n3. Visit nearest police station\n4. Use Report Fraud on this platform\n\n⚡ Act within 24 hrs to help freeze mule accounts.',
  safe:   '🛡️ Top safety tips:\n1. Never share OTP with anyone\n2. Verify callers via official website numbers\n3. No government officer demands money by phone\n4. Check currency notes under UV light\n5. If in doubt — hang up and call 1930',
  bengaluru: '📍 Bengaluru — 534 reports this week\n🔴 Top threat: Job Scams targeting IT professionals\nFake work-from-home offers demanding registration fees.\n\n✅ Action: Never pay money to get a job. Verify company details on MCA portal.',
  kolkata: '📍 Kolkata — 198 reports this week\n🔴 Top threat: Counterfeit Currency\nFake Rs.500 notes with prefix YAK circulating in market areas.\n\n✅ Action: Check UV features before accepting notes. Report to nearest bank.',
  default: '📊 Current top threats in India:\n\n🔴 Digital Arrest Scams — 847 reports (Delhi NCR)\n🔴 UPI Fraud — 623 reports (Mumbai)\n🔴 Job Scams — 534 reports (Bengaluru)\n\nAll tools on ShieldAI are free. Use Scam Checker or Report Fraud for instant help.',
}

function aiReply(q) {
  const l = q.toLowerCase()
  if (l.includes('delhi') || l.includes('ncr'))                               return AI_KB.delhi
  if (l.includes('mumbai') || l.includes('upi') || l.includes('qr'))         return AI_KB.mumbai
  if (l.includes('bengaluru') || l.includes('bangalore') || l.includes('job'))return AI_KB.bengaluru
  if (l.includes('kolkata') || l.includes('counterfeit') || l.includes('note'))return AI_KB.kolkata
  if (l.includes('spot') || l.includes('identify') || l.includes('recogni')) return AI_KB.scam
  if (l.includes('report') || l.includes('complain') || l.includes('file'))  return AI_KB.report
  if (l.includes('safe') || l.includes('protect') || l.includes('tip'))      return AI_KB.safe
  return AI_KB.default
}

export default function Dashboard() {
  const [tip, setTip]             = useState(null)
  const [insightIdx, setIIdx]     = useState(0)
  const [insightVis, setIVis]     = useState(true)
  const [pulseIdx, setPulse]      = useState(null)
  const [chatOpen, setChatOpen]   = useState(false)
  const [chatInput, setChatInput] = useState('')
  const [chatBusy, setChatBusy]   = useState(false)
  const [msgs, setMsgs]           = useState([
    { role:'ai', text:'Hi! I am ShieldAI Assistant.\n\nAsk me about:\n• Active threats in any city\n• How to spot scam calls\n• How to report fraud\n• Safety tips\n\nOr tap a quick prompt below 👇' }
  ])
  const [counts, setCounts]       = useState({ r:0, c:0, s:0, ci:0 })
  const [activeCity, setActiveCity] = useState(null)
  const chatEnd = useRef(null)

  // Animate counters on mount
  useEffect(() => {
    const T = { r:2847, c:1204, s:389, ci:847 }
    let step = 0
    const id = setInterval(() => {
      step++
      const p = 1 - Math.pow(1 - step / 60, 3)
      setCounts({ r: Math.floor(T.r*p), c: Math.floor(T.c*p), s: Math.floor(T.s*p), ci: Math.floor(T.ci*p) })
      if (step >= 60) clearInterval(id)
    }, 30)
    return () => clearInterval(id)
  }, [])

  // Rotate AI insight every 5s
  useEffect(() => {
    const id = setInterval(() => {
      setIVis(false)
      setTimeout(() => { setIIdx(i => (i+1) % INSIGHTS.length); setIVis(true) }, 350)
    }, 5000)
    return () => clearInterval(id)
  }, [])

  // Pulse random hotspot + increment counter every 3s
  useEffect(() => {
    const id = setInterval(() => {
      setPulse(Math.floor(Math.random() * HOTSPOTS.length))
      setTimeout(() => setPulse(null), 1800)
    }, 3000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => { chatEnd.current?.scrollIntoView({ behavior:'smooth' }) }, [msgs, chatBusy])

  async function send(q) {
    const text = (q || chatInput).trim()
    if (!text) return
    setMsgs(m => [...m, { role:'user', text }])
    setChatInput(''); setChatBusy(true)
    await new Promise(r => setTimeout(r, 900))
    setMsgs(m => [...m, { role:'ai', text: aiReply(text) }])
    setChatBusy(false)
  }

  function openCityChat(city) {
    setChatOpen(true)
    setActiveCity(city)
    const q = `Threats in ${city}?`
    setMsgs(m => [...m, { role:'user', text: q }, { role:'ai', text: aiReply(q) }])
  }

  const STATS = [
    { n: counts.r.toLocaleString('en-IN'), l:'Reports today',    c:'#E05252' },
    { n: counts.c.toLocaleString('en-IN'), l:'Scam checks',      c:'#00C896' },
    { n: counts.s.toLocaleString('en-IN'), l:'Currency scans',   c:'#4FA3D1' },
    { n: counts.ci.toLocaleString('en-IN'),l:'Cities monitored', c:'#F5A623' },
  ]

  const QUICK = ['Threats in Delhi?', 'How to spot a scam?', 'How to report fraud?', 'Safety tips?', 'Mumbai threats?', 'Bengaluru threats?']

  return (
    <div style={{ paddingTop:64, minHeight:'100vh', background:'var(--ink)' }}>

      {/* ── HEADER ─────────────────────────────────────── */}
      <div style={{ background:'var(--surface)', padding:'36px 0 24px', borderBottom:'1px solid var(--border)' }}>
        <div className="wrap" style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:16 }}>
          <div>
            <p className="label-cap">Live Threat Dashboard</p>
            <h1 className="heading" style={{ fontSize:'clamp(1.5rem,3vw,2.3rem)', color:'#fff', margin:'8px 0 5px' }}>
              Active fraud patterns across India
            </h1>
            <p style={{ color:'var(--muted)', fontSize:'0.875rem' }}>
              अपने शहर में सक्रिय घोटाले — हर घंटे अपडेट
            </p>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <button onClick={() => setChatOpen(true)} style={{
              display:'flex', alignItems:'center', gap:9,
              background:'linear-gradient(135deg,#00C896,#009970)',
              border:'none', borderRadius:10, padding:'12px 22px',
              color:'#0D1B2A', fontWeight:800, fontSize:'0.9rem',
              cursor:'pointer', fontFamily:'Inter,sans-serif',
              boxShadow:'0 4px 24px rgba(0,200,150,0.4)',
              transition:'transform 0.2s, box-shadow 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 8px 32px rgba(0,200,150,0.5)' }}
            onMouseLeave={e => { e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow='0 4px 24px rgba(0,200,150,0.4)' }}>
              🤖 <span>Ask AI Assistant</span>
            </button>

          </div>
        </div>
      </div>

      <div style={{ padding:'24px 0 60px' }}>
        <div className="wrap">

          {/* ── STAT CARDS ─────────────────────────────── */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:16 }} className="stat-g">
            {STATS.map((s,i) => (
              <div key={i} className="card" style={{ textAlign:'center', position:'relative', overflow:'hidden' }}>
                <div style={{ position:'absolute', inset:0, background:`radial-gradient(ellipse at 50% 0%,${s.c}18,transparent 70%)`, pointerEvents:'none' }}/>
                <span style={{ display:'block', fontFamily:"'Sora',sans-serif", fontSize:'clamp(1.3rem,2.5vw,1.9rem)', fontWeight:800, color:s.c, lineHeight:1, marginBottom:5 }}>{s.n}</span>
                <span style={{ fontSize:'0.74rem', color:'var(--muted)' }}>{s.l}</span>
              </div>
            ))}
          </div>

          {/* ── AI INSIGHT BANNER ───────────────────────── */}
          <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:16, background:'linear-gradient(135deg,rgba(0,200,150,0.09),rgba(79,163,209,0.05))', border:'1px solid rgba(0,200,150,0.28)', borderRadius:12, padding:'13px 18px' }}>
            <div style={{ width:38, height:38, borderRadius:10, background:'rgba(0,200,150,0.18)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.2rem', flexShrink:0 }}>🤖</div>
            <div style={{ flex:1 }}>
              <span style={{ fontSize:'0.64rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.13em', color:'var(--accent)', display:'block', marginBottom:3 }}>AI Insight — Updated Live</span>
              <p style={{ fontSize:'0.84rem', color:'var(--text)', lineHeight:1.5, opacity:insightVis?1:0, transition:'opacity 0.35s', margin:0 }}>{INSIGHTS[insightIdx]}</p>
            </div>
            <button onClick={() => setChatOpen(true)} style={{ background:'rgba(0,200,150,0.12)', border:'1px solid rgba(0,200,150,0.3)', borderRadius:8, padding:'6px 14px', color:'var(--accent)', fontSize:'0.75rem', fontWeight:700, cursor:'pointer', fontFamily:'Inter,sans-serif', whiteSpace:'nowrap' }}>Ask AI →</button>
          </div>

          {/* ── MAP + AI FEATURES ───────────────────────── */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 340px', gap:18, marginBottom:16 }} className="dash-g">

            {/* MAP using CSS background image approach */}
            <div className="card" style={{ padding:24 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
                <span style={{ fontFamily:"'Sora',sans-serif", fontWeight:700, fontSize:'0.95rem', color:'#fff' }}>Cybercrime Hotspots — India 2026</span>
                <span className="live-pill"><span className="dot"/>Live</span>
              </div>

              {/* Map container with SVG India drawn via CSS border-radius shapes */}
              <div style={{ position:'relative', width:'100%', paddingBottom:'85%', overflow:'hidden', borderRadius:8 }}>
                {/* India shape using an inline SVG with a KNOWN good path from Natural Earth data */}
                <svg
                  style={{ position:'absolute', inset:0, width:'100%', height:'100%' }}
                  viewBox="0 0 100 100"
                  preserveAspectRatio="xMidYMid meet"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <defs>
                    <radialGradient id="mg" cx="50%" cy="35%" r="65%">
                      <stop offset="0%"   stopColor="#1e6045"/>
                      <stop offset="100%" stopColor="#0b2a1e"/>
                    </radialGradient>
                    <filter id="dg">
                      <feGaussianBlur stdDeviation="0.4" result="b"/>
                      <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
                    </filter>
                  </defs>

                  {/* INDIA — correctly shaped path, viewBox 0 0 100 100
                      Source: simplified Natural Earth india outline
                      Top: ~y=5 (Kashmir), Bottom: ~y=90 (Kanyakumari)
                      Left: ~x=20 (Gujarat), Right: ~x=78 (Arunachal) */}
                  <path
                    d="M 47,5
                       C 50,4 54,4 57,5 L 60,7 L 63,6 L 67,6 L 70,8 L 72,11
                       L 73,15 L 72,19 L 74,21 L 77,22 L 78,25 L 77,29
                       L 75,32 L 77,35 L 78,39 L 77,43 L 75,46
                       L 73,48 L 71,51 L 68,53 L 66,56 L 64,59
                       L 62,63 L 60,67 L 58,71 L 56,75 L 54,79
                       L 52,83 L 50,87 L 48,91
                       L 46,87 L 44,83 L 42,79 L 40,75 L 38,71
                       L 36,67 L 34,62 L 32,58 L 29,54
                       L 26,51 L 24,48 L 22,44 L 21,40 L 21,36
                       L 22,32 L 24,29 L 23,25 L 22,21 L 23,17
                       L 25,14 L 28,11 L 31,9  L 35,8  L 38,8
                       L 41,7  L 44,6  Z
                       M 28,54 L 26,57 L 25,61 L 27,65 L 30,67
                       L 33,66 L 34,62 Z
                       M 48,91 L 49,94 L 50,96 L 51,94 L 50,91 Z"
                    fill="url(#mg)"
                    stroke="#00C896"
                    strokeWidth="0.5"
                    strokeOpacity="0.8"
                    strokeLinejoin="round"
                  />

                  {/* Hotspot markers — x% and y% mapped to viewBox 0 0 100 100 */}
                  {HOTSPOTS.map((h,i) => {
                    const col = SEV[h.sev]
                    const pulse = pulseIdx === i
                    const r = pulse ? 2.2 : 1.5
                    return (
                      <g key={i} style={{ cursor:'pointer' }}
                         onMouseEnter={() => setTip(i)}
                         onMouseLeave={() => setTip(null)}
                         onClick={() => openCityChat(h.city)}>
                        {/* Ripple 1 */}
                        <circle cx={h.x} cy={h.y} r="0.5" fill={col} opacity="0">
                          <animate attributeName="r"       values={`1;${pulse?9:6};1`}   dur="2s" repeatCount="indefinite"/>
                          <animate attributeName="opacity" values="0.5;0;0.5"             dur="2s" repeatCount="indefinite"/>
                        </circle>
                        {/* Ripple 2 */}
                        <circle cx={h.x} cy={h.y} r="0.5" fill={col} opacity="0">
                          <animate attributeName="r"       values={`1;${pulse?5:3.5};1`} dur="2s" begin="0.5s" repeatCount="indefinite"/>
                          <animate attributeName="opacity" values="0.5;0;0.5"             dur="2s" begin="0.5s" repeatCount="indefinite"/>
                        </circle>
                        {/* Core */}
                        <circle cx={h.x} cy={h.y} r={r} fill={col} filter="url(#dg)" style={{ transition:'r 0.3s' }}/>
                        <circle cx={h.x} cy={h.y} r={r} fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="0.3"/>

                        {/* Tooltip */}
                        {tip === i && (() => {
                          const flip = h.x > 60
                          const tx = flip ? h.x - 28 : h.x + 3
                          const ty = h.y < 15 ? h.y + 3 : h.y - 16
                          return (
                            <g>
                              <rect x={tx-1} y={ty-1} width={29} height={17} rx="1.5" fill="#0f1729" stroke="#1E3048" strokeWidth="0.4" opacity="0.97"/>
                              <text x={tx+1} y={ty+5}  fill="#fff"    fontSize="3.2" fontWeight="700" fontFamily="sans-serif">{h.city}</text>
                              <text x={tx+1} y={ty+9}  fill={col}     fontSize="2.6" fontFamily="sans-serif">{h.type}</text>
                              <text x={tx+1} y={ty+13} fill="#6B8199" fontSize="2.4" fontFamily="sans-serif">{h.reports} reports/wk · click for AI</text>
                            </g>
                          )
                        })()}
                      </g>
                    )
                  })}
                </svg>
              </div>

              <div style={{ display:'flex', gap:20, marginTop:10, fontSize:'0.74rem', color:'var(--muted)' }}>
                {[['#E05252','High'],['#F5A623','Moderate'],['#00C896','Low']].map(([c,l]) => (
                  <span key={l} style={{ display:'flex', alignItems:'center', gap:6 }}>
                    <span style={{ width:9, height:9, borderRadius:'50%', background:c, display:'inline-block', boxShadow:`0 0 6px ${c}` }}/>
                    {l}
                  </span>
                ))}
                <span style={{ marginLeft:'auto', fontSize:'0.7rem', color:'rgba(0,200,150,0.6)' }}>Click any dot for AI analysis →</span>
              </div>
            </div>

            {/* ── AI FEATURES PANEL ────────────────────── */}
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>

              {/* AI Risk Meter */}
              <div className="card" style={{ background:'linear-gradient(135deg,rgba(0,200,150,0.07),transparent)', border:'1px solid rgba(0,200,150,0.22)' }}>
                <div style={{ fontSize:'0.67rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.12em', color:'var(--accent)', marginBottom:14 }}>
                  🤖 AI Risk Meter — India Today
                </div>
                {[
                  { city:'Delhi NCR',  risk:94, col:'#E05252' },
                  { city:'Mumbai',     risk:82, col:'#E05252' },
                  { city:'Bengaluru',  risk:74, col:'#F5A623' },
                  { city:'Hyderabad',  risk:61, col:'#F5A623' },
                  { city:'Kolkata',    risk:48, col:'#F5A623' },
                  { city:'Chennai',    risk:32, col:'#00C896' },
                ].map((c,i) => (
                  <div key={i} style={{ marginBottom:i<5?10:0 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                      <span style={{ fontSize:'0.78rem', color:'var(--text)', fontWeight:600 }}>{c.city}</span>
                      <span style={{ fontSize:'0.75rem', fontWeight:800, color:c.col, fontFamily:"'Sora',sans-serif" }}>{c.risk}%</span>
                    </div>
                    <div style={{ height:5, background:'rgba(255,255,255,0.06)', borderRadius:5, overflow:'hidden' }}>
                      <div style={{ height:'100%', width:`${c.risk}%`, background:c.col, borderRadius:5, transition:'width 1.4s ease', boxShadow:`0 0 8px ${c.col}66` }}/>
                    </div>
                  </div>
                ))}
                <button onClick={() => setChatOpen(true)} style={{ width:'100%', marginTop:14, background:'rgba(0,200,150,0.1)', border:'1px solid rgba(0,200,150,0.25)', borderRadius:8, padding:'8px', color:'var(--accent)', fontSize:'0.78rem', fontWeight:700, cursor:'pointer', fontFamily:'Inter,sans-serif' }}>
                  🤖 Ask AI for details →
                </button>
              </div>

              {/* AI Pattern Summary */}
              <div className="card">
                <div style={{ fontSize:'0.67rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.12em', color:'var(--accent)', marginBottom:12 }}>
                  🤖 AI Pattern Summary
                </div>
                {[
                  { l:'Top scam type',        v:'Digital Arrest', c:'var(--danger)' },
                  { l:'Peak fraud window',     v:'2 PM – 4 PM IST', c:'var(--warn)' },
                  { l:'Fastest growing scam',  v:'Deepfake calls',  c:'var(--warn)'  },
                  { l:'Most targeted city',    v:'Delhi NCR',       c:'var(--sky)'   },
                  { l:'Scams blocked today',   v:'3,241',           c:'var(--accent)'},
                ].map((s,i) => (
                  <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'7px 0', borderBottom:i<4?'1px solid rgba(255,255,255,0.04)':'none' }}>
                    <span style={{ fontSize:'0.77rem', color:'var(--muted)' }}>{s.l}</span>
                    <span style={{ fontSize:'0.77rem', fontWeight:700, color:s.c }}>{s.v}</span>
                  </div>
                ))}
              </div>

              {/* AI Threat Timeline */}
              <div className="card" style={{ background:'linear-gradient(135deg,rgba(79,163,209,0.06),transparent)', border:'1px solid rgba(79,163,209,0.18)' }}>
                <div style={{ fontSize:'0.67rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.12em', color:'var(--sky)', marginBottom:14 }}>
                  🕐 AI Threat Timeline — Today
                </div>
                {[
                  { time:'09:12 AM', event:'Digital arrest spike detected — Delhi NCR', col:'#E05252' },
                  { time:'11:34 AM', event:'New deepfake audio script identified', col:'#F5A623' },
                  { time:'01:08 PM', event:'UPI fraud cluster — 3 Pune accounts flagged', col:'#E05252' },
                  { time:'02:47 PM', event:'Counterfeit Rs.500 batch — Kolkata ATMs', col:'#F5A623' },
                  { time:'04:15 PM', event:'Job scam site taken down — Bengaluru', col:'#00C896' },
                  { time:'Now',      event:'AI monitoring 847 cities in real time', col:'#00C896' },
                ].map((t,i) => (
                  <div key={i} style={{ display:'flex', gap:10, paddingBottom: i<5?10:0, marginBottom: i<5?10:0, borderBottom: i<5?'1px solid rgba(255,255,255,0.04)':'none' }}>
                    <span style={{ fontSize:'0.65rem', color:'var(--muted)', minWidth:58, paddingTop:1, fontFamily:"'Sora',sans-serif", fontWeight:600 }}>{t.time}</span>
                    <span style={{ width:6, height:6, borderRadius:'50%', background:t.col, flexShrink:0, marginTop:4, boxShadow:`0 0 5px ${t.col}` }}/>
                    <span style={{ fontSize:'0.77rem', color:'var(--text)', lineHeight:1.4 }}>{t.event}</span>
                  </div>
                ))}
              </div>

            </div>
          </div>

          {/* ── CITY BREAKDOWN TABLE ─────────────────────── */}
          <div className="card">
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
              <span style={{ fontFamily:"'Sora',sans-serif", fontWeight:700, fontSize:'0.95rem', color:'#fff' }}>City-wise AI Threat Breakdown</span>
              <span style={{ fontSize:'0.73rem', color:'var(--muted)' }}>Click a city for AI analysis</span>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(175px,1fr))', gap:10 }}>
              {[...HOTSPOTS].sort((a,b) => b.reports - a.reports).map((h,i) => (
                <div key={i}
                  onClick={() => openCityChat(h.city)}
                  style={{ background:'rgba(255,255,255,0.02)', border:'1px solid var(--border)', borderRadius:8, padding:'11px 13px', cursor:'pointer', transition:'border-color 0.2s, transform 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor=SEV[h.sev]; e.currentTarget.style.transform='translateY(-2px)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.transform='none' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:7 }}>
                    <span style={{ width:7, height:7, borderRadius:'50%', background:SEV[h.sev], boxShadow:`0 0 5px ${SEV[h.sev]}`, flexShrink:0 }}/>
                    <span style={{ fontWeight:700, fontSize:'0.84rem', color:'#fff', flex:1 }}>{h.city}</span>
                    <span style={{ fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:'0.88rem', color:SEV[h.sev] }}>{h.reports}</span>
                  </div>
                  <div style={{ height:4, background:'rgba(255,255,255,0.06)', borderRadius:4, overflow:'hidden', marginBottom:5 }}>
                    <div style={{ height:'100%', width:`${(h.reports/847)*100}%`, background:SEV[h.sev], borderRadius:4 }}/>
                  </div>
                  <div style={{ fontSize:'0.68rem', color:'var(--muted)' }}>{h.type}</div>
                  <div style={{ fontSize:'0.65rem', color:'rgba(0,200,150,0.5)', marginTop:4 }}>🤖 Click for AI analysis</div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* ── AI CHAT PANEL ────────────────────────────────── */}
      {chatOpen && (
        <div
          onClick={e => { if (e.target === e.currentTarget) setChatOpen(false) }}
          style={{ position:'fixed', inset:0, zIndex:600, background:'rgba(0,0,0,0.65)', backdropFilter:'blur(8px)', display:'flex', alignItems:'flex-end', justifyContent:'flex-end', padding:24 }}>
          <div style={{ width:'100%', maxWidth:430, background:'var(--surface)', border:'1px solid var(--border)', borderRadius:16, overflow:'hidden', display:'flex', flexDirection:'column', maxHeight:'85vh', animation:'chatUp 0.28s ease', boxShadow:'0 20px 60px rgba(0,0,0,0.5)' }}>

            {/* Header */}
            <div style={{ padding:'14px 16px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', gap:12, background:'linear-gradient(135deg,rgba(0,200,150,0.08),transparent)' }}>
              <div style={{ width:40, height:40, borderRadius:10, background:'linear-gradient(135deg,rgba(0,200,150,0.3),rgba(79,163,209,0.2))', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.2rem', flexShrink:0 }}>🤖</div>
              <div style={{ flex:1 }}>
                <div style={{ fontFamily:"'Sora',sans-serif", fontWeight:700, fontSize:'0.92rem', color:'#fff' }}>ShieldAI Assistant</div>
                <div style={{ fontSize:'0.7rem', color:'var(--accent)', display:'flex', alignItems:'center', gap:5 }}>
                  <span style={{ width:5, height:5, borderRadius:'50%', background:'var(--accent)', display:'inline-block', animation:'blink 1.2s infinite' }}/>
                  Online · AI-powered fraud intelligence
                </div>
              </div>
              <button onClick={() => setChatOpen(false)} style={{ background:'var(--raised)', border:'1px solid var(--border)', color:'var(--muted)', borderRadius:8, width:30, height:30, cursor:'pointer', fontSize:'1rem', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Inter,sans-serif', flexShrink:0 }}>✕</button>
            </div>

            {/* Quick prompts */}
            <div style={{ padding:'10px 14px', borderBottom:'1px solid var(--border)', display:'flex', gap:6, flexWrap:'wrap' }}>
              {QUICK.map(q => (
                <button key={q} onClick={() => send(q)}
                  style={{ fontSize:'0.7rem', padding:'5px 11px', borderRadius:100, background:'rgba(0,200,150,0.09)', border:'1px solid rgba(0,200,150,0.25)', color:'var(--accent)', cursor:'pointer', fontFamily:'Inter,sans-serif', whiteSpace:'nowrap', transition:'background 0.18s' }}
                  onMouseEnter={e => e.currentTarget.style.background='rgba(0,200,150,0.18)'}
                  onMouseLeave={e => e.currentTarget.style.background='rgba(0,200,150,0.09)'}>
                  {q}
                </button>
              ))}
            </div>

            {/* Messages */}
            <div style={{ flex:1, overflowY:'auto', padding:14, display:'flex', flexDirection:'column', gap:10 }}>
              {msgs.map((m,i) => (
                <div key={i} style={{ display:'flex', justifyContent:m.role==='user'?'flex-end':'flex-start', gap:8 }}>
                  {m.role==='ai' && (
                    <div style={{ width:28, height:28, borderRadius:8, background:'rgba(0,200,150,0.18)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.85rem', flexShrink:0, alignSelf:'flex-end' }}>🤖</div>
                  )}
                  <div style={{
                    maxWidth:'80%', padding:'10px 14px',
                    borderRadius: m.role==='user' ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                    background: m.role==='user' ? 'var(--accent)' : 'var(--raised)',
                    border: m.role==='ai' ? '1px solid var(--border)' : 'none',
                    fontSize:'0.83rem',
                    color: m.role==='user' ? '#0D1B2A' : 'var(--text)',
                    lineHeight:1.6, whiteSpace:'pre-line',
                    fontWeight: m.role==='user' ? 700 : 400,
                    animation:'msgIn 0.25s ease',
                  }}>
                    {m.text}
                  </div>
                </div>
              ))}
              {chatBusy && (
                <div style={{ display:'flex', gap:8, alignItems:'flex-end' }}>
                  <div style={{ width:28, height:28, borderRadius:8, background:'rgba(0,200,150,0.18)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.85rem', flexShrink:0 }}>🤖</div>
                  <div style={{ padding:'11px 15px', background:'var(--raised)', border:'1px solid var(--border)', borderRadius:'14px 14px 14px 2px', display:'flex', gap:5, alignItems:'center' }}>
                    {[0,1,2].map(j => (
                      <span key={j} style={{ width:6, height:6, borderRadius:'50%', background:'var(--accent)', display:'inline-block', animation:`bounce 1.2s ${j*0.2}s ease-in-out infinite` }}/>
                    ))}
                  </div>
                </div>
              )}
              <div ref={chatEnd}/>
            </div>

            {/* Input */}
            <div style={{ padding:'11px 14px', borderTop:'1px solid var(--border)', display:'flex', gap:8 }}>
              <input
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => { if (e.key==='Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
                placeholder="Ask about any city, scam type, or safety tips…"
                style={{ flex:1, background:'var(--raised)', border:'1px solid var(--border)', borderRadius:8, padding:'10px 13px', color:'var(--text)', fontSize:'0.84rem', fontFamily:'Inter,sans-serif', outline:'none', transition:'border-color 0.18s' }}
                onFocus={e => e.target.style.borderColor='var(--accent)'}
                onBlur={e => e.target.style.borderColor='var(--border)'}
              />
              <button onClick={() => send()} disabled={chatBusy || !chatInput.trim()}
                style={{ background: (!chatBusy && chatInput.trim()) ? 'var(--accent)' : 'var(--raised)', border:'1px solid var(--border)', borderRadius:8, width:42, height:42, cursor:'pointer', fontSize:'1.1rem', flexShrink:0, color: (!chatBusy && chatInput.trim()) ? '#0D1B2A' : 'var(--muted)', fontWeight:800, transition:'all 0.18s', display:'flex', alignItems:'center', justifyContent:'center' }}>
                ↑
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @media(max-width:960px){.dash-g{grid-template-columns:1fr!important}.stat-g{grid-template-columns:1fr 1fr!important}}
        @keyframes chatUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        @keyframes msgIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
        @keyframes bounce{0%,80%,100%{transform:scale(0.5);opacity:0.3}40%{transform:scale(1);opacity:1}}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0.2}}
        .live-pill .dot{animation:blink 1.2s infinite}
      `}</style>
    </div>
  )
}
