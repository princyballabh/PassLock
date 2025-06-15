import React, { useEffect, useRef, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import { v4 as uuidv4 } from "uuid";

export default function Manager({ auth }) {
  const ref = useRef();
  const passwordref = useRef();
  const [form, setform] = useState({ site: "", username: "", password: "" });
  const [passwordArray, setpasswordArray] = useState([]);

  // Get JWT token from localStorage
  const token = localStorage.getItem("token");
  // Get backend API URL from environment variable
  const API_URL = process.env.REACT_APP_API_URL;

  // Fetch passwords for the logged-in user
  const getpasswords = async () => {
    if (!token) return;
    let req = await fetch(`${API_URL}/api/passwords`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    if (req.status === 401 || req.status === 403) {
      setpasswordArray([]);
      return;
    }
    let passwords = await req.json();
    setpasswordArray(Array.isArray(passwords) ? passwords : []);
  };

  useEffect(() => {
    getpasswords();
    // Refetch when auth changes (on login/logout)
    // eslint-disable-next-line
  }, [auth]);

  const copyText = (text) => {
    toast("Copied to Clipboard!", {
      position: "top-right",
      autoClose: 2000,
      theme: "dark",
    });
    navigator.clipboard.writeText(text);
  };

  const savepassword = async () => {
    if (!token) return;
    let url = `${API_URL}/api/passwords`;
    let method = "POST";
    let body = form.id ? { ...form } : { ...form, id: uuidv4() };

    await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    toast.success("Password Saved!", {
      position: "top-right",
      autoClose: 2000,
      theme: "dark",
    });
    setform({ site: "", username: "", password: "" });
    getpasswords();
  };

  const handlechange = (e) => {
    setform({ ...form, [e.target.name]: e.target.value });
  };

  const deletepassword = async (id) => {
    if (!token) return;
    let c = window.confirm("Are you sure you want to delete this password?");
    if (c) {
      await fetch(`${API_URL}/api/passwords/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      toast.error("Password Deleted!", {
        position: "top-right",
        autoClose: 2000,
        theme: "dark",
      });
      getpasswords();
    }
  };

  const editpassword = (id) => {
    const passwordToEdit = passwordArray.find((item) => item.id === id);
    setform(passwordToEdit);
  };

  const showpassword = () => {
    passwordref.current.type =
      passwordref.current.type === "password" ? "text" : "password";
    ref.current.src = ref.current.src.includes("hidden.png")
      ? "src/assets/eye.png"
      : "src/assets/hidden.png";
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
          {passwordArray.length !== 0 && (
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
                        <a
                          href={item.site}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
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
                        <span onClick={() => deletepassword(item.id)}>
                          <lord-icon
                            className={"w-5 mx-1 py-2.5 cursor-pointer"}
                            src="https://cdn.lordicon.com/skkahier.json"
                            trigger="hover"
                            colors="primary:#000000"
                          ></lord-icon>
                        </span>
                        <span onClick={() => editpassword(item.id)}>
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
