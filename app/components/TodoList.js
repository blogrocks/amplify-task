import React, { useState } from 'react';

const TodoList = ({ groupName, todos, onAddTodo }) => {
  const [newTodo, setNewTodo] = useState('');

  const handleAddClick = () => {
    onAddTodo(newTodo);
    setNewTodo('');
  };

  return (
    <div className="todo-list">
      <h1>{groupName}</h1>
      <div className="add-todo">
        <button onClick={handleAddClick}>+ new</button>
        <input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="Enter a new todo"
        />
      </div>
      <ul>
        {todos.map((todo, index) => (
          <li key={index}>{todo}</li>
        ))}
      </ul>
    </div>
  );
};

export default TodoList;
