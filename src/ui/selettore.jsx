/**
 * selettore.jsx — tessere dei parametri e il pannello che le cambia.
 *
 * Ogni parametro e' una tessera che mostra il proprio valore: si legge
 * "TEMPO 1/125" in uno sguardo. Toccandola sale un pannello con i
 * valori a flusso, che si chiude da solo alla scelta.
 */

import { V, carta, Foglio } from './base.jsx';
import { Icona } from './icone.jsx';

export function Selettore({ titolo, valori, valore, formatta, onScegli, onChiudi }) {
  return (
    <Foglio titolo={titolo} onChiudi={onChiudi}>
      {(chiudi) => (
        <div role="radiogroup" aria-label={titolo} style={{
          display: 'flex', flexWrap: 'wrap', gap: 6, paddingBottom: 4,
        }}>
          {valori.map((v) => {
            const on = v === valore;
            return (
              <button key={v} type="button" role="radio" aria-checked={on}
                onClick={() => { onScegli(v); chiudi(); }}
                style={{
                  minHeight: 48, padding: on ? '0 16px 0 12px' : '0 16px',
                  background: on ? V('primary-tint') : V('surf-cont'),
                  color: on ? V('primary') : V('on-surface'),
                  boxShadow: on ? `inset 0 0 0 1.5px ${V('primary')}` : 'none',
                  borderRadius: 12,
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  fontFamily: V('display'), fontSize: 17,
                  fontWeight: on ? 700 : 500, fontVariantNumeric: 'tabular-nums',
                  whiteSpace: 'nowrap',
                }}>
                {on && <Icona nome="spunta" size={15} spessore={2.4} />}
                {formatta ? formatta(v) : v}
              </button>
            );
          })}
        </div>
      )}
    </Foglio>
  );
}

/**
 * Tessera: etichetta piccola in alto, valore grande sotto. Senza
 * `onClick` e' una lettura e non un comando — un obiettivo fisso non
 * ha focali da scegliere.
 */
export function Tessera({ etichetta, valore, suffisso, onClick, accento, pieno }) {
  const attiva = !!onClick;
  const Tag = attiva ? 'button' : 'div';
  return (
    <Tag type={attiva ? 'button' : undefined} onClick={onClick} style={{
      ...carta, borderRadius: 20,
      gridColumn: pieno ? '1 / -1' : undefined,
      minHeight: 86, padding: '13px 16px 12px', width: '100%',
      display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
      alignItems: 'stretch', textAlign: 'left', gap: 6,
      color: V('on-surface'),
      opacity: attiva ? 1 : 0.7,
    }}>
      <span style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        fontSize: 10.5, fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase',
        color: V('on-surface-var'),
      }}>
        {etichetta}
        {attiva && <Icona nome="avanti" size={14} spessore={2}
          style={{ transform: 'rotate(90deg)', opacity: 0.7 }} />}
      </span>
      <span style={{ display: 'flex', alignItems: 'baseline', gap: 6, minWidth: 0 }}>
        <span className="display" style={{
          fontSize: 25, fontWeight: 700, lineHeight: 1.1, fontVariantNumeric: 'tabular-nums',
          color: accento ? V('primary') : V('on-surface'),
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>{valore}</span>
        {suffisso && (
          <span style={{ fontSize: 13.5, color: V('on-surface-var'), flexShrink: 0 }}>{suffisso}</span>
        )}
      </span>
    </Tag>
  );
}
