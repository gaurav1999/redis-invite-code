import { getConnection } from "./redis-client/index.js";

//Configurables
const REDIS_URL = 'redis://localhost:6379';
const PATTERN = 'ABCDEDFGHIJKLMNOPQRSTUVWXYZ123456789abcdedfghijklmnopqrstuvwxyz';
const OTP_LENGTH = 6;
//TIMEOUT in MS
const TIMEOUT = 300;
let redis = null;


//Store invite code in redis
const storeInviteCode = async(inviteCode, resourceId) => {
    const inviteExists = await redis.get(inviteCode);
    if(!!inviteExists) return false;
    await redis.set(inviteCode, resourceId, TIMEOUT);
    return true;
}

const alphanumeric = (num, res = "") => {
    if(num > PATTERN.length) return null;
	if (!num) return res;
	const random = (Math.random() * (PATTERN.length - 1)).toFixed();
	return alphanumeric(num - 1, res + PATTERN[random]);
};

const generateInviteCode = async(resourceId) => {
    let inviteCode = alphanumeric(OTP_LENGTH);
    while(!!await getInviteResource(inviteCode))  {
        inviteCode = alphanumeric(OTP_LENGTH);
    }
    await storeInviteCode(inviteCode, resourceId);
    return inviteCode;
}

const getInviteResource = async(inviteCode) => {
    return redis.get(inviteCode);
}

const redeemInviteCode = async(inviteCode) => {
    const resourceId = await getInviteResource(inviteCode);
    if(!!resourceId) {
        //Do something to redeem the resource
        console.log(`consuming resource ... ${resourceId}`);
        //Explicitly deleting the invite. (Single use only).
        await redis.del(inviteCode);
        return true;
    }
    console.log("Invite expired or not found");
    return false;
}

const test = async() => {
    if(!redis) redis = await getConnection(REDIS_URL);
    const inviteCode = await generateInviteCode('resource-id');
    console.log(inviteCode); //Get invite code generated and stored in redis with resource-id as value.
    await redeemInviteCode(inviteCode);
    await redeemInviteCode(inviteCode); //Will return false
}

test();