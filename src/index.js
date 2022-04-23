import { getConnection } from "./redis-client/index.js";

//Configurables
const REDIS_URL = 'redis://localhost:6379';
const PATTERN = 'ABCDEDFGHIJKLMNOPQRSTUVWXYZ123456789abcdedfghijklmnopqrstuvwxyz';
const OTP_LENGTH = 6;
//TIMEOUT in MS
const TIMEOUT = 300;
let redis = null;


//Store otp in redis
const storeOtp = async(otp, transactionId) => {
    await redis.set(otp, transactionId, TIMEOUT);
    return;
}

const alphanumeric = (num, res = "") => {
    if(num > PATTERN.length) return null;
	if (!num) return res;
	const random = (Math.random() * (PATTERN.length - 1)).toFixed();
	return alphanumeric(num - 1, res + PATTERN[random]);
};

const genereateOtp = async(transactionId) => {
    const otp = alphanumeric(OTP_LENGTH);
    await storeOtp(otp, transactionId);
    return otp;
}

const getOtpTransaction = async(otp) => {
    return redis.get(otp);
}

const test = async() => {
    if(!redis) redis = await getConnection(REDIS_URL);
    const otp = await genereateOtp('something');
    console.log(otp);
    console.log(await getOtpTransaction(otp));
}

test();