import { useState } from "react";
import {
  useDispatch,
} from "react-redux";
import { inviteWorkspaceMember } from "../features/workspace/workspaceSlice";

function InviteMember({
  workSpaceId,
}) {

  const dispatch =
    useDispatch();

  const [email,
    setEmail] =
    useState("");

  const handleSubmit = (
    e
  ) => {

    e.preventDefault();

    dispatch(
      inviteWorkspaceMember({
        workSpaceId,
        email,
      })
    );

    setEmail("");
  };

  return (
    <>
    <form
      onSubmit={
        handleSubmit
      }
    >
      <input
        type="email"
        placeholder="Enter email"
        value={email}
        onChange={(e) =>
          setEmail(
            e.target.value
          )
        }
      />

      <button
        type="submit"
      >
        Invite
      </button>
    </form>
    </>
    
  );
}

export default InviteMember;