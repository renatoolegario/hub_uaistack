// pages/_app.js
import React from 'react';
import { Helmet } from 'react-helmet';
import { CookiesProvider } from 'react-cookie';

const GTM = 'GTM-KS9CSFTL';

function MyApp({ Component, pageProps }) {
  return (
    <CookiesProvider>
      <Helmet>
        <link rel="icon" href="/images/favicons/favicon.ico" type="image/x-icon" />
        <link rel="apple-touch-icon" sizes="180x180" href="/images/favicons/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/images/favicons/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/images/favicons/favicon-16x16.png" />
        <link rel="manifest" href="/images/favicons/site.webmanifest" />

        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function(w,d,s,l,i){
                w[l]=w[l]||[];
                w[l].push({'gtm.start': new Date().getTime(),event:'gtm.js'});
                var f=d.getElementsByTagName(s)[0],
                j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';
                j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;
                f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','${GTM}');
            `,
          }}
        />
      </Helmet>
      <Component {...pageProps} />
      <noscript>
        <iframe
          src={`https://www.googletagmanager.com/ns.html?id=${GTM}`}
          height="0"
          width="0"
          style={{ display: 'none', visibility: 'hidden' }}
        />
      </noscript>
    </CookiesProvider>
  );
}

export default MyApp;