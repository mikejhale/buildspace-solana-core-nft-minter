import {
  Button,
  Container,
  Heading,
  VStack,
  Text,
  HStack,
  Image,
} from '@chakra-ui/react';
import {
  FC,
  MouseEventHandler,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { PublicKey } from '@solana/web3.js';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import {
  Metaplex,
  walletAdapterIdentity,
  CandyMachine,
} from '@metaplex-foundation/js';
import { useRouter } from 'next/router';

const Connected: FC = () => {
  const { connection } = useConnection();
  const walletAdapter = useWallet();
  const [candyMachine, setCandyMachine] = useState<CandyMachine>();
  const [isMinting, setIsMinting] = useState(false);

  const metaplex = useMemo(() => {
    return Metaplex.make(connection).use(walletAdapterIdentity(walletAdapter));
  }, [connection, walletAdapter]);

  useEffect(() => {
    if (!metaplex) return;

    const candyMachineId = new PublicKey(
      'A88jmFmyj6tJuhw1bXznoUF2Gd6rLJkEXi1Z1uKEw9ws'
    );

    console.log(candyMachineId);

    metaplex
      .candyMachines()
      .findByAddress({
        address: candyMachineId,
      })
      .then((candyMachine) => {
        console.log(candyMachine);
        setCandyMachine(candyMachine);
      })
      .catch((error) => {
        console.log(error);
      });
  }, [metaplex]);

  const router = useRouter();

  const handleClick: MouseEventHandler<HTMLButtonElement> = useCallback(
    async (event) => {
      if (event.defaultPrevented) return;

      console.log('minting...');
      if (!walletAdapter.connected || !candyMachine) {
        return;
      }

      try {
        setIsMinting(true);
        const nft = await metaplex.candyMachines().mint({ candyMachine });

        console.log(nft);
        router.push(`/newMint?mint=${nft.nft.address.toBase58()}`);
      } catch (error) {
        alert(error);
      } finally {
        setIsMinting(false);
      }
    },
    [metaplex, walletAdapter, candyMachine]
  );

  return (
    <VStack spacing={20}>
      <Container>
        <VStack spacing={8}>
          <Heading
            color='white'
            as='h1'
            size='2xl'
            noOfLines={1}
            textAlign='center'
          >
            Welcome Fishfan!.
          </Heading>

          <Text color='bodyText' fontSize='xl' textAlign='center'>
            Each Cryptofishy is randomly generated and can be staked to receive
            <Text as='b'> $FISHY</Text>. Use your <Text as='b'> $FISHY</Text> to
            upgrade your cryptofish and receive perks within the community!
          </Text>
        </VStack>
      </Container>

      <HStack spacing={10}>
        <Image src='fishy1.png' alt='' />
        <Image src='fishy2.png' alt='' />
      </HStack>

      <Button
        bgColor='accent'
        color='white'
        maxW='380px'
        onClick={handleClick}
        isLoading={isMinting}
      >
        <Text>mint Cryptofishy</Text>
      </Button>
    </VStack>
  );
};

export default Connected;
