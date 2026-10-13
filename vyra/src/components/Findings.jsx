const SEVERITY_LABEL = { critical: 'Critical', warning: 'Warning', info: 'Note', good: 'Good' };
const SECTION_NAME = { contract: 'Contract', social: 'Social', community: 'Community' };

export default function Findings({ findings }) {
  if (!findings || findings.length === 0) return null;

  return (
    <section className="findings">
      <h2>What affected the score</h2>
      <ul>
        {findings.map((f) => (
          <li key={f.id} className={`finding sev-${f.severity}`}>
            <div className="finding-head">
              <span className="sev">{SEVERITY_LABEL[f.severity]}</span>
              <span className="finding-label">{f.label}</span>
              {f.points !== 0 && (
                <span className="points">{f.points > 0 ? `+${f.points}` : `\u2212${Math.abs(f.points)}`}</span>
              )}
            </div>
            <p className="finding-meta">
              {SECTION_NAME[f.section]}{f.kind === 'control' ? ' (owner control)' : ''}{f.detail ? `. ${f.detail}` : ''}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
