import React, { useState, useEffect } from 'react';
import { RedTeamScenario } from '../data/scenarios';
import {
  PATIENT_CLINICAL_HISTORIES,
  PatientClinicalHistoryProfile,
} from '../data/patientHistories';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { Clock, Activity, FileText } from 'lucide-react';

interface PatientClinicalHistoryProps {
  scenario: RedTeamScenario;
}

export const PatientClinicalHistory: React.FC<PatientClinicalHistoryProps> = ({
  scenario,
}) => {
  const historyProfile: PatientClinicalHistoryProfile =
    PATIENT_CLINICAL_HISTORIES[scenario.id] ||
    PATIENT_CLINICAL_HISTORIES['scenario-1-anchoring'];

  const [selectedStageIndex, setSelectedStageIndex] = useState<number>(
    historyProfile.timeline.length - 1
  );
  const [metricView, setMetricView] = useState<'ALL' | 'HEMODYNAMICS' | 'RESPIRATORY'>('ALL');

  useEffect(() => {
    setSelectedStageIndex(historyProfile.timeline.length - 1);
  }, [scenario.id, historyProfile.timeline.length]);

  const activeStage =
    historyProfile.timeline[selectedStageIndex] ||
    historyProfile.timeline[historyProfile.timeline.length - 1];

  return (
    <section
      id="patient-clinical-history-section"
      aria-labelledby="patient-history-heading"
      data-testid="patient-clinical-history"
      className="scroll-mt-20 bg-white border border-slate-200 rounded-xl p-6 space-y-6"
    >
      {/* Top Section Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-5 border-b border-slate-200">
        <div>
          <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-slate-500">
            <span>02. Patient Clinical History &amp; Physiological Trajectory</span>
            <span aria-hidden="true">·</span>
            <span>Scenario {scenario.number}</span>
            <span aria-hidden="true">·</span>
            <span>{scenario.patientVitals.ageSex}</span>
          </div>
          <h2
            id="patient-history-heading"
            className="text-xl font-bold text-slate-900 mt-1 flex items-center gap-2"
          >
            <Clock className="w-5 h-5 text-blue-700 shrink-0" />
            <span>
              Patient Clinical History: Longitudinal Vitals &amp; Baseline Metrics Timeline
            </span>
          </h2>
          <p className="text-sm text-slate-600 mt-0.5">
            {historyProfile.patientSummary}
          </p>
        </div>

        {/* Interactive Channel Filter Controls */}
        <div
          role="group"
          aria-label="Filter physiological chart channels"
          className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg self-start lg:self-auto shrink-0"
        >
          {(
            [
              { id: 'ALL', label: 'All Vitals' },
              { id: 'HEMODYNAMICS', label: 'Hemodynamics (HR / BP)' },
              { id: 'RESPIRATORY', label: 'SpO2 & Resp Rate' },
            ] as const
          ).map((mode) => (
            <button
              key={mode.id}
              type="button"
              onClick={() => setMetricView(mode.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                metricView === mode.id
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      {/* Baseline Metrics & Medical History 4-Column Strip */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
          <div className="text-xs font-mono font-semibold text-slate-500">
            BASELINE PHYSIOLOGICAL METRICS
          </div>
          <dl className="mt-2 space-y-1 text-xs font-mono tabular-nums">
            <div className="flex justify-between gap-2">
              <dt className="text-slate-500">Baseline BP:</dt>
              <dd className="font-semibold text-slate-900">
                {historyProfile.baselineMetrics.baselineBp}
              </dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-slate-500">Baseline HR:</dt>
              <dd className="font-semibold text-slate-900">
                {historyProfile.baselineMetrics.baselineHr}
              </dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-slate-500">Documented Wt:</dt>
              <dd className="font-semibold text-slate-900">
                {historyProfile.baselineMetrics.baselineWeight}
              </dd>
            </div>
          </dl>
          <div className="mt-2.5 pt-2 border-t border-slate-200 text-xs text-slate-600 leading-snug">
            {historyProfile.baselineMetrics.keyLabOrEcgBaseline}
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
          <div className="text-xs font-mono font-semibold text-slate-500">
            PAST MEDICAL HISTORY (PMH)
          </div>
          <ul className="mt-2 space-y-1 text-xs text-slate-800 leading-relaxed">
            {historyProfile.pastMedicalHistory.map((item, idx) => (
              <li key={idx} className="flex items-start gap-1.5">
                <span aria-hidden="true" className="text-slate-400 font-mono">
                  ·
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
          <div className="text-xs font-mono font-semibold text-slate-500">
            HOME MEDICATIONS &amp; ALLERGIES
          </div>
          <div className="mt-2 text-xs text-slate-800 space-y-1 leading-relaxed">
            <div>
              <span className="font-semibold text-slate-700">Active Meds: </span>
              {historyProfile.homeMedications.join(' · ')}
            </div>
            <div className="pt-1.5 border-t border-slate-200">
              <span className="font-semibold text-rose-800">Allergies: </span>
              <span className="font-mono text-slate-900">
                {historyProfile.allergies}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-rose-50/50 border border-rose-200 rounded-lg p-4 flex flex-col justify-between">
          <div>
            <div className="text-xs font-mono font-semibold text-rose-800">
              CRITICAL DECOMPENSATION DELTA
            </div>
            <p className="text-xs font-mono font-semibold text-slate-900 mt-2 leading-relaxed tabular-nums">
              {historyProfile.criticalDeltaSummary}
            </p>
          </div>
          <div className="mt-2.5 pt-2 border-t border-rose-200/80 text-xs font-mono text-rose-800">
            Acuity Shift: NOMINAL &rarr; {scenario.harmSeverity}
          </div>
        </div>
      </div>

      {/* Interactive Timeline Progression Stepper + Recharts Vitals Trajectory */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left 7 Columns: Interactive 4-Stage Clinical Progression Timeline */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between text-xs font-mono text-slate-600 mb-2.5">
              <span className="font-semibold flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-700" />
                <span>CHRONOLOGICAL CLINICAL PROGRESSION TIMELINE (SELECT NODE):</span>
              </span>
              <span>4 Checkpoints</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
              {historyProfile.timeline.map((point, index) => {
                const isSelected = index === selectedStageIndex;
                const stateColor =
                  point.acuityState === 'NOMINAL'
                    ? 'text-emerald-700'
                    : point.acuityState === 'DRIFTING'
                    ? 'text-amber-700'
                    : 'text-rose-700';

                return (
                  <button
                    key={point.timeOffset}
                    type="button"
                    data-testid={`timeline-node-${index}`}
                    onClick={() => setSelectedStageIndex(index)}
                    className={`text-left p-3 rounded-lg border transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-slate-50 text-slate-900 border-slate-200 hover:border-slate-400 hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-mono tabular-nums">
                      <span
                        className={
                          isSelected ? 'text-cyan-300 font-semibold' : 'text-slate-500 font-semibold'
                        }
                      >
                        {point.timeOffset}
                      </span>
                      <span
                        className={`text-xs font-mono font-semibold ${
                          isSelected ? 'text-amber-300' : stateColor
                        }`}
                      >
                        {point.acuityState === 'NOMINAL'
                          ? '● NOMINAL'
                          : point.acuityState === 'DRIFTING'
                          ? '▲ DRIFT'
                          : '✖ CRIT'}
                      </span>
                    </div>
                    <div
                      className={`text-xs font-bold mt-1 leading-snug ${
                        isSelected ? 'text-white' : 'text-slate-900'
                      }`}
                    >
                      {point.phaseLabel}
                    </div>
                    <div
                      className={`mt-2 pt-2 border-t text-xs font-mono tabular-nums space-y-0.5 ${
                        isSelected
                          ? 'border-slate-700 text-slate-200'
                          : 'border-slate-200 text-slate-600'
                      }`}
                    >
                      <div>HR: {point.hrBpm} bpm</div>
                      <div>
                        BP:{' '}
                        {point.sbpMmHg > 0
                          ? `${point.sbpMmHg}/${point.dbpMmHg}`
                          : 'Non-palp'}
                      </div>
                      <div>SpO2: {point.spo2Pct}%</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Timeline Checkpoint Detail Inspector */}
          <div
            data-testid="timeline-active-stage-detail"
            className="bg-slate-50 border border-slate-200 rounded-lg p-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-200 text-xs font-mono">
              <span className="font-semibold text-slate-900">
                ACTIVE CHECKPOINT: {activeStage.timeOffset} · {activeStage.phaseLabel}
              </span>
              <span className="text-slate-600 tabular-nums">
                HR {activeStage.hrBpm} bpm · BP{' '}
                {activeStage.sbpMmHg > 0
                  ? `${activeStage.sbpMmHg}/${activeStage.dbpMmHg} mmHg (MAP ${activeStage.mapMmHg})`
                  : 'Pulseless / Non-palpable'}{' '}
                · RR {activeStage.rrMin}/min · SpO2 {activeStage.spo2Pct}%
              </span>
            </div>
            <p className="text-sm text-slate-800 mt-2.5 leading-relaxed">
              <span className="font-semibold text-slate-900">Clinical Progression: </span>
              {activeStage.clinicalEvent}
            </p>
            <div className="text-xs font-mono text-slate-700 mt-2 pt-2 border-t border-slate-200/80">
              <span className="font-semibold text-blue-800">
                Biomarker / Pathophysiology Note:{' '}
              </span>
              {activeStage.biomarkerOrEcgNote}
            </div>
          </div>
        </div>

        {/* Right 5 Columns: Longitudinal Vitals Trajectory Chart */}
        <div className="lg:col-span-5 bg-slate-50 border border-slate-200 rounded-lg p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-mono text-slate-600 mb-2">
            <span className="font-semibold flex items-center gap-1.5 text-slate-800">
              <Activity className="w-3.5 h-3.5 text-blue-700" />
              <span>LONGITUDINAL VITALS TRAJECTORY ({scenario.number})</span>
            </span>
            <span>Tabular Telemetry</span>
          </div>

          <div className="h-56 w-full" data-testid="patient-vitals-chart">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={historyProfile.timeline}
                margin={{ top: 10, right: 32, left: -12, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="timeOffset"
                  padding={{ left: 10, right: 16 }}
                  tick={{ fontSize: 11, fill: '#475569', fontFamily: 'IBM Plex Mono' }}
                />
                <YAxis
                  domain={[0, 230]}
                  tick={{ fontSize: 11, fill: '#475569', fontFamily: 'IBM Plex Mono' }}
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
                    paddingTop: '6px',
                  }}
                />
                {(metricView === 'ALL' || metricView === 'HEMODYNAMICS') && (
                  <>
                    <Line
                      type="monotone"
                      dataKey="hrBpm"
                      name="Heart Rate (bpm)"
                      stroke="#d97706"
                      strokeWidth={2.5}
                      dot={{ r: 4, fill: '#d97706' }}
                      isAnimationActive={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="sbpMmHg"
                      name="Systolic BP (mmHg)"
                      stroke="#dc2626"
                      strokeWidth={2}
                      dot={{ r: 3.5, fill: '#dc2626' }}
                      isAnimationActive={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="mapMmHg"
                      name="MAP (mmHg)"
                      stroke="#2563eb"
                      strokeWidth={2}
                      strokeDasharray="4 4"
                      dot={{ r: 3, fill: '#2563eb' }}
                      isAnimationActive={false}
                    />
                  </>
                )}
                {(metricView === 'ALL' || metricView === 'RESPIRATORY') && (
                  <Line
                    type="monotone"
                    dataKey="spo2Pct"
                    name="SpO2 (%)"
                    stroke="#059669"
                    strokeWidth={2}
                    dot={{ r: 3.5, fill: '#059669' }}
                    isAnimationActive={false}
                  />
                )}
                {metricView === 'RESPIRATORY' && (
                  <Line
                    type="monotone"
                    dataKey="rrMin"
                    name="Resp Rate (/min)"
                    stroke="#7c3aed"
                    strokeWidth={2}
                    dot={{ r: 3.5, fill: '#7c3aed' }}
                    isAnimationActive={false}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-2 pt-2 border-t border-slate-200 flex items-center justify-between text-xs font-mono text-slate-500">
            <span>Baseline &rarr; Acute Decompensation</span>
            <span>Click timeline cards to inspect stage notes</span>
          </div>
        </div>
      </div>
    </section>
  );
};
