'use client';

import { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import demo from '../data/demo.json';
import { type Adviser, type Specialty, type CaseStatus, externalExample, isAdviser, money, settlement } from '../data/advisers';

const profilesKey = 'pitchproof-external-advisers-v1';
const roles = { business: 'Business Adviser', technical: 'Technical Adviser', ux: 'UX Adviser' };
const standardAdvisers: Adviser[] = demo.reviewers.map(person => ({ ...person, specialty: person.id as Specialty, provider: 'platform', feeCents: 1000 }));

export function AdviserDirectory({ onChoose }: { onChoose: (adviser: Adviser) => void }) {
  const [external, setExternal] = useState<Adviser[]>([externalExample]);
  const [filter, setFilter] = useState<'all' | 'platform' | 'external'>('all');
  const [showForm, setShowForm] = useState(false);
  const [ready, setReady] = useState(false);
  const [notice, setNotice] = useState('');
  useEffect(() => {
    try {
      const saved: unknown = JSON.parse(localStorage.getItem(profilesKey) || 'null');
      if (Array.isArray(saved)) setExternal(saved.filter((a): a is Adviser => isAdviser(a) && a.provider === 'external'));
    } catch { setNotice('Profiles cannot be loaded from this browser. You can still explore the demo.'); }
    setReady(true);
  }, []);
  function addAdviser(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const fields = new FormData(form);
    const name = String(fields.get('name') || '').trim();
    const description = String(fields.get('description') || '').trim();
    const expertise = String(fields.get('expertise') || '').split(',').map(tag => tag.trim()).filter(Boolean);
    const specialty = String(fields.get('specialty')) as Specialty;
    const feeCents = Math.round(Number(fields.get('fee')) * 100);
    if (!name || !description || expertise.length === 0 || !(specialty in roles) || !Number.isSafeInteger(feeCents) || feeCents <= 0 || feeCents > 100000000) {
      setNotice('Enter a name, biography, expertise, and a valid fee.'); return;
    }
    const adviser: Adviser = { id: `external-${crypto.randomUUID()}`, name, description, expertise, specialty, feeCents,
      role: roles[specialty], provider: 'external', color: 'purple', initials: name.split(/\s+/).slice(0, 2).map(part => part[0]).join('').toUpperCase() };
    const updated = [...external, adviser];
    setExternal(updated); setFilter('external'); setShowForm(false);
    try { localStorage.setItem(profilesKey, JSON.stringify(updated)); setNotice(`${name}'s demo profile was added and saved in this browser.`); }
    catch { setNotice(`${name}'s profile was added for this session. Browser storage is unavailable.`); }
  }
  return <>
    <section className="adviser-policy card"><h2>Your advisers. A wider circle of expertise.</h2><p>Choose a standard PitchProof adviser or an independent external adviser. External advisers contribute <strong>10% of their fee for each completed, paid case</strong> to PitchProof and retain 90%. This commission is deducted from the adviser fee, not added to the client's price.</p><p>Standard advisers are provided by PitchProof; the external-adviser commission does not apply.</p></section>
    <div className="adviser-toolbar"><div className="adviser-filters" aria-label="Filter advisers">{(['all', 'platform', 'external'] as const).map(value => <button key={value} className="filter-button" aria-pressed={filter === value} onClick={() => setFilter(value)}>{value === 'all' ? 'All advisers' : value === 'platform' ? 'Standard advisers' : 'External advisers'}</button>)}</div><button className="text-button" aria-expanded={showForm} aria-controls="add-adviser" disabled={!ready} onClick={() => setShowForm(!showForm)}>{showForm ? 'Close form' : '+ Add external adviser'}</button></div>
    {notice && <p className="adviser-notice" role="status">{notice}</p>}
    {showForm && <form id="add-adviser" className="idea-form card adviser-form" onSubmit={addAdviser}><h2>Add an external adviser</h2><p>Create a demo profile in this browser. No account is created or invitation sent.</p>
      <div className="adviser-form-grid"><div className="field"><label htmlFor="adviser-name">Adviser name</label><input id="adviser-name" name="name" required maxLength={80}/></div><div className="field"><label htmlFor="adviser-specialty">Specialty</label><select id="adviser-specialty" name="specialty">{Object.entries(roles).map(([value,label]) => <option key={value} value={value}>{label}</option>)}</select></div>
      <div className="field"><label htmlFor="adviser-fee">Case fee (AUD)</label><input id="adviser-fee" name="fee" type="number" min="0.01" max="1000000" step="0.01" defaultValue="200" required/></div><div className="field"><label htmlFor="adviser-expertise">Expertise (separated by commas)</label><input id="adviser-expertise" name="expertise" required maxLength={200} placeholder="Pricing, Growth strategy"/></div></div>
      <div className="field"><label htmlFor="adviser-bio">About this adviser</label><textarea id="adviser-bio" name="description" required maxLength={600} rows={3}/></div><label className="commission-consent"><input type="checkbox" required/> I understand the demo terms: 10% of each completed, paid external case goes to PitchProof; 90% goes to the adviser.</label><button type="submit" className="button">Add demo profile <ArrowRight size={16}/></button>
    </form>}
    <div className="reviewer-grid">{[...standardAdvisers, ...external].filter(a => filter === 'all' || a.provider === filter).map(person => <article className="reviewer-card card" key={person.id}><div className="reviewer-card-top"><span className={`avatar ${person.color}`}>{person.initials}</span><span className={`provider-badge ${person.provider}`}>{person.provider === 'platform' ? 'PitchProof adviser' : 'External adviser'}</span></div><h2>{person.name}</h2><div className="reviewer-role">{person.role}</div><p>{person.description}</p><div className="tags">{person.expertise.map((tag,i) => <span key={`${tag}-${i}`}>{tag}</span>)}</div><div className="price"><strong>{money(person.feeCents)}</strong><span>/ demo case</span></div><p className="commission-note">{person.provider === 'external' ? `On success: ${money(Math.round(person.feeCents / 10))} to PitchProof; ${money(person.feeCents - Math.round(person.feeCents / 10))} to adviser.` : 'Standard provider. No external-adviser commission.'}</p><button className="button full" onClick={() => onChoose(person)}>Choose adviser <ArrowRight size={16}/></button></article>)}</div>
    <p className="center-note">Demo profiles only. No booking, payment, or adviser contact takes place.</p>
  </>;
}

export function CaseCommission({ adviser, status, onChange }: { adviser: Adviser; status: CaseStatus; onChange: (status: CaseStatus) => void }) {
  const amounts = settlement(adviser, status);
  return <section className="card case-commission"><h2>Case & commission</h2><p>{adviser.provider === 'external' ? 'External adviser · 10% on success' : 'PitchProof adviser · External commission does not apply'}</p><label htmlFor="case-status">Demo case status</label><select id="case-status" value={status} onChange={event => onChange(event.target.value as CaseStatus)}><option value="open">In progress</option><option value="completed">Completed · awaiting payment</option><option value="paid">Successful · completed and paid</option></select><dl aria-live="polite"><div><dt>Agreed case fee</dt><dd>{money(adviser.feeCents)}</dd></div><div><dt>Commission due to PitchProof</dt><dd>{money(amounts.commissionCents)}</dd></div>{adviser.provider === 'external' && status === 'paid' && <div><dt>Adviser retains</dt><dd>{money(amounts.adviserCents)}</dd></div>}</dl><p>{status !== 'paid' ? 'No success commission is due until the case is completed and paid.' : 'Success recorded in this demo only. No funds have been collected or transferred.'}</p></section>;
}
