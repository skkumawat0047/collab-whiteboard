import { useState, useEffect, useCallback } from "react";
import { Search, Plus, LayoutTemplate, Upload, DoorOpen, MoreHorizontal, Star, Trash2, Edit3, ArrowLeftRight, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import SketchrLogo from "./Login/SketchrLogo";
import { styles, COLORS } from "./Login/styles";

const QUICK_ACTIONS = [
  { icon: Plus, label: "Blank board", go: "/board/new" },
  { icon: LayoutTemplate, label: "From a template", go: "/board/new" },
  { icon: DoorOpen, label: "Join a room", go: "/board/new" },
];

const TABS = ["All boards", "Shared with me", "Starred", "Trash"];
const ACCENT_COLORS = [COLORS.primary, COLORS.mint, COLORS.sun, COLORS.secondary];

const SERVER_ORIGIN = "https://sketchr.onrender.com";
const API_BOARDS = `${SERVER_ORIGIN}/api/boards`;

export default function HomePage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("All boards");
  const [boards, setBoards] = useState([]);

  const [activeMenuId, setActiveMenuId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [renameText, setRenameText] = useState("");
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const userId = localStorage.getItem("userId");
  const userName = localStorage.getItem("sketchr_user_name") || "Guest";
  const email = localStorage.getItem("sketchr_email_id") || "No email available";
  const avatarChar = userName.length > 0 ? userName.charAt(0).toUpperCase() : "?";

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const fetchBoards = useCallback(async () => {
    try {
      if (!userId) return;
      const res = await fetch(`${SERVER_ORIGIN}/user/allboard/${userId}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();

      const tabKeyMap = {
        "All boards": "ownedBoards",
        "Shared with me": "sharedBoards",
        "Starred": "starredBoards",
        "Trash": "trashBoards"
      };

      const selectedBoards = data[tabKeyMap[activeTab]] || [];

      setBoards(selectedBoards.map((b, i) => ({
        id: b._id,
        title: b.title || "Untitled Board",
        edited: new Date(b.updatedAt).toLocaleDateString(),
        people: b.collaborators?.length || 1,
        accent: ACCENT_COLORS[i % 4],
        isStarred: b.starredBy?.includes(userId) || false
      })));
    } catch (err) {
      console.error("Fetch Error:", err);
    }
  }, [userId, activeTab]);

  useEffect(() => {
    fetchBoards();
  }, [fetchBoards]);

  const handleAction = async (id, action) => {
    setActiveMenuId(null);

    // Check karein ki userId available hai ya nahi
    if (!userId) {
      alert("User ID missing. Please login again.");
      return;
    }

    try {
      if (action === "STAR") {
        const target = boards.find(b => b.id === id);
        const alreadyStarred = target?.isStarred;

        // Optimistic UI update
        setBoards(prev =>
          prev.map(b =>
            b.id === id
              ? { ...b, isStarred: !alreadyStarred }
              : b
          )
        );

        const url = alreadyStarred
          ? `${API_BOARDS}/unstar/${id}`
          : `${API_BOARDS}/star/${id}`;

        const response = await fetch(url, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId })
        });

        if (!response.ok) {
          throw new Error("Failed to update star status");
        }

        // Agar hum 'Starred' tab me hain aur unstar kiya hai, toh turant list se hata dein
        if (activeTab === "Starred" && alreadyStarred) {
          setBoards(prev => prev.filter(b => b.id !== id));
        } else {
          // Server se fresh boards fetch karke state sync kar lein taaki star icon na hate
          fetchBoards();
        }
      }
      else if (action === "RENAME") {
        setEditingId(null);

        // Frontend instantly update
        setBoards(prev =>
          prev.map(b =>
            b.id === id
              ? { ...b, title: renameText }
              : b
          )
        );

        await fetch(`${API_BOARDS}/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: renameText })
        });
      }
      else if (action === "DELETE") {
        if (activeTab === "Trash") {
          if (!window.confirm("Permanently delete this board? This cannot be undone.")) return;

          setBoards(prev => prev.filter(b => b.id !== id));

          await fetch(`${API_BOARDS}/${id}`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" }
          });

        } else {
          setBoards(prev => prev.filter(b => b.id !== id));

          await fetch(`${API_BOARDS}/trash/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId })
          });
        }
      }
      else if (action === "RESTORE") {
        setBoards(prev => prev.filter(b => b.id !== id));

        await fetch(`${API_BOARDS}/restore/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId })
        });
      }
    } catch (err) {
      console.error("Action Error:", err);
      fetchBoards();
    }
  };

  return (
    <div style={styles.page} onClick={() => { setActiveMenuId(null); setShowProfileMenu(false); }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Gochi+Hand&family=Architects+Daughter&family=Manrope:wght@400;500;600;700;800&display=swap');
        .custom-scroll::-webkit-scrollbar { width: 4px !important; }
        .custom-scroll::-webkit-scrollbar-track { background: transparent !important; }
        .custom-scroll::-webkit-scrollbar-thumb { background-color: rgba(34, 32, 27, 0.25) !important; border-radius: 99px !important; }
        
        .pill-btn {
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .pill-btn:hover {
          transform: translateY(-2px);
          box-shadow: 3px 3px 0px #22201B;
        }
        .pill-btn:active {
          transform: translateY(0);
          box-shadow: 1px 1px 0px #22201B;
        }

        .board-row-item {
          transition: background-color 0.15s ease, transform 0.15s ease;
          border-radius: 8px;
          padding-left: 8px !important;
          padding-right: 8px !important;
        }
        .board-row-item:hover {
          background-color: rgba(255, 255, 255, 0.7);
        }

        .menu-option-btn {
          padding: 8px 12px; background: none; border: none; cursor: pointer;
          text-align: left; display: flex; align-items: center; gap: 8px;
          font-size: 13px; font-family: 'Manrope', sans-serif; border-radius: 4px;
          transition: background 0.15s; width: 100%; color: #22201B;
        }
        .menu-option-btn:hover { background: #F7F2E9; }
        .menu-option-danger { color: #dc2626; }
        .menu-option-danger:hover { background: #fff5f5; }
        
        .profile-dropdown {
          position: absolute; right: 0; top: 48px; background: white;
          border: 1.5px solid #22201B; border-radius: 8px; box-shadow: 4px 4px 0px #22201B;
          z-index: 2000; width: 220px; display: flex; flex-direction: column; overflow: hidden;
        }
        .profile-info { padding: 12px 16px; border-bottom: 1.5px solid #EAE3D3; background: #FFF; text-align: left; }
        .profile-name { margin: 0; font-size: 14px; font-weight: 700; color: #22201B; font-family: 'Manrope', sans-serif; }
        .profile-email { margin: 2px 0 0 0; font-size: 12px; color: #8B8478; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-family: 'Manrope', sans-serif; }
        .logout-btn {
          padding: 10px 16px; background: none; border: none; cursor: pointer;
          display: flex; align-items: center; gap: 8px; font-family: 'Architects Daughter', cursive;
          font-size: 13.5px; color: #dc2626; width: 100%; text-align: left; transition: background 0.2s;
        }
        .logout-btn:hover { background: #fff5f5; }
      `}</style>

      {/* NAVBAR */}
      <nav style={{ ...styles.nav, width: "100%", position: "fixed", top: 0, left: 0, zIndex: 1000 }}>
        <div style={styles.brand}>
          <SketchrLogo size={30} /> Sketchr
        </div>

        <div style={styles.searchBox} onClick={e => e.stopPropagation()}>
          <Search size={16} color={COLORS.pencil} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search boards..." style={styles.searchInput} />
        </div>

        <div style={{ ...styles.navRight, position: "relative" }} onClick={e => e.stopPropagation()}>
          <div
            style={{ ...styles.avatar, cursor: "pointer" }}
            onClick={() => setShowProfileMenu(!showProfileMenu)}
          >
            {avatarChar}
          </div>

          {showProfileMenu && (
            <div className="profile-dropdown">
              <div className="profile-info">
                <p className="profile-name">{userName}</p>
                <p className="profile-email">{email}</p>
              </div>
              {userName !== "Guest" && (
                <button onClick={handleLogout} className="logout-btn">
                  <LogOut size={14} /> Logout
                </button>
              )}
              {userName === "Guest" && (
                <button onClick={()=>navigate('/login')} className="login-btn  bg-green-300">
                  Login
                </button>
              )}
            </div>
          )}
        </div>
      </nav>
      <div style={{ height: "68px" }} />

      {/* MAIN CONTENT */}
      <main style={styles.main}>
        <h1 style={styles.greeting}>Good morning, {userName.split(" ")[0]}..</h1>
        <p style={styles.subtext}>Pick up where you left off, or start something new.</p>

        {/* QUICK ACTIONS */}
        <div style={styles.pillRow}>
          {QUICK_ACTIONS.map(e => (
            <button key={e.label} className="pill-btn" style={{ ...styles.pill, cursor: "pointer" }} onClick={() => navigate(e.go)}>
              <e.icon size={16} /> {e.label}
            </button>
          ))}
          <input id="file" type="file" accept=".pdf,.png" hidden />
          <label htmlFor="file" className="pill-btn" style={{ ...styles.pill, cursor: 'pointer' }}>
            <Upload size={16} />
            Import a file
          </label>
        </div>

        {/* TABS */}
        <div style={styles.tabRow}>
          {TABS.map(t => (
            <button key={t} onClick={() => setActiveTab(t)} style={{ ...styles.tab, ...(activeTab === t ? styles.tabActive : {}) }}>{t}</button>
          ))}
        </div>

        {/* BOARDS LIST */}
        <div className="custom-scroll" style={styles.boardList}>
          {boards
            .filter(b => b.title.toLowerCase().includes(search.toLowerCase()))
            .map(b => (
              <div key={b.id} className="board-row-item" style={{ ...styles.boardRow, cursor: "pointer", position: "relative" }} onClick={() => editingId !== b.id && navigate(`/board/${b.id}`)}>
                <div style={{ ...styles.boardSwatch, background: b.accent }} />

                <div style={{ ...styles.boardInfo, flex: 1 }}>
                  {editingId === b.id ? (
                    <div style={{ display: "flex", gap: "6px" }} onClick={e => e.stopPropagation()}>
                      <input value={renameText} onChange={e => setRenameText(e.target.value)} autoFocus style={{ border: "1.5px solid #22201B", padding: "4px 8px", borderRadius: "4px", outline: "none", fontSize: "14px" }} />
                      <button onClick={() => handleAction(b.id, "RENAME")} style={{ background: COLORS.primary, color: COLORS.ink, border: "1.5px solid #22201B", padding: "4px 10px", borderRadius: "4px", cursor: "pointer", fontWeight: "600" }}>Save</button>
                    </div>
                  ) : (
                    <>
                      <div style={{ ...styles.boardTitle, display: "flex", alignItems: "center", gap: "6px" }}>
                        {b.title} {b.isStarred && <Star size={14} style={{ fill: "#fbbf24", color: "#fbbf24" }} />}
                      </div>
                      <div style={styles.boardMeta}>Edited {b.edited} · {b.people} {b.people === 1 ? "person" : "people"}</div>
                    </>
                  )}
                </div>

                {/* MORE MENU OPTIONS */}
                <div onClick={e => e.stopPropagation()} style={{ position: "relative" }}>
                  <button style={styles.moreButton} onClick={() => setActiveMenuId(activeMenuId === b.id ? null : b.id)}>
                    <MoreHorizontal size={18} />
                  </button>

                  {activeMenuId === b.id && (
                    <div style={{ position: "absolute", right: 0, top: 30, background: "white", border: "1.5px solid #22201B", borderRadius: "8px", boxShadow: "4px 4px 0px #22201B", zIndex: 10, width: "150px", display: "flex", flexDirection: "column", padding: "6px", gap: "2px" }}>
                      {activeTab !== "Trash" && (
                        <>
                          <button className="menu-option-btn" onClick={() => { setEditingId(b.id); setRenameText(b.title); setActiveMenuId(null); }}><Edit3 size={14} /> Rename</button>
                          <button className="menu-option-btn" onClick={() => handleAction(b.id, "STAR")}><Star size={14} /> {b.isStarred ? "Unstar" : "Star"}</button>
                        </>
                      )}
                      {activeTab === "Trash" && (
                        <button className="menu-option-btn" onClick={() => handleAction(b.id, "RESTORE")}><ArrowLeftRight size={14} /> Restore</button>
                      )}
                      <button className="menu-option-btn menu-option-danger" onClick={() => handleAction(b.id, "DELETE")}>
                        <Trash2 size={14} /> {activeTab === "Trash" ? "Delete Forever" : "Move to Trash"}
                      </button>
                    </div>
                  )}
                </div>

              </div>
            ))}
        </div>
      </main>
    </div>
  );
}