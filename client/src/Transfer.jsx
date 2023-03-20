import { useState } from "react";
import { signSync } from "ethereum-cryptography/secp256k1";
import { sha256 } from "ethereum-cryptography/sha256";
import { toHex, utf8ToBytes } from "ethereum-cryptography/utils";
import server from "./server";

function generateStringHash(message){
  return toHex(sha256(utf8ToBytes(message)));
}
function Transfer({ setBalance, privateKey }) {
  const [sendAmount, setSendAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [sender, setSender] = useState("");
  const [msgHash, setMessageHash] = useState("");
  const [signature, setSignature] = useState([]);

  const setValue = (setter) => (evt) => setter(evt.target.value);
  console.log(privateKey);
  
  function generateSign(){
    const message = `Send ${sendAmount} from ${sender} to ${recipient}`;
    const messageHash = generateStringHash(message); 
    setMessageHash(messageHash);
    const sign = signSync(messageHash, privateKey);
    setSignature(sign);  
  }

  async function transfer(evt) {
    evt.preventDefault();
    generateSign();
    console.log(msgHash, signature);
    try {
      const {
        data: { balance, message },
      } = await server.post(`send`, {
        sender: sender,
        amount: parseInt(sendAmount),
        recipient : recipient,
        signature: toHex(signature),
        msgHash : msgHash
      });
      setBalance(balance);
      alert(message);
    } catch (ex) {
      alert(ex.response.data.message);
    }
  }

  return (
    <form className="container transfer" onSubmit={transfer}>
      <h1>Send Transaction</h1>
      <label>
        Sender
        <input
          placeholder="Type sender's address"
          value={sender}
          onChange={setValue(setSender)}
        ></input>
      </label>

      <label>
        Send Amount
        <input
          placeholder="1, 2, 3..."
          value={sendAmount}
          onChange={setValue(setSendAmount)}
        ></input>
      </label>

      <label>
        Recipient
        <input
          placeholder="Type receipent's address"
          value={recipient}
          onChange={setValue(setRecipient)}
        ></input>
      </label>

      <input type="submit" className="button" value="Transfer" />
    </form>
  );
}

export default Transfer;
