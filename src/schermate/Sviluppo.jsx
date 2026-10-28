import { useState } from 'react';
import { V, carta, PulsanteIcona, PulsantePieno, Sezione, Campo } from '../ui/base.jsx';
import { nuovoSviluppo, RIVELATORI, AGITAZIONI, etichettaPushPull } from '../lib/model.js';

/** Suggerimenti tappabili: riempiono il campo senza aprire la tastiera. */
function Suggerimenti({ voci, valore, onScegli }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: -4, marginBottom: 16 }}>
      {voci.map((v) => {
        const on = v === valore;
        return (
          <button key={v} type="button" onClick={() => onScegli(on ? '' : v)} style={{
            minHeight: 40, padding: '0 14px', borderRadius: V('r-full'),
            background: on ? V('primary-tint') : 'transparent',
            color: on ? V('primary') : V('on-surface-var'),
            boxShadow: `inset 0 0 0 ${on ? 1.5 : 1}px ${on ? V('primary') : V('outline')}`,
            fontSize: 13.5, fontWeight: on ? 600 : 400,
          }}>{v}</button>
        );
      })}
    </div>
  );
}

/**
 * Sviluppo — la meta' mancante del libro mastro.
 *
 * Lo sviluppo pesa sul negativo quanto l'esposizione, ed e' il dato che
 * permette di ripetere un risultato riuscito. Salvare porta il rullino
 * a "sviluppato": se hai compilato questa scheda, e' passato per la tank.
 */
export default function Sviluppo({ rullino, onSalva, onIndietro }) {
  const [sv, setSv] = useState(() => nuovoSviluppo(rullino.sviluppo || {}));
  const set = (k) => (v) => setSv((p) => ({ ...p, [k]: v }));
  const push = etichettaPushPull(rullino);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <header style={{
        flexShrink: 0, padding: '14px 16px 6px', display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <PulsanteIcona icona="indietro" etichetta="Torna al rullino" onClick={onIndietro} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="display" style={{ fontSize: 24, fontWeight: 700, lineHeight: 1.15 }}>Sviluppo</div>
          <div style={{
            fontSize: 13.5, color: V('on-surface-var'),
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>{rullino.nome || 'Senza nome'}</div>
        </div>
      </header>

      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '0 16px 16px' }}>
        {/* Il push/pull e' il primo dato che serve in camera oscura:
            decide il tempo di sviluppo prima di ogni altra cosa. */}
        {push && (
          <div style={{
            ...carta, borderColor: V('primary'), background: V('primary-tint'),
            padding: '12px 16px', marginTop: 14, color: V('primary'), fontSize: 15, fontWeight: 600,
          }}>Esposto {push} — lo sviluppo va compensato</div>
        )}

        <Sezione>Chimica</Sezione>
        <Campo etichetta="Rivelatore" valore={sv.rivelatore} onChange={set('rivelatore')} placeholder="Ilford ID-11" />
        <Suggerimenti voci={RIVELATORI} valore={sv.rivelatore} onScegli={set('rivelatore')} />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <Campo etichetta="Diluizione" valore={sv.diluizione} onChange={set('diluizione')} placeholder="1+1" />
          <Campo etichetta="Temperatura" valore={sv.gradi} onChange={set('gradi')} tipo="number" suffisso="°C" />
        </div>
        <Campo etichetta="Tempo" valore={sv.minuti} onChange={set('minuti')} tipo="number" placeholder="13" suffisso="min" />

        <Campo etichetta="Agitazione" valore={sv.agitazione} onChange={set('agitazione')} placeholder="10s ogni minuto" />
        <Suggerimenti voci={AGITAZIONI} valore={sv.agitazione} onScegli={set('agitazione')} />

        <Sezione>Altro</Sezione>
        <Campo etichetta="Laboratorio" valore={sv.laboratorio} onChange={set('laboratorio')} placeholder="se sviluppato da altri" />
        <Campo etichetta="Note" valore={sv.note} onChange={set('note')} placeholder="Cosa rifarei diversamente" />
      </div>

      <div style={{ flexShrink: 0, padding: '10px 16px calc(14px + env(safe-area-inset-bottom))' }}>
        <PulsantePieno onClick={() => onSalva(sv)} style={{ minHeight: 62, fontSize: 20 }}>
          Salva lo sviluppo
        </PulsantePieno>
      </div>
    </div>
  );
}
