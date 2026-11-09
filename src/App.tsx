/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { RED_TEAM_SCENARIOS, RedTeamScenario } from './data/scenarios';
import {
  evaluateClinicalPrompt,
  GuardrailConfig,
  DEFAULT_GUARDRAIL_CONFIG,
} from './logic/triageEngine';
import { SplitComparisonView } from './components/SplitComparisonView';
import { PatientClinicalHistory } from './components/PatientClinicalHistory';
import { ScorecardPanel } from './components/ScorecardPanel';
import { TriageSandboxSection } from './components/TriageSandboxSection';
import { MethodologyAndTestsSection } from './components/MethodologyAndTestsSection';
import { Download, Check, Copy, X } from 'lucide-react';

export default function App() {
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>(
    RED_TEAM_SCENARIOS[0].id
  );
  const [guardrailConfig, setGuardrailConfig] = useState<GuardrailConfig>(
    DEFAULT_GUARDRAIL_CONFIG
  );
  const [domainFilter, setDomainFilter] = useState<'ALL' | 'ACLS' | 'PALS' | 'SEPSIS'>('ALL');
  const [showExportModal, setShowExportModal] = useState<boolean>(false);
  const [copiedAudit, setCopiedAudit] = useState<boolean>(false);

  const activeScenario: RedTeamScenario = useMemo(() => {
    return (
      RED_TEAM_SCENARIOS.find((s) => s.id === selectedScenarioId) ||
      RED_TEAM_SCENARIOS[0]
    );
  }, [selectedScenarioId]);

  const filteredScenarios = useMemo(() => {
    if (domainFilter === 'ALL') return RED_TEAM_SCENARIOS;
    return RED_TEAM_SCENARIOS.filter((s) => {
      if (domainFilter === 'ACLS') {
        return s.domain.toLowerCase().includes('acls');
      }
      if (domainFilter === 'PALS') {
        return s.domain.toLowerCase().includes('pals');
      }
      if (domainFilter === 'SEPSIS') {
        return s.domain.toLowerCase().includes('sepsis');
      }
      return true;
    });
  }, [domainFilter]);

  const activeEvaluation = useMemo(() => {
    return evaluateClinicalPrompt(
      activeScenario.adversarialPromptRaw,
      guardrailConfig
    );
  }, [activeScenario, guardrailConfig]);

  const handleToggleGuardrail = (key: keyof GuardrailConfig) => {
    setGuardrailConfig((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSelectScenario = (scenarioId: string) => {
    setSelectedScenarioId(scenarioId);
  };

  const auditReportPayload = useMemo(() => {
    return JSON.stringify(
      {
        application:
          'MedRedTeam: ACLS/PALS & Acute Triage Adversarial Prompt Sandbox',
        principalArchitect: 'Dr. Ibrahim Mohammed (MD)',
        timestampUtc: '2026-11-09T08:47:59Z',
        activeScenario: {
          id: activeScenario.id,
          title: activeScenario.title,
          protocolStandard: activeScenario.protocolStandard,
          attackVector: activeScenario.attackVector,
        },
        guardrailConfiguration: guardrailConfig,
        scorecardVerdict: activeEvaluation.scorecard,
        deterministicGateTrace: activeEvaluation.gateTrace,
        dosingDisambiguationAudit: activeEvaluation.dosingAudit,
      },
      null,
      2
    );
  }, [activeScenario, guardrailConfig, activeEvaluation]);

  const handleExportAuditReport = () => {
    setShowExportModal(true);
    try {
      const blob = new Blob([auditReportPayload], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `medredteam-audit-${activeScenario.id}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      // Fallback to modal inspection in strict iframe sandboxes
    }
  };

  const handleCopyAuditJson = async () => {
    try {
      await navigator.clipboard.writeText(auditReportPayload);
      setCopiedAudit(true);
      setTimeout(() => setCopiedAudit(false), 2000);
    } catch {
      setCopiedAudit(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Top Bar Contract: Strictly 3 zones separated by gap-8 */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200 px-6 py-3.5 flex items-center justify-between gap-8">
        {/* Zone 1: Single text element wordmark */}
        <a
          href="#top"
          className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0"
        >
          MedRedTeam
        </a>

        {/* Zone 2: 4 concise single-line navigation links */}
        <nav
          aria-label="Primary Workspace Navigation"
          className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600"
        >
          <a
            href="#attack-library-section"
            className="hover:text-slate-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Attack Library
          </a>
          <a
            href="#split-comparison-section"
            className="hover:text-slate-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Split Comparison
          </a>
          <a
            href="#scorecard-section"
            className="hover:text-slate-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Scorecard
          </a>
          <a
            href="#triage-sandbox-section"
            className="hover:text-slate-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Triage Sandbox
          </a>
          <a
            href="#methodology-section"
            className="hover:text-slate-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Taxonomy &amp; Tests
          </a>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={handleExportAuditReport}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Audit Report</span>
          </button>
        </div>
      </header>

      {/* Main Workspace Container */}
      <main
        id="top"
        className="flex-1 max-w-[1380px] w-full mx-auto px-4 sm:px-6 py-8 space-y-8"
      >
        {/* Clinical Architecture Banner */}
        <section
          aria-labelledby="app-hero-heading"
          className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div className="max-w-3xl">
              <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-slate-600">
                <span className="font-semibold text-blue-700">
                  Clinical AI Safety &amp; Medical Red-Teaming Suite
                </span>
                <span aria-hidden="true">·</span>
                <span>Principal Architect: Dr. Ibrahim Mohammed (MD)</span>
                <span aria-hidden="true">·</span>
                <span>AHA ACLS / PALS &amp; ESI-1 Triage Standard</span>
              </div>
              <h1
                id="app-hero-heading"
                className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-slate-900 mt-2"
                style={{ textWrap: 'balance' }}
              >
                MedRedTeam: ACLS/PALS &amp; Acute Triage Adversarial Prompt Sandbox
              </h1>
              <p className="text-sm sm:text-base text-slate-600 mt-2.5 leading-relaxed">
                Evaluate how unguarded clinical LLMs fail under diagnostic anchoring, pediatric weight-unit ambiguity, multi-turn sycophancy, and contraindicated ACLS pharmacology—and verify deterministic clinical triage guardrails engineered by{' '}
                <strong className="font-semibold text-slate-900">
                  Dr. Ibrahim Mohammed (MD)
                </strong>
                .
              </p>
            </div>

            {/* Quantitative Architecture Metrics */}
            <div className="grid grid-cols-3 gap-4 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-200 shrink-0 font-mono tabular-nums">
              <div className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-3">
                <div className="text-xs text-slate-500">Attack Scenarios</div>
                <div className="text-2xl font-bold text-slate-900 mt-0.5">
                  05
                </div>
                <div className="text-xs text-slate-500">ACLS / PALS / Sepsis</div>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-3">
                <div className="text-xs text-slate-500">Triage Gates</div>
                <div className="text-2xl font-bold text-slate-900 mt-0.5">
                  04
                </div>
                <div className="text-xs text-slate-500">Deterministic Locks</div>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-3">
                <div className="text-xs text-slate-500">Active Verdict</div>
                <div
                  className={`text-xl font-bold mt-0.5 ${
                    activeEvaluation.scorecard.overallStatus === 'HARDENED_PASS'
                      ? 'text-emerald-700'
                      : 'text-rose-700'
                  }`}
                >
                  {activeEvaluation.scorecard.passedCount}/3 PASS
                </div>
                <div className="text-xs text-slate-500">
                  Score: {activeEvaluation.scorecard.compositeSafetyScore}%
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 1: Adversarial Attack Library (5 Pre-loaded Clinical Red-Team Scenarios) */}
        <section
          id="attack-library-section"
          aria-labelledby="library-heading"
          className="scroll-mt-20 bg-white border border-slate-200 rounded-xl p-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-slate-200">
            <div>
              <div className="text-xs font-mono text-slate-500">
                01. Adversarial Attack Library · 5 Pre-Loaded Clinical Red-Team Scenarios
              </div>
              <h2
                id="library-heading"
                className="text-xl font-bold text-slate-900 mt-1"
              >
                Select a Clinical Adversarial Attack Vector
              </h2>
            </div>

            {/* Interactive Protocol Filter Control */}
            <div
              role="group"
              aria-label="Filter scenarios by clinical protocol"
              className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg self-start sm:self-auto"
            >
              {(
                [
                  { id: 'ALL', label: 'All Scenarios (5)' },
                  { id: 'ACLS', label: 'ACLS / Cardiac' },
                  { id: 'PALS', label: 'PALS / Pediatric' },
                  { id: 'SEPSIS', label: 'Sepsis / Shock' },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setDomainFilter(tab.id)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    domainFilter === tab.id
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* 5 Scenario Selector Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3.5 mt-5">
            {filteredScenarios.map((scenario) => {
              const isSelected = scenario.id === activeScenario.id;
              return (
                <button
                  key={scenario.id}
                  type="button"
                  data-testid={`scenario-btn-${scenario.number}`}
                  onClick={() => handleSelectScenario(scenario.id)}
                  className={`text-left p-4 rounded-xl border transition-all flex flex-col justify-between cursor-pointer ${
                    isSelected
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-slate-50/70 text-slate-900 border-slate-200 hover:border-slate-400 hover:bg-white'
                  }`}
                >
                  <div>
                    <div
                      className={`text-xs font-mono truncate ${
                        isSelected ? 'text-cyan-300' : 'text-slate-500'
                      }`}
                    >
                      {scenario.number} · {scenario.failureModeBadge}
                    </div>
                    <div
                      className={`text-sm font-bold mt-1.5 leading-snug ${
                        isSelected ? 'text-white' : 'text-slate-900'
                      }`}
                    >
                      {scenario.shortTitle}
                    </div>
                    <p
                      className={`text-xs mt-1.5 leading-relaxed ${
                        isSelected ? 'text-slate-300' : 'text-slate-600'
                      }`}
                    >
                      {scenario.domain} · {scenario.patientVitals.ageSex}
                    </p>
                  </div>

                  <div
                    className={`mt-3 pt-2.5 border-t text-xs font-mono flex items-center justify-between ${
                      isSelected
                        ? 'border-slate-700 text-emerald-300'
                        : 'border-slate-200 text-rose-700'
                    }`}
                  >
                    <span>
                      {isSelected ? '● ACTIVE IN SANDBOX' : 'Inspect Trap →'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* SECTION 2A: Patient Clinical History & Longitudinal Vitals Timeline */}
        <PatientClinicalHistory scenario={activeScenario} />

        {/* SECTION 2B: Split-Screen Vulnerability vs Guardrail Comparison */}
        <SplitComparisonView
          scenario={activeScenario}
          evaluation={activeEvaluation}
          guardrailConfig={guardrailConfig}
        />

        {/* SECTION 3: Red-Team Vulnerability Scorecard */}
        <div id="scorecard-section" className="scroll-mt-20">
          <ScorecardPanel
            evaluation={activeEvaluation}
            guardrailConfig={guardrailConfig}
            onToggleGuardrail={handleToggleGuardrail}
            onSetAllGuardrails={setGuardrailConfig}
          />
        </div>

        {/* SECTION 4: Interactive Custom Adversarial Prompt & Triage Sandbox */}
        <TriageSandboxSection />

        {/* SECTION 5: Clinical Red-Teaming Taxonomy & Unit Test Suite */}
        <MethodologyAndTestsSection />
      </main>

      {/* Quiet Clinical Footer */}
      <footer className="bg-white border-t border-slate-200 px-6 py-6 mt-12">
        <div className="max-w-[1380px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            MedRedTeam: ACLS/PALS &amp; Acute Triage Adversarial Prompt Sandbox · Engineered by Dr. Ibrahim Mohammed (MD)
          </div>
          <div className="font-mono">
            For Clinical AI Safety Evaluation &amp; Deterministic Guardrail Verification Only
          </div>
        </div>
      </footer>

      {/* Audit Report Export Modal */}
      {showExportModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="export-modal-title"
          className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4"
        >
          <div className="bg-white border border-slate-200 rounded-xl max-w-2xl w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <div className="text-xs font-mono text-slate-500">
                  Clinical Red-Team Audit Artifact
                </div>
                <h2
                  id="export-modal-title"
                  className="text-lg font-bold text-slate-900"
                >
                  Exported JSON Vulnerability &amp; Guardrail Report
                </h2>
              </div>
              <button
                type="button"
                aria-label="Close export modal"
                onClick={() => setShowExportModal(false)}
                className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <pre className="bg-slate-900 text-slate-100 rounded-lg p-4 text-xs font-mono overflow-x-auto max-h-80 leading-relaxed">
              {auditReportPayload}
            </pre>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleCopyAuditJson}
                className="px-4 py-2 text-xs font-semibold text-slate-900 bg-slate-100 border border-slate-300 rounded-lg hover:bg-slate-200 flex items-center gap-1.5 cursor-pointer"
              >
                {copiedAudit ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Copied to Clipboard</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy JSON</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => setShowExportModal(false)}
                className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
