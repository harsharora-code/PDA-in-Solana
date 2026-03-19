const {PublicKey, Connection, LAMPORTS_PER_SOL, Keypair, Transaction, SystemProgram}  = require("@solana/web3.js")
const {getAssociatedTokenAddress, unpackAccount, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID} = require("@solana/spl-token");
const connection = new Connection("https://api.devnet.solana.com");


async function getPda(PublicKey, mintAddress) {
    const pda = await getAssociatedTokenAddress(PublicKey, mintAddress);
    console.log(pda.toBase58());

}

getPda(new PublicKey("your_public_key"), new PublicKey("mint_address-usdt/usdc"));

async function getTokenBalance(publicKey, mintAddress) {
    const [ataAddress, bump] = PublicKey.findProgramAddressSync(
        [publicKey.toBuffer(), new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA").toBuffer(), mintAddress.toBuffer()],
        new PublicKey("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"),
    );

    const accountData = await connection.getAccountInfo(ataAddress);
   console.log(accountData)
    if(accountData == null) return;
    console.log(accountData.data)
    const innerData = unpackAccount(ataAddress, accountData);
    console.log(innerData.amount);
    console.log(bump);
}

getTokenBalance(new PublicKey("your_public_key"), new PublicKey("mint_address-usdt/usdc"));


// Transcation

const kp  = Keypair.fromSecretKey(Uint8Array.from(["your_private_key"]));
await connection.requestAirdrop(kp, LAMPORTS_PER_SOL);
async function createAccount() {
    const newAccountKeypair = Keypair.generate();
    const txn = new Transaction().add(
        SystemProgram.createAccount({
            fromPubkey: kp.publicKey, //adminpubkey
            newAccountPubkey: newAccountKeypair.publicKey,
            lamports: 0.1 * LAMPORTS_PER_SOL,
            space: 165,
            programId: TOKEN_PROGRAM_ID,
           })     
    );
    
    await connection.sendTransaction(txn, [kp, newAccountKeypair]); //both keypair to sign the txn

    console.log(newAccountKeypair.publicKey.toBase58());
}
createAccount();



async function transfer() { 
    const txn2 = new Transaction().add(
        SystemProgram.transfer({ 
            lamports: 0.1 * LAMPORTS_PER_SOL,
            fromPubkey: kp.publicKey,
            toPubkey: newAccountKeypair.publicKey
        })
    );

    await connection.sendTransaction(txn2, [kp]); //only admin keypair sign the txn

    console.log(newAccountKeypair.publicKey.toBase58());
}
transfer();



async function fromPda() { 
    const [randomPda]  = PublicKey.findProgramAddressSync([], ASSOCIATED_TOKEN_PROGRAM_ID);
    const txn2 = new Transaction().add(
        SystemProgram.createAccount({ 
            fromPubkey: kp.publicKey, //adminpubkey
            newAccountPubkey: randomPda,
            lamports: 0.1 * LAMPORTS_PER_SOL,
            space: 165,
            programId: TOKEN_PROGRAM_ID,
        })
    );

    await connection.sendTransaction(txn2, [kp]); 

    console.log(newAccountKeypair.publicKey.toBase58());
}

fromPda();