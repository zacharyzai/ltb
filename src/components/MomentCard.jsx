import { Camera } from 'lucide-react'
import ImagePlaceholder from './ImagePlaceholder.jsx'

export default function MomentCard({ moment }) {
  return (
    <article className="overflow-hidden rounded-2xl border-2 border-ink bg-white">
      {moment.image ? <img src={moment.image} alt={moment.title} className="h-40 w-full border-b-2 border-ink object-cover" /> : <ImagePlaceholder icon={Camera} label="Activity photo" />}
      <div className="space-y-1 p-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-heading text-xl font-bold leading-tight">{moment.title}</h3>
          <span className="shrink-0 rounded-full border-[1.5px] border-ink px-2.5 text-sm">{moment.category}</span>
        </div>
        <p className="text-sm text-muted">{moment.day}, {moment.time}</p>
        <p>{moment.caption}</p>
      </div>
    </article>
  )
}
