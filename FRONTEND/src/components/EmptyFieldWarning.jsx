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

// EmptyFieldWarning.js
const EmptyFieldWarning = ({ children, isEmpty }) => {
  return (
      <div className={`w-full ${isEmpty ? 'border-red-500' : 'border-gray-300'} border rounded-md`}>
          {children}
      </div>
  );
};

export default EmptyFieldWarning;
