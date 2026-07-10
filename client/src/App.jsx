import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { io } from 'socket.io-client'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import AdminPanel from './pages/AdminPanel'
import KYC from './pages/KYC'
import Support from './pages/Support'
import Navbar from './components/Navbar'
import './App.css'

const API_URL = 'http://localhost:5000'
let socket = null

function App() {
  const [user, setUser] = useState(null)
  const [theme, setTheme] = useState('dark')
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const savedTheme = localStorage.getItem('theme') || 'dark'
    setTheme(savedTheme)
    document.body.className = `${savedTheme}-mode`

    if (token) {
      fetchCurrentUser(token)
    } else {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (user) {
      initSocket()
    }
    return () => {
      if (socket) {
        socket.disconnect()
      }
    }
  }, [user])

  const fetchCurrentUser = async (token) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
      } else {
        localStorage.removeItem('token')
      }
    } catch (error) {
      console.error('Error fetching user:', error)
    } finally {
      setLoading(false)
    }
  }

  const initSocket = () => {
    socket = io(API_URL, {
      auth: {
        token: localStorage.getItem('token')
      }
    })

    socket.on('connect', () => {
      console.log('Connected to server')
      if (user?.isAdmin) {
        socket.emit('join_admin', user._id)
      } else {
        socket.emit('join_user', user._id)
      }
    })

    socket.on('notification', (data) => {
      addNotification(data.message, 'success')
    })

    socket.on('kyc_approved', (data) => {
      addNotification(data.message, 'success')
    })

    socket.on('kyc_rejected', (data) => {
      addNotification(data.message, 'error')
    })
  }

  const addNotification = (message, type = 'info') => {
    const id = Date.now()
    setNotifications(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id))
    }, 4000)
  }

  const handleLogin = (userData, token) => {
    localStorage.setItem('token', token)
    setUser(userData)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    setUser(null)
    if (socket) {
      socket.disconnect()
    }
  }

  const handleThemeToggle = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
    document.body.className = `${newTheme}-mode`

    if (user) {
      fetch(`${API_URL}/api/auth/theme`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ theme: newTheme })
      })
    }
  }

  if (loading) {
    return <div className="loading-spinner">Loading...</div>
  }

  return (
    <Router>
      <div className={`app ${theme}-mode`}>
        {user && <Navbar user={user} onLogout={handleLogout} onThemeToggle={handleThemeToggle} theme={theme} />}
        
        <div className="notifications-container">
          {notifications.map(notification => (
            <div key={notification.id} className={`notification notification-${notification.type}`}>
              {notification.message}
            </div>
          ))}
        </div>

        <Routes>
          <Route path="/login" element={user ? <Navigate to="/" /> : <Login onLogin={handleLogin} />} />
          <Route path="/register" element={user ? <Navigate to="/" /> : <Register onLogin={handleLogin} />} />
          <Route path="/" element={user ? (user.isAdmin ? <Navigate to="/admin" /> : <Dashboard user={user} />) : <Navigate to="/login" />} />
          <Route path="/admin" element={user?.isAdmin ? <AdminPanel user={user} /> : <Navigate to="/" />} />
          <Route path="/kyc" element={user ? <KYC user={user} /> : <Navigate to="/login" />} />
          <Route path="/support" element={user ? <Support user={user} /> : <Navigate to="/login" />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
