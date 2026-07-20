import React from 'react'
import ProjectCard from './ProjectCard'

function ProjectsSection({projects}) {
  return (
    <>
      <div>
      <h2>
        Projects
      </h2>

      <div
        style={{
          display: "grid",
          gap: "15px",
        }}
      >
        {projects?.map(
          (project) => (
            <ProjectCard
              key={project._id}
              project={project}
            />
          )
        )}
      </div>
    </div>
    </>
  )
}

export default ProjectsSection
