import { useNavigate } from "react-router-dom";

import React from 'react'

function ProjectCard({project}) {

  const navigate = useNavigate();

  return (
    <>
      <div
      onClick={() =>
        navigate(
          `/projects/${project._id}`
        )
      }
      style={{
        border: "1px solid #ddd",
        padding: "15px",
        borderRadius: "10px",
        cursor: "pointer",
      }}
    >
      <h3>
        {project.name}
      </h3>

      <p>
        {project.description}
      </p>
    </div>
    </>
  )
}

export default ProjectCard
