import React, { useState } from 'react';
import axios from 'axios';
import { createCommitment } from '@utils/commitment.js';
import { generateProof } from '@utils/proof.js';

const API = 'http://localhost:4000';

export default function App() {
  const [mode, setMode] = useState('signup');
  const [email, setEmail] = useState('');
  const [pwd, setPwd] = useState('');
  const [message, setMessage] = useState('');

  const toggle = () => {
    setMode(mode === 'signup' ? 'login' : 'signup');
    setMessage('');
  };

  async function handleSignup(e) {
    e.preventDefault();
    try {
      const { saltHex, commitmentHex } = await createCommitment(pwd);
      await axios.post(`${API}/signup`, { email, saltHex, commitmentHex });
      setMessage('🟢 Signup success. Switch to login.');
    } catch (err) {
      console.error(err);
      setMessage('🔴 Signup failed');
    }
  }

  async function handleLogin(e) {
    e.preventDefault();
    setMessage('🔄 Logging in...');
    try {
      // Step 1: Get login data
      console.log('Step 1: Fetching login data for email:', email);
      const { data } = await axios.get(`${API}/loginData`, { params: { email } });
      console.log('Login data received:', data);
      
      // Step 2: Generate proof
      console.log('Step 2: Generating proof...');
      const { proof, publicSignals } = await generateProof(pwd, data.saltHex, data.commitmentHex);
      console.log('Proof generated:', { proof, publicSignals });
      
      // Step 3: Submit proof for verification
      console.log('Step 3: Submitting proof for verification...');
      const response = await axios.post(`${API}/login`, { email, proof, publicSignals });
      console.log('Login response:', response.data);
      
      setMessage('🟢 Login verified!');
    } catch (err) {
      console.error('Login error details:', err);
      
      if (err.response) {
        // Server responded with error status
        const status = err.response.status;
        const message = err.response.data;
        console.error(`Server error ${status}:`, message);
        
        if (status === 404) {
          setMessage('🔴 User not found. Please signup first.');
        } else if (status === 401) {
          setMessage('🔴 Invalid password. Proof verification failed.');
        } else if (status === 500) {
          setMessage('🔴 Server error. Missing verification key or circuit issue.');
        } else {
          setMessage(`🔴 Server error (${status}): ${message}`);
        }
      } else if (err.code === 'ECONNREFUSED') {
        setMessage('🔴 Cannot connect to server. Is it running on port 4000?');
      } else {
        // Client-side error (proof generation, etc.)
        setMessage('🔴 Login failed: ' + err.message);
      }
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-8 p-4">
      <h1 className="text-3xl font-bold text-neon tracking-widest">ZK LOGIN</h1>

      <form
        onSubmit={mode === 'signup' ? handleSignup : handleLogin}
        className="w-full max-w-sm flex flex-col gap-4 bg-cyberBg/50 p-6 rounded-lg border border-neon shadow-neon"
      >
        <label className="flex flex-col gap-1">
          <span>Email</span>
          <input
            className="bg-transparent border-b border-neon focus:outline-none px-1"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <label className="flex flex-col gap-1">
          <span>Password</span>
          <input
            className="bg-transparent border-b border-neon focus:outline-none px-1"
            type="password"
            value={pwd}
            onChange={(e) => setPwd(e.target.value)}
            required
          />
        </label>
        <button
          className="mt-4 py-2 border border-neon hover:bg-neon hover:text-cyberBg transition-colors"
          type="submit"
        >
          {mode === 'signup' ? 'Signup' : 'Login'}
        </button>
        <button type="button" onClick={toggle} className="text-sm text-magenta underline self-end">
          {mode === 'signup' ? 'Have an account? Login' : 'Need account? Signup'}
        </button>
        {message && <p className="mt-2 text-center">{message}</p>}
      </form>

      <p className="text-xs text-magenta">Futuristic Cybertron Theme 🌐</p>
    </div>
  );
} 