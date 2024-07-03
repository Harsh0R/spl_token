import * as web3 from "@solana/web3.js"
import { createTokenMetadataFunc, initializeKeypair, mintTokenFunc, showAllMintedFunc, transferTokenFunc, updateTokenMetadataFunc } from "./allFuncs"
import { Metaplex, bundlrStorage, keypairIdentity } from "@metaplex-foundation/js";

const recipient = "7EYKTmaar251NJUfbAtUQV4FDTTPM8o3AFgN4t6CVLqo";
const recipientAddress = new web3.PublicKey(recipient);
const connection: web3.Connection = new web3.Connection(web3.clusterApiUrl('devnet'), 'confirmed')
const mintTokenAmount = 6969690000000000;
const decimal = 9;

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
  console.log("------------------ Start Mint token ... ⛏️  ------------------");
  const { mintAccount, ATA } = await mintTokenFunc(user, connection, mintTokenAmount, decimal);
  console.log("------------------ Token Mined ✅ ------------------");

  // View all Tokens that you own
  // showAllMintedFunc(connection, user)


  // Add token Metadata to token
  console.log("\n\n\n");
  console.log("------------------ Adding Token Metadata ... 🖼️  ------------------");
  // await createTokenMetadataFunc( 
  //   connection,
  //   metaplex,
  //   mintAccount,
  //   user,
  //   "AvatarONe Token",
  //   "AT1",
  //   "This is description of My new token AvatarOne1."
  // )
  console.log("------------------ Token Metadata added ✅ ------------------");


  console.log("\n\n\n");
  console.log("------------------ update Token Metadata ... 🖼️  ------------------");
  // const mintAccount1 = new web3.PublicKey('D2kJB1SN8uo6fByWGoaf7sbv6BqfiZtjBV3aDhCrkcDx'),
  await updateTokenMetadataFunc(
    connection,
    metaplex,
    mintAccount,
    user,
    "AvatarTwo",
    "AT2",
    "This is description of My updated token AvatarOne1."
  )
  console.log("------------------ updated Token Metadata ✅ ------------------");


  //Transfer Token
  console.log("\n\n\n");
  console.log("------------------ Transfer token ... ➖ ------------------");
  // await transferTokenFunc(connection, user, ATA, recipientAddress, mintAccount)
  console.log("Transfered  ✅");

  console.log("\n\n");
  console.log("------------------ DONE ✅ ------------------");


}

main()







