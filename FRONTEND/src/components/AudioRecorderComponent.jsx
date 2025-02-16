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
import { useState, useEffect, useRef } from 'react';
import { AudioRecorder, useAudioRecorder } from 'react-audio-voice-recorder';
import tickicon from "../assets/tickicon.png";
import LoadingAudioSubmitionSpinner from "./LoadingAudioSubmitionSpinner";
import { useNavigate } from "react-router-dom";

const cookies = new Cookies();
const BASE_URL  = "";


function AudioRecorderComponent({ questionId, subjectId }) {
  const accesstoken = cookies.get("access_token");
  const navigate = useNavigate();

  const [base64String, setBase64String] = useState(null);
  const [recordingCompleted, setRecordingCompleted] = useState(false);
  const [apiCalled, setApiCalled] = useState(false);
  const [showRecordingNotification, setShowRecordingNotification] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [recordTime, setRecordTime] = useState(0);
  const [interactionDisabled, setInteractionDisabled] = useState(true);
  const minRecordTime = 15; // Minimum record time in seconds to enable interaction
  const noiseTimeoutRef = useRef(null);

  const recorderControls = useAudioRecorder(
    {
      noiseSuppression: true,
      echoCancellation: true,
    },
    (err) => console.table(err)
  );

  const addAudioElement = (blob) => {
    const url = URL.createObjectURL(blob);
    const audio = document.getElementById('recorded_audio');

    audio.src = url;
    audio.controls = true;

    convertBlobToBase64(blob, (base64) => {
      console.log("Base64 String:", base64);
      setBase64String(base64);
      console.log("Audio(base64) :", base64);
    });

    setRecordingCompleted(true);
  };

  const convertBlobToBase64 = (blob, callback) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      callback(reader.result);
    };
    reader.readAsDataURL(blob);
  };

  const handleNextButtonClick = () => {
    if (recordingCompleted && !apiCalled) {
      setIsLoading(true);
      setErrorMessage(null);  // Clear any previous error message
      fetch(`${BASE_URL}/v1/submit-question`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + accesstoken
        },
        body: JSON.stringify({
          "questionId": questionId,
          "subjectId": subjectId,
          "audio": base64String,
        }),
      })
      .then(response => {
        if (!response.ok) {
          if (data.status_code === 498 || data.status_code === 440) {
            cookies.remove('access_token', { path: '/' });
            cookies.remove('user_role', { path: '/' });
            window.location.reload();
        }
      }
        if (response.ok) {
          console.log('API call successful');
          setApiCalled(true);
          navigate(`/feedback?questionId=${questionId}&subjectId=${subjectId}&studentId=${'None'}`);
        } else {
          return response.json().then(data => {
            throw new Error(data.detail);
          });
        }
      })
      .catch(error => {
        console.error('Error:', error);
        setErrorMessage(error.message);
      })
      .finally(() => {
        setIsLoading(false);
      });
    } else if (!recordingCompleted) {
      setShowRecordingNotification(true);
    }
  };

  const analyzeAudioStream = (stream) => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const analyser = audioContext.createAnalyser();
    const source = audioContext.createMediaStreamSource(stream);
    source.connect(analyser);
    analyser.fftSize = 1024;
    const dataArray = new Uint8Array(analyser.fftSize);

    const analyze = () => {
      analyser.getByteTimeDomainData(dataArray);
      const sum = dataArray.reduce((a, b) => a + Math.abs(b - 128), 0);
      const average = sum / dataArray.length;

      // Check if average amplitude is below a certain threshold indicating noise
      if (average < 5) {
        if (!noiseTimeoutRef.current) {
          noiseTimeoutRef.current = setTimeout(() => {
            setIsPaused(true);
            recorderControls.stopRecording();
            clearTimeout(noiseTimeoutRef.current);
            noiseTimeoutRef.current = null;
          }, 15000); // Pause after 10 seconds of continuous noise
        }
      } else {
        if (noiseTimeoutRef.current) {
          clearTimeout(noiseTimeoutRef.current);
          noiseTimeoutRef.current = null;
        }
      }

      if (recorderControls.isRecording) {
        requestAnimationFrame(analyze);
      } else {
        audioContext.close();
      }
    };

    analyze();
  };

  useEffect(() => {
    if (recorderControls.isRecording && !isPaused) {
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
          analyzeAudioStream(stream);
        })
        .catch(err => console.error('Error accessing media devices.', err));
    }
  }, [recorderControls.isRecording, isPaused]);

  // Update the recording time while recording
  useEffect(() => {
    let interval;
    if (recorderControls.isRecording) {
      interval = setInterval(() => {
        setRecordTime((prevTime) => prevTime + 1);
        if (recordTime >= minRecordTime) {
          setInteractionDisabled(false);
          clearInterval(interval);
        }
      }, 1000);
    } else {
      clearInterval(interval);
      setRecordTime(0);  // Reset the record time when recording stops
    }
    return () => clearInterval(interval);
  }, [recorderControls.isRecording, recordTime]);

  return (
    <div className='h-55'>
      <div className="flex items-center justify-center h-full w-full">
        <div>
          {!recorderControls.isRecording && !recordingCompleted && 
            <div className="text-xl p-5 text-gray-400 top text-center">Tap on the <span className='text-1xl text-gray-700'>mic</span> to record</div>
          }
          {!recordingCompleted && (
            <div className='relative flex justify-center'>
              <AudioRecorder
                onRecordingComplete={(blob) => addAudioElement(blob)}
                recorderControls={recorderControls}
                downloadFileExtension="webm"
                showVisualizer={true}
              />
              {recorderControls.isRecording && interactionDisabled && (
                <div className="absolute inset-0 bg-transparent cursor-not-allowed"></div>
              )}
            </div>
          )}
          <div className={recordingCompleted ? "visible" : "hidden"}>
            <div className='p-2 text-gray-400'>Your Recording: </div>
            <audio id='recorded_audio' controls src="/media/cc0-audio/t-rex-roar.mp3"></audio>
          </div>
          {recordingCompleted && (
            <div className='flex p-2 w-full flex-row justify-center items-center'>
              <img className='h-6 m-2' src={tickicon} alt="" />
              <div className='text-xl'>Recorded Successfully</div>
            </div>
          )}
          <br />
          {recorderControls.isRecording && (
            <div className="link text-xl text-red-600 text-center">
              <button 
                className='py-2.5 px-5 me-2 mb-2 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 '
                onClick={recorderControls.stopRecording}
                disabled={interactionDisabled}  // Disable button if interaction is disabled
              >
                Stop recording
              </button>
              <div className="text-sm p-2 text-gray-400 top text-center">Note: Speak/Read <span className='text-1xl text-gray-700'>at least {minRecordTime} sec</span>.</div>
            </div>
          )}
  
          {isLoading ? (
            <div className="absolute bottom-4 right-4 text-white py-2 px-4 rounded bg-gray-900 bg-opacity-80">
              <LoadingAudioSubmitionSpinner />
            </div>
          ) : (
            recordingCompleted && (
              <div className="text-center mb-2">
                <button 
                  className="text-xl text-center inline-flex items-center text-white bg-primary rounded-lg hover:bg-red-800 font-medium rounded-lg px-5 py-2.5 text-center me-2 mb-2 "
                  onClick={handleNextButtonClick}
                >
                  Submit Question
                  <svg className="rtl:rotate-180 w-4.5 h-3.5 ms-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 5h12m0 0L9 1m4 4L9 9"/>
                  </svg>
                </button>
              </div>
            )
          )}
  
          {errorMessage && (
            <div className="error-message text-red-600">{errorMessage}</div>
          )}
        </div>
      </div>
    </div>
  );
}  

export default AudioRecorderComponent;
