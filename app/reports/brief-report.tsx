import { type ReactNode } from 'react';
import { aud, sampleCase as c, sampleScenarios } from '../../data/sample-case';
import { BrandMark } from '../brand';
import { CostTable, number } from './comprehensive-report';
import './report.css';
import './brief-report.css';

const [low, high] = sampleScenarios;

function BriefPage({ n, label, className = '', children }: { n: number; label: string; className?: string; children: ReactNode }) {
  return <section id={`page-${n}`} className={`sample-page brief-page ${className}`} aria-label={`${n}. ${label}`}>
    <div className="sample-page-body">{children}</div>
    <footer className="sample-page-footer"><span><BrandMark size={20} />Hugena</span><span>{c.id} · Brief report</span><span>0{n} / 02</span></footer>
  </section>;
}

// Brief report for the example claim, shown when the adviser's fee is under A$2.
// Every figure comes from data/sample-case.ts, the same source as the comprehensive report.
export function BriefReport() {
  return <div className="sample-document brief-document">
    <BriefPage n={1} label="Claim and finding">
      <div className="brief-masthead"><p className="sample-kicker">Hosting cost review / {c.id}</p><strong>Brief report<small>{c.date}</small></strong></div>
      <h2>Can this app run on A$50 a month?</h2>
      <p className="sample-ai-label">AI output to check</p>
      <blockquote className="sample-claim">“{c.claim.claim}”</blockquote>
      <div className="brief-stats">
        <div><strong>{number(c.users)}</strong><span>monthly active users in both scenarios</span></div>
        <div><strong>{aud(low.total)}</strong><span>a month at low usage, incl. GST</span></div>
        <div><strong>{aud(high.total)}</strong><span>a month at higher usage, incl. GST</span></div>
      </div>
      <div className="sample-callout brief-verdict"><span className="sample-verdict">{c.review.verdict}</span><p>{c.review.finding}</p></div>
      <div className="brief-section"><h3>What the founder told us</h3><p>{c.claim.context}</p></div>
      <div className="brief-section"><h3>Budget and scope</h3><p>{c.claim.constraints}</p></div>
      <p className="sample-source">{c.date}. The usage scenarios are the reviewer’s assumptions and the rates are made up. No real review took place.</p>
    </BriefPage>
    <BriefPage n={2} label="Costs and next step" className="brief-plan-page">
      <p className="sample-kicker">Cost model / two scenarios</p>
      <h2>Where the money goes</h2>
      <p className="sample-intro">Both scenarios have {number(c.users)} monthly active users. Only the usage changes, and that alone moves the bill from under A$50 to over it.</p>
      <CostTable caption="Monthly infrastructure cost" />
      <div className="brief-decision"><strong>Next step</strong><p>{c.review.next}</p></div>
      <div className="brief-section"><h3>What this review can’t show</h3><p>Peak concurrency, response times, reliability or whether a real hosting plan can sustain either workload.</p></div>
      <p className="sample-source">{c.review.evidence}</p>
    </BriefPage>
  </div>;
}
