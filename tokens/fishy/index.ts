import * as web3 from '@solana/web3.js';
import * as token from '@solana/spl-token';
import { initializeKeypair } from './initializeKeypair';
import * as fs from 'fs';
import {
  bundlrStorage,
  findMetadataPda,
  keypairIdentity,
  Metaplex,
  toMetaplexFile,
} from '@metaplex-foundation/js';

import {
  DataV2,
  createCreateMetadataAccountV2Instruction,
} from '@metaplex-foundation/mpl-token-metadata';

const TOKEN_NAME = 'Cryptofishies';
const TOKEN_SYMBOL = 'FISHY';
const TOKEN_DESCRIPTION = 'A token for Cryptofishy collectoors';
const TOKEN_IMAGE_NAME = 'cryptofishy.png'; // Replace unicorn.png with your image name
const TOKEN_IMAGE_PATH = `tokens/fishy/assets/${TOKEN_IMAGE_NAME}`;

async function createFishyToken(
  connection: web3.Connection,
  payer: web3.Keypair
) {
  const tokenMint = await token.createMint(
    connection,
    payer,
    payer.publicKey,
    payer.publicKey,
    6
  );

  const metaplex = Metaplex.make(connection)
    .use(keypairIdentity(payer))
    .use(
      bundlrStorage({
        address: 'https://devnet.bundlr.network',
        providerUrl: 'https://api.devnet.solana.com',
        timeout: 60000,
      })
    );

  const imageBuffer = fs.readFileSync(TOKEN_IMAGE_PATH);
  const file = toMetaplexFile(imageBuffer, TOKEN_IMAGE_NAME);

  // temp use existing uri because of Bundlr timeout issue on devnet
  const imageUri =
    'https://bafkreiebbhbp5xzuhz233toz3mjoshdmkfdfaq2wxcu7uamgnx5auenuje.ipfs.nftstorage.link/';
  // const imageUri = await metaplex.storage().upload(file);

  const { uri } = await metaplex.nfts().uploadMetadata({
    name: TOKEN_NAME,
    description: TOKEN_DESCRIPTION,
    image: imageUri,
  });

  const metadataPda = findMetadataPda(tokenMint);
  const tokenMetadata = {
    name: TOKEN_NAME,
    symbol: TOKEN_SYMBOL,
    uri: uri,
    sellerFeeBasisPoints: 0,
    creators: null,
    collection: null,
    uses: null,
  } as DataV2;

  const instruction = createCreateMetadataAccountV2Instruction(
    {
      metadata: metadataPda,
      mint: tokenMint,
      mintAuthority: payer.publicKey,
      payer: payer.publicKey,
      updateAuthority: payer.publicKey,
    },
    {
      createMetadataAccountArgsV2: {
        data: tokenMetadata,
        isMutable: true,
      },
    }
  );

  const transaction = new web3.Transaction();
  transaction.add(instruction);

  const transactionSignature = await web3.sendAndConfirmTransaction(
    connection,
    transaction,
    [payer]
  );

  fs.writeFileSync(
    'tokens/fishy/cache.json',
    JSON.stringify({
      mint: tokenMint.toBase58(),
      imageUri: imageUri,
      metadataUri: uri,
      tokenMetadata: metadataPda.toBase58(),
      metadataTransaction: transactionSignature,
    })
  );
}

async function main() {
  const connection = new web3.Connection(web3.clusterApiUrl('devnet'));
  const payer = await initializeKeypair(connection);

  await createFishyToken(connection, payer);
}

main()
  .then(() => {
    console.log('Finished successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.log(error);
    process.exit(1);
  });
