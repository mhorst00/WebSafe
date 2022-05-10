import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { encryptionModule } from "../encryption";
import { copyStringToClipboard, redirect } from "./helper";
import {
  authorizedRequest,
  getSafe,
  getUserName,
  sendSafe,
  loginUser,
  deleteAccountRequest,
} from "./api";

import "./Dashboard.css";

function Dashboard() {
  const { logout, authState, userEmail, userPassword, login } =
    useContext(AuthContext); //Enable the use of the AuthContext

  const [link, setLink] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [settings, setSettings] = useState(false);
  const [entrys, setEntrys] = useState([]);
  const [reset, setReset] = useState("E-Mail");
  const [resetValue, setResetValue] = useState("");
  const [failed, setFailed] = useState(undefined);
  const [seconds, setSeconds] = useState(0);
  const [ready, setReady] = useState(false); //disable preemptive post of save


  const handleSelect = (event) => {
    setReset(event.target.value);
  };

  const onChangeLink = (event) => {
    setLink(event.target.value);
  };

  const onChangeEmail = (event) => {
    setEmail(event.target.value);
  };

  const onChangePassword = (event) => {
    setPassword(event.target.value);
  };

  const onChangeReset = (event) => {
    setResetValue(event.target.value);
  };

  const newEntry = () => { //Insert new entry into array
    setEntrys([...entrys, { link, email, password }]);
    setLink("");
    setEmail("");
    setPassword("");
  };

  const deleteEntry = (deleteIndex) => { //Delete entry in array 
    const entrysCopy = entrys;
    setEntrys([
      ...entrysCopy.slice(0, deleteIndex),
      ...entrysCopy.slice(deleteIndex + 1),
    ]);
  };

  const changeAccount = async () => { //Change the email or password
    const userName = await getUserName(authState);
    
    await new Promise(async function (resolve, reject) {
      let request = authorizedRequest("POST", "/user/change", authState);
      request.onload = function () {
        if (request.status === 200) {
          resolve(request.status);
        } else {
          setFailed(JSON.parse(request.responseText).message);
          reject(request.status);
        }
      };
      request.onerror = function () {
        setFailed(JSON.parse(request.responseText).message);
        reject(request.status);
      };

      switch (reset) { //selection of what will be changed
        case "E-Mail":
          let matchEmail = /\S+@\S+\.\S+/;
          if (!matchEmail.test(resetValue)) {
            setFailed("E-Mail address is not valid");
            return;
          }
          if (resetValue === userEmail) {
            setFailed("You cannot set the same email");
            return;
          }
          await encryptionModule.initialise(resetValue, userPassword);
          if (await sendSafe(entrys, authState)) {
            request.send(
              JSON.stringify({
                username: resetValue,
                full_name: userName,
                password: encryptionModule.authHash,
              })
            );
          }
          break;
        case "Password":
          if (resetValue.length < 8) {
            setFailed("Password must have at least 8 characters");
            return;
          }
          if (resetValue === userPassword) {
            setFailed("You cannot set the same password");
            return;
          }
          await encryptionModule.initialise(userEmail, resetValue);
          if (await sendSafe(entrys, authState)) {
            request.send(
              JSON.stringify({
                username: userEmail,
                full_name: userName,
                password: encryptionModule.authHash,
              })
            );
          }
          break;
        default:
          break;
      }
    });
    setFailed(undefined);
    logout();
  };

  const deleteAccount = async () => { //Löscht den Account endgültig
    try {
      await deleteAccountRequest(authState);
      logout();
    } catch (err) {
      setFailed('Delete Account error: ' + err);
    }
  };

  useEffect(() => { //The token is to be renewed every five minutes
    let interval = null;
    if (seconds < 10) {
      interval = setInterval(() => {
        setSeconds((seconds) => seconds + 1);
      }, 30000);
    } else {
      clearInterval(interval);
      loginUser(userEmail).then((x) => login(x, userEmail, userPassword));
    }
    return () => clearInterval(interval);
  }, [seconds]);

  
  useEffect(() => { //Update safe when entry change
    if (ready) sendSafe(entrys, authState);
  }, [entrys]);

  
  useEffect(() => { //Fetches the safe from the api and adds it to the entries
    const importData = async () => {
      const safe = await getSafe(authState);
      if (typeof safe !== "number") {
        setEntrys(safe);
      }
      setReady(true);
    };
    importData();
  }, []);

  return (
    <div className="Dashboard">
      {settings ? (
        <div className="Dashboard-Settings-Dialog">
          <div className="Dashboard-Settings-TopLane">
            <div className="Dashboard-Settings-Container-Topic">
              <h3 className="Settings-Container-Topic">Settings</h3>
            </div>
          </div>
          <div className="Account-Container">
            <div className="close-button-container" data-closable>
              <button
                className="close-button"
                aria-label="Close alert"
                type="button"
                onClick={() => {
                  setSettings(false);
                  setFailed(undefined);
                }}
                data-close
              >
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div className="margin-kante">
              <label>Change account details:</label>
              {failed ? (
                <p className="Change-Failed-Text">{failed}</p>
              ) : (
                <p></p>
              )}
            </div>
            <div className="Account-Changer">
              <div>
                <select className="Select-Data" onChange={handleSelect}>
                  <option>E-Mail</option>
                  <option>Password</option>
                </select>
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Your change"
                  onChange={onChangeReset}
                />
              </div>
              <div className="Account-Changer-Save">
                <button className="Save-Button" onClick={changeAccount}>
                  Save
                </button>
              </div>
            </div>
            <div className="Account-Changer-Delete">
              <label>Delete your Account Permantly:</label>
              <button className="Delete-Button" onClick={deleteAccount}>
                Delete your Account
              </button>
            </div>
          </div>
        </div>
      ) : (
        <></>
      )}
      <div className="stick-top">
        <div className="Dashboard-TopLane">
          <div className="Dashboard-Topic-Container">
            <h2 className="Dashboard-Topic">Dashboard</h2>
          </div>
          <div className="Dashboard-Settings-Container">
            <img
              src={"./settings.svg"}
              className="Dashboard-Settings"
              alt="logo"
              onClick={() => setSettings(true)}
            />
          </div>
          <img
            src={"./logout-black.svg"}
            className="Dashboard-Logout"
            alt="logo"
            onClick={() => logout()}
          />
        </div>

        <div className="Dashboard-NewAccount">
          <div className="Dashboard-NewAccount-Entry">
            <div className="Dashboard-Entry-Link">
              <label>Link:</label>
              <input
                type="text"
                value={link}
                placeholder="www.example.com"
                onChange={onChangeLink}
              />
            </div>
            <div className="Dashboard-Entry-Email">
              <label>E-Mail:</label>
              <input
                type="email"
                value={email}
                placeholder="example@example.com"
                onChange={onChangeEmail}
              />
            </div>
            <div className="Dashboard-Entry-Password">
              <label>Password:</label>
              <input
                type="text"
                value={password}
                placeholder="password"
                onChange={onChangePassword}
              />
            </div>
            <div className="Dashboard-Entry-Save">
              <button className="Save-Button" onClick={newEntry}>
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="Dashboard-Password">
        {entrys.map((x, i) => { //A search for an identical or similar entry when the user enters three characters
          let aLink = "";
          if (x.link[0] === "w") {
            aLink = "https://";
          }
          aLink += x.link;

          if (link || email || password) {
            if (link.length > 2 && !x.link.includes(link)) {
              return false;
            }
            if (email.length > 2 && !x.email.includes(email)) {
              return false;
            }
            if (password.length > 2 && !x.password.includes(password)) {
              return false;
            }
          }

          return (
            <div key={i} className="Dashboard-Password-Entry">
              <div className="Dashboard-Entry-Garbage-Container">
                <img
                  src={"./garbage2.svg"}
                  className="Dashboard-Entry-Garbage"
                  alt="logo"
                  onClick={() => deleteEntry(i)}
                />
              </div>
              <div className="Dashboard-Password-Entry-Link">
                <label color="#fff">Link:</label>{" "}
                <input
                  readOnly={true}
                  className="copy"
                  title="Go to Website"
                  value={aLink}
                  spellcheck="false"
                  onClick={() => redirect(aLink)}
                />
              </div>
              <div className="Dashboard-Password-Entry-Email">
                <label color="#fff">E-Mail:</label>{" "}
                <input
                  readOnly={true}
                  className="copy"
                  title="Copy this entry"
                  value={x.email}
                  spellcheck="false"
                  onClick={() => copyStringToClipboard(x.email)}
                />
              </div>
              <div className="Dashboard-Password-Entry-Password">
                <label color="#fff">Password:</label>{" "}
                <input
                  readOnly={true}
                  className="copy"
                  title="Copy this entry"
                  value={x.password}
                  spellcheck="false"
                  onClick={() => copyStringToClipboard(x.password)}
                />
              </div>
              <div className="free"></div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Dashboard;
