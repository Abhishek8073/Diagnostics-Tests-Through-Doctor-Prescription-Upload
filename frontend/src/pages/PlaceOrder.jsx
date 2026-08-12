import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { createOrder, uploadPrescription } from '../services/orderApi'
import { getProfile } from '../services/authApi'

const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'application/pdf']
const COLLECTION_OPTIONS = [
  { value: 'HOME', label: 'Home Pickup' },
  { value: 'LAB_VISIT', label: 'Lab Visit' }
]

function getCurrentBookingValues() {
  const now = new Date()
  const bookingDate = now.toISOString().split('T')[0]
  const bookingTime = now.toTimeString().slice(0, 5)
  const bookingDateTime = now.toLocaleString('en-GB')
  return { bookingDate, bookingTime, bookingDateTime }
}

export default function PlaceOrderPage() {
  const location = useLocation()
  const { labId: initialLabId, labName: initialLabName, prescriptionId: initialPrescriptionId } = location.state || {}
  const nowValues = getCurrentBookingValues()
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [uploadingPrescription, setUploadingPrescription] = useState(false)
  const [uploadMessage, setUploadMessage] = useState('')
  const [uploadError, setUploadError] = useState('')
  const [form, setForm] = useState({
    patientId: '',
    labId: initialLabId || '',
    labName: initialLabName || '',
    prescriptionId: initialPrescriptionId || '',
    address: '',
    bookingDate: nowValues.bookingDate,
    bookingTime: nowValues.bookingTime,
    bookingDateTime: nowValues.bookingDateTime,
    collectionType: 'HOME',
    totalAmount: ''
  })
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const fileInputRef = useRef(null)

  useEffect(() => {
    getProfile()
      .then((response) => {
        setForm((current) => ({ ...current, patientId: response.data.userId }))
      })
      .catch((err) => setError(err.message))
  }, [])

  useEffect(() => {
    setForm((current) => ({
      ...current,
      labId: initialLabId || current.labId,
      labName: initialLabName || current.labName,
      prescriptionId: initialPrescriptionId || current.prescriptionId
    }))
  }, [initialLabId, initialLabName, initialPrescriptionId])

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
      setUploadError('Please upload a PNG, JPG, or PDF file.')
      return
    }

    setUploadError('')
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

  const handleUploadPrescription = async (event) => {
    event.preventDefault()

    if (!file) {
      setUploadError('Please select a prescription file first.')
      return
    }

    const formData = new FormData()
    formData.append('patientId', form.patientId)
    formData.append('file', file)

    try {
      setUploadingPrescription(true)
      setUploadError('')
      setUploadMessage('')

      const response = await uploadPrescription(formData)
      const payload = response.data
      setForm((current) => ({
        ...current,
        prescriptionId: payload.prescriptionId || payload.id || current.prescriptionId
      }))
      setUploadMessage('Prescription uploaded successfully.')
      setFile(null)
      setPreview(null)
    } catch (err) {
      setUploadError(err?.response?.data?.message || err.message || 'Prescription upload failed.')
    } finally {
      setUploadingPrescription(false)
    }
  }

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setMessage('')

    if (!form.labId) {
      setError('Please select a lab before creating an order.')
      return
    }

    if (!form.prescriptionId) {
      setError('Please upload a prescription before creating an order.')
      return
    }

    if (!form.address) {
      setError('Please enter an address.')
      return
    }

    if (!form.patientId) {
      setError('Unable to determine your patient profile. Please refresh and try again.')
      return
    }

    setSubmitting(true)
    try {
      const payload = {
        patient: { userId: form.patientId },
        prescription: { prescriptionId: Number(form.prescriptionId) },
        laboratory: { labId: Number(form.labId) },
        collectionType: form.collectionType,
        address: form.address,
        bookingDate: form.bookingDate,
        bookingTime: form.bookingTime,
        totalAmount: Number(form.totalAmount) || 0
      }

      await createOrder(payload)
      setMessage('Order created successfully.')
      setForm((current) => ({ ...current, address: '', totalAmount: '' }))
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Unable to create order.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="rounded-3xl bg-white p-6 shadow-soft">
      <h2 className="text-2xl font-semibold">Place Order</h2>
      <p className="mb-6 text-slate-500">Upload your prescription here and then submit the order for the selected lab.</p>

      {uploadMessage ? <div className="mb-4 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{uploadMessage}</div> : null}
      {uploadError ? <div className="mb-4 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">{uploadError}</div> : null}
      {message ? <div className="mb-4 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</div> : null}
      {error ? <div className="mb-4 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}

      <div className="mb-8 rounded-3xl border border-slate-200 bg-slate-50 p-6">
        <h3 className="text-xl font-semibold">Upload prescription</h3>
        <p className="mt-2 text-sm text-slate-500">Upload a photo or PDF of your prescription before placing the order.</p>

        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(event) => event.preventDefault()}
          onDrop={handleDrop}
          className="mt-6 cursor-pointer rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center transition hover:border-slate-400"
        >
          {preview ? (
            <div className="mx-auto max-w-lg">
              <img src={preview} alt="Prescription preview" className="mx-auto h-auto w-full max-w-full rounded-2xl border border-slate-200" />
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
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,application/pdf"
            onChange={(event) => handleFile(event.target.files?.[0] || null)}
            className="sr-only"
          />
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={handleUploadPrescription}
            disabled={uploadingPrescription}
            className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {uploadingPrescription ? 'Uploading...' : 'Upload prescription'}
          </button>
          <button
            type="button"
            onClick={() => {
              setFile(null)
              setPreview(null)
              setUploadError('')
              setUploadMessage('')
            }}
            className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300"
          >
            Reset upload
          </button>
        </div>

      </div>

      <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
        <input
          name="labName"
          value={form.labName}
          readOnly
          className="rounded-xl border border-slate-200 bg-slate-100 px-4 py-3"
          placeholder="Selected lab"
        />
        <input
          name="address"
          value={form.address}
          onChange={handleChange}
          className="rounded-xl border border-slate-200 px-4 py-3"
          placeholder="Address"
        />
        <input
          name="bookingDateTime"
          value={form.bookingDateTime}
          readOnly
          className="rounded-xl border border-slate-200 bg-slate-100 px-4 py-3"
          placeholder="Booking Date & Time"
        />
        <select
          name="collectionType"
          value={form.collectionType}
          onChange={handleChange}
          className="rounded-xl border border-slate-200 px-4 py-3"
        >
          {COLLECTION_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <input
          name="totalAmount"
          value={form.totalAmount}
          onChange={handleChange}
          className="rounded-xl border border-slate-200 px-4 py-3"
          placeholder="Total Amount"
        />
        <button
          type="submit"
          disabled={submitting}
          className="rounded-xl bg-brand-600 px-4 py-3 font-semibold text-white md:col-span-2 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? 'Creating order…' : 'Create Order'}
        </button>
      </form>
    </div>
  )
}
