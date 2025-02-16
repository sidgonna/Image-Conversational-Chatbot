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



/* eslint-disable react/prop-types */ // TODO: upgrade to latest eslint tooling
const BigButton = ({id, placeholder, onClickBehavior }) => {
    return (
        <button
            id={id}
            onClick={onClickBehavior}
            className="w-full py-4 bg-green-600 rounded-lg bg-primary text-white hover:bg-red-600" >
            <div className="flex flex-row items-center justify-center">
                <div className="mr-2"> </div>
                <div className="font-bold text-xl">{placeholder} </div>
            </div>
      </button>
    );
  }
  
  export default BigButton;
  