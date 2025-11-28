import React, { useState } from 'react';
import { Play, Search, Heart, User, Menu, Music, ArrowRight, Star, Clock, ToggleLeft, ToggleRight } from 'lucide-react';

const HomePage = () => {
  const [activeTab, setActiveTab] = useState('All');
  const [isLoading, setIsLoading] = useState(false); // New state to demo Loading Skeletons

  // Theme Constants based on "NeoBeat"
  const theme = {
    bg: 'bg-[#FDF2F0]', // Soft Blush
    text: 'text-[#2A1B28]', // Deep Aubergine
    textMuted: 'text-[#6B5A68]',
    primaryGradient: 'bg-gradient-to-r from-[#FF2E93] to-[#8E2DE2]',
    secondaryGradient: 'bg-gradient-to-r from-[#4facfe] to-[#00f2fe]',
    cardBg: 'bg-white',
  };

  const featuredSongs = [
    { title: "Xam", artist: "Zakaria", key: "Cm", rhythm: "Slow 6/8", img: "purple" },
    { title: "Gule", artist: "Hassan", key: "Am", rhythm: "Kurdish 7/8", img: "pink" },
    { title: "Baran", artist: "Nazdar", key: "Gm", rhythm: "4/4 Pop", img: "blue" },
    { title: "Dlem", artist: "Kamaran", key: "Dm", rhythm: "Georgina", img: "orange" },
  ];

  const artists = [
    { name: "Zakaria", color: "from-pink-500 to-rose-500" },
    { name: "Dashni", color: "from-purple-500 to-indigo-500" },
    { name: "Hassan", color: "from-blue-500 to-cyan-500" },
    { name: "Chopy", color: "from-orange-500 to-red-500" },
    { name: "Navid", color: "from-emerald-500 to-teal-500" },
  ];

  // --- SKELETON COMPONENTS (From Design System) ---
  const SkeletonCard = () => (
    <div className="bg-white rounded-3xl p-4 shadow-sm border border-pink-50 animate-pulse">
      <div className="h-48 rounded-2xl bg-gray-200 mb-4"></div>
      <div className="flex justify-between items-start">
        <div className="space-y-2 w-full">
          <div className="h-6 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div className="h-6 bg-gray-200 rounded w-10"></div>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen ${theme.bg} font-sans selection:bg-pink-200 relative`}>
      
      {/* Dev Tool: Toggle Loading State */}
      <div className="fixed bottom-4 left-4 z-50 bg-black/80 text-white px-4 py-2 rounded-full text-xs cursor-pointer flex items-center gap-2 hover:bg-black" onClick={() => setIsLoading(!isLoading)}>
         {isLoading ? <ToggleRight className="text-green-400"/> : <ToggleLeft className="text-gray-400"/>}
         {isLoading ? "View Content" : "Preview Loading State"}
      </div>

      {/* --- NAVIGATION (Glassmorphism) --- */}
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/60 border-b border-white/20 px-6 py-4 flex justify-between items-center transition-all duration-300">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-full ${theme.primaryGradient} flex items-center justify-center text-white font-bold shadow-lg`}>G</div>
          <span className={`text-2xl font-black tracking-tighter ${theme.text}`}>Goranee</span>
        </div>
        
        <div className="hidden md:flex items-center bg-white rounded-full px-4 py-2 shadow-sm border border-pink-100 w-96 focus-within:ring-2 focus-within:ring-pink-300 transition-all">
          <Search className="w-4 h-4 text-gray-400 mr-2" />
          <input type="text" placeholder="Search for songs, artists, lyrics..." className="bg-transparent outline-none text-sm w-full text-gray-700 placeholder-gray-400" />
        </div>

        <div className="flex items-center gap-4">
          <button className={`hidden md:block text-sm font-semibold ${theme.text} hover:text-pink-600 transition`}>Log In</button>
          <button className={`${theme.primaryGradient} text-white px-5 py-2 rounded-full text-sm font-bold shadow-lg hover:shadow-pink-500/30 transition transform hover:-translate-y-0.5 active:scale-95`}>
            Explore
          </button>
          <Menu className="md:hidden w-6 h-6 text-gray-700" />
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <header className="relative px-6 py-12 md:py-20 max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12 overflow-hidden">
        <div className="flex-1 space-y-6 z-10">
          <div className="inline-block px-4 py-1 rounded-full bg-pink-100 text-pink-600 text-xs font-bold tracking-wide uppercase mb-2 animate-fade-in-up">
            The #1 Kurdish Chords Platform
          </div>
          <h1 className={`text-5xl md:text-7xl font-black ${theme.text} leading-tight`}>
            Play the <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF2E93] to-[#8E2DE2]">Melody</span> <br/>
            Feel the Rhythm.
          </h1>
          <p className={`text-lg md:text-xl ${theme.textMuted} max-w-md`}>
            Access thousands of chords, lyrics, and authentic Kurdish rhythms. Join the community of musicians today.
          </p>
          <div className="flex gap-4 pt-4">
            <button className={`${theme.primaryGradient} text-white px-8 py-4 rounded-full font-bold shadow-xl flex items-center gap-2 hover:scale-105 transition`}>
              <Music className="w-5 h-5" /> Start Playing
            </button>
            <button className="bg-white text-gray-800 px-8 py-4 rounded-full font-bold shadow-md border border-gray-100 hover:bg-gray-50 transition text-sm">
              Submit Chord
            </button>
          </div>
        </div>
        
        {/* Visual: Featured Artist Cutout Style */}
        <div className="flex-1 relative w-full h-80 md:h-[500px] flex items-center justify-center">
          {/* Background Glow */}
          <div className="absolute inset-0 bg-gradient-to-tr from-pink-200 to-purple-200 rounded-full blur-3xl opacity-50 animate-pulse"></div>
          
          {/* Artist Cutout Representation */}
          <div className="relative z-10 w-full max-w-md h-full flex items-end justify-center">
             <div className="w-64 h-80 md:w-80 md:h-96 bg-gray-900 rounded-t-[10rem] rounded-b-[3rem] shadow-2xl relative overflow-hidden border-b-8 border-pink-500">
                <div className="absolute inset-0 bg-gradient-to-b from-gray-700 to-gray-900"></div>
                {/* Simulated Image */}
                <div className="absolute inset-0 flex items-center justify-center text-white/10 font-black text-9xl select-none overflow-hidden">
                  ARTIST
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/90 via-black/50 to-transparent text-white pt-20">
                    <p className="text-xs text-pink-300 font-bold uppercase tracking-wider mb-1">Featured Artist</p>
                    <h3 className="text-3xl font-bold">Zakaria</h3>
                </div>
             </div>
          </div>

          {/* Floating 'Now Playing' Card */}
          <div className="absolute bottom-10 -left-4 md:left-0 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-xl flex items-center gap-3 animate-bounce border border-white/50" style={{animationDuration: '3s'}}>
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 shadow-inner">
              <Play className="w-5 h-5 fill-current" />
            </div>
            <div>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wide">Trending Now</p>
              <p className="text-sm font-bold text-gray-800">Bo Kurdistan</p>
            </div>
          </div>
        </div>
      </header>

      {/* --- SONG DISCOVERY --- */}
      <section className="px-6 py-16 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
          <div>
            <h2 className={`text-3xl md:text-4xl font-bold ${theme.text}`}>Discovery</h2>
            <p className={theme.textMuted}>Fresh chords added this week</p>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide w-full md:w-auto">
            {['All', 'Pop', 'Folklore', 'Slow', 'Halparke'].map(tab => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-2 rounded-full text-sm font-bold transition whitespace-nowrap ${
                  activeTab === tab 
                  ? 'bg-[#2A1B28] text-white shadow-lg scale-105' 
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-transparent hover:border-gray-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {isLoading 
            ? Array(4).fill(0).map((_, i) => <SkeletonCard key={i} />)
            : featuredSongs.map((song, i) => (
            <div key={i} className="group relative bg-white rounded-3xl p-4 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 cursor-pointer border border-pink-50">
              <div className={`h-48 rounded-2xl bg-gradient-to-br from-${song.img}-400 to-${song.img}-600 mb-4 relative overflow-hidden shadow-inner`}>
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300 bg-black/20 backdrop-blur-sm">
                   <div className={`w-14 h-14 rounded-full ${theme.primaryGradient} flex items-center justify-center shadow-lg transform scale-50 group-hover:scale-100 transition duration-300`}>
                     <Play className="w-6 h-6 text-white fill-current ml-1" />
                   </div>
                </div>
              </div>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg text-gray-800 leading-tight mb-1">{song.title}</h3>
                  <p className="text-sm text-gray-500">{song.artist}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                   {/* Key Chip */}
                   <div className="bg-gray-100 px-2 py-1 rounded-md text-xs font-bold text-gray-600 border border-gray-200 min-w-[30px] text-center">
                    {song.key}
                  </div>
                  {/* Rhythm Chip (New Feature) */}
                  <div className="bg-pink-50 px-2 py-0.5 rounded-md text-[10px] font-bold text-pink-600 border border-pink-100">
                    {song.rhythm}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* --- ARTIST SCROLL (Snap Scrolling) --- */}
      <section className="py-16 bg-white/50 backdrop-blur-sm border-y border-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-center mb-8">
            <h2 className={`text-2xl font-bold ${theme.text}`}>Featured Artists</h2>
            <a href="#" className="text-pink-600 font-bold text-sm flex items-center hover:underline group">
              View All <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition"/>
            </a>
          </div>
          
          <div className="flex gap-8 overflow-x-auto pb-8 snap-x snap-mandatory scrollbar-hide">
            {artists.map((artist, i) => (
              <div key={i} className="flex flex-col items-center flex-shrink-0 group cursor-pointer snap-center">
                <div className={`w-28 h-28 rounded-full bg-gradient-to-br ${artist.color} p-[3px] mb-3 group-hover:scale-110 transition duration-300 shadow-lg relative`}>
                   <div className="w-full h-full bg-gray-200 rounded-full border-4 border-white overflow-hidden relative">
                      {/* Placeholder for Avatar Image */}
                      <div className="absolute inset-0 bg-gray-300 animate-pulse"></div> 
                   </div>
                   {/* Online Status Dot */}
                   <div className="absolute bottom-1 right-1 w-4 h-4 bg-green-400 border-2 border-white rounded-full"></div>
                </div>
                <span className="font-bold text-gray-800 group-hover:text-pink-600 transition text-lg">{artist.name}</span>
                <span className="text-xs text-gray-500 font-medium bg-white px-2 py-0.5 rounded-full shadow-sm mt-1">12 Songs</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- COMMUNITY & FOOTER --- */}
      <section className="px-6 py-20 max-w-7xl mx-auto grid md:grid-cols-2 gap-12">
        {/* Comments/Activity */}
        <div className="bg-white rounded-[2rem] p-8 shadow-lg border border-pink-50 relative overflow-hidden group hover:shadow-2xl transition duration-500">
          <div className="absolute top-0 right-0 w-32 h-32 bg-pink-100 rounded-full -mr-10 -mt-10 blur-2xl group-hover:bg-pink-200 transition"></div>
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <div className="bg-green-100 p-2 rounded-lg text-green-600"><Clock className="w-5 h-5"/></div>
            Just Happened
          </h3>
          <div className="space-y-6">
             {[1, 2, 3].map((_, i) => (
               <div key={i} className="flex gap-4 items-start p-2 rounded-xl hover:bg-gray-50 transition">
                 <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-gray-200 to-gray-300 flex-shrink-0 border-2 border-white shadow-sm"></div>
                 <div>
                   <p className="text-sm"><span className="font-bold">Alan88</span> commented on <span className="font-bold text-pink-600 hover:underline cursor-pointer">Nazdar - Baran</span></p>
                   <div className="bg-gray-50 p-2 rounded-tr-xl rounded-br-xl rounded-bl-xl mt-1 text-xs text-gray-600 italic border border-gray-100">
                     "The bridge chords sound perfect! Thanks for the update."
                   </div>
                 </div>
               </div>
             ))}
          </div>
        </div>

        {/* CTA */}
        <div className={`rounded-[2rem] p-8 md:p-12 text-white relative overflow-hidden flex flex-col justify-center ${theme.primaryGradient} shadow-2xl shadow-pink-500/20`}>
           <div className="relative z-10">
             <h3 className="text-3xl font-black mb-4">Join the Community</h3>
             <p className="text-pink-100 mb-8 max-w-sm leading-relaxed">
               Upload your own chords, request songs, and connect with other Kurdish musicians. 
               <span className="block mt-2 font-bold text-white">Join 15,000+ members today.</span>
             </p>
             <button className="bg-white text-pink-600 px-8 py-4 rounded-full font-bold hover:bg-pink-50 transition shadow-lg flex items-center gap-2 group">
               Create Free Account <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition"/>
             </button>
           </div>
           {/* Decorative circles */}
           <div className="absolute top-1/2 right-0 w-64 h-64 bg-white/10 rounded-full -mr-16 -mt-16 blur-sm animate-pulse"></div>
           <div className="absolute bottom-0 right-20 w-32 h-32 bg-purple-500/30 rounded-full blur-xl"></div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-[#2A1B28] text-white pt-16 pb-8 px-6 mt-10 rounded-t-[3rem]">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
           <div>
             <div className="flex items-center gap-2 mb-4">
                <div className={`w-6 h-6 rounded-full ${theme.primaryGradient} flex items-center justify-center text-white text-xs font-bold`}>G</div>
                <h4 className="font-black text-2xl tracking-tighter">Goranee</h4>
             </div>
             <p className="text-gray-400 text-sm leading-relaxed">
               The ultimate platform for Kurdish music chords, lyrics, and community connections.
             </p>
           </div>
           <div>
             <h5 className="font-bold mb-4 text-pink-400 uppercase text-xs tracking-wider">Discover</h5>
             <ul className="space-y-2 text-sm text-gray-300">
               <li className="hover:text-white cursor-pointer transition">New Arrivals</li>
               <li className="hover:text-white cursor-pointer transition">Trending Charts</li>
               <li className="hover:text-white cursor-pointer transition">Featured Artists</li>
               <li className="hover:text-white cursor-pointer transition">Song Requests</li>
             </ul>
           </div>
           <div>
             <h5 className="font-bold mb-4 text-pink-400 uppercase text-xs tracking-wider">Community</h5>
             <ul className="space-y-2 text-sm text-gray-300">
               <li className="hover:text-white cursor-pointer transition">Sign Up / Login</li>
               <li className="hover:text-white cursor-pointer transition">Submit a Chord</li>
               <li className="hover:text-white cursor-pointer transition">Top Contributors</li>
               <li className="hover:text-white cursor-pointer transition">Discord Server</li>
             </ul>
           </div>
           <div>
             <h5 className="font-bold mb-4 text-pink-400 uppercase text-xs tracking-wider">Legal</h5>
             <ul className="space-y-2 text-sm text-gray-300">
               <li className="hover:text-white cursor-pointer transition">Privacy Policy</li>
               <li className="hover:text-white cursor-pointer transition">Terms of Service</li>
               <li className="hover:text-white cursor-pointer transition">DMCA Guidelines</li>
             </ul>
           </div>
        </div>
        <div className="text-center text-gray-600 text-xs border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
          <span>© 2025 Goranee.ir. All rights reserved.</span>
          <span className="mt-2 md:mt-0">Design System: <span className="text-gray-500">NeoBeat v1.1</span></span>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;