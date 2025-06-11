// pages/_app.js
import React from 'react';

function MyApp({ Component, pageProps }) {
  return (
    <div>
   
      <Component {...pageProps} />
 
    </div>
  );
}

export default MyApp;