import React, { useState, useEffect } from 'react'
import './Dashboard.css'

const API_URL = 'http://localhost:5000'

const Dashboard = ({ user }) => {
  const [wallet, setWallet] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [exchangeRates, setExchangeRates] = useState({})

  useEffect(() => {
    fetchWalletData()
    fetchTransactions()
  }, [user])

  const fetchWalletData = async () => {
    try {
      const response = await fetch(`${API_URL}/api/wallet`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      const data = await response.json()
      setWallet(data)
    } catch (error) {
      console.error('Error fetching wallet:', error)
    }
  }

  const fetchTransactions = async () => {
    try {
      const response = await fetch(`${API_URL}/api/transactions`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      const data = await response.json()
      setTransactions(data.slice(0, 10))
    } catch (error) {
      console.error('Error fetching transactions:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="dashboard-loading">Loading your wallet...</div>
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Welcome back, {user.firstName || user.username}!</h1>
        <p>Manage your digital assets</p>
      </div>

      {wallet && (
        <div className="wallet-overview">
          <div className="wallet-card primary">
            <div className="card-content">
              <label>Total Balance</label>
              <h2>${wallet.totalBalance.toFixed(2)}</h2>
              <p className="card-subtext">USD Equivalent</p>
            </div>
          </div>

          <div className="wallet-card">
            <div className="card-content">
              <label>Bitcoin</label>
              <h3>{wallet.btc.toFixed(4)} BTC</h3>
              <p className="card-subtext">${(wallet.btc * 45000).toFixed(2)}</p>
            </div>
          </div>

          <div className="wallet-card">
            <div className="card-content">
              <label>Ethereum</label>
              <h3>{wallet.eth.toFixed(4)} ETH</h3>
              <p className="card-subtext">${(wallet.eth * 2500).toFixed(2)}</p>
            </div>
          </div>

          <div className="wallet-card">
            <div className="card-content">
              <label>Stablecoin</label>
              <h3>{wallet.usdt.toFixed(2)} USDT</h3>
              <p className="card-subtext">1:1 USD</p>
            </div>
          </div>
        </div>
      )}

      <div className="dashboard-content">
        <div className="transactions-section">
          <h2>Recent Transactions</h2>
          {transactions.length > 0 ? (
            <div className="transactions-list">
              {transactions.map((tx) => (
                <div key={tx._id} className="transaction-item">
                  <div className="tx-details">
                    <div className="tx-type">{tx.type === 'send' ? '📤' : '📥'}</div>
                    <div>
                      <p className="tx-description">{tx.description}</p>
                      <p className="tx-date">{new Date(tx.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className={`tx-amount ${tx.type === 'send' ? 'send' : 'receive'}`}>
                    {tx.type === 'send' ? '-' : '+'}{tx.amount} {tx.currency}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="empty-state">No transactions yet</p>
          )}
        </div>

        <div className="quick-actions">
          <h2>Quick Actions</h2>
          <div className="actions-grid">
            <button className="action-btn">
              <span className="action-icon">💸</span>
              <span>Send</span>
            </button>
            <button className="action-btn">
              <span className="action-icon">📥</span>
              <span>Receive</span>
            </button>
            <button className="action-btn">
              <span className="action-icon">🔄</span>
              <span>Exchange</span>
            </button>
            <button className="action-btn">
              <span className="action-icon">📊</span>
              <span>Analytics</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
