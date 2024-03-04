import express from "express";
import mysql from "../mysql/mysql-config";
import { v4 as uuidv4 } from 'uuid';
import { randomDateBetween, randomDouble, randomIndex, randomWalletLocation, randomTransactionStatus, randomCardNumber, randomInt } from "../utils/random-util";

const app = express.Router();

export default app;

app.post("/reset", async (req, res) => {

    try {
        await mysql.executeUser('delete from `user`');

        await mysql.executeWallet('delete from wallet');
        await mysql.executeWallet('delete from transaction');
        await mysql.executeWallet('delete from wallet_card')
        
        await mysql.executeCard('delete from card')
        await mysql.executeCard('delete from transaction')
        
        await mysql.executeMerchant('delete from merchant')
        
        await mysql.executeLocation('delete from location')

        // generate 10 normal users along with and their wallet account
        // generate another 10 merchant users
        for (let userId = 1; userId <= 20; userId++){
            const username = `user-${userId}`;
            const fullName = `USER ${userId}`;
            const values = [username, fullName];
            await mysql.executeUser('insert into `user` (username, fullName) values (?, ?)', values);

            if (userId <= 10) {
                await mysql.executeWallet('insert into `wallet` (userId) values (?)', [userId]);
            } else {
                // bind merchant accounts
                await mysql.executeMerchant('insert into `merchant` (userId) values (?)', [userId]);
            }
            
        }

        // userId even value will have 3 smartcards else 5
        let cardId = 1;
        for (let userId = 1; userId <= 10; userId++) {

            const totalCards = userId % 2 === 0 ? 3 : 5;

            for (let j = 0 ; j < totalCards; j++) {
                const cardNumber = randomCardNumber();
                await mysql.executeCard('insert into `card` (cardNumber) values (?)', [cardNumber])            
                await mysql.executeWallet('insert into `wallet_card` (userId, cardId) values (?, ?)', [userId, cardId] )

                cardId += 1;
            }

        }

        const queries:Promise<any>[] = [];

        const allUserIds = (await mysql.queryUser('select id from user')).map(x=>x.id);

        // generate 10 wallet transactions
        for (let i = 0; i < 100000; i++) {

            const userId = randomInt(1, 10);
            const amount = randomDouble(-1000, 1000, 2);
            const txnDate = randomDateBetween(new Date(2023, 0, 1), new Date(2024, 1, 29));

            const isFundTransfer = randomInt(1, 2) === 1;

            if (isFundTransfer) {

                const userIds = allUserIds.filter(x=>x !== userId);
                const idx = randomIndex(userIds);
                const targetUserId = userIds[idx];

                const sql = `insert into transaction (userId, ${targetUserId <= 10 ? 'targetUserId' : 'targetMerchantId'}, amount, txnDate, paymentType) values (?, ?, ?, ?, ?)`

                const values = [
                    userId,
                    targetUserId,
                    amount,
                    txnDate,
                    'FUND_TRANSFER'
                ]

                queries.push(mysql.executeWallet(sql, values));

                // await mysql.executeWallet(sql, values)


            } else {

                mysql.queryWallet('select cardId from wallet_card where userId = ?', [userId])
                    .then((cardIds) => {

                        const cardId = cardIds[randomIndex(cardIds)].cardId
                
                        // given the cardId...
                        const sql = 'insert into transaction (userId, targetCardId, amount, txnDate, paymentType) values (?, ?, ?, ?, ?)'

                        const values = [
                            userId,
                            cardId,
                            Math.abs(amount), // reloads must be +ve value
                            txnDate,
                            'RELOAD'
                        ]

                        // await mysql.executeWallet(sql, values)
                        queries.push(mysql.executeWallet(sql, values));

                    })

            }

        }

        console.log(`waiting for wallet txns to be completed...`);
        await Promise.all(queries);

        queries.length = 0;

        const numNonBindedCards = 1000;
        const numMrtStations = 100;
        const numBusStations = 100;
        const numSevenElevens = 100;
        const numVendingMachines = 100;
        const numCardTxns = 100000;

        // create 100 non-binded card numbers
        for (let i = 1; i <= numNonBindedCards; i++) {
            const nonBindedCardNumber = randomCardNumber();
            await mysql.executeCard('insert into card (cardNumber) values (?)', [nonBindedCardNumber])
        }

        // generate 10 locations - MRT
        for (let i = 1; i <= numMrtStations; i++) {
            const code = `${i}`.padStart(3, "0");
            const values = [`MRT_${code}`, `MRT Station ${code}`]
            await mysql.executeLocation('insert into location (code, name) values (?, ?)', values);
        }

        // generate 10 locations - BUS
        for (let i = 1; i <= numBusStations; i++) {
            const code = `${i}`.padStart(3, "0");
            const values = [`BUS_${code}`, `Bus Station ${code}`]
            await mysql.executeLocation('insert into location (code, name) values (?, ?)', values);
        }

        // generate 10 locations - 7-11s
        for (let i = 1; i <= numSevenElevens; i++) {
            const code = `${i}`.padStart(3, "0");
            const values = [`711_${code}`, `Seven Eleven ${code}`]
            await mysql.executeLocation('insert into location (code, name) values (?, ?)', values);
        }

        // generate 10 locations - Vending Machines to reload card
        for (let i = 1; i <= numVendingMachines; i++) {
            const code = `${i}`.padStart(3, "0");
            const values = [`VM_${code}`, `Vending Machine ${code}`]
            await mysql.executeLocation('insert into location (code, name) values (?, ?)', values);
        }

        // get all card ids
        const randomCardIds = (await mysql.executeCard('select id from card')).map(card=>card.id);

        const allLocations = (await mysql.executeLocation(`select * from location`));
        const mrtIds = allLocations.filter(x=>(x.code as string).startsWith('MRT')).map(x=>x.id);
        const busIds = allLocations.filter(x=>(x.code as string).startsWith('BUS')).map(x=>x.id);
        const seIds = allLocations.filter(x=>(x.code as string).startsWith('711')).map(x=>x.id);
        const vmIds = allLocations.filter(x=>(x.code as string).startsWith('VM')).map(x=>x.id);
        
        // pick a random card and insert to card transaction
        for (let i = 1; i <= numCardTxns; i++) {

            const cardId = randomIndex(randomCardIds);
            let amount = randomDouble(-100, 100, 2);
            const txnDate = randomDateBetween(new Date(2023, 0, 1), new Date(2024, 1, 29));
            let locationId = -1;
            // if MRT, amount always -ve
            // if 711, amount maybe +ve or -ve
            // if VM, amount always +ve
            
            // roll to decide whether txn is for MRT (1), 711 (2) or VM (3)
            const roll = randomInt(1,3);
            let paymentType = roll === 3 ? "RELOAD" : "FUND_TRANSFER";

            if (roll === 1) {
                // MRT
                if (amount >= 0){
                    amount *= -1; 
                }

                const mrtOrBusRoll = randomInt(1, 2);

                locationId = mrtOrBusRoll === 1 ? mrtIds[randomIndex(mrtIds)] : busIds[randomIndex(busIds)];
            } 
            else if (roll === 2){
                locationId = seIds[randomIndex(seIds)]
            }
            else if (roll === 3) {
                // VM
                if (amount <= 0){
                    amount = Math.abs(amount);
                }

                locationId = vmIds[randomIndex(vmIds)]

            }

            const values = [cardId, locationId, amount, txnDate, paymentType]
            const sql = 'insert into transaction (cardId, locationId, amount, txnDate, paymentType) values (?, ?, ?, ?, ?)'
            const promise = mysql.executeCard(sql, values);
            queries.push(promise);
        }

        await Promise.all(queries);

        return res.send("ok");

    } catch (error) {
        
        console.error(error);

    }
});

