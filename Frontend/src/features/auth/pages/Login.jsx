import React,{useState}from 'react'
import '../auth.form.scss'
import { useNavigate, useLocation, Link } from 'react-router';
import { useAuth } from "../hooks/useAuth"
import GoogleButton from "../components/GoogleButton";

const Login = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { loading, handleLogin } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(location.state?.successMessage || null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        if (!email.trim() || !password.trim()) {
            setError("Please fill in all fields.");
            return;
        }

        try {
            await handleLogin(email.trim(), password);
            setEmail("");
            setPassword("");
            navigate("/dashboard");
        } catch (err) {
            setError(err.message || "Invalid email or password.");
        }
    }

    if (loading) {
        return (
            <main>
                <div className="loader-container">
                    <div className="loader"></div>
                    <p>Please wait...</p>
                </div>
            </main>
        );
    }

    return (
        <main>
            <div className="form-container">
                <h1>Login</h1>
                {error && <div className="auth-alert error-alert">{error}</div>}
                {success && <div className="auth-alert success-alert">{success}</div>}
                <form onSubmit={handleSubmit} autoComplete="off">
    <div className="input-group">
        <label htmlFor="email">Email</label>
 <input
    type="email"
    id="email"
    name="email"
    autoComplete="off"
    placeholder="Enter your email"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
/>
    </div>

    <div className="input-group">
        <label htmlFor="password">Password</label>
<input
    type="password"
    id="password"
    name="password"
    autoComplete="new-password"
    placeholder="Enter your password"
    value={password}
    onChange={(e) => setPassword(e.target.value)}
/>
    </div>
    <button type="submit" className="button primary-button">Login</button>
<div className="divider">
  <span>OR</span>
</div>
<GoogleButton />
</form>
<p>Don't have an account? <Link className="link-button" onClick={() => navigate('/register')}>Register</Link></p>
        </div>
    </main>
  )
}

export default Login
