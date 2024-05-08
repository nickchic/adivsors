import Axios from "axios"
import { useEffect, useState } from "react"

const Balance = (props) => {
    const { onReset, account_number } = props 

    const [errorMessage, setErrorMessage] = useState("")
    const [balance, setBalance] = useState(0)

    useEffect(() => {
        Axios
            .get("http://localhost:3030/check/" + account_number)
            .then((res) => {
                setBalance(res?.data?.amount || 0)
            })
            .catch((e) => {
                console.log(e)
                setErrorMessage(e.response.data)
            })
    }, [account_number])

    if(errorMessage) {
        return ( 
            <div>
                <div className="error">{errorMessage}</div>
                <button onClick={onReset}>Start Over</button>
            </div>
        )
    }

    return ( 
        <div>
            <h1>Completed!</h1>
            <div>Your balance is ${balance}</div>
            <button onClick={onReset}>Start Over</button>
        </div>
    )
}

export default Balance
