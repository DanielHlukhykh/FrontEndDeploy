import React, { useState, useEffect } from 'react';
import './Awards.scss';

const TYPES = [
  { value: 'running', label: '🏃 Running', unit: 'km' },
  { value: 'weight', label: '⚖️ Weight Goal', unit: 'kg' },
  { value: 'workout', label: '🏋️ Workouts', unit: 'sessions' },
  { value: 'calories', label: '🔥 Calories', unit: 'kcal' },
  { value: 'custom', label: '🎯 Custom', unit: '' },
];

function AwardForm({ onSubmit, onCancel, editData = null }) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    type: 'running',
    targetValue: '',
    currentValue: '',
    unit: 'km',
  });

  useEffect(() => {
    if (editData) {
      setForm({
        title: editData.title || '',
        description: editData.description || '',
        type: editData.type || 'running',
        targetValue: editData.targetValue || '',
        currentValue: editData.currentValue || '',
        unit: editData.unit || 'km',
      });
    }
  }, [editData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === 'type') {
        const t = TYPES.find((t) => t.value === value);
        updated.unit = t?.unit || '';
      }
      return updated;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.targetValue) return;

    onSubmit({
      ...form,
      targetValue: Number(form.targetValue),
      currentValue: Number(form.currentValue) || 0,
    });

    if (!editData) {
      setForm({ title: '', description: '', type: 'running', targetValue: '', currentValue: '', unit: 'km' });
    }
  };

  return (
    <form className="award-form" onSubmit={handleSubmit}>
      <h3 className="award-form__title">
        {editData ? '✏️ Edit Goal' : '🎯 New Goal'}
      </h3>

      <div className="award-form__row">
        <select name="type" value={form.type} onChange={handleChange} className="award-form__select">
          {TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
        <input
          type="text"
          name="unit"
          value={form.unit}
          onChange={handleChange}
          className="award-form__input award-form__input--sm"
          placeholder="Unit"
        />
      </div>

      <input
        type="text"
        name="title"
        value={form.title}
        onChange={handleChange}
        className="award-form__input"
        placeholder="Goal title *"
        required
      />

      <textarea
        name="description"
        value={form.description}
        onChange={handleChange}
        className="award-form__textarea"
        placeholder="Description (optional)"
        rows={2}
      />

      <div className="award-form__row">
        <div className="award-form__field">
          <label>Current</label>
          <input
            type="number"
            name="currentValue"
            value={form.currentValue}
            onChange={handleChange}
            className="award-form__input"
            placeholder="0"
            min="0"
          />
        </div>
        <div className="award-form__field">
          <label>Target *</label>
          <input
            type="number"
            name="targetValue"
            value={form.targetValue}
            onChange={handleChange}
            className="award-form__input"
            placeholder="100"
            min="1"
            required
          />
        </div>
      </div>

      <div className="award-form__actions">
        <button type="button" className="award-form__cancel" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="award-form__submit">
          {editData ? 'Update' : 'Create'}
        </button>
      </div>
    </form>
  );
}

export default AwardForm;