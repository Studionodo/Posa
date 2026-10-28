import { useEffect, useState } from 'react';
import {
  TestaPagina, PulsantePieno, PulsantePillola, PulsanteIcona, Vuoto,
  BarraSelezione, PulsanteStampa, SPAZIO_BARRA, Sezione,
} from '../ui/base.jsx';
import { CartaRullino } from '../ui/schede.jsx';

/**
 * Archivio — i rullini sviluppati, con il loro record di sviluppo.
 *
 * Toccandone uno si apre la stessa schermata Rullino che si apre da
 * Rullini, con lo stesso menu. La selezione fa le stesse due cose di
 * la', in direzione opposta: riporta a "finito" invece di avanzare.
 */
export default function Archivio({
  rullini, conteggi, attiva, onApri, onRiporta, onStampa, onSelezione,
}) {
  const [selezione, setSelezione] = useState(null);
  const inSelezione = selezione !== null;

  useEffect(() => { onSelezione(inSelezione); }, [inSelezione, onSelezione]);

  const tuttiScelti = inSelezione && selezione.length > 0 && selezione.length === rullini.length;

  function tocca(r) {
    if (!inSelezione) { onApri(r.id); return; }
    setSelezione((p) => (p.includes(r.id) ? p.filter((x) => x !== r.id) : [...p, r.id]));
  }

  const azioneTesta = !inSelezione ? (
    rullini.length > 0 && (
      <PulsantePillola icona="spunta" onClick={() => setSelezione([])}>Scegli</PulsantePillola>
    )
  ) : (
    <>
      <PulsantePillola attivo={tuttiScelti}
        onClick={() => setSelezione(tuttiScelti ? [] : rullini.map((r) => r.id))}>
        {selezione.length ? `${selezione.length} di ${rullini.length}` : 'Tutti'}
      </PulsantePillola>
      <PulsanteIcona icona="chiudi" etichetta="Annulla la selezione" onClick={() => setSelezione(null)} />
    </>
  );

  return (
    <div style={{ height: '100%', overflowY: 'auto' }}>
      <TestaPagina titolo="Archivio" azione={azioneTesta}
        sottotitolo={rullini.length
          ? `${rullini.length} ${rullini.length === 1 ? 'rullino sviluppato' : 'rullini sviluppati'}`
          : null} />

      <div style={{ padding: `0 16px ${SPAZIO_BARRA}` }}>
        <Sezione>{inSelezione ? 'Scegli i rullini' : 'Sviluppati'}</Sezione>

        {!rullini.length && (
          <Vuoto>
            Archivio vuoto.<br />Un rullino arriva qui quando registri il suo sviluppo.
          </Vuoto>
        )}

        {rullini.map((r) => (
          <CartaRullino key={r.id} rullino={r} fatti={conteggi[r.id] || 0}
            inSelezione={inSelezione} scelto={inSelezione && selezione.includes(r.id)}
            onClick={() => tocca(r)} />
        ))}
      </div>

      {inSelezione && attiva && (
        <BarraSelezione>
          <PulsantePieno disabled={!selezione.length} style={{ flex: 1, width: 'auto' }}
            onClick={() => { onRiporta(selezione); setSelezione(null); }}>
            Riporta a finito
          </PulsantePieno>
          <PulsanteStampa disabled={!selezione.length}
            onClick={() => { onStampa(selezione); setSelezione(null); }} />
        </BarraSelezione>
      )}
    </div>
  );
}
