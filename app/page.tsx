import Image from "next/image";
import { db } from "@/lib/db";
import UserButton from "@/modules/auth/components/user-button";

export default async function Home() {
  return ( 
    <div className=" flex flex-col justify-center items-center h-screen">
      <UserButton />
    </div>
  );
}
  