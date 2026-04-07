import { useState, useEffect } from "react";

function App() {
  // --- STATE ---
  const [task, setTask] = useState("");
  const [priority, setPriority] = useState("Set Priority");
  const [deadline, setDeadline] = useState("");
  const [repeat, setRepeat] = useState("No Repeat");
  const [tasks, setTasks] = useState([]);
  const [timeNow, setTimeNow] = useState(Date.now());
  const [currentTab, setCurrentTab] = useState("Pending");
  const [isLoaded, setIsLoaded] = useState(false);

  // States for Edit Form
  const [editingTask, setEditingTask] = useState(null);
  
  // States for Feedback Form
  const [feedback, setFeedback] = useState("");

  // --- PERSISTENCE ---
  useEffect(() => {
    const timer = setInterval(() => setTimeNow(Date.now()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("final_task_system");
    if (saved) setTasks(JSON.parse(saved));
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("final_task_system", JSON.stringify(tasks));
    }
  }, [tasks, isLoaded]);

  // --- FORM 1: ADD TASK ---
  const handleAddTask = (e) => {
    e.preventDefault(); // Prevents page refresh
    if (!task || !deadline || priority === "Set Priority") return alert("Fill all fields!");
    
    const newEntry = {
      id: Date.now(),
      text: task,
      priority,
      deadline: new Date(deadline).getTime(),
      repeat,
      completed: false,
    };
    setTasks([newEntry, ...tasks]);
    setTask("");
    setDeadline("");
    setRepeat("No Repeat");
  };

  // --- FORM 2: EDIT TASK ---
  const handleUpdateTask = (e) => {
    e.preventDefault();
    setTasks(tasks.map(t => t.id === editingTask.id ? editingTask : t));
    setEditingTask(null);
  };

  // --- FORM 3: FEEDBACK ---
  const handleFeedback = (e) => {
    e.preventDefault();
    alert("Thank you for your feedback: " + feedback);
    setFeedback("");
  };

  // --- LOGIC ---
  const handleToggle = (id) => {
    const updatedTasks = tasks.map(t => {
      if (t.id === id && !t.completed) {
        if (t.repeat !== "No Repeat") {
          let nextTime = t.deadline;
          if (t.repeat === "Hourly") nextTime += 3600000;
          if (t.repeat === "Daily") nextTime += 86400000;
          if (t.repeat === "Weekly") nextTime += 604800000;
          const nextTask = { ...t, id: Date.now() + 1, deadline: nextTime, completed: false };
          setTimeout(() => setTasks(prev => [nextTask, ...prev]), 50);
        }
        return { ...t, completed: true };
      }
      if (t.id === id && t.completed) return { ...t, completed: false };
      return t;
    });
    setTasks(updatedTasks);
  };

  const getTimeLeft = (expiry) => {
    const diff = expiry - timeNow;
    if (diff <= 0) return "⚠️ Overdue";
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return hours > 24 ? `${Math.floor(hours/24)}d left` : `${hours}h ${mins}m left`;
  };

  const urgentTask = tasks
    .filter(t => !t.completed && t.deadline > timeNow)
    .sort((a, b) => a.deadline - b.deadline)[0];

  const marqueeMessage = urgentTask 
    ? `🚨 UP NEXT: "${urgentTask.text}" due in ${getTimeLeft(urgentTask.deadline)} 🚨`
    : "✨ No urgent tasks pending. ✨";

  const filteredTasks = tasks.filter(t => currentTab === "Pending" ? !t.completed : t.completed);

  return (
    <div style={styles.page}>
      <div style={styles.marqueeContainer}>
        <marquee style={styles.marqueeText}>{marqueeMessage}</marquee>
      </div>

      <div style={styles.glassCard}>
        <h1 style={styles.header}>🚀 Task Center</h1>

        {/* --- FORM 1: ADD TASK --- */}
        <form onSubmit={handleAddTask} style={styles.form}>
          <input style={styles.input} placeholder="Task name..." value={task} onChange={(e) => setTask(e.target.value)} />
          <div style={styles.row}>
            <select style={styles.select} value={priority} onChange={(e) => setPriority(e.target.value)}>
              <option disabled>Set Priority</option>
              <option>Low</option><option>Medium</option><option>High</option>
            </select>
            <select style={styles.select} value={repeat} onChange={(e) => setRepeat(e.target.value)}>
              <option>No Repeat</option>
              <option>Hourly</option><option>Daily</option><option>Weekly</option>
            </select>
          </div>
          <input type="datetime-local" style={styles.input} value={deadline} onChange={(e) => setDeadline(e.target.value)} />
          <button type="submit" style={styles.addBtn}>Add Task</button>
        </form>

        <div style={styles.navBar}>
          <button style={{...styles.navBtn, color: currentTab === "Pending" ? "#6366f1" : "#71717a", borderBottom: currentTab === "Pending" ? "2px solid #6366f1" : "none"}} onClick={() => setCurrentTab("Pending")}>
            Pending ({tasks.filter(t => !t.completed).length})
          </button>
          <button style={{...styles.navBtn, color: currentTab === "Completed" ? "#6366f1" : "#71717a", borderBottom: currentTab === "Completed" ? "2px solid #6366f1" : "none"}} onClick={() => setCurrentTab("Completed")}>
            Completed ({tasks.filter(t => t.completed).length})
          </button>
        </div>

        <div style={styles.listArea}>
          {filteredTasks.map((t) => (
            <div key={t.id} style={styles.item}>
              <div style={{ flex: 1, cursor: 'pointer' }} onClick={() => handleToggle(t.id)}>
                <div style={{...styles.itemText, textDecoration: t.completed ? "line-through" : "none", color: t.completed ? "#71717a" : "white"}}>{t.text}</div>
                <div style={styles.itemSubtext}>{t.completed ? "Task finished" : getTimeLeft(t.deadline)} • {t.repeat}</div>
              </div>
              <button style={{...styles.delBtn, color: '#6366f1', marginRight: '10px'}} onClick={() => setEditingTask(t)}>✎</button>
              <button style={styles.delBtn} onClick={() => setTasks(tasks.filter(i => i.id !== t.id))}>✕</button>
            </div>
          ))}
        </div>

        {/* --- FORM 2: EDIT MODAL (Conditional Rendering) --- */}
        {editingTask && (
          <div style={styles.modalOverlay}>
            <form onSubmit={handleUpdateTask} style={styles.glassCard}>
              <h3>Edit Task</h3>
              <input style={styles.input} value={editingTask.text} onChange={(e) => setEditingTask({...editingTask, text: e.target.value})} />
              <button type="submit" style={{...styles.addBtn, marginTop: '10px'}}>Update</button>
              <button type="button" onClick={() => setEditingTask(null)} style={{background: 'none', color: 'white', marginTop: '10px', border: 'none', cursor: 'pointer'}}>Cancel</button>
            </form>
          </div>
        )}

        <hr style={{margin: '30px 0', borderColor: '#27272a'}} />

        {/* --- FORM 3: FEEDBACK --- */}
        <form onSubmit={handleFeedback} style={styles.form}>
          <p style={{fontSize: '12px', color: '#71717a'}}>App Feedback</p>
          <input style={styles.input} placeholder="What do you think?" value={feedback} onChange={(e) => setFeedback(e.target.value)} />
          <button type="submit" style={{...styles.addBtn, background: '#27272a'}}>Send Feedback</button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  page: { background: "#09090b", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", fontFamily: "'Inter', sans-serif", paddingTop: "60px", color: "white" },
  marqueeContainer: { position: "absolute", top: 0, width: "100%", background: "rgba(99, 102, 241, 0.1)", padding: "10px 0" },
  marqueeText: { color: "#818cf8", fontWeight: "bold" },
  glassCard: { background: "rgba(24, 24, 27, 0.95)", backdropFilter: "blur(20px)", border: "1px solid #27272a", width: "90%", maxWidth: "480px", borderRadius: "28px", padding: "30px", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)" },
  header: { textAlign: "center", marginBottom: "20px" },
  form: { display: "flex", flexDirection: "column", gap: "12px" },
  input: { padding: "14px", borderRadius: "12px", border: "none", background: "#18181b", color: "white", width: '100%', boxSizing: 'border-box' },
  row: { display: "flex", gap: "10px" },
  select: { flex: 1, padding: "12px", borderRadius: "12px", border: "none", background: "#18181b", color: "white" },
  addBtn: { padding: "16px", background: "#6366f1", color: "white", border: "none", borderRadius: "12px", cursor: "pointer", fontWeight: "bold" },
  navBar: { display: "flex", justifyContent: "space-around", margin: "25px 0", borderBottom: "1px solid #27272a" },
  navBtn: { background: "none", border: "none", padding: "10px", cursor: "pointer", fontWeight: "600", transition: "0.3s" },
  listArea: { display: "flex", flexDirection: "column", gap: "12px" },
  item: { display: "flex", background: "#18181b", padding: "18px", borderRadius: "18px", alignItems: "center", border: "1px solid #27272a" },
  itemText: { fontWeight: "600", fontSize: "17px" },
  itemSubtext: { fontSize: "12px", color: "#71717a", marginTop: "4px" },
  delBtn: { background: "transparent", color: "#ef4444", border: "none", cursor: "pointer", fontSize: "18px" },
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }
};

export default App;