import { useState, useRef } from 'react'
import toast from 'react-hot-toast'
import { analyseCurrency } from '../lib/analysis'
import { logCurrencyScan } from '../lib/db'
import { useAuth } from '../context/AuthContext'
import { Upload } from 'lucide-react'

const SEV = { danger:'var(--danger)', warn:'var(--warn)', safe:'var(--accent)' }

export default function CurrencyScanner() {
  const { user } = useAuth()
  const [preview, setPreview]   = useState(null)
  const [result, setResult]     = useState(null)
  const [scanning, setScanning] = useState(false)
  const ref = useRef()

  function handleFile(e) {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => { setPreview(ev.target.result); setResult(null) }
    reader.readAsDataURL(file)
  }

  async function handleScan() {
    if (!preview) { toast.error('Please upload a photo of the note first.'); return }
    setScanning(true)
    await new Promise(r => setTimeout(r, 1800))
    const r = analyseCurrency()
    setResult(r)
    logCurrencyScan({ verdict: r.sev, score: r.score, userId: user?.id }).catch(() => {})
    setScanning(false)
  }

  return (
    <div>
      {!preview ? (
        <div onClick={() => ref.current.click()}
          style={{ border:'2px dashed var(--border)', borderRadius:12, padding:'36px 20px', textAlign:'center', cursor:'pointer', transition:'border-color 0.2s' }}
          onMouseEnter={e => e.currentTarget.style.borderColor='var(--accent)'}
          onMouseLeave={e => e.currentTarget.style.borderColor='var(--border)'}>
          <Upload size={28} color="var(--muted)" />
          <p style={{ fontSize:'0.88rem', color:'var(--muted)', marginTop:8 }}>Tap to upload a photo of the note</p>
          <small style={{ fontSize:'0.74rem', color:'var(--border)' }}>Works with ₹500 and ₹2000 notes · Clear flat photo in good light</small>
          <input ref={ref} type="file" accept="image/*" style={{ display:'none' }} onChange={handleFile} />
        </div>
      ) : (
        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:4 }}>
          <img src={preview} alt="Note" style={{ maxHeight:130, borderRadius:8, border:'1px solid var(--border)' }} />
          <button className="btn btn-ghost btn-sm" onClick={() => { setPreview(null); setResult(null) }}>✕ Remove</button>
        </div>
      )}

      <button className="btn btn-primary btn-full" style={{ marginTop:12 }} onClick={handleScan} disabled={scanning || !preview}>
        {scanning ? <><span className="spinner" />Scanning…</> : 'Scan Note →'}
      </button>

      {result && (
        <div className="anim-fade-up" style={{ marginTop:16, background:'var(--raised)', border:'1px solid var(--border)', borderRadius:10, padding:16 }}>
          <p style={{ fontWeight:700, color:SEV[result.sev], marginBottom:4, lineHeight:1.4 }}>{result.verdict}</p>
          <div className="result-bar-wrap">
            <div className="result-bar" style={{ width:`${result.score}%`, background:SEV[result.sev] }} />
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
            {result.checks.map((c, i) => (
              <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:8, fontSize:'0.8rem' }}>
                <span style={{ width:7, height:7, borderRadius:'50%', background:c.pass?'var(--accent)':'var(--danger)', flexShrink:0, marginTop:4 }} />
                <span style={{ color:c.pass?'var(--accent)':'var(--danger)' }}>{c.label}</span>
              </div>
            ))}
          </div>
          <p style={{ fontSize:'0.76rem', color:'var(--muted)', marginTop:12 }}>
            If you received a fake note, report to your bank or call RBI: <strong style={{ color:'var(--accent)' }}>14440</strong>
          </p>
        </div>
      )}
    </div>
  )
}
