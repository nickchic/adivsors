import Axios from "axios"
import { useEffect, useState } from "react"

const Withdrawal = (props) => {
    const { onReset, account_number, withdrawal } = props 
    const [balance, setBalance] = useState(0)
    const [complete, setComplete] = useState(false)
    const [amount, setAmount] = useState(0)
    const [errorMessage, setErrorMessage] = useState("")

    const onSubmit = () => {
        Axios
            .post("http://localhost:3030/" + (withdrawal ? "withdrawal" : "deposit"), { 
                account_number,
                amount,
            })
            .then((res) => {
                setBalance(res?.data?.balance || 0)
                setComplete(true)
            })
            .catch((e) => {
                setErrorMessage(e.response.data)
            })
    }

    if(errorMessage) {
        return ( 
            <div>
                <div className="error">{errorMessage}</div>
                <button onClick={onReset}>Start Over</button>
            </div>
        )
    }

    if(complete) {
        return (
            <div>
                <h1>Completed!</h1>
                <div>You now have ${balance} in your account.</div>
                <button onClick={onReset}>Start Over</button>
            </div>
        )
    }

    return ( 
        <div>
            <label>How much do you want to {withdrawal ? "withdrawal" : "deposit"}?</label>
            <input type="text" value={amount ?? 0} onChange={(e) => setAmount(parseInt(e.target.value) || 0)}/>
            <button disabled={!amount} onClick={onSubmit}>Continue</button>
            <button onClick={onReset}>Start Over</button>
        </div>
    );
}



export default Withdrawal
