import { useState } from "react";
import { useDispatch } from "react-redux";
import { createNewProject } from "../features/project/projectSlice";

import React from 'react'

function CreateProject({workSpaceId}) {

  const dispatch = useDispatch();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  
  const handleSubmit = (e) => {
    e.preventDefault();

//     console.log({
//   name,
//   description,
//   workSpaceId,
// });

    dispatch(createNewProject({
        name, description, workSpaceId: workSpaceId,
    }));
    setName("");
    setDescription("");
  }

  return (
    <>
      <form
      onSubmit={
        handleSubmit
      }
    >
      <input
        value={name}
        placeholder="Project Name"
        onChange={(e) =>
          setName(
            e.target.value
          )
        }
      />

      <input
        value={description}
        placeholder="Description"
        onChange={(e) =>
          setDescription(
            e.target.value
          )
        }
      />

      <button
        type="submit"
      >
        Create Project
      </button>
    </form>
    </>
  )
}

export default CreateProject
