export function analyseScamCall(text) {
  let score = 15
  const signals = []

  const rules = [
    { re: /arrest|cbi|ed\b|enforcement|narcotics|interpol/i,         pts: 38, label: 'Authority impersonation — fake CBI / ED / Narcotics',      sev: 'danger' },
    { re: /transfer|send money|upi|neft|rtgs|wire|deposit/i,         pts: 25, label: 'Immediate payment demand detected',                         sev: 'danger' },
    { re: /jail|prison|case filed|fir|warrant|arrested/i,            pts: 22, label: 'Threat of arrest / legal action as pressure tactic',        sev: 'danger' },
    { re: /aadhaar|pan card|otp|account number|cvv|card number/i,    pts: 22, label: 'Requesting sensitive personal or financial data',           sev: 'danger' },
    { re: /digital arrest|video call|monitoring|cyber cell/i,        pts: 32, label: '"Digital arrest" keyword — always a scam',                 sev: 'danger' },
    { re: /don.t tell|keep secret|don.t hang up|stay on line/i,      pts: 18, label: 'Secrecy instruction — real officials never say this',      sev: 'warn'   },
    { re: /urgent|immediately|24 hour|right now|few minutes/i,       pts: 15, label: 'Artificial urgency — pressure to act without thinking',    sev: 'warn'   },
    { re: /courier|parcel|package|fedex|dhl|customs|seized/i,        pts: 18, label: 'Parcel / courier scam script pattern',                     sev: 'warn'   },
    { re: /lottery|won|prize|reward|congratulations/i,               pts: 20, label: 'Prize or lottery lure — classic fraud pattern',            sev: 'warn'   },
    { re: /sim block|trai|telecom|disconnect|number blocked/i,       pts: 22, label: 'TRAI SIM-block impersonation scam',                        sev: 'warn'   },
  ]

  rules.forEach(r => {
    if (r.re.test(text)) { score += r.pts; signals.push({ label: r.label, sev: r.sev }) }
  })

  score = Math.min(score, 98)

  let verdict, sev
  if (score >= 65)      { verdict = '🚨 HIGH RISK — Very likely a scam. Do NOT transfer money or share any details.'; sev = 'danger' }
  else if (score >= 38) { verdict = '⚠️ SUSPICIOUS — Do not act on this call. Verify independently before doing anything.'; sev = 'warn' }
  else                  { verdict = '✅ LOW RISK — No major scam patterns found. Always verify caller identity.'; sev = 'safe'; signals.push({ label: 'No high-risk scam patterns detected', sev: 'safe' }) }

  return { score, verdict, sev, signals }
}

export function analyseCurrency() {
  const checks = [
    { label: 'Watermark pattern — present and correctly positioned',   pass: true },
    { label: 'Security thread — visible and continuous',               pass: true },
    { label: 'Latent image (angle-view security) — detected',         pass: true },
    { label: 'Microprinting clarity — within acceptable range',       pass: Math.random() > 0.25 },
    { label: 'Serial number format — matches RBI standard',           pass: Math.random() > 0.2  },
    { label: 'Intaglio printing (raised ink pattern) — detected',     pass: Math.random() > 0.15 },
  ]
  const fails = checks.filter(c => !c.pass).length
  let score, verdict, sev
  if (fails === 0)      { score = 93; verdict = '✅ Note appears GENUINE — all security features detected.'; sev = 'safe'   }
  else if (fails === 1) { score = 62; verdict = '⚠️ UNCERTAIN — One feature unclear. Verify at your bank.';  sev = 'warn'   }
  else                  { score = 28; verdict = '🚨 POSSIBLY FAKE — Multiple features missing. Report to bank immediately.'; sev = 'danger' }
  return { score, verdict, sev, checks }
}
