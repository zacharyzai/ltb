import { at, dayOffset } from '../utils/time'

export const MOMENT_CATEGORIES = ['gardening', 'crafts', 'music', 'exercise', 'celebration'] // labels: category.<id>
export const MOMENT_STATUSES = ['published', 'draft']

// image: a reference to an illustration/photo (null = none). Moments with an image may only tag residents with photo consent.
const moment = (id, offset, time, category, residentIds, image, status = 'published') => ({
  id: `mo-${id}`, seedKey: `moments.m${id}`, seeded: ['title', 'caption'], title: null, caption: null,
  createdAt: at(dayOffset(offset), time), category, residentIds, image, status, authorId: 'st-michelle',
})

export const buildMoments = () => [
  moment(1, 0, '09:15', 'gardening', ['res-tan', 'res-lim'], 'garden-walk'),
  moment(2, -1, '15:00', 'music', ['res-tan', 'res-rahim'], 'music-session'),
  moment(3, -3, '10:30', 'crafts', ['res-tan', 'res-wong'], null), // text-only, so Mdm Wong (no photo consent) may be tagged
  moment(4, -4, '11:00', 'exercise', ['res-tan', 'res-lim', 'res-rahim'], 'group-exercise'),
  moment(5, -8, '16:00', 'celebration', ['res-lim'], 'birthday'),
  moment(6, 0, '08:00', 'music', ['res-tan', 'res-rahim'], null, 'draft'),
]
