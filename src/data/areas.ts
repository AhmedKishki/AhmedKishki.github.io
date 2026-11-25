// Home-page groups, in display order.
export const areas = [
  { id: 'professional', title: 'Professional projects' },
  { id: 'research', title: 'Research projects' },
  { id: 'personal', title: 'Personal projects' },
] as const;

export const site = {
  name: 'Ahmed Alkishki',
  title: 'Ahmed Alkishki’s Portfolio',
  role: 'Embedded Software Developer @ Supernova Design GmbH.',
  github: 'https://github.com/AhmedKishki',
  linkedin: 'https://www.linkedin.com/in/ahmedalkishki6394/',
  email: 'ahmed.kishki@outlook.com',
  description: 'I am Interested in: Embedded systems, edge AI, AI/ML, robotics',
  // Same contact details as the CV header.
  phone: '+49 1515 6953297',
  location: 'Freiburg, Germany',
  // Copies of cv/ahmed-alkishki.tabular.{en,de}.pdf from the applications repository.
  cv: [
    { label: 'English CV', detail: 'PDF', href: '/cv/Ahmed-Alkishki-CV.pdf' },
    { label: 'German CV', detail: 'PDF', href: '/cv/Ahmed-Alkishki-CV-German.pdf' },
  ],
};
