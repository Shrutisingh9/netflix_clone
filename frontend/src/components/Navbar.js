import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/netflix-logo.png';
import styles from './Navbar.module.css';

const genres = [
  'Action', 'Comedy', 'Drama', 'Horror', 'Romance', 'Thriller', 'Animation', 'Documentary', 'Sci-Fi', 'Fantasy', 'Crime', 'Family', 'Adventure', 'Mystery', 'War', 'Western', 'History', 'Music', 'TV Movie'
];
const languages = [
  'English', 'Hindi', 'Spanish', 'French', 'German', 'Japanese', 'Korean', 'Chinese', 'Italian', 'Russian', 'Portuguese', 'Arabic', 'Turkish', 'Bengali', 'Tamil', 'Telugu', 'Malayalam', 'Gujarati', 'Punjabi'
];

function Navbar({ profile, onGenreSelect, onLanguageSelect }) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showGenre, setShowGenre] = useState(false);
  const [showLanguage, setShowLanguage] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
        setShowGenre(false);
        setShowLanguage(false);
      }
    }
    if (showDropdown || showGenre || showLanguage) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showDropdown, showGenre, showLanguage]);

  // Placeholder notification count
  const notificationCount = 2;

  // Placeholder profile info
  const avatarUrl = profile?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.name || 'User')}&background=ed213a&color=fff&size=48&rounded=false&bold=true`;
  const profileName = profile?.name || 'Profile';

  return (
    <nav className={styles.navbar}>
      <div className={styles.left}>
        <img src={logo} alt="Netflix" className={styles.logo} onClick={() => navigate('/home')} />
        <div className={styles.links}>
          <Link to="/home" className={styles.link}>Home</Link>
          <Link to="#" className={styles.link} onClick={() => navigate('/my-list')}>My List</Link>
          <div
            className={styles.link}
            onMouseEnter={() => setShowGenre(true)}
            onMouseLeave={() => setShowGenre(false)}
            style={{ position: 'relative' }}
          >
            Genres
            {showGenre && (
              <div className={styles.menuDropdown} ref={dropdownRef}>
                {genres.map(genre => (
                  <div
                    key={genre}
                    className={styles.menuDropdownItem}
                    onClick={() => { setShowGenre(false); onGenreSelect && onGenreSelect(genre); }}
                  >{genre}</div>
                ))}
              </div>
            )}
          </div>
          <div
            className={styles.link}
            onMouseEnter={() => setShowLanguage(true)}
            onMouseLeave={() => setShowLanguage(false)}
            style={{ position: 'relative' }}
          >
            Browse by Language
            {showLanguage && (
              <div className={styles.menuDropdown} ref={dropdownRef}>
                {languages.map(lang => (
                  <div
                    key={lang}
                    className={styles.menuDropdownItem}
                    onClick={() => { setShowLanguage(false); onLanguageSelect && onLanguageSelect(lang); }}
                  >{lang}</div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <div className={styles.right}>
        {/* Search icon */}
        <div className={styles.icon} onClick={() => setShowSearch(s => !s)} title="Search">
          <span role="img" aria-label="search">🔍</span>
        </div>
        {showSearch && (
          <input
            className={styles.searchInput}
            type="text"
            placeholder="Search movies, TV shows..."
            autoFocus
            onBlur={() => setShowSearch(false)}
          />
        )}
        {/* Notification icon */}
        <div className={styles.icon} title="Notifications">
          <span role="img" aria-label="bell">🔔</span>
          {notificationCount > 0 && <span className={styles.badge}>{notificationCount}</span>}
        </div>
        {/* Profile avatar */}
        <div
          className={styles.profileWrapper}
          onMouseEnter={() => setShowDropdown(true)}
          onMouseLeave={() => setShowDropdown(false)}
        >
          <img src={avatarUrl} alt="profile" className={styles.profileAvatar} />
          {showDropdown && (
            <div className={styles.dropdown} ref={dropdownRef}>
              <div className={styles.dropdownProfile}>
                <img src={avatarUrl} alt="profile" className={styles.dropdownAvatar} />
                <span>{profileName}</span>
              </div>
              <div className={styles.dropdownItem} onClick={() => navigate('/profile')}>
                <span role="img" aria-label="edit">✏️</span> Manage Profiles
              </div>
              <div className={styles.dropdownItem}>
                <span role="img" aria-label="transfer">🔄</span> Transfer Profile
              </div>
              <div className={styles.dropdownItem}>
                <span role="img" aria-label="account">👤</span> Account
              </div>
              <div className={styles.dropdownItem}>
                <span role="img" aria-label="help">❓</span> Help Centre
              </div>
              <div className={styles.dropdownDivider} />
              <div className={styles.dropdownItem} onClick={() => {
                localStorage.clear();
                navigate('/login');
              }}>
                Sign out of Netflix
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar; 