import React from "react";
import { useParams, useEffect } from "react";
import { RoomList } from "@/features/chat/RoomList";

export const Chat = () => {
  return (
    <div>
      <RoomList></RoomList>
    </div>
  );
};