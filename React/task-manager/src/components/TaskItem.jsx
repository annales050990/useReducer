// src/components/TaskItem.jsx
import React, { useState } from "react";
import "./TaskItem.css";

function TaskItem({
  id,
  title = "Nowe zadanie",
  completed = false,
  priority = "medium",
  category = "Inne",
  index,       // Dodane: index zadania
  onToggle,
  onDelete,
  onUpdate,
  onReorder,   // Dodane: funkcja przesuwania
}) {
  const priorityColors = {
    high: "red",
    medium: "orange",
    low: "green",
  };

  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(title);
  const [editCategory, setEditCategory] = useState(category);
  const [error, setError] = useState("");

  const categories = ["Praca", "Dom", "Zakupy", "Inne"];

  const validate = (value) => {
    if (value.trim().length < 3) return "Tytuł musi mieć minimum 3 znaki";
    if (value.trim().length > 100) return "Tytuł może mieć maksymalnie 100 znaków";
    return "";
  };

  const handleSave = () => {
    const validationError = validate(editTitle);
    if (validationError) {
      setError(validationError);
      return;
    }
    onUpdate(id, editTitle.trim(), editCategory);
    setIsEditing(false);
    setError("");
  };

  const handleCancel = () => {
    setEditTitle(title);
    setEditCategory(category);
    setIsEditing(false);
    setError("");
  };

  return (
    <li className="task-item">
      <div className="task-main-content">
        <input 
          type="checkbox" 
          checked={completed} 
          onChange={() => onToggle(id)} 
        />

        {isEditing ? (
          <>
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSave();
                if (e.key === "Escape") handleCancel();
              }}
              className={error ? "error" : ""}
            />
            <select value={editCategory} onChange={(e) => setEditCategory(e.target.value)}>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <button onClick={handleSave}>Zapisz</button>
            <button onClick={handleCancel}>Anuluj</button>
            {error && <p className="error-message">{error}</p>}
          </>
        ) : (
          <>
            <span className={completed ? "completed" : ""} style={{ color: priorityColors[priority] }}>
              {title} <small>({category})</small>
            </span>
            
            {/* --- PRZYCISKI PRZESUWANIA (Część C) --- */}
            <div className="reorder-controls" style={{ display: 'inline-flex', gap: '5px', margin: '0 10px' }}>
              <button onClick={() => onReorder(index, 'up')} title="Przesuń w górę">↑</button>
              <button onClick={() => onReorder(index, 'down')} title="Przesuń w dół">↓</button>
            </div>

            <button onClick={() => setIsEditing(true)}>Edytuj</button>
            <button onClick={() => onDelete(id)}>Usuń</button>
          </>
        )}
      </div>
    </li>
  );
}

export default TaskItem;