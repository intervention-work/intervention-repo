/**
 * Home page FAQ content. One source for the visible accordion (components/faq.tsx)
 * and the FAQPage JSON-LD (app/page.tsx), so the structured data can never drift
 * from what visitors read.
 */
export type Faq = { q: string; a: string };
export type FaqCategory = { id: string; label: string; items: Faq[] };

export const HOME_FAQ_CATEGORIES: FaqCategory[] = [
  {
    id: 'process',
    label: 'Process',
    items: [
      {
        q: 'What is a professional intervention?',
        a: 'A carefully planned, compassionate conversation guided by a certified interventionist. It is not confrontational. It is structured, loving, and evidence-based. Most meetings last about ninety minutes.',
      },
      {
        q: 'How quickly can you help?',
        a: 'We respond within one hour, 24 hours a day. For urgent situations, call directly and someone will answer immediately.',
      },
      {
        q: 'What if my loved one refuses to cooperate?',
        a: 'This is the most common concern families have. A professionally guided intervention dramatically increases the likelihood of acceptance, even when previous conversations have failed. Our specialists are trained specifically for resistance.',
      },
    ],
  },
  {
    id: 'cost',
    label: 'Cost & insurance',
    items: [
      {
        q: 'How much does an intervention cost?',
        a: 'Intervention is a fee-for-service offering starting at $500. We discuss cost openly on the first call, and the initial consultation is always free.',
      },
      {
        q: 'Is intervention covered by insurance?',
        a: 'Insurance does not cover intervention services. However, most insurance policies do cover the treatment of mental health and substance use (the care your loved one enters after the intervention), and we help you verify that coverage.',
      },
      {
        q: 'Is intervention funded by any public programs?',
        a: 'No. Intervention is not funded by city, state, or national organizations. It is a private, fee-for-service offering.',
      },
    ],
  },
  {
    id: 'after',
    label: 'After the meeting',
    items: [
      {
        q: 'What happens immediately after the intervention?',
        a: 'In most cases, treatment placement is in motion the same day. We coordinate transportation, admissions, and handoff to the treatment team.',
      },
      {
        q: 'Do you support the family during treatment?',
        a: 'Yes. Family coaching continues for as long as you need. We coordinate with the treatment team and meet quarterly with the family.',
      },
      {
        q: 'What if there is a relapse?',
        a: 'Relapse is part of many recoveries, not a failure. We have an established re-engagement protocol and we stay with you through it.',
      },
    ],
  },
];
