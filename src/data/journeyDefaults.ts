import type { JourneyMilestoneItem } from '../types';

export const DEFAULT_JOURNEY_HEADING = 'Our Journey';
export const DEFAULT_JOURNEY_SUBHEADING = 'From Foundation to Forward Progress';
export const DEFAULT_JOURNEY_DESCRIPTION =
  'Every milestone reflects our journey, experience and continued presence in the steel industry.';

export const DEFAULT_JOURNEY_MILESTONES: JourneyMilestoneItem[] = [
  {
    id: 'milestone-1988',
    order: 1,
    enabled: true,
    dateLabel: '1988',
    title: 'Foundation & First Steps',
    description:
      'Nav Durga Ispat Pvt. Ltd. was incorporated in 1988, marking the beginning of its journey in the steel industry.',
  },
  {
    id: 'milestone-scale',
    order: 2,
    enabled: true,
    dateLabel: '',
    title: 'Building Scale – Subsequent Years',
    description:
      'Developing its business presence and strengthening its position in the steel industry.',
  },
  {
    id: 'milestone-product-presence',
    order: 3,
    enabled: true,
    dateLabel: '',
    title: 'Strengthening Our Product Presence',
    description:
      "Expanding the company's presence across steel product categories and serving industrial and structural requirements.",
  },
  {
    id: 'milestone-established',
    order: 4,
    enabled: true,
    dateLabel: '',
    title: 'Established Industry Presence',
    description:
      "Continuing the company's journey from its base in Urla Industrial Area, Raipur, Chhattisgarh.",
  },
  {
    id: 'milestone-today',
    order: 5,
    enabled: true,
    dateLabel: '',
    title: 'Moving Forward – Today',
    description:
      'Continuing to build business relationships and making product information more accessible through digital platforms.',
  },
];
