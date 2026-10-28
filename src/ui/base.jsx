/**
 * base.jsx — i pezzi con cui sono costruite tutte le schermate.
 *
 * Nessuno sa cosa sia IndexedDB o un rullino: ricevono valori ed
 * emettono eventi. Stili inline su variabili CSS di tokens.css.
 *
 * Linguaggio (da Ninna, tradotto al buio della camera oscura):
 * carte brune con un filetto di contorno e la luce dall'alto,
 * etichette di sezione spaziate in maiuscolo, una sola azione piena
 * per schermata. L'ambra e' una linea, non un riempimento.
 */

import { useEffect, useState } from 'react';
import { Icona } from './icone.jsx';

export const V = (n) => `var(--${n})`;

/** La carta: superficie sollevata, filetto di contorno, luce dall'alto. */
export const carta = {
  background: V('surf-cont-low'),
  border: `1px solid ${V('outline')}`,
  borderRadius: 22,
  boxShadow: `inset 0 1px 0 ${V('luce-alto')}`,
};

/** Spazio in fondo alle pagine con la barra delle sezioni sopra. */
export const SPAZIO_BARRA = 'calc(124px + env(safe-area-inset-bottom))';

// ─── intestazioni ───────────────────────────────────────────

export function Marchio() {
  return (
    <h1 className="marchio" style={{ margin: 0 }}>
      Posa<span className="marchio-punto">.</span>
    </h1>
  );
}

export function TestaPagina({ titolo, sottotitolo, azione, motto }) {
  return (
    <header style={{ padding: '20px 20px 4px' }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 12, minHeight: 52,
      }}>
        <Marchio />
        {azione && <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>{azione}</div>}
      </div>
      {motto && (
        <p style={{
          margin: '6px 0 0', color: V('on-surface-var'), fontSize: 15, fontStyle: 'italic',
        }}>{motto}</p>
      )}
      {titolo && (
        <h2 className="display" style={{
          margin: '18px 0 0', fontSize: 34, fontWeight: 700, lineHeight: 1.1,
        }}>{titolo}</h2>
      )}
      {sottotitolo && (
        <p style={{ margin: '8px 0 0', color: V('on-surface-var'), fontSize: 15, lineHeight: 1.45 }}>
          {sottotitolo}
        </p>
      )}
    </header>
  );
}

/** Etichetta di sezione: piccola, spaziata, tenue. Ordina senza pesare. */
export function Sezione({ children, style }) {
  return (
    <div style={{
      fontFamily: V('corpo'), fontSize: 11.5, fontWeight: 600,
      letterSpacing: '0.18em', textTransform: 'uppercase',
      color: V('on-surface-var'), margin: '26px 4px 12px', ...style,
    }}>{children}</div>
  );
}

// ─── pulsanti ───────────────────────────────────────────────

const basePulsante = {
  width: '100%', minHeight: 58, borderRadius: V('r-full'),
  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
  fontFamily: V('display'), fontSize: 18, fontWeight: 700, letterSpacing: '0.02em',
  padding: '0 20px',
};

/** L'azione della schermata: carta chiara sotto l'ingranditore. Una sola. */
export function PulsantePieno({ children, onClick, disabled, icona, style }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled} style={{
      ...basePulsante,
      background: disabled ? V('surf-cont') : V('azione'),
      color: disabled ? V('on-surface-var') : V('on-azione'),
      ...style,
    }}>
      {icona && <Icona nome={icona} size={20} spessore={2.2} />}
      {children}
    </button>
  );
}

/** Azione secondaria: solo il contorno ambra. */
export function PulsanteContorno({ children, onClick, icona, style }) {
  return (
    <button type="button" onClick={onClick} style={{
      ...basePulsante,
      background: 'transparent', color: V('primary'),
      boxShadow: `inset 0 0 0 1.5px ${V('primary-border')}`,
      ...style,
    }}>
      {icona && <Icona nome={icona} size={20} spessore={2} />}
      {children}
    </button>
  );
}

/** Quadrato arrotondato con icona: indietro, menu, chiudi. */
export function PulsanteIcona({ icona, etichetta, onClick, style }) {
  return (
    <button type="button" onClick={onClick} aria-label={etichetta} title={etichetta} style={{
      ...carta, borderRadius: 16,
      width: 48, height: 48, minHeight: 48, padding: 0, flexShrink: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: V('on-surface'), ...style,
    }}>
      <Icona nome={icona} size={22} />
    </button>
  );
}

/** Pillola con icona e parola: un'azione di testata che si spiega da se'. */
export function PulsantePillola({ icona, children, onClick, attivo }) {
  return (
    <button type="button" onClick={onClick} style={{
      minHeight: 48, padding: '0 18px', borderRadius: V('r-full'),
      display: 'flex', alignItems: 'center', gap: 8,
      background: V('primary-tint'), color: V('primary'),
      boxShadow: `inset 0 0 0 ${attivo ? 2 : 1.5}px ${attivo ? V('primary') : V('primary-border')}`,
      fontSize: 15, fontWeight: 600, whiteSpace: 'nowrap',
    }}>
      {icona && <Icona nome={icona} size={18} spessore={2.1} />}
      {children}
    </button>
  );
}

// ─── pellicola ──────────────────────────────────────────────

/**
 * Perforazione 35mm: la firma dell'app. Proporzione vicina alla KS
 * reale, piu' larga che alta, angoli raccordati.
 */
export function Perforazione({ colore, n = 12, alt = 7, gap = 7, pad = '7px 12px' }) {
  return (
    <div aria-hidden="true" style={{
      display: 'grid', gridTemplateColumns: `repeat(${n}, 1fr)`, gap, padding: pad,
    }}>
      {Array.from({ length: n }).map((_, i) => (
        <span key={i} style={{ height: alt, borderRadius: 2, background: colore }} />
      ))}
    </div>
  );
}

/**
 * Il fotogramma: contorno ambra, perforazioni sopra e sotto, la posa in
 * mezzo. Il colore riempie solo quando le pose sono esaurite: li'
 * l'avviso deve essere impossibile da ignorare.
 */
export function Fotogramma({ fatti, totali, pulse, cifra = 52, n = 12 }) {
  const esaurito = totali > 0 && fatti >= totali;
  const c = esaurito ? V('critical') : V('primary');
  return (
    <div style={{
      borderRadius: 16, overflow: 'hidden',
      border: `1.5px solid ${c}`,
      background: esaurito ? 'rgba(192,57,43,0.08)' : V('primary-tint'),
      transform: pulse ? 'scale(1.015)' : 'scale(1)',
      transition: 'transform var(--molla-durata) var(--molla)',
    }}>
      <Perforazione colore={c} n={n} />
      <div className="display" style={{
        textAlign: 'center', fontSize: cifra, fontWeight: 700, lineHeight: 1,
        padding: '2px 0 4px', color: c, fontVariantNumeric: 'tabular-nums',
      }}>
        {fatti}
        <span style={{ color: V('on-surface-var'), fontWeight: 500, fontSize: Math.round(cifra * 0.5) }}>
          /{totali}
        </span>
      </div>
      <Perforazione colore={c} n={n} />
      {fatti > totali && (
        <div className="label" style={{
          background: c, color: V('on-critical'), textAlign: 'center', padding: 6,
        }}>Oltre le pose nominali</div>
      )}
    </div>
  );
}

/**
 * Striscia del residuo: una tacca per posa, accese quelle scattate.
 * Oltre 72 pose (bulk) si scala: duecento tacche sarebbero un grigio.
 */
export function Striscia({ totali, fatti, spento }) {
  if (!totali || totali < 1) return null;
  const celle = Math.min(totali, 72);
  const accese = Math.min(celle, Math.round((fatti / totali) * celle));
  const oltre = fatti > totali;
  const gap = celle > 24 ? 3 : celle > 12 ? 5 : 8;
  return (
    <div aria-hidden="true" style={{
      display: 'grid', gridTemplateColumns: `repeat(${celle}, 1fr)`, gap, marginTop: 14,
    }}>
      {Array.from({ length: celle }).map((_, i) => {
        const esposta = i < accese;
        return (
          <span key={i} style={{
            height: 7, borderRadius: 1.5,
            opacity: esposta && spento ? 0.55 : 1,
            background: !esposta ? V('surf-cont-high')
              : oltre ? V('critical')
              : spento ? V('on-surface-var') : V('primary'),
          }} />
        );
      })}
    </div>
  );
}

/** Fotogramma vergine: lo stato vuoto dice esattamente cio' che e'. */
export function Vuoto({ children, azione }) {
  return (
    <div style={{ ...carta, overflow: 'hidden' }}>
      <Perforazione colore={V('surface')} />
      <div style={{
        padding: '26px 20px', textAlign: 'center', color: V('on-surface-var'), lineHeight: 1.5,
      }}>
        {children}
        {azione && <div style={{ marginTop: 18 }}>{azione}</div>}
      </div>
      <Perforazione colore={V('surface')} />
    </div>
  );
}

export function Chip({ children, accento }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      fontSize: 12, fontWeight: 600, letterSpacing: '0.06em',
      borderRadius: V('r-full'), padding: '4px 10px', whiteSpace: 'nowrap',
      color: accento ? V('primary') : V('on-surface-var'),
      boxShadow: `inset 0 0 0 1px ${accento ? V('primary-border') : V('outline')}`,
    }}>{children}</span>
  );
}

// ─── campi ──────────────────────────────────────────────────

export function Campo({ etichetta, valore, onChange, placeholder, tipo = 'text', inputMode, suffisso, autoFocus }) {
  return (
    <label style={{ display: 'block', marginBottom: 14 }}>
      <span style={{
        display: 'block', fontSize: 14, color: V('on-surface-var'), margin: '0 4px 6px',
      }}>{etichetta}</span>
      <span style={{ position: 'relative', display: 'block' }}>
        <input type={tipo} value={valore} placeholder={placeholder} autoFocus={autoFocus}
          inputMode={inputMode || (tipo === 'number' ? 'decimal' : undefined)}
          onChange={(e) => onChange(e.target.value)}
          style={{ paddingRight: suffisso ? 52 : 18 }} />
        {suffisso && (
          <span style={{
            position: 'absolute', right: 18, top: '50%', transform: 'translateY(-50%)',
            color: V('on-surface-var'), fontSize: 15, pointerEvents: 'none',
          }}>{suffisso}</span>
        )}
      </span>
    </label>
  );
}

// ─── foglio dal basso ───────────────────────────────────────

/**
 * Pannello che sale dal basso. `children` puo' essere una funzione che
 * riceve `chiudi`: cosi' una scelta chiude il pannello con la stessa
 * animazione con cui e' entrato.
 */
export function Foglio({ titolo, onChiudi, children }) {
  const [dentro, setDentro] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setDentro(true));
    return () => cancelAnimationFrame(id);
  }, []);

  function chiudi() {
    setDentro(false);
    setTimeout(onChiudi, 180);
  }

  return (
    <div role="dialog" aria-modal="true" aria-label={titolo} style={{
      position: 'fixed', inset: 0, zIndex: 50,
      display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
    }}>
      <div onClick={chiudi} style={{
        position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)',
        opacity: dentro ? 1 : 0, transition: 'opacity .18s ease',
      }} />

      <div style={{
        position: 'relative', width: '100%', maxWidth: 600, margin: '0 auto',
        background: V('surf-cont-low'),
        borderTop: `1px solid ${V('outline')}`,
        borderRadius: '28px 28px 0 0',
        boxShadow: `inset 0 1px 0 ${V('luce-alto')}`,
        padding: '6px 20px calc(20px + env(safe-area-inset-bottom))',
        transform: dentro ? 'translateY(0)' : 'translateY(100%)',
        transition: 'transform .22s cubic-bezier(.2,.9,.25,1)',
        maxHeight: '90vh', display: 'flex', flexDirection: 'column',
      }}>
        <div onClick={chiudi} style={{ padding: '6px 0 10px', cursor: 'pointer' }}>
          <div style={{
            width: 40, height: 4, borderRadius: 2, margin: '0 auto',
            background: V('surf-cont-highest'),
          }} />
        </div>

        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: 12, marginBottom: 14,
        }}>
          <span style={{
            fontSize: 11.5, fontWeight: 600, letterSpacing: '0.18em',
            textTransform: 'uppercase', color: V('on-surface-var'),
          }}>{titolo}</span>
          <PulsanteIcona icona="chiudi" etichetta="Chiudi" onClick={chiudi}
            style={{ width: 40, height: 40, minHeight: 40, borderRadius: 14 }} />
        </div>

        <div style={{ overflowY: 'auto', overflowX: 'hidden', minHeight: 0 }}>
          {typeof children === 'function' ? children(chiudi) : children}
        </div>
      </div>
    </div>
  );
}

// ─── barra della selezione ──────────────────────────────────

/**
 * Prende il posto della barra delle sezioni mentre si sceglie: le
 * azioni sulla selezione stanno dove sta il pollice.
 */
export function BarraSelezione({ children, avviso }) {
  return (
    <div style={{
      position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 15,
      padding: '28px 16px calc(16px + env(safe-area-inset-bottom))',
      background: `linear-gradient(to top, ${V('surface')} 70%, transparent)`,
    }}>
      <div style={{ maxWidth: 568, margin: '0 auto' }}>
        <div style={{ display: 'flex', gap: 8 }}>{children}</div>
        {avviso && (
          <div style={{ marginTop: 10, textAlign: 'center', color: V('critical'), fontSize: 13.5 }}>
            {avviso}
          </div>
        )}
      </div>
    </div>
  );
}

/** Il pulsante STAMPA della selezione: icona con la parola sotto. */
export function PulsanteStampa({ onClick, disabled }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled} style={{
      width: 88, minHeight: 58, borderRadius: V('r-full'), flexShrink: 0,
      background: V('surf-cont-high'),
      color: disabled ? V('on-surface-var') : V('on-surface'),
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2,
    }}>
      <Icona nome="stampa" size={20} />
      <span style={{ fontSize: 10, letterSpacing: '0.12em', fontWeight: 600 }}>STAMPA</span>
    </button>
  );
}
