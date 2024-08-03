import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Home from './components/home';
import TodoList from './components/TodoList';
import LoginForm from "./components/login"

const App = () => {
  return (
    <Router>
      <Switch>
      <Route exact path="/" component={LoginForm} />
        <Route exact path="/home" component={Home} />
        <Route path="/notes" component={TodoList} />
      </Switch>
    </Router>
  );
};

export default App;
