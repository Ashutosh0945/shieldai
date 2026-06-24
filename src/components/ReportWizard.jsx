import { useState } from 'react'
import toast from 'react-hot-toast'
import { submitFraudReport } from '../lib/db'
import { useAuth } from '../context/AuthContext'
import { CheckCircle } from 'lucide-react'

const TYPES = [
  'Digital arrest scam (fake CBI/ED/Police)',
  'UPI / bank transfer fraud',
  'Online shopping fraud',
  'Investment / trading scam',
  'Job offer scam',
  'Counterfeit currency received',
  'Loan app harassment',
  'Social media impersonation',
  'OTP / SIM swap fraud',
  'Other',
]

export default function ReportWizard({ onDone }) {
  const { user } = useAuth()
  const [step, setStep]         = useState(1)
  const [fraudType, setType]    = useState('')
  const [desc, setDesc]         = useState('')
  const [phone, setPhone]       = useState('')
  const [city, setCity]         = useState('')
  const [loading, setLoading]   = useState(false)
  const [done, setDone]         = useState(false)
  const [reportId, setReportId] = useState(null)

  const StepBar = () => (
    <div style={{ display:'flex', gap:6, marginBottom:20 }}>
      {[1,2,3].map(n => (
        <div key={n} style={{ flex:1, height:4, borderRadius:4, background: step >= n ? 'var(--accent)' : 'var(--border)', transition:'background 0.3s' }} />
      ))}
    </div>
  )

  async function submit() {
    if (!fraudType) { toast.error('Please select a fraud type'); return }
    if (!desc.trim()) { toast.error('Please describe what happened'); return }
    setLoading(true)
    try {
      const data = await submitFraudReport({ fraudType, description: desc, phone, city, userId: user?.id })
      setReportId(data.id)
      setDone(true)
      toast.success('Report saved successfully!')
      if (onDone) onDone()
    } catch (err) {
      toast.error('Could not save report. Copy and file on NCRP manually.')
    }
    setLoading(false)
  }

  function copyComplaint() {
    const t = `CYBER FRAUD COMPLAINT\nType: ${fraudType}\nCity: ${city || 'Not specified'}\nDetails: ${desc}\nPhone: ${phone || 'Not provided'}\nDate: ${new Date().toLocaleDateString('en-IN')}\n\nGenerated via ShieldAI — shieldai.in`
    navigator.clipboard.writeText(t)
    toast.success('Complaint copied! Paste it on cybercrime.gov.in')
  }

  if (done) return (
    <div style={{ textAlign:'center', padding:'20px 0' }}>
      <CheckCircle size={48} color="var(--accent)" style={{ marginBottom:12 }} />
      <h3 style={{ fontFamily:"'Sora',sans-serif", color:'var(--accent)', marginBottom:8 }}>Report Saved!</h3>
      <p style={{ color:'var(--muted)', fontSize:'0.875rem', marginBottom:4 }}>Reference ID: <code style={{ color:'var(--text)', background:'var(--raised)', padding:'2px 8px', borderRadius:4 }}>{reportId?.substring(0,8)?.toUpperCase()}</code></p>
      <p style={{ color:'var(--muted)', fontSize:'0.85rem', marginBottom:20 }}>Now file it officially on India's cyber crime portal.</p>
      <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
        <a href="https://cybercrime.gov.in" target="_blank" rel="noopener" className="btn btn-primary btn-full">File on cybercrime.gov.in →</a>
        <button className="btn btn-ghost btn-full" onClick={copyComplaint}>📋 Copy complaint text</button>
      </div>
    </div>
  )

  return (
    <div>
      <StepBar />

      {step === 1 && (
        <div className="anim-fade-up">
          <p style={{ fontSize:'0.85rem', color:'var(--muted)', marginBottom:14 }}>What type of fraud happened to you?</p>
          <select className="select" value={fraudType} onChange={e => setType(e.target.value)} style={{ marginBottom:12 }}>
            <option value="">Select fraud type</option>
            {TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
          <input className="input" value={city} onChange={e => setCity(e.target.value)} placeholder="Your city (e.g. Mumbai)" style={{ marginBottom:12 }} />
          <button className="btn btn-primary btn-full" onClick={() => { if (!fraudType) { toast.error('Select a fraud type'); return } setStep(2) }}>Next →</button>
        </div>
      )}

      {step === 2 && (
        <div className="anim-fade-up">
          <p style={{ fontSize:'0.85rem', color:'var(--muted)', marginBottom:14 }}>Tell us what happened</p>
          <textarea className="textarea" rows={4} value={desc} onChange={e => setDesc(e.target.value)}
            placeholder="Describe what happened — caller name, amount lost, when it happened, how you were contacted…" style={{ marginBottom:10 }} />
          <input className="input" type="tel" value={phone} onChange={e => setPhone(e.target.value)}
            placeholder="Your mobile number (optional, for follow-up)" style={{ marginBottom:12 }} />
          <div style={{ display:'flex', gap:10 }}>
            <button className="btn btn-ghost" onClick={() => setStep(1)}>← Back</button>
            <button className="btn btn-primary" style={{ flex:1 }} onClick={() => { if (!desc.trim()) { toast.error('Please describe what happened'); return } setStep(3) }}>Review →</button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="anim-fade-up">
          <p style={{ fontSize:'0.85rem', color:'var(--muted)', marginBottom:14 }}>Review your complaint before submitting</p>
          <div style={{ background:'rgba(255,255,255,0.02)', border:'1px solid var(--border)', borderRadius:8, padding:14, marginBottom:14, fontSize:'0.82rem', color:'var(--muted)' }}>
            <p><strong style={{ color:'var(--text)' }}>Type:</strong> {fraudType}</p>
            <p style={{ marginTop:6 }}><strong style={{ color:'var(--text)' }}>City:</strong> {city || 'Not specified'}</p>
            <p style={{ marginTop:6 }}><strong style={{ color:'var(--text)' }}>Details:</strong> {desc.substring(0, 150)}{desc.length > 150 ? '…' : ''}</p>
          </div>
          {!user && <p style={{ fontSize:'0.78rem', color:'var(--warn)', marginBottom:12, background:'rgba(245,166,35,0.08)', border:'1px solid rgba(245,166,35,0.2)', borderRadius:6, padding:'8px 12px' }}>💡 <strong>Tip:</strong> Sign in to save your report history and track its status.</p>}
          <button className="btn btn-primary btn-full" style={{ marginBottom:10 }} onClick={submit} disabled={loading}>
            {loading ? <><span className="spinner" />Saving…</> : '🚨 Submit Report →'}
          </button>
          <button className="btn btn-ghost btn-full" onClick={() => setStep(2)}>← Edit</button>
        </div>
      )}
    </div>
  )
}
