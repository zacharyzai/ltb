import { Music, Share2, TreePine } from 'lucide-react'
import Button from './Button.jsx'
import ImagePlaceholder from './ImagePlaceholder.jsx'

const ICONS = { tree: TreePine, music: Music }

export default function EventCard({ event, onDetails, onShare }) {
  return (
    <article className="overflow-hidden rounded-2xl border-2 border-ink bg-white">
      <ImagePlaceholder icon={ICONS[event.icon]} label="Event photo" className="h-36" />
      <div className="space-y-2 p-3">
        <p className="text-sm font-bold tracking-wide text-teal-dark">{event.tag}</p>
        <h3 className="font-heading text-xl font-bold leading-tight">{event.title}</h3>
        <p>{event.date} · {event.time}</p>
        <div className="flex gap-2">
          <Button onClick={() => onDetails(event)} className="flex-1">View Details</Button>
          {event.public && (
            <Button variant="outline" onClick={() => onShare(event)}><Share2 aria-hidden="true" size={20} />Share</Button>
          )}
        </div>
      </div>
    </article>
  )
}
