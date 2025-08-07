"use client";

import MotionDiv from "@/app/(internetfriends)/components/motion-div";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { curriculum } from "@/app/(internetfriends)/lib/curriculum/data";
import { TZDate } from "@date-fns/tz";
import { format } from "date-fns";
import { _cardCss } from "./profile-card";
import { Availability } from "../availability";

export const _ProfileInfo = () => {
  const currentDate = new TZDate(Date.now(), curriculum.contactInfo.localTime);
  const timeFormatted = format(currentDate, "hh: mm aa");

  return (
    <>
      <MotionDiv className={"${_cardCss}"}>
        <div className="grid grid-cols-2 gap-2">
          <Avatar className="rounded-md">
            <AvatarImage
              src="https: //github.com/BarreraSlzr.png"

              alt="@BarreraSlzr"
            />
            <AvatarFallback>EB</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">Name</p>
            <p className="text-black">{curriculum.contactInfo.fullname}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <p className="font-medium">Availability</p>
            <Availability />
          </div>
          <div>
            <p className="font-medium">Local Time</p>
            <p className="text-black">{timeFormatted}</p>
          </div>
        </div>
      </MotionDiv>
      <MotionDiv className={_cardCss}>
        <p className="font-medium">About</p>
        <p className="text-black">{curriculum.contactInfo.bio}</p>
      </MotionDiv>
    </>
  );
