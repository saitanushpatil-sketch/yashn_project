import React, { useEffect, useRef, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * AnimatedText — letters fade in one by one with a soft glow.
 */
function AnimatedText({ text, isNew }) {
  if (!isNew) {
    return <span>{text}</span>;
  }

  return (
    <>
      {text.split('').map((char, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, filter: 'blur(4px)' }}
          animate={{ opacity: 1, filter: 'blur(0px)' }}
          transition={{ duration: 0.03, delay: i * 0.012, ease: 'easeOut' }}
          style={{ display: 'inline' }}
        >
          {char}
        </motion.span>
      ))}
    </>
  );
}

export default function ChatWindow({ messages, isTyping, userName }) {
  const bottomRef = useRef(null);
  const [animatedIdx, setAnimatedIdx] = useState(-1);
  const [mouseOff, setMouseOff] = useState({ x: 0, y: 0 });

  // Track which messages are "new" for animation
  const prevLenRef = useRef(0);
  useEffect(() => {
    if (messages.length > prevLenRef.current) {
      setAnimatedIdx(messages.length - 1);
    }
    prevLenRef.current = messages.length;
  }, [messages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Subtle parallax on background
  useEffect(() => {
    const h = (e) => {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      setMouseOff({
        x: (e.clientX - cx) / cx * 5,
        y: (e.clientY - cy) / cy * 5,
      });
    };
    window.addEventListener('mousemove', h);
    return () => window.removeEventListener('mousemove', h);
  }, []);

  // Stars for chat background
  const stars = useMemo(() =>
    Array.from({ length: 35 }).map((_, i) => ({
      id: i,
      top: Math.random() * 100,
      left: Math.random() * 100,
      size: Math.random() * 1.5 + 0.3,
      delay: Math.random() * 10,
      dur: 6 + Math.random() * 8,
    })), []);

  const { greeting, subGreeting } = useMemo(() => getHumanGreeting(userName), [userName]);

  return (
    <div className="chat-window">
      {/* Animated star background inside chat */}
      <div className="chat-bg-stars" style={{
        transform: `translate(${mouseOff.x}px, ${mouseOff.y}px)`,
      }}>
        {stars.map(s => (
          <motion.div
            key={s.id}
            className="chat-bg-star"
            animate={{ opacity: [0, 0.5, 0.15, 0.4] }}
            transition={{ delay: s.delay, duration: s.dur, repeat: Infinity, repeatType: 'mirror' }}
            style={{
              top: `${s.top}%`, left: `${s.left}%`,
              width: `${s.size}px`, height: `${s.size}px`,
            }}
          />
        ))}
      </div>

      {/* Aurora-like gradient */}
      <div className="chat-aurora" />

      {messages.length === 0 ? (
        <motion.div
          className="chat-empty"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 2, delay: 0.5 }}
        >
          <p className="chat-greeting">{greeting}</p>
          <p className="chat-greeting-sub">{subGreeting}</p>
        </motion.div>
      ) : (
        <div className="chat-messages">
          <AnimatePresence initial={false}>
            {messages.map((msg, idx) => (
              <motion.div
                key={idx}
                className={`chat-msg ${msg.role}`}
                initial={{ opacity: 0, y: 20, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className={`msg-bubble ${msg.role}`}>
                  {/* Golden pulse behind assistant messages */}
                  {msg.role === 'assistant' && (
                    <div className="msg-glow" />
                  )}
                  <p className="msg-text">
                    <AnimatedText text={msg.content} isNew={idx === animatedIdx} />
                  </p>
                </div>
              </motion.div>
            ))}

            {isTyping && (
              <motion.div
                className="chat-msg assistant"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
              >
                <div className="msg-bubble assistant">
                  <div className="typing-shimmer">
                    <span className="shimmer-dot">✦</span>
                    <span className="shimmer-dot">✦</span>
                    <span className="shimmer-dot">✦</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={bottomRef} />
        </div>
      )}
    </div>
  );
}

function getHumanGreeting(name) {
  const isGuest = !name || name === 'Guest';
  const hour = new Date().getHours();
  
  let timeContext = '';
  if (hour < 5) timeContext = "you're up late";
  else if (hour < 12) timeContext = "morning";
  else if (hour < 17) timeContext = "afternoon";
  else if (hour < 22) timeContext = "evening";
  else timeContext = "late";

  const randomFrom = (arr) => arr[Math.floor(Math.random() * arr.length)];

  if (isGuest) {
    return {
      greeting: "hello.",
      subGreeting: "i'm here when you're ready."
    };
  }

  // Very human, non-software greetings
  const greetings = [
    `there you are, ${name}.`,
    `good to see you again, ${name}.`,
    `hey, ${name}.`,
    `been waiting for you, ${name}.`,
    `${name}. hi.`
  ];

  const subGreetings = [
    "tell me what's on your mind.",
    "how's your day been?",
    "i'm listening.",
    "take your time.",
    "i'm right here."
  ];

  // Occasionally reference the time
  if (Math.random() > 0.7) {
    if (timeContext === "you're up late" || timeContext === "late") {
      greetings.push(`couldn't sleep, ${name}?`);
    } else {
      greetings.push(`good ${timeContext}, ${name}.`);
    }
  }

  return {
    greeting: randomFrom(greetings),
    subGreeting: randomFrom(subGreetings)
  };
}
