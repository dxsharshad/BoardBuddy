import { useState } from 'react';
import { Link } from 'react-router-dom';
import { createUserWithEmailAndPassword, sendEmailVerification, sendPasswordResetEmail, signInWithEmailAndPassword, signInWithPopup, signOut, updateProfile } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, googleProvider, firebaseConfigured } from '../lib/firebase';
import { useAuth } from '../lib/auth';
import { Page } from '../components/ui';

export default function Account() {
  const { user, isAdmin, isTeacher, refreshClaims } = useAuth();
  const [mode, setMode] = useState<'login'|'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const run = async (fn: () => Promise<unknown>) => { setBusy(true); setError(''); setMessage(''); try { await fn(); } catch (e) { setError(friendlyError(e)); } finally { setBusy(false); } };
  const register = async () => {
    if (!auth || !db) throw new Error('Firebase is not configured.');
    if (name.trim().length < 2) throw new Error('Enter your display name (at least 2 characters).');
    const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
    await updateProfile(cred.user, { displayName: name.trim() });
    await sendEmailVerification(cred.user);
    await setDoc(doc(db, 'users', cred.user.uid), { uid: cred.user.uid, email: cred.user.email, displayName: name.trim(), photoURL: cred.user.photoURL || '', role: 'student', verified: false, createdAt: serverTimestamp() });
    await refreshClaims();
    setMessage('Account created. Check your email to verify it. Your account has student permissions by default.');
  };
  const google = async () => {
    if (!auth || !db) throw new Error('Firebase is not configured.');
    const cred = await signInWithPopup(auth, googleProvider);
    const userRef = doc(db, 'users', cred.user.uid);
    const existing = await getDoc(userRef);
    if (!existing.exists()) {
      await setDoc(userRef, { uid: cred.user.uid, email: cred.user.email, displayName: cred.user.displayName || '', photoURL: cred.user.photoURL || '', role: 'student', verified: false, createdAt: serverTimestamp() });
    }
    await refreshClaims();
    setMessage('Signed in with Google. New accounts have student permissions by default.');
  };
  if (!firebaseConfigured) return <Page title="Account"><div className="card space-y-3"><h2 className="text-lg font-bold">Firebase setup required</h2><p>Authentication is ready in the code, but no Firebase web configuration is present yet. Follow <code>FIREBASE_GEMINI_SETUP.md</code>, add the VITE_FIREBASE_* values to your deployment environment, then rebuild.</p></div></Page>;
  if (user) return <Page title="Your account"><div className="card space-y-3"><div className="flex items-center gap-3">{user.photoURL && <img src={user.photoURL} alt="Profile" className="w-12 h-12 rounded-full" />}<div><h2 className="font-bold text-lg">{user.displayName || 'BoardBuddy user'}</h2><p className="muted text-sm">{user.email}</p></div></div><p className="text-sm">Role: <strong>{isAdmin ? 'Admin' : isTeacher ? 'Teacher (custom claim)' : 'Student'}</strong></p>{isAdmin && <Link className="btn-primary inline-block" to="/admin">Open Admin Dashboard</Link>}<button className="btn-ghost w-full" onClick={() => void run(async () => { if (auth) await signOut(auth); })} disabled={busy}>Sign out</button></div></Page>;
  return <Page title="Sign in / Create account"><div className="card space-y-4"><div className="flex gap-2"><button className={mode==='login'?'btn-primary flex-1':'btn-ghost flex-1'} onClick={()=>setMode('login')}>Sign in</button><button className={mode==='register'?'btn-primary flex-1':'btn-ghost flex-1'} onClick={()=>setMode('register')}>Create account</button></div>{mode==='register' && <label className="block space-y-1"><span className="text-sm font-medium">Display name</span><input className="input" value={name} onChange={e=>setName(e.target.value)} autoComplete="name" /></label>}<label className="block space-y-1"><span className="text-sm font-medium">Email</span><input className="input" type="email" value={email} onChange={e=>setEmail(e.target.value)} autoComplete="email" /></label><label className="block space-y-1"><span className="text-sm font-medium">Password</span><input className="input" type="password" value={password} onChange={e=>setPassword(e.target.value)} autoComplete={mode==='login'?'current-password':'new-password'} minLength={6} /></label><button className="btn-primary w-full" disabled={busy} onClick={()=>void run(async()=>{if(!auth) throw new Error('Firebase is not configured.'); if(mode==='register') await register(); else { await signInWithEmailAndPassword(auth,email.trim(),password); await refreshClaims(); setMessage('Signed in successfully.'); }})}>{busy?'Please wait…':mode==='login'?'Sign in':'Create account'}</button><button className="btn-ghost w-full" disabled={busy} onClick={()=>void run(google)}>Continue with Google</button><button className="text-sm underline w-full" disabled={busy} onClick={()=>void run(async()=>{if(!auth) throw new Error('Firebase is not configured.'); if(!email.trim()) throw new Error('Enter your email first.'); await sendPasswordResetEmail(auth,email.trim()); setMessage('Password reset email sent if the account exists.');})}>Forgot password?</button>{message && <p className="text-sm text-green-700 dark:text-green-300" role="status">{message}</p>}{error && <p className="text-sm text-red-600" role="alert">{error}</p>}<p className="muted text-xs">New accounts are students by default. Email/password registrations receive a verification email. Admin permissions are assigned only through trusted server-side provisioning, never from this form.</p></div></Page>;
}
function friendlyError(e: unknown) { const code = (e as {code?:string})?.code; const messages: Record<string,string> = {'auth/invalid-credential':'Email or password is incorrect.','auth/email-already-in-use':'An account already exists for this email.','auth/weak-password':'Use a password with at least 6 characters.','auth/invalid-email':'Enter a valid email address.','auth/popup-closed-by-user':'Google sign-in was cancelled.','auth/unauthorized-domain':'Add this website domain in Firebase Authentication settings.'}; return messages[code || ''] || (e instanceof Error ? e.message : 'Something went wrong. Please try again.'); }
