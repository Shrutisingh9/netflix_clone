import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Profile.module.css';
import axios from 'axios';

function Profile() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [manageMode, setManageMode] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [isKids, setIsKids] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [editName, setEditName] = useState('');
  const [editIsKids, setEditIsKids] = useState(false);
  const [error, setError] = useState('');

  // Fetch all profiles
  const fetchProfiles = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:5000/api/auth/profiles', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfiles(res.data);
    } catch (err) {
      setProfiles([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!token) {
      navigate('/login');
    } else {
      fetchProfiles();
    }
    // eslint-disable-next-line
  }, [token, navigate]);

  // Add new profile
  const handleAddProfile = async (e) => {
    e.preventDefault();
    setError('');
    if (!newName) return setError('Name required');
    if (profiles.length > 0 && profiles[0].name === newName) return setError('Cannot use the main profile name');
    const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(newName)}&background=ed213a&color=fff&size=128&rounded=false&bold=true`;
    try {
      await axios.post('http://localhost:5000/api/auth/profiles', { name: newName, avatarUrl, isKids }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setShowAdd(false);
      setNewName('');
      setIsKids(false);
      fetchProfiles();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add profile');
    }
  };

  // Edit profile
  const handleEditProfile = async (e) => {
    e.preventDefault();
    setError('');
    if (!editName) return setError('Name required');
    const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(editName)}&background=ed213a&color=fff&size=128&rounded=false&bold=true`;
    try {
      await axios.put(`http://localhost:5000/api/auth/profiles/${encodeURIComponent(profiles[editIndex].name)}`, { name: editName, avatarUrl, isKids: editIsKids }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEditIndex(null);
      setEditName('');
      setEditIsKids(false);
      fetchProfiles();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to edit profile');
    }
  };

  // Delete profile
  const handleDeleteProfile = async (name) => {
    setError('');
    try {
      await axios.delete(`http://localhost:5000/api/auth/profiles/${encodeURIComponent(name)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchProfiles();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete profile');
    }
  };

  // Modal for Add Profile
  const AddProfileModal = () => (
    <div className={styles.modalOverlay}>
      <div className={styles.modalBox}>
        <button className={styles.closeBtn} onClick={() => { setShowAdd(false); setNewName(''); setIsKids(false); }}>&times;</button>
        <div className={styles.modalTitle}>Add a profile</div>
        <div className={styles.modalDesc}>Add a profile for another person watching Netflix.</div>
        <div style={{ display: 'flex', alignItems: 'center', margin: '32px 0 24px 0' }}>
          <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(newName || 'Profile')}&background=ed213a&color=fff&size=64&rounded=false&bold=true`} alt="avatar" style={{ width: 64, height: 64, borderRadius: 8, marginRight: 16 }} />
          <input
            className={styles.modalInput}
            type="text"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            placeholder="Name"
            required
            autoFocus
          />
        </div>
        <div className={styles.kidsRow}>
          <div>
            <div className={styles.kidsLabel}>Children's Profile</div>
            <div className={styles.kidsDesc}>Only see kid-friendly TV shows and movies</div>
          </div>
          <label className={styles.switch}>
            <input type="checkbox" checked={isKids} onChange={e => setIsKids(e.target.checked)} />
            <span className={styles.slider}></span>
          </label>
        </div>
        <div style={{ marginTop: 32, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <button className={styles.saveBtn} onClick={handleAddProfile}>Save</button>
          <button className={styles.cancelBtn} onClick={() => { setShowAdd(false); setNewName(''); setIsKids(false); }}>Cancel</button>
        </div>
        {error && <div style={{ color: 'red', marginTop: 12 }}>{error}</div>}
      </div>
    </div>
  );

  if (loading) {
    return <div className={styles.container}><div style={{ color: '#fff', textAlign: 'center' }}>Loading...</div></div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.title}>Who's watching?</div>
      <div className={styles.profilesRow}>
        {profiles.map((profile, idx) => (
          <div className={styles.profileCard} key={profile.name}>
            <img src={profile.avatarUrl} alt={profile.name} className={styles.avatar} style={{ borderRadius: 12, width: 110, height: 110 }} />
            {editIndex === idx ? (
              <form onSubmit={handleEditProfile} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <input
                  className={styles.input}
                  type="text"
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  placeholder="Name"
                  style={{ marginBottom: 8 }}
                  required
                />
                <button className={styles.manageBtn} type="submit" style={{ marginBottom: 8, padding: '6px 18px', fontSize: '1rem' }}>Save</button>
                <button className={styles.manageBtn} type="button" style={{ background: '#444', color: '#fff', marginBottom: 8, padding: '6px 18px', fontSize: '1rem' }} onClick={() => setEditIndex(null)}>Cancel</button>
              </form>
            ) : (
              <>
                <div className={styles.username}>{profile.name}</div>
                {manageMode && (
                  <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                    <button
                      className={styles.manageBtn}
                      style={{ background: '#444', color: '#fff', padding: '6px 18px', fontSize: '1rem' }}
                      onClick={() => {
                        setEditIndex(idx);
                        setEditName(profile.name);
                      }}
                    >Edit</button>
                    {/* Hide delete for main profile */}
                    {idx !== 0 && (
                      <button
                        className={styles.manageBtn}
                        style={{ background: '#e50914', color: '#fff', padding: '6px 18px', fontSize: '1rem' }}
                        onClick={() => handleDeleteProfile(profile.name)}
                      >Delete</button>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        ))}
        {/* Add new profile card */}
        {profiles.length < 5 && (
          <div className={styles.profileCard} style={{ justifyContent: 'center', alignItems: 'center' }}>
            <button
              className={styles.avatar}
              style={{ background: '#444', color: '#888', fontSize: 48, border: '2px dashed #888', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 12, width: 110, height: 110 }}
              onClick={() => setShowAdd(true)}
              title="Add Profile"
            >+
            </button>
            <div className={styles.username} style={{ color: '#888', marginTop: 8 }}>Add Profile</div>
          </div>
        )}
      </div>
      {error && <div style={{ color: 'red', marginBottom: 16 }}>{error}</div>}
      <button className={styles.manageBtn} onClick={() => setManageMode(m => !m)}>{manageMode ? 'Done' : 'Manage Profiles'}</button>
      {showAdd && <AddProfileModal />}
    </div>
  );
}

export default Profile; 