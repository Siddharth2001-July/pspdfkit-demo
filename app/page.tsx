"use client";
import PSPDFKit from "pspdfkit";
import { User } from "../utils/types";
import { SignDemo } from "./signingDemo";
import { useEffect, useState } from "react";


const App: React.FC = () => {
  const allUsers: User[] = [
    {
      id: 1,
      name: "Master",
      email: "master@email.com",
      color: PSPDFKit.Color.BLUE,
      role: "Editor",
    },
    {
      id: 2,
      name: "Signer",
      email: "master@email.com",
      color: PSPDFKit.Color.YELLOW,
      role: "Signer",
    },
  ];
  const [currUser, setCurrUser] = useState(allUsers[0]);
  useEffect(() => {
    setTimeout(() => {
      console.log("Setting current user to Signer");  
      setCurrUser(allUsers[1]);
    }, 5*1000);
  }, []) // Add an empty dependency array to ensure the effect runs only once

  return <SignDemo allUsers={allUsers} user={currUser} />;
};
export default App;
