/**
 * conteggio.jsx — il conto alla rovescia delle pose lunghe.
 *
 * Si calcola su un istante d'arrivo, non sommando un secondo alla
 * volta: i timer del browser rallentano a schermo spento o in
 * background, e un conteggio a scatti accumula ritardo proprio sulle
 * pose piu' lunghe, dove l'errore costa di piu'.
 *
 * Durante il conteggio si chiede di tenere acceso lo schermo (Wake
 * Lock). Dove non e' concesso il calcolo resta giusto lo stesso: si
 * riaccende lo schermo e il numero e' quello vero.
 */

import { useEffect, useRef, useState } from 'react';
import { V } from './base.jsx';

function leggibile(s) {
  if (s >= 3600) {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    return `${h}:${String(m).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  }
  if (s >= 60) return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  return `${s}″`;
}

export function Conteggio({ secondi, diametro = 132 }) {
  const totale = Math.max(1, Math.round(secondi));
  const [fine, setFine] = useState(null);
  const [adesso, setAdesso] = useState(() => Date.now());
  const blocco = useRef(null);
  const [schermo, setSchermo] = useState(false);
  const avvisato = useRef(false);

  const rimanenteMs = fine === null ? totale * 1000 : Math.max(0, fine - adesso);
  const rimanenti = Math.ceil(rimanenteMs / 1000);
  const finito = fine !== null && rimanenteMs === 0;

  useEffect(() => {
    if (fine === null || finito) return;
    const id = setInterval(() => setAdesso(Date.now()), 200);
    return () => clearInterval(id);
  }, [fine, finito]);

  useEffect(() => {
    if (!finito || avvisato.current) return;
    avvisato.current = true;
    try { if (navigator.vibrate) navigator.vibrate([400, 150, 400]); } catch { /* facoltativo */ }
    rilascia();
  }, [finito]);

  useEffect(() => () => rilascia(), []);

  async function trattieni() {
    try {
      if (navigator.wakeLock && document.visibilityState === 'visible') {
        blocco.current = await navigator.wakeLock.request('screen');
        setSchermo(true);
      }
    } catch { /* non concesso: il calcolo resta corretto */ }
  }

  function rilascia() {
    const b = blocco.current;
    blocco.current = null;
    setSchermo(false);
    if (b) b.release().catch(() => {});
  }

  function avvia() {
    avvisato.current = false;
    const ora = Date.now();
    setAdesso(ora);
    setFine(ora + totale * 1000);
    trattieni();
  }

  function ferma() {
    setFine(null);
    rilascia();
  }

  const r = diametro / 2 - 6;
  const circ = 2 * Math.PI * r;
  const quota = fine === null ? 1 : rimanenteMs / (totale * 1000);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
      <div style={{ position: 'relative', width: diametro, height: diametro, flexShrink: 0 }}>
        <svg width={diametro} height={diametro} aria-hidden="true" style={{ display: 'block' }}>
          <circle cx={diametro / 2} cy={diametro / 2} r={r} fill="none"
            stroke="var(--surf-cont-high)" strokeWidth="6" />
          <circle cx={diametro / 2} cy={diametro / 2} r={r} fill="none"
            stroke="var(--primary)" strokeWidth="6" strokeLinecap="round"
            strokeDasharray={circ} strokeDashoffset={circ * (1 - quota)}
            transform={`rotate(-90 ${diametro / 2} ${diametro / 2})`}
            style={{ opacity: fine === null ? 0.35 : 1, transition: 'stroke-dashoffset .2s linear' }} />
        </svg>
        <div role="timer" aria-live="polite" style={{
          position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
        }}>
          <span className="display" style={{
            fontSize: finito ? 22 : (rimanenti >= 3600 ? 22 : 30), fontWeight: 700,
            fontVariantNumeric: 'tabular-nums', lineHeight: 1,
            color: finito ? V('on-surface') : V('primary'),
          }}>{finito ? 'Chiudi' : leggibile(rimanenti)}</span>
          {!finito && (
            <span style={{ fontSize: 11, color: V('on-surface-var'), marginTop: 4, letterSpacing: '0.08em' }}>
              {fine === null ? 'PRONTO' : 'IN POSA'}
            </span>
          )}
        </div>
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        {fine === null ? (
          <button type="button" onClick={avvia} style={{
            width: '100%', minHeight: 52, borderRadius: V('r-full'),
            background: 'transparent', color: V('primary'),
            boxShadow: `inset 0 0 0 1.5px ${V('primary-border')}`,
            fontFamily: V('display'), fontSize: 17, fontWeight: 700,
          }}>Avvia il conteggio</button>
        ) : (
          <button type="button" onClick={ferma} style={{
            width: '100%', minHeight: 52, borderRadius: V('r-full'),
            background: V('surf-cont-high'), color: V('on-surface'),
            fontSize: 15, fontWeight: 600,
          }}>{finito ? 'Fatto' : 'Interrompi'}</button>
        )}
        <div style={{ fontSize: 13, color: V('on-surface-var'), marginTop: 8, lineHeight: 1.4 }}>
          {finito
            ? 'Tempo trascorso: chiudi l’otturatore.'
            : fine === null
              ? 'Apri l’otturatore e avvia insieme.'
              : schermo
                ? 'Lo schermo resta acceso fino alla fine.'
                : 'Il conto resta giusto anche a schermo spento.'}
        </div>
      </div>
    </div>
  );
}
