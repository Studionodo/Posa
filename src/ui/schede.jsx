/**
 * schede.jsx — barra delle sezioni e carte dei rullini.
 */

import { V, carta, Fotogramma, Striscia, Chip, PulsantePieno } from './base.jsx';
import { Icona } from './icone.jsx';
import {
  etichettaPushPull, formattaTempo, formattaData, tempoTrascorso,
  riassuntoSviluppo, ETICHETTE_FORMATO, ETICHETTE_STATO, prossimoNumero,
} from '../lib/model.js';

// ─── barra delle sezioni ────────────────────────────────────

const SEZIONI = [
  ['rullini', 'Rullini'],
  ['archivio', 'Archivio'],
  ['strumenti', 'Strumenti'],
  ['info', 'Info'],
];

/**
 * Barra fluttuante. Il contenuto le scorre sotto e sfuma: il velo e'
 * parte della barra, quindi c'e' solo quando c'e' la barra.
 */
export function BarraSezioni({ attiva, onCambia }) {
  return (
    <nav aria-label="Sezioni" style={{
      position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 10,
      padding: '30px 12px calc(12px + env(safe-area-inset-bottom))',
      background: `linear-gradient(to top, ${V('surface')} 55%, transparent)`,
      pointerEvents: 'none',
    }}>
      <div style={{
        ...carta, borderRadius: 30, maxWidth: 560, margin: '0 auto',
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', padding: 6,
        pointerEvents: 'auto',
      }}>
        {SEZIONI.map(([chiave, etichetta]) => {
          const on = chiave === attiva;
          return (
            <button key={chiave} type="button" onClick={() => onCambia(chiave)}
              aria-current={on ? 'page' : undefined}
              style={{
                background: 'transparent', minHeight: 62, padding: 0,
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                justifyContent: 'center', gap: 4,
                color: on ? V('on-surface') : V('on-surface-var'),
              }}>
              <span style={{
                width: 58, height: 32, borderRadius: 16,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: on ? V('primary-tint') : 'transparent',
                boxShadow: on ? `inset 0 0 0 1.5px ${V('primary-border')}` : 'none',
                color: on ? V('primary') : 'inherit',
                transition: 'background-color 120ms linear',
              }}>
                <Icona nome={chiave} size={22} spessore={on ? 2 : 1.8} />
              </span>
              <span style={{ fontSize: 12.5, fontWeight: on ? 600 : 400, letterSpacing: '0.01em' }}>
                {etichetta}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

// ─── il rullino in macchina ─────────────────────────────────

/**
 * Carta grande per ogni rullino in corso: e' cio' che hai in borsa
 * adesso. Il numero di pose e l'ultimo scatto si leggono senza aprire
 * nulla; l'azione porta dritta alla registrazione.
 */
export function CartaInMacchina({ rullino, fatti, ultimo, onApri }) {
  const push = etichettaPushPull(rullino);
  const prossimo = ultimo ? prossimoNumero([ultimo]) : fatti + 1;

  return (
    <div style={{ ...carta, borderRadius: 26, padding: 18, marginBottom: 14 }}>
      <button type="button" onClick={onApri} style={{
        display: 'block', width: '100%', background: 'transparent', padding: 0,
        textAlign: 'left', minHeight: 0, color: V('on-surface'),
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="display" style={{
            flex: 1, minWidth: 0, fontSize: 23, fontWeight: 700, lineHeight: 1.15,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>{rullino.nome || 'Senza nome'}</span>
          <Chip>{ETICHETTE_FORMATO[rullino.formato] || rullino.formato}</Chip>
        </div>

        <div style={{
          marginTop: 4, fontSize: 14.5, color: V('on-surface-var'),
          display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'baseline',
        }}>
          <span>{[rullino.pellicola, `EI ${rullino.iso_esposizione}`].filter(Boolean).join(' · ')}</span>
          {push && <span style={{ color: V('primary'), fontWeight: 600 }}>{push}</span>}
        </div>

        <div style={{ marginTop: 14 }}>
          <Fotogramma fatti={fatti} totali={rullino.pose_totali} cifra={50} />
        </div>

        <div style={{
          marginTop: 12, display: 'flex', justifyContent: 'space-between',
          alignItems: 'baseline', gap: 12, fontSize: 14,
        }}>
          {ultimo ? (
            <>
              <span style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                <span style={{ color: V('on-surface-var') }}>Ultima </span>
                <span style={{ fontVariantNumeric: 'tabular-nums' }}>
                  {[formattaTempo(ultimo.tempo), `f/${ultimo.diaframma}`, ultimo.focale ? `${ultimo.focale}mm` : null]
                    .filter(Boolean).join(' · ')}
                </span>
              </span>
              <span style={{ color: V('on-surface-var'), flexShrink: 0 }}>{tempoTrascorso(ultimo.timestamp)}</span>
            </>
          ) : (
            <span style={{ color: V('on-surface-var') }}>Nessuno scatto registrato</span>
          )}
        </div>
      </button>

      <PulsantePieno onClick={onApri} style={{ marginTop: 16 }}>
        Registra posa {prossimo}
      </PulsantePieno>
    </div>
  );
}

// ─── carta compatta ─────────────────────────────────────────

/**
 * Carta di un rullino chiuso — finito o sviluppato — e di ogni rullino
 * durante la selezione. Spenta: e' materiale da leggere, non da usare.
 */
export function CartaRullino({ rullino, fatti, onClick, scelto, inSelezione, mostraStato }) {
  const push = etichettaPushPull(rullino);
  const sv = riassuntoSviluppo(rullino.sviluppo);
  const chiuso = rullino.stato !== 'in_corso';
  const data = rullino.data_fine || rullino.data_inizio;

  return (
    <button type="button" onClick={onClick} aria-pressed={inSelezione ? !!scelto : undefined} style={{
      ...carta,
      display: 'block', width: '100%', textAlign: 'left', marginBottom: 10,
      padding: 16, minHeight: 0,
      background: scelto ? V('surf-cont') : V('surf-cont-low'),
      border: scelto ? `1px solid ${V('primary')}` : carta.border,
      boxShadow: scelto
        ? `inset 0 0 0 1px ${V('primary')}, inset 0 1px 0 ${V('luce-alto')}`
        : carta.boxShadow,
      color: V('on-surface'),
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {inSelezione && (
          <span aria-hidden="true" style={{
            width: 24, height: 24, borderRadius: 8, flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: scelto ? V('primary') : 'transparent',
            boxShadow: scelto ? 'none' : `inset 0 0 0 1.5px ${V('outline')}`,
            color: V('on-primary'),
          }}>{scelto && <Icona nome="spunta" size={16} spessore={2.6} />}</span>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          {rullino.archivio && (
            <div style={{
              fontSize: 11, letterSpacing: '0.14em', color: V('on-surface-var'),
              fontWeight: 600, marginBottom: 2,
            }}>N. {rullino.archivio}</div>
          )}
          <div className="display" style={{
            fontSize: 19, fontWeight: 600, lineHeight: 1.2,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>{rullino.nome || 'Senza nome'}</div>
        </div>
        <span className="display" style={{
          fontSize: 20, fontWeight: 700, flexShrink: 0, fontVariantNumeric: 'tabular-nums',
          color: chiuso ? V('on-surface-var') : V('primary'),
        }}>{fatti}/{rullino.pose_totali}</span>
      </div>

      <div style={{ fontSize: 14, marginTop: 4, color: V('on-surface-var') }}>
        {[
          rullino.pellicola,
          ETICHETTE_FORMATO[rullino.formato] || rullino.formato,
          data ? formattaData(data) : null,
        ].filter(Boolean).join(' · ')}
      </div>

      {sv && (
        <div style={{
          fontSize: 13.5, marginTop: 6, color: V('primary'),
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>{sv}</div>
      )}

      {(push || mostraStato) && (
        <div style={{ marginTop: 10, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {mostraStato && <Chip accento={!chiuso}>{ETICHETTE_STATO[rullino.stato]}</Chip>}
          {push && <Chip accento>{push}</Chip>}
        </div>
      )}

      <Striscia totali={rullino.pose_totali} fatti={fatti} spento={chiuso} />
    </button>
  );
}
