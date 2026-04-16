import React, { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { changePassword } from '../../api/authApi';
import './AccountSettings.scss';

function AccountSettings() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    login: user?.login || '',
    email: user?.email || '',
    avatarUrl: user?.avatarUrl || user?.avatar || '',
  });
  const [passwordForm, setPasswordForm] = useState({
    password: '',
    newPassword: '',
    confirm: '',
  });
  const [msg, setMsg] = useState(null);
  const [saving, setSaving] = useState(false);
  const [avatarMode, setAvatarMode] = useState('url'); // 'url' | 'file'
  const [avatarPreview, setAvatarPreview] = useState(null);
  const fileInputRef = useRef(null);

  if (!user) {
    return <p style={{ textAlign: 'center', marginTop: 40 }}>Please log in.</p>;
  }

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAvatarFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showMessage('error', 'Please select an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showMessage('error', 'Image must be less than 5 MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result;
      setAvatarPreview(base64);
      setForm((prev) => ({ ...prev, avatarUrl: base64 }));
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = () => {
    setAvatarPreview(null);
    setForm((prev) => ({ ...prev, avatarUrl: '' }));
    if (fileInputRef.current) fileInputRef.current.value = '';
    setAvatarMode('url');
  };

  const handlePassChange = (e) => {
    setPasswordForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const showMessage = (type, text) => {
    setMsg({ type, text });
    setTimeout(() => setMsg(null), 4000);
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    const result = await updateUser(form);
    setSaving(false);

    if (result.success) {
      showMessage('success', 'Profile updated!');
    } else {
      showMessage('error', result.error);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (passwordForm.newPassword.length < 7) {
      showMessage('error', 'Password must be at least 7 characters');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirm) {
      showMessage('error', 'Passwords do not match');
      return;
    }

    try {
      await changePassword({
        password: passwordForm.password,
        newPassword: passwordForm.newPassword,
      });
      showMessage('success', 'Password changed!');
      setPasswordForm({ password: '', newPassword: '', confirm: '' });
    } catch (err) {
      showMessage('error', err.data?.message || err.message || 'Password change failed');
    }
  };

  return (
    <div className="settings">
      <h1 className="settings__title">⚙️ Account Settings</h1>

      {msg && (
        <div className={`settings__msg settings__msg--${msg.type}`}>{msg.text}</div>
      )}

      <form className="settings__section" onSubmit={saveProfile}>
        <h2>Profile Information</h2>

        <div className="settings__avatar-row">
          <img
            src={avatarPreview || form.avatarUrl || 'https://i.pravatar.cc/80'}
            alt=""
            className="settings__avatar-preview"
          />
          <div className="settings__avatar-controls">
            <div className="settings__avatar-tabs">
              <button
                type="button"
                className={`settings__avatar-tab ${avatarMode === 'url' ? 'settings__avatar-tab--active' : ''}`}
                onClick={() => setAvatarMode('url')}
              >
                🔗 URL
              </button>
              <button
                type="button"
                className={`settings__avatar-tab ${avatarMode === 'file' ? 'settings__avatar-tab--active' : ''}`}
                onClick={() => setAvatarMode('file')}
              >
                📁 Upload
              </button>
            </div>

            {avatarMode === 'url' ? (
              <div className="settings__field settings__field--grow">
                <input
                  name="avatarUrl"
                  value={form.avatarUrl.startsWith('data:') ? '' : form.avatarUrl}
                  onChange={handleChange}
                  placeholder="https://example.com/avatar.jpg"
                />
              </div>
            ) : (
              <div className="settings__file-upload">
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleAvatarFile}
                  className="settings__file-input"
                  id="avatar-file"
                />
                <label htmlFor="avatar-file" className="settings__file-label">
                  {avatarPreview ? '✅ Photo selected' : '📷 Choose photo'}
                </label>
              </div>
            )}

            {(form.avatarUrl || avatarPreview) && (
              <button
                type="button"
                className="settings__avatar-remove"
                onClick={handleRemoveAvatar}
              >
                ✕ Remove
              </button>
            )}
          </div>
        </div>

        <div className="settings__row">
          <div className="settings__field">
            <label>First Name</label>
            <input name="firstName" value={form.firstName} onChange={handleChange} />
          </div>
          <div className="settings__field">
            <label>Last Name</label>
            <input name="lastName" value={form.lastName} onChange={handleChange} />
          </div>
        </div>

        <div className="settings__row">
          <div className="settings__field">
            <label>Login</label>
            <input name="login" value={form.login} onChange={handleChange} />
          </div>
          <div className="settings__field">
            <label>Email</label>
            <input name="email" type="email" value={form.email} onChange={handleChange} />
          </div>
        </div>

        <button type="submit" className="settings__save" disabled={saving}>
          {saving ? 'Saving...' : 'Save Profile'}
        </button>
      </form>

      <form className="settings__section" onSubmit={handleChangePassword}>
        <h2>Change Password</h2>

        <div className="settings__field">
          <label>Current Password</label>
          <input
            type="password"
            name="password"
            value={passwordForm.password}
            onChange={handlePassChange}
            autoComplete="current-password"
          />
        </div>

        <div className="settings__row">
          <div className="settings__field">
            <label>New Password (min 7 chars)</label>
            <input
              type="password"
              name="newPassword"
              value={passwordForm.newPassword}
              onChange={handlePassChange}
              autoComplete="new-password"
            />
          </div>
          <div className="settings__field">
            <label>Confirm</label>
            <input
              type="password"
              name="confirm"
              value={passwordForm.confirm}
              onChange={handlePassChange}
              autoComplete="new-password"
            />
          </div>
        </div>

        <button type="submit" className="settings__save">Update Password</button>
      </form>
    </div>
  );
}

export default AccountSettings;