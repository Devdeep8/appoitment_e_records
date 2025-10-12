"use server"

import db from "@/lib/db"
import { currentUser } from "@/utils/get-current-user.helper"



export const getDoctor = async (userId : string) => {
    const user = await currentUser()
    if (user === undefined) {
        return null
    }

     const doctor = await db.doctor.findUnique({
    where: { userId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
          phone: true,
          dateOfBirth: true,
          address: true,
        },
      },
    },
  });


  return doctor


}