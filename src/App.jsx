import { useCallback, useEffect, useRef, useState } from 'react';
import * as db from './lib/db.js';
import { scaricaBackup } from './lib/esporta.js';
import { stampaSchede } from './lib/stampa.js';
import { V } from './ui/base.jsx';
import { Icona } from './ui/icone.jsx';
import { BarraSezioni } from './ui/schede.jsx';
import Rullini from './schermate/Rullini.jsx';
import Archivio from './schermate/Archivio.jsx';
import Strumenti from './schermate/Strumenti.jsx';
import Info from './schermate/Info.jsx';
import Rullino from './schermate/Rullino.jsx';
import Caricamento from './schermate/Caricamento.jsx';
import Sviluppo from './schermate/Sviluppo.jsx';

/**
 * App — stato, persistenza, navigazione.
 *
 * ─── Due livelli ───
 *
 * Sotto, quattro sezioni con la barra fluttuante: Rullini, Archivio,
 * Strumenti, Info. Restano montate tutte e quattro: cambiando sezione
 * non si perde lo scorrimento, e un conteggio di posa lunga avviato in
 * Strumenti non si azzera se si guarda altrove.
 *
 * Sopra, una pila di schermate a tutto schermo: Rullino, Carica,
 * Modifica, Sviluppo. Ogni apertura entra nella cronologia del
 * browser, quindi il tasto Indietro di Android torna alla schermata
 * precedente invece di chiudere l'app.
 *
 * ─── Un principio ───
 *
 * Le azioni su UN rullino stanno dentro il rullino, nel menu ⋯. La
 * selezione fa le stesse cose su PIU' rullini. Gli stati sono tre e si
 * chiamano allo stesso modo ovunque: IN CORSO → FINITO → SVILUPPATO.
 */
export default function App() {
  const [pronto, setPronto] = useState(false);
  const [errore, setErrore] = useState(null);

  const [rullini, setRullini] = useState([]);
  const [conteggi, setConteggi] = useState({});
  const [ultimi, setUltimi] = useState({});
  const [scatti, setScatti] = useState([]);

  const [sezione, setSezione] = useState('rullini');
  const [selezioni, setSelezioni] = useState({ rullini: false, archivio: false });
  const [pila, setPila] = useState([]);

  // ─── caricamento ──────────────────────────────────────────

  /* Un solo passaggio legge tutto: elenco, conteggi e ultimo scatto di
     ogni rullino. getScatti restituisce gia' in ordine di numero. */
  const ricarica = useCallback(async () => {
    const elenco = await db.getRullini();
    const perRullino = await Promise.all(elenco.map(async (r) => {
      const s = await db.getScatti(r.id);
      return [r.id, s.length, s.length ? s[s.length - 1] : null];
    }));
    setRullini(elenco);
    setConteggi(Object.fromEntries(perRullino.map(([id, n]) => [id, n])));
    setUltimi(Object.fromEntries(perRullino.filter(([, , u]) => u).map(([id, , u]) => [id, u])));
  }, []);

  useEffect(() => {
    ricarica()
      .then(() => setPronto(true))
      .catch(() => { setErrore('Impossibile aprire l’archivio locale.'); setPronto(true); });
  }, [ricarica]);

  // ─── pila e cronologia ────────────────────────────────────

  const pilaRef = useRef(pila);
  pilaRef.current = pila;

  /* Fuori da http(s) — un'anteprima incorporata — la cronologia del
     browser non e' nostra: la pila funziona da sola. */
  const conStoria = useRef(typeof location !== 'undefined' && /^https?:$/.test(location.protocol));

  useEffect(() => {
    if (!conStoria.current) return undefined;
    try { history.replaceState({ posa: 0 }, ''); } catch { conStoria.current = false; return undefined; }
    const onPop = (e) => {
      const profondita = e.state && typeof e.state.posa === 'number' ? e.state.posa : 0;
      setPila((p) => p.slice(0, profondita));
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  function apri(vista) {
    if (conStoria.current) {
      try { history.pushState({ posa: pilaRef.current.length + 1 }, ''); }
      catch { conStoria.current = false; }
    }
    setPila((p) => [...p, vista]);
  }

  /** Sostituisce la schermata in cima senza allungare la cronologia. */
  function sostituisci(vista) {
    setPila((p) => [...p.slice(0, -1), vista]);
  }

  function indietro() {
    if (!pilaRef.current.length) return;
    if (conStoria.current) history.back();
    else setPila((p) => p.slice(0, -1));
  }

  function chiudiTutto() {
    const n = pilaRef.current.length;
    if (!n) return;
    if (conStoria.current) history.go(-n);
    else setPila([]);
  }

  /* Mentre una sezione e' in selezione, la barra delle sezioni lascia
     il posto alle azioni sulla selezione. */
  const selRullini = useCallback((a) => {
    setSelezioni((p) => (p.rullini === a ? p : { ...p, rullini: a }));
  }, []);
  const selArchivio = useCallback((a) => {
    setSelezioni((p) => (p.archivio === a ? p : { ...p, archivio: a }));
  }, []);

  // ─── rullini ──────────────────────────────────────────────

  async function apriRullino(id) {
    try {
      const s = await db.getScatti(id);
      setScatti(s);
      apri({ nome: 'rullino', id });
    } catch {
      setErrore('Rullino non leggibile.');
    }
  }

  async function creaRullino(r) {
    try {
      await db.saveRullino(r);
      await ricarica();
      setScatti([]);
      sostituisci({ nome: 'rullino', id: r.id });
    } catch {
      setErrore('Rullino non salvato. Riprova.');
    }
  }

  async function salvaModifiche(r) {
    try {
      await db.saveRullino(r);
      await ricarica();
      indietro();
    } catch {
      setErrore('Modifica non salvata.');
    }
  }

  /** Un solo passaggio di stato, usato da ogni punto dell'interfaccia. */
  async function cambiaStato(ids, stato) {
    try {
      const adesso = new Date().toISOString();
      for (const id of [].concat(ids)) {
        const r = rullini.find((x) => x.id === id);
        if (!r || r.stato === stato) continue;
        await db.saveRullino({
          ...r, stato,
          data_fine: stato === 'in_corso' ? null : (r.data_fine || adesso),
        });
      }
      await ricarica();
    } catch {
      setErrore('Cambio di stato non salvato.');
    }
  }

  /* Salvare lo sviluppo implica che il rullino e' passato per la tank.
     Si torna al rullino: i dati appena scritti si rileggono e si
     stampano da li'. */
  async function salvaSviluppo(id, sv) {
    const r = rullini.find((x) => x.id === id);
    if (!r) return;
    try {
      await db.saveRullino({
        ...r, sviluppo: sv, stato: 'sviluppato',
        data_fine: r.data_fine || new Date().toISOString(),
      });
      await ricarica();
      indietro();
    } catch {
      setErrore('Sviluppo non salvato.');
    }
  }

  async function eliminaRullino(id) {
    try {
      await db.deleteRullino(id);
      chiudiTutto();
      setScatti([]);
      await ricarica();
    } catch {
      setErrore('Eliminazione non riuscita.');
    }
  }

  // ─── scatti ───────────────────────────────────────────────

  async function registraScatto(s) {
    setScatti((p) => [...p, s]);                    // ottimistico
    try {
      await db.saveScatto(s);
    } catch {
      setScatti((p) => p.filter((x) => x.id !== s.id));
      setErrore('Scatto non salvato. Riprova.');
      return;
    }
    ricarica().catch(() => {});
  }

  async function aggiornaScatto(s) {
    setScatti((p) => p.map((x) => (x.id === s.id ? s : x)));
    try {
      await db.saveScatto(s);
    } catch {
      setErrore('Modifica non salvata.');
      return;
    }
    ricarica().catch(() => {});
  }

  async function eliminaScatto(id) {
    setScatti((p) => p.filter((x) => x.id !== id));
    try {
      await db.deleteScatto(id);
    } catch {
      setErrore('Eliminazione non riuscita.');
      return;
    }
    ricarica().catch(() => {});
  }

  // ─── uscite ───────────────────────────────────────────────

  async function stampa(ids) {
    try {
      const coppie = await Promise.all([].concat(ids).map(async (id) => ({
        rullino: rullini.find((r) => r.id === id),
        scatti: await db.getScatti(id),
      })));
      stampaSchede(coppie.filter((c) => c.rullino));
    } catch {
      setErrore('Stampa non riuscita.');
    }
  }

  async function backup() {
    try {
      await scaricaBackup();
    } catch {
      setErrore('Backup non riuscito.');
    }
  }

  // ─── render ───────────────────────────────────────────────

  if (!pronto) {
    return (
      <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: V('on-surface-var') }}>Apertura archivio…</p>
      </div>
    );
  }

  const attivi = rullini.filter((r) => r.stato !== 'sviluppato');
  const sviluppati = rullini.filter((r) => r.stato === 'sviluppato');
  const pellicolaInMacchina = (rullini.find((r) => r.stato === 'in_corso') || {}).pellicola || '';

  const vista = pila.length ? pila[pila.length - 1] : null;
  const attivo = vista && vista.id ? rullini.find((r) => r.id === vista.id) : null;

  let sopra = null;
  if (vista && vista.nome === 'rullino' && attivo) {
    sopra = (
      <Rullino key={attivo.id}
        rullino={attivo} scatti={scatti}
        onRegistra={registraScatto} onAggiorna={aggiornaScatto} onElimina={eliminaScatto}
        onCambiaStato={(st) => cambiaStato(attivo.id, st)}
        onStampa={() => stampa(attivo.id)}
        onSviluppo={() => apri({ nome: 'sviluppo', id: attivo.id })}
        onModifica={() => apri({ nome: 'modifica', id: attivo.id })}
        onEliminaRullino={() => eliminaRullino(attivo.id)}
        onIndietro={indietro} />
    );
  } else if (vista && vista.nome === 'sviluppo' && attivo) {
    sopra = <Sviluppo rullino={attivo} onSalva={(sv) => salvaSviluppo(attivo.id, sv)} onIndietro={indietro} />;
  } else if (vista && vista.nome === 'modifica' && attivo) {
    sopra = <Caricamento rullino={attivo} onSalva={salvaModifiche} onIndietro={indietro} />;
  } else if (vista && vista.nome === 'nuovo') {
    sopra = <Caricamento ultimo={rullini[0]} tuttiRullini={rullini} onSalva={creaRullino} onIndietro={indietro} />;
  }

  const visibile = (k) => ({ display: sezione === k ? 'block' : 'none', height: '100%' });

  return (
    <div style={{ height: '100%', position: 'relative' }}>

      {errore && (
        <div role="alert" style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 60,
          padding: 'calc(10px + env(safe-area-inset-top)) 12px 0',
        }}>
          <div style={{
            maxWidth: 568, margin: '0 auto', borderRadius: 18, padding: '6px 6px 6px 16px',
            background: V('critical'), color: V('on-critical'),
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
          }}>
            <span style={{ fontSize: 14.5 }}>{errore}</span>
            <button type="button" onClick={() => setErrore(null)} aria-label="Chiudi l'avviso" style={{
              width: 44, height: 44, minHeight: 44, padding: 0, borderRadius: 14,
              background: 'transparent', color: 'inherit',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}><Icona nome="chiudi" size={20} /></button>
          </div>
        </div>
      )}

      {/* ─── sezioni ─── */}
      <div aria-hidden={sopra ? true : undefined} style={{
        height: '100%', maxWidth: 600, margin: '0 auto',
        visibility: sopra ? 'hidden' : 'visible',
      }}>
        <div style={visibile('rullini')}>
          <Rullini rullini={attivi} conteggi={conteggi} ultimi={ultimi}
            attiva={sezione === 'rullini' && !sopra}
            onApri={apriRullino} onNuovo={() => apri({ nome: 'nuovo' })}
            onSviluppati={(ids) => cambiaStato(ids, 'sviluppato')}
            onStampa={stampa} onSelezione={selRullini} />
        </div>
        <div style={visibile('archivio')}>
          <Archivio rullini={sviluppati} conteggi={conteggi}
            attiva={sezione === 'archivio' && !sopra}
            onApri={apriRullino} onRiporta={(ids) => cambiaStato(ids, 'finito')}
            onStampa={stampa} onSelezione={selArchivio} />
        </div>
        <div style={visibile('strumenti')}>
          <Strumenti pellicolaInMacchina={pellicolaInMacchina} />
        </div>
        <div style={visibile('info')}>
          <Info onBackup={backup} />
        </div>
      </div>

      {!sopra && !selezioni[sezione] && (
        <BarraSezioni attiva={sezione} onCambia={setSezione} />
      )}

      {/* ─── schermate a tutto schermo ─── */}
      {sopra && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 20, background: V('surface') }}>
          <div style={{ height: '100%', maxWidth: 600, margin: '0 auto' }}>{sopra}</div>
        </div>
      )}
    </div>
  );
}
