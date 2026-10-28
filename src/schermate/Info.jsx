import { V, carta, TestaPagina, Sezione, SPAZIO_BARRA } from '../ui/base.jsx';
import { Icona } from '../ui/icone.jsx';

/** Una voce: titolo e riga di spiegazione a sinistra, il gesto a destra. */
function Voce({ titolo, sottotitolo, icona, href, esterno, onClick }) {
  const contenuto = (
    <>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span className="display" style={{ display: 'block', fontSize: 19, fontWeight: 600, lineHeight: 1.2 }}>
          {titolo}
        </span>
        <span style={{ display: 'block', fontSize: 14, color: V('on-surface-var'), marginTop: 3 }}>
          {sottotitolo}
        </span>
      </span>
      <span style={{
        width: 46, height: 46, borderRadius: V('r-full'), flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: V('primary-tint'), color: V('primary'),
        boxShadow: `inset 0 0 0 1.5px ${V('primary-border')}`,
      }}>
        <Icona nome={icona} size={20} spessore={2} />
      </span>
    </>
  );

  const stile = {
    ...carta, display: 'flex', alignItems: 'center', gap: 14, width: '100%',
    padding: '16px 16px 16px 20px', marginBottom: 10, minHeight: 78,
    textAlign: 'left', textDecoration: 'none', color: V('on-surface'),
  };

  if (href) {
    return (
      <a href={href} style={stile}
        {...(esterno ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
        {contenuto}
      </a>
    );
  }
  return <button type="button" onClick={onClick} style={stile}>{contenuto}</button>;
}

/**
 * Info — cio' che riguarda l'app e non i rullini.
 */
export default function Info({ onBackup }) {
  return (
    <div style={{ height: '100%', overflowY: 'auto' }}>
      <TestaPagina titolo="Info" />

      <div style={{ padding: `0 16px ${SPAZIO_BARRA}` }}>
        <Sezione>I tuoi dati</Sezione>
        <Voce titolo="Backup dell’archivio" sottotitolo="Un file con tutti i rullini e gli scatti"
          icona="scarica" onClick={onBackup} />

        <Sezione>Posa</Sezione>
        <Voce titolo="Cos’è Posa" sottotitolo="Cosa fa e perché" icona="documento" href="/about.html" />
        <Voce titolo="Privacy" sottotitolo="Nessun account, nessun dato raccolto" icona="scudo" href="/privacy.html" />

        <Sezione>Studionodo</Sezione>
        <Voce titolo="Offrimi un caffè" sottotitolo="Sostieni lo sviluppo su Ko-fi" icona="caffe"
          href="https://ko-fi.com/istantelabs/tip" esterno />
        <Voce titolo="GitHub" sottotitolo="github.com/Studionodo" icona="codice"
          href="https://github.com/Studionodo" esterno />

        <div style={{
          textAlign: 'center', fontSize: 12, letterSpacing: '0.03em', lineHeight: 1.8,
          color: V('on-surface-var'), opacity: 0.7, marginTop: 26,
        }}>
          Offline · Nessun account · Nessun dato raccolto<br />
          © 2026 Studionodo · Tutti i diritti riservati
        </div>
      </div>
    </div>
  );
}
