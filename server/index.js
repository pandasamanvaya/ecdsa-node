const express = require("express");
const secp = require("ethereum-cryptography/secp256k1");
const { sha256 } = require("ethereum-cryptography/sha256");
const { toHex, utf8ToBytes } = require("ethereum-cryptography/utils");

const app = express();
const cors = require("cors");
const port = 3042;

app.use(cors());
app.use(express.json());

const balances = {};

const users = [
  {"username": "User1", "password": "", "key" : "e43d5649019b96b3eef6b51db459a97d8e80d7d22e2a2bbbf6d4855ae12afcf6"},
  {"username": "User2", "password": "", "key" : "19a7e2971801bc94a51c6e90e34cf20d8fc2cee8dd297a569e15f72f4101d8f4"},
  {"username": "User3", "password": "", "key" : "ea632f423cc3db0b966e036fbacea42177fca4f6a10a6855910e8cb32a720fd7"}
];

function generateStringHash(message){
  return toHex(sha256(utf8ToBytes(message)));
}
function generateAddress(key){
  return toHex(sha256(secp.getPublicKey(key)));
}
function initUsers(){
  const initBalance = [100, 50, 75];
  const password = ["password1", "password2", "password3"];
  users.forEach((user, index) => {
    user.key = toHex(secp.utils.randomPrivateKey());
    const address = generateAddress(user.key);
    balances[address] = initBalance[index];
    user.password = generateStringHash(password[index]);
  });
  console.log(balances);
}
initUsers();


app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post("/send", (req, res) => {
  
  const { sender, recipient, amount, signature, msgHash } = req.body;
  const senderPubKey = secp.getPublicKey(getUserKey(sender));

  if(!senderPubKey)
    res.status(404).send({message : "Address :" + sender + " doesn't exist"});
  
  const sign = toHex(secp.signSync(generateStringHash("Message"), getUserKey(sender)));
  const isSigned = secp.verify(signature, msgHash, senderPubKey);
  // console.log(getUserKey(sender))
  // console.log(sign)
  // console.log(signature)
  // const isSigned = secp.verify(sign, generateStringHash("Message"), senderPubKey);
  if(!isSigned){
    res.status(403).send({message: "Invalid Signature. Can't transfer someone else's funds"})
  }
  else if (balances[sender] < amount) {
    res.status(400).send({ message: "Not enough funds!" });
  } else {
    balances[sender] -= amount;
    balances[recipient] += amount;
    res.status(200).send({ balance: balances[sender], message : "Transferred funds" });
  }
});

app.post("/login", (req, res) => {
  const { username, password} = req.body;
  const passwordHash = password ? generateStringHash(password) : "";
  const loginUser = users.filter(user => user.username === username && user.password === passwordHash);

  if(loginUser.length)
    res.status(200).send({privateKey : loginUser[0].key, message : username+" logged in."});
  else
    res.status(404).send({message : "Invalid username or password"});
})

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function getUserKey(address) {
  if(balances[address]){
    const key = users.filter(user => generateAddress(user.key) === address);
    return key[0].key;
  }else{
    return "";
  }
}
