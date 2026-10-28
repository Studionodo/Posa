/**
 * icone.jsx — icone a tratto, disegnate qui.
 *
 * Non caratteri Unicode: su Android ⎙ ◐ ▤ cambiano forma — o spariscono —
 * a seconda del font di sistema del telefono. Un tracciato SVG si vede
 * uguale ovunque e prende il colore dal testo che lo circonda.
 */

const TRACCIATI = {
  // rullino 35mm: caricatore, manopola, coda di pellicola
  rullini: (
    <>
      <rect x="3.5" y="6" width="10" height="14" rx="2" />
      <path d="M6.5 6V3.5h4V6" />
      <path d="M13.5 9H20v7h-6.5" />
      <path d="M15.5 12.5h2.5" />
    </>
  ),
  archivio: (
    <>
      <rect x="3" y="4" width="18" height="5" rx="1.5" />
      <path d="M5 9v9a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V9" />
      <path d="M10 13h4" />
    </>
  ),
  strumenti: (
    <>
      <circle cx="12" cy="13.5" r="7.5" />
      <path d="M12 9.5v4l2.5 2" />
      <path d="M9.5 2.5h5M12 2.5V6" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5.5" />
      <path d="M12 7.6v.1" />
    </>
  ),
  indietro: <path d="M15 5l-7 7 7 7" />,
  avanti: <path d="M9 5l7 7-7 7" />,
  altro: (
    <>
      <circle cx="5.5" cy="12" r="1.3" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1.3" fill="currentColor" stroke="none" />
      <circle cx="18.5" cy="12" r="1.3" fill="currentColor" stroke="none" />
    </>
  ),
  spunta: <path d="M5 12.5l4.5 4.5L19 7.5" />,
  chiudi: <path d="M6.5 6.5l11 11M17.5 6.5l-11 11" />,
  piu: <path d="M12 5v14M5 12h14" />,
  stampa: (
    <>
      <path d="M7 9V3.5h10V9" />
      <rect x="3" y="9" width="18" height="8" rx="2" />
      <path d="M7 14h10v6.5H7z" />
    </>
  ),
  modifica: (
    <>
      <path d="M4 20h4L19 9l-4-4L4 16z" />
      <path d="M13.5 6.5l4 4" />
    </>
  ),
  // la tank di sviluppo vista dall'alto: meta' bagno, meta' aria
  sviluppo: (
    <>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 4a8 8 0 0 1 0 16z" fill="currentColor" stroke="none" />
    </>
  ),
  elimina: (
    <>
      <path d="M4 7h16" />
      <path d="M9 7V4h6v3" />
      <path d="M6 7l1 13h10l1-13" />
    </>
  ),
  scarica: (
    <>
      <path d="M12 4v11" />
      <path d="M7 10l5 5 5-5" />
      <path d="M5 20h14" />
    </>
  ),
  esterno: (
    <>
      <path d="M14 4h6v6" />
      <path d="M20 4l-9 9" />
      <path d="M18 14v6H4V6h6" />
    </>
  ),
  documento: (
    <>
      <path d="M6 3h8l4 4v14H6z" />
      <path d="M14 3v4h4" />
      <path d="M9 12h6M9 16h6" />
    </>
  ),
  scudo: <path d="M12 3l8 3v6c0 4.5-3.4 8-8 9-4.6-1-8-4.5-8-9V6z" />,
  caffe: (
    <>
      <path d="M4 9h13v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5z" />
      <path d="M17 11h1.5a2.5 2.5 0 0 1 0 5H17" />
      <path d="M8.5 3v3M12.5 3v3" />
    </>
  ),
  codice: <path d="M8 7l-5 5 5 5M16 7l5 5-5 5" />,
};

export function Icona({ nome, size = 22, spessore = 1.8, style }) {
  const t = TRACCIATI[nome];
  if (!t) return null;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={spessore}
      strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true" focusable="false"
      style={{ display: 'block', flexShrink: 0, ...style }}>
      {t}
    </svg>
  );
}
