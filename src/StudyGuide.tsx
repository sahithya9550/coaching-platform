import { useState, type FormEvent } from 'react';
import { ArrowRight, MessageCircle, Send } from 'lucide-react';
import { api } from './learning-api';

const suggestions = ['Plan my next study session', 'What should I review after a quiz?', 'How do I prepare for a mentor demo?'];
type Answer = { reply: string; mode: 'guided' | 'ai' };

export default function StudyGuide({ demoHref }: { demoHref: string }) {
 const [exam, setExam] = useState('JEE');
 const [minutes, setMinutes] = useState(60);
 const [question, setQuestion] = useState('');
 const [exchange, setExchange] = useState<{question: string; answer: Answer} | null>(null);
 const [busy, setBusy] = useState(false);
 const [error, setError] = useState('');

 async function ask(message: string) {
  if (!message.trim() || busy) return;
  setBusy(true);
  setError('');
  try {
   const answer: Answer = await api('study-guide', 'POST', {exam, minutes, question:message});
   setExchange({question:message, answer});
   setQuestion('');
  } catch(e) {
   setError(e instanceof Error ? e.message : 'Please try again.');
  } finally {
   setBusy(false);
  }
 }

 function submit(event: FormEvent<HTMLFormElement>) {
  event.preventDefault();
  void ask(question);
 }

 return <section id="study-guide" className="study-guide section wrap" aria-labelledby="guide-title">
  <div className="guide-intro">
   <h2 id="guide-title">What should I study next?</h2>
   <p>Build a study session around the time you have, work through quiz mistakes, or prepare a question for your mentor.</p>
   <div className="guide-links">
    <a className="text-link" href="/learn">Open Student Studio <ArrowRight size={16}/></a>
    <a className="text-link" href={demoHref}>Request a free demo <ArrowRight size={16}/></a>
   </div>
  </div>
  <div className="guide-card">
   <h3><MessageCircle size={20} aria-hidden="true"/> Bharat Study Guide</h3>
   <div className="guide-controls">
    <label>Exam<select value={exam} onChange={e=>setExam(e.target.value)}><option>JEE</option><option>NEET</option><option value="Foundation">Classes 9–10</option></select></label>
    <label>Study time<select value={minutes} onChange={e=>setMinutes(Number(e.target.value))}>{[30,45,60,90].map(time=><option key={time} value={time}>{time} min</option>)}</select></label>
   </div>
   <div className="guide-prompts">{suggestions.map(s=><button type="button" key={s} disabled={busy} onClick={()=>void ask(s)}>{s}</button>)}</div>
   <div className="guide-result" aria-live="polite">
    {busy && <p>Preparing your suggestion…</p>}
    {!busy && exchange && <><p className="guide-question">{exchange.question}</p><div className="guide-answer"><strong>{exchange.answer.mode==='ai'?'AI guidance':'Guided suggestion'}</strong><p>{exchange.answer.reply}</p></div></>}
    {error && <p role="alert">{error}</p>}
   </div>
   <form onSubmit={submit}>
    <label htmlFor="study-question">Ask about your preparation</label>
    <div className="guide-input">
     <input id="study-question" value={question} onChange={e=>setQuestion(e.target.value)} maxLength={400} placeholder="How should I review motion and forces?" required/>
     <button className="button small" type="submit" disabled={busy || !question.trim()} aria-label="Send question"><Send size={16}/></button>
    </div>
    <p className="guide-privacy">Keep names and contact details out of your question. If AI guidance is enabled, your question is sent to OpenAI.</p>
   </form>
  </div>
 </section>;
}
