import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FaArrowRight, FaBars, FaCheckCircle, FaHome, FaMapMarkerAlt, FaTimes } from 'react-icons/fa'
import diagnosticImage from '../image/ACCUHEALTH-800-X-502-diagnostic1.jpg'

const ink = '#101A24'
const porcelain = '#F5F7F8'
const teal = '#1B6E7A'
const tealDark = '#134F57'

const tubeColors = [
  { hex: '#8B7FC7', label: 'CBC', name: 'Hematology' },
  { hex: '#D9A441', label: 'BMP', name: 'Chemistry' },
  { hex: '#5B9BD5', label: 'PT/INR', name: 'Coagulation' },
  { hex: '#5FA777', label: 'Lipid', name: 'Metabolic' },
  { hex: '#C75C5C', label: 'IgG', name: 'Serology' }
]

const steps = [
  {
    n: '01',
    title: 'Choose your test',
    body: 'Search by name or symptom. Every listing shows the tube type, prep instructions, and turnaround time up front.'
  },
  {
    n: '02',
    title: 'Pick a slot & address',
    body: 'Book a home visit or walk into a partner lab. Phlebotomists are background-verified and NABL-trained.'
  },
  {
    n: '03',
    title: 'Sample is collected',
    body: 'Track your order from pickup to lab intake in real time, the same way you would track a courier.'
  },
  {
    n: '04',
    title: 'Report lands in your account',
    body: 'Digitally signed, downloadable, and shareable with your doctor the moment it clears QC.'
  }
]

const tests = [
  { color: '#8B7FC7', name: 'Complete Blood Count', tube: 'Lavender-top · EDTA', price: '₹349', tat: '6 hrs' },
  { color: '#D9A441', name: 'Basic Metabolic Panel', tube: 'Gold-top · SST', price: '₹499', tat: '12 hrs' },
  { color: '#5B9BD5', name: 'Coagulation (PT/INR)', tube: 'Sky-top · Citrate', price: '₹399', tat: '8 hrs' },
  { color: '#5FA777', name: 'Lipid Profile', tube: 'Sage-top · Heparin', price: '₹549', tat: '10 hrs' },
  { color: '#D9A441', name: 'Thyroid Panel (T3/T4/TSH)', tube: 'Gold-top · SST', price: '₹649', tat: '18 hrs' },
  { color: '#C75C5C', name: 'Vitamin D & B12', tube: 'Red-top · Serum', price: '₹899', tat: '24 hrs' }
]

const trustPoints = [
  { title: 'NABL-accredited labs only', body: 'Every partner lab on the platform is independently audited before it ever sees an order.' },
  { title: 'Verified phlebotomists', body: 'Background-checked, ID-badged, and rated after every home visit — you see who is coming.' },
  { title: 'Reports you can trust', body: 'Digitally signed PDFs with the reference range and flag markers a physician expects.' },
  { title: 'Live order tracking', body: 'From booking to report, every status change is logged and visible to you and your lab.' }
]

const testimonials = [
  {
    quote: 'The phlebotomist arrived within the booked window and my report was in my account before I finished dinner.',
    name: 'Ritu Sharma',
    role: 'Patient, Bengaluru'
  },
  {
    quote: 'We onboarded in a week. Order routing and report upload replaced three spreadsheets our front desk used to juggle.',
    name: 'Dr. Aniket Ghosh',
    role: 'Lab Director, Pune'
  },
  {
    quote: 'I could finally see turnaround time before booking instead of guessing. Made choosing between labs easy.',
    name: 'Farah Khan',
    role: 'Patient, Mumbai'
  }
]

const faqs = [
  {
    q: 'How is the sample collected?',
    a: 'Choose a home visit or a walk-in slot at a partner lab. Home visits are done by verified phlebotomists within a booked one-hour window.'
  },
  {
    q: 'How long until my report is ready?',
    a: 'Turnaround time is shown on every test listing before you book, typically between 6 and 24 hours depending on the panel.'
  },
  {
    q: 'Can my lab join the platform?',
    a: 'Yes. Labs register, get verified, and start receiving routed orders — see the "For Labs" section below.'
  },
  {
    q: 'Is my report shared with anyone else?',
    a: 'No. Reports are only visible to your account and anyone you explicitly share them with.'
  }
]

function TubeTray() {
  return (
    <div className="flex items-end justify-center gap-4 sm:gap-6">
      {tubeColors.map((tube, i) => (
        <div
          key={tube.label}
          className="animate-tube-settle flex flex-col items-center"
          style={{ animationDelay: `${i * 90}ms` }}
        >
          <div
            className="relative flex h-24 w-9 flex-col items-center overflow-hidden rounded-t-full rounded-b-md border border-black/5 shadow-lg sm:h-32 sm:w-11"
            style={{ background: 'linear-gradient(180deg, #ffffff 0%, #eef2f3 55%, #eef2f3 100%)' }}
          >
            <div className="h-6 w-full sm:h-8" style={{ background: tube.hex }} />
            <div
              className="absolute left-1 top-1 h-10 w-1.5 rounded-full bg-white/60 sm:h-14"
              aria-hidden="true"
            />
          </div>
          <p className="mt-3 font-mono text-[10px] uppercase tracking-wider text-slate-500 sm:text-xs">{tube.label}</p>
        </div>
      ))}
    </div>
  )
}

function FaqItem({ item, isOpen, onToggle }) {
  return (
    <div className="border-b border-slate-200 py-5">
      <button onClick={onToggle} className="flex w-full items-center justify-between text-left">
        <span className="font-medium text-slate-900">{item.q}</span>
        <span
          className="ml-4 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border border-slate-300 text-slate-500 transition-transform"
          style={{ transform: isOpen ? 'rotate(45deg)' : 'none' }}
        >
          +
        </span>
      </button>
      {isOpen ? <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600">{item.a}</p> : null}
    </div>
  )
}

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState(0)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [collectionMode, setCollectionMode] = useState('home')

  return (
    <div style={{ fontFamily: 'Inter, system-ui, sans-serif', color: ink, background: porcelain }}>
      {/* Nav */}
      <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-[#F5F7F8]/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
          <a href="/" className="flex items-center gap-2" aria-label="Diagnostic Care home">
            <span
              className="flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold text-white"
              style={{ background: teal, fontFamily: "'Space Grotesk', sans-serif" }}
            >
              +
            </span>
            <span className="text-lg font-semibold tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Diagnostic Care
            </span>
          </a>

          <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
            <a href="#how-it-works" className="hover:text-slate-900">How it works</a>
            {/* <a href="#tests" className="hover:text-slate-900">Tests</a>
            <a href="#for-labs" className="hover:text-slate-900">For labs</a> */}
            <a href="#faq" className="hover:text-slate-900">FAQ</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link to="/login" className="hidden text-sm font-medium text-slate-700 hover:text-slate-900 sm:block">
              Log in
            </Link>
            <Link
              to="/register"
              className="rounded-full px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
              style={{ background: teal }}
            >
              Get started
            </Link>
            <button onClick={() => setMobileMenuOpen((open) => !open)} className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-700 hover:bg-slate-200 md:hidden" aria-label="Toggle navigation" aria-expanded={mobileMenuOpen}>
              {mobileMenuOpen ? <FaTimes /> : <FaBars />}
            </button>
          </div>
        </div>
        {mobileMenuOpen ? (
          <nav className="border-t border-slate-200 bg-white px-5 py-4 md:hidden">
            <div className="mx-auto grid max-w-7xl gap-1 text-sm font-semibold text-slate-700">
              {[['#how-it-works', 'How it works'], ['#tests', 'Popular tests'], ['#for-labs', 'For labs'], ['#faq', 'FAQ']].map(([href, label]) => (
                <a key={href} href={href} onClick={() => setMobileMenuOpen(false)} className="rounded-xl px-4 py-3 hover:bg-brand-50 hover:text-brand-700">{label}</a>
              ))}
            </div>
          </nav>
        ) : null}
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-7xl px-5 pb-20 pt-14 sm:px-8 sm:pt-20">
        <div className="grid items-center gap-14 lg:grid-cols-2">
          <div>
            {/* <p className="font-mono text-xs uppercase tracking-[0.18em] text-slate-500">
              NABL-accredited partner labs · 40+ cities
            </p> */}
            <h1
              className="mt-4 text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl lg:text-[3.4rem]"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Book a lab test.
              <br />
              Skip the waiting room.
            </h1>
            <p className="mt-5 max-w-md text-base leading-relaxed text-slate-600 sm:text-lg">
              Compare turnaround times across accredited labs, book a home visit or walk-in slot, and get a
              digitally signed report the moment it clears QC.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                to="/register"
                className="rounded-full px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:opacity-90"
                style={{ background: teal }}
              >
                Book a test →
              </Link>
              <a href="#how-it-works" className="text-sm font-semibold text-slate-700 hover:text-slate-900">
                See how it works
              </a>
            </div>

            {/* <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 border-t border-slate-200 pt-6 font-mono text-xs text-slate-500">
              <span><span className="font-semibold text-slate-900">12,400+</span> tests / month</span>
              <span><span className="font-semibold text-slate-900">18h</span> avg. turnaround</span>
              <span><span className="font-semibold text-slate-900">4.8★</span> patient rating</span>
            </div> */}
          </div>

          <div className="relative isolate min-h-[340px] overflow-hidden rounded-[2rem] bg-slate-900 shadow-lift sm:aspect-[3/2] sm:min-h-0">
            <img
               src={diagnosticImage}
               alt="Diagnostic"
                      className="absolute inset-0 h-full w-full object-cover object-center transition duration-700 hover:scale-105"
            />
            {/* <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-900/15 to-transparent" />
            <div className="absolute left-5 top-5 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/15 px-3 py-2 text-xs font-semibold text-white backdrop-blur-md"><FaCheckCircle className="text-emerald-300" /> No need to be testy</div>
            <div className="absolute bottom-5 left-5 right-5 rounded-2xl border border-white/20 bg-white/95 p-4 shadow-lg backdrop-blur sm:left-7 sm:right-auto sm:max-w-sm sm:p-5">
              <p className="text-xs font-bold uppercase tracking-[.14em] text-brand-700">Tiny tubes, big answers</p>
              <div className="mt-3 grid grid-cols-2 rounded-xl bg-slate-100 p-1">
                <button onClick={() => setCollectionMode('home')} className={`rounded-lg px-3 py-2 text-xs font-bold ${collectionMode === 'home' ? 'bg-white text-brand-700 shadow-sm' : 'text-slate-500'}`}><FaHome className="mr-1 inline" /> Home pickup</button>
                <button onClick={() => setCollectionMode('lab')} className={`rounded-lg px-3 py-2 text-xs font-bold ${collectionMode === 'lab' ? 'bg-white text-brand-700 shadow-sm' : 'text-slate-500'}`}><FaMapMarkerAlt className="mr-1 inline" /> Lab visit</button>
              </div>
              <p className="mt-3 text-sm font-medium text-slate-800">{collectionMode === 'home' ? 'A verified phlebotomist visits at your chosen time—no waiting-room small talk.' : 'Choose a nearby partner lab and walk in when it suits you.'}</p>
            </div> */}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="border-y border-slate-200 bg-white py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-slate-500">The process</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            From booking to report, four steps
          </h2>

          <div className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step) => (
              <div key={step.n} className="group rounded-2xl border border-slate-200 bg-[#F8FBFA] p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-brand-200 hover:bg-white hover:shadow-soft">
                <span
                  className="inline-flex rounded-lg bg-brand-50 px-2.5 py-1 font-mono text-sm font-semibold"
                  style={{ color: teal }}
                >
                  {step.n}
                </span>
                <h3 className="mt-3 text-lg font-semibold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular tests */
      /* <section id="tests" className="py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-slate-500">Most booked</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                Popular tests
              </h2>
            </div>
            <Link to="/register" className="text-sm font-semibold hover:opacity-80" style={{ color: teal }}>
              View full catalog →
            </Link>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {tests.map((test) => (
              <div
                key={test.name}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: test.color }} aria-hidden="true" />
                  <p className="font-mono text-[11px] uppercase tracking-wider text-slate-500">{test.tube}</p>
                </div>
                <h3 className="mt-3 text-base font-semibold text-slate-900">{test.name}</h3>
                <div className="mt-5 flex items-center justify-between text-sm">
                  <span className="font-semibold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{test.price}</span>
                  <span className="font-mono text-xs text-slate-500">TAT {test.tat}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section> */}

      {/* Trust / why us */}
      <section className="border-y border-slate-200 bg-white py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-slate-500">Why patients choose us</p>
          <h2 className="mt-2 max-w-xl text-3xl font-semibold tracking-tight sm:text-4xl" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Every order is traceable, every lab is vetted
          </h2>

          <div className="mt-12 grid gap-x-10 gap-y-12 sm:grid-cols-2">
            {trustPoints.map((point) => (
              <div key={point.title} className="flex gap-4">
                <span
                  className="mt-1 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white"
                  style={{ background: teal }}
                  aria-hidden="true"
                >
                  ✓
                </span>
                <div>
                  <h3 className="text-base font-semibold text-slate-900">{point.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-slate-600">{point.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats band
      <section className="py-16" style={{ background: ink }}>
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-5 sm:px-8 lg:grid-cols-4">
          {[
            ['120+', 'Partner labs'],
            ['3.2M+', 'Tests completed'],
            ['40', 'Cities covered'],
            ['4.8 / 5', 'Average rating']
          ].map(([value, label]) => (
            <div key={label}>
              <p className="text-3xl font-semibold text-white sm:text-4xl" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                {value}
              </p>
              <p className="mt-1 font-mono text-xs uppercase tracking-wider text-slate-400">{label}</p>
            </div>
          ))}
        </div>
      </section> */}

      {/* For Labs 
       <section id="for-labs" className="py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div
            className="grid items-center gap-10 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm sm:p-12 lg:grid-cols-2"
          >
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-slate-500">For diagnostic labs</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                Bring your lab online in a week
              </h2>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-slate-600">
                Get verified, list your test menu, and start receiving routed orders. Accept or reject requests,
                upload reports, and track every order from one dashboard — no separate software to buy.
              </p>
              <Link
                to="/register"
                className="mt-6 inline-block rounded-full px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
                style={{ background: tealDark }}
              >
                Register your lab →
              </Link>
            </div> 

            <div className="grid grid-cols-2 gap-4 font-mono text-xs">
              {['Order routing', 'Digital reports', 'Verified staff', 'Live tracking'].map((item) => (
                <div key={item} className="rounded-xl border border-slate-200 bg-[#F5F7F8] px-4 py-5 text-slate-700">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>*/}

      {/* Testimonials
      <section className="border-y border-slate-200 bg-white py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-slate-500">What people say</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Trusted on both sides of the tube
          </h2>

          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {testimonials.map((t) => (
              <figure key={t.name} className="rounded-2xl border border-slate-200 p-6">
                <blockquote className="text-sm leading-relaxed text-slate-700">&ldquo;{t.quote}&rdquo;</blockquote>
                <figcaption className="mt-5 text-sm">
                  <span className="font-semibold text-slate-900">{t.name}</span>
                  <span className="block text-slate-500">{t.role}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section> */}

      {/* FAQ */}
      <section id="faq" className="py-20">
        <div className="mx-auto max-w-3xl px-5 sm:px-8">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-slate-500">Questions</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Frequently asked
          </h2>

          <div className="mt-8">
            {faqs.map((item, i) => (
              <FaqItem key={item.q} item={item} isOpen={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? -1 : i)} />
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20">
        <div className="mx-auto max-w-5xl px-5 sm:px-8">
          <div
            className="rounded-3xl px-8 py-14 text-center shadow-lg sm:px-16"
            style={{ background: `linear-gradient(135deg, ${teal}, ${tealDark})` }}
          >
            <h2 className="text-3xl font-semibold text-white sm:text-4xl" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Your next test is a few taps away
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm text-white/80">
              Create an account, compare labs by turnaround time, and book in under two minutes.
            </p>
            <Link
              to="/register"
              className="mt-7 inline-block rounded-full bg-white px-7 py-3 text-sm font-semibold text-slate-900 shadow-md transition hover:opacity-90"
            >
              Get started free
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-12">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <div className="flex items-center gap-2">
                <span
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold text-white"
                  style={{ background: teal }}
                >
                  +
                </span>
                <span className="font-semibold tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  Diagnostic Care
                </span>
              </div>
              <p className="mt-3 max-w-xs text-sm text-slate-500">
                Lab test booking with real turnaround times and digitally signed reports.
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Product</p>
              <ul className="mt-3 space-y-2 text-sm text-slate-600">
                {/* <li><a href="#tests" className="hover:text-slate-900">Tests</a></li> */}
                <li><a href="#how-it-works" className="hover:text-slate-900">How it works</a></li>
                {/* <li><a href="#for-labs" className="hover:text-slate-900">For labs</a></li> */}
              </ul>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Account</p>
              <ul className="mt-3 space-y-2 text-sm text-slate-600">
                <li><Link to="/login" className="hover:text-slate-900">Log in</Link></li>
                <li><Link to="/register" className="hover:text-slate-900">Register</Link></li>
              </ul>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Contact</p>
              <ul className="mt-3 space-y-2 text-sm text-slate-600">
                <li className="hover:text-slate-900">  
                      Email : <a href="mailto:support@example.com">abhishekbururd0@gmail.com</a>
                </li>
                <li className="hover:text-slate-900">Phone : +91 8073008410</li>
              </ul>
            </div>
          </div>

          <div className="mt-10 flex flex-col gap-3 border-t border-slate-200 pt-6 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
            <span>© {new Date().getFullYear()} Diagnostic Care. All rights reserved.</span>
            <span>Lab results are informational and not a substitute for professional medical advice.</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
