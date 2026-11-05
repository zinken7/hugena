'use client';

import { useEffect, useState } from 'react';
import { ArrowRight, FileText } from 'lucide-react';
import demo from '../data/demo.json';
import { type Adviser, type Specialty, externalExample, isAdviser, money, reportFormat, settlement } from '../data/advisers';
import { paymentLinkFor } from '../data/payments';

const opinions = { business: 'You can’t set a monthly budget without knowing how people will use the app. I’d start with the cost drivers and the business assumptions behind them.', technical: '5,000 users could make 5,000 requests or five million. I’d check request volume, storage and bandwidth before accepting this estimate.', ux: 'I’d want to know what an active user does in the app. I’d map the main journey before accepting any assumptions about sessions or load.' };
const profilesKey = 'pitchproof-external-advisers-v1';
const roles = { business: 'Business Adviser', technical: 'Technical Adviser', ux: 'UX Adviser' };
export const standardAdvisers: Adviser[] = demo.reviewers.map(person => ({ ...person, specialty: person.id as Specialty, provider: 'platform', feeCents: 100 }));

// Every adviser on the platform: Hugena's own advisers plus independent ones saved in this browser.
export function useAdvisers() {
  const [external, setExternal] = useState<Adviser[]>([externalExample]);
  const [ready, setReady] = useState(false);
  const [problem, setProblem] = useState('');
  useEffect(() => {
    try {
      const saved: unknown = JSON.parse(localStorage.getItem(profilesKey) || 'null');
      if (Array.isArray(saved)) setExternal(saved.filter((a): a is Adviser => isAdviser(a) && a.provider === 'external'));
    } catch { setProblem('Saved profiles couldn’t be loaded from this browser.'); }
    setReady(true);
  }, []);
  function add(adviser: Adviser) {
    const updated = [...external, adviser];
    setExternal(updated);
    try { localStorage.setItem(profilesKey, JSON.stringify(updated)); return true; } catch { return false; }
  }
  return { advisers: [...standardAdvisers, ...external], ready, problem, add };
}

// The profile card customers see. Without onChoose it is a read-only preview.
export function AdviserCard({ person, onChoose }: { person: Adviser; onChoose?: (adviser: Adviser) => void }) {
  return <article className="reviewer-card card">
    <div className="reviewer-card-top"><span className={`avatar ${person.color}`}>{person.initials}</span><span className={`provider-badge ${person.provider}`}>{person.provider === 'platform' ? 'Hugena adviser' : 'External adviser'}</span></div>
    <h2>{person.name}</h2><div className="reviewer-role">{person.role}</div><p>{person.description}</p>
    <blockquote className="sample-opinion"><span>SAMPLE OPINION</span><p>{person.opinion || (person.id.startsWith('external-') && person.id !== 'external-taylor' ? 'No sample opinion yet.' : opinions[person.specialty])}</p><small>Written about the hosting-cost example, not your claim.</small></blockquote>
    <div className="tags">{person.expertise.map((tag, i) => <span key={`${tag}-${i}`}>{tag}</span>)}</div>
    <div className="price"><strong>{money(person.feeCents)}</strong><span>{paymentLinkFor(person.feeCents) ? 'per review, plus GST' : 'per review'}</span></div>
    <div className="report-format"><FileText size={15} /><span>{reportFormat(person.feeCents).label}</span></div>
    {onChoose && <button className="button full" onClick={() => onChoose(person)}>Choose adviser <ArrowRight size={16} /></button>}
  </article>;
}

// The customer's adviser board.
export function AdviserDirectory({ onChoose }: { onChoose: (adviser: Adviser) => void }) {
  const { advisers, problem } = useAdvisers();
  const [filter, setFilter] = useState<'all' | 'platform' | 'external'>('all');
  return <>
    <div className="adviser-toolbar"><div className="adviser-filters" aria-label="Filter advisers">{(['all', 'platform', 'external'] as const).map(value => <button key={value} className="filter-button" aria-pressed={filter === value} onClick={() => setFilter(value)}>{value === 'all' ? 'All advisers' : value === 'platform' ? 'Hugena advisers' : 'External advisers'}</button>)}</div></div>
    {problem && <p className="adviser-notice" role="status">{problem}</p>}
    <div className="reviewer-grid">{advisers.filter(a => filter === 'all' || a.provider === filter).map(person => <AdviserCard key={person.id} person={person} onChoose={onChoose} />)}</div>
  </>;
}

// Self sign-up for independent advisers.
export function AdviserSignupForm({ onCreated }: { onCreated: (adviser: Adviser) => void }) {
  const [problem, setProblem] = useState('');
  function create(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fields = new FormData(event.currentTarget);
    const name = String(fields.get('name') || '').trim();
    const description = String(fields.get('description') || '').trim();
    const opinion = String(fields.get('opinion') || '').trim();
    const expertise = String(fields.get('expertise') || '').split(',').map(tag => tag.trim()).filter(Boolean);
    const specialty = String(fields.get('specialty')) as Specialty;
    const feeCents = Math.round(Number(fields.get('fee')) * 100);
    if (!opinion || !name || !description || expertise.length === 0 || !(specialty in roles) || !Number.isSafeInteger(feeCents) || feeCents <= 0 || feeCents > 100000000) {
      setProblem('Fill in every field and enter a valid fee.'); return;
    }
    onCreated({ id: `external-${crypto.randomUUID()}`, name, description, expertise, specialty, feeCents, opinion, role: roles[specialty], provider: 'external', color: 'purple',
      initials: name.split(/\s+/).slice(0, 2).map(part => part[0]).join('').toUpperCase() });
  }
  return <form className="idea-form card adviser-form" onSubmit={create}>
    <h2>Create your adviser profile</h2>
    <p>Customers see this profile when they choose an adviser. In this demo it’s saved in this browser and no account is created.</p>
    {problem && <p className="adviser-notice" role="status">{problem}</p>}
    <div className="adviser-form-grid">
      <div className="field"><label htmlFor="adviser-name">Your name</label><input id="adviser-name" name="name" required maxLength={80} /></div>
      <div className="field"><label htmlFor="adviser-specialty">Specialty</label><select id="adviser-specialty" name="specialty">{Object.entries(roles).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div>
      <div className="field"><label htmlFor="adviser-fee">Your fee per review (AUD)</label><p id="adviser-fee-hint">Under A$2 you offer a brief report; A$2 or more, a comprehensive one.</p><input id="adviser-fee" name="fee" type="number" min="0.01" max="1000000" step="0.01" defaultValue="2" required aria-describedby="adviser-fee-hint" /></div>
      <div className="field"><label htmlFor="adviser-expertise">Expertise (separated by commas)</label><input id="adviser-expertise" name="expertise" required maxLength={200} placeholder="Pricing, Growth strategy" /></div>
    </div>
    <div className="field"><label htmlFor="adviser-bio">About you</label><textarea id="adviser-bio" name="description" required maxLength={600} rows={3} /></div>
    <div className="field"><label htmlFor="adviser-opinion">Sample opinion on the hosting-cost example</label><textarea id="adviser-opinion" name="opinion" required minLength={10} maxLength={800} placeholder="What would you check before accepting the A$50/month estimate?" /></div>
    <label className="commission-consent"><input type="checkbox" required /> I agree that Hugena keeps 10% of my fee on each completed, paid case, and I keep 90%.</label>
    <button type="submit" className="button">Create profile <ArrowRight size={16} /></button>
  </form>;
}

// What the adviser earns from one review. Payment is the platform's job, so this is read-only.
export function Earnings({ adviser, paid = false }: { adviser: Adviser; paid?: boolean }) {
  const { commissionCents, adviserCents } = settlement(adviser, 'paid');
  return <section className="card case-commission"><h2>Your earnings</h2>
    <p>{adviser.provider === 'external' ? 'Hugena keeps 10% of your fee once the customer has paid.' : 'As a Hugena adviser you pay no commission.'}</p>
    <dl><div><dt>Fee for this review</dt><dd>{money(adviser.feeCents)}</dd></div><div><dt>Commission to Hugena</dt><dd>{money(commissionCents)}</dd></div><div><dt>You receive</dt><dd>{money(adviserCents)}</dd></div></dl>
    <p>{paid ? 'The customer has paid through Stripe. Payouts to advisers aren’t part of this prototype.' : 'Paid out after the customer pays. This prototype doesn’t send money to advisers.'}</p>
  </section>;
}
