import { useState } from 'react'
import { Calendar, Check, Clock, Copy, ExternalLink, MapPin, MessageCircle, Share2, TreePine, Music } from 'lucide-react'
import BottomSheet from '../components/BottomSheet.jsx'
import Button from '../components/Button.jsx'
import EventCard from '../components/EventCard.jsx'
import ImagePlaceholder from '../components/ImagePlaceholder.jsx'
import Tabs from '../components/Tabs.jsx'
import { news, social } from '../data/events.js'
import { useApp } from '../context/useApp.js'

const TABS = ['Upcoming', 'Past', 'News']
const ICONS = { tree: TreePine, music: Music }
const shareUrl = (e) => `${window.location.origin}/community#${e.id}`
const shareText = (e) => `${e.title} – ${e.date}, ${e.time}. Join us at SAS Nursing Home!`

function ShareSheet({ event, onClose }) {
  const [copied, setCopied] = useState(false)
  if (event && !event.public) event = null // resident moments / private content are never shareable
  const copy = async () => {
    try { await navigator.clipboard.writeText(shareUrl(event)) } catch { /* clipboard blocked: still confirm in demo */ }
    setCopied(true)
  }
  const q = encodeURIComponent
  return (
    <BottomSheet open={!!event} onClose={() => { setCopied(false); onClose() }} title="Share this event">
      {event && (
        <div className="space-y-2">
          <p className="text-lg">{event.title} · {event.date}</p>
          <Button variant="outline" className="w-full" href={`https://wa.me/?text=${q(`${shareText(event)} ${shareUrl(event)}`)}`}><MessageCircle aria-hidden="true" />WhatsApp</Button>
          <Button variant="outline" className="w-full" href={`https://www.facebook.com/sharer/sharer.php?u=${q(shareUrl(event))}`}><Share2 aria-hidden="true" />Facebook</Button>
          <Button variant="outline" className="w-full" onClick={copy}>{copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}{copied ? 'Link copied' : 'Copy Link'}</Button>
          <p className="text-center text-sm text-muted" role="status">Only public events can be shared. Resident moments are private.</p>
        </div>
      )}
    </BottomSheet>
  )
}

export default function Community() {
  const { events } = useApp()
  const [tab, setTab] = useState('Upcoming')
  const [detail, setDetail] = useState(null)
  const [sharing, setSharing] = useState(null)
  const list = events.filter((e) => e.published && e.when === tab.toLowerCase())
  const share = (e) => { setDetail(null); setSharing(e) }

  return (
    <div className="space-y-3">
      <h1 className="font-heading text-2xl font-bold">Community &amp; Support</h1>
      <Tabs tabs={TABS} value={tab} onChange={setTab} label="Community sections" />

      <div className="space-y-3">
        {tab !== 'News' && list.map((e) => <EventCard key={e.id} event={e} onDetails={setDetail} onShare={share} />)}
        {tab === 'News' && news.map((n) => (
          <article key={n.id} className="space-y-1 rounded-2xl border-2 border-ink bg-white p-3">
            <p className="text-sm font-bold text-teal-dark">{n.date}</p>
            <h3 className="font-heading text-xl font-bold leading-tight">{n.title}</h3>
            <p>{n.summary}</p>
          </article>
        ))}
      </div>

      <section className="space-y-2 rounded-2xl border-2 border-ink bg-tint p-3">
        <h2 className="font-heading text-xl font-bold">Make a Difference in Their Lives</h2>
        <p className="text-lg">See how sponsored activities like music therapy support residents.</p>
        <Button href={social.donate} className="w-full">Support SAS <ExternalLink aria-hidden="true" size={18} /></Button>
      </section>

      <nav aria-label="SAS online" className="grid grid-cols-3 gap-2">
        <Button variant="outline" href={social.website} className="!px-1">Website</Button>
        <Button variant="outline" href={social.facebook} className="!px-1">Facebook</Button>
        <Button variant="outline" href={social.instagram} className="!px-1">Instagram</Button>
      </nav>

      <BottomSheet open={!!detail} onClose={() => setDetail(null)} title={detail?.title ?? ''}>
        {detail && (
          <div className="space-y-3">
            <ImagePlaceholder icon={ICONS[detail.icon]} label="Event photo" className="h-36 rounded-xl border-2" />
            <p className="text-sm font-bold tracking-wide text-teal-dark">{detail.tag}</p>
            <ul className="space-y-1.5 text-lg">
              <li className="flex gap-2"><Calendar aria-hidden="true" className="shrink-0" />{detail.date}</li>
              <li className="flex gap-2"><Clock aria-hidden="true" className="shrink-0" />{detail.time}</li>
              <li className="flex gap-2"><MapPin aria-hidden="true" className="shrink-0" />{detail.location}</li>
            </ul>
            <p className="text-lg">{detail.description}</p>
            {detail.public && <Button variant="outline" className="w-full" onClick={() => share(detail)}><Share2 aria-hidden="true" />Share</Button>}
          </div>
        )}
      </BottomSheet>
      <ShareSheet event={sharing} onClose={() => setSharing(null)} />
    </div>
  )
}
