import express from "express";
import jwtUtil from "../utils/jwt-util";
import mysql from "../mysql/mysql-config";

const app = express.Router();

export default app;

app.get("/protected", async (req, res) => {
    const authorization = req.headers["authorization"];

    try {
        const token = authorization?.split(" ")[1] as string;

        jwtUtil.verify(token);

        return res.send(
            "This is a protected content that requires authentication"
        );
    } catch (error) {
        return res.status(401).send("");
    }
});

app.post("/txn-wallet", async (req, res) => {

    const {userId} = req.body;

    const users = await mysql.queryUser('select * from user where id = ? limit 1', [userId]);
    if (!users.length){
        return res.status(404).send("user not found");
    }

    // locate wallet transactions
    const walletTxns = await mysql.queryWallet('select * from transaction where userId = ? order by txnDate', [userId]);

    const arr:string[] = []

    for (const txn of walletTxns) {

        const {targetUserId, targetMerchantId, targetCardId, amount, txnDate, paymentType} = txn;

        let targetFullName = '';

        if (targetUserId || targetMerchantId) {
            targetFullName = (await mysql.queryUser('select fullName from user where id = ? limit 1', [targetUserId ?? targetMerchantId])).map(x=>x.fullName)[0];
        } else if (targetCardId){
            const cardNumber = (await mysql.queryCard('select cardNumber from card where id = ?', [targetCardId])).map(x=>x.cardNumber)[0];
            targetFullName = `Card ${cardNumber}`;
        }

        if (!targetFullName){
            console.error(`undefined target targetUserId=${targetUserId} targetMerchantId=${targetMerchantId}`);
        }

        arr.push(`${paymentType} made to ${targetFullName} at ${txnDate}`);

    }

    return res.json(arr);

})

app.post("/txn-card", async (req, res) => {

    const {userId} = req.body;

    const users = await mysql.queryUser('select * from user where id = ? limit 1', [userId]);
    if (!users.length){
        return res.status(404).send("user not found");
    }

    const cardIds = (await mysql.queryWallet('select cardId from wallet_card where userId = ?', [userId])).map(x=>x.cardId)

    if (!cardIds.length){
        return res.json([]);
    }

    const txns = await mysql.queryCard('select * from transaction where cardId in (?) order by txnDate desc', [cardIds]);

    const arr:string[] = []

    for (const txn of txns) {

        const {cardId, locationId, amount, txnDate, paymentType} = txn;

        const cardNumber = (await mysql.queryCard('select cardNumber from card where id = ?', [cardId])).map(x=>x.cardNumber)[0];
        const locationName = (await mysql.queryLocation('select name from location where id = ?', [locationId])).map(x=>x.name)[0];
       
        arr.push(`${cardNumber} made ${paymentType} ${amount} at ${locationName} at ${txnDate}`);

    }

    return res.json(arr);

})