import React, { useMemo, useState } from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { evaluateDarkStoreSite } from '../api.js';

const DEFAULT_PROFILE = {
  pincode: '560103',
  city: 'Bengaluru',
  latitude: 12.9352,
  longitude: 77.6245,
  avg_daily_food_orders_zone: 210,
  avg_order_value_food: 385,
  cancellation_rate_food: 0.09,
  peak_hour_concentration: 0.55,
  zone_type: 'tech_corridor',
  existing_blinkit_stores_radius: 1,
  existing_zepto_stores_radius: 1,
  existing_swiggy_dark_stores_radius: 0,
  real_estate_cost_monthly: 150000,
  median_household_income_index: 1.1,
  college_or_office_density_index: 1.2,
};

const ZONE_LABELS = {
  tech_corridor: 'Tech corridor',
  office: 'Office zone',
  college: 'College belt',
  mixed_use: 'Mixed use',
  residential: 'Residential',
  suburban: 'Suburban',
};

function clamp(value, low, high) {
  return Math.max(low, Math.min(high, value));
}

function offlineEvaluate(profile) {
  const zoneMultiplier = {
    tech_corridor: 1.22,
    office: 1.15,
    college: 1.14,
    mixed_use: 1.06,
    residential: 0.98,
    suburban: 0.88,
  }[profile.zone_type] || 1;
  const densityScore = clamp(profile.avg_daily_food_orders_zone / 3, 0, 100);
  const aovScore = clamp((profile.avg_order_value_food - 180) / 3.2, 0, 100);
  const spreadScore = clamp((1 - profile.peak_hour_concentration) * 120, 0, 100);
  const impatienceScore = clamp(profile.cancellation_rate_food * 650, 0, 100);
  const competitors = profile.existing_blinkit_stores_radius + profile.existing_zepto_stores_radius;
  const competitionScore = competitors === 0 ? 92 : competitors <= 2 ? 76 - 8 * competitors : Math.max(32, 64 - 7.5 * competitors);
  const cannibalizationScore = profile.existing_swiggy_dark_stores_radius <= 0
    ? 100
    : profile.existing_swiggy_dark_stores_radius === 1
      ? 72
      : Math.max(35, 72 - 17 * profile.existing_swiggy_dark_stores_radius);
  const demandDensityScore = clamp(
    (0.58 * densityScore + 0.22 * spreadScore + 0.2 * impatienceScore)
      * zoneMultiplier
      * clamp(profile.college_or_office_density_index, 0.7, 1.35),
    0,
    100
  );
  const rentPressure = clamp(profile.real_estate_cost_monthly / 250000, 0.25, 1.8);
  const unitEconomicsScore = clamp(
    (0.58 * aovScore + 0.42 * demandDensityScore)
      * clamp(profile.median_household_income_index, 0.75, 1.35)
      / rentPressure,
    0,
    100
  );
  const compositeScore = clamp(
    0.38 * demandDensityScore + 0.28 * unitEconomicsScore + 0.18 * competitionScore + 0.16 * cannibalizationScore,
    0,
    100
  );
  const d0 = Math.max(12, profile.avg_daily_food_orders_zone * 0.18 * zoneMultiplier * clamp(profile.median_household_income_index, 0.75, 1.35));
  const d90 = d0 * (1.45 + (demandDensityScore / 100) * 0.55);
  const breakeven = clamp(14 - (compositeScore / 100) * 7.2 + profile.existing_swiggy_dark_stores_radius * 0.9 + competitors * 0.35, 4, 18);
  const contribution = d90 * Math.max(32, profile.avg_order_value_food * 0.18) * 30 - profile.real_estate_cost_monthly;
  const recommendation = compositeScore >= 72 && breakeven <= 9.5 ? 'GO' : compositeScore >= 55 && breakeven <= 12 ? 'HOLD' : 'NO-GO';
  return {
    status: 'offline',
    recommendation,
    composite_score: Number(compositeScore.toFixed(1)),
    demand_density_score: Number(demandDensityScore.toFixed(1)),
    unit_economics_score: Number(unitEconomicsScore.toFixed(1)),
    projected_daily_orders_d0: Number(d0.toFixed(1)),
    projected_daily_orders_d90: Number(d90.toFixed(1)),
    projected_breakeven_months: Number(breakeven.toFixed(1)),
    breakeven_ci_lower: Number(Math.max(3, breakeven - 1.9).toFixed(1)),
    breakeven_ci_upper: Number((breakeven + 1.9).toFixed(1)),
    projected_monthly_contribution: Math.round(contribution),
    competition_pressure: competitors >= 3 ? 'HIGH' : competitors > 0 ? 'MEDIUM' : 'LOW',
    cannibalization_risk: profile.existing_swiggy_dark_stores_radius >= 2 ? 'HIGH' : profile.existing_swiggy_dark_stores_radius === 1 ? 'MEDIUM' : 'LOW',
    ttp_risk_flag: breakeven > 12,
    recommended_initial_sku_count: Math.round(clamp(2200 + d90 * 18 + profile.avg_order_value_food * 2.2, 1800, 6500)),
    priority_categories: profile.zone_type === 'tech_corridor'
      ? ['milk-and-dairy', 'fresh-produce', 'snacks-and-beverages', 'ready-to-eat', 'personal-care', 'electronics-accessories']
      : ['milk-and-dairy', 'fresh-produce', 'snacks-and-beverages', 'staples', 'home-cleaning', 'personal-care'],
    confidence_level: profile.avg_daily_food_orders_zone < 35 ? 'LOW' : profile.avg_daily_food_orders_zone < 80 || compositeScore < 50 ? 'MEDIUM' : 'HIGH',
    reasoning: [
      `Food-order density proxy scores ${demandDensityScore.toFixed(1)}/100 for q-commerce demand.`,
      `AOV and rent imply unit-economics score of ${unitEconomicsScore.toFixed(1)}/100.`,
      `Projected D90 orders are ${d90.toFixed(0)}/day with breakeven in ${breakeven.toFixed(1)} months.`,
    ],
  };
}

export default function SiteSelectionLab() {
  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [decision, setDecision] = useState(() => offlineEvaluate(DEFAULT_PROFILE));
  const [loading, setLoading] = useState(false);

  const update = (key, value) => {
    const next = { ...profile, [key]: value };
    setProfile(next);
    setDecision(offlineEvaluate(next));
  };

  const runLiveEvaluation = async () => {
    setLoading(true);
    const live = await evaluateDarkStoreSite(profile);
    setDecision(live || offlineEvaluate(profile));
    setLoading(false);
  };

  const breakevenData = useMemo(() => {
    const target = decision.projected_breakeven_months || 9;
    return Array.from({ length: 12 }, (_, index) => {
      const month = index + 1;
      const probability = clamp((month / target) * 52 + (decision.composite_score - 50) * 0.55, 4, 96);
      return { month: `M${month}`, probability: Number(probability.toFixed(1)) };
    });
  }, [decision]);

  const recClass = decision.recommendation === 'GO' ? 'badge-green' : decision.recommendation === 'HOLD' ? 'badge-orange' : 'badge-red';
  const recColor = decision.recommendation === 'GO' ? 'var(--accent-emerald)' : decision.recommendation === 'HOLD' ? 'var(--accent-amber)' : 'var(--accent-coral)';

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">Site Selection Lab</div>
          <div className="page-subtitle">Instamart dark-store launch scoring · pincode economics · SKU launch mix</div>
        </div>
        <button className="btn btn-coral" onClick={runLiveEvaluation} disabled={loading}>
          <span className="material-symbols-outlined" style={{ fontSize: 17 }}>{loading ? 'sync' : 'analytics'}</span>
          {loading ? 'Scoring' : 'Score Site'}
        </button>
      </div>

      <div className="site-lab-grid">
        <section className="glass site-panel">
          <div className="panel-title">Candidate Catchment</div>
          <div className="field-grid">
            <TextField label="Pincode" value={profile.pincode} onChange={(v) => update('pincode', v)} />
            <TextField label="City" value={profile.city} onChange={(v) => update('city', v)} />
          </div>
          <SelectField label="Zone Type" value={profile.zone_type} options={ZONE_LABELS} onChange={(v) => update('zone_type', v)} />
          <SliderField label="Food Orders / Day" value={profile.avg_daily_food_orders_zone} min={20} max={360} step={5} suffix="" onChange={(v) => update('avg_daily_food_orders_zone', v)} />
          <SliderField label="Food AOV" value={profile.avg_order_value_food} min={160} max={650} step={5} prefix="₹" onChange={(v) => update('avg_order_value_food', v)} />
          <SliderField label="Monthly Rent" value={profile.real_estate_cost_monthly} min={70000} max={320000} step={5000} prefix="₹" onChange={(v) => update('real_estate_cost_monthly', v)} />
          <SliderField label="Cancellation Rate" value={profile.cancellation_rate_food} min={0.01} max={0.2} step={0.01} format={(v) => `${Math.round(v * 100)}%`} onChange={(v) => update('cancellation_rate_food', v)} />
          <SliderField label="Peak Concentration" value={profile.peak_hour_concentration} min={0.35} max={0.9} step={0.01} format={(v) => `${Math.round(v * 100)}%`} onChange={(v) => update('peak_hour_concentration', v)} />
          <div className="field-grid">
            <NumberField label="Blinkit" value={profile.existing_blinkit_stores_radius} min={0} max={5} onChange={(v) => update('existing_blinkit_stores_radius', v)} />
            <NumberField label="Zepto" value={profile.existing_zepto_stores_radius} min={0} max={5} onChange={(v) => update('existing_zepto_stores_radius', v)} />
            <NumberField label="Swiggy" value={profile.existing_swiggy_dark_stores_radius} min={0} max={4} onChange={(v) => update('existing_swiggy_dark_stores_radius', v)} />
          </div>
        </section>

        <section className="decision-panel">
          <div className="decision-hero glass">
            <div className="decision-copy">
              <span className={`badge ${recClass}`}>{decision.recommendation}</span>
              <div className="decision-title">{profile.pincode} · {ZONE_LABELS[profile.zone_type]}</div>
              <div className="decision-subtitle">
                {decision.projected_breakeven_months} month median breakeven · {decision.confidence_level} confidence
              </div>
            </div>
            <ConfidenceArc score={decision.composite_score} color={recColor} />
          </div>

          <div className="grid-4 site-kpis">
            <Metric label="D0 Orders" value={decision.projected_daily_orders_d0} suffix="/day" />
            <Metric label="D90 Orders" value={decision.projected_daily_orders_d90} suffix="/day" />
            <Metric label="Contribution" value={`₹${Number(decision.projected_monthly_contribution || 0).toLocaleString('en-IN')}`} />
            <Metric label="Launch SKUs" value={decision.recommended_initial_sku_count?.toLocaleString('en-IN')} />
          </div>

          <div className="site-bottom-grid">
            <div className="glass chart-panel">
              <div className="panel-title">Breakeven Probability</div>
              <ResponsiveContainer width="100%" height={210}>
                <AreaChart data={breakevenData} margin={{ top: 8, right: 12, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="breakevenGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00E475" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#00E475" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#9E9AA7' }} />
                  <YAxis tick={{ fontSize: 10, fill: '#9E9AA7' }} domain={[0, 100]} />
                  <Tooltip contentStyle={{ background: '#15131C', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }} />
                  <Area type="monotone" dataKey="probability" stroke="#00E475" strokeWidth={2} fill="url(#breakevenGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="glass strategy-panel">
              <div className="panel-title">Strategy Trace</div>
              <div className="risk-row">
                <span>Competition</span>
                <span className={`badge ${decision.competition_pressure === 'HIGH' ? 'badge-red' : decision.competition_pressure === 'MEDIUM' ? 'badge-orange' : 'badge-green'}`}>
                  {decision.competition_pressure}
                </span>
              </div>
              <div className="risk-row">
                <span>Cannibalization</span>
                <span className={`badge ${decision.cannibalization_risk === 'HIGH' ? 'badge-red' : decision.cannibalization_risk === 'MEDIUM' ? 'badge-orange' : 'badge-green'}`}>
                  {decision.cannibalization_risk}
                </span>
              </div>
              <div className="reason-list">
                {(decision.reasoning || []).slice(0, 4).map((reason) => (
                  <div key={reason} className="reason-item">
                    <span className="material-symbols-outlined">check_circle</span>
                    <span>{reason}</span>
                  </div>
                ))}
              </div>
              <div className="category-list">
                {(decision.priority_categories || []).map((category) => (
                  <span key={category} className="badge badge-gray">{category}</span>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function TextField({ label, value, onChange }) {
  return (
    <label className="field">
      <span>{label}</span>
      <input value={value} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}

function NumberField({ label, value, min, max, onChange }) {
  return (
    <label className="field">
      <span>{label}</span>
      <input type="number" min={min} max={max} value={value} onChange={(e) => onChange(Number(e.target.value))} />
    </label>
  );
}

function SelectField({ label, value, options, onChange }) {
  return (
    <label className="field">
      <span>{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        {Object.entries(options).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
      </select>
    </label>
  );
}

function SliderField({ label, value, min, max, step, prefix = '', suffix = '', format, onChange }) {
  const display = format ? format(value) : `${prefix}${Number(value).toLocaleString('en-IN')}${suffix}`;
  return (
    <label className="slider-field">
      <span><span>{label}</span><strong>{display}</strong></span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} />
    </label>
  );
}

function Metric({ label, value, suffix = '' }) {
  return (
    <div className="kpi-card compact-kpi">
      <div className="kpi-label">{label}</div>
      <div className="kpi-value">{value ?? '—'}<small>{suffix}</small></div>
    </div>
  );
}

function ConfidenceArc({ score, color }) {
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - clamp(score, 0, 100) / 100);
  return (
    <div className="confidence-wrap">
      <svg viewBox="0 0 120 120" aria-label={`Composite score ${score}`}>
        <circle cx="60" cy="60" r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="9" />
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="9"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          transform="rotate(-90 60 60)"
        />
        <text x="60" y="58" textAnchor="middle" className="arc-score">{Math.round(score)}</text>
        <text x="60" y="75" textAnchor="middle" className="arc-label">score</text>
      </svg>
    </div>
  );
}
