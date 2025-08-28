import React, { useState } from 'react';

function App() {
  const [token, setToken] = useState('');
  const [email, setEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [tasks, setTasks] = useState([]);
  const [hello, setHello] = useState({});
  const [helloStatus, setHelloStatus] = useState('');
  const [registerStatus, setRegisterStatus] = useState('');
  const [loginStatus, setLoginStatus] = useState('');
  const [createTaskStatus, setCreateTaskStatus] = useState('');
  const [taskName, setTaskName] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskStatus, setTaskStatus] = useState('');

  console.log('EEEEEEEEEE import.meta.env:', JSON.stringify(import.meta.env));
  console.log('FFFFFFFFFF process.env:', JSON.stringify(process.env));

  let BASE_URL = '';
  const API_URL = import.meta.env.VITE_API_URL;
  if (API_URL) {
    BASE_URL = `${API_URL}/api`;
  } else {
    BASE_URL = 'http://localhost:3000/api';
  }

  console.log('GGGGGGGGGG BASE_URL:', BASE_URL);

  const fetchHello = async () => {
    setHelloStatus('');
    try {
      const res = await fetch(`${BASE_URL}/`);
      const data = await res.text();
      setHello(data);
    } catch (e) {
      setHelloStatus('Error fetching hello! ' + e.message);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setRegisterStatus('');
    try {
      const res = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: userName, email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        setRegisterStatus('Registration successful!');
      } else {
        setRegisterStatus('Registration failed!');
      }
    } catch (e) {
      setRegisterStatus('Registration error! ' + e.message);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginStatus('');
    try {
      const res = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.accessToken) {
        setToken(data.accessToken);
        setLoginStatus('Login successful!');
      } else {
        setLoginStatus('Login failed!');
      }
    } catch (e) {
      setLoginStatus('Login error! ' + e.message);
    }
  };

  const createTask = async (e) => {
    e.preventDefault();
    setCreateTaskStatus('');
    try {
      const res = await fetch(`${BASE_URL}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title: taskName, description: taskDesc, status: taskStatus }),
      });
      const data = await res.json();
      if (res.ok) {
        setCreateTaskStatus('Task created successfully!');
      } else {
        setCreateTaskStatus('Task creation failed!');
      }
    } catch (e) {
      setCreateTaskStatus('Task creation error! ' + e.message);
    }
  };

  const fetchTasks = async () => {
    if (!token) {
      setLoginStatus('Please login first!');
      return;
    }
    try {
      const res = await fetch(`${BASE_URL}/tasks`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setTasks(data);
    } catch (e) {
      setLoginStatus('Error fetching tasks! ' + e.message);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '2rem auto', fontFamily: 'sans-serif' }}>
      <h2>Hello</h2>
      <button onClick={fetchHello} style={{ width: '100%' }}>Fetch Hello</button>
      <pre>{JSON.stringify(hello, null, 2)}  + {helloStatus}</pre>
      <h2>Register</h2>
      <form onSubmit={handleRegister}>
        <input
          type="text"
          placeholder="Name"
          value={userName}
          required
          onChange={e => setUserName(e.target.value)}
          style={{ width: '100%', marginBottom: 8 }}
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          required
          onChange={e => setEmail(e.target.value)}
          style={{ width: '100%', marginBottom: 8 }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          required
          onChange={e => setPassword(e.target.value)}
          style={{ width: '100%', marginBottom: 8 }}
        />
        <button type="submit" style={{ width: '100%' }}>Register</button>
      </form>
      <p>{registerStatus}</p>
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          required
          onChange={e => setEmail(e.target.value)}
          style={{ width: '100%', marginBottom: 8 }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          required
          onChange={e => setPassword(e.target.value)}
          style={{ width: '100%', marginBottom: 8 }}
        />
        <button type="submit" style={{ width: '100%' }}>Login</button>
      </form>
      <p>{loginStatus}</p>
      <h2>Create Task</h2>
      <form onSubmit={createTask}>
        <input
          type="text"
          placeholder="Task Name"
          value={taskName}
          required
          onChange={e => setTaskName(e.target.value)}
          style={{ width: '100%', marginBottom: 8 }}
        />
        <input
          type="text"
          placeholder="Task Description"
          value={taskDesc}
          required
          onChange={e => setTaskDesc(e.target.value)}
          style={{ width: '100%', marginBottom: 8 }}
        />
        <select
          value={taskStatus}
          required
          onChange={e => setTaskStatus(e.target.value)}
          style={{ width: '100%', marginBottom: 8 }}
        >
          <option value="">Select Status</option>
          <option value="OPEN">OPEN</option>
          <option value="IN_PROGRESS">IN_PROGRESS</option>
          <option value="DONE">DONE</option>
        </select>
        <button type="submit" style={{ width: '100%' }}>Create Task</button>
        <pre>{JSON.stringify(createTaskStatus, null, 2)}</pre>
      </form>
      <h2>Get Tasks</h2>
      <button onClick={fetchTasks} style={{ width: '100%' }}>Fetch Tasks</button>
      <pre>{JSON.stringify(tasks, null, 2)}</pre>
    </div>
  );
}

export default App;

// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
// import './App.css'

// function App() {
//   const [count, setCount] = useState(0)

//   return (
//     <>
//       <div>
//         <a href="https://vite.dev" target="_blank">
//           <img src={viteLogo} className="logo" alt="Vite logo" />
//         </a>
//         <a href="https://react.dev" target="_blank">
//           <img src={reactLogo} className="logo react" alt="React logo" />
//         </a>
//       </div>
//       <h1>Vite + React</h1>
//       <div className="card">
//         <button onClick={() => setCount((count) => count + 1)}>
//           count is {count}
//         </button>
//         <p>
//           Edit <code>src/App.jsx</code> and save to test HMR
//         </p>
//       </div>
//       <p className="read-the-docs">
//         Click on the Vite and React logos to learn more
//       </p>
//     </>
//   )
// }

// export default App
