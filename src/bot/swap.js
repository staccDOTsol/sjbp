const { calculateProfit, toDecimal, storeItInTempAsJSON } = require("../utils");
const cache = require("./cache");
const { getSwapResultFromSolscanParser } = require("../services/solscan");
const fs = require('fs')
const bs58 = require('bs58')
const { VersionedTransaction, Keypair, Connection, ComputeBudgetProgram, PublicKey, Transaction, TransactionMessage } = require("@solana/web3.js");
const { default: axios } = require("axios");
const {
	borrowObligationLiquidityInstruction,
	flashBorrowReserveLiquidityInstruction,
	flashRepayReserveLiquidityInstruction,
	parseObligation,
	refreshObligationInstruction,
	refreshReserveInstruction,
	SolendAction,
	SolendMarket,
	SolendReserve,
	SOLEND_PRODUCTION_PROGRAM_ID
  } = require( "../solend-sdk" )
const payer = Keypair.fromSecretKey(
	bs58.decode(process.env.SOLANA_WALLET_PRIVATE_KEY)
)
  let configs = 
  {
	"programID": "DLendnZuSiCK4kBRtX126ogq1uRnb1TGGsjW6Tnw1vMJ",
	"assets": [
	  {
		"name": "Solana",
		"symbol": "SOL",
		"decimals": 9,
		"mintAddress": "So11111111111111111111111111111111111111112"
	  },
	  {
		"name": "USDC",
		"symbol": "USDC",
		"decimals": 6,
		"mintAddress": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"
	  },
	  {
		"name": "COPE",
		"symbol": "COPEE",
		"decimals": 6,
		"mintAddress": "8HGyAAB1yoM1ttS7pXjHMa3dukTFGQggnFFH3hJZgzQh"
	  }
	],
	"markets": [
	  {
		"name": "main",
		"address": "F8dCQofhBuspm1sVsrfr8NReJvGn1JfiR9xARnUBQgo1",
		"authorityAddress": "HECVhRpddhzhkn6n1vdiqhQe1Y65yjXuwb45jKspD1VV",
		"reserves": [
		  {
			"asset": "SOL",
			"address": "fuSA8HSSku7BwRsVFWotGcVpwH3QrGtnhqWRS4orhXG",
			"collateralMintAddress": "44PeAshzRSmhzQ3Da9z22YXYRN18PfsTHVXZpcQ7p7TH",
			"jareMint": "7yN93TFSCZqseppJyxXjnAnps7wH1wRtvgemFXksc25t",
			"collateralSupplyAddress": "A8aUS1MBosuSLXwfP16iYL3VgJvPKhLGwGzvpuieRTvJ",
			"liquidityAddress": "CBH6VFEhBatZ265jrfKDMey5NQgMZhedk7piu5BCDYfW",
			"liquidityFeeReceiverAddress": "CBH6VFEhBatZ265jrfKDMey5NQgMZhedk7piu5BCDYfW",
			"userSupplyCap": 4,
			"reserveSupplyCap": 40000
		  },
		  {
			"asset": "USDC",
			"address": "5guv5xt2we2FpPXkSPN8oaz6C876NjiV62Np5RxghDnb",
			"collateralMintAddress": "CnwtgyFcTyuQMKDSU1KCXVS4jPksjJUVQaMkgZ2WU3ny",
			"jareMint": "2DvSLHu3HDTDEdWnYETdTtuywTvenmVQpsvn5ybEbKpA",
			"collateralSupplyAddress": "HxL7nx79BLBwjGKAmnSYPhxdbPCpzHqj7UVb1ni3iUFC",
			"liquidityAddress": "Ho9gUv6Y5KKZzxat5pbnf2skppcVpniss6zrabhWwi1n",
			"liquidityFeeReceiverAddress": "Ho9gUv6Y5KKZzxat5pbnf2skppcVpniss6zrabhWwi1n",
			"userSupplyCap": 10000,
			"reserveSupplyCap": 1000000
		  },
		  {
			"asset": "SRM",
			"address": "CoQgPXDKkBo84K14uFbGqkNmXHjKLYXt6d4BvLY6LWpu",
			"collateralMintAddress": "EHSug7WuXkoPDaeF2Cog4mcZ6SKZ5iJ1rkXFoczrXWqL",
			"jareMint": "kALzvjmLZSWMJMQj1bgdKT9hb3VLCKbnZ8uiPyjU4FJ",
			"collateralSupplyAddress": "4RjkXaYqrKX8pd5t9RvPt4UmhyzuXjKT25ysXWQD2V56",
			"liquidityAddress": "6q7eZ2XBkgrwRpWnaVct6aRTKV9zmiGgXYuCQs4BQsjh",
			"liquidityFeeReceiverAddress": "6q7eZ2XBkgrwRpWnaVct6aRTKV9zmiGgXYuCQs4BQsjh",
			"userSupplyCap": 2500,
			"reserveSupplyCap": 300000
		  }
		]
	  }
	],
	"oracles": {
	  "pythProgramID": "gSbePebfvPy7tRqimPoVecS2UsBvYv46ynrzWocc92s",
	  "switchboardProgramID": "7azgmy1pFXHikv36q1zZASvFq5vFa39TT9NweVugKKTU",
	  "assets": [
		{
		  "asset": "SOL",
		  "oracleAddress": "8GWTTbNiXdmyZREXbjsZBmCRuzdPrW55dnZGDkTRjWvb",
		  "priceAddress": "Gnt27xtC473ZT2Mw5u8wZ68Z3gULkSTb5DuxJy7eJotD",
		  "switchboardFeedAddress": "nu11111111111111111111111111111111111111111"
		},
		{
		  "asset": "USDC",
		  "oracleAddress": "EMkxjGC1CQ7JLiutDbfYb7UKb3zm9SJcUmr1YicBsdpZ",
		  "priceAddress": "JBu1AL4obBcCMqKBBxhpWCNUt136ijcuMZLFvTP7iWdB",
		  "switchboardFeedAddress": "nu11111111111111111111111111111111111111111"
		},
		{
		  "asset": "SRM",
		  "oracleAddress": "2nBBaJ2WozeqyDGaVXAqm3d5YqCjeDhoqpfTjyLNykxe",
		  "priceAddress": "9xYBiDWYsh2fHzpsz3aaCnNHCKWBNtfEDLtU6kS4aFD9",
		  "switchboardFeedAddress": "nu11111111111111111111111111111111111111111"
		} 
	  ]
	}
  }
  let markets = []
  console.log(1)

 


const getTransaction = async(route) => {
	
	let body = {

		userPublicKey: payer.publicKey.toBase58(),
		route: route,
		// to make sure it doesnt close the sol account
		wrapUnwrapSOL: false,
	  }
	  const response = await axios.post(`https://quote-api.jup.ag/v3/swap`,JSON.stringify(body), {headers: {
		// Overwrite Axios's automatically set Content-Type
		'Content-Type': 'application/json'
	  }
	})
   
const data = await response.data.json();
return data 
  };
  let connection = new Connection(
 
	process.env.DEFAULT_RPC,
   { commitment: "recent" }
 );
const swap = async (jupiter, route) => {

	markets = [await SolendMarket.initialize(
		connection,
	  
		"production", // optional environment argument'
		//"9QxPT2xEHn56kREPF83uAhrMXo1UtPL1hS2FfXS9sdpo"
	   // market.address
	  )]
	  let market = markets[0]
	  market = configs.markets[0]
	  var reserve = configs.markets[0].reserves[1]
	  //market.reserves = market.reserves.find(res => res.asset === 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v');
	try {
		const performanceOfTxStart = performance.now();
		cache.performanceOfTxStart = performanceOfTxStart;

		if (process.env.DEBUG) storeItInTempAsJSON("routeInfoBeforeSwap", route);
let goaccs = []
const params = {
	units: 301517 + 301517 + 301517 + 101517 + 101517,
	additionalFee: 1,
  };
  let inputToken = route.marketInfos[0].inputMint
  let outputToken = route.marketInfos[0].inputMint
  let arg = (
	await connection.getTokenAccountsByOwner(
	  payer.publicKey,
	  { mint: new PublicKey(inputToken) }
	)
  ).value[0]
  const ix =
	ComputeBudgetProgram.requestUnits(params);
  let instructions = [
	ix,
	flashBorrowReserveLiquidityInstruction(
	  parseFloat(route.marketInfos[0].inAmount),
	  new PublicKey(reserve.liquidityAddress),
	  arg.pubkey,
	  new PublicKey(reserve.address),
	  new PublicKey(market.address),
	  SOLEND_PRODUCTION_PROGRAM_ID
	),
  ];

  const execute =  await jupiter.exchange({
	routeInfo: route,
});
console.log( execute)
				var {
				
					swapTransaction,
				  } = execute.transactions
  
  
				  await Promise.all(
					  [
						swapTransaction,
					  ]
						.filter(Boolean)
						.map(
						  async (transaction) => {
							// get transaction object from serialized transaction
							
							instructions.push(...transaction.instructions)
						 //   console.log(transaction)
						   // goaccs.push(...transaction.message.addressTableLookups)
						  //  console.log(transaction)
						  ///  const messageV0 = TransactionMessage.decompile(transaction.message)
						  //  console.log(messageV0)
						  //  let hmmm = (transaction.message.compileToV0Message())
						
							 // goaccs.push(...transaction.message.addressTableLookups)
							//  console.log(transaction)
							///  const messageV0 = TransactionMessage.decompile(transaction.message)
							//  console.log(messageV0)
  
							//  let hmmm = (transaction.message.compileToV0Message())
							  
  
						  }
						)
				  )
				  instructions.push(
					flashRepayReserveLiquidityInstruction(
						parseFloat(route.marketInfos[0].inAmount),
						1,
					  arg.pubkey,
					  new PublicKey(
						reserve.liquidityAddress
					  ),
					  new PublicKey(
						reserve.liquidityFeeReceiverAddress
					  ),
					  arg.pubkey,
					  new PublicKey(reserve.address),
					  new PublicKey(market.address),
					  payer.publicKey,
					  SOLEND_PRODUCTION_PROGRAM_ID
					)
				  );

execute.transactions.swapTransaction.instructions = instructions
const result = await execute.execute(); // Force any to ignore TS misidentifying SwapResult type

if (process.env.DEBUG) storeItInTempAsJSON("result", result);

		const performanceOfTx = performance.now() - performanceOfTxStart;

		return [result, performanceOfTx];
	} catch (error) {
		console.log("Swap error: ", error);
	}
};
exports.swap = swap;

const failedSwapHandler = (tradeEntry) => {
	// update counter
	cache.tradeCounter[cache.sideBuy ? "buy" : "sell"].fail++;

	// update trade history
	cache.storeFailedTxInHistory;

	// update trade history
	let tempHistory = cache.tradeHistory;
	tempHistory.push(tradeEntry);
	cache.tradeHistory = tempHistory;
};
exports.failedSwapHandler = failedSwapHandler;

const successSwapHandler = async (tx, tradeEntry, tokenA, tokenB) => {
	if (process.env.DEBUG) storeItInTempAsJSON(`txResultFromSDK_${tx?.txid}`, tx);

	// update counter
	cache.tradeCounter[cache.sideBuy ? "buy" : "sell"].success++;

	if (cache.tradingStrategy === "pingpong") {
		// update balance
		if (cache.sideBuy) {
			cache.lastBalance.tokenA = cache.currentBalance.tokenA;
			cache.currentBalance.tokenA = 0;
			cache.currentBalance.tokenB = tx.outputAmount;
		} else {
			cache.lastBalance.tokenB = cache.currentBalance.tokenB;
			cache.currentBalance.tokenB = 0;
			cache.currentBalance.tokenA = tx.outputAmount;
		}

		// update profit
		if (cache.sideBuy) {
			cache.currentProfit.tokenA = 0;
			cache.currentProfit.tokenB = calculateProfit(
				cache.initialBalance.tokenB,
				cache.currentBalance.tokenB
			);
		} else {
			cache.currentProfit.tokenB = 0;
			cache.currentProfit.tokenA = calculateProfit(
				cache.initialBalance.tokenA,
				cache.currentBalance.tokenA
			);
		}

		// update trade history
		let tempHistory = cache.tradeHistory;

		tradeEntry.inAmount = toDecimal(
			tx.inputAmount,
			cache.sideBuy ? tokenA.decimals : tokenB.decimals
		);
		tradeEntry.outAmount = toDecimal(
			tx.outputAmount,
			cache.sideBuy ? tokenB.decimals : tokenA.decimals
		);

		tradeEntry.profit = calculateProfit(
			cache.lastBalance[cache.sideBuy ? "tokenB" : "tokenA"],
			tx.outputAmount
		);
		tempHistory.push(tradeEntry);
		cache.tradeHistory = tempHistory;
	}
	if (cache.tradingStrategy === "arbitrage") {
		/** check real amounts on solscan because Jupiter SDK returns wrong amounts
		 *  when we trading TokenA <> TokenA (arbitrage)
		 */
		const [inAmountFromSolscanParser, outAmountFromSolscanParser] =
			await getSwapResultFromSolscanParser(tx?.txid);

		if (inAmountFromSolscanParser === -1)
			throw new Error(
				`Solscan inputAmount error\n	https://solscan.io/tx/${tx.txid}`
			);
		if (outAmountFromSolscanParser === -1)
			throw new Error(
				`Solscan outputAmount error\n	https://solscan.io/tx/${tx.txid}`
			);

		cache.lastBalance.tokenA = cache.currentBalance.tokenA;
		cache.currentBalance.tokenA = outAmountFromSolscanParser;

		cache.currentProfit.tokenA = calculateProfit(
			cache.initialBalance.tokenA,
			cache.currentBalance.tokenA
		);

		// update trade history
		let tempHistory = cache.tradeHistory;

		tradeEntry.inAmount = toDecimal(inAmountFromSolscanParser, tokenA.decimals);
		tradeEntry.outAmount = toDecimal(
			outAmountFromSolscanParser,
			tokenA.decimals
		);

		tradeEntry.profit = calculateProfit(
			cache.lastBalance["tokenA"],
			outAmountFromSolscanParser
		);
		tempHistory.push(tradeEntry);
		cache.tradeHistory = tempHistory;
	}
};
exports.successSwapHandler = successSwapHandler;
