export const initialState = {
  tasks: [],
  filter: "all",
  sortBy: "default",
  searchQuery: "",
  category: "all",
  isLoading: false,
  error: null,
  previousTasks: null
};

export const taskReducer = (state, action) => {
  switch (action.type) {
    case "ADD_TASK":
      return {
        ...state,
        previousTasks: state.tasks, // Zapisujemy historię dla Undo
        tasks: [...state.tasks, action.payload]
      };

    case "DELETE_TASK":
      return {
        ...state,
        previousTasks: state.tasks,
        tasks: state.tasks.filter(task => task.id !== action.payload)
      };

    case "TOGGLE_TASK":
      return {
        ...state,
        previousTasks: state.tasks,
        tasks: state.tasks.map(task =>
          task.id === action.payload ? { ...task, completed: !task.completed } : task
        )
      };

    // --- BRAKUJĄCE AKCJE DO DODANIA ---

    case "UPDATE_TASK":
      return {
        ...state,
        previousTasks: state.tasks,
        tasks: state.tasks.map(task =>
          task.id === action.payload.id 
            ? { ...task, title: action.payload.title, category: action.payload.category } 
            : task
        )
      };

    case "UNDO":
      return {
        ...state,
        tasks: state.previousTasks, // Przywracamy poprzedni stan
        previousTasks: null         // Czyścimy historię po użyciu
      };

    case "REORDER_TASKS": {
      const { index, direction } = action.payload;
      const newTasks = [...state.tasks];
      const moveToIndex = direction === 'up' ? index - 1 : index + 1;

      // Sprawdzamy, czy przesunięcie jest możliwe (granice tablicy)
      if (moveToIndex >= 0 && moveToIndex < newTasks.length) {
        [newTasks[index], newTasks[moveToIndex]] = [newTasks[moveToIndex], newTasks[index]];
      }
      return { ...state, tasks: newTasks };
    }

    case "CLEAR_COMPLETED":
      return {
        ...state,
        previousTasks: state.tasks,
        tasks: state.tasks.filter(task => !task.completed)
      };

    // --- KONIEC BRAKUJĄCYCH AKCJI ---

    case "SET_FILTER":
      return { ...state, filter: action.payload };

    case "SET_SEARCH":
      return { ...state, searchQuery: action.payload };

    case "LOAD_TASKS":
      return { ...state, tasks: action.payload };

    default:
      throw new Error(`Nieznana akcja: ${action.type}`);
  }
};