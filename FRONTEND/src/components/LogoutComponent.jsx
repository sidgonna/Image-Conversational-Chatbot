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

import React, { useState } from 'react';
import Cookies from 'universal-cookie';

const cookies = new Cookies();

function LogoutComponent() {
  const [isLogoutComponentOpen, setIsLogoutComponentOpen] = useState(false);

  const openLogoutComponent = () => setIsLogoutComponentOpen(true);
  const closeLogoutComponent = () => setIsLogoutComponentOpen(false);

  const handleLogoutUserClick = () => {
    closeLogoutComponent();
    console.log("User Logout :(");
    cookies.remove('access_token', { path: '/' });
    cookies.remove('user_role', { path: '/' });
    window.location.reload();
  };

  return (
    <div>
      {/* Button to open the logout component */}
      <button
        className="w-screen px-4 py-1"
        onClick={openLogoutComponent}
        type="button"
      >
        <div className="flex items-center justify-start">
          <img
            className="h-6"
            src="https://cdn0.iconfinder.com/data/icons/thin-line-color-2/21/05_1-512.png"
            alt="Logout Icon"
          />
          <p className="px-2">LOGOUT</p>
        </div>
      </button>

      {/* Conditional rendering of the logout component */}
      {isLogoutComponentOpen && (
        <div
          id="logout-modal"
          className="fixed inset-0 z-50 flex items-center justify-center w-screen h-full overflow-x-hidden overflow-y-auto bg-gray-800 bg-opacity-50 "
        >
          <div className="relative p-4 w-full max-w-md max-h-full">
            <div className="relative bg-white rounded-lg shadow ">
              <button
                type="button"
                onClick={closeLogoutComponent}
                className="absolute top-3 end-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center "
              >
                <svg
                  className="w-3 h-3"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 14 14"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                  />
                </svg>
                <span className="sr-only">Close modal</span>
              </button>
              <div className="p-4 md:p-5 text-center">
                <h3 className="mb-5 text-lg font-normal text-gray-500 ">
                  Are you sure you want to log out?
                </h3>
                <button
                  onClick={handleLogoutUserClick}
                  className="text-white bg-red-600 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300  font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center"
                >
                  Yes, Log me out
                </button>
                <button
                  onClick={closeLogoutComponent}
                  className="py-2.5 px-5 ms-3 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 "
                >
                  No, cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LogoutComponent;
