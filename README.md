# To-Do List Application (React)

A functional Task Management app built using **React.js** and **Vite**. This project focuses on state management, persistent storage, and automated task repeats.

## 📋 Features

* **Task Management**: Add, complete, and delete tasks.
* **Persistent Storage**: Uses `localStorage` to save tasks so they remain after a page refresh.
* **Deadline Tracking**: Real-time display of time remaining for each task.
* **Recurring Tasks**: Supports "Hourly," "Daily," and "Weekly" repeats. When a recurring task is completed, a new one is automatically generated for the next time slot.
* **Filtering**: Separate tabs to view "Pending" tasks versus "Completed" tasks.
* **Urgent Task Header**: A scrolling marquee that displays the task with the closest deadline.

## 🛠️ Technical Details

* **Framework**: React (Functional Components)
* **State Management**: `useState` hook for handling the task list and active tabs.
* **Side Effects**: `useEffect` hook for the 60-second timer interval and LocalStorage synchronization.
* **Styling**: Standard CSS with a dark theme and basic animations.

## 🚀 How to Run
Follow these steps to run the project on your local machine:

```bash
git clone https://github.com/NeelChopdekar/todolistapp.git
npm install
npm run dev