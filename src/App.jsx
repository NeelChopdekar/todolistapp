import { useState, useEffect } from "react";

function App() {
  const [task, setTask] = useState("");
  const [priority, setPriority] = useState("Set Priority");
  const [deadline, setDeadline] = useState("");
  const [repeat, setRepeat] = useState("No Repeat");
  const [tasks, setTasks] = useState([]);
  const [timeNow, setTimeNow] = useState(Date.now());
  
  // NEW: Navigation State (Pending vs Completed)
  const [currentTab, setCurrentTab] = useState("Pending");

  useEffect(() => {
    const timer = setInterval(() => setTimeNow(Date.now()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("final_task_system");
    if (saved) setTasks(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("final_task_system", JSON.stringify(tasks));
  }, [tasks]);

  const addTask = () => {
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

  const handleToggle = (id) => {
    const updatedTasks = tasks.map(t => {
      if (t.id === id && !t.completed) {
        if (t.repeat !== "No Repeat") {
          let nextTime = t.deadline;
          if (t.repeat === "Hourly") nextTime += 3600000;
          if (t.repeat === "Daily") nextTime += 86400000;
          if (t.repeat === "Weekly") nextTime += 604800000;

          const nextTask = { ...t, id: Date.now() + 1, deadline: nextTime, completed: false };
          setTimeout(() => setTasks(prev => [nextTask, ...prev]), 10);
        }
        return { ...t, completed: true };
      }
      // If clicking in completed menu, toggle back to pending
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

  // FILTERING FOR MENUS
  const filteredTasks = tasks.filter(t => 
    currentTab === "Pending" ? !t.completed : t.completed
  );

  return (
    <div style={styles.page}>
      <div style={styles.marqueeContainer}>
        <marquee style={styles.marqueeText}>{marqueeMessage}</marquee>
      </div>

      <div style={styles.glassCard}>
        <h1 style={styles.header}>🚀 Task Center</h1>

        {/* INPUT SECTION */}
        <div style={styles.form}>
          <input className="hover-pop" style={styles.input} placeholder="Task name..." value={task} onChange={(e) => setTask(e.target.value)} />
          <div style={styles.row}>
            <select className="hover-pop" style={styles.select} value={priority} onChange={(e) => setPriority(e.target.value)}>
              <option disabled>Set Priority</option>
              <option>Low</option><option>Medium</option><option>High</option>
            </select>
            <select className="hover-pop" style={styles.select} value={repeat} onChange={(e) => setRepeat(e.target.value)}>
              <option>No Repeat</option>
              <option>Hourly</option><option>Daily</option><option>Weekly</option>
            </select>
          </div>
          <input type="datetime-local" className="hover-pop" style={styles.input} value={deadline} onChange={(e) => setDeadline(e.target.value)} />
          <button className="btn-pop" style={styles.addBtn} onClick={addTask}>Add Task</button>
        </div>

        {/* NAVIGATION MENU */}
        <div style={styles.navBar}>
          <button 
            style={{...styles.navBtn, color: currentTab === "Pending" ? "#6366f1" : "#71717a", borderBottom: currentTab === "Pending" ? "2px solid #6366f1" : "none"}}
            onClick={() => setCurrentTab("Pending")}
          >
            Pending ({tasks.filter(t => !t.completed).length})
          </button>
          <button 
            style={{...styles.navBtn, color: currentTab === "Completed" ? "#6366f1" : "#71717a", borderBottom: currentTab === "Completed" ? "2px solid #6366f1" : "none"}}
            onClick={() => setCurrentTab("Completed")}
          >
            Completed ({tasks.filter(t => t.completed).length})
          </button>
        </div>

        {/* TASK LIST */}
        <div style={styles.listArea}>
          {filteredTasks.length === 0 ? (
            <p style={{textAlign: 'center', color: '#71717a'}}>No tasks found here.</p>
          ) : (
            filteredTasks.map((t) => (
              <div key={t.id} className="task-item" style={styles.item}>
                <div style={{ flex: 1 }} onClick={() => handleToggle(t.id)}>
                  <div style={{...styles.itemText, textDecoration: t.completed ? "line-through" : "none", color: t.completed ? "#71717a" : "white"}}>
                    {t.text}
                  </div>
                  <div style={styles.itemSubtext}>
                    {t.completed ? "Task finished" : getTimeLeft(t.deadline)} • {t.repeat}
                  </div>
                </div>
                <button style={styles.delBtn} onClick={() => setTasks(tasks.filter(i => i.id !== t.id))}>✕</button>
              </div>
            ))
          )}
        </div>
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
  input: { padding: "14px", borderRadius: "12px", border: "none", background: "#18181b", color: "white" },
  row: { display: "flex", gap: "10px" },
  select: { flex: 1, padding: "12px", borderRadius: "12px", border: "none", background: "#18181b", color: "white" },
  addBtn: { padding: "16px", background: "#6366f1", color: "white", border: "none", borderRadius: "12px", cursor: "pointer", fontWeight: "bold" },
  navBar: { display: "flex", justifyContent: "space-around", margin: "25px 0", borderBottom: "1px solid #27272a" },
  navBtn: { background: "none", border: "none", padding: "10px", cursor: "pointer", fontWeight: "600", transition: "0.3s" },
  listArea: { display: "flex", flexDirection: "column", gap: "12px" },
  item: { display: "flex", background: "#18181b", padding: "18px", borderRadius: "18px", alignItems: "center", border: "1px solid #27272a" },
  itemText: { fontWeight: "600", fontSize: "17px" },
  itemSubtext: { fontSize: "12px", color: "#71717a", marginTop: "4px" },
  delBtn: { background: "transparent", color: "#ef4444", border: "none", cursor: "pointer", fontSize: "18px" }
};

export default App;