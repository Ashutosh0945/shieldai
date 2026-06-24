import { useState } from 'react'
import toast from 'react-hot-toast'
import { analyseScamCall } from '../lib/analysis'
import { logScamCheck } from '../lib/db'
import { useAuth } from '../context/AuthContext'

const SEV = { danger:'var(--danger)', warn:'var(--warn)', safe:'var(--accent)' }

export default function ScamChecker() {
  const { user } = useAuth()
  const [text, setText]     = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  async function handleCheck() {
    if (!text.trim()) { toast.error('Please describe what the caller said.'); return }
    setLoading(true)
    const r = analyseScamCall(text)
    setResult(r)
    logScamCheck({ inputText: text, riskScore: r.score, verdict: r.sev, userId: user?.id }).catch(() => {})
    setLoading(false)
  }

  return (
    <div>
      <textarea className="textarea" value={text} onChange={e => setText(e.target.value)} rows={4}
        placeholder="Type or paste what the caller said — e.g. 'A CBI officer said my Aadhaar is linked to money laundering and I must transfer money to avoid arrest…'" />
      <button className="btn btn-primary btn-full" onClick={handleCheck} disabled={loading} style={{ marginTop:4 }}>
        {loading ? <><span className="spinner"/>Analysing…</> : 'Check for Scam →'}
      </button>

      {result && (
        <div className="anim-fade-up" style={{ marginTop:16, background:'var(--raised)', border:'1px solid var(--border)', borderRadius:10, padding:16 }}>
          <p style={{ fontWeight:700, color:SEV[result.sev], marginBottom:4, lineHeight:1.4 }}>{result.verdict}</p>
          <div className="result-bar-wrap">
            <div className="result-bar" style={{ width:`${result.score}%`, background:SEV[result.sev] }} />
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
            {result.signals.map((s, i) => (
              <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:8, fontSize:'0.8rem' }}>
                <span style={{ width:7, height:7, borderRadius:'50%', background:SEV[s.sev], flexShrink:0, marginTop:4 }} />
                <span style={{ color:SEV[s.sev] }}>{s.label}</span>
              </div>
            ))}
          </div>
          <p style={{ fontSize:'0.76rem', color:'var(--muted)', marginTop:12 }}>
            If you suspect fraud, call <strong style={{ color:'var(--accent)' }}>1930</strong> — the national cyber crime helpline.
          </p>
        </div>
      )}
    </div>
  )
}
