"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type Device = {
  id: string;
  name: string;
  family: "phone" | "tablet" | "laptop";
  width: number;
  height: number;
  island?: boolean;
};

type StoreApp = {
  id: string;
  name: string;
  icon: string;
  category: string;
  description: string;
  color: string;
  featured?: boolean;
  custom?: boolean;
};

const DEVICES: Device[] = [
  { id: "iphone-14", name: "iPhone 14", family: "phone", width: 390, height: 844 },
  { id: "iphone-14-plus", name: "iPhone 14 Plus", family: "phone", width: 428, height: 926 },
  { id: "iphone-14-pro", name: "iPhone 14 Pro", family: "phone", width: 393, height: 852, island: true },
  { id: "iphone-14-pro-max", name: "iPhone 14 Pro Max", family: "phone", width: 430, height: 932, island: true },
  { id: "iphone-15", name: "iPhone 15", family: "phone", width: 393, height: 852, island: true },
  { id: "iphone-15-plus", name: "iPhone 15 Plus", family: "phone", width: 430, height: 932, island: true },
  { id: "iphone-15-pro", name: "iPhone 15 Pro", family: "phone", width: 393, height: 852, island: true },
  { id: "iphone-15-pro-max", name: "iPhone 15 Pro Max", family: "phone", width: 430, height: 932, island: true },
  { id: "iphone-16e", name: "iPhone 16e", family: "phone", width: 390, height: 844 },
  { id: "iphone-16", name: "iPhone 16", family: "phone", width: 393, height: 852, island: true },
  { id: "iphone-16-plus", name: "iPhone 16 Plus", family: "phone", width: 430, height: 932, island: true },
  { id: "iphone-16-pro", name: "iPhone 16 Pro", family: "phone", width: 402, height: 874, island: true },
  { id: "iphone-16-pro-max", name: "iPhone 16 Pro Max", family: "phone", width: 440, height: 956, island: true },
  { id: "iphone-17", name: "iPhone 17", family: "phone", width: 402, height: 874, island: true },
  { id: "iphone-17-air", name: "iPhone 17 Air", family: "phone", width: 420, height: 912, island: true },
  { id: "iphone-17-pro", name: "iPhone 17 Pro", family: "phone", width: 402, height: 874, island: true },
  { id: "iphone-17-pro-max", name: "iPhone 17 Pro Max", family: "phone", width: 440, height: 956, island: true },
  { id: "ipad-mini", name: "iPad mini", family: "tablet", width: 744, height: 1133 },
  { id: "ipad", name: "iPad", family: "tablet", width: 820, height: 1180 },
  { id: "ipad-air-11", name: "iPad Air 11-inch", family: "tablet", width: 834, height: 1194 },
  { id: "ipad-air-13", name: "iPad Air 13-inch", family: "tablet", width: 1024, height: 1366 },
  { id: "ipad-pro-11", name: "iPad Pro 11-inch", family: "tablet", width: 834, height: 1210 },
  { id: "ipad-pro-13", name: "iPad Pro 13-inch", family: "tablet", width: 1032, height: 1376 },
  { id: "nitro-v-15", name: "Nitro V 15", family: "laptop", width: 1920, height: 1080 },
];

const BUILT_INS = [
  { id: "messages", name: "Messages", icon: "💬", color: "#31d35c" },
  { id: "calendar", name: "Calendar", icon: "📅", color: "#ffffff" },
  { id: "photos", name: "Photos", icon: "🌸", color: "#ffffff" },
  { id: "camera", name: "Camera", icon: "📷", color: "#d9dce1" },
  { id: "weather", name: "Weather", icon: "🌤️", color: "#42a5f5" },
  { id: "clock", name: "Clock", icon: "🕘", color: "#101114" },
  { id: "maps", name: "Maps", icon: "🗺️", color: "#eaf7e9" },
  { id: "notes", name: "Notes", icon: "📝", color: "#ffd951" },
  { id: "settings", name: "Settings", icon: "⚙️", color: "#858b94" },
  { id: "store", name: "Custom Store", icon: "✦", color: "#2376ff" },
  { id: "files", name: "Files", icon: "📁", color: "#eef5ff" },
  { id: "calculator", name: "Calculator", icon: "🧮", color: "#191b20" },
  { id: "devices", name: "Device Library", icon: "💻", color: "#5558d9" },
];

const STORE_APPS: StoreApp[] = [
  { id: "sketchpad", name: "Sketchpad", icon: "🎨", category: "Creativity", description: "Draw, paint, and turn ideas into colorful canvases.", color: "#7c5cff", featured: true },
  { id: "orbit", name: "Orbit Weather", icon: "🪐", category: "Weather", description: "Beautiful forecasts for every place you care about.", color: "#1469ee", featured: true },
  { id: "pulse", name: "Pulse Fitness", icon: "💗", category: "Health", description: "Move more with friendly goals and daily activity rings.", color: "#ff3864", featured: true },
  { id: "soundwave", name: "Soundwave", icon: "🎧", category: "Music", description: "Your favorite mixes, playlists, and sounds in one place.", color: "#ff2b8a" },
  { id: "tiny-tower", name: "Tiny Tower", icon: "🏙️", category: "Games", description: "Build a bright pocket city, floor by floor.", color: "#ff9d24" },
  { id: "focus", name: "Focus Flow", icon: "🫧", category: "Productivity", description: "Simple timers that make big tasks feel manageable.", color: "#20b99a" },
  { id: "stargazer", name: "Stargazer", icon: "🔭", category: "Education", description: "Explore tonight’s sky with interactive star guides.", color: "#272068" },
  { id: "recipebox", name: "Recipe Box", icon: "🥗", category: "Food", description: "Save family favorites and discover something delicious.", color: "#56ad55" },
];

const WALLPAPERS = [
  "wallpaper-orbit",
  "wallpaper-sunset",
  "wallpaper-ocean",
  "wallpaper-night",
];

const pad = (value: number) => String(value).padStart(2, "0");

export default function Home() {
  const [deviceId, setDeviceId] = useState("iphone-17-pro");
  const [landscape, setLandscape] = useState(false);
  const [activeApp, setActiveApp] = useState<string | null>(null);
  const [storeTab, setStoreTab] = useState<"discover" | "apps" | "developer">("discover");
  const [installed, setInstalled] = useState<string[]>([]);
  const [customApps, setCustomApps] = useState<StoreApp[]>([]);
  const [devUnlocked, setDevUnlocked] = useState(false);
  const [devCode, setDevCode] = useState("");
  const [devError, setDevError] = useState("");
  const [search, setSearch] = useState("");
  const [wallpaper, setWallpaper] = useState(WALLPAPERS[0]);
  const [controlCenter, setControlCenter] = useState(false);
  const [toast, setToast] = useState("");
  const [now, setNow] = useState(new Date());
  const [newApp, setNewApp] = useState({ name: "", icon: "🚀", category: "Utilities", description: "", color: "#6c5ce7" });

  const device = DEVICES.find((item) => item.id === deviceId) ?? DEVICES[0];
  const allStoreApps = useMemo(() => [...STORE_APPS, ...customApps], [customApps]);

  useEffect(() => {
    const tick = window.setInterval(() => setNow(new Date()), 30000);
    return () => window.clearInterval(tick);
  }, []);

  useEffect(() => {
    const handleKeyboard = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActiveApp(null);
        setControlCenter(false);
      }
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setActiveApp("store");
        setStoreTab("apps");
      }
    };
    window.addEventListener("keydown", handleKeyboard);
    return () => window.removeEventListener("keydown", handleKeyboard);
  }, []);

  useEffect(() => {
    try {
      setInstalled(JSON.parse(localStorage.getItem(`custom-software-installed-${deviceId}`) || "[]"));
      setCustomApps(JSON.parse(localStorage.getItem("custom-software-catalog") || "[]"));
      setWallpaper(localStorage.getItem(`custom-software-wallpaper-${deviceId}`) || WALLPAPERS[0]);
    } catch {
      setInstalled([]);
      setCustomApps([]);
    }
  }, [deviceId]);

  useEffect(() => {
    localStorage.setItem(`custom-software-installed-${deviceId}`, JSON.stringify(installed));
  }, [installed, deviceId]);

  const notify = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2200);
  };

  const toggleInstall = (app: StoreApp) => {
    if (installed.includes(app.id)) {
      setActiveApp(app.id);
      return;
    }
    setInstalled((current) => [...current, app.id]);
    notify(`${app.name} installed`);
  };

  const removeApp = (app: StoreApp) => {
    setInstalled((current) => current.filter((id) => id !== app.id));
    notify(`${app.name} removed`);
  };

  const unlockDeveloper = (event: FormEvent) => {
    event.preventDefault();
    if (devCode === "1234") {
      setDevUnlocked(true);
      setDevError("");
      notify("Developer access unlocked");
    } else {
      setDevError("That code isn’t correct. Try again.");
    }
  };

  const addCustomApp = (event: FormEvent) => {
    event.preventDefault();
    if (!newApp.name.trim() || !newApp.description.trim()) return;
    const app: StoreApp = {
      id: `custom-${Date.now()}`,
      ...newApp,
      name: newApp.name.trim(),
      description: newApp.description.trim(),
      custom: true,
    };
    const next = [...customApps, app];
    setCustomApps(next);
    localStorage.setItem("custom-software-catalog", JSON.stringify(next));
    setNewApp({ name: "", icon: "🚀", category: "Utilities", description: "", color: "#6c5ce7" });
    setStoreTab("apps");
    notify(`${app.name} added to Custom Store`);
  };

  const chooseWallpaper = (choice: string) => {
    setWallpaper(choice);
    localStorage.setItem(`custom-software-wallpaper-${deviceId}`, choice);
  };

  const openApp = (id: string) => {
    setControlCenter(false);
    setActiveApp(id);
    if (id === "store") setStoreTab("discover");
  };

  const filteredApps = allStoreApps.filter((app) => `${app.name} ${app.category}`.toLowerCase().includes(search.toLowerCase()));
  const installedApps = installed.map((id) => allStoreApps.find((app) => app.id === id)).filter(Boolean) as StoreApp[];
  const scaleStyle = {
    "--device-w": `${landscape ? device.height : device.width}px`,
    "--device-h": `${landscape ? device.width : device.height}px`,
    "--device-ratio": `${(landscape ? device.height : device.width) / (landscape ? device.width : device.height)}`,
  } as React.CSSProperties;

  return (
    <main className="studio">
      <header className="studio-header">
        <div className="brand-lockup">
          <span className="brand-mark">CS</span>
          <div><strong>Custom Software</strong><small>Device Studio</small></div>
        </div>
        <div className="device-tools" aria-label="Device controls">
          <label className="device-select-label">
            <span>Preview device</span>
            <select value={deviceId} onChange={(event) => { setDeviceId(event.target.value); setActiveApp(null); }} aria-label="Choose a device">
              <optgroup label="iPhone 14">
                {DEVICES.filter((item) => item.id.startsWith("iphone-14")).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
              </optgroup>
              <optgroup label="iPhone 15">
                {DEVICES.filter((item) => item.id.startsWith("iphone-15")).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
              </optgroup>
              <optgroup label="iPhone 16">
                {DEVICES.filter((item) => item.id.startsWith("iphone-16")).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
              </optgroup>
              <optgroup label="iPhone 17">
                {DEVICES.filter((item) => item.id.startsWith("iphone-17")).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
              </optgroup>
              <optgroup label="iPad">
                {DEVICES.filter((item) => item.family === "tablet").map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
              </optgroup>
              <optgroup label="Laptop">
                {DEVICES.filter((item) => item.family === "laptop").map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
              </optgroup>
            </select>
          </label>
          <button className="tool-button" type="button" onClick={() => setLandscape((value) => !value)} aria-label="Rotate device"><span>↻</span> Rotate</button>
        </div>
        <div className="studio-status"><span className="live-dot" /> Interactive preview</div>
      </header>

      <section className="preview-stage">
        <aside className="stage-note">
          <span className="eyebrow">CURRENT DEVICE</span>
          <h1>{device.name}</h1>
          <p>{landscape ? device.height : device.width} × {landscape ? device.width : device.height} points</p>
          <div className="hint-card"><span>✦</span><p><strong>Try Custom Store</strong>Install apps or use code <b>1234</b> to add your own.</p></div>
        </aside>

        <div className={`device-scaler ${device.family} ${landscape ? "is-landscape" : ""}`} style={scaleStyle}>
          <div className={`device-frame ${device.family}`}>
            <div className={`device-screen ${wallpaper}`}>
              <div className="status-bar">
                <button className="status-time" type="button" onClick={() => setControlCenter((value) => !value)} aria-label="Open Control Center">{pad(now.getHours())}:{pad(now.getMinutes())}</button>
                {device.family === "phone" && (device.island ? <button className="dynamic-island" type="button" onClick={() => notify("Nothing playing right now")} aria-label="Dynamic activity"><span /></button> : <span className="notch" />)}
                <button className="status-icons" type="button" onClick={() => setControlCenter((value) => !value)} aria-label="Open Control Center"><span>▮▮▮</span><span>⌁</span><span className="battery">82</span></button>
              </div>

              {activeApp ? (
                <AppView
                  id={activeApp}
                  device={device}
                  storeTab={storeTab}
                  setStoreTab={setStoreTab}
                  search={search}
                  setSearch={setSearch}
                  apps={filteredApps}
                  installed={installed}
                  toggleInstall={toggleInstall}
                  removeApp={removeApp}
                  devUnlocked={devUnlocked}
                  devCode={devCode}
                  setDevCode={setDevCode}
                  devError={devError}
                  unlockDeveloper={unlockDeveloper}
                  newApp={newApp}
                  setNewApp={setNewApp}
                  addCustomApp={addCustomApp}
                  wallpaper={wallpaper}
                  chooseWallpaper={chooseWallpaper}
                  deviceId={deviceId}
                  setDeviceId={(id) => { setDeviceId(id); setActiveApp(null); }}
                  onClose={() => setActiveApp(null)}
                  app={allStoreApps.find((item) => item.id === activeApp)}
                />
              ) : (
                <HomeScreen device={device} installedApps={installedApps} openApp={openApp} now={now} />
              )}

              {controlCenter && <ControlCenter close={() => setControlCenter(false)} />}
              {toast && <div className="toast" role="status"><span>✓</span>{toast}</div>}
              <button className="home-indicator" type="button" onClick={() => { setActiveApp(null); setControlCenter(false); }} aria-label="Go to Home" />
            </div>
          </div>
        </div>

        <aside className="feature-list">
          <span className="eyebrow">BUILT FOR TOUCH</span>
          <ul>
            <li><span>01</span><div><strong>Responsive</strong><small>Phone, tablet, and laptop layouts</small></div></li>
            <li><span>02</span><div><strong>Persistent</strong><small>Apps stay installed</small></div></li>
            <li><span>03</span><div><strong>Expandable</strong><small>Add apps with code 1234</small></div></li>
          </ul>
        </aside>
      </section>
    </main>
  );
}

function HomeScreen({ device, installedApps, openApp, now }: { device: Device; installedApps: StoreApp[]; openApp: (id: string) => void; now: Date }) {
  const apps = [...BUILT_INS, ...installedApps];
  const columns = device.family === "laptop" ? 8 : device.family === "tablet" ? 6 : 4;
  return (
    <div className="home-screen">
      <div className="home-widgets">
        <div className="weather-widget"><span>Chicago</span><strong>76°</strong><small>Mostly Sunny</small></div>
        {device.family !== "phone" && <div className="calendar-widget"><span>{now.toLocaleDateString("en-US", { weekday: "long" })}</span><strong>{now.getDate()}</strong><small>Make something wonderful today.</small></div>}
      </div>
      <div className="app-grid" style={{ "--columns": columns } as React.CSSProperties}>
        {apps.map((app) => (
          <button className="app-icon-button" key={app.id} type="button" onClick={() => openApp(app.id)}>
            <span className="app-icon" style={{ background: app.color }}>{app.icon}</span>
            <span className="app-name">{app.name}</span>
          </button>
        ))}
      </div>
      <div className="page-dots"><span className="active" /><span /></div>
      <div className="dock">
        {[
          BUILT_INS[0], BUILT_INS[2], BUILT_INS[9], { id: "soundwave", name: "Music", icon: "🎵", color: "#ff315d" },
        ].map((app) => <button key={app.id} type="button" onClick={() => openApp(app.id)} aria-label={app.name}><span className="app-icon" style={{ background: app.color }}>{app.icon}</span></button>)}
      </div>
    </div>
  );
}

type AppViewProps = {
  id: string; device: Device; storeTab: "discover" | "apps" | "developer"; setStoreTab: (tab: "discover" | "apps" | "developer") => void;
  search: string; setSearch: (value: string) => void; apps: StoreApp[]; installed: string[]; toggleInstall: (app: StoreApp) => void; removeApp: (app: StoreApp) => void;
  devUnlocked: boolean; devCode: string; setDevCode: (value: string) => void; devError: string; unlockDeveloper: (event: FormEvent) => void;
  newApp: { name: string; icon: string; category: string; description: string; color: string }; setNewApp: (value: { name: string; icon: string; category: string; description: string; color: string }) => void;
  addCustomApp: (event: FormEvent) => void; wallpaper: string; chooseWallpaper: (choice: string) => void;
  deviceId: string; setDeviceId: (id: string) => void; onClose: () => void; app?: StoreApp;
};

function AppView(props: AppViewProps) {
  if (props.id === "store") return <CustomStore {...props} />;
  if (props.id === "settings") return <SettingsApp wallpaper={props.wallpaper} chooseWallpaper={props.chooseWallpaper} device={props.device} onClose={props.onClose} />;
  if (props.id === "calculator") return <Calculator onClose={props.onClose} />;
  if (props.id === "notes") return <Notes onClose={props.onClose} />;
  if (props.id === "weather") return <Weather onClose={props.onClose} />;
  if (props.id === "devices") return <DeviceLibrary currentDeviceId={props.deviceId} setDeviceId={props.setDeviceId} onClose={props.onClose} />;
  return <GenericApp app={props.app} id={props.id} onClose={props.onClose} />;
}

function AppHeader({ title, onClose, trailing }: { title: string; onClose: () => void; trailing?: React.ReactNode }) {
  return <div className="app-header"><button type="button" onClick={onClose} aria-label="Close app">‹</button><strong>{title}</strong><span>{trailing}</span></div>;
}

function CustomStore(props: AppViewProps) {
  const featured = props.apps.filter((app) => app.featured);
  return (
    <div className="app-window store-window">
      <AppHeader title="Custom Store" onClose={props.onClose} trailing={<span className="avatar">CS</span>} />
      <div className="store-scroll">
        {props.storeTab === "discover" && <>
          <div className="store-heading"><span>DISCOVER</span><h2>Apps you’ll love.</h2><p>Made for Custom Software.</p></div>
          <div className="featured-card">
            <div><span>APP OF THE DAY</span><h3>Sketchpad</h3><p>Make a mark. Make it yours.</p><button type="button" onClick={() => props.toggleInstall(STORE_APPS[0])}>{props.installed.includes("sketchpad") ? "OPEN" : "GET"}</button></div>
            <div className="featured-art"><span>✎</span><span>◯</span><span>✦</span></div>
          </div>
          <section className="store-section"><div className="section-title"><h3>Popular right now</h3><button type="button" onClick={() => props.setStoreTab("apps")}>See All</button></div>
            <div className="app-list">{featured.map((app) => <StoreRow key={app.id} app={app} installed={props.installed.includes(app.id)} onInstall={props.toggleInstall} onRemove={props.removeApp} />)}</div>
          </section>
        </>}

        {props.storeTab === "apps" && <>
          <div className="store-heading"><span>CATALOG</span><h2>Find your next app.</h2></div>
          <label className="store-search"><span>⌕</span><input value={props.search} onChange={(event) => props.setSearch(event.target.value)} placeholder="Search apps" aria-label="Search apps" /></label>
          <div className="app-list catalog-list">{props.apps.map((app) => <StoreRow key={app.id} app={app} installed={props.installed.includes(app.id)} onInstall={props.toggleInstall} onRemove={props.removeApp} />)}</div>
          {props.apps.length === 0 && <div className="empty-state">No apps found.</div>}
        </>}

        {props.storeTab === "developer" && (!props.devUnlocked ? <div className="developer-lock">
          <div className="lock-symbol">⌘</div><h2>Developer Access</h2><p>Enter your publisher code to add apps to Custom Store.</p>
          <form onSubmit={props.unlockDeveloper}><label>Publisher code<input type="password" inputMode="numeric" maxLength={4} value={props.devCode} onChange={(event) => props.setDevCode(event.target.value)} placeholder="4-digit code" autoComplete="off" /></label>{props.devError && <p className="form-error">{props.devError}</p>}<button type="submit">Unlock</button></form>
        </div> : <div className="developer-form">
          <div className="store-heading"><span>DEVELOPER</span><h2>Add an app.</h2><p>Publish instantly to this Custom Store.</p></div>
          <form onSubmit={props.addCustomApp}>
            <div className="app-preview"><span style={{ background: props.newApp.color }}>{props.newApp.icon || "🚀"}</span><div><strong>{props.newApp.name || "Your App"}</strong><small>{props.newApp.category}</small></div></div>
            <label>App name<input required value={props.newApp.name} onChange={(event) => props.setNewApp({ ...props.newApp, name: event.target.value })} placeholder="My great app" /></label>
            <div className="form-row"><label>Icon<input required value={props.newApp.icon} onChange={(event) => props.setNewApp({ ...props.newApp, icon: event.target.value.slice(0, 3) })} /></label><label>Color<input type="color" value={props.newApp.color} onChange={(event) => props.setNewApp({ ...props.newApp, color: event.target.value })} /></label></div>
            <label>Category<select value={props.newApp.category} onChange={(event) => props.setNewApp({ ...props.newApp, category: event.target.value })}><option>Utilities</option><option>Games</option><option>Education</option><option>Creativity</option><option>Productivity</option><option>Entertainment</option></select></label>
            <label>Description<textarea required value={props.newApp.description} onChange={(event) => props.setNewApp({ ...props.newApp, description: event.target.value })} placeholder="What makes your app special?" /></label>
            <button className="publish-button" type="submit">Add to Custom Store</button>
          </form>
        </div>)}
      </div>
      <nav className="store-tabs" aria-label="Store sections">
        <button className={props.storeTab === "discover" ? "active" : ""} type="button" onClick={() => props.setStoreTab("discover")}><span>✦</span>Discover</button>
        <button className={props.storeTab === "apps" ? "active" : ""} type="button" onClick={() => props.setStoreTab("apps")}><span>▦</span>Apps</button>
        <button className={props.storeTab === "developer" ? "active" : ""} type="button" onClick={() => props.setStoreTab("developer")}><span>⌘</span>Add App</button>
      </nav>
    </div>
  );
}

function StoreRow({ app, installed, onInstall, onRemove }: { app: StoreApp; installed: boolean; onInstall: (app: StoreApp) => void; onRemove: (app: StoreApp) => void }) {
  return <article className="store-row"><span className="store-icon" style={{ background: app.color }}>{app.icon}</span><div><strong>{app.name}</strong><small>{app.category}</small><p>{app.description}</p></div><div className="store-actions"><button type="button" onClick={() => onInstall(app)}>{installed ? "OPEN" : "GET"}</button>{installed && <button className="remove-button" type="button" onClick={() => onRemove(app)} aria-label={`Remove ${app.name}`}>×</button>}</div></article>;
}

function SettingsApp({ wallpaper, chooseWallpaper, device, onClose }: { wallpaper: string; chooseWallpaper: (choice: string) => void; device: Device; onClose: () => void }) {
  return <div className="app-window settings-window"><AppHeader title="Settings" onClose={onClose} /><div className="settings-scroll"><h2>Settings</h2><div className="profile-card"><span>CS</span><div><strong>Custom Software</strong><small>{device.name}</small></div><b>›</b></div><section><h3>Wallpaper</h3><div className="wallpaper-picker">{WALLPAPERS.map((choice) => <button key={choice} className={`${choice} ${wallpaper === choice ? "selected" : ""}`} type="button" onClick={() => chooseWallpaper(choice)} aria-label={`Choose ${choice}`}><span>✓</span></button>)}</div></section><section className="settings-list"><button type="button"><span>◉</span><div><strong>Display & Brightness</strong><small>Automatic</small></div><b>›</b></button><button type="button"><span>◌</span><div><strong>Sounds & Haptics</strong><small>Default</small></div><b>›</b></button><button type="button"><span>▣</span><div><strong>Privacy & Security</strong><small>Protected</small></div><b>›</b></button><button type="button"><span>ⓘ</span><div><strong>About</strong><small>Custom Software 1.0</small></div><b>›</b></button></section></div></div>;
}

function Calculator({ onClose }: { onClose: () => void }) {
  const [value, setValue] = useState("0");
  const tap = (key: string) => { if (key === "AC") setValue("0"); else if (key === "=") { try { setValue(String(Function(`"use strict"; return (${value.replaceAll("×", "*").replaceAll("÷", "/")})`)())); } catch { setValue("Error"); } } else setValue(value === "0" ? key : value + key); };
  return <div className="app-window calculator-window"><AppHeader title="Calculator" onClose={onClose} /><div className="calc-display">{value}</div><div className="calc-grid">{["AC", "+/−", "%", "÷", "7", "8", "9", "×", "4", "5", "6", "−", "1", "2", "3", "+", "0", ".", "="].map((key) => <button className={key === "0" ? "zero" : ""} key={key} type="button" onClick={() => tap(key)}>{key}</button>)}</div></div>;
}

function Notes({ onClose }: { onClose: () => void }) {
  const [text, setText] = useState("Ideas for today\n\n• Build something useful\n• Try a new Custom Store app\n• Share the good stuff");
  return <div className="app-window notes-window"><AppHeader title="Notes" onClose={onClose} trailing={<button className="header-action" type="button">Done</button>} /><textarea value={text} onChange={(event) => setText(event.target.value)} aria-label="Note" /></div>;
}

function Weather({ onClose }: { onClose: () => void }) {
  return <div className="app-window weather-window"><AppHeader title="Weather" onClose={onClose} /><div className="weather-main"><span>My Location</span><h2>Chicago</h2><strong>76°</strong><p>Mostly Sunny</p><small>H: 81° &nbsp; L: 66°</small></div><div className="forecast">{["Now", "11AM", "12PM", "1PM", "2PM"].map((time, index) => <div key={time}><span>{time}</span><b>{index > 2 ? "☁️" : "☀️"}</b><strong>{76 + index}°</strong></div>)}</div></div>;
}

function GenericApp({ app, id, onClose }: { app?: StoreApp; id: string; onClose: () => void }) {
  const built = BUILT_INS.find((item) => item.id === id);
  const current = app || (built ? { ...built, category: "Built-in", description: `A beautifully simple ${built.name.toLowerCase()} experience.` } : undefined);
  return <div className="app-window generic-window" style={{ "--app-color": current?.color || "#367cff" } as React.CSSProperties}><AppHeader title={current?.name || "App"} onClose={onClose} /><div className="generic-content"><span className="generic-icon" style={{ background: current?.color }}>{current?.icon || "✦"}</span><h2>{current?.name || "Custom App"}</h2><p>{current?.description || "Welcome to your app."}</p><button type="button" onClick={onClose}>Back to Home</button></div></div>;
}

function DeviceLibrary({ currentDeviceId, setDeviceId, onClose }: { currentDeviceId: string; setDeviceId: (id: string) => void; onClose: () => void }) {
  const [downloaded, setDownloaded] = useState<string[]>([currentDeviceId]);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("custom-software-devices") || "[]") as string[];
      setDownloaded(Array.from(new Set([currentDeviceId, ...saved])));
    } catch {
      setDownloaded([currentDeviceId]);
    }
  }, [currentDeviceId]);

  const handleDevice = (device: Device) => {
    if (!downloaded.includes(device.id)) {
      const next = [...downloaded, device.id];
      setDownloaded(next);
      localStorage.setItem("custom-software-devices", JSON.stringify(next));
      return;
    }
    setDeviceId(device.id);
  };

  return <div className="app-window device-library-window">
    <AppHeader title="Device Library" onClose={onClose} trailing={<span className="avatar">DL</span>} />
    <div className="device-library-scroll">
      <div className="store-heading"><span>DEVICE LIBRARY</span><h2>More screens. One system.</h2><p>Download a device profile, then switch instantly.</p></div>
      <div className="device-catalog">
        {DEVICES.map((device) => {
          const isDownloaded = downloaded.includes(device.id);
          const isCurrent = currentDeviceId === device.id;
          return <article className="device-card" key={device.id}>
            <div className={`device-card-art ${device.family}`}><span>{device.family === "phone" ? "▯" : device.family === "tablet" ? "▭" : "▱"}</span></div>
            <div><small>{device.family}</small><strong>{device.name}</strong><p>{device.width} × {device.height}</p></div>
            <button type="button" className={isCurrent ? "current" : ""} onClick={() => handleDevice(device)} disabled={isCurrent}>{isCurrent ? "CURRENT" : isDownloaded ? "USE" : "DOWNLOAD"}</button>
          </article>;
        })}
      </div>
    </div>
  </div>;
}

function ControlCenter({ close }: { close: () => void }) {
  const [brightness, setBrightness] = useState(72);
  const [volume, setVolume] = useState(45);
  return <div className="control-layer" onClick={close}><div className="control-center" onClick={(event) => event.stopPropagation()}><div className="control-grid"><div className="connectivity"><button className="on" type="button">✈</button><button className="on" type="button">⌁</button><button className="on" type="button">ᛒ</button><button type="button">◉</button></div><div className="now-playing"><small>Not Playing</small><div><button type="button">◀</button><button type="button">▶</button><button type="button">▶|</button></div></div><label className="slider-tile"><span>☀</span><input type="range" min="0" max="100" value={brightness} onChange={(event) => setBrightness(Number(event.target.value))} /></label><label className="slider-tile"><span>◖</span><input type="range" min="0" max="100" value={volume} onChange={(event) => setVolume(Number(event.target.value))} /></label></div><div className="quick-controls"><button type="button">☾</button><button type="button">▣</button><button type="button">◉</button><button type="button">⌁</button></div></div></div>;
}
