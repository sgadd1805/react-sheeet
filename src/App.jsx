import { useState, useMemo } from "react";

const S = {
  bg: "#08080f", card: "rgba(12,12,26,0.9)", text: "#e2e8f0",
  muted: "#64748b", dim: "#334155", pre: "rgba(0,0,0,0.55)",
  font: "'Fira Code', monospace",
};

const SECTIONS = [
  { id:"fn-comp", color:"#F97316", label:"Functional Components",
    desc:"Plain JS functions that return JSX. The modern way to write React.",
    note:"Hooks only work inside functional components. Prefer function declarations for top-level components — they show up better in stack traces.",
    code:`// Basic
function Greeting({ name }) {
  return <h1>Hello, {name}!</h1>;
}

// Arrow + default prop
const Btn = ({ label, onClick, disabled = false }) => (
  <button onClick={onClick} disabled={disabled}>{label}</button>
);

// Fragment — no extra DOM wrapper
function List() {
  return (
    <>
      <li>Apple</li>
      <li>Mango</li>
    </>
  );
}`},

  { id:"comp-patterns", color:"#C084FC", label:"Component Patterns",
    desc:"Composition, compound components, render props, HOCs, and custom hooks.",
    note:"Prefer composition and custom hooks over HOCs/render-props in modern React — simpler and hook-friendly.",
    code:`// 1. Composition
function Card({ children, footer }) {
  return (
    <div>
      <div>{children}</div>
      {footer && <div>{footer}</div>}
    </div>
  );
}

// 2. Render prop
function Mouse({ render }) {
  const [pos, setPos] = useState({ x:0, y:0 });
  return (
    <div onMouseMove={e => setPos({ x:e.clientX, y:e.clientY })}>
      {render(pos)}
    </div>
  );
}

// 3. HOC
function withLogger(Wrapped) {
  return function(props) {
    useEffect(() => console.log('mounted', props), []);
    return <Wrapped {...props} />;
  };
}

// 4. Custom hook (modern alternative)
function useMouse() {
  const [pos, setPos] = useState({ x:0, y:0 });
  useEffect(() => {
    const fn = e => setPos({ x:e.clientX, y:e.clientY });
    window.addEventListener('mousemove', fn);
    return () => window.removeEventListener('mousemove', fn);
  }, []);
  return pos;
}`},

  { id:"useState", color:"#FF6B6B", label:"useState",
    desc:"Manages local component state. Returns [value, setter].",
    note:"Use the functional form (prev =>) whenever new state depends on old. Never mutate state directly.",
    code:`const [count, setCount] = useState(0);
const [user, setUser]   = useState({ name: 'Ada' });

// Update primitive
setCount(prev => prev + 1);

// Update object — spread to keep other keys
setUser(prev => ({ ...prev, name: 'Grace' }));

// Lazy initialiser (runs once)
const [data, setData] = useState(() => JSON.parse(localStorage.getItem('data') ?? 'null'));`},

  { id:"useEffect", color:"#38BDF8", label:"useEffect",
    desc:"Side effects after render — fetching, subscriptions, DOM changes.",
    note:"Every value from component scope used inside must be in the deps array. Return a cleanup function to avoid memory leaks.",
    code:`// Once on mount
useEffect(() => { fetchUser(id).then(setUser); }, []);

// When deps change
useEffect(() => { fetchUser(id).then(setUser); }, [id]);

// Cleanup
useEffect(() => {
  const sub = socket.subscribe(room, onMsg);
  return () => sub.unsubscribe();
}, [room]);

// Safe async pattern
useEffect(() => {
  let cancelled = false;
  async function load() {
    const data = await fetchData(id);
    if (!cancelled) setData(data);
  }
  load();
  return () => { cancelled = true; };
}, [id]);`},

  { id:"useRef", color:"#67E8F9", label:"useRef",
    desc:"Mutable value that persists across renders without triggering re-renders. Also for DOM access.",
    note:"Writing to ref.current never causes a re-render. Use refs for timer IDs, DOM nodes, previous values, and third-party imperative APIs.",
    code:`// DOM access
function AutoFocus() {
  const ref = useRef(null);
  useEffect(() => { ref.current.focus(); }, []);
  return <input ref={ref} />;
}

// Store mutable value (timer ID)
const timerRef = useRef(null);
const start = () => {
  timerRef.current = setInterval(() => tick(), 1000);
};
const stop = () => clearInterval(timerRef.current);

// Previous value pattern
function usePrevious(value) {
  const ref = useRef();
  useEffect(() => { ref.current = value; }, [value]);
  return ref.current;
}
const prevCount = usePrevious(count);`},

  { id:"useContext", color:"#4ECDC4", label:"useContext",
    desc:"Consume React context — avoids prop drilling through many layers.",
    note:"Every consumer re-renders when context value changes. Memoize the value object to prevent unnecessary re-renders.",
    code:`// 1. Create
const ThemeCtx = createContext('light');

// 2. Provide
// <ThemeCtx.Provider value="dark">
//   <App />
// </ThemeCtx.Provider>

// 3. Consume anywhere in tree
const theme = useContext(ThemeCtx);

// Memoize value to avoid extra re-renders
const ctx = useMemo(() => ({ user, logout }), [user]);`},

  { id:"useReducer", color:"#A78BFA", label:"useReducer",
    desc:"useState for complex state. Centralises updates in a reducer function.",
    note:"Prefer useReducer when multiple sub-values update together or when next state depends on previous in complex ways.",
    code:`const reducer = (state, action) => {
  switch (action.type) {
    case 'INC':   return { count: state.count + 1 };
    case 'RESET': return { count: 0 };
    default:      return state;
  }
};

const [state, dispatch] = useReducer(reducer, { count: 0 });

dispatch({ type: 'INC' });
dispatch({ type: 'RESET' });`},

  { id:"useCallback", color:"#F59E0B", label:"useCallback",
    desc:"Memoizes a function — stable reference unless deps change.",
    note:"Only useful when passing to React.memo children or as useEffect deps. Otherwise it just adds overhead.",
    code:`const handleClick = useCallback(() => {
  doSomething(id);
}, [id]);

// Pass to memoized child without breaking memo
// <MemoChild onClick={handleClick} />

// Equivalent to:
const fn = useMemo(() => () => doSomething(id), [id]);`},

  { id:"useMemo", color:"#34D399", label:"useMemo",
    desc:"Memoizes an expensive computed value — recalculates only when deps change.",
    note:"Don't over-use — it adds memory overhead. Profile first, then apply where you measure a real problem.",
    code:`const sorted = useMemo(() =>
  [...items].sort((a, b) => a.name.localeCompare(b.name)),
  [items]
);

// Stable ref for context value
const ctx = useMemo(() => ({ user, logout }), [user]);

// Derived value
const total = useMemo(
  () => cart.reduce((sum, i) => sum + i.price, 0),
  [cart]
);`},

  { id:"custom-hooks", color:"#A3E635", label:"Custom Hooks",
    desc:"Extract reusable stateful logic into 'use' prefixed functions.",
    note:"Must start with 'use' so React's linter enforces the rules of hooks. One clear purpose per hook.",
    code:`// useFetch
function useFetch(url) {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  useEffect(() => {
    let cancelled = false;
    fetch(url).then(r => r.json())
      .then(d => { if (!cancelled) { setData(d); setLoading(false); } })
      .catch(e => { if (!cancelled) { setError(e); setLoading(false); } });
    return () => { cancelled = true; };
  }, [url]);
  return { data, loading, error };
}

// useLocalStorage
function useLocalStorage(key, init) {
  const [val, setVal] = useState(() => {
    try { return JSON.parse(localStorage.getItem(key)) ?? init; }
    catch { return init; }
  });
  const set = v => { setVal(v); localStorage.setItem(key, JSON.stringify(v)); };
  return [val, set];
}

// useDebounce
function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}`},

  { id:"props-state", color:"#F472B6", label:"Props & State",
    desc:"Props flow down (read-only). State lives locally and triggers re-renders.",
    note:"Lift state to the nearest common ancestor when siblings share it. Derive values instead of storing them in state.",
    code:`// Props
function Card({ title, count, onClick }) {
  return <div onClick={onClick}>{title}: {count}</div>;
}

// Default prop
function Badge({ label = 'New' }) { ... }

// Children
function Modal({ children }) {
  return <div className="modal">{children}</div>;
}

// Local state
const [open, setOpen] = useState(false);

// Derived — compute, don't store
const [items, setItems] = useState([]);
const count = items.length; // NOT a separate useState`},

  { id:"loops", color:"#60A5FA", label:"Loops & Lists",
    desc:"Render lists with .map() — always provide a stable, unique key.",
    note:"Never use array index as a key for lists that can be reordered or filtered. Keys must only be unique among siblings.",
    code:`// .map()
// <ul>
//   {items.map(item => (
//     <li key={item.id}>{item.name}</li>
//   ))}
// </ul>

// .filter() then .map()
const active = users
  .filter(u => u.active)
  .map(u => <UserCard key={u.id} user={u} />);

// Conditional rendering
// {isLoggedIn ? <Dashboard /> : <Login />}
// {error && <ErrorBanner message={error} />}
// {loading && <Spinner />}`},

  { id:"events", color:"#FCD34D", label:"Event Handling",
    desc:"React wraps native events in SyntheticEvent for cross-browser consistency.",
    note:"Always call e.preventDefault() in form onSubmit. Use e.stopPropagation() to prevent bubbling to parent handlers.",
    code:`// Common events: onClick onChange onSubmit onKeyDown onBlur

const handleClick = e => {
  e.preventDefault();    // stop default browser action
  e.stopPropagation();   // stop event bubbling
  console.log(e.target, e.currentTarget);
};

// Keyboard
const handleKey = e => {
  if (e.key === 'Enter')  submit();
  if (e.key === 'Escape') close();
};

// Generic change handler (uses input name attribute)
const handleChange = e => {
  const { name, value, type, checked } = e.target;
  setForm(p => ({
    ...p,
    [name]: type === 'checkbox' ? checked : value,
  }));
};

// Event delegation — one handler for many children
const handleList = e => {
  const id = e.target.closest('li')?.dataset.id;
  if (id) handleSelect(id);
};`},

  { id:"controlled", color:"#FB7185", label:"Controlled vs Uncontrolled",
    desc:"Controlled: React owns the value. Uncontrolled: DOM owns it, read via ref.",
    note:"Prefer controlled inputs — predictable and easy to validate. File inputs are always uncontrolled. useRef for 3rd-party libs.",
    code:`// CONTROLLED — value + onChange
function Controlled() {
  const [val, setVal] = useState('');
  return (
    <input value={val} onChange={e => setVal(e.target.value)} />
  );
}

// UNCONTROLLED — defaultValue + ref
function Uncontrolled() {
  const ref = useRef(null);
  const submit = () => console.log(ref.current.value);
  return (
    <>
      <input ref={ref} defaultValue="initial" />
      <button onClick={submit}>Read</button>
    </>
  );
}

// File input — always uncontrolled
// <input type="file" ref={fileRef} />

// Controlled select / checkbox
// <select value={val} onChange={e => setVal(e.target.value)}>
// <input type="checkbox" checked={on} onChange={e => setOn(e.target.checked)} />`},

  { id:"forms", color:"#E879F9", label:"Forms with Validation",
    desc:"Full form pattern — multiple fields, submit validation, per-field errors.",
    note:"The [name]: value pattern lets one handler drive all fields. For complex forms use React Hook Form — it avoids re-renders on every keystroke.",
    code:`function SignupForm() {
  const [form, setForm]     = useState({ name:'', email:'', password:'' });
  const [errors, setErrors] = useState({});

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
    if (errors[name]) setErrors(p => ({ ...p, [name]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim())           e.name = 'Required';
    if (!/\\S+@\\S+/.test(form.email)) e.email = 'Invalid email';
    if (form.password.length < 8)    e.password = 'Min 8 chars';
    return e;
  };

  const handleSubmit = e => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    // await api.signup(form)
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <input name="name"     value={form.name}     onChange={handleChange} />
      {errors.name && <span>{errors.name}</span>}
      <input name="email"    value={form.email}    onChange={handleChange} />
      {errors.email && <span>{errors.email}</span>}
      <input name="password" value={form.password} onChange={handleChange} type="password" />
      {errors.password && <span>{errors.password}</span>}
      <button type="submit">Sign Up</button>
    </form>
  );
}`},

  { id:"lazy", color:"#E879F9", label:"React.lazy & Suspense",
    desc:"Code-split components — load only when needed to shrink the initial bundle.",
    note:"React.lazy only works with default exports. Wrap Suspense in an error boundary to handle chunk load failures.",
    code:`// Lazy load (must be default export)
const Dashboard = React.lazy(() => import('./Dashboard'));
const Chart     = React.lazy(() => import('./Chart'));

// Wrap with Suspense
// <Suspense fallback={<Spinner />}>
//   <Dashboard />
// </Suspense>

// Route-level splitting
const Home    = React.lazy(() => import('./pages/Home'));
const Profile = React.lazy(() => import('./pages/Profile'));
// <Suspense fallback={<PageSkeleton />}>
//   <Routes>
//     <Route path="/"        element={<Home />} />
//     <Route path="/profile" element={<Profile />} />
//   </Routes>
// </Suspense>`},

  { id:"router", color:"#2DD4BF", label:"React Router v6",
    desc:"Client-side routing — the de-facto standard for React SPAs.",
    note:"v6: Routes not Switch, all routes exact by default. useNavigate replaces useHistory. Nested route paths are relative.",
    code:`// npm i react-router-dom
// <BrowserRouter><App /></BrowserRouter>

// Declare routes
// <Routes>
//   <Route path="/"          element={<Home />} />
//   <Route path="/users/:id" element={<UserDetail />} />
//   <Route path="*"          element={<NotFound />} />
// </Routes>

// Links
// <Link to="/about">About</Link>
// <NavLink to="/about" className={({isActive}) => isActive ? 'active' : ''}>

// Programmatic navigation
const navigate = useNavigate();
navigate('/dashboard');
navigate(-1); // back

// Params & query string
const { id }          = useParams();         // /users/:id
const [params]        = useSearchParams();   // ?tab=info
const tab             = params.get('tab');

// Nested routes with Outlet
// <Route path="/settings" element={<Settings />}>
//   <Route path="profile" element={<Profile />} />  // <Outlet /> in Settings`},

  { id:"perf", color:"#34D399", label:"Re-renders & Performance",
    desc:"When React re-renders and how to prevent unnecessary ones.",
    note:"Don't optimise prematurely. Profile first with React DevTools Profiler, then apply memo/useCallback/useMemo where measured.",
    code:`// Re-renders when:
// 1. Own state changes
// 2. Parent re-renders (even with same props)
// 3. Consumed context changes

// React.memo — skip if props unchanged
const List = React.memo(({ items }) => (
  <ul>{items.map(i => <li key={i.id}>{i.name}</li>)}</ul>
));

// Stable refs prevent breaking memo
const items  = useMemo(() => data.map(format), [data]);
const onClick = useCallback(() => doThing(), []);
// <List items={items} onClick={onClick} />

// Derive, don't store
const count = items.length; // not useState(0)

// React 18 automatic batching
setTimeout(() => {
  setA(1); // ─┐ one
  setB(2); // ─┘ re-render`},

  { id:"error-boundaries", color:"#F87171", label:"Error Boundaries",
    desc:"Catch render errors in a subtree and show a fallback UI instead of crashing.",
    note:"Place one at app root plus smaller ones around independent widgets. react-error-boundary package adds hook-friendly reset/retry support.",
    code:`class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    logToService(error, info.componentStack);
  }

  render() {
    if (this.state.hasError)
      return this.props.fallback ?? <h2>Something went wrong.</h2>;
    return this.props.children;
  }
}

// <ErrorBoundary fallback={<ErrorPage />}>
//   <Suspense fallback={<Spinner />}>
//     <LazyPage />
//   </Suspense>
// </ErrorBoundary>

// Does NOT catch:
// ✗ Event handlers  ✗ Async (setTimeout/fetch)
// ✗ SSR             ✗ Errors inside the boundary itself`},

  { id:"interview", color:"#FB923C", label:"Interview Essentials",
    desc:"Virtual DOM, reconciliation, rules of hooks, and key concepts.",
    note:"Other hot topics: lifting state, prop drilling solutions, synthetic events, mount/update/unmount phases, and React 18 concurrent features.",
    code:`// Virtual DOM — lightweight JS copy of the DOM.
// React diffs it and batches minimal real DOM updates.

// Reconciliation — the diffing algorithm.
// Keys help React track which list items changed.

// Rules of Hooks:
// 1. Only call at top level (not in loops/conditions)
// 2. Only call from React functions or custom hooks

// React.memo
const Pure = React.memo(({ name }) => <p>{name}</p>);

// Controlled vs Uncontrolled (see dedicated card)

// Error boundary (class only — no hook equivalent)
// getDerivedStateFromError + componentDidCatch

// Key interview questions:
// • What causes a re-render?
// • How does useEffect cleanup work?
// • useMemo vs useCallback?
// • What is prop drilling and how do you avoid it?
// • How does React reconciliation use keys?`},

  { id:"temp-converter", color:"#FF8C42", label:"Mini App: Temperature Converter",
    desc:"Two-way controlled inputs, derived state, and conversion formulas.",
    note:"Store both as strings to avoid the NaN edge case on empty input. Derive the label with useMemo — don't store it as state.",
    code:`function TempConverter() {
  const [c, setC] = useState('');
  const [f, setF] = useState('');

  const fromC = e => {
    const v = e.target.value;
    setC(v);
    setF(v === '' ? '' : ((v * 9/5) + 32).toFixed(1));
  };

  const fromF = e => {
    const v = e.target.value;
    setF(v);
    setC(v === '' ? '' : ((v - 32) * 5/9).toFixed(1));
  };

  const label = useMemo(() => {
    const n = parseFloat(c);
    if (isNaN(n)) return '';
    if (n < 0)    return 'Freezing 🥶';
    if (n < 20)   return 'Cool 🌤';
    if (n < 35)   return 'Warm ☀️';
    return 'Hot 🔥';
  }, [c]);

  return (
    <div>
      <input type="number" value={c} onChange={fromC} placeholder="°C" />
      <input type="number" value={f} onChange={fromF} placeholder="°F" />
      {label && <p>{label}</p>}
    </div>
  );
}
// Formulas: C→F: (C × 9/5) + 32   F→C: (F − 32) × 5/9`},

  { id:"traffic-light", color:"#84CC16", label:"Mini App: Traffic Light",
    desc:"Cycling state with modulo, useEffect timers, and cleanup.",
    note:"The cleanup clearTimeout is critical — without it a stale timer fires after the component updates, causing double-advances. Classic interview gotcha.",
    code:`const LIGHTS = [
  { color:'red',    ms:4000, hex:'#EF4444' },
  { color:'yellow', ms:1500, hex:'#EAB308' },
  { color:'green',  ms:3000, hex:'#22C55E' },
];

function TrafficLight() {
  const [idx, setIdx]         = useState(0);
  const [running, setRunning] = useState(true);

  useEffect(() => {
    if (!running) return;
    const t = setTimeout(() => {
      setIdx(i => (i + 1) % LIGHTS.length); // cycle with modulo
    }, LIGHTS[idx].ms);
    return () => clearTimeout(t); // cleanup!
  }, [idx, running]);

  return (
    <div>
      {LIGHTS.map((l, i) => (
        <div key={l.color} style={{
          width:60, height:60, borderRadius:'50%',
          background: i === idx ? l.hex : '#333',
          boxShadow: i === idx ? '0 0 20px ' + l.hex : 'none',
        }} />
      ))}
      <button onClick={() => setRunning(r => !r)}>
        {running ? 'Pause' : 'Resume'}
      </button>
    </div>
  );
}`},

  { id:"mini-apps", color:"#818CF8", label:"Mini Apps: Todo, Fetch & Debounce",
    desc:"CRUD array state, async loading/error/data pattern, and debounced search.",
    note:"For arrays: never push/splice — always use spread/map/filter. For fetch: always handle all 3 states (loading, data, error). Cancel stale requests.",
    code:`// ── TODO (CRUD) ──────────────────────────────────
function TodoList() {
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState('');
  const add    = () => { if (!input.trim()) return;
    setTodos(p => [...p, { id:Date.now(), text:input, done:false }]);
    setInput(''); };
  const toggle = id => setTodos(p =>
    p.map(t => t.id===id ? {...t, done:!t.done} : t));
  const remove = id => setTodos(p => p.filter(t => t.id!==id));
  return (
    <div>
      <input value={input} onChange={e=>setInput(e.target.value)}
             onKeyDown={e=>e.key==='Enter'&&add()} />
      <button onClick={add}>Add</button>
      {todos.map(t=>(
        <div key={t.id}>
          <span onClick={()=>toggle(t.id)}
            style={{textDecoration:t.done?'line-through':'none'}}>
            {t.text}
          </span>
          <button onClick={()=>remove(t.id)}>✕</button>
        </div>
      ))}
    </div>
  );
}

// ── FETCH (loading/data/error) ────────────────────
function UserCard({ id }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  useEffect(() => {
    let gone = false;
    setLoading(true);
    fetch('https://jsonplaceholder.typicode.com/users/'+id)
      .then(r => r.json())
      .then(d => { if(!gone) { setUser(d); setLoading(false); } })
      .catch(e => { if(!gone) { setError(e.message); setLoading(false); } });
    return () => { gone = true; };
  }, [id]);
  if (loading) return <p>Loading…</p>;
  if (error)   return <p>Error: {error}</p>;
  return <div><b>{user.name}</b><p>{user.email}</p></div>;
}

// ── DEBOUNCED SEARCH ──────────────────────────────
function SearchBox() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  useEffect(() => {
    if (!query.trim()) return;
    const t = setTimeout(async () => {
      const r = await fetch('/api/search?q='+query).then(r=>r.json());
      setResults(r);
    }, 400);
    return () => clearTimeout(t); // cancel on next keystroke
  }, [query]);

  return (
    <div>
      <input value={query} onChange={e=>setQuery(e.target.value)}
             placeholder="Search…" />
      {results.map(r => <p key={r.id}>{r.title}</p>)}
    </div>
  );
}`},
];

function CopyBtn({ text }) {
  const [ok, setOk] = useState(false);
  return (
    <button onClick={() => {
      navigator.clipboard.writeText(text);
      setOk(true); setTimeout(() => setOk(false), 1500);
    }} style={{
      position:"absolute", top:8, right:8,
      background: ok ? "#34D399" : "rgba(255,255,255,0.08)",
      border:"none", borderRadius:4, color:"#fff",
      fontSize:11, padding:"3px 8px", cursor:"pointer",
      fontFamily:S.font, transition:"background 0.25s",
    }}>{ok ? "✓" : "Copy"}</button>
  );
}

function Card({ s, n }) {
  const [open, setOpen] = useState(false);
  const c = s.color;
  return (
    <div style={{
      border:`1.5px solid ${c}28`, borderRadius:10,
      background:S.card, overflow:"hidden",
      boxShadow: open ? `0 0 24px ${c}18` : "none",
      transition:"box-shadow 0.3s",
    }}>
      <button onClick={() => setOpen(o => !o)} style={{
        width:"100%", display:"flex", alignItems:"center",
        gap:10, padding:"13px 16px",
        background:"transparent", border:"none",
        cursor:"pointer", textAlign:"left",
      }}>
        <span style={{
          width:24, height:24, borderRadius:5, flexShrink:0,
          background:c, color:"#000", fontWeight:800, fontSize:11,
          fontFamily:S.font, display:"inline-flex",
          alignItems:"center", justifyContent:"center",
        }}>{n}</span>
        <span style={{ fontFamily:S.font, fontWeight:700, fontSize:13.5, color:c, flexShrink:0 }}>
          {s.label}
        </span>
        <span style={{
          flex:1, fontSize:12, color:S.muted,
          display: open ? "none" : "block",
          whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis",
        }}>{s.desc}</span>
        <span style={{
          color:c, fontSize:18, marginLeft:"auto", flexShrink:0,
          display:"inline-block", lineHeight:1,
          transform: open ? "rotate(90deg)" : "rotate(0deg)",
          transition:"transform 0.2s",
        }}>›</span>
      </button>

      {open && (
        <div style={{ padding:"0 16px 16px", display:"flex", flexDirection:"column", gap:10 }}>
          <p style={{ margin:0, color:"#94a3b8", fontSize:13, lineHeight:1.6 }}>{s.desc}</p>
          <div style={{ position:"relative" }}>
            <CopyBtn text={s.code} />
            <pre style={{
              margin:0, padding:"12px 44px 12px 14px",
              background:S.pre, borderRadius:7,
              fontSize:12, lineHeight:1.75, color:S.text,
              overflowX:"auto", fontFamily:S.font, whiteSpace:"pre",
            }}>{s.code}</pre>
          </div>
          <div style={{
            background:`${c}0d`, border:`1px solid ${c}22`,
            borderRadius:6, padding:"9px 13px",
            color:"#94a3b8", fontSize:12, lineHeight:1.6,
          }}>
            <span style={{ color:c, fontWeight:700 }}>💡 </span>{s.note}
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [q, setQ] = useState("");

  const shown = useMemo(() => {
    const lq = q.toLowerCase();
    return SECTIONS.filter(s =>
      s.label.toLowerCase().includes(lq) ||
      s.desc.toLowerCase().includes(lq) ||
      s.code.toLowerCase().includes(lq)
    );
  }, [q]);

  return (
    <div style={{
      minHeight:"100vh", background:S.bg, color:S.text,
      backgroundImage:"radial-gradient(ellipse 80% 40% at 50% -10%, rgba(99,102,241,0.12), transparent)",
      padding:"24px", fontFamily:"system-ui, sans-serif",
    }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;700&display=swap');*{box-sizing:border-box;margin:0;padding:0;}::-webkit-scrollbar{width:5px;background:#0d0d1a;}::-webkit-scrollbar-thumb{background:#1e293b;border-radius:3px;}`}</style>

      <div style={{ width:"100%" }}>
        <div style={{ textAlign:"center", marginBottom:28 }}>
          <div style={{ display:"flex", justifyContent:"center", gap:5, marginBottom:12, flexWrap:"wrap" }}>
            {SECTIONS.map((s,i) => (
              <span key={i} style={{ width:6, height:6, borderRadius:"50%", background:s.color, display:"inline-block" }} />
            ))}
          </div>
          <h1 style={{
            fontFamily:S.font, fontWeight:700, letterSpacing:"-1px",
            fontSize:"clamp(24px,5vw,40px)",
            background:"linear-gradient(135deg,#f1f5f9 40%,#64748b)",
            WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
            marginBottom:6,
          }}>React Cheat Sheet</h1>
          <p style={{ color:S.muted, fontSize:13, fontFamily:S.font }}>
            {SECTIONS.length} topics · click to expand
          </p>
        </div>

        <div style={{ position:"relative", marginBottom:16 }}>
          <span style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", color:S.dim, pointerEvents:"none" }}>⌕</span>
          <input value={q} onChange={e => setQ(e.target.value)}
            placeholder="Search topics or code…"
            style={{
              width:"100%", padding:"10px 32px 10px 32px",
              background:"rgba(255,255,255,0.03)",
              border:"1.5px solid rgba(255,255,255,0.08)",
              borderRadius:8, color:S.text, fontSize:13,
              outline:"none", fontFamily:S.font,
            }}
            onFocus={e => (e.target.style.borderColor="rgba(99,102,241,0.5)")}
            onBlur={e  => (e.target.style.borderColor="rgba(255,255,255,0.08)")}
          />
          {q && <button onClick={() => setQ("")} style={{
            position:"absolute", right:10, top:"50%", transform:"translateY(-50%)",
            background:"none", border:"none", color:S.muted, cursor:"pointer", fontSize:16,
          }}>×</button>}
        </div>

        <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
          {shown.length === 0
            ? <p style={{ textAlign:"center", color:S.dim, marginTop:32, fontFamily:S.font }}>No results for &quot;{q}&quot;</p>
            : shown.map(s => <Card key={s.id} s={s} n={SECTIONS.indexOf(s)+1} />)
          }
        </div>

        <p style={{ textAlign:"center", marginTop:32, color:"#1e293b", fontSize:11, fontFamily:S.font }}>
          {"// React cheatsheet · built with Claude"}
        </p>
      </div>
    </div>
  );
}
