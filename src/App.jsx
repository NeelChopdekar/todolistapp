import React, { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [task, setTask] = useState("");
  const [priority, setPriority] = useState("Set Priority");
  const [deadline, setDeadline] = useState("");
  const [repeat, setRepeat] = useState("No Repeat");
  const [tasks, setTasks] = useState([]);
  const [timeNow, setTimeNow] = useState(Date.now());
  const [currentTab, setCurrentTab] = useState("Pending");
  const [isLoaded, setIsLoaded] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [feedback, setFeedback] = useState("");

  useEffect(function() {
    const timer = setInterval(function() {
      setTimeNow(Date.now());
    }, 60000);
    return function() {
      clearInterval(timer);
    };
  }, []);

  useEffect(function() {
    const saved = localStorage.getItem("final_task_system");
    if (saved) {
      setTasks(JSON.parse(saved));
    }
    setIsLoaded(true);
  }, []);

  useEffect(function() {
    if (isLoaded) {
      localStorage.setItem("final_task_system", JSON.stringify(tasks));
    }
  }, [tasks, isLoaded]);

  function handleAddTask(e) {
    e.preventDefault();
    if (!task || !deadline || priority === "Set Priority") {
      return alert("Fill all fields!");
    }

    const newEntry = {
      id: Date.now(),
      text: task,
      priority: priority,
      deadline: new Date(deadline).getTime(),
      repeat: repeat,
      completed: false
    };

    setTasks([newEntry, ...tasks]);
    setTask("");
    setDeadline("");
    setRepeat("No Repeat");
  }

  function handleUpdateTask(e) {
    e.preventDefault();
    const updatedList = tasks.map(function(t) {
      if (t.id === editingTask.id) {
        return editingTask;
      } else {
        return t;
      }
    });
    setTasks(updatedList);
    setEditingTask(null);
  }

  function handleFeedback(e) {
    e.preventDefault();
    alert("Thank you for your feedback: " + feedback);
    setFeedback("");
  }

  function handleToggle(id) {
    const updatedTasks = tasks.map(function(t) {
      if (t.id === id && !t.completed) {
        if (t.repeat !== "No Repeat") {
          let nextTime = t.deadline;
          if (t.repeat === "Hourly") nextTime += 3600000;
          if (t.repeat === "Daily") nextTime += 86400000;
          if (t.repeat === "Weekly") nextTime += 604800000;

          const nextTask = {
            ...t,
            id: Date.now() + 1,
            deadline: nextTime,
            completed: false
          };

          setTimeout(function() {
            setTasks(function(prev) {
              return [nextTask, ...prev];
            });
          }, 50);
        }
        return { ...t, completed: true };
      }

      if (t.id === id && t.completed) {
        return { ...t, completed: false };
      }

      return t;
    });
    setTasks(updatedTasks);
  }

  function getTimeLeft(expiry) {
    const diff = expiry - timeNow;
    if (diff <= 0) {
      return "Overdue";
    }
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 24) {
      return Math.floor(hours / 24) + " days";
    } else {
      return hours + "h " + mins + "m";
    }
  }

  const urgentTask = tasks
    .filter(function(t) {
      return !t.completed && t.deadline > timeNow;
    })
    .sort(function(a, b) {
      return a.deadline - b.deadline;
    })[0];

  const marqueeMessage = urgentTask
    ? "URGENT: " + urgentTask.text + " due in " + getTimeLeft(urgentTask.deadline) + "!"
    : " No urgent tasks pending. ";

  const filteredTasks = tasks.filter(function(t) {
    if (currentTab === "Pending") {
      return !t.completed;
    } else {
      return t.completed;
    }
  });

  return (
    <div className="page">
      <div className="marquee-container">
        <marquee className="marquee-text">{marqueeMessage}</marquee>
      </div>

      <div className="glass-card">
        <h1 className="header">TODOLIST</h1>

        <form onSubmit={handleAddTask} className="form">
          <input
            className="input"
            placeholder="Task name..."
            value={task}
            onChange={function(e) { setTask(e.target.value); }}
          />
          <div className="row">
            <select className="select" value={priority} onChange={function(e) { setPriority(e.target.value); }}>
              <option disabled>Set Priority</option>
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>
            <select className="select" value={repeat} onChange={function(e) { setRepeat(e.target.value); }}>
              <option>No Repeat</option>
              <option>Hourly</option>
              <option>Daily</option>
              <option>Weekly</option>
            </select>
          </div>
          <input
            type="datetime-local"
            className="input"
            value={deadline}
            onChange={function(e) { setDeadline(e.target.value); }}
          />
          <button type="submit" className="add-btn">Add Task</button>
        </form>

        <div className="nav-bar">
          <button
            className="nav-btn"
            style={{ color: currentTab === "Pending" ? "#6366f1" : "#71717a", borderBottom: currentTab === "Pending" ? "2px solid #6366f1" : "none" }}
            onClick={function() { setCurrentTab("Pending"); }}
          >
            Pending ({tasks.filter(function(t) { return !t.completed; }).length})
          </button>
          <button
            className="nav-btn"
            style={{ color: currentTab === "Completed" ? "#6366f1" : "#71717a", borderBottom: currentTab === "Completed" ? "2px solid #6366f1" : "none" }}
            onClick={function() { setCurrentTab("Completed"); }}
          >
            Completed ({tasks.filter(function(t) { return t.completed; }).length})
          </button>
        </div>

        <div className="list-area">
          {filteredTasks.map(function(t) {
            return (
              <div key={t.id} className="item">
                <div style={{ flex: 1, cursor: 'pointer' }} onClick={function() { handleToggle(t.id); }}>
                  <div className="item-text" style={{ textDecoration: t.completed ? "line-through" : "none", color: t.completed ? "#71717a" : "white" }}>{t.text}</div>
                  <div className="item-subtext">
                    {t.completed ? "Task finished" : getTimeLeft(t.deadline)} • {t.repeat}
                  </div>
                </div>
                <button
                  className="del-btn"
                  style={{ color: '#6366f1', marginRight: '10px' }}
                  onClick={function() { setEditingTask(t); }}
                >
                  ✎
                </button>
                <button
                  className="del-btn"
                  onClick={function() { setTasks(tasks.filter(function(i) { return i.id !== t.id; })); }}
                >
                  ✕
                </button>
              </div>
            );
          })}
        </div>

        {editingTask && (
          <div className="modal-overlay">
            <div className="glass-card">
              <form onSubmit={handleUpdateTask} className="form">
                <h3>Edit Task</h3>
                <input
                  className="input"
                  value={editingTask.text}
                  onChange={function(e) { setEditingTask({ ...editingTask, text: e.target.value }); }}
                />
                <button type="submit" className="add-btn" style={{ marginTop: '10px' }}>Update</button>
                <button
                  type="button"
                  onClick={function() { setEditingTask(null); }}
                  style={{ background: 'none', color: 'white', marginTop: '10px', border: 'none', cursor: 'pointer' }}
                >
                  Cancel
                </button>
              </form>
            </div>
          </div>
        )}

        <hr />

        <form onSubmit={handleFeedback} className="form">
          <p style={{ fontSize: '12px', color: '#71717a' }}>App Feedback</p>
          <input
            className="input"
            placeholder="What do you think?"
            value={feedback}
            onChange={function(e) { setFeedback(e.target.value); }}
          />
          <button type="submit" className="add-btn" style={{ background: '#27272a' }}>Send Feedback</button>
        </form>
      </div>
    </div>
  );
}

export default App;