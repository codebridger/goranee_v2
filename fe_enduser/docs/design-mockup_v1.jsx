import React, { useState } from 'react';
import { 
  Play, Search, Heart, User, Menu, Music, ArrowRight, 
  Star, Clock, Settings, Mic, Share2, Plus, Minus, 
  ChevronRight, PlayCircle, PauseCircle, Moon, Sun,
  Check, Bell, X, ToggleLeft, ToggleRight
} from 'lucide-react';

const UIShowcase = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // --- THEME ENGINE ---
  // We define dynamic classes based on the mode
  const theme = {
    // Foundations
    bg: isDarkMode ? 'bg-[#130a12]' : 'bg-[#FDF2F0]', // Deep Void vs Soft Blush
    cardBg: isDarkMode ? 'bg-[#1f121d] border-white/10' : 'bg-white border-pink-50',
    cardHover: isDarkMode ? 'hover:shadow-pink-500/10' : 'hover:shadow-xl',
    
    // Typography
    text: isDarkMode ? 'text-[#eddeeb]' : 'text-[#2A1B28]', // Pale Pink vs Deep Aubergine
    textMuted: isDarkMode ? 'text-[#9ca3af]' : 'text-[#6B5A68]',
    textInvert: isDarkMode ? 'text-[#2A1B28]' : 'text-white', // For inside filled buttons
    
    // Accents
    primaryGradient: 'bg-gradient-to-r from-[#FF2E93] to-[#8E2DE2]',
    secondaryGradient: 'bg-gradient-to-r from-[#4facfe] to-[#00f2fe]',
    
    // Borders & Dividers
    border: isDarkMode ? 'border-white/10' : 'border-pink-200',
    inputBg: isDarkMode ? 'bg-white/5 text-white focus:bg-white/10' : 'bg-gray-50 text-gray-800 focus:bg-white',
  };

  // --- HELPER COMPONENTS ---
  const SectionTitle = ({ title, subtitle }) => (
    <div className={`mb-8 border-b ${theme.border} pb-4 mt-12 transition-colors duration-300`}>
      <h2 className={`text-3xl font-black tracking-tight ${theme.text}`}>{title}</h2>
      {subtitle && <p className={`${theme.textMuted} mt-1`}>{subtitle}</p>}
    </div>
  );

  const ColorSwatch = ({ color, name, hex }) => (
    <div className="flex flex-col gap-2">
      <div className={`w-full h-24 rounded-2xl shadow-sm border ${isDarkMode ? 'border-white/10' : 'border-gray-100'} ${color}`}></div>
      <div>
        <p className={`font-bold text-sm ${theme.text}`}>{name}</p>
        <p className={`text-xs font-mono ${theme.textMuted}`}>{hex}</p>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen ${theme.bg} font-sans selection:bg-pink-500 selection:text-white p-8 pb-32 transition-colors duration-500`}>
      
      {/* GLOBAL THEME TOGGLE (Floating) */}
      <button 
        onClick={() => setIsDarkMode(!isDarkMode)}
        className={`fixed bottom-8 right-8 z-50 px-6 py-3 rounded-full font-bold shadow-2xl flex items-center gap-3 transition-all duration-300 ${isDarkMode ? 'bg-white text-gray-900 hover:bg-gray-200' : 'bg-[#2A1B28] text-white hover:bg-gray-800'}`}
      >
        {isDarkMode ? <Sun className="w-5 h-5"/> : <Moon className="w-5 h-5"/>}
        {isDarkMode ? 'Switch to Light' : 'Switch to Dark'}
      </button>

      {/* HEADER */}
      <header className="max-w-7xl mx-auto mb-16 text-center pt-10">
        <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full ${theme.primaryGradient} text-white text-3xl font-black shadow-lg mb-6 ring-4 ${isDarkMode ? 'ring-white/10' : 'ring-white'}`}>G</div>
        <h1 className={`text-5xl md:text-7xl font-black ${theme.text} mb-4 tracking-tight`}>NeoBeat UI Kit</h1>
        <p className={`text-xl ${theme.textMuted}`}>Design System for Goranee.ir</p>
      </header>

      <main className="max-w-7xl mx-auto space-y-20">

        {/* 1. COLORS */}
        <section>
          <SectionTitle title="01. Color Palette" subtitle={`Adaptive palette: ${isDarkMode ? 'Dark Mode Active' : 'Light Mode Active'}`} />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <ColorSwatch color={isDarkMode ? 'bg-[#130a12]' : 'bg-[#FDF2F0]'} name="Canvas Background" hex={isDarkMode ? '#130a12' : '#FDF2F0'} />
            <ColorSwatch color={isDarkMode ? 'bg-[#eddeeb]' : 'bg-[#2A1B28]'} name="Primary Text" hex={isDarkMode ? '#eddeeb' : '#2A1B28'} />
            <ColorSwatch color={isDarkMode ? 'bg-[#1f121d]' : 'bg-[#FFFFFF]'} name="Card Surface" hex={isDarkMode ? '#1f121d' : '#FFFFFF'} />
            <ColorSwatch color={theme.primaryGradient} name="Electric Gradient" hex="#FF2E93 -> #8E2DE2" />
          </div>
        </section>

        {/* 2. TYPOGRAPHY */}
        <section>
          <SectionTitle title="02. Typography" subtitle="Headings in Sans-Serif, Chords in Monospace." />
          <div className={`${theme.cardBg} rounded-3xl p-8 shadow-sm border transition-all duration-300 grid md:grid-cols-2 gap-12`}>
            <div className="space-y-6">
              <div>
                <span className={`text-xs ${theme.textMuted} font-mono uppercase`}>Display H1</span>
                <h1 className={`text-5xl font-black ${theme.text} leading-tight`}>Play the Melody</h1>
              </div>
              <div>
                <span className={`text-xs ${theme.textMuted} font-mono uppercase`}>Heading H2</span>
                <h2 className={`text-3xl font-bold ${theme.text}`}>Featured Artists</h2>
              </div>
              <div>
                <span className={`text-xs ${theme.textMuted} font-mono uppercase`}>Body Text</span>
                <p className={`${theme.textMuted} leading-relaxed`}>
                  Goranee is a community-driven platform. Access thousands of Kurdish chords, lyrics, and rhythms. 
                  Join us to share your musical knowledge.
                </p>
              </div>
            </div>

            {/* CHORD PREVIEW */}
            <div className={`rounded-2xl p-6 border ${isDarkMode ? 'bg-white/5 border-white/5' : 'bg-[#FDF2F0] border-pink-100'}`}>
              <span className="text-xs text-pink-500 font-bold uppercase mb-4 block">Chord Sheet Preview</span>
              <div className="font-mono text-lg space-y-4">
                <div>
                  <span className="text-[#FF2E93] font-bold">[Am]</span>
                  <span className={`${theme.text}`}> Ewa disan baran bari</span>
                </div>
                <div>
                  <span className="text-[#FF2E93] font-bold">[G]</span>
                  <span className={`${theme.text}`}> Firmesk la chawm hate xware</span>
                </div>
                <div>
                  <span className="text-[#FF2E93] font-bold">[F]</span>
                  <span className={`${theme.text}`}> Bochi to wa be wafa buy?</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. BUTTONS & CONTROLS */}
        <section>
          <SectionTitle title="03. Buttons & Interactions" subtitle="Gradient primaries, ghost secondaries." />
          <div className={`${theme.cardBg} rounded-3xl p-8 shadow-sm border transition-all duration-300 space-y-8`}>
            
            {/* Row 1: Main Buttons */}
            <div className="flex flex-wrap items-center gap-6">
              <button className={`${theme.primaryGradient} text-white px-8 py-3 rounded-full font-bold shadow-lg hover:shadow-pink-500/30 transition transform hover:-translate-y-0.5`}>
                Primary Action
              </button>
              <button className={`${isDarkMode ? 'bg-white/10 text-white hover:bg-white/20 border-white/5' : 'bg-white text-gray-800 hover:bg-gray-50 border-gray-200'} px-8 py-3 rounded-full font-bold shadow-sm border transition`}>
                Secondary Action
              </button>
              <button className="text-pink-600 font-bold hover:underline flex items-center gap-2">
                Text Link <ArrowRight className="w-4 h-4"/>
              </button>
            </div>

            {/* Row 2: Icon Buttons & Tools */}
            <div className="flex flex-wrap items-center gap-6">
              <button className={`w-12 h-12 rounded-full ${theme.primaryGradient} flex items-center justify-center text-white shadow-md hover:scale-105 transition`}>
                <Play className="w-5 h-5 fill-current" />
              </button>
              <button className={`w-12 h-12 rounded-full border flex items-center justify-center transition ${isDarkMode ? 'bg-white/5 border-white/10 text-gray-300 hover:text-pink-400' : 'bg-white border-gray-200 text-gray-600 hover:text-pink-500'}`}>
                <Heart className="w-5 h-5" />
              </button>
              
              {/* Tags/Chips */}
              <span className={`px-3 py-1 rounded-md text-xs font-bold border ${isDarkMode ? 'bg-white/10 border-white/5 text-gray-300' : 'bg-gray-100 border-gray-200 text-gray-600'}`}>Key: Am</span>
              <span className="px-3 py-1 rounded-md bg-pink-500/10 text-xs font-bold text-pink-500 border border-pink-500/20">Rhythm: 7/8</span>
            </div>

            {/* Row 3: Inputs & Toggles (New!) */}
            <div className="max-w-xl grid md:grid-cols-2 gap-8">
              <div className="relative group">
                <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400 group-focus-within:text-pink-500 transition" />
                <input 
                  type="text" 
                  placeholder="Search for songs..." 
                  className={`w-full ${theme.inputBg} pl-12 pr-4 py-3 rounded-full outline-none border border-transparent focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition shadow-inner focus:shadow-lg placeholder-gray-500`}
                />
              </div>

              {/* Toggles Demo */}
              <div className="flex items-center gap-4">
                 <div className={`p-3 rounded-2xl flex items-center gap-3 border ${isDarkMode ? 'bg-white/5 border-white/5' : 'bg-gray-50 border-gray-100'}`}>
                    <div className={`w-10 h-6 rounded-full p-1 flex items-center transition-colors duration-300 ${isDarkMode ? 'bg-pink-500 justify-end' : 'bg-gray-300 justify-start'}`}>
                        <div className="w-4 h-4 bg-white rounded-full shadow-sm"></div>
                    </div>
                    <span className={`text-sm font-bold ${theme.text}`}>Auto-scroll</span>
                 </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. CARDS */}
        <section>
          <SectionTitle title="04. Component: Cards" subtitle="Reusable containers for content." />
          <div className="grid md:grid-cols-3 gap-8">
            
            {/* COMPONENT: Song Card */}
            <div className={`group relative ${theme.cardBg} rounded-3xl p-4 shadow-md ${theme.cardHover} hover:-translate-y-2 transition-all duration-300 cursor-pointer border`}>
              <div className="h-48 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 mb-4 relative overflow-hidden shadow-inner">
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300 bg-black/20 backdrop-blur-sm">
                   <div className={`w-14 h-14 rounded-full ${theme.primaryGradient} flex items-center justify-center shadow-lg transform scale-50 group-hover:scale-100 transition duration-300`}>
                     <Play className="w-6 h-6 text-white fill-current ml-1" />
                   </div>
                </div>
              </div>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className={`font-bold text-lg ${theme.text} leading-tight mb-1`}>Xam (Sorrow)</h3>
                  <p className={`text-sm ${theme.textMuted}`}>Zakaria Abdulla</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                   <div className={`px-2 py-1 rounded-md text-xs font-bold border min-w-[30px] text-center ${isDarkMode ? 'bg-white/10 text-gray-300 border-white/5' : 'bg-gray-100 text-gray-600 border-gray-200'}`}>Cm</div>
                   <div className="bg-pink-500/10 px-2 py-0.5 rounded-md text-[10px] font-bold text-pink-500 border border-pink-500/20">Slow</div>
                </div>
              </div>
            </div>

            {/* COMPONENT: Artist Avatar */}
            <div className={`flex flex-col items-center justify-center p-8 rounded-3xl border ${theme.cardBg}`}>
                <div className="relative group cursor-pointer">
                  <div className={`w-32 h-32 rounded-full bg-gradient-to-br from-orange-400 to-red-500 p-[4px] mb-4 group-hover:scale-105 transition duration-300 shadow-xl`}>
                     <div className={`w-full h-full rounded-full border-4 overflow-hidden relative ${isDarkMode ? 'bg-gray-800 border-[#1f121d]' : 'bg-gray-200 border-white'}`}>
                        <div className="absolute inset-0 bg-gray-500/20"></div>
                     </div>
                  </div>
                </div>
                <h3 className={`font-bold text-xl ${theme.text} mb-1`}>Chopy Fatah</h3>
                <p className="text-sm text-pink-500 font-bold">142 Songs</p>
            </div>

            {/* COMPONENT: Comment Bubble */}
            <div className={`rounded-3xl p-6 shadow-sm border flex gap-4 items-start ${theme.cardBg}`}>
              <div className={`w-10 h-10 rounded-full flex-shrink-0 border-2 shadow-sm ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-200 border-white'}`}></div>
              <div>
                 <div className="flex items-baseline gap-2 mb-1">
                   <span className={`font-bold text-sm ${theme.text}`}>MusicLover99</span>
                   <span className={`text-xs ${theme.textMuted}`}>2h ago</span>
                 </div>
                 <div className={`p-3 rounded-tr-2xl rounded-br-2xl rounded-bl-2xl text-sm leading-snug border ${isDarkMode ? 'bg-white/5 border-white/5 text-gray-300' : 'bg-gray-50 border-gray-100 text-gray-600'}`}>
                   "This is the most accurate version I've found! The bridge chords are spot on."
                 </div>
              </div>
            </div>

          </div>
        </section>

        {/* 5. COMPLEX COMPONENTS: NAVIGATION */}
        <section>
          <SectionTitle title="05. Navigation" subtitle="Sticky 'Glassmorphism' Header." />
          <div className="relative rounded-xl overflow-hidden shadow-2xl bg-[url('https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?auto=format&fit=crop&q=80')] bg-cover bg-center h-64 border border-white/10">
             {/* The Overlay to darken bg for demo */}
             <div className="absolute inset-0 bg-gray-900/40"></div>
             
             {/* THE COMPONENT */}
             <nav className={`absolute top-0 left-0 right-0 backdrop-blur-md border-b px-6 py-4 flex justify-between items-center ${isDarkMode ? 'bg-[#130a12]/70 border-white/10' : 'bg-white/70 border-white/20'}`}>
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full ${theme.primaryGradient} flex items-center justify-center text-white font-bold`}>G</div>
                  <span className={`text-xl font-black ${isDarkMode ? 'text-white' : 'text-[#2A1B28]'}`}>Goranee</span>
                </div>
                <div className={`hidden md:flex gap-6 text-sm font-bold ${isDarkMode ? 'text-gray-200' : 'text-[#2A1B28]'}`}>
                  <a href="#" className="hover:text-pink-500">Discovery</a>
                  <a href="#" className="hover:text-pink-500">Artists</a>
                  <a href="#" className="hover:text-pink-500">Community</a>
                </div>
                <div className="flex items-center gap-3">
                  <button className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-[#2A1B28]'}`}>Login</button>
                  <button className={`${theme.primaryGradient} text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-lg`}>
                    Explore
                  </button>
                </div>
              </nav>
          </div>
        </section>

        {/* 6. COMPLEX COMPONENTS: FLOATING TOOLBOX */}
        <section>
          <SectionTitle title="06. The Musician's Toolbox" subtitle="Sticky controls for the Chord View page." />
          <div className={`h-64 rounded-3xl relative overflow-hidden border flex items-center justify-center ${isDarkMode ? 'bg-[#1a1119] border-white/5' : 'bg-gray-100 border-gray-200'}`}>
            <p className={`${theme.textMuted} font-bold`}>Page Content Area...</p>
            
            {/* THE COMPONENT: Floating Bar */}
            <div className={`absolute bottom-6 left-1/2 -translate-x-1/2 px-2 py-2 rounded-full shadow-2xl flex items-center gap-1 border backdrop-blur-xl ${isDarkMode ? 'bg-white text-gray-900 border-white/20' : 'bg-[#2A1B28] text-white border-gray-700/50'}`}>
              
              {/* Tool: Transpose */}
              <div className={`flex items-center gap-2 px-3 border-r ${isDarkMode ? 'border-gray-200' : 'border-gray-700'}`}>
                <span className="text-[10px] opacity-60 uppercase font-bold tracking-wider">Key</span>
                <button className={`w-8 h-8 rounded-full flex items-center justify-center transition ${isDarkMode ? 'bg-black/10 hover:bg-black/20' : 'bg-white/10 hover:bg-white/20'}`}><Minus className="w-4 h-4"/></button>
                <span className="font-mono font-bold text-pink-500 w-6 text-center">Am</span>
                <button className={`w-8 h-8 rounded-full flex items-center justify-center transition ${isDarkMode ? 'bg-black/10 hover:bg-black/20' : 'bg-white/10 hover:bg-white/20'}`}><Plus className="w-4 h-4"/></button>
              </div>

              {/* Tool: Autoscroll */}
              <div className={`flex items-center gap-2 px-3 border-r ${isDarkMode ? 'border-gray-200' : 'border-gray-700'}`}>
                 <span className="text-[10px] opacity-60 uppercase font-bold tracking-wider">Scroll</span>
                 <button className="w-8 h-8 rounded-full bg-pink-600 hover:bg-pink-500 flex items-center justify-center shadow-lg transition">
                   <Play className="w-4 h-4 fill-white ml-0.5 text-white"/>
                 </button>
              </div>

              {/* Tool: Settings */}
              <div className="px-2">
                 <button className={`w-8 h-8 rounded-full flex items-center justify-center transition ${isDarkMode ? 'hover:bg-black/10 text-gray-600' : 'hover:bg-white/10 text-gray-300'}`}>
                   <Settings className="w-4 h-4"/>
                 </button>
              </div>
            </div>
          </div>
        </section>

        {/* 7. CTA & FOOTER */}
        <section>
          <SectionTitle title="07. Marketing Blocks" subtitle="Call to Action & Footer." />
          
          {/* COMPONENT: CTA */}
          <div className={`rounded-[2rem] p-12 text-white relative overflow-hidden flex flex-col items-center text-center ${theme.primaryGradient} shadow-xl mb-12`}>
             <div className="relative z-10 max-w-2xl">
               <h3 className="text-3xl font-black mb-4">Ready to play?</h3>
               <p className="text-pink-100 mb-8 text-lg">
                 Join 15,000+ Kurdish musicians sharing chords and lyrics every day.
               </p>
               <button className="bg-white text-pink-600 px-8 py-4 rounded-full font-bold hover:bg-pink-50 transition shadow-lg flex items-center gap-2 mx-auto group">
                 Create Free Account <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition"/>
               </button>
             </div>
             {/* Decor */}
             <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -ml-20 -mt-20 blur-2xl"></div>
             <div className="absolute bottom-0 right-0 w-64 h-64 bg-purple-900/20 rounded-full -mr-20 -mb-20 blur-2xl"></div>
          </div>

          {/* COMPONENT: Mini Footer */}
          <div className={`p-8 rounded-3xl flex flex-col md:flex-row justify-between items-center gap-4 ${isDarkMode ? 'bg-[#0a0509] text-gray-400' : 'bg-[#2A1B28] text-white'}`}>
             <div className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-full ${theme.primaryGradient} flex items-center justify-center text-white text-xs font-bold`}>G</div>
                <span className="font-bold tracking-tight">Goranee</span>
             </div>
             <div className="text-xs opacity-60">
               © 2025 Goranee.ir. All rights reserved.
             </div>
             <div className="flex gap-4">
               <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 cursor-pointer transition">
                 <Share2 className="w-4 h-4"/>
               </div>
               <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 cursor-pointer transition">
                 <Mic className="w-4 h-4"/>
               </div>
             </div>
          </div>

        </section>

      </main>
    </div>
  );
};

export default UIShowcase;