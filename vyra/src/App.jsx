import { useMemo, useState } from 'react';
import { computeTrustScore } from './scoring/index.js';
import { SOCIAL_FIELDS, COMMUNITY_FIELDS, parseForm } from './fields.js';
import ContractTab from './components/ContractTab.jsx';
import SignalForm from './components/SignalForm.jsx';
import Verdict from './components/Verdict.jsx';
import Findings from './components/Findings.jsx';

const TABS = [
  { id: 'contract', label: 'Contract' },
  { id: 'social', label: 'Social' },
  { id: 'community', label: 'Community' },
];

export default function App() {
  const [tab, setTab] = useState('contract');
  const [contract, setContract] = useState(null);
  const [socialForm, setSocialForm] = useState({});
  const [communityForm, setCommunityForm] = useState({});

  const result = useMemo(
    () =>
      computeTrustScore({
        contract,
        social: parseForm(SOCIAL_FIELDS, socialForm),
        community: parseForm(COMMUNITY_FIELDS, communityForm),
      }),
    [contract, socialForm, communityForm]
  );

  const hasInput = contract || Object.keys(socialForm).length || Object.keys(communityForm).length;

  function clearAll() {
    setContract(null);
    setSocialForm({});
    setCommunityForm({});
  }

  return (
    <div className="app">
      <header className="top">
        <h1>Vyra</h1>
        <p>Check how much a Web3 project can be trusted before you put money in.</p>
      </header>

      <main className="layout">
        <div className="inputs">
          <div className="tabs" role="tablist" aria-label="Signal groups">
            {TABS.map((t) => (
              <button key={t.id} role="tab" id={`tab-${t.id}`} aria-selected={tab === t.id}
                aria-controls={`panel-${t.id}`} className={tab === t.id ? 'tab active' : 'tab'}
                onClick={() => setTab(t.id)}>
                {t.label}
              </button>
            ))}
          </div>

          <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`} className="panel">
            {tab === 'contract' && <ContractTab signals={contract} onSignals={setContract} />}
            {tab === 'social' && (
              <SignalForm
                fields={SOCIAL_FIELDS}
                values={socialForm}
                onChange={(k, v) => setSocialForm((f) => ({ ...f, [k]: v }))}
                intro="Look at the project's main X account. Leave anything you cannot find as it is; Vyra only scores what you enter."
              />
            )}
            {tab === 'community' && (
              <SignalForm
                fields={COMMUNITY_FIELDS}
                values={communityForm}
                onChange={(k, v) => setCommunityForm((f) => ({ ...f, [k]: v }))}
                intro="Check the project's Telegram or Discord. Leave anything you cannot find as it is."
              />
            )}
          </div>

          {hasInput && (
            <button type="button" className="link" onClick={clearAll}>Clear everything</button>
          )}
        </div>

        <aside className="results">
          <Verdict result={result} />
          <Findings findings={result?.findings} />
        </aside>
      </main>
    </div>
  );
}
