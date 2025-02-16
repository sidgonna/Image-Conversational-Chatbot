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
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import LoadingScreenLarge from '../components/LodingScreenLarge';
import PopupComponent from '../components/PopupComponent';

const BASE_URL = 'http://127.0.0.1:8000';
const cookies = new Cookies();

function VerifyEmailPage() {
    const navigate = useNavigate();
    const [isReadingResult, setIsReadingResult] = useState(null);
    const [isEmailVerified, setIsEmailVerified] = useState(false);
    const [responseText, setResponseText] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const queryString = window.location.search;
        const urlParams = new URLSearchParams(queryString);
        const token = urlParams.get('token');
        const userId = urlParams.get('userId');

        Get_verifyEmail({ token, userId });
    }, []);

    const Get_verifyEmail = async ({ token, userId }) => {
        try {
            setIsLoading(true);
            const rawResponse = await fetch(`${BASE_URL}/v1/verifyemail/${token}/${userId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const content = await rawResponse.json();
            setIsLoading(false);

            if (rawResponse.ok) {
                setIsEmailVerified(true);

                setResponseText(content.data.msg);
            } else {
                setResponseText(content.detail);
            }
        } catch (error) {
            console.error('Error:', error);
            setIsLoading(false);
            setResponseText('An error occurred while verifying your email.');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg">
                {isLoading && <LoadingScreenLarge />}
                {!isLoading && <PopupComponent content={responseText} redirectPath={'/'} contentType={"Email Verification Status"}/>}
            </div>
        </div>
    );
}

export default VerifyEmailPage;
