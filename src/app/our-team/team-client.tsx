'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'motion/react';
import { viewport } from '@/lib/motion';

const BRAD_SHORT = `Brad Lamm is an author, teacher, and widely recognized interventionist known for helping people make transformational change, including appearances with Oprah Winfrey, Good Morning America, and The Today Show. He has trained thousands of clinicians worldwide in the evidence-based invitational intervention model, focused on engaging reluctant individuals to accept help. Founder of Breathe Life Healing Center in 2013, he has supported over 4,000 patients and expanded access through significant scholarship care. With more than 1,400 successful interventions, Brad is also a serial entrepreneur, podcast host, and author of multiple books on recovery, behavior change, and family systems, drawing from both professional expertise and his own recovery journey.`;

const BRAD_LONG_PARAS = [
  `Brad Lamm is an author, teacher and America's premier interventionist, well known for helping people make transformational change via real-life storytelling with Oprah Winfrey, Good Morning America and The Today Show. He has equipped thousands of clinicians across the globe to practice the evidence-based, superior invitational intervention model of engaging a reluctant loved one to say YES to help. He has dedicated his life to help inform and inspire families on understanding the impact of complex trauma and how we might recover from wounding events.`,
  `This work culminated in the founding of Breathe Life Healing Center in 2013, the 54-bed integrated residential rehab located on a dynamic 22-acres Laurel Canyon Campus and a Melrose Avenue Clinic in West Hollywood, CA. Since opening, Breathe Life has helped more than 4,000 patients lead better lives while providing more than $5M in scholarship care to underserved community members. In 2024, Lamm received the Spirit of Miriam's House Award for his selfless service to providing care to underserved populations, in addition to the Businessperson of the Year by the Los Angeles Blade for his tireless work.`,
  `Brad's work is built on bedrock beliefs that family and friends are uniquely poised to act as change agents harnessing enormous leverage, no matter how discouraged they may feel. Recovered from a deadly eating disorder, life-threatening alcoholism, along with bone-crushing meth and nicotine addictions, Brad has been devoting his life to going back into the fire to help others who suffer, gain freedom through his no-nonsense manner and gallows humor. Previously a network affiliate news anchor, Brad's televised work since 2003 has focused on helping families gain tools to help the ones they love. He created and produced the eight-part docu-series Addicted to Food with Oprah Winfrey.`,
  `Brad has shifted attention from the traditional surprise intervention to the evidence-based model he employs. To date, he has managed 1,400 successful invitational interventions. A serial entrepreneur, Brad's nationwide nicotine cessation effort Blueprint to Quit: Smoking (2011) launched at more than 4300 Walmart stores nationwide with GSK. His America Recovers podcast (S1 35-episode order in 2022) is co-hosted by activist/author Mackenzie Phillips and a Westbrook Productions co-production.`,
  `Brad has authored many books including: On Breathing, How to Help the One You Love, How to Change Someone You Love, Quit Vaping, Stop It, and Just 10LBS. He co-authored: Crystal Clear, Sexually Recovered, and Breakfree Intervention Skills Training.`,
];

const SHOAIB_SHORT = `Shoaib Haroon is an established business leader with experience across business and product strategy, most recently serving as Chief Product Officer at TIFIN and working at Google prior to that. In recovery himself, he understands the challenges of dealing with addiction, working through earlier recovery, and sustaining longer-term recovery. He leads with understanding and empathy. He leverages his experience in high demand environments to help with executive functioning skills, coaching, and companionship. As CEO, he brings together his executive leadership experience and personal recovery experience to help us scale and reach more people.`;

function ExpandableBio({ shortBio, longParas }: { shortBio: string; longParas: string[] }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div>
      <p className="font-sans text-base leading-relaxed text-ink-body">{shortBio}</p>
      {expanded && (
        <div className="mt-4 space-y-4">
          {longParas.map((p, i) => (
            <p key={i} className="font-sans text-base leading-relaxed text-ink-body">
              {p}
            </p>
          ))}
        </div>
      )}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="mt-3 font-sans text-sm text-sage-700 underline underline-offset-2 transition-colors hover:text-sage-900"
      >
        {expanded ? 'Collapse bio' : 'Read full bio'}
      </button>
    </div>
  );
}


export function OurTeamContent() {
  return (
    <main>
      {/* Hero */}
      <section className="bg-ink px-6 py-20 lg:py-28">
        <div className="mx-auto max-w-[1200px]">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="font-sans text-sm tracking-[0.22em] uppercase text-sage-400">
              Our Team
            </p>
            <h1 className="mt-4 font-display text-4xl leading-[1.05] text-white md:text-5xl">
              The people behind the work.
            </h1>
            <p className="mt-4 max-w-2xl font-sans text-xl leading-relaxed text-white/75">
              A team built on lived experience, clinical expertise, and a shared belief that change is possible.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Team members */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-[1200px] px-6 space-y-20">

          {/* Brad Lamm */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={viewport}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="grid grid-cols-1 gap-12 border-b border-border pb-20 lg:grid-cols-2 lg:items-start"
          >
            <div>
              <p className="font-sans text-xs tracking-[0.22em] uppercase text-sage-500">
                Certified Intervention Professional · Founder
              </p>
              <h2 className="mt-3 font-display text-3xl leading-tight text-ink md:text-4xl">
                Brad Lamm
              </h2>
              <p className="mt-1 font-sans text-base text-ink-muted">
                Founder and Lead Interventionist
              </p>
              <div className="mt-6">
                <ExpandableBio shortBio={BRAD_SHORT} longParas={BRAD_LONG_PARAS} />
              </div>
            </div>
            <div className="lg:max-w-xs">
              <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl">
                <Image
                  src="/images/brad-lamm.jpg"
                  alt="Brad Lamm, Founder and Lead Interventionist"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 400px"
                />
              </div>
            </div>
          </motion.div>

          {/* Shoaib Haroon */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={viewport}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-start"
          >
            <div className="lg:order-first lg:max-w-xs">
              <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl">
                <Image
                  src="/images/shoaib-haroon.jpeg"
                  alt="Shoaib Haroon, Chief Executive Officer"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 400px"
                />
              </div>
            </div>
            <div>
              <p className="font-sans text-xs tracking-[0.22em] uppercase text-sage-500">
                Chief Executive Officer · In Recovery
              </p>
              <h2 className="mt-3 font-display text-3xl leading-tight text-ink md:text-4xl">
                Shoaib Haroon
              </h2>
              <p className="mt-1 font-sans text-base text-ink-muted">
                Chief Executive Officer
              </p>
              <p className="mt-6 font-sans text-base leading-relaxed text-ink-body">
                {SHOAIB_SHORT}
              </p>
            </div>
          </motion.div>

        </div>
      </section>

      {/* CTA */}
      <section className="bg-surface px-6 py-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={viewport}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <h2 className="font-display text-3xl text-ink md:text-4xl">
            Ready to talk to our team?
          </h2>
          <p className="mt-3 font-sans text-lg text-ink-muted">
            Free, confidential consultation. We respond within the hour.
          </p>
          <Link
            href="/contact"
            className="mt-8 inline-flex items-center rounded-full bg-sage-700 px-8 py-4 font-sans text-base font-medium text-white transition-colors duration-300 hover:bg-sage-900"
          >
            Get help now
          </Link>
        </motion.div>
      </section>
    </main>
  );
}
