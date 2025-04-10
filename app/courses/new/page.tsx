import NewCourse from '@/components/new-course'
import React, { Suspense } from 'react'

function Page() {
  return (
	<Suspense fallback={<div className='absolute top-1/2 left-1/2'>Loading...</div>}>
		<NewCourse />
	</Suspense>
  )
}

export default Page