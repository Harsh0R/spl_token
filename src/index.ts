import * as web3 from "@solana/web3.js"
import { createTokenMetadataFunc, initializeKeypair, mintNFTFunc, mintTokenFunc, showAllMintedFunc, transferTokenFunc, updateNFTFunc, updateTokenMetadataFunc } from "./allFuncs"
import { Metaplex, bundlrStorage, keypairIdentity } from "@metaplex-foundation/js";

const recipient = "7EYKTmaar251NJUfbAtUQV4FDTTPM8o3AFgN4t6CVLqo";
const recipientAddress = new web3.PublicKey(recipient);
const connection: web3.Connection = new web3.Connection(web3.clusterApiUrl('devnet'), 'confirmed')
const mintTokenAmount = 696969690000000000;
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
  console.log("\n\n\n");
  console.log("------------------ All Tokens that you own ... 🔑  ------------------");
  await showAllMintedFunc(connection, user)




  // Add token Metadata to token
  console.log("\n\n\n");
  console.log("------------------ Adding Token Metadata ... 🖼️  ------------------");
  await createTokenMetadataFunc(
    connection,
    metaplex,
    mintAccount,
    user,
    "AvatarONe Token",
    "AT1",
    "This is description of My new token AvatarOne1."
  )
  console.log("------------------ Token Metadata added ✅ ------------------");





  // update Token metadata
  console.log("\n\n\n");
  console.log("------------------ update Token Metadata ... 🖼️  ------------------");
  // const mintAccount1 = new web3.PublicKey('D2kJB1SN8uo6fByWGoaf7sbv6BqfiZtjBV3aDhCrkcDx'),
  await updateTokenMetadataFunc(
    connection,
    metaplex,
    mintAccount,
    user,
    "Puc Puk",
    "PD",
    "This is description of My updated token PDPDPDPDPD."
  )
  console.log("------------------ updated Token Metadata ✅ ------------------");





  //Transfer Token
  console.log("\n\n\n");
  console.log("------------------ Transfer token ... 💫 ------------------");
  const recipient = "7EYKTmaar251NJUfbAtUQV4FDTTPM8o3AFgN4t6CVLqo";
  const recipientAddress = new web3.PublicKey(recipient);
  const transferAmount = 6900690000000000
  await transferTokenFunc(connection, user, ATA, recipientAddress, mintAccount , transferAmount)
  console.log("Transfered  ✅");




  // Mint NFTs
  console.log("\n\n\n");
  console.log("------------------ Mint NFT ... 🖼️  ------------------");
  const tokenName = "myNFT"
  const description = "Description for my new NFT"
  const symbol = "MF"
  const sellerFeeBasisPoints = 100
  const imageFile = "/assets/XOsX.gif"
  await mintNFTFunc(
    connection,
    metaplex,
    mintAccount,
    user,
    tokenName,
    symbol,
    description
  )
  console.log("------------------ Minted NFT ... 🖼️ ------------------");




  // Update NFT Metadata
  console.log("\n\n\n");
  console.log("------------------ Update NFT ... 🖼️ ------------------");
  const mintAcc = new web3.PublicKey("71dVLJqFtFuzAtnZhw6eiwDzXnizMZAgHg4s7D9Mfc9x")
  await updateNFTFunc(
    connection,
    metaplex,
    mintAcc,
    user,
    "New NFT",
    "NTNT",
    "This is description of My updated token AvatarOne1."
  )
  console.log("------------------ Updated NFT ... ✅ ------------------");





  console.log("\n\n");
  console.log("------------------ DONE ✅ ------------------");


}

main()







