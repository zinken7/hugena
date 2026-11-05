import { ArrowDownToLine, ArrowLeft } from 'lucide-react';
import { type Adviser, money, reportFormat } from '../../data/advisers';
import { sampleCase } from '../../data/sample-case';
import { BriefReport } from './brief-report';
import { chapters, ComprehensiveReport } from './comprehensive-report';

// The report a customer sees after submitting the example claim. The adviser's fee
// picks the format: the brief report or the comprehensive report.
export function ExampleReport({ adviser, onBack }: { adviser: Adviser; onBack: () => void }) {
  const { kind, label } = reportFormat(adviser.feeCents);
  return <div className="report-view">
    <div className="sample-toolbar">
      <div>
        <button className="text-button" onClick={onBack}><ArrowLeft size={15} />Back to my request</button>
        <h1>What the adviser found</h1>
        <p>{adviser.name} · {money(adviser.feeCents)} · {label}</p>
      </div>
      <a className="button secondary" href={`/samples/hugena-report-${sampleCase.id}-${kind}.pdf`} download><ArrowDownToLine size={16} />Download PDF</a>
    </div>
    <div className={`sample-reading-layout ${kind === 'comprehensive' ? '' : 'sample-brief-layout'}`}>
      {kind === 'comprehensive' && <aside className="sample-contents"><span>IN THIS REPORT</span><nav aria-label="Report chapters">{chapters.map((chapter, i) => <a key={chapter} href={`#page-${i + 1}`}><span>{String(i + 1).padStart(2, '0')}</span>{chapter}</a>)}</nav><p>All amounts in AUD.<br />Monthly totals include assumed GST.</p></aside>}
      {kind === 'comprehensive' ? <ComprehensiveReport /> : <BriefReport />}
    </div>
  </div>;
}
