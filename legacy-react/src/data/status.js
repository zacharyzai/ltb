// Colour + shape + words, never colour alone. General well-being indicators, not medical assessments.
export const STATUSES = {
  well: { symbol: '●', label: 'Feeling Well', cls: 'bg-well-bg text-well border-well', dot: 'bg-teal' },
  resting: { symbol: '◆', label: 'Resting', cls: 'bg-rest-bg text-rest border-rest', dot: 'bg-rest-dot' },
  contact: { symbol: '▲', label: 'Please Contact Staff', cls: 'bg-contact-bg text-contact border-contact', dot: 'bg-contact-dot' },
}

export const INQUIRY_STATUS = {
  submitted: { symbol: '○', label: 'Submitted', cls: 'bg-white text-ink border-ink' },
  review: { symbol: '◐', label: 'In Review', cls: 'bg-rest-bg text-rest border-rest' },
  answered: { symbol: '✓', label: 'Answered', cls: 'bg-well-bg text-well border-well' },
}
