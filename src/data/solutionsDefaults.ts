import type { SolutionServiceCmsItem } from '../types';

export const DEFAULT_SOLUTIONS_SERVICES: SolutionServiceCmsItem[] = [
  {
    id: 'sol-structural-steel',
    key: 'structural-steel',
    title: 'Structural Steel Products',
    description:
      'Active structural steel sections rolled and managed directly through Nav Durga Ispat ERP for industrial, structural, and infrastructure needs.',
    kind: 'product',
    enabled: true,
  },
  {
    id: 'sol-medium-section',
    key: 'medium-section',
    title: 'Medium Section',
    description:
      'Medium structural steel channels, joists, and heavy sections supplied by Nav Durga Ispat Pvt. Ltd.',
    kind: 'product',
    enabled: true,
  },
  {
    id: 'sol-light-section',
    key: 'light-section',
    title: 'Light Section',
    description:
      'Light structural channels, equal angles, and merchant sections supplied through Unit-2 NS Ispat (I) Pvt. Ltd.',
    kind: 'product',
    enabled: true,
  },
  {
    id: 'sol-beams-joists',
    key: 'beams-joists',
    title: 'Steel Beams & Joists',
    description:
      'Structural joists and beam sections matched to ERP size specifications for spans, columns, and heavy framing.',
    kind: 'product',
    enabled: true,
  },
  {
    id: 'sol-ms-channels',
    key: 'ms-channels',
    title: 'M.S. Channels',
    description:
      'Mild steel C-channels across Medium and Light rolling ranges, synchronized live with ERP sizes and gauge differences.',
    kind: 'product',
    enabled: true,
  },
  {
    id: 'sol-ms-angles',
    key: 'ms-angles',
    title: 'M.S. Equal Angles',
    description:
      'Equal structural angle sections for trusses, bracing, towers, and industrial steel fabrication work.',
    kind: 'product',
    enabled: true,
  },
  {
    id: 'sol-steel-enquiries',
    key: 'steel-enquiries',
    title: 'Steel Product Enquiries',
    description:
      'Direct commercial quotation and requirement submission connected straight to the Nav Durga Ispat Raipur sales team.',
    kind: 'service',
    enabled: true,
  },
  {
    id: 'sol-rate-info',
    key: 'rate-information',
    title: 'Product Rate Information',
    description:
      'Live daily section basic rates and product-wise rate portal synced directly from ERP Daily Rate Management.',
    kind: 'service',
    enabled: true,
  },
];
