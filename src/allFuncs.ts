import * as web3 from "@solana/web3.js";
import * as fs from "fs"
import dotenv from "dotenv"
import {
    Metaplex,
    keypairIdentity,
    bundlrStorage,
    toMetaplexFile,
    findMetadataPda,
    useOperation,
} from "@metaplex-foundation/js"
import {
    DataV2,
    createCreateMetadataAccountV3Instruction,
    createUpdateMetadataAccountV2Instruction,
    createCreateMetadataAccountV2Instruction,
} from "@metaplex-foundation/mpl-token-metadata"
import { AccountLayout, TOKEN_PROGRAM_ID, createMint, getAccount, getMint, getOrCreateAssociatedTokenAccount, mintTo, transfer } from "@solana/spl-token";


dotenv.config()

export async function initializeKeypair(
    connection: web3.Connection
): Promise<web3.Keypair> {
    if (!process.env.PRIVATE_KEY) {
        console.log("Creating .env file")
        const signer = web3.Keypair.generate()
        fs.writeFileSync(".env", `PRIVATE_KEY=[${signer.secretKey.toString()}]`)
        await airdropSolIfNeeded(signer, connection)

        return signer
    }

    const secret = JSON.parse(process.env.PRIVATE_KEY ?? "") as number[]
    const secretKey = Uint8Array.from(secret)
    const keypairFromSecretKey = web3.Keypair.fromSecretKey(secretKey)

    // const keypairFromSecretKey = web3.Keypair.fromSecretKey(
    //   bs58.default.decode(
    //     "skJMFYhy9tSnPDQFg9pYWeJE6f2NRe1wm33WePT33zg8mmtRtHPZPKSrgZ8m4BAC2CLA96xP8XyxHQYjdd9B8Vw"
    //   )
    // );

    await airdropSolIfNeeded(keypairFromSecretKey, connection)
    return keypairFromSecretKey
}

async function airdropSolIfNeeded(
    signer: web3.Keypair,
    connection: web3.Connection
) {
    console.log("Sugner pub ==> ", signer.publicKey.toBase58());
    // console.log("Connection ==> " , connection);

    const balance = await connection.getBalance(signer.publicKey)
    console.log("Current balance is", balance / web3.LAMPORTS_PER_SOL)

    if (balance < web3.LAMPORTS_PER_SOL) {
        console.log("Airdropping 1 SOL...")
        const airdropSignature = await connection.requestAirdrop(
            signer.publicKey,
            web3.LAMPORTS_PER_SOL
        )

        const latestBlockHash = await connection.getLatestBlockhash()

        await connection.confirmTransaction({
            blockhash: latestBlockHash.blockhash,
            lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
            signature: airdropSignature,
        })

        const newBalance = await connection.getBalance(signer.publicKey)
        console.log("New balance is", newBalance / web3.LAMPORTS_PER_SOL)
    }
}


export async function mintTokenFunc(user: web3.Keypair, connection: web3.Connection, amount: number, decimal: number) {

    const mintAccount = await createMint(connection, user, user.publicKey, user.publicKey, decimal)
    console.log(":Mint Account => ", mintAccount.toBase58());

    const ATA = await getOrCreateAssociatedTokenAccount(connection, user, mintAccount, user.publicKey)
    console.log("Associated Token Account >>>>> ", ATA.address);

    const txMint = await mintTo(connection, user, mintAccount, ATA.address, user.publicKey, amount)
    console.log("Mint Token To ATA account tx ==> ", txMint);

    const ATAInfo = await getAccount(connection, ATA.address)
    console.log("Associated Token Account Info ... >>>>> ", ATAInfo);

    const mintInfo = await getMint(connection, mintAccount);
    console.log("Mint info ===> ", mintInfo);

    return { mintAccount, ATA }
}

export async function showAllMintedFunc(connection: web3.Connection, user: any) {
    const tokenAccounts = await connection.getTokenAccountsByOwner(
        user.publicKey,
        {
            programId: TOKEN_PROGRAM_ID,
        }
    );

    console.log("Token                                         Balance");
    console.log("------------------------------------------------------------");
    tokenAccounts.value.forEach((tokenAccount) => {
        const accountData = AccountLayout.decode(tokenAccount.account.data);
        console.log(`${new web3.PublicKey(accountData.mint)}   ${accountData.amount}`);
    })
}

export async function transferTokenFunc(connection: web3.Connection, fromWallet: web3.Keypair, fromTokenAccount: any, toWallet: web3.PublicKey, mint: web3.PublicKey , amount:number) {
    // Mint 1 new token to the "fromTokenAccount" account we just created
    const toTokenAccount = await getOrCreateAssociatedTokenAccount(connection, fromWallet, mint, toWallet);


    // Transfer the new token to the "toTokenAccount" we just created
    const signature = await transfer(
        connection,
        fromWallet,
        fromTokenAccount.address,
        toTokenAccount.address,
        fromWallet.publicKey,
        amount
    );


    console.log("Transfer Tx ====>> ", signature);


}

export async function createTokenMetadataFunc(
    connection: web3.Connection, metaplex: Metaplex, mint: web3.PublicKey, user: web3.Keypair, name: string, symbol: string, description: string
) {

    const buffer = fs.readFileSync('assets/avatar1.png');
    const file = toMetaplexFile(buffer, 'avatar1.png');


    const imageUrl = await metaplex.storage().upload(file)
    console.log("Token Image Url ===> ", imageUrl);

    const { uri } = await metaplex.nfts().uploadMetadata({
        name: name, description: description, image: imageUrl
    })
    // for lower version
    // }).run()

    console.log("Metadata uri =====> ", uri);

    const tokenMetadataPDA = await findMetadataPda(mint);

    const tokenMetadata =
        {
            name: name, symbol: symbol, uri: uri, sellerFeeBasisPoints: 0, creators: null, collection: null, uses: null
        } as DataV2

    const instruction = createCreateMetadataAccountV3Instruction({
        metadata: tokenMetadataPDA,
        mint: mint,
        mintAuthority: user.publicKey, payer: user.publicKey, updateAuthority: user.publicKey, systemProgram: web3.SystemProgram.programId
    },
        {
            createMetadataAccountArgsV3: {
                data: tokenMetadata,
                isMutable: true,
                collectionDetails: null
            }
        }
    )

    const transaction = new web3.Transaction();
    transaction.add(instruction);

    const txSign = await web3.sendAndConfirmTransaction(connection, transaction, [user]);

    console.log("Token Metadata added ====> ", txSign);


}

export async function updateTokenMetadataFunc(connection: web3.Connection, metaplex: Metaplex, mint: web3.PublicKey, user: web3.Keypair, name: string, symbol: string, description: string
) {

    const buffer = fs.readFileSync('assets/XOsX.gif');
    const file = toMetaplexFile(buffer, 'XOsX.gif');


    const imageUrl = await metaplex.storage().upload(file)
    console.log("Token Image Url ===> ", imageUrl);

    const { uri } = await metaplex.nfts().uploadMetadata({
        name: name, description: description, image: imageUrl
    })

    console.log("Metadata uri =====> ", uri);

    const tokenMetadataPDA = await findMetadataPda(mint);

    const tokenMetadata =
        {
            name: name, symbol: symbol, uri: uri, sellerFeeBasisPoints: 0, creators: null, collection: null, uses: null
        } as DataV2

    const instruction = createUpdateMetadataAccountV2Instruction({
        metadata: tokenMetadataPDA,
        updateAuthority: user.publicKey
    },
        {
            updateMetadataAccountArgsV2: {
                data: tokenMetadata,
                updateAuthority: user.publicKey,
                primarySaleHappened: true,
                isMutable: true,
            }
        }
    )

    const transaction = new web3.Transaction();
    transaction.add(instruction);

    const txSign = await web3.sendAndConfirmTransaction(connection, transaction, [user]);

    console.log("Token Metadata added ====> ", txSign);


}

export async function mintNFTFunc(
    connection: web3.Connection, metaplex: Metaplex, mint: web3.PublicKey, user: web3.Keypair, name: string, symbol: string, description: string
) {

    const buffer = fs.readFileSync('assets/XOsX.gif');
    const file = toMetaplexFile(buffer, 'XOsX.gif');


    const imageUrl = await metaplex.storage().upload(file)
    console.log("Token Image Url ===> ", imageUrl);

    const { uri } = await metaplex.nfts().uploadMetadata({
        name: name, description: description, image: imageUrl
    })

    console.log("Metadata uri =====> ", uri);

    const { nft } = await metaplex
        .nfts()
        .create({
            uri: uri,
            name: name,
            sellerFeeBasisPoints: 100,
            symbol: symbol,
        })

    console.log(
        `Token Mint: https://explorer.solana.com/address/${nft.address.toString()}?cluster=devnet`
    )

    console.log("nft ====>>> ", nft);

}

export async function updateNFTFunc(
    connection: web3.Connection, metaplex: Metaplex, mint: web3.PublicKey, user: web3.Keypair, name: string, symbol: string, description: string
) {


    // const buffer = fs.readFileSync('assets/XOsX.gif');
    // const file = toMetaplexFile(buffer, 'XOsX.gif');


    // const imageUrl = await metaplex.storage().upload(file)
    // console.log("Token Image Url ===> ", imageUrl);

    // const { uri } = await metaplex.nfts().uploadMetadata({
    //     name: name, description: description, image: imageUrl
    // }).run()

    // const nft = await metaplex.nfts().findAllByMintList({ mint })

    // await metaplex
    //     .nfts()
    //     .update({
    //         nftOrSft: nft,
    //         name: tokenName,
    //         symbol: symbol,
    //         uri: uri,
    //         sellerFeeBasisPoints: sellerFeeBasisPoints,
    //     })



    // console.log(
    //     `Token Mint: https://explorer.solana.com/address/${nft.address.toString()}?cluster=devnet`
    // )

    // console.log("nft ====>>> ", nft);

}