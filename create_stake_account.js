const { 
  Connection,
  clusterApiUrl,
  Keypair,
  LAMPORTS_PER_SOL,
  StakeProgram,
  Authorized,
  Lockup,
  sendAndConfirmTransaction,
} = require("@solana/web3.js");

const main = async () => {
  const connection = new Connection(clusterApiUrl('devnet'), 'processed');
  const wallet = Keypair.generate()
  const airdropSignature = await connection.requestAirdrop(
    wallet.publicKey,
    1 * LAMPORTS_PER_SOL
  );
  await connection.confirmTransaction(airdropSignature);
  // const balance = await connection.getBalance(wallet.publicKey);
  // console.log(balance);
  console.log(`creating stakeAccount`);
  const stakeAccount = Keypair.generate();
  const minimumRent = await connection.getMinimumBalanceForRentExemption(StakeProgram.space);
  const amountUserWantsToStake = 0.5 * LAMPORTS_PER_SOL;
  const amountToStake = minimumRent + amountUserWantsToStake;
  const createStackAccountTx = StakeProgram.createAccount({
    authorized: new Authorized(wallet.publicKey, wallet.publicKey),
    fromPubkey: wallet.publicKey,
    lamports: amountToStake,
    lockup: new Lockup(0, 0, wallet.publicKey),
    stakePubkey: stakeAccount.publicKey
  });
  console.log(`creating createStackAccountTx`);
  const createStackAccountTxId = await sendAndConfirmTransaction(
    connection,
    createStackAccountTx,
    [wallet, stakeAccount]
  );
  console.log(`Stake account created Tx Id: ${createStackAccountTxId}`);

  let stakeBalance = await connection.getBalance(stakeAccount.publicKey)
  console.log(`Stake account balance: ${stakeBalance  / LAMPORTS_PER_SOL} SOL`);

  let stakeStatus = await connection.getStakeActivation(stakeAccount.publicKey);
  console.log(`Stake account status: ${stakeStatus.state}`);

}

const runMain = async () => {
  try {
    await main();
  } catch (error) {
    console.error(error);
  }
};

runMain();