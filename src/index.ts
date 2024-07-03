import * as web3 from "@solana/web3.js"
import { createTokenMetadata, initializeKeypair, mintTokenFunc, showAllMintedFunc, transferTokenFunc } from "./initializeKeypair"
import { Metaplex, bundlrStorage, keypairIdentity } from "@metaplex-foundation/js";

const recipient = "7EYKTmaar251NJUfbAtUQV4FDTTPM8o3AFgN4t6CVLqo";
const recipientAddress = new web3.PublicKey(recipient);

const connection: web3.Connection = new web3.Connection(web3.clusterApiUrl('devnet'), 'confirmed')


async function main() {

  const user = await initializeKeypair(connection)
  const metaplex = Metaplex.make(connection).use(keypairIdentity(user)).use(bundlrStorage({
    address: "https://devnet.bundlr.network",
    providerUrl: "https://api.devnet.solana.com",
    timeout: 60000,
  }))

  console.log("User ===> ", user.publicKey.toBase58());
  
  
  // Mint Token
  console.log("\n\n\n");
  console.log("Start Mint token ... ⛏️");
  
  const { mintAccount, ATA } = await mintTokenFunc(user, connection, 6969690000000000, 9);
  console.log("Token Mined ✅");
  
  // View all Tokens that you own
  // showAllMintedFunc(connection, user)
  
  
  // Add token Metadata to token
  console.log("\n\n\n");
  console.log("Adding Metadata ... 🖼️");
  await createTokenMetadata(
    connection,
    metaplex,
    mintAccount,
    user,
    "AvatarONe Token",
    "AT1",
    "This is description of My new token AvatarOne1."
  )
  console.log("Token Metadata added ✅");
  
  
  //Transfer Token
  console.log("\n\n\n");
  console.log("Transfer token ... ➖");
  await transferTokenFunc(connection, user, ATA, recipientAddress, mintAccount)
  console.log("Transfered  ✅");

  console.log("\n\n");
  console.log("DONE ✅");
  

}

main()





















// mint Token With Metadata

// import {
//     clusterApiUrl,
//     Connection,
//     Keypair,
//     LAMPORTS_PER_SOL,
//     PublicKey,
//     sendAndConfirmTransaction,
//     SystemProgram,
//     Transaction,
// } from '@solana/web3.js';
// import {
//     createAccount,
//     createInitializeMetadataPointerInstruction,
//     createInitializeMintInstruction,
//     ExtensionType,
//     getMintLen,
//     getOrCreateAssociatedTokenAccount,
//     LENGTH_SIZE,
//     mintTo,
//     TOKEN_2022_PROGRAM_ID,
//     TYPE_SIZE,
// } from '@solana/spl-token';
// import { createInitializeInstruction, pack, TokenMetadata } from '@solana/spl-token-metadata';
// import { initializeKeypair } from './initializeKeypair';

// (async () => {

//     const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
//     const payer = await initializeKeypair(connection)

//     console.log("User ===> ", payer.publicKey.toBase58());

//     const mint = Keypair.generate();
//     const decimals = 9;

//     const metadata: TokenMetadata = {
//         mint: mint.publicKey,
//         name: 'New Token',
//         symbol: 'NT',
//         uri: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSOY56OM0JM9Mqmw0Fk-Bi5z2VcuJHJOFH_jA&s',
//         additionalMetadata: [['new-field', 'new-value']],
//     };

//     const mintLen = getMintLen([ExtensionType.MetadataPointer]);

//     console.log("mintLen ==> ", mintLen);


//     const metadataLen = TYPE_SIZE + LENGTH_SIZE + pack(metadata).length;
//     console.log("metaDataLen ==> ", metadataLen);


//     // const airdropSignature = await connection.requestAirdrop(payer.publicKey, 2 * LAMPORTS_PER_SOL);
//     // await connection.confirmTransaction({
//     //     signature: airdropSignature,
//     //     ...(await connection.getLatestBlockhash()),
//     // });

//     const mintLamports = await connection.getMinimumBalanceForRentExemption(mintLen + metadataLen);
//     console.log("Mint LAmport = ==> ", mintLamports);
//     const mintTransaction = new Transaction().add(
//         SystemProgram.createAccount({
//             fromPubkey: payer.publicKey,
//             newAccountPubkey: mint.publicKey,
//             space: mintLen,
//             lamports: mintLamports,
//             programId: TOKEN_2022_PROGRAM_ID,
//         }),
//         createInitializeMetadataPointerInstruction(mint.publicKey, payer.publicKey, mint.publicKey, TOKEN_2022_PROGRAM_ID),
//         createInitializeMintInstruction(mint.publicKey, decimals, payer.publicKey, null, TOKEN_2022_PROGRAM_ID),
//         createInitializeInstruction({
//             programId: TOKEN_2022_PROGRAM_ID,
//             mint: mint.publicKey,
//             metadata: mint.publicKey,
//             name: metadata.name,
//             symbol: metadata.symbol,
//             uri: metadata.uri,
//             mintAuthority: payer.publicKey,
//             updateAuthority: payer.publicKey,
//         }),
//     );
//     const tx = await sendAndConfirmTransaction(connection, mintTransaction, [payer, mint]);
//     console.log("Tx ==> ", tx);
//     console.log("mint Token ==> ", mint.publicKey);


//     // const mint = new PublicKey("EEUdf4WpJFsXastpTmrQDdLb1KJCptWPBWWheWjyHk42")

//     // const tokenAcckountKey = await getOrCreateAssociatedTokenAccount(connection, payer, mint, payer.publicKey)
//     // console.log("Associated Token Account >>>>> ", tokenAcckountKey.address);



//     // async function mintSome() {
//     //     const firstRun = false;


//     //     if (firstRun) {
//     //         // const sourceAccount = await createAccount(
//     //         //     connection,
//     //         //     payer,
//     //         //     mint.publicKey,
//     //         //     payer.publicKey,
//     //         //     tokenAcckountKey.address,
//     //         //     undefined,
//     //         //     TOKEN_2022_PROGRAM_ID
//     //         // );
//     //     }
//     //     await mintTo(
//     //         connection,
//     //         payer,
//     //         mint.publicKey,
//     //         tokenAcckountKey.address,
//     //         payer.publicKey,
//     //         4269000000000,
//     //         [],
//     //         undefined,
//     //         TOKEN_2022_PROGRAM_ID
//     //     );
//     // }
//     // await mintSome()


//     console.log("DONE..");


// })();






