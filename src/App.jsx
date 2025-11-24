import React, { useState } from "react";
import usersData from "../auth/users.json";
import labteLogo from "./assets/labte.png";
import { Routes, Route, Outlet, useNavigate, Link } from "react-router-dom";

function App() {
  return (
    <Routes>
      <Route element={<Shell />}>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/lorawan" element={<LorawanDashboard />} />
      </Route>
    </Routes>
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
        <img src={labteLogo} alt="LabTE logo" className="logo-mark" />
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
        <Link to="/login" className="btn btn-primary btn-sm">
          Login
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
            Kembali ke landing
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
                {opt} terakhir
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


export default App;
