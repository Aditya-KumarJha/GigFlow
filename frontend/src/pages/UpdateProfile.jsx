import React, { useEffect, useState, useMemo } from 'react';
import api from '../utils/api';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';

const UpdateProfile = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    username: '',
    firstName: '',
    lastName: '',
    currentPassword: '',
    newPassword: '',
  });

  const [initialForm, setInitialForm] = useState(null);
  const [initialAvatar, setInitialAvatar] = useState(null);

  const [avatar, setAvatar] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [provider, setProvider] = useState('email');

  useEffect(() => {
    let mounted = true;
    console.debug('[UpdateProfile] Fetching user profile');

    api.get('/api/auth/me')
      .then(({ data }) => {
        if (!mounted) return;

        console.debug('[UpdateProfile] /me response:', data);

        const u = data.user || {};
        const fullName = u.fullName || {};

        setForm({
          username: u.username || '',
          firstName: fullName.firstName || '',
          lastName: fullName.lastName || '',
          currentPassword: '',
          newPassword: '',
        });

        // store initial values so we can detect changes
        setInitialForm({
          username: u.username || '',
          firstName: fullName.firstName || '',
          lastName: fullName.lastName || '',
          currentPassword: '',
          newPassword: '',
        });

        setAvatar(u.profilePic || '');
        setInitialAvatar(u.profilePic || '');
        setProvider(u.provider || 'email');

        console.debug('[UpdateProfile] State initialized:', {
          username: u.username,
          firstName: fullName.firstName,
          lastName: fullName.lastName,
          profilePic: u.profilePic,
          provider: u.provider,
        });
      })
      .catch((err) => {
        console.error('[UpdateProfile] Failed to fetch profile:', err);
      })
      .finally(() => mounted && setLoading(false));

    return () => (mounted = false);
  }, []);

  const handleChange = (e) => {
    setForm((s) => ({ ...s, [e.target.name]: e.target.value }));
  };

  const isChanged = useMemo(() => {
    if (!initialForm) return false;

    // if password change fields set -> changed
    if (form.currentPassword || form.newPassword) return true;

    // check simple string fields
    if ((form.username || '') !== (initialForm.username || '')) return true;
    if ((form.firstName || '') !== (initialForm.firstName || '')) return true;
    if ((form.lastName || '') !== (initialForm.lastName || '')) return true;

    // avatar file selected means change
    if (avatarFile) return true;

    return false;
  }, [form, avatarFile, initialForm, initialAvatar]);

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    console.debug('[UpdateProfile] Avatar selected:', {
      name: file.name,
      type: file.type,
      size: file.size,
    });

    setAvatarFile(file);
    setAvatar(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.debug('[UpdateProfile] Submit clicked', {
      username: form.username,
      hasFirstName: !!form.firstName,
      hasLastName: !!form.lastName,
      hasAvatar: !!avatarFile,
      hasPasswordChange: !!form.currentPassword,
    });

    if (
      (form.currentPassword && !form.newPassword) ||
      (!form.currentPassword && form.newPassword)
    ) {
      toast.error('Both current and new password are required');
      return;
    }

    if (form.newPassword && form.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }

    // Validate full name fields - do not allow empty first/last name when user edits
    if (form.firstName !== undefined && String(form.firstName).trim() === '') {
      toast.error("First name can't be empty");
      return;
    }

    if (form.lastName !== undefined && String(form.lastName).trim() === '') {
      toast.error("Last name can't be empty");
      return;
    }

    try {
      setSaving(true);

      const payload = new FormData();

      payload.append('username', form.username);
      payload.append(
        'fullName',
        JSON.stringify({
          firstName: form.firstName || undefined,
          lastName: form.lastName || undefined,
        })
      );

      if (form.currentPassword && form.newPassword) {
        payload.append('currentPassword', form.currentPassword);
        payload.append('newPassword', form.newPassword);
      }

      if (avatarFile) {
        payload.append('profilePic', avatarFile);
      }

      console.debug('[UpdateProfile] FormData prepared:', {
        fields: [...payload.keys()],
        avatarIncluded: payload.has('profilePic'),
      });

      const res = await api.patch('/api/auth/profile', payload);

      console.debug('[UpdateProfile] API success:', res.data);
      toast.success('Profile updated successfully');

      setForm((s) => ({
        ...s,
        currentPassword: '',
        newPassword: '',
      }));
    } catch (err) {
      console.error('[UpdateProfile] API error:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });

      const msg =
        err?.response?.data?.message ||
        err.message ||
        'Failed to update profile';

      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto px-4 py-10"
    >
      <Header />
      <h2 className="mt-20 text-3xl font-bold mb-8">Profile Settings</h2>

      <div className="bg-white border rounded-2xl shadow-sm p-6">
        {loading ? (
          <div className="h-40 bg-zinc-100 rounded-xl animate-pulse" />
        ) : (
          <form onSubmit={handleSubmit} className="grid md:grid-cols-3 gap-8">
            {/* Avatar */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                {avatar ? (
                  <img
                    src={avatar}
                    alt="Profile"
                    className="w-32 h-32 rounded-full object-cover border"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full border bg-zinc-100 flex items-center justify-center text-zinc-400 text-sm">
                    No Photo
                  </div>
                )}

                <label className="absolute -bottom-2 right-0 bg-black text-white text-xs px-3 py-1 rounded-full cursor-pointer hover:opacity-90">
                  Change
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Fields */}
            <div className="md:col-span-2 flex flex-col gap-6">
              <div>
                <label className="text-sm font-medium">Username</label>
                <input
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-lg border px-3 py-2"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">First Name</label>
                  <input
                    name="firstName"
                    value={form.firstName}
                    onChange={handleChange}
                    className="mt-1 w-full rounded-lg border px-3 py-2"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Last Name</label>
                  <input
                    name="lastName"
                    value={form.lastName}
                    onChange={handleChange}
                    className="mt-1 w-full rounded-lg border px-3 py-2"
                  />
                </div>
              </div>

              {provider === 'email' && (
                <div className="border-t pt-6 space-y-4">
                  <h3 className="text-lg font-semibold">Change Password</h3>

                  <input
                    type="password"
                    name="currentPassword"
                    placeholder="Current password"
                    value={form.currentPassword}
                    onChange={handleChange}
                    className="w-full rounded-lg border px-3 py-2"
                  />

                  <input
                    type="password"
                    name="newPassword"
                    placeholder="New password"
                    value={form.newPassword}
                    onChange={handleChange}
                    className="w-full rounded-lg border px-3 py-2"
                  />
                </div>
              )}

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={!isChanged || saving}
                  className="px-6 py-2.5 rounded-lg bg-black text-white text-sm disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>

    </motion.div>
    <Footer />
    </>
  );
};

export default UpdateProfile;
