import React, { useMemo, useState } from 'react';
import {
  GuardrailConfig,
  TriageEvaluationResult,
  DEFAULT_GUARDRAIL_CONFIG,
  computeScenarioVulnerabilityTrend,
} from '../logic/triageEngine';
import { RED_TEAM_SCENARIOS } from '../data/scenarios';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { ShieldCheck, ShieldAlert, Sliders, RotateCcw, BarChart3 } from 'lucide-react';

interface ScorecardPanelProps {
  evaluation: TriageEvaluationResult;
  guardrailConfig: GuardrailConfig;
  onToggleGuardrail: (key: keyof GuardrailConfig) => void;
  onSetAllGuardrails: (config: GuardrailConfig) => void;
}

export const ScorecardPanel: React.FC<ScorecardPanelProps> = ({
  evaluation,
  guardrailConfig,
  onToggleGuardrail,
  onSetAllGuardrails,
}) => {
  const [trendMode, setTrendMode] = useState<'COMPOSITE' | 'DIMENSIONS'>('COMPOSITE');

  const { scorecard, gateTrace } = evaluation;
  const dimensions = [
    scorecard.clinicalSycophancyResistance,
    scorecard.acuteRedFlagEscalation,
    scorecard.doseUnitVerification,
  ];

  const allEnabled =
    guardrailConfig.redFlagOverrideGate &&
    guardrailConfig.sycophancyResistanceLock &&
    guardrailConfig.doseUnitVerificationGate &&
    guardrailConfig.contraindicationFirewall;

  const vulnerabilityTrendData = useMemo(() => {
    return computeScenarioVulnerabilityTrend(RED_TEAM_SCENARIOS, guardrailConfig);
  }, [guardrailConfig]);

  const scenariosPassingAllGates = useMemo(() => {
    return vulnerabilityTrendData.filter(
      (d) => d.overallStatus === 'HARDENED_PASS'
    ).length;
  }, [vulnerabilityTrendData]);

  return (
    <section
      aria-labelledby="scorecard-heading"
      className="bg-white border border-slate-200 rounded-xl p-6"
    >
      {/* Header Row */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-5 border-b border-slate-200">
        <div>
          <div className="text-xs font-mono text-slate-500">
            03. Red-Team Vulnerability Scorecard · Deterministic Safety Verification
          </div>
          <h2
            id="scorecard-heading"
            className="text-xl font-bold text-slate-900 mt-1"
          >
            Clinical Guardrail &amp; Vulnerability Scorecard
          </h2>
          <p className="text-sm text-slate-600 mt-0.5">
            Real-time Pass/Fail audit across Clinical Sycophancy Resistance, Acute Red-Flag Escalation, and Dose Unit Verification. Toggle deterministic gates below to stress-test failure modes.
          </p>
        </div>

        {/* Summary Status Block */}
        <div className="flex flex-wrap items-center gap-4 shrink-0">
          <div className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 flex items-center gap-4">
            <div>
              <div className="text-xs text-slate-500 font-medium">
                Composite Safety Score
              </div>
              <div className="text-2xl font-mono font-semibold text-slate-900 tabular-nums">
                {scorecard.compositeSafetyScore}
                <span className="text-xs font-mono text-slate-500 ml-1">/ 100</span>
              </div>
            </div>
            <div className="h-8 w-px bg-slate-200" aria-hidden="true" />
            <div>
              <div className="text-xs text-slate-500 font-medium">
                Audit Verdict ({scorecard.passedCount}/{scorecard.totalDimensions} Gates)
              </div>
              <div
                data-testid="scorecard-overall-verdict"
                className={`text-sm font-mono font-semibold flex items-center gap-1.5 mt-0.5 ${
                  scorecard.overallStatus === 'HARDENED_PASS'
                    ? 'text-emerald-700'
                    : 'text-rose-700'
                }`}
              >
                {scorecard.overallStatus === 'HARDENED_PASS' ? (
                  <>
                    <ShieldCheck className="w-4 h-4 shrink-0" />
                    <span>● HARDENED PASS</span>
                  </>
                ) : (
                  <>
                    <ShieldAlert className="w-4 h-4 shrink-0" />
                    <span>✖ VULNERABILITY EXPOSED</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3 Core Scorecard Dimensions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-6">
        {dimensions.map((dim, index) => {
          const isPass = dim.status === 'PASS';
          return (
            <div
              key={dim.id}
              data-testid={`scorecard-dim-${dim.id}`}
              className={`border rounded-lg p-5 transition-colors ${
                isPass
                  ? 'bg-emerald-50/35 border-emerald-200'
                  : 'bg-rose-50/50 border-rose-300'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-xs font-mono text-slate-500">
                    Dimension 0{index + 1} · {dim.protocolStandard}
                  </div>
                  <h3 className="text-base font-semibold text-slate-900 mt-1">
                    {dim.label}
                  </h3>
                </div>
                <span
                  data-testid={`status-${dim.id}`}
                  className={`font-mono text-xs font-semibold tabular-nums shrink-0 ${
                    isPass ? 'text-emerald-700' : 'text-rose-700'
                  }`}
                >
                  {isPass ? '● PASS (100%)' : `✖ FAIL (${dim.score}%)`}
                </span>
              </div>

              <p className="text-sm text-slate-700 mt-3 leading-relaxed">
                {dim.finding}
              </p>

              <div className="mt-3 pt-3 border-t border-slate-200/80 text-xs text-slate-600">
                <span className="font-semibold text-slate-800">
                  Risk if unguarded:{' '}
                </span>
                {dim.failureModeIfBreached}
              </div>
            </div>
          );
        })}
      </div>

      {/* Recharts 'Vulnerability Trend' Graph Across All 5 Pre-Loaded Scenarios */}
      <div
        data-testid="vulnerability-trend-section"
        className="mt-6 pt-5 border-t border-slate-200"
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-blue-700 shrink-0" />
              <h3 className="text-base font-bold text-slate-900">
                Vulnerability Trend Across 5 Pre-Loaded Clinical Scenarios
              </h3>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              Compares live Pass/Fail resilience across all 5 adversarial scenarios as deterministic guardrails are toggled ({scenariosPassingAllGates}/5 scenarios currently passing all 3 safety gates).
            </p>
          </div>

          <div
            role="group"
            aria-label="Vulnerability Trend Chart View Mode"
            className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg self-start lg:self-auto shrink-0"
          >
            <button
              type="button"
              onClick={() => setTrendMode('COMPOSITE')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                trendMode === 'COMPOSITE'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Active vs. Unguarded Baseline
            </button>
            <button
              type="button"
              onClick={() => setTrendMode('DIMENSIONS')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                trendMode === 'DIMENSIONS'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              By Safety Dimension (Sycophancy / Red-Flag / Dosing)
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          {/* Recharts Chart Container */}
          <div
            data-testid="vulnerability-trend-chart"
            className="lg:col-span-8 bg-slate-50 border border-slate-200 rounded-lg p-4 h-72"
          >
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={vulnerabilityTrendData}
                margin={{ top: 10, right: 16, left: -12, bottom: 4 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="shortLabel"
                  tick={{ fontSize: 11, fill: '#334155', fontFamily: 'IBM Plex Mono' }}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fontSize: 11, fill: '#475569', fontFamily: 'IBM Plex Mono' }}
                  unit="%"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    color: '#f8fafc',
                    fontSize: '12px',
                    fontFamily: 'IBM Plex Mono',
                  }}
                />
                <Legend
                  wrapperStyle={{
                    fontSize: '11px',
                    fontFamily: 'IBM Plex Mono',
                    paddingTop: '8px',
                  }}
                />
                {trendMode === 'COMPOSITE' ? (
                  <>
                    <Bar
                      dataKey="activeCompositeScore"
                      name="Active Guardrail Score (%)"
                      fill="#059669"
                      radius={[4, 4, 0, 0]}
                      barSize={32}
                      isAnimationActive={false}
                    />
                    <Bar
                      dataKey="unguardedBaselineScore"
                      name="Unguarded LLM Baseline (%)"
                      fill="#e11d48"
                      radius={[4, 4, 0, 0]}
                      barSize={32}
                      isAnimationActive={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="hardenedBaselineScore"
                      name="Hardened Target Benchmark (100%)"
                      stroke="#2563eb"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={{ r: 3.5, fill: '#2563eb' }}
                      isAnimationActive={false}
                    />
                  </>
                ) : (
                  <>
                    <Bar
                      dataKey="sycophancyScore"
                      name="Sycophancy Resistance (%)"
                      fill="#2563eb"
                      radius={[3, 3, 0, 0]}
                      barSize={20}
                      isAnimationActive={false}
                    />
                    <Bar
                      dataKey="redFlagScore"
                      name="Red-Flag Escalation (%)"
                      fill="#059669"
                      radius={[3, 3, 0, 0]}
                      barSize={20}
                      isAnimationActive={false}
                    />
                    <Bar
                      dataKey="dosingScore"
                      name="Dose Unit Verification (%)"
                      fill="#d97706"
                      radius={[3, 3, 0, 0]}
                      barSize={20}
                      isAnimationActive={false}
                    />
                  </>
                )}
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* 5-Scenario Pass/Fail Matrix Table */}
          <div className="lg:col-span-4 bg-slate-50 border border-slate-200 rounded-lg p-4 flex flex-col justify-between">
            <div>
              <div className="text-xs font-mono font-semibold text-slate-700 pb-2 border-b border-slate-200 flex items-center justify-between">
                <span>5-SCENARIO PASS/FAIL MATRIX</span>
                <span className="tabular-nums">
                  {scenariosPassingAllGates}/5 PASS
                </span>
              </div>
              <div className="divide-y divide-slate-200 mt-1">
                {vulnerabilityTrendData.map((row) => {
                  const isPass = row.overallStatus === 'HARDENED_PASS';
                  return (
                    <div
                      key={row.scenarioId}
                      className="py-2.5 flex items-center justify-between gap-2 text-xs font-mono tabular-nums"
                    >
                      <div className="truncate">
                        <span className="font-semibold text-slate-900">
                          {row.shortLabel}
                        </span>
                        <span className="text-slate-500 ml-1.5">
                          ({row.passedDimensionsCount}/3 gates)
                        </span>
                      </div>
                      <span
                        className={`font-semibold shrink-0 ${
                          isPass ? 'text-emerald-700' : 'text-rose-700'
                        }`}
                      >
                        {isPass
                          ? `● PASS (${row.activeCompositeScore}%)`
                          : `✖ FAIL (${row.activeCompositeScore}%)`}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-slate-200 text-xs text-slate-600 leading-snug">
              Toggle any deterministic gate below to observe live cross-scenario vulnerability degradation in the chart.
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Deterministic Triage Gate Controls */}
      <div className="mt-6 pt-5 border-t border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-slate-700 shrink-0" />
            <h3 className="text-sm font-semibold text-slate-900">
              Interactive Deterministic Triage Gates (Toggle to Simulate Guardrail Breach vs. Hardened State)
            </h3>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() =>
                onSetAllGuardrails({
                  redFlagOverrideGate: false,
                  sycophancyResistanceLock: false,
                  doseUnitVerificationGate: false,
                  contraindicationFirewall: false,
                })
              }
              className="px-3 py-1.5 text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200 rounded-md hover:bg-rose-100 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Simulate Unguarded LLM
            </button>
            <button
              type="button"
              onClick={() => onSetAllGuardrails(DEFAULT_GUARDRAIL_CONFIG)}
              disabled={allEnabled}
              className={`px-3 py-1.5 text-xs font-medium rounded-md border transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
                allEnabled
                  ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                  : 'bg-slate-900 text-white border-slate-900 hover:bg-slate-800'
              }`}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restore Hardened Guardrails</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {(
            [
              {
                key: 'redFlagOverrideGate' as const,
                gateCode: 'GATE-01',
                title: 'Acute Red-Flag Escalation Gate',
                subtitle: 'Overrides benign GERD/outpatient framing in STEMI/Sepsis',
              },
              {
                key: 'sycophancyResistanceLock' as const,
                gateCode: 'GATE-02',
                title: 'Multi-Turn Sycophancy Lock',
                subtitle: 'Blocks care-delay validation across multi-turn pushback',
              },
              {
                key: 'doseUnitVerificationGate' as const,
                gateCode: 'GATE-03',
                title: 'Dose Unit & Ceiling Verification',
                subtitle: 'Halts ambiguous kg vs lbs math & enforces 0.30 mg PALS cap',
              },
              {
                key: 'contraindicationFirewall' as const,
                gateCode: 'GATE-04',
                title: 'ACLS Contraindication Firewall',
                subtitle: 'Blocks AV nodal blockers in WPW + AFib & 1:1,000 IV push',
              },
            ] as const
          ).map((item, idx) => {
            const enabled = guardrailConfig[item.key];
            const traceEntry = gateTrace[idx];
            return (
              <button
                key={item.key}
                type="button"
                role="switch"
                aria-checked={enabled}
                aria-label={`Toggle ${item.title}`}
                onClick={() => onToggleGuardrail(item.key)}
                className={`text-left p-3.5 rounded-lg border transition-colors cursor-pointer ${
                  enabled
                    ? 'bg-slate-50 border-slate-300 hover:border-slate-400'
                    : 'bg-rose-50/60 border-rose-300 hover:border-rose-400'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-mono font-semibold text-slate-600">
                    {item.gateCode}
                  </span>
                  <span
                    className={`text-xs font-mono font-semibold ${
                      enabled ? 'text-emerald-700' : 'text-rose-700'
                    }`}
                  >
                    {enabled ? '● ACTIVE' : '✖ DISABLED'}
                  </span>
                </div>
                <div className="text-sm font-semibold text-slate-900 mt-1">
                  {item.title}
                </div>
                <div className="text-xs text-slate-600 mt-1 leading-snug">
                  {item.subtitle}
                </div>
                {traceEntry && traceEntry.triggered && (
                  <div className="mt-2 pt-2 border-t border-slate-200/80 text-xs font-mono text-slate-700">
                    State:{' '}
                    <span
                      className={
                        traceEntry.status === 'INTERCEPTED'
                          ? 'text-emerald-700 font-semibold'
                          : 'text-rose-700 font-semibold'
                      }
                    >
                      {traceEntry.status}
                    </span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};

