import { useState } from "react";

export default function SenAI() {
  const [fontSize, setFontSize] = useState(18);
  const [message, setMessage] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [showTips, setShowTips] = useState(false);
  const [showPasteModal, setShowPasteModal] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [helpTab, setHelpTab] = useState("steps"); // steps or video
  const [isSpeaking, setIsSpeaking] = useState(false);

  // chat assistant state
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    {
      from: "bot",
      text: "hi! i'm your safety assistant. i can help you understand how to use senai, learn about scams, or answer any questions. how can i help you today?",
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
const analyzeMessage = async () => {
  if (!message.trim()) return;
  setLoading(true);

  try {
    const API_URL =
      window.location.hostname === "localhost"
        ? "http://localhost:8000/analyze"
        : "https://senai-backend.onrender.com/analyze";

    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: message }),
    });

    const data = await response.json();
    setResult(data);
  } catch (error) {
    alert("AI backend is currently offline.");
  } finally {
    setLoading(false);
  }
};

  const speakResult = () => {
    if (!result) return;

    // treat as stop button if already speaking
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const text = `Verdict: ${result.verdict}. Confidence ${result.confidence} percent. ${result.reason}`;
    const speech = new SpeechSynthesisUtterance(text);
    speech.rate = 0.9;

    speech.onend = () => setIsSpeaking(false);
    speech.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(speech);
  };

  const stopSpeech = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  const sendChatMessage = async () => {
    const trimmed = chatInput.trim();
    if (!trimmed || chatLoading) return;

    const userMsg = { from: "user", text: trimmed };
    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput("");
    setChatLoading(true);

    try {
      const res = await fetch("http://localhost:8000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: trimmed }),
      });

      const data = await res.json();
      const replyText =
        (data && data.reply) ||
        "sorry, i couldn't answer that right now. please try again in a bit.";

      const botMsg = { from: "bot", text: replyText };
      setChatMessages((prev) => [...prev, botMsg]);
    } catch {
      const botMsg = {
        from: "bot",
        text: "sorry, something went wrong talking to the server.",
      };
      setChatMessages((prev) => [...prev, botMsg]);
    } finally {
      setChatLoading(false);
    }
  };

  const verdict = result?.verdict;
  const isScam = verdict === "SCAM";
  const isSuspicious = verdict === "SUSPICIOUS";
  const isSafe = verdict === "SAFE";

  const displayVerdict = isScam ? "UNSAFE" : verdict || "";

  const cardBorder =
    isScam
      ? "bg-red-50 border-red-300 dark:bg-red-950/40 dark:border-red-800"
      : isSuspicious
      ? "bg-yellow-50 border-yellow-300 dark:bg-yellow-950/40 dark:border-yellow-800"
      : "bg-green-50 border-green-300 dark:bg-green-950/40 dark:border-green-800";

  const iconBg =
    isScam
      ? "bg-red-500"
      : isSuspicious
      ? "bg-yellow-500"
      : "bg-green-500";

  const tipText = isScam
    ? "Always verify suspicious messages by contacting the sender through official channels. never rush to respond, even if the message seems urgent."
    : isSuspicious
    ? "This message has some concerning signs. Double-check links and requests for money or personal details before you reply."
    : "Even messages that seem safe should be approached carefully. Never share passwords, social security numbers, or banking information unless you initiated the contact.";

  return (
    <div className={darkMode ? "dark" : ""}>
      <div
        className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
        style={{ fontSize: `${fontSize}px` }} // scale whole ui
      >
        {/* header */}
        <header className="border-b border-gray-300 dark:border-gray-700 py-4">
          <div className="max-w-4xl mx-auto flex justify-between items-center px-4">
            {/* logo */}
            <div className="flex items-center space-x-3">
              <img src="/senai.png" className="w-10 h-10" alt="SenAI logo" />
              <h1 className="text-3xl font-bold bg-gradient-to-r from-[#3BA0F2] to-[#4DE2C3] bg-clip-text text-transparent">
                SenAI
              </h1>
            </div>

            {/* top-right controls */}
            <div className="flex items-center space-x-3">
              {/* tips */}
              <button
                onClick={() => setShowTips(true)}
                className="px-4 py-2 rounded-xl bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-white text-sm font-medium"
              >
                Tips
              </button>

              {/* about */}
              <button
                onClick={() => setShowAboutModal(true)}
                className="px-4 py-2 rounded-xl bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-white text-sm font-medium"
              >
                About
              </button>

              {/* help */}
              <button
                onClick={() => {
                  setHelpTab("steps");
                  setShowPasteModal(true);
                }}
                className="px-4 py-2 rounded-xl bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-white text-sm font-medium"
              >
                Help
              </button>

              {/* dark / light */}
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="px-4 py-2 rounded-xl bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-white text-sm font-medium"
              >
                {darkMode ? "Light" : "Dark"}
              </button>

              {/* text size */}
              <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-full px-3 py-1 border border-gray-200 dark:border-gray-700 text-xs font-medium">
                <button
                  onClick={() => setFontSize((s) => Math.max(14, s - 2))}
                  className="px-2 py-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                >
                  A-
                </button>
                <span className="px-2 border-l border-r border-gray-200 dark:border-gray-700 mx-1">
                  {fontSize}px
                </span>
                <button
                  onClick={() => setFontSize((s) => Math.min(28, s + 2))}
                  className="px-2 py-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                >
                  A+
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* banner */}
        <div className="text-center py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-b">
          ⛉ Your privacy is protected. No login required. Messages are analyzed
          securely on your device.
        </div>

        {/* main */}
        <main className="max-w-2xl mx-auto px-6 py-10">
          <h2
            className="
              text-2xl font-semibold text-center mb-8 
              text-transparent bg-clip-text 
              bg-gradient-to-r from-[#3BA0F2] to-[#4DE2C3]
            "
          >
            Your Personal Scam Detector. Check Your Message Safely
          </h2>

          {/* input card */}
          <div className="rounded-xl p-6 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 shadow-sm text-center">
            <h3 className="text-lg font-semibold mb-3">
              Simply paste any message below and we'll help you understand if
              it's safe. Take your time, we're here to help.
            </h3>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Paste your message here…"
              className="w-full min-h-[110px] p-4 rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-sky-400"
            />
            <p className="text-gray-500 dark:text-gray-400 mt-3">
              Then click “Analyze Message”
            </p>
          </div>

          {/* analyze button */}
          <button
            disabled={loading || !message.trim()}
            onClick={analyzeMessage}
            className="
              w-full py-4 mt-6 rounded-xl font-semibold text-white
              bg-gradient-to-r from-[#3BA0F2] to-[#4DE2C3]
              hover:opacity-90 transition disabled:opacity-40 disabled:cursor-not-allowed
            "
          >
            {loading ? "Analyzing…" : "Analyze Message"}
          </button>

          {/* results */}
          {result && (
            <div
              className={`mt-10 rounded-2xl p-6 border shadow-sm ${cardBorder}`}
            >
              {/* verdict row */}
              <div className="flex items-start mb-6">
                <div
                  className={`w-14 h-14 rounded-full flex items-center justify-center text-white text-3xl mr-4 ${iconBg}`}
                >
                  {isScam ? "❕" : "⛉"}
                </div>

                <div>
                  <h3 className="text-3xl font-bold tracking-wide">
                    {displayVerdict}
                  </h3>
                  <p className="mt-1 font-semibold">
                    Confidence: {result.confidence}%
                  </p>
                  {isScam && (
                    <p className="mt-1 text-sm text-red-700 dark:text-red-300">
                      Warning! This message may be unsafe.
                    </p>
                  )}
                  {isSuspicious && !isScam && (
                    <p className="mt-1 text-sm text-yellow-800 dark:text-yellow-200">
                      This message has some warning signs. Please be careful.
                    </p>
                  )}
                  {isSafe && (
                    <p className="mt-1 text-sm text-green-800 dark:text-green-200">
                      No scam patterns detected, but still use caution.
                    </p>
                  )}
                </div>
              </div>

              {/* what we found */}
              <div
                className={`
                  rounded-xl p-4 mb-4 border 
                  ${
                    isScam
                      ? "bg-red-100 border-red-300 dark:bg-red-900/40 dark:border-red-700"
                      : isSuspicious
                      ? "bg-yellow-100 border-yellow-300 dark:bg-yellow-900/40 dark:border-yellow-700"
                      : "bg-green-100 border-green-300 dark:bg-green-900/40 dark:border-green-700"
                  }
                `}
              >
                <div className="font-semibold mb-1">What we found:</div>
                <div>{result.reason}</div>
              </div>

              {/* flagged chips */}
              {(isScam || isSuspicious) && result.triggered?.length > 0 && (
                <div className="rounded-xl p-4 mb-4 bg-red-50 border border-red-200 dark:bg-red-950/40 dark:border-red-700">
                  <div className="font-semibold mb-2">❕ Flagged content:</div>
                  <div className="flex flex-wrap gap-2">
                    {result.triggered.map((r, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 rounded-full bg-white/80 dark:bg-red-900 text-sm border border-red-200 dark:border-red-700"
                      >
                        {r}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* tip */}
              <div className="rounded-xl p-4 bg-white/70 dark:bg-black/20 border border-gray-200 dark:border-gray-700 flex items-start space-x-3">
                <div className="mt-1 text-yellow-500">💡</div>
                <div>
                  <div className="font-semibold mb-1">Helpful tip</div>
                  <div>{tipText}</div>
                </div>
              </div>

              {/* tts */}
              <div className="mt-6 flex items-center gap-3">
                <button
                  onClick={speakResult}
                  className={`
                    inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full text-sm font-semibold
                    border transition
                    ${
                      isSpeaking
                        ? "bg-red-500 text-white border-teal-300 shadow-md"
                        : "bg-white text-gray-900 border-gray-300 hover:bg-teal-500 hover:text-white hover:border-teal-500"
                    }
                  `}
                >
                  <span>{isSpeaking ? "🔇" : "🔊"}</span>
                  <span>{isSpeaking ? "Stop Reading" : "Read Aloud"}</span>
                </button>

                {isSpeaking && (
                  <button
                    onClick={stopSpeech}
                    className="text-sm text-gray-600 underline"
                  >
                    {/* stop now */}
                  </button>
                )}
              </div>
            </div>
          )}
        </main>

        {/* chat button bottom-right */}
        <div className="fixed bottom-6 right-6 z-40">
          <button
            onClick={() => setShowChat(true)}
            className="flex items-center gap-3 px-5 py-3 rounded-full shadow-lg bg-gradient-to-r from-[#3BA0F2] to-[#4DE2C3] text-white font-semibold hover:shadow-xl hover:opacity-95 transition"
          >
            <span className="w-7 h-7 rounded-full border border-white flex items-center justify-center text-sm">
              💬
            </span>
            <span>AI Assistant</span>
          </button>
        </div>

        {/* chat drawer overlay */}
        {showChat && (
          <div className="fixed inset-0 z-50 flex justify-end items-end sm:items-center bg-black/20">
            <div className="w-full max-w-md mr-4 mb-24 sm:mb-8">
              <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col max-h-[80vh]">
                {/* chat header */}
                <div className="px-5 py-4 rounded-t-3xl bg-gradient-to-r from-[#3BA0F2] to-[#4DE2C3] text-white flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full border border-white flex items-center justify-center">
                      💬
                    </div>
                    <div>
                      <div className="font-semibold">AI Assistant</div>
                      <div className="text-xs opacity-90">
                        Always here to help
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowChat(false)}
                    className="text-xl leading-none hover:opacity-80"
                  >
                    ×
                  </button>
                </div>

                {/* chat messages */}
                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-gray-50 dark:bg-gray-950/40">
                  {chatMessages.map((m, i) => {
                    const isUser = m.from === "user";
                    return (
                      <div
                        key={i}
                        className={`flex ${
                          isUser ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                            isUser
                              ? "bg-gradient-to-r from-[#3BA0F2] to-[#4DE2C3] text-white"
                              : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                          }`}
                        >
                          {m.text}
                        </div>
                      </div>
                    );
                  })}
                  {chatLoading && (
                    <div className="flex justify-start">
                      <div className="max-w-[70%] rounded-2xl px-4 py-3 text-sm bg-gray-100 dark:bg-gray-800 text-gray-500">
                        thinking…
                      </div>
                    </div>
                  )}
                </div>

                {/* chat input */}
                <div className="border-t border-gray-200 dark:border-gray-800 px-4 py-3 bg-white dark:bg-gray-900 rounded-b-3xl">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      sendChatMessage();
                    }}
                    className="space-y-2"
                  >
                    <div className="flex items-center gap-2">
                      <textarea
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        placeholder="Ask me anything…"
                        rows={1}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            sendChatMessage();
                          }
                        }}
                        className="flex-1 resize-none rounded-2xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
                      />
                      <button
                        type="submit"
                        disabled={!chatInput.trim() || chatLoading}
                        className="w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-r from-[#3BA0F2] to-[#4DE2C3] text-white shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        ✈
                      </button>
                    </div>
                    <div className="text-[10px] text-gray-500 dark:text-gray-400 text-center">
                      Press Enter to send, Shift+Enter for new line
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* help modal */}
      {showPasteModal && (
        <div
          className="fixed inset-0 z-40 bg-black/40 flex items-center justify-center p-4 
          text-gray-900 dark:text-white"
        >
          <div className="bg-white dark:bg-gray-900 rounded-3xl max-w-xl w-full shadow-xl relative border border-gray-200 dark:border-gray-700">
            {/* close */}
            <button
              onClick={() => setShowPasteModal(false)}
              className="absolute right-4 top-4 text-2xl text-gray-500 hover:text-gray-700 dark:text-gray-400"
            >
              ✕
            </button>

            <div className="px-6 pt-6 pb-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold">
                How to Copy and Paste Messages
              </h2>
            </div>

            {/* help tabs */}
            <div className="px-6 pt-4">
              <div className="flex bg-gray-100 dark:bg-gray-800 rounded-full p-1">
                <button
                  onClick={() => setHelpTab("steps")}
                  className={`flex-1 py-2 rounded-full text-sm font-semibold ${
                    helpTab === "steps"
                      ? "bg-white dark:bg-gray-900 shadow text-gray-900 dark:text-white"
                      : "text-gray-600 dark:text-gray-300"
                  }`}
                >
                  Step-by-Step
                </button>
                <button
                  onClick={() => setHelpTab("video")}
                  className={`flex-1 py-2 rounded-full text-sm font-semibold ${
                    helpTab === "video"
                      ? "bg-white dark:bg-gray-900 shadow text-gray-900 dark:text-white"
                      : "text-gray-600 dark:text-gray-300"
                  }`}
                >
                  Watch Video
                </button>
              </div>
            </div>

            {/* help body */}
            <div className="px-6 pb-6 pt-4 max-h-[70vh] overflow-y-auto">
              {helpTab === "steps" ? (
                <>
                  {/* phone section */}
                  <div className="flex items-start gap-4 p-4 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 mb-4">
                    <div className="w-12 h-12 rounded-full bg-sky-100 dark:bg-sky-900 flex items-center justify-center text-2xl">
                      ☏
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">From Your Phone</h3>
                      <ol className="list-decimal list-inside space-y-1 text-sm">
                        <li>Open the text message or email.</li>
                        <li>Press and hold on the message text.</li>
                        <li>Tap “Copy” from the menu.</li>
                        <li>
                          Return to SenAI and tap &amp; hold in the text box.
                        </li>
                        <li>Tap “Paste” to insert the message.</li>
                      </ol>
                    </div>
                  </div>

                  {/* computer section */}
                  <div className="flex items-start gap-4 p-4 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 mb-4">
                    <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center text-2xl">
                      ✉
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">From Your Computer</h3>
                      <ol className="list-decimal list-inside space-y-1 text-sm">
                        <li>Open the email or message.</li>
                        <li>Highlight the text you want to check.</li>
                        <li>Right-click and select “Copy”.</li>
                        <li>Click inside the SenAI text box.</li>
                        <li>Right-click and select “Paste”.</li>
                      </ol>
                    </div>
                  </div>

                  {/* quick tip */}
                  <div className="flex items-start gap-3 p-4 rounded-2xl bg-teal-50 dark:bg-teal-900/40 border border-teal-200 dark:border-teal-700 text-sm">
                    <div className="mt-1 text-teal-500">💬</div>
                    <div>
                      <div className="font-semibold mb-1">Quick Tip</div>
                      <div>
                        No worries if you make a mistake. You can always clear
                        the text box and try again. We’re here to help you stay
                        safe.Take your time. 
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* help videos */}
                  <div className="space-y-4 text-sm">
                    <VideoLinkCard
                      label="iPhone & iPad"
                      title="How To Copy And Paste On The iPhone and iPad"
                      href="https://www.youtube.com/watch?v=55ig0PAsjlo"
                    />
                    <VideoLinkCard
                      label="Android"
                      title="How To Copy And Paste On Android"
                      href="https://www.youtube.com/watch?v=sLeKtSpaWgY"
                    />
                    <VideoLinkCard
                      label="Windows Computer"
                      title="How to Copy, Paste, Select All using Keyboard Shortcut on Windows Computer"
                      href="https://www.youtube.com/watch?v=fKIS5SX53lE"
                    />
                  </div>

                  <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
                    These links open YouTube in a new tab so you can watch the
                    tutorial and come back to SenAI when you’re ready.
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* tips modal */}
      {showTips && (
        <div
          className="fixed inset-0 z-40 bg-black/40 flex items-center justify-center p-4
          text-gray-900 dark:text-white"
        >
          <div className="bg-white dark:bg-gray-900 rounded-3xl max-w-3xl w-full shadow-xl relative border border-gray-200 dark:border-gray-700">
            {/* close */}
            <button
              onClick={() => setShowTips(false)}
              className="absolute right-4 top-4 text-2xl text-gray-500 hover:text-gray-700 dark:text-gray-400"
            >
              ✕
            </button>

            {/* tips header */}
            <div className="px-6 pt-6 pb-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold">Scam Safety Tips &amp; Examples</h2>
            </div>

            {/* tips body */}
            <div className="px-6 pb-6 pt-4 space-y-8 max-h-[75vh] overflow-y-auto text-sm">
              {/* general tips */}
              <section className="space-y-6">
                <h3 className="text-xl font-semibold text-senaiBlue dark:text-senaiBlue">
                  Helpful Tips to Stay Safe
                </h3>

                {/* phishing emails */}
                <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800">
                  <h4 className="font-semibold mb-2 text-blue-800 dark:text-blue-200">
                    How Phishing Emails Trick You
                  </h4>
                  <ul className="list-disc ml-5 space-y-1">
                    <li>
                      <strong>Fake sender addresses:</strong> Scammers use
                      addresses that look almost real.
                    </li>
                    <li>
                      <strong>Urgent language:</strong> “Act now” or “Your
                      account will be closed”.
                    </li>
                    <li>
                      <strong>Suspicious links:</strong> Hover over links before
                      you click to see the real website.
                    </li>
                    <li>
                      <strong>Generic greetings:</strong> “Dear customer” instead
                      of your name.
                    </li>
                  </ul>
                  <p className="mt-2 font-medium text-blue-800 dark:text-blue-200">
                    Remember: real companies will never ask for your password or
                    Social Security number by email.
                  </p>
                </div>

                {/* fake links */}
                <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-900/30 border border-purple-100 dark:border-purple-800">
                  <h4 className="font-semibold mb-2 text-purple-800 dark:text-purple-200">
                    Spotting Fake Links
                  </h4>
                  <ul className="list-disc ml-5 space-y-1">
                    <li>
                      <strong>Hover first:</strong> On a computer, move your
                      mouse over the link to reveal the real address.
                    </li>
                    <li>
                      <strong>Check spelling:</strong> Look for tiny changes
                      like “amaz0n.com” instead of “amazon.com”.
                    </li>
                    <li>
                      <strong>Look for HTTPS:</strong> Secure sites start with
                      “https://” and show a small lock icon.
                    </li>
                    <li>
                      <strong>Shortened links:</strong> Be careful with bit.ly or
                      other short links from strangers.
                    </li>
                  </ul>
                  <p className="mt-2 font-medium text-purple-800 dark:text-purple-200">
                    Best practice: type the company’s website directly into your
                    browser instead of clicking links.
                  </p>
                </div>

                {/* social media */}
                <div className="p-4 rounded-2xl bg-green-50 dark:bg-green-900/30 border border-green-100 dark:border-green-800">
                  <h4 className="font-semibold mb-2 text-green-800 dark:text-green-200">
                    Staying Safe on Social Media
                  </h4>
                  <ul className="list-disc ml-5 space-y-1">
                    <li>
                      <strong>Friend requests:</strong> Don’t accept requests
                      from people you don’t know.
                    </li>
                    <li>
                      <strong>Too good to be true:</strong> Free prizes, easy
                      money, miracle cures are usually scams.
                    </li>
                    <li>
                      <strong>Impersonation:</strong> Scammers may pretend to be
                      a friend or family member.
                    </li>
                    <li>
                      <strong>Quiz scams:</strong> “Fun” quizzes can collect
                      answers to your security questions.
                    </li>
                  </ul>
                  <p className="mt-2 font-medium text-green-800 dark:text-green-200">
                    Safety tip: Never accept requests from people you do not know.
                  </p>
                </div>
              </section>

              {/* examples */}
              <section>
                <h3 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-4">
                  Scam vs Safe Examples
                </h3>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* scam example */}
                  <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-900/40 border border-red-200 dark:border-red-700">
                    <h4 className="font-bold text-red-700 dark:text-red-300 mb-2">
                      ❌ Scam Example
                    </h4>
                    <p className="p-3 rounded-lg bg-white dark:bg-red-900/20">
                      “URGENT! Your bank account has been locked. Click the link
                      below and enter your Social Security number to restore
                      access or your account will be closed in 24 hours.”
                    </p>
                    <h5 className="mt-3 font-semibold text-red-700 dark:text-red-300">
                      Why this is a scam:
                    </h5>
                    <ul className="list-disc ml-5 space-y-1">
                      <li>Uses urgent language to create panic.</li>
                      <li>Asks for highly sensitive information (SSN).</li>
                      <li>Threatens to close your account.</li>
                      <li>Pushes you to click an unknown link.</li>
                    </ul>
                  </div>

                  {/* safe example */}
                  <div className="p-4 rounded-2xl bg-green-50 dark:bg-green-900/40 border border-green-200 dark:border-green-700">
                    <h4 className="font-bold text-green-700 dark:text-green-300 mb-2">
                      ✔ Safe Example
                    </h4>
                    <p className="p-3 rounded-lg bg-white dark:bg-green-900/20">
                      “Hi Mom, just wanted to let you know I arrived safely.
                      We’re checking into the hotel now. I’ll call you later
                      tonight. Love you!”
                    </p>
                    <h5 className="mt-3 font-semibold text-green-700 dark:text-green-300">
                      Why this is safe:
                    </h5>
                    <ul className="list-disc ml-5 space-y-1">
                      <li>Friendly, personal tone.</li>
                      <li>No threats or pressure.</li>
                      <li>No links to click.</li>
                      <li>No requests for money or private details.</li>
                    </ul>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      )}

      {/* about modal */}
      {showAboutModal && (
        <div
          className="fixed inset-0 z-40 bg-black/40 flex items-center justify-center p-4 
          text-gray-900 dark:text-white"
        >
          <div className="bg-white dark:bg-gray-900 rounded-3xl max-w-xl w-full shadow-xl relative border border-gray-200 dark:border-gray-700">
            {/* close */}
            <button
              onClick={() => setShowAboutModal(false)}
              className="absolute right-4 top-4 text-2xl text-gray-500 hover:text-gray-700 dark:text-gray-400"
            >
              ✕
            </button>

            <div className="px-6 pt-6 pb-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <span>About SenAI</span>
              </h2>
            </div>

            <div className="px-6 pb-6 pt-4 max-h-[70vh] overflow-y-auto space-y-4 text-sm">
              <p className="text-base">
                SenAI is your friendly companion for staying safe online. We
                help you understand suspicious messages in simple, calm
                language.
              </p>

              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/30">
                  ⛉ <strong>100% Private &amp; Secure</strong>
                  <br />
                  Your messages never leave your device. We don’t store or share
                  what you paste into SenAI.
                </div>

                <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/30">
                  ⛉ <strong>No Login Required</strong>
                  <br />
                  No account, no passwords. Just paste your message and get
                  guidance right away.
                </div>

                <div className="p-4 rounded-xl bg-yellow-50 dark:bg-yellow-900/30">
                  ♡ <strong>Built to Protect You</strong>
                  <br />
                  We highlight scam signs in clear terms so you can make
                  informed decisions.
                </div>

                <div className="p-4 rounded-xl bg-pink-50 dark:bg-pink-900/30">
                  ♡ <strong>Made with Care</strong>
                  <br />
                  Designed to be gentle, accessible, and senior-friendly. You
                  deserve technology that works for you.
                </div>
              </div>

              <p className="mt-2 text-center text-gray-600 dark:text-gray-300">
                Have questions? We’re here to help you feel safe and supported.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* small helper component for video links */
function VideoLinkCard({ label, title, href }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="block p-4 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
    >
      <div className="text-xs uppercase tracking-wide text-gray-500 mb-1">
        {label}
      </div>
      <div className="font-semibold mb-1">{title}</div>
      <div className="text-xs text-sky-600 dark:text-sky-300">
        Open video in new tab ↗
      </div>
    </a>
  );
}
