import { useEffect } from 'react'
import { X } from 'lucide-react'

export default function Modal({ open, onClose, title, hindiLabel, children, maxWidth = 500 }) {
  useEffect(() => {
    if (!open) return
    document.body.style.overflow = 'hidden'
    const fn = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', fn)
    return () => { window.removeEventListener('keydown', fn); document.body.style.overflow = '' }
  }, [open, onClose])

  if (!open) return null

  return (
    <div onClick={e => { if (e.target === e.currentTarget) onClose() }}
      style={{ position:'fixed', inset:0, zIndex:500, background:'rgba(0,0,0,0.72)', backdropFilter:'blur(6px)', display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
      <div className="anim-fade-up" style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:16, padding:32, maxWidth, width:'100%', position:'relative', maxHeight:'90vh', overflowY:'auto' }}>
        <button onClick={onClose} style={{ position:'absolute', top:14, right:14, background:'var(--raised)', border:'1px solid var(--border)', color:'var(--muted)', borderRadius:8, width:30, height:30, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
          <X size={14} />
        </button>
        <h2 style={{ fontFamily:"'Sora',sans-serif", fontSize:'1.15rem', fontWeight:700, color:'#fff', marginBottom: hindiLabel ? 4 : 18 }}>{title}</h2>
        {hindiLabel && <span style={{ display:'block', fontSize:'0.78rem', color:'var(--accent)', marginBottom:18 }}>{hindiLabel}</span>}
        {children}
      </div>
    </div>
  )
}
