import { useMemo, useState } from 'react';
import { V, carta, PulsanteIcona, PulsantePieno, Fotogramma, Foglio, Vuoto } from '../ui/base.jsx';
import { Icona } from '../ui/icone.jsx';
import { Selettore, Tessera } from '../ui/selettore.jsx';
import { Conteggio } from '../ui/conteggio.jsx';
import {
  TEMPI, DIAFRAMMI, FILTRI, STATI_MANUALI, ETICHETTE_STATO,
  focaliPerRullino, riconosciZoom, nuovoScatto, prossimoNumero, ultimiValori,
  formattaTempo, formattaOra, formattaData, etichettaPushPull,
  correzioneReciprocita, filtroDa, sviluppoCompilato,
} from '../lib/model.js';

// ─── lista degli scatti ─────────────────────────────────────

/**
 * Il piu' recente in alto. Niente swipe e niente tocco lungo: con i
 * guanti non si registrano. Eliminare chiede un secondo tocco sullo
 * stesso punto, perche' una posa cancellata non si ricostruisce.
 */
function ListaScatti({ scatti, onModifica, onElimina }) {
  const [daEliminare, setDaEliminare] = useState(null);

  if (!scatti.length) {
    return <Vuoto>Nessuno scatto.<br />Imposta i parametri, poi registra.</Vuoto>;
  }

  const recenti = [...scatti].sort((a, b) => b.numero - a.numero);

  return recenti.map((s) => {
    const conferma = daEliminare === s.id;
    const filtro = s.filtro ? filtroDa(s.filtro) : null;
    return (
      <div key={s.id} style={{
        ...carta, borderRadius: 18, marginBottom: 8,
        display: 'flex', alignItems: 'center', gap: 6, padding: '10px 8px 10px 16px',
      }}>
        <span className="display" style={{
          fontSize: 24, fontWeight: 700, color: V('primary'), width: 34, flexShrink: 0,
          fontVariantNumeric: 'tabular-nums',
        }}>{s.numero}</span>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontVariantNumeric: 'tabular-nums', fontSize: 15.5 }}>
            {[formattaTempo(s.tempo), `f/${s.diaframma}`, s.focale ? `${s.focale}mm` : null]
              .filter(Boolean).join(' · ')}
            {filtro && filtro.stop > 0 && (
              <span style={{ color: V('primary') }}> · {filtro.nome}</span>
            )}
          </div>
          <div style={{
            color: V('on-surface-var'), fontSize: 13, marginTop: 2,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {[formattaData(s.timestamp) + ' ' + formattaOra(s.timestamp), s.nota].filter(Boolean).join(' — ')}
          </div>
        </div>

        {conferma ? (
          <>
            <button type="button" onClick={() => setDaEliminare(null)} style={{
              minHeight: 44, padding: '0 12px', borderRadius: V('r-full'),
              background: V('surf-cont-high'), fontSize: 13.5, fontWeight: 600, flexShrink: 0,
            }}>No</button>
            <button type="button" onClick={() => { setDaEliminare(null); onElimina(s.id); }} style={{
              minHeight: 44, padding: '0 14px', borderRadius: V('r-full'),
              background: V('critical'), color: V('on-critical'),
              fontSize: 13.5, fontWeight: 600, flexShrink: 0,
            }}>Elimina</button>
          </>
        ) : (
          <>
            <button type="button" onClick={() => { setDaEliminare(null); onModifica(s); }}
              aria-label={`Modifica posa ${s.numero}`} style={{
                width: 46, height: 46, minHeight: 46, padding: 0, borderRadius: 14, flexShrink: 0,
                background: 'transparent', color: V('on-surface-var'),
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}><Icona nome="modifica" size={20} /></button>
            <button type="button" onClick={() => setDaEliminare(s.id)}
              aria-label={`Elimina posa ${s.numero}`} style={{
                width: 46, height: 46, minHeight: 46, padding: 0, borderRadius: 14, flexShrink: 0,
                background: 'transparent', color: V('critical'),
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}><Icona nome="elimina" size={20} /></button>
          </>
        )}
      </div>
    );
  });
}

// ─── voce del menu ──────────────────────────────────────────

function VoceMenu({ icona, testo, onClick, accento, critica }) {
  return (
    <button type="button" onClick={onClick} style={{
      width: '100%', minHeight: 56, borderRadius: 16, background: 'transparent',
      display: 'flex', alignItems: 'center', gap: 14, padding: '0 6px',
      fontSize: 16, textAlign: 'left',
      color: critica ? V('critical') : V('on-surface'),
    }}>
      <span style={{ color: critica ? V('critical') : accento ? V('primary') : V('on-surface-var') }}>
        <Icona nome={icona} size={21} />
      </span>
      <span style={{ flex: 1 }}>{testo}</span>
      {accento && (
        <span aria-hidden="true" style={{
          width: 7, height: 7, borderRadius: '50%', background: V('primary'), marginRight: 6,
        }} />
      )}
    </button>
  );
}

// ─── schermata ──────────────────────────────────────────────

/**
 * Rullino — l'unico posto dove stanno tutte le azioni su un rullino.
 *
 * Fotogramma in alto, quattro tessere al centro, schede e REGISTRA in
 * fondo dove arriva il pollice. Si arriva qui da Rullini e da Archivio,
 * e il menu e' identico in entrambi i casi.
 */
export default function Rullino({
  rullino, scatti,
  onRegistra, onAggiorna, onElimina,
  onCambiaStato, onStampa, onSviluppo, onModifica, onEliminaRullino, onIndietro,
}) {
  const ordinati = useMemo(() => [...scatti].sort((a, b) => a.numero - b.numero), [scatti]);
  const focali = useMemo(() => focaliPerRullino(rullino), [rullino]);

  // Si riparte dai valori dell'ultimo scatto: tra una posa e l'altra
  // di solito cambia una cosa sola.
  const [iniziali] = useState(() => ultimiValori(ordinati));

  const [scheda, setScheda] = useState('esposizione');
  const [tempo, setTempo] = useState(iniziali.tempo);
  const [diaframma, setDiaframma] = useState(iniziali.diaframma);
  const [focale, setFocale] = useState(
    iniziali.focale && focali.includes(iniziali.focale) ? iniziali.focale : focali[0]
  );
  const [filtro, setFiltro] = useState(iniziali.filtro || '');
  const [nota, setNota] = useState('');
  const [aperto, setAperto] = useState(null);
  const [inModifica, setInModifica] = useState(null);
  const [pulse, setPulse] = useState(false);
  const [menu, setMenu] = useState(false);
  const [confermaElimina, setConfermaElimina] = useState(false);

  const prossimo = prossimoNumero(ordinati);
  const push = etichettaPushPull(rullino);
  const conFocale = focali.length > 1;
  const recip = useMemo(() => correzioneReciprocita(tempo, rullino.pellicola), [tempo, rullino.pellicola]);
  const filtroAttivo = filtroDa(filtro);
  const svFatto = sviluppoCompilato(rullino.sviluppo);

  function registra() {
    if (inModifica) {
      onAggiorna({
        ...inModifica, tempo, diaframma,
        focale: conFocale ? focale : inModifica.focale,
        nota, filtro,
      });
      setInModifica(null);
      setNota('');
      setScheda('scatti');
      return;
    }
    onRegistra(nuovoScatto(rullino.id, prossimo, {
      tempo, diaframma,
      focale: conFocale ? focale : (focali[0] || ''),
      nota, filtro,
    }));
    setNota('');
    setPulse(true);
    setTimeout(() => setPulse(false), 300);
  }

  function apriModifica(s) {
    setScheda('esposizione');
    setInModifica(s);
    setTempo(s.tempo);
    setDiaframma(s.diaframma);
    if (s.focale && focali.includes(s.focale)) setFocale(s.focale);
    setNota(s.nota || '');
    setFiltro(s.filtro || '');
  }

  function annullaModifica() {
    setInModifica(null);
    setNota('');
  }

  function elimina(id) {
    if (inModifica?.id === id) annullaModifica();
    onElimina(id);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

      {/* ─── testata ─── */}
      <header style={{
        flexShrink: 0, padding: '14px 16px 0', display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <PulsanteIcona icona="indietro" etichetta="Indietro" onClick={onIndietro} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="display" style={{
            fontSize: 21, fontWeight: 700, lineHeight: 1.15,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>{rullino.nome || 'Senza nome'}</div>
          <div style={{
            fontSize: 13.5, color: V('on-surface-var'), marginTop: 2,
            display: 'flex', gap: 8, overflow: 'hidden', whiteSpace: 'nowrap',
          }}>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {[rullino.pellicola, `EI ${rullino.iso_esposizione}`].filter(Boolean).join(' · ')}
            </span>
            {push && <span style={{ color: V('primary'), fontWeight: 600, flexShrink: 0 }}>{push}</span>}
          </div>
        </div>
        <PulsanteIcona icona="altro" etichetta="Azioni sul rullino" onClick={() => setMenu(true)} />
      </header>

      <div style={{ flexShrink: 0, padding: '14px 16px 4px' }}>
        <Fotogramma fatti={ordinati.length} totali={rullino.pose_totali} pulse={pulse} cifra={46} />
      </div>

      {/* ─── corpo ─── */}
      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '10px 16px 12px' }}>

        {scheda === 'esposizione' && (
          <>
            {inModifica && (
              <div style={{
                ...carta, borderColor: V('primary-border'), padding: '8px 8px 8px 16px', marginBottom: 10,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
                color: V('primary'), fontSize: 15,
              }}>
                <span>Modifica della posa {inModifica.numero}</span>
                <button type="button" onClick={annullaModifica} style={{
                  minHeight: 42, padding: '0 16px', borderRadius: V('r-full'),
                  background: V('surf-cont-high'), color: V('on-surface'),
                  fontSize: 13.5, fontWeight: 600, flexShrink: 0,
                }}>Annulla</button>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <Tessera etichetta="Tempo" valore={formattaTempo(tempo)}
                onClick={() => setAperto('tempo')} />
              <Tessera etichetta="Diaframma" valore={`f/${diaframma}`}
                onClick={() => setAperto('diaframma')} />
              <Tessera
                etichetta={riconosciZoom(rullino.obiettivo) ? 'Focale · zoom' : 'Focale'}
                valore={focale || '—'} suffisso={focale ? 'mm' : null}
                onClick={conFocale ? () => setAperto('focale') : undefined} />
              <Tessera etichetta="Filtro" valore={filtroAttivo.nome}
                suffisso={filtroAttivo.stop > 0 ? `+${filtroAttivo.stop}` : null}
                accento={!!filtro} onClick={() => setAperto('filtro')} />
            </div>

            {/* Sopra il secondo la pellicola perde sensibilita' in modo
                non lineare: senza correzione si sottoespone, e ci si
                accorge solo dopo lo sviluppo. */}
            {recip && (
              <div style={{ ...carta, borderColor: V('primary-border'), padding: 16, marginTop: 10 }}>
                <div style={{
                  fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase',
                  color: V('primary'), fontWeight: 600, marginBottom: 6,
                }}>Reciprocità</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
                  <span style={{ color: V('on-surface-var'), fontSize: 15 }}>{recip.misurato} misurati →</span>
                  <span className="display" style={{
                    fontSize: 28, fontWeight: 700, color: V('primary'), fontVariantNumeric: 'tabular-nums',
                  }}>{recip.corretto}</span>
                  <span style={{ color: V('on-surface-var'), fontSize: 13.5 }}>+{recip.stop} stop</span>
                </div>
                {recip.nota && (
                  <div style={{ color: V('on-surface-var'), fontSize: 13, marginTop: 4 }}>{recip.nota}.</div>
                )}
                {recip.ignota && (
                  <div style={{ color: V('on-surface-var'), fontSize: 13, marginTop: 4 }}>
                    Pellicola non riconosciuta: stima prudente da bianco e nero tradizionale.
                  </div>
                )}
                <div style={{ marginTop: 14 }}>
                  <Conteggio key={tempo} secondi={recip.secondi} diametro={112} />
                </div>
              </div>
            )}

            <input value={nota} onChange={(e) => setNota(e.target.value)}
              placeholder="Nota — soggetto, luce, intenzione"
              aria-label="Nota della posa"
              style={{ marginTop: 10 }} />
          </>
        )}

        {scheda === 'scatti' && (
          <ListaScatti scatti={ordinati} onModifica={apriModifica} onElimina={elimina} />
        )}
      </div>

      {/* ─── piede ─── */}
      <div style={{
        flexShrink: 0, position: 'relative',
        padding: '10px 16px calc(14px + env(safe-area-inset-bottom))',
        borderTop: `1px solid ${V('surf-cont-low')}`,
      }}>
        <div role="tablist" style={{
          ...carta, borderRadius: V('r-full'), padding: 4, marginBottom: 10,
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4,
        }}>
          {[
            ['esposizione', 'Esposizione'],
            ['scatti', `Scatti${ordinati.length ? ' ' + ordinati.length : ''}`],
          ].map(([chiave, etichetta]) => {
            const on = scheda === chiave;
            return (
              <button key={chiave} type="button" role="tab" aria-selected={on}
                onClick={() => setScheda(chiave)} style={{
                  minHeight: 42, borderRadius: V('r-full'),
                  background: on ? V('primary-tint') : 'transparent',
                  boxShadow: on ? `inset 0 0 0 1.5px ${V('primary-border')}` : 'none',
                  color: on ? V('primary') : V('on-surface-var'),
                  fontSize: 14.5, fontWeight: on ? 600 : 400,
                }}>{etichetta}</button>
            );
          })}
        </div>

        <PulsantePieno onClick={registra} style={{
          minHeight: 62, fontSize: 20,
          ...(inModifica ? { background: V('primary'), color: V('on-primary') } : {}),
        }}>
          {inModifica ? `Salva la posa ${inModifica.numero}` : `Registra posa ${prossimo}`}
        </PulsantePieno>
      </div>

      {/* ─── pannelli ─── */}
      {aperto === 'tempo' && (
        <Selettore titolo="Tempo di posa" valori={TEMPI} valore={tempo} formatta={formattaTempo}
          onScegli={setTempo} onChiudi={() => setAperto(null)} />
      )}
      {aperto === 'diaframma' && (
        <Selettore titolo="Diaframma" valori={DIAFRAMMI} valore={diaframma} formatta={(d) => `f/${d}`}
          onScegli={setDiaframma} onChiudi={() => setAperto(null)} />
      )}
      {aperto === 'focale' && (
        <Selettore titolo="Focale" valori={focali} valore={focale} formatta={(f) => `${f} mm`}
          onScegli={setFocale} onChiudi={() => setAperto(null)} />
      )}
      {aperto === 'filtro' && (
        <Selettore titolo="Filtro" valori={FILTRI.map((f) => f.id)} valore={filtro}
          formatta={(id) => { const f = filtroDa(id); return f.stop > 0 ? `${f.nome} +${f.stop}` : f.nome; }}
          onScegli={setFiltro} onChiudi={() => setAperto(null)} />
      )}

      {menu && (
        <Foglio titolo="Rullino" onChiudi={() => { setMenu(false); setConfermaElimina(false); }}>
          {(chiudi) => (
            <>
              <div style={{
                fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase',
                color: V('on-surface-var'), fontWeight: 600, margin: '0 4px 8px',
              }}>Stato{rullino.stato === 'sviluppato' ? ' — ora sviluppato' : ''}</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {STATI_MANUALI.map((st) => {
                  const on = st === rullino.stato;
                  return (
                    <button key={st} type="button" aria-pressed={on} onClick={() => onCambiaStato(st)} style={{
                      minHeight: 54, borderRadius: 16,
                      background: on ? V('primary-tint') : V('surf-cont'),
                      color: on ? V('primary') : V('on-surface'),
                      boxShadow: on ? `inset 0 0 0 1.5px ${V('primary')}` : 'none',
                      fontSize: 15, fontWeight: on ? 600 : 400,
                    }}>{ETICHETTE_STATO[st]}</button>
                  );
                })}
              </div>

              <div style={{ height: 1, background: V('outline'), margin: '16px 0 6px', opacity: 0.6 }} />

              <VoceMenu icona="modifica" testo="Modifica il rullino"
                onClick={() => { chiudi(); onModifica(); }} />
              <VoceMenu icona="sviluppo" accento={!svFatto}
                testo={svFatto ? 'Modifica lo sviluppo' : 'Registra lo sviluppo'}
                onClick={() => { chiudi(); onSviluppo(); }} />
              <VoceMenu icona="stampa" testo="Stampa la scheda"
                onClick={() => { chiudi(); onStampa(); }} />

              <div style={{ height: 1, background: V('outline'), margin: '6px 0', opacity: 0.6 }} />

              {!confermaElimina ? (
                <VoceMenu icona="elimina" critica testo="Elimina il rullino"
                  onClick={() => setConfermaElimina(true)} />
              ) : (
                <div style={{ padding: 14, borderRadius: 18, background: V('surf-cont'), marginTop: 6 }}>
                  <div style={{ fontSize: 15, lineHeight: 1.45, marginBottom: 12 }}>
                    Elimini <strong>{rullino.nome || 'Senza nome'}</strong> e{' '}
                    {ordinati.length === 1 ? 'il suo scatto' : `i suoi ${ordinati.length} scatti`}.
                    <span style={{ color: V('critical') }}> Non si torna indietro.</span>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button type="button" onClick={() => setConfermaElimina(false)} style={{
                      flex: 1, minHeight: 52, borderRadius: V('r-full'),
                      background: V('surf-cont-highest'), fontSize: 15, fontWeight: 600,
                    }}>Annulla</button>
                    <button type="button" onClick={onEliminaRullino} style={{
                      flex: 1, minHeight: 52, borderRadius: V('r-full'),
                      background: V('critical'), color: V('on-critical'), fontSize: 15, fontWeight: 600,
                    }}>Elimina</button>
                  </div>
                </div>
              )}
            </>
          )}
        </Foglio>
      )}
    </div>
  );
}
