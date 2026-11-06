import { at, dayOffset } from '../utils/time'

export const WELLBEING_STATUSES = ['well', 'resting', 'contact'] // stable ids; labels: status.<id>. General indicators, not medical.

// Fictional residents. updatedAt null = never updated. note is typed text; noteSeedKey points at seeded words.
export const buildResidents = () => [
  { id: 'res-tan', name: 'Madam Tan Mei Ling', shortName: 'Mdm Tan', age: 84, code: 'SAS-1024', status: 'well', updatedAt: at(dayOffset(0), '09:30'), updatedBy: 'st-aisha', note: null, noteSeedKey: null, photoConsent: true, caregiverIds: ['cg-sarah'] },
  { id: 'res-lim', name: 'Mr Lim Boon Huat', shortName: 'Mr Lim', age: 79, code: 'SAS-1031', status: 'resting', updatedAt: at(dayOffset(-1), '16:10'), updatedBy: 'st-kumar', note: null, noteSeedKey: null, photoConsent: true, caregiverIds: ['cg-david'] },
  { id: 'res-wong', name: 'Madam Wong Siew Fong', shortName: 'Mdm Wong', age: 88, code: 'SAS-1037', status: 'contact', updatedAt: at(dayOffset(0), '07:45'), updatedBy: 'st-aisha', note: null, noteSeedKey: 'residentNotes.wong', photoConsent: false, caregiverIds: ['cg-sarah', 'cg-huimin'] },
  { id: 'res-rahim', name: 'Mr Rahim bin Ismail', shortName: 'Mr Rahim', age: 81, code: 'SAS-1042', status: 'well', updatedAt: at(dayOffset(-1), '15:20'), updatedBy: 'st-kumar', note: null, noteSeedKey: null, photoConsent: true, caregiverIds: ['cg-nurul'] },
]
