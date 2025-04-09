import "@/styles/globals.css";
import { ClerkProvider} from '@clerk/nextjs';
import Head from 'next/head';

function MyApp({ Component, pageProps }) {

  return (
    <ClerkProvider>
      <Head>
        <title>Uber Clone</title>
      </Head>
      <Component {...pageProps} />
    </ClerkProvider>
  );
}

export default MyApp;
