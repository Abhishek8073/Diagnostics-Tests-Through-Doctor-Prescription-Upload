import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { uploadPrescription } from '../services/orderApi'
import { getProfile } from '../services/authApi'

const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'application/pdf']

export default function UploadPage() {
  const navigate = useNavigate()
  const inputRef = useRef(null)
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [uploaded, setUploaded] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [patientId, setPatientId] = useState(null)

  useEffect(() => {
    getProfile()
      .then((response) => setPatientId(response.data.userId))
      .catch((err) => setError(err.message))
  }, [])

  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview)
      }
    }
  }, [preview])

  const handleFile = (selectedFile) => {
    if (!selectedFile) return

    if (!ACCEPTED_TYPES.includes(selectedFile.type)) {
      setError('Please upload a PNG, JPG, or PDF file.')
      return
    }

    setError('')
    setFile(selectedFile)

    if (selectedFile.type.startsWith('image/')) {
      setPreview(URL.createObjectURL(selectedFile))
    } else {
      setPreview(null)
    }
  }

  const handleDrop = (event) => {
    event.preventDefault()
    if (event.dataTransfer.files?.[0]) {
      handleFile(event.dataTransfer.files[0])
    }
  }

  const resetForm = () => {
    setFile(null)
    setPreview(null)
    setUploaded(null)
    setMessage('')
    setError('')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!file) {
      setError('Please select a prescription file first.')
      return
    }

    if (!patientId) {
      setError('Unable to determine your patient profile. Please refresh and try again.')
      return
    }

    const formData = new FormData()
    formData.append('patientId', patientId)
    formData.append('file', file)

    try {
      setUploading(true)
      setError('')
      setMessage('')

      const response = await uploadPrescription(formData)
      const payload = response.data
      setUploaded(payload)
      setMessage(`Prescription uploaded successfully.`)
      setFile(null)
    } catch (err) {
      setError(err.message || 'Prescription upload failed.')
    } finally {
      setUploading(false)
    }
  }

  const continueToLabs = () => {
    const prescriptionId = uploaded?.prescriptionId || uploaded?.id
    navigate('/labs', {
      state: {
        prescriptionId,
      },
    })
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-8 rounded-3xl bg-white p-6 shadow-soft">
        <div className="text-xs uppercase tracking-[0.24em] text-sky-600 font-semibold">Step 1 of 2</div>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">Upload your prescription</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Drop a clear photo or PDF of your doctor&apos;s prescription and continue to choose the lab for your order.
        </p>
      </div>

      <div className="rounded-3xl bg-white p-6 shadow-soft">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div
            onClick={() => inputRef.current?.click()}
            onDragOver={(event) => event.preventDefault()}
            onDrop={handleDrop}
            className="cursor-pointer rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-5 py-14 text-center transition hover:border-slate-300 hover:bg-slate-100"
          >
            {preview ? (
              <div className="mx-auto max-w-lg">
                <img src={preview} alt="prescription preview" className="mx-auto rounded-2xl border border-slate-200" />
                <p className="mt-4 text-sm text-slate-500">Ready to upload: {file?.name}</p>
              </div>
            ) : file ? (
              <div className="text-sm text-slate-700">Ready to upload: {file.name}</div>
            ) : (
              <div className="space-y-3 text-slate-600">
                <div className="text-xl font-semibold">Drag & drop prescription here</div>
                <div className="text-sm">or click to browse PNG, JPG, or PDF</div>
                <div className="text-xs text-slate-500">Maximum 10 MB</div>
              </div>
            )}
            <input
              ref={inputRef}
              type="file"
              accept="image/png,image/jpeg,application/pdf"
              onChange={(event) => handleFile(event.target.files?.[0] || null)}
              className="sr-only"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
            <button
              type="submit"
              disabled={uploading}
              className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {uploading ? 'Uploading...' : 'Upload prescription'}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300"
            >
              Reset
            </button>
          </div>

          {message ? <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</div> : null}
          {error ? <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}
        </form>

        {uploaded ? (
          <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-slate-900">Prescription ready</p>
                <p className="mt-1 text-sm text-slate-600">Continue to choose a lab and complete your order.</p>
              </div>
              <button
                onClick={continueToLabs}
                className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Continue to labs
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
