import React from 'react';

function ActivityFeed({activities}) {
  return (
    <>
       <div>
      <h2>
        Recent Activity
      </h2>

      {activities?.map(
        (activity) => (
          <div
            key={
              activity._id
            }
          >
            <p>
              {
                activity.message
              }
            </p>
          </div>
        )
      )}
    </div>
    </>
  )
}

export default ActivityFeed
