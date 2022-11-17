import type { NextPage } from 'next';
import { useEffect, useState } from 'react';
import Disconnected from '../components/Disconnected';
import Connected from '../components/Connected';
import { useWallet } from '@solana/wallet-adapter-react';
import MainLayout from '../components/MainLayout';

const Home: NextPage = () => {
  const { connected } = useWallet();
  const [domLoaded, setDomLoaded] = useState(false);

  useEffect(() => {
    setDomLoaded(true);
  }, []);

  return (
    <>
      {domLoaded && (
        <MainLayout> {connected ? <Connected /> : <Disconnected />}</MainLayout>
      )}
    </>
  );
};

export default Home;
