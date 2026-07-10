import React,{useState} from 'react'
import { useNavigate } from 'react-router';
import { Link } from 'react-router';
import { useAuth } from "../hooks/useAuth"
const Register = () => {
  const navigate = useNavigate();
  const { loading, handleRegister } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!username.trim() || !email.trim() || !password.trim()) {
      setError("Please fill in all fields.");
      return;
    }

    try {
      await handleRegister({
        username: username.trim(),
        email: email.trim(),
        password
      });
      setUsername("");
      setEmail("");
      setPassword("");
      // Redirect to login page with success message in history state
      navigate("/login", { state: { successMessage: "Registration successful! Please login below." } });
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    }
  };

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
        <h1>Register</h1>
        {error && <div className="auth-alert error-alert">{error}</div>}
        <form onSubmit={handleSubmit} autoComplete="off">
                <div className="input-group">
                    <label htmlFor="username">Username</label>
                   <input
    type="text"
    id="username"
    name="username"
    autoComplete="off"
    placeholder="Enter your username"
    value={username}
    onChange={(e) => setUsername(e.target.value)}
/>
                </div>
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

    <button className="button primary-button">
        Register
    </button>
</form>
<p>Already have an account? <Link className="link-button" onClick={() => navigate('/login')}>Login</Link></p>
        </div>
    </main>
  )
}

export default Register
