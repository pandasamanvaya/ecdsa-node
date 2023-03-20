import {useState} from "react";
import server from "./server";

function Login({setPrivateKey}){

  const [username, setUsername] = useState("");
  const setValue = (setter) => (evt) => setter(evt.target.value);

  async function loginUser(evt){
    evt.preventDefault();

    let user = prompt("Enter username :");
    let password = prompt("Enter password");
    try{
      const {
        data: { privateKey, message },
      } = await server.post(`login`, {
        username : user,
        password : password
      });
      setUsername(user);
      setPrivateKey(privateKey);
      alert(message);
    }catch(ex){
      alert(ex.response.data.message);
    }
  }

  return(
    <div className="header">
      <input type="submit" className="button" onClick={loginUser} value="Login"></input>
    </div>
  );
}

export default Login;