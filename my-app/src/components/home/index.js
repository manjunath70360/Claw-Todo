import React, { useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { toast } from 'react-toastify'; 
import './index.css';
import NavBar from '../Nav';

const Home = ({ onTodoAdded }) => {
  const [textInput, setTextInput] = useState('');

  const handleAddTodo = async () => {
    if (textInput.trim() === '') {
      toast.error('Enter Valid Text');
      return;
    }

    const token = Cookies.get('token');

    const newTodo = {
      text: textInput,
      isChecked: false,
    };

    try {
      await axios.post('http://localhost:3000/api/todos', newTodo, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setTextInput('');
      toast.success('Added Successfully');
      if (onTodoAdded) onTodoAdded(); // Notify parent component
    } catch (error) {
      console.error('Error adding todo:', error);
      toast.error('Error adding todo');
    }
  };

  return (
    <div className="todos-bg-container">
      <NavBar />
      <div className='container'>
        <h1 className='todos-heading'>Create Todo</h1>
        <textarea
          cols={8}
          rows={8}
          value={textInput}
          className='todo-user-input'
          onChange={(e) => setTextInput(e.target.value)}
          placeholder="What needs to be done?"
        />
        <button className='button' onClick={handleAddTodo}>Add Todo</button>

      </div>
    </div>
  );
};

export default Home;
