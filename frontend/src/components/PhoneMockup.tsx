import { useState, useEffect, useRef } from 'react';
import { HeimdallLogo } from '@/components/HeimdallLogo';
import { 
  ChevronLeft, 
  Video, 
  Plus, 
  ArrowUp, 
  Mic, 
  Signal, 
  Wifi, 
  ExternalLink 
} from 'lucide-react';

interface ChatMessage {
  id: number;
  sender: 'user' | 'assistant';
  type: 'text' | 'image' | 'payment';
  text?: string;
  reaction?: string;
  linkUrl?: string;
}

export function PhoneMockup() {
  // Number of visible messages: 0 (empty) -> 1 -> 2 -> 3 -> 4 -> 5 -> 6 -> 7 -> reset
  const [visibleCount, setVisibleCount] = useState<number>(0);
  const [showTyping, setShowTyping] = useState<boolean>(false);
  const [isResetting, setIsResetting] = useState<boolean>(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Exact 7 messages from the user reference
  const messages: ChatMessage[] = [
    // 1. User message (Slides from Right)
    {
      id: 1,
      sender: 'user',
      type: 'text',
      text: 'ok i need aruba. like soon 🏖️',
    },
    // 2. Assistant response (Slides from Left)
    {
      id: 2,
      sender: 'assistant',
      type: 'text',
      text: 'say less. found a villa in palm beach. private pool, 3 min from the sand.',
    },
    // 3. Vacation photo stack (Scales in)
    {
      id: 3,
      sender: 'assistant',
      type: 'image',
      text: 'Palm Beach Sunset Villa',
    },
    // 4. Assistant details (Slides from Left)
    {
      id: 4,
      sender: 'assistant',
      type: 'text',
      text: '$240/night, free cancellation.\nflights are $380 round trip,\nthursday to tuesday.',
    },
    // 5. Payment link card (Slides from Left)
    {
      id: 5,
      sender: 'assistant',
      type: 'payment',
      text: "tap here to pay and you're locked in",
      linkUrl: 'expedia.com/pay/5723190d',
    },
    // 6. User response (Slides from Right)
    {
      id: 6,
      sender: 'user',
      type: 'text',
      text: 'done ✅',
      reaction: '🔥',
    },
    // 7. Assistant confirmation (Slides from Left)
    {
      id: 7,
      sender: 'assistant',
      type: 'text',
      text: "💫 it's on your calendar. made you an itinerary too. sunset catamaran thursday + that ceviche spot you saved 🌅",
    },
  ];

  // Distinct delays for EACH step to ensure ONE-BY-ONE appearance
  // [initial_wait, after_msg1, after_msg2, after_msg3, after_msg4, after_msg5, after_msg6, hold_all_msg7]
  const stepDelays = [
    1000, // 0 -> 1: Initial empty pause before User Msg 1
    2400, // 1 -> 2: Pause after User Msg 1 before Assistant Msg 2
    2600, // 2 -> 3: Pause after Assistant Msg 2 before Photo Msg 3
    2800, // 3 -> 4: Pause after Photo Msg 3 before Price Msg 4
    2600, // 4 -> 5: Pause after Price Msg 4 before Payment Msg 5
    2400, // 5 -> 6: Pause after Payment Msg 5 before User Done Msg 6
    2400, // 6 -> 7: Pause after User Done Msg 6 before Final Msg 7
    4800, // 7 -> Reset: Hold the complete conversation before fading & restarting
  ];

  useEffect(() => {
    let mainTimer: NodeJS.Timeout;
    let typingTimer: NodeJS.Timeout;

    if (visibleCount < messages.length) {
      const nextIndex = visibleCount; // index of message that will appear next
      const nextMsg = messages[nextIndex];
      const isAssistant = nextMsg.sender === 'assistant' && nextMsg.type !== 'image';

      const delay = stepDelays[visibleCount] || 2400;

      if (isAssistant && visibleCount > 0) {
        // Show typing indicator 700ms before message arrives
        const typingStartDelay = Math.max(delay - 700, 300);
        
        typingTimer = setTimeout(() => {
          setShowTyping(true);
        }, typingStartDelay);

        mainTimer = setTimeout(() => {
          setShowTyping(false);
          setVisibleCount((prev) => prev + 1);
        }, delay);
      } else {
        setShowTyping(false);
        mainTimer = setTimeout(() => {
          setVisibleCount((prev) => prev + 1);
        }, delay);
      }
    } else {
      // All 7 messages visible: Hold for full read time, then smooth fade & loop back to 0
      mainTimer = setTimeout(() => {
        setIsResetting(true);
        setTimeout(() => {
          setVisibleCount(0);
          setIsResetting(false);
          if (chatScrollRef.current) {
            chatScrollRef.current.scrollTop = 0;
          }
        }, 600);
      }, stepDelays[7]);
    }

    return () => {
      clearTimeout(mainTimer);
      clearTimeout(typingTimer);
    };
  }, [visibleCount]);

  // Smooth upward scrolling on each new message
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTo({
        top: chatScrollRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [visibleCount, showTyping]);

  return (
    <div className="relative mx-auto flex flex-col items-center select-none">
      
      {/* Decorative Sparkle Rays above Phone Frame */}
      <div className="absolute -top-7 left-1/2 -translate-x-1/2 w-[340px] sm:w-[390px] flex justify-between pointer-events-none z-10">
        <svg width="34" height="34" viewBox="0 0 32 32" fill="none" className="text-slate-300 transform -translate-x-3">
          <path d="M5 14C8.5 9.5 14 6.5 20 5.5" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" />
          <path d="M11 23C13.5 17.5 18 13 25 10.5" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" />
        </svg>
        <svg width="34" height="34" viewBox="0 0 32 32" fill="none" className="text-slate-300 transform translate-x-3">
          <path d="M27 14C23.5 9.5 18 6.5 12 5.5" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" />
          <path d="M21 23C18.5 17.5 14 13 7 10.5" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" />
        </svg>
      </div>

      {/* Main iPhone Hardware Frame */}
      <div className="relative w-[305px] sm:w-[345px] md:w-[375px] bg-[#0A0D14] rounded-[52px] p-[10px] sm:p-[11px] shadow-[0_25px_70px_-15px_rgba(0,0,0,0.28),0_0_0_1px_rgba(255,255,255,0.12)_inset,0_0_35px_rgba(0,0,0,0.06)] border border-slate-700/60">
        
        {/* Inner Phone Screen */}
        <div className="relative w-full bg-[#FCFCFD] rounded-[42px] overflow-hidden flex flex-col h-[590px] sm:h-[620px] border border-slate-100/80">
          
          {/* iOS Status Bar */}
          <div className="w-full px-6 pt-3.5 pb-2 flex items-center justify-between text-[12px] font-semibold text-slate-900 z-30 bg-white/90 backdrop-blur-md">
            <span>9:41</span>
            
            {/* Dynamic Island */}
            <div className="w-24 h-[22px] bg-black rounded-full flex items-center justify-end px-2.5 shadow-xs">
              <div className="w-2.5 h-2.5 rounded-full bg-[#1A1A1A] border border-white/10" />
            </div>

            <div className="flex items-center gap-1.5 text-slate-900">
              <Signal className="w-3 h-3" />
              <Wifi className="w-3 h-3" />
              <div className="w-5 h-2.5 border border-slate-900 rounded-[3px] p-[1px] flex items-center">
                <div className="h-full w-3.5 bg-slate-900 rounded-[1.5px]" />
              </div>
            </div>
          </div>

          {/* iMessage Navigation Header */}
          <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between bg-white/95 backdrop-blur-md z-20 shadow-2xs">
            {/* Back button with badge 2 */}
            <div className="flex items-center gap-0.5 text-blue-500 cursor-pointer">
              <ChevronLeft className="w-5 h-5 -ml-1.5" />
              <span className="w-4 h-4 rounded-full bg-blue-500 text-white text-[10px] font-bold flex items-center justify-center -ml-1">
                2
              </span>
            </div>
            
            {/* Heimdall Avatar and Name Pill */}
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-[#181113] text-white flex items-center justify-center shadow-xs">
                <HeimdallLogo size={16} color="#FFFFFF" />
              </div>
              <div className="mt-0.5 inline-flex items-center gap-0.5 px-2.5 py-0.5 rounded-full bg-white border border-slate-200/80 shadow-2xs">
                <span className="text-[11px] font-semibold text-slate-900">Heimdall</span>
                <span className="text-[10px] text-slate-400 font-bold">&gt;</span>
              </div>
            </div>

            {/* Video Call Button */}
            <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 cursor-pointer">
              <Video className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Message Area */}
          <div 
            ref={chatScrollRef}
            className={`flex-1 p-3.5 overflow-y-auto space-y-3 bg-[#FCFCFD] text-[12px] flex flex-col justify-start transition-opacity duration-500 ${
              isResetting ? 'opacity-0' : 'opacity-100'
            }`}
          >
            {/* Timestamp */}
            <div className="text-center my-1">
              <span className="text-[10px] font-medium text-slate-400">Today 8:05 AM</span>
            </div>

            {/* Render ONLY messages that have been triggered one by one */}
            {messages.slice(0, visibleCount).map((msg) => (
              <div key={msg.id} className="relative">
                
                {/* 1. User Message (Slides in from RIGHT) */}
                {msg.sender === 'user' && msg.type === 'text' && (
                  <div className="flex justify-end relative pt-1.5 animate-in fade-in slide-in-from-right-8 duration-400 ease-out">
                    {msg.reaction && (
                      <div className="absolute -top-1.5 right-2 bg-white rounded-full px-1.5 py-0.5 shadow-md border border-slate-100 flex items-center gap-0.5 text-[11px] animate-in zoom-in-50 duration-300">
                        <span>{msg.reaction}</span>
                      </div>
                    )}
                    <div className="bg-[#007AFF] text-white px-4 py-2.5 rounded-2xl rounded-tr-xs text-[12.5px] font-normal shadow-xs">
                      {msg.text}
                    </div>
                  </div>
                )}

                {/* 2. Assistant Text Message (Slides in from LEFT) */}
                {msg.sender === 'assistant' && msg.type === 'text' && (
                  <div className="flex justify-start animate-in fade-in slide-in-from-left-8 duration-400 ease-out">
                    <div className="bg-[#E9E9EB] text-slate-900 px-3.5 py-2.5 rounded-2xl rounded-tl-xs max-w-[86%] text-[12px] leading-relaxed shadow-2xs whitespace-pre-line">
                      {msg.text}
                    </div>
                  </div>
                )}

                {/* 3. Vacation Photo Stack (Scales in from LEFT) */}
                {msg.type === 'image' && (
                  <div className="relative my-2 w-[88%] animate-in fade-in zoom-in-90 slide-in-from-left-6 duration-500 ease-out">
                    {/* Background tilted card 2 */}
                    <div className="absolute inset-0 rounded-2xl overflow-hidden shadow-xs transform rotate-6 translate-x-3 scale-95 opacity-80 border border-slate-200">
                      <img
                        src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=500&q=80"
                        alt="Tropical Resort"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {/* Background tilted card 1 */}
                    <div className="absolute inset-0 rounded-2xl overflow-hidden shadow-xs transform -rotate-3 -translate-x-2 scale-98 opacity-90 border border-slate-200">
                      <img
                        src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=500&q=80"
                        alt="Sunset Beach"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {/* Front Main Image: Resort, Pool, Flowers, Sunset */}
                    <div className="relative rounded-2xl overflow-hidden shadow-md border border-white/60 aspect-4/3 z-10">
                      <img
                        src="https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=600&q=80"
                        alt="Villa in Palm Beach with Private Pool & Sunset"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-transparent flex items-end p-2.5">
                        <span className="text-[10px] font-medium text-white/95 bg-black/40 backdrop-blur-md px-2.5 py-0.5 rounded-full">
                          {msg.text}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. Payment & Link Preview Card (Slides in from LEFT) */}
                {msg.type === 'payment' && (
                  <div className="flex justify-start animate-in fade-in slide-in-from-left-8 duration-400 ease-out">
                    <div className="bg-[#E9E9EB] text-slate-900 p-3 rounded-2xl rounded-tl-xs max-w-[88%] text-[12px] leading-relaxed shadow-2xs space-y-2">
                      <p>{msg.text}</p>
                      <div className="bg-white/90 rounded-xl p-2 border border-slate-200/80 flex items-center justify-between shadow-2xs hover:bg-white transition-colors cursor-pointer">
                        <div className="flex items-center gap-1.5 text-blue-600 font-medium text-[11.5px]">
                          <span>💵</span>
                          <span className="underline underline-offset-2">{msg.linkUrl}</span>
                        </div>
                        <ExternalLink className="w-3 h-3 text-slate-400" />
                      </div>
                    </div>
                  </div>
                )}

              </div>
            ))}

            {/* Typing Indicator on LEFT right before Assistant message */}
            {showTyping && (
              <div className="bg-[#E9E9EB] text-slate-400 px-3.5 py-2.5 rounded-2xl rounded-tl-xs w-14 flex items-center gap-1 shadow-2xs animate-in fade-in slide-in-from-left-4 duration-200">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            )}

          </div>

          {/* Bottom iMessage Input Bar */}
          <div className="p-2.5 bg-white border-t border-slate-100 flex items-center gap-2 z-20">
            <button className="w-7 h-7 rounded-full bg-slate-200/90 text-slate-600 flex items-center justify-center shrink-0 hover:bg-slate-300 transition-colors">
              <Plus className="w-4 h-4" />
            </button>
            <div className="flex-1 bg-white border border-slate-200 rounded-full px-3.5 py-1.5 text-[11.5px] text-slate-400 flex items-center justify-between shadow-2xs">
              <span>iMessage</span>
              <Mic className="w-3.5 h-3.5 text-slate-400" />
            </div>
            <button className="w-7 h-7 rounded-full bg-[#007AFF] text-white flex items-center justify-center shrink-0 shadow-2xs hover:bg-blue-600 transition-colors">
              <ArrowUp className="w-3.5 h-3.5 stroke-3" />
            </button>
          </div>

          {/* iOS Home Indicator Bar */}
          <div className="w-full pb-1.5 pt-0.5 flex justify-center bg-white z-20">
            <div className="w-28 h-1 bg-slate-300 rounded-full" />
          </div>

        </div>

      </div>

    </div>
  );
}
