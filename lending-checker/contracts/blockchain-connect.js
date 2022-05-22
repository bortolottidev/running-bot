import Web3 from "web3";
import aavePool from "./aave-v3-pool.js";
import geist from "./geist.js";

const web3ftm = new Web3(process.env.FTM_RPC_URL);
const geistContract = new web3ftm.eth.Contract(geist.abi, geist.address);

const web3avax = new Web3(process.env.AVAX_RPC_URL);
const aaveContract = new web3avax.eth.Contract(aavePool.abi, aavePool.address);

export const getGeistData = async () =>
  geistContract.methods.getUserAccountData(process.env.MY_ADDRESS).call();

export const getAaveData = async () =>
  aaveContract.methods.getUserAccountData(process.env.MY_ADDRESS).call();

export const formatFromWei = (val) => Web3.utils.fromWei(val);
