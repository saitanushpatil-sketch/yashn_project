import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { auth, isFirebaseConfigured } from '../lib/firebase';
import { sendSignInLinkToEmail, isSignInWithEmailLink, signInWithEmailLink } from 'firebase/auth';
import { ArrowRight, UserCircle } from 'lucide-react';
import './Auth.css';

export default function Auth({ onAuthSuccess }) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle, loading, sent, verifying, error
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!auth || !isFirebaseConfigured) return;

    // Check if returning from email link
    if (isSignInWithEmailLink(auth, window.location.href)) {
      setStatus('verifying');
      let savedEmail = window.localStorage.getItem('emailForSignIn');
      
      if (!savedEmail) {
        savedEmail = window.prompt('Please provide your email for confirmation');
      }

      if (savedEmail) {
        signInWithEmailLink(auth, savedEmail, window.location.href)
          .then((result) => {
            window.localStorage.removeItem('emailForSignIn');
            onAuthSuccess(result.user);
          })
          .catch((error) => {
            setStatus('error');
            setErrorMessage(error.message);
          });
      } else {
        setStatus('error');
        setErrorMessage('Verification failed. No email provided.');
      }
    }
  }, [onAuthSuccess]);

  const handleSendLink = async (e) => {
    e.preventDefault();
    if (!email || !auth || !isFirebaseConfigured) return;

    setStatus('loading');
    
    const actionCodeSettings = {
      url: window.location.href,
      handleCodeInApp: true,
    };

    try {
      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      window.localStorage.setItem('emailForSignIn', email);
      setStatus('sent');
    } catch (error) {
      console.error(error);
      setStatus('error');
      setErrorMessage(error.message);
    }
  };

  const handleGuestSignIn = () => {
    onAuthSuccess({ uid: 'guest', email: 'Guest' });
  };

  if (status === 'verifying') {
    return (
      <div className="auth-container">
        <motion.div 
          className="auth-status-msg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="typing-stars" style={{ justifyContent: 'center' }}>
            <span className="star-icon">✦</span>
            <span className="star-icon">✦</span>
            <span className="star-icon">✦</span>
          </div>
          <p>Verifying your presence...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <motion.div 
        className="auth-box glass-panel"
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
      >
        <h2 className="auth-title">Identify Yourself</h2>
        
        {status === 'sent' ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="auth-success"
          >
            <p>An invitation has been sent to</p>
            <p className="auth-email">{email}</p>
            <p className="auth-subtext">Click the link in your email to enter.</p>
          </motion.div>
        ) : (
          <form onSubmit={handleSendLink} className="auth-form">
            {!isFirebaseConfigured ? (
              <div className="auth-warning">
                <p>Authentication services are currently offline.</p>
              </div>
            ) : (
              <div className="input-wrapper">
                <input 
                  type="email" 
                  placeholder="Your email address" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="auth-input"
                  disabled={status === 'loading'}
                />
                <button 
                  type="submit" 
                  className="auth-submit-btn"
                  disabled={status === 'loading' || !email}
                >
                  {status === 'loading' ? (
                     <span className="star-icon">✦</span>
                  ) : (
                    <ArrowRight size={20} />
                  )}
                </button>
              </div>
            )}
            
            {status === 'error' && (
              <p className="auth-error">{errorMessage}</p>
            )}

            <div className="auth-divider">
              <span>OR</span>
            </div>

            <button 
              type="button" 
              className="auth-guest-btn"
              onClick={handleGuestSignIn}
            >
              <UserCircle size={20} />
              Continue as Guest
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
