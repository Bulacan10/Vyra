export default function SignalForm({ fields, values, onChange, intro }) {
  return (
    <div>
      {intro && <p className="intro">{intro}</p>}
      <div className="fields">
        {fields.map((f) => (
          <label key={f.key} className="field">
            <span className="field-label">{f.label}</span>
            {f.type === 'choice' ? (
              <select value={values[f.key] ?? ''} onChange={(e) => onChange(f.key, e.target.value)}>
                <option value="">Not sure</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            ) : (
              <input
                type="number"
                inputMode="decimal"
                min="0"
                max={f.type === 'percent' ? 100 : undefined}
                step={f.type === 'percent' ? '0.1' : '1'}
                value={values[f.key] ?? ''}
                placeholder={f.placeholder}
                onChange={(e) => onChange(f.key, e.target.value)}
              />
            )}
            {f.hint && <span className="field-hint">{f.hint}</span>}
          </label>
        ))}
      </div>
    </div>
  );
}
