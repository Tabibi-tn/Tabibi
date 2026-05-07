import { useState, useEffect, useRef, useContext } from 'react'
import api from '../api'
import { useParams } from 'react-router-dom'
import { AuthContext } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'

export default function Messages() {
  const { userId } = useParams()
  const { user } = useContext(AuthContext)
  const { toast } = useToast()
  const [conversations, setConversations] = useState([])
  const [activeConv, setActiveConv] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef(null)
  const pollRef = useRef(null)

  useEffect(() => {
    fetchConversations()
    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  }, [])

  useEffect(() => {
    if (!userId || userId === '0' || String(userId) === String(user?.id)) return
    if (conversations.length === 0) {
      setActiveConv({ otherUserId: parseInt(userId, 10), name: 'User' })
    } else {
      const match = conversations.find(c => String(c.otherUserId) === String(userId))
      setActiveConv(match || { otherUserId: parseInt(userId, 10), name: 'User' })
    }
  }, [userId, conversations])

  useEffect(() => {
    if (!activeConv) return
    fetchMessages(activeConv.otherUserId)
    if (pollRef.current) clearInterval(pollRef.current)
    pollRef.current = setInterval(() => fetchMessages(activeConv.otherUserId), 5000)
    return () => clearInterval(pollRef.current)
  }, [activeConv?.otherUserId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const fetchConversations = async () => {
    try {
      const res = await api.get('/messages/conversations')
      setConversations(res.data)
    } catch (err) {
      console.error('Failed to load conversations:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchMessages = async (otherId) => {
    try {
      const res = await api.get(`/messages/conversation/${otherId}`)
      setMessages(res.data)
    } catch (err) {
      console.error('Failed to load messages:', err)
    }
  }

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim() || !activeConv || sending) return
    setSending(true)
    try {
      await api.post('/messages', { receiverId: activeConv.otherUserId, content: newMessage.trim() })
      setNewMessage('')
      await fetchMessages(activeConv.otherUserId)
      fetchConversations()
    } catch (err) {
      toast('Failed to send message. Please try again.', 'error')
    } finally {
      setSending(false)
    }
  }

  const getInitials = (name) => {
    if (!name) return 'U'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const formatDate = (dateString) => {
    const d = new Date(dateString)
    const today = new Date()
    if (d.toDateString() === today.toDateString()) return 'Today'
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday'
    return d.toLocaleDateString()
  }

  if (loading) {
    return (
      <div className="page">
        <div className="container">
          <div className="text-center" style={{ padding: '3rem' }}>
            <div className="spinner"></div>
            <p>Loading messages...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">Messages</h1>
          <p className="page-subtitle">Communicate securely with your healthcare team</p>
        </div>

        <div className="messages-container">
          {/* Conversations Sidebar */}
          <div className="conversations-list">
            <div style={{ padding: 'var(--space-4)', borderBottom: '1px solid var(--gray-100)' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--gray-900)', margin: 0 }}>
                Conversations
              </h3>
            </div>

            {conversations.length === 0 ? (
              <div style={{ padding: 'var(--space-6)', textAlign: 'center', color: 'var(--gray-400)', fontSize: '0.875rem' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>💬</div>
                No conversations yet
              </div>
            ) : (
              conversations.map(conv => (
                <div
                  key={conv.otherUserId}
                  className={`conversation-item ${activeConv?.otherUserId === conv.otherUserId ? 'active' : ''}`}
                  onClick={() => setActiveConv(conv)}
                >
                  <div className="conversation-avatar">{getInitials(conv.name)}</div>
                  <div className="conversation-info">
                    <div className="conversation-name">{conv.name}</div>
                    {conv.lastMessage && (
                      <div className="conversation-preview">{conv.lastMessage}</div>
                    )}
                  </div>
                  {conv.lastMessageAt && (
                    <div style={{ fontSize: '0.6875rem', color: 'var(--gray-400)', flexShrink: 0 }}>
                      {formatDate(conv.lastMessageAt)}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Chat Area */}
          <div className="chat-area">
            {activeConv ? (
              <>
                <div className="chat-header">
                  <div className="conversation-avatar">{getInitials(activeConv.name)}</div>
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--gray-900)' }}>{activeConv.name}</div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--accent)' }}>● Online</div>
                  </div>
                </div>

                <div className="chat-messages">
                  {messages.length === 0 ? (
                    <div style={{ textAlign: 'center', color: 'var(--gray-400)', marginTop: '2rem', fontSize: '0.875rem' }}>
                      <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>👋</div>
                      Start the conversation!
                    </div>
                  ) : (
                    messages.map((msg, i) => {
                      const isSent = msg.senderId === user.id
                      return (
                        <div key={i} className={`message ${isSent ? 'sent' : 'received'}`}>
                          <div>{msg.content}</div>
                          <div className="message-time">{formatTime(msg.createdAt)}</div>
                        </div>
                      )
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <div className="chat-input-area">
                  <form onSubmit={sendMessage} style={{ display: 'flex', gap: 'var(--space-3)', flex: 1 }}>
                    <input
                      type="text"
                      className="chat-input"
                      value={newMessage}
                      onChange={e => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                    />
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={sending || !newMessage.trim()}
                    >
                      {sending ? '...' : 'Send'}
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                color: 'var(--gray-400)',
                gap: '1rem'
              }}>
                <div style={{ fontSize: '4rem' }}>💬</div>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontWeight: 500, color: 'var(--gray-600)', marginBottom: '0.25rem' }}>
                    Select a conversation
                  </p>
                  <p style={{ fontSize: '0.875rem', marginBottom: 0 }}>
                    Choose from your conversations on the left
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
