"use client";
import React, { useState } from 'react';

export default function HealthWidget({ locale }: { locale: string }) {
  const [age, setAge] = useState<number>(25);
  const [gender, setGender] = useState<'male'|'female'>('male');
  const [height, setHeight] = useState<number>(175);
  const [weight, setWeight] = useState<number>(70);
  const [activity, setActivity] = useState<number>(1.2);

  const heightM = height / 100;
  const bmi = weight / (heightM * heightM);
  let bmiCategory = '';
  if (bmi < 18.5) bmiCategory = locale === 'fr' ? 'Insuffisance pondérale' : 'Underweight';
  else if (bmi < 24.9) bmiCategory = locale === 'fr' ? 'Poids normal' : 'Normal weight';
  else if (bmi < 29.9) bmiCategory = locale === 'fr' ? 'Surpoids' : 'Overweight';
  else bmiCategory = locale === 'fr' ? 'Obésité' : 'Obese';

  let bmr = 10 * weight + 6.25 * height - 5 * age;
  bmr += gender === 'male' ? 5 : -161;
  const tdee = bmr * activity;

  return (
    <div className="p-6 bg-[var(--bg-elevated)] rounded-xl flex flex-col gap-6 max-w-lg mx-auto border border-[var(--border-subtle)] shadow-sm">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-[var(--text-muted)]">{locale === 'fr' ? 'Âge' : 'Age'}</label>
          <input type="number" value={age} onChange={e => setAge(Number(e.target.value))} className="w-full bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-lg px-3 py-2.5 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-lifestyle)]" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-[var(--text-muted)]">{locale === 'fr' ? 'Genre' : 'Gender'}</label>
          <select value={gender} onChange={e => setGender(e.target.value as 'male'|'female')} className="w-full bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-lg px-3 py-2.5 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-lifestyle)]">
            <option value="male">{locale === 'fr' ? 'Homme' : 'Male'}</option>
            <option value="female">{locale === 'fr' ? 'Femme' : 'Female'}</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-[var(--text-muted)]">{locale === 'fr' ? 'Taille (cm)' : 'Height (cm)'}</label>
          <input type="number" value={height} onChange={e => setHeight(Number(e.target.value))} className="w-full bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-lg px-3 py-2.5 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-lifestyle)]" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-[var(--text-muted)]">{locale === 'fr' ? 'Poids (kg)' : 'Weight (kg)'}</label>
          <input type="number" value={weight} onChange={e => setWeight(Number(e.target.value))} className="w-full bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-lg px-3 py-2.5 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-lifestyle)]" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1 text-[var(--text-muted)]">{locale === 'fr' ? 'Niveau d\'Activité' : 'Activity Level'}</label>
        <select value={activity} onChange={e => setActivity(Number(e.target.value))} className="w-full bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-lg px-3 py-2.5 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-lifestyle)]">
          <option value="1.2">{locale === 'fr' ? 'Sédentaire' : 'Sedentary'}</option>
          <option value="1.375">{locale === 'fr' ? 'Légèrement actif' : 'Lightly active'}</option>
          <option value="1.55">{locale === 'fr' ? 'Modérément actif' : 'Moderately active'}</option>
          <option value="1.725">{locale === 'fr' ? 'Très actif' : 'Very active'}</option>
          <option value="1.9">{locale === 'fr' ? 'Extrêmement actif' : 'Super active'}</option>
        </select>
      </div>

      <div className="mt-2 p-5 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-xl flex flex-col gap-4">
        <div className="flex justify-between items-center border-b border-[var(--border-subtle)] pb-4">
          <span className="text-[var(--text-muted)] font-medium">BMI (IMC)</span>
          <div className="text-right">
            <span className="text-3xl font-bold text-[var(--text-primary)] block">{bmi.toFixed(1)}</span>
            <span className="text-sm font-semibold mt-1 inline-block px-2 py-1 bg-[var(--bg-elevated)] rounded text-[var(--accent-lifestyle)]">{bmiCategory}</span>
          </div>
        </div>
        <div className="flex justify-between items-center pt-2">
          <span className="text-[var(--text-muted)] font-medium">{locale === 'fr' ? 'Calories / Jour' : 'Daily Calories'}</span>
          <span className="text-2xl font-bold text-[var(--text-primary)]">{Math.round(tdee)} <span className="text-sm text-[var(--text-muted)]">kcal</span></span>
        </div>
      </div>
    </div>
  );
}
