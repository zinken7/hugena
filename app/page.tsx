'use client';

import { useEffect, useState } from 'react';
import { ArrowRight, ArrowLeft, Check, CheckCheck, ShieldCheck, Sparkles, Lightbulb, MessageSquareText, MoveUpRight, Clock3, CircleCheck, RotateCcw } from 'lucide-react';
import demo from '../data/demo.json';
import { AdviserDirectory, CaseCommission } from './advisers';
import { type Adviser, type CaseStatus, isAdviser } from '../data/advisers';

type Idea = typeof demo.example;
type ReviewerId = keyof typeof demo.reports;
type Screen = 'home' | 'submit' | 'reviewers' | 'report';
const emptyIdea: Idea = { name: '', problem: '', solution: '', users: '' };
const storageKey = 'pitchproof-demo-v1';

export default function Page() {
  const [screen, setScreen] = useState<Screen>('home');
  const [idea, setIdea] = useState<Idea>(emptyIdea);
  const [reviewerId, setReviewerId] = useState<ReviewerId>('business');
  const [selectedAdviser, setSelectedAdviser] = useState<Adviser | null>(null);
  const [caseStatus, setCaseStatus] = useState<CaseStatus>('open');
  const [checked, setChecked] = useState<number[]>([]);
  const [ready, setReady] = useState(false);
  const [storageWarning, setStorageWarning] = useState(false);
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || 'null');
      if (saved && saved.idea && Object.keys(emptyIdea).every(key => typeof saved.idea[key] === 'string')) {
        setIdea(saved.idea);
        if (['business', 'technical', 'ux'].includes(saved.reviewerId)) setReviewerId(saved.reviewerId);
        if (isAdviser(saved.selectedAdviser)) { setSelectedAdviser(saved.selectedAdviser); setReviewerId(saved.selectedAdviser.specialty); }
        if (['open', 'completed', 'paid'].includes(saved.caseStatus)) setCaseStatus(saved.caseStatus);
        if (Array.isArray(saved.checked)) setChecked(saved.checked.filter((x: unknown) => Number.isInteger(x) && Number(x) >= 0 && Number(x) < 4));
        if (['home', 'submit', 'reviewers', 'report'].includes(saved.screen)) setScreen(saved.screen);
      }
    } catch { setStorageWarning(true); }
    setReady(true);
  }, []);
  useEffect(() => {
    if (!ready) return;
    try { localStorage.setItem(storageKey, JSON.stringify({ idea, reviewerId, selectedAdviser, caseStatus, checked, screen })); }
    catch { setStorageWarning(true); }
  }, [idea, reviewerId, selectedAdviser, caseStatus, checked, screen, ready]);
  function navigate(next: Screen) { setScreen(next); window.scrollTo({ top: 0, behavior: 'smooth' }); }
  function example() { setSelectedAdviser(null); setCaseStatus('open'); setIdea(demo.example); setReviewerId('business'); setChecked([]); navigate('report'); }
  const standardReviewer = demo.reviewers.find(r => r.id === reviewerId)!;
  const reviewer: Adviser = selectedAdviser || { ...standardReviewer, specialty: reviewerId, provider: 'platform', feeCents: 1000 };
  const report = demo.reports[reviewerId];
  const currentStep = screen === 'submit' ? 0 : screen === 'reviewers' ? 1 : 2;

  return <div className="site-shell">
    <header className="header"><div className="header-inner">
      <button className="brand" onClick={() => navigate('home')} aria-label="PitchProof home"><span className="brand-mark"><ShieldCheck size={23}/></span>Pitch<span className="brand-light">Proof</span><span className="beta">DEMO</span></button>
      <nav aria-label="Main navigation"><button className={screen === 'home' ? 'nav-link active' : 'nav-link'} onClick={() => navigate('home')}>Overview</button><button className="nav-link" onClick={example}>Example review</button><button className="button small" onClick={() => navigate('submit')}>Submit an idea <ArrowRight size={16}/></button></nav>
    </div></header>
    {storageWarning && <div className="storage-warning" role="status">Browser storage is unavailable. You can still use the demo, but changes may not survive a refresh.</div>}
    <main id="main-content" key={screen} className="page-enter">
      {screen === 'home' ? <>
        <section className="hero container">
          <div className="hero-copy"><div className="eyebrow"><span className="status-dot"/> A little perspective. A stronger idea.</div>
            <h1>Big ideas deserve<br/>a <span>second opinion.</span></h1>
            <p className="tagline">Challenge your idea before the real world does.</p>
            <p className="hero-description">Get a fresh perspective on your next big thing. Find the blind spots, build on your strengths, and move forward with a clearer plan.</p>
            <div className="hero-actions"><button className="button" onClick={() => navigate('submit')}>Get Your Idea Reviewed <ArrowRight size={18}/></button><button className="text-button" onClick={example}>Explore an example <MoveUpRight size={16}/></button></div>
            <div className="hero-note"><ShieldCheck size={16}/> Constructive feedback. Practical next steps.</div>
          </div>
          <div className="hero-visual"><div className="orbit orbit-one"/><div className="orbit orbit-two"/><div className="floating-note"><span className="note-icon"><Lightbulb size={18}/></span> Your idea, with a fresh perspective.</div>
            <div className="preview-report"><div className="preview-top"><span className="tiny-label">A FRESH SET OF EYES</span><span className="example-pill">Example review</span></div><div className="preview-title"><span className="project-icon"><Lightbulb size={25}/></span><div><h2>Neighbourhood Table</h2><p>Business & market review</p></div></div><div className="preview-divider"/>
              <div className="mini-section"><span className="mini-icon green"><Check size={17}/></span><div><h3>A strong starting point</h3><p>A clear problem. A focused audience.<br/>A concept worth exploring.</p></div></div>
              <div className="mini-section"><span className="mini-icon amber"><Lightbulb size={17}/></span><div><h3>Room to make it stronger</h3><p>Validate demand before building.<br/>Make your first pricing test simple.</p></div></div>
              <div className="preview-action"><span className="mini-icon blue"><CheckCheck size={17}/></span><div><strong>Your next move</strong><p>Talk to 5 potential users this week.</p></div><ArrowRight size={18}/></div>
              <div className="preview-person"><span className="avatar avatar-small peach">AM</span><span><strong>Alex Morgan</strong><small>Fictional business consultant</small></span><ShieldCheck size={19}/></div>
            </div><div className="floating-bottom"><span className="green"><Check size={16}/></span> Less guesswork. More direction.</div>
          </div>
        </section>
        <section className="process container" aria-labelledby="process-title"><div className="section-heading"><div><span className="tiny-label">FROM “WHAT IF” TO “WHAT’S NEXT”</span><h2 id="process-title">A fresh perspective in three simple steps.</h2></div><span className="time-note"><Clock3 size={15}/> Try the demo in 2 minutes</span></div><div className="process-grid">
          {[{icon: Lightbulb, title:'Share your idea', text:'The problem, your solution, and who it’s for. No perfect pitch required.'}, {icon: MessageSquareText, title:'Choose your perspective', text:'Business, technology, or user experience. Pick the lens your idea needs.'}, {icon: CheckCheck, title:'Leave with a clear next step', text:'Explore strengths, honest critique, and an actionable improvement checklist.'}].map((item,i) => <div className="process-item" key={item.title}><div className="process-icon"><item.icon size={21}/></div><span className="step-number">0{i+1}</span><h3>{item.title}</h3><p>{item.text}</p></div>)}
        </div></section>
        <div className="demo-banner container"><Sparkles size={18}/><p><strong>A small prototype for big possibilities.</strong> Try the full journey with fictional reviewers and example feedback.</p><span>No signup. No payment.</span></div>
      </> : <div className="flow-container container">
        <div className="steps" aria-label="Review progress">{['Your idea', 'Your reviewer', 'Your feedback'].map((label,i) => <div key={label} className={`step ${currentStep >= i ? 'step-active' : ''}`} aria-current={currentStep === i ? 'step' : undefined}><span>{currentStep > i ? <Check size={14}/> : `0${i+1}`}</span>{label}{i < 2 && <div className="step-line"/>}</div>)}</div>
        {screen === 'submit' && <section className="form-layout"><div className="form-intro"><span className="eyebrow">01 / THE STARTING POINT</span><h1>Every great idea<br/>starts somewhere.</h1><p>Tell us what you’re thinking. A few clear sentences are all you need to get a fresh perspective.</p><div className="tip-card"><Lightbulb size={22}/><h3>A rough idea is enough.</h3><p>Focus on the problem first. Who experiences it, and what would a better solution look like?</p></div><button className="text-button" onClick={() => { setIdea(demo.example); setChecked([]); }}>Just exploring? Use a sample idea <ArrowRight size={16}/></button></div>
          <form className="idea-form card" onSubmit={event => { event.preventDefault(); if (Object.values(idea).some(value => !value.trim())) return; setIdea(Object.fromEntries(Object.entries(idea).map(([key,value])=>[key,value.trim()])) as Idea); setChecked([]); setCaseStatus('open'); navigate('reviewers'); }}>
            <div className="form-top"><h2>Your idea, in a nutshell</h2><span>All fields required</span></div>
            {([{key:'name', label:'Project name', hint:'Give your idea a working title.', placeholder:'e.g. Neighbourhood Table'}, {key:'problem',label:'What problem are you solving?',hint:'Describe the challenge your users face.',placeholder:'People struggle with…'}, {key:'solution',label:'What’s your proposed solution?',hint:'How will your idea make things better?',placeholder:'My idea helps by…'}, {key:'users',label:'Who is it for?',hint:'Be as specific as you can about your target users.',placeholder:'e.g. Busy professionals in urban neighbourhoods'}] as const).map(field => <div className="field" key={field.key}><label htmlFor={field.key}>{field.label}</label><p id={`${field.key}-hint`}>{field.hint}</p>{field.key === 'name' ? <input id={field.key} aria-describedby={`${field.key}-hint`} required pattern=".*\S.*" maxLength={100} value={idea[field.key]} placeholder={field.placeholder} onChange={e=>setIdea({...idea,[field.key]:e.target.value})}/> : <textarea id={field.key} aria-describedby={`${field.key}-hint`} required maxLength={1500} rows={field.key === 'users' ? 2 : 3} value={idea[field.key]} placeholder={field.placeholder} onChange={e=>{ e.target.setCustomValidity(''); setIdea({...idea,[field.key]:e.target.value}); }} onBlur={e=>e.target.setCustomValidity(e.target.value.trim() ? '' : 'Please add a few words.')} />}</div>)}
            <button className="button full" type="submit">Submit idea & choose reviewer <ArrowRight size={17}/></button><p className="privacy-note"><ShieldCheck size={14}/> Your idea stays in this browser. This is a local demo.</p>
          </form></section>}
        {screen === 'reviewers' && <section><div className="center-heading"><span className="eyebrow">02 / A FRESH PERSPECTIVE</span><h1>Find your idea’s sounding board.</h1><p>Find business, technology, or UX expertise from our standard advisers and independent external advisers.</p></div><div className="idea-summary"><span className="project-icon"><Lightbulb size={21}/></span><div><span className="tiny-label">YOUR IDEA</span><strong>{idea.name}</strong></div><button className="text-button" onClick={()=>navigate('submit')}>Edit idea <ArrowLeft size={15}/></button></div><AdviserDirectory onChoose={person => { setSelectedAdviser(person); setReviewerId(person.specialty); setCaseStatus('open'); setChecked([]); navigate('report'); }}/></section>}
        {screen === 'report' && <section><div className="report-heading"><div><span className="eyebrow">03 / A CLEARER WAY FORWARD</span><h1>A little clarity. Your next move.</h1><p>Constructive critique to help you shape a stronger idea.</p></div><button className="text-button" onClick={()=>navigate('reviewers')}><ArrowLeft size={16}/> Change reviewer</button></div><div className="report-disclaimer"><Sparkles size={19}/><p><strong>Example review — for demo purposes only.</strong> This prewritten {reviewer.role.toLowerCase()} report is not an assessment of your submission. No expert or AI has reviewed your idea.</p></div><div className="report-layout"><div className="report-main"><div className="report-project card"><div className="project-icon"><Lightbulb size={24}/></div><div><span className="tiny-label">YOUR PROJECT</span><h2>{idea.name || demo.example.name}</h2><p>{report.summary}</p></div></div><section className="strengths card"><h2><span className="mini-icon green"><Check size={18}/></span> What’s working</h2><ul>{report.strengths.map(strength=><li key={strength}><CircleCheck size={17}/>{strength}</li>)}</ul></section><section className="weaknesses"><h2>Three opportunities to improve <span>TOP 3</span></h2>{report.weaknesses.map((weakness,i)=><article className="weakness card" key={weakness.title}><span className="weakness-number">0{i+1}</span><div><h3>{weakness.title}</h3><p><strong>Why it matters</strong>{weakness.why}</p><div className="improvement"><span><ArrowRight size={15}/> TRY THIS</span>{weakness.improvement}</div></div></article>)}</section></div><aside className="report-aside"><section className="card reviewer-summary"><span className="tiny-label">YOUR CHOSEN PERSPECTIVE</span><div className="reviewer-inline"><span className={`avatar avatar-small ${reviewer.color}`}>{reviewer.initials}</span><div><h3>{reviewer.name}</h3><p>{reviewer.role}</p></div></div><span className="fictional-label">{reviewer.provider === 'external' ? 'External adviser' : 'PitchProof adviser'} / Demo profile</span></section><CaseCommission adviser={reviewer} status={caseStatus} onChange={setCaseStatus}/><section className="checklist card"><div className="checklist-title"><h2>Your next steps</h2><CheckCheck size={21}/></div><p>Small actions. Meaningful progress.</p><div className="progress-meta" aria-live="polite"><span>{checked.length} of {report.tasks.length} completed</span><strong>{Math.round(checked.length/report.tasks.length*100)}%</strong></div><div className="progress-track"><div style={{width:`${checked.length/report.tasks.length*100}%`}}/></div><div className="tasks">{report.tasks.map((task,i)=><label className={checked.includes(i)?'task completed':'task'} key={task}><input type="checkbox" checked={checked.includes(i)} onChange={()=>setChecked(previous=>previous.includes(i)?previous.filter(n=>n!==i):[...previous,i])}/><span>{task}</span></label>)}</div>{checked.length===report.tasks.length && <div className="completion" role="status"><Sparkles size={16}/> All done. Keep the momentum going!</div>}<p className="saved-note">Progress is saved in this browser.</p></section><button className="text-button new-idea" onClick={()=>{setIdea(emptyIdea);setChecked([]);setSelectedAdviser(null);setCaseStatus('open');navigate('submit');}}><RotateCcw size={16}/> Start a new idea</button></aside></div></section>}
      </div>}
    </main>
    <footer className="footer container"><span className="footer-brand"><ShieldCheck size={17}/>PitchProof</span><span>Better questions. Stronger ideas.</span><span>An interactive MVP · Built for possibility</span></footer>
  </div>;
}
