/**
 * Site content model.
 *
 * Single source of truth for the intervention.com page tree. Copy is migrated
 * from the live intervention.com site so templates and routing never need to
 * change when content is edited.
 */

export type Feature = { title: string; body: string };
export type Stat = { value: string; label: string };
export type FaqItem = { q: string; a: string };

export type ContentBlock = {
  /** Optional section heading (h2) */
  heading?: string;
  /** One or more body paragraphs */
  body?: string | string[];
  /** Checklist-style bullet points */
  bullets?: string[];
  /** Highlighted statistics */
  stats?: Stat[];
  /** Two-column sub-topic cards (h3 + body) */
  features?: Feature[];
  /** Numbered, timeline-style steps */
  steps?: Feature[];
};

export type DetailContent = {
  slug: string;
  /** Nav + card label */
  label: string;
  /** Page H1 */
  title: string;
  /** Hero subtitle + meta description */
  summary: string;
  /** Optional lead paragraph shown above the content blocks */
  intro?: string;
  /** Body sections */
  blocks: ContentBlock[];
  /** Optional page-specific FAQ */
  faq?: FaqItem[];
  /** Hero background image; falls back to the parent section image */
  image?: string;
};

export type Section = {
  slug: string;
  /** Nav label */
  label: string;
  /** Landing H1 */
  title: string;
  /** Landing subtitle + meta description */
  summary: string;
  /** Landing lead paragraph */
  intro: string;
  /** Optional rich content blocks rendered on the landing page */
  blocks?: ContentBlock[];
  /** Optional landing FAQ */
  faq?: FaqItem[];
  /** Kicker over the child grid */
  childrenEyebrow: string;
  childrenTitle: string;
  /** Hero background image; optional when sourced from WP without an image set */
  image?: string;
  children: DetailContent[];
};

// Reliable, calming imagery (whitelisted in next.config).
const IMG = {
  valley:
    'https://images.unsplash.com/photo-1505765050516-f72dcac9c60e?w=1600&q=85',
  water:
    'https://images.unsplash.com/photo-1500964757637-c85e8a162699?w=1600&q=85',
  forest:
    'https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=1600&q=85',
  hillside:
    'https://images.unsplash.com/photo-1490604001847-b712b0c2f967?w=1600&q=85',
  shore:
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&q=85',
  meadow:
    'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=1600&q=85',
} as const;

export const PHONE_DISPLAY = '(800) 789-1605';
export const PHONE_HREF = 'tel:+18007891605';
export const EMAIL = 'help@intervention.com';

export const SECTIONS: Section[] = [
  {
    slug: 'intervention',
    label: 'Intervention',
    title: 'Comprehensive intervention services: your path to recovery.',
    summary:
      'Evidence-based interventions for addiction, mental health, complex trauma, and eating disorders — guiding families toward lasting change.',
    intro:
      'At Change Institute — the family education and care agency that owns and operates Intervention.com — we understand how daunting it can be to take the first step. An intervention can be beneficial when a loved one is in crisis and refuses help. Our professional, evidence-based services are designed to help families and their loved ones move into a new phase of the journey, with a compassionate team guiding you through every step. Serving families globally since 1997, we are trusted to help navigate this challenging but crucial path.',
    blocks: [
      {
        heading: 'Understanding interventions',
        body: 'Interventions are structured, supportive processes that encourage someone to seek help for addiction or other harmful behaviors. Guided by a professional, they break through denial and resistance by highlighting the impact of a person’s behavior on themselves and those they love — creating a supportive environment that inspires hope and a willingness to change.',
      },
      {
        heading: 'What is an intervention?',
        body: 'Family and friends come together to address a loved one about their harmful behavior in a planned process guided by a professional interventionist, encouraging them to seek treatment before the situation worsens. Interventions are carefully set up to be non-confrontational — focused on love and concern rather than judgment. The process involves:',
        bullets: [
          'Preparing the participants — the “voices that matter,” such as family and friends',
          'Outlining specific examples of the person’s behavior',
          'Presenting a clear treatment plan that begins with assessment',
        ],
      },
      {
        heading: 'The intervention process',
        body: 'Our process is thorough and compassionate, designed to support both the affected person and their loved ones. It begins with an initial consultation and assessment, followed by detailed planning and preparation. The intervention itself is conducted with care — with the ability to pivot based on how the day of the Family Meeting unfolds. Post-intervention support and follow-up are essential parts of our process.',
      },
      {
        heading: 'Preparing for an intervention',
        steps: [
          {
            title: 'Contact a professional interventionist',
            body: 'Reach out for a free, confidential consultation to begin planning.',
          },
          {
            title: 'Gather information',
            body: 'Collect history about the person’s situation, medical history, and family dynamics.',
          },
          {
            title: 'Plan with the team',
            body: 'Plan the intervention with the interventionist, family, and friends.',
          },
          {
            title: 'Prepare thoroughly',
            body: 'Ensure everyone deeply understands the process before the day arrives.',
          },
          {
            title: 'Arrange treatment',
            body: 'Line up immediate assessment and treatment options so there are no delays.',
          },
        ],
      },
      {
        heading: 'Follow-up care and support',
        body: 'After the intervention, ongoing care is crucial for both the individual and the family. Our continued support includes:',
        bullets: [
          'Weekly Family Class for the intervention team members',
          'Continued support for the identified loved one and family',
          'Regular check-ins to track progress, aligned with a Change Agreement',
          'Access to additional treatment and recovery resources',
          'Introduction to support groups and counseling',
        ],
      },
    ],
    childrenEyebrow: 'Areas of focus',
    childrenTitle: 'One method, adapted to every situation.',
    image: IMG.valley,
    children: [
      {
        slug: 'alcohol-intervention',
        label: 'Alcohol Intervention',
        title: 'Alcohol interventions: professional help from a licensed interventionist',
        summary:
          'A structured, compassionate, clinically proven way to bridge the gap between active alcohol addiction and life-saving treatment.',
        image: IMG.water,
        intro:
          'When a loved one is struggling with alcohol, it often feels as though the entire family is caught in a downward spiral. You watch as a vibrant, capable person is replaced by someone driven by a physical and emotional dependency that seems to override their own well-being and the needs of those they love.',
        blocks: [
          {
            heading: 'A better way than waiting for rock bottom',
            body: [
              'At Intervention.com, we believe that rock bottom isn’t necessary — and waiting for it is often a heartbreaking strategy. Alcoholism is a progressive disease, and without a directed intervention the consequences can be fatal.',
              'Our intervention services are designed to provide a structured, compassionate, and clinically proven way to bridge the gap between active addiction and life-saving treatment.',
            ],
          },
          {
            heading: 'What is an alcohol intervention?',
            body: [
              'An alcohol intervention is a carefully orchestrated meeting where family, friends, and colleagues come together to express their love and concern for a person struggling with alcohol. It is a strategic opportunity to hold up a clinical mirror to the individual, helping them see the reality of their situation through the eyes of those they care about most.',
              'A successful intervention is not an ambush or an opportunity to air grievances. Instead, it is a professional process where:',
            ],
            bullets: [
              'Family and friends share specific examples of how your loved one’s drinking has impacted your lives.',
              'Your loved one is offered a clear, immediate plan for treatment.',
              'The family establishes healthy boundaries to stop the cycle of enabling.',
            ],
          },
          {
            heading: 'The vital role of an alcohol intervention specialist',
            body: 'Navigating the high-stakes emotions of an intervention requires more than good intentions. Because denial is a primary symptom of alcoholism, your loved one may react with anger, defensiveness, or withdrawal. A specialist keeps the process focused and productive.',
            features: [
              {
                title: 'Customized planning',
                body: 'Every family dynamic is different. Your specialist helps determine who should be present, where the meeting should take place, and which treatment center is the best fit.',
              },
              {
                title: 'Family education',
                body: 'Before the meeting, your specialist helps you understand the disease of addiction and how to communicate in loving, inclusive ways without triggering defensiveness.',
              },
              {
                title: 'Emotional mediation',
                body: 'During the intervention, your specialist manages the emotional thermostat, keeping the conversation on track even if your loved one becomes upset.',
              },
              {
                title: 'Logistical support',
                body: 'Once your loved one agrees to help, your specialist assists with the immediate transition to a treatment facility, ensuring there are no delays.',
              },
            ],
          },
          {
            heading: 'The reality of alcoholism in America',
            body: 'The need for professional alcohol intervention services has never been more urgent. According to recent data from SAMHSA and other national health reports:',
            stats: [
              {
                value: '~28M',
                label:
                  'Americans aged 12+ classified with an Alcohol Use Disorder in the past year — roughly 9.7% (2024).',
              },
              {
                value: '1 in 5',
                label:
                  'People with a substance use disorder who received professional treatment in 2024.',
              },
              {
                value: '80–90%',
                label:
                  'Individuals who agree to enter treatment on the day of a professional intervention.',
              },
              {
                value: '23M+',
                label:
                  'U.S. adults who consider themselves in recovery from a drug or alcohol problem.',
              },
            ],
          },
          {
            heading: 'Why choose professional alcohol intervention services',
            body: 'Choosing to intervene is a courageous act of love. Doing it without professional guidance can lead to unintended consequences — increased resentment, or a loved one cutting off communication. We work nationwide, using invitational interventions similar to the ARISE model that prioritize the health of the entire family. When the family gets well, the individual is far more likely to follow.',
            features: [
              {
                title: 'Breaking denial',
                body: 'Alcoholism creates a mental fog in which your loved one truly believes they have the situation under control.',
              },
              {
                title: 'Ending enabling',
                body: 'We help family members identify behaviors that unintentionally make it easier for their loved one to continue drinking.',
              },
              {
                title: 'Safe transitions',
                body: 'We coordinate with top-tier detox and residential facilities to ensure a seamless handoff to professional medical care.',
              },
            ],
          },
          {
            heading: 'How the intervention works',
            steps: [
              {
                title: 'Initial discovery',
                body: 'We gather history about your loved one’s drinking habits, medical history, and family dynamics.',
              },
              {
                title: 'The preparation phase',
                body: 'The specialist meets with the family — without the addicted loved one — for preparation, planning, and making the invitation.',
              },
              {
                title: 'The Family Meeting',
                body: 'Friends and family gather to share how the addiction has affected them and present the offer of treatment, what we call the Change Plan.',
              },
              {
                title: 'Acceptance and transport',
                body: 'Ideally, your loved one accepts the gift of treatment and is transported immediately to a treatment program.',
              },
              {
                title: 'Ongoing family support',
                body: 'We provide resources and coaching through weekly Family Class sessions to help the family maintain their own recovery and boundaries.',
              },
            ],
          },
        ],
        faq: [
          {
            q: 'Does an intervention work if the person is forced into it?',
            a: 'While an intervention might feel like forcing someone, it is actually about removing the obstacles to treatment. Motivation often comes after your loved one begins detox and their head clears. Many people who enter treatment for their family eventually find their own reasons to stay sober.',
          },
          {
            q: 'What is the difference between an invitation and a confrontation?',
            a: 'A confrontation is often fueled by anger and focused on blame, shame, and the past. An invitational intervention is a pre-planned, clinical process fueled by love and focused on the future. The goal is to provide a solution, not just a list of past problems.',
          },
          {
            q: 'How do we find an alcohol intervention specialist near us?',
            a: 'At Intervention.com, we provide national coverage. Our trained specialists travel to you, ensuring that no matter where you are located, you have access to the highest level of professional care and expertise.',
          },
          {
            q: 'What happens if my loved one refuses to go to treatment?',
            a: 'If they say no, the intervention has not failed — it has just begun. At this point the family must hold the boundaries and bottom lines established during planning. By changing the environment and stopping the enabling, the family creates a situation where your loved one will eventually reach out for the help that was offered.',
          },
          {
            q: 'Can an intervention help with long-term recovery?',
            a: 'Yes. An intervention is the start of a long-term process. Because the family is involved from day one and receives their own education and support, your loved one returns from treatment to a healthier, more supportive home environment, which significantly reduces the risk of relapse.',
          },
        ],
      },
      {
        slug: 'drug-intervention',
        label: 'Drug Intervention',
        title: 'Drug intervention programs: helping your loved one overcome addiction',
        summary:
          'Expert-led drug interventions built around the whole family — with personalized plans and immediate paths to treatment.',
        image: IMG.shore,
        intro:
          'Struggling with substance abuse is one of the most challenging battles a person can face. When it’s a friend or family member, not knowing how best to support them can leave you feeling helpless — but help is available, and drug intervention programs are an effective tool for providing guidance during these difficult times.',
        blocks: [
          {
            heading: 'Understanding drug interventions',
            body: 'A drug intervention helps individuals find the treatment they deserve. Although it can be emotionally exhausting, it offers hope for recovery by allowing everyone involved to express their care and concern in a safe environment.',
          },
          {
            heading: 'What is a drug intervention?',
            body: [
              'A drug intervention is an organized meeting between those who care about someone dealing with addiction and the addicted person. Everyone shares their concerns to help convince the individual to seek help, typically facilitated by a qualified professional interventionist.',
              'The goal is to express support from every angle and motivate them toward recovery — while bringing friends and family together in solidarity for a shared cause. Meaningful solutions become possible with the active involvement of all impacted parties.',
            ],
          },
          {
            heading: 'Why drug interventions matter',
            body: 'It can be difficult for someone with a drug addiction to recognize the severity of their problem and act on their own. Substance abuse affects mental and physical health and compromises relationships, which makes quitting without professional help challenging. Early intervention improves the chances of successful treatment. You can seek help for anyone you are closely connected to:',
            bullets: [
              'A parent',
              'Your child',
              'A sibling',
              'An employee',
              'A friend or loved one',
            ],
          },
          {
            heading: 'Different approaches to drug interventions',
            body: 'A professional interventionist can advise on the best method, considering the severity of addiction, the individual’s personality, and family dynamics.',
            features: [
              {
                title: 'Classical intervention',
                body: 'Friends or family come together to discuss concerns and encourage treatment by showing how the addiction affects those around them.',
              },
              {
                title: 'Crisis intervention',
                body: 'Used when addiction has reached a critical point and immediate action is necessary, connecting the person with treatment resources.',
              },
              {
                title: 'Motivational interviewing',
                body: 'Explores the individual’s own motivations for change through active, empathetic listening rather than force.',
              },
              {
                title: 'Family systemic intervention',
                body: 'Recognizes that addiction affects the whole family system and works with the entire unit to promote healing.',
              },
              {
                title: 'CRAFT',
                body: 'Community Reinforcement and Family Training helps families improve communication, understand addiction, and plan positive alternatives to substance use.',
              },
              {
                title: 'ARISE intervention',
                body: 'A non-confrontational approach that encourages the individual to take responsibility while receiving support from loved ones.',
              },
            ],
          },
          {
            heading: 'The role of a drug intervention specialist',
            body: 'Interventionists are trained in addiction therapy, counseling, and the dynamics of recovery. They prepare participants emotionally, offer insight into addiction’s complexities, and steer the intervention toward a constructive outcome — moderating the conversation and navigating its emotional highs and lows so the individual feels supported rather than confronted.',
          },
          {
            heading: 'A step-by-step path',
            steps: [
              {
                title: 'Get professional help',
                body: 'Find an interventionist, schedule a consultation, and plan the intervention.',
              },
              {
                title: 'Identify potential obstacles',
                body: 'Anticipate problems and complex scenarios before the intervention.',
              },
              {
                title: 'Choose the intervention team',
                body: 'Select participants who have a positive relationship with the person and understand their roles.',
              },
              {
                title: 'Practice communication',
                body: 'Plan what to say, rehearse the script, and hone active-listening skills.',
              },
              {
                title: 'Predetermine consequences',
                body: 'Decide what actions to take if the individual refuses treatment.',
              },
              {
                title: 'Conduct the intervention',
                body: 'Stick to the script, stay focused on recovery, and direct attention toward treatment resources.',
              },
              {
                title: 'Follow-up care',
                body: 'Support therapy, medical treatment, and lifestyle changes to promote lasting adherence.',
              },
            ],
          },
          {
            heading: 'Recognizing the signs',
            body: 'Different substances come with unique signs and symptoms. Knowing how these behaviors manifest makes it easier to spot them and seek timely intervention:',
            features: [
              {
                title: 'Opioids',
                body: 'Prescription drugs like oxycodone, codeine, and morphine, plus heroin. Symptoms: drowsiness, slowed breathing, constricted pupils, confusion, nausea, and vomiting.',
              },
              {
                title: 'Stimulants',
                body: 'Adderall, cocaine, and methamphetamine. Signs: increased heart rate, elevated blood pressure, dilated pupils, low appetite, insomnia, irritability, and paranoia.',
              },
              {
                title: 'Sedatives & tranquilizers',
                body: 'Central-nervous-system depressants such as benzodiazepines. Signs: blurred vision, headaches, dizziness, impaired coordination, drowsiness, or difficulty speaking.',
              },
            ],
          },
        ],
        faq: [
          {
            q: 'What is a drug intervention, and how does it work?',
            a: 'A drug intervention is a structured meeting where loved ones address an individual’s substance abuse in a supportive manner, aiming to prompt them into seeking treatment. It involves careful planning, a prepared script, and the guidance of a professional to ensure the message is communicated effectively.',
          },
          {
            q: 'When is the right time to consider a drug intervention?',
            a: 'Factors include the type and severity of substance abuse, environmental influences, the person’s willingness to seek help, and the risks of delaying. When someone cannot recognize the severity of their problem on their own, it is often time to act.',
          },
          {
            q: 'What role does a drug intervention specialist play?',
            a: 'A specialist is a trained professional who facilitates the process — helping plan the meeting, guide communication, and manage the emotional dynamics — to ensure the intervention is conducted in a constructive and empathetic manner.',
          },
          {
            q: 'How long does a drug intervention typically take?',
            a: 'The duration can vary but a session typically lasts between one and two hours, depending on the situation and the individual’s response. Expect an emotionally charged meeting that ends with a clear call to action for treatment.',
          },
          {
            q: 'What are the success rates, and what support is available afterward?',
            a: 'Success depends on the individual’s readiness for change and the quality of the intervention and follow-up care. Afterward, ongoing support can include therapy, support groups, and monitoring to encourage continued recovery and prevent relapse.',
          },
        ],
      },
      {
        slug: 'eating-disorder-intervention',
        label: 'Eating Disorder Intervention',
        title: 'Eating disorder intervention services for lasting recovery',
        summary:
          'A whole-person, evidence-based approach to one of the most complex challenges a family can face.',
        image: IMG.hillside,
        intro:
          'Eating disorders can be emotional and difficult realities to face — but with the right support, your loved one can overcome this increasingly common problem.',
        blocks: [
          {
            body: 'Eating disorders affect up to 24 million Americans and 70 million individuals worldwide, while more than 70 million Americans are overweight or obese. Without a doubt, the way we eat affects how we feel and how we live life.',
          },
          {
            heading: 'An approach that treats the whole person',
            body: [
              'In his book JUST 10 LBS, founder Brad Lamm explored the complicated relationship so many have with food — and the steps to take to get help. His work with eating-disorder clients deepened with the documentary series he created and produced with Oprah Winfrey, Addicted to Food.',
              'Rather than focusing on the eating itself and trying to replace it with diet and exercise, we address the situation with a broader scope. Best practices have proven that addressing the whole person — mind, body, and spirit — improves the success of treatment and lifelong recovery.',
            ],
          },
          {
            heading: 'Why professional support is crucial',
            body: [
              'It can be challenging to help a loved one struggling with an eating disorder. People who struggle with addictive behaviors are often in denial and unwilling to seek treatment, unable to see the negative effects their behavior has on their own lives and the lives of those around them — children, siblings, spouses, partners, and parents.',
              'A professional eating disorder intervention can be a powerful way for a family member, colleague, or friend to begin change. We combine our proprietary method — the BreakFree Intervention — with an unsurpassed reputation in crisis intervention as ethical, effective, and professional. Our Fair Care Promise pairs a qualified interventionist with a comprehensive family service plan, so your loved one and your family can move onto a path to lasting change. We help families do what you can’t do on your own — with respect, love, and hope.',
            ],
          },
        ],
      },
      {
        slug: 'mental-health-crisis',
        label: 'Mental Health Crisis Intervention',
        title: 'Mental health interventionist: licensed intervention specialists',
        summary:
          'Compassionate, evidence-based support for depression, anxiety, trauma, and co-occurring disorders.',
        image: IMG.forest,
        intro:
          'In our busy lives, mental health challenges are increasingly common. When someone you care about struggles, it can be confusing and devastating — but there are resourceful ways to help. While an intervention might seem like an ambush, it isn’t; taking the time to help your loved one can make a world of difference.',
        blocks: [
          {
            heading: 'Understanding mental health interventions',
            body: 'No matter the condition — depression, anxiety, addiction, trauma, and more — intervention can be valuable. The goal is to be supportive and offer guidance: not to be debilitating, but a way to overcome mental health challenges together. An intervention team includes professionals, family members, and the person in need.',
          },
          {
            heading: 'Support for co-occurring disorders',
            body: 'Mental health issues often collide with other concerns, like substance abuse or eating disorders. We specialize in services for co-occurring disorders:',
            features: [
              {
                title: 'Drug interventions',
                body: 'We identify the obstacles the person may face and put a unique plan in place.',
              },
              {
                title: 'Alcohol interventions',
                body: 'Using a variety of methods, an interventionist helps identify the best way forward for your loved one.',
              },
              {
                title: 'Eating disorder interventions',
                body: 'Involving therapists, nutritionists, and sometimes medical professionals to pinpoint underlying causes and develop healthy habits.',
              },
            ],
          },
          {
            heading: 'Evidence-based interventions',
            body: 'We leverage processes already proven to work, to maximize growth for those we help:',
            features: [
              {
                title: 'Cognitive behavioral therapy (CBT)',
                body: 'Identify and change negative thinking patterns that contribute to emotional distress.',
              },
              {
                title: 'Dialectical behavior therapy (DBT)',
                body: 'Learn skills to manage emotions and improve relationships.',
              },
              {
                title: 'EMDR',
                body: 'Eye-movement desensitization and reprocessing replaces traumatic experiences with healthier beliefs about them.',
              },
            ],
          },
          {
            heading: 'Therapeutic support',
            features: [
              {
                title: 'One-on-one therapy',
                body: 'Space to unpack feelings and develop coping mechanisms.',
              },
              {
                title: 'Family counseling',
                body: 'Guides families to cope with mental health difficulties together.',
              },
              {
                title: 'Support groups',
                body: 'Others in similar situations encourage understanding and belonging — a great way to manage aftercare.',
              },
              {
                title: 'Specialized programs',
                body: 'Tailored programs help ensure effective, individualized care.',
              },
            ],
          },
          {
            heading: 'What is crisis intervention?',
            body: 'A mental health crisis can lead to an individual posing a risk to themselves or others. Unlike more collaborative interventions, crisis intervention involves immediate action. If a crisis happens, before the intervention team arrives:',
            bullets: [
              'Contact emergency services — if someone is in immediate danger of harming anyone, call 911.',
              'Secure a safe environment — remove any objects that could cause injury.',
              'Provide emotional support — stay calm, and let your loved one know you care and are there for them.',
            ],
          },
          {
            heading: 'Working with a mental health specialist',
            body: 'We favor our proprietary method, BreakFree Intervention — a family-focused approach — and also use Kathleen Murphy’s action-method approach, involving role play. Our specialists include licensed counselors, therapists, and social workers across the United States and Canada.',
            features: [
              {
                title: 'Accessibility',
                body: 'Interventionists from across the United States and Canada.',
              },
              {
                title: 'Expertise & experience',
                body: 'Deep experience with the complex, multi-layered approach treatment requires.',
              },
              {
                title: 'Customized approach',
                body: 'Plans built around your family’s unique needs, with compassionate and confidential care.',
              },
              {
                title: 'Ongoing support',
                body: 'Check-ups to reassess treatment and ensure progress continues after the intervention.',
              },
            ],
          },
        ],
        faq: [
          {
            q: 'What are the signs that someone needs a mental health intervention?',
            a: 'Signs vary from person to person. Common indicators include changes in behavior like social withdrawal, mood swings, persistent irritability or anger, sleep changes, difficulty coping with responsibilities, or self-harm tendencies. If concerned, early intervention can make a positive impact.',
          },
          {
            q: 'What can I expect during a mental health intervention?',
            a: 'A professional team collaborates to create a safe environment for healthy communication. The intervention helps your loved one see why they need professional help. The specifics vary depending on the situation and the approach.',
          },
          {
            q: 'Are there risks associated with mental health interventions?',
            a: 'While interventions should be non-confrontational, the person could resist. Professionals are there to help reduce distress and manage the struggle.',
          },
          {
            q: 'How long does it take to see results?',
            a: 'There is no standard amount of time. How the condition presents, the intervention method, and the person’s commitment all affect improvement. No win is too small during this process, so be sure to celebrate them.',
          },
          {
            q: 'What support is available afterward?',
            a: 'Intervention.com offers follow-up counseling and referrals to treatment programs to ensure continued progress, helping reevaluate an individual’s progress and adjust treatment as needed.',
          },
        ],
      },
      {
        slug: 'complex-trauma',
        label: 'Complex Trauma Intervention',
        title: 'Trauma intervention programs for complex trauma',
        summary:
          'Trauma-informed, evidence-based intervention that helps a person heal — and know they are not alone.',
        image: IMG.valley,
        intro:
          'It is one thing to endure the trauma of a single event; it is entirely different to carry a trauma made of many layers of pain and heartache. A complex trauma intervention provides purposeful solutions to bring the needed healing — and to help a person see they are not alone in the struggle.',
        blocks: [
          {
            body: 'Whether it is a trauma that happened in a moment or the effects of a long-lasting trauma, help can be given to a person of any age to encourage a healthier path forward — and to prevent turning to substances or alcohol as the best way to cope.',
          },
          {
            heading: 'What is complex trauma?',
            body: [
              'Complex trauma is classified as exposure to several traumatic events, usually of an invasive, interpersonal nature. These events can leave lasting effects that may never be resolved without professional help — an inability to escape a “fight, flight, or freeze” mode, a lack of control over emotions, and a distorted sense of self.',
              'When these events happen in childhood, they can manifest in adulthood as post-traumatic stress disorder, depression, and mental health issues that become a gateway for alcohol or drug abuse. When they happen in adulthood — such as domestic violence — coping can trigger changes in behavior, harmful habits, and an unwillingness to get help. Time is of the essence in making sure a person gets the professional help they deserve.',
            ],
          },
          {
            heading: 'Types of trauma intervention',
            body: 'Also known as “trauma-focused treatment,” complex trauma interventions are clinical, evidence-based methods that reduce the effects of PTSD and related behavior through non-medicine means. Because trauma is complex, no single method fits every person, so this work is best handled by a licensed professional.',
            features: [
              {
                title: 'EMDR',
                body: 'Eye-movement desensitization and reprocessing uses tones or gentle tapping to help a person reprocess trauma and exchange it for healthier beliefs.',
              },
              {
                title: 'Cognitive behavioral therapy (CBT)',
                body: 'The person and therapist examine the connection between feelings, thoughts, and behaviors, then begin to change how they act and interpret the trauma.',
              },
              {
                title: 'Talk therapy',
                body: 'A licensed therapist explores feelings and emotions to find where emotional stress lives and how best to lessen the symptoms and strengthen the person.',
              },
            ],
          },
          {
            heading: 'How interventionists help',
            body: [
              'The goal is to help a person realize how deeply traumatic events have affected them — often events from early in life connected to current struggles. The intervention allows a person to step back from daily routine and focus on processing their feelings, emotions, behaviors, and internal thoughts.',
              'Interventionists provide a reassuring, clinical ear, affirming that what a person feels is real trauma that needs healing — not something in their head or something they deserved. Above all, they help people know they have control again: over the trauma and its emotions, over healthy relationships, and over their own recovery. Letting people know there is hope for a return to normalcy is the greatest result a complex trauma intervention can bring.',
            ],
          },
        ],
      },
      {
        slug: 'early-autism',
        label: 'Early Autism Intervention',
        title: 'Early autism intervention',
        summary:
          'Developmentally sensitive, early support that gives children with autism a focused, more successful path forward.',
        image: IMG.meadow,
        intro:
          'What was once a heartbreaking, isolating journey for families has become a growing community of hope and a lesson in the awareness of our differences. Through early intervention for autism — with advanced testing that can start at a very young age — parents are finding real hope for their children.',
        blocks: [
          {
            body: 'Autism spectrum disorder (ASD) embodies various conditions related to communication, behavior, and social-skill struggles that affect 1 in 44 children in the United States. What used to be a confusing journey for families has become more focused and successful through the help of early intervention.',
          },
          {
            heading: 'What is early intervention for autism?',
            body: [
              'When a parent notices unusual behavior or delays in social and behavioral development, questions may arise about autism. After an official ASD diagnosis, the question becomes what the next step will be to help a child get the proper care they need.',
              'Early interventions create better strategies that assist in growing the cognitive and behavioral skills children with autism find challenging. It is rarely one therapy for everyone — because every child is different, it is usually several therapies brought together, handled by one professional or several, all with the goal of helping a child grow and develop.',
            ],
          },
          {
            heading: 'Types of therapies and interventions',
            body: 'There are several types of therapies available to cater to the challenges a child with autism faces. Meeting and strategizing with a qualified medical professional is the best approach before beginning anything.',
            features: [
              {
                title: 'Developmental',
                body: 'Focuses on developing the skills needed for daily life and healthy relationships — using facial expressions, gestures, and child-led play to build a bond that becomes the gateway to growth.',
              },
              {
                title: 'Behavioral',
                body: 'Concentrates on outward behavior. Applied Behavioral Analysis (ABA) studies how environmental factors affect development, reinforcing new skills while discouraging harmful, repetitive behaviors.',
              },
              {
                title: 'Educational',
                body: 'Occurs in a classroom setting. Programs like TEACCH use consistency and visual learning — written schedules, learning stations, and visual demonstrations of directions.',
              },
            ],
          },
          {
            heading: 'The benefits of starting early',
            body: 'The earlier a child enters a program, while they are still learning skills, the more their development improves over time. A diagnostic report highlights your child’s strengths and weaknesses and acts as a guide to the right therapy strategy. Family therapy programs let the whole family take part, forming strong relationships and bringing greater awareness to daily life on the spectrum.',
          },
        ],
      },
    ],
  },
  {
    slug: 'services',
    label: 'Services',
    title: 'Find an interventionist and help your loved one get better.',
    summary:
      'Work with a licensed interventionist — backed by a full continuum of care that carries your family from crisis to lasting recovery.',
    intro:
      'It’s tough to imagine a family member or friend struggling with addiction, but anyone can be affected. There are limits to what you can do to motivate a loved one to stop using — and when there is nothing else to do, an intervention might be the best next step.',
    blocks: [
      {
        heading: 'What is an interventionist?',
        body: [
          'An interventionist helps address an alcohol or drug addiction by guiding people through this difficult process, providing professional guidance and a structured approach in a nurturing, safe, and constructive environment.',
          'Interventionists are skilled at dealing with the complex emotional dynamics of addiction, and their expertise increases the likelihood of the individual accepting help. Recognizing early whether a loved one needs a drug or alcohol intervention can meaningfully improve treatment outcomes.',
        ],
      },
      {
        heading: 'Meet Brad Lamm — our founder',
        body: [
          'Brad began his own recovery journey in 2003 from drugs, bulimia, nicotine, and alcohol. What seemed like an impossible challenge showed how even the most difficult cases might not just recover, but thrive from a starting point of hopelessness.',
          'Through his clinical intervention training events, Brad has trained the majority of the nation’s leading interventionists. He has served on the board of the Association of Intervention Specialists and worked at the state level to introduce treatment options to communities.',
        ],
      },
      {
        heading: 'How we can help',
        body: 'We believe every family deserves a fair chance at receiving ethical, effective care, with real help as the focus.',
        features: [
          {
            title: 'Drug interventions',
            body: 'A drug intervention — what we call a Family Meeting — is a hope-infused conversation among the voices that matter to your loved one: family, friends, and even colleagues. We’ve been doing this for more than a decade at Change Institute, helping thousands of families.',
          },
          {
            title: 'Mental health interventions',
            body: 'Our specialists include licensed counselors, therapists, and social workers. We favor our proprietary BreakFree Intervention and Kathleen Murphy’s action-method approach, involving role play.',
          },
        ],
      },
      {
        heading: 'Find an interventionist near you',
        body: 'We work with interventionists in many locations across the country. Give us a call, and we’ll help connect you with the right professional for your family — the nation’s best.',
      },
    ],
    faq: [
      {
        q: 'What is a drug or alcohol intervention, and how does it work?',
        a: 'An intervention is a structured gathering involving concerned individuals and the person struggling with addiction. Participants express their concerns openly and comprehensively, with the goal of encouraging the individual to seek help for their situation.',
      },
      {
        q: 'How do I know if someone I care about needs an intervention?',
        a: 'Signs may include declining health, deception or lying about the addiction, risky or destructive behavior, constant craving for their drug of choice, and refusing treatment when confronted.',
      },
      {
        q: 'What should I expect during the intervention process?',
        a: 'On the day, the interventionist serves as a neutral mediator, facilitating a respectful dialogue between the person who needs help and the people who want to help them — keeping the conversation focused on acceptance and treatment.',
      },
      {
        q: 'What role do interventionists play, and how do I choose the right one?',
        a: 'Your licensed interventionist offers guidance, assistance, and resources, creating a plan that addresses each individual’s needs. When choosing one, research, shortlist, and interview candidates to gauge their experience and how comfortable they make you feel.',
      },
      {
        q: 'What happens after the intervention?',
        a: 'Post-intervention, your interventionist continues to offer support and guidance for both the individual and the family, helping map out next steps — whether detox, therapy, or other recovery plans.',
      },
    ],
    childrenEyebrow: 'What we offer',
    childrenTitle: 'Services & programs.',
    image: IMG.water,
    children: [
      {
        slug: 'senior-support-services',
        label: 'Senior Support Services',
        title: 'Senior Support Services',
        summary:
          'Compassionate, expert guidance for families navigating the behavioral and safety changes that come with aging.',
        image: IMG.hillside,
        intro:
          'Navigating the behavioral changes in aging loved ones can be challenging, especially regarding their independence. Whether it’s convincing them to relinquish the car keys or facilitating their move to an assisted living facility, these moments can be deeply emotional and fraught with tension. That’s where senior recovery support services come into play. Intervention.com specializes in providing an essential bridge between your concerns and your loved ones’ needs.',
        blocks: [
          {
            body: [
              'Our approach is rooted in empathy, experience, and evidence-based strategies. We understand the complexities that accompany aging and the specific challenges it poses to seniors and their families.',
              'By leveraging our decades of experience and specialized expertise in senior care, we help families navigate these pivotal moments in their loved ones’ lives. Our comprehensive senior support services prioritize safety and well-being and foster stronger relationships, providing guidance and peace of mind for all involved.',
            ],
          },
          {
            heading: 'What are senior support services?',
            body: [
              'Senior support services are specialized interventions designed to address behavioral changes in older adults that may impact their well-being and the harmony of the family unit. These services provide the necessary guidance and strategies to help navigate sensitive issues, such as convincing older adults to stop driving or transition to assisted living.',
              'With our senior support services, we aim to mitigate the stress and anxiety associated with these transitions. Our approach is based on empathy, respect, and professional expertise, ensuring that each intervention is tailored to the needs of the seniors and their families.',
              'In addition, we aim to create an environment of understanding and cooperation where everyone feels heard and respected. Remember, our senior support services are more than just interventions. They are a partnership, a commitment to ensuring the safety and well-being of your aging loved one while preserving the bond that holds your family together.',
            ],
          },
          {
            heading: 'How do you know if an older adult needs support?',
            body: [
              'Recognizing when an older person needs support can sometimes be a challenging process. Often, the signs might be subtle and can be mistaken for typical aging. However, specific indications suggest your loved one could benefit from our senior support services.',
              'You might notice a decline in their ability to perform daily activities, such as cooking, cleaning, or personal care. Maybe they’re struggling to manage their finances or medication, or perhaps they’re facing difficulty in driving safely. Emotional cues, such as increased anxiety, depression, or isolation, might also hint at a need for additional support.',
              'Transitioning to an assisted living facility is another crucial point where seniors often require support. Such a change can trigger feelings of loss or fear, and the decision-making process can be daunting for seniors and their loved ones.',
              'At Intervention.com, we understand these challenges and provide compassionate, respectful guidance throughout these transitions. Our senior support services aim to facilitate these conversations and assist seniors and their families navigate these complex decisions. Remember, asking for help isn’t a sign of weakness; it’s a step toward ensuring the safety, health, and happiness of your loved one.',
            ],
          },
          {
            heading: 'What senior support services do we provide?',
            body: [
              'At Intervention.com, we offer a comprehensive range of senior support services tailored to address the challenges that arise as our loved ones age.',
              'Our team understands that each senior and their family is different, each with their concerns and reservations. That’s why we take a personalized approach, focusing on respectful dialogue and understanding to guide seniors toward healthy decisions.',
            ],
          },
          {
            heading: 'Convince to stop driving a car',
            body: [
              'Driving offers a sense of independence that we all value. For seniors, giving up driving can feel like a significant loss of autonomy. However, there comes a point where safety concerns must take precedence, both for the elderly individual and for others on the road.',
              'If you’ve noticed declining driving skills in your loved one, like slow reactions, confusion at familiar locations, or difficulty following traffic signals, it might be time to talk about giving up driving.',
              'Our team at Intervention.com is here to help navigate this tricky conversation. Considering the emotional challenges involved, we approach this issue with sensitivity and respect. We support older adults to understand the dangers, explore alternative transportation options, and eventually transition smoothly to a non-driving lifestyle.',
            ],
          },
          {
            heading: 'Convince to relocate to an assisted living',
            body: [
              'Relocating to an assisted living facility can be an emotionally charged decision for seniors. Despite the benefits like round-the-clock care, social activities, and less home maintenance, the thought of leaving their familiar environment can be daunting. That’s where our senior support services step in.',
              'We take a gentle, informed approach to explain the benefits of assisted living. Our interventionists provide information, address concerns, and help seniors and their families visualize a positive future in an assisted living environment.',
              'Intervention.com is committed to making this transition as comfortable and stress-free as possible, always respecting the senior’s autonomy and dignity.',
            ],
          },
          {
            heading: 'How is our approach to senior support services?',
            body: 'We believe in empowering seniors and their families to navigate life’s transitions with dignity and respect. Our approach to senior support services is multidisciplinary, rooted in a deep understanding of seniors’ particular challenges. Here’s how we guide you through this journey:',
            steps: [
              {
                title: 'Initial consultation',
                body: 'We start by having a detailed discussion with the family members about their concerns, understanding the circumstances and the personality of the seniors involved. It helps us develop an intervention strategy that is tailored to the elderly individual’s needs and preferences.',
              },
              {
                title: 'Preparation',
                body: 'Our interventionists then prepare the family for the intervention process. It involves educating family members about the specific issues they are confronting, the intervention process, and how they can effectively communicate their concerns and love for the senior. Our priority is to ensure everyone is on the same page before the intervention occurs.',
              },
              {
                title: 'The intervention',
                body: 'The intervention itself is conducted in a non-confrontational manner. We encourage open dialogue where family members can express their worries and desire for change, all while maintaining the senior’s dignity. The goal is not to coerce the senior into making a decision but to help them understand why the change is necessary and beneficial.',
              },
              {
                title: 'Post-intervention support',
                body: 'After the intervention, we don’t simply walk away. We stay connected, providing post-intervention support and guidance. We assist the senior and the family in implementing the agreed-upon changes and adapt to their new lifestyle. This continuous support ensures a smooth transition and a positive outcome.',
              },
              {
                title: 'Collaboration with healthcare providers',
                body: 'Throughout the process, we collaborate with healthcare providers, therapists, and counselors who specialize in senior care. It ensures that the senior gets the best comprehensive care possible and that all aspects of their well-being are considered.',
              },
            ],
          },
          {
            heading: 'The benefits of senior support services for the elderly and the family',
            body: 'Senior support services provided by Intervention.com offer immense benefits to older adults and their families. Our holistic approach ensures that the pressing issues at hand are addressed and the overall quality of life for the older adult and their loved ones is improved. Here’s how we can make a difference:',
          },
          {
            heading: 'For the elderly',
            features: [
              {
                title: 'Enhanced safety',
                body: 'Whether it’s surrendering the car keys or moving into an assisted living facility, our services aim to ensure seniors’ safety, which becomes primordial as they age.',
              },
              {
                title: 'Improved quality of life',
                body: 'By addressing issues like unsafe driving or living conditions, we help seniors live more comfortably, thus improving their overall quality of life.',
              },
              {
                title: 'Maintaining dignity and independence',
                body: 'We ensure the senior’s autonomy is respected despite the changes. We help them understand that these changes are not an end but a new beginning to live life with dignity and independence.',
              },
              {
                title: 'Healthcare collaboration',
                body: 'We collaborate with healthcare providers to ensure the senior’s physical and mental health is taken care of, providing a holistic approach to their well-being.',
              },
              {
                title: 'Long-term support',
                body: 'We don’t leave once the intervention is over. Our long-term support ensures continuity of care and addresses any challenges that might arise in the future.',
              },
            ],
          },
          {
            heading: 'For the family',
            features: [
              {
                title: 'Peace of mind',
                body: 'Knowing that their loved one is safe, well-cared for, and living a quality life brings immense peace of mind to the family.',
              },
              {
                title: 'Reduced stress',
                body: 'Managing the transitions of aging can be stressful. We lift this burden, guiding and supporting you through the process.',
              },
              {
                title: 'Improved relationships',
                body: 'Our interventions can help reduce family tension, foster understanding, and enhance the quality of relationships between seniors and their loved ones.',
              },
              {
                title: 'Education and support',
                body: 'We provide families with resources, knowledge, and support, empowering them to make informed decisions and support their elderly loved ones in the best possible way.',
              },
            ],
          },
          {
            heading: 'The importance of professional interventionists in senior support',
            body: [
              'Facing the complex and emotional challenges of aging is no small task. The conversations around significant lifestyle changes are often met with resistance, confusion, or even fear from our elderly loved ones. That’s where professional interventionists step in to provide much-needed guidance and support.',
              'Professional interventionists possess a unique skill set that combines empathy and effective communication strategies. Their primary role is to facilitate a process of understanding and change, ensuring that all voices are heard and respected. They’re trained to manage complex dynamics, to understand the fears and concerns of both the seniors and their families, and to guide those involved toward a resolution that benefits the elderly individual.',
              'Professional interventionists transform tough discussions into constructive dialogues, leading to solutions that benefit everyone involved.',
            ],
          },
          {
            heading: 'Why choose Intervention.com for senior support services?',
            body: 'Choosing an intervention service for your loved one is an important decision. At Intervention.com, we understand this and strive to provide unmatched services that reflect our deep commitment to the well-being of seniors and their families. Here’s why our senior support services stand out:',
            features: [
              {
                title: 'Specialized expertise in senior care',
                body: 'Our team comprises professionals specializing in senior care, bringing an unmatched depth of understanding to the issues at hand.',
              },
              {
                title: 'Comprehensive, multidisciplinary approach',
                body: 'We utilize a holistic approach that addresses all aspects of older adults’ life and well-being. We focus on their safety and health, while also considering the well-being of their families.',
              },
              {
                title: 'Treatment of co-occurring disorders',
                body: 'If underlying health conditions contribute to behavioral issues, our team collaborates with healthcare providers to ensure these are addressed.',
              },
              {
                title: 'Family education and support',
                body: 'We believe in empowering families. To that end, we provide them with the necessary education and support, enabling them to become more effective caregivers and advocates.',
              },
              {
                title: 'Long-term support and continuity of care',
                body: 'Our involvement doesn’t end with a single intervention. We provide long-term support, ensuring continuity of care and a lasting positive impact.',
              },
              {
                title: 'Respect for autonomy and dignity',
                body: 'We believe in preserving the autonomy and dignity of every senior we work with. Our interventions are designed to be respectful and supportive, not coercive.',
              },
              {
                title: 'Privacy and confidentiality',
                body: 'We maintain strict confidentiality standards, ensuring the privacy of older adults and their families is always respected.',
              },
            ],
          },
          {
            heading: 'Get started with our senior support services',
            body: [
              'You don’t have to face these challenging changes on your own. Whether you’re trying to encourage a loved one to relinquish their car keys or transition to an assisted living community, our team at Intervention.com is here to help. We understand the complexities and emotions involved in these decisions, and we are committed to supporting you every step of the way.',
              'Our professional interventionists are ready to partner with you, providing the expertise, empathy, and long-term support necessary to facilitate these transitions smoothly. It’s time to ease the stress, improve your family’s quality of life, and ensure your loved one receives the care and respect they deserve.',
            ],
          },
        ],
        faq: [
          {
            q: 'What if my loved one is resistant to change?',
            a: 'It’s common for seniors to resist change, especially when it comes to significant lifestyle shifts like giving up driving or moving to assisted living. Our professional interventionists are trained to handle such situations. They use effective communication strategies to help the seniors understand the need for change while respecting their feelings and concerns.',
          },
          {
            q: 'How does Intervention.com ensure the privacy of its clients?',
            a: 'Respecting our clients’ privacy is one of our top priorities. All information we share is confidential and used solely to provide the best care possible. Our professional interventionists adhere to strict ethical standards to handle your loved one’s situation with discretion and respect.',
          },
          {
            q: 'Do you provide support for the family as well?',
            a: 'Absolutely. The intervention process often involves educating and guiding family members, helping them understand their loved one’s situation and how best to support them. We also offer long-term support, providing a stable foundation for the family as they navigate this new chapter.',
          },
          {
            q: 'What happens after the initial intervention?',
            a: 'After the initial intervention, our team continues assisting and guiding the seniors and their families. It can include helping them adapt to new living conditions, providing resources for additional care, or simply being there for emotional support. We aim to make this transition as smooth as possible for everyone involved.',
          },
          {
            q: 'How long does the intervention process typically take?',
            a: 'The duration of the intervention process can vary depending on the individual circumstances and complexity of the case. Our goal is to ensure a thorough, effective intervention. We take the time needed to ensure all parties feel heard, understood, and comfortable with the proposed solutions.',
          },
        ],
      },
      {
        slug: 'on-set-care-unit',
        label: 'On-Set CARE Unit',
        title: 'On-Set C.A.R.E. Unit',
        summary:
          'Comprehensive Assessment & Recovery Experience — mobile behavioral-health support that protects the emotional health of production teams.',
        image: IMG.shore,
        intro:
          'C.A.R.E. Unit programs support the emotional health of teams in a production bubble. Every production’s weakest link is its most vulnerable member — and with Program Director Mackenzie Phillips connecting production teams to our clinical team, on-the-job safety has never been more vital.',
        blocks: [
          {
            heading: 'How the C.A.R.E. Unit helps',
            bullets: [
              'Improve on-set safety',
              'Expand engagement',
              'Reduce self-harm incidents',
              'Promote productivity',
              'Support a caring culture',
              'Activate self-care',
            ],
          },
          {
            heading: 'Three pillars of support',
            body: 'C.A.R.E. Unit pillars establish group and individualized levels of help, tailored to each production team and member:',
            features: [
              {
                title: 'Embedded clinical care',
                body: 'On-site clinical presence integrated directly into the production.',
              },
              {
                title: 'Wellness coaching',
                body: 'Coaching from qualified professionals (CADAC or CIP minimum).',
              },
              {
                title: 'Case management',
                body: 'Coordinated management of each member’s needs.',
              },
            ],
          },
          {
            heading: 'On-demand resources',
            bullets: [
              'Screening & intervention',
              '24/7 crisis management',
              'Counseling sessions',
              'Appropriate referrals',
              'TeleHealth sessions',
              'Check-in app',
            ],
          },
          {
            body: 'With more than fifteen years serving the B2B needs of studios, labels, and management, founder Brad Lamm has perfected mobile behavioral-health support since 2005. The C.A.R.E. Unit supports on-set safety through scheduled and on-call care, confidential assessment, and triage — transformational tools from team members Brad Lamm and Mackenzie Phillips.',
          },
        ],
      },
      {
        slug: 'care-unit-assessment',
        label: 'CARE Unit Assessment',
        title: 'CARE Unit Assessment',
        summary:
          'A comprehensive, whole-person assessment — considering every aspect of an individual’s life before care is recommended.',
        image: IMG.water,
        intro:
          'The CARE Unit (Comprehensive Assessment and Recovery Experience Unit) is a leading destination for those seeking consults and support. This assessment considers all aspects of an individual’s life before care is recommended. Our self-pay CARE Unit helps reduce suffering and improve quality of life through personalized attention that addresses more than just symptoms.',
        blocks: [
          {
            body: 'Our team of expert behavioral-health and medical assessors ensures clear diagnosis and more accurate treatment of each client’s complex symptoms. The CARE Unit supports and motivates clients to pursue post-assessment treatment options, resulting in better opportunities for successful recovery and healing.',
          },
          {
            heading: 'How the assessment works',
            body: 'The CARE Unit carries out a thorough evaluation of each individual’s needs through written, spoken, historical, and observed interactions, led by a team of psychiatric and medical care providers with therapists and counselors assisting. This is followed by a findings session and a custom-crafted care recommendation. As preferred providers, we work with participating Cedars-Sinai Medical Center departments in Southern California, or at the client’s home.',
          },
          {
            heading: 'Initial assessment',
            body: 'The initial assessment involves a detailed evaluation of medical history, substance-use patterns, and any co-occurring mental health conditions. Unlike traditional half-hour or hour-long phone assessments, the CARE Unit involves a short-stay residential evaluation — usually 21–28 days — where your loved one receives psychological and personality testing and therapy.',
          },
          {
            heading: 'Comprehensive evaluation',
            body: 'Our comprehensive evaluation covers multiple aspects of the individual’s life:',
            features: [
              {
                title: 'Medical evaluation',
                body: 'Assessing physical health and any medical conditions that may impact recovery.',
              },
              {
                title: 'Psychological assessment',
                body: 'Evaluating mental-health status and identifying any co-occurring disorders.',
              },
              {
                title: 'Social evaluation',
                body: 'Understanding the individual’s social environment and support systems.',
              },
            ],
          },
          {
            heading: 'Personalized care plan',
            body: 'Our care plans go beyond perceived treatment needs, highlighting treatment based on each individual’s unique circumstances:',
            features: [
              {
                title: 'Treatment recommendations',
                body: 'Suggestions for medical detox, residential treatment, or outpatient programs.',
              },
              {
                title: 'Support services',
                body: 'Access to various therapies, counseling, and support groups.',
              },
              {
                title: 'Family involvement',
                body: 'Strategies for involving family members to provide a supportive environment.',
              },
            ],
          },
          {
            heading: 'Ongoing monitoring and support',
            body: 'Our commitment doesn’t end with the initial assessment. We provide ongoing monitoring — regular follow-ups, adjustments to the care plan as needed, and continuous communication with healthcare providers and family members — so the individual stays on track with their recovery goals.',
          },
        ],
      },
      {
        slug: 'recovery-care-management',
        label: 'Recovery Care Management',
        title: 'Recovery Care Management',
        summary:
          'After-intervention support that helps recovery truly take hold — through medication management, testing, and family education.',
        image: IMG.forest,
        intro:
          'Like any skill, changing how someone takes care of themselves requires practice and tools. Recovery Care Management is a vital phase of change for every client: following the initial intervention, we commit resources to continued recovery — often including medication management and medical detox support — extending through residential or outpatient treatment into a transformative experience where recovery can truly take hold.',
        blocks: [
          {
            heading: 'Our services',
            body: 'Our comprehensive Recovery Care Management services provide after-intervention support throughout the recovery journey, tailored to each individual and family and reinforced by professional collaborators such as the Shadow Hills Riding Club, which offers trauma-recovery support.',
            features: [
              {
                title: 'Safe transport',
                body: 'Our Recovery Coach Companions provide more than transport from home to rehab — they offer a safe, supportive journey so your loved one feels secure, setting a positive tone for recovery from the beginning.',
              },
              {
                title: 'Regular toxicology testing',
                body: 'Focused on the accuracy of self-reports rather than surveillance, we offer scheduled, on-demand, and observed specimen collection. This reduces the enforcement burden on families and promotes accountability and peace of mind.',
              },
              {
                title: 'Supportive Family Class',
                body: 'A six-month, classroom-style curriculum that equips families with information and inspiration — covering communication, understanding addiction, coping strategies, and self-care — so they can be strong pillars of support.',
              },
            ],
          },
          {
            body: 'Recovery Care Management ensures that support continues beyond the intervention day, solidifying long-term recovery and fostering a firewall between healing and prior negative habits.',
          },
        ],
      },
      {
        slug: 'recovery-coach-companion',
        label: 'Recovery Coach Companion',
        title: 'Recovery Coach Companion',
        summary:
          'A trained companion who travels alongside your loved one through early and ongoing recovery — 24/7.',
        image: IMG.meadow,
        intro:
          'A Recovery Coach Companion is one who travels alongside your loved one as they navigate early and ongoing recovery. With care, management, accountability, and structure, this system grows and establishes roots to live on its own.',
        blocks: [
          {
            body: 'Our 24/7 Recovery Coach Companion services are tailored to each client’s unique needs, balancing family priorities with the treatment team’s clinical recommendations for comprehensive, personalized support.',
          },
          {
            heading: 'Personalized support',
            body: 'Custom-crafted, uninterrupted support that adapts to your loved one’s evolving needs. Care is often split between two Companions on 12-hour shifts, or a single Companion when a higher level of safety is demonstrated:',
            features: [
              {
                title: 'Daily assistance',
                body: 'Helping with daily tasks and activities to ensure a structured, supportive environment.',
              },
              {
                title: 'Emotional support',
                body: 'A constant source of encouragement from CIP- and CADC-qualified team members.',
              },
              {
                title: 'Goal setting',
                body: 'Assisting in setting and achieving personal recovery goals.',
              },
              {
                title: 'Return to routine',
                body: 'Aiding adjustment to day-to-day tasks like a part-time job or school.',
              },
            ],
          },
          {
            heading: 'Family integration',
            features: [
              {
                title: 'Communication',
                body: 'Facilitating open, honest communication between client and family, with contingency planning.',
              },
              {
                title: 'Education',
                body: 'Providing families the knowledge and tools to support their loved one effectively and compassionately.',
              },
              {
                title: 'Support planning',
                body: 'Developing comprehensive support plans that involve the entire family.',
              },
            ],
          },
          {
            heading: 'Clinical collaboration',
            features: [
              {
                title: 'Treatment recommendations',
                body: 'Implementing the treatment team’s clinical recommendations and building consensus with the client.',
              },
              {
                title: 'Progress monitoring',
                body: 'Regularly updating the treatment team and HIPAA-authorized parties on progress and challenges.',
              },
              {
                title: 'Integrated care',
                body: 'Coordinating with other providers on all aspects of health — including relapse prevention and wellness integration like fitness and nutrition.',
              },
            ],
          },
        ],
      },
      {
        slug: 'breakfree-journey',
        label: 'BreakFree Journey',
        title: 'BreakFree Journey',
        summary:
          'Our deepest, most intensive program — a concierge, mind–body–spirit journey where transformation is the greatest adventure.',
        image: IMG.valley,
        intro:
          'A BreakFree Journey teaches us how to make change stick — to move through stages and phases in a systematic, thoughtful way, and to grow. Together we ask and answer the question: how good can I get, and what is required to get there?',
        blocks: [
          {
            heading: 'How it works',
            body: [
              'Our treatment plan is holistic, incorporating an integrative mind–body–spirit approach: fresh air, adventure, deep soul-searching, and spirit-infused work, with daily journaling, service to others, and active living — a moving meditation of sorts.',
              'Highly intensive and structured as a concierge service, a BreakFree Journey is a series of tasks — scheduled six days each week — that take you into study, service, challenges, and events from your past to add insight and evoke answers, with 24/7 companion coverage to engage, contain, and process the work.',
            ],
          },
          {
            heading: 'Lasting change',
            body: 'The BreakFree Journey offers support for the whole family, identifying and answering questions in new, robust, and healthful ways. We integrate yoga, Ayurvedic principles, deep breathing, and relaxation techniques with active, experiential opportunities — building confidence and releasing old habits to evolve into a healthier, stronger you.',
          },
          {
            heading: 'It’s never too late to start',
            body: 'This is also our deepest spiritual program: we explore the influence a higher power can have on our lives, letting you determine your own beliefs. Sometimes it is enough just to be willing to be willing — that’s a good place to start. The journey is an alcohol- and drug-free effort that stimulates your sense of responsibility and connection to the people you love and the life you desire.',
          },
          {
            heading: 'Shadow Hills Ranch',
            body: 'Our primary location for BreakFree Journeys is Shadow Hills Ranch, just north of our campus in Shadow Hills, CA. Living on a working farm, participating in equine therapy, and volunteering with the animals and a therapeutic riding program deepen a sense of purpose and responsibility — and once engaged in this service, a transformation of epic proportions can begin.',
          },
        ],
      },
    ],
  },
  {
    slug: 'resources',
    label: 'Resources',
    title: 'Resources',
    summary:
      'Research, outcome data, and family resources — grounded in the evidence-based ARISE® invitational intervention model.',
    intro:
      'Below is information regarding the invitational intervention protocol — A Relational Intervention Sequence for Engagement (the ARISE® intervention).',
    blocks: [
      {
        heading: 'The most-engaging intervention model',
        body: [
          'The research’s lead authors, Landau and Garrett, were Brad’s mentors. Brad has worked to popularize this evidence-based model — the one with the highest engagement rate of any intervention method.',
          'His work is built on this model, with the largest actual practice of it by a single agency: over 3,000 successful cases managed since 2005.',
        ],
      },
      {
        heading: 'Outcome data (NIDA clinical trial)',
        body: 'A clinical trial in the United States through the National Institute on Drug Abuse (NIDA) produced the following results, with real-world replication studies showing durable sobriety:',
        stats: [
          {
            value: '83%',
            label: 'of addicted individuals entered treatment within three weeks',
          },
          {
            value: '96%',
            label: 'entered treatment within six months',
          },
          {
            value: '61%',
            label:
              'sober by the end of the first year in replication studies (with another 10% using less)',
          },
          {
            value: '3,000+',
            label: 'successful cases managed by a single agency since 2005',
          },
        ],
      },
      {
        heading: 'Get the free ebook',
        body: 'Sign up to receive a free copy of “How to Help Someone You Love” by Brad Lamm. Reach out through our contact page and we’ll send it your way.',
      },
    ],
    childrenEyebrow: 'Explore',
    childrenTitle: 'Ways to go deeper.',
    image: IMG.forest,
    children: [],
  },
];

export function getSection(slug: string): Section | undefined {
  return SECTIONS.find((s) => s.slug === slug);
}

export function getDetail(
  sectionSlug: string,
  detailSlug: string
): { section: Section; detail: DetailContent } | undefined {
  const section = getSection(sectionSlug);
  const detail = section?.children.find((c) => c.slug === detailSlug);
  if (!section || !detail) return undefined;
  return { section, detail };
}
