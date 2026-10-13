import { useState } from 'react';
import { CHAINS, fetchContractSignals } from '../providers/goplus.js';
import { DEMO_CONTRACTS } from '../providers/demo.js';
import { CONTRACT_LABELS, formatSignal } from '../fields.js';

export default function ContractTab({ signals, onSignals }) {
  const [chain, setChain] = useState('ethereum');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function scan(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      onSignals(await fetchContractSignals(chain, address));
    } catch (err) {
      setError(
        err instanceof TypeError
          ? 'Could not reach the scan service. Check your connection, or try a sample below.'
          : err.message
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <p className="intro">
        Paste a token contract address to scan it for traps such as honeypots, hidden owners and locked liquidity.
      </p>
      <form className="scan" onSubmit={scan}>
        <label className="field">
          <span className="field-label">Chain</span>
          <select value={chain} onChange={(e) => setChain(e.target.value)}>
            {Object.entries(CHAINS).map(([key, c]) => (
              <option key={key} value={key}>{c.label}</option>
            ))}
          </select>
        </label>
        <label className="field grow">
          <span className="field-label">Contract address</span>
          <input type="text" value={address} placeholder="0x..." spellCheck="false"
            onChange={(e) => setAddress(e.target.value)} />
        </label>
        <button type="submit" className="primary" disabled={loading || !address.trim()}>
          {loading ? 'Scanning...' : 'Scan contract'}
        </button>
      </form>
      {error && <p className="error" role="alert">{error}</p>}

      <div className="samples">
        <span className="field-hint">No address handy? Load a sample:</span>
        {Object.entries(DEMO_CONTRACTS).map(([key, d]) => (
          <button key={key} type="button" className="chip" onClick={() => { setError(''); onSignals(d.signals); }}>
            {d.label}
          </button>
        ))}
      </div>

      {signals && (
        <>
          <label className="field audit">
            <span className="field-label">Audit reported</span>
            <select
              value={signals.hasAudit === null || signals.hasAudit === undefined ? '' : signals.hasAudit ? 'yes' : 'no'}
              onChange={(e) => onSignals({ ...signals, hasAudit: e.target.value === '' ? null : e.target.value === 'yes' })}
            >
              <option value="">Not sure</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
            <span className="field-hint">Scans cannot see audits, so enter this yourself.</span>
          </label>
          <dl className="signals">
            {Object.entries(CONTRACT_LABELS).map(([key, label]) => (
              <div key={key} className="signal">
                <dt>{label}</dt>
                <dd className={signals[key] == null ? 'muted' : ''}>{formatSignal(key, signals[key])}</dd>
              </div>
            ))}
          </dl>
        </>
      )}
    </div>
  );
}
