// Home-page groups, in display order.
export const areas = [
  { id: 'professional', title: 'Professional projects' },
  { id: 'research', title: 'Research projects' },
  { id: 'personal', title: 'Personal projects' },
] as const;

export const site = {
  name: 'Ahmed Alkishki',
  role: 'Embedded Software Developer',
  github: 'https://github.com/AhmedKishki',
  linkedin: 'https://www.linkedin.com/in/ahmedalkishki6394/',
  email: 'ahmed.kishki@outlook.com',
  // Applicant's profile summary (profile/profile.json#/summary/en in the applications repository).
  description:
    'I develop and ship embedded products in R&D at Supernova. My AI experience spans cloud-model APIs and tiny, resource-constrained devices. I integrate an agentic workflow into my embedded work, drawing on interdisciplinary knowledge to solve problems. I am interested in embedded programming, ML/AI and robotics.',
  // Same contact details as the CV header.
  phone: '+49 1515 6953297',
  location: 'Freiburg, Germany',
  // Copies of cv/ahmed-alkishki.tabular.{en,de}.pdf from the applications repository.
  cv: [
    { label: 'English CV', detail: 'PDF', href: '/cv/Ahmed-Alkishki-CV.pdf' },
    { label: 'German CV', detail: 'PDF', href: '/cv/Ahmed-Alkishki-CV-German.pdf' },
  ],
};
