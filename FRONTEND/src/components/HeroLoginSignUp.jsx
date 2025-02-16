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

import logo450 from "../assets/logo_450x450.png"
import coinicon from '../assets/coin.webp'; 


function HeroLoginSignUp() {
  return (
        <div className="flex lg:my-0 my-10  flex-col w-full">

            <div className="flex flex-items items-center">

              <img className=" lg:h-44 lg:w-44 w-24 h-24 m-2 " src={logo450} alt="" />

              <div className="text-start">
                  {/* Title Text */}
                  <p className="w-3/4 lg:text-6xl text-3xl mx-4 mb-2 md:mx-1 font-bold text-gray-800">

                  </p>
                  {/* Description Text */}
                  <p className="w-3/4 mx-4 md:mx-1 text-gray-500 mb-2">
                  
                  </p>

              </div>

            </div>
        </div>
  )
}

export default HeroLoginSignUp