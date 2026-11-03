import Link from 'next/link';
import { ArrowDownToLine, ArrowLeft, ArrowRight, ShieldCheck } from 'lucide-react';
import { quickSampleCase as c, quickTotalHours, quickReserveHours } from '../../../data/quick-sample-case';
import { money } from '../../../data/advisers';
import '../sample-report.css';
import './quick-report.css';

function Footer({ n, total }: { n: number; total: number }) {
  return <footer className="sample-page-footer"><span><ShieldCheck size={18} />PitchProof</span><span>{c.id} / Report price {money(c.feeCents)}</span><span>0{n} / 0{total}</span></footer>;
}

export default function QuickExperience({ report = false }: { report?: boolean }) {
  return <div className="sample-experience quick-experience"><a className="skip-link" href="#sample-content">Skip to content</a>
    <header className="sample-site-header"><Link className="brand" href="/"><ShieldCheck size={25} />PitchProof</Link><span>QUICK REVIEW / {c.id}</span><Link className="text-button" href="/example">View the other example <ArrowRight size={16} /></Link></header>
    <main id="sample-content">
      <div className="sample-toolbar"><div><Link className="text-button" href={report ? '/example/quick' : '/'}><ArrowLeft size={15} />{report ? 'View matching claim' : 'Back to home'}</Link><h1>{report ? 'Five days, task by task.' : 'A new claim. A focused review.'}</h1><p>{money(c.feeCents)} total report price / {c.reportPages}-page explanation / {c.id}</p></div><a className="button secondary" href={`/samples/pitchproof-${report ? 'report' : 'claim'}-${c.id}.pdf`} download><ArrowDownToLine size={16} />Download {report ? 'report' : 'claim'} PDF</a></div>
      <nav className="sample-tabs" aria-label="Sample documents"><Link href="/example/quick" aria-current={!report ? 'page' : undefined}>01 / Sample claim</Link><Link href="/example/quick/report" aria-current={report ? 'page' : undefined}>02 / Two-page report <ArrowRight size={14} /></Link><span>Illustrative sample / No payment collected</span></nav>
      <div className="sample-reading-layout sample-brief-layout"><div className="sample-document quick-document">
        <section className="sample-page quick-page" aria-label={report ? '1. Claim and conclusion' : 'Sample claim PP-002'}>
          <div className="sample-page-body">
            <div className="quick-masthead"><p className="sample-kicker">{report ? 'Quick review' : 'Sample claim'} / {c.id}</p><strong>{money(c.feeCents)}<small>report price</small></strong></div>
            <h2>{report ? <>Five working days.<br />One tightly scoped MVP.</> : <>Can this booking MVP<br />ship in five days?</>}</h2>
            <blockquote className="sample-claim">“{c.claim.claim}”</blockquote>
            <div className="quick-stats"><div><strong>5 × 8h</strong><span>one developer / working days</span></div><div><strong>{quickTotalHours - quickReserveHours}h + {quickReserveHours}h</strong><span>planned work + fix reserve</span></div><div><strong>{money(c.feeCents)}</strong><span>report fee / not a build quote</span></div></div>
            <div className="quick-section"><h3>Exactly what gets built</h3><p>Customer sign-in; six seeded services; fixed available slots; booking with double-booking protection; My bookings; cancellation; and a staff daily list with a completed status.</p></div>
            <div className="quick-section"><h3>Before the five-day clock starts</h3><p>{c.prerequisites}</p></div>
            {report ? <div className="sample-callout quick-verdict"><span className="sample-verdict">{c.verdict}</span><p>{c.summary}</p></div> : <div className="quick-section"><h3>The decision to make</h3><p>{c.claim.decision}</p><p>The matching report gives named tasks, hour estimates and a completion check for every working day.</p></div>}
            <div className="quick-section"><h3>Outside this MVP</h3><p>{c.exclusions}</p></div>
            <p className="sample-source">{c.date}. Fictional brief and illustrative effort estimates; no developer commitment or independent review. The {money(c.feeCents)} fee is for the two-page report only, not development or hosting.</p>
          </div><Footer n={1} total={report ? 2 : 1} />
        </section>
        {report && <section className="sample-page quick-page quick-plan-page" aria-label="2. Five-day task schedule"><div className="sample-page-body">
          <p className="sample-kicker">Delivery plan / {quickTotalHours} working hours</p><h2>What happens each day.</h2>
          <div className="quick-days">{c.days.map(day => <article className="quick-day" key={day.day}><div className="quick-day-heading"><span>DAY {day.day}</span><h3>{day.title}</h3><strong>{day.tasks.reduce((sum, task) => sum + task.hours, 0)}h</strong></div><ul>{day.tasks.map(task => <li key={task.text}><span>{task.text}</span><strong>{task.hours}h</strong></li>)}</ul><p><strong>Done when:</strong> {day.done}</p></article>)}</div>
          <div className="quick-decision"><strong>Approve the scope, then confirm the estimate.</strong><p>Ask the developer to sign off on these tasks before fixing the date. Keep the 4-hour reserve for defects. Missing inputs, unfinished checks or larger fixes require a revised scope or delivery date.</p></div>
          <p className="sample-source">Evidence: fictional brief + task estimates above. 5 days × 8h = 40h; 36h planned work + 4h reserve. No completed implementation, time logs or test results were supplied.</p>
        </div><Footer n={2} total={2} /></section>}
      </div></div>
      <div className="sample-end"><Link className="button" href={report ? '/example/quick' : '/example/quick/report'}>{report ? 'View matching claim' : 'Read the two-page report'}<ArrowRight size={16} /></Link></div>
    </main>
  </div>;
}
