import React from 'react';
import ReactDOM from 'react-dom/client';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate
} from "react-router-dom";
import MainPage from './pages/MainPage';
import LoginPage from './pages/LoginPage';

// include bootstrap css
import 'bootstrap/dist/css/bootstrap.min.css';


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <Router basename="/">
    <Routes>
      <Route exact path="/" element={ <MainPage/> } />
      <Route exact path="/login" element={ <LoginPage/> } />
    </Routes>
  </Router>
);
