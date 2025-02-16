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

/* eslint-disable react/prop-types */
import { useLocation } from 'react-router-dom';
import { useState } from 'react';
import InputBox from "../components/InputBox";
import BigButton from "../components/BigButton";
import EmptyFieldWarning from '../components/EmptyFieldWarning';
import BottomToast from '../components/BottomToast';
import PopupComponent from '../components/PopupComponent';
import LoadingScreenLarge from '../components/LodingScreenLarge';


const BASE_URL  = "http://127.0.0.1:8000";

function ChangePasswordComponent() {
   
   const [changePasswordResponseData, setChangePasswordResponseData] = useState(null);
   const [changePasswordErrorData, setChangePasswordErrorData] = useState(null);
   const [isRetypePasswordEmpty, setIsRetypePasswordEmpty] = useState(false);
   const [isPasswordEmpty, setIsPasswordEmpty] = useState(false);
   const [passwordError, setPasswordError] = useState(null);
   const [isLoading, setIsLoading] = useState(null);
  
   const location = useLocation();
   const params = new URLSearchParams(location.search);
   const token = params.get('token');


   const postData = async (event) => {
       event.preventDefault();
       const newpassword = document.getElementById('newpassword').value;
       const retypenewpassword = document.getElementById('retypenewpassword').value;
       const passwordPattern = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+[\]{};':"\\|,.<>/?`~]).{8,}$/;


       // Check if any input is empty
       setIsRetypePasswordEmpty(retypenewpassword === '');
       setIsPasswordEmpty(newpassword === '');


       if (retypenewpassword === '' || newpassword === '') {
           return; // Exit early if any input is empty
       }


       if (newpassword !== retypenewpassword) {
           setPasswordError('Passwords do not match.');
           return;
       }


       // Validate password
       if (!passwordPattern.test(newpassword)) {
           if (newpassword.length < 8) {
               setPasswordError('Password must be at least 8 characters long.');
           } else if (!/[A-Z]/.test(newpassword)) {
               setPasswordError('Password must contain at least one uppercase letter.');
           } else if (!/\d/.test(newpassword)) {
               setPasswordError('Password must contain at least one digit.');
           } else if (!/[!@#$%^&*()_+[\]{};':"\\|,.<>/?`~]/.test(newpassword)) {
               setPasswordError('Password must contain at least one special character.');
           }
           return;
       } else {
           setPasswordError(null);
       }


       try {
        setIsLoading(1);
           const response = await fetch(`${BASE_URL}/v1/change-password`, {
               method: 'POST',
               headers: {
                   'Accept': 'application/json',
                   'Content-Type': 'application/json',
                   'Authorization': `Bearer ${token}`
               },
               body: JSON.stringify({
                   "password": newpassword
               })
           });
           const content = await response.json();


           if (response.ok) {
            setIsLoading(0);
               setChangePasswordResponseData(content.data.msg);
           } else {
               setChangePasswordErrorData(content.detail || 'Password change failed');
           }
       } catch (error) {
        setIsLoading(0);
           setChangePasswordErrorData('Network error: ' + error.message);
       }
   };


   return (




       <div className="antialiased bg-gradient-to-br from-green-100 to-white">
           <div className="container px-10 mx-auto">
               <div className="flex flex-col text-center md:text-left md:flex-row h-screen justify-evenly md:items-center">
                   <div className="w-full md:w-full lg:w-6/12 mx-auto md:mx-0">
                       <div className="bg-white p-10 flex flex-col w-full shadow-xl rounded-xl">


                           <form className="" onSubmit={postData}>
                               <div className="text-2xl text-gray-800 text-left mb-5">
                                   <span className='text-3xl font-bold text-green-800'>Change Password</span>
                               </div>


                               <div id="input" className="flex flex-col w-full my-5">
                                  
                                  
                                   <InputBox
                                       type="password"
                                       label="New Password"
                                       id="newpassword"
                                       placeholder="Enter your new password"
                                   />
                                  
                                   {isPasswordEmpty && <EmptyFieldWarning emptyfield="New Password" />}


                                   <InputBox
                                       type="password"
                                       label="Retype New Password"
                                       id="retypenewpassword"
                                       placeholder="Retype your new password"
                                   />


                                   {isRetypePasswordEmpty && <EmptyFieldWarning emptyfield="Retype New Password" />}
                                   {passwordError && <div className='text-1xl text-red-500'>{passwordError}</div>}


                                   {changePasswordResponseData && <PopupComponent content={changePasswordResponseData} contentType={"Change Password Status"} redirectPath={"/"}/>}
                                   {changePasswordErrorData && <div className='text-1xl text-red-500 text-center'>*{changePasswordErrorData}</div>}
                                   {isLoading ? <LoadingScreenLarge /> : null }
                              
                               </div>


                               <BigButton id="button" type="submit" placeholder="CHANGE PASSWORD" />
                           </form>
                          
                       </div>
                   </div>
               </div>
           </div>
       </div>


   );
}


export default ChangePasswordComponent;


