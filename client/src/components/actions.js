const Actions = (props) => {
    const { onChange } = props 

  return ( 
    <div>
        <label>What would you like to do?</label>
        <button onClick={() => onChange("withdrawal")}>Withdrawal</button>
        <button onClick={() => onChange("deposit")}>Deposit</button>
        <button onClick={() => onChange("balance")}>View Balance</button>
    </div>
  );
}

export default Actions
