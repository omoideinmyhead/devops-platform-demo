export function CardArt({ variant = 0, reversed = false }: { variant?: number; reversed?: boolean }) {
  const symbol = variant % 5;
  return <svg viewBox="0 0 180 280" className="card-art" aria-hidden="true" style={{ transform: reversed ? 'rotate(180deg)' : undefined }}>
    <defs><linearGradient id={`sky-${variant}`} x2="0" y2="1"><stop stopColor="#282442"/><stop offset="1" stopColor="#101624"/></linearGradient></defs>
    <rect width="180" height="280" rx="9" fill={`url(#sky-${variant})`}/>
    <rect x="9" y="9" width="162" height="262" rx="5" fill="none" stroke="#bda479" strokeWidth=".6"/>
    <path d="M20 240V92a70 70 0 0 1 140 0v148" fill="none" stroke="#bda479" strokeWidth=".6"/>
    {[32, 54, 124, 147, 80, 105].map((x, i) => <path key={x} d={`M${x} ${32 + (i * 23) % 65}v6m-3-3h6`} stroke="#d8c395" strokeWidth=".8"/>)}
    {symbol === 0 && <><circle cx="90" cy="108" r="33" fill="#dec69a"/><circle cx="104" cy="95" r="31" fill="#24233c"/><path d="M23 226l42-68 24 41 27-60 42 87" fill="#4e5965" stroke="#a8997d" strokeWidth=".7"/><path d="M22 239q37-17 70 0t66 0" fill="none" stroke="#bda479"/></>}
    {symbol === 1 && <><circle cx="90" cy="105" r="28" fill="#ddbd7c"/>{Array.from({length: 12}, (_, i) => <path key={i} d="M90 66v-14" stroke="#bda479" transform={`rotate(${i * 30} 90 105)`}/>)}<path d="M20 225q35-53 70-7t70-4v35H20" fill="#616754"/><path d="M20 239q40-35 76-8t64-5" fill="none" stroke="#bda479"/></>}
    {symbol === 2 && <><path d="M90 65l9 25 27 1-21 17 7 26-22-15-22 15 7-26-21-17 27-1z" fill="#d8c395"/><path d="M90 139v77m-38-65q38 5 38 35-38 0-38-35m76 18q-38 0-38 36 38 0 38-36" fill="#5a6a62" stroke="#bda479"/><path d="M30 240q60-43 120 0" fill="none" stroke="#bda479"/></>}
    {symbol === 3 && <><circle cx="90" cy="106" r="37" fill="none" stroke="#d8c395"/><path d="M90 69l22 67-58-42h72l-58 42z" fill="none" stroke="#d8c395"/><path d="M43 221l47-57 47 57z" fill="#57616a" stroke="#bda479"/><path d="M90 164v57m-47 0h94" stroke="#bda479"/></>}
    {symbol === 4 && <><path d="M90 61q-51 42 0 79 51-37 0-79z" fill="none" stroke="#d8c395"/><circle cx="90" cy="103" r="14" fill="#d8c395"/><path d="M55 176h70q0 34-35 34t-35-34m35 34v22m-20 0h40" fill="none" stroke="#d8c395"/><path d="M40 246q50-15 100 0" fill="none" stroke="#bda479"/></>}
    <path d="M23 253h134" stroke="#bda479" strokeWidth=".5"/><circle cx="90" cy="258" r="2" fill="#d8c395"/>
  </svg>;
}
export function CardBack() {
  return <svg viewBox="0 0 180 280" className="card-art" aria-hidden="true"><rect width="180" height="280" rx="9" fill="#202039"/><rect x="9" y="9" width="162" height="262" rx="5" fill="none" stroke="#bda479"/><rect x="17" y="17" width="146" height="246" rx="3" fill="none" stroke="#bda479" strokeWidth=".4"/><path d="M90 42l62 98-62 98-62-98z" fill="none" stroke="#bda479" strokeWidth=".6"/><circle cx="90" cy="140" r="41" fill="none" stroke="#bda479"/><path d="M90 99l24 74-63-46h78l-63 46z" fill="none" stroke="#bda479"/><path d="M90 30v11m0 198v11M25 140h12m106 0h12" stroke="#bda479"/><circle cx="90" cy="63" r="3" fill="#bda479"/><circle cx="90" cy="217" r="3" fill="#bda479"/></svg>;
}
