'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, Phone } from 'lucide-react';

/**
 * Native contact form styled with the site design system, submitting to the
 * same HubSpot form the live intervention.com uses (portal 46095144). Field
 * names, options, and consent text mirror the HubSpot form definition, so
 * submissions land in the same form with the same workflows and notifications.
 *
 * IMPORTANT: HubSpot rejects API submissions while "CAPTCHA (spam prevention)"
 * is enabled on the form (error FORM_HAS_RECAPTCHA_ENABLED). It must be turned
 * off in HubSpot (Forms > this form > Options) for this component to deliver.
 * Spam defense without CAPTCHA: a honeypot, time-on-page, a resubmit cooldown,
 * and server-side scoring in /api/contact (see src/app/api/contact). If that
 * route is unreachable the form falls back to submitting straight to HubSpot so
 * a genuine inquiry is never lost.
 */
const PORTAL_ID = '46095144';
export const CONTACT_FORM_ID = '4fd83930-97c1-4d8a-a51b-3fd18583507e';
const SUBMIT_URL = `https://api.hsforms.com/submissions/v3/integration/submit/${PORTAL_ID}/${CONTACT_FORM_ID}`;

/* Consent copy from the HubSpot form definition (dataPrivacy module). */
const CONSENT_EMAIL = {
  subscriptionTypeId: 341967739,
  text: 'I agree to receive one-to-one communications from Change Institute Inc. via email for marketing, service coordination, and communication purposes. Marketing emails will be limited to less than 6 per month.',
};
const CONSENT_PHONE = {
  subscriptionTypeId: 1707789203,
  text: 'I agree to receive phone calls and text messages from a Change Institute Inc. representative as necessary to coordinate services. Calls and message frequency varies based on service needs. Standard messaging and data rates may apply.',
};
const CONSENT_PROCESSING =
  'I agree to allow Change Institute Inc. to store and process my personal data for the purpose of coordinating services and communication.';

const TIMEFRAME_OPTIONS = ['This Week', 'This Month', 'Later This Year'];
const INSURANCE_OPTIONS = [
  'Private',
  'Medicaid',
  'Self-Pay',
  'State or federal insurance',
];
const BUDGET_OPTIONS = [
  'No Resources',
  'Self-Pay',
  '$250-$500',
  '$500-$2500',
  '$2500+',
];

function readCookie(name: string): string | undefined {
  const m = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return m ? decodeURIComponent(m[1]) : undefined;
}

// Neutral name so browser autofill never fills the honeypot for a real person.
const HONEYPOT = 'hp_c7f3';
const COOLDOWN_KEY = 'contact_sent_at';
const COOLDOWN_MS = 20_000;

function recentlySent(): boolean {
  try {
    const at = Number(sessionStorage.getItem(COOLDOWN_KEY) ?? 0);
    return at > 0 && Date.now() - at < COOLDOWN_MS;
  } catch {
    return false;
  }
}

function markSent() {
  try {
    sessionStorage.setItem(COOLDOWN_KEY, String(Date.now()));
  } catch {
    // Storage blocked (private mode): the cooldown is a nicety, not required.
  }
}

type Status = 'idle' | 'submitting' | 'sent' | 'error';

export function HubSpotContactForm({
  phoneDisplay,
  phoneHref,
}: {
  phoneDisplay: string;
  phoneHref: string;
}) {
  const [status, setStatus] = useState<Status>('idle');
  const startedAt = useRef(0);

  useEffect(() => {
    startedAt.current = Date.now();
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === 'submitting') return;
    const form = e.currentTarget;
    const data = new FormData(form);

    // Honeypot: bots fill every field; humans never see this one. Show the
    // normal thank-you and send nothing, so a bot gets no signal to adapt to.
    const honeypot = String(data.get(HONEYPOT) ?? '');
    if (honeypot) {
      setStatus('sent');
      return;
    }

    // Double-submit / rapid resubmit: treat as already sent.
    if (recentlySent()) {
      setStatus('sent');
      return;
    }

    const fieldNames = [
      'firstname',
      'lastname',
      'email',
      'mobilephone',
      'best_time_to_call_',
      'ok_to_leave_voicemail_',
      'address',
      'city',
      'state',
      'ilo_street',
      'ilo_city',
      'ilo_state',
      'your_timeframe_for_intervention',
      'insurance_type',
      'intervention_budget',
      'contact_form_message',
    ];
    const fields = fieldNames
      .map((name) => ({
        objectTypeId: '0-1',
        name,
        value: String(data.get(name) ?? '').trim(),
      }))
      .filter((f) => f.value !== '');
    fields.push({ objectTypeId: '0-1', name: 'hs_lead_status', value: 'NEW' });

    const payload = {
      fields,
      context: {
        hutk: readCookie('hubspotutk'),
        pageUri: window.location.href,
        pageName: document.title,
      },
      legalConsentOptions: {
        consent: {
          consented: true,
          text: CONSENT_PROCESSING,
          communications: [
            { value: true, ...CONSENT_EMAIL },
            { value: true, ...CONSENT_PHONE },
          ],
        },
      },
    };

    setStatus('submitting');
    const elapsedMs = startedAt.current ? Date.now() - startedAt.current : undefined;

    // Primary path: the relay, which scores for spam before reaching HubSpot.
    // It answers ok:true even for dropped spam so bots learn nothing.
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payload, meta: { hp: honeypot, elapsedMs } }),
      });
      if (res.ok) {
        markSent();
        setStatus('sent');
        return;
      }
      // Rate limit, bad request, or HubSpot itself refusing: a direct retry
      // would fail the same way, so show the call-us message.
      if (res.status === 429 || res.status === 400 || res.status === 413 || res.status === 502) {
        setStatus('error');
        return;
      }
      // Anything else (route missing or crashed): fall through to direct submit.
    } catch {
      // Network error reaching our own route: fall through to direct submit.
    }

    try {
      const res = await fetch(SUBMIT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) markSent();
      setStatus(res.ok ? 'sent' : 'error');
    } catch {
      setStatus('error');
    }
  }

  if (status === 'sent') {
    return (
      <div className="flex items-start gap-4 rounded-3xl border border-sage-200 bg-sage-50 p-8">
        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sage-500 text-white">
          <Check size={18} strokeWidth={2.25} />
        </span>
        <div>
          <p className="font-display text-xl text-ink">
            Thank you, we&apos;ll be in touch soon.
          </p>
          <p className="mt-2 font-sans text-base leading-relaxed text-ink-body">
            A specialist will reach out shortly. If this is urgent, please call{' '}
            <a
              href={phoneHref}
              className="font-medium text-sage-700 underline underline-offset-2"
            >
              {phoneDisplay}
            </a>{' '}
            any time.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="grid grid-cols-1 gap-5 sm:grid-cols-6">
      {/* Honeypot, visually hidden from humans and skipped by keyboard and
          password managers. Bots that fill every input trip it. */}
      <div className="absolute -left-[9999px] top-auto h-px w-px overflow-hidden" aria-hidden>
        <label>
          Leave this field empty
          <input
            type="text"
            name={HONEYPOT}
            tabIndex={-1}
            autoComplete="off"
            data-lpignore="true"
            data-1p-ignore
          />
        </label>
      </div>

      <Field label="First Name" htmlFor="firstname" span="sm:col-span-3">
        <input id="firstname" name="firstname" type="text" autoComplete="given-name" className={inputClass} />
      </Field>
      <Field label="Last Name" htmlFor="lastname" span="sm:col-span-3">
        <input id="lastname" name="lastname" type="text" autoComplete="family-name" className={inputClass} />
      </Field>
      <Field label="Email" htmlFor="email" required span="sm:col-span-6">
        <input id="email" name="email" type="email" required autoComplete="email" className={inputClass} />
      </Field>
      <Field label="Mobile Phone Number" htmlFor="mobilephone" span="sm:col-span-2">
        <input id="mobilephone" name="mobilephone" type="tel" inputMode="tel" autoComplete="tel" className={inputClass} />
      </Field>
      <Field label="Best Time To Call?" htmlFor="best_time_to_call_" span="sm:col-span-2">
        <input id="best_time_to_call_" name="best_time_to_call_" type="text" className={inputClass} />
      </Field>
      <Field label="Ok To Leave Voicemail?" htmlFor="ok_to_leave_voicemail_" span="sm:col-span-2">
        <select id="ok_to_leave_voicemail_" name="ok_to_leave_voicemail_" defaultValue="" className={inputClass}>
          <option value="">Please select</option>
          <option value="Yes">Yes</option>
          <option value="No">No</option>
        </select>
      </Field>

      <SectionHeading>Your location</SectionHeading>
      <Field label="Street Address" htmlFor="address" span="sm:col-span-6">
        <input id="address" name="address" type="text" autoComplete="street-address" className={inputClass} />
      </Field>
      <Field label="City" htmlFor="city" span="sm:col-span-3">
        <input id="city" name="city" type="text" autoComplete="address-level2" className={inputClass} />
      </Field>
      <Field label="State/Region" htmlFor="state" span="sm:col-span-3">
        <input id="state" name="state" type="text" autoComplete="address-level1" className={inputClass} />
      </Field>

      <SectionHeading>Your loved one&apos;s location</SectionHeading>
      <Field label="Street" htmlFor="ilo_street" span="sm:col-span-6">
        <input id="ilo_street" name="ilo_street" type="text" className={inputClass} />
      </Field>
      <Field label="City" htmlFor="ilo_city" span="sm:col-span-3">
        <input id="ilo_city" name="ilo_city" type="text" className={inputClass} />
      </Field>
      <Field label="State" htmlFor="ilo_state" span="sm:col-span-3">
        <input id="ilo_state" name="ilo_state" type="text" className={inputClass} />
      </Field>

      <Field label="Your Timeframe For Intervention" htmlFor="your_timeframe_for_intervention" span="sm:col-span-3">
        <select id="your_timeframe_for_intervention" name="your_timeframe_for_intervention" defaultValue="" className={inputClass}>
          <option value="">Please select</option>
          {TIMEFRAME_OPTIONS.map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
      </Field>
      <Field label="Insurance Type" htmlFor="insurance_type" span="sm:col-span-3">
        <select id="insurance_type" name="insurance_type" defaultValue="" className={inputClass}>
          <option value="">Please select</option>
          {INSURANCE_OPTIONS.map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
      </Field>
      <Field
        label="Most people pay for treatment in one of the following ways. Please choose one:"
        htmlFor="intervention_budget"
        span="sm:col-span-6"
      >
        <select id="intervention_budget" name="intervention_budget" defaultValue="" className={inputClass}>
          <option value="">Please select</option>
          {BUDGET_OPTIONS.map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
      </Field>
      <Field label="Tell us about your need" htmlFor="contact_form_message" span="sm:col-span-6">
        <textarea id="contact_form_message" name="contact_form_message" rows={5} className={`${inputClass} resize-none`} />
      </Field>

      {/* Consent, mirrors the HubSpot dataPrivacy module (all required) */}
      <div className="sm:col-span-6 rounded-2xl border border-border bg-surface p-5">
        <p className="font-sans text-sm leading-relaxed text-ink-body">
          Change Institute Inc. (
          <a href="https://intervention.com/" className="text-sage-700 underline underline-offset-2" target="_blank" rel="noopener noreferrer">
            intervention.com
          </a>
          ) is committed to protecting and respecting your privacy, and we will
          only use your personal information to administer your account and
          provide the services you request. If you consent to being contacted
          for these purposes, please select the options below:
        </p>
        <div className="mt-4 space-y-3">
          <Consent name="consent_email" text={CONSENT_EMAIL.text} />
          <Consent name="consent_phone" text={CONSENT_PHONE.text} />
          <Consent name="consent_processing" text={CONSENT_PROCESSING} />
        </div>
        <p className="mt-4 font-sans text-xs leading-relaxed text-ink-muted">
          You can unsubscribe at any time by replying STOP to any text message
          or email. For phone calls, please notify the caller if you wish to be
          removed from the call list. For complete information on how we
          protect your privacy, please review our{' '}
          <a href="/privacy-policy" className="underline underline-offset-2">Privacy Policy</a>{' '}
          and{' '}
          <a href="/terms-and-conditions" className="underline underline-offset-2">Terms and Conditions</a>.
        </p>
      </div>

      <div className="sm:col-span-6">
        <button
          type="submit"
          disabled={status === 'submitting'}
          className="inline-flex w-full items-center justify-center rounded-full bg-sage-700 px-8 py-4 font-sans text-base font-medium text-white transition-colors duration-300 hover:bg-sage-900 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          {status === 'submitting' ? 'Sending…' : 'Send message'}
        </button>

        {status === 'error' && (
          <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-5">
            <p className="font-sans text-sm leading-relaxed text-ink">
              We couldn&apos;t send your message right now. Please call us
              directly, we answer 24/7:
            </p>
            <a
              href={phoneHref}
              className="mt-2 inline-flex items-center gap-2 font-sans text-base font-medium text-sage-700"
            >
              <Phone size={15} strokeWidth={1.75} />
              {phoneDisplay}
            </a>
          </div>
        )}
      </div>
    </form>
  );
}

const inputClass =
  'w-full rounded-xl border border-border bg-white px-4 py-3 font-sans text-base text-ink outline-none transition-colors placeholder:text-ink-muted/60 focus:border-sage-400';

function Field({
  label,
  htmlFor,
  required,
  span,
  children,
}: {
  label: string;
  htmlFor: string;
  required?: boolean;
  span: string;
  children: React.ReactNode;
}) {
  return (
    <label htmlFor={htmlFor} className={span}>
      <span className="mb-2 block font-sans text-sm font-medium text-ink-body">
        {label}
        {required && <span className="text-sage-700"> *</span>}
      </span>
      {children}
    </label>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <p className="sm:col-span-6 mt-4 font-display text-xl text-ink">
      {children}
    </p>
  );
}

function Consent({ name, text }: { name: string; text: string }) {
  return (
    <label className="flex items-start gap-3 font-sans text-sm leading-relaxed text-ink-body">
      <input
        type="checkbox"
        name={name}
        required
        className="mt-1 h-4 w-4 shrink-0 rounded border-border accent-[#4A7C5F]"
      />
      <span>
        {text}
        <span className="text-sage-700"> *</span>
      </span>
    </label>
  );
}
