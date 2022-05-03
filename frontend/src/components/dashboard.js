import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { encryptionModule } from "../encryption";
import { copyStringToClipboard, redirect } from "./helper";
import { authorizedRequest, getSafe } from "./api";

import "./Dashboard.css";


function Dashboard() {
  const { logout, authState, userEmail, userPassword } = useContext(AuthContext);

  const [link, setLink] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [settings, setSettings] = useState(false);
  const [entrys, setEntrys] = useState([]);

  const [reset, setReset] = useState("");



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
    console.log("onChangeReset");
    setReset(event.target.value);
  };

  const newEntry = () => {
    setEntrys([...entrys, { link, email, password }]);
    setLink("");
    setEmail("");
    setPassword("");
  };

  const deleteEntry = (deleteIndex) => {
    const entrysCopy = entrys;
    setEntrys([
      ...entrysCopy.slice(0, deleteIndex),
      ...entrysCopy.slice(deleteIndex + 1),
    ]);
  };

  // ! Achtung noch nicht fertig
  const changeAccount = () => {
    console.log("Change: " + reset);
  };

  //Löscht den Account endgültig
  const deleteAccount = () => {
    let request = authorizedRequest("DELETE", "/user/delete", authState);
    request.send();
    request.onreadystatechange = function () {
      if (request.readyState === 4) {
        if (request.status == 200) {
          logout();
        } else {
          window.alert("Error with call:" + request.responseText);
          console.log("Error with call:" + request.responseText);
        }
      }
    };
  };

  //Update Safe wenn sich entrys ändern
  useEffect(() => {
    encryptionModule.exportSafe(entrys).then((exportPayload) => {
      let request = authorizedRequest("POST", "/safe", authState);
      request.send(JSON.stringify(exportPayload));
      request.onreadystatechange = function () {
        if (request.readyState === 4) {
          if (request.status == 200) {
            console.log('Update Entry Safe');
          } else {
            window.alert("Error with call:" + request.responseText);
            console.log("Error with call:" + request.responseText);
          }
        }
      };
    });
  }, [entrys]);

  //holt den Safe von der api und fügt ihn den entrys hinzu
  useEffect(() => {
    async function importData() {
      const safe = await getSafe(authState);
      if (typeof safe !== "number") {
        setEntrys(safe);
      }
    }
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
                onClick={() => setSettings(false)}
                data-close
              >
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div className="margin-kante">
              <label>Change account details:</label>
            </div>
            <div className="Account-Changer">
              <div>
                <select className="Select-Data">
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
        {entrys.map((x, i) => {
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
                  onClick={() => copyStringToClipboard(x.passwordSafe)}
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
