import React, { useState } from 'react';
import { RedTeamScenario } from '../data/scenarios';
import { GuardrailConfig, TriageEvaluationResult } from '../logic/triageEngine';
import {
  AlertTriangle,
  ShieldCheck,
  Terminal,
  Activity,
  Scale,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

interface SplitComparisonViewProps {
  scenario: RedTeamScenario;
  evaluation: TriageEvaluationResult;
  guardrailConfig: GuardrailConfig;
}

export const SplitComparisonView: React.FC<SplitComparisonViewProps> = ({
  scenario,
  evaluation,
  guardrailConfig,
}) => {
  const [showSystemPromptCode, setShowSystemPromptCode] = useState<boolean>(true);

  const anyGateDisabled =
    !guardrailConfig.redFlagOverrideGate ||
    !guardrailConfig.sycophancyResistanceLock ||
    !guardrailConfig.doseUnitVerificationGate ||
    !guardrailConfig.contraindicationFirewall;

  return (
    <div className="space-y-6">
      {/* Clinical Vignette & Adversarial Prompt Header Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-slate-500">
              <span>Scenario {scenario.number}</span>
              <span aria-hidden="true">·</span>
              <span>{scenario.domain}</span>
              <span aria-hidden="true">·</span>
              <span>{scenario.protocolStandard}</span>
            </div>
            <h2
              data-testid="active-scenario-title"
              className="text-xl font-bold text-slate-900 mt-1"
            >
              {scenario.title}
            </h2>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono shrink-0">
            <span className="text-rose-700 font-semibold">
              ▲ {scenario.harmSeverity}
            </span>
            <span aria-hidden="true" className="text-slate-300">
              |
            </span>
            <span className="text-slate-700 font-semibold">
              Acuity: {evaluation.acuityLevel}
            </span>
          </div>
        </div>

        {/* Bedside Patient Telemetry Strip */}
        <div className="mt-4 bg-slate-900 text-slate-100 rounded-lg p-4">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2.5">
            <span className="flex items-center gap-1.5 text-slate-300 font-medium">
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              <span>BEDSIDE PHYSIOLOGICAL TELEMETRY &amp; PRESENTATION</span>
            </span>
            <span>PATIENT: {scenario.patientVitals.ageSex}</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2 border-t border-slate-800 font-mono tabular-nums">
            <div>
              <div className="text-xs text-slate-400">HEART RATE</div>
              <div className="text-sm font-semibold text-amber-400 mt-0.5">
                {scenario.patientVitals.hr}
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-400">BLOOD PRESSURE</div>
              <div className="text-sm font-semibold text-rose-400 mt-0.5">
                {scenario.patientVitals.bp}
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-400">RESP RATE</div>
              <div className="text-sm font-semibold text-cyan-300 mt-0.5">
                {scenario.patientVitals.rr}
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-400">SpO2</div>
              <div className="text-sm font-semibold text-emerald-400 mt-0.5">
                {scenario.patientVitals.spo2}
              </div>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <div className="text-xs text-slate-400">CLINICAL / ECG</div>
              <div className="text-xs font-medium text-slate-200 mt-0.5 leading-snug">
                {scenario.patientVitals.tempOrEcg}
              </div>
            </div>
          </div>
        </div>

        {/* Adversarial Prompt / Multi-Turn Transcript */}
        <div className="mt-4">
          <div className="text-xs font-mono font-semibold text-slate-600 mb-2">
            ADVERSARIAL INPUT TRANSCRIPT ({scenario.multiTurnTranscript.length}{' '}
            {scenario.multiTurnTranscript.length === 1 ? 'Turn' : 'Turns'}):
          </div>
          <div className="space-y-2.5">
            {scenario.multiTurnTranscript.map((turn) => (
              <div
                key={turn.turnNumber}
                className="bg-slate-50 border border-slate-200 rounded-lg p-3.5"
              >
                <div className="flex items-center justify-between text-xs font-mono text-slate-500 mb-1">
                  <span className="font-semibold text-slate-800">
                    {turn.label}
                  </span>
                  <span>Turn 0{turn.turnNumber}</span>
                </div>
                <p className="text-sm text-slate-900 font-medium leading-relaxed">
                  &ldquo;{turn.content}&rdquo;
                </p>
                {turn.annotation && (
                  <p className="text-xs text-slate-600 mt-2 pt-2 border-t border-slate-200/80">
                    <span className="font-semibold text-slate-700">
                      Adversarial Mechanism:{' '}
                    </span>
                    {turn.annotation}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Pediatric Weight-Based Dosing Disambiguation Audit Table (if applicable) */}
        {evaluation.dosingAudit && (
          <div className="mt-4 bg-amber-50/70 border border-amber-300 rounded-lg p-4">
            <div className="flex items-center gap-2 text-xs font-mono font-semibold text-amber-900">
              <Scale className="w-4 h-4 text-amber-700 shrink-0" />
              <span>
                DETERMINISTIC PALS WEIGHT-UNIT DISAMBIGUATION AUDIT (INPUT:{' '}
                &ldquo;{evaluation.dosingAudit.rawWeightInput}&rdquo;)
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mt-3 font-mono tabular-nums text-xs">
              <div className="bg-white border border-amber-200 rounded p-2.5">
                <div className="text-slate-500">If Interpreted as Pounds</div>
                <div className="text-sm font-semibold text-emerald-700 mt-0.5">
                  {evaluation.dosingAudit.numericValue} lbs ={' '}
                  {evaluation.dosingAudit.weightIfLbsConvertedToKg} kg
                </div>
                <div className="text-slate-600 mt-0.5">
                  Safe IM Dose: {evaluation.dosingAudit.safeDoseIfLbsMg} mg (
                  {evaluation.dosingAudit.safeDoseIfLbsMg} mL)
                </div>
              </div>
              <div className="bg-white border border-amber-200 rounded p-2.5">
                <div className="text-slate-500">If Blindly Assumed Kilograms</div>
                <div className="text-sm font-semibold text-rose-700 mt-0.5">
                  {evaluation.dosingAudit.weightIfKg} kg &rarr;{' '}
                  {evaluation.dosingAudit.overdoseIfAssumedKgMg} mg
                </div>
                <div className="text-rose-700 mt-0.5">
                  {evaluation.dosingAudit.overdoseMultiplier}x Overdose Error
                </div>
              </div>
              <div className="bg-white border border-amber-200 rounded p-2.5">
                <div className="text-slate-500">PALS Prepubertal Max Cap</div>
                <div className="text-sm font-semibold text-slate-900 mt-0.5">
                  0.30 mg (0.30 mL) IM
                </div>
                <div className="text-slate-600 mt-0.5">
                  1 mg/mL (1:1,000) Concentration
                </div>
              </div>
              <div className="bg-white border border-amber-200 rounded p-2.5">
                <div className="text-slate-500">Unit Verification Status</div>
                <div
                  className={`text-sm font-semibold mt-0.5 ${
                    guardrailConfig.doseUnitVerificationGate
                      ? 'text-emerald-700'
                      : 'text-rose-700'
                  }`}
                >
                  {guardrailConfig.doseUnitVerificationGate
                    ? '● LOCKED & VERIFIED'
                    : '✖ UNVERIFIED KG ASSUMED'}
                </div>
                <div className="text-slate-600 mt-0.5">
                  Gate: GATE-03-DOSING
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Split-Screen Comparison Grid: Left (Vulnerable LLM) vs Right (Hardened Guardrail) */}
      <div
        id="split-comparison-section"
        className="scroll-mt-20 grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch"
      >
        {/* LEFT PANEL: Standard Unguarded LLM */}
        <article
          aria-labelledby="left-panel-heading"
          data-testid="left-vulnerability-panel"
          className="bg-white border border-rose-300 rounded-xl p-6 flex flex-col justify-between"
        >
          <div>
            {/* Panel Header */}
            <div className="pb-4 border-b border-rose-200">
              <div className="flex items-center justify-between gap-2 text-xs font-mono text-rose-700 font-semibold">
                <span className="flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>LEFT PANEL · UNGUARDED BASELINE LLM</span>
                </span>
                <span>✖ VULNERABLE</span>
              </div>
              <h3
                id="left-panel-heading"
                className="text-lg font-bold text-slate-900 mt-1.5"
              >
                {scenario.unguardedPanel.modelLabel}
              </h3>
              <div className="text-xs font-mono text-rose-800 mt-1">
                Highlighted Failure Mode:{' '}
                <span className="font-semibold underline">
                  {scenario.unguardedPanel.highlightedFailureMode}
                </span>
              </div>
            </div>

            {/* Baseline System Prompt */}
            <div className="mt-4">
              <div className="text-xs font-mono text-slate-500 mb-1.5">
                Naive System Prompt (Vulnerable to RLHF Sycophancy &amp; Anchoring):
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs font-mono text-slate-700 leading-relaxed">
                {scenario.unguardedPanel.systemPrompt}
              </div>
            </div>

            {/* Unguarded LLM Output */}
            <div className="mt-4">
              <div className="text-xs font-mono font-semibold text-rose-800 mb-1.5">
                Unguarded Model Output (Fails Clinical Red-Team Audit):
              </div>
              <div className="bg-rose-50/40 border border-rose-200 rounded-lg p-4 text-sm text-slate-900 whitespace-pre-line leading-relaxed">
                {scenario.unguardedPanel.outputTranscript}
              </div>
            </div>

            {/* Annotated Vulnerable Spans */}
            <div className="mt-5">
              <div className="text-xs font-mono font-semibold text-slate-700 mb-2">
                ANNOTATED FAILURE SPANS &amp; PATHOPHYSIOLOGICAL HARM:
              </div>
              <div className="space-y-3">
                {scenario.unguardedPanel.vulnerableSpans.map((span, idx) => (
                  <div
                    key={idx}
                    className="bg-rose-50/70 border border-rose-200 rounded-lg p-3.5"
                  >
                    <div className="flex items-center justify-between gap-2 text-xs font-mono text-rose-800 font-semibold">
                      <span>
                        Span 0{idx + 1} · {span.failureCategory}
                      </span>
                      <span className="flex items-center gap-1">
                        <XCircle className="w-3.5 h-3.5" />
                        <span>BREACH</span>
                      </span>
                    </div>
                    <blockquote className="text-xs font-mono text-rose-950 bg-white/90 border border-rose-200 rounded p-2 mt-2">
                      &ldquo;{span.quote}&rdquo;
                    </blockquote>
                    <p className="text-xs text-slate-800 mt-2 leading-relaxed">
                      <span className="font-semibold">Clinical Harm: </span>
                      {span.clinicalConsequence}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Root Cause Summary Footer */}
          <div className="mt-5 pt-4 border-t border-slate-200">
            <div className="text-xs font-mono font-semibold text-slate-700">
              WHY THE STANDARD LLM FAILED:
            </div>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              {scenario.unguardedPanel.rootCauseAnalysis}
            </p>
          </div>
        </article>

        {/* RIGHT PANEL: Hardened Clinical System Prompt by Dr. Ibrahim Mohammed (MD) */}
        <article
          aria-labelledby="right-panel-heading"
          data-testid="right-guardrail-panel"
          className={`bg-white border rounded-xl p-6 flex flex-col justify-between ${
            anyGateDisabled ? 'border-amber-400' : 'border-emerald-300'
          }`}
        >
          <div>
            {/* Panel Header */}
            <div className="pb-4 border-b border-emerald-200">
              <div className="flex items-center justify-between gap-2 text-xs font-mono text-emerald-800 font-semibold">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span>RIGHT PANEL · DETERMINISTIC CLINICAL GUARDRAIL</span>
                </span>
                <span>
                  {anyGateDisabled
                    ? '▲ CUSTOM GATE OVERRIDE'
                    : '● HARDENED ENFORCED'}
                </span>
              </div>
              <h3
                id="right-panel-heading"
                className="text-lg font-bold text-slate-900 mt-1.5"
              >
                {scenario.hardenedPanel.authorCredit}
              </h3>
              <div className="text-xs font-mono text-emerald-800 mt-1">
                Defense Architecture: Deterministic Triage Gates · Sycophancy Lock · ACLS/PALS Overrides
              </div>
            </div>

            {/* Hardened System Prompt Architecture */}
            <div className="mt-4">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-mono text-slate-600 flex items-center gap-1.5 font-semibold">
                  <Terminal className="w-3.5 h-3.5 text-slate-700" />
                  <span>Engineered Hardened System Prompt Specification:</span>
                </span>
                <button
                  type="button"
                  onClick={() => setShowSystemPromptCode((prev) => !prev)}
                  className="text-xs font-mono text-blue-700 hover:underline cursor-pointer"
                >
                  {showSystemPromptCode ? 'Collapse Spec' : 'Expand Spec'}
                </button>
              </div>
              {showSystemPromptCode && (
                <pre className="bg-slate-900 text-slate-100 rounded-lg p-3.5 text-xs font-mono whitespace-pre-wrap leading-relaxed overflow-x-auto">
                  {scenario.hardenedPanel.systemPromptArchitecture}
                </pre>
              )}
            </div>

            {/* Active Deterministic Gate Execution Trace */}
            <div className="mt-4">
              <div className="text-xs font-mono font-semibold text-slate-700 mb-2">
                DETERMINISTIC TRIAGE GATE INTERCEPT TRACE:
              </div>
              <div className="space-y-2">
                {evaluation.gateTrace
                  .filter((g) => g.triggered)
                  .map((gate) => {
                    const isIntercepted = gate.status === 'INTERCEPTED';
                    return (
                      <div
                        key={gate.gateId}
                        className={`border rounded-lg p-3 text-xs ${
                          isIntercepted
                            ? 'bg-emerald-50/50 border-emerald-200'
                            : 'bg-rose-50/60 border-rose-300'
                        }`}
                      >
                        <div className="flex items-center justify-between font-mono font-semibold">
                          <span className="text-slate-900">
                            {gate.gateId} · {gate.gateName}
                          </span>
                          <span
                            className={`flex items-center gap-1 ${
                              isIntercepted
                                ? 'text-emerald-700'
                                : 'text-rose-700'
                            }`}
                          >
                            {isIntercepted ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>INTERCEPTED</span>
                              </>
                            ) : (
                              <>
                                <XCircle className="w-3.5 h-3.5" />
                                <span>BYPASSED (GATE OFF)</span>
                              </>
                            )}
                          </span>
                        </div>
                        <p className="text-slate-700 mt-1 leading-snug">
                          {gate.actionTaken}
                        </p>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Hardened Clinical Output */}
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs font-mono font-semibold mb-1.5">
                <span
                  className={
                    anyGateDisabled ? 'text-amber-800' : 'text-emerald-800'
                  }
                >
                  {anyGateDisabled
                    ? 'Live Output with Disabled Guardrail Gates:'
                    : 'Hardened Clinical Model Output (Dr. Ibrahim Mohammed Protocol):'}
                </span>
              </div>
              <div
                data-testid="hardened-output-box"
                className={`border rounded-lg p-4 text-sm whitespace-pre-line leading-relaxed ${
                  anyGateDisabled
                    ? 'bg-amber-50/50 border-amber-300 text-slate-900'
                    : 'bg-emerald-50/35 border-emerald-200 text-slate-900'
                }`}
              >
                {anyGateDisabled
                  ? evaluation.synthesizedOutput
                  : scenario.hardenedPanel.hardenedOutput}
              </div>
            </div>
          </div>

          {/* Clinical Rationale Footer */}
          <div className="mt-5 pt-4 border-t border-slate-200">
            <div className="text-xs font-mono font-semibold text-slate-700">
              CLINICAL ENGINEERING RATIONALE (DR. IBRAHIM MOHAMMED, MD):
            </div>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              {scenario.hardenedPanel.clinicalRationale}
            </p>
          </div>
        </article>
      </div>
    </div>
  );
};
