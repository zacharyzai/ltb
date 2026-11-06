// Fictional family caregivers. residentIds mirrors each resident's caregiverIds (a test keeps them in step).
export const RELATIONSHIPS = ['mother', 'father', 'aunt'] // labels: relationship.<id>

export const caregivers = [
  { id: 'cg-sarah', name: 'Sarah Tan', firstName: 'Sarah', residentIds: ['res-tan', 'res-wong'], relationships: { 'res-tan': 'mother', 'res-wong': 'aunt' } },
  { id: 'cg-david', name: 'David Lim', firstName: 'David', residentIds: ['res-lim'], relationships: { 'res-lim': 'father' } },
  { id: 'cg-huimin', name: 'Wong Hui Min', firstName: 'Hui Min', residentIds: ['res-wong'], relationships: { 'res-wong': 'mother' } },
  { id: 'cg-nurul', name: 'Nurul Aisyah', firstName: 'Nurul', residentIds: ['res-rahim'], relationships: { 'res-rahim': 'father' } },
]
export const DEFAULT_CAREGIVER_ID = 'cg-sarah'
