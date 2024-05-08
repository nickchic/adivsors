import db from "./db.js"
import { updateBalance, getAccountById, logTransaction, getTodaysWithdrawalsTotal } from "./utils.js"
import express from "express"

const app = express()
const port = 3030

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*"); 
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  })

app.use(express.json())       
app.use(express.urlencoded())

app.get('/users', async (req, res) => {
    const query_result = await db.query("SELECT * from accounts")
    res.send(query_result.rows)
})

//returns account balance for a single user
app.get('/check/:accountNumber', async (req, res) => {
    const account_number = req?.params?.accountNumber ?? ""

    if(!account_number) {
        res.statusCode = 500
        res.send("You must include a account number")
        return
    }
    
    const query_result = await db.query("SELECT amount from accounts where account_number = " + account_number)
    
    if(!query_result.rows.length) {
        res.statusCode = 404
        res.send("No such account number")
        return
    }
    
    res.send(query_result.rows[0])
})

//returns a list of all transactions for a single user.
app.get('/transactions/:accountNumber', async (req, res) => {
    const account_number = req?.params?.accountNumber ?? ""

    if(!account_number) {
        res.statusCode = 500
        res.send("You must include a account number")
        return
    }
    
    const query_result = await db.query("SELECT * from transactions where account_number = " + account_number)
    
    if(!query_result.rows.length) {
        res.statusCode = 404
        res.send("No transactions for this account.")
        return
    }
    
    res.send(query_result.rows)
})

//for debugging, clears the transactions table
app.get('/clear-transactions', async (req, res) => {
    await db.query(
        `DROP TABLE IF EXISTS transactions;
         CREATE TABLE transactions (
            account_number INTEGER NOT NULL,
            date DATE NOT NULL,
            amount INTEGER NOT NULL,
            type VARCHAR NOT NULL
        );`
    )
    
    res.send("ok")
})


//handles withdrawals
app.post('/withdrawal', async (req, res) => { 
    const { body } = req

    if(!body) {
        res.statusCode = 500
        res.send("Request has no body")
        return
    }

    const { account_number, amount } = body

    if(!account_number || !amount) {
        res.statusCode = 500
        res.send("Must provide account_number and amount.")
        return
    }


    const account = await getAccountById(account_number)

    if(!account) {
        res.statusCode = 404
        res.send("No such account.")
        return
    }

    //A customer can withdraw no more than $200 in a single transaction
    if(amount > 200) {
        res.statusCode = 500
        res.send("Cannot take out more than $200 in a single transaction")
        return
    }

    //A customer can withdraw no more than $400 in a single day. 
    //TODO
    const todays_withdrawals_total = await getTodaysWithdrawalsTotal(account_number)
    
    if(amount + todays_withdrawals_total > 400) {
        res.statusCode = 500
        res.send("Cannot take out more than $400 in a day")
        return
    }

    //A customer can withdraw any amount that can be dispensed in $5 bills.
    if(amount % 5 != 0) {
        res.statusCode = 500
        res.send("Withdrawal amount must be divisible by 5")
        return
    }

    const new_balance = account.amount - amount

    //The customer cannot withdraw more than they have in their account
    if(new_balance < 0 && account.type != "credit") {
        res.statusCode = 500
        res.send("Cannot withdrawal more than your balance.")
        return
    }

    //unless it is a credit account, in which case they cannot withdraw more than their credit limit.
    if(new_balance < 0 && account.type == "credit" && Math.abs(new_balance) > account.credit_limit) {
        res.statusCode = 500
        res.send("Cannot withdrawal more than your credit limit.")
        return
    }

    await updateBalance(account_number, new_balance)
    await logTransaction(account_number, "withdrawal", amount)

    res.send({ balance: new_balance })
})

//handles deposits
app.post('/deposit', async (req, res) => { 
    const { body } = req

    if(!body) {
        res.statusCode = 500
        res.send("Request has no body")
        return
    }

    const { account_number, amount } = body

    if(!account_number || !amount) {
        res.statusCode = 500
        res.send("Must provide account_number and amount.")
        return
    }

    const account = await getAccountById(account_number)

    if(!account) {
        res.statusCode = 404
        res.send("No such account.")
        return
    }

    //A customer cannot deposit more than $1000 in a single transaction.
    if(amount > 1000) {
        res.statusCode = 500
        res.send("Cannot deposit more than $1000 in a single transaction.")
        return
    }

    const new_balance = account.amount + amount

    //If this is a credit account, the customer cannot deposit more in their account than is needed to 0 out the account.
    if(account.type == "credit" && new_balance > 0) {
        res.statusCode = 500
        res.send("Cannot deposit more than is owed.")
        return
    }

    await updateBalance(account_number, new_balance)
    await logTransaction(account_number, "deposit", amount)

    res.send({ balance: new_balance })
})

app.listen(port, async () => {
    await db.connect()
    console.log(`Listening on port ${port}`)
})