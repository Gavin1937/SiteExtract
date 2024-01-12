import React from 'react';
import ReactDOM from 'react-dom/client';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate
} from "react-router-dom";
import MainPage from './pages/MainPage';

// include bootstrap css
import 'bootstrap/dist/css/bootstrap.css';


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <Router basename="/">
    <Routes>
      <Route exact path="/" element={ <MainPage/> } />
    </Routes>
  </Router>
);
