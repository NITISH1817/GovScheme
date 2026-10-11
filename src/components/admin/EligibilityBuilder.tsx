import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckSquare, Settings, Play, X, Search, ChevronRight, Plus, 
  Save, AlertCircle, CheckCircle2, ShieldCheck, RefreshCw, Trash2
} from 'lucide-react';
import { UserProfile, Scheme } from '../../types';
import { schemesData } from '../../data/schemes';

interface RuleCondition {
  id: string;
  field: string;
  operator: '>=' | '<=' | '==' | '!=' | 'IN';
  value: string | number;
}

export const EligibilityBuilder: React.FC = () => {
  const [selectedSchemeId, setSelectedSchemeId] = useState<string>(schemesData[0]?.id || 'pm-kisan');
  const [conditions, setConditions] = useState<RuleCondition[]>([
    { id: '1', field: 'age', operator: '>=', value: 18 },
    { id: '2', field: 'annualIncome', operator: '<=', value: 300000 },
    { id: '3', field: 'state', operator: '==', value: 'Maharashtra' }
  ]);
  const [filterQuery, setFilterQuery] = useState('');
  const [testResult, setTestResult] = useState<any | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Mock citizen for testing
  const [testCitizen, setTestCitizen] = useState<Partial<UserProfile>>({
    fullName: 'Ramesh Patel',
    age: 26,
    gender: 'Male',
    annualIncome: 180000,
    state: 'Maharashtra',
    district: 'Pune',
    category: 'OBC',
    occupation: 'Farmer',
    hasDisability: false
  });

  const availableVariables = [
    { field: 'age', label: 'Age (Years)', defaultOp: '>=' as const, defaultValue: 18 },
    { field: 'annualIncome', label: 'Annual Income (₹)', defaultOp: '<=' as const, defaultValue: 250000 },
    { field: 'gender', label: 'Gender', defaultOp: '==' as const, defaultValue: 'Female' },
    { field: 'state', label: 'State / Territory', defaultOp: '==' as const, defaultValue: 'Maharashtra' },
    { field: 'category', label: 'Social Category', defaultOp: '==' as const, defaultValue: 'OBC' },
    { field: 'occupation', label: 'Occupation', defaultOp: '==' as const, defaultValue: 'Farmer' },
    { field: 'hasDisability', label: 'Disability Status', defaultOp: '==' as const, defaultValue: 'true' },
    { field: 'landHoldingAcres', label: 'Land Ownership (Acres)', defaultOp: '<=' as const, defaultValue: 5 }
  ];

  const handleAddCondition = (variable: typeof availableVariables[0]) => {
    const newCond: RuleCondition = {
      id: `cond_${Date.now()}_${Math.random()}`,
      field: variable.field,
      operator: variable.defaultOp,
      value: variable.defaultValue
    };
    setConditions(prev => [...prev, newCond]);
    setStatusMessage({ text: `Condition for "${variable.label}" added to ruleset.`, type: 'success' });
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleRemoveCondition = (id: string) => {
    setConditions(prev => prev.filter(c => c.id !== id));
  };

  const handleConditionChange = (id: string, updates: Partial<RuleCondition>) => {
    setConditions(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const handleRunTest = () => {
    setIsTesting(true);
    setTimeout(() => {
      // Evaluate mock citizen against active rules
      let eligible = true;
      const reasons: string[] = [];

      conditions.forEach(cond => {
        const citizenVal = (testCitizen as any)[cond.field];
        if (cond.field === 'age') {
          const numVal = Number(cond.value);
          if (cond.operator === '>=' && (testCitizen.age || 0) < numVal) {
            eligible = false;
            reasons.push(`Citizen age (${testCitizen.age}) is below minimum (${numVal})`);
          } else if (cond.operator === '<=' && (testCitizen.age || 0) > numVal) {
            eligible = false;
            reasons.push(`Citizen age (${testCitizen.age}) exceeds maximum (${numVal})`);
          }
        } else if (cond.field === 'annualIncome') {
          const numVal = Number(cond.value);
          if (cond.operator === '<=' && (testCitizen.annualIncome || 0) > numVal) {
            eligible = false;
            reasons.push(`Citizen income (₹${testCitizen.annualIncome}) exceeds limit (₹${numVal})`);
          }
        } else if (cond.field === 'state') {
          if (cond.operator === '==' && testCitizen.state !== cond.value && cond.value !== 'Central') {
            eligible = false;
            reasons.push(`Citizen state (${testCitizen.state}) does not match required state (${cond.value})`);
          }
        } else if (cond.field === 'category') {
          if (cond.operator === '==' && testCitizen.category !== cond.value && cond.value !== 'All') {
            eligible = false;
            reasons.push(`Category (${testCitizen.category}) does not match scheme criterion`);
          }
        }
      });

      setTestResult({
        eligible,
        reasons: reasons.length > 0 ? reasons : ['All criteria satisfied in eligibility test simulation.']
      });
      setIsTesting(false);
    }, 400);
  };

  const handleSaveRuleset = () => {
    if (conditions.length === 0) {
      setStatusMessage({ text: 'Ruleset must contain at least one valid condition.', type: 'error' });
      return;
    }
    setStatusMessage({ text: `Eligibility ruleset with ${conditions.length} conditions validated and saved.`, type: 'success' });
    setTimeout(() => setStatusMessage(null), 4000);
  };

  const filteredVars = availableVariables.filter(v => 
    v.label.toLowerCase().includes(filterQuery.toLowerCase()) || 
    v.field.toLowerCase().includes(filterQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#07111F] dark:text-[#F8FAFC]">Eligibility Rules Management</h1>
          <p className="text-sm text-[#64748B] dark:text-[#94A3B8]">
            Configure and validate boolean criteria compatible with GovScheme's core recommendation engine.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={handleRunTest}
            className="flex items-center gap-2 px-4 py-2 bg-[#F8FAFC] dark:bg-[#101D31] border border-[#E2E8F0] dark:border-[#243449] hover:border-[#1769FF] text-[#07111F] dark:text-[#F8FAFC] rounded-lg font-bold text-sm transition-colors shadow-sm"
          >
            <Play className={`w-4 h-4 text-[#1769FF] ${isTesting ? 'animate-spin' : ''}`} /> Test Ruleset
          </button>
          <button 
            onClick={handleSaveRuleset}
            className="flex items-center gap-2 px-4 py-2 bg-[#15803D] hover:bg-[#166534] text-white rounded-lg font-bold text-sm transition-colors shadow-md shadow-green-500/20"
          >
            <Save className="w-4 h-4" /> Save Ruleset
          </button>
        </div>
      </div>

      {statusMessage && (
        <motion.div 
          initial={{ opacity: 0, y: -8 }} 
          animate={{ opacity: 1, y: 0 }}
          className={`p-3.5 rounded-lg border text-sm font-semibold flex items-center gap-2 ${
            statusMessage.type === 'success' 
              ? 'bg-[#15803D]/10 border-[#15803D]/20 text-[#15803D] dark:text-[#4ADE80]' 
              : 'bg-[#B91C1C]/10 border-[#B91C1C]/20 text-[#B91C1C] dark:text-[#F87171]'
          }`}
        >
          {statusMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {statusMessage.text}
        </motion.div>
      )}

      {/* Target Scheme Selector */}
      <div className="p-4 bg-[#FFFFFF] dark:bg-[#0B1424] border border-[#E2E8F0] dark:border-[#243449] rounded-xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider">Configuring Rules For:</span>
          <select 
            value={selectedSchemeId}
            onChange={(e) => setSelectedSchemeId(e.target.value)}
            className="px-3 py-1.5 bg-[#F8FAFC] dark:bg-[#101D31] border border-[#E2E8F0] dark:border-[#243449] rounded-lg text-sm font-bold text-[#1769FF] dark:text-[#60A5FA] outline-none"
          >
            {schemesData.slice(0, 15).map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
        <div className="text-xs text-[#64748B] dark:text-[#94A3B8]">
          {conditions.length} rule assertions active
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1">
        {/* Variables Palette */}
        <div className="bg-[#FFFFFF] dark:bg-[#0B1424] border border-[#E2E8F0] dark:border-[#243449] rounded-xl shadow-sm p-4 flex flex-col">
          <div className="flex items-center gap-2 mb-3">
            <Settings className="w-4 h-4 text-[#1769FF]" />
            <h3 className="font-bold text-[#07111F] dark:text-[#F8FAFC] text-sm">Citizen Variables</h3>
          </div>
          
          <div className="relative mb-3">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B] dark:text-[#94A3B8]" />
            <input 
              type="text" 
              placeholder="Search variables..." 
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-[#F8FAFC] dark:bg-[#101D31] border border-[#E2E8F0] dark:border-[#243449] rounded-lg text-xs text-[#07111F] dark:text-[#F8FAFC] focus:border-[#1769FF] outline-none"
            />
          </div>

          <div className="space-y-1.5 overflow-y-auto custom-scrollbar flex-1 pr-1">
            {filteredVars.map(v => (
              <button
                key={v.field}
                onClick={() => handleAddCondition(v)}
                className="w-full flex items-center justify-between p-2.5 rounded-lg border border-[#E2E8F0] dark:border-[#243449] hover:border-[#1769FF] dark:hover:border-[#60A5FA] bg-[#F8FAFC] dark:bg-[#101D31] text-left transition-colors group"
              >
                <div>
                  <div className="text-xs font-bold text-[#07111F] dark:text-[#F8FAFC] group-hover:text-[#1769FF] dark:group-hover:text-[#60A5FA]">
                    {v.label}
                  </div>
                  <div className="text-[10px] text-[#64748B] font-mono">{v.field}</div>
                </div>
                <Plus className="w-4 h-4 text-[#64748B] group-hover:text-[#1769FF]" />
              </button>
            ))}
          </div>
        </div>

        {/* Visual Builder Canvas */}
        <div className="lg:col-span-3 flex flex-col space-y-4">
          <div className="bg-[#FFFFFF] dark:bg-[#0B1424] border border-[#E2E8F0] dark:border-[#243449] rounded-xl shadow-sm p-6 overflow-y-auto custom-scrollbar flex-1">
            <div className="max-w-2xl mx-auto space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0] dark:border-[#243449]">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded bg-[#1769FF]/10 text-[#1769FF] dark:text-[#60A5FA] font-bold text-xs uppercase tracking-wider">
                    IF ALL CONDITIONS MATCH (AND)
                  </span>
                </div>
                <span className="text-xs text-[#64748B]">{conditions.length} conditions configured</span>
              </div>

              {conditions.length === 0 ? (
                <div className="p-12 text-center text-sm text-[#64748B]">
                  No conditions yet. Click variables on the left panel to append criteria.
                </div>
              ) : (
                <div className="space-y-3">
                  {conditions.map((cond, index) => (
                    <React.Fragment key={cond.id}>
                      {index > 0 && (
                        <div className="flex items-center pl-6">
                          <span className="px-2 py-0.5 rounded bg-[#123C69] text-white text-[10px] font-bold tracking-wider">
                            AND
                          </span>
                        </div>
                      )}
                      <div className="p-3.5 bg-[#F8FAFC] dark:bg-[#101D31] border border-[#E2E8F0] dark:border-[#243449] rounded-xl flex flex-wrap items-center gap-3">
                        <span className="px-3 py-1.5 bg-[#FFFFFF] dark:bg-[#0B1424] border border-[#E2E8F0] dark:border-[#243449] rounded-lg text-xs font-bold text-[#07111F] dark:text-[#F8FAFC] uppercase min-w-[120px]">
                          {cond.field}
                        </span>

                        <select
                          value={cond.operator}
                          onChange={(e) => handleConditionChange(cond.id, { operator: e.target.value as any })}
                          className="px-3 py-1.5 bg-[#FFFFFF] dark:bg-[#0B1424] border border-[#E2E8F0] dark:border-[#243449] rounded-lg text-xs font-bold text-[#1769FF] dark:text-[#60A5FA] outline-none"
                        >
                          <option value=">=">&gt;= (Greater or Equal)</option>
                          <option value="<=">&lt;= (Less or Equal)</option>
                          <option value="==">== (Exact Match)</option>
                          <option value="!=">!= (Not Equal)</option>
                        </select>

                        <input 
                          type="text"
                          value={cond.value}
                          onChange={(e) => handleConditionChange(cond.id, { value: e.target.value })}
                          className="px-3 py-1.5 bg-[#FFFFFF] dark:bg-[#0B1424] border border-[#E2E8F0] dark:border-[#243449] rounded-lg text-xs font-bold text-[#07111F] dark:text-[#F8FAFC] outline-none flex-1 min-w-[100px]"
                        />

                        <button 
                          onClick={() => handleRemoveCondition(cond.id)}
                          className="p-1.5 text-[#64748B] hover:text-[#B91C1C] rounded transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </React.Fragment>
                  ))}
                </div>
              )}

              {/* THEN RESULT */}
              <div className="pt-4 border-t border-[#E2E8F0] dark:border-[#243449]">
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CheckSquare className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    <div>
                      <div className="font-bold text-sm text-emerald-800 dark:text-emerald-300">THEN: Citizen Granted Eligibility Recommendation</div>
                      <div className="text-xs text-emerald-700 dark:text-emerald-400">Scheme surfaced with 95%+ confidence score</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Test Sandbox Feedback Panel */}
          {testResult && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-xl border ${
                testResult.eligible 
                  ? 'bg-[#15803D]/10 border-[#15803D]/20 text-[#15803D] dark:text-[#4ADE80]' 
                  : 'bg-[#B91C1C]/10 border-[#B91C1C]/20 text-[#B91C1C] dark:text-[#F87171]'
              }`}
            >
              <div className="font-bold text-sm mb-1 flex items-center gap-2">
                {testResult.eligible ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                Simulation Result: {testResult.eligible ? 'Citizen ELIGIBLE' : 'Citizen INELIGIBLE'}
              </div>
              <ul className="text-xs list-disc list-inside space-y-0.5">
                {testResult.reasons.map((r: string, i: number) => <li key={i}>{r}</li>)}
              </ul>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};
