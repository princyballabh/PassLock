import React, { useEffect } from "react";
import { useRef, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import { v4 as uuidv4 } from 'uuid';


export default function Manager() {
  const ref = useRef();
  const passwordref = useRef();
  const [form, setform] = useState({ site: "", username: "", password: "" });
  const [passwordArray, setpasswordArray] = useState([]);

  const getpasswords = async () => {
    let req = await fetch("http://localhost:3000/");
    let passwords = await req.json();
    console.log("Fetched Passwords:", passwords);
    setpasswordArray(passwords);
    console.log("Updated Password Array:", passwordArray); // Debugging
  };


  useEffect(() => {
    getpasswords();
  }, []);

  const copyText = (text) => {
    toast("Copied to Clipboard!", {
      position: "top-right",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "dark",
    });
    navigator.clipboard.writeText(text);
  };

  const savepassword = async () => {
    if (form.id) {
      // Editing an existing password
      const updatedPasswordArray = passwordArray.map((item) =>
        item.id === form.id ? form : item
      );
      setpasswordArray(updatedPasswordArray);
  
      // Send the updated password to the backend, excluding _id
      const { _id, ...formWithoutId } = form;
      await fetch("http://localhost:3000/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formWithoutId),
      });
    } else {
      // Creating a new password
      const newPassword = { ...form, id: uuidv4() };
      setpasswordArray([...passwordArray, newPassword]);
  
      // Send the new password to the backend
      await fetch("http://localhost:3000/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPassword),
      });
    }
  
    // Show a success toast notification
    toast.success("Password Saved!", {
      position: "top-right",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "dark",
    });
  
    // Clear the form fields after saving
    setform({ site: "", username: "", password: "" });
  };
  const handlechange = (e) => {
    setform({ ...form, [e.target.name]: e.target.value });
  };

  const deletepassword = async(id) => {
    let c=confirm("Are you sure you want to delete this password?");
    if(c){
    setpasswordArray(passwordArray.filter(item=>item.id!==id));
     await fetch("http://localhost:3000/", {method: "DELETE", headers: {"Content-Type": "application/json"}, body: JSON.stringify({id})
    });
    toast.error("Password Deleted!", {
      position: "top-right",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "dark",
    });
    }
  };

  const editpassword = (id) => {
    const passwordToEdit = passwordArray.find((item) => item.id === id);
    setform(passwordToEdit); // Set the form with the selected password's data
  };


  const showpassword = () => {
    passwordref.current.type = "text";
    console.log(ref.current.src);
    if (ref.current.src.includes("src/assets/hidden.png")) {
      ref.current.src = "src/assets/eye.png";
      passwordref.current.type = "password";
    } else {
      ref.current.src = "src/assets/hidden.png";
      passwordref.current.type = "text";
    }
  };

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <div className="px-2 md:mycontainer text-white">
        <h1 className="text-4xl font-bold text-center">
          <span className="text-blue-200">&lt;</span>
          Pass
          <span className="text-blue-200">/Lock&gt;</span>
        </h1>
        <p className="text-center text-blue-100 text-lg">
          Your own Password Manager
        </p>
        <div className="text-black flex flex-col p-4  items-center">
          <input
            value={form.site}
            onChange={handlechange}
            placeholder="Enter the website URL"
            className="w-full rounded-full px-5 py-1 border-2 border-blue-400"
            type="text"
            name="site"
            id="site"
          />
          <div className="flex md:flex-row flex-col w-full justify-between mt-6 gap-8">
            <input
              value={form.username}
              onChange={handlechange}
              placeholder="Enter username"
              className="border-blue-400 border px-4 w-full rounded-xl"
              type="text"
              name="username"
              id="username"
            />
            <div className="relative">
              <input
                ref={passwordref}
                value={form.password}
                onChange={handlechange}
                placeholder="Enter password"
                className="border-blue-400 border px-4 w-full rounded-xl"
                type="password"
                name="password"
                id="password"
              />
              <span
                className="absolute -top-1 right-0 bottom-4 cursor-pointer"
                onClick={showpassword}
              >
                <img
                  ref={ref}
                  className="p-2 "
                  width={35}
                  src="src/assets/eye.png"
                  alt=""
                />
              </span>
            </div>
          </div>
          <button
            onClick={savepassword}
            className="flex justify-center items-center px-4 py-2 w-fit mt-6 bg-blue-300 hover:bg-blue-200 rounded-3xl"
          >
            <lord-icon
              src="https://cdn.lordicon.com/jgnvfzqg.json"
              trigger="hover"
              stroke="bold"
              colors="primary:#121331,secondary:#000000"
            ></lord-icon>
            Save
          </button>
        </div>
        <div className="passwords text-white">
          <h1 className="text-2xl mb-5">Your Passwords</h1>
          {passwordArray.length === 0 && <div>No Passwords To Show</div>}
          {passwordArray.length != 0 && (
            <table className="table-auto w-full rounded-md overflow-hidden">
              <thead>
                <tr>
                  <th className="bg-blue-900 py-1">Site</th>
                  <th className="bg-blue-900 py-1">Username</th>
                  <th className="bg-blue-900 py-1">Password</th>
                  <th className="bg-blue-900 py-1">Actions</th>
                </tr>
              </thead>
              <tbody>
                {passwordArray.map((item, index) => {
                  return (
                    <tr key={index}>
                      <td className="py-1 text-center bg-blue-200 text-black w-32">
                        <a href={item.site} target="_blank">
                          {item.site}
                        </a>
                        <lord-icon
                          onClick={() => copyText(item.site)}
                          className={
                            "lordiconcopy cursor-pointer w-5 px-1 py-2.5"
                          }
                          src="https://cdn.lordicon.com/xljvqlng.json"
                          trigger="hover"
                          colors="primary:#000000"
                        ></lord-icon>
                      </td>
                      <td className="text-center bg-blue-200 text-black w-32">
                        {item.username}
                        <lord-icon
                          onClick={() => copyText(item.username)}
                          className={
                            "lordiconcopy cursor-pointer w-5 px-1 py-2.5"
                          }
                          src="https://cdn.lordicon.com/xljvqlng.json"
                          trigger="hover"
                          colors="primary:#000000"
                        ></lord-icon>
                      </td>
                      <td className="text-center bg-blue-200 text-black w-32">
                        {"*".repeat(item.password.length)}
                        <lord-icon
                          onClick={() => copyText(item.password)}
                          className={
                            "lordiconcopy cursor-pointer w-5 px-1 py-2.5"
                          }
                          src="https://cdn.lordicon.com/xljvqlng.json"
                          trigger="hover"
                          colors="primary:#000000"
                        ></lord-icon>
                      </td>
                      <td className="text-center bg-blue-200 text-black w-32">
                        <span onClick={()=> deletepassword(item.id)}>
                          <lord-icon
                          className={"w-5 mx-1 py-2.5 cursor-pointer"}
                            src="https://cdn.lordicon.com/skkahier.json"
                            trigger="hover"
                            colors="primary:#000000"
                          ></lord-icon>
                        </span>
                        <span onClick={()=> editpassword(item.id)}>
                          <lord-icon
                          className={"w-5 mx-1 py-2.5 cursor-pointer"}
                            src="https://cdn.lordicon.com/ogkflacg.json"
                            trigger="hover"
                            colors="primary:#000000"
                          ></lord-icon>
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}
