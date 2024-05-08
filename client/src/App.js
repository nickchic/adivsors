import { useState } from "react"
import Account from "./components/account"
import Actions from "./components/actions"
import WithdrawalDeposit from "./components/withdrawal-deposit"
import Balance from "./components/balance"

const App = () => {
    const [step, setStep]= useState("account")
    const [account_number, setAccountNumber]= useState(0)

    const onAccountComplete = () => {
      setStep("actions")
    }

    const onReset = () => {
      setStep("account")
      setAccountNumber(0)
    }

    return ( 
      <div>
        {step == "account" && <Account value={account_number} onChange={setAccountNumber} onComplete={onAccountComplete} />}
        {step == "actions" && <Actions onChange={setStep} />}
        {step == "withdrawal" && <WithdrawalDeposit withdrawal={true} account_number={account_number} onReset={onReset} />}
        {step == "deposit" && <WithdrawalDeposit withdrawal={false} account_number={account_number} onReset={onReset} />}
        {step == "balance" && <Balance account_number={account_number} onReset={onReset} />}
      </div>
    )
}

export default App;
