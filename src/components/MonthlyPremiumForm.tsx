import React, { useEffect, useMemo, useState } from 'react';

interface FormData {
  name: string;
  ageNextBirthday: string; // keep as string for easy input binding
  dobMonthYear: string;    // mm/YYYY format
  occupation: OccupationKey | '';
  sumInsured: string;      // numeric string
}

export type OccupationKey =
  | 'Cleaner'
  | 'Doctor'
  | 'Author'
  | 'Farmer'
  | 'Mechanic'
  | 'Florist'
  | 'Other';

const OCCUPATION_OPTIONS: {
  key: OccupationKey;
  label: string;
  ratingText: 'Light Manual' | 'Professional' | 'White Collar' | 'Heavy Manual';
}[] = [
  { key: 'Cleaner',  label: 'Cleaner',  ratingText: 'Light Manual' },
  { key: 'Doctor',   label: 'Doctor',   ratingText: 'Professional' },
  { key: 'Author',   label: 'Author',   ratingText: 'White Collar' },
  { key: 'Farmer',   label: 'Farmer',   ratingText: 'Heavy Manual' },
  { key: 'Mechanic', label: 'Mechanic', ratingText: 'Heavy Manual' },
  { key: 'Florist',  label: 'Florist',  ratingText: 'Light Manual' },
  { key: 'Other',    label: 'Other',    ratingText: 'Heavy Manual' },
];

// Placeholder factors (replace with real rules)
const OCCUPATION_FACTORS: Record<string, number> = {
  'Light Manual': 11.50,
  'Professional': 1.5,
  'White Collar': 2.25,
  'Heavy Manual': 31.75,
};

function ageFactor(age: number): number {
  if (age <= 30) return 0.80;
  if (age <= 40) return 1.00;
  if (age <= 50) return 1.30;
  if (age <= 60) return 1.70;
  return 2.20;
}

//const BASE_RATE_PER_1000 = 0.50; // placeholder monthly rate per 1000

function calculateMonthlyPremium(
  sumInsured: number,
  ageNextBirthday: number,
  occupationRatingText: string
): number {
  const occFactor = OCCUPATION_FACTORS[occupationRatingText] ?? 1.0;
  const aFactor = ageFactor(ageNextBirthday);
  const premium = (sumInsured * occFactor * aFactor)/1000*12;
  return Number.isFinite(premium) ? premium : 0;
}

function isValidMonthYear(input: string): boolean {
  // Accept mm/YYYY where mm is 01-12 and year is 1900-2099
  const re = /^(0[1-9]|1[0-2])\/(19\d{2}|20\d{2})$/;
  return re.test(input);
}

function toNumberSafe(value: string): number | null {
  const n = Number(value.replace(/,/g, ''));
  return Number.isFinite(n) ? n : null;
}

const fieldStyle: React.CSSProperties = { display: 'grid', gap: 4 };
const labelStyle: React.CSSProperties = { fontWeight: 600 };
const inputStyle: React.CSSProperties = { padding: '8px', borderRadius: 6, border: '1px solid #ccc' };
const errorStyle: React.CSSProperties = { color: '#b00020', fontSize: 12 };
const containerStyle: React.CSSProperties = {
  maxWidth: 640, margin: '24px auto', padding: 16,
  border: '1px solid #e5e5e5', borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
};
const rowStyle: React.CSSProperties = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 };
const buttonStyle: React.CSSProperties = {
  padding: '10px 16px', borderRadius: 8, border: '1px solid #1e90ff',
  background: '#1e90ff', color: '#fff', cursor: 'pointer'
};


const MonthlyPremiumForm: React.FC = () => {
  const [form, setForm] = useState<FormData>({
    name: '',
    ageNextBirthday: '',
    dobMonthYear: '',
    occupation: '',
    sumInsured: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [premium, setPremium] = useState<number | null>(null);

  const occupationRatingText = useMemo(() => {
    const found = OCCUPATION_OPTIONS.find(o => o.key === form.occupation);
    return found?.ratingText ?? '';
  }, [form.occupation]);

  function handleChange<K extends keyof FormData>(key: K, value: FormData[K]):void  {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  function validate(): boolean {
    const nextErrors: Record<string, string> = {};

    if (!form.name.trim()) nextErrors.name = 'Name is required';

    const ageNum = toNumberSafe(form.ageNextBirthday);
    if (ageNum === null || ageNum < 21 || ageNum > 120 || !Number.isInteger(ageNum)) {
      nextErrors.ageNextBirthday = 'Enter a valid age (21–120)';
    }

    if (!isValidMonthYear(form.dobMonthYear)) {
      nextErrors.dobMonthYear = 'Enter DOB as mm/YYYY (e.g., 07/1990)';
    }

    if (!form.occupation) {
      nextErrors.occupation = 'Select an occupation';
    }

    const sum = toNumberSafe(form.sumInsured);
    if (sum === null || sum <= 0) {
      nextErrors.sumInsured = 'Enter a positive Sum Insured';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }
useEffect(() => {
    onCalculate()
     if (!form.occupation) {
    setPremium(null);
  return;
     }
 
}, [form.occupation,onCalculate]);

 function onCalculate() {
    if (!validate()) return;

    const sum = toNumberSafe(form.sumInsured)!;
    const age = toNumberSafe(form.ageNextBirthday)!;
    const ratingText = occupationRatingText;
    const result = calculateMonthlyPremium(sum, age, ratingText);
    setPremium(Number(result.toFixed(2)));
  }

  return (
    <div style={containerStyle}>
      <h2>Life Insurance Monthly Premium Calculator</h2>
      <p style={{ color: '#555' }}>Enter details below to compute the estimated monthly premium.</p>

      <form>
        <div style={fieldStyle}>
          <label style={labelStyle} htmlFor="name">Name</label>
          <input
            id="name"
            type="text"
            value={form.name}
            onChange={(e) => handleChange('name', e.target.value)}
            style={inputStyle}
            placeholder="Full Name"
          />
          {errors.name && <span style={errorStyle}>{errors.name}</span>}
        </div>

        <div style={rowStyle}>
          <div style={fieldStyle}>
            <label style={labelStyle} htmlFor="age">Age Next Birthday</label>
            <input
              id="age"
              type="number"
              inputMode="numeric"
              value={form.ageNextBirthday}
              onChange={(e) => handleChange('ageNextBirthday', e.target.value)}
              style={inputStyle}
              placeholder="e.g., 35"
            />
            {errors.ageNextBirthday && <span style={errorStyle}>{errors.ageNextBirthday}</span>}
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle} htmlFor="dob">Date of Birth (mm/YYYY)</label>
            <input
              id="dob"
              type="text"
              value={form.dobMonthYear}
              onChange={(e) => handleChange('dobMonthYear', e.target.value)}
              style={inputStyle}
              placeholder="mm/YYYY"
            />
            {errors.dobMonthYear && <span style={errorStyle}>{errors.dobMonthYear}</span>}
          </div>
        </div>

        <div style={rowStyle}>
          <div style={fieldStyle}>
            <label style={labelStyle} htmlFor="occupation">Usual Occupation</label>
            <select
              id="occupation"
              value={form.occupation}
              onChange={(e) => handleChange('occupation', e.target.value as OccupationKey)}
              style={inputStyle}
            >
              <option value="">-- Select --</option>
              {OCCUPATION_OPTIONS.map(opt => (
                <option key={opt.key} value={opt.key}>
                  {opt.label} — {opt.ratingText}
                </option>
              ))}
            </select>
            {errors.occupation && <span style={errorStyle}>{errors.occupation}</span>}
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle} htmlFor="sum">Death – Sum Insured</label>
            <input
              id="sum"
              type="text"
              value={form.sumInsured}
              onChange={(e) => handleChange('sumInsured', e.target.value)}
              style={inputStyle}
              placeholder="e.g., 500000"
            />
            {errors.sumInsured && <span style={errorStyle}>{errors.sumInsured}</span>}
          </div>
        </div>

        {occupationRatingText && (
          <p style={{ fontSize: 12, color: '#666' }}>
            Selected Occupation Rating: <strong>{occupationRatingText}</strong>
          </p>
        )}

        {/* <div style={{ marginTop: 16 }}>
          <button type="submit" style={buttonStyle}>Calculate Monthly Premium</button>
        </div> */}
      </form>

      {premium !== null && (
        <div style={{ marginTop: 20, padding: 12, background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8 }}>
          <strong>Estimated Monthly Premium:</strong>
          <div style={{ fontSize: 20, marginTop: 8 }}>
            {premium.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div style={{ marginTop: 8, color: '#6b7280', fontSize: 12 }}>
            This is an illustration using placeholder rates. Replace the logic with your official pricing model.
          </div>
        </div>
      )}
    </div>
  );
};

export default MonthlyPremiumForm;

