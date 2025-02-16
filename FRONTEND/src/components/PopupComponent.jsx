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
import { useNavigate } from 'react-router-dom';

const cookies = new Cookies();

function PopupComponent({ content, redirectPath, contentType }) {
  const [isPopupComponentOpen, setIsPopupComponentOpen] = useState(true);
  const navigate = useNavigate();

  const closePopupComponent = () => setIsPopupComponentOpen(false);

  const handlePopupUserClick = () => {
    closePopupComponent();
    if (redirectPath) {
      navigate(redirectPath);
      window.location.reload();
    }
  };

  if (!isPopupComponentOpen) return null;

  return (
    <div
      id="popup-modal"
      className="fixed inset-0 z-50 flex items-center justify-center w-screen h-full overflow-x-hidden overflow-y-auto bg-gray-800 bg-opacity-50 "
    >
      <div className="relative p-4 w-full max-w-md max-h-full">
        <div className="relative bg-white rounded-lg shadow ">
          <p className="w-full text-center text-3xl text-primary pt-8 ">
            {contentType}
          </p>
          <div className="p-4 md:p-5 text-center">
            <h3 className="mb-5 text-lg font-normal text-gray-500 ">
              {content}
            </h3>
            <button
              onClick={handlePopupUserClick}
              className="text-white bg-red-600 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300  font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center"
            >
              OK
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PopupComponent;
