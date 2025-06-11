import React, { useEffect } from 'react';

function Main() {
  
  return (
    <div id="corpo" className="w-full h-screen relative overflow-hidden flex items-center justify-center">
      {/* Hero Section */}
      <section id="hero" className="bg_fundao text-white text-center relative w-full h-full flex items-center justify-center">
        

        {/* Conteúdo central de carregamento */}
        <div className="relative z-10 text-center">
          <p className="text-4xl font-semibold animate-pulse">Site em construção...</p>
        </div>
        
      </section>
    </div>
  );
}

export default Main;