import React from 'react'

function MembersSection({members}) {
  return (
    <>
      <div style={{
        background: "white",
        padding: "20px",
        borderRadius: "12px",
      }}>
         <h2>Members</h2>

      {members?.map((member) => (
        <div key={member._id}>
          <p>{member.name}</p>
          <p>{member.description}</p>
        </div>
      ))}
      </div>
    </>
  )
}

export default MembersSection
