import { Link } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { Page } from '../components/ui';

export default function Admin() {
  const { configured, loading, user, isAdmin } = useAuth();
  if (loading) return <Page title="Admin Dashboard"><p className="muted">Checking your secure role…</p></Page>;
  if (!configured) return <Page title="Admin Dashboard"><div className="card space-y-2"><h2 className="font-bold">Firebase setup required</h2><p>Configure Firebase first, then provision the admin claim using the trusted setup instructions.</p><Link className="btn-primary inline-block" to="/account">Account setup</Link></div></Page>;
  if (!user) return <Page title="Admin Dashboard"><div className="card space-y-3"><p>Please sign in with your admin account.</p><Link className="btn-primary inline-block" to="/account">Sign in</Link></div></Page>;
  if (!isAdmin) return <Page title="Admin Dashboard"><div className="card space-y-3"><h2 className="font-bold">Admin access not enabled</h2><p>This signed-in account does not have the trusted Firebase Admin custom claim. A user cannot promote themselves from this screen.</p><p className="muted text-sm">Signed in as: {user.email}</p><p className="text-sm">If the admin claim was just set, sign out and sign in again to refresh your token.</p></div></Page>;
  return <Page title="Admin Dashboard"><div className="card space-y-3"><p className="chip">Verified by Firebase custom claim</p><h2 className="text-xl font-bold">Welcome, BoardBuddy Admin</h2><p>Signed in as <strong>{user.email}</strong></p><p className="muted text-sm">This is the secure admin entry point. User management, teacher verification, moderation, and cloud test publishing are not implemented yet and are not represented as active features.</p><div className="grid gap-2 sm:grid-cols-2"><div className="card"><strong>Authentication</strong><p className="muted text-sm">Firebase ID token claims are checked by the client for UI access.</p></div><div className="card"><strong>Next setup</strong><p className="muted text-sm">Add Firestore/Storage-backed admin operations only alongside matching security rules and server checks.</p></div></div><Link to="/" className="btn-ghost inline-block">Back to dashboard</Link></div></Page>;
}
