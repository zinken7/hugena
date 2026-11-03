import Link from 'next/link';
import { ArrowDownToLine, ArrowLeft, ArrowRight, ShieldCheck } from 'lucide-react';
import { type ReactNode } from 'react';
import { aud, sampleCase as c, sampleScenarios } from '../../data/sample-case';
import './sample-report.css';
import { quickSampleCase } from '../../data/quick-sample-case';
import { money } from '../../data/advisers';

const [low, high] = sampleScenarios;
const number = (value: number) => value.toLocaleString('en-AU');
const chapters = ['Overview', 'The claim', 'The finding', 'Usage model', 'Cost breakdown', 'Evidence', 'Risks & limits', 'Action plan', 'The decision'];

function Page({ n, title, label, children, dark = false }: { n: number; title?: string; label?: string; children: ReactNode; dark?: boolean }) {
  return <section id={`page-${n}`} className={`sample-page ${dark ? 'sample-dark' : ''}`} aria-label={`${n}. ${chapters[n - 1]}`}>
    <div className="sample-page-body">
      {label && <p className="sample-kicker">{label}</p>}
      {title && <h2>{title}</h2>}
      {children}
    </div>
    <footer className="sample-page-footer"><span><ShieldCheck size={18} /> PitchProof</span><span>{c.id} · Illustrative sample</span><span>{String(n).padStart(2, '0')} / 09</span></footer>
  </section>;
}

function ClaimContent() {
  return <>
    <blockquote className="sample-claim">“{c.claim.claim}”</blockquote>
    <div className="sample-facts"><div><span>Review category</span><strong>{c.claim.category}</strong></div><div><span>Case reference</span><strong>{c.id}</strong></div><div><span>Prepared</span><strong>{c.date}</strong></div></div>
    <div className="sample-brief"><h3>What the founder supplied</h3><p>{c.claim.context}</p><h3>Budget & scope</h3><p>{c.claim.constraints}</p><h3>The decision at stake</h3><p>{c.claim.decision}</p></div>
    <div className="sample-callout"><strong>One claim. One matching report.</strong><p>The report assesses this exact brief. Its usage scenarios are reviewer assumptions for the example, not measurements supplied by the founder.</p></div>
  </>;
}

export function SampleClaim() {
  return <div className="sample-document sample-claim-document"><section className="sample-page" aria-label="Sample claim brief"><div className="sample-page-body"><p className="sample-kicker">Sample claim / {c.id}</p><h1>A small budget.<br />A big assumption.</h1><ClaimContent /></div><footer className="sample-page-footer"><span><ShieldCheck size={18} /> PitchProof</span><span>{c.id} · Illustrative sample</span><span>01 / 01</span></footer></section></div>;
}

export function SampleReport() {
  return <div className="sample-document">
    <Page n={1} dark>
      <div className="sample-cover-brand"><ShieldCheck size={31} /> PitchProof <span>CLAIM REVIEW</span></div>
      <div className="sample-cover-copy"><p className="sample-kicker">The architecture cost review</p><h1>5,000 users.<br />A$50 a month.<br /><span>Does it add up?</span></h1><p className="sample-cover-lead">A closer look at the usage, costs and missing evidence behind one AI-generated estimate.</p><span className="sample-verdict">{c.review.verdict}</span></div>
      <div className="sample-cover-bottom"><p>{c.id} / {c.date}</p><p>Prepared example · Fictional inputs and rates<br />No independent review was performed.</p></div>
    </Page>

    <Page n={2} label="01 / The claim" title="A small budget. A big assumption."><ClaimContent /></Page>

    <Page n={3} label="02 / The finding" title="The users stay the same. The bill does not.">
      <p className="sample-intro">Both scenarios serve {number(c.users)} monthly active users. Different usage assumptions move the modeled bill across the A$50 budget.</p>
      <div className="sample-budget-chart" role="img" aria-label={`Monthly cost including GST: low usage ${aud(low.total)}, higher usage ${aud(high.total)}; budget must remain below A$50.`}>
        {[low, high].map(s => <div className="sample-cost-row" key={s.id}><div><span>{s.label}</span><strong>{aud(s.total)}</strong></div><div className="sample-track"><span style={{ width: `${s.total / 100 * 100}%` }} /><i style={{ left: '50%' }} /></div><small>{s.id === 'low' ? `${aud(c.budget - s.total)} below the threshold` : `${aud(s.total - c.budget)} above the threshold`}</small></div>)}
        <p className="sample-chart-note">Dashed line: A$50 budget · Shared scale: A$0 to A$100/month</p>
      </div>
      <div className="sample-callout sample-finding"><span className="sample-verdict">{c.review.verdict}</span><p>{c.review.finding}</p></div>
      <p className="sample-source">E2 + E3. Demonstration calculations, including assumed 10% GST. These are not market prices or measured operating costs.</p>
    </Page>

    <Page n={4} label="03 / Usage model" title="Model the work, not just the headcount.">
      <div className="sample-metrics"><div><strong>5,000</strong><span>monthly active users in both scenarios</span></div><div><strong>10×</strong><span>more monthly requests in the higher-usage case</span></div></div>
      <div className="sample-table-scroll"><table className="sample-table"><caption>Assumed monthly usage · E2</caption><thead><tr><th scope="col">Input</th><th scope="col">Low usage</th><th scope="col">Higher usage</th></tr></thead><tbody>
        <tr><th scope="row">Requests per user</th><td>{number(low.requestsPerUser)}</td><td>{number(high.requestsPerUser)}</td></tr>
        <tr><th scope="row">Total requests</th><td>{number(low.requests)}</td><td>{number(high.requests)}</td></tr>
        <tr><th scope="row">Stored data</th><td>{low.storageGb} GB</td><td>{high.storageGb} GB</td></tr>
        <tr><th scope="row">Outbound transfer</th><td>{low.transferGb} GB</td><td>{high.transferGb} GB</td></tr>
      </tbody></table></div>
      <div className="sample-callout"><strong>5,000 users × requests per user = monthly requests</strong><p>500,000 in the low-usage case; 5,000,000 in the higher-usage case. Stored data and transfer are separate monthly assumptions.</p></div>
      <div className="sample-two-col"><div><h3>What this model tests</h3><p>How the monthly bill changes when activity and data volume change, while the number of active users stays fixed.</p></div><div><h3>What it cannot prove</h3><p>Peak concurrency, response times, reliability or whether a real hosting plan can sustain either workload.</p></div></div>
      <p className="sample-source">The founder did not provide these volumes. They are scenario inputs, not observations or forecasts.</p>
    </Page>

    <Page n={5} label="04 / Cost breakdown" title="Every dollar has an assumption behind it.">
      <p className="sample-intro">An invented rate card makes the arithmetic inspectable. All line-item rates exclude GST; totals include it.</p>
      <div className="sample-table-scroll"><table className="sample-table sample-cost-table"><caption>Monthly infrastructure cost · E3</caption><thead><tr><th scope="col">Cost & assumed rate</th><th scope="col">Low</th><th scope="col">Higher</th></tr></thead><tbody>
        {['Base services|A$20/month: hosting, auth and database', 'Requests|A$2 per million requests', 'File storage|A$0.20 per GB/month', 'Outbound transfer|A$0.10 per GB'].map((item, i) => <tr key={item}><th scope="row">{item.split('|')[0]}<small>{item.split('|')[1]}</small></th><td>{aud(low.costs[i])}</td><td>{aud(high.costs[i])}</td></tr>)}
        <tr><th scope="row">Subtotal</th><td>{aud(low.subtotal)}</td><td>{aud(high.subtotal)}</td></tr><tr><th scope="row">Assumed GST (10%)</th><td>{aud(low.tax)}</td><td>{aud(high.tax)}</td></tr>
        <tr className="sample-total"><th scope="row">Monthly total</th><td>{aud(low.total)}</td><td>{aud(high.total)}</td></tr>
      </tbody></table></div>
      <div className="sample-callout"><strong>Transfer is the largest variable cost.</strong><p>It contributes A$15 of A$38 before GST in the low-usage model, and A$40 of A$78 in the higher-usage model.</p></div>
      <p className="sample-source">Simplified model: no bundled allowances, minimum tiers, regional rates, currency conversion or separate compute charges. No paid AI APIs or email. Validate the real provider’s billing rules before using a budget.</p>
    </Page>

    <Page n={6} label="05 / Evidence register" title="A clear boundary between inputs and proof.">
      <div className="sample-evidence">
        <article><span>E1</span><div><h3>The submitted brief</h3><p>The exact AI claim, architecture description, budget and decision shown on page 02.</p><small>Available · Fictional customer input</small></div></article>
        <article><span>E2</span><div><h3>Two usage scenarios</h3><p>5,000 active users with different request counts, storage and transfer volumes. Inputs are recorded on page 04.</p><small>Assumed · No production telemetry</small></div></article>
        <article><span>E3</span><div><h3>A transparent cost calculation</h3><p>Invented unit rates and reproducible arithmetic, shown on page 05.</p><small>Illustrative · No provider quote</small></div></article>
        <article><span>E4</span><div><h3>Capacity & real-world billing</h3><p>Dated provider plans, measured usage and a representative load test would be needed to substantiate the claim.</p><small>Missing · Required before commitment</small></div></article>
      </div>
      <div className="sample-callout"><strong>The calculation is reproducible. The claim remains unverified.</strong><p>A hypothetical model can reveal sensitivity to usage. It cannot replace evidence about the app or its selected providers.</p></div>
      <p className="sample-source">No external source or live price is cited as evidence. The reference PDF informs the visual format only.</p>
    </Page>

    <Page n={7} label="06 / Risks & limits" title="A low estimate can hide a high-impact gap." dark>
      <p className="sample-intro">Four things to resolve before treating the A$50 figure as a launch budget.</p>
      <div className="sample-risk-grid">
        <article><span>01 / USAGE</span><h3>Activity varies.</h3><p>Uploads, repeat visits and large downloads can change consumption without changing monthly active users.</p><small>Check: requests and transfer per active user.</small></article>
        <article><span>02 / CAPACITY</span><h3>A bill is not a load test.</h3><p>Monthly totals do not show whether peak traffic can be served with acceptable performance.</p><small>Check: concurrent usage and response times.</small></article>
        <article><span>03 / PRICING</span><h3>Real plans have rules.</h3><p>Allowances, overages, billing regions and paid-plan requirements are absent from this simplified model.</p><small>Check: a dated quote for every service.</small></article>
        <article><span>04 / SCOPE</span><h3>Infrastructure is one part.</h3><p>Development, domain registration, email and paid AI APIs sit outside the claim’s defined budget.</p><small>Check: a separate full operating budget.</small></article>
      </div>
      <div className="sample-dark-statement">One plausible scenario<br />is not a reliable ceiling.</div>
    </Page>

    <Page n={8} label="07 / Action plan" title="Turn a confident estimate into a testable budget.">
      <div className="sample-action-list">
        <article><span>01</span><div><h3>Measure a representative pilot.</h3><p>Capture requests per active user, file growth, transfer and peak concurrency.</p><small>Owner: founder + developer · Output: a usage worksheet</small></div></article>
        <article><span>02</span><div><h3>Price the actual service stack.</h3><p>Record dated rates, allowances, minimum plans, overages, currency and applicable taxes.</p><small>Owner: developer · Output: a provider-backed cost sheet</small></div></article>
        <article><span>03</span><div><h3>Test the workload and the headroom.</h3><p>Run representative load tests and price a higher-usage case. Agree on performance targets before testing.</p><small>Owner: developer + reviewer · Output: capacity and budget checks</small></div></article>
        <article><span>04</span><div><h3>Make the commitment conditional.</h3><p>Proceed only if measured capacity meets the agreed target and the full in-scope monthly bill stays strictly below A$50.</p><small>Owner: founder · Output: a recorded go / revise decision</small></div></article>
      </div>
      <div className="sample-callout"><strong>If the checks fail, revise the plan.</strong><p>Reduce usage, change the architecture or raise the budget. Set cost alerts and review the first actual bill.</p></div>
    </Page>

    <Page n={9} dark>
      <div className="sample-cover-brand"><ShieldCheck size={31} /> PitchProof <span>THE DECISION</span></div>
      <div className="sample-closing"><p className="sample-kicker">08 / Recommendation</p><h2>Validate the usage.<br /><span>Then commit<br />to the budget.</span></h2><p>The A$50 claim is not established by the supplied brief. The next step is a measured pilot, a real cost sheet and a capacity check.</p><div className="sample-closing-result"><span>{c.id} / FINAL FINDING</span><strong>{c.review.verdict}</strong></div></div>
      <p className="sample-closing-note">Illustrative report for the sample claim only. All scenario rates and usage inputs are fictional. No independent expert assessment or live pricing verification was performed.</p>
    </Page>
  </div>;
}

export default function SampleExperience({ report = false }: { report?: boolean }) {
  return <div className="sample-experience"><a className="skip-link" href="#sample-content">Skip to content</a>
    <header className="sample-site-header"><Link className="brand" href="/"><ShieldCheck size={25} />PitchProof</Link><span>THE EXAMPLE FILE / {c.id}</span><Link className="text-button" href="/review">Check your own claim <ArrowRight size={16} /></Link></header>
    <main id="sample-content">
      <Link className="quick-example-link" href="/example/quick"><strong>New: the five-day MVP claim</strong><span>Concrete daily tasks / {quickSampleCase.reportPages}-page report / {money(quickSampleCase.feeCents)}</span><ArrowRight size={17} /></Link>
      <div className="sample-toolbar"><div><Link className="text-button" href={report ? '/example' : '/'}><ArrowLeft size={15} />{report ? 'View matching claim' : 'Back to home'}</Link><h1>{report ? 'The ready-made report.' : 'One claim, fully worked through.'}</h1><p>{report ? 'Nine pages. One specific claim. Every assumption in view.' : 'Explore the sample brief and the report prepared for it.'}</p></div><a className="button secondary" href={`/samples/pitchproof-${report ? 'report' : 'claim'}-PP-001.pdf`} download><ArrowDownToLine size={16} />Download {report ? 'report' : 'claim'} PDF</a></div>
      <nav className="sample-tabs" aria-label="Sample documents"><Link href="/example" aria-current={!report ? 'page' : undefined}>01 / Sample claim</Link><Link href="/example/report" aria-current={report ? 'page' : undefined}>02 / Completed report <ArrowRight size={14} /></Link><span>Illustrative data · No independent review</span></nav>
      <div className={`sample-reading-layout ${report ? '' : 'sample-brief-layout'}`}>
        {report && <aside className="sample-contents"><span>IN THIS REPORT</span><nav aria-label="Report chapters">{chapters.map((chapter, i) => <a key={chapter} href={`#page-${i + 1}`}><span>{String(i + 1).padStart(2, '0')}</span>{chapter}</a>)}</nav><p>All amounts in AUD.<br />Monthly totals include assumed GST.</p></aside>}
        {report ? <SampleReport /> : <SampleClaim />}
      </div>
      <div className="sample-end"><p>{report ? 'Start with the question that matters to you.' : 'See how this exact claim is assessed.'}</p><Link className="button" href={report ? '/review' : '/example/report'}>{report ? 'Check your own claim' : 'Read the completed report'}<ArrowRight size={16} /></Link></div>
    </main>
  </div>;
}
