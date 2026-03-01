import React, { useEffect, useRef, useState } from "react";
import Header from "./components/Header";
import TaskList from "./components/TaskList";
import Card from "./components/Card";
import TaskForm from "./components/TaskForm";
import QuoteOfTheDay from "./components/QuoteOfTheDay";
import "./App.css";
import useLocalStorage from "./hooks/useLocalStorage";"./hooks/useLocalStorage";
import useDebounce from "./hooks/useDebounce";
import usePrevious from "./hooks/usePrevious";

const filterNames = {
  all: "Wszystkie",
  todo: "Do zrobienia",
  done: "Wykonane"
};

function App() {

  useEffect(() => {
    document.title = "Menedżer Zadań";
  }, []);
  
  const renderCount = useRef(0);
  useEffect(() => {
    renderCount.current += 1;
    console.log(`%c[Render App]: ${renderCount.current}`, "color: #4caf50; font-weight: bold");
  });

  const categories = ["Praca", "Dom", "Zakupy", "Inne"];
  
    const [tasks, setTasks] = useLocalStorage('tasks', [
        { id: 1, title: "Kup mleko", completed: false, priority: "high", category: "Zakupy" },
        { id: 2, title: "Posprzątać pokój", completed: true, priority: "medium", category: "Dom" },
        { id: 3, title: "Zadzwonić do taty", completed: false, priority: "low", category: "Inne" },
      ]);

  // Zamiast useState używamy useLocalStorage
  const [filter, setFilter] = useLocalStorage('activeFilter', 'all');
  
  const [categoryFilter, setCategoryFilter] = useState("Wszystkie");

  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300); // Czekamy 300ms

  const prevFilter = usePrevious(filter); // Pobieramy poprzedni stan filtra
  const [filterMessage, setFilterMessage] = useState("");
  const messageTimerRef = useRef(null); // Ref do przechowywania ID timera

  useEffect(() => {
    if (prevFilter !== undefined && prevFilter !== filter) {
      // Pobieramy ładne nazwy ze słownika
      const prevLabel = filterNames[prevFilter] || prevFilter;
      const currentLabel = filterNames[filter] || filter;

      setFilterMessage(`Zmieniono filtr z "${prevLabel}" na "${currentLabel}"`);

      if (messageTimerRef.current) {
        clearTimeout(messageTimerRef.current);
      }

      messageTimerRef.current = setTimeout(() => {
        setFilterMessage("");
      }, 2000);
    }
  }, [filter, prevFilter]);

  const toggleTask = (id) => {
    setTasks(
      tasks.map((task) =>
        task.id === id ? {...task, completed: !task.completed } : task
      )
    );
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter((task) => task.id !== id));
  };

  const addTask = (newTask) => {
    setTasks([...tasks, newTask]);
  };

  const updateTask = (id, newTitle, newCategory) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, title: newTitle, category: newCategory } : task
    ));
  };

  const clearAllTasks = () => {
    if (window.confirm("Napewno chcesz usunąć wszystkie zadania?")) {
      setTasks([]);
    }
  };

  const filteredTasks = tasks
  .filter(task => {
    if (filter === "done") return task.completed;
    if (filter === "todo") return !task.completed;
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
      {/*WYŚWIETLANIE KOMUNIKATU (Jeśli istnieje) */}
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
        <button 
          className="clear-all"
          onClick={clearAllTasks}>Wyczyść</button>
        {/* Filtry priorytetu */}
        <div style={{ marginBottom: "10px" }}>
          <span>Filtruj po priorytecie: </span>
          <button 
            className="priority-all"
            onClick={() => setFilter("all")}>Wszystkie</button>
          <button 
            className="priority-todo"
            onClick={() => setFilter("todo")}>Do zrobienia</button>
          <button 
            className="priority-done"
            onClick={() => setFilter("done")}>Wykonane</button>
        </div>
        {/* Filtry kategorii */}
        <div style={{ marginBottom: "10px" }}>
          <span>Filtruj po kategorii: </span>
          <button 
          className="category-button category-Wszystkie"
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
          />
      </Card>
    </div>
  );
}

export default App;
