// AuthPage.jsx
import { useState } from 'react'
import '../brutalist.css'
import { axiosInstance } from '@/axios'
import { AuthContext } from '@/context/auth-context'
import { useContext } from 'react'
import { useNavigate } from 'react-router-dom'

function LoginSignUp() {
  const [activeTab, setActiveTab] = useState('login')
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  })
  const navigate = useNavigate()
  const [signupForm, setSignupForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [errorMessage, setErrorMessage] = useState("WHAT")
  const { setAccessToken, setRefreshToken } = useContext(AuthContext)

  const handleLoginChange = (e) => {
    const { name, value } = e.target
    setLoginForm({
      ...loginForm,
      [name]: value
    })
  }

  const handleSignupChange = (e) => {
    const { name, value } = e.target
    setSignupForm({
      ...signupForm,
      [name]: value
    })
  }

  const handleLoginSubmit = async (e) => {
    e.preventDefault()
    try {
      console.log('Login form submitted:', loginForm)
      const response = await axiosInstance.post('/auth/login',
        {
          email: loginForm.email,
          password: loginForm.password
        }
      )
      setAccessToken(response.data.ACCESS_TOKEN)
      setRefreshToken(response.data.REFRESH_TOKEN)
      setErrorMessage(null)
      navigate("/home")
    } catch (err) {
      setErrorMessage(err);
    }

  }

  const handleSignupSubmit = async (e) => {
    e.preventDefault()
    if (signupForm.password !== signupForm.confirmPassword) {
      setErrorMessage("Passwords in both fields don't match")
      return
    }
    const response = await axiosInstance.post("/auth/register", {
      username: signupForm.username,
      email: signupForm.email,
      password: signupForm.password
    })
    setAccessToken(response?.data?.access_token)
    setRefreshToken(response?.data?.refresh_token)
  }

  return (
    <div className="brutal-container brutal-auth-container">
      <header className="brutal-header">
        <div className="brutal-logo"><span className="accent">INK</span>GRADER</div>

        <nav className="brutal-nav">
          <ul>
            <li><a href="/">HOME</a></li>
            <li><a href="/#features">FEATURES</a></li>
            <li><a href="/#faq">FAQ</a></li>
          </ul>
        </nav>
      </header>

      <main className="brutal-auth-main">
        <div className="brutal-auth-card">
          <div className="brutal-tabs">
            <button
              className={`brutal-tab ${activeTab === 'login' ? 'active' : ''}`}
              onClick={() => setActiveTab('login')}
            >
              LOGIN
            </button>
            <button
              className={`brutal-tab ${activeTab === 'signup' ? 'active' : ''}`}
              onClick={() => setActiveTab('signup')}
            >
              SIGN UP
            </button>
          </div>

          <div className="brutal-auth-content">
            {activeTab === 'login' ? (
              <form onSubmit={handleLoginSubmit} className="brutal-form gap-2">
                <h2>WELCOME BACK</h2>
                {errorMessage && (
                  <div className="bg-red-500 text-black border-4 border-black p-4 max-w-md shadow-[4px_4px_0_0_#000] font-bold">
                    Error: {errorMessage}
                  </div>
                )}


                <div className="brutal-form-group">
                  <label htmlFor="login-email">EMAIL</label>
                  <input
                    type="email"
                    id="login-email"
                    name="email"
                    value={loginForm.email}
                    onChange={handleLoginChange}
                    required
                    className="brutal-input"
                  />
                </div>

                <div className="brutal-form-group">
                  <label htmlFor="login-password">PASSWORD</label>
                  <div className="brutal-password-input">
                    <input
                      type={showPassword ? "text" : "password"}
                      id="login-password"
                      name="password"
                      value={loginForm.password}
                      onChange={handleLoginChange}
                      required
                      className="brutal-input"
                    />
                    <button
                      type="button"
                      className="brutal-password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? "HIDE" : "SHOW"}
                    </button>
                  </div>
                </div>
                <div className="brutal-form-options">
                  <label className="brutal-checkbox">
                    <input type="checkbox" />
                    <span className="checkmark"></span>
                    REMEMBER ME
                  </label>
                  <a href="#" className="brutal-link">FORGOT PASSWORD?</a>
                </div>
                <button type="submit" className="brutal-button primary full-width">LOGIN</button>
              </form>
            ) : (
              <form onSubmit={handleSignupSubmit} className="brutal-form">
                <h2>CREATE ACCOUNT</h2>
                {errorMessage && (
                  <div className="bg-red-500 text-black border-4 border-black p-4 max-w-md shadow-[4px_4px_0_0_#000] font-bold">
                    Error: {errorMessage}
                  </div>
                )}
                <div className="brutal-form-group">
                  <label htmlFor="signup-name">FULL NAME</label>
                  <input
                    type="text"
                    id="signup-name"
                    name="name"
                    value={signupForm.name}
                    onChange={handleSignupChange}
                    required
                    className="brutal-input"
                  />
                </div>

                <div className="brutal-form-group">
                  <label htmlFor="signup-email">EMAIL</label>
                  <input
                    type="email"
                    id="signup-email"
                    name="email"
                    value={signupForm.email}
                    onChange={handleSignupChange}
                    required
                    className="brutal-input"
                  />
                </div>

                <div className="brutal-form-group">
                  <label htmlFor="signup-password">PASSWORD</label>
                  <div className="brutal-password-input">
                    <input
                      type={showPassword ? "text" : "password"}
                      id="signup-password"
                      name="password"
                      value={signupForm.password}
                      onChange={handleSignupChange}
                      required
                      className="brutal-input"
                      minLength="8"
                    />
                    <button
                      type="button"
                      className="brutal-password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? "HIDE" : "SHOW"}
                    </button>
                  </div>
                </div>

                <div className="brutal-form-group">
                  <label htmlFor="signup-confirm-password">CONFIRM PASSWORD</label>
                  <input
                    type={showPassword ? "text" : "password"}
                    id="signup-confirm-password"
                    name="confirmPassword"
                    value={signupForm.confirmPassword}
                    onChange={handleSignupChange}
                    required
                    className="brutal-input"
                    minLength="8"
                  />
                </div>

                <div className="brutal-form-options">
                  <label className="brutal-checkbox gap-2">
                    <input type="checkbox" required />
                    <span className="checkmark"></span>
                    I AGREE TO THE <a href="#" className="brutal-link"> TERMS</a>
                  </label>
                </div>

                <button type="submit" className="brutal-button primary full-width">CREATE ACCOUNT</button>
              </form>
            )}
          </div>
        </div>

        <div className="brutal-auth-decoration">
          <div className="brutal-box"></div>
          <div className="brutal-box accent"></div>
          <div className="brutal-box dark"></div>
        </div>
      </main>

      <footer className="brutal-footer">
        <div className="brutal-copyright">
          © 2025 INKGRADER. ALL RIGHTS RESERVED.
        </div>
      </footer>
    </div>
  )
}

export default LoginSignUp