import React, { useEffect, useRef, useState, useReducer } from "react";
import Header from "./components/Header";
import TaskList from "./components/TaskList";
import Card from "./components/Card";
import TaskForm from "./components/TaskForm";
import QuoteOfTheDay from "./components/QuoteOfTheDay";
import "./App.css";
import useDebounce from "./hooks/useDebounce";
import usePrevious from "./hooks/usePrevious";
import { taskReducer, initialState } from "./reducers/taskReducer";

// Słownik do ładnego wyświetlania nazw filtrów w komunikatach
const filterNames = {
  all: "Wszystkie",
  todo: "Do zrobienia",
  done: "Wykonane"
};

// Funkcja inicjalizująca - pobiera zadania z localStorage przy starcie [cite: 126, 127]
const init = (initial) => {
  const saved = localStorage.getItem('tasks');
  return {
    ...initial,
    tasks: saved ? JSON.parse(saved) : initial.tasks, // [cite: 129, 132]
  };
};

function App() {
  // --- CZĘŚĆ B: useReducer zamiast useState ---
  const [state, dispatch] = useReducer(taskReducer, initialState, init); // [cite: 125]

  useEffect(() => {
    document.title = "Menedżer Zadań";
  }, []);
  
  const renderCount = useRef(0);
  useEffect(() => {
    renderCount.current += 1;
    console.log(`%c[Render App]: ${renderCount.current}`, "color: #4caf50; font-weight: bold");
  });

  const categories = ["Praca", "Dom", "Zakupy", "Inne"];

  // Automatyczny zapis do localStorage przy każdej zmianie listy zadań [cite: 135]
  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(state.tasks));
  }, [state.tasks]);

  const [categoryFilter, setCategoryFilter] = useState("Wszystkie");
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Obsługa komunikatów o zmianie filtra [cite: 109]
  const prevFilter = usePrevious(state.filter);
  const [filterMessage, setFilterMessage] = useState("");
  const messageTimerRef = useRef(null);

  useEffect(() => {
    if (prevFilter !== undefined && prevFilter !== state.filter) {
      const prevLabel = filterNames[prevFilter] || prevFilter;
      const currentLabel = filterNames[state.filter] || state.filter;

      setFilterMessage(`Zmieniono filtr z "${prevLabel}" na "${currentLabel}"`);

      if (messageTimerRef.current) {
        clearTimeout(messageTimerRef.current);
      }

      messageTimerRef.current = setTimeout(() => {
        setFilterMessage("");
      }, 2000);
    }
  }, [state.filter, prevFilter]);

  // --- FUNKCJE WYSYŁAJĄCE AKCJE (DISPATCH) ---
  const toggleTask = (id) => {
    dispatch({ type: "TOGGLE_TASK", payload: id }); // [cite: 105]
  };

  const deleteTask = (id) => {
    dispatch({ type: "DELETE_TASK", payload: id }); // [cite: 104]
  };

  const addTask = (newTask) => {
    dispatch({ type: "ADD_TASK", payload: newTask }); // [cite: 103]
  };

  const updateTask = (id, newTitle, newCategory) => {
    dispatch({ 
      type: "UPDATE_TASK", 
      payload: { id, title: newTitle, category: newCategory } 
    }); // [cite: 106]
  };

  const setFilter = (filterType) => {
    dispatch({ type: "SET_FILTER", payload: filterType }); // [cite: 109]
  };

  const clearAllTasks = () => {
    if (window.confirm("Na pewno chcesz usunąć wszystkie zadania?")) {
      // Możesz użyć akcji CLEAR_COMPLETED lub dodać nową do czyszczenia wszystkiego
      state.tasks.forEach(t => dispatch({ type: "DELETE_TASK", payload: t.id }));
    }
  };

  // --- LOGIKA FILTROWANIA ---
  const filteredTasks = state.tasks
    .filter(task => {
      if (state.filter === "done") return task.completed;
      if (state.filter === "todo") return !task.completed;
      return true;
    })
    .filter(task => {
      if (categoryFilter === "Wszystkie") return true;
      return task.category === categoryFilter;
    })
    .filter(task => {
      return task.title.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
    });

  return (
    <div className="app">
      {filterMessage && (
        <div className="filter-alert">
          {filterMessage}
        </div>
      )}
      <Header />
      <QuoteOfTheDay />
      <Card title="Dodaj nowe zadanie">
        <TaskForm addTask={addTask} />
      </Card>
      <Card title="Lista zadań">
        <input
          type="text"
          placeholder="Szukaj zadania..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ marginBottom: "15px", padding: "8px", width: "100%" }}
        />
        <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
          <button className="clear-all" onClick={clearAllTasks}>Wyczyść</button>
          
          {/* Przycisk Cofnij (Undo) z Części C [cite: 145, 158] */}
          {state.previousTasks && (
            <button 
              className="undo-button" 
              onClick={() => dispatch({ type: "UNDO" })}
            >
              Cofnij ↩
            </button>
          )}
        </div>

        {/* Filtry priorytetu/stanu [cite: 109] */}
        <div style={{ marginBottom: "10px" }}>
          <span>Filtruj po stanie: </span>
          <button className="priority-all" onClick={() => setFilter("all")}>Wszystkie</button>
          <button className="priority-todo" onClick={() => setFilter("todo")}>Do zrobienia</button>
          <button className="priority-done" onClick={() => setFilter("done")}>Wykonane</button>
        </div>

        {/* Filtry kategorii [cite: 112] */}
        <div style={{ marginBottom: "10px" }}>
          <span>Filtruj po kategorii: </span>
          <button 
            className="category-button category-Wszystkie" // Dodana klasa koloru
            onClick={() => setCategoryFilter("Wszystkie")}>Wszystkie</button>
          {categories.map((cat) => (
            <button 
              key={cat} 
              className={`category-button category-${cat}`} 
              onClick={() => setCategoryFilter(cat)}>{cat}</button>
          ))}
        </div>

        <TaskList 
          tasks={filteredTasks} 
          onToggle={toggleTask} 
          onDelete={deleteTask} 
          onUpdate={updateTask}
          onReorder={(index, direction) => dispatch({ type: "REORDER_TASKS", payload: { index, direction } })}
        />
      </Card>
    </div>
  );
}

export default App;