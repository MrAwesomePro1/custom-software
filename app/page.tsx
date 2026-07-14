"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  CalendarApp, CameraApp, ClockApp, ContactsApp, CustomWorkspaceApp, FaceTimeApp, FilesApp, FitnessApp, FocusApp,
  MapsApp, MessagesHubApp, MusicApp, NotesApp, PhotosApp, RecipeApp, SketchpadApp,
  HealthApp, StargazerApp, TowerGameApp, VidersApp, WalletApp, WeatherApp,
} from "./functional-apps";

interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

type Device = {
  id: string;
  name: string;
  family: "phone" | "tablet" | "laptop" | "console";
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
  deviceFamily?: "phone";
};

type FamilyAccount = { id: string; name: string; age: number; pin: string; email?: string; role: "adult" | "child"; familyIds: string[] };
type FamilyGroup = { id: string; name: string; memberIds: string[]; guardianIds: string[] };
type FamilyState = { accounts: FamilyAccount[]; families: FamilyGroup[]; currentAccountId: string; activeFamilyId: string };
type OnlineUser = { displayName: string; email: string; fullName: string | null };

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
  { id: "switch-1", name: "Nintendo Switch", family: "console", width: 1280, height: 720 },
  { id: "switch-2", name: "Nintendo Switch 2", family: "console", width: 1920, height: 1080 },
];

const BUILT_INS = [
  { id: "messages", name: "Messages", icon: "💬", color: "#31d35c" },
  { id: "calendar", name: "Calendar", icon: "📅", color: "#ffffff" },
  { id: "photos", name: "Photos", icon: "🌸", color: "#ffffff" },
  { id: "camera", name: "Camera", icon: "📷", color: "#d9dce1" },
  { id: "facetime", name: "FaceTime", icon: "🎥", color: "#2fcf62" },
  { id: "weather", name: "Weather", icon: "🌤️", color: "#42a5f5" },
  { id: "clock", name: "Clock", icon: "🕘", color: "#101114" },
  { id: "maps", name: "Maps", icon: "🗺️", color: "#eaf7e9" },
  { id: "notes", name: "Notes", icon: "📝", color: "#ffd951" },
  { id: "settings", name: "Settings", icon: "⚙️", color: "#858b94" },
  { id: "store", name: "Custom Store", icon: "✦", color: "#2376ff" },
  { id: "files", name: "Files", icon: "📁", color: "#eef5ff" },
  { id: "calculator", name: "Calculator", icon: "🧮", color: "#191b20" },
  { id: "devices", name: "Device Library", icon: "💻", color: "#5558d9" },
  { id: "contacts", name: "Contacts", icon: "👤", color: "#8d94a2" },
  { id: "wallet", name: "Wallet", icon: "🪙", color: "#17191f" },
  { id: "family", name: "Family", icon: "👨‍👩‍👧", color: "#5a65e8" },
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
  { id: "health-plus", name: "Health", icon: "❤️", category: "Health", description: "Track daily steps, sleep duration, and healthy trends on iPhone.", color: "#ffffff", deviceFamily: "phone" },
  { id: "viders", name: "Viders", icon: "▶", category: "Entertainment", description: "Watch videos and creators in the Viders platform you made.", color: "#ff245e", featured: true },
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
  const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent | null>(null);
  const [installHelp, setInstallHelp] = useState(false);
  const [familyState, setFamilyState] = useState<FamilyState | null>(null);
  const [familyReady, setFamilyReady] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [country, setCountry] = useState("");
  const [onlineUser, setOnlineUser] = useState<OnlineUser | null>(null);
  const [now, setNow] = useState(new Date());
  const [newApp, setNewApp] = useState({ name: "", icon: "🚀", category: "Utilities", description: "", color: "#6c5ce7" });

  const device = DEVICES.find((item) => item.id === deviceId) ?? DEVICES[0];
  const allStoreApps = useMemo(() => [...STORE_APPS, ...customApps], [customApps]);
  const currentAccount = familyState?.accounts.find((account) => account.id === familyState.currentAccountId);

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
      if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) {
        const controls = Array.from(document.querySelectorAll<HTMLElement>(".device-screen button:not(:disabled), .device-screen input, .device-screen textarea, .device-screen select"));
        if (!controls.length) return;
        const current = controls.indexOf(document.activeElement as HTMLElement);
        const direction = event.key === "ArrowLeft" || event.key === "ArrowUp" ? -1 : 1;
        controls[(current + direction + controls.length) % controls.length]?.focus();
        event.preventDefault();
      }
      if (event.key === "Backspace" && document.activeElement?.tagName === "BODY") setActiveApp(null);
    };
    window.addEventListener("keydown", handleKeyboard);
    return () => window.removeEventListener("keydown", handleKeyboard);
  }, []);

  useEffect(() => {
    if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    const captureInstall = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as InstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", captureInstall);
    return () => window.removeEventListener("beforeinstallprompt", captureInstall);
  }, []);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("cs-family-state");
      if (saved) setFamilyState(JSON.parse(saved));
      setCountry(localStorage.getItem("cs-country") || "");
      setSignedIn(sessionStorage.getItem("cs-account-session") === "active");
    } catch { /* show account setup */ }
    setFamilyReady(true);
  }, []);

  useEffect(() => {
    fetch("/api/me", { cache: "no-store" }).then((response) => response.json()).then((data) => setOnlineUser(data.user || null)).catch(() => setOnlineUser(null));
  }, []);

  const updateFamilyState = (next: FamilyState) => {
    setFamilyState(next);
    localStorage.setItem("cs-family-state", JSON.stringify(next));
  };

  const installApp = async () => {
    if (!installPrompt) { setInstallHelp(true); return; }
    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    if (choice.outcome === "accepted") notify("Custom Software installed");
    setInstallPrompt(null);
  };

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
    if (app.deviceFamily === "phone" && device.family !== "phone") { notify("Health is available only on iPhone profiles"); return; }
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

  if (!familyReady) return <div className="account-loading"><span className="brand-mark">CS</span><p>Starting Custom Software...</p></div>;
  if (!country) return <CountrySetup onComplete={(choice) => { localStorage.setItem("cs-country", choice); setCountry(choice); }} />;
  if (!familyState) return <AccountSetup onComplete={(next) => { updateFamilyState(next); sessionStorage.setItem("cs-account-session", "active"); setSignedIn(true); }} />;
  if (!signedIn) return <AccountLogin state={familyState} onlineUser={onlineUser} onSuccess={(next) => { updateFamilyState(next); sessionStorage.setItem("cs-account-session", "active"); setSignedIn(true); }} />;

  return (
    <main className="studio">
      <header className="studio-header">
        <div className="brand-lockup">
          <span className="brand-mark">CS</span>
          <div><strong>Custom Software</strong><small>Device Studio</small></div>
        </div>
        <div className="device-tools" aria-label="Device controls">
          <button className="account-chip" type="button" onClick={() => openApp("family")}><span>{currentAccount?.name.slice(0, 1) || "U"}</span><div><strong>{currentAccount?.name || "Account"}</strong><small>{currentAccount?.age || 0} years</small></div></button>
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
              <optgroup label="Game Console">
                {DEVICES.filter((item) => item.family === "console").map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
              </optgroup>
            </select>
          </label>
          <button className="tool-button" type="button" onClick={() => setLandscape((value) => !value)} aria-label="Rotate device"><span>↻</span> Rotate</button>
          <button className="tool-button install-button" type="button" onClick={installApp} aria-label="Install Custom Software"><span>↓</span> Install App</button>
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
          <div className={`device-frame ${device.family} device-${device.id}`}>
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
                  familyState={familyState}
                  setFamilyState={updateFamilyState}
                  signOut={() => { sessionStorage.removeItem("cs-account-session"); setSignedIn(false); setActiveApp(null); }}
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
      {installHelp && <div className="install-help-layer" role="dialog" aria-modal="true" aria-label="Install Custom Software"><div className="install-help-card"><button className="install-close" type="button" onClick={() => setInstallHelp(false)} aria-label="Close">×</button><span className="brand-mark">CS</span><h2>Install Custom Software</h2><p><strong>iPhone or iPad</strong>Tap the Share button in Safari, then choose <b>Add to Home Screen</b>.</p><p><strong>Nitro V 15</strong>Open this page in Chrome or Edge, then choose <b>Install Custom Software</b> from the address bar or browser menu.</p><button type="button" onClick={() => setInstallHelp(false)}>Got it</button></div></div>}
    </main>
  );
}

function CountrySetup({ onComplete }: { onComplete: (country: string) => void }) {
  const [selected, setSelected] = useState("");
  return <main className="account-setup country-setup"><div className="account-panel"><span className="brand-mark">CS</span><div className="setup-heading"><small>WELCOME TO</small><h1>Choose your country</h1><p>This sets the local network region for Custom Software. You can choose only United States or KidTopia.</p></div><div className="country-options"><button className={selected === "United States" ? "selected" : ""} type="button" onClick={() => setSelected("United States")}><span>US</span><div><strong>United States</strong><small>United States local networks</small></div><b>{selected === "United States" ? "Selected" : "Choose"}</b></button><button className={selected === "KidTopia" ? "selected" : ""} type="button" onClick={() => setSelected("KidTopia")}><span>KT</span><div><strong>KidTopia</strong><small>KidTopia local networks</small></div><b>{selected === "KidTopia" ? "Selected" : "Choose"}</b></button></div><button className="setup-submit country-continue" type="button" disabled={!selected} onClick={() => onComplete(selected)}>Continue</button></div></main>;
}

function AccountSetup({ onComplete, existingState, onCancel }: { onComplete: (state: FamilyState) => void; existingState?: FamilyState; onCancel?: () => void }) {
  const [familyName, setFamilyName] = useState(""); const [name, setName] = useState(""); const [age, setAge] = useState(18); const [pin, setPin] = useState("");
  const [guardianName, setGuardianName] = useState(""); const [guardianAge, setGuardianAge] = useState(18); const [guardianPin, setGuardianPin] = useState(""); const [error, setError] = useState("");
  const submit = (event: FormEvent) => {
    event.preventDefault(); setError("");
    if (!familyName.trim() || !name.trim() || age < 1 || age > 120 || !/^\d{4}$/.test(pin)) { setError("Enter a family name, account name, valid age, and 4-digit PIN."); return; }
    if (existingState?.families.some((family) => family.name.trim().toLowerCase() === familyName.trim().toLowerCase())) { setError("That family name is already being used. Choose a different family name."); return; }
    const familyId = `family-${Date.now()}`; const accountId = `account-${Date.now()}`;
    if (age >= 18) {
      const account: FamilyAccount = { id: accountId, name: name.trim(), age, pin, role: "adult", familyIds: [familyId] };
      const family: FamilyGroup = { id: familyId, name: familyName.trim(), memberIds: [accountId], guardianIds: [accountId] };
      onComplete(existingState ? { accounts: [...existingState.accounts, account], families: [...existingState.families, family], currentAccountId: accountId, activeFamilyId: familyId } : { accounts: [account], families: [family], currentAccountId: accountId, activeFamilyId: familyId });
      return;
    }
    if (!guardianName.trim() || guardianAge < 18 || !/^\d{4}$/.test(guardianPin)) { setError("A guardian age 18+ and guardian PIN are required for a child account."); return; }
    const guardianId = `guardian-${Date.now()}`;
    const child: FamilyAccount = { id: accountId, name: name.trim(), age, pin, role: "child", familyIds: [familyId] };
    const guardian: FamilyAccount = { id: guardianId, name: guardianName.trim(), age: guardianAge, pin: guardianPin, role: "adult", familyIds: [familyId] };
    const family: FamilyGroup = { id: familyId, name: familyName.trim(), memberIds: [guardianId, accountId], guardianIds: [guardianId] };
    onComplete(existingState ? { accounts: [...existingState.accounts, guardian, child], families: [...existingState.families, family], currentAccountId: accountId, activeFamilyId: familyId } : { accounts: [guardian, child], families: [family], currentAccountId: accountId, activeFamilyId: familyId });
  };
  return <main className="account-setup"><div className="account-panel">{onCancel && <button className="login-back account-create-back" type="button" onClick={onCancel}>‹ Back to sign in</button>}<span className="brand-mark">CS</span><div className="setup-heading"><small>{existingState ? "NEW CUSTOM SOFTWARE ACCOUNT" : "WELCOME TO"}</small><h1>{existingState ? "Create an account" : "Custom Software"}</h1><p>{existingState ? "Create a new family and account on this device. Your saved families and accounts will stay available." : "Name your family and create the first Custom Software account. Everything stays on this device."}</p></div><form onSubmit={submit}><label>Family name<input required value={familyName} onChange={(event) => setFamilyName(event.target.value)} placeholder="The Awesome Family" /></label><div className="setup-grid"><label>Account name<input required value={name} onChange={(event) => setName(event.target.value)} placeholder="Name" /></label><label>Age<input required type="number" min="1" max="120" value={age} onChange={(event) => setAge(Number(event.target.value))} /></label></div><label>Choose a 4-digit PIN<input required inputMode="numeric" maxLength={4} value={pin} onChange={(event) => setPin(event.target.value.replace(/\D/g, "").slice(0, 4))} placeholder="0000" /></label>{age < 18 && <fieldset><legend>Guardian setup</legend><p>A parent or guardian must create the family for this child account.</p><div className="setup-grid"><label>Guardian name<input required value={guardianName} onChange={(event) => setGuardianName(event.target.value)} /></label><label>Guardian age<input required type="number" min="18" max="120" value={guardianAge} onChange={(event) => setGuardianAge(Number(event.target.value))} /></label></div><label>Guardian 4-digit PIN<input required inputMode="numeric" maxLength={4} value={guardianPin} onChange={(event) => setGuardianPin(event.target.value.replace(/\D/g, "").slice(0, 4))} /></label></fieldset>}{error && <p className="account-error">{error}</p>}<button className="setup-submit" type="submit">Create Account</button></form></div></main>;
}

function AccountLogin({ state, onSuccess, onlineUser }: { state: FamilyState; onSuccess: (state: FamilyState) => void; onlineUser: OnlineUser | null }) {
  const [familyId, setFamilyId] = useState(""); const [familyName, setFamilyName] = useState(""); const [selected, setSelected] = useState(""); const [pin, setPin] = useState(""); const [error, setError] = useState(""); const [creating, setCreating] = useState(false);
  const family = state.families.find((item) => item.id === familyId);
  const accounts = state.accounts.filter((account) => family?.memberIds.includes(account.id));
  const findFamily = (event: FormEvent) => { event.preventDefault(); const match = state.families.find((item) => item.name.trim().toLowerCase() === familyName.trim().toLowerCase()); if (!match) { setError("That family name was not found."); return; } const familyAccounts = state.accounts.filter((account) => match.memberIds.includes(account.id)); setFamilyId(match.id); setSelected(familyAccounts[0]?.id || ""); setPin(""); setError(""); };
  const login = (event: FormEvent) => { event.preventDefault(); const account = accounts.find((item) => item.id === selected); if (!account || account.pin !== pin) { setError("That PIN is not correct."); return; } onSuccess({ ...state, activeFamilyId: family!.id, currentAccountId: account.id }); };
  const continueOther = () => { if (!onlineUser) return; const activeFamily = state.families.find((item) => item.id === state.activeFamilyId) || state.families[0]; const choices = state.accounts.filter((account) => activeFamily.memberIds.includes(account.id)); const account = choices.find((item) => item.role === "adult") || choices[0]; if (account) onSuccess({ ...state, activeFamilyId: activeFamily.id, currentAccountId: account.id }); };
  if (creating) return <AccountSetup existingState={state} onCancel={() => setCreating(false)} onComplete={onSuccess} />;
  return <main className="account-setup account-login"><div className="account-panel"><span className="brand-mark">CS</span>{!family ? <><div className="setup-heading"><small>CUSTOM SOFTWARE</small><h1>Enter your family name</h1><p>Type the exact family name to find its Custom Software accounts.</p></div><form className="family-name-login" onSubmit={findFamily}><label>Family name<input autoFocus required value={familyName} onChange={(event) => { setFamilyName(event.target.value); setError(""); }} placeholder="Family name" /></label>{error && <p className="account-error">{error}</p>}<button className="setup-submit" type="submit">Continue</button></form><button className="create-account-button" type="button" onClick={() => setCreating(true)}><strong>Create Account</strong><small>Set up a new family, age, and 4-digit PIN</small></button><div className="signin-divider"><span>or</span></div>{onlineUser ? <button className="online-user-card" type="button" onClick={continueOther}><span>{onlineUser.displayName.slice(0, 1).toUpperCase()}</span><div><strong>Other Options</strong><small>{onlineUser.email}</small></div><b>›</b></button> : <a className="other-options" href="/signin-with-chatgpt?return_to=%2F">Other Options</a>}</> : <><button className="login-back" type="button" onClick={() => { setFamilyId(""); setSelected(""); setPin(""); setError(""); }}>‹ Change family</button><div className="setup-heading"><small>{family.name}</small><h1>Select your account</h1><p>Choose your Custom Software account, then enter its PIN.</p></div><div className="account-choices">{accounts.map((account) => <button className={selected === account.id ? "selected" : ""} type="button" key={account.id} onClick={() => { setSelected(account.id); setPin(""); setError(""); }}><span>{account.name.slice(0, 1)}</span><strong>{account.name}</strong><small>{account.role} • age {account.age}</small></button>)}</div><form onSubmit={login}><label>4-digit PIN<input autoFocus inputMode="numeric" maxLength={4} value={pin} onChange={(event) => setPin(event.target.value.replace(/\D/g, "").slice(0, 4))} placeholder="••••" /></label>{error && <p className="account-error">{error}</p>}<button className="setup-submit" type="submit">Sign In</button></form></>}</div></main>;
}

function FamilyApp({ state, onChange, signOut, onClose }: { state: FamilyState; onChange: (state: FamilyState) => void; signOut: () => void; onClose: () => void }) {
  const current = state.accounts.find((account) => account.id === state.currentAccountId)!;
  const family = state.families.find((item) => item.id === state.activeFamilyId)!;
  const members = state.accounts.filter((account) => family.memberIds.includes(account.id));
  const [child, setChild] = useState({ name: "", age: 8, pin: "" }); const [familyName, setFamilyName] = useState(""); const [message, setMessage] = useState("");
  const addChild = (event: FormEvent) => { event.preventDefault(); if (current.role !== "adult" || !child.name.trim() || child.age >= 18 || child.age < 1 || !/^\d{4}$/.test(child.pin)) { setMessage("Child accounts need a name, age under 18, and 4-digit PIN."); return; } const id = `child-${Date.now()}`; const account: FamilyAccount = { id, name: child.name.trim(), age: child.age, pin: child.pin, role: "child", familyIds: [family.id] }; onChange({ ...state, accounts: [...state.accounts, account], families: state.families.map((item) => item.id === family.id ? { ...item, memberIds: [...item.memberIds, id] } : item) }); setChild({ name: "", age: 8, pin: "" }); setMessage("Child account added."); };
  const createFamily = (event: FormEvent) => { event.preventDefault(); if (current.role !== "adult" || !familyName.trim()) return; const id = `family-${Date.now()}`; const nextAccount = { ...current, familyIds: [...current.familyIds, id] }; onChange({ accounts: state.accounts.map((account) => account.id === current.id ? nextAccount : account), families: [...state.families, { id, name: familyName.trim(), memberIds: [current.id], guardianIds: [current.id] }], currentAccountId: current.id, activeFamilyId: id }); setFamilyName(""); };
  const switchFamily = (id: string) => { if (current.age < 18 || !current.familyIds.includes(id)) return; onChange({ ...state, activeFamilyId: id }); };
  return <div className="app-window family-app"><AppHeader title="Family" onClose={onClose} trailing={<span className="avatar">{current.name.slice(0, 1)}</span>} /><div className="family-scroll"><div className="family-hero"><span>👨‍👩‍👧</span><div><small>ACTIVE FAMILY</small><h2>{family.name}</h2><p>{members.length} member{members.length === 1 ? "" : "s"}</p></div></div><section><h3>Family Members</h3><div className="family-members">{members.map((member) => <article key={member.id}><span>{member.name.slice(0, 1)}</span><div><strong>{member.name}</strong><small>{member.role} • age {member.age}</small></div>{family.guardianIds.includes(member.id) && <b>GUARDIAN</b>}</article>)}</div></section>{current.role === "adult" ? <><section><h3>Add Child Account</h3><form className="family-form" onSubmit={addChild}><input value={child.name} onChange={(event) => setChild({ ...child, name: event.target.value })} placeholder="Child name" /><input type="number" min="1" max="17" value={child.age} onChange={(event) => setChild({ ...child, age: Number(event.target.value) })} aria-label="Child age" /><input inputMode="numeric" maxLength={4} value={child.pin} onChange={(event) => setChild({ ...child, pin: event.target.value.replace(/\D/g, "").slice(0, 4) })} placeholder="4-digit PIN" /><button type="submit">Add Child</button></form>{message && <p className="family-message">{message}</p>}</section><section><h3>Switch Family</h3><div className="family-switcher">{state.families.filter((item) => current.familyIds.includes(item.id)).map((item) => <button className={item.id === family.id ? "active" : ""} type="button" key={item.id} onClick={() => switchFamily(item.id)}><span>{item.name.slice(0, 1)}</span><strong>{item.name}</strong><small>{item.id === family.id ? "Active" : "Switch"}</small></button>)}</div><form className="new-family-form" onSubmit={createFamily}><input value={familyName} onChange={(event) => setFamilyName(event.target.value)} placeholder="New family name" /><button type="submit">Create Family</button></form></section></> : <section className="child-family-note"><h3>Child Account</h3><p>A guardian manages accounts and family switching. Adults age 18+ can create or switch families.</p></section>}<button className="family-signout" type="button" onClick={signOut}>Switch Account / Sign Out</button></div></div>;
}

function HomeScreen({ device, installedApps, openApp, now }: { device: Device; installedApps: StoreApp[]; openApp: (id: string) => void; now: Date }) {
  const apps = [...BUILT_INS, ...installedApps.filter((app) => !app.deviceFamily || app.deviceFamily === device.family)];
  const columns = device.family === "laptop" ? 8 : device.family === "console" ? 6 : device.family === "tablet" ? 6 : 4;
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
  deviceId: string; setDeviceId: (id: string) => void; familyState: FamilyState; setFamilyState: (state: FamilyState) => void; signOut: () => void; onClose: () => void; app?: StoreApp;
};

function AppView(props: AppViewProps) {
  if (props.id === "store") return <CustomStore {...props} />;
  if (props.id === "messages") return <MessagesHubApp onClose={props.onClose} />;
  if (props.id === "contacts") return <ContactsApp onClose={props.onClose} />;
  if (props.id === "facetime") return <FaceTimeApp onClose={props.onClose} />;
  if (props.id === "wallet") return <WalletApp onClose={props.onClose} />;
  if (props.id === "health-plus") return <HealthApp onClose={props.onClose} />;
  if (props.id === "viders") return <VidersApp onClose={props.onClose} />;
  if (props.id === "family") return <FamilyApp state={props.familyState} onChange={props.setFamilyState} signOut={props.signOut} onClose={props.onClose} />;
  if (props.id === "calendar") return <CalendarApp onClose={props.onClose} />;
  if (props.id === "photos") return <PhotosApp onClose={props.onClose} />;
  if (props.id === "camera") return <CameraApp onClose={props.onClose} />;
  if (props.id === "clock") return <ClockApp onClose={props.onClose} />;
  if (props.id === "maps") return <MapsApp onClose={props.onClose} />;
  if (props.id === "files") return <FilesApp onClose={props.onClose} />;
  if (props.id === "settings") return <InteractiveSettings wallpaper={props.wallpaper} chooseWallpaper={props.chooseWallpaper} device={props.device} accountName={props.familyState.accounts.find((account) => account.id === props.familyState.currentAccountId)?.name || "Account"} signOut={props.signOut} onClose={props.onClose} />;
  if (props.id === "calculator") return <Calculator onClose={props.onClose} />;
  if (props.id === "notes") return <NotesApp onClose={props.onClose} />;
  if (props.id === "weather") return <WeatherApp onClose={props.onClose} />;
  if (props.id === "devices") return <DeviceLibrary currentDeviceId={props.deviceId} setDeviceId={props.setDeviceId} onClose={props.onClose} />;
  if (props.id === "sketchpad") return <SketchpadApp onClose={props.onClose} />;
  if (props.id === "orbit") return <WeatherApp orbit onClose={props.onClose} />;
  if (props.id === "pulse") return <FitnessApp onClose={props.onClose} />;
  if (props.id === "soundwave") return <MusicApp onClose={props.onClose} />;
  if (props.id === "tiny-tower") return <TowerGameApp onClose={props.onClose} />;
  if (props.id === "focus") return <FocusApp onClose={props.onClose} />;
  if (props.id === "stargazer") return <StargazerApp onClose={props.onClose} />;
  if (props.id === "recipebox") return <RecipeApp onClose={props.onClose} />;
  if (props.app) return <CustomWorkspaceApp app={props.app} onClose={props.onClose} />;
  return <GenericApp app={props.app} id={props.id} onClose={props.onClose} />;
}

function AppHeader({ title, onClose, trailing }: { title: string; onClose: () => void; trailing?: React.ReactNode }) {
  return <div className="app-header"><button type="button" onClick={onClose} aria-label="Close app">‹</button><strong>{title}</strong><span>{trailing}</span></div>;
}

function CustomStore(props: AppViewProps) {
  const visibleApps = props.apps.filter((app) => !app.deviceFamily || app.deviceFamily === props.device.family);
  const featured = visibleApps.filter((app) => app.featured);
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
          <div className="app-list catalog-list">{visibleApps.map((app) => <StoreRow key={app.id} app={app} installed={props.installed.includes(app.id)} onInstall={props.toggleInstall} onRemove={props.removeApp} />)}</div>
          {visibleApps.length === 0 && <div className="empty-state">No apps found.</div>}
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

function InteractiveSettings({ wallpaper, chooseWallpaper, device, accountName, signOut, onClose }: { wallpaper: string; chooseWallpaper: (choice: string) => void; device: Device; accountName: string; signOut: () => void; onClose: () => void }) {
  const [deviceName, setDeviceName] = useState("My Custom Device");
  const defaultPreferences = { sounds: true, notifications: true, motion: true, largeText: false, privateMode: true, autoUpdates: true };
  const [preferences, setPreferences] = useState(defaultPreferences);
  const [wallet, setWallet] = useState({ balance: 100, cellular: false });
  const [purchaseMessage, setPurchaseMessage] = useState("");
  const [softwareVersion, setSoftwareVersion] = useState("1.0.4");
  const [updating, setUpdating] = useState(false);
  const [updateMessage, setUpdateMessage] = useState("");
  const [country, setCountry] = useState("United States");
  const [wifi, setWifi] = useState({ enabled: true, hotspot: false, hotspotName: "Custom Software", hotspotPassword: "" });
  const [networkInfo, setNetworkInfo] = useState({ online: true, type: "Connection", effectiveType: "", downlink: 0 });
  const [hotspotMessage, setHotspotMessage] = useState("");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("cs-settings");
      if (saved) { const data = JSON.parse(saved); setPreferences({ ...defaultPreferences, ...(data.preferences || {}) }); setDeviceName(data.deviceName || deviceName); }
      const savedWallet = localStorage.getItem("cs-awesome-wallet");
      if (savedWallet) setWallet(JSON.parse(savedWallet));
      setSoftwareVersion(localStorage.getItem("cs-software-version") || "1.0.4");
      setCountry(localStorage.getItem("cs-country") || "United States");
      const savedWifi = localStorage.getItem("cs-wifi");
      if (savedWifi) setWifi({ enabled: true, hotspot: false, hotspotName: "Custom Software", hotspotPassword: "", ...JSON.parse(savedWifi) });
    } catch { /* keep defaults */ }
  // Settings are loaded once when the app opens.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    type ConnectionInfo = { type?: string; effectiveType?: string; downlink?: number; addEventListener?: (name: string, listener: () => void) => void; removeEventListener?: (name: string, listener: () => void) => void };
    const connection = (navigator as Navigator & { connection?: ConnectionInfo }).connection;
    const update = () => setNetworkInfo({ online: navigator.onLine, type: connection?.type || (navigator.onLine ? "Connected network" : "Offline"), effectiveType: connection?.effectiveType || "", downlink: connection?.downlink || 0 });
    update(); window.addEventListener("online", update); window.addEventListener("offline", update); connection?.addEventListener?.("change", update);
    return () => { window.removeEventListener("online", update); window.removeEventListener("offline", update); connection?.removeEventListener?.("change", update); };
  }, []);

  const save = (next: typeof preferences, nextName = deviceName) => {
    setPreferences(next);
    localStorage.setItem("cs-settings", JSON.stringify({ preferences: next, deviceName: nextName }));
  };
  const rename = (name: string) => { setDeviceName(name); localStorage.setItem("cs-settings", JSON.stringify({ preferences, deviceName: name })); };
  const toggle = (key: keyof typeof preferences) => save({ ...preferences, [key]: !preferences[key] });
  const activateCellular = () => {
    if (device.family !== "phone" || wallet.cellular) return;
    if (wallet.balance < 74.99) { setPurchaseMessage("You need more KidTopia Dollars."); return; }
    const next = { balance: Math.round((wallet.balance - 74.99) * 100) / 100, cellular: true };
    setWallet(next); localStorage.setItem("cs-awesome-wallet", JSON.stringify(next));
    const transactions = JSON.parse(localStorage.getItem("cs-wallet-transactions") || "[]");
    transactions.unshift({ id: Date.now(), title: "Custom Cellular", amount: -74.99, date: new Date().toLocaleDateString() });
    localStorage.setItem("cs-wallet-transactions", JSON.stringify(transactions));
    setPurchaseMessage("Cellular activated on this iPhone.");
  };
  const checkForUpdate = async () => {
    setUpdating(true);
    setUpdateMessage("Checking for a software update...");
    try {
      if ("serviceWorker" in navigator) {
        const registration = await navigator.serviceWorker.ready;
        await registration.update();
      }
      const nextVersion = "1.1.0";
      localStorage.setItem("cs-software-version", nextVersion);
      setSoftwareVersion(nextVersion);
      setUpdateMessage("Custom Software is up to date.");
    } catch {
      setUpdateMessage("Update check could not connect. Try again when you are online.");
    } finally {
      setUpdating(false);
    }
  };
  const saveWifi = (next: typeof wifi) => { setWifi(next); localStorage.setItem("cs-wifi", JSON.stringify(next)); };
  const toggleWifi = () => saveWifi({ ...wifi, enabled: !wifi.enabled });
  const toggleHotspot = () => {
    if (!wallet.cellular || device.family !== "phone") return;
    if (!wifi.hotspot && wifi.hotspotPassword.length < 8) { setHotspotMessage("Create a password with at least 8 characters first."); return; }
    setHotspotMessage(wifi.hotspot ? "Personal Hotspot turned off." : "Personal Hotspot is ready for approved users.");
    saveWifi({ ...wifi, hotspot: !wifi.hotspot });
  };

  return <div className="app-window settings-window interactive-settings"><AppHeader title="Settings" onClose={onClose} />
    <div className="settings-scroll"><h2>Settings</h2>
      <div className="profile-card"><span>CS</span><div><input value={deviceName} onChange={(event) => rename(event.target.value)} aria-label="Device name" /><small>{device.name} • Custom Software 1.0</small></div><b>✓</b></div>
      <section><h3>Wallpaper</h3><div className="wallpaper-picker">{WALLPAPERS.map((choice) => <button key={choice} className={`${choice} ${wallpaper === choice ? "selected" : ""}`} type="button" onClick={() => chooseWallpaper(choice)} aria-label={`Choose ${choice}`}><span>✓</span></button>)}</div></section>
      <section className="wifi-settings"><div className="wifi-heading"><div><span>Wi-Fi</span><small>{!wifi.enabled ? "Off" : networkInfo.online ? "Connected" : "No connection"}</small></div><button className={`wifi-master ${wifi.enabled ? "on" : ""}`} type="button" onClick={toggleWifi} aria-label="Toggle Wi-Fi"><i /></button></div><div className="real-network"><span>|||</span><div><strong>Current Local Network</strong><small>{wifi.enabled && networkInfo.online ? `${networkInfo.type}${networkInfo.effectiveType ? ` • ${networkInfo.effectiveType.toUpperCase()}` : ""}${networkInfo.downlink ? ` • ${networkInfo.downlink} Mbps` : ""}` : "Not connected"}</small></div><b>{wifi.enabled && networkInfo.online ? "✓" : "—"}</b></div><p className="network-privacy">For privacy, iPhone and browsers do not reveal nearby Wi-Fi names to apps.</p>{device.family === "phone" && <div className="personal-hotspot"><div className={`hotspot-card ${wifi.hotspot ? "active" : ""}`}><div><span>H</span><div><strong>Personal Hotspot</strong><small>{wallet.cellular ? (wifi.hotspot ? `${wifi.hotspotName} is sharing Cellular Wi-Fi` : "Share Custom Cellular as Wi-Fi") : "Activate Custom Cellular first"}</small></div></div><button type="button" disabled={!wallet.cellular} onClick={toggleHotspot}>{wifi.hotspot ? "Turn Off" : "Turn On"}</button></div><div className="hotspot-password"><label>Hotspot name<input value={wifi.hotspotName} onChange={(event) => saveWifi({ ...wifi, hotspotName: event.target.value.slice(0, 30) })} placeholder="Custom Software" /></label><label>Password<input type="password" minLength={8} value={wifi.hotspotPassword} onChange={(event) => { saveWifi({ ...wifi, hotspotPassword: event.target.value }); setHotspotMessage(""); }} placeholder="At least 8 characters" /></label><small>Only give this password to people you want to let use the hotspot.</small>{hotspotMessage && <b>{hotspotMessage}</b>}</div></div>}</section>
      <section className="cellular-settings"><div className="coin-wallet"><span>KD</span><div><small>KIDTOPIA DOLLARS</small><strong>{wallet.balance.toFixed(2)}</strong></div></div>{device.family === "phone" ? <div className="cellular-plan"><div><span>📶</span><div><strong>Custom Cellular</strong><small>{wallet.cellular ? "Active • Unlimited virtual data" : "Cellular service for this iPhone"}</small></div></div>{wallet.cellular ? <b>ACTIVE</b> : <button type="button" onClick={activateCellular}>Pay 74.99 KidTopia Dollars</button>}</div> : <p className="iphone-only-note">Custom Cellular is available when an iPhone profile is selected.</p>}{purchaseMessage && <small className="purchase-message">{purchaseMessage}</small>}</section>
      <section className="settings-list toggle-settings">
        <SettingToggle icon="🔔" title="Notifications" detail="App alerts and banners" enabled={preferences.notifications} onToggle={() => toggle("notifications")} />
        <SettingToggle icon="🔊" title="Sounds & Haptics" detail="Interface feedback" enabled={preferences.sounds} onToggle={() => toggle("sounds")} />
        <SettingToggle icon="✨" title="Motion Effects" detail="Animations and transitions" enabled={preferences.motion} onToggle={() => toggle("motion")} />
        <SettingToggle icon="Aa" title="Larger Text" detail="Improve readability" enabled={preferences.largeText} onToggle={() => toggle("largeText")} />
        <SettingToggle icon="🔒" title="Private Mode" detail="Keep data on this device" enabled={preferences.privateMode} onToggle={() => toggle("privateMode")} />
        <SettingToggle icon="↻" title="Automatic Updates" detail="Keep Custom Software current" enabled={preferences.autoUpdates} onToggle={() => toggle("autoUpdates")} />
      </section>
      <section className="software-update"><div><span>CS</span><div><small>SOFTWARE UPDATE</small><strong>Custom Software {softwareVersion}</strong><p>Security, app, and device-profile improvements.</p></div></div><button type="button" disabled={updating} onClick={checkForUpdate}>{updating ? "Checking..." : "Check & Install Update"}</button>{updateMessage && <small className="update-message">{updateMessage}</small>}</section>
      <section className="account-settings"><div><small>SIGNED IN ACCOUNT</small><strong>{accountName}</strong></div><button type="button" onClick={signOut}>Log Out of Custom Software</button><a href="/signout-with-chatgpt?return_to=%2F">Log Out of Other Options</a></section>
      <section className="settings-about"><h3>About</h3><p><span>Software Version</span><strong>{softwareVersion}</strong></p><p><span>Device Profile</span><strong>{device.name}</strong></p><p><span>Country</span><strong>{country}</strong></p><p><span>Storage</span><strong>On-device</strong></p></section>
    </div>
  </div>;
}

function SettingToggle({ icon, title, detail, enabled, onToggle }: { icon: string; title: string; detail: string; enabled: boolean; onToggle: () => void }) {
  return <button type="button" onClick={onToggle}><span>{icon}</span><div><strong>{title}</strong><small>{detail}</small></div><i className={`setting-switch ${enabled ? "on" : ""}`}><b /></i></button>;
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
