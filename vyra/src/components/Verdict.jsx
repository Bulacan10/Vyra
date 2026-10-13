import { VERDICTS } from '../scoring/weights.js';

const SECTION_NAMES = { contract: 'Contract', social: 'Social', community: 'Community' };

function confidenceLabel(c) {
  if (c >= 0.8) return 'High confidence';
  if (c >= 0.5) return 'Medium confidence';
  return 'Low confidence';
}

export default function Verdict({ result }) {
  if (!result) {
    return (
      <section className="verdict empty" aria-live="polite">
        <h2>No score yet</h2>
        <p>Scan a contract or fill in the Social or Community tab. The score appears here as soon as there is something to rate.</p>
      </section>
    );
  }

  const present = Object.fromEntries(result.sections.map((s) => [s.section, s]));

  return (
    <section className="verdict" aria-live="polite">
      <p className={`score tone-${result.verdict.tone}`}>
        {result.score}<span className="out-of">/100</span>
      </p>
      <h2 className={`tone-${result.verdict.tone}`}>{result.verdict.label}</h2>

      <div className="ruler" role="img" aria-label={`Score ${result.score} out of 100, ${result.verdict.label}`}>
        <div className="zones">
          {[...VERDICTS].reverse().map((v) => <span key={v.label} className={`zone zone-${v.tone}`} />)}
        </div>
        <span className="marker" style={{ left: `${result.score}%` }} />
      </div>

      {result.wasCapped && (
        <p className="note">A serious red flag limits this score, even where other signals look good.</p>
      )}

      <ul className="sections">
        {Object.keys(SECTION_NAMES).map((key) => (
          <li key={key}>
            <span>{SECTION_NAMES[key]}</span>
            {present[key] ? (
              <>
                <span className="bar"><span style={{ width: `${present[key].score}%` }} /></span>
                <span className="num">{present[key].score}</span>
              </>
            ) : (
              <span className="muted">No data</span>
            )}
          </li>
        ))}
      </ul>

      <p className="confidence">
        {confidenceLabel(result.confidence)}: this score uses {Math.round(result.confidence * 100)}% of the signals Vyra can read.
      </p>
      <p className="disclaimer">
        A heuristic estimate to help you look closer, not a guarantee of safety. Not financial advice.
      </p>
    </section>
  );
}
