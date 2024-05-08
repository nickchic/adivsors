import db from "./db.js"


export const updateBalance = async (account_number, amount) => {
    const res = await db.query(
        `UPDATE accounts SET amount = ${amount} WHERE account_number = ${account_number}`
    )
}

export const getAccountById = async (account_number) => {
    const res = await db.query(
        `SELECT * FROM accounts WHERE account_number = ${account_number}`
    )

    return res.rows[0]
}

export const logTransaction = async (account_number, type, amount) => {
    let date = new Date();
    let formattedDate = `${(date.getMonth() + 1)}/${date.getDate()}/${date.getFullYear()}`;

    const res = await db.query(
        `INSERT INTO transactions (account_number, type, amount, date) 
         VALUES (${account_number}, '${type}', ${amount}, '${formattedDate}')`
    )
}

export const getTodaysWithdrawalsTotal = async (account_number) => {

    const res = await db.query(
        `SELECT SUM(amount) FROM transactions WHERE account_number = ${account_number} AND date::date = now()::date`
    )

    const num = parseInt(res.rows[0]?.sum ?? 0)

    return num ? num : 0
}