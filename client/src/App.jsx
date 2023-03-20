import Wallet from "./Wallet";
import Transfer from "./Transfer";
import Login from "./Login";
import "./App.scss";
import { useState } from "react";

function App() {
  const [balance, setBalance] = useState(0);
  const [address, setAddress] = useState("");
  const [privateKey, setPrivateKey] = useState("");
  return (
    <div>
      <Login setPrivateKey={setPrivateKey}/>
      <div className="app">
        <Wallet
          balance={balance}
          setBalance={setBalance}
          address={address}
          setAddress={setAddress}
        />
        <Transfer setBalance={setBalance} privateKey={privateKey}/>
      </div>
    </div>
  );
}

export default App;
