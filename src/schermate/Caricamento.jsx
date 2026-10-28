import { useState } from 'react';
import { V, carta, PulsanteIcona, PulsantePieno, Sezione, Campo } from '../ui/base.jsx';
import {
  FORMATI, POSE_PER_FORMATO, ETICHETTE_FORMATO, nuovoRullino,
  etichettaPushPull, precompilaDaUltimo, prossimoArchivio,
} from '../lib/model.js';

/** Fila di scelte equivalenti: una sola accesa. */
function Fila({ voci, attiva, onScegli, etichette }) {
  return (
    <div role="radiogroup" style={{
      display: 'grid', gridTemplateColumns: `repeat(${voci.length}, 1fr)`, gap: 6, marginBottom: 14,
    }}>
      {voci.map((x) => {
        const on = attiva(x);
        return (
          <button key={x} type="button" role="radio" aria-checked={on} onClick={() => onScegli(x)} style={{
            minHeight: 54, padding: 0, borderRadius: 16,
            background: on ? V('primary-tint') : V('surf-cont-low'),
            color: on ? V('primary') : V('on-surface'),
            boxShadow: on ? `inset 0 0 0 1.5px ${V('primary')}` : `inset 0 0 0 1px ${V('outline')}`,
            fontFamily: V('display'), fontSize: 19, fontWeight: on ? 700 : 500,
            fontVariantNumeric: 'tabular-nums',
          }}>{etichette ? etichette[x] : x}</button>
        );
      })}
    </div>
  );
}

/**
 * Caricare un rullino, o correggerne uno gia' caricato: la forma e'
 * la stessa, cambia cosa succede al salvataggio.
 *
 * L'obiettivo e' testo libero e fa da configurazione: "24-70" da' la
 * scala di uno zoom, "28 + 50 + 85" tre fisse. In modifica il numero
 * d'archivio non si tocca: e' gia' scritto sulla busta del negativo.
 */
export default function Caricamento({ ultimo, tuttiRullini, rullino, onSalva, onIndietro }) {
  const inModifica = !!rullino;
  const base = inModifica ? rullino : precompilaDaUltimo(ultimo ? [ultimo] : []);

  const [f, setF] = useState(() => ({
    nome: inModifica ? (rullino.nome || '') : '',
    pellicola: base.pellicola || '',
    iso_nominale: String(base.iso_nominale || 400),
    iso_esposizione: String(base.iso_esposizione || base.iso_nominale || 400),
    formato: POSE_PER_FORMATO[base.formato] ? base.formato : '35mm',
    pose_totali: String(base.pose_totali || 36),
    corpo: base.corpo || '',
    obiettivo: base.obiettivo || '',
  }));
  const set = (k) => (v) => setF((p) => ({ ...p, [k]: v }));

  /* I preset coprono i formati commerciali; chi carica da bulk esce con
     conteggi arbitrari. Il campo libero compare solo se serve. */
  const preset = POSE_PER_FORMATO[f.formato].map(String);
  const fuoriPreset = !preset.includes(f.pose_totali);
  const [altro, setAltro] = useState(false);
  const mostraAltro = altro || fuoriPreset;

  const spinta = etichettaPushPull({
    iso_nominale: Number(f.iso_nominale),
    iso_esposizione: Number(f.iso_esposizione),
  });

  function salva() {
    const isoNom = Math.max(1, Number(f.iso_nominale) || 400);
    onSalva(nuovoRullino({
      nome: f.nome.trim() || 'Senza nome',
      pellicola: f.pellicola.trim(),
      iso_nominale: isoNom,
      iso_esposizione: Math.max(1, Number(f.iso_esposizione) || isoNom),
      formato: f.formato,
      pose_totali: Math.min(400, Math.max(1, Math.round(Number(f.pose_totali)) || 36)),
      corpo: f.corpo.trim(),
      obiettivo: f.obiettivo.trim(),
      focali: [],
      archivio: inModifica ? (rullino.archivio || '') : prossimoArchivio(tuttiRullini || []),
      // In modifica si conservano identita', stato e storia.
      ...(inModifica ? {
        id: rullino.id,
        user_id: rullino.user_id ?? null,
        stato: rullino.stato,
        data_inizio: rullino.data_inizio,
        data_fine: rullino.data_fine,
        note: rullino.note || '',
        sviluppo: rullino.sviluppo,
        created_at: rullino.created_at,
      } : {}),
    }));
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <header style={{
        flexShrink: 0, padding: '14px 16px 6px', display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <PulsanteIcona icona="indietro" etichetta="Annulla" onClick={onIndietro} />
        <div className="display" style={{ fontSize: 24, fontWeight: 700 }}>
          {inModifica ? 'Modifica rullino' : 'Carica un rullino'}
        </div>
      </header>

      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '0 16px 16px' }}>
        <Sezione>Rullino</Sezione>
        <Campo etichetta="Nome" valore={f.nome} onChange={set('nome')} placeholder="Madonna dell’Arco" />
        <Campo etichetta="Pellicola" valore={f.pellicola} onChange={set('pellicola')} placeholder="Ilford HP5 Plus" />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <Campo etichetta="ISO scatola" valore={f.iso_nominale} onChange={set('iso_nominale')}
            tipo="number" inputMode="numeric" />
          <Campo etichetta="EI esposto" valore={f.iso_esposizione} onChange={set('iso_esposizione')}
            tipo="number" inputMode="numeric" />
        </div>

        {spinta && (
          <div style={{
            ...carta, borderColor: V('primary'), background: V('primary-tint'),
            padding: '12px 16px', marginBottom: 6, color: V('primary'), fontSize: 15, fontWeight: 600,
          }}>{spinta} — da comunicare al laboratorio</div>
        )}

        <Sezione>Formato</Sezione>
        <Fila voci={FORMATI} etichette={ETICHETTE_FORMATO} attiva={(x) => x === f.formato}
          onScegli={(x) => {
            setAltro(false);
            setF((p) => ({ ...p, formato: x, pose_totali: String(POSE_PER_FORMATO[x][0]) }));
          }} />
        <Fila voci={[...preset, 'altro']}
          etichette={Object.fromEntries([...preset.map((n) => [n, n]), ['altro', fuoriPreset ? f.pose_totali || 'altro' : 'altro']])}
          attiva={(x) => (x === 'altro' ? mostraAltro : !mostraAltro && x === f.pose_totali)}
          onScegli={(x) => {
            if (x === 'altro') { setAltro(true); return; }
            setAltro(false);
            set('pose_totali')(x);
          }} />
        {mostraAltro && (
          <Campo etichetta="Pose caricate (bulk)" valore={f.pose_totali} onChange={set('pose_totali')}
            tipo="number" inputMode="numeric" autoFocus={altro && !fuoriPreset} />
        )}

        <Sezione>Attrezzatura</Sezione>
        <Campo etichetta="Corpo" valore={f.corpo} onChange={set('corpo')} placeholder="Nikon FM2" />
        <Campo etichetta="Obiettivo" valore={f.obiettivo} onChange={set('obiettivo')}
          placeholder="35mm f/2 · 24-70 · 28 + 50 + 85" />
      </div>

      <div style={{ flexShrink: 0, padding: '10px 16px calc(14px + env(safe-area-inset-bottom))' }}>
        <PulsantePieno onClick={salva} style={{ minHeight: 62, fontSize: 20 }}>
          {inModifica ? 'Salva' : 'Carica'}
        </PulsantePieno>
      </div>
    </div>
  );
}
