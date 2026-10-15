import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { CardArt, CardBack } from './Art';

type Card = { id: string; name: string; arcana: string; suit: string | null; number: number; keyword: string; meaning: string };
type Drawn = { card_id: string; position: string; orientation: 'upright' | 'reversed' };
type Reading = { mode: 'demo' | 'ai'; title: string; overall: string; cards: { card_id: string; interpretation: string }[]; reflection_prompts: string[] };
type Spread = 'one' | 'three';
type Phase = 'question' | 'draw' | 'reveal' | 'reading';
async function api<T>(path: string, body?: unknown): Promise<T> {
  const response = await fetch(`/api/${path}`, { method: body === undefined ? 'GET' : 'POST', headers: body === undefined ? {} : { 'Content-Type': 'application/json' }, body: body === undefined ? undefined : JSON.stringify(body), signal: AbortSignal.timeout(60000) });
  const data = await response.json();
  if (!response.ok) throw new Error(typeof data.detail === 'string' ? data.detail : 'Something went wrong. Please try again.');
  return data as T;
}
const suggestions = ['What should I focus on right now?', 'How can I invite more connection?', 'What is my next step forward?'];
export default function App() {
  const [catalog, setCatalog] = useState<Card[]>([]);
  const [mode, setMode] = useState<'demo' | 'ai'>('demo');
  const [ready, setReady] = useState(false);
  const [question, setQuestion] = useState('');
  const [spread, setSpread] = useState<Spread>('three');
  const [phase, setPhase] = useState<Phase>('question');
  const [drawn, setDrawn] = useState<Drawn[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [revealed, setRevealed] = useState<number[]>([]);
  const [reading, setReading] = useState<Reading | null>(null);
  const [busy, setBusy] = useState(false);
  const [shuffling, setShuffling] = useState(false);
  const [error, setError] = useState('');
  const [library, setLibrary] = useState(false);
  const [search, setSearch] = useState('');
  const readingRef = useRef<HTMLElement>(null);
  const shuffleTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const count = spread === 'one' ? 1 : 3;
  async function load() {
    setError('');
    try {
      const [cards, config] = await Promise.all([api<Card[]>('cards'), api<{ mode: 'demo' | 'ai' }>('config')]);
      setCatalog(cards); setMode(config.mode); setReady(true);
    } catch { setError('Could not connect to the reading service. Check that the backend is running, then retry.'); }
  }
  useEffect(() => { void load(); return () => { clearTimeout(shuffleTimer.current); }; }, []);
  useEffect(() => { if (reading) readingRef.current?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' }); }, [reading]);
  async function start() {
    setBusy(true); setError('');
    try {
      const result = await api<{ cards: Drawn[] }>('draws', { spread });
      setDrawn(result.cards); setSelected([]); setRevealed([]); setReading(null); setPhase('draw');
    } catch (e) { setError(e instanceof Error ? e.message : 'Unable to draw cards.'); }
    finally { setBusy(false); }
  }
  function select(index: number) {
    if (selected.includes(index) || selected.length >= count || shuffling) return;
    const next = [...selected, index]; setSelected(next);
    if (next.length === count) setPhase('reveal');
  }
  function shuffle() {
    if (shuffling || selected.length) return;
    setShuffling(true);
    shuffleTimer.current = setTimeout(() => setShuffling(false), 850);
  }
  async function interpret() {
    setBusy(true); setError('');
    try {
      const result = await api<Reading>('readings', { question: question.trim(), spread, cards: drawn });
      setReading(result); setPhase('reading');
    } catch (e) { setError(e instanceof Error ? e.message : 'Unable to create your reading.'); }
    finally { setBusy(false); }
  }
  function reset() { setPhase('question'); setDrawn([]); setSelected([]); setRevealed([]); setReading(null); setError(''); }
  return <div className="site-shell">
    <header className="site-header"><a className="brand" href="#" aria-label="Arcana home" onClick={(e) => {e.preventDefault(); if (!busy) { reset(); setLibrary(false); }}}><span className="brand-mark">✧</span> arcana<span className="brand-dot">.</span></a><nav aria-label="Main navigation"><button className={!library ? 'nav-active' : ''} onClick={() => setLibrary(false)}>Your reading</button><button className={library ? 'nav-active' : ''} onClick={() => setLibrary(true)}>The deck <span>↗</span></button></nav><span className="header-note">A SPACE FOR SELF-DISCOVERY</span></header>
    <main>
      {library ? <section className="library"><p className="eyebrow">THE LANGUAGE OF THE CARDS</p><h1>Meet the deck.</h1><p className="intro">78 symbols. Countless perspectives. Explore the meaning behind each card.</p><label className="search-label">Search the deck<input value={search} onChange={e => setSearch(e.target.value)} placeholder="Try The Moon, Cups, or courage" type="search"/></label>{!ready && <button className="primary" onClick={() => void load()}>Retry connection</button>}<div className="library-grid">{catalog.filter(c => `${c.name} ${c.keyword}`.toLowerCase().includes(search.toLowerCase())).map(card => <article key={card.id}><CardArt variant={card.number}/><p className="eyebrow">{card.arcana}</p><h3>{card.name}</h3><p>{card.meaning}</p></article>)}</div>{ready && !catalog.some(c => `${c.name} ${c.keyword}`.toLowerCase().includes(search.toLowerCase())) && <p>No cards found. Try another word.</p>}</section> : <>
      <section className="hero"><div className="orbit orbit-one"/><div className="orbit orbit-two"/><div className="hero-copy"><p className="eyebrow"><span/> A MOMENT FOR YOU</p><h1>A little clarity,<br/>written in the <em>cards.</em></h1><p className="intro">Quiet the noise. Ask what’s on your mind.<br/>Let ancient symbols open a new perspective.</p><div className="hero-caption"><span>✧</span> Ancient wisdom. A personal perspective.</div></div><div className="hero-cards" aria-hidden="true"><div className="hero-card left"><CardArt variant={2}/><span>THE STAR</span></div><div className="hero-card right"><CardArt variant={1}/><span>THE SUN</span></div><div className="hero-card center"><CardArt variant={0}/><span>THE MOON</span></div><span className="floating-star star-a">✧</span><span className="floating-star star-b">✦</span><span className="floating-star star-c">✧</span></div></section>
      <section className="ritual" aria-labelledby="ritual-title"><div className="section-top"><div><p className="eyebrow">YOUR QUIET CORNER OF THE UNIVERSE</p><h2 id="ritual-title">{phase === 'question' ? 'What’s on your mind?' : phase === 'draw' ? 'Let your intuition choose.' : 'Your cards have a story.'}</h2></div><span className="mode-badge"><span/>{mode === 'demo' ? 'DEMO READING' : 'AI PERSONALIZED'}</span></div>
      <ol className="steps">{['Set your intention', 'Draw your cards', 'Find your perspective'].map((text, i) => <li key={text} className={(phase === 'question' ? 0 : phase === 'draw' || phase === 'reveal' ? 1 : 2) === i ? 'active' : ''}><span>0{i + 1}</span>{text}</li>)}</ol>
      {phase === 'question' ? <form onSubmit={e => { e.preventDefault(); void start(); }}><label htmlFor="question">Your question or intention</label><textarea id="question" required minLength={3} maxLength={1000} value={question} onChange={e => setQuestion(e.target.value)} placeholder="What would you like a little clarity on?" rows={3}/><div className="question-meta"><span>Open questions leave room for discovery.</span><span>{question.length}/1000</span></div><div className="suggestions">{suggestions.map(text => <button type="button" key={text} onClick={() => setQuestion(text)}>{text} <span>↗</span></button>)}</div><fieldset><legend>Choose your spread</legend><div className="spread-options"><label className={spread === 'one' ? 'spread selected' : 'spread'}><input type="radio" name="spread" value="one" checked={spread === 'one'} onChange={() => setSpread('one')}/><span className="spread-symbol">▯</span><span><strong>A single insight</strong><small>One card. A gentle nudge.</small></span><span className="radio-dot"/></label><label className={spread === 'three' ? 'spread selected' : 'spread'}><input type="radio" name="spread" value="three" checked={spread === 'three'} onChange={() => setSpread('three')}/><span className="spread-symbol">▯▯▯</span><span><strong>The bigger picture</strong><small>Three cards. A story unfolding.</small></span><span className="radio-dot"/></label></div></fieldset><div className="form-bottom"><p>✧ Take a breath. There’s no right or wrong question.</p><button className="primary" disabled={!ready || question.trim().length < 3 || busy}>{busy ? 'Preparing your deck…' : 'Begin your reading'} <span>→</span></button></div></form> : <div className="draw-area"><p className="intention">“{question}”</p>{phase === 'draw' ? <><p className="draw-instruction" aria-live="polite">{shuffling ? 'Shuffling the deck…' : `Choose ${count - selected.length} ${count - selected.length === 1 ? 'card' : 'cards'} from the deck.`}</p><div className={`deck ${shuffling ? 'shuffling' : ''}`}>{Array.from({length: 12}, (_, i) => <button key={i} className={`deck-card ${selected.includes(i) ? 'chosen' : ''}`} style={{'--angle': `${(i - 5.5) * 4}deg`, '--rise': `${Math.abs(i - 5.5) * 3}px`, '--delay': `${i * 25}ms`} as CSSProperties} disabled={selected.includes(i) || shuffling} onClick={() => select(i)} aria-label={`Select face-down card ${i + 1}`}><CardBack/></button>)}</div><button className="text-button" onClick={shuffle} disabled={shuffling || selected.length > 0}>⟳ Shuffle again</button><p className="fine-print">Cards are randomly drawn. Your selection sets the reveal order.</p></> : <><p className="draw-instruction" aria-live="polite">{revealed.length < count ? 'Tap each card to reveal its message.' : 'Take a moment with your cards.'}</p><div className="revealed-spread">{drawn.map((draw, i) => {const card = catalog.find(c => c.id === draw.card_id)!; const flipped = revealed.includes(i); return <div className="reveal-slot" key={draw.card_id}><p className="eyebrow">0{i + 1} · {draw.position}</p><button className={`flip-card ${flipped ? 'flipped' : ''}`} aria-label={flipped ? `${card.name}, ${draw.orientation}` : `Reveal card ${i + 1}`} aria-pressed={flipped} disabled={flipped} onClick={() => setRevealed([...revealed, i])}><div className="flip-inner"><div className="flip-back"><CardBack/></div><div className="flip-front"><CardArt variant={card.number} reversed={draw.orientation === 'reversed'}/></div></div></button><h3>{flipped ? card.name : 'A little mystery'}</h3><p className="card-keyword">{flipped ? `${draw.orientation} · ${card.keyword}` : 'Waiting to be revealed'}</p></div>;})}</div>{!reading && <button className="primary" disabled={revealed.length !== count || busy} onClick={() => void interpret()}>{busy ? 'Gathering your perspective…' : 'Explore my reading'} <span>✧</span></button>}</>}<button className="text-button start-over" disabled={busy} onClick={reset}>Start a new reading</button></div>}
      {error && <div className="error" role="alert">{error}{!ready && <button onClick={() => void load()}>Retry connection</button>}</div>}
      {mode === 'demo' && <p className="demo-note">You’re exploring demo mode. Readings use card meanings and reflection prompts; live AI personalization is available when configured.</p>}
      </section>
      {reading && <section className="reading-result" ref={readingRef} tabIndex={-1}><p className="eyebrow">{reading.mode === 'demo' ? 'YOUR DEMO PERSPECTIVE' : 'YOUR PERSONALIZED PERSPECTIVE'}</p><h2>{reading.title}</h2><p className="overall">{reading.overall}</p><div className="interpretations">{reading.cards.map((item, i) => <article key={item.card_id}><span>0{i + 1}</span><div><p className="eyebrow">{drawn[i].position}</p><h3>{catalog.find(c => c.id === item.card_id)?.name}</h3><p>{item.interpretation}</p></div></article>)}</div><div className="reflection"><p className="eyebrow">TAKE IT WITH YOU</p><h3>A little room for reflection</h3>{reading.reflection_prompts.map(prompt => <p key={prompt}>✧ {prompt}</p>)}</div><button className="primary" onClick={reset}>Begin again <span>→</span></button></section>}
      <section className="values"><article><span>✧</span><h3>A mirror, not a map</h3><p>Fresh perspectives to help you hear your own inner wisdom.</p></article><article><span>☾</span><h3>A ritual at your pace</h3><p>No rush. A deep breath and a little space to be present.</p></article><article><span>✦</span><h3>Your story, your choices</h3><p>The cards invite reflection. The next chapter is always yours.</p></article></section>
      </>}
    </main><footer><a className="brand" href="#">✧ arcana.</a><p>For reflection and entertainment. Your intuition has the final word.</p><span>MADE FOR THE MOMENTS BETWEEN</span></footer>
  </div>;
}
