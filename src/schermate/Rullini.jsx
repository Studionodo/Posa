import { useEffect, useState } from 'react';
import {
  TestaPagina, Sezione, PulsanteContorno, PulsantePieno, PulsantePillola,
  PulsanteIcona, Vuoto, BarraSelezione, PulsanteStampa, SPAZIO_BARRA,
} from '../ui/base.jsx';
import { CartaInMacchina, CartaRullino } from '../ui/schede.jsx';

/**
 * Rullini — cio' che hai per le mani.
 *
 * IN MACCHINA: una carta grande per ogni rullino in corso, con l'azione
 * che porta dritta alla posa successiva. Due corpi in borsa sono
 * prassi, e nessuno dei due deve stare un tocco piu' lontano.
 *
 * DA SVILUPPARE: i finiti, compatti e spenti. Gli sviluppati stanno
 * in Archivio.
 *
 * SCEGLI fa la stessa cosa su piu' rullini insieme: portarli a
 * sviluppato o stamparli.
 */
export default function Rullini({
  rullini, conteggi, ultimi, attiva,
  onApri, onNuovo, onSviluppati, onStampa, onSelezione,
}) {
  const [selezione, setSelezione] = useState(null);
  const inSelezione = selezione !== null;

  /* Mentre si sceglie, la barra delle sezioni lascia il posto alle
     azioni sulla selezione. */
  useEffect(() => { onSelezione(inSelezione); }, [inSelezione, onSelezione]);

  const inCorso = rullini.filter((r) => r.stato === 'in_corso');
  const finiti = rullini.filter((r) => r.stato === 'finito');

  const tuttiScelti = inSelezione && selezione.length > 0 && selezione.length === rullini.length;

  /* Portare a sviluppato un rullino ancora in corso e' quasi sempre uno
     sbaglio: si avvisa, non si blocca. */
  const inCorsoScelti = inSelezione
    ? selezione.filter((id) => inCorso.some((r) => r.id === id)).length
    : 0;

  function alterna(id) {
    setSelezione((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
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
      <TestaPagina motto="Prima che la leva avanzi." azione={azioneTesta} />

      <div style={{ padding: `0 16px ${SPAZIO_BARRA}` }}>

        {inSelezione ? (
          <>
            <Sezione>Scegli i rullini</Sezione>
            {rullini.map((r) => (
              <CartaRullino key={r.id} rullino={r} fatti={conteggi[r.id] || 0}
                inSelezione scelto={selezione.includes(r.id)} mostraStato
                onClick={() => alterna(r.id)} />
            ))}
          </>
        ) : (
          <>
            <Sezione>In macchina</Sezione>

            {inCorso.length === 0 && (
              <Vuoto azione={<PulsantePieno icona="piu" onClick={onNuovo}>Carica un rullino</PulsantePieno>}>
                {rullini.length
                  ? 'Nessun rullino in macchina.'
                  : <>Nessun rullino ancora.<br />Il primo si carica qui.</>}
              </Vuoto>
            )}

            {inCorso.map((r) => (
              <CartaInMacchina key={r.id} rullino={r}
                fatti={conteggi[r.id] || 0} ultimo={ultimi[r.id]}
                onApri={() => onApri(r.id)} />
            ))}

            {inCorso.length > 0 && (
              <PulsanteContorno icona="piu" onClick={onNuovo}>Carica un rullino</PulsanteContorno>
            )}

            {finiti.length > 0 && (
              <>
                <Sezione style={{ marginTop: 34 }}>Da sviluppare</Sezione>
                {finiti.map((r) => (
                  <CartaRullino key={r.id} rullino={r} fatti={conteggi[r.id] || 0}
                    onClick={() => onApri(r.id)} />
                ))}
              </>
            )}
          </>
        )}
      </div>

      {inSelezione && attiva && (
        <BarraSelezione avviso={inCorsoScelti > 0 && (
          inCorsoScelti === 1
            ? 'Un rullino scelto non è ancora finito'
            : `${inCorsoScelti} rullini scelti non sono ancora finiti`
        )}>
          <PulsantePieno disabled={!selezione.length} style={{ flex: 1, width: 'auto' }}
            onClick={() => { onSviluppati(selezione); setSelezione(null); }}>
            Sviluppato
          </PulsantePieno>
          <PulsanteStampa disabled={!selezione.length}
            onClick={() => { onStampa(selezione); setSelezione(null); }} />
        </BarraSelezione>
      )}
    </div>
  );
}
