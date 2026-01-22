import Head from 'next/head';
import { SpeedInsights } from "@vercel/speed-insights/next";
import '../styles/globals.css';

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>Personal Ops Hub</title>
      </Head>
      <Component {...pageProps} />
      <SpeedInsights />
    </>
  );
}
