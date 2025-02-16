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

// eslint-disable-next-line react/prop-types
import React from 'react';
function ContextPopupCard({ JsonResult , idx}) {
    
    const totalWordPhonemesArray = JsonResult.word_phonemes;

    var data;

    totalWordPhonemesArray.forEach((obj, i) => {

        const key = Object.keys(obj)[0];
        
        // console.log("key : ", key);
        if (Number(key) === Number(idx)) {
            console.log("ContextPopupCard :obj: ", totalWordPhonemesArray[i]);
            data =  Object.values(totalWordPhonemesArray[i]);
        }
    });


    // Extract the key and the array of phoneme objects
    const key = Object.keys(data)[0];
    const phonemeData = data[key];

    return (
        <div className='context_popup_card p-2 border border-gray-300 shadow-sm'>
            <div className='flex flex-wrap items-center'>
                {phonemeData.map((phonemeObj, index) => {
                    const phoneme = Object.keys(phonemeObj)[0];
                    const value = phonemeObj[phoneme];
                    return (
                        <div key={index} className='flex flex-col items-center px-1 rounded-lg flex-wrap'>
                            <div className='font-bold text-xs'>{phoneme}</div>
                            <div className='text-gray-600 text-xs'>{value}</div>
                        </div>
                    );   
                })}
            </div>
        </div>
    );
}

export default ContextPopupCard;
