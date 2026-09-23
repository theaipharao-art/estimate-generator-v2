import { useState } from 'react'
import Head from 'next/head'

export default function Home() {
  const [tab, setTab] = useState('upload')
  const [images, setImages] = useState<any[]>([])
  const [form, setForm] = useState<any>(null)

  const handleUpload = async (e: any) => {
    const files = Array.from(e.target.files || [])
    for (const file of files) {
      const reader = new FileReader()
      reader.onload = async (evt) => {
        const base64 = (evt.target?.result as string).split(',')[1]
        const imgId = Date.now()
        setImages(p => [...p, { id: imgId, name: (file as any).name, loading: true, error: null }])

        try {
          const res = await fetch('/api/extract', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ imageBase64: base64, mimeType: (file as any).type }),
          })
          const data = await res.json()
          if (res.ok) {
            setImages(p => p.map(img => img.id === imgId ? { ...img, data, loading: false } : img))
          } else {
            setImages(p => p.map(img => img.id === imgId ? { ...img, error: data.error, loading: false } : img))
          }
        } catch (err) {
          setImages(p => p.map(img => img.id === imgId ? { ...img, error: 'Upload failed', loading: false } : img))
        }
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <>
      <Head>
        <title>Estimate Generator</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div style={{ maxWidth: 420, margin: '0 auto', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ background: 'var(--light)', padding: '1rem', textAlign: 'center', borderBottom: '1px solid var(--border)' }}>
          <h1 style={{ fontSize: 20, margin: 0 }}>⚡ Estimate Generator</h1>
          <p style={{ fontSize: 12, color: '#666', margin: '4px 0 0' }}>Arabic & English</p>
        </div>

        <div style={{ display: 'flex', gap: 8, padding: '1rem', background: 'var(--light)', borderBottom: '1px solid var(--border)' }}>
          {['upload', 'form', 'result'].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ flex: 1, padding: '8px', border: tab === t ? '2px solid var(--blue)' : '1px solid var(--border)', background: tab === t ? 'var(--blue)' : 'white', color: tab === t ? 'white' : 'black', borderRadius: 6, cursor: 'pointer', textTransform: 'capitalize' }}>
              {t}
            </button>
          ))}
        </div>

        <div style={{ flex: 1, padding: '1rem', overflowY: 'auto' }}>
          {tab === 'upload' && (
            <div>
              <div style={{ background: '#e3f2fd', padding: '12px', borderRadius: 8, marginBottom: '1rem', fontSize: 13 }}>
                Upload work order images. Data extracts automatically.
              </div>
              <div onClick={() => document.getElementById('fileInput')?.click()} style={{ border: '2px dashed var(--border)', padding: '2rem', textAlign: 'center', cursor: 'pointer', borderRadius: 8, marginBottom: '1.5rem' }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>📸</div>
                <div style={{ fontSize: 14, fontWeight: 500 }}>Tap to upload images</div>
                <div style={{ fontSize: 12, color: '#666' }}>Multiple supported</div>
              </div>
              <input id="fileInput" type="file" multiple accept="image/*" onChange={handleUpload} style={{ display: 'none' }} />

              {images.length > 0 && (
                <div>
                  <h3 style={{ fontSize: 14, fontWeight: 500, marginBottom: 12 }}>Uploaded ({images.length})</h3>
                  {images.map(img => (
                    <div key={img.id} style={{ background: 'var(--light)', padding: '12px', borderRadius: 8, marginBottom: 12 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 8 }}>{img.name}</div>
                      {img.loading && <div style={{ fontSize: 12, color: '#0066cc' }}>⏳ Processing...</div>}
                      {img.error && <div style={{ fontSize: 12, color: '#d32f2f' }}>❌ {img.error}</div>}
                      {img.data && (
                        <>
                          <div style={{ fontSize: 12, color: '#388e3c', marginBottom: 8 }}>✓ Ready</div>
                          <button className="button button-primary" onClick={() => { setForm(img.data); setTab('form') }}>
                            Create Estimate
                          </button>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === 'form' && form && (
            <div>
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 8 }}>Job #</div>
                <input value={form.jobNumber} onChange={e => setForm({...form, jobNumber: e.target.value})} />
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 8 }}>Location</div>
                <input value={form.location} onChange={e => setForm({...form, location: e.target.value})} />
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 8 }}>Service</div>
                <input value={form.serviceLine} onChange={e => setForm({...form, serviceLine: e.target.value})} />
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 8 }}>Scope</div>
                <textarea value={form.scope} onChange={e => setForm({...form, scope: e.target.value})} style={{ minHeight: 80 }} />
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 8 }}>Tech Rate ($/hr)</div>
                <input type="number" value={form.techRate} onChange={e => setForm({...form, techRate: Number(e.target.value)})} />
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 8 }}>Helper Rate ($/hr)</div>
                <input type="number" value={form.helperRate} onChange={e => setForm({...form, helperRate: Number(e.target.value)})} />
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 8 }}>Trip Charge ($)</div>
                <input type="number" value={form.tripCharge} onChange={e => setForm({...form, tripCharge: Number(e.target.value)})} />
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 8 }}>Material Cost ($)</div>
                <input type="number" value={form.materialCost || 0} onChange={e => setForm({...form, materialCost: Number(e.target.value)})} />
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 8 }}>Tech Hours</div>
                <input type="number" value={form.techHours || 0} onChange={e => setForm({...form, techHours: Number(e.target.value)})} step="0.5" />
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 8 }}>Helper Hours</div>
                <input type="number" value={form.helperHours || 0} onChange={e => setForm({...form, helperHours: Number(e.target.value)})} step="0.5" />
              </div>
              <button className="button button-primary" onClick={() => setTab('result')}>
                Calculate
              </button>
            </div>
          )}

          {tab === 'result' && form && (
            <div>
              <div style={{ background: 'var(--light)', padding: '12px', borderRadius: 8, marginBottom: '1rem' }}>
                <div style={{ fontSize: 12, color: '#666' }}>JOB</div>
                <div style={{ fontSize: 14, fontWeight: 500 }}>{form.jobNumber}</div>
              </div>
              <div style={{ background: '#e8f5e9', padding: '1rem', borderRadius: 8, marginBottom: '1rem' }}>
                <div style={{ fontSize: 12, color: '#1b5e20', marginBottom: 4 }}>TOTAL ESTIMATE</div>
                <div style={{ fontSize: 32, fontWeight: 500, color: '#2e7d32' }}>
                  ${((form.techHours || 0) * (form.techRate || 0) + (form.helperHours || 0) * (form.helperRate || 0) + (form.materialCost || 0) + (form.tripCharge || 0)).toFixed(2)}
                </div>
              </div>
              <div style={{ background: 'var(--light)', padding: '12px', borderRadius: 8, marginBottom: '1rem', fontSize: 12 }}>
                <div>Tech: {form.techHours}h × ${form.techRate} = ${((form.techHours || 0) * (form.techRate || 0)).toFixed(2)}</div>
                <div>Helper: {form.helperHours}h × ${form.helperRate} = ${((form.helperHours || 0) * (form.helperRate || 0)).toFixed(2)}</div>
                <div>Materials: ${(form.materialCost || 0).toFixed(2)}</div>
                <div>Trip: ${(form.tripCharge || 0).toFixed(2)}</div>
              </div>
              <button className="button button-primary" onClick={() => {
                const text = `ESTIMATE\nJob: ${form.jobNumber}\nLocation: ${form.location}\nScope: ${form.scope}\n\nTOTAL: $${((form.techHours || 0) * (form.techRate || 0) + (form.helperHours || 0) * (form.helperRate || 0) + (form.materialCost || 0) + (form.tripCharge || 0)).toFixed(2)}\n\nBreakdown:\nTech: ${form.techHours}h × $${form.techRate} = $${((form.techHours || 0) * (form.techRate || 0)).toFixed(2)}\nHelper: ${form.helperHours}h × $${form.helperRate} = $${((form.helperHours || 0) * (form.helperRate || 0)).toFixed(2)}\nMaterials: $${(form.materialCost || 0).toFixed(2)}\nTrip: $${(form.tripCharge || 0).toFixed(2)}`
                navigator.clipboard.writeText(text)
                alert('Copied!')
              }}>
                Copy Estimate
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
