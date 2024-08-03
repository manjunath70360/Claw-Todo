import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { MdDelete } from "react-icons/md";
import "../home/index.css";
import NavBar from '../Nav';

const TodoList = () => {
  const [todoList, setTodoList] = useState([]);

  useEffect(() => {
    const token = Cookies.get('token');
    if (token) {
      fetchTodos(token);
    }
  }, []);

  const fetchTodos = async (token) => {
    try {
      const response = await axios.get('http://localhost:3000/api/todos', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setTodoList(response.data);
    } catch (error) {
      console.error('Error fetching todos:', error);
    }
  };

  const handleTodoStatusChange = async (id) => {
    const todo = todoList.find(todo => todo.id === id);
    if (!todo) return;

    const updatedTodo = { ...todo, isChecked: !todo.isChecked };
    const token = Cookies.get('token');

    try {
      await axios.put(`http://localhost:3000/api/todos/${id}`, updatedTodo, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setTodoList(todoList.map(todo => (todo.id === id ? updatedTodo : todo)));
    } catch (error) {
      console.error('Error updating todo:', error);
    }
  };

  const handleDeleteTodo = async (id) => {
    const token = Cookies.get('token');

    try {
      await axios.delete(`http://localhost:3000/api/todos/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setTodoList(todoList.filter(todo => todo.id !== id));
    } catch (error) {
      console.error('Error deleting todo:', error);
    }
  };

  return (
    <div className="todos-bg-container">
      <NavBar />
      <div className="container">
        <div className="row">
          <div className="col-12">
            <h1 className="todos-heading">My Todos</h1>
            {todoList.length === 0 ? (
              <p className="empty-list-message">List is empty</p>
            ) : (
              <ul className="todo-items-container">
                {todoList.map(todo => (
                  <li key={todo.id} className="todo-item-container d-flex flex-row">
                    <input
                      type="checkbox"
                      checked={todo.isChecked}
                      onChange={() => handleTodoStatusChange(todo.id)}
                      className="checkbox-input"
                    />
                    <div className={`label-container d-flex flex-row ${todo.isChecked ? 'checked' : ''}`}>
                      <label
                        htmlFor={`checkbox${todo.id}`}
                        className="checkbox-label"
                      >
                        {todo.text}
                      </label>
                      <div className="delete-icon-container">
                        <MdDelete size={20} onClick={() => handleDeleteTodo(todo.id)} />
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TodoList;
