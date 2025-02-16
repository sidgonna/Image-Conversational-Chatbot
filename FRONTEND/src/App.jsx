// IMAGE-CONVERSATIONAL-CHATBOT is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// IMAGE-CONVERSATIONAL-CHATBOT is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.

// You should have received a copy of the GNU General Public License
// along with IMAGE-CONVERSATIONAL-CHATBOT.  If not, see <https://www.gnu.org/licenses/>.

import Cookies from 'universal-cookie';
import React, { useState, useEffect } from 'react';
import {
    createBrowserRouter, 
    RouterProvider, 
    useNavigate,
    Navigate
} from "react-router-dom"

import ChangePasswordPage from "./pages/ChangePasswordPage";
import VerifyEmailPage from './components/VerifyEmail';
import SIH from './pages/SIH';
import SignInFormComponent from './components/SignInFormComponent';
import SignUpFormComponent from './components/SignUpFormComponent'; 
import ForgotPasswordPage from './pages/ForgotPasswordPage';

const cookies = new Cookies();

const IsLogin = ({ children, publicOnly }) => {
  const navigate = useNavigate();
  const token = cookies.get("access_token");

  useEffect(() => {
      if (!publicOnly && token) {
          navigate("/chat");
      }
  }, [token, navigate, publicOnly]);
  if (publicOnly && token) {
      return <Navigate to="/chat" />;
  }
  if (publicOnly && !token) {
      return children;
  }
  return null;
};


function App() {
    useEffect(() => {
        if (window.location.hostname.startsWith('www')) {
            const newUrl = window.location.protocol + "//" + window.location.hostname.replace('www.', '') + window.location.pathname + window.location.search;
            window.location.replace(newUrl);
        }
    }, []);

    const router = createBrowserRouter([
        {
            path: "/", 
            element: <IsLogin publicOnly={true}><SignInFormComponent /></IsLogin>
        }, 
        {
            path: "/login", 
            element: <IsLogin publicOnly={true}><SignInFormComponent /></IsLogin>
        },
        {
            path: "/signup", 
            element: <IsLogin publicOnly={true}><SignUpFormComponent /></IsLogin>
        }, 
        {
            path: "/forgot-password", 
            element: <IsLogin publicOnly={true}><ForgotPasswordPage /></IsLogin>
        }, 
        {
            path: "/changePassword", 
            element: <ChangePasswordPage />
        },
        {
            path: "/verifyemail", 
            element: <VerifyEmailPage />
        },
        {
            path: "/chat",
            element: <SIH />
        }
    ]);

    return (
        <RouterProvider router={router} />
    );
}

export default App;