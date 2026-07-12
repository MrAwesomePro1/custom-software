"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";

type CloseProps = { onClose: () => void };
type AppInfo = { id: string; name: string; icon: string; color: string; description?: string };

function AppBar({ title, onClose, action }: { title: string; onClose: () => void; action?: React.ReactNode }) {
  return <div className="working-app-bar"><button type="button" onClick={onClose} aria-label="Close app">‹</button><strong>{title}</strong><span>{action}</span></div>;
}

function useStoredState<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    try { const saved = localStorage.getItem(key); if (saved) setValue(JSON.parse(saved)); } catch { /* use default */ }
    setReady(true);
  }, [key]);
  useEffect(() => { if (ready) localStorage.setItem(key, JSON.stringify(value)); }, [key, ready, value]);
  return [value, setValue] as const;
}

export function MessagesApp({ onClose }: CloseProps) {
  const [messages, setMessages] = useStoredState("cs-messages", [
    { id: 1, mine: false, text: "Custom Software is ready!" },
    { id: 2, mine: true, text: "Awesome. I am trying every app." },
  ]);
  const [draft, setDraft] = useState("");
  const send = (event: FormEvent) => { event.preventDefault(); if (!draft.trim()) return; setMessages([...messages, { id: Date.now(), mine: true, text: draft.trim() }]); setDraft(""); };
  return <div className="app-window working-window messages-app"><AppBar title="Messages" onClose={onClose} action={<button className="app-text-action" type="button" onClick={() => setMessages([])}>Clear</button>} />
    <div className="message-contact"><span>CS</span><div><strong>Custom Software</strong><small>online</small></div></div>
    <div className="message-thread">{messages.length ? messages.map((message) => <div key={message.id} className={`message-bubble ${message.mine ? "mine" : "theirs"}`}>{message.text}</div>) : <div className="working-empty">Start a new conversation.</div>}</div>
    <form className="message-compose" onSubmit={send}><input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Message" aria-label="Message" /><button type="submit" aria-label="Send">↑</button></form>
  </div>;
}

export function CalendarApp({ onClose }: CloseProps) {
  const today = new Date();
  const [selected, setSelected] = useState(today.getDate());
  const [events, setEvents] = useStoredState<Record<string, string[]>>("cs-calendar-events", {});
  const [draft, setDraft] = useState("");
  const year = today.getFullYear(); const month = today.getMonth();
  const days = new Date(year, month + 1, 0).getDate(); const offset = new Date(year, month, 1).getDay();
  const cells = Array.from({ length: 42 }, (_, index) => { const day = index - offset + 1; return day > 0 && day <= days ? day : 0; });
  const key = `${year}-${month + 1}-${selected}`;
  const add = (event: FormEvent) => { event.preventDefault(); if (!draft.trim()) return; setEvents({ ...events, [key]: [...(events[key] || []), draft.trim()] }); setDraft(""); };
  return <div className="app-window working-window calendar-app"><AppBar title="Calendar" onClose={onClose} action={<span className="today-chip">Today</span>} />
    <div className="calendar-body"><header><span>{today.toLocaleDateString("en-US", { month: "long" })}</span><strong>{year}</strong></header>
      <div className="week-row">{["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => <span key={day}>{day}</span>)}</div>
      <div className="month-grid">{cells.map((day, index) => day ? <button key={index} className={`${day === selected ? "selected" : ""} ${day === today.getDate() ? "today" : ""}`} type="button" onClick={() => setSelected(day)}><span>{day}</span>{events[`${year}-${month + 1}-${day}`]?.length ? <i /> : null}</button> : <span key={index} />)}</div>
      <section className="agenda"><h3>{today.toLocaleDateString("en-US", { month: "long" })} {selected}</h3>{(events[key] || []).map((item, index) => <button key={`${item}-${index}`} type="button" onClick={() => setEvents({ ...events, [key]: events[key].filter((_, i) => i !== index) })}><span />{item}<small>tap to remove</small></button>)}<form onSubmit={add}><input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Add an event" /><button type="submit">Add</button></form></section>
    </div>
  </div>;
}

const DEFAULT_PHOTOS = [
  { id: 1, background: "linear-gradient(135deg,#ff9d62,#ff3f87 55%,#6d4cff)", created: "Sunset" },
  { id: 2, background: "radial-gradient(circle at 30% 25%,#d8fffa,#4bd8dc 35%,#1768bc)", created: "Ocean" },
  { id: 3, background: "radial-gradient(circle at 60% 30%,#fff9ba,#75c659 28%,#145834)", created: "Garden" },
  { id: 4, background: "linear-gradient(155deg,#171c4e,#6845a9 52%,#d46fcb)", created: "Night" },
];

export function PhotosApp({ onClose }: CloseProps) {
  const [photos, setPhotos] = useStoredState("cs-camera-roll", DEFAULT_PHOTOS);
  const [selected, setSelected] = useState<number | null>(null);
  const current = photos.find((photo) => photo.id === selected);
  return <div className="app-window working-window photos-app"><AppBar title="Photos" onClose={onClose} action={<span className="app-text-action">{photos.length} items</span>} />
    {current ? <div className="photo-viewer"><div style={{ background: current.background }}><span>{current.created}</span></div><footer><button type="button" onClick={() => setSelected(null)}>All Photos</button><button type="button" onClick={() => { setPhotos(photos.filter((photo) => photo.id !== current.id)); setSelected(null); }}>Delete</button></footer></div> : <div className="photo-grid">{photos.map((photo) => <button key={photo.id} type="button" style={{ background: photo.background }} onClick={() => setSelected(photo.id)} aria-label={`Open ${photo.created}`}><span>{photo.created}</span></button>)}</div>}
  </div>;
}

export function CameraApp({ onClose }: CloseProps) {
  const [filter, setFilter] = useState(0);
  const [flash, setFlash] = useState(false);
  const [captured, setCaptured] = useState(false);
  const filters = [
    "radial-gradient(circle at 70% 25%,#fff3b0,#ef895c 22%,transparent 40%),linear-gradient(145deg,#2c3f68,#8a4f76 60%,#ffaf78)",
    "radial-gradient(circle at 30% 30%,#d6fff7,#4dc8ce 33%,transparent 50%),linear-gradient(145deg,#0d5571,#166caf,#54d4c0)",
    "linear-gradient(145deg,#111,#555 45%,#eee)",
  ];
  const capture = () => { const existing = JSON.parse(localStorage.getItem("cs-camera-roll") || JSON.stringify(DEFAULT_PHOTOS)); existing.unshift({ id: Date.now(), background: filters[filter], created: new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) }); localStorage.setItem("cs-camera-roll", JSON.stringify(existing)); setCaptured(true); window.setTimeout(() => setCaptured(false), 350); };
  return <div className={`app-window working-window camera-app ${captured ? "captured" : ""}`}><AppBar title="Camera" onClose={onClose} action={<button className="app-text-action" type="button" onClick={() => setFlash(!flash)}>Flash {flash ? "On" : "Off"}</button>} />
    <div className="camera-viewfinder" style={{ background: filters[filter] }}><div className="focus-box" /><span>LIVE</span></div>
    <div className="camera-controls"><button type="button" onClick={() => setFilter((filter + filters.length - 1) % filters.length)}>Filters</button><button className="shutter" type="button" onClick={capture} aria-label="Take photo"><span /></button><button type="button" onClick={() => setFilter((filter + 1) % filters.length)}>Switch</button></div>
  </div>;
}

export function ClockApp({ onClose }: CloseProps) {
  const [now, setNow] = useState(new Date()); const [seconds, setSeconds] = useState(60); const [running, setRunning] = useState(false);
  const [alarms, setAlarms] = useStoredState("cs-alarms", ["7:30 AM"]);
  useEffect(() => { const timer = window.setInterval(() => setNow(new Date()), 1000); return () => window.clearInterval(timer); }, []);
  useEffect(() => { if (!running || seconds <= 0) return; const timer = window.setInterval(() => setSeconds((value) => value - 1), 1000); return () => window.clearInterval(timer); }, [running, seconds]);
  useEffect(() => { if (seconds === 0) setRunning(false); }, [seconds]);
  const format = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
  return <div className="app-window working-window clock-app"><AppBar title="Clock" onClose={onClose} /><div className="clock-face"><small>{now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</small><strong>{now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit", second: "2-digit" })}</strong></div>
    <div className="clock-panels"><section><h3>Timer</h3><div className="timer-ring"><strong>{format}</strong></div><div><button type="button" onClick={() => { setSeconds(60); setRunning(false); }}>Reset</button><button className="primary" type="button" onClick={() => setRunning(!running)}>{running ? "Pause" : "Start"}</button></div></section><section><h3>Alarms</h3>{alarms.map((alarm, index) => <button className="alarm-row" key={`${alarm}-${index}`} type="button" onClick={() => setAlarms(alarms.filter((_, i) => i !== index))}><strong>{alarm}</strong><span>On</span></button>)}<button className="add-alarm" type="button" onClick={() => setAlarms([...alarms, new Date(Date.now() + 3600000).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })])}>+ Add alarm</button></section></div>
  </div>;
}

export function MapsApp({ onClose }: CloseProps) {
  const [query, setQuery] = useState(""); const [place, setPlace] = useState("Custom Software HQ"); const [marker, setMarker] = useState({ x: 52, y: 47 });
  const [saved, setSaved] = useStoredState("cs-map-places", ["Home"]);
  const search = (event: FormEvent) => { event.preventDefault(); if (!query.trim()) return; setPlace(query.trim()); setMarker({ x: 20 + (query.length * 13) % 60, y: 20 + (query.length * 19) % 60 }); };
  const moveMarker = (event: React.MouseEvent<HTMLDivElement>) => { const rect = event.currentTarget.getBoundingClientRect(); setMarker({ x: ((event.clientX - rect.left) / rect.width) * 100, y: ((event.clientY - rect.top) / rect.height) * 100 }); setPlace("Dropped Pin"); };
  return <div className="app-window working-window maps-app"><AppBar title="Maps" onClose={onClose} action={<button className="app-text-action" type="button" onClick={() => setSaved([...saved, place])}>Save</button>} /><form className="map-search" onSubmit={search}><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search places" /><button type="submit">Go</button></form><div className="map-canvas" onClick={moveMarker}><div className="roads" /><span className="map-water" /><button className="map-pin" style={{ left: `${marker.x}%`, top: `${marker.y}%` }} type="button" aria-label={place}>●<small>{place}</small></button></div><div className="saved-places"><strong>Saved</strong>{saved.map((item, index) => <button type="button" key={`${item}-${index}`} onClick={() => { setPlace(item); setMarker({ x: 50, y: 50 }); }}>{item}</button>)}</div></div>;
}

export function FilesApp({ onClose }: CloseProps) {
  const [files, setFiles] = useStoredState("cs-files", [{ id: 1, name: "Welcome.txt", content: "Welcome to Custom Software Files.\n\nCreate, edit, and save your own documents here." }]);
  const [selected, setSelected] = useState<number | null>(1); const current = files.find((file) => file.id === selected);
  const update = (content: string) => setFiles(files.map((file) => file.id === selected ? { ...file, content } : file));
  const create = () => { const id = Date.now(); setFiles([...files, { id, name: `Document ${files.length + 1}.txt`, content: "" }]); setSelected(id); };
  return <div className="app-window working-window files-app"><AppBar title="Files" onClose={onClose} action={<button className="app-text-action" type="button" onClick={create}>New</button>} /><div className="files-layout"><aside><h3>On My Device</h3>{files.map((file) => <button className={selected === file.id ? "selected" : ""} type="button" key={file.id} onClick={() => setSelected(file.id)}><span>📄</span>{file.name}</button>)}</aside><section>{current ? <><div><input value={current.name} onChange={(event) => setFiles(files.map((file) => file.id === current.id ? { ...file, name: event.target.value } : file))} /><button type="button" onClick={() => { setFiles(files.filter((file) => file.id !== current.id)); setSelected(null); }}>Delete</button></div><textarea value={current.content} onChange={(event) => update(event.target.value)} /></> : <div className="working-empty">Choose a file or create a new one.</div>}</section></div></div>;
}

export function NotesApp({ onClose }: CloseProps) {
  const [text, setText] = useStoredState("cs-notes", "Ideas for today\n\n• Build something useful\n• Try every app\n• Share the good stuff");
  return <div className="app-window working-window working-notes"><AppBar title="Notes" onClose={onClose} action={<span className="saved-label">Saved</span>} /><textarea value={text} onChange={(event) => setText(event.target.value)} aria-label="Note" /></div>;
}

export function WeatherApp({ onClose, orbit = false }: CloseProps & { orbit?: boolean }) {
  const cities = [{ name: "Chicago", temp: 76, condition: "Mostly Sunny" }, { name: "New York", temp: 81, condition: "Partly Cloudy" }, { name: "London", temp: 64, condition: "Light Rain" }];
  const [city, setCity] = useState(0); const current = cities[city];
  return <div className={`app-window working-window live-weather ${orbit ? "orbit" : ""}`}><AppBar title={orbit ? "Orbit Weather" : "Weather"} onClose={onClose} action={<button className="app-text-action light" type="button" onClick={() => setCity((city + 1) % cities.length)}>Change City</button>} /><div className="live-weather-main"><small>My Location</small><h2>{current.name}</h2><strong>{current.temp}°</strong><p>{current.condition}</p><span>H: {current.temp + 5}° &nbsp; L: {current.temp - 9}°</span></div><div className="hourly-strip">{["Now", "11 AM", "12 PM", "1 PM", "2 PM"].map((time, index) => <div key={time}><small>{time}</small><b>{index > 2 ? "☁" : "☀"}</b><strong>{current.temp + index}°</strong></div>)}</div><div className="weather-detail"><span>Feels Like<strong>{current.temp + 1}°</strong></span><span>Wind<strong>8 mph</strong></span><span>Humidity<strong>52%</strong></span></div></div>;
}

export function MusicApp({ onClose }: CloseProps) {
  const tracks = ["Electric Dreams", "Blue Horizon", "Neon Morning"];
  const [track, setTrack] = useState(0); const [playing, setPlaying] = useState(false); const [progress, setProgress] = useState(12);
  useEffect(() => { if (!playing) return; const timer = window.setInterval(() => setProgress((value) => value >= 100 ? 0 : value + 1), 500); return () => window.clearInterval(timer); }, [playing]);
  const change = (next: number) => { setTrack((next + tracks.length) % tracks.length); setProgress(0); };
  return <div className="app-window working-window music-app"><AppBar title="Soundwave" onClose={onClose} /><div className="album-art"><div><span>◖</span><i /></div></div><div className="track-info"><h2>{tracks[track]}</h2><p>Custom Software Radio</p><input type="range" min="0" max="100" value={progress} onChange={(event) => setProgress(Number(event.target.value))} /><div><button type="button" onClick={() => change(track - 1)}>◀</button><button className="play" type="button" onClick={() => setPlaying(!playing)}>{playing ? "Ⅱ" : "▶"}</button><button type="button" onClick={() => change(track + 1)}>▶</button></div></div></div>;
}

export function SketchpadApp({ onClose }: CloseProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null); const drawing = useRef(false); const [color, setColor] = useState("#5f57ff");
  useEffect(() => { const canvas = canvasRef.current; if (!canvas) return; const context = canvas.getContext("2d"); if (context) { context.fillStyle = "#ffffff"; context.fillRect(0, 0, canvas.width, canvas.height); context.lineCap = "round"; context.lineWidth = 8; } }, []);
  const point = (event: React.PointerEvent<HTMLCanvasElement>) => { const canvas = canvasRef.current; if (!canvas) return; const rect = canvas.getBoundingClientRect(); return { x: (event.clientX - rect.left) * canvas.width / rect.width, y: (event.clientY - rect.top) * canvas.height / rect.height }; };
  const start = (event: React.PointerEvent<HTMLCanvasElement>) => { const context = canvasRef.current?.getContext("2d"); const p = point(event); if (!context || !p) return; drawing.current = true; context.beginPath(); context.moveTo(p.x, p.y); };
  const draw = (event: React.PointerEvent<HTMLCanvasElement>) => { if (!drawing.current) return; const context = canvasRef.current?.getContext("2d"); const p = point(event); if (!context || !p) return; context.strokeStyle = color; context.lineTo(p.x, p.y); context.stroke(); };
  const clear = () => { const canvas = canvasRef.current; const context = canvas?.getContext("2d"); if (canvas && context) { context.fillStyle = "white"; context.fillRect(0, 0, canvas.width, canvas.height); } };
  return <div className="app-window working-window sketchpad-app"><AppBar title="Sketchpad" onClose={onClose} action={<button className="app-text-action" type="button" onClick={clear}>Clear</button>} /><div className="drawing-tools">{["#5f57ff", "#ff416c", "#16a085", "#111111", "#ffb000"].map((item) => <button className={color === item ? "selected" : ""} key={item} style={{ background: item }} type="button" onClick={() => setColor(item)} aria-label={`Use ${item}`} />)}</div><canvas ref={canvasRef} width="900" height="650" onPointerDown={start} onPointerMove={draw} onPointerUp={() => drawing.current = false} onPointerLeave={() => drawing.current = false} /></div>;
}

export function FitnessApp({ onClose }: CloseProps) {
  const [steps, setSteps] = useStoredState("cs-fitness-steps", 2840); const [workouts, setWorkouts] = useStoredState("cs-fitness-workouts", 1);
  const percent = Math.min(100, Math.round(steps / 80));
  return <div className="app-window working-window fitness-app"><AppBar title="Pulse Fitness" onClose={onClose} /><div className="fitness-hero"><div className="activity-ring" style={{ "--progress": `${percent * 3.6}deg` } as React.CSSProperties}><span>{percent}%</span></div><div><small>TODAY</small><h2>{steps.toLocaleString()} steps</h2><p>{Math.max(1, Math.round(steps / 2100))} miles • {Math.round(steps / 24)} calories</p></div></div><div className="fitness-actions"><button type="button" onClick={() => setSteps(steps + 500)}>+ 500 Steps</button><button type="button" onClick={() => setWorkouts(workouts + 1)}>Finish Workout</button></div><section className="fitness-stats"><div><span>Workouts</span><strong>{workouts}</strong></div><div><span>Move</span><strong>{percent}%</strong></div><div><span>Goal</span><strong>8K</strong></div></section></div>;
}

export function FocusApp({ onClose }: CloseProps) {
  const [seconds, setSeconds] = useState(25 * 60); const [running, setRunning] = useState(false); const [sessions, setSessions] = useStoredState("cs-focus-sessions", 0);
  useEffect(() => { if (!running || seconds <= 0) return; const timer = window.setInterval(() => setSeconds((value) => value - 1), 1000); return () => window.clearInterval(timer); }, [running, seconds]);
  useEffect(() => { if (seconds === 0 && running) { setRunning(false); setSessions(sessions + 1); } }, [running, seconds, sessions, setSessions]);
  const reset = (minutes: number) => { setSeconds(minutes * 60); setRunning(false); };
  return <div className="app-window working-window focus-app"><AppBar title="Focus Flow" onClose={onClose} /><div className="focus-orb"><span>{String(Math.floor(seconds / 60)).padStart(2, "0")}:{String(seconds % 60).padStart(2, "0")}</span><small>Stay with one thing.</small></div><div className="focus-controls"><button type="button" onClick={() => reset(5)}>5 min</button><button type="button" onClick={() => reset(25)}>25 min</button><button className="primary" type="button" onClick={() => setRunning(!running)}>{running ? "Pause" : "Focus"}</button></div><p>{sessions} focus sessions completed</p></div>;
}

export function TowerGameApp({ onClose }: CloseProps) {
  const [floors, setFloors] = useStoredState("cs-tower-floors", 3); const [coins, setCoins] = useStoredState("cs-tower-coins", 30);
  const build = () => { if (coins < 10) return; setCoins(coins - 10); setFloors(floors + 1); };
  return <div className="app-window working-window tower-app"><AppBar title="Tiny Tower" onClose={onClose} action={<span className="coin-count">● {coins}</span>} /><div className="tower-sky"><div className="tower-building">{Array.from({ length: floors }, (_, index) => <button key={index} type="button" onClick={() => setCoins(coins + 2)} style={{ background: ["#ffbc42", "#56cfe1", "#ef476f", "#8ac926"][index % 4] }}><span>{index % 2 ? "🏠" : "🏪"}</span></button>)}</div></div><div className="tower-controls"><button type="button" onClick={() => setCoins(coins + floors)}>Collect Earnings</button><button className="primary" type="button" onClick={build} disabled={coins < 10}>Build Floor • 10</button></div></div>;
}

export function StargazerApp({ onClose }: CloseProps) {
  const [constellation, setConstellation] = useState("Orion"); const stars = useMemo(() => Array.from({ length: 36 }, (_, index) => ({ left: (index * 37) % 96, top: (index * 53) % 88, size: 2 + (index % 3) })), []);
  return <div className="app-window working-window stargazer-app"><AppBar title="Stargazer" onClose={onClose} action={<span className="app-text-action light">Tonight</span>} /><div className="star-sky">{stars.map((star, index) => <i key={index} style={{ left: `${star.left}%`, top: `${star.top}%`, width: star.size, height: star.size }} />)}<div className="constellation-lines"><span /><span /><span /></div><div className="star-label"><strong>{constellation}</strong><small>Tap a guide below to explore</small></div></div><div className="constellation-list">{["Orion", "Ursa Major", "Cassiopeia"].map((name) => <button className={constellation === name ? "selected" : ""} type="button" key={name} onClick={() => setConstellation(name)}>{name}</button>)}</div></div>;
}

export function RecipeApp({ onClose }: CloseProps) {
  const [recipes, setRecipes] = useStoredState("cs-recipes", [{ id: 1, name: "Rainbow Tacos", details: "Tortillas, veggies, avocado, lime" }, { id: 2, name: "Power Smoothie", details: "Berries, banana, yogurt, honey" }]);
  const [selected, setSelected] = useState(1); const [name, setName] = useState(""); const current = recipes.find((recipe) => recipe.id === selected);
  const add = (event: FormEvent) => { event.preventDefault(); if (!name.trim()) return; const recipe = { id: Date.now(), name: name.trim(), details: "Tap here and make it your own." }; setRecipes([...recipes, recipe]); setSelected(recipe.id); setName(""); };
  return <div className="app-window working-window recipe-app"><AppBar title="Recipe Box" onClose={onClose} /><div className="recipe-layout"><aside>{recipes.map((recipe) => <button className={selected === recipe.id ? "selected" : ""} type="button" key={recipe.id} onClick={() => setSelected(recipe.id)}>🥗<span>{recipe.name}</span></button>)}<form onSubmit={add}><input value={name} onChange={(event) => setName(event.target.value)} placeholder="New recipe" /><button type="submit">+</button></form></aside><section>{current ? <><div className="recipe-hero">🥗</div><input value={current.name} onChange={(event) => setRecipes(recipes.map((recipe) => recipe.id === current.id ? { ...recipe, name: event.target.value } : recipe))} /><textarea value={current.details} onChange={(event) => setRecipes(recipes.map((recipe) => recipe.id === current.id ? { ...recipe, details: event.target.value } : recipe))} /><button type="button" onClick={() => { setRecipes(recipes.filter((recipe) => recipe.id !== current.id)); setSelected(0); }}>Delete Recipe</button></> : <div className="working-empty">Add your first recipe.</div>}</section></div></div>;
}

export function CustomWorkspaceApp({ app, onClose }: { app: AppInfo; onClose: () => void }) {
  const [content, setContent] = useStoredState(`cs-custom-workspace-${app.id}`, `Welcome to ${app.name}.\n\nUse this workspace to save ideas, plans, and app data.`);
  const [launches, setLaunches] = useStoredState(`cs-custom-launches-${app.id}`, 1);
  return <div className="app-window working-window custom-workspace" style={{ "--custom-color": app.color } as React.CSSProperties}><AppBar title={app.name} onClose={onClose} action={<span className="saved-label">Saved</span>} /><div className="custom-app-hero"><span style={{ background: app.color }}>{app.icon}</span><div><h2>{app.name}</h2><p>{app.description || "Your custom app workspace."}</p></div></div><textarea value={content} onChange={(event) => setContent(event.target.value)} /><button type="button" onClick={() => setLaunches(launches + 1)}>Run Action <span>{launches} runs</span></button></div>;
}

type ContactEntry = { id: number; name: string; phone: string; email: string; color: string };
type ChatEntry = { id: number; name: string; members: number[]; group: boolean; messages: Array<{ id: number; mine: boolean; text: string }> };

const DEFAULT_CONTACTS: ContactEntry[] = [
  { id: 1, name: "Alex", phone: "555-0101", email: "alex@example.com", color: "#5b7cff" },
  { id: 2, name: "Jordan", phone: "555-0142", email: "jordan@example.com", color: "#e95683" },
  { id: 3, name: "Taylor", phone: "555-0188", email: "taylor@example.com", color: "#20aa7a" },
];

const DEFAULT_CHATS: ChatEntry[] = [
  { id: 1, name: "Alex", members: [1], group: false, messages: [{ id: 1, mine: false, text: "Hey! Custom Software is looking great." }] },
  { id: 2, name: "Project Team", members: [1, 2, 3], group: true, messages: [{ id: 2, mine: false, text: "Welcome to the group chat!" }] },
];

export function MessagesHubApp({ onClose }: CloseProps) {
  const [contacts] = useStoredState<ContactEntry[]>("cs-contacts", DEFAULT_CONTACTS);
  const [chats, setChats] = useStoredState<ChatEntry[]>("cs-chats", DEFAULT_CHATS);
  const [activeId, setActiveId] = useState(1);
  const [draft, setDraft] = useState("");
  const [makingGroup, setMakingGroup] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [members, setMembers] = useState<number[]>([]);
  const active = chats.find((chat) => chat.id === activeId);

  const send = (event: FormEvent) => {
    event.preventDefault();
    if (!active || !draft.trim()) return;
    setChats(chats.map((chat) => chat.id === active.id ? { ...chat, messages: [...chat.messages, { id: Date.now(), mine: true, text: draft.trim() }] } : chat));
    setDraft("");
  };
  const createGroup = (event: FormEvent) => {
    event.preventDefault();
    if (!groupName.trim() || members.length < 1) return;
    const chat: ChatEntry = { id: Date.now(), name: groupName.trim(), members, group: true, messages: [{ id: Date.now() + 1, mine: false, text: `Group created with ${members.length} contact${members.length === 1 ? "" : "s"}.` }] };
    setChats([...chats, chat]); setActiveId(chat.id); setGroupName(""); setMembers([]); setMakingGroup(false);
  };

  return <div className="app-window working-window messages-hub"><AppBar title="Messages" onClose={onClose} action={<button className="app-text-action" type="button" onClick={() => setMakingGroup(true)}>New Group</button>} />
    <div className="messages-hub-layout">
      <aside><h3>Chats</h3>{chats.map((chat) => <button className={activeId === chat.id ? "selected" : ""} type="button" key={chat.id} onClick={() => { setActiveId(chat.id); setMakingGroup(false); }}><span style={{ background: chat.group ? "#725cff" : contacts.find((contact) => contact.id === chat.members[0])?.color || "#4a8cff" }}>{chat.group ? "👥" : chat.name.slice(0, 1)}</span><div><strong>{chat.name}</strong><small>{chat.messages[chat.messages.length - 1]?.text || "New conversation"}</small></div></button>)}</aside>
      <section>{makingGroup ? <form className="group-builder" onSubmit={createGroup}><h2>New Group Chat</h2><label>Group name<input value={groupName} onChange={(event) => setGroupName(event.target.value)} placeholder="Friends, Team, Family..." /></label><h3>Add contacts</h3><div>{contacts.map((contact) => <label key={contact.id}><input type="checkbox" checked={members.includes(contact.id)} onChange={() => setMembers(members.includes(contact.id) ? members.filter((id) => id !== contact.id) : [...members, contact.id])} /><span style={{ background: contact.color }}>{contact.name.slice(0, 1)}</span>{contact.name}</label>)}</div><button type="submit" disabled={!groupName.trim() || !members.length}>Create Group</button></form> : active ? <><header><span>{active.group ? "👥" : active.name.slice(0, 1)}</span><div><strong>{active.name}</strong><small>{active.group ? `${active.members.length} members` : "Contact"}</small></div></header><div className="hub-thread">{active.messages.map((message) => <div className={`message-bubble ${message.mine ? "mine" : "theirs"}`} key={message.id}>{message.text}</div>)}</div><form className="message-compose hub-compose" onSubmit={send}><input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder={`Message ${active.name}`} /><button type="submit">↑</button></form></> : <div className="working-empty">Choose a conversation.</div>}</section>
    </div>
  </div>;
}

export function ContactsApp({ onClose }: CloseProps) {
  const [contacts, setContacts] = useStoredState<ContactEntry[]>("cs-contacts", DEFAULT_CONTACTS);
  const [selectedId, setSelectedId] = useState(contacts[0]?.id || 0);
  const [adding, setAdding] = useState(false);
  const [status, setStatus] = useState("");
  const [draft, setDraft] = useState({ name: "", phone: "", email: "" });
  const selected = contacts.find((contact) => contact.id === selectedId);
  const colors = ["#5b7cff", "#e95683", "#20aa7a", "#f09a38", "#8a5ce6"];

  const add = (event: FormEvent) => {
    event.preventDefault();
    if (!draft.name.trim()) return;
    const contact: ContactEntry = { id: Date.now(), name: draft.name.trim(), phone: draft.phone.trim() || "No phone", email: draft.email.trim() || "No email", color: colors[contacts.length % colors.length] };
    setContacts([...contacts, contact]); setSelectedId(contact.id); setDraft({ name: "", phone: "", email: "" }); setAdding(false);
  };
  const startChat = (contact: ContactEntry) => {
    const chats = JSON.parse(localStorage.getItem("cs-chats") || JSON.stringify(DEFAULT_CHATS)) as ChatEntry[];
    const existing = chats.find((chat) => !chat.group && chat.members.includes(contact.id));
    if (!existing) chats.push({ id: Date.now(), name: contact.name, members: [contact.id], group: false, messages: [{ id: Date.now() + 1, mine: false, text: `You can now message ${contact.name}.` }] });
    localStorage.setItem("cs-chats", JSON.stringify(chats)); setStatus("Conversation added to Messages");
  };

  return <div className="app-window working-window contacts-app"><AppBar title="Contacts" onClose={onClose} action={<button className="app-text-action" type="button" onClick={() => setAdding(true)}>Add Contact</button>} />
    <div className="contacts-layout"><aside><label className="contacts-search">⌕<input placeholder="Search contacts" /></label>{contacts.map((contact) => <button className={selectedId === contact.id ? "selected" : ""} type="button" key={contact.id} onClick={() => { setSelectedId(contact.id); setAdding(false); setStatus(""); }}><span style={{ background: contact.color }}>{contact.name.slice(0, 1)}</span><strong>{contact.name}</strong></button>)}</aside><section>{adding ? <form className="contact-form" onSubmit={add}><div className="contact-avatar new">+</div><h2>New Contact</h2><label>Name<input required value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} /></label><label>Phone<input inputMode="tel" value={draft.phone} onChange={(event) => setDraft({ ...draft, phone: event.target.value })} /></label><label>Email<input inputMode="email" value={draft.email} onChange={(event) => setDraft({ ...draft, email: event.target.value })} /></label><button type="submit">Save Contact</button></form> : selected ? <div className="contact-detail"><div className="contact-avatar" style={{ background: selected.color }}>{selected.name.slice(0, 1)}</div><h2>{selected.name}</h2><p>{selected.phone}</p><p>{selected.email}</p><div><button type="button" onClick={() => startChat(selected)}>💬 Message</button><button type="button" onClick={() => setStatus(`Calling ${selected.phone}`)}>☎ Call</button></div>{status && <small>{status}</small>}<button className="delete-contact" type="button" onClick={() => { setContacts(contacts.filter((contact) => contact.id !== selected.id)); setSelectedId(0); }}>Delete Contact</button></div> : <div className="working-empty">Add your first contact.</div>}</section></div>
  </div>;
}

export function WalletApp({ onClose }: CloseProps) {
  const [wallet, setWallet] = useStoredState("cs-awesome-wallet", { balance: 100, cellular: false });
  const [transactions, setTransactions] = useStoredState<Array<{ id: number; title: string; amount: number; date: string }>>("cs-wallet-transactions", [
    { id: 1, title: "Welcome Bonus", amount: 100, date: "Today" },
  ]);
  const [message, setMessage] = useState("");
  const claimReward = () => {
    const today = new Date().toDateString();
    if (localStorage.getItem("cs-wallet-last-reward") === today) { setMessage("Daily reward already collected."); return; }
    const next = { ...wallet, balance: Math.round((wallet.balance + 5) * 100) / 100 };
    setWallet(next); setTransactions([{ id: Date.now(), title: "Daily Reward", amount: 5, date: new Date().toLocaleDateString() }, ...transactions]);
    localStorage.setItem("cs-wallet-last-reward", today); setMessage("5 Awesome Development Coins added.");
  };
  return <div className="app-window working-window wallet-app"><AppBar title="Wallet" onClose={onClose} action={<span className="saved-label">On-device</span>} />
    <div className="wallet-scroll"><div className="awesome-card"><small>AWESOME DEVELOPMENT COINS</small><strong>{wallet.balance.toFixed(2)}</strong><span>AD COINS</span><i>CS</i></div><div className="wallet-actions"><button type="button" onClick={claimReward}>+ Daily Reward</button><button type="button" disabled={!wallet.cellular}>📶 {wallet.cellular ? "Cellular Active" : "No Cellular Plan"}</button></div>{message && <p className="wallet-message">{message}</p>}<section className="transactions"><h3>Recent Activity</h3>{transactions.map((item) => <article key={item.id}><span>{item.amount >= 0 ? "+" : "−"}</span><div><strong>{item.title}</strong><small>{item.date}</small></div><b className={item.amount >= 0 ? "credit" : ""}>{item.amount >= 0 ? "+" : ""}{item.amount.toFixed(2)}</b></article>)}</section></div>
  </div>;
}

export function VidersApp({ onClose }: CloseProps) {
  const [refreshKey, setRefreshKey] = useState(0);
  const vidersUrl = "https://pagedrop.dev/s/awesomeviders/";
  return <div className="app-window working-window viders-app">
    <AppBar title="Viders" onClose={onClose} action={<button className="app-text-action" type="button" onClick={() => setRefreshKey((value) => value + 1)}>Refresh</button>} />
    <div className="viders-toolbar"><div><span>V</span><strong>Viders</strong><small>Your video platform</small></div><a href={vidersUrl} target="_blank" rel="noreferrer">Open Full App</a></div>
    <iframe key={refreshKey} title="Viders video platform" src="/viders.html?source=custom-software" allow="autoplay; fullscreen; picture-in-picture" />
    <p className="viders-fallback">The complete Viders app is built in. Open Full App connects to its public site.</p>
  </div>;
}

export function HealthApp({ onClose }: CloseProps) {
  const [steps, setSteps] = useStoredState("cs-health-steps", 3420);
  const [sleepHours, setSleepHours] = useState(8);
  const [sleepLog, setSleepLog] = useStoredState<Array<{ id: number; date: string; hours: number }>>("cs-health-sleep", [
    { id: 1, date: "Last night", hours: 7.5 },
  ]);
  const goal = 8000; const progress = Math.min(100, Math.round(steps / goal * 100));
  const logSleep = () => setSleepLog([{ id: Date.now(), date: new Date().toLocaleDateString(), hours: sleepHours }, ...sleepLog].slice(0, 7));
  return <div className="app-window working-window health-app"><AppBar title="Health" onClose={onClose} action={<span className="iphone-badge">iPhone</span>} />
    <div className="health-scroll"><div className="health-summary"><small>TODAY</small><h2>Your Health</h2><div className="health-metrics"><article><span>👟</span><div><small>STEPS</small><strong>{steps.toLocaleString()}</strong><p>{progress}% of {goal.toLocaleString()}</p></div></article><article><span>🌙</span><div><small>SLEEP</small><strong>{sleepLog[0]?.hours || 0} hr</strong><p>{sleepLog[0]?.date || "No sleep logged"}</p></div></article></div></div><section className="step-tracker"><div><h3>Daily Steps</h3><strong>{progress}%</strong></div><i><span style={{ width: `${progress}%` }} /></i><div className="step-buttons"><button type="button" onClick={() => setSteps(steps + 100)}>+100</button><button type="button" onClick={() => setSteps(steps + 500)}>+500 Steps</button><button type="button" onClick={() => setSteps(0)}>Reset</button></div></section><section className="sleep-tracker"><h3>Log Sleep</h3><label><span>{sleepHours.toFixed(1)} hours</span><input type="range" min="1" max="14" step="0.5" value={sleepHours} onChange={(event) => setSleepHours(Number(event.target.value))} /></label><button type="button" onClick={logSleep}>Save Last Night</button><div>{sleepLog.map((entry) => <article key={entry.id}><span>{entry.date}</span><strong>{entry.hours.toFixed(1)} hr</strong></article>)}</div></section></div>
  </div>;
}
