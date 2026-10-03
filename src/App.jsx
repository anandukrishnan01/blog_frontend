import { BrowserRouter, Routes, Route, Link, useNavigate, Navigate, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import api from './api';
import { PenSquare, LogOut, User as UserIcon } from 'lucide-react';
import './index.css';

function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const endpoint = isLogin ? 'auth/login/' : 'auth/register/';
      const { data } = await api.post(endpoint, { username, password });
      localStorage.setItem('token', data.token);
      localStorage.setItem('username', data.username);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid credentials or username taken');
    }
  };

  return (
    <div className="container" style={{ maxWidth: '400px', marginTop: '10vh' }}>
      <div className="card">
        <h2 className="header-title text-center mb-4">{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Username</label>
            <input className="form-input" value={username} onChange={e => setUsername(e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input type="password" className="form-input" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          {error && <p className="error-text">{error}</p>}
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
            {isLogin ? 'Sign In' : 'Sign Up'}
          </button>
        </form>
        <p className="text-center mt-4" style={{ fontSize: '0.875rem' }}>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontWeight: '500', fontSize: '0.875rem' }} onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? 'Sign Up' : 'Sign In'}
          </button>
        </p>
      </div>
    </div>
  );
}

function BlogList() {
  const [blogs, setBlogs] = useState([]);
  const username = localStorage.getItem('username');
  const navigate = useNavigate();

  useEffect(() => {
    api.get('v1/blog/').then(res => setBlogs(res.data)).catch(console.error);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/auth');
  };

  return (
    <div className="container">
      <header className="header">
        <h1 className="header-title">Minimal Blog</h1>
        <div className="header-nav">
          {username ? (
            <>
              <span style={{display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: 500}}>
                <UserIcon size={16} /> {username}
              </span>
              <Link to="/create" className="btn btn-accent" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
                <PenSquare size={16} style={{marginRight: '0.5rem'}} /> Write
              </Link>
              <button onClick={handleLogout} className="btn" style={{ padding: '0.5rem', background: 'transparent' }} title="Logout">
                <LogOut size={20} color="var(--text-muted)" />
              </button>
            </>
          ) : (
            <Link to="/auth" className="btn btn-primary">Sign In</Link>
          )}
        </div>
      </header>

      <div className="blog-list">
        {blogs.map(blog => (
          <article key={blog.id} className="card card-no-padding">
            <Link to={`/blog/${blog.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
              {blog.image && <img src={blog.image} alt={blog.title} className="card-image" />}
              <div className="card-body">
                <h2 className="card-title">{blog.title}</h2>
                <div className="card-meta">By {blog.author_username} &bull; {new Date(blog.created_at).toLocaleDateString()}</div>
                <p className="card-content">{blog.content.length > 150 ? blog.content.substring(0, 150) + '...' : blog.content}</p>
              </div>
            </Link>
          </article>
        ))}
        {blogs.length === 0 && <p className="text-center text-muted mt-4">No blogs found. Be the first to write!</p>}
      </div>
    </div>
  );
}

function BlogDetail() {
  const { id } = useParams();
  const [blog, setBlog] = useState(null);
  
  useEffect(() => {
    api.get(`v1/blog/${id}/`).then(res => setBlog(res.data)).catch(console.error);
  }, [id]);

  if (!blog) return <div className="container text-center mt-4">Loading...</div>;

  return (
    <div className="container">
      <header className="header">
        <Link to="/" style={{ color: 'var(--text-muted)', fontWeight: 500 }}>&larr; Back home</Link>
      </header>
      <article className="card" style={{ padding: '3rem 2rem' }}>
        {blog.image && <img src={blog.image} alt={blog.title} className="blog-detail-image" />}
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: 'var(--text-main)' }}>{blog.title}</h1>
        <div className="card-meta" style={{ marginBottom: '2rem', fontSize: '1rem' }}>
          Written by <strong style={{color: 'var(--primary)'}}>{blog.author_username}</strong> &bull; {new Date(blog.created_at).toLocaleDateString()}
        </div>
        <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.8, color: 'var(--text-main)', fontSize: '1.125rem' }}>
          {blog.content}
        </div>
      </article>
    </div>
  );
}

function CreateBlog() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('content', content);
      if (image) formData.append('image', image);

      await api.post('v1/blog/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      navigate('/');
    } catch (err) {
      console.error(err);
      setError('Failed to create post. Please try again.');
    }
  };

  return (
    <div className="container">
      <header className="header">
        <Link to="/" style={{ color: 'var(--text-muted)', fontWeight: 500 }}>&larr; Back home</Link>
        <h2 className="header-title" style={{fontSize: '1.25rem', marginBottom: 0}}>Write a post</h2>
      </header>
      <form onSubmit={handleSubmit} className="card">
        <div className="form-group">
          <label className="form-label">Title</label>
          <input className="form-input" value={title} onChange={e => setTitle(e.target.value)} placeholder="Give it a catchy title..." required />
        </div>
        <div className="form-group">
          <label className="form-label">Cover Image (Optional)</label>
          <input type="file" className="form-input" accept="image/*" onChange={e => setImage(e.target.files[0])} />
        </div>
        <div className="form-group">
          <label className="form-label">Content</label>
          <textarea className="form-textarea" value={content} onChange={e => setContent(e.target.value)} placeholder="Write your thoughts here..." required />
        </div>
        {error && <p className="error-text mb-4">{error}</p>}
        <button type="submit" className="btn btn-primary">Publish Post</button>
      </form>
    </div>
  );
}

const PrivateRoute = ({ children }) => {
  return localStorage.getItem('token') ? children : <Navigate to="/auth" />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<BlogList />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/blog/:id" element={<BlogDetail />} />
        <Route path="/create" element={<PrivateRoute><CreateBlog /></PrivateRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
