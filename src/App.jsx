import React, { useState, useContext, createContext } from "react";
import usersData from "../auth/users.json";
import labteLogo from "./assets/labte.png";
import { Routes, Route, Outlet, useNavigate, Link, Navigate } from "react-router-dom";

// AuthContext for global auth state
const AuthContext = createContext(null);

function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    // Check if user is already logged in (from localStorage)
    return localStorage.getItem("isLoggedIn") === "true";
  });

  const login = () => {
    setIsAuthenticated(true);
    localStorage.setItem("isLoggedIn", "true");
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("isLoggedIn");
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

// Protected Route Component
function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route element={<Shell />}>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/login-admin" element={<LoginAdmin />} />
          <Route
            path="/lorawan-admin"
            element={
              <ProtectedRoute>
                <LorawanAdmin />
              </ProtectedRoute>
            }
          />
          <Route
            path="/lorawan"
            element={
              <ProtectedRoute>
                <LorawanDashboard />
              </ProtectedRoute>
            }
          />
        </Route>
      </Routes>
    </AuthProvider>
  );
}

function Shell() {
  return (
    <div className="app-root">
      <NavBar />
      <main className="main">
        <div className="main-inner">
          <Outlet />
        </div>
      </main>
      <Footer />
    </div>
  );
}

function NavBar() {
  return (
    <nav className="nav">
      <div className="nav-left">
        <Link to="/" aria-label="Kembali ke beranda" className="logo-link">
          <img src={labteLogo} alt="LabTE logo" className="logo-mark" />
        </Link>
        <div className="logo-text">
          <span className="logo-title">LoRaWAN UMS</span>
          <span className="logo-subtitle">
            Universitas Muhammadiyah Surakarta
          </span>
        </div>
      </div>
      <div className="nav-right">
        <Link to="/" className="btn btn-outline btn-sm">
          Home
        </Link>
        <Link to="/login-admin" className="btn btn-primary btn-sm">
          Admin
        </Link>
      </div>
    </nav>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <span>
        © 2025 Laboratorium Teknik Elektro UMS. All rights reserved.
      </span>
      <span>Built for learning Low Power Wide Area Networks (LPWAN).</span>
    </footer>
  );
}

function Landing() {
  return (
    <section className="section section--ghost">
      <div className="section-header">
        <div className="badge">
          <span>TEKNIK ANTARMUKA 2025</span>
        </div>
        <h1 className="section-title">
          LoRaWAN <span>UMS</span> Monitoring &amp; Control
        </h1>
        <p className="section-subtitle">
          Platform internal untuk memonitor dan mengelola perangkat IoT LoRa di
          lingkungan Universitas Muhammadiyah Surakarta. Pantau gateway, node,
          dan data sensor dari satu antarmuka terpusat.
        </p>
      </div>

      <div className="tag-row">
        <div className="tag tag--accent">Real-time telemetry</div>
        <div className="tag">Secure access</div>
        <div className="tag">Multi-device</div>
        <div className="tag">AS923-2 LoRaWAN</div>
      </div>

      <div className="btn-row">
        <Link className="btn btn-primary" to="/login">
          Masuk ke Dashboard
        </Link>
        <Link className="btn btn-outline" type="button" to="https://github.com/rndmtrsh" target={"_blank"} >
          Lihat Dokumentasi API
        </Link>
      </div>

      <div className="metrics">
        <div className="card">
          <div className="card-label">Gateway LoRa</div>
          <div className="card-value">WisGate Edge Lite 2</div>
        </div>
        <div className="card">
          <div className="card-label">Node terdaftar</div>
          <div className="card-value">12</div>
        </div>
        <div className="card">
          <div className="card-label">Praktikan</div>
          <div className="card-value">17</div>
        </div>
      </div>
    </section>
  );
}

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);

    const found = Array.isArray(usersData.users)
      ? usersData.users.find(
          (u) => (u.username || "").trim() === username.trim() && (u.password || "") === password
        )
      : null;

    if (found) {
      login();
      navigate("/lorawan");
    } else {
      setError("Username atau password salah.");
    }
  };

  return (
    <section className="section">
      <div className="panel-header">
        <div>
          <h2 className="panel-title">Login Dashboard</h2>
          <p className="panel-subtitle">
            Masuk untuk mengakses dashboard LoRaWAN UMS dan mengelola perangkat.
          </p>
        </div>
      </div>

      <form className="form" onSubmit={handleSubmit}>
        <div>
          <div className="label">Username</div>
          <input
            className="input"
            type="text"
            placeholder="Masukkan username"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        <div>
          <div className="label">Password</div>
          <input
            className="input"
            type="password"
            placeholder="Masukkan password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {error && <div className="form-error">{error}</div>}

        <div className="form-footer">
          <button className="btn btn-primary" type="submit">
            Login
          </button>
          <Link className="btn btn-outline btn-sm" to="/">
            Kembali ke Home
          </Link>
        </div>
      </form>
    </section>
  );
}

function LoginAdmin() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);

    const found = Array.isArray(usersData.admin)
      ? usersData.admin.find(
          (u) => (u.username || "").trim() === username.trim() && (u.password || "") === password
        )
      : null;

    if (found) {
      login();
      navigate("/lorawan-admin");
    } else {
      setError("Username atau password salah.");
    }
  };

  return (
    <section className="section">
      <div className="panel-header">
        <div>
          <h2 className="panel-title">Login Admin</h2>
          <p className="panel-subtitle">
            Masuk sebagai admin untuk mengelola sistem LoRaWAN UMS.
          </p>
        </div>
      </div>

      <form className="form" onSubmit={handleSubmit}>
        <div>
          <div className="label">Username</div>
          <input
            className="input"
            type="text"
            placeholder="Masukkan username"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        <div>
          <div className="label">Password</div>
          <input
            className="input"
            type="password"
            placeholder="Masukkan password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {error && <div className="form-error">{error}</div>}

        <div className="form-footer">
          <button className="btn btn-primary" type="submit">
            Login
          </button>
          <Link className="btn btn-outline btn-sm" to="/">
            Kembali ke Home
          </Link>
        </div>
      </form>
    </section>
  );
}

function LorawanDashboard() {
  const [devEuiInput, setDevEuiInput] = React.useState("");
  const [devEuiActive, setDevEuiActive] = React.useState("");
  const [limit, setLimit] = React.useState(10);
  const [uplinks, setUplinks] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [expandedIndex, setExpandedIndex] = React.useState(null);

  const LIMIT_OPTIONS = [10, 25, 50, 100];

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";
  const API_KEY = import.meta.env.VITE_API_KEY || "";

  const normalizeRows = (data) => {
    if (!data) return [];

    if (Array.isArray(data)) return data; 
    if (Array.isArray(data.uplinks)) return data.uplinks;
    if (Array.isArray(data.data)) return data.data;

    // single object (satu uplink)
    if (data.dev_eui || data.device_name || data.data_text) return [data];

    return [];
  };

  const fetchUplinks = async (devEui, n) => {
    const trimmedDevEui = devEui.trim().toLowerCase(); // DevEUI diseragamkan lowercase

    if (!trimmedDevEui) {
      setError("DevEUI tidak boleh kosong.");
      return;
    }

    if (!API_BASE_URL || !API_KEY) {
      setError("Konfigurasi API (URL atau API key) belum lengkap.");
      return;
    }

    setLoading(true);
    setError("");
    setUplinks([]);
    setExpandedIndex(null);

    try {
      // Susun URL dengan query param: n & api_key
      const url = new URL(
        `${API_BASE_URL}/uplinks/${encodeURIComponent(trimmedDevEui)}/last10`
      );
      url.searchParams.set("n", String(n));
      url.searchParams.set("api_key", API_KEY);

      const res = await fetch(url.toString(), {
        // Tidak ada header custom → tidak ada preflight CORS
        headers: {
          Accept: "application/json",
          "X-API-KEY": API_KEY,
        },
      });

      if (!res.ok) {
        if (res.status === 404) {
          setError("Data untuk DevEUI tersebut tidak ditemukan.");
        } else {
          setError(`Gagal memuat uplink (status ${res.status}).`);
        }
        return;
      }

      const data = await res.json();
      const rows = normalizeRows(data);

      if (!rows.length) {
        setError("Data uplink kosong untuk DevEUI tersebut.");
        return;
      }

      setUplinks(rows);
      setDevEuiActive(trimmedDevEui);
    } catch (err) {
      console.error(err);
      setError("Terjadi kesalahan jaringan atau CORS saat memuat data uplink.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchUplinks(devEuiInput, limit);
  };

  const handleLimitChange = (e) => {
    const newLimit = Number(e.target.value);
    setLimit(newLimit);
    if (devEuiActive) {
      fetchUplinks(devEuiActive, newLimit);
    }
  };

  const toggleExpand = (index) => {
    setExpandedIndex((prev) => (prev === index ? null : index));
  };

  return (
    <section className="section section--ghost">
      <div className="section-header">
        <h2 className="section-title">
          Dashboard <span>LoRaWAN</span>
        </h2>
        <p className="section-subtitle">
          Cari uplink berdasarkan DevEUI, lalu lihat riwayat data terakhir yang diterima
          dari gateway. Data diambil dari API{" "}
          <code className="code-inline">teknikantarmuka.my.id</code>.
        </p>
      </div>

      {/* Bar atas: jumlah data & info DevEUI aktif */}
      <div className="panel-header panel-header--uplinks">
        <div>
          <p className="panel-subtitle">
            {devEuiActive
              ? `Menampilkan hingga ${limit} data terakhir untuk DevEUI ${devEuiActive}.`
              : "Masukkan DevEUI yang sudah terdaftar untuk melihat data uplink."}
          </p>
        </div>
        <div className="uplinks-limit-container">
          <span className="label label--inline">Jumlah data</span>
          <select
            className="input uplinks-limit-select"
            value={limit}
            onChange={handleLimitChange}
          >
            {LIMIT_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Form pencarian DevEUI */}
      <form className="form" onSubmit={handleSearch}>
        <div className="dev-eui-form-row">
          <div className="dev-eui-form-main">
            <div className="label">DevEUI</div>
            <input
              className="input"
              type="text"
              placeholder="mis. be078ddb76f70371"
              value={devEuiInput}
              onChange={(e) => setDevEuiInput(e.target.value)}
            />
          </div>
          <button
            className="btn btn-primary"
            type="submit"
            disabled={loading || !devEuiInput.trim()}
          >
            {loading ? "Memuat..." : "Cari"}
          </button>
        </div>
      </form>

      {/* Pesan error / info */}
      {error && <div className="alert alert--error">{error}</div>}

      {!error && devEuiActive && uplinks.length === 0 && !loading && (
        <div className="alert alert--info">
          Tidak ada data uplink yang bisa ditampilkan.
        </div>
      )}

      {/* List uplink dalam container scrollable */}
      {uplinks.length > 0 && (
        <div className="uplinks-table">
          {/* Header kolom */}
          <div className="uplinks-header-row">
            <div className="uplinks-header-cell">Waktu</div>
            <div className="uplinks-header-cell">Device / DevEUI</div>
            <div className="uplinks-header-cell">Payload</div>
            <div className="uplinks-header-cell uplinks-header-cell--center">
              Detail
            </div>
          </div>

          {uplinks.map((row, index) => {
            // Format data sesuai contoh
            const ts = row.ts || row.inserted_at || "-";

            const deviceLabel =
              row.device_name && row.dev_eui
                ? `${row.device_name} (${row.dev_eui})`
                : row.device_name || row.dev_eui || row.app_name || "-";

            const payloadCollapsed =
              row.data_text ||
              (row.data_json ? JSON.stringify(row.data_json) : JSON.stringify(row));

            const payloadExpanded = JSON.stringify(row, null, 2);
            const isExpanded = expandedIndex === index;

            return (
              <React.Fragment key={row.uplink_id ?? index}>
                <div className="uplinks-row">
                  <div className="uplinks-cell uplinks-cell--center">{String(ts)}</div>
                  <div className="uplinks-cell uplinks-cell--center uplinks-cell--resource">
                    {deviceLabel}
                  </div>
                  <div
                    className="uplinks-cell uplinks-cell--mono uplinks-cell--collapsed"
                    title={String(payloadCollapsed)}
                  >
                    {payloadCollapsed}
                  </div>
                  <div className="uplinks-cell uplinks-cell--center">
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={() => toggleExpand(index)}
                    >
                      {isExpanded ? "Tutup" : "Lihat"}
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="uplink-details">
                    <div className="uplink-details-meta">
                      <strong>Detail uplink</strong> — {deviceLabel} — {String(ts)}
                    </div>
                    <pre className="uplink-details-pre">{payloadExpanded}</pre>
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      )}
    </section>
  );
}

function LorawanAdmin() {
  const [devices, setDevices] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [expandedDeviceId, setExpandedDeviceId] = React.useState(null);
  const [filterDays, setFilterDays] = React.useState(null);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";
  const API_KEY = import.meta.env.VITE_API_KEY || "";

  const getElapsedTime = (lastSeenSort) => {
    if (lastSeenSort <= 0) return "-";
    
    const now = Date.now();
    const elapsedMs = now - lastSeenSort;
    const elapsedSec = Math.floor(elapsedMs / 1000);
    
    if (elapsedSec < 0) return "-";
    
    const minutes = Math.floor(elapsedSec / 60);
    const seconds = elapsedSec % 60;
    
    // Jika lebih dari 90 menit, tampilkan "-"
    if (minutes > 90) return "-";
    
    return `${minutes}m ${seconds}s`;
  };

  const formatFrequency = (freq) => {
    if (!freq || freq === "-") return "-";
    const freqNum = Number(freq);
    if (isNaN(freqNum)) return String(freq);
    // Convert Hz to MHz
    const mhz = (freqNum / 1000000).toFixed(2);
    return `${mhz} MHz`;
  };

  const formatDataJson = (dataJson) => {
    if (!dataJson) return "-";
    try {
      const jsonStr = typeof dataJson === 'string' ? dataJson : JSON.stringify(dataJson);
      // Truncate to reasonable length for display
      return jsonStr.length > 50 ? jsonStr.substring(0, 47) + "..." : jsonStr;
    } catch (e) {
      return String(dataJson);
    }
  };

  const isDeviceOlderThanDays = (lastSeenSort, days) => {
    if (lastSeenSort <= 0) return true; // Show old devices if no timestamp
    const now = Date.now();
    const daysInMs = days * 24 * 60 * 60 * 1000;
    return (now - lastSeenSort) > daysInMs;
  };

  const getFilteredDevices = () => {
    if (!filterDays) return devices;
    return devices.filter(d => !isDeviceOlderThanDays(d.lastSeenSort, filterDays));
  };

  const fetchDeviceDetails = async (devEui) => {
    try {
      const url = new URL(`${API_BASE_URL}/uplinks/${encodeURIComponent(devEui)}/latest/full`);
      url.searchParams.set("api_key", API_KEY);

      const res = await fetch(url.toString(), {
        headers: {
          Accept: "application/json",
          "X-API-KEY": API_KEY,
        },
      });

      if (!res.ok) {
        console.warn(`Failed to fetch details for ${devEui}: status ${res.status}`);
        return null;
      }

      const data = await res.json();
      return data;
    } catch (err) {
      console.error(`Error fetching details for ${devEui}:`, err);
      return null;
    }
  };

  const normalizeDevices = (data) => {
    if (!data) return [];

    let arr = Array.isArray(data)
      ? data
      : Array.isArray(data.devices)
      ? data.devices
      : [];

    return arr.map((d, index) => ({
      id: d.id || d.uplink_id || d.dev_eui || index,
      eui: d.dev_eui || d.deveui || d.devEui || "-",
    }));
  };

  const fetchDevices = async () => {
    if (!API_BASE_URL || !API_KEY) {
      setError("Konfigurasi API (URL atau API key) belum lengkap.");
      return;
    }

    setLoading(true);
    setError("");
    setDevices([]);

    try {
      const url = new URL(`${API_BASE_URL}/uplinks/devices`);
      url.searchParams.set("api_key", API_KEY);

      console.log("Fetching devices from:", url.toString());

      const res = await fetch(url.toString(), {
        headers: {
          Accept: "application/json",
          "X-API-KEY": API_KEY,
        },
      });

      if (!res.ok) {
        if (res.status === 401) {
          setError("API key tidak valid atau tidak dikirim ke server.");
        } else {
          setError(`Gagal memuat daftar perangkat (status ${res.status}).`);
        }
        return;
      }

      const data = await res.json();
      console.log("Devices list response:", data);

      const deviceList = normalizeDevices(data);

      if (!deviceList.length) {
        setError("Belum ada perangkat yang tercatat pada API ini.");
        return;
      }

      console.log(`Found ${deviceList.length} devices, fetching details...`);

      // Fetch detail untuk setiap device
      const detailedDevices = await Promise.all(
        deviceList.map(async (d) => {
          const details = await fetchDeviceDetails(d.eui);
          if (!details) {
            console.warn(`No details for device ${d.eui}`);
            return null;
          }

          const rawLastSeen =
            details.last_seen || details.ts || details.inserted_at || details.updated_at || null;

          const lastSeenLabel = rawLastSeen ? String(rawLastSeen) : "-";
          let lastSeenSort = 0;
          if (rawLastSeen) {
            const t = new Date(rawLastSeen).getTime();
            lastSeenSort = Number.isFinite(t) ? t : 0;
          }

          return {
            id: d.id,
            name: details.device_name || details.name || "-",
            eui: d.eui,
            appName: details.app_name || details.application_name || "-",
            frequency: details.freq_hz || details.frequency || details.freq || "-",
            dataJson: details.data_json || details.data || null,
            lastSeenLabel: rawLastSeen ? String(rawLastSeen) : "-",
            lastSeenSort,
          };
        })
      );

      // Filter out null values dan urutkan dari last seen terbaru
      const validDevices = detailedDevices.filter((d) => d !== null);
      validDevices.sort((a, b) => {
        // Prioritas: device dengan lastSeenSort valid (> 0) di atas
        if (a.lastSeenSort > 0 && b.lastSeenSort > 0) {
          return b.lastSeenSort - a.lastSeenSort; // Terbaru duluan
        }
        if (a.lastSeenSort > 0) return -1; // a punya timestamp, di atas
        if (b.lastSeenSort > 0) return 1;  // b punya timestamp, di atas
        return 0; // Keduanya tidak punya timestamp
      });

      console.log(`Loaded ${validDevices.length} devices with details`);

      if (!validDevices.length) {
        setError("Gagal memuat detail perangkat atau tidak ada data yang valid.");
        return;
      }

      setDevices(validDevices);
    } catch (err) {
      console.error("Error fetching devices:", err);
      setError("Terjadi kesalahan jaringan atau CORS saat memuat perangkat.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="section section--ghost">
      <div className="section-header">
        <h2 className="section-title">
          LoRaWAN <span>Admin</span>
        </h2>
        <p className="section-subtitle">
          Halaman admin untuk melihat daftar end-device LoRaWAN yang terhubung ke
          gateway. Data diurutkan berdasarkan waktu komunikasi terakhir (last seen).
        </p>
      </div>

      <div className="btn-row" style={{ marginBottom: 10 }}>
        <button
          type="button"
          className="btn btn-primary"
          onClick={fetchDevices}
          disabled={loading}
        >
          {loading ? "Mengambil data perangkat..." : "Akses daftar perangkat"}
        </button>
      </div>

      {error && <div className="alert alert--error">{error}</div>}

      {devices.length > 0 && (
        <div className="uplinks-table" style={{ maxHeight: "none" }}>
          <div className="uplinks-header-row" style={{ gridTemplateColumns: "repeat(7, 1fr)" }}>
            <div className="uplinks-header-cell">Nama</div>
            <div className="uplinks-header-cell">DevEUI</div>
            <div className="uplinks-header-cell">App Name</div>
            <div className="uplinks-header-cell">Last Seen</div>
            <div className="uplinks-header-cell">Frequency</div>
            <div className="uplinks-header-cell">Data JSON</div>
            <div className="uplinks-header-cell uplinks-header-cell--center">Detail</div>
          </div>

          {getFilteredDevices().map((d) => (
            <React.Fragment key={d.id}>
              <div className="uplinks-row" style={{ gridTemplateColumns: "repeat(7, 1fr)" }}>
                <div className="uplinks-cell uplinks-cell--center">{d.name}</div>
                <div className="uplinks-cell uplinks-cell--center uplinks-cell--mono">{d.eui}</div>
                <div className="uplinks-cell uplinks-cell--center">{d.appName}</div>
                <div className="uplinks-cell uplinks-cell--center">{getElapsedTime(d.lastSeenSort)}</div>
                <div className="uplinks-cell uplinks-cell--center">{formatFrequency(d.frequency)}</div>
                <div className="uplinks-cell uplinks-cell--center uplinks-cell--mono uplinks-cell--collapsed" title={d.dataJson ? (typeof d.dataJson === 'string' ? d.dataJson : JSON.stringify(d.dataJson, null, 2)) : "-"}>
                  {formatDataJson(d.dataJson)}
                </div>
                <div className="uplinks-cell uplinks-cell--center">
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={() => setExpandedDeviceId(expandedDeviceId === d.id ? null : d.id)}
                  >
                    {expandedDeviceId === d.id ? "Hide" : "View"}
                  </button>
                </div>
              </div>

              {expandedDeviceId === d.id && (
                <div className="uplink-details">
                  <div className="uplink-details-meta">
                    <strong>Data JSON</strong> — {d.name} ({d.eui})
                  </div>
                  <pre className="uplink-details-pre">{d.dataJson ? (typeof d.dataJson === 'string' ? d.dataJson : JSON.stringify(d.dataJson, null, 2)) : "Tidak ada data"}</pre>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      )}

      {devices.length > 0 && (
        <div style={{ marginTop: '15px', marginBottom: '10px', display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontWeight: '600', fontSize: '13px' }}>Filter:</span>
            {[1, 3, 7, 14, 30].map(days => (
              <button
                key={days}
                type="button"
                style={{
                  backgroundColor: filterDays === days ? '#0078d4' : '#f0f0f0',
                  color: filterDays === days ? 'white' : '#333',
                  border: filterDays === days ? 'none' : '1px solid #ddd',
                  borderRadius: '4px',
                  padding: '5px 10px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: filterDays === days ? '600' : '500',
                  transition: 'all 0.2s'
                }}
                onClick={() => setFilterDays(days)}
              >
                {days}d
              </button>
            ))}
            {filterDays && (
              <button
                type="button"
                style={{
                  backgroundColor: '#fff',
                  color: '#666',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  padding: '5px 10px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: '500'
                }}
                onClick={() => setFilterDays(null)}
              >
                ✕ Clear
              </button>
            )}
          </div>
          <span style={{ fontSize: '12px', color: '#999', fontWeight: '500' }}>
            {getFilteredDevices().length} / {devices.length}
          </span>
        </div>
      )}

      {devices.length > 0 && getFilteredDevices().length === 0 && (
        <div className="alert alert--info" style={{ marginTop: '15px' }}>
          Tidak ada perangkat yang sesuai filter. Coba ubah filter atau klik Clear untuk melihat semua data.
        </div>
      )}
    </section>
  );
}



export default App;
