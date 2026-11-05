import { type ReactNode } from 'react';
import { aud, sampleCase as c, sampleScenarios } from '../../data/sample-case';
import { BrandMark } from '../brand';
import './report.css';

const [low, high] = sampleScenarios;
export const number = (value: number) => value.toLocaleString('en-AU');
export const chapters = ['Overview', 'The claim', 'The finding', 'Usage model', 'Cost breakdown', 'Evidence', 'Risks & limits', 'Action plan', 'The decision'];

function Page({ n, title, label, children, dark = false }: { n: number; title?: string; label?: string; children: ReactNode; dark?: boolean }) {
  return <section id={`page-${n}`} className={`sample-page ${dark ? 'sample-dark' : ''}`} aria-label={`${n}. ${chapters[n - 1]}`}>
    <div className="sample-page-body">
      {label && <p className="sample-kicker">{label}</p>}
      {title && <h2>{title}</h2>}
      {children}
    </div>
    <footer className="sample-page-footer"><span><BrandMark size={20} /> Hugena</span><span>{c.id} · Comprehensive report</span><span>{String(n).padStart(2, '0')} / 09</span></footer>
  </section>;
}

function ClaimContent() {
  return <>
    <p className="sample-ai-label">AI output to check</p><blockquote className="sample-claim">“{c.claim.claim}”</blockquote>
    <div className="sample-facts"><div><span>Review category</span><strong>{c.claim.category}</strong></div><div><span>Case reference</span><strong>{c.id}</strong></div><div><span>Prepared</span><strong>{c.date}</strong></div></div>
    <div className="sample-brief"><h3>What the founder told us</h3><p>{c.claim.context}</p><h3>Budget and scope</h3><p>{c.claim.constraints}</p><h3>The decision</h3><p>{c.claim.decision}</p></div>
    <div className="sample-callout"><strong>The report covers this brief only.</strong><p>The usage scenarios in it are the reviewer’s assumptions. The founder didn’t supply any measurements.</p></div>
  </>;
}

// Cost table shared by the comprehensive report (page 5) and the brief report (page 2).
export function CostTable({ caption = 'Monthly infrastructure cost · E3' }: { caption?: string }) {
  return <div className="sample-table-scroll"><table className="sample-table sample-cost-table"><caption>{caption}</caption><thead><tr><th scope="col">Cost & assumed rate</th><th scope="col">Low</th><th scope="col">Higher</th></tr></thead><tbody>
        {['Base services|A$20/month: hosting, auth and database', 'Requests|A$2 per million requests', 'File storage|A$0.20 per GB/month', 'Outbound transfer|A$0.10 per GB'].map((item, i) => <tr key={item}><th scope="row">{item.split('|')[0]}<small>{item.split('|')[1]}</small></th><td>{aud(low.costs[i])}</td><td>{aud(high.costs[i])}</td></tr>)}
        <tr><th scope="row">Subtotal</th><td>{aud(low.subtotal)}</td><td>{aud(high.subtotal)}</td></tr><tr><th scope="row">Assumed GST (10%)</th><td>{aud(low.tax)}</td><td>{aud(high.tax)}</td></tr>
        <tr className="sample-total"><th scope="row">Monthly total</th><td>{aud(low.total)}</td><td>{aud(high.total)}</td></tr>
      </tbody></table></div>;
}

// Comprehensive report for the example claim, shown when the adviser's fee is A$2 or more.
export function ComprehensiveReport() {
  return <div className="sample-document">
    <Page n={1} dark>
      <div className="sample-cover-brand"><BrandMark size={34} /> Hugena <span>COMPREHENSIVE REPORT</span></div>
      <div className="sample-cover-copy"><p className="sample-kicker">Hosting cost review</p><h1>5,000 users.<br />A$50 a month.<br /><span>Does it add up?</span></h1><p className="sample-cover-lead">We checked the usage, costs and evidence behind an AI’s hosting estimate.</p><span className="sample-verdict">{c.review.verdict}</span></div>
      <div className="sample-cover-bottom"><p>{c.id} / {c.date}</p><p>Sample case. The inputs and rates are made up,<br />and no real review took place.</p></div>
    </Page>

    <Page n={2} label="01 / The claim" title="What the founder wants to know"><ClaimContent /></Page>

    <Page n={3} label="02 / The finding" title="Two usage levels put the bill on either side of A$50">
      <p className="sample-intro">Both scenarios have {number(c.users)} monthly active users. Only the usage changes, and that alone moves the bill from under A$50 to over it.</p>
      <div className="sample-budget-chart" role="img" aria-label={`Monthly cost including GST: low usage ${aud(low.total)}, higher usage ${aud(high.total)}; budget must remain below A$50.`}>
        {[low, high].map(s => <div className="sample-cost-row" key={s.id}><div><span>{s.label}</span><strong>{aud(s.total)}</strong></div><div className="sample-track"><span style={{ width: `${s.total / 100 * 100}%` }} /><i style={{ left: '50%' }} /></div><small>{s.id === 'low' ? `${aud(c.budget - s.total)} below the threshold` : `${aud(s.total - c.budget)} above the threshold`}</small></div>)}
        <p className="sample-chart-note">Dashed line: A$50 budget · Shared scale: A$0 to A$100/month</p>
      </div>
      <div className="sample-callout sample-finding"><span className="sample-verdict">{c.review.verdict}</span><p>{c.review.finding}</p></div>
      <p className="sample-source">Sources: E2 and E3. Example calculations with an assumed 10% GST. They aren’t real prices or measured costs.</p>
    </Page>

    <Page n={4} label="03 / Usage model" title="What each scenario assumes">
      <div className="sample-metrics"><div><strong>5,000</strong><span>monthly active users in both scenarios</span></div><div><strong>10×</strong><span>more monthly requests in the higher-usage case</span></div></div>
      <div className="sample-table-scroll"><table className="sample-table"><caption>Assumed monthly usage · E2</caption><thead><tr><th scope="col">Input</th><th scope="col">Low usage</th><th scope="col">Higher usage</th></tr></thead><tbody>
        <tr><th scope="row">Requests per user</th><td>{number(low.requestsPerUser)}</td><td>{number(high.requestsPerUser)}</td></tr>
        <tr><th scope="row">Total requests</th><td>{number(low.requests)}</td><td>{number(high.requests)}</td></tr>
        <tr><th scope="row">Stored data</th><td>{low.storageGb} GB</td><td>{high.storageGb} GB</td></tr>
        <tr><th scope="row">Outbound transfer</th><td>{low.transferGb} GB</td><td>{high.transferGb} GB</td></tr>
      </tbody></table></div>
      <div className="sample-callout"><strong>5,000 users × requests per user = monthly requests</strong><p>500,000 in the low-usage case; 5,000,000 in the higher-usage case. Stored data and transfer are separate monthly assumptions.</p></div>
      <div className="sample-two-col"><div><h3>What this model tests</h3><p>How the monthly bill changes when activity and data volume change, while the number of active users stays fixed.</p></div><div><h3>What it can’t show</h3><p>Peak concurrency, response times, reliability or whether a real hosting plan can sustain either workload.</p></div></div>
      <p className="sample-source">The founder didn’t provide these volumes. We chose them as scenarios; they aren’t measurements or forecasts.</p>
    </Page>

    <Page n={5} label="04 / Cost breakdown" title="Where the money goes">
      <p className="sample-intro">The rates below are made up so you can follow the arithmetic. Line items exclude GST; the totals include it.</p>
      <CostTable />
      <div className="sample-callout"><strong>Transfer is the largest variable cost.</strong><p>It contributes A$15 of A$38 before GST in the low-usage model, and A$40 of A$78 in the higher-usage model.</p></div>
      <p className="sample-source">Simplified model: no bundled allowances, minimum tiers, regional rates, currency conversion or separate compute charges. No paid AI APIs or email. Check the real provider’s billing rules before relying on a budget.</p>
    </Page>

    <Page n={6} label="05 / Evidence register" title="What we had to go on">
      <div className="sample-evidence">
        <article><span>E1</span><div><h3>The submitted brief</h3><p>The exact AI claim, architecture description, budget and decision shown on page 02.</p><small>Available · Fictional customer input</small></div></article>
        <article><span>E2</span><div><h3>Two usage scenarios</h3><p>5,000 active users with different request counts, storage and transfer volumes. Inputs are recorded on page 04.</p><small>Assumed · No production telemetry</small></div></article>
        <article><span>E3</span><div><h3>A transparent cost calculation</h3><p>Invented unit rates and reproducible arithmetic, shown on page 05.</p><small>Illustrative · No provider quote</small></div></article>
        <article><span>E4</span><div><h3>Capacity & real-world billing</h3><p>Dated provider plans, measured usage and a representative load test would be needed to substantiate the claim.</p><small>Missing · Required before commitment</small></div></article>
      </div>
      <div className="sample-callout"><strong>Anyone can redo the maths, but the claim is still unproven.</strong><p>A made-up model shows how sensitive the bill is to usage. It can’t stand in for evidence about the actual app or its providers.</p></div>
      <p className="sample-source">No outside source or live price is cited as evidence.</p>
    </Page>

    <Page n={7} label="06 / Risks & limits" title="Four gaps to close before launch" dark>
      <p className="sample-intro">Resolve these before you treat A$50 as your launch budget.</p>
      <div className="sample-risk-grid">
        <article><span>01 / USAGE</span><h3>Usage per user varies</h3><p>Uploads, repeat visits and large downloads can change consumption without changing monthly active users.</p><small>Check: requests and transfer per active user.</small></article>
        <article><span>02 / CAPACITY</span><h3>Cost says nothing about capacity</h3><p>Monthly totals do not show whether peak traffic can be served with acceptable performance.</p><small>Check: concurrent usage and response times.</small></article>
        <article><span>03 / PRICING</span><h3>Real plans have extra rules</h3><p>Allowances, overages, billing regions and paid-plan requirements are absent from this simplified model.</p><small>Check: a dated quote for every service.</small></article>
        <article><span>04 / SCOPE</span><h3>Hosting isn’t the whole budget</h3><p>Development, domain registration, email and paid AI APIs sit outside the claim’s defined budget.</p><small>Check: a separate full operating budget.</small></article>
      </div>
      <div className="sample-dark-statement">A$50 only works<br />in the low-usage case.</div>
    </Page>

    <Page n={8} label="07 / Action plan" title="Four steps before you commit">
      <div className="sample-action-list">
        <article><span>01</span><div><h3>Measure a representative pilot.</h3><p>Capture requests per active user, file growth, transfer and peak concurrency.</p><small>Owner: founder + developer · Output: a usage worksheet</small></div></article>
        <article><span>02</span><div><h3>Price the actual service stack.</h3><p>Record dated rates, allowances, minimum plans, overages, currency and applicable taxes.</p><small>Owner: developer · Output: a provider-backed cost sheet</small></div></article>
        <article><span>03</span><div><h3>Test the workload and the headroom.</h3><p>Run representative load tests and price a higher-usage case. Agree on performance targets before testing.</p><small>Owner: developer + reviewer · Output: capacity and budget checks</small></div></article>
        <article><span>04</span><div><h3>Make the commitment conditional.</h3><p>Proceed only if measured capacity meets the agreed target and the full in-scope monthly bill stays strictly below A$50.</p><small>Owner: founder · Output: a recorded go / revise decision</small></div></article>
      </div>
      <div className="sample-callout"><strong>If the checks fail, revise the plan.</strong><p>Reduce usage, change the architecture or raise the budget. Set cost alerts and review the first actual bill.</p></div>
    </Page>

    <Page n={9} dark>
      <div className="sample-cover-brand"><BrandMark size={34} /> Hugena <span>THE DECISION</span></div>
      <div className="sample-closing"><p className="sample-kicker">08 / Recommendation</p><h2>Measure usage first,<br /><span>then commit<br />to the budget.</span></h2><p>The brief doesn’t show that A$50 is enough. Run a measured pilot, get real quotes and check capacity before you commit.</p><div className="sample-closing-result"><span>{c.id} / FINAL FINDING</span><strong>{c.review.verdict}</strong></div></div>
      <p className="sample-closing-note">Sample report with made-up rates and usage figures. No expert reviewed it and no prices were checked live.</p>
    </Page>
  </div>;
}
