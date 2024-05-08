const Account = (props) => {
    const { value, onChange, onComplete } = props 

  return ( 
    <div>
        <label>Please Enter Your Account Number</label>
        <input type="text" value={value ?? 0} onChange={(e) => onChange(parseInt(e.target.value) || 0)}/>
        <button disabled={!value} onClick={onComplete}>Continue</button>
    </div>
  );
}

export default Account
