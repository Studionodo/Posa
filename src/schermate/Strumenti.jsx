import { useState } from 'react';
import { V, carta, TestaPagina, Sezione, SPAZIO_BARRA } from '../ui/base.jsx';
import { Tessera, Selettore } from '../ui/selettore.jsx';
import { Conteggio } from '../ui/conteggio.jsx';
import {
  TEMPI, FILTRI, ELENCO_EMULSIONI, filtroDa, formattaTempo, formattaDurata,
  tempoInSecondi, correzioneSecondi, riconosciEmulsione,
} from '../lib/model.js';

const ALTRA = 'altra';
const TEMPI_MISURABILI = TEMPI.filter((t) => t !== 'B');

/**
 * Strumenti — la posa lunga senza aprire un rullino.
 *
 * L'ordine dei passaggi e' quello del campo: si misura senza filtro,
 * si allunga per il filtro, poi si corregge la reciprocita' sul tempo
 * gia' allungato. Invertire gli ultimi due sottostima l'esposizione,
 * ed e' l'errore tipico di chi fa il conto a mente con un ND da 10 stop.
 */
export default function Strumenti({ pellicolaInMacchina }) {
  const [tempo, setTempo] = useState('1"');
  const [filtro, setFiltro] = useState('');
  const [pellicola, setPellicola] = useState(() => {
    const e = riconosciEmulsione(pellicolaInMacchina);
    return e.ignota ? ALTRA : e.nome;
  });
  const [aperto, setAperto] = useState(null);

  const f = filtroDa(filtro);
  const misurato = tempoInSecondi(tempo);
  const conFiltro = misurato * Math.pow(2, f.stop);
  const corr = correzioneSecondi(conFiltro, pellicola === ALTRA ? '' : pellicola);
  const finale = corr ? corr.secondi : conFiltro;

  const passaggi = [
    ['Misurato', formattaTempo(tempo)],
    ['Filtro', f.stop > 0 ? `+${f.stop} stop → ${formattaDurata(conFiltro)}` : 'nessuno'],
    ['Reciprocità', corr
      ? `+${corr.stop} stop → ${corr.corretto}`
      : conFiltro < 1 ? 'non serve sotto il secondo' : 'nessuna correzione'],
  ];

  return (
    <div style={{ height: '100%', overflowY: 'auto' }}>
      <TestaPagina titolo="Strumenti"
        sottotitolo="Posa lunga: filtro, reciprocità e conteggio." />

      <div style={{ padding: `0 16px ${SPAZIO_BARRA}` }}>
        <Sezione>Calcolo</Sezione>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <Tessera pieno etichetta="Pellicola"
            valore={pellicola === ALTRA ? 'Non in elenco' : pellicola}
            onClick={() => setAperto('pellicola')} />
          <Tessera etichetta="Tempo misurato" valore={formattaTempo(tempo)}
            onClick={() => setAperto('tempo')} />
          <Tessera etichetta="Filtro" valore={f.nome}
            suffisso={f.stop > 0 ? `+${f.stop}` : null} accento={!!filtro}
            onClick={() => setAperto('filtro')} />
        </div>

        <Sezione>Da esporre</Sezione>

        <div style={{ ...carta, padding: 18 }}>
          <div className="display" style={{
            fontSize: 46, fontWeight: 700, lineHeight: 1, color: V('primary'),
            fontVariantNumeric: 'tabular-nums',
          }}>{formattaDurata(finale)}</div>

          <div style={{ marginTop: 14 }}>
            {passaggi.map(([etichetta, valore]) => (
              <div key={etichetta} style={{
                display: 'flex', justifyContent: 'space-between', gap: 12,
                padding: '9px 0', borderTop: `1px solid ${V('outline')}`, fontSize: 14.5,
              }}>
                <span style={{ color: V('on-surface-var') }}>{etichetta}</span>
                <span style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{valore}</span>
              </div>
            ))}
          </div>

          {(corr?.nota || corr?.ignota || finale > 600) && (
            <div style={{ color: V('on-surface-var'), fontSize: 13, lineHeight: 1.5, marginTop: 8 }}>
              {corr?.nota && <div>{corr.nota}.</div>}
              {corr?.ignota && <div>Pellicola non in elenco: stima prudente da bianco e nero tradizionale.</div>}
              {finale > 600 && <div>Oltre i dieci minuti la stima è indicativa: conviene una posa di riserva.</div>}
            </div>
          )}

          {finale >= 1 && (
            <div style={{ marginTop: 18, paddingTop: 18, borderTop: `1px solid ${V('outline')}` }}>
              <Conteggio key={Math.round(finale)} secondi={finale} />
            </div>
          )}
        </div>
      </div>

      {aperto === 'pellicola' && (
        <Selettore titolo="Pellicola" valori={[...ELENCO_EMULSIONI, ALTRA]} valore={pellicola}
          formatta={(p) => (p === ALTRA ? 'Non in elenco' : p)}
          onScegli={setPellicola} onChiudi={() => setAperto(null)} />
      )}
      {aperto === 'tempo' && (
        <Selettore titolo="Tempo misurato" valori={TEMPI_MISURABILI} valore={tempo}
          formatta={formattaTempo} onScegli={setTempo} onChiudi={() => setAperto(null)} />
      )}
      {aperto === 'filtro' && (
        <Selettore titolo="Filtro" valori={FILTRI.map((x) => x.id)} valore={filtro}
          formatta={(id) => { const x = filtroDa(id); return x.stop > 0 ? `${x.nome} +${x.stop}` : x.nome; }}
          onScegli={setFiltro} onChiudi={() => setAperto(null)} />
      )}
    </div>
  );
}
