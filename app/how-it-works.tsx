'use client';
import { useEffect, useRef, useState } from 'react';
import { ArrowDownToLine, Check, Copy, RotateCcw, Send, ThumbsDown, ThumbsUp } from 'lucide-react';
import { aud, sampleScenarios } from '../data/sample-case';
import { BrandMark } from './brand';

const [low, high] = sampleScenarios;

const steps = [
  { id: 'send', title: 'Send the AI’s answer', text: 'Install the Hugena Chrome extension. A paper-plane button appears at the end of the buttons under each AI answer. Click it and the whole answer opens in Hugena, ready to check.' },
  { id: 'adviser', title: 'Pick an adviser', text: 'Every adviser makes their own offer, from a quick brief report to a comprehensive review, each at its own price. Compare their expertise, sample opinions and offers, then pick the one that suits you.' },
  { id: 'review', title: 'The adviser checks it', text: 'Your adviser tests the assumptions behind the answer and notes what holds up, what doesn’t and what’s missing.' },
  { id: 'report', title: 'Get your report', text: 'Read the verdict, the evidence and the next step, then download the report as a PDF.' },
] as const;

function SendVisual() {
  return <>
    <div className="chat-window">
      <div className="chat-bar"><i /><i /><i /><span>AI assistant</span></div>
      <div className="chat-body">
        <p className="chat-user">Can this app handle 5,000 users for under A$50 a month?</p>
        <div className="chat-ai">
          <span className="chat-ai-mark">✳</span>
          <div>
            <p>Yes. A Next.js app with hosted authentication, a database and file storage can support 5,000 monthly active users for under A$50/month.</p>
            <div className="chat-actions"><Copy /><ThumbsUp /><ThumbsDown /><RotateCcw /><span className="chat-send"><Send /><em>Send to Hugena</em></span></div>
          </div>
        </div>
      </div>
    </div>
    <div className="chat-toast"><BrandMark size={22} /><div><strong>Opened in Hugena</strong><small>The answer is in your claim form</small></div></div>
  </>;
}

function AdviserVisual() {
  const advisers = [
    { initials: 'AM', name: 'Alex Morgan', role: 'Business Consultant', fee: 'A$1', report: 'Brief report', color: 'peach', chosen: false },
    { initials: 'TB', name: 'Taylor Brooks', role: 'Independent adviser', fee: 'A$2', report: 'Comprehensive report', color: 'purple', chosen: true },
  ];
  return <div className="mini-advisers">{advisers.map(a => <div key={a.name} className={`mini-adviser ${a.chosen ? 'is-chosen' : ''}`}>
    <span className={`avatar avatar-small ${a.color}`}>{a.initials}</span><strong>{a.name}</strong><small>{a.role}</small>
    <div className="mini-price"><b>{a.fee}</b><span>{a.report}</span></div>
    {a.chosen && <span className="mini-check"><Check size={14} /></span>}
  </div>)}</div>;
}

function ReviewVisual() {
  const checks = [
    { label: 'Requests per user', note: 'Not supplied', tone: 'bad' },
    { label: 'Cost at low and higher usage', note: `${aud(low.total)} / ${aud(high.total)}`, tone: 'warn' },
    { label: 'Provider quotes', note: 'None', tone: 'bad' },
    { label: 'Load test', note: 'Checking', tone: 'pending' },
  ];
  return <div className="review-sheet">
    <div className="review-who"><span className="avatar avatar-small blue">SC</span><div><strong>Sam Chen</strong><small>Checking the assumptions</small></div><span className="review-live">Reviewing</span></div>
    <ul>{checks.map(c => <li key={c.label} className={`is-${c.tone}`}><span />{c.label}<em>{c.note}</em></li>)}</ul>
  </div>;
}

function ReportVisual() {
  return <div className="mini-report">
    <div className="mini-report-top"><BrandMark size={22} /><span>HG-001</span></div>
    <span className="verdict">Insufficient evidence</span>
    <h4>Can this app run on A$50 a month?</h4>
    <div className="mini-numbers"><div><b>{aud(low.total)}</b><span>a month at low usage</span></div><div><b>{aud(high.total)}</b><span>a month at higher usage</span></div></div>
    <div className="mini-files"><span><ArrowDownToLine size={14} />Brief report · PDF</span><span><ArrowDownToLine size={14} />Comprehensive report · PDF</span></div>
  </div>;
}

const visuals = { send: SendVisual, adviser: AdviserVisual, review: ReviewVisual, report: ReportVisual };

export function HowItWorks() {
  const [active, setActive] = useState(0);
  const items = useRef<(HTMLLIElement | null)[]>([]);
  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) if (entry.isIntersecting) setActive(Number((entry.target as HTMLElement).dataset.step));
    }, { rootMargin: '-40% 0px -55% 0px' });
    items.current.forEach(item => item && observer.observe(item));
    return () => observer.disconnect();
  }, []);
  return <section id="how" className="container section how">
    <div className="how-head"><span className="eyebrow">HOW IT WORKS</span><h2>Have an expert <span className="gradient-text">verify your AI’s claims</span>.</h2></div>
    <div className="how-layout">
      <nav className="how-nav" aria-label="How it works steps">{steps.map((step, i) => <a key={step.id} href={`#how-${step.id}`} aria-current={active === i ? 'step' : undefined}><span>STEP 0{i + 1}</span>{step.title}</a>)}</nav>
      <ol className="how-steps">{steps.map((step, i) => {
        const Visual = visuals[step.id];
        return <li key={step.id} id={`how-${step.id}`} data-step={i} ref={el => { items.current[i] = el; }}>
          <span className="how-step-number">STEP 0{i + 1}</span>
          <h3>{step.title}</h3>
          <p>{step.text}</p>
          <div className={`how-visual how-visual-${step.id}`} aria-hidden="true"><Visual /></div>
        </li>;
      })}</ol>
    </div>
  </section>;
}
