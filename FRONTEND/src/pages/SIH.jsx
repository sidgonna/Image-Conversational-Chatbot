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

import React, { useState, useEffect, useRef } from 'react'
import { Upload, Send, Loader2, X, LogOut } from "lucide-react"
import AudioRecorderComponent from '../components/AudioRecorderComponent'
import Cookies from 'universal-cookie';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

const cookies = new Cookies();

export default function MultilingualVoiceChatbot() {
  const navigate = useNavigate();
  const accesstoken = cookies.get("access_token");
  useEffect(() => {
    if (!accesstoken || accesstoken === "undefined") {
      navigate('/login'); 
    }
  }, [accesstoken, navigate]);

  const [uploadedImages, setUploadedImages] = useState([])
  const [uploadResponse, setUploadResponse] = useState({ original: '', translated: '' })
  const [query, setQuery] = useState('')
  const [chatHistory, setChatHistory] = useState([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [hasInteracted, setHasInteracted] = useState(false)
  const [activeTab, setActiveTab] = useState('original')
  const chatBoxRef = useRef(null)
  const fileInputRef = useRef(null)

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight
    }
  }, [uploadResponse, chatHistory])

  const renderMarkdown = (content) => {
    return (
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({node, inline, className, children, ...props}) {
            const match = /language-(\w+)/.exec(className || '')
            return !inline && match ? (
              <SyntaxHighlighter
                style={vscDarkPlus}
                language={match[1]}
                PreTag="div"
                {...props}
              >
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            ) : (
              <code className={className} {...props}>
                {children}
              </code>
            )
          }
        }}
      >
        {content}
      </ReactMarkdown>
    )
  }

  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files)
    setUploadedImages((prevImages) => [...prevImages, ...files])
    alert(`${files.length} image(s) uploaded successfully.`)
    
    // Clear chat history and reset hasInteracted state
    setChatHistory([])
    setHasInteracted(false)
    setUploadResponse({ original: '', translated: '' })
  }

  const getBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result.split(',')[1])
      reader.onerror = (error) => reject(error)
    })
  }

  const Embed = async (text) => {
    try {
      const response = await fetch('http://localhost:8000/embed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + accesstoken
        },
        body: JSON.stringify({ text }),
      })
    } catch (error) {
      console.error('Embedding error:', error)
    }
  }

  const translateText = async (text) => {
    try {
      const response = await fetch('http://localhost:8000/translate/telugu/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + accesstoken
        },
        body: JSON.stringify({ text }),
      })
      const data = await response.json()
      return data.translated_text
    } catch (error) {
      console.error('Translation error:', error)
      return ''
    }
  }

  const handleImageProcess = async () => {
    if (isProcessing || uploadedImages.length === 0) return
    setIsProcessing(true)
    setUploadResponse({ original: '', translated: '' })
    try {
      const base64Strings = await Promise.all(uploadedImages.map(getBase64))
      const response = await fetch('http://localhost:8000/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + accesstoken
        },
        body: JSON.stringify({ base64: base64Strings }),
      })

      const reader = response.body.getReader()
      const decoder = new TextDecoder()

      let fullResponse = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value)
        fullResponse += chunk
        setUploadResponse((prevResponse) => ({ ...prevResponse, original: fullResponse }))
      }
      const embedResponse = await Embed(fullResponse)
      const translatedText = await translateText(fullResponse)
      setUploadResponse((prevResponse) => ({ ...prevResponse, translated: translatedText }))

      setUploadedImages([])
    } catch (error) {
      alert("Failed to process images.")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleQuerySubmit = async () => {
    if (!query.trim() || isProcessing) return
    setIsProcessing(true)
    if (!hasInteracted) {
      setHasInteracted(true)
      setUploadResponse({ original: '', translated: '' })
    }

    setChatHistory((prevHistory) => [...prevHistory, { role: 'user', content: query }])
    setQuery('')

    try {
      const response = await fetch('http://localhost:8000/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + accesstoken
        },
        body: JSON.stringify({ query: query }),
      })

      const reader = response.body.getReader()
      const decoder = new TextDecoder()

      let fullResponse = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value)
        fullResponse += chunk
        setChatHistory((prevHistory) => {
          const newHistory = [...prevHistory]
          if (newHistory[newHistory.length - 1].role === 'ai') {
            newHistory[newHistory.length - 1].content = { original: fullResponse, translated: '' }
          } else {
            newHistory.push({ role: 'ai', content: { original: fullResponse, translated: '' } })
          }
          return newHistory
        })
      }

      const translatedText = await translateText(fullResponse)
      setChatHistory((prevHistory) => {
        const newHistory = [...prevHistory]
        newHistory[newHistory.length - 1].content.translated = translatedText
        return newHistory
      })
    } catch (error) {
      alert("Failed to generate response.")
    } finally {
      setIsProcessing(false)
    }
  }

  const removeImage = (index) => {
    setUploadedImages((prevImages) => prevImages.filter((_, i) => i !== index))
  }

  const handleLogout = () => {
    cookies.remove('access_token', { path: '/' });
    navigate('/login');
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <header className="bg-blue-600 text-white shadow-md p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Image Conversational Chatbot</h1>
        <button
          onClick={handleLogout}
          className="bg-white text-blue-600 hover:bg-blue-100 px-4 py-2 rounded-md text-sm font-medium flex items-center"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </button>
      </header>
      <main className="flex-1 overflow-hidden p-4">
        <div className="max-w-4xl mx-auto h-full flex flex-col space-y-4">
          <div className="bg-white rounded-lg shadow-md p-4">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              multiple
              className="hidden"
            />
            <div className="flex space-x-2">
              <button
                onClick={() => fileInputRef.current.click()}
                className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition duration-200 flex items-center justify-center"
              >
                <Upload className="mr-2 h-4 w-4" /> Upload Images
              </button>
              <button
                onClick={handleImageProcess}
                className={`w-full py-2 px-4 rounded transition duration-200 flex items-center justify-center ${
                  isProcessing || uploadedImages.length === 0
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-green-500 text-white hover:bg-green-600'
                }`}
                disabled={isProcessing || uploadedImages.length === 0}
              >
                {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Process Images'}
              </button>
            </div>
            
            {uploadedImages.length > 0 && (
              <div className="mt-4">
                <h3 className="text-lg font-semibold mb-2">Uploaded Images:</h3>
                <div className="grid grid-cols-3 gap-2">
                  {uploadedImages.map((img, index) => (
                    <div key={index} className="relative">
                      <img
                        src={URL.createObjectURL(img)}
                        alt={`Uploaded image ${index + 1}`}
                        className="w-full h-32 object-cover rounded"
                      />
                      <button
                        className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition duration-200"
                        onClick={() => removeImage(index)}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <div className="flex-1 overflow-auto" ref={chatBoxRef}>
            {!hasInteracted && (uploadResponse.original || uploadResponse.translated) && (
              <div className="bg-white rounded-lg shadow-md mb-4 p-4">
                <h3 className="text-lg font-semibold mb-2">Image Analysis:</h3>
                <div className="mb-2">
                  <button
                    className={`mr-2 px-3 py-1 rounded ${activeTab === 'original' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                    onClick={() => setActiveTab('original')}
                  >
                    Original
                  </button>
                  <button
                    className={`px-3 py-1 rounded ${activeTab === 'translated' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                    onClick={() => setActiveTab('translated')}
                  >
                    Telugu
                  </button>
                </div>
                <div>
                  {renderMarkdown(activeTab === 'original' ? uploadResponse.original : uploadResponse.translated)}
                </div>
              </div>
            )}
            {chatHistory.map((msg, index) => (
              <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} mb-4`}>
                <div className={`max-w-[80%] rounded-lg p-3 ${msg.role === 'user' ? 'bg-blue-500 text-white' : 'bg-white shadow-md'}`}>
                  {msg.role === 'user' ? (
                    <p>{msg.content}</p>
                  ) : (
                    <div>
                      <div className="mb-2">
                        <button
                          className={`mr-2 px-3 py-1 rounded ${activeTab === 'original' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                          onClick={() => setActiveTab('original')}
                        >
                          Original
                        </button>
                        <button
                          className={`px-3 py-1 rounded ${activeTab === 'translated' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                          onClick={() => setActiveTab('translated')}
                        >
                          Telugu
                        </button>
                      </div>
                      <div>
                        {renderMarkdown(activeTab === 'original' ? msg.content.original : msg.content.translated)}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      <footer className="bg-white shadow-md p-4">
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="Ask a question..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleQuerySubmit()}
              className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isProcessing}
            />
            <button
              onClick={handleQuerySubmit}
              disabled={isProcessing || !query.trim()}
              className={`px-4 py-2 rounded-md flex items-center ${
                isProcessing || !query.trim()
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              <Send className="mr-2 h-4 w-4" /> Send
            </button>
          </div>
          {/* <AudioRecorderComponent questionId="1" subjectId="1" /> */}
        </div>
      </footer>
    </div>
  )
}