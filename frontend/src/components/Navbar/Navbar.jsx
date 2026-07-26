import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, Send, Copy, Check, Download, X, Image, FileCode, Loader2 } from "lucide-react";
import SketchrLogo from "../../page/Login/SketchrLogo";
import { styles } from "../../page/Login/styles";

const Navbar = ({ title, setTitle, ShareEmail, setShareEmail, onShareSubmit, clear, onDownload }) => {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showDownloadOptions, setShowDownloadOptions] = useState(false);
  const [sendStatus, setSendStatus] = useState("idle");

  const [localEmail, setLocalEmail] = useState("");
  const currentEmail = ShareEmail !== undefined ? ShareEmail : localEmail;
  const updateEmail = typeof setShareEmail === "function" ? setShareEmail : setLocalEmail;

  const user = localStorage.getItem("sketchr_user_name") || "Guest";
  const email = localStorage.getItem("sketchr_email_id") || "No email found";

  const handleShareSubmit = async (e) => {
    e.preventDefault();
    if (user === "Guest" || !currentEmail) return alert("Please login and enter an email");

    if (!currentEmail.includes("@") || !currentEmail.includes(".")) {
      return alert("Please enter a valid email address.");
    }

    try {
      setSendStatus("sending");
      if (typeof onShareSubmit === "function") await onShareSubmit();
      else await new Promise((res) => setTimeout(res, 1200));

      setSendStatus("success");
      setTimeout(() => {
        setSendStatus("idle");
        updateEmail("");
        setShowShareModal(false);
      }, 1200);
    } catch {
      setSendStatus("idle");
      alert("Failed to send email.");
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <style>{`
        * { box-sizing: border-box; }
        .board-title-input { font-weight: 300; font-size: 16px; opacity: 0.8; margin-left: 10px; border: 1.5px solid #22201B; border-radius: 6px; padding: 2px 8px; background: transparent; outline: none; width: 140px; }
        @media (min-width: 640px) { .board-title-input { font-size: 18px; margin-left: 16px; width: auto; } }
        .board-title-input:focus { border-color: #5B5FEF; opacity: 1; }
        
        .nav-btn-group { display: flex; align-items: center; gap: 8px; margin-left: auto; }
        @media (min-width: 640px) { .nav-btn-group { gap: 12px; } }
        
        .nav-btn { padding: 6px 10px; border-radius: 6px; border: 1.5px solid #22201B; background: #EAE3D3; color: #22201B; font-family: 'Architects Daughter', cursive; font-size: 13px; cursor: pointer; white-space: nowrap; }
        @media (min-width: 640px) { .nav-btn { padding: 8px 16px; font-size: 14px; } }
        .nav-btn:hover { background: #D8D0C0; }
        
        .primary-btn { background: #F2994A; box-shadow: 2px 2px 0px #22201B; }
        
        .modal-bg { position: fixed; inset: 0; z-index: 3000; background: rgba(34,32,27,0.4); backdrop-filter: blur(5px); display: flex; align-items: center; justify-content: center; padding: 16px; }
        .modal-box { background: #FFFDF9; border: 2px solid #22201B; border-radius: 12px; padding: 20px; width: 100%; max-width: 400px; box-shadow: 6px 6px 0px #22201B; font-family: 'Manrope', sans-serif; }
        @media (min-width: 640px) { .modal-box { padding: 24px; } }
        
        .section-title { font-size: 12px; font-weight: 700; color: #666; margin: 14px 0 6px 0; text-transform: uppercase; }
        @media (min-width: 640px) { .section-title { font-size: 13px; margin: 16px 0 8px 0; } }
        
        .dropdown { position: absolute; right: 0; top: 48px; background: white; border: 1.5px solid #22201B; border-radius: 8px; box-shadow: 4px 4px 0px #22201B; z-index: 2000; width: 200px; }
        @media (min-width: 640px) { .dropdown { width: 220px; } }
      `}</style>

      <nav style={{ ...styles.nav, position: "fixed", top: 0, width: "100%", zIndex: 1000, pointerEvents: "none", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 16px" }}>
        <div style={{ ...styles.brand, pointerEvents: "auto", display: "flex", alignItems: "center", minWidth: 0 }}>
          <SketchrLogo size={30} /> <span className="hidden sm:inline" style={{ marginLeft: 6 }}>Sketchr</span>
          <input type="text" value={title || ""} onChange={(e) => setTitle(e.target.value)} placeholder="Untitled Board" className="board-title-input" />
        </div>

        <div className="nav-btn-group" style={{ pointerEvents: "auto" }}>
          <button className="nav-btn primary-btn font-bold" onClick={() => navigate('/Dashboard')}>Home 💾</button>
          <button className="nav-btn hidden md:block" onClick={clear}>Clear</button>
          <button className="nav-btn hidden sm:block" onClick={() => navigate('/board/new')}>New</button>
          <button className="nav-btn" onClick={() => setShowShareModal(true)}>Share</button>

          <div style={{ position: "relative" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ ...styles.avatar, cursor: "pointer", width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }} onClick={() => setShowMenu(!showMenu)}>
              {user.charAt(0).toUpperCase()}
            </div>
            {showMenu && (
              <div className="dropdown">
                <div style={{ padding: "10px 14px", borderBottom: "1.5px solid #EAE3D3" }}>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: 13 }}>{user}</p>
                  <p style={{ margin: "2px 0 0", fontSize: 11, color: "#8B8478", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{email}</p>
                </div>
                {user !== "Guest" && (
                  <button onClick={() => { localStorage.clear(); navigate("/login"); }} style={{ padding: "8px 14px", background: "none", border: "none", cursor: "pointer", display: "flex", gap: "6px", color: "#dc2626", width: "100%", fontFamily: 'Architects Daughter', fontSize: 13 }}>
                    <LogOut size={13} /> Logout
                  </button>
                )}
                {user === "Guest" && (
                  <button onClick={() =>navigate("/login")} style={{ padding: "8px 14px", background: "none", border: "none", cursor: "pointer", display: "flex", gap: "6px", color: "#dc2626", width: "100%", fontFamily: 'Architects Daughter', fontSize: 13,backgroundColor:"#4bd783" }}>Login
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </nav>

      {showShareModal && (
        <div className="modal-bg" onClick={() => sendStatus === "idle" && setShowShareModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ fontFamily: 'Architects Daughter', margin: 0, fontSize: 18 }}>Share & Export</h3>
              {sendStatus === "idle" && <button onClick={() => setShowShareModal(false)} style={{ background: "none", border: "none", cursor: "pointer" }}><X size={18} /></button>}
            </div>

            <div className="section-title">Invite via Email</div>
            <form onSubmit={handleShareSubmit} style={{ display: "flex", gap: 6 }}>
              <input type="email" placeholder="colleague@example.com" value={currentEmail || ""} onChange={(e) => updateEmail(e.target.value)} disabled={sendStatus !== "idle"} style={{ border: "1.5px solid #22201B", borderRadius: 6, padding: "8px 10px", flex: 1, outline: "none", fontSize: 13 }} />
              <button type="submit" disabled={sendStatus !== "idle"} style={{ background: sendStatus === "success" ? "#10B981" : "#5B5FEF", color: "white", border: "1.5px solid #22201B", borderRadius: 6, padding: "8px 12px", cursor: "pointer", minWidth: 44, display: "flex", justifyContent: "center", alignItems: "center" }}>
                {sendStatus === "sending" && <Loader2 size={16} className="animate-spin" />}
                {sendStatus === "success" && <Check size={16} />}
                {sendStatus === "idle" && <Send size={15} />}
              </button>
            </form>

            <div className="section-title">Copy Board Link</div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", border: "1.5px solid #22201B", borderRadius: 6, padding: "6px 10px", background: "#F4EFE6" }}>
              <span style={{ fontSize: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginRight: 8, color: "#444" }}>{window.location.href}</span>
              <button onClick={copyLink} style={{ background: "#22201B", color: "white", border: "none", borderRadius: 4, padding: "5px 8px", fontSize: 11, cursor: "pointer", display: "flex", gap: 3, whiteSpace: "nowrap" }}>
                {copied ? <Check size={12} /> : <Copy size={12} />} {copied ? "Copied!" : "Copy"}
              </button>
            </div>

            <div className="section-title">Export Board</div>
            <div style={{ position: "relative" }}>
              {showDownloadOptions && (
                <div style={{ position: "absolute", bottom: "100%", left: 0, width: "100%", background: "white", border: "1.5px solid #22201B", borderRadius: 6, marginBottom: 8, overflow: "hidden" }}>
                  <button onClick={() => { onDownload?.('image'); setShowDownloadOptions(false); setShowShareModal(false); }} style={{ padding: "9px 12px", width: "100%", border: "none", borderBottom: "1px solid #EAE3D3", background: "white", cursor: "pointer", display: "flex", gap: 8, fontSize: 13, textAlign: "left" }}>
                    <Image size={14} color="#5B5FEF" /> Image (PNG)
                  </button>
                  <button onClick={() => { onDownload?.('json'); setShowDownloadOptions(false); setShowShareModal(false); }} style={{ padding: "9px 12px", width: "100%", border: "none", background: "white", cursor: "pointer", display: "flex", gap: 8, fontSize: 13, textAlign: "left" }}>
                    <FileCode size={14} color="#F2994A" /> JSON (Re-open)
                  </button>
                </div>
              )}
              <button onClick={() => setShowDownloadOptions(!showDownloadOptions)} style={{ width: "100%", background: "#EAE3D3", border: "1.5px solid #22201B", borderRadius: 6, padding: "9px", fontFamily: 'Architects Daughter', fontSize: 14, cursor: "pointer" }}>
                <Download size={15} /> Download Board ▾
              </button>
            </div>
          </div>
        </div>
      )}

      {showMenu && <div style={{ position: "fixed", inset: 0, zIndex: 999 }} onClick={() => setShowMenu(false)} />}
    </>
  );
};

export default Navbar;